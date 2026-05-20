# Accessibility Readiness - Digital Twin Lite

Digital Twin Lite is designed to support accessibility audit readiness for public-sector, education, nonprofit, and business use.

This document does not claim Section 508, WCAG, or VPAT certification. It documents implemented practices and the intended audit target.

## Current Accessibility Practices

- Semantic page landmarks: `header`, `main`, and `footer`
- Keyboard-accessible form controls and scenario buttons
- Visible keyboard focus states
- Skip link for jumping directly to main content
- Form labels associated with inputs
- Helper text connected to relevant fields
- Live status regions for errors, simulation results, and comparison insights
- Non-blocking input cautions announced through a status region
- Reduced-motion support for users who prefer less animation
- Responsive layouts for desktop and mobile use

## Audit Targets

- Section 508-oriented accessibility practices for U.S. public-sector ICT review
- WCAG 2.2 AA as the practical web accessibility target
- Keyboard operability
- Clear labels and instructions
- Sufficient status messaging for assistive technologies
- Reduced-motion support

## Audit Evidence To Maintain

- Frontend tests covering critical form behavior
- Manual keyboard walkthrough notes before release
- Screen reader spot checks for form labels, status messages, and scenario results
- Keyboard and screen reader checks for the export report workflow
- Color contrast review for HUD text, buttons, focus states, and warnings
- Reduced-motion verification
- Browser/mobile viewport screenshots for layout review

## Notes

Accessibility should be reviewed with automated checks and human testing before use in regulated environments.
