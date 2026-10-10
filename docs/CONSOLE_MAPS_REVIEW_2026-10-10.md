# Przegląd działającej aplikacji — 2026-10-10

Zakres: test funkcjonalny publicznego wdrożenia w przeglądarce desktopowej, z oceną zrozumiałości dla początkującego. Nie jest to walidacja elektryczna wszystkich danych.

## Potwierdzone
- Portal: przycisk OTWÓRZ MODUŁ otwiera aplikację.
- Przełączenie Trinity → Jasper V1 działa; zdjęcia Jasper TOP ładują się.
- Trinity: wyszukanie C4E3 i kliknięcie wyniku otwiera zbliżenie 315%; znacznik widoczny na kondensatorze przy nadruku C4E3. To pojedyncza próba, nie potwierdzenie wszystkich współrzędnych.
- Jasper: przełączenie BOTTOM zmienia widok i opis fotografii.
- Wpisanie 0031 w Jasper daje kartę V_5P0 z kolejnością sprawdzeń oraz odnośnikami do PCB. Nie zweryfikowano tu poprawności napięć i punktów ze schematem.

## Błąd do odtworzenia — niespójny stan wyboru
1. Wybrać Jasper V1.
2. Wybrać BOTTOM, pozostawić sekcję CPU (FT7U3).
3. Wpisać 0031 i nacisnąć Sprawdź.
4. Na mapie przycisk Regulatory CPU / GPU / pomocnicze staje się wybrany, ale combobox nadal wskazuje CPU, panel szczegółów pokazuje CPU, a zbliżenie pozostaje CPU · FT7U3.
Oczekiwane: karta błędu, aktywny obszar, wybór sekcji i zbliżenie powinny wskazywać ten sam cel albo jawnie wymagać przycisku przejścia. Nie pozostawiać poprzedniego punktu jako pozornie odpowiadającego nowemu błędowi.

## Priorytety kolejnej iteracji
- NOWE WYMAGANIE, nie usterka obecnej wersji: dodać uzgodnione Easy/Advanced. Obecny długi widok łączy wszystkie szczegóły.
- Doprecyzować zakres mapy: Jasper pokazuje 1952 rekordy, 39 obsadzonych na zdjęciu, 5 nieobsadzonych i 1908 okolic do sprawdzenia. Nie komunikować tego jako 1952 dokładnie zlokalizowanych elementów.
- Akcenty są już zielone, lecz stonowane/miętowe; tło dominująco granatowe. Użytkownik chce mocniejszej zieleni Xbox. Zachować kolory znaczeniowe pomiarów.
- Corona i Winchester są widoczne, ale wyłączone. Dodać jasny status rozwoju zgodnie z backlogiem.
- Karta C4E3 uczciwie informuje o braku potwierdzonych pomiarów i pełnego opisu funkcji; rozbudowywać tylko na podstawie źródeł.
- W portalu górny skrót MAPY KONSOL nadal prowadzi do katalogu GitHub, podczas gdy OTWÓRZ MODUŁ prowadzi do aplikacji. Ujednolicić główne wejście dla użytkownika.

Nie zmieniano aplikacji podczas przeglądu. Nie wykonano pełnego audytu wszystkich punktów, wersji mobilnej ani wszystkich kodów błędów.

## Rozszerzone wyniki testu

| Próba | Wynik |
|---|---|
| Trinity: 0001, 0002, 0003, 0010, 0011, 0012, 0013, 0020, 0021, 0022, 0023, 0030, 0031, 0032, 0033 | Każdy kod wyświetla odpowiadający mu wynik; nie oznacza to weryfikacji diagnozy elektrycznej |
| PL → EN → PL przy 0033 | Kod i wynik zachowane; sprawdzone fragmenty tłumaczone |
| Jasper 0031: pierwszy przycisk „Pokaż ten krok na PCB” | Poprawnie przechodzi do VRM; FT6V1 oznaczony BOTTOM, L6F1 TOP z informacją o innej stronie |
| Nieznany kod 3333 | Wynik UNKNOWN, ale poprzedni kontekst na mapie pozostaje — patrz P1 |
| Niepoprawny kod 9999 po 0031 | Stary wynik pozostaje. Nie potwierdzono zachowania natywnego komunikatu walidacji; potrzebny czytelny komunikat w aplikacji |
| Jasper: całkowicie martwa → NIE w pierwszym kroku | Zatrzymuje ścieżkę i kieruje do sprawdzenia zasilacza/przewodu/gniazda |
| Trinity: ORANGE / GREEN / RED / NO LIGHT | Każdy wybór zmienia panel zasilacza; kreator pomiarów pozostaje oddzielnym stanem |
| Trinity → Jasper przy wpisanym C4E3 | Filtr pozostaje, co może zostawić pustą listę; wskazane jawne zachowanie lub reset |

## P1 — poprzednia diagnoza pozostaje na mapie

Odtworzenie:
1. Jasper, kod 0031, Sprawdź.
2. Pierwsze „Pokaż ten krok na PCB” — mapa dostaje kontekst 0031.
3. Wpisać 3333 i nacisnąć Sprawdź.
4. Karta pokazuje UNKNOWN, ale mapa nadal zachowuje kontekst wcześniejszego 0031.

Skutek: początkujący może odczytać stare zalecenie jako wskazówkę dla nowego kodu.
Oczekiwane: usunięcie kontekstu przy nowej diagnozie bez punktów lub jednoznaczne oznaczenie, że jest to poprzednia diagnoza. Objąć regresją zmianę kodu, modelu i objawu.

## Użyteczność dla początkującego

- Najpierw wybór płyty, potem objaw/kod, następnie pojedynczy krok z widocznym celem na zdjęciu.
- Przy punkcie zawsze pokazać stronę PCB i orientację; wskazanie elementu po drugiej stronie nie może wyglądać jak jego fizyczna obecność na bieżącym zdjęciu.
- Rozdzielić dokładną lokalizację, przybliżoną okolicę i element niezweryfikowany. Same liczniki rekordów nie opisują dokładności mapy.
- Wybór stanu zasilacza powinien wyjaśniać związek z kreatorem. Aktualnie oddzielne kontrolki mogą sugerować sprzeczne kolejne kroki.
- Przy NO LIGHT najpierw wyjaśnić kontrolę źródła zasilania; nawigacja do PCB nie powinna sugerować, że pomiar płyty jest już właściwym następnym krokiem.
- Niepoprawny wpis powinien mieć komunikat obok pola; poprzednia diagnoza nie może wyglądać jak wynik nowego wpisu.
- Brak pomiarów C4E3 jest poprawnie ujawniony. Nie zastępować brakujących danych domyślnymi wartościami.

## Dokumentacja i ograniczenia

README opisuje wdrożenie publiczne In Development, natomiast MASTER_WORKFLOW zawiera historyczne stwierdzenia o wstrzymanej publikacji i lokalnym Jasperze. Oznaczyć je jako historyczne i wskazać aktualny stan.

Dokumentacja deklaruje 12 testów automatycznych i macierze ścieżek; w tym przeglądzie nie uruchamiano tych testów. Logi zaobserwowane w przeglądarce zawierały błędy rozszerzenia; nie przypisano ich aplikacji.

Nie wykonano: pełnej weryfikacji schematowej i pomiarowej, wszystkich współrzędnych i wariantów płyt, wszystkich kombinacji kreatora, audytu mobilnego, dostępności, bezpieczeństwa ani licencji. Nie należy przedstawiać tego raportu jako „wszystko sprawdzone”. Nie zmieniano kodu aplikacji, nad którym pracuje drugi agent.
