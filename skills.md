# Skills Reference - Complete Development & Design Guide

## Web Development Skills

### 1. HTML5 Semantic Markup
- Use semantic elements (`<header>`, `<nav>`, `<article>`, `<section>`, `<footer>`)
- Implement proper accessibility attributes (ARIA labels, roles, alt text)
- Structure documents for SEO optimization and screen readers
- Form validation with HTML5 input types
- Meta tags for social sharing (Open Graph, Twitter Cards)

**Example:**
```html
<article role="article" aria-labelledby="article-title">
  <header>
    <h1 id="article-title">Article Title</h1>
  </header>
  <section>Content here</section>
</article>
```

### 2. Modern CSS & Responsive Design
- Flexbox for one-dimensional layouts
- CSS Grid for two-dimensional layouts
- CSS Variables (Custom Properties) for theming
- Mobile-first design with `min-width` media queries
- Container queries for component-level responsiveness
- CSS animations and transitions for smooth UX

**Key Principles:**
```css
:root {
  --primary-color: #007AFF;
  --spacing-unit: 8px;
}

.container {
  display: grid;
  gap: calc(var(--spacing-unit) * 2);
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
```

### 3. JavaScript ES6+ Fundamentals
- `async`/`await` for asynchronous operations
- Destructuring objects and arrays
- Spread/rest operators
- Arrow functions and lexical `this`
- Template literals for string interpolation
- Optional chaining (`?.`) and nullish coalescing (`??`)
- Modules (import/export)

**Best Practices:**
```javascript
// Use async/await instead of .then()
const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch:', error);
  }
};
```

### 4. Frontend Frameworks (React/Vue/Svelte)
- Component-based architecture and composition
- Props for parent-to-child communication
- Events/callbacks for child-to-parent communication
- State management (useState, Pinia, Svelte stores)
- Lifecycle methods and hooks (useEffect, onMounted)
- Context/Provide-Inject for dependency injection
- Virtual DOM and reactivity systems

**React Example:**
```jsx
const UserCard = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Side effects here
  }, [user.id]);

  return <div>{/* component JSX */}</div>;
};
```

### 5. API Integration & Fetch
- RESTful API patterns (GET, POST, PUT, DELETE)
- Error handling with try/catch
- Loading and error states in UI
- Request headers (Authorization, Content-Type)
- Query parameters and URL construction
- Response parsing and validation

**Pattern:**
```javascript
const apiClient = {
  async get(endpoint) {
    const response = await fetch(`/api${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('API request failed');
    return response.json();
  }
};
```

### 6. Browser DevTools Proficiency
- **Elements Tab:** Inspect and modify DOM/CSS in real-time
- **Console:** Debug JavaScript, log errors and warnings
- **Network Tab:** Monitor API calls, timing, and payloads
- **Performance Tab:** Identify bottlenecks and rendering issues
- **Application Tab:** Inspect localStorage, cookies, and service workers
- **Lighthouse:** Audit performance, accessibility, SEO

### 7. Version Control with Git
- Branch management (`main`, `develop`, `feature/*`)
- Commit conventions (Conventional Commits)
- Merging and rebasing strategies
- Resolving merge conflicts
- Pull/Merge request workflows
- `.gitignore` configuration

**Common Commands:**
```bash
git checkout -b feature/new-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
git rebase main
```

### 8. Build Tools & Bundlers
- Vite for modern, fast development
- Webpack for complex configurations
- Module bundling and tree shaking
- Code splitting for optimal loading
- Environment variable management (`.env` files)
- Hot Module Replacement (HMR)
- Production optimizations

**Vite Config Example:**
```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
}
```

### 9. Testing Strategies
- **Unit Tests:** Jest, Vitest for isolated function testing
- **Component Tests:** React Testing Library, Vue Test Utils
- **Integration Tests:** Test multiple components working together
- **E2E Tests:** Playwright, Cypress for full user flows
- Test coverage and reporting
- Mocking and stubbing external dependencies

**Test Example:**
```javascript
describe('UserCard', () => {
  it('displays user information', () => {
    render(<UserCard user={mockUser} />);
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
  });
});
```

### 10. Performance Optimization
- Lazy loading images (`loading="lazy"`)
- Code splitting with dynamic imports
- Memoization (React.memo, useMemo, useCallback)
- Debouncing and throttling
- Web Vitals monitoring (LCP, FID, CLS)
- Bundle size analysis
- CDN usage for static assets
- Service Workers for offline support

---

## Server Skills

### 1. Node.js/Express Fundamentals
- Middleware pattern for request processing
- Route handling and parameterization
- Request/response cycle
- Body parsing and validation
- Error handling middleware
- Async route handlers

**Express Setup:**
```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/users/:id', async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});
```

### 2. Database Design & ORMs
- **SQL Databases:** PostgreSQL, MySQL, SQLite
- **NoSQL Databases:** MongoDB, Redis
- **ORMs:** Prisma, Sequelize, TypeORM, Mongoose
- Schema design and normalization
- Indexes for query optimization
- Migrations and seeding
- Transactions for data integrity

**Prisma Example:**
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  author   User   @relation(fields: [authorId], references: [id])
  authorId Int
}
```

### 3. RESTful API Design
- Resource-based URL structure (`/api/users`, `/api/posts/:id`)
- HTTP methods: GET (read), POST (create), PUT/PATCH (update), DELETE
- Proper status codes (200, 201, 400, 401, 404, 500)
- Pagination with `limit` and `offset` or cursor-based
- Filtering and sorting query parameters
- API versioning (`/api/v1/users`)
- HATEOAS principles (optional)

**RESTful Conventions:**
```
GET    /api/users        # List all users
GET    /api/users/:id    # Get single user
POST   /api/users        # Create user
PUT    /api/users/:id    # Update user (full)
PATCH  /api/users/:id    # Update user (partial)
DELETE /api/users/:id    # Delete user
```

### 4. Authentication & Authorization
- **Session-based auth:** Express-session, cookies
- **Token-based auth:** JWT (JSON Web Tokens)
- **OAuth 2.0:** Social login (Google, GitHub)
- Password hashing with bcrypt or Argon2
- Refresh token rotation
- Role-Based Access Control (RBAC)
- Middleware for protecting routes

**JWT Implementation:**
```javascript
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### 5. Server Security Best Practices
- **Input Validation:** Zod, Joi, express-validator
- **Sanitization:** Prevent XSS attacks
- **SQL Injection Prevention:** Use parameterized queries/ORMs
- **CSRF Protection:** CSRF tokens for state-changing operations
- **CORS Configuration:** Whitelist allowed origins
- **Rate Limiting:** Prevent brute force attacks
- **Security Headers:** Helmet.js middleware
- **Secrets Management:** Never commit secrets, use env variables

**Security Middleware:**
```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

### 6. Containerization with Docker
- Dockerfile creation for reproducible builds
- Multi-stage builds for smaller images
- Docker Compose for multi-container applications
- Volume mounting for persistent data
- Environment variables in containers
- Container networking
- Image optimization techniques

**Dockerfile Example:**
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### 7. Environment Configuration
- `.env` files for local development
- Separate configs for dev/staging/production
- dotenv package for loading environment variables
- Config validation on startup
- Secrets management (AWS Secrets Manager, HashiCorp Vault)
- Never commit `.env` files (add to `.gitignore`)

**Config Pattern:**
```javascript
require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  database: {
    url: process.env.DATABASE_URL,
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10')
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  }
};

module.exports = config;
```

### 8. Logging & Monitoring
- Structured logging with Winston or Pino
- Log levels (error, warn, info, debug)
- Request logging with Morgan
- Error tracking (Sentry, Rollbar, Bugsnag)
- Application monitoring (New Relic, Datadog)
- Health check endpoints
- Metrics collection (Prometheus)

**Winston Setup:**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### 9. Caching Strategies
- **Redis:** In-memory cache for sessions and data
- **Cache-Control headers:** Browser caching
- **CDN Caching:** Static asset delivery
- Cache invalidation patterns
- Cache-aside (lazy loading) pattern
- Write-through and write-behind caching
- ETags for conditional requests

**Redis Caching:**
```javascript
const redis = require('redis');
const client = redis.createClient();

const cacheMiddleware = async (req, res, next) => {
  const key = `cache:${req.originalUrl}`;
  const cached = await client.get(key);

  if (cached) {
    return res.json(JSON.parse(cached));
  }

  res.sendResponse = res.json;
  res.json = (body) => {
    client.setEx(key, 3600, JSON.stringify(body));
    res.sendResponse(body);
  };
  next();
};
```

### 10. CI/CD & Deployment
- **CI/CD Platforms:** GitHub Actions, GitLab CI, CircleCI
- Automated testing in pipelines
- Build and deployment automation
- Environment-specific deployments
- **Hosting Platforms:** Vercel, Railway, Render, Fly.io, AWS, GCP
- Database migrations in deployment
- Zero-downtime deployments
- Rollback strategies

**GitHub Actions Example:**
```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: npm run deploy
```

---

## UI/Apple Design Principles

### Apple's Human Interface Guidelines

#### 1. Clarity
- **Typography:** Text is legible at all sizes, use system fonts
- **Icons:** Precise, simple, and immediately recognizable
- **Negative Space:** Ample padding makes content breathable
- **Contrast:** Sufficient contrast for readability (WCAG AA minimum)

#### 2. Deference
- **Content First:** UI should never compete with content
- **Translucency:** Blur effects provide context without distraction
- **Minimal Chrome:** Reduce UI elements to essentials
- **Full-Screen:** Content fills the entire screen

#### 3. Depth
- **Layering:** Use shadows and elevation to show hierarchy
- **Motion:** Realistic animations convey spatial relationships
- **Transitions:** Maintain context during navigation
- **Z-axis:** Stack elements naturally

### Apple Design System Elements

#### Typography
- **Font Family:** San Francisco (SF Pro), system fonts
- **Scale:** 11, 13, 15, 17, 20, 24, 28, 34, 48, 60pt
- **Weights:** Regular (400), Medium (500), Semibold (600), Bold (700)
- **Line Height:** 1.2–1.5 for body text
- **Letter Spacing:** Tight for large headings, normal for body

#### Color Palette
- **System Colors:**
  - Blue: `#007AFF` (Primary action)
  - Green: `#34C759` (Success)
  - Red: `#FF3B30` (Destructive)
  - Orange: `#FF9500` (Warning)
  - Gray: `#8E8E93` (Secondary text)

- **Semantic Usage:**
  - Primary buttons: Blue
  - Success states: Green
  - Destructive actions: Red
  - Disabled states: Gray with reduced opacity

#### Spacing System
- **Base Unit:** 4px or 8px
- **Common Spacings:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px
- **Padding:** 16px standard, 20-24px for comfortable spacing
- **Margins:** 8-16px between related elements

#### Layout Grid
- **Mobile:** 4-column grid, 16px margins
- **Tablet:** 8-column grid, 20px margins
- **Desktop:** 12-column grid, 24px margins
- **Gutters:** 16-20px between columns

#### Touch Targets
- **Minimum Size:** 44x44pt (iOS), 48x48dp (Android)
- **Comfortable Size:** 48x48pt or larger
- **Spacing:** 8px minimum between interactive elements

#### Elevation & Shadows
```css
/* Light elevation */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12),
            0 1px 2px rgba(0, 0, 0, 0.24);

/* Medium elevation */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1),
            0 2px 4px rgba(0, 0, 0, 0.06);

/* High elevation */
box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15),
            0 5px 10px rgba(0, 0, 0, 0.1);
```

#### Motion & Animation
- **Duration:** 200-300ms for micro-interactions, 400-500ms for transitions
- **Easing:** `cubic-bezier(0.4, 0.0, 0.2, 1)` for natural motion
- **Spring Animations:** For playful, responsive interactions
- **Fade + Scale:** Entrance animations (fade from 0.95 to 1)
```css
.button {
  transition: all 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
}

.button:hover {
  transform: scale(1.02);
}

.button:active {
  transform: scale(0.98);
}
```

#### Component Patterns

**Cards:**
```css
.card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
```

**Buttons:**
```css
.button-primary {
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  font-size: 17px;
}
```

---

## Design Patterns for Software Architecture

### Architectural Patterns

#### 1. MVC (Model-View-Controller)
**Use When:** Building traditional server-rendered applications or separating concerns

**Structure:**
- **Model:** Data layer, database interactions
- **View:** UI templates, presentation logic
- **Controller:** Request handling, business logic coordination

**Example:**
```
/models
  - User.js
  - Post.js
/views
  - users.ejs
  - posts.ejs
/controllers
  - userController.js
  - postController.js
```

#### 2. Component-Based Architecture
**Use When:** Building modern frontend applications with React/Vue/Svelte

**Principles:**
- Components are self-contained and reusable
- Props for data flow down the component tree
- Events/callbacks for communication up the tree
- Composition over inheritance

**Structure:**
```
/components
  /common
    - Button.jsx
    - Input.jsx
  /features
    /users
      - UserCard.jsx
      - UserList.jsx
```

#### 3. Repository Pattern
**Use When:** Abstracting data access logic from business logic

**Benefits:**
- Easier testing with mock repositories
- Swap data sources without changing business logic
- Centralized query logic

**Example:**
```javascript
class UserRepository {
  async findById(id) {
    return await prisma.user.findUnique({ where: { id } });
  }

  async create(data) {
    return await prisma.user.create({ data });
  }
}
```

#### 4. Service Layer Pattern
**Use When:** Business logic needs to be reusable across multiple endpoints

**Structure:**
```javascript
// services/userService.js
class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async registerUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return this.userRepository.create({
      ...userData,
      password: hashedPassword
    });
  }
}
```

### Creational Patterns

#### 5. Factory Pattern
**Use When:** Creating objects without specifying exact class

**Example:**
```javascript
class NotificationFactory {
  create(type) {
    switch(type) {
      case 'email':
        return new EmailNotification();
      case 'sms':
        return new SMSNotification();
      case 'push':
        return new PushNotification();
      default:
        throw new Error('Unknown notification type');
    }
  }
}
```

#### 6. Singleton Pattern
**Use When:** Only one instance should exist (database connection, logger)

**Example:**
```javascript
class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    this.connection = this.createConnection();
    Database.instance = this;
  }

  createConnection() {
    // Database connection logic
  }
}

const db = new Database();
export default db;
```

#### 7. Builder Pattern
**Use When:** Constructing complex objects step by step

**Example:**
```javascript
class QueryBuilder {
  constructor() {
    this.query = {};
  }

  select(fields) {
    this.query.select = fields;
    return this;
  }

  where(conditions) {
    this.query.where = conditions;
    return this;
  }

  build() {
    return this.query;
  }
}

// Usage:
const query = new QueryBuilder()
  .select(['id', 'name'])
  .where({ active: true })
  .build();
```

### Behavioral Patterns

#### 8. Observer Pattern
**Use When:** Building event-driven architecture, real-time updates

**Example:**
```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(data));
    }
  }
}

// Usage:
const emitter = new EventEmitter();
emitter.on('userCreated', (user) => {
  console.log('New user:', user);
});
emitter.emit('userCreated', { id: 1, name: 'John' });
```

#### 9. Strategy Pattern
**Use When:** Multiple algorithms for same operation (payment methods, sorting)

**Example:**
```javascript
class PaymentContext {
  setStrategy(strategy) {
    this.strategy = strategy;
  }

  executePayment(amount) {
    return this.strategy.pay(amount);
  }
}

class CreditCardPayment {
  pay(amount) {
    return `Paid ${amount} with credit card`;
  }
}

class PayPalPayment {
  pay(amount) {
    return `Paid ${amount} with PayPal`;
  }
}
```

#### 10. Command Pattern
**Use When:** Encapsulating requests as objects (undo/redo, queuing)

**Example:**
```javascript
class Command {
  execute() {}
  undo() {}
}

class CreateUserCommand extends Command {
  constructor(userData) {
    super();
    this.userData = userData;
  }

  execute() {
    this.user = createUser(this.userData);
  }

  undo() {
    deleteUser(this.user.id);
  }
}
```

### Structural Patterns

#### 11. Middleware Pattern
**Use When:** Chain of processing steps (Express, Redux)

**Example:**
```javascript
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

const auth = (req, res, next) => {
  if (req.headers.authorization) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
};

app.use(logger);
app.use(auth);
```

#### 12. Adapter Pattern
**Use When:** Making incompatible interfaces work together

**Example:**
```javascript
class OldAPI {
  getUser(id) {
    return { user_id: id, user_name: 'John' };
  }
}

class NewAPIAdapter {
  constructor(oldAPI) {
    this.oldAPI = oldAPI;
  }

  getUser(id) {
    const data = this.oldAPI.getUser(id);
    return {
      id: data.user_id,
      name: data.user_name
    };
  }
}
```

#### 13. Decorator Pattern
**Use When:** Adding functionality to objects dynamically

**Example:**
```javascript
class Coffee {
  cost() {
    return 5;
  }
}

class MilkDecorator {
  constructor(coffee) {
    this.coffee = coffee;
  }

  cost() {
    return this.coffee.cost() + 2;
  }
}

const coffee = new Coffee();
const coffeeWithMilk = new MilkDecorator(coffee);
console.log(coffeeWithMilk.cost()); // 7
```

---

## Using Claude Code Effectively

### Best Practices for Delegating Tasks

1. **Be Specific and Clear**
```bash
   # Good:
   "Create a React component called UserProfile that displays user data
   from an API endpoint /api/users/:id with loading and error states"

   # Too vague:
   "Make a user component"
```

2. **Specify Tech Stack and Constraints**
```bash
   "Build an Express API with TypeScript, Prisma ORM, and PostgreSQL.
   Include authentication with JWT and rate limiting middleware."
```

3. **Request Best Practices**
```bash
   "Implement the repository pattern with dependency injection.
   Include unit tests with Jest and proper error handling."
```

4. **Provide Context**
```bash
   "Add a feature to the existing e-commerce app that allows users
   to filter products by category and price range. Use the existing
   ProductCard component and maintain the current design system."
```

5. **Ask for Explanations**
```bash
   "Explain the caching strategy you implemented and when the cache
   gets invalidated."
```

### Project Structure Prompts
```bash
# Full-stack setup
"Create a full-stack TypeScript project with:
- Frontend: React + Vite + Tailwind CSS
- Backend: Express + Prisma + PostgreSQL
- Authentication: JWT
- Project structure following best practices"

# Component creation
"Create a responsive Navbar component using Tailwind CSS that:
- Has a logo on the left
- Navigation links in the center
- User menu on the right
- Collapses to hamburger menu on mobile
- Follows Apple HIG design principles"

# API endpoint
"Create a RESTful API endpoint for managing blog posts with:
- CRUD operations
- Input validation using Zod
- Pagination support
- Authentication required for create/update/delete
- Proper error handling and status codes"
```

### Testing Requests
```bash
"Write unit tests for the UserService class covering:
- User registration with password hashing
- Email uniqueness validation
- Error handling for invalid inputs
Use Jest and include setup/teardown for test database"
```

### Code Review Requests
```bash
"Review this authentication middleware for:
- Security vulnerabilities
- Performance issues
- Code quality and readability
- Suggest improvements following best practices"
```

---

## Additional Resources

- **Claude Code Documentation:** https://docs.claude.com/en/docs/claude-code
- **MDN Web Docs:** https://developer.mozilla.org
- **Node.js Documentation:** https://nodejs.org/docs
- **React Documentation:** https://react.dev
- **Apple HIG:** https://developer.apple.com/design/human-interface-guidelines

---

## Quick Reference Commands

### Git
```bash
git init
git add .
git commit -m "feat: initial commit"
git branch -M main
git remote add origin <url>
git push -u origin main
```

### npm/Node
```bash
npm init -y
npm install express prisma
npm install -D typescript @types/node
npm run dev
npm test
```

### Docker
```bash
docker build -t myapp .
docker run -p 3000:3000 myapp
docker-compose up -d
docker ps
```

### Database (Prisma)
```bash
npx prisma init
npx prisma migrate dev --name init
npx prisma generate
npx prisma studio
```

---

## Claude Code Marketplace Skills Integration

This skills reference is designed to enhance the capabilities of Luna Agents plugin by providing:

1. **Comprehensive Development Knowledge** - Covers full-stack development, from frontend to backend
2. **Best Practices & Patterns** - Industry-standard patterns and architectural approaches
3. **Design Guidelines** - Apple HIG principles for polished, professional UI/UX
4. **Claude Code Optimization** - Specific techniques for working effectively with Claude Code
5. **Quick Reference** - Commands and patterns for rapid development

### Integration with Luna Agents

- **Requirements Analyzer** uses this reference to validate technical requirements
- **Design Architect** applies Apple HIG principles and architectural patterns
- **Code Review** ensures adherence to best practices and security standards
- **Task Executor** implements patterns and approaches from this guide
- **Documentation Generator** creates project-specific documentation based on these standards

### Using This Reference with Claude Code

When working with Luna Agents, reference specific sections of this guide:

- `"Use the repository pattern from skills.md:line 150"`
- `"Apply Apple HIG spacing from skills.md:line 400"`
- `"Implement JWT auth as shown in skills.md:line 250"`
- `"Use the factory pattern example from skills.md:line 600"`

This creates a shared vocabulary and consistent approach across all development tasks managed by Luna Agents.