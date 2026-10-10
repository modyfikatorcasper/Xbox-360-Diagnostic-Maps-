# Xbox 360 Maps

## Jeden moduł diagnostyczny / One diagnostic module — IN DEVELOPMENT

[MODI Console Maps — otwórz aplikację / open the app](console-maps/dist/index.html)

[Kod, dane, testy i źródła / code, data, tests and sources](console-maps/README.md)

Moduł zawiera wybór **Trinity (Slim)** i **Jasper V1 (FAT)** w jednym interfejsie. Łączy kody błędów, mapę PCB i sekwencję zasilania/startu. To wersja do przeglądu, nie ukończona publikacja. Dla Jaspera przewidywana okolica elementu (`UNVERIFIED`) nie oznacza potwierdzonego położenia ani punktu pomiarowego. Stan kontroli i znane ograniczenia są opisane w [raporcie audytu](console-maps/AUDIT_REPORT.md).

The same interface lets reviewers switch between Trinity (Slim) and Jasper V1 (FAT). It is a review build, not a verified release. Approximate Jasper areas remain explicitly `UNVERIFIED`.

Inne rewizje (Corona i Winchester) pozostają planowane i nie są udostępnione jako gotowe mapy. Zdjęcia PCB pochodzą od osób trzecich; [źródła i rozbieżność oznaczeń licencji](console-maps/SOURCES.md#pcb-photo-sources) pozostają jawne i wymagają decyzji przed wydaniem.

### Uruchomienie lokalne / Run locally

Otwórz `console-maps/dist/index.html` w przeglądarce albo uruchom serwer HTTP z katalogu `console-maps/dist`. Nie jest potrzebny build ani instalacja pakietów. Do uruchomienia testów potrzebny jest Node.js: `node tools/test-ui-contract.mjs` (pozostałe testy są w `tools/test-*.mjs`).
