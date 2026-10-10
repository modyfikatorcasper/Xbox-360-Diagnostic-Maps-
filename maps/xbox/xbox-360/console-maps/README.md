# MODI Console Maps

Dwujęzyczny (polski / English) interfejs diagnostyczny Xbox 360, który łączy kody błędów, objawy uruchamiania i mapę płyty z konkretnymi punktami pomiarowymi.

Aktualny stan audytu, priorytety oraz obowiązkowa kolejność dalszych prac są prowadzone w `MASTER_WORKFLOW.md`.

## Obsługiwane przykłady

- Xbox 360 Slim — Trinity (top and bottom PCB photographs, searchable component database)
- Xbox 360 FAT — Jasper V1 (TOP/BOTTOM photographs, reviewed photo markers, 11 rails, 5 detailed error profiles, 10 boot stages)

## Uruchomienie lokalne

Otwórz `dist/index.html` albo uruchom prosty serwer HTTP w katalogu `dist`. Wybierz model, a następnie ścieżkę: Error Code, Board Map lub Power / Boot.

Moduł Error Code prowadzi przez cztery kolejne odczyty pierścienia (`4 segmenty = cyfra 0`), zachowuje wynik przy zmianie języka i kieruje potwierdzony kod do właściwego obszaru PCB. Panel PCB pozwala wrócić do kroku, z którego rozpoczęto diagnostykę.

Dla Trinity dostępny jest kuratorowany zestaw 15 kodów SMC. Szczegółowy wynik pokazuje poziom pewności, możliwe przyczyny, powiązany rail lub sygnał, kluczowe elementy oraz uporządkowane sprawdzenia otwierane bezpośrednio na fotografii PCB. Niepotwierdzone progi i kody spoza zestawu pozostają `UNKNOWN`; rozszerzone kody XSS/UEM nie są jeszcze deklarowane jako obsługiwane.

Moduł Power / Boot rozróżnia cztery stany diody zasilacza — ORANGE, GREEN, RED i NO LIGHT — oraz cztery prowadzone ścieżki objawów. Dla Trinity każdy krok pokazuje warunek, punkt, oczekiwany wynik i działanie po negatywnym pomiarze. Dziesięcioetapowa sekwencja od 5 V standby do dashboardu oddziela pomiary elektryczne od efektu końcowego i prowadzi bezpośrednio do właściwego obszaru PCB.

Karty raili Trinity pokazują teraz warunek pomiaru, źródło, punkt, oczekiwaną wartość, zasilane obciążenia i następny krok. Numerowana nakładka na fotografii przedstawia logiczną kolejność obszarów diagnostycznych; nie jest deklaracją dokładnego przebiegu ścieżki miedzi.

Nakładki komponentów Trinity są kalibrowane osobno dla TOP i BOTTOM na ośmiu widocznych punktach montażowych. W głównym interfejsie pozostaje prosta wskazówka, że znaczniki są orientacyjne i należy sprawdzić nadruk na własnej płycie; metryki dopasowania oraz ograniczenia wariantu XDK-derived są dokumentowane tutaj i w testach, nie w karcie użytkownika. Test regresji znajduje się w `tools/test-trinity-calibration.mjs`.

Dziesięć kluczowych elementów Trinity ma rozszerzone profile serwisowe: J7A1, U5A1, U5B1, U3D1, U1E2, U3B2, U1E1, U7C1, L6C2 i U5E1. Profil pokazuje rolę, stan pracy, raile, objawy, logiczny przepływ, zweryfikowane sygnały lub piny oraz kolejność pomiarów. Każdy profil prowadzi do elementu na PCB, głównego raila i Power / Boot. Pełne pinouty oraz progi niepotwierdzone w źródłach pozostają `UNKNOWN`; pozostałe elementy zachowują bezpieczny fallback do podstawowego rekordu CAD. Test znajduje się w `tools/test-component-profiles.mjs`.

Interfejs ma pełny przełącznik PL/EN dla treści statycznych i dynamicznych, jawne etykiety formularzy, widoczny focus, obsługę ograniczenia animacji oraz klawiaturowy pan/zoom fotografii PCB (strzałki, `+`, `−`, `0`/`Home`). Lekki test kontraktu dostępności, tłumaczeń i nawigacji znajduje się w `tools/test-ui-contract.mjs`.

Pełną macierz regresji Trinity sprawdza `tools/test-navigation-matrix.mjs`: 8 regionów PCB, 10 raili, 15 kodów SMC, 10 etapów startu, 4 stany PSU, wszystkie ścieżki objawów, profile komponentów i cele powrotu. Faza testowa Trinity/Slim jest zamknięta; Jasper/FAT rozwijamy osobno bez przenoszenia niepotwierdzonych danych z Trinity.

Pierwszy osobny audyt Jasper/FAT poprawił identyfikację kluczowych układów oraz powiązał 9 obszarów płyty z 11 railami, czterema ścieżkami objawów i 10 etapami startu. Kody `0001`, `0002`, `0031`, `0032`, `0033` mają własne kroki serwisowe dla Jaspera. Z właściwego pliku Jasper V1 BRD odczytano 1952 pozycje (799 TOP, 1153 BOTTOM), a zdjęcia TOP i BOTTOM dopasowano niezależnie do ośmiu widocznych układów na każdej stronie. Dostępny ponownie 76-stronicowy schemat Jaspera powiązano z wszystkimi 1952 rekordami: 1947 przez jego indeks elementów i pięć przełączników bezpośrednio przez arkusz 43. Wyszukiwarka obejmuje obie strony, oznaczenia, znane nazwy i typy układów, 15 grup według arkuszy, filtr fizycznego sąsiedztwa oraz stronicowanie. Z tekstu schematu pozyskano 1145 jednoznacznych wartości pasywnych z jednostką; pozostałe wartości są `UNKNOWN`. Grupa arkusza nie jest automatycznym dowodem wspólnego obwodu, a sąsiedztwo nie jest dowodem połączenia elektrycznego.

Po kontroli nadruków i widocznych footprintów 39 miejsc jest obsadzonych i rozpoznanych na fotografii. Cztery footprinty są puste; dodatkowo fotografowany wariant ma `U1B2` (ICS1893BF), a nie alternatywny `U1B1` (BCM5241). Te pięć nieobsadzonych rekordów nie dostaje znacznika obsadzonego elementu. Pozostałe 1908 pozycji mają stan `UNVERIFIED`; wybór każdej otwiera zbliżenie z przerywanym **kwadratem przewidywanej okolicy** i kropką pośrodku. Bezpośrednio na zdjęciu widać oznaczenie oraz wartość ze schematu albo `UNKNOWN`. Wielkość kwadratu skaluje się z zoomem. Nie jest to znacznik potwierdzonego elementu ani punkt pomiarowy. `U6T2` jest obsadzony na zdjęciu, chociaż schemat oznacza go `EMPTY`, więc interfejs pokazuje konflikt wariantu zamiast przypisywać mu niepotwierdzoną funkcję. Przed wydaniem potrzebna jest dalsza kontrola drobnych elementów i wariantu fotografowanej płyty.

Zdjęcie Jasper V1 BOTTOM ma niezależne dopasowanie do ośmiu widocznych układów (RMS 6,9 px, maksimum 13,3 px). Przełącznik BOTTOM pokazuje sześć sekcji z osobnymi zbliżeniami i tylko oznaczenia sprawdzone na fotografii; pozostałe sekcje otwierają TOP. Szczegóły i ograniczenia: `docs/JASPER_BOTTOM_INTAKE.md`.

Metodę, ograniczenia i sposób odtworzenia bazy opisuje `docs/JASPER_PLACEMENT_INTAKE.md`; testy to `tools/test-jasper-extraction.mjs` i `tools/test-jasper-audit.mjs`.

Mapa Jaspera ma ponadto osobne, czytelne zbliżenia CPU/CPUCORE/CPUVCS, GPU/GPUCORE oraz SMC/wejścia RF/żądania PSU. Sekcję można wybrać markerem lub listą w panelu; wejścia z raili i kodów wybierają powiązane zbliżenie. Układ przetestowano na desktopie i ekranie 390 px w obu językach.

Podpisy na zdjęciach automatycznie omijają inne podpisy i krawędzie kadru; kropki pozostają w miejscu wskazywanego obszaru. Kadry Trinity są wyśrodkowane według skalibrowanych pozycji TOP, a odległe punkty XCGPU/eDRAM/V_MEM rozdzielono na maksymalnie trzy zbliżenia. W Trinity oznaczenia elementów z TOP na widoku BOTTOM są wyłącznie projekcją ich położenia — nie potwierdzają, że element widać od spodu. Jasper BOTTOM używa osobnej listy widocznych elementów i nie pokazuje takich projekcji.

Po wyborze pojedynczego elementu panel wskazuje go niezależnie od sekcji mapy. Przełącznik PL/EN zachowuje jego stronę PCB, kadr i powiększenie; wybór sekcji w panelu wraca do jej zbliżeń. Pełny widok płyty również pozostaje aktywny po zmianie języka.

Test `tools/test-photo-closeups.mjs` pilnuje, aby kropki wszystkich 49 kadrów Jasper/Trinity TOP/BOTTOM mieściły się w obszarze zdjęcia przy szerokości telefonu 390 px. W Trinity znacznik Main VRM oraz logiczna trasa raila wskazują pierwszy kadr CPUCORE (U7C1), zaś RAM ma dwa kadry z czterema oddzielnie opisanymi kośćmi po stronie TOP. Oba regulatory standby są podpisane osobno; karta łączona otwiera ich wspólny obszar, nie profil jednego układu.

Przejścia z raili, kodów, sekwencji i kart układów wybierają zbliżenie pasujące do oznaczenia wskazanego punktu. Jeśli etap obejmuje kilka zbliżeń, kontekst pokazuje odpowiednie karty; gdy punkt nie ma osobnej etykiety na zdjęciu, interfejs mówi o tym wprost. Macierz 96 takich przejść sprawdza `tools/test-closeup-routing.mjs`.

Projekt jest przygotowywany do bezpłatnego udostępnienia społeczności, ale publikacja pozostaje wstrzymana do wspólnej akceptacji. Szablon danych dla Jasper, Trinity, Corona i Winchester opisano w `docs/DATA-MODEL.md`; mapy Corona i Winchester pozostają wyłączone do czasu pozyskania zweryfikowanych danych. Dokumenty źródłowe nie są częścią pakietu aplikacji. Szczegóły materiałów i licencji znajdują się w `SOURCES.md`.

## Image attribution

Some PCB photographs used as visual reference backgrounds are sourced from third-party repair documentation and remain credited to their original photographer. Exact source pages, both conflicting licence notices, and the release hold are documented in [SOURCES.md](SOURCES.md#pcb-photo-sources). MODI Console Maps supplies separate diagnostic overlays, measurement data, error-code mapping, repair guidance and interaction. Those overlays do not change the photographs' attribution requirements. The local audit package is not cleared for public distribution.

## Credits

- Modyfikator89
- Modyfikator Kacper
- Modibox.pl
- Special Thanks: Lewy2041

---

English: MODI Console Maps is a bilingual Xbox 360 diagnostic interface connecting error codes and boot symptoms to concrete PCB locations, test points, rails and expected voltages. The initial review build covers Trinity (Slim) and Jasper V1 (FAT).
