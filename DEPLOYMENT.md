# Deployment Guide - ComunidadePsi

Complete guide for deploying ComunidadePsi to production environments.

## Pre-Deployment Checklist

- [ ] All tests pass with 70%+ coverage
- [ ] Linting passes without warnings
- [ ] TypeScript compiles without errors
- [ ] Build produces no errors
- [ ] Environment variables are configured
- [ ] Database migrations are tested
- [ ] Security review completed
- [ ] Performance benchmarks reviewed

## Environment Configuration

### Development (.env)

```bash
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/db_dev

# JWT
JWT_SECRET=dev_secret_minimum_32_characters_long
JWT_REFRESH_SECRET=dev_refresh_secret_minimum_32_characters_long

# External API
EXTERNAL_API_BASE_URL=https://api.test.com
EXTERNAL_API_CLIENT_ID=test_client
EXTERNAL_API_CLIENT_SECRET=test_secret

# Security
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
LOG_LEVEL=debug

# Content Safety
CONTENT_SAFETY_ENABLED=true
CONTENT_SAFETY_BLOCK_HIGH_RISK=false  # Allow warnings only in dev
```

### Production (.env.production)

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@db.example.com:5432/db_prod

# JWT - Use strong, random secrets!
JWT_SECRET=<generate with: openssl rand -base64 32>
JWT_REFRESH_SECRET=<generate with: openssl rand -base64 32>

# External API
EXTERNAL_API_BASE_URL=https://api.psychologists.registry.com
EXTERNAL_API_CLIENT_ID=<from provider>
EXTERNAL_API_CLIENT_SECRET=<from provider>

# Security - Restrict CORS to your domain
CORS_ORIGIN=https://comunidadepsi.com.br,https://app.comunidadepsi.com.br

# Logging
LOG_LEVEL=info

# Content Safety
CONTENT_SAFETY_ENABLED=true
CONTENT_SAFETY_BLOCK_HIGH_RISK=true
CONTENT_SAFETY_RISK_THRESHOLD_HIGH=80
CONTENT_SAFETY_RISK_THRESHOLD_MEDIUM=50
```

### Generating Secure Secrets

```bash
# Generate JWT secrets
openssl rand -base64 32

# Or using node
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Docker Deployment

### Build Images

```bash
# Build all services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Or individually
docker build -f Dockerfile.api -t comunidadepsi-api:latest .
docker build -f Dockerfile.web -t comunidadepsi-web:latest .
```

### Docker Compose Production

```yaml
# docker-compose.prod.yml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: comunidadepsi
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: comunidadepsi_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U comunidadepsi"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - comunidadepsi

  api:
    image: comunidadepsi-api:latest
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://comunidadepsi:${DB_PASSWORD}@postgres:5432/comunidadepsi_prod
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      EXTERNAL_API_BASE_URL: ${EXTERNAL_API_BASE_URL}
      EXTERNAL_API_CLIENT_ID: ${EXTERNAL_API_CLIENT_ID}
      EXTERNAL_API_CLIENT_SECRET: ${EXTERNAL_API_CLIENT_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN}
    depends_on:
      postgres:
        condition: service_healthy
    restart: always
    networks:
      - comunidadepsi
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  web:
    image: comunidadepsi-web:latest
    environment:
      VITE_API_URL: ${API_URL}
    restart: always
    networks:
      - comunidadepsi
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5173"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - api
      - web
    restart: always
    networks:
      - comunidadepsi

volumes:
  postgres_data:
    driver: local

networks:
  comunidadepsi:
    driver: bridge
```

### Deploy with Docker Compose

```bash
# Set environment variables
export JWT_SECRET=$(openssl rand -base64 32)
export JWT_REFRESH_SECRET=$(openssl rand -base64 32)
export DB_PASSWORD=$(openssl rand -base64 16)
export API_URL=https://api.comunidadepsi.com.br
export CORS_ORIGIN=https://comunidadepsi.com.br,https://app.comunidadepsi.com.br

# Pull latest images
docker-compose pull

# Run migrations
docker-compose run --rm api npm run db:migrate:deploy

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f api web postgres
```

## GitHub Actions CI/CD

### .github/workflows/test.yml

```yaml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm install

      - name: Backend Tests
        run: cd apps/api && npm test -- --coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Frontend Tests
        run: cd apps/web && npm test -- --coverage

      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./apps/api/coverage/lcov.info,./apps/web/coverage/lcov.info
```

### .github/workflows/build.yml

```yaml
name: Build & Push

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest

    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v3

      - uses: docker/setup-buildx-action@v2

      - uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/build-push-action@v4
        with:
          context: .
          file: ./Dockerfile.api
          push: true
          tags: ghcr.io/${{ github.repository }}/api:latest
          tags: ghcr.io/${{ github.repository }}/api:${{ github.sha }}

      - uses: docker/build-push-action@v4
        with:
          context: .
          file: ./Dockerfile.web
          push: true
          tags: ghcr.io/${{ github.repository }}/web:latest
          tags: ghcr.io/${{ github.repository }}/web:${{ github.sha }}
```

### .github/workflows/deploy.yml

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    needs: [test, build]

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Production
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
          DEPLOY_HOST: ${{ secrets.DEPLOY_HOST }}
          DEPLOY_USER: ${{ secrets.DEPLOY_USER }}
        run: |
          mkdir -p ~/.ssh
          echo "$DEPLOY_KEY" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -H $DEPLOY_HOST >> ~/.ssh/known_hosts

          ssh -i ~/.ssh/deploy_key $DEPLOY_USER@$DEPLOY_HOST << 'EOF'
          cd /home/app/comunidadepsi
          git pull origin main
          docker-compose -f docker-compose.prod.yml pull
          docker-compose -f docker-compose.prod.yml up -d
          docker-compose -f docker-compose.prod.yml exec -T api npm run db:migrate:deploy
          EOF
```

## Manual Deployment

### Prerequisites

- Server with Docker, Docker Compose, and Git
- SSL certificate (Let's Encrypt recommended)
- Domain name
- Database backup strategy

### Step-by-Step

```bash
# 1. SSH into server
ssh user@your-server.com

# 2. Clone repository
git clone https://github.com/your-org/comunidadepsi.git
cd comunidadepsi

# 3. Create .env.production
cat > .env.production << EOF
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 16)
# ... other variables
EOF

# 4. Build images
docker-compose build

# 5. Run migrations
docker-compose run --rm api npm run db:migrate:deploy
docker-compose run --rm api npm run db:seed  # Only first time!

# 6. Start services
docker-compose up -d

# 7. Verify health
curl -f http://localhost:5000/health
curl -f http://localhost:5173
```

## Monitoring & Maintenance

### Health Checks

```bash
# Check API
curl https://api.comunidadepsi.com.br/health

# Check Frontend
curl https://comunidadepsi.com.br

# Check database
docker-compose exec postgres pg_isready
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f postgres
```

### Database Backups

```bash
# Create backup
docker-compose exec postgres pg_dump -U comunidadepsi comunidadepsi_prod > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U comunidadepsi comunidadepsi_prod < backup.sql

# Schedule daily backup (crontab)
0 2 * * * docker-compose -f /home/app/docker-compose.prod.yml exec -T postgres pg_dump -U comunidadepsi comunidadepsi_prod > /home/app/backups/backup-$(date +\%Y\%m\%d).sql
```

### Update Services

```bash
# Update images
docker-compose pull

# Run migrations
docker-compose exec api npm run db:migrate:deploy

# Restart services
docker-compose up -d

# View status
docker-compose ps
```

## Security Considerations

1. **Secrets Management:**
   - Never commit .env files
   - Use GitHub Secrets for CI/CD
   - Rotate secrets regularly

2. **Database:**
   - Use strong passwords
   - Enable SSL connections
   - Regular backups
   - Restrict network access

3. **API Security:**
   - Rate limiting (already configured)
   - CORS restrictions
   - HTTPS only in production
   - Input validation (Zod schemas)

4. **Content Safety:**
   - CONTENT_SAFETY_ENABLED=true
   - CONTENT_SAFETY_BLOCK_HIGH_RISK=true
   - Monitor moderation reports

## Troubleshooting

### Migrations Failed

```bash
# Check migration status
docker-compose exec api npx prisma migrate status

# Reset migrations (dev only!)
docker-compose exec api npx prisma migrate reset

# Check logs
docker-compose logs api
```

### High Memory Usage

```bash
# Check Docker stats
docker stats

# Limit container memory in docker-compose.yml:
services:
  api:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### Performance Issues

- Check database queries: `npx prisma studio`
- Monitor API response times
- Review React performance profiler
- Scale horizontally with multiple instances

## Rollback Procedure

```bash
# Revert to previous version
git revert HEAD --no-edit
git push origin main

# Or checkout specific commit
git checkout <commit-hash>
git push origin main -f  # Force push (use carefully!)

# Revert database migrations
docker-compose exec api npx prisma migrate resolve --rolled-back <migration-name>
```

## Support & Resources

- **Documentation:** See README.md and DEVELOPMENT.md
- **Issues:** GitHub Issues
- **Community:** GitHub Discussions
- **Security:** See SECURITY.md for reporting vulnerabilities
