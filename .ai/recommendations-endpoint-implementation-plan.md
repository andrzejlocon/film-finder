# API Endpoint Implementation Plan: Recommendations Endpoint

## 1. Przegląd punktu końcowego

Punkt końcowy umożliwia generowanie rekomendacji filmowych przy użyciu AI. Użytkownik może przekazać własne kryteria lub skorzystać z zapisanych preferencji. Punkt końcowy integruje się z Supabase do uwierzytelniania i komunikacji z bazą danych oraz z usługą AI do generowania rekomendacji.

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **URL**: /recommendations
- **Parametry**:
  - **Wymagane**: Brak, ponieważ przekazanie kryteriów jest opcjonalne.
  - **Opcjonalne**:
    - `criteria`: Obiekt zawierający kryteria rekomendacji, którego struktura wygląda następująco:
      ```json
      {
        "actors": ["Leonardo DiCaprio"],
        "directors": ["Christopher Nolan"],
        "genres": ["Sci-Fi"],
        "year_from": 2000,
        "year_to": 2020
      }
      ```
- **Request Body**: JSON (przykład jak powyżej)

## 3. Wykorzystywane typy

- **DTOs**:
  - `RecommendedFilmDTO`: Obiekt zawierający `title`, `year`, `description`, `genres`, `actors`, `director`.
  - `RecommendationResponseDTO`: Obejmuje listę rekomendowanych filmów oraz metadane generacji, takie jak model, czas generacji, liczba wygenerowanych rekomendacji.
- **Command Modele**:
  - `RecommendationCriteriaCommand`: Zawiera opcjonalny obiekt `criteria` typu `RecommendationCriteria`.

## 4. Szczegóły odpowiedzi

- **Kod sukcesu**: 200 OK
- **Response Body**: JSON z następującą strukturą:
  - `recommendations`: Tablica obiektów typu `RecommendedFilmDTO`.
  - `generation_id`: ID generacji
  - `generated_count`: Ilość generacji

## 5. Przepływ danych

1. Klient wysyła żądanie POST na `/recommendations` z opcjonalnym polem `criteria`.
2. Endpoint weryfikuje dane wejściowe za pomocą schematu walidacji (np. Zod).
3. Jeśli `criteria` nie zostały przekazane, system pobiera preferencje użytkownika z tabeli `user_preferences`.
4. Logika generowania rekomendacji jest wyodrębniona do serwisu (np. `recommendation.service`).
5. Serwis wywołuje zewnętrzne API AI, aby uzyskać rekomendacje na podstawie przekazanych kryteriów lub preferencji.
6. Po otrzymaniu rekomendacji, sprawdzane jest czy użytkownik już posiada dany film w swojej kolekcji. Jeśli tak, film jest usuwany z listy rekomendacji.
7. Wyniki generacji są zapisywane w tabeli `generation_logs`; w przypadku błędów odpowiedni wpis trafia do `generation_error_logs`.
8. System zwraca odpowiedź 200 OK wraz z przefiltrowaną listą rekomendacji oraz metadanymi.

## 6. Względy bezpieczeństwa

- Uwierzytelnianie: Endpoint wymaga weryfikacji tokena uwierzytelniającego (np. Supabase auth) przy użyciu middleware.
- Autoryzacja: Sprawdzanie poprawności dostępu do danych użytkownika.
- Walidacja: Dane wejściowe są walidowane przy użyciu Zod, co chroni przed nieprawidłowymi lub złośliwymi danymi.
- Ochrona danych: Wrażliwe dane nie są logowane ani zwracane w odpowiedzi.

## 7. Obsługa błędów

- **400 Bad Request**: Zwrot w przypadku niepoprawnych danych wejściowych (np. niepoprawny format critera).
- **401 Unauthorized**: Zwrot, jeżeli użytkownik nie jest uwierzytelniony lub token jest nieprawidłowy.
- **500 Internal Server Error**: Zwrot w przypadku błędów serwera lub awarii zewnętrznego API AI.
- Logowanie błędów do tabeli `generation_error_logs` dla dalszej analizy.

## 8. Rozważania dotyczące wydajności

- Użycie asynchronicznego przetwarzania przy wywołaniu API AI, aby nie blokować głównego wątku.
- Możliwość zastosowania cache'owania wyników dla identycznych kryteriów, aby ograniczyć liczbę wywołań API AI.
- Optymalizacja zapytań do bazy danych i użycie indeksów na kluczowych polach.
- Wykorzystanie Set dla szybkiego wyszukiwania duplikatów filmów, które użytkownik już posiada.

## 9. Etapy wdrożenia

1. Utworzenie schematu walidacji wejściowych za pomocą Zod zgodnie z typami `RecommendationCriteria` i `RecommendationCriteriaCommand`.
2. Implementacja serwisu `recommendation.service`:
   - Pobranie kryteriów z żądania lub preferencji użytkownika.
   - Integracja z AI API do generowania rekomendacji.
   - Filtrowanie wynikowych rekomendacji, usuwając filmy, które już znajdują się w kolekcji użytkownika.
   - Rejestracja wyników w tabeli `generation_logs` oraz błędów w `generation_error_logs`.
3. Implementacja middleware do obsługi uwierzytelniania użytkownika poprzez Supabase Auth.
4. Stworzenie endpointu POST `/recommendations` w katalogu `src/pages/api`:
   - Przekazanie żądania do serwisu rekomendacji.
   - Obsługa odpowiedzi i błędów zgodnie z ustalonymi zasadami.
