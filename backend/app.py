from flask import Flask, render_template, jsonify
import subprocess
import json
import re

import os
template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'templates'))
static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'static'))

app = Flask(__name__, 
    template_folder=template_dir,
    static_folder=static_dir)

def get_cpu_usage():
    """Get CPU usage percentage"""
    try:
        cmd = "top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        cpu_usage = float(result.stdout.strip())
        return cpu_usage
    except (ValueError, subprocess.CalledProcessError):
        return 0.0

def get_memory_info():
    """Get memory information in MB"""
    try:
        cmd = "free -m | grep '^Mem:' | awk '{print $2,$3,$4}'"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        memory_data = result.stdout.strip().split()
        
        return {
            "total_mb": int(memory_data[0]),
            "used_mb": int(memory_data[1]),
            "free_mb": int(memory_data[2])
        }
    except (ValueError, subprocess.CalledProcessError, IndexError):
        return {"total_mb": 0, "used_mb": 0, "free_mb": 0}

def get_disk_info():
    """Get disk information in GB"""
    try:
        cmd = "df -h / | tail -1 | awk '{print $2,$3,$4}'"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        disk_data = result.stdout.strip().split()
        
        # Convert from human readable format to GB
        def convert_to_gb(size_str):
            if size_str.endswith('G'):
                return float(size_str[:-1])
            elif size_str.endswith('M'):
                return float(size_str[:-1]) / 1024
            elif size_str.endswith('T'):
                return float(size_str[:-1]) * 1024
            else:
                return float(size_str)
        
        return {
            "mount": "/",
            "total_gb": round(convert_to_gb(disk_data[0]), 2),
            "used_gb": round(convert_to_gb(disk_data[1]), 2),
            "free_gb": round(convert_to_gb(disk_data[2]), 2)
        }
    except (ValueError, subprocess.CalledProcessError, IndexError):
        return {"mount": "/", "total_gb": 0, "used_gb": 0, "free_gb": 0}

def get_load_average():
    """Get system load average"""
    try:
        cmd = "cat /proc/loadavg | awk '{print $1,$2,$3}'"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        load_data = result.stdout.strip().split()
        
        return {
            "1min": float(load_data[0]),
            "5min": float(load_data[1]), 
            "15min": float(load_data[2])
        }
    except (ValueError, subprocess.CalledProcessError, IndexError):
        return {"1min": 0.0, "5min": 0.0, "15min": 0.0}

def get_uptime():
    """Get system uptime in a human readable format"""
    try:
        cmd = "cat /proc/uptime"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        uptime_seconds = float(result.stdout.strip().split()[0])
        
        # Convert to days, hours, minutes
        days = int(uptime_seconds // 86400)
        hours = int((uptime_seconds % 86400) // 3600)
        minutes = int((uptime_seconds % 3600) // 60)
        
        if days > 0:
            return f"{days}d {hours}h {minutes}m"
        elif hours > 0:
            return f"{hours}h {minutes}m"
        else:
            return f"{minutes}m"
    except (ValueError, subprocess.CalledProcessError, IndexError):
        return "Unknown"

@app.route('/')
def index():
    """Serve the main monitoring page"""
    return render_template('index.html')

@app.route('/api/metrics')
def get_metrics():
    """Return current system metrics as JSON"""
    metrics = {
        "cpu": {
            "usage_percent": get_cpu_usage(),
            "load_average": get_load_average()
        },
        "memory": get_memory_info(),
        "disk": get_disk_info(),
        "system": {
            "uptime": get_uptime()
        }
    }
    return jsonify(metrics)

@app.route('/health')
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    print("Starting RO-LCP System Monitor...")
    print("Access the monitor at: http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)