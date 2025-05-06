# Plan wdrożenia punktu końcowego API: POST /films/{filmId}/status

## 1. Przegląd punktu końcowego
Punkt końcowy umożliwia użytkownikowi zaktualizowanie statusu filmu ("to-watch", "watched" lub "rejected") i automatyczne zapisanie historii zmiany w tabeli `film_status_logs`.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Ścieżka: `/films/{filmId}/status`
- Parametry ścieżki:
  - `filmId` (BIGINT) – identyfikator filmu do zmodyfikowania (wymagany).
- Treść żądania (JSON):
  ```json
  {
    "new_status": "watched"
  }
  ```
- DTO żądania: `UpdateFilmStatusCommand`

## 3. Szczegóły odpowiedzi
- Status HTTP: 200 OK
- Body (JSON): Zaktualizowany obiekt filmu, zgodny z `FilmDTO`:
  ```json
  {
    "id": 123,
    "user_id": "uuid-...",
    "title": "Example Film",
    "year": 2023,
    "description": "...",
    "genres": ["Action"],
    "actors": ["Actor A"],
    "director": "Director A",
    "status": "watched",
    "created_at": "2023-01-...",
    "updated_at": "2023-06-...",
    "generation_id": null
  }
  ```
- DTO odpowiedzi: `FilmDTO`

## 4. Przepływ danych
1. **Routing i uwierzytelnienie**
   - Handler Astro w `src/pages/api/films/[filmId]/status.ts` (export const POST).
   - `export const prerender = false`.
   - Pobranie `userId` z `context.locals` (Supabase).
2. **Walidacja**
   - Zod schema dla `filmId` (ścieżka) i `new_status` (body).
3. **Logika serwisowa**
   - Funkcja `updateFilmStatus(userId: string, filmId: number, newStatus: FilmStatus)` w `src/lib/services/film.service.ts`:
     1. Pobierz rekord filmu: `from('user_films').select('*').eq('id', filmId).eq('user_id', userId).single()`.
     2. Jeśli brak wyniku → rzuć NotFoundError.
     3. W transakcji (jeśli wspierane) lub sekwencyjnie:
        - Zaktualizuj status w `user_films` (`update .eq('id', filmId)`).
        - Wstaw wpis do `film_status_logs` z polami `prev_status`, `next_status`, `user_id`, `film_id`.
     4. Zwróć zaktualizowany rekord filmu.
4. **Odpowiedź**
   - Sformatuj i zwróć JSON z kodem 200.

## 5. Względy bezpieczeństwa
- **Uwierzytelnianie**: Wymagany token Supabase, `locals.user` musi być obecne.
- **Autoryzacja**: Zweryfikuj, czy film należy do zalogowanego użytkownika.
- **Walidacja**: Zod chroni przed nieprawidłowymi wartościami.
- **Ochrona przed atakami**: Korzystanie z Supabase SDK eliminuje ręczne tworzenie zapytań SQL.
- **Ograniczanie liczby żądań**: Opcjonalne middleware Astro do kontrolowania liczby wywołań.

## 6. Obsługa błędów
| Scenariusz                                      | Kod HTTP | Opis                              |
|-------------------------------------------------|----------|-----------------------------------|
| Niepoprawny JSON lub brak `new_status`          | 400      | Niepoprawne żądanie – walidacja Zod |
| Nieparsowalny lub niedozwolony `filmId`         | 400      | Niepoprawne żądanie               |
| Film nie istnieje lub nie należy do użytkownika | 404      | Nie znaleziono                    |
| Brak uwierzytelnienia                           | 401      | Nieautoryzowany                   |
| Błąd bazy danych lub nieoczekiwany wyjątek       | 500      | Błąd wewnętrzny serwera           |

## 7. Wydajność
- Minimalna liczba zapytań: 1 SELECT + 1 UPDATE + 1 INSERT log (ewentualnie w transakcji).
- Indeksy na kolumnach `id` i `user_id` zapewniają szybkie wyszukiwanie.
- Unikać zbędnych danych w SELECT (wybieraj tylko wymagane kolumny).
- Możliwość batchowania w przyszłości, jeśli zajdzie potrzeba masowych aktualizacji.

## 8. Kroki implementacji
1. **Dodanie schematu Zod**: utworzyć `src/lib/schemas/film.ts` ze schematem `updateStatusSchema`.
2. **Serwis**: dodać funkcję `updateFilmStatus` w `src/lib/services/film.service.ts`.
3. **API Handler**: utworzyć `src/pages/api/films/[filmId]/status.ts`:
   - Wyłączyć prerendering.
   - Wczytać i zwalidować `filmId` oraz treść żądania.
   - Wywołać serwis i zwrócić wynik.
4. **Testy jednostkowe** (Vitest + Testing Library): pokryć przypadki:
   - Sukces.
   - Nieprawidłowy status.
   - Film nie znaleziony.
   - Brak autoryzacji.
