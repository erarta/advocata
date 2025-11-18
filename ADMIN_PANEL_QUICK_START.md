# Advocata Admin Panel - Quick Start Guide

**For Developers Starting Priority 8 (Implementation)**

---

## 📖 Reading Order (First Time)

**Total Reading Time: ~2-3 hours**

1. **ADMIN_PANEL_SUMMARY.md** (15 min) ← START HERE
   - Executive summary
   - What was designed
   - Key highlights

2. **ADMIN_PANEL_INDEX.md** (10 min)
   - Navigation guide
   - Document overview

3. **ADMIN_PANEL_ARCHITECTURE.md** (45 min)
   - Technology stack
   - System architecture
   - Module breakdown

4. **ADMIN_PANEL_FEATURES.md** (60 min)
   - Feature specifications
   - Wireframes
   - API endpoints

5. **ADMIN_PANEL_TECHNICAL_SPEC.md** (30 min)
   - File structure
   - Code patterns
   - Security implementation

6. **ADMIN_PANEL_IMPLEMENTATION_PLAN.md** (30 min)
   - Phased roadmap
   - Timeline
   - Risk assessment

---

## 🚀 Quick Implementation Start (Day 1)

### Step 1: Initialize Project (2 hours)

```bash
# Navigate to admin directory
cd /home/user/advocata/apps/admin

# Install dependencies (already in package.json)
npm install

# Add additional required dependencies
npm install --save \
  @radix-ui/react-alert-dialog \
  @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-popover \
  @radix-ui/react-select \
  @radix-ui/react-tabs \
  @radix-ui/react-toast \
  @radix-ui/react-tooltip \
  socket.io-client \
  @tanstack/react-virtual \
  react-dropzone \
  file-saver \
  xlsx \
  jspdf \
  jspdf-autotable \
  @tiptap/react \
  @tiptap/starter-kit \
  nanoid \
  currency.js

# Install dev dependencies
npm install --save-dev \
  @types/file-saver

# Create src directory if not exists
mkdir -p src/{app,components,lib,styles}
```

### Step 2: Set Up Environment (30 min)

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values
# NEXT_PUBLIC_API_URL=http://localhost:3000
# NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

### Step 3: Create Base Structure (1 hour)

```bash
# Create folder structure as per TECHNICAL_SPEC.md
# Reference: ADMIN_PANEL_TECHNICAL_SPEC.md, Section "Project Structure"

# Create app directory structure
mkdir -p src/app/{(auth)/login,(dashboard)}

# Create components directory structure
mkdir -p src/components/{ui,layouts,lawyers,users,consultations,analytics,financial,content,support,common}

# Create lib directory structure
mkdir -p src/lib/{api,hooks,stores,utils,types,validations,config}

# Create styles directory
mkdir -p src/styles
```

### Step 4: First Component - Login Page (2 hours)

Reference: **ADMIN_PANEL_FEATURES.md** → Authentication Section

```typescript
// src/app/(auth)/login/page.tsx
// See TECHNICAL_SPEC.md for full implementation
```

---

## 🎯 Week 1 Checklist (Phase 1: Foundation)

### Day 1-2: Project Setup
- [ ] Initialize Next.js project structure
- [ ] Install all dependencies
- [ ] Configure Tailwind CSS
- [ ] Set up ESLint + Prettier
- [ ] Create Docker configuration

### Day 3: Authentication
- [ ] Implement login page
- [ ] Set up auth API endpoints
- [ ] Configure auth store (Zustand)
- [ ] Implement middleware for protected routes
- [ ] Create RBAC permission system

### Day 4: Base UI Components
- [ ] Install Shadcn UI components
- [ ] Create layout components (Sidebar, Header)
- [ ] Implement responsive navigation
- [ ] Create dashboard home page

### Day 5: API Client & State Management
- [ ] Configure Axios client
- [ ] Set up TanStack Query
- [ ] Create query keys factory
- [ ] Implement error handling
- [ ] Create common utilities

---

## 📋 Key Files to Create (Priority Order)

### Phase 1 (Week 1)
```
Priority 1: Foundation
├─ src/lib/api/client.ts          (API client setup)
├─ src/lib/stores/auth-store.ts   (Auth state)
├─ src/lib/config/routes.ts       (Route constants)
├─ src/middleware.ts              (Auth middleware)
├─ src/app/(auth)/login/page.tsx  (Login page)
└─ src/components/layouts/dashboard-layout.tsx
```

### Phase 2 (Weeks 2-3) - CRITICAL
```
Priority 2: Lawyer Management
├─ src/app/(dashboard)/lawyers/pending/page.tsx
├─ src/app/(dashboard)/lawyers/pending/[id]/page.tsx
├─ src/components/lawyers/lawyer-table.tsx
├─ src/components/lawyers/verification-form.tsx
├─ src/lib/api/lawyers.ts
└─ src/lib/hooks/use-lawyers.ts
```

---

## 🔍 Quick Reference Guide

### Need to Find...

**Technology decisions?**  
→ ADMIN_PANEL_ARCHITECTURE.md, Section "Technology Stack"

**Feature specifications?**  
→ ADMIN_PANEL_FEATURES.md, Find module (A-H)

**File structure?**  
→ ADMIN_PANEL_TECHNICAL_SPEC.md, Section "Project Structure"

**API endpoints?**  
→ ADMIN_PANEL_FEATURES.md, Section "API Endpoint Specifications"

**Timeline?**  
→ ADMIN_PANEL_IMPLEMENTATION_PLAN.md, Section "Timeline & Milestones"

**Code examples?**  
→ ADMIN_PANEL_TECHNICAL_SPEC.md, Throughout document

**Wireframes?**  
→ ADMIN_PANEL_FEATURES.md, Within each module section

**Data models?**  
→ ADMIN_PANEL_FEATURES.md, "Data Requirements" subsections

---

## 🎨 UI Component Quick Reference

All components use **Shadcn UI**. To add a component:

```bash
# Example: Add Button component
npx shadcn-ui@latest add button

# Example: Add Table component
npx shadcn-ui@latest add table

# Example: Add Dialog component
npx shadcn-ui@latest add dialog
```

**Full component list:** See TECHNICAL_SPEC.md → "Project Structure" → `src/components/ui/`

---

## 🔐 RBAC Quick Reference

### Roles
- SUPER_ADMIN (all permissions)
- ADMIN (most permissions)
- MODERATOR (moderation + viewing)
- SUPPORT (support tickets + viewing)
- FINANCE (financial operations)
- ANALYST (analytics only)

### Check Permission in Code

```typescript
import { usePermission } from '@/lib/hooks/use-permissions';
import { Permission } from '@/lib/config/permissions';

function MyComponent() {
  const canVerify = usePermission(Permission.LAWYER_VERIFY);
  
  if (!canVerify) {
    return <UnauthorizedMessage />;
  }
  
  return <VerifyButton />;
}
```

---

## 📊 Module Priority Guide

| Priority | Module | Start Week | Critical? |
|----------|--------|------------|-----------|
| P0 | Foundation | Week 1 | ⚠️ BLOCKER |
| P1 | Lawyer Management | Week 2-3 | ⭐ CRITICAL |
| P1 | Analytics | Week 5 | ⭐ CRITICAL |
| P2 | Users | Week 4 | High |
| P2 | Consultations | Week 4 | High |
| P2 | Financial | Week 5 | High |
| P2 | Support | Week 6 | High |
| P3 | Content | Week 6 | Medium |
| P3 | Settings | Week 7 | Medium |

---

## 🐛 Common Issues & Solutions

### Issue: Dependencies not installing
**Solution:** Use exact versions from ARCHITECTURE.md

### Issue: TypeScript errors
**Solution:** Ensure tsconfig.json matches TECHNICAL_SPEC.md

### Issue: API calls failing
**Solution:** Check API client configuration in TECHNICAL_SPEC.md → "API Integration Patterns"

### Issue: Authentication not working
**Solution:** Review middleware setup in TECHNICAL_SPEC.md → "Routing Configuration"

---

## 📞 Need Help?

1. **Check documentation first** - Search all 6 documents
2. **Review code examples** - TECHNICAL_SPEC.md has working code
3. **Consult wireframes** - FEATURES.md has visual guides
4. **Check API specs** - FEATURES.md has all endpoints documented

---

## ✅ Daily Standup Template

**What I did yesterday:**
- [ ] Task 1
- [ ] Task 2

**What I'm doing today:**
- [ ] Task 1
- [ ] Task 2

**Blockers:**
- None / [List blockers]

**Reference:** See IMPLEMENTATION_PLAN.md for daily task breakdown

---

## 🎯 Success Metrics to Track

- [ ] Page load time < 2s
- [ ] Search results < 300ms
- [ ] Unit test coverage > 70%
- [ ] No console errors
- [ ] All P1 features working
- [ ] Mobile responsive
- [ ] RBAC working
- [ ] Audit logs capturing actions

---

## 📚 Additional Resources

- Next.js 14 Docs: https://nextjs.org/docs
- TanStack Query: https://tanstack.com/query/latest
- Shadcn UI: https://ui.shadcn.com/
- Zustand: https://zustand-demo.pmnd.rs/

---

**Last Updated:** November 18, 2025  
**Status:** Ready for Implementation  
**Next Action:** Begin Week 1, Day 1 tasks
