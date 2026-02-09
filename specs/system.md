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
