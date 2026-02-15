# Shared Package

Shared types, validators, and utilities for ComunidadePsi.

## Usage

Import from the shared package in both backend and frontend:

```typescript
// Types
import {
  User,
  Post,
  Comment,
  Report,
  ModerationAction,
  UserRole,
  PostType
} from 'shared'

// Validators
import {
  userSchema,
  createPostSchema,
  createCommentSchema,
  createReportSchema
} from 'shared'
```

## Exports

### Types
- `User` - Psychologist profile
- `Post` - Challenge or debate post
- `Comment` - Post comment
- `Report` - Content report/denúncia
- `ModerationAction` - Audit trail action

### Validators (Zod)
- `userSchema` - User validation
- `createUserSchema` - Create user validation
- `postSchema` - Post validation
- `createPostSchema` - Create post validation
- `commentSchema` - Comment validation
- `createCommentSchema` - Create comment validation
- `reportSchema` - Report validation
- `createReportSchema` - Create report validation

### Enums
- `UserRole` - (PSYCHOLOGIST | MODERATOR | ADMIN)
- `PostType` - (CHALLENGE | DEBATE)
- `PostStatus` - (PUBLISHED | HIDDEN | REMOVED | PENDING_REVIEW)
- `ReportReason` - (SENSITIVE_DATA | UNETHICAL | HARASSMENT | OTHER)
- `ReportStatus` - (OPEN | UNDER_REVIEW | RESOLVED | DISMISSED)
- `ModAction` - (HIDE | REMOVE | RESTORE | WARN_AUTHOR | DISMISS_REPORT | RESOLVE_REPORT)

## Building

```bash
npm run build      # Compile TypeScript
npm run typecheck  # Type validation
npm test           # Run tests
```

## Structure

```
src/
├── types/          # TypeScript interfaces and enums
├── validators/     # Zod validation schemas
└── index.ts        # Package exports
```

---

**Part of ComunidadePsi squad** — Shared types and validation layer.
