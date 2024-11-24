# hi-there-chat-app

A full-stack application built with React, Node.js, and MongoDB.

## Project Structure

The project is divided into two main folders:

1. **backend**: Contains the server-side application built with Node.js and TypeScript.
2. **frontend**: Contains the client-side application built with React.

---

## Prerequisites

Ensure the following are installed on your system:

- [Node.js](https://nodejs.org/) (v14 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [TypeScript](https://www.typescriptlang.org/) (if not globally installed, it is included in the project)

---

## Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd <repository-folder>
```

## Start project on production  

```
cd backend
npm run build
npm run start
```

## Starting the Project locally

### Start the Backend

Go to the backend folder:

```
cd backend && tsc -b && npm run dev
```

### Start the Frontend

Go to the frontend folder:

```
cd frontend && npm run dev
```

## Environment Variables

### Backend

Create a .env file in the backend folder with the following keys:

```
PORT=3000
MONGO_URI=<your-mongodb-connection-string>
```

### Frontend

configure .env in the frontend folder for environment-specific variables like the backend API URL:

```
VITE_CLOUDINARY_CLOUD_NAME=<cloud-name>
VITE_CLOUDINARY_UPLOAD_PRESET=<upload-preset>
```

## Troubleshooting

### Common Issues and Solutions

1. TypeScript compilation errors:

    Ensure all required TypeScript dependencies are installed.
    Run npx tsc --watch to monitor and fix compilation errors in real-time.
    
2. MongoDB connection issues:

    Verify the MONGO_URI in the backend .env file is correct.
    