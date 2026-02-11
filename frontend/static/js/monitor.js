class SystemMonitor {
    constructor() {
        this.updateInterval = 5000; // 5 seconds
        this.maxHistoryPoints = 20;
        this.historyData = {
            timestamps: [],
            cpu: [],
            memory: [],
            disk: []
        };
        this.isDarkMode = false;
        this.chart = null;
        this.alerts = [];
        this.init();
    }

    init() {
        this.loadTheme();
        this.setupEventListeners();
        this.initChart();
        this.startMonitoring();
        this.updateLastUpdateTime();
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Export data
        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        this.isDarkMode = savedTheme === 'dark';
        this.applyTheme();
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        this.applyTheme();
        localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
        
        const themeBtn = document.getElementById('theme-toggle');
        themeBtn.textContent = this.isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
    }

    applyTheme() {
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        
        // Update chart theme
        if (this.chart) {
            const textColor = this.isDarkMode ? '#ecf0f1' : '#333';
            const gridColor = this.isDarkMode ? '#555' : '#ddd';
            
            this.chart.options.scales.x.ticks.color = textColor;
            this.chart.options.scales.y.ticks.color = textColor;
            this.chart.options.scales.x.grid.color = gridColor;
            this.chart.options.scales.y.grid.color = gridColor;
            this.chart.update();
        }
    }

    initChart() {
        const ctx = document.getElementById('history-chart').getContext('2d');
        const textColor = this.isDarkMode ? '#ecf0f1' : '#333';
        const gridColor = this.isDarkMode ? '#555' : '#ddd';

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'CPU Usage (%)',
                        data: [],
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Memory Usage (%)',
                        data: [],
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Disk Usage (%)',
                        data: [],
                        borderColor: '#2ecc71',
                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time',
                            color: textColor
                        },
                        ticks: { color: textColor },
                        grid: { color: gridColor }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Usage (%)',
                            color: textColor
                        },
                        ticks: { color: textColor },
                        grid: { color: gridColor },
                        min: 0,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: textColor }
                    }
                }
            }
        });
    }

    async fetchSystemMetrics() {
        try {
            const response = await fetch('/api/metrics');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching system metrics:', error);
            return null;
        }
    }

    updateHistoryData(metrics) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        
        // Add new data
        this.historyData.timestamps.push(timeStr);
        this.historyData.cpu.push(metrics.cpu.usage_percent);
        
        const memoryUsagePercent = ((metrics.memory.used_mb / metrics.memory.total_mb) * 100);
        this.historyData.memory.push(memoryUsagePercent);
        
        const diskUsagePercent = ((metrics.disk.used_gb / metrics.disk.total_gb) * 100);
        this.historyData.disk.push(diskUsagePercent);
        
        // Keep only the last N points
        if (this.historyData.timestamps.length > this.maxHistoryPoints) {
            this.historyData.timestamps.shift();
            this.historyData.cpu.shift();
            this.historyData.memory.shift();
            this.historyData.disk.shift();
        }
        
        // Update chart
        this.chart.data.labels = this.historyData.timestamps;
        this.chart.data.datasets[0].data = this.historyData.cpu;
        this.chart.data.datasets[1].data = this.historyData.memory;
        this.chart.data.datasets[2].data = this.historyData.disk;
        this.chart.update('none'); // Update without animation for smooth real-time updates
    }

    updateCPUMetrics(cpuMetrics) {
        const cpuElement = document.getElementById('cpu-usage');
        const cpuBar = document.getElementById('cpu-bar');
        const cpuUsage = cpuMetrics.usage_percent;
        
        cpuElement.textContent = `${cpuUsage}%`;
        cpuBar.style.width = `${cpuUsage}%`;
        
        // Update load average if available
        if (cpuMetrics.load_average) {
            const loadElement = document.getElementById('load-average');
            loadElement.textContent = cpuMetrics.load_average['1min'].toFixed(2);
        }
        
        // Change color based on usage
        if (cpuUsage > 80) {
            cpuBar.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
            this.addAlert('warning', 'High CPU Usage', `CPU usage is ${cpuUsage}%`);
        } else if (cpuUsage > 60) {
            cpuBar.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
        } else {
            cpuBar.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
        }
    }

    updateMemoryMetrics(memory) {
        const memoryUsageElement = document.getElementById('memory-usage');
        const memoryTotalElement = document.getElementById('memory-total');
        const memoryUsedElement = document.getElementById('memory-used');
        const memoryFreeElement = document.getElementById('memory-free');
        const memoryBar = document.getElementById('memory-bar');
        
        const memoryUsagePercent = ((memory.used_mb / memory.total_mb) * 100).toFixed(1);
        
        memoryUsageElement.textContent = `${memoryUsagePercent}%`;
        memoryTotalElement.textContent = memory.total_mb;
        memoryUsedElement.textContent = memory.used_mb;
        memoryFreeElement.textContent = memory.free_mb;
        memoryBar.style.width = `${memoryUsagePercent}%`;
        
        // Change color based on usage
        if (memoryUsagePercent > 80) {
            memoryBar.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
            this.addAlert('warning', 'High Memory Usage', `Memory usage is ${memoryUsagePercent}%`);
        } else if (memoryUsagePercent > 60) {
            memoryBar.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
        } else {
            memoryBar.style.background = 'linear-gradient(90deg, #3498db, #2980b9)';
        }
    }

    updateDiskMetrics(disk) {
        const diskUsageElement = document.getElementById('disk-usage');
        const diskTotalElement = document.getElementById('disk-total');
        const diskUsedElement = document.getElementById('disk-used');
        const diskFreeElement = document.getElementById('disk-free');
        const diskBar = document.getElementById('disk-bar');
        
        const diskUsagePercent = ((disk.used_gb / disk.total_gb) * 100).toFixed(1);
        
        diskUsageElement.textContent = `${diskUsagePercent}%`;
        diskTotalElement.textContent = disk.total_gb;
        diskUsedElement.textContent = disk.used_gb;
        diskFreeElement.textContent = disk.free_gb;
        diskBar.style.width = `${diskUsagePercent}%`;
        
        // Change color based on usage
        if (diskUsagePercent > 80) {
            diskBar.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
            this.addAlert('warning', 'High Disk Usage', `Disk usage is ${diskUsagePercent}%`);
        } else if (diskUsagePercent > 60) {
            diskBar.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
        } else {
            diskBar.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
        }
    }

    updateSystemStatus(metrics) {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');
        
        let status = 'healthy';
        let statusClass = 'healthy';
        let statusMessage = 'System Healthy';
        
        // Check CPU
        if (metrics.cpu.usage_percent > 80) {
            status = 'critical';
            statusClass = 'critical';
            statusMessage = 'High CPU Usage';
        }
        
        // Check Memory
        const memoryUsagePercent = (metrics.memory.used_mb / metrics.memory.total_mb) * 100;
        if (memoryUsagePercent > 80 && status !== 'critical') {
            status = 'critical';
            statusClass = 'critical';
            statusMessage = 'High Memory Usage';
        }
        
        // Check Disk
        const diskUsagePercent = (metrics.disk.used_gb / metrics.disk.total_gb) * 100;
        if (diskUsagePercent > 80 && status !== 'critical') {
            status = 'warning';
            statusClass = 'warning';
            statusMessage = 'High Disk Usage';
        } else if (diskUsagePercent > 60 && status === 'healthy') {
            status = 'warning';
            statusClass = 'warning';
            statusMessage = 'Moderate Disk Usage';
        }
        
        statusDot.className = `status-dot ${statusClass}`;
        statusText.textContent = statusMessage;
    }

    addAlert(type, title, message) {
        const now = new Date();
        const alertId = `${now.getTime()}-${title}`;
        
        // Check if similar alert already exists to avoid spam
        const existingAlert = this.alerts.find(alert => alert.title === title);
        if (existingAlert && (now - existingAlert.timestamp) < 30000) { // 30 seconds cooldown
            return;
        }
        
        const alert = {
            id: alertId,
            type: type,
            title: title,
            message: message,
            timestamp: now
        };
        
        this.alerts.unshift(alert);
        
        // Keep only last 10 alerts
        if (this.alerts.length > 10) {
            this.alerts = this.alerts.slice(0, 10);
        }
        
        this.updateAlertsDisplay();
    }

    updateAlertsDisplay() {
        const alertsList = document.getElementById('alerts-list');
        
        if (this.alerts.length === 0) {
            alertsList.innerHTML = '<div class="no-alerts">No active alerts</div>';
            return;
        }
        
        alertsList.innerHTML = this.alerts.map(alert => `
            <div class="alert alert-${alert.type}">
                <strong>${alert.title}</strong>: ${alert.message}
                <small>${alert.timestamp.toLocaleTimeString()}</small>
            </div>
        `).join('');
    }

    updateLastUpdateTime() {
        const lastUpdateElement = document.getElementById('last-update');
        const now = new Date();
        lastUpdateElement.textContent = now.toLocaleString();
    }

    exportData() {
        const exportData = {
            timestamp: new Date().toISOString(),
            currentMetrics: this.lastMetrics,
            history: this.historyData,
            alerts: this.alerts.map(alert => ({
                ...alert,
                timestamp: alert.timestamp.toISOString()
            }))
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `ro-lcp-metrics-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    async updateMetrics() {
        const metrics = await this.fetchSystemMetrics();
        
        if (metrics) {
            this.lastMetrics = metrics;
            this.updateCPUMetrics(metrics.cpu);
            this.updateMemoryMetrics(metrics.memory);
            this.updateDiskMetrics(metrics.disk);
            
            // Update uptime if available
            if (metrics.system && metrics.system.uptime) {
                const uptimeElement = document.getElementById('uptime');
                uptimeElement.textContent = metrics.system.uptime;
            }
            
            this.updateSystemStatus(metrics);
            this.updateHistoryData(metrics);
            this.updateLastUpdateTime();
        } else {
            // Show error state
            document.getElementById('cpu-usage').textContent = 'Error';
            document.getElementById('memory-usage').textContent = 'Error';
            document.getElementById('disk-usage').textContent = 'Error';
            
            const statusDot = document.querySelector('.status-dot');
            const statusText = document.querySelector('.status-text');
            statusDot.className = 'status-dot critical';
            statusText.textContent = 'Connection Error';
            
            this.addAlert('critical', 'Connection Error', 'Unable to fetch system metrics');
        }
    }

    startMonitoring() {
        // Initial update
        this.updateMetrics();
        
        // Set up periodic updates
        setInterval(() => {
            this.updateMetrics();
        }, this.updateInterval);
    }
}

// Initialize the monitor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SystemMonitor();
});