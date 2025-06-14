# Claude Export Learnings - Reusable Foundation

## Purpose
This document captures learnings, patterns, and solutions discovered during SteppersLife development that should be reused across future projects with the same foundation.

## Technical Foundation Patterns

### Authentication Implementation
- **Supabase Auth Setup**: Full authentication service implemented with useAuth hook pattern
  - AuthProvider context wraps entire application in App.tsx
  - Session management with automatic state updates via onAuthStateChange
  - Authentication state properly integrated with Header component
- **Google OAuth Integration**: Implemented with signInWithOAuth() redirecting to /auth/callback
  - OAuth redirect URL: `${window.location.origin}/auth/callback`
  - AuthCallback component handles OAuth and magic link redirects
- **Magic Link Implementation**: Implemented with signInWithOtp() for passwordless authentication
  - Same callback handling pattern as OAuth
  - User must enter email first before sending magic link
- **Email/Password Authentication**: Full signup and signin with email verification
  - Password requirements: minimum 6 characters
  - User metadata includes first_name, last_name, full_name
  - Email verification required before login
- **Password Reset**: Forgot password flow with email reset links
  - Dedicated ForgotPassword component with success state
  - Reset link redirects to /auth/reset-password (not yet implemented)
- **Session Management**: Automatic session handling with loading states
  - Protected route patterns ready for implementation
  - User data available throughout app via useAuth hook
- **Error Handling**: Centralized error handling with toast notifications using Sonner
- **Technical Preference Alignment**: Authentication pages correctly exclude Facebook/Apple OAuth per technical preferences

### PWA Configuration
- **vite-plugin-pwa Setup**: [To be documented during implementation]
- **Service Worker Patterns**: [To be documented during implementation]
- **Offline Functionality**: [To be documented during implementation]

### State Management Evolution
- **Starting Pattern**: useState/useEffect for simple cases
- **Scaling Trigger**: When to introduce TanStack Query
- **Global State**: When to use Zustand vs Context

## Development Process Learnings

### Story Breakdown Patterns
- **Large Story Indicators**: Multiple acceptance criteria types, complex UI flows
- **Optimal Story Size**: Single feature focus, 3-5 acceptance criteria max
- **Break Point Rules**: When stories exceed 1 week development time

### Common Issues and Solutions

*Issue: Stories created before technical preferences finalization may contradict final technical decisions. Always validate all stories against technical preferences before implementation begins.*
- **Solution**: Run technical preferences validation check against all existing stories before starting development
- **Example**: B.001 authentication story originally included Facebook/Apple OAuth, corrected to Google OAuth + magic link only per technical preferences

*Issues that recur and their permanent solutions will be documented here in italics*

### BMAD Methodology Refinements
- **Persona Switching**: When to switch from SM to Dev and back
- **Note-Taking Patterns**: What Developer should capture for SM
- **Documentation Standards**: What goes in technical docs vs code comments

## Reusable Code Patterns

### Component Patterns
[To be populated during development]

### API Integration Patterns  
[To be populated during development]

### Testing Patterns
[To be populated during development]

## Architecture Decisions

### Monorepo vs Polyrepo
**Decision**: Monorepo (per technical preferences)
**Rationale**: Simplifies development for BaaS approach with Supabase

### Backend Strategy
**Decision**: Supabase BaaS exclusively
**Rationale**: No separate backend server needed, reduces complexity

---

**Note**: This document will be continuously updated during development to capture real learnings and solutions for future project reuse.