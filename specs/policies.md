# Policy Specification Contract

Policies define deterministic rules that evaluate system drift
and classify system state into acceptable, warning, or violation.

## Policy Structure

Policies are expressed in YAML and grouped by domain.

Example structure:

```yaml
cpu:
  max_drift_percent: number

memory:
  min_free_mb: number

disk:
  min_free_gb: number
