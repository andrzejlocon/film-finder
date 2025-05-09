# Plan wdrożenia endpointu DELETE /films/{filmId}

## 1. Przegląd punktu końcowego
Punkt końcowy umożliwia usunięcie istniejącego wpisu filmu powiązanego z zalogowanym użytkownikiem. Usunięcie odbywa się na podstawie identyfikatora `filmId` i zwraca status 204 po pomyślnym zakończeniu.

## 2. Szczegóły żądania
- Metoda HTTP: DELETE
- Struktura URL: `/api/films/{filmId}`
- Parametry:
  - Wymagane:
    - `filmId` (ścieżka) – identyfikator filmu (liczba całkowita > 0)
  - Opcjonalne: brak
- Body: brak

## 3. Wykorzystywane typy
- `FilmDTO` (z `src/types.ts`)
- Brak dedykowanego `DeleteFilmCommand`; operujemy bezpośrednio na wartości `filmId`

## 3. Szczegóły odpowiedzi
- 204 No Content – pomyślne usunięcie rekordu
- 404 Not Found – brak filmu o podanym `filmId` lub film należy do innego użytkownika
- 400 Bad Request – nieprawidłowy format `filmId` (np. nie liczba)
- 401 Unauthorized – brak uwierzytelnienia użytkownika
- 500 Internal Server Error – nieoczekiwany błąd serwera

## 4. Przepływ danych
1. Klient wysyła żądanie DELETE do `/api/films/{filmId}` z ważną sesją użytkownika.
2. Astro Server Endpoint (w `src/pages/api/films/[filmId].ts`) odczytuje `params` i `locals` (zawierające SupabaseClient i `user.id`).
3. Waliduje `filmId` za pomocą Zod (jako integer > 0).
4. Wywołuje `FilmsService.deleteFilm(userId, filmId)`.
5. W serwisie (`src/lib/services/films.service.ts`):
   - Wykonuje zapytanie do Supabase: `supabase.from('user_films').delete().eq('id', filmId).eq('user_id', userId).single()`.
   - Jeśli nie znaleziono rekordu – rzuca wyjątek HTTPError(404).
6. Endpoint przechwytuje wyjątki i zwraca odpowiedni kod statusu lub 204 No Content przy sukcesie.

## 5. Względy bezpieczeństwa
- Autentykacja: weryfikacja sesji Supabase w `locals` (middleware Astro).
- Autoryzacja: usuwanie tylko zasobów powiązanych z `user.id`.
- Walidacja ścieżki: upewnienie się, że `filmId` jest liczbą całkowitą > 0.
- Izolacja błędów: niewyświetlanie szczegółów wewnętrznych, logowanie w backendzie.

## 6. Obsługa błędów
- 400 Bad Request: niepoprawny lub brak `filmId` w URL.
- 401 Unauthorized: brak lub nieważna sesja użytkownika.
- 404 Not Found: film o danym `id` nie istnieje lub należy do innego użytkownika.
- 500 Internal Server Error: niespodziewane błędy bazy danych lub środowiska.
- Logowanie błędów serwerowych za pomocą `console.error` lub skonfigurowanego loggera.

## 7. Rozważania dotyczące wydajności
- Indeksy bazy danych na kolumnach `user_id` i `id` zapewniają szybkie filtrowanie.
- Prosta operacja DELETE nie generuje dużego obciążenia.
- Możliwość batchowego usuwania w przyszłości, jeśli rośnie liczba rekordów.

## 8. Kroki implementacji
1. Utworzyć plik serwisu: `src/lib/services/films.service.ts`.
2. Zaimplementować klasę `FilmsService` z metodą `deleteFilm(userId: string, filmId: number): Promise<void>`.
3. Utworzyć endpoint Astro: `src/pages/api/films/[filmId].ts`.
4. Dodać `export const prerender = false` i handler `DELETE({ params, locals })`.
5. Walidować `params.filmId` przez Zod i rzutować na `number`.
6. Wywołać `FilmsService.deleteFilm` i obsłużyć HTTPError(404), zwracając 404.
7. Przy sukcesie zwrócić `new Response(null, { status: 204 })`.
8. Obsłużyć inne wyjątki i zwrócić 500.
9. Napisać testy jednostkowe dla serwisu i endpointu (Vitest + Testing Library).