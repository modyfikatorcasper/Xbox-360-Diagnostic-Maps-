# Przegląd działającej aplikacji — 2026-10-10

Zakres: krótki test przeglądarkowy publicznego wdrożenia, nie walidacja elektryczna wszystkich danych.

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
- Dodać uzgodnione Easy/Advanced. W obejrzanym interfejsie brak przełącznika; obecny długi widok łączy wszystkie szczegóły.
- Doprecyzować zakres mapy: Jasper pokazuje 1952 rekordy, 39 obsadzonych na zdjęciu, 5 nieobsadzonych i 1908 okolic do sprawdzenia. Nie komunikować tego jako 1952 dokładnie zlokalizowanych elementów.
- Akcenty są już zielone, lecz stonowane/miętowe; tło dominująco granatowe. Użytkownik chce mocniejszej zieleni Xbox. Zachować kolory znaczeniowe pomiarów.
- Corona i Winchester są widoczne, ale wyłączone. Dodać jasny status rozwoju zgodnie z backlogiem.
- Karta C4E3 uczciwie informuje o braku potwierdzonych pomiarów i pełnego opisu funkcji; rozbudowywać tylko na podstawie źródeł.
- W portalu górny skrót MAPY KONSOL nadal prowadzi do katalogu GitHub, podczas gdy OTWÓRZ MODUŁ prowadzi do aplikacji. Ujednolicić główne wejście dla użytkownika.

Nie zmieniano aplikacji podczas przeglądu. Nie wykonano pełnego audytu wszystkich punktów, wersji mobilnej ani wszystkich kodów błędów.
