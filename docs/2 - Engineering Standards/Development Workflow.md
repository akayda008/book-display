# Development Workflow

## Branch Strategy

| Branch      | Purpose                                                                   |
| ----------- | -------------------------------------------------------------------------- |
| `main`      | Production only — updated when a sub-project is fully completed, not during development. Starts from the initial project setup (`ad533e3`), separate history from `develop` until a merge is deliberately made. |
| `develop`   | Integration branch — all sub-project work happens here. This is the renamed former `main` (all prior commit history lives here). |
| `feature/*` | One branch per sub-project (e.g. `feature/rich-text-formatting`), branched off `develop` |
| `bug/*`     | Fixes for issues found after a sub-project's branch has already merged into `develop`, branched off `develop` |

Sub-projects are built and merged in the dependency order set out in the Roadmap, specifically to avoid parallel `feature/*` branches conflicting on the shared files (`Book.tsx`, `types/book.ts`, `utils/pagination.ts`).

## Feature Development
1. Confirm the sub-project's design is finalized (see the design/grilling notes for that sub-project).
2. Create `feature/<sub-project-name>` off `develop`.
3. Understand the existing implementation before changing it.
4. Implement the sub-project per its design.
5. Test manually (see Testing below).
6. Update documentation if the sub-project changed something these docs describe.
7. Merge into `develop`.

## Bug Fixes
1. Reproduce and understand the bug.
2. Create `bug/<short-description>` off `develop`.
3. Identify the root cause.
4. Implement the fix.
5. Test the fix and check for regressions.
6. Merge into `develop`.

## Promoting to Production
When a sub-project (or a batch of them) is fully complete and ready for production, merge `develop` into `main`. This is a separate, deliberate step — `main` never receives a direct commit or a `feature/*`/`bug/*` merge.

## Documentation
Documentation should:
- Be simple and easy to understand.
- Explain the system at the appropriate level.
- Be updated when important behaviour changes.
- Avoid documenting information that is already obvious from the code.

## Testing
No automated test suite is required for this project. Testing is manual:

### During Development
- Click through the feature itself.
- Check edge cases named in that sub-project's design/grilling notes (e.g. rapid clicks mid-animation, malformed markdown, an odd page count).

### After Merging
- Confirm the newly merged sub-project still works.
- Spot-check that earlier sub-projects weren't broken (particularly anything touching `Book.tsx`, `types/book.ts`, or `utils/pagination.ts`).

### Before Release
- No release process exists yet — there is no deployment target. This section will be filled in once one is chosen.

## Releases
No deployment target exists yet (local development only). This section is a placeholder until one is chosen.
