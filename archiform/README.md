# Archiform — Frontend

A production-grade Next.js 14 frontend for an Architecture & Engineering firm project management SaaS — inspired by Monograph.

---

## 🗂️ Project Structure

```
archiform/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Marketing landing page
│   ├── layout.tsx                # Root layout (fonts, metadata)
│   ├── globals.css               # Design system + Tailwind base
│   ├── auth/
│   │   ├── get-started/page.tsx  # Onboarding Step 1 & 2 (email + profile form)
│   │   ├── create-account/page.tsx # Onboarding Step 3 (password + testimonial panel)
│   │   └── login/page.tsx        # Login page
│   ├── dashboard/
│   │   ├── layout.tsx            # App layout (sidebar + trial banner)
│   │   └── page.tsx              # Dashboard with KPIs, charts, project health
│   └── projects/
│       ├── layout.tsx            # Projects layout
│       └── page.tsx              # Projects list + filters + new project modal
│
├── components/
│   ├── ui/                       # Reusable design system components
│   │   ├── button.tsx            # Button with variants (primary/outline/ghost/navy)
│   │   ├── input.tsx             # Input with label, error, hint, icons
│   │   ├── select.tsx            # Select dropdown
│   │   ├── badge.tsx             # Status badges (success/warning/danger/new)
│   │   ├── card.tsx              # Card with header/content/footer
│   │   ├── progress.tsx          # Progress bar with auto variant colors
│   │   └── avatar.tsx            # Avatar with initials fallback + color hash
│   ├── marketing/                # Marketing/landing page sections
│   │   ├── nav.tsx               # Sticky navbar with mega dropdowns + mobile menu
│   │   ├── hero.tsx              # Hero section with animated counters + dashboard card
│   │   ├── testimonials.tsx      # Testimonials carousel with stats
│   │   ├── features.tsx          # Tabbed feature showcase
│   │   ├── faq.tsx               # Accordion FAQ
│   │   └── footer.tsx            # Full multi-column footer
│   └── app/                      # App (dashboard) components
│       ├── sidebar.tsx           # Dark navy sidebar with nav + timer + user
│       └── trial-banner.tsx      # Floating trial expiration bar
│
├── lib/
│   ├── utils.ts                  # cn(), formatCurrency(), formatDate(), etc.
│   └── mock-data.ts              # Full mock data (projects, staff, invoices, metrics)
│
├── types/
│   └── index.ts                  # All TypeScript types (User, Project, Invoice, etc.)
│
├── package.json
├── tailwind.config.ts            # Full design system (brand colors, animations, etc.)
├── tsconfig.json
└── next.config.js
```

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open in browser
# http://localhost:3000          → Landing page
# http://localhost:3000/auth/get-started  → Onboarding
# http://localhost:3000/dashboard         → App dashboard
# http://localhost:3000/projects          → Projects
```

---

## 🎨 Design System

### Colors
| Token | Value | Usage |
|---|---|---|
| `brand-500` | `#6c5ce7` | Primary purple — buttons, links, active states |
| `navy-950` | `#090e1a` | Dark navy — sidebar, headings |
| `navy-900` | `#0e1628` | Slightly lighter navy |
| Background | `#f4f5f9` | App background (light gray-blue) |

### Typography
- **Display font**: DM Serif Display (headings, numbers)
- **Body font**: DM Sans (body text, UI)
- **Mono font**: JetBrains Mono (code, timer)

### Key CSS Classes (globals.css)
```css
.heading-xl        /* 5xl-7xl display heading */
.heading-lg        /* 3xl-5xl display heading */
.btn-brand         /* Primary purple button */
.btn-brand-lg      /* Large primary button */
.app-sidebar       /* Fixed dark navy sidebar */
.app-main          /* Main content with sidebar offset */
.app-topbar        /* Sticky page top bar */
.kpi-card          /* KPI metric card */
.sidebar-item      /* Sidebar nav item with active state */
.filter-chip       /* Filter dropdown button */
.section-grid-bg   /* Grid pattern background */
.gradient-text     /* Purple gradient text */
```

---

## 📱 Pages

| Route | Description |
|---|---|
| `/` | Marketing landing page |
| `/auth/get-started` | Multi-step onboarding (email → profile → account) |
| `/auth/create-account` | Password creation with testimonial panel |
| `/auth/login` | Login page |
| `/dashboard` | Insights dashboard with KPIs, revenue chart, team utilization |
| `/projects` | Project list with filters + new project modal |

---

## 🔌 Connecting to Spring Boot Backend

When your Spring Boot + GraphQL backend is ready, replace mock data with real API calls:

### 1. Install Apollo Client
```bash
npm install @apollo/client graphql
```

### 2. Create Apollo Provider (`lib/apollo-client.ts`)
```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8080/graphql',
})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('archiform_token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})
```

### 3. Example GraphQL Query
```typescript
const GET_DASHBOARD = gql`
  query GetDashboard($firmId: ID!) {
    dashboardMetrics(firmId: $firmId) {
      estimatedOperatingProfit
      utilizationRate
      projectedOperatingProfit
      projectedFirmCapacity
      revenueByMonth { month revenue expenses profit }
    }
  }
`
```

### 4. Environment Variables (`.env.local`)
```bash
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8080/graphql
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| `next@14` | React framework with App Router |
| `typescript` | Type safety |
| `tailwindcss` | Utility-first CSS |
| `@radix-ui/*` | Accessible headless UI primitives |
| `lucide-react` | Icon library |
| `recharts` | Charts (Area, Bar, etc.) |
| `framer-motion` | Animations (ready to use) |
| `react-hook-form` | Form state management |
| `zod` | Schema validation |
| `@apollo/client` | GraphQL client |
| `zustand` | Global state management |
| `class-variance-authority` | Component variant system |

---

## 🗺️ Next Steps (Backend Integration)

1. ✅ Frontend complete — all pages and components done
2. 🔄 Backend — Build Spring Boot + GraphQL API
3. 🔄 Auth — JWT login/register endpoints
4. 🔄 Connect — Replace mock-data.ts with Apollo Client queries
5. 🔄 Deploy — Vercel (frontend) + AWS/Railway (backend)

---

Built with ❤️ for COSMOAI Technologies Ltd
