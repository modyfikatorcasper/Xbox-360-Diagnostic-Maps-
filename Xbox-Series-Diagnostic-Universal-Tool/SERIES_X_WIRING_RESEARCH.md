# Xbox Series X — POST / SPI-NOR wiring research notes

Status: **RESEARCH / VERIFY REVISION BEFORE SOLDERING**

## 1. Retail diagnostic POST — verified public wiring
Public `xboxoneresearch/PicoDurangoPOST` documentation explicitly supports Xbox Series X/S through the **AARDVARK** port.

Raspberry Pi Pico:
- `GP0` / physical Pico pin 1 -> **AARDVARK pin 3 = SDA**
- `GP1` / physical Pico pin 2 -> **AARDVARK pin 1 = SCL**
- `GND` -> console GND

Do **not** inject Pico 3V3 into the console.
Use the board's pin markings because connector orientation can change between revisions.

This is the preferred live diagnostic route on retail Series hardware. Kernel UART is not the first-line path.

## 2. Southbridge SPI/NOR — what is confirmed
Public Xbox repair threads confirm that at least some Series X Southbridge-board revisions contain a small flash/NOR device with console-specific data and that replacement Southbridge boards may require preservation/transfer of the original data.

The public Xbox Research error database also contains Series code `0xE406 NOR1` with the note `Corrupted NOR, dump SPI_FLASH`.

`xboxoneresearch/ASPECT2-PCB` exposes SPI signals and states that its SPI path, already used for flash access, could support reading SPI NOR on Series-family hardware. It does **not**, by itself, establish one universal Series X solder-pad map for every board revision.

There is conflicting community information for different Series X revisions: another repair discussion notes a schematic footprint for flash that may be unpopulated on a particular revision, with per-console data instead located in the dedicated Series XBFS area on the internal NVMe. Therefore do not assume every Southbridge board is identical.

## 3. Direct SPI-NOR signal map — ONLY after exact IC identification
If the populated device is confirmed from its datasheet to be a conventional 8-pin 25-series SPI NOR (SOIC-8/WSON-8 logical pinout), the usual logical mapping is:

| Flash pin | Signal | Programmer signal |
|---|---|---|
| 1 | `/CS` / `CS#` | CS |
| 2 | `DO` / `IO1` | MISO / DO |
| 3 | `/WP` / `IO2` | WP / IO2 |
| 4 | `GND` | GND |
| 5 | `DI` / `IO0` | MOSI / DI |
| 6 | `CLK` | CLK / SCK |
| 7 | `/HOLD`, `/RESET` or `IO3` | HOLD/RESET/IO3 |
| 8 | `VCC` | VCC **at the exact voltage specified by the chip datasheet** |

This table is a standard 25-series logical pinout, **not proof of the exact Xbox chip package/voltage**.

### Before connecting a programmer
1. Read the exact chip marking under microscope.
2. Identify exact manufacturer + part number.
3. Retrieve datasheet.
4. Confirm package and pin 1 orientation.
5. Confirm VCC and I/O voltage (do not assume 1.8 V or 3.3 V).
6. Measure the board rail at the chip / trace it from schematic.
7. With console fully unpowered, check whether in-circuit loading by Southbridge prevents a reliable read.
8. If in-circuit reads differ, stop and use a safer isolation/desoldered-chip method rather than writing anything.

Never power the board from an unknown programmer voltage.
Never write during first acquisition.

## 4. Acquisition quality rule
For any SPI/NOR read:
- dump A
- power-cycle/disconnect programmer
- dump B
- SHA-256 both
- accept acquisition only if A == B byte-for-byte

Then store original dumps read-only and analyze copies.

## 5. What is still NOT confirmed
We do not yet have a sufficiently trustworthy public source that maps the Series X Southbridge flash signals to named motherboard **test-point numbers** for every revision.

Do not publish guessed TP numbers.

To make an exact solder map for the physical board, collect:
- exact Series X board/Southbridge revision,
- high-resolution photo of both sides of the SB board,
- close-up of the suspected NOR/NVS chip and its marking.

Then trace `/CS`, `MISO`, `MOSI`, `CLK`, `VCC`, `GND` from the chip against the Toledo SB schematic and continuity-measure them to accessible pads. Add the confirmed pads to this document only after continuity verification.

## 6. Useful reference sources
- xboxoneresearch/PicoDurangoPOST
- xboxoneresearch/ASPECT2-PCB
- xboxoneresearch/errorcodes
- xboxoneresearch/wiki — XBFS/SBFS
- Toledo SB Fab E schematic (revision-specific)
- GBAtemp Series X test-point/Southbridge repair discussions
- TronicsFix Series X Southbridge repair discussions
