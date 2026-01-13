# Pages Organization

This document describes the organization of pages in the application, structured by user roles and features.

## Directory Structure

```
src/pages/
├── admin/          # Admin-only pages
├── auth/           # Authentication pages
├── dashboard/      # General user dashboard
├── owner/          # Property owner pages
├── properties/     # Property browsing (public)
├── public/         # Public pages (no auth required)
├── tenant/         # Tenant-specific pages
└── index.ts        # Main exports
```

## Role-Based Organization

### Admin Pages (`/admin/`)
- `AdminDashboardPage` - Main admin dashboard
- `AdminPropertiesPage` - Property management for admins
- `AdminPropertyDetailPage` - Detailed property view for admins
- `AdminBookingsPage` - Booking management for admins
- `AdminUsersOverview` - User management overview
- `AdminUserDetails` - Individual user details
- `AdminCreateUser` - Create new users
- `AdminReviewsPage` - Review management

### Authentication Pages (`/auth/`)
- `LoginPage` - User login
- `RegisterPage` - User registration
- `EmailVerificationPage` - Email verification

### Tenant Pages (`/tenant/`)
- `MyBookingsPage` - User's booking list
- `BookingDetailsPage` - Individual booking details

### Dashboard Pages (`/dashboard/`)
- `ProfilePage` - User profile management

### Owner Pages (`/owner/`)
- `OwnerListingsPage` - Property listings management
- `OwnerBookingsPage` - Bookings received by owner
- `OwnerStatsPage` - Owner statistics and analytics
- `CreatePropertyPage` - Create new property listings
- `EditPropertyPage` - Edit existing properties
- `ManagePhotosPage` - Photo management for properties
- `AvailabilityManagementPage` - Calendar and availability management

### Property Pages (`/properties/`)
- `PropertyListPage` - Browse all properties
- `PropertyDetailsPage` - Individual property details
- `SubmitReviewPage` - Submit reviews for properties

### Public Pages (`/public/`)
- `HomePage` - Landing page
- `FAQPage` - Frequently asked questions
- `BlogPage` - Blog/articles
- `SearchPage` - Property search
- `SearchResultsPage` - Search results
- `OwnerProfilePage` - Public owner profiles
- `MapPage` - Property map view

## Import Structure

Each directory has an `index.ts` file that exports all pages in that directory. The main `pages/index.ts` re-exports everything for convenient importing.

### Example Usage

```typescript
// Import from main index
import { OwnerListingsPage, AdminDashboardPage } from '@/pages'

// Import from specific directory
import { OwnerListingsPage } from '@/pages/owner'
```

## Route Protection

Pages are protected by roles using the `RequireRole` component in the router:

- **Public**: No protection required
- **Tenant**: `ROLE_TENANT`
- **Owner**: `ROLE_OWNER`
- **Admin**: `ROLE_ADMIN`
- **Authenticated**: Any of the above roles

## File Naming Convention

- Page components use `PascalCase` with `Page` suffix
- Export names match the file names
- Default exports are aliased to match the file name for consistency