# System Metrics Output Contract

The system monitoring agent must output a JSON object with the following structure:

{
  "cpu": {
    "usage_percent": number
  },
  "memory": {
    "total_mb": number,
    "used_mb": number,
    "free_mb": number
  },
  "disk": {
    "mount": string,
    "total_gb": number,
    "used_gb": number,
    "free_gb": number
  }
}

All values must be derived from real system commands.
## Validation Output

Upon successful validation, the agent MUST write a validation artifact at:

artifacts/system/validation_result.json

With the following structure:

{
  "status": "valid" | "invalid",
  "validated_at": string,
  "spec": "system.md"
}
