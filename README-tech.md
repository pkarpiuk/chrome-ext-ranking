# chrome-ext-ranking

Ranking rozszerzeń Google Chrome (Chrome Web Store) w kolejnych datach, z kolumną zmiany pozycji i porównaniem z wybranym
wcześniejszym snapshotem. Statyczna strona (ExtJS 4) wdrażana na **Cloudflare Static Assets**, bez serwera i bez uwierzytelniania.

To repozytorium zawiera wszystko, co jest potrzebne do wdrożenia strony. Dane (`public/db.js`) i sprite ikon są przygotowywane
w osobnym, prywatnym repozytorium (`chrome-ext-ranking-sources`) i tutaj trafiają już gotowe.

## Układ repozytorium

| Ścieżka | Zawartość |
|---|---|
| `public/` | to, co trafia do Cloudflare: `index.html`, `main.js`, `db.js` (dane), sprite ikon, ExtJS (`ext-all.js`, `resources/` – nie edytować), `_headers` (cache) |
| `wrangler.jsonc` | konfiguracja wdrożenia (`assets.directory = ./public`, bez skryptu Workera) |

## Podgląd lokalny

Wymagany Node.js (np. przez nvm).

```
npm install
npm run dev          # http://127.0.0.1:8787/ (to samo, co zobaczą użytkownicy: nagłówki z public/_headers, bez logowania do Cloudflare)
```

## Wdrożenie (z laptopa)

```
npx wrangler login   # raz: logowanie do konta Cloudflare w przeglądarce
npm run deploy       # wgrywa public/; adres: https://chrome-ext-ranking.<konto>.workers.dev (własną domenę dodaje się w panelu)
```

Cloudflare Static Assets, plan darmowy: do 20 000 plików i 25 MiB na plik (strona ma ok. 470 plików, największy `db.js` ma ok. 8,5 MB);
żądania do plików statycznych są darmowe i bez limitu. Nagłówki cache: `public/_headers` (domyślnie Cloudflare wysyła
`max-age=0, must-revalidate` + ETag, więc `db.js` jest zawsze świeży; długi cache mają tylko sprite i ExtJS).

Opis architektury dla Claude Code: `CLAUDE.md`.
