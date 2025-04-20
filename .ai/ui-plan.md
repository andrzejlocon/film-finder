# Architektura UI dla FilmFinder

## 1. Przegląd struktury UI

Aplikacja FilmFinder będzie oparta o Astro, React, Tailwind CSS oraz Shadcn/ui. Główna struktura interfejsu uwzględnia:
- Modułowe widoki odpowiadające kluczowym funkcjonalnościom (autentykacja, profil użytkownika, generowanie rekomendacji, przegląd list filmów).
- Globalną nawigację opartą o topbar, umożliwiającą łatwy dostęp do poszczególnych sekcji.
- Responsywność i zgodność z WCAG AA, implementowaną przy użyciu Tailwind CSS.
- Obsługę komunikatów (inline errors, globalne alerty oraz toast) oraz loading skeletons w mechanizmie infinite scroll.

## 2. Lista widoków

### 2.1. Ekran autentykacji (Logowanie/Rejestracja)
- **Ścieżka widoku:** /login i /register
- **Główny cel:** Umożliwienie użytkownikowi rejestracji oraz logowania w systemie.
- **Kluczowe informacje:** Formularze z regex walidacją adresu email oraz hasła (min. 8 znaków, duże i małe litery, cyfry, znaki specjalne).
- **Kluczowe komponenty widoku:** Formularze (inputy, przyciski), komunikaty inline dla błędów.
- **UX, dostępność i względy bezpieczeństwa:** Przejrzysty i responsywny interfejs; walidacja pól formularza oraz wsparcie dla klawiaturowej nawigacji i screen readerów.

### 2.2. Ekran profilu użytkownika (Preferencje filmowe)
- **Ścieżka widoku:** /profile
- **Główny cel:** Uzupełnienie i edycja preferencji filmowych użytkownika.
- **Kluczowe informacje:** Informacje o preferencjach dotyczących aktorów, reżyserów, gatunków i zakresu lat produkcji. Formularz wykorzystujący token input/chips do wprowadzania wielu wartości.
- **Kluczowe komponenty widoku:** Formularz edycyjny, przycisk "Zapisz", Przycisk "Usuń konto" z potwierdzeniem w postaci modalnego okna, komunikaty inline przy błędach walidacji.
- **UX, dostępność i względy bezpieczeństwa:** Brak autozapisu zapewnia kontrolę użytkownika; responsywność i czytelność na wszystkich urządzeniach; dostępność dla osób z niepełnosprawnościami.

### 2.3. Widok generowania rekomendacji
- **Ścieżka widoku:** /recommendations
- **Główny cel:** Umożliwienie użytkownikowi ustawienia kryteriów wyszukiwania i wygenerowania rekomendacji filmowych przez AI.
- **Kluczowe informacje:** Formularz do wpisywania kryteriów (aktorzy, reżyserzy, gatunki, zakres lat) oraz wizualizacja wyników w postaci kart filmowych. Formularz wykorzystujący token input/chips do wprowadzania wielu wartości. Obok formularza przycisk uzupełnij z profilu, do uzupełniania kryteriów preferencjami użytkownika.
- **Kluczowe komponenty widoku:** Formularz kryteriów, przycisk "Rekomendowane filmy", przycisk "Uzupełnij z profilu", karty filmowe z możliwością ustawienia statusu w postaci ikon "Do obejrzenia", "Obejrzane", "Odrzucone", przycisk "Zapisz rekomendacje" do bulkowego zapamiętania wyboru użytkownika.
- **UX, dostępność i względy bezpieczeństwa:** Jasne komunikaty inline o błędach (np. problem z API), responsywność

### 2.4. Ekran list filmów (Zarządzanie filmami)
- **Ścieżka widoku:** /films
- **Główny cel:** Przeglądanie i zarządzanie filmami zapisanymi przez użytkownika w trzech kategoriach: "Do obejrzenia", "Obejrzane", "Odrzucone".
- **Kluczowe informacje:** Wyświetlenie kart filmowych z tytułem, rokiem produkcji, krótkim opisem, gatunkiem oraz informacjami o aktorach i reżyserze.
- **Kluczowe komponenty widoku:** Lista kart filmowych, prosta wyszukiwarka tekstowa, infinite scroll z mechanizmem ładowania skeletonami, możliwość zmiany statusu filmów bez dodatkowego potwierdzenia.
- **UX, dostępność i względy bezpieczeństwa:** Szybki dostęp do informacji, intuicyjna zmiana statusu filmu, uwzględnienie dynamicznych aktualizacji list; wsparcie dla osób z ograniczeniami wzroku (np. odpowiednie kontrasty, aria-labels).

## 3. Mapa podróży użytkownika

1. Użytkownik wchodzi na stronę i trafia na ekran autentykacji, gdzie może się zarejestrować lub zalogować.
2. Po zalogowaniu system sprawdza stan profilu:
   - Jeżeli profil nie jest uzupełniony, użytkownik jest przekierowywany na ekran profilu (/profile) w celu uzupełnienia preferencji filmowych.
   - Jeżeli profil jest uzupełniony, użytkownik trafia na widok generowania rekomendacji (/recommendations).
3. W widoku rekomendacji użytkownik:
   - Uzupełnia kryteria wyszukiwania lub korzysta z opcji "Uzupełnij z profilu".
   - Klika przycisk "Rekomendowane filmy" i otrzymuje listę filmowych kart z wynikami rekomendacji.
   - Może zmienić status filmu bezpośrednio z widoku rekomendacji, zmiany potwierdza przyciskiem "Zapisz rekomendacje".
4. Alternatywnie, użytkownik może przejść do ekranu wcześniej zapisanych rekomendacji list filmów (/films) za pośrednictwem topbara, aby zarządzać filmami (zmiana statusu bez potwierdzenia, wyszukiwanie, infinite scroll).
5. Globalna nawigacja umożliwia szybkie przejście między widokami: autentykacja, profil, rekomendacje, lista filmów oraz opcje wylogowania.

## 4. Układ i struktura nawigacji

- **Topbar:** Widoczny na wszystkich ekranach po zalogowaniu. Zawiera linki do głównych sekcji: "Rekomendacje", "Profil", "Moje filmy" oraz opcję wylogowania.
- **Responsywny design:** Topbar i inne elementy muszą być dostosowane do różnych rozmiarów ekranów (mobile, tablet, desktop) przy użyciu Tailwind CSS.
- **Dodatkowe akcje:** W widokach szczegółowych (np. usunięcie konta na ekranie profilu) mogą pojawiać się modalne okna potwierdzające krytyczne operacje.
- **Dostępność:** Wszystkie elementy nawigacji będą posiadać odpowiednie etykiety (aria-labels), wsparcie dla nawigacji klawiaturowej oraz wysoki kontrast kolorów.

## 5. Kluczowe komponenty

- **Topbar:** Globalny element nawigacyjny, umożliwiający szybki dostęp do głównych widoków.
- **Formularze:** Używane w widokach autentykacji i profilu; zawierają regex walidację i obsługę błędów inline.
- **Karty filmowe:** Reprezentacja wyników rekomendacji i list filmów; zawierają wszystkie kluczowe informacje o filmie oraz umożliwiają zmianę statusu.
- **Skeleton Loaders:** Mechanizm ładowania treści przy infinite scroll, poprawiający doświadczenie użytkownika.
- **Toast/Alert System:** Globalny system powiadomień o sukcesach i błędach.
- **Modal Potwierdzenia:** Używany przy operacjach krytycznych, takich jak usunięcie konta.
- **Token Input/Chips:** Umożliwiają dynamiczne wprowadzanie wielu wartości w formularzach (np. dla aktorów, reżyserów, gatunków).
- **React Context i Hooki:** Początkowa implementacja zarządzania stanem aplikacji, pozwalająca na synchronizację danych z API. 