# SteppersLife PWA Development Guidelines

**CORE PRINCIPLE:** Development focused on delivering a complete event management platform with specialized expertise for each task.

**DEVELOPMENT FRAMEWORK:**
- Task-specific expertise application for optimal implementation
- Specialized knowledge deployment: Senior Developer, UX Designer, Project Manager, QA Engineer, DevOps Engineer, Technical Writer, etc.
- Continuous integration of diverse technical perspectives and methodologies
- Expert-driven task completion with appropriate specialization
- Seamless coordination across different technical domains

**TECHNICAL EXECUTION PROTOCOL:**
1. Analyze technical requirements and scope
2. Apply appropriate specialized expertise for implementation
3. Execute using relevant technical knowledge and best practices
4. Coordinate across different technical aspects as needed
5. Ensure quality delivery through expert technical review

**AVAILABLE SPECIALIZATIONS:**
- Senior Full-Stack Developer
- Frontend/React Specialist
- Backend/API Architect
- UX/UI Designer
- Project Manager/Scrum Master
- QA/Testing Engineer
- DevOps/Infrastructure Engineer
- Technical Writer/Documentation Specialist
- Security Engineer
- Database Architect
- Performance Optimization Specialist

Development continues with specialized technical expertise application.

## CRITICAL VERIFICATION PROTOCOL

**MANDATORY IMPLEMENTATION VERIFICATION:**
- NEVER mark stories/epics as complete based solely on completion notes
- ALWAYS verify actual code implementation exists using Glob/Read tools
- Check for real service files, components, and integration before status updates
- Look for actual file existence, not just documentation claims
- Verify routes are added to App.tsx and components are functional
- Test that claimed features actually work in the codebase

**Verification Steps Required:**
1. Use Glob to find claimed implementation files
2. Read key files to verify they contain real functionality
3. Check App.tsx for actual route integration  
4. Only mark complete when code verification confirms implementation
5. If verification fails, immediately revert status and implement properly

# Development Server Requirements

**IMPORTANT PORT RESTRICTION:**
- Only use ports 8080-8085 for local development
- Do not use any other local ports or network ports
- Always configure vite/dev servers to use ports within this range
- Default to port 8080 unless there are conflicts

# Server Troubleshooting Guide

**CRITICAL ISSUE: Server Shows "Ready" But Connection Refused**

*Problem:* Vite shows "VITE ready in XXXms" and displays URLs, but browser shows "ERR_CONNECTION_REFUSED"

*Root Cause:* Vite process dies immediately after startup due to runtime errors in React components, but the death happens after the "ready" message

*Debugging Steps:*
1. Check if process is actually running: `ps aux | grep vite | grep -v grep`
2. Check if port is listening: `lsof -i :8080`
3. If both return empty, the process died silently

*Prevention:*
- Always test new components in isolation before adding to main App.tsx
- Use TypeScript strict mode to catch errors early
- Run `npm run build` before adding new routes to catch compilation errors
- Verify all imports exist and are exported correctly

*Quick Fix:*
- Run `npm run dev &` to start in background
- If still fails, temporarily comment out new imports/routes to isolate issue
- Add components back one by one to identify problematic component

*Key Learning:* Vite can show "ready" message even if React components have runtime errors that crash the server immediately after