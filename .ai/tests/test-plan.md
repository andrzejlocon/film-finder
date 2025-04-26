# Plan testów dla projektu "Film Finder"

## 1. Wprowadzenie i cele testowania
Celem testowania jest zapewnienie wysokiej jakości aplikacji poprzez kompleksową weryfikację funkcjonalności, wydajności, bezpieczeństwa i użyteczności. Testy mają na celu wykrycie i eliminację błędów już na wczesnym etapie, przyspieszenie procesu wdrażania oraz zagwarantowanie satysfakcji końcowego użytkownika.

## 2. Zakres testów
Testy obejmą:
- **Frontend:** Testowanie stron i komponentów zbudowanych przy użyciu Astro, React i Shadcn/ui, w tym testowanie interakcji użytkownika, responsywności oraz poprawności renderowania.
- **Backend:** Weryfikację API (endpointy w `/src/pages/api`), integrację z bazą danych Supabase, autoryzacji i autentykacji.
- **Integrację:** Sprawdzenie poprawnej komunikacji między frontendem a backendem.
- **Styling:** Kontrolę zastosowania Tailwind CSS oraz zgodności z projektem UX/UI.
- **Dostępność:** Weryfikację zgodności z wytycznymi WCAG 2.1 i zapewnienie odpowiedniej obsługi technologii wspomagających.

## 3. Typy testów do przeprowadzenia
### 3.1 Testy jednostkowe
- Testowanie pojedynczych funkcji, komponentów React i modułów Astro.
- Wykorzystanie narzędzi takich jak Vitest (szybsza alternatywa dla Jest kompatybilna z Vite/Astro) oraz React Testing Library.
- Zastosowanie Testing Library/user-event do dokładniejszej symulacji interakcji użytkownika.

### 3.2 Testy integracyjne
- Testowanie współdziałania poszczególnych modułów, np. połączenie komponentów UI z logiką API.
- Sprawdzenie poprawności przepływu danych między warstwami aplikacji.
- Wykorzystanie MSW (Mock Service Worker) do symulowania API podczas testów bez zależności od rzeczywistego backendu.
- Zastosowanie Supabase Testing Helpers do testowania integracji z bazą danych.

### 3.3 Testy end-to-end (E2E)
- Symulacja rzeczywistych scenariuszy użytkownika, takich jak wyszukiwanie filmów, przeglądanie szczegółów czy interakcje związane z autoryzacją.
- Wykorzystanie narzędzia Playwright zamiast Cypress do automatyzacji scenariuszy testowych ze względu na lepszą wydajność, wsparcie dla wszystkich głównych przeglądarek i lepszą integrację z TypeScript.

### 3.4 Testy wydajnościowe
- Pomiar czasu ładowania stron, odpowiedzi API oraz optymalizacji renderowania przy wykorzystaniu Astro.
- Użycie Lighthouse CI do automatycznego monitorowania wydajności w ramach procesu CI/CD.

### 3.5 Testy bezpieczeństwa
- Weryfikacja mechanizmów autoryzacji i autentykacji przy wykorzystaniu Supabase.
- Testowanie odporności na typowe ataki, np. SQL injection, XSS oraz sprawdzenie bezpiecznego przechowywania danych.

### 3.6 Testy dostępności
- Automatyczne sprawdzanie zgodności z WCAG 2.1 za pomocą narzędzia axe-core.
- Testowanie kompatybilności z czytnikami ekranowymi i innymi technologiami wspomagającymi.

### 3.7 Testy komponentów UI
- Izolowane testowanie komponentów UI z wykorzystaniem Storybook.
- Walidacja poprawnego renderowania i zachowania komponentów Shadcn/ui w różnych stanach i konfiguracjach.

## 4. Scenariusze testowe dla kluczowych funkcjonalności
- **Autoryzacja i autentykacja:** Weryfikacja procesu logowania, rejestracji oraz zarządzania sesjami użytkowników.
- **Wyszukiwarka filmów:** Testy wyszukiwania, filtrowania, sortowania i paginacji wyników.
- **Wyświetlanie szczegółów filmu:** Sprawdzenie poprawności prezentacji informacji o filmie.
- **Interakcje i nawigacja:** Testowanie szybkości i intuicyjności przechodzenia między stronami, reakcji interaktywnych elementów oraz responsywności interfejsu.
- **Integracja z bazą danych:** Testowanie komunikacji z Supabase, poprawności zapytań i obsługi błędów.

## 5. Środowisko testowe
- **Lokalne środowisko developerskie:** Konfiguracja na maszynach deweloperskich z użyciem Astro, TypeScript, React i lokalnej bazy testowej (odizolowanej instancji Supabase).
- **Środowisko staging:** Środowisko umożliwiające integracyjne testy w warunkach zbliżonych do produkcyjnych.
- **Testowe urządzenia:** Różnorodne urządzenia (komputery, tablety, smartfony) do testowania responsywności i interfejsu.
- **Wirtualne przeglądarki:** Wykorzystanie możliwości Playwright do testowania w różnych przeglądarkach (Chrome, Firefox, Safari) bez konieczności ich fizycznej instalacji.

## 6. Narzędzia do testowania
- **Vitest oraz React Testing Library:** Do testów jednostkowych komponentów i logiki.
- **Playwright:** Do testów end-to-end i symulacji zachowań użytkowników w wielu przeglądarkach.
- **MSW (Mock Service Worker):** Do izolowanego testowania frontendu bez zależności od rzeczywistego API.
- **Storybook:** Do izolowanego testowania komponentów UI i ich dokumentacji.
- **Lighthouse CI:** Do automatycznej analizy wydajności i optymalizacji stron w ramach CI/CD.
- **Axe-core:** Do automatycznych testów dostępności.
- **ESLint i Prettier:** Do zapewnienia jakości kodu i zgodności ze standardami.
- **Codecov/SonarQube:** Do monitorowania pokrycia testami i jakości kodu.
- **GitHub Issues:** Do raportowania i monitorowania zgłoszonych problemów.

## 7. Harmonogram testów
- **Faza przygotowawcza:** Konfiguracja środowisk testowych, przygotowanie danych testowych i automatyzacja testów jednostkowych.
- **Testy jednostkowe:** Uruchamiane przy każdym commitcie, automatycznie w ramach CI/CD.
- **Testy integracyjne:** Regularne uruchamianie w środowisku staging po każdej większej zmianie.
- **Testy E2E:** Codzienne testy na środowisku staging oraz testy regresji przed wdrożeniem na produkcję.
- **Testy wydajnościowe i bezpieczeństwa:** Okresowe audyty oraz testy przy krytycznych modyfikacjach systemu.
- **Testy dostępności:** Automatyczne sprawdzanie przy każdym pull request oraz okresowe manualne audyty.

## 8. Kryteria akceptacji testów
- Wszystkie krytyczne funkcjonalności muszą przejść testowanie bez krytycznych błędów.
- Pokrycie testami co najmniej 80% kodu aplikacji, monitorowane przez Codecov/SonarQube.
- Pomyślne zakończenie testów integracyjnych i E2E w środowisku staging.
- Brak krytycznych problemów wpływających na stabilność aplikacji.
- Spełnienie ustalonych parametrów wydajnościowych (np. czas ładowania strony poniżej 2 sekund).
- Zgodność z wytycznymi dostępności WCAG 2.1 na poziomie AA.

## 9. Role i odpowiedzialności w procesie testowania
- **QA Engineer:** Odpowiedzialny za opracowanie, planowanie i wykonanie testów, raportowanie błędów oraz monitorowanie wyników testów.
- **Developer:** Wsparcie w procesie naprawy wykrytych błędów oraz uzupełnianiu testów jednostkowych.
- **Tester automatyzacji:** Wdraża i utrzymuje frameworki automatyzacji testów end-to-end z wykorzystaniem Playwright.
- **Product Owner/Manager:** Monitoruje realizację testów, podejmuje decyzje dotyczące akceptacji funkcjonalności oraz priorytetyzacji poprawek.

## 10. Procedury raportowania błędów
- Każdy błąd należy zgłaszać za pośrednictwem GitHub Issues.
- Raport błędu powinien zawierać:
  - Opis problemu,
  - Kroki do odtworzenia,
  - Oczekiwany efekt kontra efekt rzeczywisty,
  - Informacje o środowisku testowym,
  - Priorytet i wpływ na funkcjonalność aplikacji.
- Raporty będą przeglądane przez zespół QA oraz deweloperów podczas codziennych spotkań lub według ustalonego harmonogramu.
- Wprowadzenie poprawek zostanie zweryfikowane ponownie poprzez przeprowadzenie testów regresyjnych.
