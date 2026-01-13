# RentChain Frontend

A modern React-based frontend for the RentChain blockchain-powered rental marketplace, providing a seamless user experience for property browsing, booking, and management.

## Project Overview

RentChain is a decentralized rental marketplace similar to Airbnb, built on Ethereum blockchain. This frontend application serves as the user interface for property owners, tenants, and administrators to interact with the platform.

### User Roles Supported
- **Visitor**: Browse and search properties anonymously
- **Tenant**: Book properties, make payments via MetaMask, view booking history, receive AI-powered recommendations
- **Owner**: List and manage properties, handle bookings and availability
- **Admin**: Approve property listings, moderate users and reviews, oversee platform operations

### Architecture Summary
The frontend communicates exclusively through an API Gateway to multiple backend microservices (built with Spring Boot), including property management, booking systems, and user authentication. Blockchain interactions are handled via MetaMask and ethers.js for secure payments through smart contracts.

## Features Visible in the UI

### Property Browsing and Filtering
- Property search with filters (location, dates, price, amenities)
- Interactive map view with property markers
- Detailed property pages with image galleries and reviews
- Property comparison and favorites

### Owner Property Management
- Create, edit, and delete property listings
- Photo upload and management
- Availability calendar management
- Booking management and revenue tracking

### Booking and Payment UI
- Secure booking flow with date selection
- MetaMask integration for ETH payments
- Booking confirmation and management
- Cancellation requests and history

### AI-Powered Features
- **Risk Score Badge**: Displays tenant reliability score on booking pages
- **Recommended Properties**: AI-suggested listings based on user preferences and budget
- **Market Trends Widget**: Home page insights with price trends and market analysis

### Admin Dashboards
- Property approval workflow
- User management and moderation
- Review moderation tools
- Platform analytics and statistics

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS with shadcn/ui component library
- **Blockchain**: ethers.js v6 for Ethereum interactions
- **HTTP Client**: Axios for API communication
- **Routing**: React Router v7 for client-side navigation
- **State Management**: Zustand with persistence middleware
- **Data Fetching**: TanStack React Query for server state management
- **UI Components**: Radix UI primitives via shadcn/ui
- **Charts**: Recharts for data visualization
- **Maps**: React Leaflet for property mapping
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Notifications**: Sonner for toast messages
- **Themes**: next-themes for dark/light mode

## Project Structure

```
src/
├── app/
│   └── router.tsx              # React Router configuration
├── blockchain/
│   ├── escrow.ts              # Smart contract interactions
│   ├── provider.ts            # MetaMask provider setup
│   └── abi/
│       └── Escrow.json        # Contract ABI
├── components/
│   ├── ui/                    # Reusable UI components (shadcn/ui)
│   ├── auth/                  # Authentication components
│   ├── bookings/              # Booking-related components
│   ├── properties/            # Property display components
│   ├── profile/               # User profile components
│   └── ai/                    # AI-powered components
├── hooks/
│   ├── admin/                 # Admin-specific hooks
│   ├── bookings/              # Booking data hooks
│   └── ...                    # Feature-specific hooks
├── lib/
│   ├── axios.ts               # HTTP client configuration
│   ├── auth.utils.ts          # Authentication utilities
│   └── utils.ts               # General utilities (ETH/USD conversion)
├── pages/
│   ├── admin/                 # Admin pages
│   ├── auth/                  # Authentication pages
│   ├── owner/                 # Property owner pages
│   ├── tenant/                # Tenant pages
│   ├── public/                # Public pages
│   └── properties/            # Property browsing pages
├── services/
│   ├── *.service.ts           # API service modules
│   └── aiService.ts           # AI service integration
├── store/
│   └── auth.store.ts          # Authentication state (Zustand)
├── types/
│   └── *.types.ts             # TypeScript type definitions
└── main.tsx                   # Application entry point
```

### Key Architecture Notes
- **Components**: Organized by feature (auth, bookings, properties) with reusable UI components in `ui/`
- **Pages**: Role-based organization with index files for clean imports
- **Hooks**: Custom React hooks for data fetching and business logic
- **Services**: API integration layer with separate modules for each backend service
- **Store**: Centralized state management using Zustand stores

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# API Gateway and Service URLs
VITE_PROPERTY_API_URL=http://localhost:8081
VITE_RENTAL_API_URL=http://localhost:8082
VITE_AUTH_API_URL=http://localhost:8080

# Blockchain Configuration
VITE_CONTRACT_ADDRESS=0xcb12037162B776b2DDd3Cd613C50353275AaE53c
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

## Running the Frontend

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask browser extension (for blockchain features)

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The development server will start on `http://localhost:5173` with hot reload enabled.

### Production Deployment
```bash
npm run build
# Serve the dist/ folder with any static file server
```

## Role-Based Routing & Guards

The application uses React Router with custom route guards implemented via the `RequireRole` component:

```tsx
// Protected route example
<RequireRole roles={["ROLE_TENANT"]}>
  <MyBookingsPage />
</RequireRole>
```

### Authentication Flow
- **Token Storage**: JWT tokens stored in localStorage via Zustand persist middleware
- **Route Protection**: Unauthenticated users redirected to `/login`
- **Role Validation**: Users without required roles redirected to home page
- **Auto-redirect**: Post-login redirection to intended protected route

## Integration with Blockchain

### MetaMask Detection
The application automatically detects MetaMask availability on page load:

```typescript
import { isMetaMaskAvailable } from '@/blockchain/provider';

if (!isMetaMaskAvailable()) {
  // Show install MetaMask prompt
}
```

### Payment Flow
1. User initiates booking with property selection
2. Payment component connects to MetaMask
3. Smart contract interaction for escrow deposit
4. Transaction confirmation and booking completion
5. UI updates based on blockchain transaction events

### Expected Backend Events
- Transaction hash confirmation
- Escrow status updates
- Payment success/failure notifications
- Booking status synchronization

## AI Integration (Frontend View Only)

### Risk Score Badge
- Appears on booking confirmation pages
- Color-coded indicators (green/yellow/red) based on AI-calculated risk
- Displays numerical score (0-100) with risk level

### Recommendations Section
- Dynamic property suggestions based on user profile and search history
- Budget-aware filtering with AI optimization
- "AI-powered" indicator icons next to recommendations

### Market Trends Section
- Home page widget with price trend charts
- Market analysis tables and forecasts
- AI-generated insights with indicator badges

## Limitations & Roadmap

### Current Limitations
- No offline caching for property data
- Limited chat/messaging features
- Basic map interactions (no advanced clustering)

### Future Enhancements
- Real-time chat assistant for booking support
- Enhanced map page with advanced filtering
- Offline property browsing capabilities
- Progressive Web App (PWA) features
- Advanced AI personalization features

## Quick Screenshots

### Home Page
![Home Page](screenshots/home-page.png)
*Main landing page with featured properties and market trends*

### Property Details
![Property Details](screenshots/property-details.png)
*Detailed property view with booking interface*

### Admin Panel
![Admin Panel](screenshots/admin-panel.png)
*Administrative dashboard for platform management*

---

For backend services and smart contract documentation, refer to the respective repositories in the RentChain monorepo.
