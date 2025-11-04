# Test RAG Project

This is a sample project used to test the Luna RAG agent's context extraction and indexing capabilities.

## Project Overview

This project demonstrates:
- React component architecture with TypeScript
- Authentication system with JWT tokens
- API service layer with error handling
- Modern development practices

## Key Features

### Authentication System
- JWT-based authentication
- Token validation and refresh
- Secure storage using localStorage
- Automatic logout on token expiration

### API Integration
- Axios-based HTTP client
- Request/response interceptors
- Centralized error handling
- Automatic token injection

### Component Architecture
- TypeScript interfaces for type safety
- Functional components with hooks
- State management with useState and useEffect
- Form validation and error handling

## File Structure

```
src/
├── components/
│   └── AuthComponent.tsx    # Main authentication UI component
├── utils/
│   └── api.ts              # API service utilities
└── docs/
    └── README.md           # This documentation file
```

## Technical Implementation

### Authentication Flow
1. User enters credentials
2. Client sends login request to `/api/auth/login`
3. Server validates credentials and returns JWT token
4. Client stores token in localStorage
5. Token is automatically included in subsequent API requests
6. Token validation occurs on app initialization

### Error Handling Strategy
- Network errors with user-friendly messages
- Automatic token expiration handling
- Centralized error processing
- Graceful degradation

### Security Considerations
- JWT tokens stored securely in localStorage
- Automatic token cleanup on logout
- HTTPS enforcement for production
- Input validation and sanitization

## Usage Examples

### Basic Authentication
```typescript
import { AuthComponent } from './components/AuthComponent';

// Use in your app
function App() {
  return (
    <div>
      <AuthComponent />
      {/* Other app components */}
    </div>
  );
}
```

### API Service Usage
```typescript
import { apiService } from './utils/api';

// Get request
const users = await apiService.get('/users');

// Post request
const newUser = await apiService.post('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});
```

## Testing

The Luna RAG agent should be able to:
1. Extract context from all TypeScript files
2. Understand the authentication flow
3. Identify API patterns and error handling
4. Provide relevant context for questions about the codebase

## Sample Queries for Testing

- "How does authentication work in this project?"
- "What is the purpose of the API service?"
- "How are errors handled in the authentication component?"
- "What TypeScript interfaces are defined?"
- "How are JWT tokens managed?"

This project serves as a comprehensive test case for the Luna RAG system's ability to understand and provide context about modern web development patterns.