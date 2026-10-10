# Jasper V1 BOTTOM photo intake — local review

Status: enabled in the **local review UI** with a deliberately narrow allowlist. Six BOTTOM areas have side-specific closeups. The reviewed BOTTOM set contains ten ICs, nine `FT` points and two visibly empty resistor footprints; new points outside an existing region closeup open an individual photo focus. TOP-only areas switch to TOP instead of projecting invisible parts onto the underside. This is a photograph of the PCB underside, not a schematic or pinout. Placement accuracy at the eight calibration IC centers does not establish the position or population of every other small component.

- Source: [ConsoleMods, Xbox 360 Jasper V1 Bottom](https://consolemods.org/wiki/File:Xbox_360_Jasper_V1_Bottom.png), photo credited to jft / retro.jnftech.net.
- Local asset: `dist/assets/pcb-jasper-bottom.png`, 2494 × 2048 pixels; SHA-256 `CA21EEB5DD6E68692BC8AAF7ADB0FF31033783A351AFF97D27E802D5B41B93C0`.
- Coordinate source: supplied `Xbox_360_Jasper.brd`, SHA-256 `241869E262481208027F5FE8952D6D1AAEBCBEAD9E1E392EF5C144EA94977C7E`.
- Photo registration: eight manually identified BOTTOM IC centers, independent affine fit, RMS 6.9 px, maximum residual 13.3 px. Stored as `bottomPhotoCalibration` by `tools/build-jasper-components.mjs`; the local UI consumes it only for the reviewed references.

| BRD reference | Observed image center (px) | Role in review |
| --- | ---: | --- |
| U8N1 | 391, 566 | GPUCORE controller |
| U8U1 | 439, 1608 | CPUCORE controller |
| U7U2 | 597, 1633 | CPUVCS controller |
| U4V1 | 1610, 1707 | 5 V / memory controller |
| U3R1 | 1851, 1001 | GDDR3 |
| U3T1 | 1851, 1231 | GDDR3 |
| U4U1 | 1570, 1515 | GDDR3 |
| U5U1 | 1340, 1515 | GDDR3 |

Additional visual check on the photograph: the marked area and silkscreen for `FT9N1`, `FT8N1`, `FT5N1`, `FT5N2`, `FT7U3`, `FT6V1`, `FT2U1`, `FT1U1` and `FT2R8` are visible near the BRD-projected positions. `FT1U1` appears around image pixel 2228, 1448; `FT2R8` around 2092, 1073, beside the visibly labelled `U2T1` regulator. The V_3P3 and V_1P8 rail cards open their points as individual photo focuses so the existing three main-VRM closeups stay legible. `R2T7` and `R2T8` have exposed pads without components on this particular photograph, matching `EMPTY` on schematic sheet 54. At approximately pixel 879, 1298, the BOTTOM photograph shows a populated `U6T2` footprint and legible silkscreen even though schematic sheet 56 marks `U6T2` `EMPTY`; the UI flags a variant conflict and does not assign it a service voltage. These checks support an area marker, **not** a pin-level or pad-level measurement instruction. Continue auditing the remaining BOTTOM placements, the photographed board variant, and smaller component population before any community release.

The Jasper Power / Boot path now has per-rail photo buttons in multi-rail stages 02, 05 and 06. These route only to the reviewed TOP/BOTTOM targets; stage 05 follows `FT9N1` (12 V) → `FT6V1` (5 V) → `FT1U1` (3.3 V), while stage 06 separates CPUCORE, GPUCORE, CPUVCS and memory. Selecting a point preserves the stage condition and expected reading in the diagnostic context. The on-photo marker still indicates an approximate component position, not an exact probe pad.

The source page labels the image CC BY 4.0, but the embedded watermark says CC BY-SA 4.0. This unresolved discrepancy is recorded in `SOURCES.md`; do not publish until rights are clarified. No source PDF or BRD is redistributed with the app.
