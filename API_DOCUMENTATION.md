# API Documentation

This document provides an overview of the RESTful API endpoints available for this application.

## Base URL

- **Local Development:** `http://localhost:5002`
- **Production:** `https://ronr-backend.onrender.com`

## Authentication

All protected routes require a JSON Web Token (JWT) to be sent in the `Authorization` header as a `Bearer` token.

```
Authorization: Bearer <your_jwt_token>
```

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
            "name": "string",
            "userId": "string"
        }
        ```
    -   `400 Bad Request`: Invalid credentials.
    -   `500 Internal Server Error`: Server error.

---

## User Management

### `GET /api/users`

Retrieves a list of all users.

-   **Description:** Fetches an array of all users (excluding passwords).
-   **Authentication:** Required (JWT)
-   **Responses:**
    -   `200 OK`: Array of user objects.
    -   `500 Internal Server Error`: Server error.

### `GET /api/users/by-email/:email`

Retrieves a user by their email address.

-   **Description:** Fetches a single user's public information by email. Used for adding participants to meetings.
-   **Parameters:**
    -   `email`: The email address of the user.
-   **Responses:**
    -   `200 OK`: User object (id, name, email).
    -   `404 Not Found`: User not found.
    -   `500 Internal Server Error`: Server error.

### `GET /api/users/by-ids`

Retrieves multiple users by their IDs.

-   **Description:** Fetches user information for a list of user IDs.
-   **Query Parameters:**
    -   `ids`: Comma-separated list of user IDs.
-   **Responses:**
    -   `200 OK`: Array of user objects.
    -   `500 Internal Server Error`: Server error.

---

## User Profile Management

### `GET /api/profile`

Retrieves the profile data for the authenticated user.

-   **Description:** Fetches the name, email, role, description, phone number, and profile picture of the currently logged-in user.
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
            "profilePicture": "string (Base64)"
        }
        ```
    -   `401 Unauthorized`: No token or invalid token.
    -   `404 Not Found`: User not found.
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
    }
    ```
-   **Responses:**
    -   `200 OK`: Updated user profile data.
    -   `401 Unauthorized`: No token or invalid token.
    -   `500 Internal Server Error`: Server error.

---

## Meeting Management

### `GET /api/meetings`

Retrieves a list of meetings for the authenticated user.

-   **Description:** Fetches all meetings where the user is either the chairman (creator) or a participant.
-   **Authentication:** Required (JWT)
-   **Responses:**
    -   `200 OK`: Array of meeting objects.
        ```json
        [
            {
                "_id": "string",
                "meetingId": "string",
                "joinCode": "string (6-character code)",
                "chairman": "string (user ID)",
                "name": "string",
                "description": "string",
                "datetime": "string",
                "ended": "boolean",
                "currentAgendaIndex": "number",
                "currentMotionIndex": "number",
                "agenda": ["string"],
                "participants": ["string (user IDs)"],
                "motionQueue": [{ ... }]
            }
        ]
        ```
    -   `500 Internal Server Error`: Server error.

### `POST /api/meetings`

Creates a new meeting.

-   **Description:** Creates a new meeting with the authenticated user as the chairman. Generates a unique 6-character join code.
-   **Authentication:** Required (JWT)
-   **Request Body:**
    ```json
    {
        "name": "string (max 30 characters)",
        "description": "string (max 200 characters)",
        "datetime": "string"
    }
    ```
-   **Responses:**
    -   `201 Created`: New meeting object with generated `meetingId` and `joinCode`.
    -   `400 Bad Request`: Invalid input.
    -   `500 Internal Server Error`: Server error.

### `GET /api/meetings/:meetingId`

Retrieves detailed information for a specific meeting.

-   **Description:** Fetches a single meeting's details by its unique `meetingId`. Participants are populated with user details.
-   **Authentication:** Required (JWT)
-   **Parameters:**
    -   `meetingId`: The unique identifier for the meeting.
-   **Responses:**
    -   `200 OK`: Meeting object with populated participants.
    -   `403 Forbidden`: User is not authorized to view this meeting.
    -   `404 Not Found`: Meeting not found.
    -   `500 Internal Server Error`: Server error.

### `PUT /api/meetings/:meetingId`

Updates the details of a specific meeting.

-   **Description:** Modifies an existing meeting's data (e.g., agenda, motion queue, ended status).
-   **Authentication:** Required (JWT). Only the meeting chairman or admin can update.
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
        "ended": "boolean (optional)",
        "motionQueue": [{ ... }]
    }
    ```
-   **Responses:**
    -   `200 OK`: Updated meeting object.
    -   `403 Forbidden`: User is not authorized to update this meeting.
    -   `500 Internal Server Error`: Server error.

### `DELETE /api/meetings/:meetingId`

Deletes a specific meeting.

-   **Description:** Removes a meeting from the database by its `meetingId`.
-   **Authentication:** Required (JWT). Only the meeting chairman or admin can delete.
-   **Parameters:**
    -   `meetingId`: The unique identifier for the meeting.
-   **Responses:**
    -   `200 OK`: Meeting deleted successfully.
    -   `404 Not Found`: Meeting not found.
    -   `500 Internal Server Error`: Server error.

### `POST /api/meetings/join`

Join a meeting using a 6-character code.

-   **Description:** Allows a user to join an existing meeting using the meeting's join code.
-   **Authentication:** Required (JWT)
-   **Request Body:**
    ```json
    {
        "joinCode": "string (6 characters)"
    }
    ```
-   **Responses:**
    -   `200 OK`: Successfully joined meeting.
        ```json
        {
            "message": "Successfully joined meeting",
            "meeting": { ... }
        }
        ```
    -   `400 Bad Request`: Invalid join code or already a participant.
    -   `404 Not Found`: Meeting not found.
    -   `500 Internal Server Error`: Server error.

### `PUT /api/meetings/:meetingId/participants`

Updates the participants list for a meeting.

-   **Description:** Replaces the participants list with a new set of user IDs.
-   **Authentication:** Required (JWT). Only the meeting chairman or admin can update.
-   **Parameters:**
    -   `meetingId`: The unique identifier for the meeting.
-   **Request Body:**
    ```json
    {
        "participants": ["string (user IDs)"]
    }
    ```
-   **Responses:**
    -   `200 OK`: Updated meeting object.
    -   `403 Forbidden`: User is not authorized.
    -   `404 Not Found`: Meeting not found.
    -   `500 Internal Server Error`: Server error.

---

## Motion Management

### `POST /api/meetings/:meetingId/propose-motion`

Proposes a new motion for a meeting.

-   **Description:** Adds a new motion to the meeting's motion queue with status 'pending'.
-   **Authentication:** Required (JWT)
-   **Parameters:**
    -   `meetingId`: The unique identifier for the meeting.
-   **Request Body:**
    ```json
    {
        "name": "string",
        "description": "string",
        "creator": "string (optional, defaults to user's name)"
    }
    ```
-   **Responses:**
    -   `201 Created`: New motion object.
        ```json
        {
            "name": "string",
            "description": "string",
            "creator": "string",
            "status": "pending",
            "proposedBy": "string (user ID)",
            "proposedAt": "string (ISO date)",
            "votes": { "aye": 0, "no": 0 }
        }
        ```
    -   `400 Bad Request`: Name and description are required.
    -   `404 Not Found`: Meeting not found.
    -   `500 Internal Server Error`: Server error.

### `POST /api/meetings/:meetingId/motions/:motionIndex/review`

Approves or denies a pending motion.

-   **Description:** Chairman reviews a pending motion and either approves it (moves to 'proposed') or denies it.
-   **Authentication:** Required (JWT). Only the meeting chairman or admin can review.
-   **Parameters:**
    -   `meetingId`: The unique identifier for the meeting.
    -   `motionIndex`: The index of the motion in the motion queue.
-   **Request Body:**
    ```json
    {
        "action": "approve" | "deny"
    }
    ```
-   **Responses:**
    -   `200 OK`: Updated motion object.
    -   `400 Bad Request`: Invalid action or motion is not pending.
    -   `403 Forbidden`: User is not authorized.
    -   `404 Not Found`: Meeting not found.
    -   `500 Internal Server Error`: Server error.

---

## Voting

### `POST /api/meetings/:meetingId/start-vote/:motionIndex`

Starts voting on a motion.

-   **Description:** Initiates a 30-second voting period for the specified motion.
-   **Authentication:** Required (JWT). Only the meeting chairman or admin can start voting.
-   **Parameters:**
    -   `meetingId`: The unique identifier for the meeting.
    -   `motionIndex`: The index of the motion in the motion queue.
-   **Responses:**
    -   `200 OK`: Motion object with voting status.
        ```json
        {
            "name": "string",
            "status": "voting",
            "votingEndsAt": "string (ISO date)",
            "votes": { "aye": 0, "no": 0 }
        }
        ```
    -   `400 Bad Request`: Invalid motion index.
    -   `403 Forbidden`: User is not authorized.
    -   `404 Not Found`: Meeting not found.
    -   `500 Internal Server Error`: Server error.

### `POST /api/meetings/:meetingId/vote/:motionIndex`

Submits a vote on an active motion.

-   **Description:** Records the user's vote (aye or no) on a motion that is currently accepting votes.
-   **Authentication:** Required (JWT)
-   **Parameters:**
    -   `meetingId`: The unique identifier for the meeting.
    -   `motionIndex`: The index of the motion in the motion queue.
-   **Request Body:**
    ```json
    {
        "vote": "aye" | "no"
    }
    ```
-   **Responses:**
    -   `200 OK`: Vote recorded successfully.
        ```json
        {
            "votes": { "aye": "number", "no": "number" },
            "hasVoted": true,
            "message": "Vote recorded successfully"
        }
        ```
    -   `400 Bad Request`: Motion is not accepting votes, voting period ended, or user already voted.
    -   `404 Not Found`: Meeting not found.
    -   `500 Internal Server Error`: Server error.

### `POST /api/meetings/:meetingId/complete-voting/:motionIndex`

Completes voting on a motion and determines the result.

-   **Description:** Ends the voting period and calculates the final result (approved, failed, tied, or no-votes).
-   **Authentication:** Required (JWT). Only the meeting chairman or admin can complete voting.
-   **Parameters:**
    -   `meetingId`: The unique identifier for the meeting.
    -   `motionIndex`: The index of the motion in the motion queue.
-   **Responses:**
    -   `200 OK`: Motion object with final result.
        ```json
        {
            "motion": {
                "name": "string",
                "status": "approved" | "failed" | "tied" | "no-votes",
                "result": "approved" | "failed" | "tied" | "no-votes",
                "votes": { "aye": "number", "no": "number" }
            }
        }
        ```
    -   `400 Bad Request`: Motion is not currently voting.
    -   `403 Forbidden`: User is not authorized.
    -   `404 Not Found`: Meeting not found.
    -   `500 Internal Server Error`: Server error.

---

## Motion Status Lifecycle

Motions go through the following statuses:

1. **`pending`** - Newly proposed motion awaiting chairman review
2. **`proposed`** - Approved by chairman, ready for voting
3. **`denied`** - Rejected by chairman
4. **`voting`** - Currently in voting period (30 seconds)
5. **`approved`** - Voting completed, motion passed (aye > no)
6. **`failed`** - Voting completed, motion failed (no > aye)
7. **`tied`** - Voting completed with equal votes
8. **`no-votes`** - Voting completed with no votes cast

---

## Error Responses

All endpoints may return the following error responses:

-   `400 Bad Request`: Invalid input or request body.
-   `401 Unauthorized`: Missing or invalid JWT token.
-   `403 Forbidden`: User does not have permission for this action.
-   `404 Not Found`: Requested resource not found.
-   `500 Internal Server Error`: Server-side error.
