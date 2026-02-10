import subprocess
import time
import json
import os
from datetime import datetime, timezone
from pathlib import Path

class ExecutionClient:
    def __init__(self, artifacts_dir: str = "artifacts/execution"):
        self.artifacts_dir = Path(artifacts_dir)
        self.artifacts_dir.mkdir(parents=True, exist_ok=True)

    def run(self, task: str, command: list[str], persist: bool = True):
        started_at = datetime.now(timezone.utc)
        start = time.time()

        proc = subprocess.run(
            command,
            capture_output=True,
            text=True
        )

        finished_at = datetime.now(timezone.utc)
        duration_ms = int((time.time() - start) * 1000)

        result = {
            "task": task,
            "command": command,
            "status": "success" if proc.returncode == 0 else "failure",
            "exit_code": proc.returncode,
            "started_at": started_at.isoformat(),
            "finished_at": finished_at.isoformat(),
            "duration_ms": duration_ms,
            "stdout": proc.stdout,
            "stderr": proc.stderr,
            "artifacts": []
        }

        if persist:
            self._persist_result(result)

        return result

    def _persist_result(self, result: dict):
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        filename = f"{result['task']}_{timestamp}.json"
        filepath = self.artifacts_dir / filename
        
        # Create copy without artifacts for persistence
        result_copy = result.copy()
        result_copy["artifacts"] = []
        
        with open(filepath, 'w') as f:
            json.dump(result_copy, f, indent=2)
        
        result["artifacts"].append(str(filepath))
