# Plan implementacji widoku Filmów (`/films`)

## 1. Przegląd
Widok `/films` umożliwia zalogowanym użytkownikom przeglądanie i zarządzanie swoją kolekcją filmów. Filmy są kategoryzowane jako "Do obejrzenia", "Obejrzane" i "Odrzucone". Użytkownicy mogą zmieniać status filmów, usuwać je (po potwierdzeniu), wyszukiwać tekstowo oraz korzystać z mechanizmu "infinite scroll" do ładowania kolejnych pozycji. Widok kładzie nacisk na szybki dostęp do informacji, intuicyjną obsługę oraz dynamiczne aktualizacje list, z uwzględnieniem zasad dostępności.

## 2. Routing widoku
- **Ścieżka**: `/films`
- **Dostęp**: Wymaga uwierzytelnienia użytkownika. Niezalogowani użytkownicy powinni być przekierowywani na stronę logowania.

## 3. Struktura komponentów
```
src/
├── pages/
│   └── films.astro         # Główny plik strony Astro, obsługa routingu i uwierzytelnienia
└── components/
    ├── films/                          # Komponenty specyficzne dla widoku /films
    │   ├── FilmManagementView.tsx      # Główny komponent React zarządzający logiką widoku
    │   ├── FilmTabs.tsx                # Komponent zakładek do filtrowania filmów wg statusu
    │   ├── FilmSearchInput.tsx         # Komponent pola wyszukiwania tekstowego
    │   ├── FilmList.tsx                # Komponent wyświetlający listę filmów z infinite scroll
    │   ├── FilmCard.tsx                # Komponent karty pojedynczego filmu (wygląd jak RecommendationCard + ikona usuwania)
    │   ├── FilmCardSkeleton.tsx        # Komponent szkieletu pojedynczej karty filmu (wzorowany na SkeletonLoader/FilmCard)
    │   └── ConfirmDeleteDialog.tsx     # Komponent modala potwierdzenia usunięcia filmu
    └── ui/                             # Istniejące komponenty UI (np. Shadcn/ui)
    └── recommendations/                # Istniejące komponenty rekomendacji
        ├── RecommendationCard.tsx      # Istniejący komponent karty rekomendacji (referencja dla wyglądu FilmCard)
        └── SkeletonLoader.tsx          # Istniejący komponent do wyświetlania wielu szkieletów (inspiracja dla FilmCardSkeleton)
```

**Hierarchia:**
```
FilmsPage.astro
└── FilmManagementView.tsx
    ├── FilmTabs.tsx
    ├── FilmSearchInput.tsx
    ├── FilmList.tsx
    │   ├── FilmCard.tsx (xN)
    │   └── FilmCardSkeleton.tsx (xN, warunkowo)
    └── ConfirmDeleteDialog.tsx (warunkowo)
```

## 4. Szczegóły komponentów

### `FilmsPage.astro`
- **Opis**: Główny plik strony Astro dla ścieżki `/films`. Odpowiada za sprawdzenie sesji użytkownika i renderowanie komponentu `FilmManagementView` po stronie klienta.
- **Główne elementy**: Layout aplikacji, logika sprawdzania `locals.user`. Jeśli użytkownik nie jest zalogowany, następuje przekierowanie do strony logowania. Renderuje `<FilmManagementView client:load />`.
- **Obsługiwane interakcje**: Brak bezpośrednich interakcji użytkownika.
- **Obsługiwana walidacja**: Sprawdzenie istnienia aktywnej sesji użytkownika.
- **Typy**: Astro `Props`.
- **Propsy**: Brak.

### `FilmManagementView.tsx`
- **Opis**: Główny komponent React zarządzający stanem i logiką widoku zarządzania filmami. Odpowiada za pobieranie danych, filtrowanie, wyszukiwanie oraz koordynację akcji zmiany statusu i usuwania filmów.
- **Główne elementy**: `FilmTabs`, `FilmSearchInput`, `FilmList`, `ConfirmDeleteDialog`.
- **Obsługiwane interakcje**: Zmiana aktywnej zakładki (statusu), wprowadzanie tekstu w polu wyszukiwania, inicjowanie ładowania kolejnych filmów, otwieranie dialogu potwierdzenia usunięcia.
- **Obsługiwana walidacja**: Brak bezpośredniej walidacji pól formularza; walidacja parametrów żądań API (np. `filmId`, `status`) jest zapewniana przez typy i logikę wywołań.
- **Typy**: `FilmDTO[]`, `FilmStatus`, `string` (dla searchQuery), `boolean` (loading states), `PaginationInfo` (page, totalPages, etc.), `{ id: number; title: string } | null` (dla `filmToDelete`).
- **Propsy**: Brak (jest to komponent najwyższego poziomu renderowany przez Astro).

### `FilmTabs.tsx`
- **Opis**: Wyświetla zakładki ("Do obejrzenia", "Obejrzane", "Odrzucone") umożliwiające filtrowanie listy filmów według ich statusu.
- **Główne elementy**: Komponent `Tabs` z Shadcn/ui (`Tabs`, `TabsList`, `TabsTrigger`).
- **Obsługiwane interakcje**: Kliknięcie na zakładkę.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `FilmStatus`.
- **Propsy**:
    - `selectedStatus: FilmStatus`
    - `onStatusChange: (status: FilmStatus) => void`

### `FilmSearchInput.tsx`
- **Opis**: Proste pole tekstowe do wyszukiwania filmów na podstawie tytułu.
- **Główne elementy**: Komponent `Input` z Shadcn/ui, opcjonalnie ikona wyszukiwania.
- **Obsługiwane interakcje**: Wprowadzanie tekstu.
- **Obsługiwana walidacja**: Brak (można dodać np. minimalną długość zapytania po stronie klienta, ale API powinno obsłużyć puste zapytanie).
- **Typy**: `string`.
- **Propsy**:
    - `searchQuery: string`
    - `onSearchQueryChange: (query: string) => void` (funkcja powinna być debounced w komponencie nadrzędnym lub w custom hooku)

### `FilmList.tsx`
- **Opis**: Wyświetla listę komponentów `FilmCard` lub `FilmCardSkeleton`. Implementuje logikę "infinite scroll" do dynamicznego doładowywania filmów.
- **Główne elementy**: Kontener `div` mapujący listę filmów na komponenty `FilmCard`. Element `div` (ref) na końcu listy do wykrywania przez `IntersectionObserver`. Warunkowe renderowanie `FilmCardSkeleton`.
- **Obsługiwane interakcje**: Scrollowanie listy (wywołuje `onLoadMore` przy osiągnięciu końca). Przekazuje zdarzenia z `FilmCard` do `FilmManagementView`.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `FilmDTO[]`.
- **Propsy**:
    - `films: FilmDTO[]`
    - `isLoading: boolean` (czy trwa ładowanie / filtrowanie)
    - `isLoadingMore: boolean` (czy trwa doładowywanie kolejnej strony)
    - `hasMore: boolean` (czy są jeszcze filmy do załadowania)
    - `onLoadMore: () => void`
    - `onFilmStatusChange: (filmId: number, newStatus: FilmStatus) => void`
    - `onFilmDeleteRequest: (filmId: number, filmTitle: string) => void`
    - `limitPerPage: number` (do wyświetlania odpowiedniej liczby skeletonów)

### `FilmCard.tsx`
- **Opis**: Wyświetla szczegóły pojedynczego filmu oraz umożliwia interakcje (zmiana statusu, usunięcie). Wygląd i struktura komponentu powinny być identyczne jak w istniejącym `RecommendationCard.tsx`, z dodatkową ikoną usuwania.
- **Główne elementy**: Komponent `Card` z Shadcn/ui jako kontener. Struktura wewnętrzna ( `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` z sekcjami na opis, gatunki, reżysera, aktorów oraz `CardFooter` z przyciskami zmiany statusu) będzie replikować `RecommendationCard.tsx`. Dodatkowo, w prawym górnym rogu `CardHeader` (lub w innym odpowiednim miejscu) znajdzie się przycisk z ikoną "śmietnika" (np. `Trash2` z `lucide-react`) do inicjowania usuwania filmu. Stylizacja `getStatusStyles` z `RecommendationCard` zostanie zaadaptowana.
- **Obsługiwane interakcje**: Kliknięcie przycisków zmiany statusu (identycznie jak w `RecommendationCard`), kliknięcie ikony/przycisku "Usuń".
- **Obsługiwana walidacja**: Zapewnia, że przekazywany `newStatus` jest prawidłowym typem `FilmStatus`.
- **Typy**: `FilmDTO`, `FilmStatus` (dla `currentStatus` i logiki stylów).
- **Propsy**:
    - `film: FilmDTO`
    - `onStatusChange: (filmId: number, newStatus: FilmStatus) => void`
    - `onDeleteRequest: (filmId: number, filmTitle: string) => void`
    - `currentStatus: FilmStatus` (potrzebne do stylizacji przycisków statusu, pobierane z `film.status`)

### `FilmCardSkeleton.tsx`
- **Opis**: Komponent wyświetlający szkielet (placeholder) pojedynczej karty filmu podczas ładowania danych. Struktura szkieletu powinna odpowiadać finalnemu wyglądowi `FilmCard.tsx` (który jest wzorowany na `RecommendationCard.tsx`).
- **Główne elementy**: Komponenty `Skeleton` z Shadcn/ui imitujące pełną strukturę `FilmCard.tsx` (nagłówek z miejscem na tytuł, rok i ikonę usuwania; treść z opisem, gatunkami, reżyserem, aktorami; stopka z miejscem na przyciski akcji).
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak.
- **Propsy**: Brak.

### `ConfirmDeleteDialog.tsx`
- **Opis**: Modal dialogowy z prośbą o potwierdzenie operacji usunięcia filmu.
- **Główne elementy**: Komponent `AlertDialog` lub `Dialog` z Shadcn/ui (`AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`).
- **Obsługiwane interakcje**: Kliknięcie przycisku "Potwierdź usunięcie", kliknięcie przycisku "Anuluj".
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak.
- **Propsy**:
    - `isOpen: boolean`
    - `filmTitle: string`
    - `onConfirm: () => void`
    - `onCancel: () => void`

## 5. Typy
Kluczowe typy pochodzą z `src/types.ts` oraz są definiowane lokalnie w komponentach lub hookach.

- **`FilmDTO`**: (z `src/types.ts`) Reprezentuje obiekt filmu z bazy danych.
  ```typescript
  export type FilmDTO = {
    id: number;
    user_id: string;
    title: string;
    year: number | null;
    description: string | null;
    genres: string[] | null;
    actors: string[] | null;
    director: string | null;
    status: FilmStatus; // "to-watch" | "watched" | "rejected"
    created_at: string;
    updated_at: string;
  };
  ```
- **`FilmStatus`**: (z `src/types.ts`) Typ wyliczeniowy dla statusu filmu.
  ```typescript
  export type FilmStatus = "to-watch" | "watched" | "rejected";
  ```
- **`UpdateFilmStatusCommand`**: (z `src/types.ts`) Obiekt żądania zmiany statusu filmu.
  ```typescript
  export interface UpdateFilmStatusCommand {
    new_status: FilmStatus;
  }
  ```
- **`PaginatedResponseDTO<T>`**: (z `src/types.ts`) Generyczny typ odpowiedzi dla paginowanych list.
  ```typescript
  export interface PaginatedResponseDTO<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
  }
  ```
- **`FilmDisplayData` (ViewModel)**: Typ dla danych wyświetlanych przez `FilmCardDetails.tsx`. Może być podzbiorem `FilmDTO` lub `RecommendedFilmDTO`.
  ```typescript
  export interface FilmDisplayData {
    title: string;
    year: number | null;
    description: string | null;
    genres: string[] | null;
    director: string | null;
    actors: string[] | null;
  }
  ```
- **`FilmManagementFilters` (ViewModel)**: Typ pomocniczy dla stanu filtrów w `FilmManagementView`.
  ```typescript
  interface FilmManagementFilters {
    status: FilmStatus; // Zawsze wybrany jest jakiś status, domyślnie "to-watch"
    search: string;
    page: number;
  }
  ```
- **`FilmToDelete` (ViewModel)**: Typ dla przechowywania informacji o filmie do usunięcia.
  ```typescript
  interface FilmToDelete {
    id: number;
    title: string;
  }
  ```

## 6. Zarządzanie stanem
Stan będzie zarządzany głównie w komponencie `FilmManagementView.tsx` przy użyciu hooków React (`useState`, `useEffect`, `useCallback`). Dla bardziej złożonej logiki pobierania danych i zarządzania stanem filmów (ładowanie, paginacja, filtrowanie, aktualizacje) zostanie stworzony custom hook `useFilms`.

- **Stan w `FilmManagementView.tsx`**:
    - `films: FilmDTO[]`: Aktualnie wyświetlana lista filmów.
    - `selectedStatus: FilmStatus`: Aktualnie wybrana zakładka/status (np. "to-watch").
    - `searchQuery: string`: Aktualne zapytanie wyszukiwania.
    - `debouncedSearchQuery: string`: Wartość `searchQuery` po debouncingu.
    - `currentPage: number`: Numer bieżącej strony dla aktywnej listy.
    - `totalFilms: number`: Całkowita liczba filmów dla bieżących filtrów.
    - `isLoading: boolean`: Czy trwa początkowe ładowanie lub zmiana głównego filtra.
    - `isLoadingMore: boolean`: Czy trwa doładowywanie filmów (infinite scroll).
    - `error: string | null`: Komunikat błędu API.
    - `filmToDelete: FilmToDelete | null`: Przechowuje dane filmu, którego usunięcie oczekuje na potwierdzenie.

- **Custom Hook: `useFilms`**
    - **Cel**: Enkapsulacja logiki związanej z filmami: pobieranie, paginacja, zmiana statusu, usuwanie.
    - **Zarządzane stany wewnętrzne (lub przekazywane jako argumenty/zwracane wartości)**: `films`, `currentPage`, `totalFilms`, `isLoading`, `isLoadingMore`, `error`.
    - **Funkcje**:
        - `fetchFilms(filters: FilmManagementFilters, concatResults: boolean)`: Pobiera filmy.
        - `loadMoreFilms()`: Pobiera kolejną stronę filmów.
        - `updateFilmStatusOnServer(filmId: number, newStatus: FilmStatus)`: Aktualizuje status filmu na serwerze.
        - `deleteFilmOnServer(filmId: number)`: Usuwa film na serwerze.
    - **Zwraca**: `films`, `currentPage`, `totalFilms`, `isLoading`, `isLoadingMore`, `error`, `hasMore`, oraz powyższe funkcje.

Alternatywnie, dla bardziej globalnego stanu lub jeśli stan będzie współdzielony z innymi częściami aplikacji, można rozważyć użycie Zustand lub React Context API. Na tym etapie `useState` w połączeniu z custom hookiem wydaje się wystarczające.

## 7. Integracja API
Komunikacja z backendem będzie realizowana poprzez standardowe wywołania `fetch` API (lub dedykowaną funkcję-wrapper `apiClient.ts`).

- **`GET /api/films`**: Pobieranie listy filmów.
    - **Żądanie**:
        - Query params: `status: FilmStatus`, `search?: string`, `page?: number`, `limit?: number`.
    - **Odpowiedź (sukces 200)**: `PaginatedResponseDTO<FilmDTO>`.
    - **Odpowiedź (błąd)**: Standardowe kody HTTP (401, 400, 500) z obiektem JSON `{ error: string, details?: any }`.
- **`POST /api/films/{filmId}/status`**: Aktualizacja statusu filmu.
    - **Żądanie**:
        - Path param: `filmId: number`.
        - Body: `UpdateFilmStatusCommand` (np. `{ "new_status": "watched" }`).
    - **Odpowiedź (sukces 200)**: `FilmDTO` (zaktualizowany obiekt filmu).
    - **Odpowiedź (błąd)**: 400 (invalid data), 401 (unauthorized), 404 (not found), 500.
- **`DELETE /api/films/{filmId}`**: Usunięcie filmu.
    - **Żądanie**:
        - Path param: `filmId: number`.
    - **Odpowiedź (sukces 204)**: Brak zawartości.
    - **Odpowiedź (błąd)**: 401 (unauthorized), 404 (not found), 500.

Należy obsłużyć stany ładowania i błędy dla każdego wywołania API.

## 8. Interakcje użytkownika
- **Wybór zakładki statusu**:
    - Użytkownik klika na zakładkę ("Do obejrzenia", "Obejrzane", "Odrzucone").
    - `selectedStatus` jest aktualizowany.
    - Wywoływane jest `fetchFilms` z nowym statusem i stroną 1. Lista filmów jest odświeżana.
- **Wpisywanie w polu wyszukiwania**:
    - Użytkownik wpisuje tekst.
    - `searchQuery` jest aktualizowane. Po upływie czasu debounce, `debouncedSearchQuery` jest aktualizowane.
    - Wywoływane jest `fetchFilms` z bieżącym `selectedStatus`, `debouncedSearchQuery` i stroną 1. Lista filmów jest odświeżana.
- **Scrollowanie listy**:
    - Użytkownik scrolluje listę. Gdy dotrze do końca (i `hasMore` jest `true` oraz nie trwa `isLoadingMore`), wywoływane jest `loadMoreFilms`.
    - `isLoadingMore` ustawiane na `true`. Wyświetlane są `FilmCardSkeleton`.
    - Pobierana jest kolejna strona filmów i dołączana do istniejącej listy. `isLoadingMore` ustawiane na `false`.
- **Zmiana statusu filmu na karcie**:
    - Użytkownik wybiera nowy status dla filmu na `FilmCard`.
    - Wywoływane jest `updateFilmStatusOnServer`.
    - Optymistyczna aktualizacja UI (opcjonalnie): film może zmienić wygląd lub zostać przeniesiony/usunięty z listy przed odpowiedzią serwera.
    - Po odpowiedzi serwera:
        - Sukces: Stan UI jest potwierdzany. Jeśli film zmienił status, który jest aktualnie filtrowany, może zniknąć z listy (wymaga ponownego przefiltrowania/pobrania listy lub inteligentnego zarządzania stanem).
        - Błąd: Optymistyczna aktualizacja jest wycofywana, wyświetlany jest błąd.
- **Kliknięcie "Usuń" na karcie filmu**:
    - Wyświetlany jest `ConfirmDeleteDialog` z tytułem filmu. `filmToDelete` jest ustawiany.
- **Potwierdzenie usunięcia w dialogu**:
    - Wywoływane jest `deleteFilmOnServer`.
    - Optymistyczna aktualizacja UI: film jest usuwany z listy.
    - Po odpowiedzi serwera:
        - Sukces (204): Stan UI jest potwierdzany.
        - Błąd: Optymistyczna aktualizacja jest wycofywana, film jest przywracany na listę, wyświetlany jest błąd.
- **Anulowanie usunięcia w dialogu**:
    - Dialog jest zamykany, `filmToDelete` jest czyszczony. Brak akcji API.

## 9. Warunki i walidacja
- **Uwierzytelnienie**: `FilmsPage.astro` sprawdza, czy `locals.user` istnieje. Jeśli nie, przekierowuje do `/login`. Wszystkie endpointy API również weryfikują uwierzytelnienie.
- **Parametry API**:
    - `GET /films`: `status` musi być jednym z `FilmStatus`. `page`, `limit` muszą być liczbami dodatnimi. `search` jest opcjonalnym stringiem. Te warunki są głównie walidowane po stronie backendu (Zod schemas), ale frontend powinien wysyłać poprawne typy.
    - `POST /films/{filmId}/status`: `filmId` musi być liczbą dodatnią. `new_status` w ciele żądania musi być jednym z `FilmStatus`. Walidacja backendowa.
    - `DELETE /films/{filmId}`: `filmId` musi być liczbą dodatnią. Walidacja backendowa.
- **Interfejs użytkownika**:
    - Zmiana statusu: Dostępne opcje statusów w `FilmCard` powinny być ograniczone do validnych `FilmStatus`.
    - Pole wyszukiwania: Może być puste.
    - Nie ma złożonych formularzy wymagających walidacji po stronie klienta przed wysłaniem, poza zapewnieniem poprawności typów przekazywanych do funkcji API.

## 10. Obsługa błędów
- **Błędy sieciowe / serwera (np. 500)**:
    - W `useFilms` (lub bezpośrednio w `FilmManagementView`), przechwytywać błędy z `fetch`.
    - Ustawiać stan `error` na odpowiedni komunikat (np. "Wystąpił błąd podczas komunikacji z serwerem. Spróbuj ponownie później.").
    - Wyświetlać komunikat błędu użytkownikowi (np. za pomocą komponentu Alert z Shadcn/ui lub Toast).
- **Brak autoryzacji (401)**:
    - `FilmsPage.astro` przekieruje na stronę logowania.
    - Jeśli sesja wygaśnie podczas korzystania z widoku, API zwróci 401. Można wtedy wyświetlić komunikat "Sesja wygasła, zaloguj się ponownie" i opcjonalnie przekierować.
- **Błędy walidacji (400)**:
    - Zazwyczaj nie powinny wystąpić, jeśli frontend wysyła poprawne dane. Jeśli jednak API zwróci 400 z `details`, można spróbować wyświetlić bardziej szczegółowy komunikat. W przeciwnym razie, ogólny komunikat "Nieprawidłowe żądanie".
- **Nie znaleziono zasobu (404)** (np. przy próbie aktualizacji/usunięcia nieistniejącego filmu):
    - Usunąć film z lokalnej listy (jeśli jeszcze tam jest).
    - Wyświetlić komunikat np. "Film nie został znaleziony lub nie masz uprawnień do tej operacji."
- **Brak wyników**:
    - Jeśli `fetchFilms` zwróci pustą listę (`data: []`), `FilmList` powinien wyświetlić komunikat "Nie znaleziono filmów pasujących do kryteriów." zamiast pustej przestrzeni. To nie jest błąd, a stan pusty.

## 11. Kroki implementacji
1.  **Struktura plików i folderów**: Utworzyć pliki `.astro` i `.tsx` dla wszystkich zdefiniowanych komponentów w odpowiednich katalogach (np. `src/components/films`).
2.  **`FilmsPage.astro`**: Implementacja logiki sprawdzania sesji i renderowania `<FilmManagementView client:load />`.
3.  **Typy**: Zdefiniować lub zaimportować wszystkie wymagane typy (`FilmDTO`, `FilmStatus`, `PaginatedResponseDTO`, ViewModels).
4.  **`FilmCard.tsx`**: Zaimplementować komponent, replikując strukturę i style z `RecommendationCard.tsx`. Dodać ikonę/przycisk usuwania w prawym górnym rogu. Podłączyć logikę stylizacji `getStatusStyles` na podstawie `film.status`.
5.  **`FilmCardSkeleton.tsx`**: Zaimplementować komponent szkieletu pojedynczej karty, wzorując się na strukturze jednego elementu z `SkeletonLoader.tsx` i dopasowując do finalnej struktury `FilmCard.tsx`.
6.  **Podstawowe komponenty UI (Shadcn/ui)**: Zaimplementować szkielety pozostałych komponentów: `FilmManagementView`, `FilmTabs`, `FilmSearchInput`, `FilmList`, `ConfirmDeleteDialog`. Użyć komponentów Shadcn/ui i Tailwind CSS.
7.  **Custom Hook `useFilms` (lub logika w `FilmManagementView`) - Fetching**:
    - Zaimplementować logikę pobierania filmów (`GET /api/films`).
    - Obsługa parametrów: `status`, `search`, `page`, `limit`.
    - Zarządzanie stanami `isLoading`, `films`, `currentPage`, `totalFilms`, `error`.
8.  **Integracja `FilmManagementView` z `useFilms`**:
    - Wywoływanie `fetchFilms` przy inicjalizacji i zmianie filtrów (`selectedStatus`, `debouncedSearchQuery`).
    - Przekazywanie danych (`films`, `isLoading`, etc.) do komponentów podrzędnych (`FilmList`).
9.  **`FilmTabs`**: Podłączenie logiki zmiany `selectedStatus`.
10. **`FilmSearchInput`**: Podłączenie logiki zmiany `searchQuery` z debouncingiem.
11. **`FilmList` i `FilmCard` - Wyświetlanie**: Implementacja wyświetlania listy filmów i danych na kartach.
12. **`FilmList` - Infinite Scroll**:
    - Implementacja `IntersectionObserver` do wykrywania końca listy.
    - Wywoływanie `loadMoreFilms` z `useFilms`.
    - Wyświetlanie wielu instancji `FilmCardSkeleton.tsx` podczas `isLoadingMore` lub `isLoading` (gdy lista jest pusta).
13. **`FilmCard` - Zmiana statusu i Usuwanie**:
    - Podłączenie interakcji użytkownika (przyciski zmiany statusu, kliknięcie ikony "Usuń") do wywołania `updateFilmStatusOnServer` lub `onDeleteRequest` (które otworzy `ConfirmDeleteDialog`).
    - Aktualizacja UI na podstawie wyniku.
14. **`useFilms` - Usuwanie filmu**:
    - Implementacja funkcji `deleteFilmOnServer` (`DELETE /api/films/{filmId}`).
    - Logika optymistycznej aktualizacji i obsługi błędów.
15. **`ConfirmDeleteDialog` i `FilmManagementView` - Usuwanie filmu**:
    - Podłączenie logiki otwierania dialogu z `FilmManagementView` (na żądanie z `FilmCard`).
    - Przekazanie akcji potwierdzenia/anulowania z dialogu do `FilmManagementView`, które wywoła `deleteFilmOnServer`.
16. **Obsługa błędów**: Implementacja wyświetlania komunikatów o błędach dla wszystkich operacji API.
17. **Styling i Accessibility**: Dopracowanie wyglądu za pomocą Tailwind CSS, upewnienie się, że wszystkie interaktywne elementy są dostępne (np. `aria-labels` dla przycisków-ikon, nawigacja klawiaturą).
18. **Testowanie**: Testy manualne kluczowych funkcjonalności. Rozważenie testów jednostkowych dla `useFilms` i komponentów z bardziej złożoną logiką.
19. **Refaktoryzacja i optymalizacja**: Przegląd kodu, optymalizacja wydajności (np. memoizacja komponentów, jeśli potrzebne).
20. **Sprawdzenie spójności wizualnej**: Upewnienie się, że `FilmCard.tsx` jest wizualnie zgodny z `RecommendationCard.tsx` (poza dodatkową ikoną usuwania).

## 12. (Opcjonalnie) Refaktoryzacja `RecommendationCard.tsx`
Po zaimplementowaniu `FilmCardDetails.tsx`, rozważyć jego użycie w `RecommendationCard.tsx` dla spójności. 