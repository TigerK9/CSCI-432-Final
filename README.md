# CSCI432 Final Project – RONR Meeting Platform

I'm imagining the meeting will happen in person/live where everyone is in a room together, and the website acts as something to help make the meeting flow easier.

---

## Pages to Have

### Login / Registration Page
- Username and password
- Register new account
- Option: forgot/reset password

### Profile Editor Page
- Change display name
- Edit profile picture

### Home Page
- Create / join a committee
- List of committees/meetings you belong to (sorted by start time, then end time)

### Meeting Page
- **Top center:** Current motion (big display)
- **Left panel:** Agenda
- **Right panel:** Motion queue (what’s on the floor)
- **Bottom center:** Button for actions depending on role

**Member Actions:**
- Raise hand
  - Options for raising hand:
    - Pro/con ability when motion is raised
    - Overturn motion
    - Start motion
- Cast vote

**Chair Actions:**
- Manage speaker queue
- Start/stop votes
- Approve or deny motions
- Start motion pop-up:
  - Motion
  - Procedural motion (⅔ vote)
  - Sub-motion (revise/postpone)
  - Special motion (no discussion)
  - Overturn motion (“only those who voted FOR can do this” — via search or auto-check)

### Voting Results Page
- Show results of the vote
- Automatically log the outcome into meeting record
- Optional: make it look visual (i.e., pie chart)

### Meeting Minutes Page
- Chronological list of all motions, votes, and results
- Chair’s optional summary for each
- Export/download minutes
