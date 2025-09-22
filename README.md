# Colección de Arte - Art Collection Management System

A full-stack web application for managing art collections with user authentication, artwork cataloging, conservation tracking, and export capabilities.

## Features

- **User Management**: Role-based authentication (Admin, Editor, Conservator, Reader)
- **Artwork Catalog**: Add, edit, and manage art pieces with images and metadata
- **Location Tracking**: Track artwork movements between locations
- **Conservation Records**: Maintain conservation history and reports
- **Export Functionality**: Generate PDF and Word documents for artwork records
- **Dashboard**: Overview statistics and management tools

## Tech Stack

- **Backend**: Node.js, Express.js, PostgreSQL, JWT Authentication
- **Frontend**: React, Vite, Material-UI
- **Database**: PostgreSQL
- **File Storage**: Local file system with image optimization

## Local Development Setup

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/coleccion-arte.git
   cd coleccion-arte
   ```

2. **Set up the database**
   - Install PostgreSQL and create a database named `arte_coleccion`
   - Run the SQL script in `guia_db.txt` to create tables

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your database credentials:
     ```
     DB_USER=your_postgres_user
     DB_HOST=localhost
     DB_DATABASE=arte_coleccion
     DB_PASSWORD=your_postgres_password
     DB_PORT=5432
     JWT_SECRET=your_jwt_secret_key
     MASTER_PASSWORD_HASH=your_master_password_hash
     ```

4. **Install backend dependencies**
   ```bash
   npm install
   ```

5. **Install frontend dependencies**
   ```bash
   cd coleccion-arte-ui
   npm install
   cd ..
   ```

6. **Start the backend server**
   ```bash
   npm start
   ```
   The backend will run on http://localhost:4000

7. **Start the frontend development server**
   ```bash
   cd coleccion-arte-ui
   npm run dev
   ```
   The frontend will run on http://localhost:5173

8. **Access the application**
   - Open http://localhost:5173 in your browser
   - Create an admin user through the registration form
   - Log in and start managing your art collection

## Deployment

See [GUIA_DESPLIEGUE.md](GUIA_DESPLIEGUE.md) for detailed deployment instructions to GitHub, Vercel/Netlify, Render, and Neon.

## Project Structure

```
coleccion-arte/
├── assets/                 # Static assets (logos)
├── coleccion-arte-ui/      # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context for authentication
│   │   ├── hooks/          # Custom React hooks
│   │   └── ...
├── uploads/                # Uploaded images (created at runtime)
├── index.js               # Backend server entry point
├── package.json           # Backend dependencies
└── .env.example          # Environment variables template
```

## API Endpoints

### Authentication
- `POST /api/usuarios/login` - User login
- `POST /api/usuarios/registrar` - Register new user (admin only)

### Artworks
- `GET /api/obras` - Get artworks with pagination and search
- `POST /api/obras` - Create new artwork
- `PUT /api/obras/:id` - Update artwork
- `DELETE /api/obras/:id` - Delete artwork

### Locations
- `GET /api/ubicaciones` - Get all locations
- `POST /api/ubicaciones` - Create location (admin only)

### Movements
- `GET /api/obras/:obraId/movimientos` - Get artwork movements
- `POST /api/obras/:obraId/movimientos` - Record new movement

### Conservation
- `GET /api/obras/:obraId/conservacion` - Get conservation reports
- `POST /api/obras/:obraId/conservacion` - Add conservation report

### Export
- `POST /api/exportar-documento` - Export artworks to PDF/Word

## Deployment

For detailed deployment instructions to GitHub, Vercel/Netlify, Render, and Neon, see [GUIA_DESPLIEGUE.md](GUIA_DESPLIEGUE.md).

### Quick GitHub Setup

1. Create a new repository on GitHub
2. Initialize git in your local project:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/your-repo.git
   git push -u origin main
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

ISC License