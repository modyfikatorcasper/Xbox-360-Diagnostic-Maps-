# Console Maps — audyt obsługi i regresji 10 października 2026

## Wynik
Aplikacja działa, lecz przed uproszczonym wydaniem należy naprawić stan diagnozy na mapie i pułapkę gestów oraz przywrócić nawigację sekcji na telefonie. Nie zmieniano kodu aplikacji rozwijanego przez drugiego agenta. Poniżej są wyniki testów i zadania do wdrożenia, nie deklaracja zakończenia napraw.

Podgląd: https://modyfikatorcasper.github.io/Xbox-360-Diagnostic-Maps-/maps/xbox/xbox-360/console-maps/dist/#board

Punkt odniesienia repo: e8c72a4cfcac455bbb45a2fa5b2bf211064b8f56.
Odczytane pliki aplikacji: app.js blob b3ff4cfe6050f7a1c6c3253309244500543dffe5; styles.css blob 4b25c1b9afd11f0519374033cbed42c78003755d.
Publiczna strona nie pokazuje identyfikatora buildu, więc nie przypisujemy jej automatycznie SHA ostatniego commita dokumentacji.

## Wykonane próby w działającej przeglądarce desktopowej
| Próba | Wynik |
|---|---|
| Trinity, wpisanie 0001 i Sprawdź | Wynik ERROR_V_12P0, przyczyny, trzy kroki i przyciski PCB |
| Wpis 9999 | BŁĘDNY FORMAT i instrukcja czterech cyfr 0–3; nie pozostaje stara karta wyniku |
| Puste pole i Enter | BŁĘDNY FORMAT |
| 123 i Enter | BŁĘDNY FORMAT |
| 0001 i Enter | Poprawny wynik; Enter działa |
| Spacje wokół 0031 i Enter | Kod normalizowany do 0031 |
| 3333 | UNKNOWN, bez wymyślonego rozpoznania |
| Edycja READ 1 po wpisaniu 3333: wybór 4 segmentów | Pierwsza cyfra zmienia się na 0, podgląd i wynik na 0333; potwierdzone 4 → 0 |
| Jasper 0031, pierwszy Pokaż ten krok na PCB | Otwiera BOTTOM, VRM, FT6V1; L6F1 jawnie opisany jako TOP |
| Po powyższym wpisanie 3333 | FAIL CM-001: karta UNKNOWN, mapa zachowuje kontekst 0031 i stare instrukcje |
| Jasper BOTTOM CPU, następnie 0031 | FAIL CM-002: aktywny marker VRM, select CPU, zbliżenie CPU · FT7U3 |
| PL → EN → PL przy 0031 | Wynik i kod zachowane; badany panel przełącza język |
| Trinity TOP → BOTTOM | Numery 1–3 i trasa standby nadal obecne; CM-004 wymaga rozróżnienia projekcji |
| Jasper BOTTOM | Trasa numerowana ukryta; brak podstaw do zgłaszania jednakowego błędu dla obu płyt |
| Jasper, PSU NO LIGHT | Tekst każe najpierw sprawdzić źródło, ale równocześnie pokazuje punkt PCB i aktywny przycisk; CM-008 |
| Ekran dekodera | Demonstracja wzoru G1–G4, miniatury wzorów, kreator czterech odczytów i wpis ręczny pokazane razem |

Ważne uściślenie wcześniejszych notatek: błędny format obecnie ma komunikat w aplikacji. Przy badanej zmianie wcześniejszej cyfry kompletnego kodu wynik aktualizował się natychmiast. Nie powtarzać ogólnego twierdzenia, że stary wynik zawsze pozostaje. Potwierdzony problem dotyczy przede wszystkim starego kontekstu na PCB.

## Mobilna obsługa — ustalona przyczyna, odbiór urządzeniowy nadal potrzebny
Źródło styles.css: przy max-width:760px reguła `.revision-card,.sidebar nav{display:none}` usuwa menu sekcji. Topbar staje się position:relative. Nie ma mobilnego zamiennika nawigacji w badanym interfejsie. To potwierdzenie kodowe CM-007, nie test Safari.
Źródło styles.css: `.photo-viewport{touch-action:none}`.
Źródło app.js: wheel zawsze wywołuje preventDefault i zoom; pointerdown zawsze rozpoczyna drag oraz setPointerCapture. Brak trybu świadomej aktywacji manipulacji mapą. To potwierdza mechanizm zgodny ze zgłoszeniem użytkownika CM-006.
Dostępna sesja była desktopowa. Nie wykonano emulacji dotyku ani testu fizycznego iPhone'a. Nie raportować tego jako zakończonego mobilnego QA.

## Kolejność wdrożenia dla agenta
1. CM-001 i CM-002: jeden spójny stan kodu i kontekstu. UNKNOWN/niepoprawny kod usuwa stare zalecenia lub jawnie oznacza je jako historyczne. Sugestia regionu nie może udawać aktywnego wyboru.
2. CM-006 i CM-007: dostępne sekcje na górze; zwykły gest przewija stronę. Widoczny przycisk „Poruszaj mapą”, aktywny tryb z „Gotowe / Przewijaj stronę”, Escape na desktopie. Wyjście zawsze osiągalne. Domyślnie rolka przewija stronę; zoom przyciskami lub po świadomej aktywacji. Nie polegać wyłącznie na ukrytym dwukliku.
3. Jeden dekoder: „Znam kod” albo „Pomóż odczytać kod”. W tej drugiej ścieżce jedna grafika odpowiednia dla modelu, Odczyt 1/4–4/4, liczba segmentów, Cofnij, Wynik. Demonstracja G1–G4 i miniatury do opcjonalnej pomocy; nie kasować działającego dekodowania. Nie żądać ponownego wyboru błędu po otrzymaniu wyniku.
4. Tryby Easy/Advanced zgodnie z istniejącym CONSOLE_MAPS_EASY_ADVANCED.md. Wspólny stan, bez restartowania diagnozy.
5. CM-004/005: trasa domyślnie wyłączona w samodzielnym oglądaniu mapy, włączana przy konkretnym kroku; tytuł i legenda 1–3; właściwa strona PCB. Polska etykieta mostka w trzech krótkich wierszach.
6. CM-008: prowadzenie NO LIGHT od źródła zasilania; pomiary PCB dopiero po potwierdzeniu sprawnego źródła lub w jawnej sekcji Advanced.

## Proponowany ekran początkowy
Wybrana płyta oraz tryb Łatwy / Zaawansowany zawsze widoczne. Duże przyciski: Kod błędu, Mapa płyty, Zasilanie / start, Punkty i układy. Po wejściu tylko wybrana sekcja; nawigacja i powrót pozostają dostępne. Przejścia „Pokaż na PCB” przenoszą kontekst, a „Wróć do kroku” odtwarza poprzedni etap i pozycję. Przeglądarka Wstecz również powinna działać.

| Łatwy — domyślnie | Zaawansowany — ten sam przypadek |
|---|---|
| Prosty opis co oznacza kod, bez wyroku „uszkodzony układ” | Nazwy błędów, sygnałów, źródła, wariant PCB |
| Jedno następne działanie | Pełna lista kroków i sekwencja startowa |
| Zdjęcie, TOP/BOTTOM, oznaczenie i warunki pomiaru | Filtry CAD, komponenty, raile, EN/PGOOD, resety |
| Wynik oczekiwany, wynik użytkownika, Nie wiem | Pełne profile i wartości referencyjne |
| Pokaż na płycie / Wróć do kroku | Warstwy i logiczne trasy |
| Informacja o niepewności i brakach danych | Szczegółowe dowody i poziom weryfikacji |

Nie ukrywać warunków pomiaru ani niepewności w Easy. Nie dodawać niezweryfikowanych wartości. COMMUNITY CONFIRMED dotyczy znaczenia kodu w tabeli społecznościowej, nie pewności konkretnej diagnozy tej konsoli. W polskim UI zastąpić READ przez Odczyt; UNKNOWN przez opis „Brak danych” obok ewentualnego technicznego symbolu.

## Odbiór następnego buildu
- [ ] Telefon 390 px i fizyczny iPhone: przewinąć po mapie do kolejnej sekcji; włączyć i wyłączyć manipulację; brak pułapki.
- [ ] Menu dostępne od góry i wewnątrz każdej sekcji, bez poziomego przepełnienia.
- [ ] Model → 4,4,3,1 → 0031 → jeden wynik → pierwszy punkt PCB → powrót.
- [ ] Ten sam przypadek po zmianie Easy/Advanced i PL/EN.
- [ ] 0031 → PCB → 3333 oraz 9999: brak nieaktualnych zaleceń.
- [ ] CPU BOTTOM → 0031: select, marker i zbliżenie spójne.
- [ ] TOP → BOTTOM → TOP dla Trinity i Jasper: znaczniki odpowiadają stronie, projekcje podpisane.
- [ ] NO LIGHT prowadzi najpierw przez źródło zasilania.
- [ ] Wykonać testy pod publicznym URL i zapisać commit buildu. Dopiero wtedy zamykać aktywne błędy.

Nie wykonano pełnego sprawdzenia wszystkich 1952 komponentów, poprawności elektrycznej danych, wszystkich kodów/kombinacji, bezpieczeństwa ani licencji. Nie ma podstaw do raportu „zero błędów”.
