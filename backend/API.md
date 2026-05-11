# Vidita Cafe API Specification

## Base URL
`https://api.shishapp.com/api/v1`

## Headers
*   **Authentication**: Most endpoints require a Bearer token.
    `Authorization: Bearer <token>`
*   **Language**: Used to override preferred content language.
    `X-Shishapp-Language: <lang_code>` (e.g., `es`, `en`, `pt-BR`)
*   **Country**: Used for initial context in some endpoints.
    `X-Vidita-Country: <country_code>` (e.g., `AR`, `UY`)

---

## 1. Authentication (`/auth`)

### Register
*   **Endpoint**: `POST /auth/register`
*   **Description**: Creates a new account.
*   **Payload**: `User` object (email, password, etc.)
*   **Response**: `AuthResponse`

### Login
*   **Endpoint**: `POST /auth/login`
*   **Description**: Standard email/password login.
*   **Payload**: `{ "email": "...", "password": "..." }`
*   **Response**: `AuthResponse`

### Google Login
*   **Endpoint**: `POST /auth/google`
*   **Description**: Login via Google OAuth.
*   **Payload**: `{ "idToken": "...", "preferredCountry": "...", "preferredLanguage": "..." }`
*   **Response**: `AuthResponse`

### Current User (Me)
*   **Endpoint**: `GET /auth/me`
*   **Description**: Returns current user profile including roles and mastery.
*   **Response**: `User` object.

### Update Profile
*   **Endpoint**: `PUT /auth/profile`
*   **Description**: Updates user preferences (name, country, language).
*   **Payload**: `User` object (partial).

### Get Context
*   **Endpoint**: `GET /auth/context`
*   **Description**: Inferred country/language based on IP.
*   **Response**: `{ "country": "...", "language": "..." }`

---

## 2. Discovery & Public API

### Discovery Feed
*   **Endpoint**: `GET /feed`
*   **Description**: Returns a list of videos, insights, and promotions.
*   **Response**: `std::vector<FeedCard>`

### Venue Search
*   **Endpoint**: `GET /venues/search`
*   **Query Params**: `lat` (double), `lon` (double)
*   **Description**: Returns 10 nearest venues sorted by distance.
*   **Response**: `std::vector<Venue>`

### Get Venue
*   **Endpoint**: `GET /venues/{id}`
*   **Description**: Get details of a specific venue.
*   **Response**: `Venue` object.

### Short Link Redirect
*   **Endpoint**: `GET /dl/{code}`
*   **Description**: Public short link redirection endpoint.
*   **Response**: 302 Redirect to `target_path`.

---

## 3. Journal & Brewing (`/journal`, `/brewing`)

### Journal Entries
*   **List**: `GET /journal` (Alias: `GET /journey`)
*   **Get**: `GET /journal/{id}` (Alias: `GET /journey/{id}`)
*   **Create**: `POST /journal` (Alias: `POST /journey`)
*   **Update**: `PUT /journal/{id}` (Alias: `PUT /journey/{id}`)
*   **Delete**: `DELETE /journal/{id}` (Alias: `DELETE /journey/{id}`)
*   **Payload/Response**: `JournalEntry` object.

### Journal Tags
*   **Endpoint**: `GET /journal/tags`
*   **Description**: Returns active tags for the current context (country/venue).
*   **Response**: `std::vector<TagCategory>`

### Brewing Methods
*   **Endpoint**: `GET /brewing/methods` (Aliases: `/brewing/method`, `/methods`, `/method`)
*   **Description**: Returns list of all brewing methods with steps.
*   **Response**: `std::vector<BrewingMethod>`

### Brewing Presets
*   **List**: `GET /brewing/presets`
*   **Create**: `POST /brewing/presets`
*   **Delete**: `DELETE /brewing/presets/{id}`
*   **Payload/Response**: `BrewingPreset` object.

---

## 4. Equipment (`/equipment`)

### List Catalog
*   **Endpoint**: `GET /equipment` (Aliases: `/equipments`, `/equipment/list`)
*   **Description**: Returns all equipment with localized names and descriptions.
*   **Response**: `std::vector<Equipment>`

### Owned Equipment
*   **Endpoint**: `GET /equipment/owned`
*   **Description**: IDs of equipment owned by the user.
*   **Response**: `std::vector<std::string>`

### Toggle Ownership
*   **Endpoint**: `POST /equipment/{id}/toggle`
*   **Description**: Adds/removes equipment from user collection.

---

## 5. Admin API (`/admin`)
*Requires GLOBAL or COUNTRY admin role.*

### Global Stats
*   **Endpoint**: `GET /admin/stats`
*   **Response**: `AdminStats`

### Content Management (Videos)
*   `GET /admin/videos`
*   `POST /admin/videos`
*   `PUT /admin/videos/{id}`
*   `DELETE /admin/videos/{id}`
*   **Model**: `Video`

### Affiliate Links
*   `GET /admin/links`
*   `POST /admin/links`
*   `PUT /admin/links/{id}`
*   `DELETE /admin/links/{id}`
*   **Model**: `PurchaseLink`

### Catalog (Equipment/Provisions)
*   `GET /admin/equipment`
*   `POST /admin/equipment`
*   `PUT /admin/equipment/{id}`
*   `DELETE /admin/equipment/{id}`

### Venues & Users
*   `GET /admin/users` (List users)
*   `GET /admin/venues` (List venues)
*   `GET /admin/venues/search`
*   `POST /admin/venues`
*   `PUT /admin/venues/{id}`
*   `DELETE /admin/venues/{id}`
*   `POST /admin/users/{userId}/roles` (Assign role)
*   `DELETE /admin/users/roles/{roleId}` (Revoke role)
*   `POST /admin/users/{userId}/impersonate` (Get auth token for user)

### Short Links
*   `GET /admin/short-links`
*   `GET /admin/short-links/code/{code}`
*   `PUT /admin/short-links/{id}` (Create or Update)
*   `DELETE /admin/short-links/{id}`
*   **Assign Block**: `POST /admin/short-links/assign-block`
    *   **Payload**: `ShortLinkBlockRequest` (Max 1000 codes)

### Tag & Category Management
*   `GET /admin/tags/all` (Full localized tag tree)
*   `POST /admin/tags/categories`
*   `PUT /admin/tags/categories/{id}`
*   `DELETE /admin/tags/categories/{id}`
*   `POST /admin/tags`
*   `PUT /admin/tags/{id}`
*   `DELETE /admin/tags/{id}`
*   `PUT /admin/tags/{tagId}/translations/{lang}` (Update specific translation)

### Context Selection
*   `GET /admin/tags/context` (Get global context)
*   `GET /admin/tags/venue/{venueId}` (Get venue overrides)
*   `POST /admin/tags/country/{countryCode}` (Set country defaults)
*   `POST /admin/tags/venue/{venueId}` (Set venue overrides)

---

## 6. Venue Admin API (`/venue-admin`)
*Requires VENUE admin role for the specific venue.*

### Venue Stats
*   **Endpoint**: `GET /venue-admin/stats?venue_id={id}&period={week|month|year}`
*   **Response**: `VenueStats`

### Promotions
*   `GET /venue-admin/promotions?venue_id={id}`
*   `POST /venue-admin/promotions`
*   `DELETE /venue-admin/promotions/{id}`
*   **Model**: `VenuePromotion`
