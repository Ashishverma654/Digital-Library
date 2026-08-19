# DigitalLib: Next-Generation Library Management System 📚

Welcome to **DigitalLib**, a comprehensive, secure, and highly aesthetic full-stack Library Management System. Designed with a stunning minimalist monochrome UI, DigitalLib seamlessly bridges the gap between physical book tracking and digital resource management.

---

## ✨ Features

### 🎨 Stunning Minimalist UI
- **Earthy Elegance:** A crisp, high-contrast monochrome design utilizing deep blacks (`#121200`) and pure whites (`#ffffff`).
- **Responsive Design:** Fully responsive layout with mobile-first components and smooth micro-animations.

### 🛡️ Robust Security Architecture
- **Rate Limiting:** Global IP rate limiters and strict authentication throttling prevent brute force and DDoS attacks.
- **Data Sanitization:** Strict MongoDB NoSQL injection prevention sanitizes all inputs.
- **Secure Authentication:** JWT-based stateless authentication with securely hashed passwords (`bcryptjs`).

### 👥 Multi-Tier User Management
- **Super Admin:** Total oversight. Access to high-level analytics, system settings, and full CRUD over all users, departments, and courses.
- **Librarian:** Operational control. Issue books, process returns, manage the catalog, calculate fines, and approve waitlists.
- **Student:** Intuitive catalog browsing, waitlist joining, digital reading access, and personal borrowing history tracking.

### 📖 Dynamic Book Catalog
- **Hybrid Types:** Support for physical, digital, and hybrid books.
- **Real-Time Availability:** Dynamic calculation of `Total Copies` and `Available` copies.
- **Waitlist System:** Users can queue up for highly demanded, issued books.

### 🤖 AI Assistant Integration
- Built-in Gemini AI Chatbot to assist users with navigating the library, recommending books, or answering FAQs.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS (Custom Design System) + Lucide React Icons
- **Routing:** React Router v6
- **State Management:** React Context API

### Backend (API Server)
- **Environment:** Node.js
- **Framework:** Express.js (v5)
- **Database:** MongoDB (Mongoose ORM)
- **Security:** Helmet, Express-Rate-Limit, Express-Mongo-Sanitize, CORS
- **Generative AI:** `@google/genai` (Gemini API)

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** (Local instance or MongoDB Atlas cluster)

### 2. Clone the Repository
```bash
git clone https://github.com/yourusername/digital-library.git
cd "Digital Library"
```

### 3. Environment Configuration
Create a `.env` file in the **Backend** directory and provide the following variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/digital_library
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5175
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Install Dependencies
Install dependencies for both the Frontend and Backend simultaneously.
```bash
# In the root directory (if package.json exists) or navigate to each:
cd Backend
npm install
cd ../Frontend
npm install
```

### 5. Seed the Database
Populate your database with a massive array of realistic users, books, courses, departments, and historical borrowing transactions (including simulated fines and waitlists).
```bash
cd Backend
npm run seed
```

### 6. Run the Application
You can run both the frontend and backend servers concurrently using the backend's dev script.
```bash
cd Backend
npm run dev
```
- **Frontend** will be available at: `http://localhost:5175` (or dynamically assigned by Vite)
- **Backend API** will be available at: `http://localhost:5000`

---

## 📂 Project Structure

```text
Digital Library/
├── Backend/                 # Express API Server
│   ├── src/
│   │   ├── controllers/     # Route logic
│   │   ├── middleware/      # Auth, Error handling, Security
│   │   ├── models/          # Mongoose Schemas (User, Book, Transaction, etc.)
│   │   ├── routes/          # Express Routers
│   │   ├── utils/           # Helper functions
│   │   ├── app.js           # Express App setup & Security Middleware
│   │   └── seed.js          # Database populator
│   └── server.js            # Entry Point
│
├── Frontend/                # React Client
│   ├── src/
│   │   ├── assets/          # Images and static assets
│   │   ├── components/      # Reusable UI components (Navbar, BookCard, Footer)
│   │   ├── context/         # AuthProvider & global state
│   │   ├── pages/           # Page views (Home, Books, Dashboard, Login)
│   │   ├── routes/          # Protected and Public Route wrappers
│   │   ├── services/        # Axios API instances
│   │   ├── App.jsx          # Main application layout
│   │   └── index.css        # Tailwind directives and custom variables
│   ├── tailwind.config.js   # Tailwind Theme System
│   └── vite.config.js       # Vite configuration
└── README.md
```

---

## 🔐 Core API Endpoints

### Authentication
- `POST /api/auth/login` - Authenticate user & receive JWT
- `POST /api/auth/register` - Create new student account
- `GET /api/auth/me` - Retrieve current logged-in user profile

### Books
- `GET /api/books` - Fetch paginated catalog
- `GET /api/books/:id` - Fetch single book details
- `POST /api/books` - Add a new book (Librarian/Admin)

### Transactions
- `POST /api/transactions/borrow` - Request to borrow a book
- `POST /api/transactions/return/:id` - Process a book return
- `GET /api/transactions/user` - Fetch current user's borrowing history

*(For full API documentation, please refer to the Backend routing modules).*

---

*Engineered with precision for seamless library management.*
