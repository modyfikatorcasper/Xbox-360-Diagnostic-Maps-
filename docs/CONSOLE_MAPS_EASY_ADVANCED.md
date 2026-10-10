# Console Maps — uproszczenie obsługi i Easy/Advanced
Ustalenia użytkownika i przegląd: 2026-10-10. Wymagania do wdrożenia; nie deklaracja gotowej funkcji.

## Nawigacja — pierwszy priorytet
U góry dostępne przyciski sekcji, na wzór opisanego przez użytkownika Xbox 360 Flasher: Start, Kod błędu, Mapa, Zasilanie/start, Punkty i układy. Kliknięcie przechodzi bezpośrednio do sekcji; przewijanie w jej obrębie pozostaje naturalne. Nie trzeba przeglądać całego projektu, by znaleźć funkcję.
Mapa nie przechwytuje zwykłego gestu przewijania telefonu (CM-006).

## Wynik dodatkowej próby
W istniejącym kreatorze wybrano cztery odczyty: 4, 4, 3, 1. Po „Pokaż diagnozę” interfejs poprawnie pokazuje 0031 / ERROR_V_5P0, synchronizuje pole gotowego kodu i podaje kroki.
To test obsługi i dekodowania, nie potwierdzenie poprawności elektrycznej wszystkich wskazówek.
Przy edycji wcześniejszego odczytu stary wynik pozostaje widoczny — powinien być oznaczony jako poprzedni do zatwierdzenia nowego kodu.

## Jeden proces wprowadzania kodu
Na wejściu dwie alternatywy: „Pomóż odczytać kod” i „Znam kod”. Nie pokazywać kilku równoległych selektorów jako obowiązkowych kolejnych etapów.
Odczyt: grafika panelu właściwej konsoli, krótka instrukcja SYNC/EJECT, odczyt 1/4–4/4, liczba świecących segmentów, możliwość cofnięcia, wynik. W polskiej wersji „Odczyt” zamiast READ.
Zachować poprawne przeliczenie czterech segmentów na zero.
Demonstracyjny wybór wzoru pierścienia nie jest diagnozą — usunąć z głównej ścieżki Easy i przenieść do opcjonalnej pomocy. Pełną przeszukiwalną bazę kodów umieścić jako narzędzie Advanced, nie następny obowiązkowy wybór.
Użytkownik nazwał drugi wybór zbędnym; dokładnego wskazanego kontrolera nie ustalono. Powyższe jest propozycją eliminacji dublowania, nie uzasadnieniem usunięcia działającego dekodera.

## Podział funkcji
| Easy — domyślnie | Advanced — rozszerza ten sam stan |
|---|---|
| Wybór modelu i rewizji | Szczegóły wariantu i źródła danych |
| Odczyt lub wpisanie kodu, jeden wynik | Baza kodów, nazwy sygnałów, powiązania |
| Proste wyjaśnienie znaczenia kodu | Szczegóły EN/PGOOD, kolejność zasilania i resetów |
| Jeden kolejny krok, „Pokaż na płycie” | Wszystkie kroki, profile układów, filtry komponentów |
| Zdjęcie, strona PCB, oznaczenie elementu i warunki pomiaru | Pełne warstwy i trasy, wartości referencyjne, dokumentacja |
| Jawna informacja o niepewności i braku danych | Szczegółowe źródła i poziom weryfikacji |
Nie ukrywać w Easy warunków pomiaru, niepewności ani ostrzeżeń istotnych dla danego kroku. Easy nie oznacza, że każdy pomiar jest odpowiedni dla osoby bez doświadczenia.
Przełączenie trybu zachowuje model, kod, stronę PCB i etap; nie wymaga ponownego wpisywania.

## Test akceptacyjny
Nowy użytkownik wybiera model → odczytuje 4–4–3–1 lub wpisuje 0031 → widzi jeden wynik → otwiera pierwszy punkt na poprawnej stronie → wraca do kroku → przełącza Advanced bez utraty stanu.
Sprawdzić również pusty/niepoprawny/nieznany kod, zmianę modelu i poprawienie wcześniejszego odczytu; brak pozostałości poprzedniej diagnozy.
Na telefonie: dojście do każdej sekcji z góry oraz wyjście z interakcji mapy bez pułapki gestów.
