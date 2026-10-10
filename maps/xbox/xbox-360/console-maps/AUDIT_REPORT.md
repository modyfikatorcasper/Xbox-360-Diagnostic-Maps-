# MODI Console Maps — kandydat do audytu zewnętrznego

## Aktualizacja Jasper V1 — 2026-10-10

Wyszukiwarka Jaspera obejmuje teraz wszystkie 1952 rekordy TOP/BOTTOM, filtr strony PCB, typ elementu, fizyczne sąsiedztwo i stronicowanie. Znane nazwy układów (np. Loki, NCP5331) są wyszukiwalne. Sąsiedztwo jest liczone z odległości w danych BRD i **nie** potwierdza funkcjonalnej grupy ani połączeń elektrycznych. Każdy z 1908 wyników `UNVERIFIED` otwiera zbliżenie z przerywanym kwadratem przewidywanej okolicy i kropką pośrodku, wyraźnie odmiennym od znacznika elementu sprawdzonego na zdjęciu. Etykieta na obrazie podaje oznaczenie i wartość ze schematu albo `UNKNOWN`. Diodowy filtr działa również dla rekordów z wcześniejszej wersji wygenerowanej bazy.

Po odnalezieniu plików na `D:` odczytano 76-stronicowy schemat Jaspera (SHA-256 `11CFCBB1586197D1558168906EA78534C611DADC0705359E65181DE2DB2D2D6E`) i potwierdzono hash właściwego BRD. Indeks PDF łączy 1947 rekordów bezpośrednio; pięć przełączników znaleziono na arkuszu 43. Wszystkie 1952 pozycje mają teraz przypisany arkusz i jedną z 15 grup wyszukiwarki; 1145 wartości pasywnych z jednoznaczną jednostką przepisano do bazy, 807 pozostaje `UNKNOWN`. Arkusz 54 ma osobny tor `V_1P8` pomimo tytułu GPU VRM, dlatego `U2T1`/`FT2R8` są w grupie pomocniczego zasilania. Na arkuszu 56 potwierdzono, że `V_3P3` daje `U1F1` (NCP5662), a pomiar jest na `FT1U1`; błędne `U6T2` usunięto z raila i sekwencji startu. `U6T2`, `U5C1` (arkusz 56) oraz `R2T7`/`R2T8` (arkusz 54) są w dostarczonym schemacie oznaczone `EMPTY`. Zdjęcia potwierdzają puste pola `R2T7`/`R2T8`/`U5C1`, ale układ `U6T2` jest na zdjęciu BOTTOM obsadzony. Interfejs jawnie zgłasza konflikt wariantu i nie traktuje `U6T2` jako źródła `V_3P3`. Dla GPU `U4D1` usunięto niepotwierdzoną nazwę „Zeus” i pozostawiono symbol z PDF `NBY2_BGA`.

To **nie zamyka** żądania pełnej precyzji Jaspera: 39 obsadzonych pozycji i pięć nieobsadzonych ma przegląd fotograficzny; pozostałych 1908 nie wolno przedstawiać jako sprawdzonych punktów PCB. Kontrola granic dopasowania Jasper BRD→zdjęcie wykazała, że wszystkie współrzędne mieszczą się w obrazie, ale to **nie dowodzi** zgodności 1908 nieprzejrzanych fizycznych lokalizacji. Schemat i BRD są już dostępne, lecz same strony źródłowe nie potwierdzają obsadzenia konkretnego footprintu na fotografowanej sztuce ani dokładnego pada pomiarowego. Pozostałe 807 wartości i pełne połączenia per element wymagają dalszego odczytu/weryfikacji. Nierozstrzygnięta pozostaje również sprzeczność licencji zdjęć wskazana poniżej. Projektu nie opublikowano.

Wszystkie 12 istniejących zestawów testów automatycznych przechodzi, łącznie z nowymi kontrolami wyszukiwarki w teście Jaspera. Dodatkowo `node --check` i `git diff --check` nie wykazują błędów. Nowy widok sprawdzono przez lokalny serwer HTTP: `C7T33` w PL i EN pokazuje kwadrat, kropkę i `4.7UF`; `C1A2` pokazuje wartość nieznaną, pusty `R2T7` nie tworzy znacznika, a sprawdzony `U7D1` zachowuje zwykły znacznik. Zmieniono: `dist/index.html`, `dist/assets/app.js`, `dist/assets/styles.css`, `dist/assets/jasper-components.js`, `tools/extract-jasper-schematic.py`, `tools/data/jasper-schematic-index.json`, `tools/build-jasper-components.mjs`, `tools/test-jasper-audit.mjs`, `tools/test-ui-contract.mjs`, `docs/JASPER_PLACEMENT_INTAKE.md`, `README.md` oraz ten raport. Starsza paczka ZIP nie zawiera tej aktualizacji i nie powinna być uznawana za gotową do wydania.

Data: 2026-09-25. Status: **lokalna paczka do audytu, NIE wersja dopuszczona do publikacji**. Bez przebudowy architektury i bez nowych dużych funkcji.

## Co poprawiono

- Jasper V1: zachowano 1952 rekordy rozmieszczenia z właściwego pliku BRD. Spośród 44 miejsc sprawdzonych na zdjęciach 39 jest obsadzonych, w tym oznaczony na TOP `U1B2` (ICS1893BF). Cztery footprinty są puste, a alternatywny układ `U1B1` (BCM5241) nie jest obsadzony w fotografowanym wariancie; te pięć rekordów nie otrzymuje znacznika elementu. Pozostałe 1908 pozycji jest dostępnych w wyszukiwarce i jako zbliżenie z kwadratem `UNVERIFIED` przewidywanej okolicy, bez sugerowania dokładnego pada pomiarowego.
- `FT2R8` i `U2T1` odnaleziono po nadrukach na BOTTOM, a `U1F1` i złącze `J9A1` na TOP. Na TOP potwierdzono także `U5B2` i dławiki `L6F1`, `L6C1`, `L7C1`, `L8F2`, `L3F1`. Rail `V_1P8` otwiera teraz bezpośredni kadr `FT2R8`. `R2T7`/`R2T8`, `U5C1` oraz `L8D1` są opisane jako nieobsadzone footprinty na użytych zdjęciach; CPUCORE prowadzi do obsadzonych `L8E1 / L8F1`. Obsadzony `U6T2` ma ostrzeżenie o sprzeczności ze schematem `EMPTY`.
- Pięć szczegółowych profili kodów Jaspera (`0001`, `0002`, `0031`, `0032`, `0033`) wskazuje teraz wyłącznie fizyczne obszary elementów rozpoznanych na właściwej stronie zdjęcia. Test pilnuje tego powiązania; nie jest to certyfikacja dokładnych pinów lub padów sondy.
- Uporządkowano źródła czterech zdjęć i dwa sprzeczne oznaczenia licencji w `SOURCES.md`, README i oknie „Źródła i licencje”. Warstwa diagnostyczna jest oddzielona od tła fotograficznego; znak autora na plikach zdjęciowych pozostaje.
- Poprawiono nieaktualne informacje o zdjęciu Jasper BOTTOM w dokumentacji. Test Jaspera sprawdza rozdział 39 obsadzonych lokalizacji, pięciu nieobsadzonych rekordów i 1908 kwadratów `UNVERIFIED`; test UI sprawdza cztery linki źródłowe i oba linki licencyjne.

Zmienione w tym pakiecie: `dist/assets/app.js`, `SOURCES.md`, `README.md`, `MASTER_WORKFLOW.md`, `docs/JASPER_PLACEMENT_INTAKE.md`, `tools/test-jasper-audit.mjs`, `tools/test-ui-contract.mjs`, `CHANGELOG.md`, ten raport. Pozostałe pliki aplikacji zawierają wcześniejsze, zachowane prace projektu.

## Status Jaspera / UNVERIFIED

Transformacje TOP i BOTTOM są oparte na ośmiu ręcznie wskazanych środkach układów na każdej fotografii. To potwierdza dopasowanie tych kotwic, **nie** wszystkie 1952 pozycje ani piny. Bez fizycznej płyty właściwej rewizji lub niezależnie sprawdzonych zdjęć o wystarczającej rozdzielczości nie można uczciwie zamknąć pełnej weryfikacji małych elementów. Pozycje spoza jawnych list przeglądu mają `UNVERIFIED` i obrys przybliżonej okolicy, nie dokładny cel na PCB.

Nadal `UNVERIFIED`: pozostałe drobne pozycje TOP i BOTTOM, obsadzenie innych małych footprintów względem fotografowanej rewizji, wartości elementów nieobecne w bazie rozmieszczenia, dokładne pady/piny pomiarowe. Jedenaście raili Jaspera i pięć profili kodów mają ścieżki diagnostyczne, ale karta raila lub etap startu nie stanowi dowodu położenia każdego wymienionego elementu na zdjęciu. Nie należy używać markera obszaru jako miejsca przyłożenia sondy.

## Zdjęcia zewnętrzne i prawa

Wszystkie cztery lokalne pliki `dist/assets/pcb-*.png` to zmniejszone kopie fotografii opisanych poniżej. Strony ConsoleMods wskazują jft / retro.jnftech.net oraz CC BY 4.0. Zachowany znak w lokalnych obrazach podaje CC BY-SA 4.0 International. **Dokładny status licencji każdego z czterech plików jest nierozstrzygnięty dla wydania.** Linki do obu licencji i pełny opis: `SOURCES.md`.

| Lokalny plik | Strona dokładnego zdjęcia | Źródło/autor | Strona pliku | Znak w obrazie |
| --- | --- | --- | --- | --- |
| `pcb-trinity-top.png` | https://consolemods.org/wiki/File:Xbox_360_Trinity_Top.png | ConsoleMods / jft | CC BY 4.0 | CC BY-SA 4.0 |
| `pcb-trinity-bottom.png` | https://consolemods.org/wiki/File:Xbox_360_Trinity_Bottom.png | ConsoleMods / jft | CC BY 4.0 | CC BY-SA 4.0 |
| `pcb-jasper-top.png` | https://consolemods.org/wiki/File:Xbox_360_Jasper_V1_Top.png | ConsoleMods / jft | CC BY 4.0 | CC BY-SA 4.0 |
| `pcb-jasper-bottom.png` | https://consolemods.org/wiki/File:Xbox_360_Jasper_V1_Bottom.png | ConsoleMods / jft | CC BY 4.0 | CC BY-SA 4.0 |

Nie usunięto ani nie przycięto plików w celu pozbycia się watermarków. Fotografie są wskazywane oddzielnie od danych markerów (`B[board].images` w `app.js`). Przyszła własna fotografia może zastąpić tło po ponownej rejestracji współrzędnych i weryfikacji markerów; podmiana samej ścieżki nie wystarczy.

## Testy i kontrola lokalna

Wszystkie **12/12** zestawów automatycznych przechodzą: baza kodów, profile komponentów, kontrakt UI, kalibracja Trinity, kadry zdjęć, Power/Boot, macierz nawigacji, bramka importu Jasper, ekstrakcja Jasper, intake BOTTOM, audyt Jasper, routing zbliżeń. `node --check dist/assets/app.js` i `git diff --check` również przechodzą.

Poprzednia kontrola w przeglądarce objęła PL/EN i Jasper TOP/BOTTOM: `FT1U1` BOTTOM oraz zoom działały, a `0002 → CPUCORE → L8E1 / L8F1` oraz Power/Boot etap 05 → `FT1U1` prowadziły na właściwą stronę zdjęcia. W bieżącej kontroli `C7T33` na BOTTOM pokazał kwadrat, kropkę i `4.7UF` w PL/EN, `C1A2` wartość nieznaną, `R2T7` brak znacznika obsadzonego elementu, a `U7D1` odrębny znacznik sprawdzonego układu. Automatyczna macierz nadal testuje istniejące przejścia, ale **nie** zastępuje pełnego audytu wizualnego każdego ekranu i każdej fizycznej pozycji elementu.

## Znane problemy / warunki przed publikacją

1. Wyjaśnić rozbieżność CC BY 4.0 / CC BY-SA 4.0 z uprawnionym źródłem albo zastąpić zdjęcia materiałem o potwierdzonych prawach i ponownie sprawdzić rejestrację.
2. Dokończyć niezależny przegląd pozostałych małych elementów Jaspera na właściwej rewizji płyty. `FT2R8` jest odnaleziony na zdjęciu, lecz sam marker nie potwierdza dokładnego pada sondy.
3. Wykonać zewnętrzny audyt funkcjonalny/UI/UX na paczce oraz zatwierdzić zakres zmian. Kody i progi bez źródła nadal pozostają `UNKNOWN`; Corona/Winchester i rozszerzone XSS/UEM nie należą do tego wydania.
4. Publikacja wymaga osobnej decyzji użytkownika. Ta paczka jest wyłącznie do przekazania audytorowi, z informacją o nierozstrzygniętych prawach do fotografii.

Uruchomienie: otworzyć `dist/index.html` albo udostępnić katalog `dist` przez lokalny serwer HTTP. Testy: uruchomić dwanaście plików `tools/test-*.mjs` wymienionych powyżej w Node.js. Źródłowych PDF/CAD/BRD nie ma w ZIP; są wejściami projektu, nie składnikiem aplikacji.
