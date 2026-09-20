## Project Collaboration

This repository is developed by 4 developers on separate laptops.

Primary goals:

1. Working prototype within the hackathon deadline
2. Minimal Git merge conflicts
3. Clear ownership of files/modules
4. Modular development
5. Easy integration between developers
6. Stable demo-ready main branch

---

## Git Branch Rules

Use:

main
develop
feature/<feature-name>
fix/<bug-name>

Rules:

* NEVER develop directly on main.
* main must remain stable and demo-ready.
* develop is the integration branch.
* Each developer should normally work on their own feature branch.
* Use descriptive branch names.
* Do not force push.
* Do not automatically delete branches.
* Do not rewrite shared Git history.
* Do not use destructive Git commands without explicit developer approval.

Never automatically execute:

git push --force
git reset --hard
git clean -fd
git branch -D
git checkout .

If a destructive Git operation appears necessary, STOP and ask the developer.

---

## BEFORE MODIFYING CODE

Before making significant changes:

Run/check:

git status
git branch
git log --oneline -5

Understand:

* Current branch
* Existing modifications
* Recent commits
* Files changed by other developers

NEVER overwrite uncommitted work belonging to another developer.

---

## FILE OWNERSHIP

Developers should work mainly inside their assigned modules.

Avoid modifying files owned by another developer unless integration requires it.

If another developer's changes are detected:

* Preserve them.
* Do not overwrite them.
* Do not revert them.
* Do not refactor them unnecessarily.
* Integrate carefully.

If ownership is unclear, inspect:

docs/team-ownership.md

If the file does not exist yet, do not invent ownership. Ask the project lead when necessary.

---

## MINIMIZE MERGE CONFLICTS

Avoid unnecessary modifications to shared files.

High-conflict files include:

package.json
README.md
client/src/App.jsx
client/src/main.jsx
server/src/app.js
server/src/server.js
configuration files
global CSS files
shared documentation

When possible:

* Create a new modular file instead of editing a shared file.
* Keep imports organized.
* Keep components small.
* Keep services separated.
* Keep routes separated.
* Keep controllers separated.
* Keep AI logic separated.

Do NOT perform large unrelated refactors while implementing a feature.

---

## NO UNRELATED CHANGES

When implementing a feature:

ONLY modify files required for that feature.

Do not:

* Rename unrelated files
* Reformat the entire project
* Change unrelated components
* Upgrade dependencies unnecessarily
* Rewrite existing architecture
* Delete another developer's code
* Change APIs without checking the API contract

---

## API CONTRACT RULE

Frontend and backend developers must communicate through documented API contracts.

API information should be maintained in:

docs/api-contract.md

For every API, document where appropriate:

* HTTP method
* Endpoint
* Authentication requirement
* Request body
* Query parameters
* Response structure
* Error responses
* Expected status codes

Do not silently change an existing API contract.

If an API must change:

1. Check existing usage.
2. Update the contract.
3. Update affected frontend/backend code.
4. Mention the breaking change in the commit/PR description.

---

## ENVIRONMENT VARIABLES

NEVER commit:

.env
API keys
Gemini keys
MongoDB credentials
JWT secrets
private credentials

Only commit:

.env.example

Use placeholder values such as:

PORT=
MONGO_URI=
GEMINI_API_KEY=
JWT_SECRET=

Never hardcode secrets inside source code.

---

## COMMITS

Use clear conventional commit messages.

Examples:

feat: add complaint classification service
feat: add complaint submission API
feat: add civic issue dashboard
fix: resolve complaint status update bug
fix: handle invalid location input
docs: update API contract
refactor: separate AI services

Do not make meaningless commits such as:

update
changes
final
test
abc
done

Keep commits focused on one logical change.

---

## TESTING BEFORE COMMIT

Before committing a feature:

1. Run the relevant application.
2. Test the changed functionality.
3. Check for console errors.
4. Check backend errors.
5. Check API responses.
6. Make sure unrelated features still work.
7. Review changed files.

Do not claim a feature works unless it has been tested.

---

## MERGE SAFETY

Before merging or creating a pull request:

1. Check git status.
2. Review changed files.
3. Review the diff.
4. Check for conflicts.
5. Test the feature.
6. Make sure no secrets are included.
7. Make sure no unrelated files were modified.

Never blindly resolve merge conflicts.

When resolving conflicts:

* Understand both changes.
* Preserve valid work from both developers where possible.
* Do not choose "ours" or "theirs" blindly.
* Test after resolving conflicts.

---

## DEVELOPER COMMUNICATION

After completing a task, report:

### Implemented

What was added.

### Files Changed

List the important files.

### API Changes

Mention new or changed APIs.

### Testing

Mention what was tested.

### Integration Notes

Mention anything another developer needs to know.

### Remaining Issues

Mention known problems honestly.

---

## GOLDEN RULE

**DO NOT BREAK ANOTHER DEVELOPER'S WORK TO COMPLETE YOUR TASK.**

Prefer modular additions over modifications to shared files.
