# Resumancer - Next.js Frontend

Modern Next.js 16+ frontend for Resumancer application, featuring AI-powered resume optimization, PDF generation, and necromancer dark theme.

## Tech Stack

- **Framework:** Next.js 16+ (App Router with Turbopack)
- **Language:** TypeScript 5+ (strict mode)
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4
- **Components:** shadcn/ui (Radix UI primitives)
- **Authentication:** NextAuth.js v5 (OAuth-only)
- **Database:** PostgreSQL (production) / SQLite (development)

## Project Structure

```
resumancer-nextjs/
├── src/
│   ├── app/              # Next.js App Router pages and layouts
│   ├── components/       # React components
│   │   └── ui/          # shadcn/ui components
│   ├── lib/             # Utility functions and shared logic
│   ├── types/           # TypeScript type definitions
│   ├── contexts/        # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API services and integrations
│   └── utils/           # Helper functions and formatters
├── public/              # Static assets
└── [config files]       # Configuration files
```

## Prerequisites

- **Node.js:** 18.x or higher
- **Package Manager:** npm, yarn, pnpm, or bun
- **Backend API:** Express server running on port 3000
- **Environment Variables:** Properly configured (see Configuration section)

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

## Development

### Start Development Server

```bash
# Start Next.js development server (port 3001)
npm run dev
```

The application will be available at [http://localhost:3001](http://localhost:3001)

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Type check TypeScript without building
npm run type-check
```

## Configuration

### Port Configuration

- **Next.js App:** Port 3001 (configured in package.json dev script)
- **Backend API:** Port 3000 (Express server)
- **Legacy Vite App:** Port 5173 (during incremental migration)

All three servers can run simultaneously during the migration phase.

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Backend API Configuration
BACKEND_API_URL=http://localhost:3000

# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-here

# OAuth Providers (placeholders - replace with real credentials)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

**Note:** OAuth credentials are placeholders for development. Real credentials must be configured before testing authentication flows.

## Migration Strategy

This Next.js application is part of an incremental migration from a Vite/React application. Key migration approach:

- **Page-by-page migration:** Core pages migrated individually while maintaining functionality
- **Coexistence:** Both apps can run simultaneously for A/B testing and gradual rollout
- **Authentication upgrade:** Replacing Supabase auth with NextAuth.js v5 OAuth-only system
- **Component library:** Migrating custom components to shadcn/ui with necromancer theme
- **Type safety:** Adding comprehensive TypeScript strict mode coverage

## Development Workflow

### Multi-App Development

During migration, you may need to run multiple servers:

```bash
# Terminal 1: Backend API
cd resumancer-backend
npm run dev  # Runs on port 3000

# Terminal 2: New Next.js App  
cd resumancer-nextjs
npm run dev  # Runs on port 3001

# Terminal 3: Legacy Vite App (optional)
cd resumancer-frontend  
npm run dev  # Runs on port 5173
```

### Testing Strategy

- Test new pages in Next.js app (port 3001)
- Compare with existing Vite app (port 5173) for feature parity
- Verify API integration with backend (port 3000)
- Gradually migrate users from Vite to Next.js

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Turbopack on port 3001 |
| `npm run build` | Build application for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint for code quality checks |
| `npm run type-check` | Type check TypeScript without building |

## Troubleshooting

### Port Conflicts

**Problem:** Port 3001 already in use  
**Solution:** 
- Check for running processes: `netstat -ano | findstr :3001`
- Kill process or change port in package.json dev script

### Development Server Won\'t Start

**Problem:** Server fails to start  
**Solution:**
- Verify Node.js version (18+): `node --version`
- Clear cache and reinstall: `rm -rf node_modules .next && npm install`
- Check for TypeScript errors: `npm run type-check`

### API Proxy Not Working

**Problem:** Frontend can\'t reach backend API  
**Solution:**
- Verify backend is running on port 3000
- Check `next.config.js` rewrite configuration
- Verify environment variable `BACKEND_API_URL` is set correctly
- Check browser console for CORS errors

### Environment Variables Not Loading

**Problem:** Environment variables undefined  
**Solution:**
- Ensure `.env.local` exists in project root
- Restart development server after changing environment variables
- Verify variable names start with `NEXT_PUBLIC_` for client-side access (if needed)
- Check for syntax errors in `.env.local` file

## Next Steps

After initial setup, the following tasks are planned:

1. **TypeScript Strict Mode:** Configure comprehensive strict mode settings (Task 1.2)
2. **shadcn/ui Integration:** Install and configure component library (Task 1.3)
3. **Routing Architecture:** Set up route groups and layouts (Task 1.4)
4. **NextAuth.js:** Implement OAuth authentication (Phase 2)
5. **Page Migration:** Migrate core pages from Vite app (Phase 3)
6. **Necromancer Theme:** Implement custom dark Gothic theme (Phase 5)

## Contributing

This is a managed migration project. Please follow the established patterns and conventions:

- Use TypeScript strict mode
- Follow Next.js App Router patterns (Server Components by default)
- Apply necromancer theme styling consistently
- Maintain comprehensive documentation
- Write tests for critical functionality

## License

[Your License Here]

## Support

For questions or issues, contact the development team or refer to the project documentation in the `.apm` directory.
