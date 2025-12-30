# SaaS Multi-Tenancy: Points to Consider

## Current Status (December 30, 2024)

### ✅ Already Implemented (Skills Survey Multi-School Support)
- Database: `schools` table created
- Database: `school_id` column added to `parent_skill_responses`
- Migration: Default school created with ID `c6268dee-1fcd-42bd-8da2-1d4ac34a03db`
- TypeScript: School interface and types updated
- API: All routes filter by `DEFAULT_SCHOOL_ID`
- Environment: Hardcoded school_id via `.env.local`

---

## Questions & Decisions Needed for Full SaaS

### 1. School Identification & Routing Strategy
**How will users access their school's instance?**

**Option A: Subdomain Routing**
- Example: `school1.beeri.online`, `school2.beeri.online`
- Pros: Clean separation, easy branding, automatic school identification
- Cons: DNS configuration, SSL complexity

**Option B: Path-Based Routing**
- Example: `/schools/school-slug/dashboard`
- Pros: Simple deployment, single SSL
- Cons: Less clean URLs, harder to white-label

**Option C: School Selection After Login**
- Example: User logs in, then selects school from dropdown
- Pros: Simplest implementation
- Cons: Extra step, not suitable for public pages

**Decision:** ⬜ To be decided

---

### 2. User & School Relationship
**Can users belong to multiple schools?**

**Single School Per User:**
- Simpler data model
- User table has single `school_id` column
- Most common for parent committees

**Multiple Schools Per User:**
- Supports regional admins managing multiple schools
- Requires junction table (`user_schools`)
- More complex permissions

**Decision:** ⬜ To be decided

---

### 3. Pricing & Monetization
**What pricing model should we use?**

**Potential Tiers:**
- Free: Limited responses (50), basic features
- Basic: More responses (200), advanced features ($19/month)
- Pro: Unlimited, all features ($49/month)
- Enterprise: Custom pricing, dedicated support

**Questions:**
- Per-school pricing or per-user?
- Annual discount?
- What features to gate per tier?

**Decision:** ⬜ Market research needed

---

### 4. School Registration & Onboarding
**How do new schools sign up?**

**Self-Service Registration:**
- Public signup form
- Email verification
- Automatic school creation
- Free trial period

**Manual Onboarding:**
- Contact sales
- Manual school setup by admin
- Custom configuration

**Decision:** ⬜ To be decided (likely self-service for scale)

---

### 5. Data Privacy & Compliance
**How to handle multi-school data?**

**Considerations:**
- GDPR compliance (EU schools)
- Data residency requirements
- Data export capabilities
- School deletion workflow

**Questions:**
- Hard delete or soft delete schools?
- Data retention policy after school deletion?
- Right to be forgotten implementation?

**Decision:** ⬜ Legal review needed

---

### 6. Branding & Customization
**How much customization per school?**

**Minimal:**
- School name and logo only
- Standard colors and layout

**Moderate:**
- Custom logo, colors, favicon
- School-specific email templates

**Full White-Labeling:**
- Custom domain (school.com)
- Fully branded interface
- Custom email domain

**Decision:** ⬜ To be decided based on pricing tier

---

### 7. Feature Flags & Permissions
**What features should be configurable per school?**

**Always Enabled:**
- Skills survey
- Basic user management

**Configurable:**
- Events & calendar
- Task management
- Vendor database
- Prom planning
- Ticket system
- Anonymous feedback

**Decision:** ⬜ To be decided based on pricing tiers

---

### 8. Admin Roles & Permissions
**What permission levels do we need?**

**Potential Roles:**
- **Super Admin:** Manages all schools (platform owner)
- **School Admin:** Full control within their school
- **Editor:** Can create/edit content
- **Viewer:** Read-only access

**Questions:**
- Granular permissions per feature?
- Role-based access control (RBAC) or simple roles?

**Decision:** ⬜ To be decided

---

### 9. Billing Integration
**Which payment provider?**

**Options:**
- **Stripe** (recommended): Best developer experience, global support
- **PayPal:** Familiar to users
- **Local payment processors:** For specific regions

**Features Needed:**
- Subscription management
- Auto-billing
- Usage tracking
- Invoice generation

**Decision:** ⬜ Stripe recommended, pending approval

---

### 10. Data Migration Strategy
**How to add school_id to existing tables?**

**Already Done:**
- ✅ `parent_skill_responses` has school_id

**Tables Needing school_id:**
**High Priority:**
- ⬜ `events`
- ⬜ `tasks`
- ⬜ `committees`
- ⬜ `anonymous_feedback`

**Medium Priority:**
- ⬜ `vendors`
- ⬜ `protocols`
- ⬜ `responsibilities`

**Low Priority:**
- ⬜ `prom_quotes`
- ⬜ `prom_votes`
- ⬜ `tickets`

**Strategy:** Incremental migration (one table at a time)
**Decision:** ⬜ Prioritize based on customer needs

---

## Technical Implementation Notes

### Current Hardcoded Configuration
```bash
# .env.local
DEFAULT_SCHOOL_ID=c6268dee-1fcd-42bd-8da2-1d4ac34a03db
```

### Future Multi-Tenant Configuration
```typescript
// Get school ID from request context (subdomain, JWT, etc.)
const schoolId = getSchoolIdFromRequest(request)

// All queries automatically filter by school
const responses = await supabase
  .from('parent_skill_responses')
  .select('*')
  .eq('school_id', schoolId)
```

### Security Considerations
- Implement Row Level Security (RLS) policies per school
- Validate school access on every API request
- Prevent cross-school data leakage
- Audit logs for multi-school access

---

## Next Steps

### Immediate (Before Full SaaS Launch)
1. ⬜ **Decide on routing strategy** (subdomain vs path)
2. ⬜ **Define pricing tiers** and feature matrix
3. ⬜ **Create user-school relationship** model
4. ⬜ **Plan school registration flow**

### Short-Term (First Month of SaaS)
1. ⬜ Add school_id to high-priority tables
2. ⬜ Implement school management UI
3. ⬜ Create school switcher for multi-school admins
4. ⬜ Set up Stripe integration

### Long-Term (3-6 Months)
1. ⬜ School registration and onboarding automation
2. ⬜ Advanced branding/white-labeling
3. ⬜ Usage analytics per school
4. ⬜ Billing automation and invoicing

---

## References

### Related Files
- Migration: `supabase/migrations/20251230130000_add_school_id_to_skills.sql`
- Types: `src/types/parent-skills.ts`
- API Routes: `src/app/api/surveys/skills/route.ts`
- Implementation Plan: `/Users/michaelmishayev/.claude/plans/parallel-wondering-hoare.md`

### Resources
- [Supabase Multi-Tenancy Guide](https://supabase.com/docs/guides/database/multi-tenancy)
- [Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)

---

**Last Updated:** December 30, 2024
**Status:** Foundation Complete, Awaiting Strategic Decisions
