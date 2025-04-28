# Plan implementacji widoku Generowanie rekomendacji

## 1. Przegląd

Widok generowania rekomendacji umożliwia użytkownikowi ustawienie kryteriów wyszukiwania filmów (aktorzy, reżyserzy, gatunki, zakres dat produkcji) oraz wywołanie rekomendacji przy użyciu AI. Wyniki są prezentowane w formie kart filmowych, gdzie użytkownik może modyfikować statusy filmów.

## 2. Routing widoku

Widok będzie dostępny pod adresem `/recommendations`.

## 3. Struktura komponentów

- **RecommendationView** – główny komponent widoku, zarządzający stanem formularza, wyników i interakcjami użytkownika.
  - **CriteriaForm** – formularz do wpisywania kryteriów wyszukiwania.
    - Token input/chips dla: aktorów, reżyserów, gatunków.
    - Pola numeryczne dla zakresu dat produkcji (year_from, year_to).
    - Przycisk "Uzupełnij z profilu" do automatycznego uzupełnienia kryteriów z profilu użytkownika.
  - Przycisk "Rekomendowane filmy" – inicjuje wywołanie API generującego rekomendacje.
  - **RecommendationsList** – lista wyświetlanych kart filmowych:
    - **RecommendationCard** – pojedyncza karta filmu prezentująca tytuł, rok, opis, gatunki, aktorów oraz reżysera. Zawiera ikonki umożliwiające zmianę statusu filmu ("Do obejrzenia", "Obejrzane", "Odrzucone").
  - Przycisk "Zapisz rekomendacje" – umożliwia zapisanie wybranych filmów za pomocą wywołania API.
- **SkeletonLoader** – komponent wyświetlający placeholdery w trakcie ładowania rekomendacji, zastępujący listę kart gdy dane są pobierane.

## 4. Szczegóły komponentów

### RecommendationView

- Opis: Kontener widoku rekomendacji, integrujący formularz, listę rekomendacji oraz obsługę akcji użytkownika.
- Główne elementy: CriteriaForm, RecommendationsList, przyciski akcji (Rekomendowane filmy, Zapisz rekomendacje).
- Obsługiwane interakcje: Inicjowanie zapytań do API, przekazywanie danych między komponentami, zarządzanie stanem wybranych rekomendacji.
- Obsługiwana walidacja: Przekazuje dane walidowane przez CriteriaForm.
- Typy: Korzysta z typów RecommendationCriteriaViewModel oraz RecommendationResponse.
- Propsy: Brak – komponent pełni rolę strony.

### CriteriaForm

- Opis: Formularz umożliwiający wpisanie kryteriów wyszukiwania filmów.
- Główne elementy: Inputy tekstowe (token input/chips) dla aktorów, reżyserów, gatunków oraz pola numeryczne dla `year_from` i `year_to`.
- Obsługiwane interakcje: Wprowadzanie danych, kliknięcie przycisku "Uzupełnij z profilu" (wywołanie funkcji uzupełniającej dane z profilu).
- Walidacja: Sprawdzenie poprawności formatów wpisywanych danych oraz weryfikacja, czy `year_from` jest mniejsze lub równe `year_to` oraz czy `year_from` i `year_to` są większe lub równe 1887 i mniejsze lub równe obecny rok.
- Typy: RecommendationCriteriaViewModel.
- Propsy: Callback do aktualizacji stanu w RecommendationView.

### RecommendationsList

- Opis: Komponent renderujący listę kart filmowych z rekomendacjami.
- Główne elementy: Lista komponentów RecommendationCard.
- Obsługiwane interakcje: Kliknięcia ikon umożliwiających zmianę statusu poszczególnych filmów.
- Walidacja: Brak – prezentacja danych otrzymanych z API.
- Typy: Tablica FilmViewModel.
- Propsy: Przekazywane dane rekomendacji oraz funkcja aktualizująca status filmu.

### RecommendationCard

- Opis: Pojedyncza karta prezentująca informacje o filmie.
- Główne elementy: Wyświetlanie tytułu, roku produkcji, opisu, gatunków, aktorów i reżysera; ikonki do zmiany statusu.
- Obsługiwane interakcje: Kliknięcia ikon statusu, które wywołują callback do aktualizacji statusu.
- Walidacja: Brak.
- Typy: FilmViewModel.
- Propsy: Dane filmu i callback do zmiany statusu.

### SaveRecommendationsButton

- Opis: Przycisk inicjujący bulk zapis rekomendowanych filmów przy użyciu API `/films`.
- Główne elementy: Przycisk wywołujący funkcję zapisu.
- Obsługiwane interakcje: Kliknięcie, które rozpoczyna wywołanie API w celu zapisania rekomendacji.
- Walidacja: Sprawdzenie, czy lista rekomendacji zawiera dane przed wywołaniem API.
- Typy: Tablica FilmViewModel.
- Propsy: Callback do obsługi zapisu rekomendacji.

### SkeletonLoader

- Opis: Komponent wyświetlający szkieletowy widok kart filmowych podczas oczekiwania na dane z API.
- Główne elementy: Zestaw placeholderów symulujących strukturę pojedynczej karty filmowej, stylizowanych przy użyciu Tailwind CSS i/lub komponentów Shadcn/ui.
- Obsługiwane interakcje: Brak interakcji – komponent służy wyłącznie do wizualnej reprezentacji stanu ładowania.
- Walidacja: Brak walidacji danych.
- Typy: Brak koniecznych typów, może przyjmować opcjonalne propsy, takie jak liczba elementów do wyświetlenia.
- Propsy: Opcjonalne `count` określające liczbę placeholderów; ewentualnie dodatkowe ustawienia stylu.

### ErrorAlert

- Opis: Komponent wyświetlający komunikaty o błędach użytkownikowi, prezentując je w formie przyjaznych alertów.
- Główne elementy: Alert z ikoną, tekstem komunikatu oraz przyciskiem umożliwiającym zamknięcie.
- Obsługiwane interakcje: Kliknięcie przycisku zamknięcia ukrywa alert; alert pojawia się dynamicznie w przypadku błędów.
- Walidacja: Brak walidacji; komunikat jest wyświetlany na podstawie stanu błędu przekazywanego przez hook lub rodzica.
- Typy: Może przyjmować propsy typu { message: string; type: 'error' | 'warning' | 'info' | 'success'; onClose?: () => void }.
- Propsy: `message`, `type` oraz opcjonalny callback `onClose`.

## 5. Typy

- **RecommendationCriteriaViewModel**:

  - actors: string[]
  - directors: string[]
  - genres: string[]
  - year_from?: number
  - year_to?: number

- **RecommendationResponse** (odpowiada RecommendationResponseDTO):

  - recommendations: RecommendedFilmDTO[]
  - generation_id: number
  - generated_count: number

- **FilmViewModel** (bazuje na RecommendedFilmDTO, rozszerzony o wybrany status i generation_id):
  - title: string
  - year: number
  - description: string
  - genres: string[]
  - actors: string[]
  - director: string
  - status?: "to-watch" | "watched" | "rejected"
  - generation_id: number

## 6. Zarządzanie stanem

- Użycie hooka `useState` do przechowywania:
  - Stanu formularza (dane z CriteriaForm).
  - Wyników rekomendacji (tablica filmów).
  - Wybranych statusów filmów.
  - Stanów ładowania i błędów.
- Możliwe stworzenie customowego hooka `useRecommendations` do obsługi logiki wywołań API oraz zarządzania stanem całego widoku.

## 7. Integracja API

- **Endpoint `/recommendations` (POST)**:

  - Żądanie: { criteria: RecommendationCriteriaViewModel }
  - Odpowiedź: RecommendationResponse
  - Obsługa błędów: 400 (błędne kryteria) i 500 (błąd wewnętrzny, np. problem z API AI) – wyświetlanie komunikatów inline.

- **Endpoint `/films` (POST)**:
  - Żądanie: { films: FilmViewModel[] }
  - Odpowiedź: Lista utworzonych filmów
  - Obsługa błędów: 400, 409 oraz 500 – wyświetlanie odpowiednich komunikatów użytkownikowi.

## 8. Interakcje użytkownika

- Użytkownik wprowadza kryteria w formularzu (aktorzy, reżyserzy, gatunki, zakres lat).
- Kliknięcie przycisku "Uzupełnij z profilu" automatycznie uzupełnia formularz danymi zapisanymi w profilu.
- Kliknięcie przycisku "Rekomendowane filmy" powoduje wysłanie danych formularza do endpointu `/recommendations` i wyświetlenie wyników w formie kart filmowych.
- Użytkownik może zmieniać status filmu przez kliknięcie odpowiednich ikon na karcie (Do obejrzenia, Obejrzane, Odrzucone).
- Kliknięcie przycisku "Zapisz rekomendacje" uruchamia zapytanie do endpointu `/films`, zapisując wybrane rekomendacje.
- W przypadku wystąpienia błędów (np. problem z API) użytkownik otrzymuje odpowiednie komunikaty.

## 9. Warunki i walidacja

- Formularz waliduje:
  - Czy `year_from` jest mniejsze lub równe `year_to`.
  - Poprawność formatu danych w polach tekstowych (aktorzy, reżyserzy, gatunki).
- Przed wysłaniem żądania do API, dane muszą być poprawnie sformatowane.
- Komunikaty inline informują o błędach walidacji oraz o problemach z API.

## 10. Obsługa błędów

- W przypadku błędów zwracanych przez API (np. 400, 409, 500) wyświetlane są komunikaty informujące użytkownika o zaistniałym problemie.
- Wprowadzenie stanu ładowania blokującego przyciski podczas trwania zapytań API.
- Zapewnienie mechanizmu retry (ponowienia akcji) w sytuacji niepowodzenia wywołań API.

## 11. Kroki implementacji

1. Utworzenie strony pod adresem `/recommendations` oraz głównego komponentu `RecommendationView`.
2. Implementacja komponentu `CriteriaForm` z wykorzystaniem token input/chips i pól numerycznych.
3. Dodanie przycisków "Uzupełnij z profilu" oraz "Rekomendowane filmy" z odpowiednimi callbackami, integrując je z logiką formularza.
4. Stworzenie customowego hooka `useRecommendations` do zarządzania stanem widoku i wywołań API.
5. Implementacja komponentu `RecommendationsList` oraz `RecommendationCard` do prezentacji wyników rekomendacji.
6. Integracja logiki zmiany statusu filmów poprzez kliknięcia na ikonki w komponentach `RecommendationCard`.
7. Implementacja przycisku "Zapisz rekomendacje" i integracja z endpointem `/films` do zapisu rekomendowanych filmów.
8. Dodanie walidacji formularza oraz obsługi komunikatów błędów (inline messages, stany ładowania).
9. Zapewnienie responsywnego designu widoku przy użyciu Tailwind CSS i komponentów Shadcn/ui.
10. Przeprowadzenie testów widoku i wprowadzenie niezbędnych poprawek.
