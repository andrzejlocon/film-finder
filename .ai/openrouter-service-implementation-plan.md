# Przewodnik wdrożenia usługi OpenRouter

## 1. Opis usługi
Usługa OpenRouter to integracja z API OpenRouter, mająca na celu uzupełnienie czatów opartych na LLM. Jej głównym zadaniem jest:
- Komunikacja z interfejsem API OpenRouter w celu wysyłania zapytań i odbierania odpowiedzi.
- Formatowanie wiadomości wysyłanych do API, obejmujące komunikat systemowy, komunikat użytkownika, zdefiniowany schemat odpowiedzi (response_format), nazwę modelu oraz parametry modelu.
- Walidacja struktury odpowiedzi przy użyciu ściśle zdefiniowanego JSON Schema.
- Obsługa błędów oraz logowanie, zapewniające niezawodność i bezpieczeństwo komunikacji.

## 2. Opis konstruktora
Konstruktor usługi inicjalizuje:
1. Konfigurację klienta API (adres bazowy, klucz API, timeout, retry mechanism).
2. Domyślne komunikaty systemowe i użytkownika, które będą wysyłane jako część zapytań.
3. Parametry modelu, takie jak nazwa modelu (np. "gpt-4"), temperatura, maksymalna liczba tokenów oraz inne ustawienia specyficzne dla OpenRouter API.
4. Schemat `response_format` wykorzystywany do walidacji odpowiedzi:
   ```
   { type: 'json_schema', json_schema: { name: 'ChatResponse', strict: true, schema: { message: 'string', status: 'string', code: 'number', additionalInfo: { type: 'object' } } } }
   ```
5. Inicjalizację mechanizmów logowania oraz przechwytywania błędów.

## 3. Publiczne metody i pola
1. `sendChatRequest(payload)`
   - Wysyła zapytanie do API OpenRouter, łącząc komunikat systemowy, komunikat użytkownika oraz parametry modelu.
2. `setModelConfig(config)`
   - Aktualizuje konfigurację modelu (np. zmianę nazwy modelu czy parametrów takich jak temperatura).
3. `getLastResponse()`
   - Zwraca ostatnią odpowiedź otrzymaną z API.
4. Pole `responseFormat`
   - Publiczne pole zawierające zdefiniowany schemat walidacji odpowiedzi:
     ```
     { type: 'json_schema', json_schema: { name: 'ChatResponse', strict: true, schema: { message: 'string', status: 'string', code: 'number', additionalInfo: { type: 'object' } } } }
     ```

## 4. Prywatne metody i pola
1. `_buildRequestPayload()`
   - Prywatna metoda, która buduje obiekt zapytania łączący:
     a. Komunikat systemowy (np. "System: Initial system prompt for context")
     b. Komunikat użytkownika (np. "User: Example question from a client")
     c. Parametry modelu (np. nazwa modelu, temperature, maxTokens)
2. `_validateResponse(response)`
   - Waliduje otrzymaną odpowiedź zgodnie z `responseFormat`.
3. `_handleError(error)`
   - Zarządza błędami, loguje je oraz generuje przyjazne komunikaty dla użytkowników.
4. Prywatne pole `_apiClient`
   - Instancja klienta HTTP odpowiedzialna za komunikację z API OpenRouter.

## 5. Obsługa błędów
Obsługa błędów powinna uwzględniać następujące scenariusze:
1. Błąd sieci (timeout, brak połączenia):
   - Implementacja mechanizmu retry oraz ustawienie odpowiednich timeoutów.
2. Błędy zwracane przez API (np. nieautoryzowany dostęp, błędna konfiguracja):
   - Analiza kodów HTTP oraz wyświetlanie informacji o błędach klientowi.
3. Błąd walidacji odpowiedzi (niespełnienie schematu `response_format`):
   - Zgłoszenie błędu w przypadku niezgodności struktury odpowiedzi oraz przekazanie informacji do logowania.
4. Nieoczekiwane wyjątki:
   - Globalny handler błędów wychwytujący wszelkie nieprzewidziane zachowania, logujący oraz informujący o problemie.

## 6. Kwestie bezpieczeństwa
1. Bezpieczne przechowywanie kluczy API:
   - Użycie zmiennych środowiskowych.
2. Rate limiting i retry:
   - Zabezpieczenie przed nadużyciem API poprzez ograniczenie liczby żądań i implementację retry.

## 7. Plan wdrożenia krok po kroku
1. **Konfiguracja środowiska**
   - Instalacja zależności: Astro 5, TypeScript 5, React 19, Tailwind 4 oraz Shadcn/ui.
   - Konfiguracja zmiennych środowiskowych, w tym klucza API do OpenRouter.
2. **Implementacja modułu klienta API OpenRouter**
   - Utworzenie modułu odpowiedzialnego za budowanie zapytań i komunikację HTTP z API OpenRouter.
   - Implementacja mechanizmów retry, timeout oraz obsługi statusów HTTP.
3. **Implementacja menedżera czatu**
   - Stworzenie logiki łączenia komunikatów systemowych i użytkownika w jeden obiekt zapytania za pomocą metody `_buildRequestPayload()`.
   - Implementacja metod publicznych, takich jak `sendChatRequest` oraz `getLastResponse`.
4. **Implementacja formatu odpowiedzi**
   - Zdefiniowanie schematu `response_format` i implementacja walidacji odpowiedzi przy użyciu `_validateResponse(response)`.
   - Użycie wzoru:
     ```
     { type: 'json_schema', json_schema: { name: 'ChatResponse', strict: true, schema: { message: 'string', status: 'string', code: 'number', additionalInfo: { type: 'object' } } } }
     ```
5. **Implementacja obsługi błędów**
   - Stworzenie prywatnej metody `_handleError(error)`, która zarządza wszystkimi scenariuszami błędów (sieci, API, walidacja, wyjątki).
   - Dodanie globalnego handlera błędów na poziomie aplikacji.
6. **Testowanie usługi**
   - Przeprowadzenie testów jednostkowych dla metod budujących zapytania i walidujących odpowiedzi.
   - Wykonanie testów integracyjnych, wysyłających zapytania do API OpenRouter w środowisku testowym.
