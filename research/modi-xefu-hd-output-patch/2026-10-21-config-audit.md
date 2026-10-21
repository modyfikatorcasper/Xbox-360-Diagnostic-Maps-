# XeFu video-mode audit — 2026-10-21

**Purpose:** force physical Xbox 360 HDMI/component 720p output during OG Xbox emulation; do not confuse this with in-game 720p rendering or widescreen fixes.

## Status

- Verified: decoded ten authentic 136-byte custom XeFu config files from Goatman13/xefu through GitHub as 34 big-endian uint32s. These are **real CFG bytes**, not a XeFu executable decompilation.
- Not yet verified: no XeFu XEX was downloaded successfully into this analysis environment, so no Ghidra disassembly, XEX import tracing or live HDMI hook has been completed.
- Download blocker: ConsoleMods download returned a maintenance/error page; Digiex archive could not be transferred. Ghidra was also unavailable in this runtime.

## Concrete video finding

`5655003F.bin` (Scarface: The World Is Yours): `cfg1=0x02000000`, `cfg2=0x00000300`, `cfg3=0x000000D8`, `cfg7=0`, `cfg8=0`.

According to Goatman13's cfg_02 documentation, `0x100` is associated with interlaced/progressive and `0x200` enables widescreen. **Neither documents forcing the host's physical HDMI mode to 720p.**

Other decoded cases: Def Jam NTSC/PAL `cfg2=0`; RalliSport Challenge 2 `cfg2=0x000000F0`; Far Cry Instincts: Evolution `cfg2=0x00000814`; GunValkyrie `cfg2=0x0B300010`; TimeSplitters 2 `cfg2=0`; TimeSplitters Future Perfect `cfg2=0x00000800`.

The custom-config matching extension on 2026-10-10 was confirmed by PR #24 (titleID_signature.bin), but this provides XBE-specific patch selection rather than evidence of a host video-output override.

## Binary analysis targets (ordered)

1. Original `xefu7.xex` vs `config_loader_xefu7.xex` — test whether loader changes anything beyond config handling.
2. `xefu7b.xex` — contemporaneous 2007 alternative.
3. `xefu2021a/b/c.xex` — compare code paths and video output import callers.
4. `xefu2019.xex` — extra historical baseline.
5. `xefu2026` (PC) — comparative binary research ONLY; not executable directly on Xbox 360.
6. `xefutitle7*.xex`, `xefutitle2021.xex` — configuration tables, not presumed physical output driver.

Import symbols to trace: `VdQueryVideoMode`, `VdSetDisplayMode`, `VdSetDisplayModeOverride`, `XGetVideoMode`. Numeric candidates: 480, 720, 1280, 640, and flag variants near `0x40000000`; they are **heuristics**, not verified mode setters. Xenia models `VdSetDisplayMode` with a resolution-related flag but that implementation is only a research hint.

## Next evidence needed

- Local copies of XeFu XEX packages / extracted HDDX files.
- Ghidra with XEXLoaderWV, CPU `PowerPC:BE:64:A2ALT-32addr`.
- Exports: symbol/call XREFs, decompiler snippets and baseline physical HDMI mode readings on console.
- Baseline first: TV reports 720p before launch, 480p after XeFu, with Display Discovery ON/OFF.

**No emulator patch offsets have been confirmed. Do not make a write/patch to a test console yet.**

## References

- https://github.com/Goatman13/xefu/blob/main/cfg_02.md
- https://github.com/Goatman13/xefu/pull/24
- https://consolemods.org/wiki/Xbox_360:Xenon_Fusion_Emulator
- https://github.com/xenia-project/xenia/blob/master/src/xenia/kernel/xboxkrnl/xboxkrnl_video.cc
- https://github.com/freeqaz/dc3-decomp/blob/main/docs/tools/XEXLOADERWV.md
