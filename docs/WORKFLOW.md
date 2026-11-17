# Project Workflow & Quality Management Guidance — GD Webdesign

This document defines the standard operating procedures, quality gates, decision management rules, and technical conventions for the GD Webdesign repository ecosystem.

---

## 1. Core Workflow & Operations

### 1.1 Development & Branching Model
- All development, bug fixes, and documentation changes must be delivered via Git pull requests targeting the `main` branch.
- Never commit directly to `main` or merge PRs without explicit review and user approval.
- Branch naming convention:
  - `feat/<feature-description>`
  - `bug/<bug-description>` or `fix/<fix-description>`
  - `docs/<doc-description>`
- Google Jules is not part of the active project workflow. Do not assign work to Jules or add a `jules` label.
- Use maintainer-led implementation and review. GitHub Copilot or other review assistance may be used where available, but a tool's review is not a substitute for maintainer verification.

### 1.2 Iterative Decision Management
After every significant workflow milestone or recurring technical step, propose 2–4 relevant next actions and recommend one with a brief rationale. Do not ask the user to choose when the next action is already explicitly requested and authorized.

---

## 2. Quality Gates & Verification Standards

A green CI build or successful deployment alone is insufficient proof that a change is ready.

### Quality Gate Checklist
1. **Automated tests:** run `npm test` (`node --test`). All relevant tests must pass with zero failures. Include regression tests for bug fixes and localization changes.
2. **Build integrity:** run `npm run build` and confirm the generated Tailwind CSS has no syntax or purging errors.
3. **Responsive verification:** test mobile (`sm`), tablet (`md`), desktop (`lg`), and large-screen (`xl`) layouts. Check navigation, overflow, and touch-target usability.
4. **i18n consistency:** German (`de.json`) and English (`en.json`) locale files must retain matching key hierarchies and complete translations.
5. **Accessibility and CSP:** maintain keyboard navigation, semantic markup, accessible names, and appropriate ARIA state. Do not introduce inline styles or scripts that violate the configured Content Security Policy.
6. **Security and privacy:** do not commit credentials, private tokens, customer personal data, or unmasked customer email addresses. Keep secrets in server-side environment variables.

Manual browser checks must be reported separately from automated tests. Never mark a manual check as passed without evidence.

---

## 3. Hosting & Deployment Environment Rules

### 3.1 Current state and target state
- **Current state:** the repository is public and GitHub Pages remains the existing published preview/hosting route.
- **Agreed target:** the agency website is publicly served by Netlify, while the GitHub source repository is private before production launch.
- A private source repository does not make the deployed website private. Source visibility, Netlify site visibility, and deploy-preview access are separate settings.
- Customer websites will use an independent private GitHub repository and independent Netlify project per actual customer project.
- The internal dashboard will use its own private repository and separate authenticated Netlify project. It must not be placed under the public agency website as an `/admin` route.

### 3.2 Agency website migration sequence
1. Audit repository contents, Git history, Actions, forms, paths, and current deployment configuration.
2. Revoke/rotate any credentials that were ever exposed in public history. Making a repository private does not undo prior exposure.
3. Connect Netlify to the existing repository using least-privilege GitHub App permissions. Configure production branch, build command, publish directory, environment variables, and deploy protections.
4. Verify a Netlify deployment while GitHub Pages remains available as fallback. Test the published revision, assets, localization, forms, redirects, security headers, HTTPS, and critical user journeys.
5. With explicit user approval, switch the GitHub repository to private only after confirming the Netlify integration continues to work.
6. Re-run the production deployment and checks after the visibility change.
7. Configure the production domain/DNS and HTTPS; obtain user acceptance.
8. Disable GitHub Pages only after Netlify production behavior is verified and accepted.

Do not initiate a production deployment, repository visibility change, DNS change, or retirement of the existing host without explicit user approval.

### 3.3 Platform-specific behavior
- GitHub Pages does not apply `netlify.toml` headers, redirects, caching, or form handling.
- Do not fake contact-form success on a host that does not process submissions.
- Validate security headers, form delivery, redirects, and caching on the actual Netlify deployment.
- Protect deploy previews and branch deploys separately; do not assume private source code automatically protects all generated URLs.
- A green GitHub Actions run does not prove that the intended revision is live or that the site works.

---

## 4. Repository and Application Boundaries

- The existing `GD-Webdesign` repository contains the agency website and the initial client-neutral master-template ecosystem.
- The internal dashboard belongs in a separate private repository and separate Netlify project.
- Each actual customer website belongs in its own private repository and Netlify project. Create these when a customer project begins, not in advance.
- Do not place customer-specific private data, credentials, or production environment files in the shared agency repository or master templates.
- Keep master templates generic. Customer-specific content belongs only in the respective customer project/configuration.
- Shared backend services may be used by the dashboard, but access must be authenticated and authorized server-side. See `docs/architecture.md`.

---

## 5. Dashboard, Data, and Automation Rules

### 5.1 Dashboard scope
The dashboard is initially owner-only and includes:
- Overview of leads, customers, open tasks, service status, and key financial indicators.
- Acquisition/CRM pipeline with research notes, qualification, proposal/contact drafts, approvals, and response history.
- Customer records, contacts, contracts, domains, websites/hosting projects, service requests, maintenance tasks, and activity history.
- A read-only operational finance overview; it is not an accounting or invoicing system.
- Guided tasks and automations with explicit confirmation before consequential actions.

Employee roles and a customer portal may be added later but are not MVP scope.

### 5.2 Backend and secrets
- Evaluate Supabase for database, authentication, and private file storage; validate row-level security and authorization before real customer data is stored.
- Use Netlify Functions for privileged server-side operations.
- Store secrets only in server-side environment variables. Never expose service-role keys or privileged credentials in browser code, public configuration, or Git history.
- Select provider plans, retention, backups, data-processing terms, and security controls before production use.

### 5.3 Lead research and outreach
- Store only the minimum necessary lead information and retain its source.
- Use AI for analysis and draft preparation, not unreviewed external action.
- Do not automate indiscriminate scraping or unsolicited bulk email.
- Verify applicable privacy and channel-specific marketing rules before any outreach. Require user review and explicit approval before sending a message or making an external commitment.
- Track opt-outs and honor them in subsequent workflows.

### 5.4 Approval and audit
Require explicit user confirmation before changing repository visibility, production settings, domains/DNS, sending external communications, changing contract/payment status, or deleting resources. Record consequential actions with actor, timestamp, target, and result. Report success only after provider confirmation.

---

## 6. Reusable Template Ecosystem

- Client boilerplate templates reside under `templates/` (e.g., `templates/one-pager-boilerplate/`).
- Templates must remain strictly client-neutral and generic.
- Never hardcode client-specific credentials, private API tokens, unmasked email addresses, or real customer data in master templates or core JS files.
- Store content in template-specific locale files (`templates/one-pager-boilerplate/locales/{de,en}.json`).

---

## 7. Completion Report Requirements

When completing a task or submitting a Pull Request, report:
1. Summary of changes and affected files.
2. Exact automated test/build commands run and their results.
3. Responsive, accessibility, localization, and browser checks actually performed; mark unperformed checks as unverified.
4. Known host limitations and the actual published revision where applicable.
5. Remaining risks, blockers, required user verification, and 2–4 relevant next steps with one recommendation.

Do not mark a milestone complete solely because a PR was merged or CI passed. Evaluate its acceptance criteria and required manual verification.
