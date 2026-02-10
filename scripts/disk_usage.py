#!/usr/bin/env python3
import json
import shutil
from datetime import datetime

disk = shutil.disk_usage("/")

result = {
    "timestamp": datetime.utcnow().isoformat() + "Z",
    "disk": {
        "mount": "/",
        "total_gb": round(disk.total / (1024**3)),
        "used_gb": round(disk.used / (1024**3)),
        "free_gb": round(disk.free / (1024**3)),
    }
}

print(json.dumps(result, indent=2))
