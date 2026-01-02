/* =========================================
   CHART: OVERVIEW DASHBOARD
   ========================================= */
function initOverviewCharts() {
    // 1. Flow Analysis (Bar Chart)
    const ctxFlow = document.getElementById('chart-overview-flow');
    if (ctxFlow) {
        const ctx = ctxFlow.getContext('2d');
        // Gradients from your code
        const gradEarnings = ctx.createLinearGradient(0, 0, 0, 300);
        gradEarnings.addColorStop(0, '#10b981'); // Emerald 500
        gradEarnings.addColorStop(1, '#059669'); // Emerald 600

        const gradExpenses = ctx.createLinearGradient(0, 0, 0, 300);
        gradExpenses.addColorStop(0, '#f43f5e'); // Rose 500
        gradExpenses.addColorStop(1, '#e11d48'); // Rose 600

        charts.overviewFlow = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [
                    {
                        label: 'Earnings',
                        data: [3200, 4500, 2800, 1500],
                        backgroundColor: gradEarnings,
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

    // 2. Spending Breakdown (Doughnut)
    const ctxCat = document.getElementById('chart-overview-cat');
    if (ctxCat) {
        charts.overviewCat = new Chart(ctxCat.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Operations', 'Marketing', 'Software'],
                datasets: [{
                    data: [45, 30, 25],
                    backgroundColor: [
                        '#1e293b', // Slate 800
                        '#8b5cf6', // Violet 500
                        '#34d399'  // Emerald 400
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '80%',
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
}
