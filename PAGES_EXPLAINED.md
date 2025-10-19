# Meeting Platform Page Details and To-Do List

## 1. LoginPage (src/pages/LoginPage.jsx)

**Description:** The primary page for user authentication and entry into the website.

**Current Functionality:**
* **Role-Based Authentication:** Users can log in using predefined credentials, which set their role (`admin`, `chairman`, or `member`) for site access control.
    * **Test Credentials:**
        * `admin@email.com` - password is `password`
        * `chairman@email.com` - password is `password`
        * `member@email.com` - password is `password`
* **Local Storage:** Stores login state (`isLoggedIn`), `currentUserEmail`, and `currentUserRole` upon successful login.
* **Navigation:** Redirects to the **HomePage** (`/home`) upon successful login.

**Things to Add (TODO):**
* [ ] Nothing to do with the login page currently. Focus on the other pages, as the login page already works as desired and the other pages need more functionality.

---

## 2. SignupPage (src/pages/SignupPage.jsx)

**Description:** The page dedicated to new user registration. Users can create a new account by providing their full name, email address, and a password.

**Current Functionality:**
* **Account Creation:** Allows a user to input a name, email, and password to create a new user entry in the local storage (ronr-users).
* **Default Role:** New accounts are assigned the 'member' role by default.
* **Email Validation:** Prevents signup if an account with the provided email already exists.
* **Navigation:** Redirects the user to the LoginPage (/login) upon successful account creation, prompting them to log in with their new credentials.

**Things to Add (TODO):**
* THESE ARE FOR LATER, LOW PRIORITY AS OF 10/19/2025
* [ ] Implement strong password validation criteria (e.g., minimum length, special characters).
* [ ] Add a confirmation step or email verification logic.

---

## 3. HomePage (src/pages/HomePage.jsx)

**Description:** The application's landing page, serving as the central hub for viewing, navigating to, and managing scheduled meetings.

**Current Functionality:**
* **Meeting List Display:** Renders a list of scheduled meetings in a responsive grid layout, loaded from local storage (`ronr-meetingsData`).
* **Navigation:** Each meeting box is a link that navigates the user to the specific meeting page (e.g., `/meeting/1`).
* **Create New Meeting (Modal):**
    * Authorized users (**'admin'** or **'chairman'**) see a "New Meeting" box.
    * Clicking this box opens a modal where users can input the meeting name, description, and date/time.
    * The new meeting is added to the list and saved in local storage.
* **Taskbar Integration:** Includes navigation icons for **Home**, **Profile**, and a **Logout** function which clears user data from local storage and redirects to the login page.

**Things to Add (TODO):**
The first item is relatively medium priority, complete the MeetingPage functionality first. The rest of the items on here are relatively low priority, though also probably pretty easy to implement.
* [ ] **Meeting Roster Management:** Implement a **"Manage Participants"** button (for Admins/Chairmen) on each meeting tile. This will allow authorized users to edit the email list associated with the meeting. This list will control **meeting visibility** for members on their home page.
* [ ] Implement a robust meeting deletion or archiving mechanism.
* [ ] Add filtering/sorting options (e.g., sort by date, filter by meeting type).
* [ ] Display meeting status (e.g., 'Upcoming', 'In Progress', 'Completed').

---

## 4. ProfilePage (src/pages/ProfilePage.jsx)

**Description:** A dedicated page for users to view and edit their personal information, including contact details and a brief description.

**Current Functionality:**
* **Profile Editing:** Allows the user to modify their **Name**, **Description**, **Email**, and **Phone Number** via input fields.
* **Local Storage Persistence:** Loads initial profile data or uses default data (`John Doe`, etc.) and saves all updated fields to local storage (`ronr-profileData`) upon clicking "Save Changes."
* **State Management:** Uses local React state (`editData`) to track changes in the input fields before committing them to the main profile state and local storage.
* **Taskbar Integration:** Provides a navigation link back to the **HomePage**.

**Things to Add (TODO):**
* [ ] Have the name and email already show what name and email are tied to the currently logged in user. What I mean by this is that it should say Name: Admin, email: admin@email.com and the rest should be blank as it hasn't been input yet. Once it is input, have it display to the right of the keyword as name and email should. Also, have each field start blank, rather than having those default values in them.
* [ ] Implement image upload functionality for the **Profile Picture** placeholder.
* [ ] Integrate the currently logged in user's email and name to be displayed correctly. Currently
* [ ] Add form validation (e.g., ensuring email format is correct, phone number adheres to a standard).
* [ ] Integrate a **Password Change** section (as noted in the existing TODO for this page).
* [ ] Integrate with the user authentication system to ensure only the logged-in user can view/edit their own profile (currently uses generic local storage).

---

## 5. MeetingPage (src/pages/MeetingPage.jsx)

**Description:** The primary operational interface for conducting a meeting according to parliamentary procedure (Rules of Order). It features a three-column layout to track the agenda, the current debate, and pending motions.

**Current Functionality:**
* **Three-Column Layout:** Displays **Agenda** (left), the **Current Motion** (center), and the **Motion Queue** (right).
* **Persistent State:** Meeting progress (current indices, queue items) is saved and loaded via local storage (`ronr-meetingData`).
* **Agenda Navigation:** **Admin** and **Chairman** roles can step forward and backward through the agenda items using the **Previous/Next** buttons.
* **Motion Queue Management:** **Admin** and **Chairman** roles can step through motions and manage the queue.
* **Editable Lists (Admin/Chairman Only):**
    * **Editing Mode:** Authorized users can enter an editing mode to add new items/motions, remove existing ones, and **reorder** both the Agenda and the Motion Queue using drag-and-drop functionality.
* **Member Interaction:** All users see **AYE**, **NO**, and **Raise Hand** buttons, allowing basic interaction with the current debate.

**Things to Add (TODO):**
* [ ] Add an end meeting button, which will send everyone to the MinutesPage.
* [ ] Add ability for chairman/admin to start a vote for a motion. This will start taking votes of aye/no.
* [ ] Add more robust editing of the motions and agenda (currently dragging and dropping is clanky).
* [ ] I'm thinking instead of having the voting results page, clicking on a motion that's in the motion queue (that's been voted on) pops up something similar to the voting results page, showing the results for the vote, but all on the MeetingPage rather than opening a new page.
* [ ] **Voting Logic:** Implement logic to record votes (AYE/NO) and calculate the result (simple majority, two-thirds, etc.) for the active motion.
* [ ] **Role-Based Voting Control:** Disable or hide the **AYE/NO** buttons when a vote is not officially open, and ensure the **Raise Hand** feature is properly managed by the Chairman.
    * Some sort of button/list the chairman/admin can look at and accept raised hands. Eventually, the list will be ordered by who raised their hand first. 
* [ ] **Speaking Timer:** Implement a visible clock/timer in the center content area to manage speaking limits during debate.
* [ ] **Official Procedures:** Add functionality for standard Rules of Order procedures, such as declaring a quorum, recording debate minutes, and formally ending the meeting.
* [ ] **Real-time Synchronization:** (EVENTUALLY) Implement WebSockets or similar technology to sync agenda progress, motion queue changes, and voting results across all participants' screens.

---

## 6. MinutesPage (src/pages/MinutesPage.jsx)

**Description:** This page serves as the official record of meeting proceedings. It chronologically documents all motions made, the outcome of the vote, and key details for historical review.

**Current Functionality:**
* **Two-Column Layout (Index & Details):** The left column displays a **Chronological Motion Index** (list of all motions) and the right column displays **Detailed Minutes** for the selected motion.
* **Data Persistence:** Loads initial minutes data or saved minutes from local storage (`ronr-minutesData`).
* **Motion Selection:** Clicking any item in the index updates the details pane on the right.
* **Detailed Record:** The details pane shows the motion's full text, the time it occurred, its result (Passed/Failed), a numeric breakdown of **Yes**, **No**, and **Abstain** votes, and the Chair's summary of the debate/outcome.
* **Export Placeholder:** Includes an **"Export/Download Minutes"** button, though the actual file generation logic is currently a placeholder.

**Things to Add (TODO):**
* [ ] **Generate Minutes:** Implement the actual file generation (e.g., PDF or DOCX) for the minutes export functionality.
* [ ] **Integration with MeetingPage:** Create a workflow to generate the minutes data *from* a completed meeting session managed on the `MeetingPage`.
* [ ] **Search and Filter:** Add search bars and filters to allow users to find motions by title, result, or date.
* [ ] **Official Approval Status:** Add a feature allowing an authorized user (Admin/Chairman) to formally mark the minutes as "Approved" after they pass the approval motion.

---

## 7. VotingResultsPage (src/pages/VotingResultsPage.jsx)

**Description:** A visualization page dedicated to displaying the final, tabulated results of a single, decisive motion vote. It provides a clear breakdown of the voting outcome.

**Current Functionality:**
* **Data Visualization:** Displays voting results (Yes/No counts) using an interactive **Pie Chart** (powered by Chart.js).
* **Motion Details:** Clearly presents the **Motion Name**, a brief **Description** of the resolution, and the final **Vote Summary**.
* **Vote Breakdown:** Calculates and displays the raw counts and **percentage breakdown** of Yes and No votes, along with the total vote count.
* **Contextual Data:** Currently uses hardcoded sample data, but is structured to accept dynamic motion data (e.g., from the URL parameter `useParams`).
* **Navigation:** Includes a link to return to the **MinutesPage** for historical context.

**Things to Add (TODO):**
* [ ] **Component Integration:** Refactor this entire page into a reusable **Component** (e.g., `VotingResultsDisplay`). This component should then be implemented within the **MeetingPage** to show live or recently concluded vote tallies, rather than existing as a separate page.
* [ ] **Dynamic Data Fetching:** Implement logic to fetch the specific vote results data based on a **Motion ID** (passed via URL or state) from the meeting data structure.
* [ ] **Quorum/Threshold Logic:** Add visual indicators or text to confirm if the **Quorum** was met and if the necessary **Voting Threshold** (e.g., simple majority, two-thirds) was achieved for the motion to pass or fail.
* [ ] **Abstain Votes:** Include support for displaying **Abstain** votes in the chart and summary, as these are often tracked but don't count toward the pass/fail result.