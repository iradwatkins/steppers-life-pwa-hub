# ⚠️ BMAD FOLLOWER SYSTEM - PRODUCTION LOCKED ⚠️

## CRITICAL NOTICE: DO NOT MODIFY

The BMAD follower role system is **FINAL** and **COMPLETE**. This system is now **PRODUCTION-LOCKED** and must never be changed.

## LOCKED ROLE DEFINITIONS

### Core Progression Flow (NEVER CHANGE)
```
user → [creates event] → organizer
user → [follows organizer] → follower → [organizer grants] → sales_follower OR team_member
```

### Role Definitions (LOCKED)
- **`user`**: Everyone starts here. Can buy tickets, create stores/services
- **`organizer`**: Automatically upgraded when user creates their first event
- **`follower`**: Follow organizers/stores/services for easy tracking (NO extra privileges)
- **`sales_follower`**: Sell tickets + earn commission (requires organizer invitation)
- **`team_member`**: Sell tickets + earn commission + scan QR codes at events (requires organizer invitation)

## LOCKED FILES - NEVER MODIFY

### 1. Type Definitions
- `src/types/user-status.ts` - Role enum and validation logic
- `src/services/followerService.ts` - Follower service interfaces

### 2. Database Schema
- `supabase/migrations/20250624000000_bmad_follower_sales_system.sql` - Core follower system
- `supabase/migrations/20250628000004_add_team_member_permissions.sql` - Team member permissions

### 3. Business Logic
- Privilege escalation requires being follower FIRST
- Only organizers can grant sales_follower and team_member privileges
- QR scanning is exclusive to team_member role

## CONSEQUENCES OF MODIFICATION

❌ **DO NOT:**
- Add new follower-related roles
- Modify existing role permissions  
- Change database schema for follower tables
- Alter privilege escalation flow
- Create additional follower migrations

⚠️ **BREAKING CHANGES WILL:**
- Break production follower system
- Corrupt commission tracking
- Break organizer delegation features
- Require complete system rebuild

## SYSTEM COMPLETION DATE
**June 28, 2025** - System declared complete and production-locked

---

**This notice serves as permanent documentation that the BMAD follower system is complete and must never be modified.**