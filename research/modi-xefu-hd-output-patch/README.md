# Modi XeFu HD Output Patch

## Status
Research / proof-of-concept

## Goal
Force the Xbox 360 to keep or switch to a **physical 1280x720 progressive video output while running the original Xbox backward-compatibility emulator (XeFu/Fusion)** instead of falling back to 480p.

This project is **not primarily about increasing the internal game rendering resolution**. The immediate target is the Xbox 360 host video-output mode used while XeFu is active.

## Problem statement
Current test scenario:

```text
Xbox 360 dashboard: 720p
        ↓
Launch original Xbox title through XeFu
        ↓
Game / XBE may even contain 720p or widescreen patches
        ↓
XeFu / BC environment changes host video mode
        ↓
Display reports 480p
```

Desired result:

```text
Xbox 360 dashboard: 720p
        ↓
Launch original Xbox title through XeFu
        ↓
XeFu remains active
        ↓
Xbox 360 physical video output stays 1280x720p
        ↓
Display reports 720p60
```

Later, this can be combined with per-game 720p, widescreen and FOV patches so that both the game-side rendering path and the console-side presentation/output path are HD.

## Main research hypothesis
XeFu/Fusion is not fundamentally limited to 480p. The Xbox 360 backward-compatibility stack already contains HD-capable code paths. The likely problem is a mode-selection or fallback path that selects SD/480p for specific titles or configurations.

The first target is therefore to locate and override the place where XeFu, XAM or the Xbox 360 kernel:

1. queries the current host video mode,
2. decides that the BC session should use 480p,
3. requests an SD display mode,
4. or applies a display-mode override.

## Candidate Xbox 360 video APIs / hooks
Initial functions worth tracing or hooking:

- `XGetVideoMode`
- `VdQueryVideoMode`
- `VdSetDisplayMode`
- `VdSetDisplayModeOverride`

Also inspect imports and call sites from:

- `xefu.xex`
- `xefutitle.xex`
- related BC/Fusion modules
- XAM/kernel paths used during Xbox 1 title launch

## Phase 0 — baseline capture
Before patching anything, create a repeatable baseline.

For every test title record:

- Xbox 360 dashboard video mode before launch
- HDMI/component output mode reported by the display
- output mode immediately after XeFu starts
- whether Display Discovery is enabled
- cable/output type
- XeFu build/version
- title ID
- whether the XBE is stock or patched
- whether the game itself supports 480p/720p/widescreen

Recommended initial target: one title that always falls back to 480p and one known title/build that can remain/use HD, if available.

## Phase 1 — simple configuration test
Test whether the fallback can be prevented without binary modification:

1. Set Xbox 360 dashboard to 720p.
2. Disable Display Discovery.
3. Launch the same OG Xbox title.
4. Verify the physical output mode on the TV/capture device.
5. Repeat with Display Discovery enabled.

If 720p remains active with Display Discovery disabled, the first implementation can potentially be a launcher/plugin that preserves the selected host mode.

## Phase 2 — video-mode query hook
Build a minimal DashLaunch/XEX plugin PoC that detects XeFu loading and logs video-mode queries.

Target behaviour for the experimental hook:

```cpp
if (xefu_is_loaded) {
    // Experimental response presented to the BC environment.
    mode.width       = 1280;
    mode.height      = 720;
    mode.progressive = true;
    mode.widescreen  = true;
}
```

Important: first log the real calls and structures before forcing values.

Questions:

- Does XeFu call `XGetVideoMode`?
- Does it query the kernel directly?
- Does it read a cached mode structure?
- Does the requested mode change when the title starts?
- Does the 480p switch happen before or after `xefutitle.xex` loads?

## Phase 3 — block the SD fallback
If XeFu explicitly requests 480p, intercept the setter rather than only spoofing the query.

Concept:

```text
XeFu requests SD / 480p
        ↓
Modi hook intercepts request
        ↓
log request
        ↓
ignore or translate it to 1280x720 progressive
        ↓
Xbox 360 output remains 720p
```

Possible targets:

- `VdSetDisplayMode`
- `VdSetDisplayModeOverride`
- lower-level video-mode setter reached by XeFu/XAM

The first safe PoC should only log calls. The second can block a confirmed 480p request. The third can translate it to 720p.

## Phase 4 — XeFu binary analysis
Load multiple XeFu builds into Ghidra/IDA and compare them.

Recommended comparison set:

- early XeFu build
- `xefu7.xex`
- later 2019/2021 Fusion builds where legally obtained from owned system data

Look for:

- imports of video-related kernel/XAM APIs
- constants associated with common modes (`640`, `480`, `720`, `1280`)
- structures passed into display-mode functions
- branches selecting SD vs HD
- title-specific compatibility conditions
- calls made immediately before the physical output changes

A binary diff between versions may reveal Microsoft's later HD/compatibility fixes.

## Phase 5 — permanent patch
Once the exact SD fallback condition is identified, produce the smallest possible patch.

Preferred order:

1. runtime hook/plugin,
2. per-XeFu binary patch,
3. only then a larger custom loader/front-end.

Do **not** begin by attempting to rewrite or recompile the entire emulator. Source code for Microsoft's XeFu is not publicly available, and a small host-video-mode patch is a much more realistic target.

## Success criteria
### PoC success
A title that previously causes the display to report 480p starts through XeFu and the display continues to report **1280x720p**.

### Stage 2 success
The console can automatically preserve/force 720p for all tested XeFu launches without manually changing dashboard settings.

### Stage 3 success
Combine physical 720p output with:

- game-side 720p patches,
- widescreen patches,
- FOV correction,
- per-title XeFu configuration.

## Long-term concept
A future **Modi Fusion HD** launcher could select a compatibility profile automatically:

```text
Title ID
  ├─ recommended XeFu build
  ├─ compatibility config
  ├─ force host 720p output
  ├─ game 720p patch
  ├─ widescreen patch
  ├─ FOV fix
  └─ known-issues profile
```

The key architectural separation is:

```text
Game internal rendering resolution
            ≠
Xbox 360 physical video output mode
```

This project targets the **second problem first**.

## First practical milestone
Create a diagnostic XEX/DashLaunch plugin that:

1. detects `xefu.xex` / `xefutitle.xex`,
2. logs every relevant video-mode query/change,
3. records the mode before XeFu launch,
4. records the requested mode during launch,
5. identifies the exact call responsible for the 720p → 480p switch.

Only after that call is confirmed should the plugin start overriding it.

## Working name
**Modi XeFu HD Output Patch**

Possible later product/project name: **Modi Fusion HD**.

## Research notes
Keep test results, addresses, XeFu hashes/build IDs and patch offsets in this directory. Do not commit copyrighted Microsoft binaries to the repository.
