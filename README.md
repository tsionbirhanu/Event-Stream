# ⚽ Event Stream Match Tracker (Live Football Scores)

## ✨ Overview

The **Event Stream Match Tracker** is a full-stack web application designed to provide **real-time football match scores** using **Server-Sent Events (SSE)**.

It features a modern, professional **broadcast-style UI** with live updates for users, while giving admins the ability to manage matches with **create, update, and delete functionality**.

---

## 🚀 Features

* **Real-Time Live Scores:** Updates pushed instantly to all connected clients using SSE.
* **Admin Dashboard:** Add, update, and delete live matches easily.
* **User Feed:** Clean, responsive feed to view live matches.
* **Professional UI:** Dark-mode, high-contrast broadcast theme.
* **TypeScript:** Full type safety across client and server for maintainable code.

---

## 🛠 Technology Stack

| Component | Technology                     | Purpose                                   |
| --------- | ------------------------------ | ----------------------------------------- |
| Client    | React + TypeScript             | Modern component-based UI                 |
| Styling   | CSS Variables + Custom Theme   | Dark, professional, sports-friendly theme |
| Server    | Node.js + Express + TypeScript | API and SSE endpoint management           |
| Real-Time | Server-Sent Events (SSE)       | Efficient one-way streaming updates       |

---

## ⚙️ Installation & Setup

### 1. Prerequisites

Ensure you have:

* Node.js (v18+)
* npm, yarn, or pnpm

### 2. Clone Repository

```bash
git clone https://github.com/tsionbirhanu/Event-Stream.git
cd match_tracker
```

---

### 3. Server Setup (`/server`)

```bash
cd server
npm install
```

```bash
npm run start
```

Server will run on `http://localhost:5000`.

---

### 4. Client Setup (`/client`)

```bash
cd client
npm install
```


```bash
npm run dev
```

Client will run on `http://localhost:5173` (Vite default port).

---

## 🖥️ Usage Guide

### 🧑‍💻 Admin Mode (`VITE_ROLE=admin`)

1. Open the app in admin mode.
2. Add a new match using the **Create Match** panel.
3. Manage match scores with `+` / `-` or direct input.
4. All updates instantly appear on connected users’ screens.

### 👥 User Mode (`VITE_ROLE=user`)

1. Open the app in user mode.
2. View all live matches in the main feed.
3. Click a match for detailed live score view.

---

## 📹 Video Demonstration

https://www.youtube.com/watch?v=UunLsgjAJjA

---

## 🔗 License

MIT License. See `LICENSE` file for details.

---


