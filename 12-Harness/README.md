# 12 · The Agent Harness

An adversarial proving ground that generates failure conditions faster and more cruelly than a real clinic will, measures what survives, and produces a numbers document you can hand to a doctor.

| Document | What it covers |
|---|---|
| **[Harness-Architecture.md](Harness-Architecture.md)** | The three engines, why most of the founder's list is architecture rather than training, the diagnostic-drift CI gate, build order, and honest limitations |
| **[Failure-Injection-Catalogue.md](Failure-Injection-Catalogue.md)** | Every attack — 11 classes, ~90 individual probes — with implementation and pass conditions |
| **[Question-Knowledge-Graph.md](Question-Knowledge-Graph.md)** | How disease/symptom/counter-question knowledge is stored as *separations* rather than conclusions, and the shadow concordance loop |
| **[Harness-Metrics.md](Harness-Metrics.md)** | Gate metrics, thresholds, and which numbers may leave the building |
| **[Pitch-Dossier.md](Pitch-Dossier.md)** | The doctor-facing safety report and the live demo protocol |

## The three things to take from this folder

1. **You cannot train a system not to mix two patients.** You make it structurally impossible, then attack it 4,000 times concurrently and publish the result. Six of the eight items on the original list are architecture; the harness's job is proof, not training.
2. **The most valuable number is the fabrication rate on illegible input.** It is the direct answer to the only question a doctor actually has, and it is zero by design — because the system says "illegible" instead of guessing.
3. **The harness output is the pitch.** No competitor walks into an Indonesian clinic with a four-page test report that includes a page of limitations. That page is why the rest is believed.

## v2.2 Reconciliation

Harness language must not say `proof` when it means prototype evidence. Separate architecture tests, detector self-tests, system evaluation, and real-pilot evidence. The harness supports system hardening and pitch credibility; it does not establish clinical performance without governed pilot data.

