# Project Workflow & Quality Management Guidance — GD Webdesign

This document defines the standard operating procedures, quality gates, decision management rules, and technical conventions for the GD Webdesign repository ecosystem.

---

## 1. Core Workflow & Operations

### 1.1 Development & Branching Model
- All development, bug fixes, and features must be delivered via Git pull requests targeting the `main` branch.
- Never commit directly to `main` or merge PRs without explicit review and user approval.
- Branch naming convention:
  - `feat/<feature-description>`
  - `bug/<bug-description>` or `fix/<fix-description>`
  - `docs/<doc-description>`

### 1.2 Iterative Decision Management
After every significant workflow milestone or recurring technical step (e.g., initial exploration, feature implementation, bug fix verification, or test execution), propose **2–4 relevant next actions** and recommend one with a brief rationale:
1. **Option A (Recommended)**: Brief explanation of why this is the best immediate next step.
2. **Option B**: Alternative next step.
3. **Option C**: Further option if applicable.

---

## 2. Quality Gates & Verification Standards

A green CI build or successful deployment alone is **insufficient** proof that a change is ready. Every modification must pass all quality gates below before opening or updating a PR.

### Quality Gate Checklist
1. **Automated Unit Tests**:
   - Run `npm test` (`node --test`). All tests must pass with 0 failures.
   - Include regression tests for any bug fixes or new localization keys.
2. **Build Integrity**:
   - Run `npm run build` to compile minified Tailwind CSS (`assets/css/tailwind.generated.css`).
   - Confirm built CSS contains no syntax or purging errors.
3. **Responsive Visual Verification**:
   - Test layouts across mobile (`sm`), tablet (`md`), desktop (`lg`), and large screen (`xl`) viewports.
   - Ensure mobile navigation toggles properly, text does not overflow, and touch targets are adequate (minimum 44x44px).
4. **i18n Structural Consistency**:
   - Both German (`de.json`) and English (`en.json`) locale files must remain structurally identical in key hierarchy.
   - Never leave unmapped raw German strings when switching language to English.
5. **Accessibility & CSP Compliance**:
   - Maintain full keyboard navigation and appropriate ARIA attributes (`aria-expanded`, `aria-controls`, `aria-label`, `aria-pressed`).
   - Do not introduce inline `style="..."` attributes that violate Content Security Policy rules defined in `netlify.toml`.

---

## 3. Hosting & Deployment Environment Rules

### 3.1 Netlify vs. GitHub Pages Behavior
The repository supports static deployment on Netlify and preview/hosting on GitHub Pages. Note the operational differences:

| Feature / Aspect | Netlify Deployment | GitHub Pages Deployment |
|---|---|---|
| **Form Handling** | Active (`data-netlify="true"`) — submissions captured in dashboard | Inactive — Contact form returns **HTTP 405 Method Not Allowed** |
| **Security Headers** | Enforced via `netlify.toml` (`X-Frame-Options`, `CSP`, etc.) | **Not enforced** by `netlify.toml` (headers are host-dependent) |
| **Asset Caching** | Revalidatable 1-hour cache for `/assets/*` | Standard GitHub Pages CDN caching |
| **Base Resolution** | Root domain deployment | Subpath deployment support (e.g. `/GD-Webdesign/`) |

#### Important Guidelines
- **Do not fake form submission success** on GitHub Pages or add workarounds that imply non-existent delivery. Real contact form delivery requires a supported backend or Netlify host.
- **Do not state that `netlify.toml` security headers are active on GitHub Pages.** Distinguish repository configuration from headers delivered by the actual hosting platform.

---

## 4. Reusable Template Ecosystem

- Client boilerplate templates reside under `templates/` (e.g., `templates/one-pager-boilerplate/`).
- Templates must remain strictly client-neutral and generic.
- **Strict Prohibition**: Never hardcode client-specific credentials, private API tokens, unmasked email addresses, or specific business names inside master templates or core JS files.
- Store content in template-specific locale files (`templates/one-pager-boilerplate/locales/{de,en}.json`).

---

## 5. Completion Report Requirements

When completing a task or submitting a Pull Request, prepare a comprehensive completion report detailing:
1. **Summary of Changes**: Concise overview of modified files and functionality.
2. **Verification & Quality Gate Results**:
   - Output of unit test run (`npm test`).
   - Confirmation of minified Tailwind build (`npm run build`).
   - Responsive viewport checks across mobile, tablet, and desktop.
3. **Known Host Limitations**: Specific mention of GitHub Pages / Netlify runtime behavior if relevant.
4. **Proposed Next Steps**: 2–4 recommended follow-up actions for the project team.
