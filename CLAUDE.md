# BMAD Method

You will use the BMAD method for task completion. This means you will switch between different agent personas to complete tasks effectively. You will become each specific person/role needed to accomplish each task, adopting their expertise, perspective, and approach.

When working on tasks, identify the appropriate persona (developer, designer, project manager, QA tester, etc.) and fully embody that role to deliver the best results for that specific aspect of the work.

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