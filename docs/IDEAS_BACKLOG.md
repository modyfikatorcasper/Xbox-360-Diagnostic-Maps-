# Modi Diagnostic Lab — pomysły do realizacji

Ten plik przechowuje pomysły, które chcemy zachować na później. Wpis na liście nie oznacza, że funkcja lub repozytorium już istnieje.

## 1. Identyfikator płyt głównych Xbox 360

**Status:** IDEA  
**Priorytet:** do zaplanowania

Moduł w ramach Modi Maps do identyfikacji płyt głównych Xbox 360.

Planowany zakres:
- identyfikacja na podstawie zdjęć, oznaczeń PCB i charakterystycznych elementów;
- typ zasilacza oraz rodzaj gniazda zasilania;
- orientacyjna data produkcji i oznaczenia rewizji;
- poziom pewności identyfikacji oraz wyraźne rozróżnienie między oceną wizualną a potwierdzeniem danymi z konsoli.

Punkt startowy: Jasper i Trinity. W dalszej kolejności rozważyć inne rodziny płyt Fat, Corona i Winchester. Podobieństwa między rodzinami należy weryfikować, a nie zakładać z góry.

## 2. MODI / Modibox — prasa, publikacje i informacje o autorze

**Status:** IDEA  
**Priorytet:** do zaplanowania

Uporządkować informacje o projektach, ich autorze i zewnętrznych publikacjach, aby łatwiej było znaleźć wiarygodne źródła dotyczące MODI, Modyfikator89 i powiązanych projektów.

Planowany zakres:
- osobna sekcja „Prasa i publikacje” / „Media o nas” z linkami do oryginalnych materiałów, tytułami, datami i krótkim opisem;
- jasna informacja o autorze i twórcy projektów: Kacper Lewandowski / Modyfikator89, z rozdzieleniem projektów MODI od informacji o firmie Modibox tam, gdzie to istotne;
- możliwość utworzenia osobnego repozytorium GitHub na archiwum publikacji i materiały prasowe, jeśli będzie to praktyczne;
- linkowanie do oryginalnych źródeł i podawanie tylko zweryfikowanych informacji — bez sugerowania poparcia lub partnerstwa, jeśli źródło tego nie potwierdza;
- później sprawdzić podstawowe metadane i dane strukturalne strony, aby pomóc wyszukiwarkom prawidłowo rozumieć informacje o projektach i publikacjach.

**Uwaga:** sama sekcja prasowa ani metadane nie gwarantują, że każdy asystent AI odnajdzie publikację. Celem jest rzetelne, trwałe i łatwe do zweryfikowania źródło informacji.


## 3. Ustalenia 2026-10-10 — działające mapy i kolejne moduły

Status: wymagania i plan; wpis nie potwierdza implementacji ani wdrożenia.

### Xbox 360 Console Maps
- Jeden interfejs wyboru płyt; priorytet Trinity i Jasper. Corona i Winchester rozwijane sukcesywnie, oznaczone In Development.
- Intensywnie zielone akcenty Xbox zamiast niebieskich: aktywne elementy, zaznaczenia, obramowania i hover. Zachować znaczenie kolorów napięć/legendy.
- Easy i Advanced na wspólnej bazie. Easy prowadzi od rozpoznania konsoli/zasilacza na dobrych zdjęciach przez objawy i kod do pomiarów. Advanced pokazuje szczegóły techniczne.
- Kod błędu powinien wskazywać obszar/element na konkretnej rewizji PCB oraz właściwe kolejne pomiary. Oddzielić znaczenie kodu, potwierdzone przyczyny i porady społeczności; podać źródło, rewizję, objawy i poziom weryfikacji. Liczby udokumentowanych przypadków tylko na podstawie dowodów.
- Nie rozpoznano niepewnego kodu wypowiedzianego jako „0 chyba 23”; nie przypisywać go automatycznie kondensatorom.
- Warunek dostarczenia: „Otwórz moduł” prowadzi do faktycznie działającej aplikacji jak lokalny podgląd, ze zdjęciami i punktami. Sprawdzić pod docelowym URL, przekazać link oraz commit. Raport testów i sam kod nie zastępują podglądu.
- Przed rozbudową ocenić dokładność oznaczeń i zbliżeń Trinity/Jasper.

### Modi Maps — PS5 Southbridge Maps
- Projekt wskazany przez użytkownika jako priorytet do przygotowania do przeglądu i wydania.
- Według użytkownika istnieje gotowa mapa i dwie wersje mostka z identycznym pinoutem. Przed publikacją sprawdzić konkretne oznaczenia i źródłową mapę; zgodność nie została tu niezależnie potwierdzona.
- Zamiast ilustracji wykorzystać rzeczywiste zdjęcia obu układów i PCB. Pokazać A1, orientację oraz rozróżnienie widoku od góry i od strony kulek.
- Kliknięcie kulki podświetla połączony punkt/element na PCB i pokazuje, co zbadać. Połączenia i pomiary muszą mieć źródło oraz status weryfikacji.
- Wspomniany kontekst Swapper/NVS wymaga identyfikacji właściwego projektu; nie traktować jako gotowej instrukcji swapu.

### Modi Maps — PS5 GDDR6 Maps
- Drugi projekt na dzisiejszej liście. Nazwę „DDR6” interpretujemy roboczo jako GDDR6.
- Zakres i materiały źródłowe do ustalenia; nie deklarować gotowej implementacji.
- Późniejsza rozbudowa: wizualna mapa miejsc i metod pomiaru przy podejrzeniu zwarcia w obszarze pamięci. Zweryfikować wartości odniesienia, rewizję i warunki pomiaru. Sama niska rezystancja nie identyfikuje uszkodzonej kości.

### Publikacja i organizacja
- Wydać użyteczny, sprawdzony zakres jako stronę; resztę jawnie oznaczyć In Development. Przykładowy odbiór: kulka → punkt PCB → wskazówka pomiarowa.
- Preferencja dla nowych projektów: prywatna baza robocza, publiczna aplikacja/pliki wymagane dla użytkownika; publiczne materiały prasowe osobno. Widoczność istniejących repo na razie bez zmian. Przed ewentualną migracją sprawdzić hosting i aktualizacje.
- Publiczne dane przesyłane do przeglądarki można kopiować; prywatne repo nie ukrywa takich danych. Ograniczenie zakresu odpowiedzi serwera to pomysł do oceny, nie wdrożona ochrona.
- Promocja na stronie i w mediach społecznościowych po potwierdzonym uruchomieniu; ten wpis nie oznacza wysłania publikacji.

### Dalsze pomysły kontrolerowe
- Modi PSX Lab, PS1/PS2 → RP2040: zebrać od wykonującego agenta nazwę bazowego firmware i diff, aby odróżnić istniejącą autodetekcję od własnych dodatków. Nie przypisywać autorstwa funkcji na podstawie samej kompilacji.
- Modi PS5 to PS3: ODŁOŻONE. Cel: DualSense przez natywny Bluetooth PS3, PS/Home i podstawowe wibracje bez adaptera i ręcznego ładowania modułów. Najpierw analiza drogi raportu PS, ewentualnie kombinacji przycisków i VSH. Wybudzanie ze standby osobno.
- Źródła do późniejszej analizy: https://github.com/Dobridp/DS45Pad , https://github.com/GabaRSk/XPAD-Revolution , https://github.com/ihasTaco/RosettaPad . Deklaracje autorów nie zastępują testów. Nie rozpoczynać implementacji odłożonego pomysłu bez nowego zadania.

## 4. Console Maps — zadania po audycie UX 2026-10-10

Status: **DO WDROŻENIA I ODBIORU**. Raport dodany do projektu na polecenie użytkownika. Nie oznacza zakończonej implementacji.

Pełne wyniki: [audyt UX](CONSOLE_MAPS_UX_AUDIT_2026-10-10.md). Usterki: [aktywne błędy](CONSOLE_MAPS_ACTIVE_BUGS.md). Śledzenie wykonania: [issue #4](https://github.com/modyfikatorcasper/Xbox-360-Diagnostic-Maps-/issues/4).

1. CM-001/002: synchronizacja diagnozy, zaznaczenia i zbliżenia; usuwanie starego kontekstu przy UNKNOWN i błędnym kodzie.
2. CM-006/007: naturalne przewijanie nad mapą, jawny tryb manipulacji i wyjście oraz dostępny mobilny wybór sekcji.
3. Jeden proces: „Znam kod” lub „Pomóż odczytać kod”; demonstracja pierścienia w opcjonalnej pomocy.
4. Łatwy/Zaawansowany według [specyfikacji](CONSOLE_MAPS_EASY_ADVANCED.md), ze wspólnym stanem modelu, kodu i kroku.
5. CM-004/005: trasy odpowiednie dla TOP/BOTTOM oraz kompaktowa polska etykieta mostka.
6. CM-008: jeden czytelny następny krok dla NO LIGHT, najpierw kontrola źródła zasilania.

Odbiór według checklisty raportu: działająca strona, regresja kodów, przejścia PCB i powrót, PL/EN, fizyczny telefon. Walidacja pustego kodu/123/9999 i przeliczenie 4 segmentów → 0 działały w audycie — zachować. Nie ogłaszać „zero błędów” na podstawie samego buildu.
