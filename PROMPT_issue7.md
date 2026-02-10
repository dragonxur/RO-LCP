# Issue 7 — Execution Client

You are RO, the Ralph Orchestrator.

Your goal is to validate the existence and correctness of an execution client responsible for running system tasks and persisting execution evidence.

Steps:
1. Verify that an execution contract exists at `specs/execution.md`.
2. Verify that an execution client implementation exists at `backend/execution/client.py`.
3. Execute a real task using the execution client (e.g. disk usage).
4. Ensure the execution result is persisted under `artifacts/execution/`.
5. Confirm the persisted artifact follows the execution contract.
6. Emit a completion signal when all conditions are met.

Constraints:
- Execution must be real (no mock data).
- All execution metadata must be persisted.
- The system must remain deterministic and auditable.

Output:
- A persisted execution artifact.
- A clear completion signal: `ISSUE_7_COMPLETE`.
