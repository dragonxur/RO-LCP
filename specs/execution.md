# Execution Spec

## Purpose
Defines a deterministic, auditable execution record for Ralph tasks.

## Execution Record Schema

```json
{
  "task": "string",
  "command": ["string"],
  "status": "success | failure",
  "exit_code": "number",
  "started_at": "ISO-8601 UTC",
  "finished_at": "ISO-8601 UTC",
  "duration_ms": "number",
  "stdout": "string",
  "stderr": "string",
  "artifacts": ["string"]
}
