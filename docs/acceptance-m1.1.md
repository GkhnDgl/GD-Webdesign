# M1.1 Acceptance Record

**Record date:** 2026-10-28  
**Milestone:** M1.1 — GitHub repository, workflows, responsive Master Template A, local fonts  
**Planned milestone window:** 2026-11-01 to 2026-11-10  
**Repository:** [GkhnDgl/GD-Webdesign](https://github.com/GkhnDgl/GD-Webdesign)  
**Live site:** https://gkhndgl.github.io/GD-Webdesign/

## Verification Summary

| Check | Status | Evidence / Notes |
|---|---|---|
| Changes are present on `main` | Passed | Current main commit at review time: [`e50a9374`](https://github.com/GkhnDgl/GD-Webdesign/commit/e50a9374e29ce250685b7fca5a446d00405ad070). |
| Automated build and test workflow | Passed in GitHub Actions | [Build Check run](https://github.com/GkhnDgl/GD-Webdesign/actions/runs/40708752702) completed successfully. The workflow completed dependency installation and the build step; the repository build script invokes `npm test` and `npm run build`. This is CI evidence, not a separate local execution by the reviewer. |
| GitHub Pages deployment | Passed | [Deploy GitHub Pages run](https://github.com/GkhnDgl/GD-Webdesign/actions/runs/40709933121) completed successfully for `main` at commit `e50a9374`. |
| Agency homepage manual check | Passed — user verified | User reported the published agency homepage passed. No screenshots or additional observations were supplied. |
| Master Template A manual check | Passed — user verified | User reported the published template passed. No screenshots or additional observations were supplied. |
| Responsive manual check | Passed — user verified | User reported responsive behavior passed. Viewport-specific screenshots or dimensions were not supplied. |
| Independent browser verification by reviewer | Not performed | The reviewer could not independently access the live site through the available browser environment. Do not represent this as an independent visual audit. |
| Contact form on GitHub Pages | Known hosting limitation | Per `docs/WORKFLOW.md`, GitHub Pages does not process Netlify Forms; form submissions return HTTP 405. Do not treat form delivery as verified on GitHub Pages. |
| Security headers on GitHub Pages | Known hosting limitation | Headers configured in `netlify.toml` are not enforced by GitHub Pages. |

## Assessment

The repository contains the implementation work associated with Master Template A, and the latest available GitHub Actions build and Pages deployment completed successfully. The user has also confirmed that the live agency page, template page, and responsive behavior passed manual checks.

The manual checks are recorded as user-reported results; no screenshots, viewport-by-viewport evidence, or independent browser audit were supplied. The automated result is from GitHub Actions, not a separately executed local test run.

**Status recommendation:** Implementation and reported manual checks are positive. Keep formal M1.1 milestone status aligned with the planned window and its full scope; M1.2's `config.json` extraction and under-20-minute sample-business setup are explicitly separate work and are not covered by this record.

## Outstanding / Out of Scope

- Attach screenshots and viewport dimensions if stronger visual audit evidence is required.
- Validate form delivery on a host that actually supports it (e.g. Netlify) before claiming production form handling.
- M1.2 configuration-driven content extraction and timed sample-business setup remain outside this M1.1 record.

## Sources

- [Roadmap](roadmap.md)
- [Workflow and quality gates](WORKFLOW.md)
- [Master Template A PR #17](https://github.com/GkhnDgl/GD-Webdesign/pull/17)
- [Workflow/localization follow-up PR #24](https://github.com/GkhnDgl/GD-Webdesign/pull/24)
- [Build Check](https://github.com/GkhnDgl/GD-Webdesign/actions/runs/40708752702)
- [GitHub Pages deployment](https://github.com/GkhnDgl/GD-Webdesign/actions/runs/40709933121)
