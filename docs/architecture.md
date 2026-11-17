# Architecture & Hosting Decisions — GD Webdesign

**Decision status:** Agreed target architecture; implementation is staged through the roadmap.  
**Last updated:** 2026-11-17

## 1. System boundaries

GD Webdesign is organized into three independently deployable website layers and a shared service layer.

| Area | Source repository | Hosting | Visibility |
|---|---|---|---|
| Agency website and initial master templates | Existing `GkhnDgl/GD-Webdesign` | Netlify project | Public website; private source repository after production migration |
| Internal dashboard | Separate private repository (to be created) | Separate Netlify project | Private, authenticated application |
| Each customer website | One private repository per actual customer project | One Netlify project per customer | Public customer website; private source repository |
| Shared backend | Dashboard-owned backend configuration and server functions | Supabase and Netlify Functions, subject to provider/plan verification | Authenticated and server-side only |

The existing repository remains the agency website and master-template source initially. A separate template repository is not required until operational scale makes that separation worthwhile.

## 2. Agency website hosting migration

Current state to preserve accurately:
- The GitHub repository is currently public.
- GitHub Pages is the current published preview/hosting route.
- The target production host is Netlify.
- The source repository is intended to become private before the production launch.

Migration sequence:
1. Audit tracked files, repository settings, Git history, workflows, forms, asset paths, and deployment assumptions.
2. Identify any credential or personal data exposure. Revoke/rotate any credential ever exposed in public history; a visibility change alone is not remediation.
3. Connect Netlify to the existing GitHub repository with least-privilege repository access. Configure the production branch, build command, publish directory, environment variables, and deploy protections.
4. Validate a Netlify deploy while GitHub Pages remains available as the fallback. Check the actual published revision, page assets, localization, navigation, forms, security headers, redirects, HTTPS, and responsive behavior.
5. Confirm the GitHub App installation and repository access will continue to work after the repository is made private. Then, with explicit user approval, change repository visibility to private.
6. Re-run the Netlify production deployment and all critical checks after the visibility change.
7. Configure the production domain and DNS, verify HTTPS and canonical URLs, and obtain user acceptance.
8. Only after successful acceptance, disable GitHub Pages and treat Netlify as the production source of truth.

Important distinctions:
- A private GitHub repository can publish a fully public website. Source visibility and deployed-site visibility are separate controls.
- Protect deploy previews and branch deploys; do not assume that private source automatically makes every preview private.
- GitHub Pages does not apply Netlify-specific settings from `netlify.toml`. Validate headers, redirects, caching, and form handling on Netlify itself.
- Do not claim a production migration is complete based only on a green CI or deploy job.

## 3. Internal dashboard

The dashboard is a separate private application, not an admin route in the public agency website.

### MVP modules

- **Overview:** leads, active customers, open tasks, service status, and key financial indicators.
- **Acquisition & Leads:** lead records, pipeline stages, website research, qualification/scoring, analysis notes, proposal preparation, contact drafts, approval workflow, and response history.
- **Customers:** customer and contact records, contracts, domains, websites, hosting projects, service requests, maintenance tasks, and activity history.
- **Tasks & Automations:** guided workflows, status tracking, notifications, and explicit confirmation before consequential actions.
- **Finance & Reporting:** read-only operational overview of setup revenue, recurring revenue, costs, contract/payment status, and customer-level profitability estimates. The MVP is not an accounting system and does not store bank or card credentials.

### Access and future extensibility

- Initially, only the owner has dashboard access.
- Design the data model so employee roles and a customer portal can be added later, without implementing either in the MVP.
- Require authenticated access and server-side authorization for every private data operation.
- Use least-privilege access, secure session handling, and MFA for administrative accounts where supported.
- Keep customer personal data out of the public agency repository and public template fixtures.

### Suggested service responsibilities

- **Supabase:** evaluate for relational data, authentication, and private file storage. Configure row-level security and test authorization boundaries before storing real customer data.
- **Netlify Functions:** privileged integrations and server-side operations. Secrets must be configured in Netlify environment variables and accessed only server-side.
- **Netlify hosting:** static dashboard frontend with authenticated backend access. A hidden URL is not access control.
- **Accounting provider:** evaluate a suitable external invoicing/bookkeeping tool separately. Integrate later if justified; do not build accounting into the dashboard MVP.

Provider choice, plan limits, pricing, data-processing agreements, retention, backups, and security settings must be checked before production use.

## 4. Lead acquisition workflow and safeguards

The intended assisted workflow is:
1. Research a local business and its publicly accessible website.
2. Record the minimum necessary business/lead information and source.
3. Analyze the website and qualify the lead with explainable criteria.
4. Prepare a tailored demo/proposal and contact draft.
5. Present the draft and proposed channel to the owner for review and approval.
6. Execute only actions that are legally permitted and specifically approved.
7. Track replies and follow-ups; retain the history.
8. Convert an interested prospect into a customer without losing the prior lead history.

Do not build indiscriminate scraping or automated cold-email campaigns. Before any outreach automation is enabled, verify the applicable legal basis, channel-specific marketing rules, data minimization, retention, and opt-out handling. The tool must not send messages or make external commitments without explicit approval.

## 5. Customer website operating model

- Create a private GitHub repository and an independent Netlify project when a real customer project begins.
- Initialize the customer repository from the approved client-neutral master template; never place real customer data back into the shared master template.
- Keep customer domains registered to the customer where possible. GDesign may manage DNS and technical settings under documented authorization.
- Initially perform domain provisioning, project setup, and deployment manually with a documented checklist. Automate only after the manual workflow has been proven.
- Keep each customer's deployment, environment variables, domain configuration, and access independent.

## 6. Automation and approval policy

Start with human-reviewed assistance. Require explicit confirmation before:
- changing repository visibility or permissions;
- changing production hosting, domains, DNS, or deployment settings;
- sending an external message or proposal;
- changing customer contract or payment state;
- deleting customer data or resources;
- triggering other irreversible or financially consequential operations.

Log important actions and their actor, timestamp, target, and result. Never report an action as successful until the provider confirms it.

## 7. Delivery sequence

The roadmap defines the staged delivery:
- **M1.4:** migrate the agency website from GitHub Pages to Netlify and make the source repository private after verification and approval.
- **M2.3:** deliver the private acquisition/CRM MVP while manual lead research and demo preparation continue.
- **M3.3:** extend the dashboard with active customer operations after the first pilot onboarding.
- **Later phases:** improve integrations and automation only when actual customer volume and operating evidence justify them.

