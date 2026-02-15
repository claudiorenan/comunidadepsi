# 🚀 Guia de Setup Local - ComunidadePsi

## Checklist de Requisitos

Antes de rodar localmente, verifique se você tem:

- ✅ **Node.js 18+** → `node --version`
  - Instalado: v20.20.0 ✓
- ✅ **npm 9+** → `npm --version`
  - Instalado: 11.8.0 ✓
- ❌ **Docker & Docker Compose** → `docker --version`
  - **NÃO está instalado** ⚠️

---

## ⚠️ O Que Falta para Rodar Localmente

### 1. **Docker & Docker Compose** (OBRIGATÓRIO)

O projeto usa PostgreSQL em container Docker. Você tem 2 opções:

#### **OPÇÃO A: Instalar Docker (RECOMENDADO)**

**Windows 11 Pro/Enterprise:**
```bash
# Download Docker Desktop
https://www.docker.com/products/docker-desktop

# Depois de instalar, verifique:
docker --version
docker-compose --version
```

**macOS:**
```bash
brew install docker
brew install docker-compose
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker $USER
```

Depois instalar, reinicie o terminal.

#### **OPÇÃO B: PostgreSQL Local (Alternativa)**

Se não quiser Docker, instale PostgreSQL localmente:

**Windows:**
```bash
# Download e instale
https://www.postgresql.org/download/windows/

# Verifique
psql --version
```

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
psql --version
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
psql --version
```

---

## 📦 Passo a Passo Para Rodar Localmente

### 1️⃣ **Clone o Repositório** (já feito ✓)

```bash
cd /c/Users/cf66035/dev/comunidadePsi/comunidadepsi-project
```

### 2️⃣ **Instale Dependências**

```bash
npm install
```

**Status:** Já tem node_modules ✓
Se tiver problemas, limpe e reinstale:
```bash
rm -rf node_modules
npm install
```

### 3️⃣ **Configure o Banco de Dados**

#### **Com Docker (RECOMENDADO):**

```bash
# Inicie o PostgreSQL
docker-compose up -d postgres

# Verifique se está rodando
docker ps
```

#### **Sem Docker (PostgreSQL Local):**

```bash
# Crie o banco de dados
createdb comunidadepsi_dev

# Ou, se pediu senha:
psql -U postgres
CREATE DATABASE comunidadepsi_dev;
\q
```

Depois edite o `.env`:
```bash
# apps/api/.env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/comunidadepsi_dev
```

### 4️⃣ **Execute Migrações**

```bash
cd apps/api

# Migrate (cria tabelas)
npm run db:migrate:deploy

# Seed (insere dados de teste)
npm run db:seed

# Verifique que funcionou
npx prisma studio  # Abre http://localhost:5555
```

### 5️⃣ **Inicie o Backend**

```bash
cd apps/api
npm run dev

# Deve mostrar:
# 🚀 API running on http://localhost:5000
```

### 6️⃣ **Inicie o Frontend** (em outro terminal)

```bash
cd apps/web
npm run dev

# Deve mostrar:
# VITE v5.x.x  ready in XXX ms
# ➜  Local: http://localhost:5173/
```

### 7️⃣ **Acesse a Aplicação**

```
🌐 Frontend: http://localhost:5173
✅ Faça login com qualquer código (ex: "dev_001")
```

---

## 🔍 Verificação Rápida

Execute este script para verificar tudo:

```bash
# Verificar Node.js
echo "Node.js:" && node --version && npm --version

# Verificar Docker (se instalado)
echo "Docker:" && docker --version 2>/dev/null || echo "⚠️ Docker não instalado"

# Verificar dependências instaladas
echo "Dependencies:" && npm list --depth=0 2>&1 | head -10

# Verificar banco de dados
echo "Database:" && cd apps/api && npm run db:status 2>/dev/null || echo "Configure o banco primeiro"
```

---

## 🚨 Problemas Comuns

### "PostgreSQL connection refused"
```bash
# Verifique se PostgreSQL/Docker está rodando
docker ps                    # Se usando Docker
psql --version             # Se usando local

# Verifique a conexão
DATABASE_URL=postgresql://... npx prisma db execute "SELECT 1"
```

### "Port 5000 already in use"
```bash
# Mate o processo
lsof -ti:5000 | xargs kill -9

# Ou use porta diferente
PORT=5001 npm run dev
```

### "Port 5173 already in use"
```bash
# Mate o processo
lsof -ti:5173 | xargs kill -9

# Ou deixe Vite escolher outra porta
npm run dev  # Ele sugere porta alternativa
```

### "Module not found"
```bash
# Limpe e reinstale
rm -rf node_modules package-lock.json
npm install
```

### "Cannot find prisma"
```bash
# Reinstale Prisma
npm install @prisma/client prisma --save-dev
npx prisma generate
```

---

## 📋 Requisitos Detalhados

### **Sistema Operacional**
- Windows 10/11 Pro/Enterprise (com WSL2 ou Docker Desktop)
- macOS 10.14+
- Linux (Ubuntu 18+, Debian 10+, etc)

### **Software Necessário**
| Software | Versão | Status |
|----------|--------|--------|
| Node.js | 18+ | ✅ v20.20.0 |
| npm | 9+ | ✅ 11.8.0 |
| Docker | Latest | ❌ Não instalado |
| Git | Qualquer | ✅ Presumido instalado |

### **Disco Livre**
- Node modules: ~500 MB
- Docker image: ~300 MB
- Database: ~50 MB
- **Total: ~1 GB**

### **Memória RAM**
- Node.js: ~200 MB
- PostgreSQL: ~100 MB
- Vite dev server: ~100 MB
- **Mínimo: 2 GB livres**

---

## 🐳 Docker Setup (Passo a Passo)

Se está vindo do nada:

### 1. Instale Docker Desktop

**Windows:**
- Download: https://www.docker.com/products/docker-desktop
- Execute o instalador
- Reinicie o computador
- Abra PowerShell como admin:
  ```powershell
  docker --version
  ```

**macOS:**
- Download: https://www.docker.com/products/docker-desktop
- Abra o .dmg
- Arraste para Applications
- Abra Applications/Docker.app
- No terminal:
  ```bash
  docker --version
  ```

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
```

### 2. Verifique a Instalação

```bash
docker --version
docker ps
docker-compose --version
```

### 3. Inicie o PostgreSQL

```bash
cd /c/Users/cf66035/dev/comunidadePsi/comunidadepsi-project
docker-compose up -d postgres

# Aguarde 5-10 segundos, depois:
docker ps  # Deve mostrar o container postgres rodando
```

---

## ✨ Variáveis de Ambiente

### **Root `./.env`**
```env
EXTERNAL_API_BASE_URL=https://api.psychologists-registry.com
EXTERNAL_API_CLIENT_ID=dev_client_id
EXTERNAL_API_CLIENT_SECRET=dev_client_secret
```

### **Backend `./apps/api/.env`**
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://comunidadepsi:communitypsych123@localhost:5432/comunidadepsi_dev
JWT_SECRET=dev_jwt_secret_key_minimum_32_characters_long
JWT_REFRESH_SECRET=dev_refresh_secret_key_minimum_32_characters_long
EXTERNAL_API_BASE_URL=https://api.psychologists-registry.com
EXTERNAL_API_CLIENT_ID=dev_client_id
EXTERNAL_API_CLIENT_SECRET=dev_client_secret
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
LOG_LEVEL=debug
CONTENT_SAFETY_ENABLED=true
CONTENT_SAFETY_BLOCK_HIGH_RISK=false
```

### **Frontend `./apps/web/.env`**
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=ComunidadePsi
```

---

## 🎯 Workflow de Desenvolvimento

```bash
# Terminal 1 - Backend
cd apps/api
npm run dev
# Roda em http://localhost:5000

# Terminal 2 - Frontend
cd apps/web
npm run dev
# Roda em http://localhost:5173

# Terminal 3 (opcional) - Prisma Studio
cd apps/api
npx prisma studio
# Roda em http://localhost:5555
```

---

## ✅ Checklist Final

Antes de começar a desenvolver:

- [ ] Node.js 18+ instalado
- [ ] npm instalado
- [ ] Docker & Docker Compose instalados (ou PostgreSQL local)
- [ ] `npm install` executado
- [ ] `docker-compose up -d postgres` rodando (ou PostgreSQL local)
- [ ] `npm run db:setup` executado (migrations + seed)
- [ ] `npm run dev:backend` rodando sem erros
- [ ] `npm run dev:frontend` rodando sem erros
- [ ] http://localhost:5173 acessível
- [ ] Consegue fazer login com código "dev_001"

Se tudo passou ✅, você está pronto para desenvolver!

---

## 🆘 Precisa de Ajuda?

1. **Leia** [DEVELOPMENT.md](./DEVELOPMENT.md) para workflow detalhado
2. **Leia** [TESTING.md](./TESTING.md) para executar testes
3. **Consulte** [DEPLOYMENT.md](./DEPLOYMENT.md) para produção
4. **Verifique** logs:
   ```bash
   docker-compose logs -f postgres  # Logs do DB
   npm run dev 2>&1 | tee app.log   # Logs da app
   ```

---

**Status: Pronto para setup!** 🚀
Instale Docker (ou PostgreSQL) e siga os passos acima.
