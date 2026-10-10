# ASPECT2 / libaspect2 — hardware flash tooling research
Date: 2026-10-10
Status: useful candidate; Series X/S SPI NOR compatibility is not confirmed by the project README.

## Repositories
- Hardware board: https://github.com/xboxoneresearch/ASPECT2-PCB
- Open-source CLI/library: https://github.com/xboxoneresearch/libaspect2
- Xbox Series POST reader (separate tool): https://github.com/xboxoneresearch/PicoDurangoPOST

## Why this is relevant
ASPECT2-PCB is an open hardware Facet2-style board project with KiCad schematics/PCB files, STM32 firmware, and a breakout board. Its README documents POST display over I2C and flash access over SPI. The companion `libaspect2` repository documents CLI commands for eMMC and SPI NOR.

The hardware README explicitly marks eMMC flash reading as tested/working and says SPI NOR on the Series family *could* also be supported. Therefore, do not describe Series X/S physical NOR reading as confirmed until tested on the relevant retail board revision and interface.

## Read-only commands documented by libaspect2
```text
flash_cli emmc info
flash_cli emmc --freq 25.0 read dump.bin 0x0 0x10000

flash_cli nor info
flash_cli nor --spi-clock 5000 read flash.bin
flash_cli nor read flash.bin 0x10000 0x8000
```
These are documented CLI examples, not yet validated on our hardware. Check tool version, board connection, flash type, voltage levels and target revision before using them. Do not use `write`, `erase`, or `chip-erase` commands as part of initial diagnostic testing.

## Other documented capabilities and limits
- `flash_cli emmc dump-fuses` is documented; validate exact semantics and applicability before relying on its output.
- The ASPECT2 README says `dsmc-rs` uses a proprietary DLL to read flash over SPI and can also read `Expected1SMCBLDigest` from the flash controller.
- UART (KRNL) is listed as devkit-exclusive; UART (SMC) requires soldering. Do not assume retail Series X/S access is available.
- POST monitoring is already covered separately by PicoDurangoPOST using the Series X/S AARDVARK connector. Follow its revision-specific orientation/pin guidance; do not infer pin orientation from a generic Facet image.

## Suggested validation workflow
1. Review the published schematic, BOM, board revision, and software licensing.
2. Build/test the CLI on the supported ASPECT2 hardware with a known supported target first.
3. Confirm the exact Series X/S motherboard revision and whether the target flash interface is electrically accessible with this board.
4. Perform only identification and read operations initially; retain the untouched raw dump.
5. Read the same target at least twice, compare SHA-256 hashes and byte-level differences, and document any unstable ranges.
6. Parse copies of dumps only; never write/erase a console flash during diagnostic bring-up.
7. Keep this workflow separate from NVMe/SSD imaging and XBFS parsing: SPI flash access does not constitute an SSD dump.

## Project decision
Track ASPECT2/libaspect2 as a practical hardware-tooling lead for flash identification/read workflows. Treat Series X/S SPI NOR support, physical access, and any retail-console UART access as **unverified** pending bench validation.
