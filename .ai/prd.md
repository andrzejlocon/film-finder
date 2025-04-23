# Dokument wymagań produktu (PRD) - FilmFinder

## 1. Przegląd produktu
FilmFinder to aplikacja MVP, której celem jest uproszczenie procesu wyszukiwania filmów i seriali poprzez umożliwienie użytkownikom definiowania własnych kryteriów (aktorzy, reżyserzy, gatunki, zakres lat produkcji). Aplikacja wykorzystuje sztuczną inteligencję do generowania spersonalizowanych rekomendacji filmowych na podstawie zdefiniowanych preferencji.

## 2. Problem użytkownika
Wyszukiwanie filmów i seriali przy użyciu licznych kryteriów jest czasochłonne i skomplikowane. Użytkownicy posiadają specyficzne, często sprecyzowane preferencje, a istniejące narzędzia nie oferują precyzyjnych dopasowań. FilmFinder rozwiązuje ten problem, pozwalając użytkownikom definiować dokładne kryteria oraz korzystać z AI, która na ich podstawie generuje rekomendacje dopasowane do ich indywidualnych potrzeb.

## 3. Wymagania funkcjonalne
1. Rejestracja i logowanie użytkowników:
   - Formularz logowania i rejestracji.
   - Możliwość edycji hasła oraz usunięcia konta przez użytkownika.

2. Uzupełnianie i zarządzanie preferencjami filmowymi:
   - Użytkownik może wprowadzić ulubionych aktorów (z możliwością wykluczenia określonych) oraz preferowanych reżyserów, gatunki i zakres lat produkcji.

3. Ustawianie kryteriów wyszukiwania:
   - Formularz umożliwiający ręczne wpisanie kryteriów (aktorzy, reżyserzy, gatunki, zakres lat).
   - Opcja "Uzupełnij z profilu", która automatycznie wstawia preferencje zapisane w profilu użytkownika.

4. Generowanie rekomendacji:
   - Wywoływanie rekomendacji po naciśnięciu przycisku "Rekomendowane filmy" przy użyciu API modelu LLM.
   - Prezentacja otrzymanych propozycji w formie kart filmowych.

5. Zarządzanie rekomendacjami:
   - Możliwość oznaczania filmów jako "Do obejrzenia", "Obejrzane" lub "Odrzucone" za pomocą dedykowanych ikon.
   - Każda zmiana statusu powinna być logowana (identyfikator filmu, identyfikator użytkownika, poprzedni status, nowy status, data zmiany).

6. Przeglądanie i wyszukiwanie filmów na listach "Do obejrzenia", "Obejrzane", "Odrzucone":
   - Karty filmowe wyświetlające tytuł (z rokiem produkcji), krótki opis, gatunek, głównych aktorów i reżysera.
   - Prosta wyszukiwarka tekstowa.
   - Mechanizm infinite scroll do ładowania kolejnych filmowych kart.

7. Integracja z modułem AI:
   - Połączenie z API modelu LLM do generacji rekomendacji na podstawie zadanych kryteriów.
   - Lomunikat o błędzie w przypadku problemów z API lub braku odpowiedzi modelu.

8. Wymagania prawne i ograniczenia:
   - Dane osobowe użytkowników i filmów przechowywane zgodnie z RODO.
   - Prawo do wglądu i usunięcia danych (konto wraz z filmami) na wniosek użytkownika.

## 4. Granice produktu
1. Aplikacja nie integruje się z zewnętrznymi bazami danych filmowych (takimi jak IMDb czy TMDb) ani nie importuje automatycznie danych o filmach.
2. Brak zaawansowanych funkcji filtrowania statystycznego, analizy opinii użytkowników oraz funkcjonalności społecznościowych (np. dzielenie się recenzjami czy tworzenie list znajomych).
3. Nie przewiduje się obsługi multimediów, takich jak zdjęcia, zwiastuny czy recenzje wideo.
4. Na etapie MVP nie uwzględniamy scenariuszy awaryjnych związanych z błędami komunikacji z API modelu LLM.
5. Nie przewiduje się zaawansowanego wyszukiwania filmów.
6. Brak funckji społecznościowych, współdzielenia filmów między użytkownikami.

## 5. Historyjki użytkowników

US-001
Tytuł: Rejestracja użytkownika
Opis: Jako nowy użytkownik chcę mieć możliwość założenia konta, aby móc korzystać z aplikacji.
Kryteria akceptacji:
- Rejestracja odbywa się na dedykowanej stronie
- Użytkownik wprowadza adres email i hasło i potwierdzenie hasła.
- Po poprawnym wypełnieniu formularza i weryfikacji wprowadzonych danych konto jest aktywowane
- Po poprawnej rejestracji użytkownik otrzymuje potwierdzenie i zostaje zalogowany i przekierowany do swojego profilu.

US-002
Tytuł: Logowanie do aplikacji
Opis: Jako zarejestrowany użytkownik chcę się zalogować do aplikacji, aby uzyskać dostęp do spersonalizowanych funkcjonalności.
Kryteria akceptacji:
- Logowanie odbywa się na dedykowanej stronie
- Użytkownik loguje się używając swojego adresu email i hasła.
- Niepoprawne dane logowania pokazują komunikat o błędnych danych
- Przy poprawnych danych użytkownik zostaje przekierowany na stronę główną z kryteriami wyszukiwania filmów.
- Użytkownik może się wylogować z systemu poprzez przycisk w prawym górnym rogu w głównym @Layout.astro.
- Odzyskiwanie hasła powinno być możliwe

US-003
Tytuł: Uzupełnianie preferencji filmowych
Opis: Jako użytkownik chcę móc uzupełnić swój profil o preferencje filmowe (aktorzy, reżyserzy, gatunki, zakres lat produkcji), aby rekomendacje były dopasowane do moich upodobań.
Kryteria akceptacji:
- Użytkownik ma dostęp do formularza do uzupełniania preferencji.
- Pola formularza umożliwiają dodanie wielu aktorów, reżyserów, gatunków i zakres lat.
- Zapisane preferencje są widoczne i możliwe do edycji w profilu.

US-004
Tytuł: Ustawienie kryteriów wyszukiwania
Opis: Jako użytkownik chcę ręcznie ustawić kryteria wyszukiwania filmów, aby móc wygenerować spersonalizowane rekomendacje.
Kryteria akceptacji:
- Użytkownik może ręcznie wpisać kryteria (aktorzy, reżyserzy, gatunki, zakres lat).
- Istnieje przycisk "Uzupełnij z profilu", który automatycznie uzupełnia formularz preferencjami zapisanymi w profilu.
- Po wprowadzeniu kryteriów użytkownik może wywołać rekomendacje.

US-005
Tytuł: Generowanie rekomendacji filmowych
Opis: Jako użytkownik chcę wywołać proces generowania rekomendacji przy użyciu AI, aby otrzymać listę spersonalizowanych filmów.
Kryteria akceptacji:
- Użytkownik naciska przycisk "Rekomendowane filmy" po ustawieniu kryteriów wyszukiwania.
- System komunikuje się z API modelu LLM i wyświetla listę filmów odpowiadających zadanym kryteriom.
- Lista filmów pojawia się poniżej formularza kryteriów w formie kart filmowych.
- W przypadku problemów z API lub braku odpowiedzi modelu użytkownik zobaczy stosowny komunikat o błędzie.

US-006
Tytuł: Przeglądanie listy rekomendowanych filmów
Opis: Jako użytkownik chcę przeglądać listę rekomendowanych filmów w formie kart, aby móc szybko zapoznać się z propozycjami.
Kryteria akceptacji:
- Rekomendowane filmy są prezentowane w postaci kart zawierających tytuł (z rokiem produkcji), krótki opis, gatunek, głównych aktorów i reżysera.
- Użytkownik może oznaczać film jako "Do obejrzenia", "Obejrzane" lub "Odrzucone" przy użyciu dedykowanych ikon na karcie filmu.

US-007
Tytuł: Zarządzanie listami filmów użytkownika
Opis: Jako użytkownik chcę zarządzać filmami w trzech kategoriach ("Do obejrzenia", "Obejrzane", "Odrzucone"), aby móc łatwo śledzić, które filmy planuję obejrzeć, które są już obejrzane, a które odrzucam.
Kryteria akceptacji:
- Użytkownik może w każdej chwili zmienić status filmu z jednej kategorii na inną bez konieczności potwierdzania operacji.
- Zmiana statusu jest zapisywana z danymi: identyfikator filmu, identyfikator użytkownika, poprzedni status, nowy status, data zmiany.
- Karty ładują się dynamicznie dzięki mechanizmowi infinite scroll.
- Użytkownik może używać prostej wyszukiwarki tekstowej do przeszukiwania listy.

ID: US-008
Tytuł: Bezpieczny dostęp i autoryzacja
Opis: Jako zalogowany użytkownik chcę mieć pewność, że moje filmy nie są dostępne dla innych użytkowników, aby zachować prywatność i bezpieczeństwo danych.
Kryteria akceptacji:
- Tylko zalogowany użytkownik może wyświetlać i edytować swoje filmy.
- Nie ma dostępu do filmów innych użytkowników ani możliwości współdzielenia.


## 6. Metryki sukcesu
1. 80% użytkowników, którzy się zarejestrują, uzupełni swoje profile preferencji filmowych.
2. 70% użytkowników korzystających z funkcji rekomendacji AI co najmniej raz w tygodniu.
3. Monitorowanie tych wskaźników odbywa się poprzez dedykowaną tabelę logów, która rejestruje zmiany statusów filmów (identyfikatory, poprzedni status, nowy status, data zmiany).