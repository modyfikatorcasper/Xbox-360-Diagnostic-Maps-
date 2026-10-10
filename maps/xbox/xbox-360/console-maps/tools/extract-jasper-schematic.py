"""Extract Jasper V1 component-index metadata from the hash-locked schematic.

This reads the PDF's own component index; it does not infer component values,
electrical nets, fitted status, or probe-pad locations from drawing proximity.
"""

import hashlib
import json
import re
import sys
from pathlib import Path

from pypdf import PdfReader


EXPECTED_PDF_SHA256 = "11CFCBB1586197D1558168906EA78534C611DADC0705359E65181DE2DB2D2D6E"
EXPECTED_BRD_SHA256 = "241869E262481208027F5FE8952D6D1AAEBCBEAD9E1E392EF5C144EA94977C7E"
INDEX_LINE = re.compile(r"^([A-Z]{1,3}\d+[A-Z]?\d*)\s+(\S+)\s+\[(\d{1,2})[A-D]\d", re.M)
REF_TOKEN = r"(?<![A-Z0-9]){}(?![A-Z0-9])"
COMPONENT_TOKEN = re.compile(r"\b[A-Z]{1,3}\d+[A-Z]?\d*\b")
PASSIVE_VALUES = {
    "C": re.compile(r"(?<![A-Z0-9])((?:\d+(?:\.\d+)?|\.\d+)\s*(?:UF|NF|PF))\b", re.I),
    "R": re.compile(r"(?<![A-Z0-9])((?:\d+(?:\.\d+)?|\.\d+)\s*(?:KOHM|MOHM|OHM|K|M))\b", re.I),
    "L": re.compile(r"(?<![A-Z0-9])((?:\d+(?:\.\d+)?|\.\d+)\s*(?:UH|MH))\b", re.I),
}
# Page 54 contains an independent V_1P8 regulator below the GPU phases.
# These references are on that V_1P8 branch in the rendered schematic.
GROUP_OVERRIDES = {ref: "aux_power" for ref in
                   ("U2T1", "FT2R8", "C2T5", "C2R4", "C2D6",
                    "R2E7", "R2E6", "R1E3", "R1E1", "R2T7", "R2T8")}
# These exact designators were checked in the rendered sheets, not inferred
# from the BRD (which records placements even for optional/empty footprints).
SCHEMATIC_EMPTY = {"R2T7": 54, "R2T8": 54, "U5C1": 56, "U6T2": 56}


def group_for_page(page):
    if 4 <= page <= 11:
        return "cpu"
    if 12 <= page <= 18:
        return "gpu"
    if 19 <= page <= 26:
        return "memory"
    if 27 <= page <= 31:
        return "hana"
    if page == 32:
        return "aux_power"
    if 33 <= page <= 38 or page == 42:
        return "southbridge"
    if page in (39, 40):
        return "network"
    if page == 41:
        return "audio"
    if page == 43:
        return "front_io"
    if 44 <= page <= 46:
        return "connectors"
    if page in (47, 50, 55, 56):
        return "aux_power"
    if page == 48:
        return "storage"
    if page == 49:
        return "power_input"
    if page in (51, 52, 57):
        return "cpu_vrm"
    if page in (53, 54):
        return "gpu_vrm"
    if 58 <= page <= 62:
        return "debug"
    return "unknown"


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: python tools/extract-jasper-schematic.py Jasper_Schematic.pdf tools/data/jasper-schematic-index.json")
    source, output = map(Path, sys.argv[1:])
    digest = hashlib.sha256(source.read_bytes()).hexdigest().upper()
    if digest != EXPECTED_PDF_SHA256:
        raise SystemExit(f"Unexpected Jasper schematic SHA-256: {digest}")
    root = Path(__file__).resolve().parent.parent
    db_text = (root / "dist/assets/jasper-components.js").read_text(encoding="utf-8")
    db = json.loads(db_text.split(" = ", 1)[1].rstrip(";\r\n"))
    if db["sourceSha256"] != EXPECTED_BRD_SHA256:
        raise SystemExit("Jasper BRD source hash does not match schematic intake")
    board_refs = {component["ref"] for component in db["components"]}
    pdf = PdfReader(source)
    if len(pdf.pages) != 76:
        raise SystemExit(f"Expected 76 Jasper schematic pages, found {len(pdf.pages)}")
    page_text = [(page.extract_text() or "") for page in pdf.pages]
    entries = {}
    for text in page_text[67:]:
        for ref, package, page in INDEX_LINE.findall(text):
            if ref not in board_refs:
                continue
            page = int(page)
            if not 4 <= page <= 62:
                continue
            entry = entries.setdefault(ref, {"package": package, "pages": []})
            if entry["package"] != package:
                raise SystemExit(f"Conflicting package in schematic index: {ref}")
            if page not in entry["pages"]:
                entry["pages"].append(page)
    missing = sorted(board_refs - entries.keys())
    if missing != ["SW1G1", "SW2G2", "SW2G4", "SW2G5", "SW5G1"]:
        raise SystemExit(f"Unexpected BRD/schematic index difference: {missing}")
    for ref in missing:
        occurrences = [page for page in range(4, 63)
                       if re.search(REF_TOKEN.format(re.escape(ref)), page_text[page - 1])]
        entries[ref] = {"package": "", "pages": occurrences, "indexStatus": "not-in-pdf-component-index"}
    for ref, entry in entries.items():
        entry["pages"].sort()
        primary = entry["pages"][0] if entry["pages"] else None
        entry["primaryPage"] = primary
        entry["group"] = GROUP_OVERRIDES.get(ref, group_for_page(primary))
        if primary is not None:
            sheet = page_text[primary - 1]
            entry["sheetTitle"] = (sheet.split("[PAGE_TITLE=", 1)[1].split("]", 1)[0].strip("[ ")
                                   if "[PAGE_TITLE=" in sheet else sheet.splitlines()[0].strip())
    for ref, page in SCHEMATIC_EMPTY.items():
        if page not in entries[ref]["pages"]:
            raise SystemExit(f"Schematic EMPTY review no longer matches {ref} on sheet {page}")
        entries[ref]["populationStatus"] = "schematic-empty"
    # Only promote values when one explicit, unit-bearing value is present in
    # the component's own text block. Bare resistor numbers and ambiguous blocks
    # remain UNKNOWN rather than assigning the neighbor's value.
    candidates = {}
    for page in range(4, 63):
        text = page_text[page - 1]
        body_start = text.find("JASPER_FAB_B")
        body = text[body_start + len("JASPER_FAB_B"):] if body_start >= 0 else text
        hits = [(match.start(), match.group()) for match in COMPONENT_TOKEN.finditer(body)
                if match.group() in entries and page in entries[match.group()]["pages"]]
        for index, (start, ref) in enumerate(hits):
            kind = re.match(r"[A-Z]+", ref).group()
            pattern = PASSIVE_VALUES.get(kind)
            if not pattern:
                continue
            end = hits[index + 1][0] if index + 1 < len(hits) else min(len(body), start + 200)
            block = body[start:end]
            if len(block) > 200:
                continue
            if not re.match(r"^[A-Z]{1,3}\d+[A-Z]?\d*\s+\d+\b", block):
                continue
            values = {match.group(1).upper().replace(" ", "") for match in pattern.finditer(block)}
            if len(values) == 1:
                candidates.setdefault(ref, set()).update(values)
    for ref, values in candidates.items():
        if len(values) == 1:
            entries[ref]["value"] = values.pop()
            entries[ref]["valueStatus"] = "schematic-unit-text"
    output.parent.mkdir(parents=True, exist_ok=True)
    result = {
        "source": "Xbox_360_Jasper_Schematic.pdf",
        "sourceSha256": digest,
        "sourcePages": len(pdf.pages),
        "indexMatched": len(board_refs) - len(missing),
        "notInIndex": missing,
        "components": {ref: entries[ref] for ref in sorted(entries)},
    }
    output.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(json.dumps({"indexMatched": result["indexMatched"], "unitValues": sum(bool(x.get("value")) for x in entries.values()), "missing": missing,
                      "unassignedPages": [ref for ref in missing if not entries[ref]["pages"]],
                      "output": str(output)}, indent=2))


if __name__ == "__main__":
    main()
