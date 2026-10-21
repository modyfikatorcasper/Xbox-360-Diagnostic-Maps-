# MODI XeFu HD Output — porównanie oficjalnych zrzutów konfiguracji (2026-10-21)

**Cel:** utrzymanie fizycznego sygnału HDMI 1280×720p Xboxa 360 podczas XeFu, nie tylko patch wewnętrznego renderowania XBE.

## Sprawdzony materiał

Sparsowano oficjalne tekstowe dumpy z `Goatman13/xefu/txt_config_dumps`. Liczba wpisów:

| Tabela | Rekordy |
|---|---:|
| xefu_p | 29 |
| xefutitle7 | 132 |
| xefutitle7b | 131 |
| xefutitle2019 | 134 |
| xefutitle2021 | 136 |

Część gier ma kilka rekordów z tym samym TitleID — porównanie wykorzystuje **multizbiory** dla (TitleID + pola certyfikatu/wariantu), dzięki czemu nie zgłasza fałszywych zmian, gdy różni się tylko kolejność wersji.

## Wniosek A: nie ma jednej udokumentowanej flagi „Force 720p” w CFG2

| Znany przykład HD | CFG2 w xefutitle7 |
|---|---|
| Halo CE (4D530004) | `0x00000000` |
| GTA Vice City (5454000F) | `0x00000200` |
| Counter-Strike (4D530036) | `0x01800000` |

Wspólny bit = 0. Rozdzielczość sygnału HDMI trzeba badać w silniku i host video mode (plus Display Discovery), nie zakładać, że pojedyncza flaga CFG2 kontroluje wyjście. `cfg_02.md`: 0x100 dotyczy progressive/interlaced, 0x200 widescreen.

## Wniosek B: tabela 2007 vs 2021

- `xefutitle7`: 132 rekordy, 125 grup.
- `xefutitle2021`: 136 rekordów, 129 grup.
- Dla **dopasowanych grup** multizbiory merytorycznych głównych CFG oraz ich pomocniczych danych są identyczne (nie licząc wskaźników relokacji).
- 5 dodanych: Star Wars Battlefront `4C410011`, Kung Fu Chaos `4D530031`, Tony Hawk 3 `41560004`, Secret Weapons Over Normandy `4C410006`, Oddworld Stranger's Wrath `4541006D`.
- Jedna stara nieopisana grupa `4947002B` nie występuje w 2021.

**Interpretacja:** silniki XeFu nadal mogą różnić się w kodzie, ale nie wykazano globalnego „720p switch” przez te tabele.

## Wniosek C: 2007 XeFu7 vs 7b — pipeline x86

Oba mają niezmieniony multizbiór głównych CFG dla dopasowanych grup, ale `xefutitle7b` zmienia **dane pomocnicze dla 49 grup**. Przykłady: `0x1F4FFFFF → 0x1F4FCFFF` oraz `0x1F4FFBFF → 0x1F4FCBFF`, XOR=`0x00003000`. Dokumentacja `cfg_09_10.md` wiąże takie pola z pipeline'em / rekompilacją x86, **nie** z HDMI. Zmiany dotykają m.in. Halo, Fable, Simpsons Road Rage.

## Wniosek D: realny fix obrazu dla Scarface

Oryginalne `xefutitle7`, Scarface `5655003F`: `cfg2=0x100`. Społecznościowy niestandardowy `Configs/5655003F.bin`: `cfg2=0x300`. Dodany bit to `0x200` = widescreen. To realna poprawka obrazu **bez dowodu zmiany HDMI na 720p**.

## Wniosek E: uważajmy z importem VdSetDisplayMode

Implementacja `VdSetDisplayMode` w kodzie Xenii to **stub**, a `VdQueryVideoMode` zwraca testowy tryb 1280×720. Zatem nazwy API i komentarze o flagach są tropami do szukania w Ghidrze, **nie** potwierdzonymi wywołaniami na fizycznej konsoli.

Warto włączyć do analizy także `xbox.xex` (frontend wyboru XeFu), XAM/kernel i obserwację HDMI. PC XeFu2026 zewnętrzną flagę `scalingResolutions=...` obsługuje w specyficznym środowisku PC; nie jest to dowód funkcji wyjścia HDMI Xbox 360.

## Co teraz zrobić

1. Dashboard HDMI 720p → **reboot** → uruchom OG Xbox; spisz z menu Info TV fizyczny tryb.
2. Powtórz z `Display Discovery=OFF` → reboot; te same XeFu, TitleID i XBE.
3. Powtórz dla gry używającej HD na XeFu (Halo CE) i tytułu spadającego do 480p.
4. Uzyskaj autentyczny `xefu7.xex`, `xefu7b.xex`, `config_loader_xefu7.xex`, `xefu2021a/b/c.xex` oraz `xbox.xex` z własnego HDDx/oryginalnych archiwów.
5. Importuj XEX do Ghidry przy użyciu XEXLoaderWV PPC Big Endian, przejrzyj odwołania do `VdQueryVideoMode`, `VdSetDisplayMode`, `VdSetDisplayModeOverride`, `XGetVideoMode` oraz struktur video.
6. Dopiero po odnalezieniu faktycznego wywołania na konsoli testuj **read-only hook/log**, później ewentualny bezpieczny patch.

**Limit weryfikacji:** archiwum z 10.10 nie było możliwe do pobrania w bieżącym środowisku, Ghidra nie jest zainstalowana i nie zdekompilowano prawdziwego XeFu XEX. Brak potwierdzonych offsetów ani gotowego patcha HDMI.

## Źródła

- https://github.com/Goatman13/xefu/tree/main/txt_config_dumps
- https://github.com/Goatman13/xefu/blob/main/cfg_02.md
- https://github.com/Goatman13/xefu/blob/main/cfg_09_10.md
- https://github.com/Goatman13/xefu/blob/main/Configs/readme.md
- https://consolemods.org/wiki/Xbox_360:Xenon_Fusion_Emulator
- https://consolemods.org/wiki/Xbox_360:Original_Xbox_Games
- https://consolemods.org/wiki/Xbox_360:Video_Output_Notes
- https://consolemods.org/wiki/Xbox_360:Original_Xbox_Games_Compatibility_List/Official_XeFu_List
- https://github.com/xenia-project/xenia/blob/master/src/xenia/kernel/xboxkrnl/xboxkrnl_video.cc
