# Architecture

## Stable content contract

The intended stable contract gives every board revision independent data and the same evidence vocabulary. Today the renderer and both enabled revisions still live in `dist/assets/app.js`; splitting the data into revision-local files is a later, gated architecture task. Jasper was added without changing Trinity's verified measurement dataset.

Required entity types:

1. `board` — identity, fab/revision evidence, image licensing and coordinate transform.
2. `component` — refdes, device/value, side, boardview coordinates and source status.
3. `net` — name, pins, state availability and expected voltage when verified.
4. `rail` — source/controller/MOSF/inductor/output/load graph.
5. `ic` — function, pins, inputs, outputs, availability and measurement points.
6. `error` — description, evidence class, possible areas and first checks.
7. `flow` — yes/no diagnostic graph with measurement links.
8. `source` — title, URL/local document, license and supported claims.

## Ring of Light module

`dist/assets/rol-module.js` owns the interactive four-segment ring, its bilingual copy and the pattern map exposed as `window.MODIRingOfLight.patterns`. Segment order is fixed to G1 upper-left, G2 upper-right, G3 lower-left and G4 lower-right for a horizontally positioned console. Only combinations present in `PATTERN_DATABASE` receive a record; every other combination renders as `UNKNOWN`.

## Component service profiles

`dist/assets/component-profiles.js` contains a small curated layer above the raw 1,958-component placement database. A profile may define a bilingual role and symptoms, operating state, primary rail, related parts, functional flow, verified signal/pin subset and ordered PCB checks. Missing profiles fall back to placement-only data. Dynamic levels, unverified thresholds and uncurated full BGA pinouts must remain `UNKNOWN`.

## Coordinate safety

Layout coordinates are authoritative for component-to-component relationships only where a placement dataset has been extracted and verified. Trinity has separate TOP/BOTTOM photo transforms and its designators, sides and coordinates were cross-checked between GENCAD and Allegro. The image and markers share one zoom/pan matrix. Jasper currently has only approximate area labels on its TOP photograph: no extracted BRD coordinate set, photo calibration or component-marker claim is present.

## Publication gates

- A voltage requires a schematic/datasheet or physical measurement source.
- A marker requires refdes + net + neighbor verification.
- An error-to-area link must be labeled official, schematic-derived, or community.
- Unknowns remain `UNKNOWN`; no placeholder values are promoted to facts.
