#!/usr/bin/env python3
"""
Test script to verify the web interface functionality
"""
import requests
import json
import time

def test_web_interface():
    """Test that the web interface components work correctly"""
    base_url = "http://localhost:5000"
    
    print("Testing RO-LCP Web Interface...")
    
    # Test main page loads
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200 and "RO-LCP System Monitor" in response.text:
            print("✅ Main page loads correctly")
        else:
            print("❌ Main page failed to load")
            return False
    except Exception as e:
        print(f"❌ Error loading main page: {e}")
        return False
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            health = response.json()
            if health.get("status") == "healthy":
                print("✅ Health endpoint working")
            else:
                print("❌ Health endpoint not healthy")
                return False
    except Exception as e:
        print(f"❌ Error with health endpoint: {e}")
        return False
    
    # Test metrics API multiple times to verify real-time data
    print("\nTesting real-time metrics updates...")
    metrics_samples = []
    
    for i in range(3):
        try:
            response = requests.get(f"{base_url}/api/metrics")
            if response.status_code == 200:
                metrics = response.json()
                metrics_samples.append(metrics)
                cpu_usage = metrics.get("cpu", {}).get("usage_percent", 0)
                print(f"Sample {i+1}: CPU {cpu_usage}%")
                
                if i < 2:  # Don't sleep after last sample
                    time.sleep(2)
            else:
                print(f"❌ Metrics API failed on sample {i+1}")
                return False
        except Exception as e:
            print(f"❌ Error fetching metrics sample {i+1}: {e}")
            return False
    
    # Verify metrics structure
    required_keys = ["cpu", "memory", "disk"]
    for i, metrics in enumerate(metrics_samples):
        for key in required_keys:
            if key not in metrics:
                print(f"❌ Missing {key} in metrics sample {i+1}")
                return False
    
    print("✅ All required metrics present")
    print("✅ Web interface verification complete!")
    return True

if __name__ == "__main__":
    success = test_web_interface()
    exit(0 if success else 1)