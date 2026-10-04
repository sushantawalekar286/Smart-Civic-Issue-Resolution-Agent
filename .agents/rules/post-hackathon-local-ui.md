POST-HACKATHON LOCAL UI DEVELOPMENT RULES

1. Only one developer is currently working on the project.
2. Current development work is UI/UX focused.
3. UI changes are local-only unless the owner explicitly asks to commit/push.
4. Never automatically create commits.
5. Never automatically push to GitHub.
6. Never create pull requests.
7. Never merge branches.
8. Never switch branches without explicit permission.
9. Never modify backend/API/database/business logic for a UI task.
10. Preserve all existing working functionality.
11. Test UI changes locally before reporting completion.
12. Keep changes reversible and clearly report modified files.
13. Do not remove existing functionality just to simplify UI implementation.
14. Do not introduce unnecessary dependencies.
15. Do not modify production environment variables or deployment configuration during UI-only work.
16. If a backend change appears necessary, STOP and report it instead of changing backend code.
17. Do not expose, modify, or commit secrets.
18. GitHub visibility is not required for local UI experimentation.

IMPORTANT:
The agent must treat the local working tree as the development environment.
Uncommitted changes are intentional.
