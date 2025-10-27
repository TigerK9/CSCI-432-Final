# API Documentation

This document provides an overview of the RESTful API endpoints available for this application.

## Base URL

`http://localhost:5173` (for local development)

## Authentication

All protected routes require a JSON Web Token (JWT) to be sent in the `Authorization` header as a `Bearer` token.

`Authorization: Bearer <your_jwt_token>`

---

## User Authentication

### `POST /api/users/signup`

Registers a new user.

-   **Description:** Creates a new user account with the provided name, email, and password.
-   **Request Body:**
    ```json
    {
        "name": "string",
        "email": "string",
        "password": "string"
    }
    ```
-   **Responses:**
    -   `201 Created`: User created successfully.
        ```json
        {
            "message": "User created successfully"
        }
        ```
    -   `400 Bad Request`: User with this email already exists.
    -   `500 Internal Server Error`: Server error.

### `POST /api/users/login`

Authenticates a user.

-   **Description:** Logs in a user with their email and password, returning a JWT for subsequent authenticated requests.
-   **Request Body:**
    ```json
    {
        "email": "string",
        "password": "string"
    }
    ```
-   **Responses:**
    -   `200 OK`: Login successful.
        ```json
        {
            "token": "string (JWT)",
            "email": "string",
            "role": "string (e.g., 'member', 'admin', 'chairman')",
            "name": "string"
        }
        ```
    -   `400 Bad Request`: Invalid credentials.
    -   `500 Internal Server Error`: Server error.

---

## User Profile Management

### `GET /api/profile`

Retrieves the profile data for the authenticated user.

-   **Description:** Fetches the name, email, role, description, and phone number of the currently logged-in user.
-   **Authentication:** Required (JWT)
-   **Responses:**
    -   `200 OK`: User profile data.
        ```json
        {
            "_id": "string",
            "name": "string",
            "email": "string",
            "role": "string",
            "description": "string",
            "phone": "string",
            "profilePicture": "string",
            "__v": 0
        }
        ```
    -   `401 Unauthorized`: No token or invalid token.
    -   `404 Not Found`: User not found (should not happen if token is valid).
    -   `500 Internal Server Error`: Server error.

### `PUT /api/profile`

Updates the profile data for the authenticated user.

-   **Description:** Modifies the name, description, and phone number for the currently logged-in user.
-   **Authentication:** Required (JWT)
-   **Request Body:**
    ```json
    {
        "name": "string",
        "description": "string",
        "phone": "string"
        // profilePicture is not updated via this endpoint
    }
    ```
-   **Responses:**
    -   `200 OK`: Updated user profile data.
        ```json
        {
            "_id": "string",
            "name": "string",
            "email": "string",
            "role": "string",
            "description": "string",
            "phone": "string",
            "profilePicture": "string",
            "__v": 0
        }
        ```
    -   `401 Unauthorized`: No token or invalid token.
    -   `500 Internal Server Error`: Server error.

---

## Meeting Management

### `GET /api/meetings`

Retrieves a list of all meetings.

-   **Description:** Fetches an array of all meeting summaries.
-   **Responses:**
    -   `200 OK`: Array of meeting objects.
        ```json
        [
            {
                "_id": "string",
                "meetingId": "string",
                "name": "string",
                "description": "string",
                "datetime": "string",
                "currentAgendaIndex": "number",
                "currentMotionIndex": "number",
                "agenda": ["string"],
                "motionQueue": [
                    {
                        "name": "string",
                        "description": "string",
                        "creator": "string",
                        "_id": "string"
                    }
                ],
                "__v": 0
            }
        ]
        ```
    -   `500 Internal Server Error`: Server error.

### `POST /api/meetings`

Creates a new meeting.

-   **Description:** Adds a new meeting to the database with initial agenda and motion queue.
-   **Authentication:** Required (Roles: `admin`, `chairman`) - *Note: Role-based protection not yet implemented in backend.*
-   **Request Body:**
    ```json
    {
        "name": "string",
        "description": "string",
        "datetime": "string"
    }
    ```
-   **Responses:**
    -   `201 Created`: New meeting object.
        ```json
        {
            "_id": "string",
            "meetingId": "string",
            "name": "string",
            "description": "string",
            "datetime": "string",
            "currentAgendaIndex": 0,
            "currentMotionIndex": 0,
            "agenda": ["Call to order", "Approval of previous minutes"],
            "motionQueue": [],
            "__v": 0
        }
        ```
    -   `400 Bad Request`: Invalid input or duplicate `meetingId`.
    -   `500 Internal Server Error`: Server error.

### `GET /api/meetings/:meetingId`

Retrieves detailed information for a specific meeting.

-   **Description:** Fetches a single meeting's details by its unique `meetingId`.
-   **Parameters:**
    -   `meetingId`: The unique identifier for the meeting.
-   **Responses:**
    -   `200 OK`: Meeting object.
        ```json
        {
            "_id": "string",
            "meetingId": "string",
            "name": "string",
            "description": "string",
            "datetime": "string",
            "currentAgendaIndex": "number",
            "currentMotionIndex": "number",
            "agenda": ["string"],
            "motionQueue": [
                {
                    "name": "string",
                    "description": "string",
                    "creator": "string",
                    "_id": "string"
                }
            ],
            "__v": 0
        }
        ```
    -   `404 Not Found`: Meeting not found.
    -   `500 Internal Server Error`: Server error.

### `PUT /api/meetings/:meetingId`

Updates the details of a specific meeting.

-   **Description:** Modifies an existing meeting's data (e.g., agenda, motion queue, current indices).
-   **Authentication:** Required (Roles: `admin`, `chairman`) - *Note: Role-based protection not yet implemented in backend.*
-   **Parameters:**
    -   `meetingId`: The unique identifier for the meeting.
-   **Request Body:** (Partial update, send only fields to be changed)
    ```json
    {
        "name": "string (optional)",
        "description": "string (optional)",
        "datetime": "string (optional)",
        "currentAgendaIndex": "number (optional)",
        "currentMotionIndex": "number (optional)",
        "agenda": ["string (optional)"],
        "motionQueue": [
            {
                "name": "string",
                "description": "string",
                "creator": "string"
            }
        ]
    }
    ```
-   **Responses:**
    -   `200 OK`: Updated meeting object.
    -   `500 Internal Server Error`: Server error.

### `DELETE /api/meetings/:meetingId`

Deletes a specific meeting.

-   **Description:** Removes a meeting from the database by its `meetingId`.
-   **Authentication:** Required (Roles: `admin`, `chairman`) - *Note: Role-based protection not yet implemented in backend.*
-   **Parameters:**
    -   `meetingId`: The unique identifier for the meeting.
-   **Responses:**
    -   `200 OK`: Meeting deleted successfully.
        ```json
        {
            "message": "Meeting deleted successfully"
        }
        ```
    -   `404 Not Found`: Meeting not found.
    -   `500 Internal Server Error`: Server error.