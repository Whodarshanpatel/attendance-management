# Attendance Management System

A full-stack MEAN (MongoDB, Express.js, Angular, Node.js) web application designed for comprehensive attendance tracking and management. 

## Features

*   **Role-Based Access Control:** Differentiated dashboards and capabilities for Students, Teachers, and Administrators.
*   **Intuitive Dashboards:** Visualized data and insights using Chart.js for quick comprehension of attendance trends.
*   **Secure Authentication:** JWT (JSON Web Tokens) and bcrypt for secure login, registration, and data protection.
*   **Real-time Notifications:** Integrated with Twilio for SMS and Nodemailer for email notifications.
*   **File Uploads:** Profile picture uploads and document management using Multer.
*   **Responsive UI/UX:** Clean, modern, and accessible design built with latest Angular structure.

## Tech Stack

**Frontend:**
*   Angular (v17+)
*   Chart.js
*   RxJS

**Backend:**
*   Node.js
*   Express
*   Mongoose
*   JSON Web Token (JWT)
*   Bcryptjs

**Database:**
*   MongoDB

## Prerequisites

Before running this project, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [MongoDB](https://www.mongodb.com/) (Running locally or via MongoDB Atlas)
*   [Angular CLI](https://angular.io/cli)

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Whodarshanpatel/attendance-management.git
   cd attendance-management
   ```

2. **Install dependencies:**
   The project has a built-in script to install both frontend and backend dependencies simultaneously:
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables:**
   *   Navigate to the `backend` directory.
   *   Create a `.env` file (if one does not exist) based on your required configurations:
       ```env
       PORT=5001
       MONGODB_URI=mongodb://localhost:27017/attendance_db
       JWT_SECRET=your_jwt_secret_key
       # Add your Twilio and Nodemailer configurations here
       ```

## Running the Application

This project utilizes `concurrently` to run both the frontend, backend, and the database using a single command from the root directory.

```bash
npm run dev
```

*This command will:*
1. Attempt to start your local MongoDB service.
2. Start the Express backend server (typically on `http://localhost:5001`).
3. Start the Angular frontend development server (typically on `http://localhost:4200`).

## Project Structure

```
attendance-management/
├── backend/            # Express server, routes, controllers, and models
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express API routes
│   └── server.js       # Entry point for backend
├── frontend/           # Angular frontend application
│   └── src/app/        # Angular components, services, and models
├── package.json        # Root package files with concurrent scripts
└── README.md           # Project documentation
```

## License

This project is open-source and available under the [MIT License](LICENSE).
