# Przewodnik wdrożenia usługi OpenRouter

## 1. Opis usługi
Usługa OpenRouter umożliwia integrację z interfejsem API OpenRouter w celu uzupełnienia czatów opartych na LLM (Large Language Model). Główne zadania usługi to:
1. Wysyłanie zapytań do API zawierających komunikat systemowy i komunikat użytkownika.
2. Przetwarzanie odpowiedzi zgodnie z ściśle określonym formatem (response_format) opartym na JSON Schema.
3. Konfiguracja nazwy modelu oraz parametrów modelu, takich jak temperatura, top_p, frequency_penalty i presence_penalty.
4. Obsługa błędów, logowanie oraz zapewnienie bezpieczeństwa komunikacji.

## 2. Opis konstruktora
Konstruktor usługi inicjalizuje wszystkie kluczowe komponenty, w tym:
1. **Klient API OpenRouter** – odpowiedzialny za:
   - Konfigurację adresu endpointu,
   - Ustawienie timeout i mechanizmu ponawiania (retry),
   - Autoryzację z użyciem tokena przechowywanego w zmiennych środowiskowych.
2. **Manager czatu** – łączy komunikaty systemowe i użytkownika, budując właściwy payload dla API.
3. **Konfigurator parametrów modelu i response_format** – ustala domyślne wartości:
   - Nazwa modelu (np. `gpt-4`),
   - Parametry modelu (np. temperature: 1.0, top_p: 1.0, frequency_penalty: 0.0, presence_penalty: 0.0),
   - Schemat odpowiedzi (response_format) z walidacją poprzez JSON Schema.

## 3. Publiczne metody i pola
Usługa udostępnia następujące publiczne metody i pola:
1. `sendChatRequest(message: string): Promise<Response>`
   - Łączy komunikat systemowy i komunikat użytkownika, wysyła żądanie do API i zwraca przetworzoną odpowiedź.
2. `setModelParameters(params: ModelParameters): void`
   - Aktualizuje konfigurację modelu (nazwa, temperatura, top_p, frequency_penalty, presence_penalty).
3. Publiczne pola przechowujące aktualną konfigurację API, parametry modelu oraz ustawienia response_format.

## 4. Prywatne metody i pola
Kluczowe elementy wewnętrzne usługi obejmują:
1. `_buildRequestPayload(): RequestPayload`
   - Buduje obiekt zapytania poprzez łączenie:
     - **Komunikatu systemowego:** np. `{ role: 'system', content: 'This is the system prompt to set context.' }`
     - **Komunikatu użytkownika:** np. `{ role: 'user', content: 'User message goes here.' }`
     - **Parametrów modelu:** np. `{ temperature: 1.0, top_p: 1.0, frequency_penalty: 0.0, presence_penalty: 0.0 }`
2. `_parseResponse(response: any): ParsedResponse`
   - Waliduje i parsuje odpowiedź przy użyciu zdefiniowanego schematu response_format.
3. `_handleError(error: Error): void`
   - Centralizuje obsługę błędów (sieciowych, API, walidacji) oraz logowanie zdarzeń.
4. Prywatne pole `_apiClient`
   - Instancja klienta HTTP służąca do komunikacji z API OpenRouter.

## 5. Obsługa błędów
Potencjalne scenariusze błędów oraz proponowane rozwiązania:
1. **Błąd sieciowy (timeout, brak połączenia):**
   - Implementacja mechanizmu retry oraz odpowiednich timeoutów.
2. **Błąd autoryzacji (nieprawidłowy lub wygasły token):**
   - Walidacja tokena przed wysłaniem żądania i szybkie zgłoszenie błędu autoryzacji.
3. **Niezgodność formatu odpowiedzi:**
   - Walidacja otrzymanej odpowiedzi przy użyciu JSON Schema, z fallback na wartości domyślne lub zgłoszeniem błędu.
4. **Błąd przetwarzania danych:**
   - Wczesne przechwytywanie wyjątku poprzez `_handleError` oraz logowanie szczegółowych informacji o błędzie.

## 6. Kwestie bezpieczeństwa
Kluczowe aspekty bezpieczeństwa to:
1. Przechowywanie wrażliwych danych (klucze API, tokeny) w bezpiecznych zmiennych środowiskowych.
2. Implementacja rate limiting oraz mechanizmów retry, aby utrzymać stabilność serwisu.

## 7. Plan wdrożenia krok po kroku
1. **Konfiguracja środowiska:**
   - Instalacja zależności: Astro 5, TypeScript 5, React 19, Tailwind 4, Shadcn/ui.
   - Konfiguracja zmiennych środowiskowych, w tym klucza API do OpenRouter.
2. **Implementacja modułu klienta API OpenRouter:**
   - Utworzenie modułu odpowiedzialnego za budowanie zapytań HTTP, ustawienie endpointu, tokena oraz timeout.
   - Implementacja mechanizmu retry dla nieudanych połączeń.
3. **Implementacja modułu menedżera czatu:**
   - Opracowanie logiki łączenia komunikatów przy użyciu metody `_buildRequestPayload()`.
   - Implementacja metod publicznych, takich jak `sendChatRequest`.
4. **Konfiguracja komunikatów dla API:**
   - **Komunikat systemowy:**
     1. Przykład: `{ role: 'system', content: 'This is the system prompt to set context.' }`
   - **Komunikat użytkownika:**
     2. Przykład: `{ role: 'user', content: 'User message goes here.' }`
   - **Response Format:**
     3. Przykład:
        ```json
        { 
          "type": "json_schema", 
          "json_schema": {
            "name": "ChatResponse", 
            "strict": true, 
            "schema": { 
              "message": { "type": "string" } 
            } 
          } 
        }
        ```
   - **Nazwa modelu:**
     4. Przykład: `gpt-4`
   - **Parametry modelu:**
     5. Przykład: `{ temperature: 1.0, top_p: 1.0, frequency_penalty: 0.0, presence_penalty: 0.0 }`
5. **Implementacja logiki odpowiedzi i walidacji:**
   - Utworzenie metody `_parseResponse(response)` do walidacji i parsowania odpowiedzi z API przy użyciu JSON Schema.
6. **Implementacja obsługi błędów i logowania:**
   - Stworzenie metody `_handleError(error)` do centralnej obsługi wszystkich błędów.
   - Dodanie globalnego handlera błędów na poziomie aplikacji.
   - Dodać mechanizmy logowania błędów, pamiętając o zasadach bezpieczeństwa i nie rejestrowaniu danych wrażliwych
