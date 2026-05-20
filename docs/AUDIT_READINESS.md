# Audit Readiness - Digital Twin Lite

Digital Twin Lite is not certified against any legal, security, privacy, medical, or accessibility framework. This document describes the project areas that have been prepared for future review by companies, universities, nonprofits, public-sector teams, or independent auditors.

## Readiness Targets

| Area | Target | Current Evidence |
|------|--------|------------------|
| Accessibility | Section 508-oriented practices and WCAG 2.2 AA target | `docs/ACCESSIBILITY.md`, semantic landmarks, skip link, keyboard focus states, live status regions, reduced-motion support |
| Testing | Repeatable backend and frontend checks | `backend/tests/`, `frontend/src/components/InputForm.test.jsx`, `npm test`, `pytest` |
| Licensing | Business-friendly open-source use with attribution | Apache-2.0 `LICENSE`, `NOTICE`, third-party notices |
| Privacy | Local data handling for MVP | `docs/DISCLAIMERS.md`; no external analytics or third-party health data integrations currently documented |
| Safety | Wellness-only positioning | README disclaimer, `docs/DISCLAIMERS.md`, model limitation text in API responses |
| Explainability | Deterministic model assumptions | `backend/app/simulation/engine.py`, model explanation response fields, assumptions panel |
| API Review | Documented request/response contracts | `docs/API_SPEC.md`, Pydantic validation schemas |
| Reporting | Shareable decision artifact | Exportable HTML report with assumptions, limitations, and attribution |

## Recommended Pre-Audit Checklist

- Run backend tests: `python -m pytest tests/ -q`
- Run frontend tests: `npm test`
- Run frontend production build: `npm run build`
- Confirm keyboard-only navigation through input form, custom scenario controls, period selector, scenario cards, and time slider
- Confirm screen reader announcements for errors, projection status, and compare insight
- Confirm input cautions appear for unusual values and do not block submission
- Confirm exported reports include assumptions, limitations, and attribution
- Review color contrast for all text, buttons, charts, and focus states
- Review health/wellness copy for overpromising language
- Review dependency licenses and package vulnerability reports
- Confirm no analytics, telemetry, or external health-data transmission has been added without documentation
- Confirm `LICENSE`, `NOTICE`, and `THIRD_PARTY_NOTICES.md` are included in distributed packages

## Standards Notes

- Section 508 is relevant for U.S. public-sector ICT accessibility review.
- WCAG 2.2 is the current W3C Recommendation and is the practical accessibility target for this project.
- A formal VPAT or accessibility conformance report should be completed only after dedicated automated and human accessibility testing.

## Non-Claims

Digital Twin Lite does not currently claim:

- Section 508 certification
- WCAG conformance certification
- HIPAA compliance
- FDA/medical device status
- SOC 2, ISO 27001, or similar security certification
- Clinical validation
