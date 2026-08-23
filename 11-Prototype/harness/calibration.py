"""Confidence calibration measurement (harness Class I).

An overconfident system is more dangerous than an inaccurate one, because
overconfidence defeats the human check the entire safety model depends on.
A doctor who learns that 0.9 means "usually wrong" stops reading the number;
a doctor who learns that 0.4 means "usually right" stops confirming.

Both directions are defects. This measures both.
"""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class Bin:
    lo: float
    hi: float
    n: int = 0
    correct: int = 0

    @property
    def accuracy(self) -> float:
        return self.correct / self.n if self.n else 0.0

    @property
    def midpoint(self) -> float:
        return (self.lo + self.hi) / 2

    @property
    def gap(self) -> float:
        return abs(self.accuracy - self.midpoint) if self.n else 0.0


@dataclass
class CalibrationReport:
    bins: list[Bin] = field(default_factory=list)
    total: int = 0

    @property
    def ece(self) -> float:
        """Expected calibration error — weighted mean gap. Target <0.05."""
        if not self.total:
            return 0.0
        return sum(b.n * b.gap for b in self.bins) / self.total

    def band_accuracy(self, lo: float, hi: float) -> float | None:
        n = sum(b.n for b in self.bins if lo <= b.lo < hi)
        c = sum(b.correct for b in self.bins if lo <= b.lo < hi)
        return c / n if n else None

    def gates(self) -> dict[str, tuple[bool, str]]:
        """The three calibration gates from Harness-Metrics.md."""
        high = self.band_accuracy(0.9, 1.01)
        low = self.band_accuracy(0.0, 0.7)
        out = {
            "H16_ece_below_0.05": (
                self.ece < 0.05, f"ECE={self.ece:.4f}"),
            "H17_high_conf_accuracy_ge_0.95": (
                high is None or high >= 0.95,
                f"acc(>0.9)={high if high is None else round(high, 4)}"),
            # If low-confidence extractions are usually right, the confidence
            # score is not doing any work and the threshold is decorative.
            "H18_low_conf_accuracy_below_0.70": (
                low is None or low < 0.70,
                f"acc(<0.7)={low if low is None else round(low, 4)}"),
        }
        return out

    def reliability_table(self) -> str:
        rows = ["  conf band   n     accuracy   expected   gap",
                "  ---------- ----- ---------- ---------- ------"]
        for b in self.bins:
            if not b.n:
                continue
            rows.append(
                f"  {b.lo:.1f}-{b.hi:.1f}    {b.n:<5} {b.accuracy:<10.3f} "
                f"{b.midpoint:<10.2f} {b.gap:.3f}")
        return "\n".join(rows)


def measure(samples: list[tuple[float, bool]], n_bins: int = 10) -> CalibrationReport:
    """samples: (confidence, was_correct) pairs."""
    edges = [i / n_bins for i in range(n_bins + 1)]
    bins = [Bin(edges[i], edges[i + 1]) for i in range(n_bins)]
    report = CalibrationReport(bins=bins)

    for conf, correct in samples:
        conf = min(max(conf, 0.0), 1.0)
        idx = min(int(conf * n_bins), n_bins - 1)
        bins[idx].n += 1
        if correct:
            bins[idx].correct += 1
        report.total += 1

    return report
