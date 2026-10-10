# Console Maps — aktywne błędy

Aktualizacja: 2026-10-10. Zgłoszenia z testu publicznego wdrożenia.
Pełny zakres i ograniczenia: [raport](CONSOLE_MAPS_REVIEW_2026-10-10.md).

## Zasada pracy
Nowo zaobserwowane błędy dopisywać od razu z krokami odtworzenia.
Po poprawce ponownie wykonać scenariusz. Dopiero po pozytywnym teście usunąć wpis z tej listy; w komunikacie commita podać identyfikator błędu i wynik testu. Historia pozostaje w Gitcie.
Pomysły i nowe funkcje (w tym Easy/Advanced) należą do backlogu, nie do listy usterek.

## CM-001 — P1 — poprzednia diagnoza pozostaje na mapie
1. Wybrać Jasper, wpisać 0031, nacisnąć Sprawdź.
2. Kliknąć pierwsze „Pokaż ten krok na PCB”.
3. Wpisać 3333, nacisnąć Sprawdź.
Wynik: karta UNKNOWN, mapa nadal ma kontekst poprzedniego 0031.
Oczekiwane: usunięcie starego kontekstu lub jednoznaczne oznaczenie go jako poprzedniego, bez sugerowania diagnozy dla nowego kodu.
Test zamknięcia: wykonać powyższy scenariusz i potwierdzić spójność karty i mapy.

## CM-002 — P2 — niespójny wybór sekcji po sprawdzeniu kodu
1. Jasper, BOTTOM, sekcja CPU (FT7U3).
2. Wpisać 0031 i nacisnąć Sprawdź.
Wynik: przycisk regulatorów jest wybrany, lecz combobox, panel szczegółów i zbliżenie nadal pokazują CPU.
Oczekiwane: wspólny stan wyboru albo wyraźnie oddzielona sugestia sekcji od aktywnego widoku.
Uwaga: jawne kliknięcie „Pokaż ten krok na PCB” poprawnie przechodzi do VRM.
Test zamknięcia: sprawdzić spójność wszystkich kontrolek przed i po przejściu na PCB.

## CM-003 — P2 — niespójne wejście do modułu z portalu
Górny skrót „MAPY KONSOL” otwiera katalog repozytorium, podczas gdy „OTWÓRZ MODUŁ” otwiera aplikację.
Oczekiwane: główne wejście do map otwiera aplikację; link do kodu jest osobno opisany.
Dotyczy portalu w repozytorium modyfikatorcasper.github.io.
Test zamknięcia: oba wejścia użytkowe prowadzą do działającego modułu.

## CM-004 — P2 — niejasne numerowane kropki i linie na głównej mapie
Potwierdzone wizualnie na Trinity: 1 przy wejściu zasilania, 2 przy regulatorach standby, 3 przy mostku południowym/SMC. Nakładka dotyczy logicznej trasy V_5P0STBY; podpis informuje, że nie odwzorowuje ścieżek miedzi.
Problem użyteczności: użytkownik nie rozumie znaczenia numerów, linie mogą wyglądać jak fizyczne połączenia, numery zasłaniają podpisy obszarów. Przy oglądaniu XCGPU nadal widoczna jest trasa standby.
Proponowana poprawka: czytelny tytuł „Kolejność sprawdzania: 5 V standby”, legenda 1–3 oraz przełącznik widoczności trasy. Pokazywać ją w kontekście wybranej diagnostyki, nie jako niewyjaśnioną stałą nakładkę.
Test zamknięcia: na podstawowym widoku początkujący rozpoznaje cel numeracji; etykiety obszarów pozostają czytelne; trasa odpowiada aktywnemu kontekstowi.

## Uwagi użytkownika do CM-004 — TOP/BOTTOM
Przy przełączaniu przodu i tyłu numerowane kropki pozostają i mieszają się z oznaczeniami elementów. Zgłoszenie użytkownika; konkretne zachowanie po zmianie strony wymaga ponownego testu.
Zachować zaakceptowane oznaczenia układów. Trasę diagnostyczną dopasować do strony PCB; nie sugerować fizycznej obecności elementu z przeciwnej strony. Jeśli prezentowana jest projekcja, jawnie ją oznaczyć i umożliwić ukrycie.
Test: TOP → BOTTOM → TOP; znaczniki, podpisy i trasa pozostają zgodne z widoczną stroną.

## CM-005 — P2 — zbyt szeroka polska etykieta mostka
Zgłoszenie użytkownika podczas oglądania aplikacji na telefonie: „Mostek południowy / SMC” tworzy nieestetyczny, długi prostokąt.
Poprawka: zwęzić etykietę do bardziej kwadratowego kształtu, zawinąć tekst np. „Mostek” / „południowy” / „SMC”. Zachować czytelność i nie zasłaniać sąsiednich punktów.
Test zamknięcia: sprawdzić polską etykietę na telefonie i desktopie, na obu stronach mapy; bez obcięcia tekstu i kolizji.

## CM-006 — P1 — mapa przechwytuje przewijanie strony na telefonie
Zgłoszone przez użytkownika podczas rzeczywistego korzystania na telefonie; nie odtworzono jeszcze niezależnie w teście mobilnym.
Przesuwanie palcem po powiększalnej mapie przesuwa obraz zamiast strony. Użytkownik nie może łatwo przejść do dalszych sekcji i odbiera zachowanie jako zablokowanie interfejsu.
Oczekiwane: domyślnie gest pionowy przewija stronę również nad mapą. Manipulację mapą włączać świadomie.
Proponowane rozwiązanie: widoczny przycisk „Poruszaj mapą”, aktywny tryb z jednoznacznym „Gotowe” / „Wróć do przewijania strony”. Nie wymagać odkrywania ukrytego dwukliku. Użytkownik zaproponował podwójne stuknięcie jako możliwy wariant — to pomysł, nie ustalony gest.
Test zamknięcia: telefon dotykowy, przewinięcie strony przez obszar mapy, świadome włączenie panoramowania i zoomu, wyjście z trybu, dotarcie do dalszych sekcji; brak pułapki gestów.

## Powiązane nowe wymaganie — nawigacja mobilna
Na górze łatwo dostępny wybór sekcji: Start, Kod błędu, Mapa płyty, Zasilanie/start, Punkty i układy. Użytkownik ma móc wejść bezpośrednio do wybranej części bez przewijania całego długiego widoku. Rozważyć pokazywanie tylko wybranej sekcji z zachowaniem stanu diagnostyki. To rozbudowa interfejsu, nie osobny potwierdzony błąd.


## Powtórny audyt 2026-10-10
[Wyniki i scenariusze odbioru](CONSOLE_MAPS_UX_AUDIT_2026-10-10.md).
- CM-001 i CM-002 odtworzone w działającej aplikacji; nadal otwarte.
- CM-004: Trinity BOTTOM zachowuje numerowaną trasę; Jasper BOTTOM ją ukrywa. Nie uogólniać na obie płyty.
- CM-006: potwierdzona przyczyna w źródle: touch-action:none, bezwarunkowe przechwycenie pointerdown i wheel. Test dotykowy na iPhonie nadal do wykonania.
- Walidacja pustego kodu, 123 i 9999 obecnie pokazuje BŁĘDNY FORMAT. Nie dopisywać braku komunikatu jako aktualnego błędu.
- Nie zamknięto CM-003 ani CM-005: bez nowego testu ich odbioru.

## CM-007 — P1 — menu sekcji znika na telefonie
Potwierdzone w styles.css: przy max-width:760px reguła .revision-card,.sidebar nav{display:none}; brak mobilnego zamiennika w badanym interfejsie. Użytkownik pozostaje z długą stroną, dodatkowo ograniczaną przez CM-006.
Poprawka: dostępny mobilny wybór sekcji; zgodnie z wymaganiem użytkownika duże wejścia do modułów i bezpośrednie otwieranie wybranej części.
Test zamknięcia: na 390 px przejść do każdej sekcji i wrócić bez przewijania całego dokumentu; menu dostępne również przy mapie. Zachować kod/model/etap.
Status dowodu: inspekcja kodu + zgłoszenie użytkownika; fizyczne Safari do odbioru.

## CM-008 — P2 — NO LIGHT oferuje sprzeczne następne działania
Odtworzenie: Jasper → Zasilanie/start → NO LIGHT.
Tekst mówi „Nie przechodź do pomiarów płyty, dopóki źródło nie działa”, ale ten sam panel wyświetla J9A1 pin 8 / FT8N1, 5 V i aktywny „Pokaż punkt na PCB”. Kreator pozostaje osobnym stanem standby.
Poprawka: w Easy pierwszy krok to sprawdzenie źródła; dalsze pomiary po potwierdzeniu lub jako jawne szczegóły Advanced. Nie sugerować automatycznie, że brak świecenia oznacza rozpoznaną usterkę płyty.
Test zamknięcia: NO LIGHT prowadzi jednym czytelnym następnym działaniem, bez sprzecznego wezwania do pomiaru PCB.
