# Google Drive Clone - Backend

Node.js backend for Google Drive clone application with authentication and file management.

## Features

- User registration with email activation
- JWT-based authentication
- Password reset functionality
- File and folder management
- MongoDB Atlas integration
- AWS S3 integration (to be added)

## Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- JWT Authentication
- bcryptjs for password hashing
- Nodemailer for email services

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd googledrive-backend
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Update `.env` file with your credentials:
- MongoDB Atlas connection string
- JWT secret key
- Email configuration (Gmail)
- AWS credentials (to be added later)

## Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/googledrive
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
```

## Setup Instructions

### MongoDB Atlas Setup
1. Create a free MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Get your connection string
5. Add your IP address to the whitelist
6. Update the `MONGODB_URI` in your `.env` file

### Email Setup (Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account settings
3. Generate an App Password
4. Use the App Password in the `EMAIL_PASS` field

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/activate/:token` - Activate user account
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/me` - Get current user info

### Files
- `GET /api/files` - Get user files and folders
- `POST /api/files/folder` - Create new folder
- `GET /api/files/path/*` - Get files by path
- `DELETE /api/files/:id` - Delete file or folder
- `GET /api/files/search` - Search files

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Security Features

- Rate limiting
- Helmet.js for security headers
- Input validation
- Password hashing with bcryptjs
- JWT authentication
- CORS configuration

## Error Handling

Centralized error handling with proper HTTP status codes and error messages.

## Next Steps

1. Set up AWS S3 bucket and IAM credentials
2. Integrate AWS SDK for file uploads
3. Add file upload endpoints
4. Add signed URL generation for file downloads
