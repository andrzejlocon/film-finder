# Specyfikacja modułu autoryzacji - FilmFinder

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### Warstwa frontendu

1. **Nowe strony:**
   - **Rejestracja (/register):** Strona zawierająca formularz rejestracji umożliwiający podanie adresu e-mail, hasła oraz potwierdzenia hasła. Formularz będzie posiadał walidację po stronie klienta (React) oraz komunikaty błędów w przypadku niepoprawnych danych.
   - **Logowanie (/login):** Strona z formularzem logowania, gdzie użytkownik wpisuje adres e-mail i hasło. Zawiera również link do odzyskiwania hasła (/password-recovery) i rejestracji (/register).
   - **Odzyskiwanie hasła (/password-recovery):** Formularz umożliwiający wpisanie adresu e-mail w celu wysłania linku resetującego hasło.

2. **Layout i widoki:**
   - **Tryb auth i non-auth:** Główny layout (np. `./src/layouts/Layout.astro`) będzie odpowiedzialny za renderowanie widoków zależnie od stanu autoryzacji. W trybie autoryzowanym do layoutu dołączany będzie dodatkowy pasek nawigacji i elementy specyficzne dla zalogowanych użytkowników (np. przycisk "Wyloguj", link do profilu), natomiast w trybie niezalogowanym prezentowana będzie strona logowania z linkami do resetu hasła i rejestracji.
   - **Relacja index.astro i Topbar.tsx:**
     - Strona główna `index.astro` pełni rolę punktu startowego i/lub przekierowania do właściwego widoku (np. do rekomendacji) po weryfikacji sesji użytkownika.
     - Komponent `Topbar.tsx` jest osadzony w głównym layoucie i odpowiada za wyświetlanie nawigacji oraz opcji związanych z autoryzacją. W zależności od stanu sesji użytkownika renderowane są odpowiednie opcje (np. wyświetlanie przycisku "Wyloguj" dla zalogowanych i "Logowanie/Rejestracja" dla niezalogowanych).

3. **Podział odpowiedzialności między strony astro a komponenty React:**
   - **Strony Astro:** Odpowiadają za server-side rendering, routing oraz wstępne ładowanie danych autoryzacyjnych (sesja, tokeny). Przekazują odpowiednie dane do komponentów React przez propsy.
   - **Komponenty React:** Realizują interaktywność, jak np. walidacja formularzy w czasie rzeczywistym, obsługa błędów klienta oraz dynamiczne reakcje na akcje użytkownika. Przykładem jest formularz rejestracji, który w czasie wprowadzania danych pokazuje komunikaty walidacyjne.

4. **Walidacja i komunikaty błędów:**
   - Walidacja odbywa się dwupoziomowo:
     - Po stronie klienta (React) – natychmiastowa walidacja pól formularza (np. format e-maila, minimalna długość hasła).
     - Po stronie serwera – wykorzystanie biblioteki `zod` do weryfikacji danych wejściowych w endpointach API.
   - Komunikaty błędów powinny być przyjazne użytkownikowi i informować m.in. o:
     - Nieprawidłowym formacie e-maila
     - Niezgodności haseł w formularzu rejestracyjnym
     - Błędnych danych logowania

5. **Obsługa najważniejszych scenariuszy:**
   - **Rejestracja:** Użytkownik wypełnia formularz → klient przeprowadza wstępną walidację → dane wysyłane do backendu → walidacja serwerowa i tworzenie konta poprzez Supabase Auth → wysłanie e-maila weryfikacyjnego → przekierowanie do profilu i automatyczne logowanie.
   - **Logowanie:** Użytkownik wprowadza swoje dane → weryfikacja przez formularz React → dane przesyłane do endpointu logowania → ustawienie sesji i tokenów → aktualizacja interfejsu (Topbar, widok autoryzowany).
   - **Wylogowanie:** Użytkownik wybiera opcję wylogowania w Topbar → wywołanie endpointu wylogowania → wyczyszczenie sesji i tokenów → przekierowanie do strony logowania lub landing page.
   - **Odzyskiwanie hasła:** Użytkownik podaje adres e-mail → formularz weryfikuje dane → wysłanie żądania do backendu → Supabase Auth inicjuje procedurę resetowania hasła i wysyła e-mail z linkiem resetującym.

## 2. LOGIKA BACKENDOWA

### Struktura endpointów API:
- **POST /api/auth/register:** Rejestracja nowego użytkownika. Przyjmuje dane rejestracyjne i wykorzystuje Supabase Auth do tworzenia konta.
- **POST /api/auth/login:** Logowanie użytkownika. Sprawdza dane logowania i, w przypadku powodzenia, ustawia sesję oraz tokeny autoryzacyjne.
- **POST /api/auth/logout:** Wylogowywanie użytkownika. Czyści sesję i tokeny autoryzacyjne.
- **POST /api/auth/password-recovery:** Inicjuje procedurę odzyskiwania hasła poprzez wysłanie linku resetującego na podany adres e-mail.

### Modele danych i walidacja:
- **Modele danych:**
  - Użytkownik: Pole `email`, `hashedPassword`, `createdAt`, `updatedAt`, a także dodatkowe pola np. status konta.
  - DTO (Data Transfer Objects) dla rejestracji i logowania, z wykorzystaniem `zod` do walidacji struktury danych (kontrola formatu e-maila, długości hasła, zgodności haseł, itd.).

### Obsługa wyjątków i błędów:
- Implementacja mechanizmu try-catch w endpointach API.
- Logowanie błędów serwerowych i zwracanie przyjaznych komunikatów błędów do interfejsu użytkownika.
- Specjalne traktowanie błędów połączenia z Supabase lub problemów z walidacją danych wejściowych.

### Rendering server-side:
- Strony renderowane przez Astro muszą uwzględniać informacje o stanie autoryzacji, zgodnie z konfiguracją z `astro.config.mjs`.
- Dane o sesji przekazywane do stron Astro umożliwiają renderowanie widoków w trybie auth lub non-auth.

## 3. SYSTEM AUTENTYKACJI

### Wykorzystanie Supabase Auth:
- **Rejestracja:**
  - Użycie metody `supabase.auth.signUp` do rejestracji nowych użytkowników.
  - Walidacja danych przed wysłaniem zapytania do Supabase.
  - Opcjonalne wysyłanie e-maila weryfikacyjnego po utworzeniu konta.
- **Logowanie:**
  - Użycie metody `supabase.auth.signIn` do logowania użytkowników.
  - Obsługa poprawnego tworzenia sesji i przekazywania stanu autentykacji.
- **Wylogowanie:**
  - Użycie metody `supabase.auth.signOut` do zakończenia sesji, czyszczenie tokenów i przekierowanie użytkownika.
- **Reset hasła:**
  - Użycie metody `supabase.auth.api.resetPasswordForEmail` (lub odpowiedniej) do wysyłki linku resetującego.

### Integracja z Astro i strukturą serwisów:
- **API:** Endpointy API będą zlokalizowane w `./src/pages/api/auth`.
- **Serwisy:** Logika związana z autoryzacją zostanie wydzielona do dedykowanego serwisu, np. `./src/lib/services/authService.ts`, który obsługuje interakcje z Supabase.
- **Middleware:** W razie potrzeby, middleware w Astro (np. `./src/middleware/index.ts`) będzie sprawdzał stan autoryzacji przy każdym żądaniu dla zabezpieczenia chronionych zasobów.

---

**Podsumowanie:**
Moduł autoryzacji w aplikacji FilmFinder zostanie oparty na nowoczesnych technologiach (Astro, React, Tailwind, Shadcn/ui) i zintegrowany z Supabase Auth. Zapewni to bezpieczną i przyjazną dla użytkownika obsługę rejestracji, logowania, wylogowywania oraz odzyskiwania hasła, z naciskiem na walidację danych, obsługę wyjątków i spójny interfejs użytkownika zarówno na poziomie klienta, jak i server-side renderingu.
