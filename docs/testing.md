# Film Finder - Przewodnik Testowania

## Testy Jednostkowe (Vitest)

Testy jednostkowe są używane do testowania pojedynczych komponentów i funkcji w izolacji. Używamy [Vitest](https://vitest.dev/) jako frameworka testowego.

### Uruchamianie testów jednostkowych

```bash
# Uruchomienie testów w trybie watch
npm run test

# Uruchomienie testów z interfejsem graficznym
npm run test:ui

# Uruchomienie testów z pomiarem pokrycia
npm run test:coverage
```

### Struktura testów jednostkowych

- Testy jednostkowe są umieszczane obok testowanych plików z rozszerzeniem `.test.ts` lub `.test.tsx`
- Testy renderujące komponenty React korzystają z `@testing-library/react`
- Używamy modelu AAA (Arrange, Act, Assert) dla czytelnych i łatwych w utrzymaniu testów

### Przykład testu jednostkowego

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render } from '../../../test/helpers';
import { Button } from './button';

describe('Button', () => {
  it('renderuje się z poprawną treścią', () => {
    const { getByRole } = render(<Button>Kliknij mnie</Button>);
    expect(getByRole('button', { name: /kliknij mnie/i })).toBeTruthy();
  });
});
```

## Testy End-to-End (Playwright)

Testy E2E są używane do testowania pełnych przepływów użytkownika w aplikacji. Używamy [Playwright](https://playwright.dev/) jako narzędzia testowego.

### Uruchamianie testów E2E

```bash
# Najpierw uruchom serwer dev w osobnym terminalu
npm run dev

# W innym terminalu uruchom testy E2E
npm run test:e2e

# Lub uruchom testy E2E z interfejsem graficznym
npm run test:e2e:ui
```

### Struktura testów E2E

- Testy E2E są umieszczane w katalogu `e2e/`
- Używamy wzorca Page Object Model (POM) dla łatwej konserwacji
- Używamy tylko przeglądarki Chromium do szybszego uruchamiania testów

### Przykład testu E2E

```ts
import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';

test.describe('Strona główna', () => {
  let homePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate();
  });

  test('posiada poprawny tytuł', async ({ page }) => {
    await expect(page).toHaveTitle(/Film Finder/);
  });
});
```

## Najlepsze praktyki

### Testy jednostkowe

- Używaj `vi.fn()` dla mocków funkcji
- Używaj `vi.spyOn()` do monitorowania istniejących funkcji
- Preferuj spy zamiast mocków, gdy potrzebujesz tylko sprawdzić interakcje
- Twórz pliki setupu dla konfiguracji wielokrotnego użytku
- Użyj inline snapshots dla czytelnych asercji
- Grupuj powiązane testy z blokami `describe`
- Unikaj nadmiernego mockowania - testuj rzeczywiste zachowanie

### Testy E2E

- Zaimplementuj Page Object Model dla łatwiejszego utrzymania
- Używaj lokatorów dla trwałego wyboru elementów
- Wykorzystaj wizualne porównania z `toHaveScreenshot()`
- Użyj przeglądarki Chromium/Desktop Chrome
- Wykorzystaj konteksty przeglądarki do izolacji środowisk testowych
- Korzystaj z zapisywania trace dla debugowania błędów testów

## Przed wysłaniem PR

Przed wysłaniem PR upewnij się, że:

1. Wszystkie istniejące testy przechodzą
2. Napisałeś testy dla nowych funkcji lub zmian
3. Pokrycie kodu testami jest wystarczające
4. Testy uruchamiają się szybko i nie zawierają niepotrzebnych instrukcji
