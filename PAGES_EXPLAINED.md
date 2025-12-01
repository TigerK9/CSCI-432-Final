# Meeting Platform Page Details

**Last Updated: November 29, 2025**

## 1. LoginPage (src/pages/LoginPage.jsx)

**Description:** The primary page for user authentication and entry into the website.

**Current Functionality:**
* **Backend Authentication:** Users authenticate against the MongoDB backend via the `/api/users/login` endpoint.
* **Role-Based Authentication:** Upon successful login, the user's role (`admin`, `chairman`, or `member`) is retrieved from the database and stored locally for access control.
* **Local Storage:** Stores the following upon successful login:
    * `token` - JWT authentication token
    * `isLoggedIn` - Login state flag
    * `currentUserId` - User's unique database ID (used for participant tracking)
    * `currentUserEmail` - User's email address
    * `currentUserRole` - User's role for access control
    * `currentUserName` - User's display name
* **Navigation:** Redirects to the **HomePage** (`/home`) upon successful login.
* **Sign Up Link:** Provides a link to the SignupPage for new user registration.

---

## 2. SignupPage (src/pages/SignupPage.jsx)

**Description:** The page dedicated to new user registration. Users can create a new account by providing their full name, email address, and a password.

**Current Functionality:**
* **Account Creation:** Sends registration data to the `/api/users/signup` endpoint to create a new user in the MongoDB database.
* **Default Role:** New accounts are assigned the 'member' role by default.
* **Email Validation:** The backend prevents signup if an account with the provided email already exists.
* **Password Hashing:** Passwords are securely hashed using bcrypt before storage.
* **Navigation:** Redirects the user to the LoginPage (`/login`) upon successful account creation.

---

## 3. HomePage (src/pages/HomePage.jsx)

**Description:** The application's landing page, serving as the central hub for viewing, navigating to, and managing scheduled meetings.

**Current Functionality:**
* **Meeting List Display:** Renders a list of scheduled meetings in a responsive grid layout, fetched from the MongoDB backend via `/api/meetings`.
* **Role-Based Meeting Visibility:**
    * **Admin/Chairman:** See all meetings in the system.
    * **Member:** Only see meetings where they are listed as a participant.
* **Navigation:** Each meeting tile links to the specific meeting page (e.g., `/meeting/{meetingId}`).

**Create New Meeting (Admin/Chairman Only):**
* A "New Meeting" tile opens a modal for creating meetings.
* Input fields: Meeting name, description, and date/time.
* New meetings are saved to the database and assigned a unique 6-character join code.
* Modal can be closed by pressing Escape, clicking outside, or clicking the X button.

**Meeting Deletion (Admin/Chairman Only):**
* Each meeting tile has a trash icon button.
* Clicking opens a confirmation modal before deletion.
* Deletion removes the meeting from the database.

**Participant Management (Admin/Chairman Only):**
* Each meeting tile has a people icon button that opens the Participants Modal.
* **Join Code Display:** Shows the unique 6-character alphanumeric code for the meeting.
* **Add Participants:** Chairmen can add users by entering their email address.
* **Remove Participants:** Click the X next to any participant to remove them.
* **Save/Cancel:** Changes are only persisted when Save is clicked; Cancel discards changes.

**Join Meeting (Member Only):**
* Members see a "Join Meeting" tile instead of "New Meeting".
* Opens a modal where they can enter a 6-character join code.
* Upon successful join, they are added to the meeting's participant list and the meeting appears on their home page.

**Taskbar Integration:** Includes navigation icons for Home, Profile, and a Logout function.

---

## 4. ProfilePage (src/pages/ProfilePage.jsx)

**Description:** A dedicated page for users to view and edit their personal information, including contact details and a brief description.

**Current Functionality:**
* **Profile Display:** Shows the user's name, email, description, phone number, and profile picture.
* **Profile Editing:** Users can modify their Name, Description, and Phone Number.
* **Backend Persistence:** Profile data is fetched from and saved to the MongoDB backend via `/api/profile` endpoints.
* **Profile Picture:** Supports uploading and displaying a profile picture (stored as Base64).
* **Taskbar Integration:** Provides navigation back to the HomePage.

---

## 5. MeetingPage (src/pages/MeetingPage.jsx)

**Description:** The primary operational interface for conducting a meeting according to parliamentary procedure (Rules of Order). It features a three-column layout to track the agenda, the current debate, and the motion queue.

**Current Functionality:**

**Layout:**
* **Left Column (Agenda Sidebar):** Displays the meeting agenda with navigation controls.
* **Center Column:** Shows the current motion, voting interface, or member interaction panel.
* **Right Column (Motion Queue Sidebar):** Displays pending, active, and completed motions.

**Real-Time Updates:**
* Meeting data is polled from the backend every 10 seconds (3 seconds during active voting for chairman).
* All participants see synchronized meeting state.

**Agenda Management (Admin/Chairman Only):**
* Navigate through agenda items using Previous/Next buttons.
* Enter edit mode to add, remove, or reorder agenda items via drag-and-drop.

**Motion Queue Management:**
* **Pending Motions:** Members can propose motions; chairman reviews and approves/denies them.
* **Active Motions:** The current motion being discussed.
* **Motion Status:** Tracks pending, approved, denied, voting, completed, failed, tied, and no-votes states.

**Voting System:**
* **Start Vote (Chairman Only):** Initiates a timed vote on the current motion.
* **Vote Casting:** All participants can vote Aye or No during the voting period.
* **Vote Timer:** Countdown display showing time remaining to vote.
* **Vote Tracking:** Uses user IDs to prevent duplicate voting; persists vote state in localStorage.
* **Results Display:** Shows voting results (Aye/No counts, pass/fail status) when voting completes.

**Member View:**
* Members see Aye/No/Abstain buttons for voting.
* Raise Hand functionality for requesting to speak.

**End Meeting (Chairman Only):**
* "End Meeting" button with confirmation modal.
* Navigates all participants to the MinutesPage when meeting ends.

**Pending Motions Review (Chairman Only):**
* Modal for reviewing proposed motions.
* Approve or deny pending motions.

---

## 6. MinutesPage (src/pages/MinutesPage.jsx)

**Description:** This page serves as the official record of meeting proceedings. It chronologically documents all motions made, the outcome of the vote, and key details for historical review.

**Current Functionality:**
* **Two-Column Layout:**
    * **Left Column:** Chronological Motion Index listing all motions.
    * **Right Column:** Detailed minutes for the selected motion.
* **Motion Selection:** Clicking any item in the index updates the details pane.
* **Detailed Record:** Shows the motion's full text, time, result (Passed/Failed), vote breakdown (Yes, No, Abstain), and the Chair's summary.
* **Data Integration:** Minutes data is generated from completed meeting sessions.
* **Export Placeholder:** Includes an "Export/Download Minutes" button (implementation pending).

---

## 7. VotingResultsPage (src/pages/VotingResultsPage.jsx)

**Description:** A visualization page dedicated to displaying the final, tabulated results of a motion vote. Now also available as a reusable component within the MeetingPage.

**Current Functionality:**
* **Data Visualization:** Displays voting results using an interactive Pie Chart (powered by Chart.js).
* **Motion Details:** Shows the Motion Name, Description, and Vote Summary.
* **Vote Breakdown:** Displays raw counts and percentage breakdown of Yes and No votes, plus total count.
* **Component Integration:** The `VotingResults` component is embedded in the MeetingPage to show live vote results when voting completes.
* **Navigation:** Includes a link to return to the MinutesPage.

---

## Backend Integration

The application uses a Node.js/Express backend with MongoDB Atlas for data persistence:

**User Management:**
* User registration with bcrypt password hashing
* JWT-based authentication
* User lookup by ID or email for participant management

**Meeting Management:**
* CRUD operations for meetings
* Unique 6-character join codes (auto-generated, excludes confusing characters like 0/O, 1/I)
* Participant tracking using user IDs (not emails, for stability when users change their email)
* Motion queue with full status lifecycle
* Vote recording with duplicate prevention

**Real-Time Features:**
* Polling-based synchronization (WebSocket implementation planned for future)
* Meeting end detection with automatic redirect to minutes
