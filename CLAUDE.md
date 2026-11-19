# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working in this repository. Dokumentacja jest po polsku; odpowiadaj użytkownikowi po polsku.

## Przegląd

Statyczny ranking rozszerzeń Google Chrome (ExtJS 4) wdrażany na Cloudflare Static Assets, bez serwera, bez uwierzytelniania, bez GitHub Actions
(wdrożenie ręczne z laptopa). Nie ma testów ani lintera. To repozytorium jest **publiczne** i zawiera tylko to, co potrzebne do wdrożenia. Dane (`public/db.js`) i sprite ikon powstają w osobnym, prywatnym repozytorium `chrome-ext-ranking-sources`; tu trafiają gotowe. Nie dodawaj tu skryptów ani danych źródłowych, ani opisów, jak dane są pozyskiwane i budowane.

- `public/` – wdrażane pliki: `index.html`, `main.js` (cała logika UI), `db.js` (generowany gdzie indziej), `icons-sprite-<skrót>.webp` + `icons-sprite.css` (generowane gdzie indziej), `_headers`, `favicon.ico`, `ext-all.js` i `resources/` (dołączony ExtJS – nie edytować).
- `wrangler.jsonc` – `assets.directory = ./public`, bez `main`; `package.json` – tylko `wrangler` (skrypty `dev`, `deploy`).

## Polecenia

```
npm run dev                     # podgląd lokalny http://127.0.0.1:8787/ (wrangler dev, bez konta)
npx wrangler login && npm run deploy    # wdrożenie (logowanie raz)
```

`public/db.js` i sprite ikon są generowane w repozytorium `chrome-ext-ranking-sources`; tu się je tylko commituje.

## Format `public/db.js`

`public/db.js` to `var chrome_data = {dates, categories, icons, data}`.

Format rekordu (tablica; `main.js` używa indeksów): `[id, name, author, desc, category, rate[], rate_users[], site_url, user_count[], free, icon26_url, icon128_url, image220x140_url]` (tablice `rate`, `rate_users`, `user_count` indeksowane datą z `chrome_data.dates`). Używane indeksy w `main.js`: `rec[4]` kategoria, `rec[5]` rate, `rec[6]` rate_users, `rec[8]` user_count, `rec[9]` free – zmiana kolejności pól wymaga poprawek w `main.js` i w generatorze (repozytorium źródeł). Nie ma pola `app_url`: `main.js` buduje link `https://chromewebstore.google.com/detail/<id>` (sklep przekierowuje na adres ze slugiem). `icon128_url` jest wypełnione tylko, gdy brak `image220x140_url` (panel informacji używa go awaryjnie). Rozszerzenia spoza rankingu bieżącego (usunięte ze sklepu; brak oceny w ostatniej dacie) zostają w `db.js` tylko do liczenia pozycji w rankingu porównawczym i nigdy nie są wyświetlane, więc mają `site_url`, `icon26_url`, `icon128_url`, `image220x140_url` równe `null`, ale zachowują `name`, `author`, `desc`, `category` i `free` (używają ich filtry i wyszukiwanie przed liczeniem pozycji).

Ranking bieżący obejmuje rozszerzenia o ocenie co najmniej 3,0 (od 10 ocen) i co najmniej 1000 użytkowników; motywy i aplikacje Chrome są pominięte.

## Ikony

W `db.js` pole `icon26_url` bieżących rozszerzeń to numer ikony w sprite'cie WebP 16×16 (`public/icons-sprite-<skrót>.webp`, ok. 2,3 MB; w nazwie skrót z zawartości, więc długi cache jest bezpieczny) opisanym przez `public/icons-sprite.css`; `chrome_data.icons` = `{cols, size}`, a `main.js` liczy `background-position`. Rozszerzenia znane tylko z historii zostają z adresem URL i `<img loading="lazy">` – tej gałęzi nie usuwaj. Wyświetlany rozmiar ikony w tabeli to 16×16 px.

## Cache i wdrożenie

`public/_headers` (nie jest serwowany, czyta go platforma): bez reguły Cloudflare wysyła `Cache-Control: public, max-age=0, must-revalidate` + ETag, co zostawiamy dla `db.js`, `index.html`, `main.js`, `help.html`, `icons-sprite.css` (nowe dane widoczne od razu po wdrożeniu); długi cache tylko dla `/*.webp` (hashowana nazwa, `immutable`), `/ext-all.js`, `/resources/*`, `/favicon.ico` (7 dni). Reguła z `_headers` zastępuje domyślny nagłówek (sprawdzone w `wrangler dev`). Limity planu darmowego: 20 000 plików i 25 MiB na plik (obecnie ok. 470 plików, `db.js` ok. 8,5 MB); żądania statyczne darmowe i bez limitu. Nie dodawaj Workera przed zasobami (`run_worker_first`): żądania przez Workera liczą się do limitu 100 000/dzień.

## Git

W tym repozytorium commity robi się automatycznie po każdej skończonej, sprawdzonej zmianie (zgoda użytkownika z 2026-11-14): komunikat po polsku, zwięzły, z trailerem `Co-Authored-By`. `git push` i zakładanie repozytorium na GitHubie tylko na prośbę. Nie commituj `node_modules/`, `.wrangler/` ani poświadczeń (tokenów, ciasteczek, plików `.dev.vars*`). Repozytorium jest publiczne: nie umieszczaj w nim niczego prywatnego.

## Pomoc (podręcznik użytkownika)

Okrągły przycisk „?” w prawym górnym rogu belki tytułowej (`#helpBtn`, wstawiany do `#banner` w `main.js`) otwiera okno modalne `<dialog id="help">` z podręcznikiem po angielsku, wpisanym na stałe w `public/index.html` (`showModal()`; zamykanie: Esc, ✕, kliknięcie w tło; obsługa przez delegację zdarzeń `click` na końcu `main.js`). Podręcznik jest krótki celowo (ludzie nie lubią długich instrukcji): zmieniając interfejs (nazwy pól paska, kolumn, domyślne sortowanie, progi rankingu), zaktualizuj też jego treść.
