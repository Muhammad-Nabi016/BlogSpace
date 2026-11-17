# BlogSpace – Full Stack Blog Management System

BlogSpace is a full-stack blogging application that allows users to create, publish, manage, and explore blog posts. It features secure authentication, Google Sign-In, password recovery through email, and a personalized dashboard with a responsive user interface.

## Features

### User Authentication
- User registration and login.
- Secure password hashing using bcryptjs.
- JWT-based authentication.
- Google Sign-In integration.
- Protected dashboard and API routes.
- Logout functionality.

### Password Recovery
- Forgot password functionality.
- Password reset link sent through email.
- Secure, hashed reset tokens with expiration.
- Password reset using email verification.

### Blog Management
- Create new blog posts.
- Edit existing blog posts.
- Delete blog posts.
- Save posts as drafts or publish them.
- Manage blogs from a personalized dashboard.

### Dashboard
- View total blogs, published blogs, and drafts.
- Display only the logged-in user's blogs.
- View profile information, including name and email.
- Secure ownership checks for editing and deleting blogs.

### Public Blog Experience
- Browse published blog posts.
- View individual blog details.
- Search blogs by title and content.
- Filter blogs by category.

### User Interface
- Responsive design for desktop and mobile devices.
- Clean and user-friendly interface.
- Dedicated login, registration, dashboard, and blog pages.

## Tech Stack

**Frontend**
- HTML5
- CSS3
- JavaScript

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose

**Authentication & Security**
- JSON Web Tokens (JWT)
- bcryptjs
- Google Auth Library
- Protected API routes
- User-based blog ownership authorization

**Email Services**
- Nodemailer
- Gmail SMTP for password recovery

## Project Structure

```text
BlogSpace/
│
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Blog.js
│   ├── routes/
│   │   └── auth.js
│   ├── server.js
│   └── .env.example
│
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── create-blog.html
│   ├── blog-details.html
│   ├── forgot-password.html
│   └── reset-password.html
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── Readme.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Muhammad-Nabi016/BlogSpace.git
cd BlogSpace
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` folder using `backend/.env.example` as a reference.

Configure the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_strong_jwt_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_google_app_password
EMAIL_FROM=your_email@gmail.com

APP_URL=http://127.0.0.1:5500/public
GOOGLE_CLIENT_ID=your_google_client_id
```

Use your own credentials and configuration values. Never commit actual environment files, database credentials, email passwords, or JWT secrets.

### 4. Start the Backend

```bash
node backend/server.js
```

The backend runs at:

```text
http://localhost:5000
```

### 5. Run the Frontend

Open the `public` folder using the VS Code Live Server extension.

For local development, the frontend communicates with the backend at `http://localhost:5000/api`.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/google` | Google Sign-In |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/blogs` | Get public blogs |
| GET | `/api/blogs/:id` | Get blog details |
| GET | `/api/blogs/my-blogs` | Get logged-in user's blogs |
| POST | `/api/blogs` | Create a blog |
| PUT | `/api/blogs/:id` | Update an owned blog |
| DELETE | `/api/blogs/:id` | Delete an owned blog |

Protected endpoints require a valid JWT Bearer token.

## Security

- Passwords are hashed before being stored.
- JWT tokens authenticate protected requests.
- Google ID tokens are verified on the backend.
- Password reset tokens are hashed and expire after a limited time.
- Users can manage only their own blog posts.
- Unauthorized requests are rejected by authentication middleware.
- Sensitive environment variables are excluded from version control.

## Deployment

The application is structured for deployment on Vercel.

Required production configuration includes:
- MongoDB connection string.
- JWT secret.
- SMTP email configuration.
- Google OAuth Client ID.
- Production frontend URL.

Production environment variables must be configured in the deployment platform.

## Learning Outcomes

Through this project, I gained practical experience in:

- Full-stack web development.
- REST API development using Express.js.
- MongoDB database integration.
- JWT authentication and authorization.
- Google OAuth integration.
- Password recovery through email.
- Nodemailer and SMTP configuration.
- CRUD operations and user-specific data.
- Frontend and backend integration.
- Application deployment preparation.

## Acknowledgement

Developed as part of my Full Stack Web Development internship at **Codomax Digital Solutions**.

---

**BlogSpace – Write, Share, and Explore Stories.**

## Author

**Muhammad Nabi**

- GitHub: https://github.com/Muhammad-Nabi016
- LinkedIn: https://www.linkedin.com/in/muhammad-nabi-aa053636b/
