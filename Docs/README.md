# BeeriManager Documentation

**Last Updated:** 2025-10-04
**Files:** 17 documents

---

## 📚 Quick Navigation

### 🎯 Core Documents
| Document | Purpose | Size |
|----------|---------|------|
| **[prd.md](prd.md)** | Product Requirements Document - Core features & scope | 172 lines |
| **[technicalLib.md](technicalLib.md)** | Technical architecture & stack overview | 817 lines |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Deployment guide (Railway) | 226 lines |
| **[QA-TEST-PLAN.md](QA-TEST-PLAN.md)** | Testing strategy & test plans | 1,037 lines |

### 💻 Development Guides
| Document | Purpose | Size |
|----------|---------|------|
| **[development/development.md](development/development.md)** | Complete development plan & timeline | 1,860 lines |
| **[development/db.md](development/db.md)** | Database schema & strategy | 1,237 lines |
| **[development/bugs.md](development/bugs.md)** | Known bugs & solutions | 162 lines |
| **[development/calendar.md](development/calendar.md)** | Calendar implementation guide | 621 lines |
| **[development/automation-strategy.md](development/automation-strategy.md)** | Playwright automation strategy | 605 lines |
| **[development/commands.md](development/commands.md)** | CLI commands reference | 102 lines |

### 🌍 Internationalization
| Document | Purpose | Size |
|----------|---------|------|
| **[development/languageAdd.md](development/languageAdd.md)** | Multi-language support guide | 1,042 lines |
| **[development/i18n-migration-progress.md](development/i18n-migration-progress.md)** | i18n migration progress | 297 lines |

### 🎨 Design System
| Document | Purpose | Size |
|----------|---------|------|
| **[design/design-system.md](design/design-system.md)** | Complete design system & components | 1,592 lines |
| **[design/BeeriManager-Brandbook.md](design/BeeriManager-Brandbook.md)** | Brand identity & visual guidelines | 983 lines |

### ⚙️ DevOps & Integrations
| Document | Purpose | Size |
|----------|---------|------|
| **[devops/vercel.md](devops/vercel.md)** | Vercel deployment guide | 127 lines |
| **[development/google-drive-setup.md](development/google-drive-setup.md)** | Google Drive integration | 153 lines |
| **[development/google-analytics-setup.md](development/google-analytics-setup.md)** | Analytics setup guide | 104 lines |

---

## 🗂️ Documentation Structure

```
Docs/
├── README.md                    # This file
├── prd.md                       # Product requirements
├── technicalLib.md              # Technical overview
├── DEPLOYMENT.md                # Deployment guide
├── QA-TEST-PLAN.md              # Testing plan
│
├── development/                 # Development guides
│   ├── development.md           # Main dev plan
│   ├── db.md                    # Database documentation
│   ├── bugs.md                  # Bug tracking
│   ├── calendar.md              # Calendar implementation
│   ├── automation-strategy.md   # Test automation
│   ├── commands.md              # CLI commands
│   ├── languageAdd.md           # Multi-language
│   ├── i18n-migration-progress.md
│   ├── google-drive-setup.md
│   └── google-analytics-setup.md
│
├── design/                      # Design documentation
│   ├── design-system.md         # Design system
│   └── BeeriManager-Brandbook.md # Brand guidelines
│
└── devops/                      # DevOps guides
    └── vercel.md                # Vercel deployment
```

---

## 🚀 Getting Started

### New Developers
1. Read **[prd.md](prd.md)** - Understand product vision
2. Read **[technicalLib.md](technicalLib.md)** - Understand tech stack
3. Read **[development/development.md](development/development.md)** - Development workflow
4. Review **[development/db.md](development/db.md)** - Database schema
5. Check **[development/bugs.md](development/bugs.md)** - Known issues

### Designers
1. Review **[design/BeeriManager-Brandbook.md](design/BeeriManager-Brandbook.md)** - Brand identity
2. Study **[design/design-system.md](design/design-system.md)** - Component library
3. Check **[prd.md](prd.md)** for feature requirements

### DevOps/Deployment
1. Read **[DEPLOYMENT.md](DEPLOYMENT.md)** - Railway deployment
2. Check **[devops/vercel.md](devops/vercel.md)** - Vercel alternative
3. Review **[development/db.md](development/db.md)** - Database setup

---

## 📝 Recent Changes (2025-10-04)

### ✅ Cleanup Performed
- **Deleted 7 files** (speculative/duplicate content)
  - Removed Brave Search implementation docs (not implemented)
  - Removed ChatGPT AI opportunity docs (speculative)
  - Merged database migration docs into single `db.md`
  - Removed empty files

### 📊 Results
- **Before:** 24 files, ~19,000 lines
- **After:** 17 files, ~16,000 lines
- **Reduction:** 29% fewer files, 21% less content
- **Benefit:** Cleaner, more focused documentation

---

## 🔍 Document Categories

### 📘 Product & Requirements
- prd.md
- QA-TEST-PLAN.md

### 🛠️ Technical Implementation
- technicalLib.md
- development/development.md
- development/db.md
- development/calendar.md

### 🎨 Design & UX
- design/design-system.md
- design/BeeriManager-Brandbook.md

### 🌐 Internationalization
- development/languageAdd.md
- development/i18n-migration-progress.md

### 🚀 Deployment & Operations
- DEPLOYMENT.md
- devops/vercel.md
- development/google-drive-setup.md
- development/google-analytics-setup.md

### 🐛 Maintenance
- development/bugs.md
- development/automation-strategy.md
- development/commands.md

---

## 💡 Tips

- **Search**: Use `grep -r "keyword" Docs/` to find content across all docs
- **Updates**: Keep documentation up-to-date as features change
- **Questions**: Check existing docs before creating new ones
- **Bugs**: Always document bugs in `development/bugs.md` with solutions

---

**Maintained by:** Development Team
**Questions?** Check documentation or ask in team chat
