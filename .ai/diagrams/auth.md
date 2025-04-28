<authentication_analysis>

1. Przepływy autentykacji z dokumentacji PRD i AuthSpec:
   - Rejestracja: Użytkownik wysyła formularz rejestracji, dane są walidowane, Astro API wywołuje metodę supabase.auth.signUp, a w przypadku powodzenia użytkownik otrzymuje potwierdzenie oraz, opcjonalnie, e-mail weryfikacyjny. Następnie tworzona jest sesja i użytkownik jest przekierowywany do profilu.
   - Logowanie: Użytkownik wysyła formularz logowania, Astro API wywołuje metodę supabase.auth.signIn, a po poprawnym zalogowaniu tworzony jest token sesji, który jest przekazywany do przeglądarki i umożliwia dostęp do chronionych zasobów.
   - Wylogowanie: Użytkownik wysyła żądanie wylogowania, Astro API wywołuje metodę supabase.auth.signOut, co kończy sesję i czyści tokeny, a następnie następuje przekierowanie do strony logowania.
   - Reset hasła: Użytkownik wysyła żądanie resetu hasła, Astro API wywołuje metodę supabase.auth.api.resetPasswordForEmail, co inicjuje wysyłkę linku resetującego hasło na podany adres e-mail.
2. Główni aktorzy:
   - Browser: Interfejs użytkownika, wysyłający żądania autentykacyjne.
   - Middleware: Odpowiedzialny za weryfikację tokenów przy próbach dostępu do chronionych zasobów.
   - Astro API: Serwerowa warstwa odpowiedzialna za obsługę logiki autentykacji.
   - Supabase Auth: Usługa autoryzacji, która przeprowadza operacje rejestracji, logowania, wylogowania i resetu hasła.
3. Proces weryfikacji tokenów: Middleware przechwytuje żądania, weryfikuje token przez Astro API oraz, w razie potrzeby, konsultuje się z Supabase Auth. W przypadku wygaśnięcia tokenu, użytkownik jest przekierowywany na stronę logowania.
4. Opis kroków autentykacji:
   - Rejestracja: Dane rejestracyjne → Supabase Auth (signUp) → potwierdzenie i ewentualna weryfikacja e-mailem → utworzenie sesji i przekierowanie.
   - Logowanie: Dane logowania → Supabase Auth (signIn) → utworzenie sesji (token) → dostęp do chronionych zasobów.
   - Wylogowanie: Żądanie wylogowania → Supabase Auth (signOut) → zakończenie sesji → przekierowanie na stronę logowania.
   - Reset hasła: Żądanie resetu → Supabase Auth (resetPasswordForEmail) → wysłanie linku resetującego.

</authentication_analysis>

##

```mermaid
sequenceDiagram
    autonumber
    participant Browser
    participant Middleware
    participant API as "Astro API"
    participant Auth as "Supabase Auth"

    %% Rejestracja
    Browser->>API: Send registration data (email, password, confirm)
    activate API
    API->>Auth: Call supabase.auth.signUp(data)
    activate Auth
    Auth-->>API: Confirm user creation (optional email verification)
    deactivate Auth
    API->>Browser: Set session token, redirect to profile
    deactivate API

    %% Logowanie
    Browser->>API: Send login data (email, password)
    activate API
    API->>Auth: Call supabase.auth.signIn(credentials)
    activate Auth
    Auth-->>API: Return session token
    deactivate Auth
    API->>Browser: Set session token, redirect to dashboard
    deactivate API

    %% Weryfikacja tokenu dla chronionych żądań
    Browser->>Middleware: Request protected resource with token
    activate Middleware
    Middleware->>API: Validate token
    API->>Auth: Verify token (if applicable)
    activate Auth
    Auth-->>API: Token valid or expired
    deactivate Auth
    alt Token valid
      API->>Browser: Return requested data
    else Token expired
      API-->>Browser: Error - Token expired, redirect to login
    end
    deactivate Middleware

    %% Wylogowanie
    Browser->>API: Send logout request
    activate API
    API->>Auth: Call supabase.auth.signOut
    activate Auth
    Auth-->>API: Confirm session end
    deactivate Auth
    API->>Browser: Clear session, redirect to login
    deactivate API

    %% Reset hasła
    Browser->>API: Send password reset request (email)
    activate API
    API->>Auth: Call supabase.auth.api.resetPasswordForEmail(email)
    activate Auth
    Auth-->>API: Confirm email sent
    deactivate Auth
    API->>Browser: Show confirmation (check email)
    deactivate API
```
