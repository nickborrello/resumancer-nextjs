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
- **ORM:** Drizzle ORM
- **AI Integration:** OpenRouter API
- **PDF Generation:** @react-pdf/renderer
- **Payments:** Stripe
- **Monitoring:** Sentry
- **Testing:** Playwright

## Features

- ✅ **AI-Powered Resume Optimization**: Multi-step AI processing with keyword extraction, relevance scoring, and bullet point optimization
- ✅ **Resume Builder**: Full-featured resume editor with tabbed interface
- ✅ **PDF Generation**: Client-side PDF creation and download
- ✅ **Authentication**: OAuth integration (Google, GitHub, Microsoft)
- ✅ **Database Integration**: Full CRUD operations with Drizzle ORM
- ✅ **Real-time Preview**: Live resume preview while editing
- ✅ **Auto-save**: Automatic saving to localStorage and backend
- ✅ **Credit System**: AI usage tracking and billing integration
- ✅ **Admin Panel**: Administrative features and analytics

## Project Structure

```
resumancer-nextjs/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── api/               # API routes
│   │   │   ├── admin/         # Admin endpoints
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── credits/       # Credit management
│   │   │   ├── profile/       # User profile
│   │   │   ├── resumes/       # Resume CRUD operations
│   │   │   └── stripe/        # Payment processing
│   │   ├── builder/           # Resume builder pages
│   │   ├── credits/           # Credits management
│   │   ├── dashboard/         # User dashboard
│   │   ├── profile/           # User profile pages
│   │   ├── resume/            # Resume viewing/editing
│   │   └── resumes/           # Resume management
│   ├── components/            # React components
│   │   ├── resume-editor/     # Resume editor components
│   │   ├── resume-preview/    # Resume preview components
│   │   └── ui/               # shadcn/ui components
│   ├── contexts/             # React context providers
│   ├── database/             # Database schema and configuration
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions and shared logic
│   ├── services/             # API services and integrations
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Helper functions and formatters
│   └── middleware.ts         # Next.js middleware
├── public/                   # Static assets
├── tests/                    # Playwright tests
└── [config files]           # Configuration files
```

## Prerequisites

- **Node.js:** 18.x or higher
- **Package Manager:** npm, yarn, pnpm, or bun
- **Database:** PostgreSQL (production) or SQLite (development)
- **Environment Variables:** Properly configured (see Configuration section)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd resumancer-nextjs

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

### Database Setup

```bash
# Generate database schema
npm run db:generate

# Run database migrations
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in headed mode
npm run test:headed

# View test reports
npm run test:report
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Type check TypeScript without building
npm run type-check
```

## Configuration

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Database Configuration
# PostgreSQL connection string for production
# Format: postgresql://username:password@host:port/database
# Local development: Uses SQLite automatically if not set
DATABASE_URL=postgresql://username:password@localhost:5432/resumancer

# NextAuth.js v5 Configuration
# AUTH_SECRET is REQUIRED for authentication to work
# Generate with: openssl rand -base64 32
AUTH_SECRET=your-secret-key-here

# OAuth Providers - NextAuth v5 Naming Convention

# Google OAuth
# Get credentials from: https://console.cloud.google.com/apis/credentials
# Callback URL: http://localhost:3001/api/auth/callback/google
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# GitHub OAuth
# Get credentials from: https://github.com/settings/developers
# Callback URL: http://localhost:3001/api/auth/callback/github
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret

# Microsoft Entra ID (Azure AD) OAuth
# Get credentials from: https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
# Callback URL: http://localhost:3001/api/auth/callback/microsoft-entra-id
AUTH_MICROSOFT_ENTRA_ID_ID=your-microsoft-client-id
AUTH_MICROSOFT_ENTRA_ID_SECRET=your-microsoft-client-secret
AUTH_MICROSOFT_ENTRA_ID_TENANT_ID=your-microsoft-tenant-id

# OpenRouter AI API (for resume optimization)
# Get API key from: https://openrouter.ai/keys
OPENROUTER_API_KEY=your-openrouter-api-key

# Stripe Payment Processing
# Get keys from: https://dashboard.stripe.com/apikeys
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Sentry Error Monitoring
# Get DSN from: https://sentry.io/settings/projects
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### Database Configuration

The application supports both PostgreSQL (production) and SQLite (development):

- **Development:** If `DATABASE_URL` is not set, the app automatically uses SQLite
- **Production:** Set `DATABASE_URL` to your PostgreSQL connection string
- **Migrations:** Automatic on production deployment via Railway configuration

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Turbopack on port 3001 |
| `npm run build` | Build application for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint for code quality checks |
| `npm run type-check` | Type check TypeScript without building |
| `npm run db:generate` | Generate database migrations from schema |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |
| `npm run db:push` | Push schema changes directly to database |
| `npm test` | Run Playwright tests |
| `npm run test:ui` | Run tests with Playwright UI |
| `npm run test:headed` | Run tests in headed mode |
| `npm run test:report` | View Playwright test reports |

## API Routes

### Authentication (`/api/auth`)
- `GET /api/auth/providers` - Get available OAuth providers
- `POST /api/auth/signin/*` - OAuth signin callbacks
- `POST /api/auth/signout` - Sign out user

### Resumes (`/api/resumes`)
- `GET /api/resumes` - Get user's resumes
- `POST /api/resumes` - Create new resume
- `GET /api/resumes/[id]` - Get specific resume
- `PUT /api/resumes/[id]` - Update resume
- `DELETE /api/resumes/[id]` - Delete resume
- `POST /api/resumes/generate` - Generate AI-optimized resume

### AI Suggestions (`/api/resumes/ai-suggestions`)
- `POST /api/resumes/ai-suggestions` - Get AI suggestions for resume improvement

### Credits (`/api/credits`)
- `GET /api/credits` - Get user's credit balance
- `POST /api/credits/purchase` - Purchase credits

### Profile (`/api/profile`)
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Admin (`/api/admin`)
- Administrative endpoints for analytics and user management

## Key Components

### Resume Editor
- **Location:** `src/components/resume-editor/`
- **Features:** Tabbed interface, form validation, auto-save, AI suggestions
- **Components:** PersonalInfoSection, ExperienceSection, EducationSection, etc.

### AI Services
- **Location:** `src/services/`
- **Services:** OpenRouter integration for AI-powered resume optimization
- **Features:** Keyword extraction, relevance scoring, bullet optimization

### Database
- **Location:** `src/database/`
- **Schema:** Complete database schema with relations
- **ORM:** Drizzle ORM with type-safe queries

## Deployment

### Production Deployment
- **Platform:** Railway (recommended)
- **Database:** PostgreSQL on Railway
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Environment:** Production environment variables

### Development Deployment
- **Local:** SQLite database (automatic fallback)
- **Port:** 3001
- **Hot Reload:** Enabled with Turbopack

## Troubleshooting

### Port Conflicts
```bash
# Check what's using port 3001
netstat -ano | findstr :3001

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or use the kill-port utility
npx kill-port 3001
```

### Database Issues
```bash
# Reset database (development only)
npm run db:push

# View database in browser
npm run db:studio

# Check migration status
npm run db:migrate
```

### Authentication Issues
- Verify `AUTH_SECRET` is set and secure
- Check OAuth provider credentials are correct
- Ensure callback URLs match provider configuration
- Check browser console for authentication errors

### AI Service Issues
- Verify `OPENROUTER_API_KEY` is set
- Check API rate limits and credits
- Review OpenRouter dashboard for usage

### Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

## Development Workflow

### Code Style
- **TypeScript:** Strict mode enabled
- **Components:** Functional components with hooks
- **Styling:** Tailwind CSS with custom Amethyst theme
- **Forms:** React Hook Form with Zod validation
- **State:** React Context for global state

### Git Workflow
- **Branching:** Feature branches from `main`
- **Commits:** Conventional commit format
- **PRs:** Required for all changes
- **Testing:** Automated tests before merge

### Performance
- **Server Components:** Used by default in Next.js 13+
- **Client Components:** Only when needed (marked with `'use client'`)
- **Optimization:** Automatic code splitting and optimization

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes with proper TypeScript types
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Run linting: `npm run lint`
7. Commit with conventional format
8. Push and create a Pull Request

## License

[Your License Here]

## Support

For questions or issues:
- Check existing GitHub issues
- Review the troubleshooting section above
- Contact the development team

---

**Last Updated:** November 11, 2025
**Status:** Production Ready
