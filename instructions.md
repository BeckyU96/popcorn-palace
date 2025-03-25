# Popcorn-Palace

## Table of Contents

1. [Project Overview](#project-overview)
2. [Built With](#built-with)
3. [Installation](#installation)
4. [Environment Variables](#set-up-environment-variables)
5. [Usage Guide](#usage-guide)
6. [Tests](#tests)
7. [Contact](#contact)

---

## Project Overview

**Popcorn Palace** is a backend RESTful API service built with Node.js, Express, and PostgreSQL.  
Its goal is to manage movie listings, showtime scheduling, and user ticket bookings while ensuring data integrity and handling
real-world edge cases like overlapping showtimes and race conditions during booking.

The backend provides three main services:

- 🎬 **Movies** — CRUD operations for movie titles.
- 🕒 **Showtimes** — Schedule showtimes while preventing overlaps.
- 🎟️ **Bookings** — Seat reservations with race-condition handling.

The system is modular, test-driven, and built with scalability, validation, and robustness in mind.

---

## Built With

<table style="width: 100%; border-collapse: collapse; align-items: center;">
  <tr>
    <td style="border: none; text-align: center; padding: 10px;">
      <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
    </td>
    <td style="border: none; text-align: center; padding: 10px;">
      <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
    </td>
    <td style="border: none; text-align: center; padding: 10px;">
      <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
    </td>
    <td style="border: none; text-align: center; padding: 10px;">
      <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
    </td>
  </tr>
</table>

---

## Installation

Follow these steps to set up the Popcorn-Palace server:

### 1. Prerequisites

Before running the backend, ensure you have the following installed:

- **Node.js**: [Node.js Download](https://nodejs.org/)
- **npm**: (usually installed with Node.js) [npm Installation](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- **PostgreSQL**: [PostgreSQL Download](https://www.postgresql.org/download/)
- **pgAdmin**: [pgAdmin Download](https://www.pgadmin.org/download/)

### 2. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/BeckyU96/popcorn-palace.git
```

### 3.Backend Setup

install the dependencies:

```bash
npm install
```

- Set up the environment variables:
  - Follow the instructions in the [Set Up Environment Variables](#set-up-environment-variables) section.

### 4.DataBase Setup

Before running the migrations to set up your database tables, ensure you have **PostgreSQL** and **pgAdmin** installed.

**Create Database in pgAdmin**

- Open **pgAdmin** and log in with your PostgreSQL credentials.
- Right-click on **Databases** in the left sidebar and select **Create -> Database**.
- Name the new database `popcorn_palace` and click **Save**.

### 5. Run Migrations to Create the Database Tables

```bash
npx sequelize-cli db:migrate
```

Running the backend server:

```bash
node src/server.js
```

---

## Set Up Environment Variables

Create a `.env` file in the root directory of the `popcorn-palace` folder and add the necessary environment variables as specified in the `.env.example` file.

1. **Locate the .env.example file:**
   The `.env.example` file can be found in the root directory of the `popcorn-palace` folder.

2. **Copy the .env.example file and rename it to .env:**
   ```bash
   cp .env.example .env
   ```

3. **Fill in Your Environment Variables:**
   Open the `.env` file and fill in the necessary environment variables:

   - **Database credentials:**

     - `DB_NAME`
     - `DB_USER`
     - `DB_PASSWORD`
     - `DB_HOST`
     - `DB_PORT`
     - `DB_DIALECT`

---

## Usage Guide

### Base URL

```bash
http://localhost:3000
```
All requests and responses use `application/json`.

### 🎬 Movies APIs

| Action          | Method | Endpoint                     | Body Required | Description                                |
|----------------|--------|------------------------------|----------------|--------------------------------------------|
| Get All Movies | GET    | `/movies/all`                | No             | Retrieve all movies.                       |
| Add Movie      | POST   | `/movies`                    | Yes            | Create a new movie.                        |
| Update Movie   | POST   | `/movies/update/:movieTitle` | Yes            | Update movie details (not title).          |
| Delete Movie   | DELETE | `/movies/:movieTitle`        | No             | Remove movie if no booked showtimes exist. |

### Movie Schema
```json
{
  "title": "Oppenheimer",
  "genre": "Drama",
  "duration": 180,
  "rating": 9.1,
  "releaseYear": 2023
}
```

### 🕒 Showtime APIs

| Action             | Method | Endpoint                                | Body Required | Description                               |
|--------------------|--------|-----------------------------------------|----------------|-------------------------------------------|
| Get Showtime by ID | GET    | `/showtimes/:showtimeId`                | No             | Fetch showtime details by ID.             |
| Add Showtime       | POST   | `/showtimes`                            | Yes            | Create a new showtime.                    |
| Update Showtime    | POST   | `/showtimes/update/:showtimeId`         | Yes            | Modify a showtime.                        |
| Delete Showtime    | DELETE | `/showtimes/:showtimeId`                | No             | Remove a showtime (if no tickets sold).   |

### Showtime Schema
```json
{
  "movieId": 1,
  "theater": "A",
  "startTime": "2025-06-01T12:00:00Z",
  "endTime": "2025-06-01T14:00:00Z"
  "price": 12.5,
}
```

### 🎟️ Booking APIs

| Action      | Method | Endpoint     | Body Required | Description                    |
|-------------|--------|--------------|----------------|--------------------------------|
| Book Ticket | POST   | `/bookings`  | Yes            | Reserve a seat for a showtime. |

### Ticket Schema
```json
{
  "showtimeId": 1,
  "seatNumber": 15,
  "userId": "123e4567-e89b-12d3-a456-426614174000"
}
```

📌 Notes:
- All input is validated with Joi.
- Errors return meaningful messages (e.g. 400 Bad Request).
- Booking handles race conditions using database transactions + unique constraints.

---

## Tests

```bash
# unit & integration tests
$ npm test

# test coverage
$ npx jest --coverage
```

---

## Contact

For any questions or support, please contact me at [beckyu96@gmail.com].

---
Thank you for reviewing the `Popcorn Palace Movie Ticket Booking System` 🎥🍿