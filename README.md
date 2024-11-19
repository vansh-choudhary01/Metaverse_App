# Multiplayer Phaser Game with Video Calling and Screen Sharing

This project is a **multiplayer Phaser-based game** integrated with **Socket.IO**, **WebRTC**, and **screen sharing capabilities**. Players can interact within a virtual environment, join specific tables to connect with other users, and initiate video calls for real-time communication. The game also supports seamless animations and real-time synchronization of user actions.

---

## Features

### 1. **Basic Game Mechanics**
- Players can navigate the virtual environment using directional controls (up, down, left, right).
- Each player is represented by an animated character (sprite).
- The game room allows multiple players, with real-time animations visible to all participants.

### 2. **Table Interactions**
- **Join Tables:** Players can join any table by moving near it and tapping the **Join** button.
- **Connection Logic:**
  - If two players join the same table, they can initiate a video call.
  - If the table is full, additional players cannot join until it becomes available.
- **End Calls:** When a call ends, both users are removed from the table, freeing it for others.

### 3. **Real-Time Communication**
- Video calls are established using **WebRTC** when two players connect at the same table.
- Players can now share their screens during a call.

### 4. **Backend Functionality**
- **Authentication:** Basic login and registration systems.
- **Real-Time Interactions:** Implemented using **Socket.IO** for seamless communication between players.

### 5. **Resolved Issues**
- Fixed issues where:
  - The first user couldn’t see the remote video.
  - Problems with video call functionality were resolved, allowing two users to communicate through video.

### 6. **Planned Features**
- Improve video call UX by addressing initial rendering glitches.
- Expand interaction options within the game environment.

---

## How to Run

### Prerequisites
- **Node.js** and **npm** installed on your system.
- Basic understanding of web technologies like WebSockets and WebRTC.

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/vansh-choudhary01/Metaverse_App.git
   cd Backend 
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open the game in your browser at `http://localhost:3000`.

---

## Technologies Used
- **Frontend:**
  - **React.js:** For building the user interface and managing component-based architecture.
  - **Phaser.js:** Game engine for interactive graphics and animations.
  - **WebRTC:** For video calls and screen sharing.
- **Backend:**
  - **Node.js** with **Socket.IO:** For real-time communication.
  - **Express.js:** To serve the application and manage API routes.
- **Database:** MongoDB.
- **Others:** CSS, JavaScript.

---

## Contributing
Contributions are welcome! Follow these steps to contribute:
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Make your changes and commit:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.
