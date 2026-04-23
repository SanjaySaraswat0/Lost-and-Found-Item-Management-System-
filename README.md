# Lost & Found - MERN Stack

A college campus Lost & Found Item Management System built with MongoDB, Express, React, Node.js.

## Setup

### Backend
```
cd backend
npm install
npm start
```

### Frontend
```
cd frontend
npm install
npm start
```

## Environment Variables (backend/.env)
```
MONGO_URI=<your-mongodb-atlas-uri>
JWT_SECRET=mysecretkey123
PORT=5000
```

## API Endpoints
- POST /api/register
- POST /api/login
- GET  /api/items
- POST /api/items
- GET  /api/items/:id
- PUT  /api/items/:id
- DELETE /api/items/:id
- GET  /api/items/search?name=xyz

## Deployment
- Backend: Render (Web Service)
- Frontend: Render (Static Site)
