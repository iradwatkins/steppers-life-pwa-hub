# Technical Preferences for SteppersLife.com

## Core Technology Stack

### Backend Infrastructure
- **Primary:** Supabase (BaaS) with PostgreSQL
- **Authentication:** Supabase Auth with social login options
- **Storage:** Supabase Storage for file uploads
- **Serverless Functions:** Supabase Edge Functions

### Custom Backend (if needed)
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Repository:** Separate backend repository if complex logic required

### Frontend Technology
- **Framework:** React with TypeScript
- **Build Tool:** Vite
- **App Type:** Progressive Web App (PWA)
- **Design:** Mobile-first responsive design

### Styling & UI
- **CSS Framework:** Tailwind CSS
- **Component Library:** Shadcn/UI with Radix UI primitives
- **Icons:** Lucide React
- **Theme:** Support for Night Mode

## Third-Party Integrations

### Payment Processing
- Square
- Cash App
- PayPal

### Email Services
- SendGrid (preferred)
- Alternative SMTP services as backup

### Analytics & Marketing
- Google Analytics
- Ahrefs for SEO analytics
- Google AdSense for advertising

### Automation
- n8n.io for automated social media posting

## Infrastructure & Hosting

### Deployment
- **Cloud Provider:** Hostinger (under evaluation)
- **Alternative:** Vercel, Netlify, or AWS
- **Requirements:** Scalability and reliability focus

### Performance
- CDN for static assets
- Image optimization
- Lazy loading for content

## Development Environment

### Code Quality
- ESLint for linting
- Prettier for formatting
- TypeScript strict mode
- Git hooks for pre-commit checks

### Testing
- Unit tests: Jest/Vitest
- Component tests: React Testing Library
- E2E tests: Playwright (if needed)

### Version Control
- Git with GitHub
- Conventional commit messages
- Pull request workflow
- Code review requirements

## Security Requirements

### Data Protection
- HTTPS everywhere
- Environment variables for secrets
- Input validation and sanitization
- CORS configuration

### Authentication & Authorization
- JWT tokens via Supabase
- Role-based access control
- Session management

## Performance Requirements

### Frontend
- First Contentful Paint < 2s
- Lighthouse score > 90
- Mobile optimization priority
- Progressive loading

### Backend
- API response times < 500ms
- Database query optimization
- Proper indexing strategy

## Compliance & Accessibility

### Web Standards
- WCAG 2.1 AA compliance
- Semantic HTML
- Keyboard navigation support
- Screen reader compatibility

### Legal
- GDPR considerations
- Privacy policy compliance
- Cookie consent management

## Development Practices

### Code Organization
- Feature-based folder structure
- Shared components library
- Custom hooks for reusable logic
- Type definitions in separate files

### API Design
- RESTful conventions
- Consistent error handling
- API versioning strategy
- Rate limiting

### Documentation
- README files for setup
- API documentation
- Component documentation
- Deployment guides

## Monitoring & Maintenance

### Error Tracking
- Sentry or similar service
- Error boundaries in React
- Logging strategy

### Performance Monitoring
- Core Web Vitals tracking
- Database performance metrics
- API response time monitoring

### Backup & Recovery
- Database backup strategy
- File storage backup
- Disaster recovery plan

## Future Considerations

### Scalability
- Microservices architecture readiness
- Database sharding possibilities
- CDN optimization

### Technology Evolution
- Framework upgrade paths
- Dependency management
- Technical debt monitoring

## Development Tools

### Recommended IDE Setup
- VS Code with extensions:
  - TypeScript
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Prettier
  - ESLint

### Package Management
- npm or yarn (consistent across team)
- Package-lock file committed
- Regular dependency updates

### Environment Management
- .env files for configuration
- Separate environments: dev, staging, prod
- Environment-specific configurations 