# ComunidadePsi Backend API

Node.js + Express + TypeScript backend for LGPD-compliant psychology community platform.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker (optional)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and API credentials
   ```

3. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

Server runs at `http://localhost:5000`

## Development

### Scripts
- `npm run dev` - Start with hot reload
- `npm run build` - Compile TypeScript
- `npm start` - Run compiled code
- `npm test` - Run test suite
- `npm run lint` - Check code quality
- `npm run typecheck` - TypeScript validation
- `npm run db:migrate` - Run migrations

### Project Structure
```
src/
├── controllers/     # HTTP request handlers
├── services/        # Business logic
├── middleware/      # Express middleware
├── utils/          # Utility functions
├── types/          # Type definitions
├── config/         # Configuration
└── index.ts        # Entry point
```

## API Documentation

See main README for complete endpoint list and authentication details.

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing
- `EXTERNAL_API_BASE_URL` - External psychologist API URL
- `NODE_ENV` - Environment (development/production)

See `.env.example` for all variables.

## Testing

```bash
npm test           # Run all tests
npm run test:watch # Watch mode
```

## Troubleshooting

### Database connection issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Run migrations: `npm run db:migrate`

### Port already in use
- Change PORT in .env
- Or kill process on 5000: `lsof -ti:5000 | xargs kill -9`

---

**Part of ComunidadePsi squad** — LGPD-compliant, security-first development.
