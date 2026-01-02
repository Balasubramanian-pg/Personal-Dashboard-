// ========================================
// GLOBAL STATE & CHART REGISTRY
// ========================================
let charts = {
    overviewFlow: null,
    overviewCat: null,
    businessMain: null,
    businessDonut: null
};

let currentView = 'dashboard';

// ========================================
// SIDEBAR TOGGLE
// ========================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    
    // On mobile, toggle visibility
    if (window.innerWidth < 1024) {
        sidebar.classList.toggle('hidden');
    }
}

// ========================================
// TAB SWITCHING
// ========================================
function switchTab(tabName) {
    currentView = tabName;
    
    // Update navigation active states
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('nav-active');
        item.classList.add('nav-inactive');
    });
    
    const activeNav = document.getElementById(`nav-${tabName}`);
    if (activeNav) {
        activeNav.classList.remove('nav-inactive');
        activeNav.classList.add('nav-active');
    }
    
    // Update header title
    const headerTitles = {
        'dashboard': 'Overview Dashboard',
        'business': 'Business Analytics',
        'calendar': 'Calendar & Events'
    };
    document.getElementById('viewHeaderTitle').textContent = headerTitles[tabName] || 'Dashboard';
    
    // Destroy existing charts before switching
    destroyAllCharts();
    
    // Load content
    loadContent(tabName);
    
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
        document.getElementById('sidebar').classList.add('hidden');
    }
}

// ========================================
// DESTROY CHARTS (prevent memory leaks)
// ========================================
function destroyAllCharts() {
    Object.keys(charts).forEach(key => {
        if (charts[key]) {
            charts[key].destroy();
            charts[key] = null;
        }
    });
}

// ========================================
// LOAD CONTENT INTO MAIN AREA
// ========================================
function loadContent(view) {
    const mainContent = document.getElementById('main-content');
    
    if (view === 'dashboard') {
        mainContent.innerHTML = getOverviewHTML();
        setTimeout(initOverviewCharts, 100); // Wait for DOM
    } else if (view === 'business') {
        mainContent.innerHTML = getBusinessHTML();
        setTimeout(initBusinessCharts, 100);
    } else if (view === 'calendar') {
        mainContent.innerHTML = getCalendarHTML();
        setTimeout(initCalendar, 100);
    }
}

// ========================================
// HTML TEMPLATES
// ========================================
function getOverviewHTML() {
    return `
    <div class="fade-in w-full pb-10 h-full flex flex-col gap-6">
        
        <!-- View Controls & Header -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <!-- Date Selector -->
            <div class="flex items-center gap-3 px-4">
                <button class="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <div class="flex flex-col">
                    <span class="text-xs font-medium text-gray-400 uppercase tracking-wider">Current Period</span>
                    <h3 class="font-bold text-xl text-gray-800 leading-none">March 2024</h3>
                </div>
                <button class="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
            </div>

            <!-- Filters & Actions -->
            <div class="flex items-center gap-3 w-full md:w-auto px-2">
                <!-- Segmented Control -->
                <div class="flex p-1 bg-slate-100/80 rounded-xl w-full md:w-auto">
                    <button class="segment-btn px-4 py-1.5 rounded-lg text-sm text-gray-500 w-full md:w-auto">Quarter</button>
                    <button class="segment-btn active px-4 py-1.5 rounded-lg text-sm text-gray-500 w-full md:w-auto">Month</button>
                    <button class="segment-btn px-4 py-1.5 rounded-lg text-sm text-gray-500 w-full md:w-auto">Week</button>
                </div>
            </div>
        </div>

        <!-- KPIs -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <!-- Total Earnings -->
            <div class="card-glass p-6 relative overflow-hidden group">
                <div class="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-full opacity-50 transition-opacity group-hover:opacity-100"></div>
                <div class="flex items-center gap-3 mb-3">
                    <div class="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <p class="text-sm font-semibold text-gray-500">Total Earnings</p>
                </div>
                <h3 class="text-3xl font-bold text-gray-900 tracking-tight">₹12,000</h3>
                <div class="flex items-center mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                    +12% vs last month
                </div>
            </div>

            <!-- Total Expenses -->
            <div class="card-glass p-6 relative overflow-hidden group">
                <div class="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-rose-50 to-transparent rounded-bl-full opacity-50 transition-opacity group-hover:opacity-100"></div>
                <div class="flex items-center gap-3 mb-3">
                    <div class="p-2 bg-rose-50 text-rose-600 rounded-lg">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <p class="text-sm font-semibold text-gray-500">Total Expenses</p>
                </div>
                <h3 class="text-3xl font-bold text-gray-900 tracking-tight">₹3,450</h3>
                <div class="flex items-center mt-2 text-xs font-medium text-rose-600 bg-rose-50 w-fit px-2 py-1 rounded-md">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/></svg>
                    +4% vs last month
                </div>
            </div>

            <!-- Net Balance -->
            <div class="card-glass p-6 relative overflow-hidden group">
                <div class="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-50 transition-opacity group-hover:opacity-100"></div>
                <div class="flex items-center gap-3 mb-3">
                    <div class="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>
                    </div>
                    <p class="text-sm font-semibold text-gray-500">Net Balance</p>
                </div>
                <h3 class="text-3xl font-bold text-gray-900 tracking-tight">₹8,550</h3>
                <p class="text-xs text-gray-400 mt-2 font-medium">After taxes & fees</p>
            </div>

            <!-- Current Balance -->
            <div class="card-glass p-6 bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none ring-0 shadow-lg shadow-indigo-200 group">
                <div class="flex items-center justify-between mb-3">
                    <p class="text-sm font-medium text-indigo-100">Available Funds</p>
                    <svg class="w-5 h-5 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                </div>
                <h3 class="text-3xl font-bold tracking-tight mb-4">₹18,115</h3>
                <div class="flex items-center gap-2">
                    <span class="inline-flex w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span class="text-xs font-medium text-indigo-100">Live Status</span>
                </div>
            </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
            
            <!-- Spending vs Earnings Chart -->
            <div class="card-glass p-8">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-lg font-bold text-gray-900">Flow Analysis</h3>
                        <p class="text-sm text-gray-400">Income vs Expenses ratio</p>
                    </div>
                </div>
                <div class="h-64 relative w-full">
                    <canvas id="chart-overview-flow"></canvas>
                </div>
            </div>

            <!-- Category Breakdown -->
            <div class="card-glass p-8 flex flex-col">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-lg font-bold text-gray-900">Spending Breakdown</h3>
                        <p class="text-sm text-gray-400">By category</p>
                    </div>
                </div>
                <div class="flex flex-col md:flex-row items-center gap-8 h-full">
                    <div class="h-48 w-48 flex-shrink-0 relative">
                        <canvas id="chart-overview-cat"></canvas>
                        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span class="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Total</span>
                            <span class="text-xl font-bold text-gray-900">₹3.4k</span>
                        </div>
                    </div>
                    
                    <!-- Custom Legend -->
                    <div class="flex-1 w-full space-y-3">
                        <div class="flex justify-between items-center group cursor-pointer">
                            <div class="flex items-center gap-2.5">
                                <div class="w-3 h-3 rounded-full bg-slate-800 ring-2 ring-slate-100"></div>
                                <span class="text-sm font-medium text-gray-600 group-hover:text-slate-900 transition-colors">Operations</span>
                            </div>
                            <span class="text-sm font-bold text-gray-900">45%</span>
                        </div>
                        <div class="flex justify-between items-center group cursor-pointer">
                            <div class="flex items-center gap-2.5">
                                <div class="w-3 h-3 rounded-full bg-violet-500 ring-2 ring-violet-100"></div>
                                <span class="text-sm font-medium text-gray-600 group-hover:text-violet-900 transition-colors">Marketing</span>
                            </div>
                            <span class="text-sm font-bold text-gray-900">30%</span>
                        </div>
                        <div class="flex justify-between items-center group cursor-pointer">
                            <div class="flex items-center gap-2.5">
                                <div class="w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-emerald-100"></div>
                                <span class="text-sm font-medium text-gray-600 group-hover:text-emerald-900 transition-colors">Software</span>
                            </div>
                            <span class="text-sm font-bold text-gray-900">25%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

function getBusinessHTML() {
    return `
    <div class="fade-in w-full pb-10">
        <!-- Top KPIs -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="card-glass p-6 rounded-[20px] relative overflow-hidden group">
                <div class="flex justify-between items-start mb-5 relative z-10">
                    <span class="text-gray-500 text-sm font-semibold tracking-wide uppercase">Available Balance</span>
                    <div class="p-2.5 bg-teal-50 rounded-xl border border-teal-100/50">
                        <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                    </div>
                </div>
                <h3 class="text-4xl font-bold text-gray-900 mt-1 tracking-tight">$75,876<span class="text-gray-400 text-2xl font-medium">.00</span></h3>
                <span class="text-teal-600 text-sm font-bold mt-2 block">+12% from last month</span>
            </div>
            <div class="card-glass p-6 rounded-[20px] relative overflow-hidden group">
                <div class="flex justify-between items-start mb-5 relative z-10">
                    <span class="text-gray-500 text-sm font-semibold tracking-wide uppercase">Inflows</span>
                    <div class="p-2.5 bg-blue-50 rounded-xl">
                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                </div>
                <h3 class="text-4xl font-bold text-gray-900 mt-1 tracking-tight">$15,876<span class="text-gray-400 text-2xl font-medium">.00</span></h3>
                <span class="text-teal-600 text-sm font-bold mt-2 block">+17% from last month</span>
            </div>
            <div class="card-glass p-6 rounded-[20px] relative overflow-hidden group">
                <div class="flex justify-between items-start mb-5 relative z-10">
                    <span class="text-gray-500 text-sm font-semibold tracking-wide uppercase">Outflows</span>
                    <div class="p-2.5 bg-orange-50 rounded-xl">
                        <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                    </div>
                </div>
                <h3 class="text-4xl font-bold text-gray-900 mt-1 tracking-tight">$5,876<span class="text-gray-400 text-2xl font-medium">.00</span></h3>
                <span class="text-red-500 text-sm font-bold mt-2 block">12% from last month</span>
            </div>
        </div>
        <!-- Business Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div class="lg:col-span-2 card-glass p-6 rounded-[24px]">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Cashflow Analysis</h3>
                <div style="position: relative; height: 300px; width: 100%;">
                    <canvas id="chart-business-main"></canvas>
                </div>
            </div>
            <div class="card-glass p-6 rounded-[24px]">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Outflows Breakdown</h3>
                <div style="position: relative; height: 200px; width: 100%;">
                    <canvas id="chart-business-donut"></canvas>
                </div>
            </div>
        </div>
    </div>
    `;
}

function getCalendarHTML() {
    return `
    <div class="fade-in w-full pb-10 h-full">
        <div class="card-glass p-8 rounded-[32px] flex flex-col h-auto min-h-[600px]">
            <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div class="flex items-center space-x-4">
                    <div class="p-3 bg-indigo-50 rounded-2xl">
                        <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-2xl font-bold text-gray-900 tracking-tight">December 2025</h3>
                        <p class="text-gray-400 text-sm font-medium">3 Events today • 12 upcoming</p>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-7 mb-4 px-2">
                <div class="text-gray-400 text-xs font-bold uppercase tracking-widest text-center">Mon</div>
                <div class="text-gray-400 text-xs font-bold uppercase tracking-widest text-center">Tue</div>
                <div class="text-gray-400 text-xs font-bold uppercase tracking-widest text-center">Wed</div>
                <div class="text-gray-400 text-xs font-bold uppercase tracking-widest text-center">Thu</div>
                <div class="text-gray-400 text-xs font-bold uppercase tracking-widest text-center">Fri</div>
                <div class="text-gray-400 text-xs font-bold uppercase tracking-widest text-center text-orange-400">Sat</div>
                <div class="text-gray-400 text-xs font-bold uppercase tracking-widest text-center text-orange-400">Sun</div>
            </div>
            <div id="calendar-grid" class="grid grid-cols-7 grid-rows-5 gap-2 h-full flex-grow">
                <!-- JS Injection Happens Here -->
            </div>
        </div>
    </div>
    `;
}

// ========================================
// CHART: OVERVIEW DASHBOARD
// ========================================
function initOverviewCharts() {
    Chart.defaults.font.family = "'Afacad', sans-serif";
    Chart.defaults.color = '#94a3b8';
    
    const ctxFlow = document.getElementById('chart-overview-flow');
    if (ctxFlow) {
        const ctx = ctxFlow.getContext('2d');
        const gradEarnings = ctx.createLinearGradient(0, 0, 0, 300);
        gradEarnings.addColorStop(0, '#10b981');
        gradEarnings.addColorStop(1, '#059669');
        const gradExpenses = ctx.createLinearGradient(0, 0, 0, 300);
        gradExpenses.addColorStop(0, '#f43f5e');
        gradExpenses.addColorStop(1, '#e11d48');
        
        charts.overviewFlow = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [
                    {
                        label: 'Earnings',
                        data: [3200, 4500, 2800, 1500],
                        backgroundColor: ['#f97316', '#06b6d4', '#8b5cf6', '#6b7280'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }
}

// ========================================
// CALENDAR INITIALIZATION
// ========================================
function initCalendar() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
    
    const daysInMonth = 31;
    const startDay = 5; // December 2025 starts on Monday (0=Mon)
    
    // Empty cells before month starts
    for (let i = 0; i < startDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'p-3 rounded-xl';
        grid.appendChild(emptyCell);
    }
    
    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = 'p-3 rounded-xl border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[80px]';
        
        // Highlight today (e.g., 15th)
        if (day === 15) {
            cell.className += ' bg-blue-600 text-white font-bold border-blue-600';
        }
        
        const dayNum = document.createElement('span');
        dayNum.textContent = day;
        dayNum.className = day === 15 ? 'text-lg font-bold' : 'text-sm font-medium text-gray-700';
        
        cell.appendChild(dayNum);
        
        // Add event indicators for some days
        if ([5, 12, 20, 28].includes(day)) {
            const indicator = document.createElement('div');
            indicator.className = 'w-1.5 h-1.5 bg-teal-500 rounded-full mt-1';
            cell.appendChild(indicator);
        }
        
        grid.appendChild(cell);
    }
}

// ========================================
// INITIALIZATION ON PAGE LOAD
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // Load default view
    loadContent('dashboard');
    
    // Handle sidebar collapse on desktop
    if (window.innerWidth >= 1024) {
        document.getElementById('sidebar').classList.remove('hidden');
    } else {
        document.getElementById('sidebar').classList.add('hidden');
    }
}); gradEarnings,
                        borderRadius: 6,
                        barPercentage: 0.6,
                        categoryPercentage: 0.8
                    },
                    {
                        label: 'Expenses',
                        data: [800, 1200, 950, 500],
                        backgroundColor: gradExpenses,
                        borderRadius: 6,
                        barPercentage: 0.6,
                        categoryPercentage: 0.8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: { boxWidth: 8, usePointStyle: true, pointStyle: 'circle' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f1f5f9', borderDash: [4, 4] },
                        border: { display: false },
                        ticks: { callback: function(value) { return '₹' + value; } }
                    },
                    x: {
                        grid: { display: false },
                        border: { display: false }
                    }
                }
            }
        });
    }
    
    const ctxCat = document.getElementById('chart-overview-cat');
    if (ctxCat) {
        charts.overviewCat = new Chart(ctxCat.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Operations', 'Marketing', 'Software'],
                datasets: [{
                    data: [45, 30, 25],
                    backgroundColor: ['#1e293b', '#8b5cf6', '#34d399'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '80%',
                plugins: { legend: { display: false } }
            }
        });
    }
}

// ========================================
// CHART: BUSINESS VIEW
// ========================================
function initBusinessCharts() {
    const ctxMain = document.getElementById('chart-business-main');
    if (ctxMain) {
        charts.businessMain = new Chart(ctxMain.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue',
                    data: [65000, 75000, 68000, 82000, 79000, 88000],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }
    
    const ctxDonut = document.getElementById('chart-business-donut');
    if (ctxDonut) {
        charts.businessDonut = new Chart(ctxDonut.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Salaries', 'Rent', 'Marketing', 'Other'],
                datasets: [{
                    data: [40, 25, 20, 15],
                    backgroundColor:
