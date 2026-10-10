# Sources and attribution

## Supplied technical documents

- `Xbox_360_Trinity_Schematic.pdf` — rail values, regulator identities and power/boot relationships.
- `Xbox_360_Trinity_Boardview.cad` — Trinity component, net and board-location reference.
- `Xbox_360_Trinity_ver2.brd` — Allegro 15.5.2 placement data used to cross-check the complete Trinity designator, side and coordinate set against the GENCAD export.
- `Xbox_360_Jasper_Schematic.pdf` — Jasper rail values, power stages, component designators and pages 68–76 component index; SHA-256 `11CFCBB1586197D1558168906EA78534C611DADC0705359E65181DE2DB2D2D6E`. The index is linked to the BRD placements in `tools/data/jasper-schematic-index.json`; 1145 explicit unit-bearing passive values are carried into the local component database. This does not establish footprint population or exact probe pads.
- `Xbox_360_Jasper.brd` — supplied Allegro 15.x Jasper V1 board, source of 1952 component placements and TOP/BOTTOM side flags. The exact source file is hash-locked in the local extraction tool; electrical values and pin locations are not inferred from placement records.

These documents are working references only and are not redistributed in the public build. Their presence does not grant a redistribution licence.

The local Jasper placement reader uses record-layout facts checked against the [BoardRipper Allegro 15 format notes](https://github.com/AlexeyInwerp/BoardRipper/blob/main/docs/formats/ALLEGRO_V15_FORMAT.md). No BoardRipper program code is included.

## PCB Photo Sources

The four PCB photographs in `dist/assets` are resized reference backgrounds from ConsoleMods Wiki. The diagnostic labels, highlighted areas, measurement information, and interactive overlays are separate MODI interface content. A separate overlay does **not** remove any attribution or licence obligation for the underlying photographs.

| Local photograph | Exact source page | Credited photographer | Source-page licence statement | Notice preserved in local image |
| --- | --- | --- | --- | --- |
| `pcb-trinity-top.png` | [Trinity Top](https://consolemods.org/wiki/File:Xbox_360_Trinity_Top.png) | jft / retro.jnftech.net | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | CC BY-SA 4.0 International |
| `pcb-trinity-bottom.png` | [Trinity Bottom](https://consolemods.org/wiki/File:Xbox_360_Trinity_Bottom.png) | jft / retro.jnftech.net | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | CC BY-SA 4.0 International |
| `pcb-jasper-top.png` | [Jasper V1 Top](https://consolemods.org/wiki/File:Xbox_360_Jasper_V1_Top.png) | jft / retro.jnftech.net | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | CC BY-SA 4.0 International |
| `pcb-jasper-bottom.png` | [Jasper V1 Bottom](https://consolemods.org/wiki/File:Xbox_360_Jasper_V1_Bottom.png) | jft / retro.jnftech.net | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | CC BY-SA 4.0 International |

**Licence status: UNVERIFIED for release.** The source pages describe CC BY 4.0, but the preserved watermark on each local copy states [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). These are different licence notices. We do not silently replace the image notice with the page label or remove/crop attribution. Clarification from an authorized source, or replacement with appropriately licensed original photographs, is required before a public release decision. The local review ZIP is not a public-release clearance.

Image paths are selected independently of PCB marker and diagnostic data in `dist/assets/app.js` (`B[board].images`). A future self-photographed replacement must be registered to the same board/side coordinate system and have its markers rechecked; merely swapping the image path does not validate the overlay.

Attribution and links are also available through the application's Sources and licences dialog.

## Manufacturer documentation

- Analog Devices ADP1877: https://www.analog.com/en/products/adp1877.html
- onsemi NCP4201: https://www.onsemi.com/download/data-sheet/pdf/ncp4201-d.pdf
- Xbox Support — Xbox 360 power supply checks: https://support.xbox.com/help/xbox-360/console/check-power-supply
- Microsoft Xbox 360 console manual and safety guidance: https://download.microsoft.com/download/2/8/c/28cdbb94-1c41-4131-8e03-1b91765d382e/emeaconsolefullendaswnofi.pdf

## Community technical references

- ConsoleMods Xbox 360 error codes: https://consolemods.org/wiki/Xbox_360:Error_Codes
- XenonLibrary Errors: https://xenonlibrary.com/wiki/Errors
- ConsoleMods motherboard information: https://consolemods.org/wiki/Xbox_360:Schematics

Community-derived diagnoses are presented as service guidance, not as official Microsoft repair documentation. A code not present in the curated database is shown as `UNKNOWN`.

For the current Trinity package, the 15 SMC code names and high-level meanings were checked against the ConsoleMods community error table. PCB areas, component designators and voltage expectations were then matched independently to the supplied Trinity schematic, especially pages 45–53 and the power-architecture page 63. Unverified signal levels, frequencies and resistance thresholds are deliberately labelled `UNKNOWN`. Extended XSS/UEM codes are not included in this curated set.

## Project credits

- Modyfikator89
- Modyfikator Kacper
- Modibox.pl
- Special Thanks: Lewy2041

Additional individual credits should be added only when a specific contribution can be confirmed.
