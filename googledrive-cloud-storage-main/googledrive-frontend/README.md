# Google Drive Clone - Frontend

React frontend for Google Drive clone application with authentication and file management.

## Features

- User authentication (login, register, forgot password)
- Email account activation
- Password reset functionality
- File and folder management
- Drag & drop file uploads
- Search functionality
- Responsive design
- Modern UI with Tailwind CSS

## Tech Stack

- React 18
- React Router DOM
- Axios for API calls
- React Hot Toast for notifications
- React Icons
- Tailwind CSS

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd googledrive-frontend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

The app will open in your default browser at http://localhost:3000

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── ForgotPassword.js
│   │   ├── ResetPassword.js
│   │   ├── ActivateAccount.js
│   │   └── ProtectedRoute.js
│   └── dashboard/      # Dashboard components
│       ├── Dashboard.js
│       ├── FileList.js
│       ├── FileUpload.js
│       ├── FolderCreate.js
│       └── SearchBar.js
├── contexts/
│   └── AuthContext.js  # Authentication context
├── App.js              # Main app component
├── index.js            # App entry point
└── index.css           # Global styles
```

## Features Overview

### Authentication
- User registration with email validation
- Two-step email activation
- JWT-based login/logout
- Forgot password with email reset
- Protected routes

### File Management
- Create folders
- Upload files (drag & drop supported)
- Download files with signed URLs
- Delete files and folders
- Search files and folders
- Grid and list view modes

### UI/UX
- Responsive design for all devices
- Modern, clean interface
- Toast notifications for user feedback
- Loading states and error handling
- File type icons

## Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:5000
```

## API Integration

The frontend connects to the backend API at:
- Authentication endpoints: `/api/auth/*`
- File management endpoints: `/api/files/*`

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify, Vercel, or similar
1. Run `npm run build`
2. Deploy the `build` folder to your hosting provider
3. Ensure the backend API is accessible from your frontend domain

## Security Features

- JWT token storage in localStorage
- Protected routes with authentication checks
- Input validation and sanitization
- Secure file downloads with signed URLs

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
