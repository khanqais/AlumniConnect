# AGENTS.md - Coding Guidelines for Alumni-Student Mentorship Portal

This document provides essential information for AI coding agents working on this codebase.

## Project Overview

**Alumni-Student Mentorship Portal** - A full-stack platform connecting students with alumni for mentorship, career guidance, and resource sharing.

**Tech Stack:**
- **Frontend:** React 19.2 + TypeScript + Vite + TailwindCSS
- **Backend:** Node.js + Express.js + MongoDB + Mongoose
- **Authentication:** JWT tokens

## Directory Structure

```
├── Front-end/           # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── context/    # React context (Auth)
│   │   ├── assets/     # Images and static files
│   │   └── components/ # Reusable components
│   └── dist/           # Production build output
│
└── backend/            # Node.js + Express backend
    ├── models/         # Mongoose models
    ├── routes/         # API route definitions
    ├── controllers/    # Route handlers
    ├── middleware/     # Auth & upload middleware
    ├── config/         # Database configuration
    └── uploads/        # Uploaded files
```

---

## Build, Lint & Test Commands

### Frontend (Front-end/)

```bash
# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Backend (backend/)

```bash
# Install dependencies
npm install

# Start server (port 5000)
npm start

# Development mode with auto-reload
npm run dev
```

**Note:** No test suites are currently configured. Tests should be added using Jest or Vitest.

---

## Code Style Guidelines

### TypeScript/JavaScript

#### Imports
- Use ES6 `import` statements (frontend)
- Use CommonJS `require()` (backend)
- Group imports: React/libraries first, then local imports
- Use type imports with `type` keyword:
  ```typescript
  import { type ReactNode } from 'react';
  ```

#### Formatting
- **Indentation:** 4 spaces
- **Quotes:** Single quotes for strings
- **Semicolons:** Required
- **Line length:** Prefer < 120 characters
- **Arrow functions:** Use for callbacks and functional components

#### Types
- **Always specify types** - avoid `any` type
- Use `unknown` with type guards for error handling:
  ```typescript
  catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Error');
  }
  ```
- Define interfaces for complex objects
- Use type aliases for union types

#### Naming Conventions
- **Components:** PascalCase (`UserDashboard`)
- **Files:** PascalCase for components (`Dashboard.tsx`), camelCase for utilities
- **Variables/Functions:** camelCase (`fetchUserData`)
- **Constants:** UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Interfaces:** PascalCase with descriptive names (`AuthContextType`)
- **CSS Classes:** kebab-case with Tailwind utility classes

#### React Patterns
- Use functional components with hooks
- Prefer `useCallback` for functions in dependency arrays
- Use lazy initialization for expensive `useState` operations:
  ```typescript
  const [user, setUser] = useState<User | null>(() => {
      // Expensive initialization
      return parseLocalStorage();
  });
  ```
- Destructure props in function parameters
- Use optional chaining (`user?.name`)

#### Error Handling
- Always catch errors in async functions
- Provide user-friendly error messages
- Log errors to console for debugging:
  ```typescript
  catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
  }
  ```
- Use try-catch for API calls

#### API Integration
- Base URL: `http://localhost:5000/api/`
- Include JWT token in headers:
  ```typescript
  headers: {
      Authorization: `Bearer ${user?.token}`
  }
  ```
- Use axios for HTTP requests
- Handle loading and error states

---

## Backend Guidelines

### Models
- Use Mongoose schemas with timestamps
- Define proper validation rules
- Use `required: true` for mandatory fields
- Example:
  ```javascript
  const userSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true }
  }, { timestamps: true });
  ```

### Routes
- Organize by feature (auth, resources, blogs, etc.)
- Use middleware for authentication
- Follow REST conventions:
  - GET for reading
  - POST for creating
  - PUT/PATCH for updating
  - DELETE for removing

### Controllers
- Keep logic in controllers, not routes
- Use async/await for database operations
- Return consistent response format:
  ```javascript
  res.status(200).json({ success: true, data: result });
  // or
  res.status(400).json({ message: 'Error message' });
  ```

### Authentication
- JWT tokens stored in localStorage (frontend)
- Protected routes use authMiddleware
- Admin routes use separate adminAuth
- Tokens include: `_id`, `name`, `email`, `role`, `isApproved`

---

## Feature Implementation Status

✅ **Implemented:**
1. User authentication (student/alumni/admin roles)
2. Resource repository (upload, download, approve)
3. Admin dashboard (approve users/resources)
4. User dashboard with stats
5. Blog system (models ready)
6. Q&A community (models ready)
7. Event management (models ready)

⚠️ **Partially Implemented:**
- Smart Mentor Matching (models exist, matching logic needed)
- Integrated Scheduling Engine (not implemented)
- Career Path Visualizer (not implemented)

---

## Important Files

### Frontend
- `Front-end/src/context/AuthContext.tsx` - Authentication state
- `Front-end/src/App.tsx` - Route definitions & protection
- `Front-end/src/pages/Resources.tsx` - Resource management
- `Front-end/src/pages/Dashboard.tsx` - User dashboard

### Backend
- `backend/app.js` - Express app configuration
- `backend/models/User.js` - User schema
- `backend/middleware/authMiddleware.js` - JWT verification
- `backend/routes/*.js` - API endpoints

---

## Common Tasks

### Adding a New Page
1. Create component in `Front-end/src/pages/PageName.tsx`
2. Add route in `Front-end/src/App.tsx`
3. Add navigation link in Dashboard or Header
4. Use protected route wrapper if auth required

### Adding a New API Endpoint
1. Create/update model in `backend/models/`
2. Create controller in `backend/controllers/`
3. Create route in `backend/routes/`
4. Register route in `backend/app.js`

### Fixing Build Errors
1. Run `npm run lint` to see errors
2. Run `npm run build` to check TypeScript errors
3. Common fixes:
   - Add type annotations for `any` types
   - Use `useCallback` for functions in dependencies
   - Import types with `type` keyword

---

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123456
```

### Frontend
- Uses Vite's environment variable system
- API URL is hardcoded to `http://localhost:5000` (should be moved to env)

---

## Git Workflow

- Commit messages should be descriptive
- Test build before committing:
  ```bash
  cd Front-end && npm run build && npm run lint
  ```
- Don't commit `.env` files or `node_modules/`

---

**Last Updated:** 2026-01-19
