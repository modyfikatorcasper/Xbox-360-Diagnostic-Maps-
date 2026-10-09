# Xbox Series Diagnostic Universal Tool — Device Portal capability notes
Date: 2026-10-10

## Public source
- https://github.com/DanielLMcGuire/XboxSeries
- https://github.com/DanielLMcGuire/xboxtools
- https://learn.microsoft.com/en-us/windows/uwp/debug-test-perf/device-portal

The public architecture research describes testing on one retail Xbox Series S in Developer Mode. Results may vary by model, OS build and permissions.

## Useful software-side diagnostic surfaces
The research identifies Device Portal capabilities for OS/device information, process/performance inventory, ETW event tracing, user-mode process dumps, filesystem browsing, networking information and app/package management. Treat these as capabilities to probe rather than guarantees that every feature is enabled.

## Important limits
- The tested retail Developer Mode console allowed user-mode live process dumps, but kernel dumps were blocked by a NoKernelDumps restriction.
- Device Portal data is collected from a running OS and its exposed services; it is not a physical NVMe image, raw SPI NOR dump, or external UART/POST capture.
- A console that fails before Device Portal services start may provide no data through this route.
- Endpoint availability and permissions should be detected at runtime; record errors instead of assuming support.

## Proposed read-only workflow
1. Authenticate to Device Portal on the local network.
2. Record model, OS build and test timestamps.
3. Collect available system/device inventory, ETW provider list, performance/process data and error reports.
4. Preserve original responses and calculate SHA-256 hashes.
5. Repeat on a known-good console before and after a controlled boot/update test.
6. Correlate software evidence with independently collected POST, UART, SSD/XBFS or NOR/SPI data, keeping source labels and timestamps separate.

## Project conclusion
This is a useful refinement to the Reference Console Capture module, especially the warning not to assume kernel-dump access. It is not a new physical-flash or SSD acquisition method and does not by itself explain an update stall at 94%.
