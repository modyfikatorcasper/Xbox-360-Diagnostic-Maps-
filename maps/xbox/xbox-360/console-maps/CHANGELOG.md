# Changelog

## 2026-10-10 — Jasper V1 provisional location access (local only)

All 1908 Jasper records without photo review now open a zoomed PCB view with a dashed, zoom-scaled square and center dot over their approximate vicinity. Each label shows the designator and a schematic-derived value or `UNKNOWN`. Photo review also identified the fitted Ethernet PHY as U1B2 (ICS1893BF), not alternative U1B1 (BCM5241); the former joins 38 previously reviewed populated sites, while the latter joins four visibly empty footprints without populated-part markers. PL/EN caution text distinguishes a provisional vicinity from a confirmed component or probe point. The search still covers all 1952 records. No publication was performed.

## 2026-10-10 — Jasper V1 source and photo review (local only)

Joined all 1952 Jasper BRD placements to the supplied 76-page schematic index, exposed 15 circuit-group filters and 1145 unit-bearing passive values, and corrected the V_3P3 route to U1F1/FT1U1. A new photo inspection confirms J9A1, U1F1, U5B2 and five major rail inductors on TOP, plus U2T1/FT2R8 on BOTTOM; R2T7/R2T8 and U5C1 are visibly unpopulated, matching schematic EMPTY. U6T2 is marked EMPTY in the schematic but physically populated on the BOTTOM photograph, so its card warns of a variant conflict. V_1P8 opens the reviewed FT2R8 photo focus. The reviewed allowlist is now 21 TOP and 21 BOTTOM references; all other positions remain UNVERIFIED. No publication.

## 2026-09-25 — External-audit candidate (local only)

Limited Jasper photo labels to 12 individually reviewed TOP locations and 16 reviewed BOTTOM ICs/test points. The remaining Jasper placement records stay searchable but show `UNVERIFIED`; opening one does not create a precise PCB marker. Added explicit four-photo attribution and both conflicting licence notices to `SOURCES.md` and the in-app Sources dialog, plus README attribution. Updated stale Jasper intake/workflow notes and prepared an audit report and review-only ZIP. All 12 automated suites and selected PL/EN browser routes pass. Full small-component/revision verification, `FT2R8`, and the photo licence discrepancy remain open; no public release.

## 2026-09-25 — Plain-language PCB guidance (local only)

Removed calibration metrics, BRD-import wording and raw-placement phrasing from the main board UI. The photo still warns that markers are approximate, not exact probe points, and that PCB silkscreen/side must be checked before measuring. Calibration figures, source provenance and limitations remain in project documentation; licence attribution stays in the legal dialog. No publication.

## 2026-09-25 — Jasper boot-stage point routing (local only)

Multi-rail Power / Boot stages 02, 05 and 06 now offer separate photo targets for each reviewed Jasper rail. The primary stage button opens the first measurement in order; point buttons open the corresponding TOP or BOTTOM close-up, including the dedicated FT1U1 focus for 3.3 V. The UI preserves the stage condition and shows the selected rail, point and expected value in PL/EN. All destinations were checked against the BRD placement and reviewed photo allowlist. No publication.

## 2026-09-25 — Jasper 3.3 V point review (local only)

Verified the `FT1U1` silkscreen and nearby point on the underside photograph. The Jasper `V_3P3` measurement card now opens a dedicated annotated photo focus at `FT1U1`, keeping the three existing main-VRM closeups readable. `FT2R8` remains unmarked because its exact photo point is not sufficiently clear. No publication.

## 2026-09-25 — Jasper V1 BOTTOM review overlay (local only)

Enabled a separate underside view for six Jasper areas using the independent eight-landmark registration. The overlay is limited to eight visually checked ICs and seven `FT` points; TOP-only sections switch to TOP, and no TOP-side component is presented as visible underneath. Error codes 0031–0033 and standby rail cards can open the corresponding BOTTOM point; CPUCORE code 0002 still opens populated TOP inductors. Component cards now focus a single verified IC directly. PL/EN and 390 px label checks pass. Attribution for the underside photograph appears in legal information. The CC BY / CC BY-SA conflict still blocks publication.

## 2026-09-25 — Jasper V1 BOTTOM photo intake (local only)

Staged the matching underside photograph and fitted a separate BOTTOM-to-BRD affine transform from eight visible IC centers (RMS 6.9 px; max 13.3 px). Added source/hash and residual regression checks. The Jasper BOTTOM control remains disabled until small measurement points and side-specific closeups are audited; no potentially misleading underside markers were exposed. The file-page CC BY / embedded CC BY-SA conflict remains unresolved. No publication.

## 2026-09-25 — Jasper TOP photo and measurement focus audit

Visual review of the CPU VRM photo found that `L8D1` is an unpopulated footprint in the image used by the app, although its position exists in the BRD. All current Jasper CPUCORE measurements, service steps, boot flow and photo labels now use populated `L8E1 / L8F1`; searching `L8D1` explicitly identifies the empty footprint. Multi-point PCB navigation can specify a primary `focusRef`, highlight it on the photograph and explain in PL/EN that the marker is not a probe or pin location. The photo's embedded CC BY-SA 4.0 watermark conflicts with the ConsoleMods file-page CC BY 4.0 label; both facts are disclosed in legal information and publication remains on hold pending clarification. Local tests and browser QA completed; no publication.

## 2026-09-25 — Jasper V1 placement extraction and TOP photo overlay

Added a narrowly scoped, SHA-256-guarded Allegro 15 placement reader for the supplied Jasper V1 BRD. It yielded 1952 unique positions (799 TOP, 1153 BOTTOM). Registered the TOP photograph against eight visible IC package centers and connected the 799 TOP records to the existing component search and Board Map; values absent from placement data remain `UNKNOWN`.

All nine Jasper areas now use BRD-derived TOP locations for overview markers and close-up labels. Removed misleading TOP-photo markers for bottom-side controllers and test points. A BOTTOM-only IC card leads to its related TOP output area with an explicit unavailable-photo notice. The 5 V and memory outputs are separated into their actual photo areas. Browser checks covered Jasper CPU, main VRM and memory; automated parser, routing, crop, audit and existing Trinity tests pass. Fine-grained photo/revision review remains open. No publication was performed.

## 2026-09-19 — Board view state and component focus

Fixed a component-selection state loss on the PL/EN switch. A selected Trinity component now stays in focus with its TOP/BOTTOM side, photo zoom and pan, while the region panel explicitly switches to a component context with no stale section selected. Selecting a section from that panel returns to its close-ups. Switching directly from a BOTTOM component to a TOP profile refreshes the overview markers and hides an unrelated rail trace. The full-board photo also survives language changes with its zoom and pan.

Browser checks covered BOTTOM U7T1 across PL/EN, BOTTOM-to-TOP U5A1, return to the RAM section, and the full-board view across PL/EN. The UI contract regression now checks component/full-board restoration and bilingual focused-panel state. No publication was performed.

## 2026-09-19 — Trinity multi-component Board Map anchors

Aligned the Main VRM overview marker and logical rail route with the initial CPUCORE close-up at U7C1 rather than the distant 5 V controller U1E1. The RAM marker now anchors to U6F1, and its two TOP close-ups identify U5F1, U6F1, U7D1 and U7E1 separately; the earlier range mixed TOP and BOTTOM components. Standby labels distinguish U5A1 and U5B1 on the photograph. A combined IC card opens the shared region and context without silently claiming the first component's individual service profile.

The photo-close-up regression checks these anchors, their route/marker consistency, separately named standby regulators and TOP-side RAM devices in addition to 40 Jasper/Trinity TOP/BOTTOM views. Changes remain local and unpublished.

## 2026-09-19 — Measurement-to-close-up routing

Board navigation now chooses a close-up by matching the designators in the selected measurement or IC card to labels on that region's photograph. This corrects, among others, Trinity `V_5P0/V_3P3 → L2F1/L1F1`, `V_CPUEDRAM → L4F1`, Jasper `V_5P0 → L6F1`, and the Trinity main-rail boot stage. A PL/EN context note directs users through multiple close-ups when a step spans them; an unlabelled point is explicitly identified rather than implying that a nearby photo marker is the measurement point.

The new `tools/test-closeup-routing.mjs` checks 96 rail, error-step and boot-stage routes and the multi-view/unmarked-point safeguards. Real-browser checks confirmed the Jasper rail and IC-card routes, Trinity eDRAM rail and main-rail stage, and both language versions of the warning. No Jasper photo calibration or publication was performed.

## 2026-09-19 — PCB caption collision and Trinity crop pass

Kept photo-coordinate dots fixed while automatically placing their bilingual captions around them, with short connector lines. All Jasper close-ups now have non-overlapping captions contained in the initial viewport at desktop and 390 px mobile widths. Recentered Trinity close-ups on calibrated component locations, split the widely separated XCGPU eDRAM and memory points into separate views (three views total), and recentered the BOTTOM projection independently. Added an explicit PL/EN warning that top-side parts are only projected onto the bottom photograph, not necessarily visible there.

Browser QA covered Jasper and Trinity TOP/BOTTOM in PL/EN at 390 px, including the standby and PSU close-ups. A new regression test checks that all 38 coordinate-dot views fit a phone viewport. All nine automated tests, JavaScript syntax and diff whitespace checks pass. Jasper point positions remain approximate; no new source accuracy or publication is claimed.

## 2026-09-19 — Jasper Board Map close-up audit

Fixed an overlapping HANA/standby overview marker and added an accessible PL/EN section selector beside the board map. Split the formerly off-screen GPUCORE, RF-panel and PSU-enable labels into logical close-ups (maximum three per area); separated CPU, CPUCORE and CPUVCS on narrow screens. Direct rail and error navigation now opens the matching Jasper close-up, including `V_CPUCORE`, `V_CPUVCS`, `V_GPUCORE` and code `0031`; the active close-up survives a language switch.

Checked every Jasper close-up in the local browser at desktop width and 390 px mobile width: all labels fit their initial viewport. HANA selection, PL/EN state, `0031 → Main VRM / 5 V`, and `V_CPUCORE → CPUCORE` were verified. All eight automated tests pass. Positions are still approximate; no BRD/photo calibration or publication was performed.

## 2026-09-19 — Jasper placement intake gate

Audited the supplied binary Jasper V1 board file and the locally installed Allegro Free Physical Viewer 16.0. The viewer is not a trustworthy bulk coordinate-export path, so no guessed photo calibration or component positions were added. Introduced `tools/validate-jasper-placement.mjs` to validate a future CSV/TSV component placement report with explicit units and Jasper V1 source identity; added negative-case tests and `docs/JASPER_PLACEMENT_INTAKE.md` with the exact export fields and visual verification gate. All eight local tests pass. No publication was performed.

## 2026-09-19 — Jasper/FAT first separate audit

Corrected Jasper CPU/GPU, Southbridge, HANA, NAND and regulator identities against the supplied schematic; added 9 board regions, 11 rail cards, 5 revision-specific error-service profiles, 10 boot stages and four symptom paths. Jasper PSU checks now point to J9A1/FT8N1/FT9N1, and legal attribution for the Jasper photograph follows the source page credit (`jft`).

The new `tools/test-jasper-audit.mjs` and the full existing suite pass. Local browser checks covered the Jasper TOP map, disabled BOTTOM, 0002 CPUCORE path, boot stage 06, Polish/English labels, the localized CPU_SRVID-dependent value and no console errors. The board now states clearly that Jasper labels indicate approximate areas. Jasper still lacks extracted BRD coordinates, calibrated photo markers and a searchable component database; these are explicit follow-up work. No publication was performed.

## 2026-09-19 — Trinity full regression gate

Added:

- a dependency-free navigation-matrix test covering 8 PCB regions, 10 rails, 15 SMC codes, 10 boot stages, 4 PSU states, 21 symptom checks, component profiles, return targets and required board assets;
- explicit integrity checks for region/view limits, overlay coordinates, rail routes, measurement fields and cross-module destinations.

Verified locally in the real interface: all 15 curated SMC codes; representative standby, power-on and run rails; sequence stages 01/06/08/10; all four symptom entries and PSU states; component/error filters; TOP/BOTTOM images; `3333 → UNKNOWN`; invalid-code rejection; keyboard Ring of Light interaction; and Polish/English switching. The full automated suite passed and the browser console remained free of warnings and errors. Phase 3 for Trinity/Slim is complete. No publication was performed.

## 2026-09-19 — Bilingual accessibility and UI contract

Added:

- complete Polish/English handling for dynamic PCB close-ups, IC descriptions, operating-state labels, document title/description and accessibility labels;
- explicit labels for component/error search, selection semantics for models, sides, regions, views, symptoms and rail-state tabs;
- keyboard pan/zoom for the PCB viewport, global visible focus and reduced-motion support;
- a more legible typography scale and mobile overflow protection;
- deterministic board-revision state reset while intentionally preserving the entered secondary code;
- a dependency-free UI contract test covering translation parity, IDs, navigation targets, form labels, assets, focus and keyboard controls.

Verified locally in Polish and English, at 390 × 844 and the normal desktop viewport. Browser checks covered dynamic close-up labels, keyboard pan/zoom, Trinity → Jasper state reset and zero console warnings/errors. All existing data tests passed. No publication was performed.

## 2026-09-19 — Trinity component service profiles

Added:

- 10 curated service profiles for the Trinity power input, standby regulators, PSB/SMC, NAND, HANA, main regulators, CPUCORE measurement point and XCGPU;
- bilingual roles, symptoms, functional flows, related rails/components, signal or pin tables and ordered measurement checks;
- direct profile navigation to the exact PCB component, primary rail and Power / Boot section;
- a safe basic-CAD fallback for the remaining component database instead of invented service data;
- explicit `UNKNOWN` handling for unverified thresholds, dynamic signals and full BGA pinouts;
- a dependency-free component-profile integrity test.

Verified locally in Polish and English for `U1E2 → pins 18/19 → 3.315 V → PCB` and `U7C1 → V_CPUCORE → L6C2 → 0.9–1.2 V`, including state preservation across language changes and no horizontal overflow at a 799 px viewport. No publication was performed.

## 2026-09-19 — Trinity guided Power / Boot paths

Added:

- four expanded symptom paths: completely dead (6 checks), pulsing LED (6), powers on then off (6), and red error light (3);
- explicit measurement conditions, source nodes, loads, expected results and stop actions for every check;
- a 10-stage Trinity power/boot sequence with verified voltage points and direct PCB navigation;
- explicit `UNKNOWN` handling for clock, reset, NAND and control-signal levels that lack a verified static threshold;
- a dedicated sequence-detail panel and a clear distinction between electrical checks and the final Dashboard outcome;
- a dependency-free Power/Boot data integrity test.

Verified locally in Polish and English, including symptom `NO → L6A1 pin 1`, sequence stage `08 → NAND → U1E2`, preserved step state across language changes, no horizontal overflow and no browser-console errors. No publication was performed.

## 2026-09-19 — Trinity curated SMC error-code service profiles

Added:

- a curated 15-code Trinity SMC set (`0001–0003`, `0010–0013`, `0020–0023`, `0030–0033`);
- bilingual confidence, evidence wording, possible causes, related rails/signals and key components;
- two or three ordered service checks per code with conditions, expected results and direct PCB navigation;
- explicit `UNKNOWN` values wherever a threshold, signal level, frequency or resistance limit is not verified;
- a dependency-free database integrity test and responsive layouts for the expanded result card.

Verified locally for `0002 → Main VRM → L6C2 → V_CPUCORE 0.9–1.2 V`, the new `0030` entry, Polish/English rendering and unknown-code fallback. Extended XSS/UEM codes are not claimed by this package. No publication was performed.

## 2026-09-19 — Trinity TOP/BOTTOM landmark calibration

Added:

- separate affine transforms for the Trinity top and bottom photographs, fitted to eight visible mounting landmarks per side;
- image-aspect correction so PCB overlays share the exact coordinate space of each photograph;
- a bilingual in-app calibration badge, measured fit error and an explicit accuracy limitation;
- an explicit explanation for the single top-side `R1` source outlier;
- a dependency-free regression test for landmark error and component containment.

Verified locally: TOP RMS 2.38 px / MAX 3.05 px with 955 of 956 components in-frame; BOTTOM RMS 4.28 px / MAX 7.88 px with 1002 of 1002 components in-frame. Polish/English copy, TOP/BOTTOM switching, full-board mode and a focused BOTTOM component marker were also checked in the browser. No publication was performed.

## 2026-09-19 — Trinity rail diagnostic routes

Added:

- a numbered SVG overlay that links the logical PCB areas involved in each Trinity rail;
- explicit wording that the overlay is a diagnostic order, not a copper-trace map;
- bilingual source → measurement point → load cards for every Trinity standby, power-on and run rail;
- measurement conditions, expected values and rail-specific next checks;
- persistent rail selection across PCB navigation and PL/EN language changes.

Verified locally for V_5P0STBY, V_3P3STBY and V_CPUCORE, including rail-to-PCB context, return navigation and Polish/English content. No publication was performed.

## 2026-09-19 — Four-state power-supply light guide

Added:

- original neutral power-supply illustrations for ORANGE, GREEN, RED and NO LIGHT;
- bilingual meanings and first actions for every light state;
- revision-aware PCB points for 5 V standby, 12 V run-state and power-off short checks;
- safety wording that never recommends opening the power supply and leaves unverified resistance thresholds as `UNKNOWN`;
- direct PSU-state → PCB → PSU-state navigation.

Verified locally in PL/EN, including RED → Trinity J7A1/V_12P0 with power disconnected. No publication was performed.

## 2026-09-19 — Persistent secondary-code wizard

Added:

- a focused four-step Ring of Light reading wizard with explicit progress, previous/next navigation and the correct `4 lit segments = digit 0` mapping;
- persistent reading and diagnosis state across Polish/English language changes;
- a bilingual `SYNC + EJECT` reading instruction;
- synchronization between manual code entry and the four reading steps;
- a return-to-source action in PCB diagnostic context panels.

Verified locally: JavaScript syntax, `0001` through the wizard, state preservation across EN→PL, `3333 → UNKNOWN`, error-to-PCB navigation and PCB-to-decoder return. No publication was performed.

## 2026-09-19 — Trinity audit and shared PCB context

Added:

- `MASTER_WORKFLOW.md` with the complete project map, evidence boundaries, Slim priorities and gated Jasper roadmap;
- a single bilingual diagnostic-context panel shared by error codes, rails, symptom measurements, boot stages, IC cards and component search;
- direct navigation from the error database and measurement cards to the relevant PCB view;
- separate `Fit board` and `Reset close-up` controls;
- keyboard-semantic buttons for rails, error rows and IC cards.

Verified locally: JavaScript syntax, rail-to-PCB context, error-to-PCB context, full-board fit and PL/EN context refresh. No publication was performed.

## 2026-09-19 — Ring of Light pattern recognizer

Added:

- an original four-arc Ring of Light UI with the horizontal G1–G4 layout;
- mouse and keyboard toggling with a live selected-pattern panel;
- bilingual pattern details, counts, causes and recommendations;
- one-, two-, three- and four-segment example presets;
- a standalone pattern data module that returns `UNKNOWN` for unmapped combinations;
- responsive service-dashboard styling without console body or brand artwork.

## 2026-09-19 — Trinity foundation

Added:

- revision-safe multi-console repository structure;
- verified Trinity Rev 1.01 / Fab G identity;
- boardview ingestion summary for 1,958 components, 1,121 nets and 569 test-pin records;
- interactive secondary error-code reader and initial 12-code Trinity-aware database;
- boardview-derived functional map with top/bottom filtering;
- standby, power-on and full-run rail maps;
- 10 IC cards and a first-pass diagnostic flow;
- source/evidence labels and explicit `IN PROGRESS` queue.

## 2026-09-19 — Trinity source cross-check and review UI

Added:

- complete 1,958-component Trinity database with 956 top-side and 1,002 bottom-side records;
- exact GENCAD ↔ Allegro cross-check for designators, sides and coordinates;
- 1,380 source-recorded values and explicit unknown status for 578 missing values;
- Trinity top/bottom photograph switch with a shared marker/zoom transform;
- searchable component explorer that focuses the selected element on the photograph;
- disabled, source-gated catalog entries for Corona and Winchester;
- neutral source/legal copy and final project credits.

Decision: no separate “Trinity 2” public revision was created because the supplied layout datasets are identical at component-placement level and the two schematic PDFs are text-identical.
