# ADR-003 Motion for the shelf-opening transition, not native View Transitions or GSAP

## Context
The library/shelf view needed an opening transition from a clicked book card into the reader, across a real route change.

## Decision
Use Motion (formerly Framer Motion) for the transition.

## Reason
Cross-browser consistent, purpose-built layout-animation feature for exactly this "card grows into page" effect.

## Alternatives Considered
### Native View Transitions API
Already available in this exact Next.js 16.1.6 / React 19.2.3 stack, zero dependency. But the API is still evolving (`unstable_` prefix in Next.js), and browser support (~78% at the time of this decision) means real fallback behaviour to account for.
### GSAP
Better suited to a heavily choreographed, imperative animation — the likely tool for a *future* literal "grab the spine and pull it out" shelf gesture once illustrated shelf art exists. Overkill for the generic version needed now.

## Consequences
### Positive
- Consistent behaviour regardless of browser.
- Can be swapped for GSAP later specifically when the more elaborate illustrated gesture is being built, without that being a regret now.
### Negative
- Adds a real dependency (vs. the native API's zero-dependency option).

## Status
Accepted
