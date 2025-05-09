# API Endpoint Implementation Plan: POST /films

## 1. Przegląd punktu końcowego

Endpoint służy do tworzenia jednego lub wielu rekordów filmów dla zalogowanego użytkownika. Umożliwiamy dodanie filmów do listy, gdzie każdy rekord zawiera m.in. tytuł, rok, opis, gatunki, aktorów, reżysera, status oraz identyfikator generacji. Endpoint wykorzystuje mechanizmy walidacji danych, obsługi duplikatów oraz transakcyjnego zapisu w bazie danych, przy jednoczesnym zachowaniu bezpieczeństwa i wydajności.

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **Struktura URL**: /films
- **Parametry**:
  - **Wymagane**:
    - `films` (array): Lista obiektów filmowych. Każdy obiekt musi zawierać:
      - `title` (string): Tytuł filmu
      - `year` (number): Rok produkcji (>= 1887)
      - `description` (string): Opis filmu
      - `genres` (array of string): Gatunki filmu
      - `actors` (array of string): Lista aktorów
      - `director` (string): Reżyser filmu
      - `status` (string): Status filmu, możliwe wartości: "to-watch", "watched", "rejected"
      - `generation_id` (number): Identyfikator logu generacji (może być użyty do powiązania z tabelą generation_logs)
  - **Opcjonalne**: Brak dodatkowych opcjonalnych parametrów w specyfikacji.
- **Request Body (przykład)**:

```json
{
  "films": [
    {
      "title": "Inception",
      "year": 2010,
      "description": "A mind-bending thriller.",
      "genres": ["Sci-Fi", "Thriller"],
      "actors": ["Leonardo DiCaprio"],
      "director": "Christopher Nolan",
      "status": "to-watch",
      "generation_id": 123
    },
    {
      "title": "The Dark Knight",
      "year": 2008,
      "description": "Batman faces his greatest challenge.",
      "genres": ["Action", "Drama"],
      "actors": ["Christian Bale", "Heath Ledger"],
      "director": "Christopher Nolan",
      "status": "to-watch",
      "generation_id": 123
    }
  ]
}
```

## 3. Wykorzystywane typy

- **FilmDTO**: Reprezentacja odczytanego rekordu filmu.
- **CreateFilmInput**: Typ wejściowy wykorzystywany do tworzenia rekordu filmu (pomija pola auto-generowane: id, created_at, updated_at, user_id).
- **CreateFilmCommand**: Komenda zawierająca pole `films` jako tablicę filmów do utworzenia.

## 4. Szczegóły odpowiedzi

- **Sukces**:
  - Kod 201 Created
  - Treść odpowiedzi: Tablica utworzonych rekordów filmów (obiekty typu FilmDTO)
- **Błędy**:
  - 400 Bad Request – w przypadku błędnych danych wejściowych (np. nieprawidłowy rok lub status)
  - 409 Conflict – w przypadku konfliktu unikalności (np. duplikat tytułu filmu dla użytkownika)
  - 500 Internal Server Error – dla nieoczekiwanych błędów po stronie serwera

## 5. Przepływ danych

1. Otrzymanie żądania POST /films z payloadem zawierającym tablicę filmów.
2. Walidacja danych wejściowych:
   - Użycie biblioteki Zod do zdefiniowania schematu walidacji,
   - Sprawdzenie, czy `year` jest większy lub równy 1887,
   - Walidacja, czy `status` należy do zbioru dozwolonych wartości: "to-watch", "watched", "rejected".
3. Uwierzytelnienie i autoryzacja użytkownika – identyfikacja `user_id` z kontekstu sesji lub tokena.
4. Weryfikacja unikalności – sprawdzenie, czy filmy o podanych tytułach już nie istnieją dla tego użytkownika.
5. Przeprowadzenie zapisu rekordów w tabeli `user_films` przy użyciu transakcji, co umożliwi atomowy zapis wielu rekordów.
6. Zwrócenie odpowiedzi z kodem 201 oraz informacjami o dodanych rekordach.

## 6. Względy bezpieczeństwa

- **Uwierzytelnienie i autoryzacja**: Wymagane, aby użytkownik był zalogowany. Użycie middleware do weryfikacji tokenu JWT lub sesji.
- **Walidacja danych**: Wykorzystanie Zod dla ochrony przed niewłaściwymi danymi wejściowymi.
- **SQL Injection**: Używanie zapytań parametryzowanych przy komunikacji z bazą danych.
- **Logika biznesowa**: Wdrożenie warstwy serwisowej, która oddziela logikę walidacji i zapisu od logiki kontrolera.
- **Obsługa duplikatów**: Sprawdzanie unikalności tytułu filmu dla danego `user_id`, aby zapobiec konfliktom w bazie.

## 7. Obsługa błędów

- **400 Bad Request**: Przy nieprawidłowych danych wejściowych, walidacja Zod odrzuci żądanie z odpowiednią wiadomością.
- **409 Conflict**: Jeśli zostanie wykryty duplikat tytułu filmu przypisanego do danego użytkownika, endpoint zwróci błąd konfliktu z informacjami, które rekordy spowodowały konflikt.
- **500 Internal Server Error**: W przypadku niespodziewanych błędów, endpoint loguje błąd (np. do konsoli lub systemu logowania), a użytkownik otrzymuje komunikat ogólny o błędzie serwera.

## 8. Rozważania dotyczące wydajności

- **Batch Insertion**: Umożliwienie jednoczesnego zapisu wielu rekordów przy użyciu jednej transakcji, co zmniejszy liczbę połączeń z bazą.
- **Indeksy w bazie**: Upewnienie się, że tabela `user_films` posiada odpowiednie indeksy (np. na `user_id` i `title`) dla szybszego wyszukiwania duplikatów.

## 9. Etapy wdrożenia

1. **Definicja walidacji**:
   - Utworzenie schematu walidacji dla danych wejściowych z wykorzystaniem Zod.
2. **Implementacja endpointa API**:
   - Utworzenie pliku np. `/src/pages/api/films.ts` zawierającego obsługę metody POST.
3. **Middleware uwierzytelniający**:
   - Upewnienie się, że endpoint jest chroniony i użytkownik jest poprawnie identyfikowany.
4. **Warstwa serwisowa**:
   - Ekstrakcja logiki biznesowej do dedykowanego serwisu (np. `/src/lib/services/films.service.ts`), który zajmuje się walidacją, weryfikacją duplikatów oraz zapisem rekordów.
5. **Transakcja bazy danych**:
   - Implementacja zapisu wielu rekordów filmów w ramach jednej transakcji, aby zapewnić atomowość operacji.
