# Modi Diagnostic Lab — drzewo projektu

```text
Modi-Diagnostic-Lab/
├── maps/
│   ├── xbox/
│   │   ├── xbox-360/
│   │   │   ├── trinity/
│   │   │   ├── corona/
│   │   │   ├── jasper/
│   │   │   └── winchester/
│   │   ├── xbox-one/              # Coming Soon
│   │   └── xbox-series/           # Coming Soon
│   ├── playstation/
│   │   ├── ps3/                   # Coming Soon
│   │   ├── ps4/                   # Coming Soon
│   │   └── ps5/                   # Coming Soon
│   └── nintendo/
│       ├── switch/                # Coming Soon
│       └── switch-2/              # Coming Soon
│
├── tools/
│   ├── modi-flasher-360/          # Coming Soon
│   ├── ps5-nor/                   # Coming Soon
│   └── ps5-uart/                  # Coming Soon
│
├── modifications/
│   ├── playstation/               # Coming Soon
│   ├── xbox/                      # Coming Soon
│   └── nintendo/                  # Coming Soon
│
├── controllers/
│   ├── playstation/               # Coming Soon
│   ├── xbox/                      # Coming Soon
│   └── nintendo/                  # Coming Soon
│
├── docs/
│   └── xbox-series/
│       └── XBOX_LAB_1.0.1_RESEARCH_NOTES.md   # Xbox Lab v1.0.1 — XBFS/SBFS/U25/SMART/logs
└── assets/
```

## Xbox Lab — aktywne notatki badawcze

- [`docs/xbox-series/XBOX_LAB_1.0.1_RESEARCH_NOTES.md`](xbox-series/XBOX_LAB_1.0.1_RESEARCH_NOTES.md) — aktualny plan Xbox Lab v1.0.1: Series XBFS, SBFS/U25, certyfikaty, NVMe SMART, System Support/logi, porównania dumpów i eksperyment provisioning Southbridge.

## Zasada

Najpierw wybieramy dział funkcjonalny: **Maps / Tools / Modifications / Controllers**. Dopiero wewnątrz dzielimy zawartość na producenta, rodzinę sprzętu i konkretną rewizję.

Narzędzia, które wymagają własnego kodu, buildów i release'ów, mogą później mieć osobne repozytoria. W Modi Diagnostic Lab pozostaje ich dokumentacja, status i punkt wejścia.
