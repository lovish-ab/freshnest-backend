## Project Setup
Follow the steps below to set up the project locally.

### 1. Clone the Repository
```bash
git clone https://github.com/lovish-ab/freshnest-backend.git
cd freshnest-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure .env file
Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=5001

# Database (PostgreSQL)
DB_NAME=freshnest_db
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Environment
NODE_ENV=development
```

**Important:** Replace the placeholder values with your actual PostgreSQL credentials and generate a strong JWT_SECRET.

### 4. Database Setup
Make sure PostgreSQL is running on your machine, then:

```bash
# Create the database (if not exists)
createdb freshnest_db
```

### 5. Run the project
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5001` (or the PORT you specified in .env).

### 6. Test the Application
```bash
# Run all tests
npm test

# Test health endpoint
curl http://localhost:5001/api/health
```

## API Endpoints

### Health Check
- `GET /api/health` - Check server status

## Project Structure
```
freshnest-backend/
├── src/
│   ├── app.js              # Express app configuration
│   ├── config/             # Database and config files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middlewares (auth, error handling)
│   ├── models/             # Sequelize models
│   ├── routes/             # API routes
│   ├── services/           # Business logic services
│   └── utils/              # Utility functions
├── uploads/                # Static file uploads (product images)
│   └── products/           # Product images directory
├── index.js                # Application entry point
└── package.json
```