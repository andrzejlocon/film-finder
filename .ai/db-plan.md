# Schemat bazy danych

## 1. Tabele

### 1.2. Tabela `user_films`
- `id`: BIGSERIAL PRIMARY KEY
- `user_id`: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `title`: VARCHAR(200) NOT NULL
- `year`: INTEGER NOT NULL CHECK (year >= 1887)
- `description`: TEXT
- `genres`: TEXT[]
- `actors`: TEXT[]
- `director`: VARCHAR NOT NULL
- `status`: VARCHAR NOT NULL CHECK (status IN ('to-watch', 'watched', 'rejected'))
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `generation_id`: BIGINT REFERENCES generation_logs(id) ON DELETE SET NULL
- UNIQUE(user_id, title)

### 1.3. Tabela `user_preferences`
- `id`: BIGSERIAL PRIMARY KEY
- `user_id`: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE
- `actors`: TEXT[]
- `directors`: TEXT[]
- `genres`: TEXT[]
- `year_from`: INTEGER
- `year_to`: INTEGER

### 1.4. Tabela `film_status_logs`
- `id`: BIGSERIAL PRIMARY KEY
- `film_id`: BIGINT NOT NULL REFERENCES user_films(id) ON DELETE CASCADE
- `user_id`: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `prev_status`: VARCHAR NOT NULL CHECK (prev_status IN ('to-watch', 'watched', 'rejected'))
- `next_status`: VARCHAR NOT NULL CHECK (next_status IN ('to-watch', 'watched', 'rejected'))
- `status_changed_at`: TIMESTAMPTZ NOT NULL DEFAULT NOW()

### 1.5. Tabela `generation_logs`
- `id`: BIGSERIAL PRIMARY KEY
- `user_id`: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `model`: VARCHAR NOT NULL
- `generated_count`: INTEGER NOT NULL
- `marked_as_to_watch_count`: INTEGER NULLABLE
- `marked_as_watched_count`: INTEGER NULLABLE
- `marked_as_rejected_count`: INTEGER NULLABLE
- `criteria_hash`: VARCHAR NOT NULL
- `generation_duration`: INTEGER NOT NULL  -- czas trwania generacji w milisekundach
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ NOT NULL DEFAULT NOW()

### 1.6. Tabela `generation_error_logs`
- `id`: BIGSERIAL PRIMARY KEY
- `user_id`: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `model`: VARCHAR NOT NULL
- `criteria_hash`: VARCHAR NOT NULL
- `error_code`: VARCHAR NOT NULL
- `error_message`: TEXT NOT NULL
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT NOW()

## 2. Relacje między tabelami
- `user_films.user_id` REFERENCES `users.id` (relacja jeden-do-wielu: jeden użytkownik ma wiele filmów)
- `user_preferences.user_id` REFERENCES `users.id` (relacja jeden-do-jednego: jeden użytkownik ma jeden rekord preferencji)
- `film_status_logs.film_id` REFERENCES `user_films.id` (jeden film może mieć wiele logów zmian statusu)
- `film_status_logs.user_id` REFERENCES `users.id`
- `generation_logs.user_id` REFERENCES `users.id`
- `generation_error_logs.user_id` REFERENCES `users.id`

## 3. Indeksy
- Indeks na `user_films.user_id`
- Indeks na `user_films.title`
- Indeksy na `film_status_logs.film_id` oraz `film_status_logs.user_id`
- Indeksy na `generation_logs.user_id` i `generation_error_logs.user_id`

## 4. Zasady RLS (Row Level Security)
Dla tabel zawierających dane użytkowników należy włączyć RLS i zastosować polityki zabezpieczeń, na przykład dla `user_films`:

```sql
ALTER TABLE user_films ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_films_policy ON user_films
  USING (user_id = current_setting('app.current_user_id')::uuid);
```

Analogiczne polityki RLS powinny zostać wdrożone dla tabel: `user_preferences`, `film_status_logs`, `generation_logs` oraz `generation_error_logs`.

## 5. Dodatkowe uwagi
- Aktualizacja pola `updated_at` w tabelach (np. `user_films` i `generation_logs`) powinna być realizowana za pomocą triggerów.
- Wszystkie daty są przechowywane jako TIMESTAMPTZ z domyślną wartością NOW().