# HTSG Customer Voice Review and Remediation

## Review Lens
This review was performed from the perspective of a senior QA field user, project controls user, and core product team.

## Critical Gaps Observed
1. The product still leaked prototype language and lowered user trust.
2. Section screens were too browse-heavy and weak on "what needs attention now?"
3. Record views did not clearly communicate next action, ownership pressure, or closure expectation.
4. Some screens still carried broken character encoding that would immediately damage confidence.
5. Project entry did not rank work by urgency strongly enough.

## Resolution Plan
1. Remove prototype-facing copy and broken characters.
2. Rework section pages around an attention-first operating pattern.
3. Improve record workbench behavior with real filtering, fast create, export, and clearer detail context.
4. Strengthen project landing so users know what to open first.
5. Keep the app private and local while persistence and production auth are hardened.

## Actions Implemented
- Replaced meta review panels with a user-facing attention board.
- Improved the project landing page with urgency-based ordering and clearer next-step CTAs.
- Upgraded section workbenches with real filters, reset, CSV export, inline creation, and better empty states.
- Improved record detail guidance around required next move, field evidence, comments, and audit history.
- Removed or softened prototype language in sign-in and workflow copy.
- Corrected broken characters in the affected files.

## Next Build Moves
1. Replace the mock data store with Prisma-backed repositories.
2. Add true role-bound permissions into mutation paths.
3. Add persistent attachments and evidence upload.
4. Add notification jobs for overdue actions, escalations, and review queues.
5. Add dedicated mobile optimization for inspection and deficiency creation.