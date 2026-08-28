# Google Drive Clone

A full-stack cloud-based file storage and sharing application inspired by Google Drive. The application allows users to securely upload, store, organize, manage, download, and share files through a modern and responsive web interface.

This project demonstrates practical concepts of cloud computing, full-stack development, database management, authentication, REST APIs, and cloud storage.

> This project is developed for educational purposes and is not affiliated with or endorsed by Google.

---

## Features

### User Authentication

- User registration
- User login
- JWT-based authentication
- Protected routes
- Secure logout
- User profile management

### File Management

- Upload files
- Download files
- Delete files
- Rename files
- File preview
- File metadata management
- Drag-and-drop file upload
- Recent files

### Folder Management

- Create folders
- Rename folders
- Delete folders
- Organize files into folders
- Move files between folders
- Folder navigation

### File Sharing

- Generate shareable links
- Share files with other users
- Public and private file access
- Access permissions
- Shared files management

### Search and Filtering

- Search files and folders
- Filter files by type
- Sort files by name
- Sort files by size
- Sort files by date
- Recent files

### Storage Dashboard

- Total storage usage
- Available storage
- Total number of files
- File type statistics
- Recent activity
- Shared files

---

## Technology Stack

### Frontend

- React.js
- TypeScript
- Vite
- Tailwind CSS
- Axios

### Backend

- Node.js
- Express.js
- REST API
- JSON Web Token (JWT)

### Database

- MongoDB

### Cloud Services

- Amazon S3
- AWS IAM

### Development Tools

- Git
- GitHub
- VS Code
- Postman

---

## System Architecture

```text
                         User
                           |
                           v
                 React Web Application
                           |
                           | REST API
                           v
                   Node.js / Express
                           |
                 +---------+---------+
                 |                   |
                 v                   v
              MongoDB              AWS S3
            File Metadata        File Storage
                 |                   |
                 +---------+---------+
                           |
                           v
                Cloud Storage System
