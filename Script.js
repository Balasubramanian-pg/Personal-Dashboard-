/* =========================================
   GLOBAL CONFIG & INIT
   ========================================= */
// Set font family for all charts globally
Chart.defaults.font.family = "'Afacad', sans-serif";
Chart.defaults.color = '#94a3b8';
Chart.defaults.scale.grid.color = '#f1f5f9';

// Store chart instances to manage updates if needed
let charts = {};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all charts immediately so they are ready
    initOverviewCharts();
    initBusinessCharts();
    renderCalendar();

    // Set initial view
    switchTab('dashboard');

    // Mobile check: ensure sidebar is closed on small screens initially
    if (window.innerWidth < 1024) {
        document.getElementById('sidebar').classList.remove('w-64');
        document.getElementById('sidebar').style.width = '0px';
    }
});

/* =========================================
   SIDEBAR LOGIC
   ========================================= */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const isMobile = window.innerWidth < 1024;

    if (isMobile) {
        // Mobile: Toggle width between 0 and full/standard
        if (sidebar.style.width === '0px' || !sidebar.style.width) {
            sidebar.style.width = '100%'; // Or fixed width if preferred
            sidebar.classList.add('w-64'); // Tailwind utility for width
        } else {
            sidebar.style.width = '0px';
            sidebar.classList.remove('w-64');
        }
    } else {
        // Desktop: Toggle collapse class
        sidebar.classList.toggle('w-64'); // Toggle standard width class
        sidebar.classList.toggle('sidebar-collapsed'); // Add collapsed styling
    }
}

/* =========================================
   TAB SWITCHING LOGIC (SPA Style)
   ========================================= */
function switchTab(tabName) {
    // 1. Update Sidebar Active States
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.id === `nav-${tabName}`) {
            item.classList.remove('nav-inactive');
            item.classList.add('nav-active');
        } else {
            item.classList.remove('nav-active');
            item.classList.add('nav-inactive');
        }
    });

    // 2. Update Header Title
    const titles = {
        'dashboard': 'Overview Dashboard',
        'business': 'Business Intelligence',
        'calendar': 'Schedule & Events'
    };
    const titleEl = document.getElementById('viewHeaderTitle');
    if (titleEl) titleEl.innerText = titles[tabName];

    // 3. Hide all views & Show active view
    ['dashboard', 'business', 'calendar'].forEach(view => {
        const el = document.getElementById(`view-${view}`);
        if (!el) return;

        if (view === tabName) {
            el.classList.remove('hidden');
            // Retrigger Fade Animation
            el.classList.remove('fade-in');
            void el.offsetWidth; // Force Reflow
            el.classList.add('fade-in');
        } else {
            el.classList.add('hidden');
        }
    });

    // 4. Mobile: Close sidebar after selection
    if (window.innerWidth < 1024) {
        const sidebar = document.getElementById('sidebar');
        sidebar.style.width = '0px';
        sidebar.classList.remove('w-64');
    }
}

/* =========================================
   CHART: OVERVIEW DASHBOARD
   ========================================= */
function initOverviewCharts() {
    const ctxFlow = document.getElementById('chart-overview-flow');
    if (ctxFlow) {
        const ctx = ctxFlow.getContext('2d');
        // Gradients
        const gradEarn = ctx.createLinearGradient(0, 0, 0, 300);
        gradEarn.addColorStop(0, '#10b981'); // Emerald 500
        gradEarn.addColorStop(1, '#059669'); // Emerald 600

        const gradExp = ctx.createLinearGradient(0, 0, 0, 300);
        gradExp.addColorStop(0, '#f43f5e'); // Rose 500
        gradExp.addColorStop(1, '#e11d48'); // Rose 600

        charts.overviewFlow = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [
                    {
                        label: 'Earnings',
                        data: [2800, 3500, 2100, 3600],
                        backgroundColor: gradEarn,
                        borderRadius: 6,
                        barPercentage: 0.6,
                        categoryPercentage: 0.8
                    },
                    {
                        label: 'Expenses',
                        data: [1200, 800, 950, 500],
                        backgroundColor: gradExp,
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
                    legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 6 } }
                },
                scales: {
                    y: { beginAtZero: true, border: { display: false }, grid: { borderDash: [4, 4] } },
                    x: { grid: { display: false }, border: { display: false } }
                }
            }
        });
    }

    const ctxCat = document.getElementById('chart-overview-cat');
    if (ctxCat) {
        charts.overviewCat = new Chart(ctxCat.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Operations', 'Marketing', 'Other'],
                datasets: [{
                    data: [45, 30, 25],
                    backgroundColor: ['#1e293b', '#6366f1', '#e2e8f0'],
                    borderWidth: 0,
                    hoverOffset: 5
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

/* =========================================
   CHART: BUSINESS DASHBOARD
   ========================================= */
function initBusinessCharts() {
    const ctxMain = document.getElementById('chart-business-main');
    if (ctxMain) {
        const ctx = ctxMain.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(13, 148, 136, 0.2)'); // Teal
        gradient.addColorStop(1, 'rgba(13, 148, 136, 0)');

        charts.businessMain = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Cashflow',
                    data: [12000, 19000, 15000, 25000, 22000, 30000],
                    borderColor: '#0f766e',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#0f766e',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, border: { display: false }, grid: { borderDash: [5, 5] } },
                    x: { grid: { display: false }, border: { display: false } }
                }
            }
        });
    }

    const ctxDonut = document.getElementById('chart-business-donut');
    if (ctxDonut) {
        charts.businessDonut = new Chart(ctxDonut.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Vendor', 'Salary'],
                datasets: [{
                    data: [55, 45],
                    backgroundColor: ['#1e293b', '#14b8a6'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: { legend: { display: false } }
            }
        });
    }
}

/* =========================================
   CALENDAR RENDERER
   ========================================= */
function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;

    const eventTypes = [
        { title: 'Tax Review', color: 'bg-red-50 text-red-700 border-red-100', dot: 'bg-red-500' },
        { title: 'Payout In', color: 'bg-teal-50 text-teal-700 border-teal-100', dot: 'bg-teal-500' },
        { title: 'Client Call', color: 'bg-indigo-50 text-indigo-700 border-indigo-100', dot: 'bg-indigo-500' }
    ];

    let html = '';
    // Generate 31 days
    for (let i = 1; i <= 31; i++) {
        const isToday = i === 14; // Fake "today"
        const hasEvent = Math.random() > 0.7; // Random event generation
        let eventHtml = '';

        if (hasEvent) {
            const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            eventHtml = `
                <div class="event-item group/event relative mt-1 cursor-pointer">
                    <div class="flex items-center gap-1.5 px-2 py-1 rounded border ${type.color} text-[10px] font-bold truncate transition-colors hover:brightness-95">
                        <div class="w-1.5 h-1.5 rounded-full ${type.dot}"></div>
                        ${type.title}
                    </div>
                    <!-- Tooltip -->
                    <div class="event-tooltip absolute z-50 left-1/2 -translate-x-1/2 bottom-[120%] w-32 bg-slate-800 text-white p-2 rounded-lg text-xs pointer-events-none shadow-xl">
                        <div class="font-bold mb-0.5">${type.title}</div>
                        <div class="opacity-75">10:00 AM</div>
                        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                    </div>
                </div>
            `;
        }

        const activeClass = isToday ? 'ring-2 ring-indigo-500 bg-indigo-50/10' : 'hover:ring-1 hover:ring-indigo-200';
        const numClass = isToday ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-gray-400 group-hover:text-indigo-600';

        html += `
            <div class="calendar-cell group relative flex flex-col justify-start items-start p-2 min-h-[100px] border border-gray-100/80 rounded-2xl bg-white ${activeClass}">
                <div class="w-full flex justify-between items-center mb-1">
                    <span class="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${numClass}">
                        ${i}
                    </span>
                    <!-- Quick Add Button -->
                    <button class="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-indigo-600">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    </button>
                </div>
                <div class="w-full flex flex-col gap-1">
                    ${eventHtml}
                </div>
            </div>
        `;
    }
    grid.innerHTML = html;
}
