# MODI Console Maps — MASTER WORKFLOW

Status dokumentu: aktywny plan audytu i wdrożenia  
Ostatnia aktualizacja: 2026-09-25  
Bieżąca faza: **JASPER / FAT — ODCZYT BRD I NAKŁADKA TOP, KONTROLA WIZUALNA W TOKU**  
Publikacja: **WSTRZYMANA do wspólnej akceptacji**

## 1. Zasady prowadzenia projektu

1. Rozwijamy istniejący projekt. Nie powstaje drugi interfejs ani równoległa baza danych.
2. Głównym miejscem pracy jest fotografia PCB. Kod błędu, objaw, rail, etap startu i element mają prowadzić do tego samego widoku PCB z zachowanym kontekstem diagnostycznym.
3. Najpierw kończymy Trinity/Slim, później wykonujemy osobny audyt Jasper/FAT.
4. Dane niepotwierdzone pozostają `UNKNOWN`. Nie dopisujemy diagnoz, wartości ani źródeł na podstawie domysłu.
5. Poziomy pewności planowanych danych: `CONFIRMED`, `COMMUNITY CONFIRMED`, `LIKELY`, `UNVERIFIED`.
6. Informacje prawne i atrybucje pozostają poza głównym przepływem diagnostycznym.
7. Po każdej większej zmianie aktualizujemy ten dokument i dopisujemy wynik testu.

## 2. Mapa istniejącego projektu

### Publiczna aplikacja

- `dist/index.html` — struktura pojedynczej aplikacji: Start, Error Code, Board Map, Power / Boot, Reference, dialogi prawne i credits.
- `dist/assets/styles.css` — cały system wizualny i układ responsywny.
- `dist/assets/app.js` — modele płyt, regiony, raile, kody, sekwencja startowa, objawy, nawigacja i renderowanie UI.
- `dist/assets/rol-module.js` — niezależny komponent interaktywnego pierścienia G1–G4.
- `dist/assets/trinity-components.js` — wygenerowana baza 1958 elementów Trinity.
- `dist/assets/jasper-components.js` — wygenerowana baza 1952 położeń Jasper V1; na zdjęciu TOP widać elementy z tej strony, a na BOTTOM tylko 15 wzrokowo sprawdzonych układów i punktów.
- `dist/assets/pcb-trinity-top.png` — zdjęcie górnej strony Trinity.
- `dist/assets/pcb-trinity-bottom.png` — zdjęcie dolnej strony Trinity.
- `dist/assets/pcb-jasper-top.png` — zdjęcie górnej strony Jasper.
- `dist/assets/pcb-jasper-bottom.png` — zdjęcie dolnej strony Jasper V1 w lokalnym UI; zakres adnotacji BOTTOM pozostaje ograniczony.

### Narzędzia danych

- `tools/build-trinity-components.mjs` — import elementów i współrzędnych z GENCAD; obecnie nie publikuje pełnych sieci i pinów.
- `tools/compare-trinity-sources.mjs` — porównanie listy elementów, stron i współrzędnych między źródłami.
- `tools/extract-jasper-placement.mjs` i `tools/build-jasper-components.mjs` — odczyt położeń z hash-locked Jasper V1 BRD, walidacja oraz osobne dopasowanie zdjęć TOP/BOTTOM.

### Dokumentacja

- `README.md`, `ARCHITECTURE.md`, `CHANGELOG.md`, `SOURCES.md` — dokumentacja główna.
- `docs/DATA-MODEL.md` — kontrakty encji planowanej architektury danych.
- `docs/JASPER_BOTTOM_INTAKE.md` — źródło, hash, osiem landmarków BOTTOM i warunki włączenia zdjęcia do UI.
- `Xbox-360/Trinity/*/README.md` — notatki rewizji dla mapy, napięć, sekwencji, kodów, układów i źródeł.

### Stan modeli

| Model | Publiczny UI | Fotografie | Baza elementów | Diagnostyka | Stan prac |
|---|---:|---:|---:|---:|---|
| Trinity / Xbox 360 S | tak | góra + dół | 1958 elementów | kuratorowana | Faza 3 zamknięta |
| Jasper V1 / Xbox 360 FAT | tak, lokalnie | góra + ograniczony dół | 1952 położenia; 799 TOP i 15 sprawdzonych BOTTOM w nakładce, wartości UNKNOWN | 11 raili, 5 profili kodów, 10 etapów | Faza 4: dalsza kontrola drobnych punktów w toku |
| Corona / Winchester | tylko nieaktywne kafle | brak | brak | brak | poza zakresem pierwszego wydania |

## 3. Obecny przepływ aplikacji

```text
Start
├── Error Code
│   ├── interaktywny wzór G1–G4
│   └── cztery odczyty kodu dodatkowego → wynik → szeroki region PCB
├── Board Map
│   ├── mapa regionów → zbliżenie fotografii
│   └── wyszukiwarka elementów → jeden marker na fotografii
├── Power / Boot
│   ├── objaw → prowadzona ścieżka TAK/NIE → konkretny punkt PCB z pełnym kontekstem
│   └── 10 etapów zasilania/startu → szczegóły → właściwy obszar PCB
└── Reference
    ├── rail → szeroki region PCB
    ├── lista kodów → powrót do dekodera
    └── lista układów → szeroki region PCB
```

Docelowo wszystkie gałęzie kończą się tak:

```text
wejście diagnostyczne
→ wspólny kontekst (dlaczego / co / kiedy / wartość / następny krok)
→ dokładny widok PCB
→ aktywny rail, elementy i punkty pomiarowe
→ zachowany powrót do poprzedniego kroku
```

## 4. Audyt Trinity / Slim — stan potwierdzony

### 4.1 Co już działa prawidłowo

- Jeden spójny wizualnie, responsywny interfejs bez widocznych statusów importu i innych śladów developerskich.
- Przełącznik PL / EN działa dla większości głównych etykiet.
- Autorski Ring of Light używa czterech łuków, nie kropek: G1 lewy górny, G2 prawy górny, G3 lewy dolny, G4 prawy dolny.
- Segmenty są obsługiwane myszą i klawiaturą, a panel wzoru aktualizuje się dynamicznie.
- Cztery odczyty przyjmują cyfry 0–3 i poprawnie komunikują regułę `4 segmenty = 0`.
- Kod nieobecny w bazie zwraca `UNKNOWN`; aplikacja nie generuje fikcyjnej diagnozy.
- Mapa posiada osobne strony TOP/BOTTOM dla Trinity, wybór regionów, maksymalnie trzy logiczne zbliżenia na region, powiększanie rolką oraz przeciąganie.
- Najważniejsze etykiety regionów są nanoszone na fotografię, nie tylko do tabeli obok.
- Wyszukiwarka elementów działa dla Trinity. Źródło zawiera 1958 elementów: 956 TOP i 1002 BOTTOM; 1380 rekordów ma wartość źródłową, 578 pozostaje nieznanych.
- Współrzędne elementów są porównane między GENCAD i Allegro. Jest to kontrola danych CAD, nie dowód poprawnego nałożenia na fotografię.
- Główne wartości napięć w aplikacji są zgodne z dostarczonym schematem Trinity:
  - `V_5P0 = 5.09 V` — strona 47,
  - `V_3P3 = 3.3 V` — strona 48,
  - `V_CPUEDRAM = 1.075 V` — strona 49,
  - `V_MEM = 1.8 V` — strona 50,
  - `V_CPUVCS = 1.25–1.3 V` — strona 51,
  - `V_CPUCORE = 0.9–1.2 V` — strona 45,
  - `V_3P3STBY = 3.315 V`, `V_1P8STBY = 1.802 V` — strona 53,
  - architektura zasilania i zależności raili — strona 63.
- Obecny punkt `V_5P0STBY` na `L6A1 pin 1` jest zgodny z wejściem filtra pokazanym na stronie 53.
- Credits dla Modyfikator89 / Modyfikator Kacper i Lewy2041 są obecne.

### 4.2 Problemy krytyczne — P0

| ID | Problem | Dowód / skutek | Plan naprawy |
|---|---|---|---|
| S-P0-01 | Brak wspólnego kontekstu diagnostycznego na PCB | Kod, rail, etap i objaw wybierają tylko szeroki region. Po przewinięciu użytkownik nie widzi, dlaczego tu trafił, co mierzyć ani co dalej. | Dodać jeden obiekt `diagnosticContext` oraz panel na Board Map. Wszystkie ścieżki zapisują typ wejścia, identyfikator, punkt, oczekiwaną wartość, warunek pomiaru, aktywny rail i następny krok. |
| S-P0-02 | Kliknięcie raila nie pokazuje drogi raila | Karta otwiera pierwszy widok regionu. Brak source → regulator → dławik/test point → branch/load. | Dodać encję trasy raila i warstwę SVG na tej samej fotografii. Pokaż źródło, sterowanie, wyjście i odbiorniki; bez udawania ścieżek, których nie potwierdzono. |
| S-P0-03 | Pozycje markerów na fotografii były tylko przybliżone — **ZAMKNIĘTE W PAKIECIE 5** | Osobne transformacje afiniczne TOP/BOTTOM dopasowano do ośmiu widocznych punktów montażowych. TOP: RMS 2.38 px, MAX 3.05 px; BOTTOM: RMS 4.28 px, MAX 7.88 px. Rekord `R1` TOP leży poza obrysem fotografowanej płyty już we współrzędnych źródłowych i jest jawnie opisany jako outlier. | Zachować automatyczny test landmarków i publiczne zastrzeżenie: dopasowanie mechaniczne nie dowodzi identyczności każdej pozycji między układem XDK-derived a płytą retail. |
| S-P0-04 | Brak jednoznacznego pełnego widoku płyty | `Reset` wraca do bazowego zbliżenia aktualnego regionu, nie do całej płyty. | Rozdzielić `Reset zbliżenia` i `Pokaż całą płytę`; dodać łatwy powrót z kontekstem. |
| S-P0-05 | Moduł PSU nie rozróżnia czterech stanów LED | Pierwsze pytanie brzmi tylko „czy dioda świeci stabilnie?”. Zielony, pomarańczowy, czerwony i brak światła prowadzą do różnych testów. | Dodać neutralne grafiki i cztery wybory: GREEN / ORANGE / RED / NO LIGHT, opis znaczenia, pierwszy pomiar i przejście do PCB. |

### 4.3 Problemy wysokiego priorytetu — P1

| ID | Problem | Dowód / skutek | Plan naprawy |
|---|---|---|---|
| S-P1-01 | Dwa sąsiadujące moduły wyglądają jak dwa dekodery | Interaktywny wzór G1–G4 i cztery odczyty są pokazane jeden pod drugim bez mocnego rozdzielenia celu. | Zachować oba, ale nazwać je „Wzór czerwonych segmentów” i „Kod dodatkowy”; dodać wyjaśnienie relacji. |
| S-P1-02 | Cztery odczyty nie są prowadzone krok po kroku | Wszystkie cztery karty są widoczne naraz. Brak `Krok 1/4`, `Dalej`, `Wstecz`, stanu ukończenia. | Zmienić na prosty wizard bez usuwania ręcznego pola kodu. |
| S-P1-03 | Zmiana języka kasuje rozpoczęty kod | Test przeglądarkowy: ustawienie READ 1 na `1` tworzy `1000`, przełączenie EN → PL przywraca `0000`. | Przenieść cztery odczyty do trwałego stanu aplikacji i nie odbudowywać ich z wartości domyślnych. |
| S-P1-04 | Brak instrukcji pozyskania kodu dodatkowego | Jedyny skrót „SYNC + EJECT” pojawia się dopiero w objawie czerwonego błędu, nie przy dekoderze. | Dodać dwujęzyczną instrukcję przed wizardem, z ostrzeżeniem o czterech kolejnych odczytach i mapą `4→0`. |
| S-P1-05 | Baza kodów była bardzo niepełna — **ZAMKNIĘTE W PAKIECIE 6 DLA ZESTAWU SMC** | Zestaw Trinity obejmuje teraz 15 zweryfikowanych społecznościowo kodów SMC: `0001–0003`, `0010–0013`, `0020–0023`, `0030–0033`. Każdy ma poziom pewności, przyczyny, rail/sygnał, elementy i kolejność sprawdzeń. | Kody spoza kuratorowanego zestawu pozostają `UNKNOWN`. Ewentualne kody rozszerzone XSS/UEM wymagają osobnego pakietu źródłowego. |
| S-P1-06 | Kliknięcie kodu z listy nie prowadziło do PCB — **ZAMKNIĘTE W PAKIECIE 6** | Lista i wynik kodu otwierają główny krok na PCB, zachowując kod, warunek, punkt, oczekiwaną wartość, elementy oraz powrót. | Utrzymywać wspólny `diagnosticContext` przy kolejnych wpisach. |
| S-P1-07 | Wynik kodu był zbyt płytki — **ZAMKNIĘTE W PAKIECIE 6** | Wynik pokazuje confidence, podstawę danych, możliwe przyczyny, rail/sygnał, elementy, primary/secondary areas i numerowaną kolejność pomiarów. | Nie dodawać progu lub wartości bez potwierdzenia; używać `UNKNOWN`. |
| S-P1-08 | Szybkie pomiary są skrótową listą, nie procedurą | Karty mają nazwę, wartość, źródło i punkt, ale brak warunku, miejsca masy, interpretacji braku/złego napięcia i kolejnego kroku. | Rozszerzyć model measurement oraz panel PCB. |
| S-P1-09 | Sekwencja była ogólna i częściowo myląca — **ZAMKNIĘTE W PAKIECIE 7** | Dziesięć etapów Trinity ma teraz warunki, punkty, wartości, elementy i działanie po błędzie. Dashboard jest jawnie efektem końcowym, nie punktem pomiarowym. | Utrzymywać rozdzielenie pomiarów elektrycznych, sygnałów z `UNKNOWN` i końcowego wyniku startu. |
| S-P1-10 | Ścieżki objawów miały nierówną głębokość — **ZAMKNIĘTE W PAKIECIE 7** | Dead/pulse/off mają po 6 kroków, red ma 3. Każdy krok prowadzi do PCB z pełnym kontekstem. | Rozszerzać wyłącznie o potwierdzone warunki i punkty; nie przenosić procedury między rewizjami. |
| S-P1-11 | Profil elementu nie był serwisowy — **ZAMKNIĘTE W PAKIECIE 8** | Dziesięć kluczowych elementów Trinity ma teraz funkcję, stan pracy, rail główny, powiązane elementy, objawy, przepływ funkcjonalny, sygnały/piny i uporządkowane pomiary. | Pełny pinout jest deklarowany tylko dla zweryfikowanego podzbioru; pozostałe interfejsy i progi pozostają `UNKNOWN`. Surowych 1958 rekordów nie opisujemy sztucznie. |

### 4.4 Problemy średnie — P2

| ID | Problem | Dowód / skutek | Plan naprawy |
|---|---|---|---|
| S-P2-01 | PL/EN nie obejmowało całości — **ZAMKNIĘTE W PAKIECIE 9** | Słownik obejmuje teraz statyczne i dynamiczne etykiety, aria-labels, nazwy zbliżeń, opisy układów, tytuł i meta description. Usunięto `localizedNote()`. | Utrzymywać parytet kluczy automatycznym testem UI. |
| S-P2-02 | Zbyt drobna typografia pomocnicza — **ZAMKNIĘTE W PAKIECIE 9** | Podniesiono rozmiary zwykłych etykiet, opisów, tabel, profili i przycisków; zachowano mniejszą skalę tylko dla metadanych. | Kontrolować czytelność przy nowych modułach i szerokości mobilnej. |
| S-P2-03 | Karty raili nie były kontrolkami klawiaturowymi — **ZAMKNIĘTE WCZEŚNIEJ, POTWIERDZONE W PAKIECIE 9** | Raile, kody, układy i wybory są przyciskami; aktywne stany mają `aria-pressed` lub `aria-selected`. | Utrzymywać jeden wzorzec semantycznych kontrolek. |
| S-P2-04 | Zmiana modelu mogła zachować część starego stanu — **ZAMKNIĘTE W PAKIECIE 9** | Zmiana rewizji resetuje stronę, region, zoom/pan, profil, kontekst, objaw, krok diagnozy, etap sekwencji, rail i stan PSU; kod dodatkowy pozostaje zachowany celowo. | Testować reset przy każdej nowej rewizji. |
| S-P2-05 | Region z wieloma oznaczeniami kotwiczy tylko pierwszy element | Parser `findComponent()` bierze pierwszy pasujący ref. | Dodać listę anchorów lub jawny `focusRef` dla regionu/widoku. |
| S-P2-06 | Brak automatycznych testów regresji — **ZAMKNIĘTE W PAKIECIE 10** | Działa zestaw testów danych, `tools/test-ui-contract.mjs` oraz `tools/test-navigation-matrix.mjs`, obejmujący regiony, raile, kody, sekwencję, objawy, PSU, profile, cele powrotu i zasoby PCB. | Utrzymywać oba testy przy każdej zmianie danych lub nawigacji. |

### 4.5 Granice wiarygodności danych

- Schemat PDF potwierdza wartości i zależności logiczne wymienionych raili.
- Porównanie GENCAD ↔ Allegro potwierdza zgodność współrzędnych źródłowych elementów.
- Transformacje CAD → fotografia retail są skalibrowane osobno dla TOP/BOTTOM na ośmiu widocznych punktach montażowych i objęte testem regresji błędu dopasowania.
- Kalibracja mechanicznych landmarków nie potwierdza sama w sobie identyczności każdego elementu między układem XDK-derived i płytą retail; to ograniczenie jest pokazane także w UI.
- Fotografia i dostarczony BoardView dotyczą bardzo podobnych, ale niekoniecznie identycznych wariantów płyty. Każdy marker wymaga kontroli względem widocznego nadruku/landmarków.
- Pole `function` w obecnie generowanej bazie komponentów jest technicznym typem ze źródła, nie zweryfikowanym opisem funkcji serwisowej.
- Obecna publiczna baza nie przechowuje relacji net/pin dla wszystkich elementów, mimo że źródła CAD zawierają bogatsze dane.

### 4.6 Osobny audyt Jasper / FAT — pierwszy pakiet

- Schemat Jaspera potwierdza osobne kontrolery: CPUCORE `U8U1` (ADP3190A), GPUCORE `U8N1` (NCP5331), V_5P0/V_MEM `U4V1` (ADP1823) oraz V_CPUVCS `U7U2` (IR3638). Poprawiono wcześniej błędnie przypisane CPU/GPU, Southbridge, HANA i NAND.
- Zidentyfikowano 11 raili Jaspera, w tym standby na `FT8N1`, `FT5N1`, `FT5N2`, CPUCORE `1.05 V` na obsadzonych na zdjęciu `L8E1/L8F1` (`L8D1` jest pustym footprintem), GPUCORE `1.15 V` na `L6C1/L7C1` i V_MEM `1.8 V` na `L3F1/FT2U1`. Wartość V_CPUVCS zależy od `CPU_SRVID` i nie jest zastąpiona zgadywanym progiem.
- Mapa ma 9 regionów, 1–3 zbliżenia na region, oznaczenia na zdjęciu, a Jasper ma własne ścieżki objawów `6/6/6/3` i dziesięcioetapową ścieżkę startową. Pięć kodów (`0001`, `0002`, `0031`, `0032`, `0033`) ma bezpośrednie profile pomiarowe Jaspera; pozostałe obecne w ogólnej bazie zachowują tylko potwierdzony opis kodu bez dopisywania szczegółowego profilu.
- Binarny Jasper V1 `.brd` został odczytany z kontrolą SHA-256: 1952 położenia i strony elementów. Po osiem widocznych układów posłużyło do osobnego dopasowania zdjęć TOP (RMS 5,8 px) i BOTTOM (RMS 6,9 px). W UI BOTTOM dostępnych jest tylko 15 wizualnie sprawdzonych układów i punktów w sześciu sekcjach; pozostałe pozycje BRD nie są przedstawiane jako potwierdzone na zdjęciu. Baza nie zawiera wartości elementów; dokładne pozycje pinów pozostają otwarte. Elementów BOTTOM nie oznaczamy na zdjęciu TOP i odwrotnie.
- Zdjęcia Jasper V1 Top/Bottom są przypisane na stronach źródłowych ConsoleMods do `jft`; strony podają CC BY 4.0, ale widoczny znak autora na obrazach podaje CC BY-SA 4.0. Rozbieżność odnotowano w aplikacji i `SOURCES.md`; musi być wyjaśniona przed publikacją.

## 5. Kolejność wdrożenia

### Faza 0 — mapa projektu

- [x] Spis plików i ekranów.
- [x] Identyfikacja źródeł danych i generatorów.
- [x] Ustalenie zależności między modułami.

### Faza 1 — pełny audyt Trinity / Slim

- [x] Audyt statyczny HTML/CSS/JS.
- [x] Audyt danych Trinity i dokumentacji rewizji.
- [x] Kontrola napięć względem schematu stron 45–53 i 63.
- [x] Kontrola przeglądarkowa PL/EN, dekodera, mapy, komponentów, Power/Boot i Reference.
- [x] Lista problemów P0/P1/P2.

### Faza 2 — poprawki Trinity / Slim

- [x] 2.1 Wspólny `diagnosticContext` i panel kontekstu na PCB.
- [x] 2.2 Jedna nawigacja do PCB dla kodu, raila, pomiaru, objawu, etapu i elementu — pierwsza wersja działa i zachowuje dwujęzyczny kontekst.
- [x] 2.3 `Pokaż całą płytę`, `Reset zbliżenia` oraz powrót z kontekstu PCB do źródłowego kroku.
- [x] 2.4 Trasy raili oraz szczegółowe karty pomiarowe — logiczne trasy diagnostyczne Trinity, warunki, źródła, punkty, obciążenia i następne sprawdzenia; bez deklarowania przebiegu miedzi.
- [x] 2.5 Kalibracja TOP/BOTTOM i test landmarków — osobne transformacje afiniczne, właściwe proporcje zdjęć, osiem punktów kontrolnych na stronę i jawny status dokładności.
- [x] 2.6 Moduł czterech stanów diody PSU.
- [x] 2.7 Wizard kodu dodatkowego + instrukcja + trwały stan.
- [x] 2.8 Rozszerzony wynik kodu i sprawdzona baza kodów — 15 kodów SMC Trinity, dwujęzyczne przyczyny i kroki, confidence oraz bezpośrednie przejścia do PCB.
- [x] 2.9 Rozbudowa ścieżek Power/Boot i sekwencji startowej — 21 kroków objawów, 10 etapów Trinity, pełny kontekst i test danych.
- [x] 2.10 Rozszerzone profile kluczowych elementów — 10 profili Trinity, nawigacja profil → PCB / rail / Power-Boot, pinout tylko w zweryfikowanym zakresie i test integralności danych.
- [x] 2.11 Pełna korekta PL/EN i dostępności — jawne etykiety pól, focus, reduced motion, klawiaturowy pan/zoom PCB, semantyka stanów, czytelniejsza typografia, reset rewizji i test kontraktu UI.

### Faza 3 — testy Trinity / Slim

- [x] Nawigacja: każde wejście kończy się na właściwym PCB z kontekstem.
- [x] Zoom/pan/reset/full-board TOP i BOTTOM.
- [x] Wszystkie raile i trasy; wartości, warunki i punkty.
- [x] Dekoder: 0–3, `4→0`, wizard, ręczne pole, `UNKNOWN`, zmiana języka bez utraty stanu oraz szczegółowe wyniki zestawu SMC.
- [x] Objawy i cztery stany PSU.
- [x] Sekwencja startowa i powroty.
- [x] Wyszukiwanie/filtry elementów i błędów.
- [x] Profile serwisowe: wybór, PL/EN, punkty PCB, główny rail i `UNKNOWN` dla niepotwierdzonych danych.
- [x] PL/EN, klawiatura, focus, czytelność desktop/mobile.
- [x] Brak błędów konsoli i brak brakujących zasobów.

### Faza 4 — Jasper / FAT

- [x] Rozpocząć dopiero po pełnym zaliczeniu Fazy 3.
- [x] Osobny audyt schematu, zdjęcia, raili, kodów i przepływów; wstępna kontrola nazw elementów/sieci w binarnym BRD.
- [x] Osobne poprawki danych i własny test regresji `tools/test-jasper-audit.mjs`.
- [x] Rozpoznano ograniczenie lokalnego Free Physical Viewer i dodano walidator raportu położeń `tools/validate-jasper-placement.mjs` wraz z testem i instrukcją `docs/JASPER_PLACEMENT_INTAKE.md`; bez deklarowania kalibracji.
- [x] Audyt widoczności zbliżeń Jaspera: HANA nie nakłada się już z sekcją standby, wszystkie etykiety są w kadrze desktop/mobile, wybór sekcji działa także z panelu, a rail/kod wybierają właściwy logiczny widok. Dawne przybliżone znaczniki TOP zastąpiono później pozycjami z BRD.
- [x] Usunięto kolizje ramek podpisów bez przesuwania kropek wskazujących położenie; poprawiono też kadry Trinity TOP/BOTTOM i oznaczono projekcję elementów TOP na zdjęciu BOTTOM.
- [x] Przejścia rail/kod/etap/karta IC wybierają logiczne zbliżenie według designatora punktu; wiele kadrów i brak osobnej etykiety są komunikowane w PL/EN. Matryca 96 tras ma test regresji.
- [x] Ujednolicono znaczniki i logiczne trasy raili dla wieloelementowych sekcji Trinity; RAM ma dwa kadry czterech potwierdzonych kości TOP, regulatory standby są osobno podpisane, a karta dwóch układów nie podszywa się pod profil jednego.
- [x] Zachowano wybór elementu i pełny widok płyty przy zmianie PL/EN; panel wybranego elementu nie sugeruje starej sekcji, a przejście TOP/BOTTOM odświeża znaczniki. Sprawdzono U7T1, U5A1 i powrót do RAM w przeglądarce.
- [x] Wydobyć pełne współrzędne z właściwego BRD Jasper V1, sprawdzić strony TOP/BOTTOM i dopasować markery TOP do ośmiu widocznych układów na fotografii.
- [ ] Powtórzyć wizualną kontrolę wszystkich 9 obszarów oraz zatwierdzić zakres Jasper/FAT do wydania.

### Faza 5 — architektura danych

- [ ] Rozpocząć dopiero po ukończeniu i testach Trinity oraz Jasper.
- [ ] Przenieść dane z `app.js` do lokalnych plików rewizji bez tworzenia drugiej bazy.
- [ ] Znormalizować: `console_revision`, `region`, `rail`, `measurement_point`, `component`, `error_code`, `diagnostic_step`, `source`, `confidence`.
- [ ] Zachować jeden adapter renderujący obecny interfejs.

## 6. Test bazowy wykonany podczas audytu

| Test | Wynik |
|---|---|
| Strona lokalna otwiera się i wszystkie główne sekcje istnieją | PASS |
| Ring G1–G4 ma prawidłową kolejność i role interaktywne | PASS |
| Nieznany kod `1000` pokazuje `UNKNOWN` | PASS |
| Zmiana języka po ustawieniu odczytów zachowuje kod | PASS — sprawdzono pełny `0001` EN→PL |
| PL/EN obejmuje wszystkie widoczne teksty | PASS — statyczne i dynamiczne etykiety, aria-labels, title/meta oraz zbliżenia PCB sprawdzone w obu językach |
| Board Map ma zoom i pan | PASS |
| Board Map ma osobny pełny widok i reset lokalny | PASS |
| Rail prowadzi do logicznej trasy diagnostycznej i pełnego kontekstu | PASS — sprawdzono V_5P0STBY, V_3P3STBY i V_CPUCORE w PL/EN |
| PSU rozróżnia GREEN/ORANGE/RED/NO LIGHT | PASS — każdy stan ma opis, pierwszy krok i przejście do PCB |
| Cztery ścieżki objawów mają pełne warunki i przejścia do PCB | PASS — dead 6, pulse 6, off 6, red 3 |
| Sekwencja Trinity ma 10 etapów, wartości i `UNKNOWN` dla sygnałów | PASS — Dashboard jest wynikiem, nie punktem pomiarowym |
| Napięcia Trinity zgadzają się ze schematem | PASS dla wymienionych raili |
| Pozycje elementów na fotografii są zweryfikowane landmarkami | PASS — 8 punktów/stronę; TOP RMS 2.38 px, MAX 3.05 px; BOTTOM RMS 4.28 px, MAX 7.88 px; `R1` TOP jawnie poza obrysem źródłowym |
| Kluczowe elementy mają profile serwisowe bez zgadywania pełnego pinoutu | PASS — 10 profili Trinity, 46 jawnych zabezpieczeń `UNKNOWN` |

## 7. DONE / VERIFIED / OPEN ISSUES / NEXT

### DONE

- Utworzono mapę całego istniejącego projektu.
- Zakończono audyt Trinity/Slim bez przebudowy kodu.
- Zapisano priorytety, kolejność prac i kryteria testów.
- Dodano wspólny panel kontekstu PCB dla raila, kodu, objawu/pomiaru, etapu sekwencji, układu i wyszukanego elementu.
- Dodano osobne akcje `Pokaż całą płytę` i `Reset zbliżenia`.
- Karty raili, kodów i układów są teraz semantycznymi przyciskami obsługiwanymi klawiaturą.
- Zastąpiono cztery jednoczesne karty czytelnym wizardem `Krok 1/4` z trwałym stanem, mapowaniem `4→0` i ręcznym polem kodu.
- Dodano dwujęzyczną instrukcję `SYNC + EJECT` oraz powrót z panelu kontekstu PCB do źródłowego kroku.
- Dodano neutralny, dwujęzyczny moduł stanów diody zasilacza: ORANGE, GREEN, RED i NO LIGHT, z bezpiecznym pierwszym krokiem oraz punktem PCB właściwym dla rewizji.
- Dodano dla wszystkich raili Trinity szczegółowe karty: warunek pomiaru, źródło, punkt, wartość, zasilane obciążenia i postępowanie przy braku napięcia.
- Dodano numerowaną warstwę SVG pokazującą kolejność obszarów raila na tej samej fotografii PCB oraz jednoznaczne zastrzeżenie, że jest to trasa diagnostyczna, a nie przebieg miedzi.
- Skalibrowano osobno nakładki Trinity TOP i BOTTOM do ośmiu widocznych punktów montażowych, poprawiono proporcje kontenera zdjęcia i dodano dwujęzyczny status dokładności bezpośrednio w Board Map.
- Dodano automatyczny test regresji kalibracji, błędu dopasowania i liczby elementów mieszczących się w fotografii.
- Dodano kuratorowany zestaw 15 kodów SMC Trinity z poziomem `COMMUNITY CONFIRMED`, dwujęzycznymi przyczynami, railami/sygnałami, kluczowymi elementami i numerowaną kolejnością sprawdzeń.
- Każdy krok kodu może otworzyć właściwy obszar PCB z warunkiem pomiaru, oczekiwaną wartością i kolejnym działaniem; brak potwierdzonej wartości pozostaje `UNKNOWN`.
- Poprawiono responsywny układ dekodera i miniatur Ring of Light, eliminując poziome przepełnienie przy węższym oknie desktopowym.
- Rozbudowano cztery ścieżki Power/Boot do 21 uporządkowanych kroków z warunkiem, źródłem, punktem, wynikiem i działaniem po odpowiedzi `NIE`.
- Zastąpiono ogólne kafle sekwencji dziesięcioma etapami Trinity z panelem szczegółów i bezpośrednim przejściem do PCB; Dashboard jest opisany jako efekt poprzednich etapów.
- Dodano test `tools/test-power-boot.mjs`, który pilnuje liczby etapów, kompletności pól, zweryfikowanych napięć i obecności `UNKNOWN` dla niepotwierdzonych sygnałów.
- Dodano 10 kuratorowanych profili serwisowych Trinity: J7A1, U5A1, U5B1, U3D1, U1E2, U3B2, U1E1, U7C1, L6C2 i U5E1.
- Profile łączą rolę układu, stan pracy, główny rail, objawy, przepływ funkcjonalny, powiązane elementy, sygnały/piny i numerowaną kolejność pomiarów z bezpośrednimi przejściami do PCB, Reference oraz Power/Boot.
- Dodano test `tools/test-component-profiles.mjs`; pełne pinouty BGA i niepotwierdzone poziomy pozostają jawnie `UNKNOWN`.
- Domknięto korektę PL/EN dla treści statycznych i dynamicznych, nazw zbliżeń PCB, opisów układów, stanów pracy, etykiet dostępności, tytułu i meta description.
- Dodano jawne etykiety wyszukiwarek, `aria-pressed` / `aria-selected`, globalny focus, obsługę `prefers-reduced-motion` oraz klawiaturowy pan/zoom fotografii PCB.
- Podniesiono czytelność typografii i kontrolek, usunięto mobilne przepełnienie dokumentu oraz dodano spójny reset stanu po zmianie rewizji.
- Dodano `tools/test-ui-contract.mjs` sprawdzający parytet PL/EN, unikalność ID, cele nawigacji, etykiety formularzy, zasoby, focus, reduced motion i sterowanie klawiaturą.
- Dodano `tools/test-navigation-matrix.mjs` sprawdzający pełną macierz Trinity: 8 regionów, 10 raili, 15 kodów SMC, 10 etapów startu, 4 stany PSU, 21 kroków objawowych, profile komponentów i wszystkie cele powrotu.
- Zamknięto Fazę 3 po automatycznej i przeglądarkowej regresji głównych ścieżek Trinity/Slim; Jasper może przejść do osobnego audytu bez kopiowania założeń Trinity.
- Rozpoczęto Fazę 4: skorygowano kluczowe designatory i kontrolery Jaspera, dodano osobne raile, sekwencję, ścieżki objawów, pięć profili kodów i test integralności bez deklarowania kalibracji fotografii.

### VERIFIED

- Zweryfikowano dane napięć na schemacie Trinity.
- Zweryfikowano działanie bieżącej wersji w lokalnej przeglądarce.
- Zweryfikowano poprawny układ Ring of Light i `UNKNOWN` dla brakującego kodu.
- Zweryfikowano zachowanie kompletnego kodu `0001` po zmianie EN→PL.
- Zweryfikowano w przeglądarce przejście `V_5P0STBY → Power input → L6A1 pin 1 → 5.0 V`.
- Zweryfikowano w przeglądarce przejście `0001 → ERROR_V_12P0 → Power input`.
- Zweryfikowano zmianę PL/EN aktywnego kontekstu oraz pełny widok płyty przy 100%.
- Zweryfikowano sekwencję wizardu `4→0, 4→0, 4→0, 1→1`, ręczne pole `3333 → UNKNOWN` oraz powrót `PCB → dekoder`.
- Zweryfikowano `RED → V_12P0 przy J7A1 przy odłączonym zasilaniu → Power input`, powrót do modułu PSU oraz pełne przełączenie kontekstu PL/EN.
- Zweryfikowano `V_3P3STBY → Standby VRM → Southbridge / SMC → NAND`, warunek standby, punkt L5A1 pin 2, wartość 3.315 V oraz powrót do karty.
- Zweryfikowano `V_CPUCORE → Main VRM → XCGPU`, punkt L6C2, zakres 0.9–1.2 V, obciążenie XCGPU i kontekst EN→PL.
- Zweryfikowano TOP: RMS 2.38 px, MAX 3.05 px, 955/956 elementów w obrysie; jedyny outlier `R1` jest poza obrysem w danych źródłowych.
- Zweryfikowano BOTTOM: RMS 4.28 px, MAX 7.88 px i 1002/1002 elementów w obrysie.
- Zweryfikowano w przeglądarce PL/EN, przełączanie TOP/BOTTOM, tryb pełnej płyty oraz wyszukanie `U5U2` i dynamiczny marker na zbliżeniu BOTTOM.
- Zweryfikowano szczegółowy wynik `0002 → ERROR_V_CPUCORE`, trzy kroki sprawdzeń oraz przejście do `Main VRM → L6C2 → V_CPUCORE 0.9–1.2 V` z pełnym kontekstem.
- Zweryfikowano nowy wpis `0030 → ERROR_NO_TEMPERATURES`, zachowanie `UNKNOWN` dla niepotwierdzonych poziomów sygnałów oraz pełny wynik PL/EN.
- Test danych potwierdza dokładnie 15 profili SMC, dwujęzyczne przyczyny i kroki oraz zachowanie `UNKNOWN` dla kodów spoza zestawu.
- Zweryfikowano w przeglądarce ścieżkę `Pulsująca dioda → NIE przy V_5P0STBY → L6A1 pin 1`, pełny kontekst i powrót.
- Zweryfikowano etap `08 Odczyt NAND → U1E2`, poprawny kontekst `FLSH_*`, zmianę PL/EN bez utraty wybranego kroku oraz brak poziomego przepełnienia i błędów konsoli.
- Zweryfikowano, że etap 10 pokazuje `EFEKT KOŃCOWY — NIE PUNKT POMIAROWY` i nie przypisuje braku dashboardu automatycznie do HANA.
- Zweryfikowano w przeglądarce `U1E2 → piny zasilania 18/19 → 3.315 V → PCB`, zmianę PL/EN bez utraty profilu i dwujęzyczny kontekst.
- Zweryfikowano `U7C1 → główny rail V_CPUCORE → FULL RUN → L6C2 → 0.9–1.2 V`, brak poziomego przepełnienia przy szerokości 799 px oraz widoczny status `SCHEMATIC VERIFIED`.
- Test danych potwierdza dokładnie 10 profili, zgodność designatorów z bazą 1958 elementów, kompletność PL/EN i 46 zabezpieczeń `UNKNOWN`.
- Zweryfikowano w przeglądarce pełne przełączenie PL/EN bez polskich treści w widoku EN, dwujęzyczne nazwy zbliżeń i układów oraz poprawne tytuły dokumentu.
- Zweryfikowano klawiaturowy pan strzałkami i zoom klawiszami `+` / `−`, widoczne instrukcje, poprawne stany ARIA i brak błędów konsoli.
- Zweryfikowano reset `FULL RUN + pulsing + GREEN` do `STANDBY + dead + ORANGE` po zmianie Trinity → Jasper.
- Zweryfikowano mobilny widok 390 × 844 bez poziomego przepełnienia dokumentu; szerokość testu przywrócono po kontroli.
- Wszystkie testy: UI contract, baza kodów, kalibracja TOP/BOTTOM, Power/Boot i profile komponentów — PASS.
- Pełna macierz danych potwierdza poprawne powiązania wszystkich 8 regionów, 10 raili, 15 kodów SMC, 10 etapów, 4 stanów PSU i ścieżek objawów 6/6/6/3.
- W przeglądarce sprawdzono wszystkie 15 kodów SMC, reprezentatywne raile każdego stanu pracy, etapy 01/06/08/10, cztery wejścia objawów, cztery stany PSU, filtry `U5E1` i `CPUCORE`, TOP/BOTTOM, `3333 → UNKNOWN`, odrzucenie `4444`, obsługę Ring of Light z klawiatury oraz przełączenie PL/EN.
- Końcowa kontrola przeglądarki nie wykazała ostrzeżeń ani błędów konsoli.
- Test `tools/test-jasper-audit.mjs` potwierdził 9 regionów, 11 raili, 5 profili kodów, 10 etapów i ścieżki objawów `6/6/6/3`; wszystkie dotychczasowe testy Trinity i UI nadal przechodzą.
- W przeglądarce Jasper ma widok TOP, nieaktywny BOTTOM oraz 799 wyszukiwalnych elementów TOP z oryginalnego BRD. Oznaczenia BOTTOM nie są nanoszone na TOP; widoki GPU/CPU, pamięci i VRM prowadzą do właściwych sekcji. PL/EN opisuje ograniczenia nakładki i brak dokładnych pozycji pinów.

### OPEN ISSUES

- Rozszerzone kody XSS/UEM nie są jeszcze kuratorowane; każdy taki brak nadal zwraca `UNKNOWN`.
- Jawny `focusRef` działa dla tras wielopunktowych; trzeba jeszcze objąć nim każdą przyszłą, nową trasę diagnostyczną.
- Jasper: transformacje TOP i BOTTOM opierają się każda na ośmiu ręcznie wskazanych środkach układów; nie dowodzą zgodności każdego małego elementu z fotografią retail. Dostępne jest zdjęcie BOTTOM z ograniczoną listą 16 sprawdzonych układów/punktów. Pozostałe pozycje oraz wartości elementów wymagają osobnej weryfikacji przed wydaniem.
- Jasper: zdjęcie wykazało nieobsadzony `L8D1`; ścieżka CPUCORE wskazuje już tylko `L8E1/L8F1`. Inne małe footprinty nadal wymagają ręcznej kontroli. Strony źródłowe zdjęć podają CC BY 4.0, a osadzony znak autora CC BY-SA 4.0 — wyjaśnić przed publikacją.
- Jasper: 8 kodów obecnych w ogólnej liście FAT nie ma jeszcze osobnego profilu kroków; rozszerzanie wymaga weryfikacji źródłowej, nie kopiowania profili Trinity.

### NEXT

Następny pakiet po audycie zewnętrznym: dalsza ręczna kontrola małych elementów w dziewięciu obszarach, oddzielny audyt dokładnych padów punktów pomiarowych (nadruk `FT2R8` jest już odnaleziony na zdjęciu) i wyjaśnienie licencji czterech zdjęć. Nie rozszerzać diagnoz ani wartości bez źródła. Publikacja nadal wymaga osobnej akceptacji.

## 8. Dziennik zmian workflow

- **2026-09-25 — FAT-PLACEMENT-02:** odczytano 1952 pozycji Jasper V1 BRD, zarejestrowano zdjęcie TOP na ośmiu dużych układach, dodano wyszukiwarkę 799 komponentów TOP i poprawiono położenia markerów. Wykluczono z nakładki TOP układy i punkty ze spodu, w tym U8U1/U8N1/U4V1 i FT. Testy parsera, audytu Jaspera, kadrów mobilnych oraz pozostała regresja przechodzą; ręczna kontrola małych elementów nadal trwa. Bez publikacji.
- **2026-09-25 — FAT-PHOTO-AUDIT-03:** kontrola zbliżenia wykazała pusty footprint L8D1; pomiary CPUCORE i wszystkie ścieżki prowadzą teraz do obsadzonych L8E1/L8F1. Dodano jawny `focusRef` do nawigacji wielopunktowej, widoczne wyróżnienie głównego oznaczenia i dwujęzyczną informację, że marker nie jest punktem sondy. Odnotowano konflikt CC BY/CC BY-SA między stronami źródłowymi a znakami na zdjęciach. Bez publikacji.
- **2026-09-25 — FAT-PLACEMENT-02:** odczytano 1952 pozycji Jasper V1 BRD, zarejestrowano zdjęcie TOP na ośmiu dużych układach, dodano wyszukiwarkę 799 komponentów TOP i poprawiono położenia markerów. Wykluczono z nakładki TOP układy i punkty ze spodu, w tym U8U1/U8N1/U4V1 i FT. Testy parsera, audytu Jaspera, kadrów mobilnych oraz pozostała regresja przechodzą; ręczna kontrola małych elementów nadal trwa. Bez publikacji.
- **2026-09-19 — MAP-FIX-03:** usunięto wejścia do pierwszego kadru zamiast faktycznego punktu (m.in. Trinity 5 V/3.3 V i eDRAM, Jasper 5 V i U4V1). Dobór widoku opiera się na designatorach w kroku pomiarowym; interfejs PL/EN wskazuje, kiedy krok wymaga kilku zbliżeń albo punkt nie ma osobnej etykiety. Dodano `test-closeup-routing.mjs` dla 96 tras, przeglądarkowo sprawdzono wybrane raile, etap startu, kartę IC i języki. Nie oznacza to kalibracji Jasper BRD→foto; bez publikacji.
- **2026-09-19 — MAP-FIX-02:** automatyczne rozmieszczanie podpisów przy stałych punktach PCB, korekta kadrów Trinity według skalibrowanych pozycji oraz osobne widoki XCGPU/eDRAM/V_MEM. Mobilny audyt Jasper i Trinity TOP/BOTTOM PL/EN nie wykazał kolizji ani etykiet poza kadrem; ostrzeżenie BOTTOM wyjaśnia projekcję elementów TOP. Nowy test `test-photo-closeups.mjs` sprawdza 38 kadrów i widoczność kropek w szerokości 390 px. Dziewięć testów automatycznych i kontrola składni — PASS. Pozycje Jaspera pozostają przybliżone; bez publikacji.
- **2026-09-19 — FAT-FIX-01:** pierwszy osobny audyt Jaspera: poprawiono CPU/GPU/Southbridge/HANA/NAND i kontrolery VRM; dodano 11 raili, 10 etapów, ścieżki objawów oraz 5 profili kodów z punktami PCB. Doprecyzowano przybliżony charakter oznaczeń, PL/EN i wyświetlanie zależnej od CPU_SRVID wartości V_CPUVCS. Test Jaspera i pełna regresja dotychczasowych danych — PASS; przeglądarka PL/EN bez błędów. Kalibracja BRD→foto pozostaje otwarta. Bez publikacji.
- **2026-09-19 — AUDIT-TRINITY-01:** utworzenie dokumentu, pełna mapa projektu, audyt UI/danych/schematu, priorytety P0–P2 i bazowa macierz testów. Bez publikacji i bez zmian funkcjonalnych w publicznym UI.
- **2026-09-19 — SLIM-FIX-01:** wspólny `diagnosticContext`, nawigacja kod/rail/objaw/sekwencja/układ/element → PCB, semantyczne przyciski kart oraz rozdzielone `Pokaż całą płytę` i `Reset zbliżenia`. Test składni JS i ręczny test przeglądarkowy PL/EN zaliczone. Bez publikacji.
- **2026-09-19 — SLIM-FIX-02:** trwały stan czterech odczytów, wizard `Krok 1/4`, mapowanie `4→0`, instrukcja `SYNC + EJECT`, synchronizacja z ręcznym polem kodu oraz powrót z PCB do kroku źródłowego. Test `0001`, EN→PL i `3333 → UNKNOWN` zaliczony. Bez publikacji.
- **2026-09-19 — SLIM-FIX-03:** moduł czterech stanów diody zasilacza (ORANGE / GREEN / RED / NO LIGHT), neutralne grafiki, bezpieczne komunikaty oraz nawigacja do wejścia PSU na PCB z punktem zależnym od rewizji. Test RED i PL/EN zaliczony. Bez publikacji.
- **2026-09-19 — SLIM-FIX-04:** logiczne trasy diagnostyczne wszystkich raili Trinity na fotografii PCB, szczegółowe karty source → measurement → load, warunki pomiaru i działania przy braku napięcia. Testy V_5P0STBY, V_3P3STBY i V_CPUCORE w PL/EN, składni JS oraz kompletności ID zaliczone. Trasy są jawnie odróżnione od przebiegu miedzi. Bez publikacji.
- **2026-09-19 — SLIM-FIX-05:** osobne transformacje afiniczne Trinity TOP/BOTTOM dopasowane do ośmiu punktów montażowych, poprawione proporcje zdjęć, dwujęzyczny status dokładności i automatyczny test regresji. Wyniki: TOP RMS 2.38 px / MAX 3.05 px / 955 z 956 elementów; BOTTOM RMS 4.28 px / MAX 7.88 px / 1002 z 1002 elementów. `R1` TOP opisano jako źródłowy outlier poza obrysem. Test UI PL/EN, TOP/BOTTOM, full-board i markera komponentu zaliczony. Bez publikacji.
- **2026-09-19 — SLIM-FIX-06:** kuratorowany zestaw 15 kodów SMC Trinity, szczegółowy wynik z confidence/przyczynami/railami/elementami, numerowane kroki pomiarowe i bezpośrednia nawigacja krok → PCB. Testy danych, `0002 → L6C2`, wpisu `0030`, PL/EN, `UNKNOWN` i responsywności zaliczone. Kody XSS/UEM pozostają poza tym pakietem i nie są zgadywane. Bez publikacji.
- **2026-09-19 — SLIM-FIX-07:** cztery rozbudowane ścieżki objawów (6/6/6/3) i dziesięcioetapowa sekwencja Power/Boot Trinity z warunkami, punktami, wartościami, elementami, działaniami po błędzie i przejściami do PCB. Dashboard oddzielono od punktów pomiarowych, a sygnały bez progu pozostawiono jako `UNKNOWN`. Test danych, składni i UI PL/EN zaliczony. Bez publikacji.
- **2026-09-19 — SLIM-FIX-08:** dziesięć profili serwisowych kluczowych elementów Trinity z rolą, railami, objawami, przepływem, zweryfikowanymi pinami/interfejsami i kolejnością pomiarów. Dodano przejścia profil → PCB / główny rail / Power-Boot, fallback dla surowego rekordu CAD oraz test danych. Testy PL/EN, NAND i CPUCORE zaliczone. Bez publikacji.
- **2026-09-19 — SLIM-FIX-09:** pełny audyt PL/EN i dostępności: usunięto doraźne tłumaczenia, uzupełniono dynamiczne treści i ARIA, dodano etykiety pól, focus, reduced motion, klawiaturowy pan/zoom, czytelniejszą typografię i reset stanu rewizji. Dodano `test-ui-contract.mjs`; testy danych i przeglądarkowe PL/EN, 390 × 844, reset Trinity/Jasper oraz konsola przeszły poprawnie. Bez publikacji.
- **2026-09-19 — SLIM-VERIFY-01:** zamknięcie Fazy 3 pełną macierzą regresji Trinity/Slim. Dodano `test-navigation-matrix.mjs`; automatycznie sprawdzono 8 regionów, 10 raili, 15 kodów, 10 etapów, 4 stany PSU, 21 kroków objawowych, profile, powroty i zasoby. W przeglądarce zaliczono kody SMC, reprezentatywne raile i etapy, wszystkie wejścia objawów/PSU, filtry, TOP/BOTTOM, `UNKNOWN`, Ring of Light z klawiatury, PL/EN i czystą konsolę. Bez publikacji.

## 9. Kierunek po bieżącym wydaniu — MODI CONSOLE LAB

Nowy zakres rozpoczyna się dopiero po domknięciu aktualnej wersji Trinity/Jasper i jej testów. Robocza architektura produktu:

```text
MODI CONSOLE LAB
├── Maps
├── Diagnostics
├── Components
├── Power Rails
├── Boot Flow
└── NAND Lab
```

Założenia następnej fazy:

1. `Maps` zachowuje obecną aplikację, ale pełna płyta otrzyma zweryfikowane obrysy fizycznych bloków, nie tylko etykiety.
2. Hover/click uruchomi focus wybranego bloku, przygasi obszary niepowiązane i pokaże powiązane elementy, raile, sygnały i kolejny krok.
3. Power Rail View będzie logiczną, źródłowo potwierdzoną warstwą funkcjonalną; nigdy deklaracją przebiegu miedzi bez danych.
4. Diagnostic Flow pozostanie bezpośrednio połączony z mapą PCB i będzie przechodził od objawu do konkretnego pomiaru.
5. Kluczowe układy otrzymają karty serwisowe i pinout tylko wtedy, gdy funkcje pinów i wartości są wiarygodnie potwierdzone.
6. Component Finder pozostaje integralnym wejściem do powiązań element → rail → układ → objaw → procedura.
7. Dane każdej rewizji będą przechowywane osobno z polami `source`, `board_revision`, `confidence`, `verified`, `notes`, `last_checked`.
8. Pierwszy proof-of-concept obejmie jedną dobrze udokumentowaną płytę i wszystkie widoki działające razem; nie powstaną równolegle liczne niepełne mapy.
9. Materiał „How to repair Playstation 5” służy wyłącznie jako referencja sposobu prezentacji pełnej płyty, bloków, standby/power-on i drzewa diagnostycznego. Nie jest źródłem danych Xbox i jego layout ani treść nie będą kopiowane.
