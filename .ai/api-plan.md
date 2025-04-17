# REST API Plan

## 1. Resources

- **Users**: Managed through Supabase authentication. Although not explicitly defined in the provided schema, user identity is central to all operations.
- **Films**: Corresponds to the `user_films` table. Stores film details such as title, year, description, genres, actors, director, and status (allowed values: "to-watch", "watched", "rejected"). Enforces a unique constraint per user on film titles.
- **Preferences**: Corresponds to the `user_preferences` table. Stores user-specific film preferences including actors, directors, genres, and production year range.
- **Film Status Logs**: Corresponds to the `film_status_logs` table. Records each change of film status including previous and new status along with timestamps.
- **Generation Logs**: Corresponds to the `generation_logs` table. Logs details of recommendation generation events including model used, counts of generated films, and generation duration.
- **Generation Error Logs**: Corresponds to the `generation_error_logs` table. Logs errors encountered during the recommendation generation process.

## 2. Endpoints

### Films (User Films)

- **GET /films**
  - **Description**: Retrieve a paginated list of films for the authenticated user.
  - **Query Parameters**:
    - `status` (optional): Filter by film status (e.g., `to-watch`, `watched`, `rejected`).
    - `page` (optional): Page number for pagination.
    - `limit` (optional): Items per page.
    - `search` (optional): Text search on film titles.
  - **Response**:
    - 200 OK with a JSON object containing a list of films and pagination metadata.

- **POST /films**
  - **Description**: Create one or multiple film entries for the user.
  - **Request Payload**:
    ```json
    {
      "films": [
        {
          "title": "Inception",
          "year": 2010,
          "description": "A mind-bending thriller.",
          "genres": ["Sci-Fi", "Thriller"],
          "actors": ["Leonardo DiCaprio"],
          "director": "Christopher Nolan",
          "status": "to-watch",
          "generation_id": 123
        },
        {
          "title": "The Dark Knight",
          "year": 2008,
          "description": "Batman faces his greatest challenge.",
          "genres": ["Action", "Drama"],
          "actors": ["Christian Bale", "Heath Ledger"],
          "director": "Christopher Nolan",
          "status": "to-watch",
          "generation_id": 123
        }
      ]
    }
    ```
  - **Response**:
    - 201 Created with an array of created film objects.
  - **Errors**: 
    - 400 Bad Request (e.g., invalid year or status)
    - 409 Conflict (duplicate film titles for the user)
    - Response will include details about which films failed validation

- **GET /films/{filmId}**
  - **Description**: Retrieve details of a specific film by its ID.
  - **Response**:
    - 200 OK with the film object.
  - **Errors**: 404 Not Found.

- **PUT/PATCH /films/{filmId}**
  - **Description**: Update an existing film entry.
  - **Request Payload**: JSON object with updated fields (e.g., title, year, description, etc.).
  - **Response**:
    - 200 OK with the updated film object.
  - **Errors**: 400 Bad Request, 404 Not Found.

- **DELETE /films/{filmId}**
  - **Description**: Delete a film entry.
  - **Response**:
    - 204 No Content.
  - **Errors**: 404 Not Found.

- **POST /films/{filmId}/status**
  - **Description**: Update the status of a film (e.g., marking as "to-watch", "watched", or "rejected"). This endpoint will also log the change in the `film_status_logs` table.
  - **Request Payload**:
    ```json
    {
      "new_status": "watched"
    }
    ```
  - **Response**:
    - 200 OK with the updated film object and confirmation of the status change.
  - **Errors**: 400 Bad Request (invalid status), 404 Not Found.

### Preferences

- **GET /preferences**
  - **Description**: Retrieve the film preferences of the authenticated user.
  - **Response**:
    - 200 OK with the preferences object.

- **PUT /preferences**
  - **Description**: Create or update film preferences for the user.
  - **Request Payload**:
    ```json
    {
      "actors": ["Leonardo DiCaprio"],
      "directors": ["Christopher Nolan"],
      "genres": ["Sci-Fi", "Thriller"],
      "year_from": 2000,
      "year_to": 2020
    }
    ```
  - **Response**:
    - 200 OK (or 201 Created) with the preferences object.
  - **Errors**: 400 Bad Request.

### Recommendations

- **POST /recommendations**
  - **Description**: Generate film recommendations using AI based on user-provided criteria or preferences (via a "fill from profile" option).
  - **Request Payload** (optional if using saved preferences):
    ```json
    {
      "criteria": {
        "actors": ["Leonardo DiCaprio"],
        "directors": ["Christopher Nolan"],
        "genres": ["Sci-Fi"],
        "year_from": 2000,
        "year_to": 2020
      }
    }
    ```
  - **Response**:
    - 200 OK with a list of recommended film objects along with generation metadata (e.g., model, generation duration).
  - **Errors**: 400 Bad Request (invalid criteria), 500 Internal Server Error (AI API failure).

### Admin/Monitoring (Optional/Internal Endpoints)

- **GET /logs/film-status**
  - **Description**: Retrieve film status change logs for auditing purposes.
  - **Query Parameters**: `filmId`, `userId`, `page`, `limit`.
  - **Response**:
    - 200 OK with a list of log entries.

- **GET /logs/generation**
  - **Description**: Retrieve logs related to recommendation generation events.
  - **Response**:
    - 200 OK with a list of generation logs.

- **GET /logs/generation-errors**
  - **Description**: Retrieve error logs for recommendation generation failures.
  - **Response**:
    - 200 OK with a list of generation error log entries.

## 3. Authentication and Authorization

- The API uses token-based authentication (e.g., JWT) integrated with Supabase Auth.
- All endpoints (apart from `/auth/register` and `/auth/login`) require an `Authorization` header with a valid Bearer token.
- Row Level Security (RLS) is enforced at the database level, ensuring users can only access their own resources.
- Admin/monitoring endpoints should be restricted to privileged users only.

## 4. Validation and Business Logic

- **Validation Rules (from DB Schema):**
  - Film `year` must be an integer and at least 1887.
  - Film `status` must be one of: "to-watch", "watched", or "rejected".
  - Unique constraint on films per user: a user cannot have two films with the same title.

- **Business Logic Mappings (from PRD):**
  1. **User Registration and Login**: Securely create and authenticate users.
  2. **Managing Preferences**: Validate and save user preferences. Support 'fill from profile' in recommendation requests.
  3. **Film Management**: Perform standard CRUD operations with additional validation, and log any status changes via a dedicated endpoint (`POST /films/{filmId}/status`) which records changes in `film_status_logs`.
  4. **Recommendation Generation**:
     - Validate input criteria against allowed values.
     - Call an external AI service (through Openrouter or similar) to generate recommendations.
     - Log the generation event in `generation_logs` and, in case of errors, record details in `generation_error_logs`.
  5. **Pagination and Filtering**: Implement pagination, search, and filtering on list endpoints to enhance performance and usability.

- **Error Handling:**
  - Use appropriate HTTP status codes: 400 for invalid input, 404 for missing resources, and 500-level for server errors.
  - Provide clear and descriptive error messages for debugging and user feedback.

## Assumptions

- The API is built on top of Supabase, leveraging its PostgreSQL database and built-in authentication features.
- The external AI recommendation generation endpoint is synchronous for the MVP. Future iterations may introduce asynchronous processing or background jobs.
- Admin/monitoring endpoints are intended for internal use and are secured accordingly. 