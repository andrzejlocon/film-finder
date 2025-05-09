# Plan Testów Aplikacji FilmFinder

## 1. Wprowadzenie i Cele Testowania

### 1.1. Wprowadzenie

Niniejszy dokument opisuje plan testów dla aplikacji webowej **FilmFinder**. Aplikacja ma na celu dostarczanie użytkownikom spersonalizowanych rekomendacji filmowych generowanych przez AI (za pośrednictwem OpenRouter) oraz zarządzanie listą filmów do obejrzenia. Projekt wykorzystuje nowoczesny stos technologiczny oparty na Astro, React, TypeScript, Supabase (dla bazy danych i autentykacji) oraz Tailwind CSS.

### 1.2. Cele Testowania

Głównym celem testowania jest zapewnienie wysokiej jakości, niezawodności, bezpieczeństwa i użyteczności aplikacji FilmFinder przed jej wdrożeniem produkcyjnym.

Cele szczegółowe obejmują:

- Weryfikację poprawności działania kluczowych funkcjonalności (autentykacja, generowanie rekomendacji, zapisywanie filmów).
- Zapewnienie spójności i poprawności danych w interakcji z bazą danych Supabase.
- Sprawdzenie poprawności integracji z zewnętrznym serwisem AI (OpenRouter), w tym obsługę błędów i formatu odpowiedzi.
- Weryfikację bezpieczeństwa aplikacji, w szczególności procesów autentykacji i autoryzacji.
- Zapewnienie responsywności i poprawnego wyświetlania interfejsu użytkownika na różnych urządzeniach i przeglądarkach.
- Ocenę wydajności aplikacji pod kątem czasu odpowiedzi API i ładowania interfejsu.
- Identyfikację i raportowanie defektów w celu ich naprawy przed wdrożeniem.
- Potwierdzenie, że aplikacja spełnia zdefiniowane wymagania funkcjonalne i niefunkcjonalne.

## 2. Zakres Testów

### 2.1. Funkcjonalności w Zakresie Testów

- **Moduł Autentykacji:**
  - Rejestracja nowych użytkowników.
  - Logowanie istniejących użytkowników.
  - Wylogowywanie.
  - Odzyskiwanie hasła (jeśli zaimplementowane w API).
  - Walidacja danych wejściowych formularzy (email, hasło).
  - Obsługa błędów autentykacji.
- **Middleware:**
  - Ochrona ścieżek wymagających autentykacji.
  - Poprawne przekierowanie niezalogowanych użytkowników.
  - Dostępność publicznych ścieżek.
  - Poprawne wstrzykiwanie `supabase` i `user` do `Astro.locals`.
- **Moduł Rekomendacji:**
  - Formularz kryteriów rekomendacji (wprowadzanie aktorów, reżyserów, gatunków, zakresu lat).
  - Walidacja danych wejściowych formularza kryteriów (np. `year_from <= year_to`).
  - Funkcja "Wypełnij z profilu" (pobieranie preferencji użytkownika - wymaga testowania powiązanego API).
  - Generowanie rekomendacji na podstawie kryteriów (interakcja z `/api/recommendations`).
  - Generowanie rekomendacji na podstawie preferencji użytkownika (gdy kryteria nie są podane).
  - Wyświetlanie listy rekomendacji (komponent `RecommendationsList`).
  - Wyświetlanie pojedynczej karty rekomendacji (`RecommendationCard`).
  - Wyświetlanie stanu ładowania (`SkeletonLoader`).
  - Obsługa braku wyników rekomendacji.
  - Obsługa błędów podczas generowania rekomendacji.
  - Zmiana statusu filmu ("Do obejrzenia", "Obejrzany", "Odrzucony") na karcie rekomendacji.
  - Zapisywanie wybranych rekomendacji (interakcja z `/api/films`).
  - Obsługa błędów podczas zapisywania rekomendacji (np. duplikaty).
  - Wyświetlanie powiadomień (toasts) o sukcesie/błędzie.
- **Interfejs Użytkownika (UI):**
  - Komponent `Topbar` (nawigacja, wyświetlanie emaila użytkownika, przyciski Wyloguj, menu mobilne).
  - Responsywność layoutu na różnych rozmiarach ekranu (desktop, tablet, mobile).
  - Poprawność działania reużywalnych komponentów UI (`src/components/ui/*`) w kontekście funkcjonalności.
  - Spójność wizualna i zgodność ze stylem (Tailwind CSS).
- **API Endpoints (`/api/*`):**
  - `/api/auth/login`: Logowanie.
  - `/api/auth/logout`: Wylogowywanie.
  - `/api/films`: Zapisywanie filmów (POST).
  - `/api/recommendations`: Generowanie rekomendacji (POST).
  - `/api/preferences`: Pobieranie preferencji (GET - niezaimplementowany, ale używany w `RecommendationView`).
  - Walidacja danych wejściowych (Zod schemas).
  - Obsługa autentykacji (sprawdzanie `locals.user`).
  - Poprawność zwracanych kodów statusu HTTP i formatów odpowiedzi.
  - Obsługa błędów (np. 400, 401, 404, 409, 500).
- **Logika Biznesowa (Services):**
  - `FilmsService`: Logika tworzenia filmów, sprawdzanie duplikatów.
  - `RecommendationService`: Budowanie promptów, interakcja z `OpenRouterService`, parsowanie odpowiedzi, logowanie generacji i błędów.
  - `OpenRouterService`: Interakcja z API OpenRouter, obsługa retry, walidacja parametrów, obsługa błędów API.
- **Baza Danych (Supabase):**
  - Poprawność zapisywanych danych (format, relacje - np. `generation_id` w `user_films`).
  - Integralność danych.
  - Poprawność typów (zgodność z `database.types.ts`).

### 2.2. Funkcjonalności Poza Zakresem Testów

- Testowanie wewnętrznej implementacji bibliotek zewnętrznych (Astro, React, Supabase Client, OpenRouter API, shadcn/ui).
- Testowanie infrastruktury dostawców (Supabase, OpenRouter) pod kątem dostępności i wydajności.
- Szczegółowe testy penetracyjne (mogą być przeprowadzone osobno, jeśli wymagane).
- Testowanie strony `Welcome.astro` (niski priorytet, strona nie jest docelowo używana).
- Funkcjonalności niezaimplementowane (np. pełny widok profilu użytkownika, edycja preferencji, widok filmów, pełne API dla preferencji `/api/preferences` - POST/PUT).

## 3. Typy Testów do Przeprowadzenia

- **Testy Jednostkowe (Unit Tests):**
  - Cel: Weryfikacja małych, izolowanych fragmentów kodu (funkcje, klasy, moduły).
  - Zakres: Funkcje pomocnicze (`lib/utils.ts`), logika serwisów (`lib/services/*` z zamockowanymi zależnościami), schematy walidacji Zod (`lib/schemas/*`).
  - Narzędzia: Vitest.
- **Testy Komponentów (Component Tests):**
  - Cel: Weryfikacja komponentów React UI w izolacji lub w małych grupach.
  - Zakres: Komponenty interaktywne (`LoginForm`, `CriteriaForm`, `RecommendationCard`, `Topbar` etc.) z zamockowanymi API calls lub propsami.
  - Narzędzia: Vitest, React Testing Library (`@testing-library/react`).
- **Testy Integracyjne (Integration Tests):**
  - Cel: Weryfikacja interakcji pomiędzy różnymi modułami systemu.
  - Zakres: Serwisy interagujące z zamockowaną bazą danych/API, API routes z zamockowanymi serwisami, Middleware, komponenty React interagujące z zamockowanym backendem (`msw`).
  - Narzędzia: Vitest, React Testing Library, `msw`.
- **Testy End-to-End (E2E):**
  - Cel: Symulacja rzeczywistych przepływów użytkownika w aplikacji działającej w przeglądarce.
  - Zakres: Scenariusze takie jak: rejestracja -> logowanie -> generowanie rekomendacji -> zapisanie filmu -> wylogowanie.
  - Narzędzia: Playwright lub Cypress.
- **Testy API:**
  - Cel: Bezpośrednia weryfikacja endpointów API pod kątem kontraktu, walidacji, autentykacji, obsługi błędów i logiki biznesowej.
  - Zakres: Wszystkie endpointy w `src/pages/api/*`.
  - Narzędzia: Playwright/Cypress (wbudowane funkcje testowania API), Postman/Insomnia (manualne/eksploracyjne).
- **Testy Wydajnościowe (Performance Tests):**
  - Cel: Ocena czasu odpowiedzi API pod obciążeniem i wydajności ładowania frontendu.
  - Zakres: Kluczowe endpointy API (np. `/api/recommendations`), czas ładowania strony rekomendacji.
  - Narzędzia: k6, JMeter (dla API), Lighthouse, WebPageTest (dla frontendu).
- **Testy Bezpieczeństwa (Security Tests):**
  - Cel: Identyfikacja podstawowych podatności.
  - Zakres: Sprawdzanie ochrony endpointów API (middleware), walidacja danych wejściowych, bezpieczne zarządzanie sesją (flagi `HttpOnly`, `Secure`, `SameSite` dla ciasteczek - weryfikacja konfiguracji Supabase).
  - Narzędzia: Manualna inspekcja, narzędzia deweloperskie przeglądarki, OWASP ZAP (opcjonalnie).
- **Testy Kompatybilności (Compatibility Tests):**
  - Cel: Zapewnienie poprawnego działania i wyglądu aplikacji w różnych środowiskach.
  - Zakres: Główne przeglądarki (Chrome, Firefox, Safari, Edge - ostatnie wersje), różne rozdzielczości ekranu (desktop, tablet, mobile).
  - Narzędzia: Ręczne testowanie, narzędzia deweloperskie przeglądarki, usługi typu BrowserStack (opcjonalnie).
- **Testy Użyteczności (Usability Testing):**
  - Cel: Ocena łatwości obsługi i intuicyjności interfejsu.
  - Zakres: Manualna eksploracja kluczowych przepływów użytkownika, ocena czytelności komunikatów i nawigacji.
  - Narzędzia: Manualne testowanie, ewentualnie sesje z użytkownikami.
- **Testy Wizualne (Visual Regression Testing):**
  - Cel: Wykrywanie niezamierzonych zmian w wyglądzie UI.
  - Zakres: Kluczowe strony i komponenty.
  - Narzędzia: Percy, Chromatic (opcjonalnie).

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

_(Przykładowe scenariusze - pełna lista będzie rozwijana w systemie zarządzania testami)_

**4.1. Autentykacja:**

- **SCN-AUTH-001:** Poprawne logowanie z ważnymi danymi uwierzytelniającymi.
- **SCN-AUTH-002:** Nieudane logowanie z niepoprawnym hasłem.
- **SCN-AUTH-003:** Nieudane logowanie z nieistniejącym adresem email.
- **SCN-AUTH-004:** Walidacja formularza logowania (puste pola, niepoprawny format email).
- **SCN-AUTH-005:** Poprawna rejestracja nowego użytkownika z unikalnym emailem.
- **SCN-AUTH-006:** Nieudana rejestracja z już istniejącym adresem email.
- **SCN-AUTH-007:** Walidacja formularza rejestracji (wymagane pola, min. długość hasła, zgodność haseł, format email).
- **SCN-AUTH-008:** Poprawne wylogowanie użytkownika (przekierowanie na `/login`).
- **SCN-AUTH-009:** Próba dostępu do chronionej strony (`/recommendations`) przez niezalogowanego użytkownika (oczekiwane przekierowanie na `/login`).
- **SCN-AUTH-010:** Dostęp do strony logowania/rejestracji przez zalogowanego użytkownika (oczekiwane przekierowanie np. na `/recommendations`).
- **SCN-AUTH-011:** Wywołanie API odzyskiwania hasła (jeśli zaimplementowane).

**4.2. Generowanie Rekomendacji:**

- **SCN-REC-001:** Generowanie rekomendacji bez podawania kryteriów (powinno użyć preferencji lub domyślnych).
- **SCN-REC-002:** Generowanie rekomendacji z podaniem kryteriów (aktorzy, reżyserzy, gatunki, zakres lat).
- **SCN-REC-003:** Walidacja formularza kryteriów (np. `year_from > year_to`).
- **SCN-REC-004:** Wyświetlanie szkieletu ładowania (`SkeletonLoader`) podczas generowania.
- **SCN-REC-005:** Poprawne wyświetlanie listy rekomendacji (`RecommendationCard`).
- **SCN-REC-006:** Poprawne wyświetlanie danych na karcie filmu (tytuł, rok, opis, gatunki, aktorzy, reżyser).
- **SCN-REC-007:** Obsługa przypadku braku rekomendacji dla danych kryteriów.
- **SCN-REC-008:** Obsługa błędu z API OpenRouter (wyświetlenie komunikatu o błędzie).
- **SCN-REC-009:** Funkcja "Wypełnij z profilu" (poprawne wypełnienie formularza kryteriów - wymaga API preferencji).

**4.3. Zarządzanie Rekomendacjami:**

- **SCN-MGMT-001:** Zaznaczenie statusu "Do obejrzenia" na karcie filmu.
- **SCN-MGMT-002:** Zaznaczenie statusu "Obejrzany" na karcie filmu.
- **SCN-MGMT-003:** Zaznaczenie statusu "Odrzucony" na karcie filmu.
- **SCN-MGMT-004:** Odznaczenie statusu (ponowne kliknięcie tego samego przycisku).
- **SCN-MGMT-005:** Poprawne zliczanie wybranych filmów (`SaveRecommendationsButton`).
- **SCN-MGMT-006:** Zapisanie wybranych filmów ze statusami (przycisk "Save Selected Films").
- **SCN-MGMT-007:** Wyświetlenie komunikatu sukcesu po zapisaniu filmów.
- **SCN-MGMT-008:** Reset formularza i listy rekomendacji po pomyślnym zapisie.
- **SCN-MGMT-009:** Próba zapisania filmu, który już istnieje na liście użytkownika (oczekiwany błąd 409 z API).
- **SCN-MGMT-010:** Obsługa błędu podczas zapisywania filmów (wyświetlenie komunikatu o błędzie).
- **SCN-MGMT-011:** Przycisk zapisu jest nieaktywny, gdy żaden film nie jest wybrany.

**4.4. Interfejs Użytkownika i Nawigacja:**

- **SCN-UI-001:** Poprawne wyświetlanie `Topbar` dla zalogowanego użytkownika.
- **SCN-UI-002:** Działanie linków nawigacyjnych w `Topbar` (desktop).
- **SCN-UI-003:** Działanie menu mobilnego (`Sheet`) i linków nawigacyjnych (mobile).
- **SCN-UI-004:** Poprawne wyświetlanie adresu email zalogowanego użytkownika.
- **SCN-UI-005:** Poprawne działanie przycisku "Sign out" w `Topbar` (desktop i mobile).
- **SCN-UI-006:** Responsywność strony rekomendacji na różnych rozdzielczościach.
- **SCN-UI-007:** Poprawne działanie i wygląd komponentów UI (przyciski, inputy, karty, alerty, badge).
- **SCN-UI-008:** Czytelność i spójność komunikatów błędów i sukcesu (toasts, alerty).

**4.5. Testy API (Przykłady):**

- **SCN-API-001 (POST /api/auth/login):** Wysłanie poprawnych danych -> status 200, dane użytkownika, ciasteczka sesji ustawione.
- **SCN-API-002 (POST /api/auth/login):** Wysłanie niepoprawnych danych -> status 400, komunikat błędu.
- **SCN-API-003 (POST /api/auth/logout):** Wywołanie bez aktywnej sesji -> status 400/401 (zależnie od implementacji Supabase).
- **SCN-API-004 (POST /api/auth/logout):** Wywołanie z aktywną sesją -> status 200, ciasteczka sesji usunięte.
- **SCN-API-005 (POST /api/recommendations):** Wywołanie bez autentykacji -> status 401.
- **SCN-API-006 (POST /api/recommendations):** Wywołanie z poprawnymi kryteriami -> status 200, poprawny format odpowiedzi (`RecommendationResponseDTO`).
- **SCN-API-007 (POST /api/recommendations):** Wywołanie z niepoprawnymi kryteriami (np. `year_from > year_to`) -> status 400, szczegóły błędu walidacji.
- **SCN-API-008 (POST /api/films):** Wywołanie bez autentykacji -> status 401.
- **SCN-API-009 (POST /api/films):** Wywołanie z poprawnymi danymi filmów -> status 201, tablica utworzonych filmów.
- **SCN-API-010 (POST /api/films):** Wywołanie z niepoprawnym formatem danych (niezgodne z `createFilmCommandSchema`) -> status 400, szczegóły błędu walidacji.
- **SCN-API-011 (POST /api/films):** Wywołanie z filmem, który już istnieje -> status 409, komunikat o duplikacie.

## 5. Środowisko Testowe

- **Środowisko Lokalne:** Maszyny deweloperów do uruchamiania testów jednostkowych, komponentów i integracyjnych podczas rozwoju.
- **Środowisko CI/CD:** (np. GitHub Actions, GitLab CI) Do automatycznego uruchamiania zestawów testów (jednostkowych, integracyjnych, E2E) przy każdym pushu lub pull requeście.
- **Środowisko Staging/Testowe:** Dedykowana instancja aplikacji wdrożona w środowisku zbliżonym do produkcyjnego. Powinna zawierać:
  - Osobną instancję projektu Supabase (z własną bazą danych i konfiguracją Auth).
  - Skonfigurowane klucze API dla OpenRouter (mogą być to klucze testowe lub produkcyjne z niskim limitem/budżetem).
  - Dane testowe w bazie Supabase (użytkownicy, istniejące filmy, preferencje).
- **Środowisko Produkcyjne:** Ograniczone testy dymne (smoke tests) po wdrożeniu nowej wersji.
- **Przeglądarki:** Najnowsze stabilne wersje Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge.
- **Urządzenia:** Testy responsywności na różnych viewportach (desktop, tablet, mobile) przy użyciu narzędzi deweloperskich przeglądarki lub fizycznych urządzeń/emulatorów.

## 6. Narzędzia do Testowania

- **Framework/Runner Testów:** Vitest
- **Biblioteka do Testowania Komponentów React:** React Testing Library (`@testing-library/react`)
- **Narzędzie do Testów E2E:** Playwright lub Cypress
- **Narzędzie do Testów API:** Playwright/Cypress (wbudowane), Postman/Insomnia (manualne/eksploracyjne)
- **Mockowanie API/Serwisów:** Mock Service Worker (`msw`), Vitest Mocks
- **Narzędzie do Testów Wydajności:** k6, Lighthouse
- **System CI/CD:** GitHub Actions / GitLab CI / Jenkins (zależnie od używanego w projekcie)
- **System Śledzenia Błędów:** Jira / Trello / GitHub Issues (zależnie od preferencji zespołu)
- **System Zarządzania Przypadkami Testowymi:** TestRail / Zephyr Scale / Xray (opcjonalnie, dla większej formalizacji)
- **Narzędzia Deweloperskie Przeglądarki:** Do inspekcji DOM, sieci, debugowania.
- **Walidacja Danych:** Zod (już używane w kodzie)

## 7. Harmonogram Testów

- **Testy Jednostkowe, Komponentów, Integracyjne (Automatyczne):**
  - Uruchamiane lokalnie przez deweloperów przed commitem (opcjonalnie przez pre-commit hooks).
  - Uruchamiane automatycznie w CI/CD przy każdym pushu do repozytorium i przy tworzeniu/aktualizacji Pull Requestów.
- **Testy API, E2E (Automatyczne):**
  - Podstawowy zestaw uruchamiany w CI/CD przy każdym Pull Requeście.
  - Pełny zestaw uruchamiany cyklicznie (np. co noc) na środowisku Staging.
  - Uruchamiane przed każdym wdrożeniem na środowisko produkcyjne (na Staging).
- **Testy Manualne (Eksploracyjne, Użyteczności, Kompatybilności):**
  - Przeprowadzane przez QA przed zakończeniem sprintu/wydania.
  - Ad-hoc podczas developmentu nowych funkcji.
- **Testy Wydajnościowe:**
  - Przeprowadzane okresowo (np. raz na sprint/miesiąc) na środowisku Staging.
  - Przed wdrożeniem dużych zmian mogących wpłynąć na wydajność.
- **Testy Bezpieczeństwa:**
  - Podstawowe testy przeprowadzane regularnie w ramach testów API i E2E.
  - Bardziej zaawansowane testy/audyty przeprowadzane okresowo lub przed ważnymi wdrożeniami.
- **Testy Regresji:**
  - Automatyczne zestawy testów (Unit, Integration, E2E) uruchamiane regularnie.
  - Manualne testy kluczowych funkcjonalności przed każdym wydaniem.

## 8. Kryteria Akceptacji Testów

### 8.1. Kryteria Wejścia (Rozpoczęcia Testów)

- Kod źródłowy dla testowanej funkcjonalności jest dostępny w repozytorium.
- Aplikacja jest pomyślnie zbudowana i wdrożona na odpowiednim środowisku testowym (Staging).
- Podstawowe testy dymne (np. dostępność strony logowania, strony głównej dla zalogowanego użytkownika) przechodzą pomyślnie.
- Dokumentacja wymagań lub historyjki użytkownika są dostępne.
- Środowisko testowe jest skonfigurowane i dostępne (w tym baza danych, klucze API).

### 8.2. Kryteria Wyjścia (Zakończenia Testów)

- Wszystkie zaplanowane przypadki testowe (automatyczne i manualne) zostały wykonane.
- Osiągnięto zdefiniowany próg pokrycia kodu testami (np. 80% dla testów jednostkowych i integracyjnych - do ustalenia z zespołem).
- Współczynnik pomyślnie zakończonych testów automatycznych osiągnął zdefiniowany poziom (np. 95-100%).
- Wszystkie zidentyfikowane błędy o priorytecie krytycznym (Critical) i wysokim (High) zostały naprawione i zweryfikowane.
- Błędy o niższym priorytecie zostały przeanalizowane, udokumentowane i zaakceptowane do potencjalnej naprawy w przyszłości (jeśli dotyczy).
- Wyniki testów wydajnościowych mieszczą się w zdefiniowanych ramach (jeśli takie zdefiniowano).
- Przeprowadzono testy regresji potwierdzające brak negatywnego wpływu zmian na istniejące funkcjonalności.
- Raport z testów został przygotowany i zaakceptowany przez interesariuszy (np. Product Owner, Tech Lead).

## 9. Role i Odpowiedzialności w Procesie Testowania

- **Inżynier QA / Tester:**
  - Projektowanie, tworzenie i utrzymanie planu testów.
  - Tworzenie, wykonywanie i utrzymanie przypadków testowych (manualnych i automatycznych - E2E, API, Integracyjne).
  - Raportowanie i śledzenie błędów.
  - Analiza wyników testów i przygotowywanie raportów.
  - Przeprowadzanie testów eksploracyjnych, użyteczności, kompatybilności.
  - Konfiguracja i utrzymanie środowisk testowych oraz narzędzi.
  - Współpraca z deweloperami w celu diagnozowania i naprawy błędów.
- **Deweloper:**
  - Tworzenie i utrzymanie testów jednostkowych i komponentów.
  - Naprawa błędów zgłoszonych przez QA lub wykrytych przez automatyczne testy.
  - Uczestnictwo w przeglądach kodu pod kątem testowalności.
  - Wsparcie w konfiguracji środowisk i diagnozowaniu problemów.
- **Tech Lead / Architekt:**
  - Definiowanie strategii testowania we współpracy z QA.
  - Nadzór nad jakością kodu i testów.
  - Podejmowanie decyzji dotyczących narzędzi i architektury wspierającej testowanie.
- **Product Owner / Manager:**
  - Dostarczanie wymagań i kryteriów akceptacji.
  - Priorytetyzacja błędów.
  - Udział w testach akceptacyjnych użytkownika (UAT), jeśli dotyczy.
  - Akceptacja wyników testów przed wdrożeniem.

## 10. Procedury Raportowania Błędów

1.  **Narzędzie:** Do śledzenia błędów zostanie wykorzystane narzędzie [np. Jira, Trello, GitHub Issues - do ustalenia przez zespół].
2.  **Zgłaszanie Błędu:** Każdy znaleziony błąd powinien zostać niezwłocznie zgłoszony w systemie śledzenia błędów.
3.  **Format Zgłoszenia:** Każde zgłoszenie powinno zawierać co najmniej:
    - **Tytuł:** Krótki, zwięzły opis problemu.
    - **Opis:** Szczegółowy opis błędu.
    - **Kroki do Reprodukcji:** Numerowana lista kroków pozwalająca jednoznacznie odtworzyć błąd.
    - **Wynik Oczekiwany:** Co powinno się wydarzyć zgodnie z wymaganiami.
    - **Wynik Aktualny:** Co faktycznie się wydarzyło.
    - **Środowisko:** Wersja aplikacji, przeglądarka, system operacyjny, środowisko testowe (np. Staging, Lokalnie).
    - **Priorytet:** (np. Krytyczny, Wysoki, Średni, Niski) - określa pilność naprawy.
    - **Ważność (Severity):** (np. Blocker, Critical, Major, Minor, Trivial) - określa wpływ błędu na system.
    - **Załączniki:** Zrzuty ekranu, nagrania wideo, logi z konsoli/sieci (jeśli relevantne).
    - **Zgłaszający:** Osoba, która znalazła błąd.
4.  **Cykl Życia Błędu:**
    - **Nowy (New/Open):** Zgłoszenie utworzone.
    - **W Analizie (In Analysis/Triage):** Błąd jest analizowany przez Tech Leada/PO/QA w celu potwierdzenia, ustalenia priorytetu i przypisania do dewelopera.
    - **Do Zrobienia (To Do/Assigned):** Błąd przypisany do dewelopera do naprawy.
    - **W Trakcie (In Progress):** Deweloper pracuje nad naprawą.
    - **Do Weryfikacji (Ready for QA/Resolved):** Błąd naprawiony, gotowy do weryfikacji przez QA na odpowiednim środowisku.
    - **Weryfikacja (In QA/Testing):** QA weryfikuje poprawkę.
      - Jeśli błąd nadal występuje -> **Ponownie Otwarty (Reopened)** i wraca do Dewelopera.
      - Jeśli błąd został naprawiony -> **Zamknięty (Closed/Done)**.
    - **Odrzucony (Rejected/Won't Fix):** Jeśli zgłoszenie nie jest błędem, jest duplikatem lub nie zostanie naprawione.
5.  **Komunikacja:** Wszelkie pytania dotyczące zgłoszenia powinny być zadawane w komentarzach do zgłoszenia w systemie śledzenia błędów.
