# ComunidadePsi Frontend

React + Vite + TypeScript frontend for LGPD-compliant psychology community platform.

## Quick Start

### Prerequisites
- Node.js 18+
- Backend API running on http://localhost:5000

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # VITE_API_URL should point to backend
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

App runs at `http://localhost:5173`

## Development

### Scripts
- `npm run dev` - Start Vite dev server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run test suite
- `npm run lint` - Check code quality
- `npm run typecheck` - TypeScript validation

### Project Structure
```
src/
├── components/      # React components
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── services/       # API services
├── utils/          # Utility functions
├── types/          # TypeScript types
├── styles/         # Global styles (Tailwind)
└── main.tsx        # Entry point
```

## Key Technologies

- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **React Hook Form** - Form handling
- **React Query** - Server state management
- **React Router** - Client-side routing

## Features

- Mobile-first responsive design
- LGPD compliance warnings
- Content Safety feedback
- Real-time markdown preview
- Moderation dashboard
- Dark mode support (future)

## Environment Variables

- `VITE_API_URL` - Backend API endpoint
- `VITE_APP_NAME` - Application name
- See `.env.example` for all options

## Styling

Uses **Tailwind CSS** for styling with **shadcn/ui** components.

Add new components:
```bash
npx shadcn-ui@latest add [component]
```

## Testing

```bash
npm test           # Run all tests
npm run test:watch # Watch mode
```

## Troubleshooting

### API connection errors
- Ensure backend is running on http://localhost:5000
- Check VITE_API_URL in .env
- Check browser console for CORS errors

### Port already in use
- Change port in vite.config.ts
- Or kill process: `lsof -ti:5173 | xargs kill -9`

---

**Part of ComunidadePsi squad** — LGPD-compliant, mobile-first development.
