# Board-map data model

MODI Console Maps keeps diagnostic content separate from photographs and UI rendering.

## Canonical hierarchy

```text
board family
└─ revision
   ├─ photographs (top / bottom)
   ├─ regions and close-ups
   ├─ components
   │  ├─ designator
   │  ├─ source-recorded value or unknown
   │  ├─ function / package
   │  ├─ board coordinate and side
   │  └─ source confidence
   ├─ rails and measurement points
   ├─ error-code links
   └─ power / boot links
```

The Trinity component database is generated from the normalized placement source. Its coordinates are converted to photograph percentages at render time. Image zoom, pan and component labels use the same transform, so labels remain attached to the photograph.

## Supported examples and prepared routes

| Family | Revision route | Status |
| --- | --- | --- |
| Xbox 360 FAT | Jasper V1 | Public example available |
| Xbox 360 Slim | Trinity Retail Rev 1.01 | Public example available; top and bottom photographs |
| Xbox 360 Slim | Corona | Route reserved; no map until verified source data is supplied |
| Xbox 360 Slim E | Winchester | Route reserved; no map until verified source data is supplied |

Adding a board means supplying a board record, photographs with licence metadata, regions, component coordinates and confidence fields. The UI must show `UNKNOWN` for missing values or diagnoses instead of filling gaps by inference.

## Release boundary

Original schematics, board-layout files, private archives, parser workspaces and temporary downloads are inputs only. They are excluded from the public application bundle and release commit.
