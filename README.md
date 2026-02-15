# ComunidadePsi - LGPD-Compliant Professional Network for Psychologists

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![Test Coverage](https://img.shields.io/badge/coverage-70%2B%25-brightgreen)
![Node](https://img.shields.io/badge/node-18%2B-brightgreen)

A full-stack platform enabling psychologists to safely share clinical challenges and participate in professional debates with built-in LGPD compliance and content safety features.

## ✨ Key Features

- 🔐 **Secure Authentication** - OAuth integration with psychologist registry
- 📝 **Clinical Challenges** - Share and seek guidance on difficult cases
- 💬 **Professional Debates** - Engage in constructive discussions
- 🛡️ **Content Safety** - Automatic detection of sensitive personal data (LGPD)
- ⚖️ **Moderation** - Admin tools with complete audit trails
- 🧪 **Tested** - 70%+ test coverage with CI/CD pipeline
- 🐳 **Docker Ready** - Production-grade containerization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Development

1. **Clone and setup:**
   ```bash
   git clone <repo>
   cd comunidadepsi-project
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with external API credentials
   ```

3. **Start with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

   Services available:
   - **API:** http://localhost:5000
   - **Web:** http://localhost:5173
   - **Database:** postgresql://localhost:5432

4. **Run migrations:**
   ```bash
   docker-compose exec api npm run db:migrate
   ```

### Local Development (without Docker)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup PostgreSQL:**
   ```bash
   # On macOS with Homebrew:
   brew install postgresql
   createdb comunidadepsi_dev
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Set DATABASE_URL=postgresql://localhost:5432/comunidadepsi_dev
   ```

4. **Run migrations:**
   ```bash
   npm run db:migrate -w apps/api
   ```

5. **Start dev servers:**
   ```bash
   npm run dev  # Runs all workspaces in parallel
   ```

## Project Structure

```
comunidadepsi-project/
├── apps/
│   ├── api/           # Node.js + Express backend
│   └── web/           # React + Vite frontend
├── packages/
│   └── shared/        # Shared types & validators
├── docker-compose.yml # Multi-service orchestration
├── Dockerfile.api     # API container
├── Dockerfile.web     # Web container
└── package.json       # Root workspace config
```

## Available Scripts

### Root Commands
```bash
npm run dev           # Start all services with hot reload
npm run build         # Build all workspaces
npm test              # Run all tests
npm run lint          # Lint all workspaces
npm run typecheck     # Type check all workspaces
npm run setup         # Install deps + typecheck
npm run clean         # Clean all dist + node_modules
```

### Workspace Commands
```bash
npm run dev -w apps/api       # Start backend only
npm run dev -w apps/web       # Start frontend only
npm run build -w packages/shared  # Build shared types
npm test -w apps/api          # Test backend
```

## Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT + External API integration
- **Security:** bcryptjs, helmet, cors, express-rate-limit

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Library:** shadcn/ui
- **Form:** React Hook Form + Zod
- **State:** React Query + React Context
- **Routing:** React Router

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **Version Control:** Git
- **Package Management:** npm workspaces

## Key Features

✅ **LGPD Compliance**
- Content Safety module detects sensitive patient data
- Mandatory user warnings and confirmations
- Audit trail for all moderation actions
- Data minimization strategy

✅ **Security**
- OAuth integration with external API
- JWT token management
- RBAC (psychologist | moderator | admin)
- Rate limiting
- Input validation (Zod)

✅ **Moderation**
- Report system for inappropriate content
- Moderation queue
- Admin dashboard
- Complete audit trail

✅ **Mobile-First UI**
- Responsive React components
- shadcn/ui component library
- Tailwind CSS styling
- Accessibility (WCAG 2.1 AA)

## Database

### Schema
- **User** - Psychologist profiles (synced with external API)
- **Post** - Clinical challenges or debate topics
- **Comment** - Discussion on posts
- **Report** - Content reports/denúncias
- **ModerationAction** - Audit trail of moderation

### Migrations
```bash
# Create new migration
npm run db:migrate -w apps/api

# Seed development data
npm run db:seed -w apps/api
```

## Authentication

1. **User clicks "Entrar"**
2. **Redirects to external API login**
3. **Exchange authorization code for tokens**
4. **Sync psychologist profile**
5. **Generate JWT for platform**
6. **Store tokens in httpOnly cookies**

See `apps/api/README.md` for detailed authentication flow.

## API Endpoints

### Authentication
- `POST /auth/login` - Login with authorization code
- `POST /auth/logout` - Logout and clear tokens
- `GET /auth/me` - Get current user profile

### Posts
- `GET /posts` - List posts (with filters)
- `POST /posts` - Create new post
- `GET /posts/:id` - Get post details
- `PATCH /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post

### Comments
- `GET /posts/:id/comments` - List comments
- `POST /posts/:id/comments` - Create comment
- `PATCH /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment

### Moderation
- `POST /reports` - Report content
- `GET /moderation/reports` - List reports (moderators only)
- `POST /moderation/actions` - Take moderation action
- `GET /moderation/history` - View action history

## Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm test -- --coverage
```

## Code Quality

```bash
# Linting
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run typecheck

# Format code
npm run format
```

## Troubleshooting

### Port already in use
```bash
# Kill process on port 5000 (API)
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173 (Web)
lsof -ti:5173 | xargs kill -9
```

### Database connection errors
```bash
# Check PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs postgres

# Reset database
docker-compose down -v  # Remove volumes
docker-compose up       # Recreate
```

### Dependencies issues
```bash
# Clean and reinstall
npm run clean
npm install
npm run setup
```

## Contributing

1. Create feature branch
2. Make changes
3. Run tests: `npm test`
4. Lint: `npm run lint`
5. Commit with conventional messages
6. Push and create PR

## 📚 Documentation

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development setup, workflow, debugging
- **[TESTING.md](./TESTING.md)** - Testing, linting, quality gates (70%+ coverage)
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment, CI/CD, monitoring
- Backend: See `apps/api/README.md`
- Frontend: See `apps/web/README.md`
- Shared Types: See `packages/shared/README.md`

## Deployment

### Docker Compose (Development)
```bash
docker-compose up --build
```

### Docker Compose (Production)
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

See deployment guides for cloud hosting (AWS, DigitalOcean, etc).

## LGPD Compliance

This platform follows strict LGPD requirements:

1. ✅ No patient data collection
2. ✅ Content Safety module with pattern detection
3. ✅ Mandatory warnings and user confirmations
4. ✅ Moderation system with audit trail
5. ✅ Data minimization strategy
6. ✅ Secure token storage
7. ✅ Rate limiting and abuse prevention

See squad documentation for full LGPD checklist.

## License

[Add your license here]

## Support

For issues and questions:
- Check documentation in `/README.md` files
- Review GitHub issues
- Contact development team

---

**Built with Synkra AIOS Squad** — Task-first, security-first development.
🏗️ Always building, always secure.
