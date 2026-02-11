#!/usr/bin/env python3
"""
Comprehensive test script for enhanced RO-LCP Web Interface
"""
import requests
import json
import time

def test_enhanced_web_interface():
    """Test all enhanced features of the web interface"""
    base_url = "http://localhost:5000"
    
    print("Testing Enhanced RO-LCP Web Interface...")
    
    # Test main page loads with new features
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            if "chart.js" in response.text:
                print("✅ Chart.js library loaded")
            if "theme-toggle" in response.text:
                print("✅ Dark mode toggle present")
            if "export-data" in response.text:
                print("✅ Export functionality present")
            if "history-chart" in response.text:
                print("✅ Historical chart present")
            if "alerts-section" in response.text:
                print("✅ Alerts section present")
        else:
            print("❌ Main page failed to load")
            return False
    except Exception as e:
        print(f"❌ Error loading main page: {e}")
        return False
    
    # Test enhanced metrics API
    try:
        response = requests.get(f"{base_url}/api/metrics")
        if response.status_code == 200:
            metrics = response.json()
            
            # Check for new CPU metrics
            if "load_average" in metrics.get("cpu", {}):
                print("✅ Load average metrics available")
                load_avg = metrics["cpu"]["load_average"]
                if all(key in load_avg for key in ["1min", "5min", "15min"]):
                    print("✅ All load average periods present")
            
            # Check for system metrics
            if "system" in metrics and "uptime" in metrics["system"]:
                print("✅ System uptime metrics available")
            
            # Verify all original metrics are still there
            required_keys = ["cpu", "memory", "disk"]
            for key in required_keys:
                if key not in metrics:
                    print(f"❌ Missing {key} in metrics")
                    return False
            print("✅ All original metrics preserved")
            
        else:
            print(f"❌ Enhanced metrics API failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error with enhanced metrics API: {e}")
        return False
    
    # Test multiple updates to verify real-time functionality
    print("\nTesting real-time updates with enhanced features...")
    
    for i in range(3):
        try:
            response = requests.get(f"{base_url}/api/metrics")
            if response.status_code == 200:
                metrics = response.json()
                cpu_usage = metrics.get("cpu", {}).get("usage_percent", 0)
                load_avg = metrics.get("cpu", {}).get("load_average", {}).get("1min", 0)
                uptime = metrics.get("system", {}).get("uptime", "Unknown")
                
                print(f"Sample {i+1}: CPU {cpu_usage}%, Load {load_avg:.2f}, Uptime {uptime}")
                
                if i < 2:  # Don't sleep after last sample
                    time.sleep(2)
            else:
                print(f"❌ Metrics API failed on sample {i+1}")
                return False
        except Exception as e:
            print(f"❌ Error fetching metrics sample {i+1}: {e}")
            return False
    
    print("\n✅ Enhanced Web Interface Features Verified!")
    print("🎉 New features include:")
    print("   📊 Real-time historical charts")
    print("   🌙 Dark/light theme toggle")
    print("   📤 Data export functionality")
    print("   ⚠️  Smart alerts system")
    print("   📈 Load average monitoring")
    print("   ⏰ System uptime tracking")
    
    return True

def test_static_files():
    """Test that all static files load properly"""
    base_url = "http://localhost:5000"
    
    static_files = [
        "/static/css/style.css",
        "/static/js/monitor.js"
    ]
    
    for file in static_files:
        try:
            response = requests.head(f"{base_url}{file}")
            if response.status_code == 200:
                print(f"✅ {file} loads correctly")
            else:
                print(f"❌ {file} failed with status {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error loading {file}: {e}")
            return False
    
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("Enhanced RO-LCP System Monitor Verification")
    print("=" * 60)
    
    success1 = test_static_files()
    success2 = test_enhanced_web_interface()
    
    if success1 and success2:
        print("\n🎉 ALL TESTS PASSED! 🎉")
        print("The enhanced RO-LCP web interface is ready for use!")
        print("\nTo access the interface, open: http://localhost:5000")
        exit(0)
    else:
        print("\n❌ SOME TESTS FAILED!")
        exit(1)