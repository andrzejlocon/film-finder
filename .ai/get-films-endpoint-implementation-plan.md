# API Endpoint Implementation Plan: GET /films

## 1. Przegląd punktu końcowego
Celem endpointu jest udostępnienie uwierzytelnionemu użytkownikowi paginowanej listy filmów z możliwością filtrowania po statusie, wyszukiwania tekstowego w tytułach oraz kontrolowania wielkości i numeru strony wyników.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Ścieżka URL: `/api/films`
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagane)
- Parametry zapytania:
  - Wymagane: brak (wszystkie parametry są opcjonalne)
  - Opcjonalne:
    - `status`: `to-watch` | `watched` | `rejected`
    - `page`: liczba całkowita >= 1 (domyślnie 1)
    - `limit`: liczba całkowita >= 1 i <= 100 (domyślnie 10)
    - `search`: ciąg znaków do wyszukiwania w tytułach filmów

## 3. Wykorzystywane typy
- `FilmDTO` (z `src/types.ts`): pełne dane filmu.
- `PaginatedResponseDTO<FilmDTO>` (z `src/types.ts`): opakowanie odpowiedzi z listą i metadanymi.
- Zdefiniować typ walidacji zapytania, np. `GetFilmsQuery` (z użyciem Zod).

## 4. Szczegóły odpowiedzi
- Status 200 OK:
  ```json
  {
    "data": [ FilmDTO, FilmDTO, ... ],
    "page": number,
    "limit": number,
    "total": number
  }
  ```
- Inne kody odpowiedzi:
  - 400 Bad Request — nieprawidłowe parametry zapytania
  - 401 Unauthorized — brak lub nieprawidłowy token
  - 500 Internal Server Error — błąd wewnętrzny

## 5. Przepływ danych
1. Middleware / funkcja obsługująca API odczytuje sesję i `userId` z `context.locals.supabase`.
2. Walidacja parametrów zapytania za pomocą Zod.
3. Wywołanie serwisu: `filmsService.getUserFilms(userId, { status, page, limit, search })`.
4. Serwis używa SupabaseClient z `src/db/supabase.client.ts`:
   - Buduje zapytanie do tabeli `user_films`.
   - Filtruje po `user_id` i opcjonalnie po `status`.
   - Jeżeli `search`, dodaje `ilike('title', `%${search}%`)`.
   - Ustawia paginację przez `range()` na podstawie `page` i `limit`.
   - Odczytuje dane i całkowitą liczbę (`count`).
5. Zwrócenie wyników w formacie `PaginatedResponseDTO<FilmDTO>`.

## 6. Względy bezpieczeństwa
- Autoryzacja: endpoint dostępny tylko dla zalogowanego użytkownika; weryfikacja tokena JWT po stronie Supabase.
- SQL Injection: zapytania budowane przez Supabase są bezpieczne.
- Rate limiting (opcjonalnie) do ochrony przed nadużyciami.

## 7. Obsługa błędów
- **400 Bad Request**: jeśli Zod wyrzuci błąd walidacji parametrów.
- **401 Unauthorized**: brak sesji lub nieprawidłowa autoryzacja.
- **404 Not Found**: (opcjonalne) w przypadku gdy strona przekracza liczbę dostępnych rekordów – można zwrócić pustą listę zamiast 404.
- **500 Internal Server Error**: w przypadku problemów z połączeniem do bazy danych lub nieprzewidzianych wyjątków.
  - Logowanie błędu: `console.error(error)` lub dedykowany logger.

## 8. Rozważania dotyczące wydajności
- Indeks na kolumnie `user_id` oraz `status`.
- Pełnotekstowe wyszukiwanie na `title` (opcjonalnie: GIN + `pg_trgm`).
- Ograniczenie maksymalnego rozmiaru `limit` (np. 100) by uniknąć bardzo dużych zapytań.

## 9. Kroki implementacji
1. Utworzyć lub zaimportować plik serwisu: `src/lib/services/films.service.ts`.
2. Zdefiniować w serwisie metodę `getUserFilms(userId, filters)` realizującą zapytanie Supabase.
3. Opracować schemat Zod: `src/lib/schemas/getFilmsQuery.ts`.
4. Utworzyć endpoint Astro w `src/pages/api/films.ts`:
   - `export const GET`
   - Odczyt `userId` i `supabase` z `context.locals`
   - Walidacja parametrów
   - Wywołanie serwisu i zwrócenie odpowiedzi
5. Dodać obsługę błędów i odpowiednie kody statusu.

---
*Plik: .ai/get-films-endpoint-implementation-plan.md* 