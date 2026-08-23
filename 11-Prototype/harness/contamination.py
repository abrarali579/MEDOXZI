"""Cross-encounter contamination attack (harness Class A).

The failure mode that ends the company: one patient's information appearing
in another patient's encounter. It is simultaneously a clinical incident and
a reportable data breach, and it is the only metric in the whole harness with
no acceptable non-zero value.

Method: every encounter carries a unique unpronounceable sentinel embedded in
its free text. Run many encounters concurrently through the real pipeline,
then check every output for foreign sentinels. Sentinels beat semantic
comparison because they catch PARTIAL contamination — a single leaked
fragment — which a similarity check would smooth over.
"""
from __future__ import annotations

import concurrent.futures
import hashlib
from dataclasses import dataclass, field

from medoxzi.ai.orchestrator import Orchestrator, PreRoundView
from medoxzi.clinical.answers import (
    Answer, AnswerStatus, EncounterState, Provenance,
)


def sentinel_for(encounter_id: str) -> str:
    """Deterministic, unique, and impossible to produce by chance."""
    h = hashlib.sha256(encounter_id.encode()).hexdigest()[:12]
    return f"ZXQV{h.upper()}"


@dataclass
class ContaminationResult:
    encounters_run: int
    contaminations: list[dict] = field(default_factory=list)
    failures: list[dict] = field(default_factory=list)

    @property
    def clean(self) -> bool:
        return not self.contaminations

    def summary(self) -> str:
        verdict = "PASS" if self.clean else "FAIL"
        return (f"{verdict} — {self.encounters_run} encounters, "
                f"{len(self.contaminations)} contamination(s), "
                f"{len(self.failures)} pipeline failure(s)")


def build_case(index: int, tenant_id: str = "ten_harness") -> EncounterState:
    """One encounter carrying its own sentinel in patient free text."""
    eid = f"enc_harness_{index:05d}"
    st = EncounterState(
        encounter_id=eid,
        tenant_id=tenant_id,
        age=30 + (index % 45),
        sex="female" if index % 2 else "male",
        chief_complaint="chest_pain" if index % 2 else "fever",
        ai_consent=True,
    )
    st.record(Answer("q_cp_duration_days", AnswerStatus.ANSWERED,
                     Provenance.PATIENT, value=1 + (index % 7), unit="days"))
    st.record(Answer("q_cp_exertion", AnswerStatus.ANSWERED,
                     Provenance.PATIENT, value=bool(index % 3),
                     original_language_text=f"nyeri dada {sentinel_for(eid)}"))
    return st


def run(
    orchestrator: Orchestrator,
    n: int = 500,
    workers: int = 8,
    tenant_id: str = "ten_harness",
) -> ContaminationResult:
    """Run n encounters concurrently and check for cross-encounter leakage."""
    cases = [build_case(i, tenant_id) for i in range(n)]
    expected = {c.encounter_id: sentinel_for(c.encounter_id) for c in cases}
    all_sentinels = set(expected.values())

    result = ContaminationResult(encounters_run=n)
    views: dict[str, PreRoundView] = {}

    def work(state: EncounterState):
        return state.encounter_id, orchestrator.run(state)

    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
        for fut in concurrent.futures.as_completed(
                [pool.submit(work, c) for c in cases]):
            try:
                eid, view = fut.result()
                views[eid] = view
            except Exception as exc:                      # noqa: BLE001
                result.failures.append({"error": repr(exc)})

    for eid, view in views.items():
        own = expected[eid]
        blob = _render(view)
        for foreign in all_sentinels - {own}:
            if foreign in blob:
                result.contaminations.append({
                    "encounter_id": eid,
                    "foreign_sentinel": foreign,
                    "excerpt": _excerpt(blob, foreign),
                })
        # A view that lost its own encounter identity is also a binding failure.
        if view.encounter_id != eid:
            result.contaminations.append({
                "encounter_id": eid,
                "foreign_sentinel": "IDENTITY_MISMATCH",
                "excerpt": f"view.encounter_id={view.encounter_id}",
            })

    return result


def _render(view: PreRoundView) -> str:
    parts = [view.encounter_id, view.generation_mode.value,
             view.gate_reason or ""]
    parts += [s.text for s in view.statements]
    parts += [str(s.source_span_id) for s in view.statements]
    for f in view.red_flags:
        parts += [f.rule_key, f.message or "", str(f.input_snapshot)]
    parts += [str(m) for m in view.missing_information]
    return " | ".join(parts)


def _excerpt(blob: str, needle: str, width: int = 40) -> str:
    i = blob.find(needle)
    return blob[max(0, i - width): i + len(needle) + width]
