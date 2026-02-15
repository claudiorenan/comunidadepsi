# Development Guide - ComunidadePsi

Complete guide for developing features, debugging, and contributing to ComunidadePsi.

## Project Structure

```
comunidadepsi-project/
├── apps/
│   ├── api/                 # Express.js backend
│   │   ├── src/
│   │   │   ├── routes/      # API endpoints
│   │   │   ├── services/    # Business logic
│   │   │   ├── middleware/  # Express middleware
│   │   │   ├── config/      # Configuration
│   │   │   └── utils/       # Utilities
│   │   ├── prisma/          # Database
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── package.json
│   │
│   └── web/                 # React frontend
│       ├── src/
│       │   ├── pages/       # Route pages
│       │   ├── components/  # Reusable components
│       │   ├── hooks/       # Custom React hooks
│       │   ├── context/     # Context providers
│       │   └── services/    # API clients
│       └── package.json
│
├── packages/
│   └── shared/              # Shared types
│       ├── src/
│       │   ├── types/
│       │   └── validators/
│       └── package.json
│
└── docker-compose.yml       # Local dev environment
```

## Getting Started

### Prerequisites

- Node.js 18+ (check: `node --version`)
- npm 9+ or yarn
- Docker & Docker Compose (for database)

### Initial Setup

```bash
# Clone repository
git clone <repo>
cd comunidadepsi-project

# Install dependencies
npm install

# Setup database
docker-compose up -d postgres

# Run migrations
cd apps/api
npm run db:migrate:deploy
npm run db:seed
```

### Start Development Servers

**Terminal 1 - Backend:**
```bash
cd apps/api
npm run dev
# API runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
npm run dev
# UI runs on http://localhost:5173
```

## Development Workflow

### Adding a New Feature

1. **Create a story/task** (if using project management)
2. **Create a feature branch:** `git checkout -b feat/feature-name`
3. **Implement on backend:** API routes + database changes
4. **Implement on frontend:** Pages + components
5. **Write tests:** Aim for 70%+ coverage
6. **Test locally:** Run tests, lint, typecheck
7. **Submit PR:** Reference the story/task

### Database Changes

```bash
cd apps/api

# Create new migration
npm run db:migrate:dev -- --name add_new_field

# View migration status
npx prisma migrate status

# Reset database (dev only!)
npx prisma migrate reset

# Inspect database
npx prisma studio
```

### Adding New API Endpoints

1. **Define types** in `packages/shared/src/types/index.ts`
2. **Create route** in `apps/api/src/routes/`
3. **Add service** if needed in `apps/api/src/services/`
4. **Register route** in `apps/api/src/index.ts`
5. **Write tests** in `*.test.ts` next to the route
6. **Test with curl/Postman:**

```bash
curl -X GET http://localhost:5000/posts \
  -H "Authorization: Bearer <token>"
```

### Adding Frontend Pages

1. **Create page** in `apps/web/src/pages/`
2. **Add route** in `apps/web/src/App.tsx`
3. **Create components** in `apps/web/src/components/` if reusable
4. **Use hooks** for API calls:

```typescript
import { useApi } from '../hooks/useApi'

function MyPage() {
  const { data, loading, error, get } = useApi()

  useEffect(() => {
    get('/api/endpoint')
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <div>Error: {error}</div>

  return <div>{/* render data */}</div>
}
```

## Testing

### Write Tests First (TDD)

```typescript
// Example: auth.test.ts
describe('Authentication', () => {
  it('should login with valid code', async () => {
    const response = await api.post('/auth/login', { code: 'valid_code' })
    expect(response.status).toBe(200)
    expect(response.data).toHaveProperty('accessToken')
  })

  it('should fail without code', async () => {
    const response = await api.post('/auth/login', {})
    expect(response.status).toBe(400)
  })
})
```

### Run Tests

```bash
# Backend
cd apps/api && npm test

# Frontend
cd apps/web && npm test

# With coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

## Debugging

### Backend Debugging

```bash
# Enable debug logging
export AIOS_DEBUG=true
npm run dev

# Or use Node inspector
node --inspect-brk dist/index.js

# Then open chrome://inspect in Chrome
```

### Frontend Debugging

1. **React DevTools:** Install browser extension
2. **Console:** Open DevTools (F12)
3. **Network Tab:** Monitor API calls
4. **Performance:** Check React profiler

### Database Debugging

```bash
# View database in browser UI
cd apps/api
npx prisma studio

# Then open http://localhost:5555
```

## Common Tasks

### Format Code

```bash
npm run format      # Auto-format
npm run lint:fix    # Fix lint issues
```

### Check Quality

```bash
npm run lint        # Lint check
npm run typecheck   # TypeScript check
npm test -- --coverage # Test with coverage
npm run build       # Production build
```

### View Logs

```bash
# Backend logs
tail -f ~/.aios/logs/api.log

# Database logs
docker-compose logs -f postgres

# Frontend errors (in browser console)
```

### Reset Everything

```bash
# Reset database
cd apps/api
npx prisma migrate reset

# Clear cache
npm run clean

# Reinstall dependencies
rm -rf node_modules && npm install
```

## API Documentation

### Authentication

**Login (POST /auth/login)**
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code": "dev_001"}'

# Response:
# {
#   "user": { ... },
#   "accessToken": "...",
#   "refreshToken": "..."
# }
```

**Get Profile (GET /auth/me)**
```bash
curl -X GET http://localhost:5000/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

### Posts

**List Posts (GET /posts)**
```bash
curl "http://localhost:5000/posts?page=1&limit=10&type=challenge"
```

**Create Post (POST /posts)**
```bash
curl -X POST http://localhost:5000/posts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "challenge",
    "title": "...",
    "content": "...",
    "tags": ["tag1", "tag2"]
  }'
```

### Safety Checks

All POST/PATCH to /posts and /comments are automatically scanned for sensitive data:

```json
{
  "riskLevel": "high",
  "score": 85,
  "flags": [
    {
      "type": "cpf",
      "message": "Número de CPF detectado",
      "count": 1
    }
  ],
  "suggestions": ["❌ Não compartilhe números de CPF"]
}
```

## Troubleshooting

### "Database connection failed"
```bash
# Check if Postgres is running
docker-compose ps

# Restart it
docker-compose restart postgres

# Check connection string in .env
echo $DATABASE_URL
```

### "Port already in use"
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm run dev
```

### "Module not found"
```bash
# Clear and reinstall
npm run clean
npm install

# Check path aliases in tsconfig.json
```

### "Test timeouts"
```bash
# Increase timeout in vitest.config.ts
test: {
  testTimeout: 20000  // 20 seconds
}
```

## Performance Tips

1. **Use React.memo** for expensive components
2. **Lazy load routes:** `const Feed = lazy(() => import('./Feed'))`
3. **Optimize queries:** Use indexes, pagination
4. **Cache API responses:** Consider SWR or React Query
5. **Minimize bundle:** Check `npm run build`

## Deployment Checklist

- [ ] All tests pass: `npm test -- --coverage`
- [ ] Linting passes: `npm run lint`
- [ ] TypeScript passes: `npm run typecheck`
- [ ] Build succeeds: `npm run build`
- [ ] Environment variables set: `.env.production`
- [ ] Database migrations run: `npm run db:migrate:deploy`
- [ ] No console errors or warnings
- [ ] Performance acceptable (PageSpeed Insights)

## Further Help

- **Backend Issues:** See `apps/api/README.md`
- **Frontend Issues:** See `apps/web/README.md`
- **Database:** See `TESTING.md` and Prisma docs
- **Deployment:** See deployment guide (Phase 5)

## Quick Commands Reference

```bash
# Setup
npm install && docker-compose up -d postgres && npm run db:setup

# Development
npm run dev:backend & npm run dev:frontend

# Quality
npm run lint && npm run typecheck && npm test

# Database
npm run db:migrate:dev && npm run db:seed && npx prisma studio

# Debugging
export DEBUG=* && npm run dev

# Reset
npm run clean && rm -rf node_modules && npm install
```
