# SteppersLife 2025 Backend API

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- pip or pipenv

### Installation

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Run the application**
```bash
python main.py
```

The API will be available at:
- **API Documentation**: http://localhost:8000/api/v1/docs
- **Health Check**: http://localhost:8000/health
- **Root**: http://localhost:8000/

## 🔧 Configuration

### Database Setup
By default, the application uses SQLite for easy development. The database file will be created automatically as `steppers_life.db`.

For PostgreSQL, set the `DATABASE_URL` environment variable:
```bash
export DATABASE_URL="postgresql://user:pass@localhost:5432/steppers_db"
```

### Environment Variables
Create a `.env` file in the backend directory (optional):
```env
SECRET_KEY=your-super-secret-jwt-key-here
DATABASE_URL=sqlite:///./steppers_life.db
ENVIRONMENT=development
DEBUG=true
```

## 🔐 Authentication System

### Available Endpoints

#### **POST** `/api/v1/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890"
}
```

#### **POST** `/api/v1/auth/login`
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user",
    "status": "active"
  }
}
```

#### **GET** `/api/v1/auth/me`
Get current user information (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

#### **POST** `/api/v1/auth/verify-email`
Verify user email address.

**Request Body:**
```json
{
  "token": "verification_token_from_email"
}
```

#### **POST** `/api/v1/auth/password-reset-request`
Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### **POST** `/api/v1/auth/password-reset-confirm`
Confirm password reset with new password.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "new_password": "newpassword123"
}
```

## 🧪 Testing the API

### Using curl

1. **Register a new user:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

2. **Login:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

3. **Get current user (using token from login):**
```bash
curl -X GET "http://localhost:8000/api/v1/auth/me" \
  -H "Authorization: Bearer <your_access_token>"
```

### Using the Interactive API Docs
Visit http://localhost:8000/api/v1/docs for an interactive Swagger UI where you can test all endpoints.

## 📊 Database

### Models
- **User**: Handles user authentication, profiles, and role management
- **UserRole**: Enum for user roles (user, organizer, instructor, admin, moderator)
- **UserStatus**: Enum for user status (active, inactive, suspended, pending)

### Features
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Email verification system
- ✅ Password reset functionality
- ✅ User role and status management
- ✅ Automatic database table creation

## 📧 Email System

Currently using mock email implementation (prints to console). In production, configure SMTP settings:

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@stepperslife.com
```

## 🔍 Development

### Project Structure
```
backend/
├── app/
│   ├── api/v1/
│   │   ├── endpoints/
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   └── admin_categories.py  # Admin category management
│   │   └── api.py              # API router configuration
│   ├── core/
│   │   ├── auth.py             # JWT and password utilities
│   │   ├── config.py           # Application configuration
│   │   └── database.py         # Database connection
│   ├── models/
│   │   └── user.py             # User database model
│   ├── schemas/
│   │   └── user.py             # Pydantic schemas
│   └── services/
│       ├── user_service.py     # User business logic
│       └── email_service.py    # Email sending service
├── main.py                     # FastAPI application
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

### Next Development Steps
1. **Event Management System** - Create event models and APIs
2. **Ticketing System** - Implement ticket purchase and QR codes
3. **Payment Integration** - Add payment gateway support
4. **File Upload** - Add image/file upload capabilities
5. **Real-time Features** - WebSocket support for notifications

## 🚨 Current Status

✅ **Completed:**
- User authentication system (registration, login, verification)
- Password reset functionality
- JWT token management
- Database models and migrations
- Email service foundation
- API documentation

⏳ **Next Phase:**
- Event management system
- Ticketing and payment processing
- Admin panel backend APIs
- File storage system

## 🐛 Troubleshooting

### Common Issues

1. **Database connection errors**: Ensure SQLite permissions or PostgreSQL is running
2. **Import errors**: Make sure virtual environment is activated and dependencies installed
3. **JWT token errors**: Check `SECRET_KEY` configuration
4. **CORS issues**: Frontend must run on http://localhost:3000

### Debugging
- Check logs in terminal where `python main.py` is running
- Visit `/info` endpoint for configuration details (development only)
- Use `/health` endpoint to check database connectivity

## 📝 API Documentation

Full interactive API documentation is available at:
- **Swagger UI**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc 

## 📧 Email Integration

### SendGrid Setup

SteppersLife uses SendGrid for email delivery. To set up SendGrid:

1. Create a SendGrid account at [sendgrid.com](https://sendgrid.com)
2. Create an API key with "Mail Send" permissions
3. Add the API key to your `.env` file:
   ```
   SENDGRID_API_KEY=your-sendgrid-api-key-here
   SENDGRID_FROM_EMAIL=noreply@stepperslife.com
   SENDGRID_FROM_NAME=SteppersLife
   ```

### Testing Email Integration

You can test the SendGrid integration using the provided script:

```
python scripts/test_sendgrid.py recipient@example.com
```

Or with a specific API key:

```
python scripts/test_sendgrid.py recipient@example.com --api-key=your-api-key
``` 