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
