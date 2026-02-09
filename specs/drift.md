# System Drift Detection Contract

The drift detection agent must output a JSON object with the following structure:

{
  "cpu_drift": {
    "previous": number,
    "current": number,
    "delta": number
  },
  "memory_drift": {
    "previous_free_mb": number,
    "current_free_mb": number,
    "delta_mb": number
  },
  "disk_drift": {
    "previous_free_gb": number,
    "current_free_gb": number,
    "delta_gb": number
  },
  "status": "stable" | "drift_detected"
}
