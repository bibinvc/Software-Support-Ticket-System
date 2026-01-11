# Sharing Economy Platform

A secure, modern sharing economy web platform built with React, Node.js, Express, and PostgreSQL. This platform enables service providers and customers to connect, exchange services, and manage orders with comprehensive security controls following Secure SDLC principles.

## Features

### Core Functionality
- **User Management**: Role-based access control (Customer, Provider, Admin)
- **Service Listings**: Providers can create and manage service listings
- **Order Workflow**: Complete order lifecycle (Pending → Confirmed → In Progress → Completed)
- **Multi-Factor Authentication (MFA)**: TOTP-based 2FA for enhanced security
- **Search & Filters**: Search services by category, price, location
- **Rating System**: Customers and providers can rate each other after order completion
- **File Attachments**: Upload images and documents for services and orders
- **Dashboard Statistics**: Role-based dashboards with relevant statistics

### Security Features
- **Secure Authentication**: JWT tokens with session management
- **Input Validation**: Comprehensive validation and sanitization
- **SQL Injection Protection**: Sequelize ORM with parameterized queries
- **XSS Protection**: Input sanitization and output encoding
- **Rate Limiting**: Protection against DoS and brute force attacks
- **Audit Logging**: Comprehensive logging of all critical actions
- **Encryption**: MFA secrets encrypted with AES-256-GCM

### Admin Features
- **User Management**: Create, edit, activate/deactivate users
- **Category Management**: Manage service categories
- **Platform Statistics**: View platform-wide statistics
- **Audit Logs**: Monitor all platform activities

### User Experience
- **Modern UI**: Built with TailwindCSS and DaisyUI
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Updates**: Fast and responsive interface
- **Protected Routes**: Secure authentication and authorization

## Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **DaisyUI** - TailwindCSS component library
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **PostgreSQL** - Relational database
- **Sequelize** - ORM for database operations
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Multer** - File upload handling

## 🚀 Quick Deploy (Free)

Want to deploy this project for free? Check out **[FREE_DEPLOYMENT_GUIDE.md](./FREE_DEPLOYMENT_GUIDE.md)** for step-by-step instructions!

**Recommended Free Hosting:**
- **Frontend**: [Vercel](https://vercel.com) (Free forever)
- **Backend**: [Railway](https://railway.app) or [Render](https://render.com) (Free tiers)
- **Database**: [Supabase](https://supabase.com) (500MB free)

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Software-Support-Ticket-System
```

### 2. Database Setup

**Quick Setup (Recommended):**

1. **Start PostgreSQL:**
   - Windows: Double-click `start-postgres.bat` or open Services (`services.msc`) and start PostgreSQL service
   - Linux/Mac: `sudo service postgresql start` or `pg_ctl start`

2. **Run Database Setup:**
   ```bash
   cd backend
   npm run setup-db
   ```
   This will automatically create the database and run all migrations.

**Manual Setup:**

Create a PostgreSQL database:
```sql
CREATE DATABASE ssts_db;
```

Run the database migration:
```bash
psql -U postgres -d ssts_db -f db/migrations/schema.sql
```

For detailed database setup instructions, see [DATABASE_SETUP.md](DATABASE_SETUP.md).

### 3. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL=postgres://username:password@localhost:5432/ssts_db
PORT=4000
JWT_SECRET=your-secret-key-here
UPLOAD_DIR=./uploads
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` if you need to change the API URL:

```env
VITE_API_URL=http://localhost:4000/api
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

The backend server will run on `http://localhost:4000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Default Roles

The system supports three roles:

- **Customer**: Can browse services, place orders, track orders, rate providers
- **Provider**: Can create and manage services, receive orders, update order status, rate customers
- **Admin**: Full access including user management, category management, audit logs, platform statistics

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Tickets
- `GET /api/tickets` - Get all tickets (with filters)
- `GET /api/tickets/:id` - Get ticket by ID
- `POST /api/tickets` - Create new ticket
- `PATCH /api/tickets/:id` - Update ticket
- `POST /api/tickets/:id/assign` - Assign ticket to agent

### Comments
- `POST /api/tickets/:id/comments` - Add comment to ticket

### Attachments
- `POST /api/attachments` - Upload attachment
- `GET /api/attachments/:id/download` - Download attachment

### Users (Admin/Agent only)
- `GET /api/users` - Get all users
- `GET /api/users/me` - Get current user
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (Admin only)
- `PATCH /api/users/:id` - Update user
- `PATCH /api/users/:id/password` - Update password
- `GET /api/users/agents/list` - Get list of agents

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin only)
- `PATCH /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)

### Priorities
- `GET /api/priorities` - Get all priorities
- `POST /api/priorities` - Create priority (Admin only)
- `PATCH /api/priorities/:id` - Update priority (Admin only)
- `DELETE /api/priorities/:id` - Delete priority (Admin only)

### Statistics
- `GET /api/statistics/dashboard` - Get dashboard statistics
- `GET /api/statistics/trends` - Get ticket trends (Admin/Agent only)

## Project Structure

```
Software-Support-Ticket-System/
├── backend/
│   ├── src/
│   │   ├── index.js              # Main server file
│   │   ├── models/               # Sequelize models
│   │   ├── routes/               # API routes
│   │   └── middleware/           # Auth middleware
│   ├── uploads/                  # File uploads directory
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── pages/                # Page components
│   │   ├── services/             # API service layer
│   │   └── main.jsx              # App entry point
│   └── package.json
├── db/
│   └── migrations/
│       └── schema.sql            # Database schema
└── README.md
```

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Role-based access control
- SQL injection protection via Sequelize ORM
- File upload validation
- CORS configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Additional Resources

- **[SETUP.md](SETUP.md)** - Detailed setup guide
- **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Complete database setup instructions
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- **[FIX_PASSWORD.md](FIX_PASSWORD.md)** - Password reset guide

## Helper Scripts

- **start-postgres.bat** - Start PostgreSQL service on Windows
- **open-database.bat** - Open database in pgAdmin or psql
- **sample-data.sql** - Sample SQL queries to populate test data
- **view-tickets.sql** - SQL queries to view tickets

## Support

For issues and questions, please create an issue in the repository.
