# Jasper V1: pozycje elementów i rejestracja fotografii

Status (2026-10-10): **pełny odczyt położeń i indeksu schematu wykonany; przegląd wizualny nadal w toku**. Dane pochodzą z dostarczonego `Xbox_360_Jasper.brd` i `Xbox_360_Jasper_Schematic.pdf`, nie z plików Tonasket. Baza nie zawiera netlisty ani pozycji poszczególnych pinów.

## Źródło i metoda

- Plik: `Xbox_360_Jasper.brd`, SHA-256 `241869E262481208027F5FE8952D6D1AAEBCBEAD9E1E392EF5C144EA94977C7E`.
- `tools/extract-jasper-placement.mjs` odczytuje wyłącznie rekordy instancji komponentów i ich umieszczenia z binarnego Allegro 15. Weryfikuje magic, dzielnik jednostek, hash pliku, unikalność oznaczeń i komplet wymaganych kotwic. Wynik przechodzi dodatkowo przez `tools/validate-jasper-placement.mjs`.
- Rozpoznano 1952 umieszczone elementy: 799 TOP i 1153 BOTTOM. Jednostka współrzędnych: mil. Strony płyty pochodzą z flagi rekordu umieszczenia.
- Schemat PDF (SHA-256 `11CFCBB1586197D1558168906EA78534C611DADC0705359E65181DE2DB2D2D6E`) ma 76 stron. `tools/extract-jasper-schematic.py` łączy 1947 rekordów BRD z indeksem elementów na stronach 68–76; pozostałe pięć przełączników odnajduje na arkuszu 43. Wyniki zapisano w `tools/data/jasper-schematic-index.json` i dołączono do generowanej bazy. Każdy rekord ma arkusz, grupę i symbol/obudowę, jeśli występuje w indeksie.
- 1145 wartości elementów pasywnych odczytano tylko z bloków zawierających jednoznaczną wartość z jednostką (`UF`, `PF`, `K`, `UH` itd.). Parser wymaga oznaczenia i numeru pinu oraz odrzuca bloki niejednoznaczne; 807 pozostałych wartości pozostaje `UNKNOWN`. Wartość nominalna w schemacie **nie dowodzi obsadzenia** footprintu na każdej płycie, np. `L8D1` ma 0.6 µH w schemacie, ale jest pusty na użytym zdjęciu.
- Grupy bazują na arkuszach schematu, nie na interpolacji odległości na zdjęciu. Arkusz 54 zawiera zarówno fazy GPU, jak i osobny regulator `V_1P8`; dla `U2T1`, `FT2R8` i jego widocznych elementów zastosowano udokumentowany wyjątek grupowania. To nadal nie zastępuje pełnej netlisty.
- Na wyrenderowanych arkuszach 54 i 56 sprawdzono cztery jawnie oznaczone opcjonalne footprinty `EMPTY`: `R2T7`, `R2T8`, `U5C1` i `U6T2`. Pierwsze trzy są puste również na użytych zdjęciach, natomiast `U6T2` jest na zdjęciu BOTTOM obsadzony. Wyszukiwarka pokazuje tę sprzeczność jako konflikt wariantu; oznaczenie w schemacie nie dowodzi obsadzenia albo braku obsadzenia każdej fizycznej płyty.
- Własne pole PDF `[PAGE_TITLE]` bywa niezgodne z treścią arkusza (np. arkusz 19), dlatego tytułów nie używa się jako fraz wyszukiwarki ani jako dowodu funkcji elementu. GPU `U4D1` jest na arkuszu 12 opisane symbolem/obudową `NBY2_BGA`; dostarczony schemat nie potwierdza dla niego nazwy „Zeus”, więc w UI pozostaje neutralne `GPU / U4D1`.
- Układ rekordów porównano z [opisem formatu Allegro 15 przygotowanym przez BoardRipper](https://github.com/AlexeyInwerp/BoardRipper/blob/main/docs/formats/ALLEGRO_V15_FORMAT.md). Skrypty projektu są niezależną implementacją ograniczonego odczytu; kod tamtego projektu nie został skopiowany.
- `tools/build-jasper-components.mjs` generuje `dist/assets/jasper-components.js` z dokładnie tego BRD. Dla innego pliku hash zatrzymuje budowę. Plik źródłowy BRD nie jest częścią `dist`.

## Dopasowanie zdjęcia TOP

Osiem ręcznie wskazanych środków widocznych układów (`U4D1`, `U7D1`, `U2C1`, `U2E1`, `U3D1`, `U3E1`, `U4C2`, `U5B1`) wiąże układ BRD z fotografią TOP 2373 × 2048 px. Transformacja afiniczna ma względem tych przybliżonych środków RMS 5,8 px i największą resztę 10,1 px. Jest to **błąd dopasowania tych ośmiu punktów**, a nie gwarancja dokładności każdej z 799 pozycji. Dla złączy i dużych dławików punkt odniesienia footprintu może różnić się od wizualnego środka obudowy.

Lokalna mapa pokazuje powiększalne zdjęcia TOP i BOTTOM. Wyszukiwarka obejmuje 799 rekordów TOP i 1153 BOTTOM z BRD. 39 miejsc obsadzonych i sprawdzonych na zdjęciach ma pełny znacznik elementu; cztery widocznie puste footprinty oraz alternatywny, nieobsadzony `U1B1` są opisane bez znacznika obsadzonego elementu. Pozostałe 1908 rekordów mają stan `UNVERIFIED` i po wybraniu otwierają zbliżenie z przerywanym kwadratem przewidywanej okolicy i kropką, nie dokładnego punktu. Oznaczenia typu `FT8N1`, `U8N1`, `U8U1`, `U4V1` leżą na BOTTOM, więc nie są stawiane jako punkty na zdjęciu TOP. Złącze `J9A1` jest widoczne i podpisane na zdjęciu TOP przy położeniu z BRD; znacznik wskazuje obudowę złącza, nie rozkład pinów 7/8.

Kolejny przegląd zdjęcia TOP potwierdził nadruki i obsadzenie `U5B2`, `L6F1`, `L6C1`, `L7C1`, `L8F2` i `L3F1` przy pozycjach z BRD. Te duże elementy zasilania są oznaczone na dostępnych kadrach; kontrola obudowy/dławika nadal nie potwierdza dokładnego pada pomiarowego. Następnie w obszarze Ethernet zdjęcie pokazało układ `U1B2` (ICS1893BF) i jego nadruk; alternatywny, położony niemal w tym samym miejscu `U1B1` (BCM5241) nie jest obsadzony w tym wariancie. Jawna lista obsadzonych miejsc obejmuje 20 TOP i 19 BOTTOM; osobno pięć rekordów ma status nieobsadzonych na użytym zdjęciu.

Kontrola zbliżenia CPU VRM w dostarczonej fotografii TOP wykazała, że footprint opisany jako `L8D1` jest **nieobsadzony** (widoczne puste pola i nadruk), choć jego pozycja występuje w BRD. `L8E1` i `L8F1` są obsadzone. Dlatego karta V_CPUCORE, kod `0002`, Power / Boot i etykiety PCB prowadzą wyłącznie do `L8E1 / L8F1`; wyszukiwarka nadal znajduje `L8D1`, ale opisuje je jako nieobsadzony footprint na tej fotografii, nie punkt pomiarowy. To stwierdzenie dotyczy użytego zdjęcia, nie każdej odmiany produkcyjnej Jaspera. W tym samym przeglądzie porównano położenie `U5B1` i pobliskiego `R5B3` z fotografią; drobne punkty pozostają przybliżone i nie służą za lokalizacje pinów.

Stopka wszystkich czterech fotografii w `dist` zawiera znak autora jft / retro.jnftech.net oraz oznaczenie **CC BY-SA 4.0**, natomiast strony plików ConsoleMods deklarują **CC BY 4.0**. Rozbieżność jest odnotowana w `SOURCES.md` i informacjach prawnych aplikacji. Przed publikacją trzeba potwierdzić warunki z uprawnionym autorem; nie usuwamy znaków z obrazów.

## Odtworzenie i kontrola

```powershell
python tools/extract-jasper-schematic.py "C:\sciezka\Xbox_360_Jasper_Schematic.pdf" tools/data/jasper-schematic-index.json
node tools/build-jasper-components.mjs "C:\sciezka\Xbox_360_Jasper.brd"
node tools/test-jasper-extraction.mjs
node tools/test-jasper-audit.mjs
node tools/test-photo-closeups.mjs
```

Do zamknięcia przed udostępnieniem: ręcznie porównać pozostałe drobne elementy we wszystkich dziewięciu regionach z fizyczną płytą Jasper V1 lub fotografią o wystarczającej rozdzielczości; wykluczyć różnice rewizji retail względem BRD. Osobno zweryfikować mapowanie wartości elementów i pozostałe punkty pomiarowe od spodu. `FT2R8` został rozpoznany po nadruku na użytym zdjęciu BOTTOM, lecz znacznik nadal nie jest instrukcją przyłożenia sondy do określonego pada. Niepotwierdzone pozycje pozostają `UNVERIFIED`. Publikacja wymaga akceptacji użytkownika i wyjaśnienia praw do zdjęć.
