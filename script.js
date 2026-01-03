// ==========================================
// LOCAL EXCEL DASHBOARD
// ==========================================

// ==========================================
// CONFIGURATION
// ==========================================
const CONFIG = {
    EXCEL_PATH: 'F:\\Budget Puller\\statement_of_account.xlsx',
    SHEET_NAME: 'Sheet1',  // Change this to your actual sheet name
    REFRESH_INTERVAL: 60000,  // Auto-refresh every 1 minute (60000ms)
    DATE_FORMAT: 'DD/MM/YYYY'
};

// ==========================================
// GLOBAL STATE
// ==========================================
let charts = {
    overviewFlow: null,
    overviewCat: null,
    businessMain: null,
    businessDonut: null
};

let currentView = 'dashboard';
let allTransactions = [];
let filteredTransactions = [];
let currentPeriod = 'month';
let currentDate = new Date();
let isLoading = false;
let lastModified = null;

// ==========================================
// EXCEL FILE READING
// ==========================================
async function readExcelFile() {
    try {
        isLoading = true;
        showLoadingState();
        
        // Read the file using File System Access API
        const response = await fetch(CONFIG.EXCEL_PATH);
        const arrayBuffer = await response.arrayBuffer();
        
        // Parse Excel file using SheetJS (loaded via CDN)
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const worksheet = workbook.Sheets[CONFIG.SHEET_NAME || workbook.SheetNames[0]];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        isLoading = false;
        hideLoadingState();
        
        console.log('✅ Excel file read successfully');
        return jsonData;
        
    } catch (error) {
        isLoading = false;
        hideLoadingState();
        console.error('❌ Error reading Excel file:', error);
        showError(`Cannot read Excel file. Make sure the file exists at: ${CONFIG.EXCEL_PATH}`);
        return null;
    }
}

// ==========================================
// ALTERNATIVE: FILE UPLOAD METHOD
// ==========================================
function createFileUploadUI() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="flex items-center justify-center h-full">
            <div class="text-center max-w-2xl">
                <div class="mb-8">
                    <svg class="w-24 h-24 mx-auto text-blue-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                    </svg>
                    <h2 class="text-3xl font-bold text-gray-900 mb-2">Upload Your Excel File</h2>
                    <p class="text-gray-600 mb-8">Select your statement_of_account.xlsx file to load the dashboard</p>
                </div>
                
                <label for="excelFile" class="cursor-pointer inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                    </svg>
                    Choose Excel File
                </label>
                <input type="file" id="excelFile" accept=".xlsx,.xls" class="hidden" onchange="handleFileUpload(event)">
                
                <div class="mt-8 text-left bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Expected Excel Format:
                    </h3>
                    <div class="bg-white p-4 rounded-lg border border-gray-200 font-mono text-sm overflow-x-auto">
                        <table class="min-w-full">
                            <thead>
                                <tr class="border-b border-gray-300">
                                    <th class="px-3 py-2 text-left text-gray-700">Date</th>
                                    <th class="px-3 py-2 text-left text-gray-700">Category</th>
                                    <th class="px-3 py-2 text-left text-gray-700">Type</th>
                                    <th class="px-3 py-2 text-left text-gray-700">Amount</th>
                                    <th class="px-3 py-2 text-left text-gray-700">Balance</th>
                                    <th class="px-3 py-2 text-left text-gray-700">Description</th>
                                </tr>
                            </thead>
                            <tbody class="text-gray-600">
                                <tr>
                                    <td class="px-3 py-2">01/01/2025</td>
                                    <td class="px-3 py-2">Rent</td>
                                    <td class="px-3 py-2">Expense</td>
                                    <td class="px-3 py-2">15000</td>
                                    <td class="px-3 py-2">85000</td>
                                    <td class="px-3 py-2">Monthly Rent</td>
                                </tr>
                                <tr>
                                    <td class="px-3 py-2">05/01/2025</td>
                                    <td class="px-3 py-2">Salary</td>
                                    <td class="px-3 py-2">Income</td>
                                    <td class="px-3 py-2">50000</td>
                                    <td class="px-3 py-2">135000</td>
                                    <td class="px-3 py-2">Jan Salary</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p class="text-sm text-gray-500 mt-3">
                        ℹ️ All amounts should be positive. Use "Type" column to indicate Income or Expense.
                    </p>
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// FILE UPLOAD HANDLER
// ==========================================
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        isLoading = true;
        showLoadingState();
        
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        isLoading = false;
        hideLoadingState();
        
        await processExcelData(jsonData);
        
    } catch (error) {
        isLoading = false;
        hideLoadingState();
        console.error('❌ Error processing file:', error);
        showError('Failed to process Excel file. Please check the file format.');
    }
}

// ==========================================
// DATA PARSING
// ==========================================
function parseTransactions(rawData) {
    if (!rawData || rawData.length < 2) {
        console.error('No data found in Excel');
        return [];
    }

    const headers = rawData[0].map(h => String(h).trim().toLowerCase());
    const rows = rawData.slice(1);
    
    console.log('📋 Headers found:', headers);
    
    // Find column indices
    const dateIdx = headers.findIndex(h => h.includes('date'));
    const categoryIdx = headers.findIndex(h => h.includes('category'));
    const typeIdx = headers.findIndex(h => h.includes('type'));
    const amountIdx = headers.findIndex(h => h.includes('amount'));
    const balanceIdx = headers.findIndex(h => h.includes('balance'));
    const descIdx = headers.findIndex(h => h.includes('description') || h.includes('desc'));

    if (dateIdx === -1 || amountIdx === -1) {
        console.error('❌ Required columns not found. Need at least "Date" and "Amount"');
        showError('Excel file must have "Date" and "Amount" columns');
        return [];
    }

    const transactions = rows.map((row, index) => {
        try {
            if (!row || row.length === 0) return null;
            
            const dateStr = row[dateIdx] || '';
            const type = typeIdx !== -1 ? String(row[typeIdx] || '').trim().toLowerCase() : '';
            const amount = parseFloat(row[amountIdx]) || 0;
            const balance = balanceIdx !== -1 ? parseFloat(row[balanceIdx]) || 0 : 0;
            
            if (amount === 0) return null;
            
            return {
                id: index,
                date: parseDate(dateStr),
                dateStr: dateStr,
                category: categoryIdx !== -1 ? String(row[categoryIdx] || 'Uncategorized').trim() : 'Uncategorized',
                type: type.includes('income') || type.includes('earning') ? 'Income' : 'Expense',
                amount: Math.abs(amount),
                balance: balance,
                description: descIdx !== -1 ? String(row[descIdx] || '') : ''
            };
        } catch (error) {
            console.error('Error parsing row:', row, error);
            return null;
        }
    }).filter(t => t !== null && t.date !== null && t.amount > 0);

    // Sort by date (newest first)
    transactions.sort((a, b) => b.date - a.date);
    
    console.log(`✅ Parsed ${transactions.length} transactions`);
    return transactions;
}

// ==========================================
// DATE PARSING
// ==========================================
function parseDate(dateStr) {
    if (!dateStr) return null;
    
    try {
        // Handle Excel serial date numbers
        if (typeof dateStr === 'number') {
            const excelEpoch = new Date(1899, 11, 30);
            const date = new Date(excelEpoch.getTime() + dateStr * 86400000);
            return date;
        }
        
        const str = String(dateStr);
        
        // Handle DD/MM/YYYY format
        if (CONFIG.DATE_FORMAT === 'DD/MM/YYYY') {
            const parts = str.split(/[\/\-\.]/);
            if (parts.length === 3) {
                const day = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1;
                const year = parseInt(parts[2]);
                return new Date(year, month, day);
            }
        }
        
        // Handle MM/DD/YYYY format
        if (CONFIG.DATE_FORMAT === 'MM/DD/YYYY') {
            const parts = str.split(/[\/\-\.]/);
            if (parts.length === 3) {
                const month = parseInt(parts[0]) - 1;
                const day = parseInt(parts[1]);
                const year = parseInt(parts[2]);
                return new Date(year, month, day);
            }
        }
        
        // Fallback
        const date = new Date(str);
        return isNaN(date.getTime()) ? null : date;
    } catch (error) {
        console.error('Date parsing error:', dateStr, error);
        return null;
    }
}

// ==========================================
// DATA PROCESSING
// ==========================================
async function processExcelData(jsonData) {
    allTransactions = parseTransactions(jsonData);
    
    if (allTransactions.length === 0) {
        showError('No valid transactions found in Excel file');
        return;
    }
    
    filteredTransactions = filterTransactionsByPeriod(allTransactions, currentPeriod, currentDate);
    
    // Load dashboard UI
    switchTab('dashboard');
    
    console.log('✅ Dashboard loaded with data');
}

// ==========================================
// DATA FILTERING
// ==========================================
function filterTransactionsByPeriod(transactions, period, date) {
    const filterDate = new Date(date);
    
    if (period === 'month') {
        return transactions.filter(t => 
            t.date.getMonth() === filterDate.getMonth() &&
            t.date.getFullYear() === filterDate.getFullYear()
        );
    }
    
    if (period === 'quarter') {
        const quarter = Math.floor(filterDate.getMonth() / 3);
        return transactions.filter(t => {
            const tQuarter = Math.floor(t.date.getMonth() / 3);
            return tQuarter === quarter && t.date.getFullYear() === filterDate.getFullYear();
        });
    }
    
    if (period === 'week') {
        const weekStart = new Date(filterDate);
        weekStart.setDate(filterDate.getDate() - filterDate.getDay() + 1);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        return transactions.filter(t => t.date >= weekStart && t.date <= weekEnd);
    }
    
    return transactions;
}

// ==========================================
// METRICS CALCULATION
// ==========================================
function calculateMetrics(transactions) {
    const income = transactions.filter(t => t.type === 'Income');
    const expenses = transactions.filter(t => t.type === 'Expense');
    
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpenses;
    
    const currentBalance = transactions.length > 0 ? transactions[0].balance : 0;
    
    const categoryBreakdown = {};
    expenses.forEach(t => {
        if (!categoryBreakdown[t.category]) {
            categoryBreakdown[t.category] = 0;
        }
        categoryBreakdown[t.category] += t.amount;
    });
    
    const weeklyData = getWeeklyBreakdown(transactions);
    const prevPeriodData = getPreviousPeriodData();
    
    return {
        totalIncome,
        totalExpenses,
        netBalance,
        currentBalance,
        categoryBreakdown,
        weeklyData,
        incomeChange: prevPeriodData.incomeChange,
        expenseChange: prevPeriodData.expenseChange
    };
}

// ==========================================
// WEEKLY BREAKDOWN
// ==========================================
function getWeeklyBreakdown(transactions) {
    const weeks = {};
    
    transactions.forEach(t => {
        const weekNum = getWeekOfMonth(t.date);
        const weekKey = `Week ${weekNum}`;
        
        if (!weeks[weekKey]) {
            weeks[weekKey] = { income: 0, expenses: 0 };
        }
        
        if (t.type === 'Income') {
            weeks[weekKey].income += t.amount;
        } else {
            weeks[weekKey].expenses += t.amount;
        }
    });
    
    return weeks;
}

function getWeekOfMonth(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();
    const dayOfWeek = firstDay.getDay();
    return Math.ceil((dayOfMonth + dayOfWeek) / 7);
}

// ==========================================
// PREVIOUS PERIOD COMPARISON
// ==========================================
function getPreviousPeriodData() {
    const prevDate = new Date(currentDate);
    
    if (currentPeriod === 'month') {
        prevDate.setMonth(prevDate.getMonth() - 1);
    } else if (currentPeriod === 'quarter') {
        prevDate.setMonth(prevDate.getMonth() - 3);
    } else if (currentPeriod === 'week') {
        prevDate.setDate(prevDate.getDate() - 7);
    }
    
    const prevTransactions = filterTransactionsByPeriod(allTransactions, currentPeriod, prevDate);
    const prevIncome = prevTransactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
    const prevExpenses = prevTransactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
    
    const currentIncome = filteredTransactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
    const currentExpenses = filteredTransactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
    
    const incomeChange = prevIncome > 0 ? ((currentIncome - prevIncome) / prevIncome * 100) : 0;
    const expenseChange = prevExpenses > 0 ? ((currentExpenses - prevExpenses) / prevExpenses * 100) : 0;
    
    return {
        incomeChange: Math.round(incomeChange),
        expenseChange: Math.round(expenseChange)
    };
}

// ==========================================
// UI UPDATES
// ==========================================
function updateDashboard() {
    if (currentView === 'dashboard') {
        updateOverviewDashboard();
    } else if (currentView === 'business') {
        updateBusinessDashboard();
    }
}

function updateOverviewDashboard() {
    const metrics = calculateMetrics(filteredTransactions);
    
    updatePeriodDisplay();
    
    // Update KPI cards
    const cards = document.querySelectorAll('.card-glass');
    
    // Total Earnings
    const earningsCard = cards[0];
    if (earningsCard) {
        const value = earningsCard.querySelector('h3');
        const change = earningsCard.querySelector('.text-emerald-600, .text-rose-600');
        if (value) value.innerHTML = `₹${metrics.totalIncome.toLocaleString()}`;
        if (change) {
            const changeVal = metrics.incomeChange;
            change.className = changeVal >= 0 ? 'flex items-center mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md' : 'flex items-center mt-2 text-xs font-medium text-rose-600 bg-rose-50 w-fit px-2 py-1 rounded-md';
            change.innerHTML = `<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>${changeVal > 0 ? '+' : ''}${changeVal}% vs last ${currentPeriod}`;
        }
    }
    
    // Total Expenses
    const expensesCard = cards[1];
    if (expensesCard) {
        const value = expensesCard.querySelector('h3');
        const change = expensesCard.querySelector('.text-rose-600, .text-emerald-600');
        if (value) value.innerHTML = `₹${metrics.totalExpenses.toLocaleString()}`;
        if (change) {
            const changeVal = metrics.expenseChange;
            change.className = changeVal >= 0 ? 'flex items-center mt-2 text-xs font-medium text-rose-600 bg-rose-50 w-fit px-2 py-1 rounded-md' : 'flex items-center mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md';
            change.innerHTML = `<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/></svg>${changeVal > 0 ? '+' : ''}${changeVal}% vs last ${currentPeriod}`;
        }
    }
    
    // Net Balance
    const netCard = cards[2];
    if (netCard) {
        const value = netCard.querySelector('h3');
        if (value) value.innerHTML = `₹${metrics.netBalance.toLocaleString()}`;
    }
    
    // Current Balance
    const balanceCard = cards[3];
    if (balanceCard) {
        const value = balanceCard.querySelector('h3');
        if (value) value.innerHTML = `₹${metrics.currentBalance.toLocaleString()}`;
    }
    
    updateOverviewCharts(metrics);
}

function updateOverviewCharts(metrics) {
    if (charts.overviewFlow) {
        const weeklyData = metrics.weeklyData;
        const labels = Object.keys(weeklyData);
        const incomeData = labels.map(week => weeklyData[week].income);
        const expenseData = labels.map(week => weeklyData[week].expenses);
        
        charts.overviewFlow.data.labels = labels;
        charts.overviewFlow.data.datasets[0].data = incomeData;
        charts.overviewFlow.data.datasets[1].data = expenseData;
        charts.overviewFlow.update();
    }
    
    if (charts.overviewCat) {
        const categories = Object.keys(metrics.categoryBreakdown);
        const amounts = Object.values(metrics.categoryBreakdown);
        const total = amounts.reduce((sum, amt) => sum + amt, 0);
        
        charts.overviewCat.data.labels = categories;
        charts.overviewCat.data.datasets[0].data = amounts;
        charts.overviewCat.update();
        
        const centerText = document.querySelector('.text-xl.font-bold.text-gray-900');
        if (centerText && centerText.textContent.includes('₹')) {
            centerText.textContent = `₹${(total / 1000).toFixed(1)}k`;
        }
        
        const legendContainer = document.querySelector('.space-y-3');
        if (legendContainer && categories.length > 0) {
            legendContainer.innerHTML = categories.slice(0, 3).map((cat, idx) => {
                const percentage = ((amounts[idx] / total) * 100).toFixed(0);
                const colors = ['bg-slate-800 ring-slate-100', 'bg-violet-500 ring-violet-100', 'bg-emerald-400 ring-emerald-100'];
                const hoverColors = ['group-hover:text-slate-900', 'group-hover:text-violet-900', 'group-hover:text-emerald-900'];
                return `
                    <div class="flex justify-between items-center group cursor-pointer">
                        <div class="flex items-center gap-2.5">
                            <div class="w-3 h-3 rounded-full ${colors[idx]} ring-2"></div>
                            <span class="text-sm font-medium text-gray-600 ${hoverColors[idx]} transition-colors">${cat}</span>
                        </div>
                        <span class="text-sm font-bold text-gray-900">${percentage}%</span>
                    </div>
                `;
            }).join('');
        }
    }
}

function updateBusinessDashboard() {
    // Placeholder
}

// ==========================================
// PERIOD NAVIGATION
// ==========================================
function updatePeriodDisplay() {
    const periodDisplay = document.querySelector('.font-bold.text-xl.text-gray-800');
    if (!periodDisplay) return;
    
    if (currentPeriod === 'month') {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        periodDisplay.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (currentPeriod === 'quarter') {
        const quarter = Math.floor(currentDate.getMonth() / 3) + 1;
        periodDisplay.textContent = `Q${quarter} ${currentDate.getFullYear()}`;
    } else if (currentPeriod === 'week') {
        const weekNum = getWeekOfMonth(currentDate);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        periodDisplay.textContent = `Week ${weekNum}, ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
}

function navigatePeriod(direction) {
    if (currentPeriod === 'month') {
        currentDate.setMonth(currentDate.getMonth() + direction);
    } else if (currentPeriod === 'quarter') {
        currentDate.setMonth(currentDate.getMonth() + (direction * 3));
    } else if (currentPeriod === 'week') {
        currentDate.setDate(currentDate.getDate() + (direction * 7));
    }
    
    filteredTransactions = filterTransactionsByPeriod(allTransactions, currentPeriod, currentDate);
    updateDashboard();
}

function setPeriod(period) {
    currentPeriod = period;
    currentDate = new Date();
    
    document.querySelectorAll('.segment-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    filteredTransactions = filterTransactionsByPeriod(allTransactions, currentPeriod, currentDate);
    updateDashboard();
}

// ==========================================
// LOADING & ERROR STATES
// ==========================================
function showLoadingState() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="flex items-center justify-center h-full">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p class="text-gray-600 font-medium">Processing Excel file...</p>
                </div>
            </div>
        `;
    }
}

function hideLoadingState() {
    // Content will be replaced
}

function showError(message) {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="flex items-center justify-center h-full">
                <div class="text-center max-w-md">
                    <div class="text-red-500 text-6xl mb-4">⚠️</div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Error</h3>
                    <p class="text-gray-600 mb-4">${message}</p>
                    <button onclick="createFileUploadUI()" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }
}

// ==========================================
// SIDEBAR & NAVIGATION
// ==========================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth < 1024) {
        sidebar.classList.toggle('hidden');
    } else {
        sidebar.classList.toggle('collapsed');
    }
}

function switchTab(tabName) {
    currentView = tabName;
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('nav-active');
        item.classList.add('nav-inactive');
    });
    
    const activeNav = document.getElementById(`nav-${tabName}`);
    if (activeNav) {
        activeNav.classList.remove('nav-inactive');
        activeNav.classList.add('nav-active');
    }
    
    const headerTitles = {
        'dashboard': 'Overview Dashboard',
        'business': 'Business Analytics',
        'calendar': 'Calendar & Events'
    };
    document.getElementById('viewHeaderTitle').textContent = headerTitles[tabName] || 'Dashboard';
    
    destroyAllCharts();
    loadContent(tabName);
    
    if (window.innerWidth < 1024) {
        document.getElementById('sidebar').classList.add('hidden');
    }
}

function destroyAllCharts() {
    Object.keys(charts).forEach(key => {
        if (charts[key]) {
            charts[key].destroy();
            charts[key] = null;
        }
    });
}

function loadContent(view) {
    const mainContent = document.getElementById('main-content');
    
    if (view === 'dashboard') {
        mainContent.innerHTML = getOverviewHTML();
        setTimeout(() => {
            initOverviewCharts();
            if (allTransactions.length > 0) {
                updateOverviewDashboard();
                attachEventListeners();
            }
        }, 100);
    } else if (view === 'business') {
        mainContent.innerHTML = '<div class="text-center py-20"><h3 class="text-2xl font-bold text-gray-800">Business Analytics Coming Soon</h3></div>';
    } else if (view === 'calendar') {
        mainContent.innerHTML = '<div class="text-center py-20"><h3 class="text-2xl font-bold text-gray-800">Calendar View Coming Soon</h3></div>';
    }
}

function attachEventListeners() {
    const prevBtn = document.querySelectorAll('.hover\\:text-gray-900')[0];
    const nextBtn = document.querySelectorAll('.hover\\:text-gray-900')[1];
    
    if (prevBtn) prevBtn.onclick = () => navigatePeriod(-1);
    if (nextBtn) nextBtn.onclick = () => navigatePeriod(1);
    
    const segmentBtns = document.querySelectorAll('.segment-btn');
    if (segmentBtns[0]) segmentBtns[0].onclick = (e) => { event = e; setPeriod('quarter'); };
    if (segmentBtns[1]) segmentBtns[1].onclick = (e) => { event = e; setPeriod('month'); };
    if (segmentBtns[2]) segmentBtns[2].onclick = (e) => { event = e; setPeriod('week'); };
}

// ==========================================
// HTML TEMPLATES
// ==========================================
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
                <div class="flex p-1 bg-slate-100/80 rounded-xl w-full md:w-auto">
                    <button class="segment-btn px-4 py-1.5 rounded-lg text-sm text-gray-500 w-full md:w-auto">Quarter</button>
                    <button class="segment-btn active px-4 py-1.5 rounded-lg text-sm text-gray-500 w-full md:w-auto">Month</button>
                    <button class="segment-btn px-4 py-1.5 rounded-lg text-sm text-gray-500 w-full md:w-auto">Week</button>
                </div>
                <button onclick="createFileUploadUI()" class="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-lg">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                    <span>Reload Data</span>
                </button>
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
                <h3 class="text-3xl font-bold text-gray-900 tracking-tight">₹0</h3>
                <div class="flex items-center mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                    +0% vs last month
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
                <h3 class="text-3xl font-bold text-gray-900 tracking-tight">₹0</h3>
                <div class="flex items-center mt-2 text-xs font-medium text-rose-600 bg-rose-50 w-fit px-2 py-1 rounded-md">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/></svg>
                    +0% vs last month
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
                <h3 class="text-3xl font-bold text-gray-900 tracking-tight">₹0</h3>
                <p class="text-xs text-gray-400 mt-2 font-medium">After all transactions</p>
            </div>

            <!-- Current Balance -->
            <div class="card-glass p-6 bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none ring-0 shadow-lg shadow-indigo-200 group">
                <div class="flex items-center justify-between mb-3">
                    <p class="text-sm font-medium text-indigo-100">Available Funds</p>
                    <svg class="w-5 h-5 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <h3 class="text-3xl font-bold tracking-tight mb-4">₹0</h3>
                <div class="flex items-center gap-2">
                    <span class="inline-flex w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span class="text-xs font-medium text-indigo-100">From Local Excel</span>
                </div>
            </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
            
            <!-- Flow Analysis Chart -->
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
                            <span class="text-xl font-bold text-gray-900">₹0</span>
                        </div>
                    </div>
                    
                    <div class="flex-1 w-full space-y-3">
                        <div class="flex justify-between items-center group cursor-pointer">
                            <div class="flex items-center gap-2.5">
                                <div class="w-3 h-3 rounded-full bg-slate-800 ring-2 ring-slate-100"></div>
                                <span class="text-sm font-medium text-gray-600 group-hover:text-slate-900 transition-colors">Category 1</span>
                            </div>
                            <span class="text-sm font-bold text-gray-900">0%</span>
                        </div>
                        <div class="flex justify-between items-center group cursor-pointer">
                            <div class="flex items-center gap-2.5">
                                <div class="w-3 h-3 rounded-full bg-violet-500 ring-2 ring-violet-100"></div>
                                <span class="text-sm font-medium text-gray-600 group-hover:text-violet-900 transition-colors">Category 2</span>
                            </div>
                            <span class="text-sm font-bold text-gray-900">0%</span>
                        </div>
                        <div class="flex justify-between items-center group cursor-pointer">
                            <div class="flex items-center gap-2.5">
                                <div class="w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-emerald-100"></div>
                                <span class="text-sm font-medium text-gray-600 group-hover:text-emerald-900 transition-colors">Category 3</span>
                            </div>
                            <span class="text-sm font-bold text-gray-900">0%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

// ==========================================
// CHART INITIALIZATION
// ==========================================
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
                labels: [],
                datasets: [
                    {
                        label: 'Earnings',
                        data: [],
                        backgroundColor: gradEarnings,
                        borderRadius: 6,
                        barPercentage: 0.6,
                        categoryPercentage: 0.8
                    },
                    {
                        label: 'Expenses',
                        data: [],
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
        const colors = ['#1e293b', '#8b5cf6', '#34d399', '#f97316', '#06b6d4', '#ec4899', '#f59e0b', '#6366f1'];
        charts.overviewCat = new Chart(ctxCat.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: colors,
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

// ==========================================
// PAGE LOAD
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth >= 1024) {
        sidebar.classList.remove('hidden');
    } else {
        sidebar.classList.add('hidden');
    }
    
    // Show file upload UI
    createFileUploadUI();
});
