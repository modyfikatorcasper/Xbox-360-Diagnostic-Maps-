# Modi Diagnostic Lab

Jedno wspólne miejsce dla rozwijanych przez nas materiałów i narzędzi diagnostycznych do konsol i kontrolerów.

## Tożsamość projektu / Project identity

**Kacper Lewandowski — GitHub: `modyfikatorcasper`, znany również jako Modyfikator89, Modyfikator Kacper i Modi.**  
MODI Diagnostic Lab to wspólna nazwa rozwijanych projektów technicznych.

**Kacper Lewandowski — `modyfikatorcasper` on GitHub, also known as Modyfikator89, Modyfikator Kacper and Modi.**  
MODI Diagnostic Lab is the common name used for these technical projects.

Wybrane narzędzia i projekty MODI są rozwijane w kontekście prac diagnostycznych i serwisowych związanych z **Modibox**. Poszczególne repozytoria opisują jednak tylko te marki i narzędzia, które są bezpośrednio związane z danym projektem.

## Strona główna / Project portal

**[OTWÓRZ MODI DIAGNOSTIC LAB / OPEN PROJECT PORTAL](https://modyfikatorcasper.github.io/)**

Portal prowadzi do opublikowanych narzędzi i dokumentacji. Każdy projekt zachowuje własne repozytorium, wersje i status testów.

## Główne działy

- **Maps** — mapy płyt, komponenty, linie zasilania, punkty pomiarowe i informacje serwisowe.
- **Tools** — programatory, readery i pozostałe narzędzia pomocnicze.
- **Modifications** — modyfikacje sprzętowe i programowe, OC/UV oraz projekty eksperymentalne.
- **Controllers** — osobny dział dla kontrolerów PlayStation, Xbox i Nintendo.

## Status

Projekt jest rozwijany etapami. Sekcje, których jeszcze nie opublikowaliśmy, są oznaczone jako **Coming Soon**. Nie publikujemy danych jako zweryfikowanych, dopóki nie przejdą naszej weryfikacji.

**Xbox 360 Console Maps — IN DEVELOPMENT:** [jeden moduł Trinity / Jasper V1](maps/xbox/xbox-360/console-maps/dist/index.html) z wyborem płyt, mapą PCB, kodami błędów i ścieżkami zasilania. To build do oceny; zakres niezweryfikowanych pozycji i warunki użycia zdjęć są opisane w [raporcie](maps/xbox/xbox-360/console-maps/AUDIT_REPORT.md) oraz [źródłach](maps/xbox/xbox-360/console-maps/SOURCES.md).

Aktualne drzewo projektu: `docs/PROJECT_TREE.md`.

> Uwaga: wcześniejsze katalogi `data/` i `modules/` są pozostałością pierwszego szkicu struktury. Nowy układ projektu opiera się na `maps/`, `tools/`, `modifications/` i `controllers/`.

## MODI Maps — Mapy Southbridge / Southbridge Maps

**PS5 · W trakcie prac / In development**

[Mapy Southbridge — opis PL/EN i plan panelu](maps/playstation/ps5/southbridge/README.md)

PL: Według naszych ustaleń dwie wersje mostka mają identyczny układ kulek BGA i pinout. Różnice dotyczą obsługi HDMI i selektora HDMI w NVS. Istnieje Swapper do wymiany mostka; pracujemy nad dokumentacją. Wkrótce planujemy panel z pełną obsługą Southbridge i innych elementów płyt głównych w różnych rewizjach.

EN: According to our findings, the two Southbridge variants share the same BGA ball layout and pinout. Differences concern HDMI support and the HDMI selector in NVS. A Swapper for Southbridge replacement exists; documentation is in progress. We plan to add a panel soon with full support for Southbridge and other motherboard components across different board revisions.

## Console Maps — bieżące zadania po audycie

Raport i wymagania są częścią projektu; poprawki pozostają do wdrożenia i odbioru.

- [Audyt działania i obsługi](docs/CONSOLE_MAPS_UX_AUDIT_2026-10-10.md).
- [Aktywne błędy z krokami odtworzenia](docs/CONSOLE_MAPS_ACTIVE_BUGS.md).
- [Podział Łatwy / Zaawansowany i uproszczony dekoder](docs/CONSOLE_MAPS_EASY_ADVANCED.md).
- [Zadanie wdrożeniowe #4](https://github.com/modyfikatorcasper/Xbox-360-Diagnostic-Maps-/issues/4).

Najpierw poprawić nieaktualną diagnozę na mapie, niespójne zaznaczenia i przewijanie; następnie mobilne menu sekcji, jeden dekoder oraz tryby obsługi. Zamykać błędy dopiero po ponownym teście pod publicznym adresem; gesty wymagają odbioru na telefonie.
