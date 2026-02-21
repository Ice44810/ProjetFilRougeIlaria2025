/**
 * Bank History - Gestion de l'historique bancaire avec graphiques dynamiques
 * Charge les données depuis l'API et génère des graphiques Chart.js
 */

// Instance du graphique
let transactionsChart = null;

// État des filtres
let currentPeriod = '7days';

// Couleurs pour les graphiques
const CHART_COLORS = {
    income: '#198754',    // Vert pour les revenus
    expense: '#dc3545',   // Rouge pour les dépenses
    incomeBg: 'rgba(25, 135, 84, 0.5)',
    expenseBg: 'rgba(220, 53, 69, 0.5)'
};

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Bank History: Initialisation...');
    
    // Configurer les écouteurs d'événements pour les onglets
    setupTabListeners();
    
    // Charger les données initiales (7 jours)
    await loadDataForPeriod('7days');
});

/**
 * Configurer les écouteurs d'événements pour les onglets
 */
function setupTabListeners() {
    const tabs = document.querySelectorAll('#historyTabs .nav-link');
    
    tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', async (event) => {
            const targetId = event.target.getAttribute('data-bs-target');
            let period = '7days';
            
            if (targetId === '#30days') {
                period = '30days';
            } else if (targetId === '#custom') {
                period = 'custom';
            }
            
            await loadDataForPeriod(period);
        });
    });
}

/**
 * Charger les données pour une période donnée
 * @param {string} period - '7days', '30days', ou 'custom'
 */
async function loadDataForPeriod(period) {
    currentPeriod = period;
    console.log(`Bank History: Chargement pour ${period}...`);
    
    try {
        // Charger les statistiques
        await loadStats(period);
        
        // Charger les transactions et mettre à jour le graphique
        await loadTransactionsAndChart(period);
        
    } catch (error) {
        console.error('Erreur chargement données:', error);
    }
}

/**
 * Charger les statistiques (totaux revenus/dépenses)
 * @param {string} period 
 */
async function loadStats(period) {
    try {
        const periodFilter = getPeriodFilter(period);
        const stats = await api.getStats({ period: periodFilter });
        
        // Mettre à jour les éléments du DOM
        const totalIncomeEl = document.getElementById('totalIncome');
        const totalExpenseEl = document.getElementById('totalExpense');
        
        if (totalIncomeEl) {
            totalIncomeEl.textContent = formatCurrency(stats.totalIncome || 0);
        }
        
        if (totalExpenseEl) {
            totalExpenseEl.textContent = formatCurrency(stats.totalExpense || 0);
        }
        
    } catch (error) {
        console.error('Erreur chargement stats:', error);
    }
}

/**
 * Charger les transactions et mettre à jour le graphique
 * @param {string} period 
 */
async function loadTransactionsAndChart(period) {
    try {
        const periodFilter = getPeriodFilter(period);
        const transactions = await api.getTransactions({ period: periodFilter });
        
        // Grouper les transactions par jour pour le graphique
        const dailyData = groupTransactionsByDay(transactions, period);
        
        // Créer/mettre à jour le graphique
        await renderChart(dailyData, period);
        
    } catch (error) {
        console.error('Erreur chargement transactions:', error);
    }
}

/**
 * Convertir la période en filtre API
 * @param {string} period 
 * @returns {string}
 */
function getPeriodFilter(period) {
    switch (period) {
        case '7days':
            return 'week';
        case '30days':
            return 'month';
        case 'custom':
            return 'month'; // Par défaut pour custom
        default:
            return 'week';
    }
}

/**
 * Grouper les transactions par jour
 * @param {Array} transactions 
 * @param {string} period 
 * @returns {Object}
 */
function groupTransactionsByDay(transactions, period) {
    const daysCount = period === '30days' ? 30 : 7;
    const result = [];
    
    // Créer un tableau des derniers jours
    const today = new Date();
    for (let i = daysCount - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        result.push({
            date: dateStr,
            label: formatDateShort(date),
            income: 0,
            expense: 0
        });
    }
    
    // Remplir avec les données des transactions
    if (transactions && transactions.length > 0) {
        transactions.forEach(tx => {
            const txDate = new Date(tx.created_at).toISOString().split('T')[0];
            const dayData = result.find(d => d.date === txDate);
            
            if (dayData) {
                const amount = parseFloat(tx.amount);
                if (tx.type === 'income') {
                    dayData.income += amount;
                } else {
                    dayData.expense += amount;
                }
            }
        });
    }
    
    return result;
}

/**
 * Afficher le graphique avec Chart.js
 * @param {Array} dailyData 
 * @param {string} period 
 */
async function renderChart(dailyData, period) {
    // Identifier le conteneur du graphique en fonction de l'onglet actif
    let chartContainer = null;
    
    if (period === '7days' || !document.querySelector('#30days').classList.contains('active')) {
        chartContainer = document.querySelector('#7days .chart-content');
    } else if (period === '30days') {
        chartContainer = document.querySelector('#30days .chart-content');
    } else {
        chartContainer = document.querySelector('#custom .chart-content');
    }
    
    if (!chartContainer) {
        console.error('Conteneur de graphique non trouvé');
        return;
    }
    
    // Supprimer l'ancien graphique s'il existe
    if (transactionsChart) {
        transactionsChart.destroy();
        transactionsChart = null;
    }
    
    // Supprimer les barres statiques existantes
    const existingBars = chartContainer.querySelectorAll('.bar');
    existingBars.forEach(bar => bar.remove());
    
    // Supprimer la grille existante si elle干涉 avec le canvas
    const existingCanvas = chartContainer.querySelector('canvas');
    if (existingCanvas) {
        existingCanvas.remove();
    }
    
    // Créer un élément canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'transactionsChart';
    canvas.style.position = 'relative';
    canvas.style.zIndex = '1';
    chartContainer.appendChild(canvas);
    
    // Préparer les données pour Chart.js
    const labels = dailyData.map(d => d.label);
    const incomeData = dailyData.map(d => d.income);
    const expenseData = dailyData.map(d => -Math.abs(d.expense)); // Négatif pour les dépenses
    
    // Créer le graphique à barres
    const ctx = canvas.getContext('2d');
    transactionsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Revenus',
                    data: incomeData,
                    backgroundColor: CHART_COLORS.incomeBg,
                    borderColor: CHART_COLORS.income,
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: 'Dépenses',
                    data: expenseData,
                    backgroundColor: CHART_COLORS.expenseBg,
                    borderColor: CHART_COLORS.expense,
                    borderWidth: 1,
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const label = context.dataset.label;
                            return `${label}: ${formatCurrency(Math.abs(value))}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + ' €';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Mettre à jour les dates affichées
    updateChartDates(dailyData, period);
}

/**
 * Mettre à jour les dates sous le graphique
 * @param {Array} dailyData 
 * @param {string} period 
 */
function updateChartDates(dailyData, period) {
    let dateContainer = null;
    
    if (period === '7days' || !document.querySelector('#30days').classList.contains('active')) {
        dateContainer = document.querySelector('#7days .d-flex.justify-content-between.text-muted.small');
    } else if (period === '30days') {
        dateContainer = document.querySelector('#30days .d-flex.justify-content-between.text-muted.small');
    } else {
        dateContainer = document.querySelector('#custom .d-flex.justify-content-between.text-muted.small');
    }
    
    if (dateContainer && dailyData.length > 0) {
        const dates = dateContainer.querySelectorAll('span');
        if (dates.length >= 2) {
            dates[0].textContent = dailyData[0].label;
            dates[dates.length - 1].textContent = dailyData[dailyData.length - 1].label;
        }
    }
}

/**
 * Formater un montant en euros
 * @param {number} amount 
 * @returns {string}
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

/**
 * Formater une date en format court (JJ-MM)
 * @param {Date} date 
 * @returns {string}
 */
function formatDateShort(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}-${month}`;
}

/**
 * Formater une date relative
 * @param {string} dateString 
 * @returns {string}
 */
function formatRelativeDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `aujourd'hui ${hours}:${minutes}`;
    } else if (diffDays === 1) {
        return 'hier';
    } else if (diffDays < 7) {
        return `il y a ${diffDays} jours`;
    }
    
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Rendre disponible globalement
window.BankHistory = {
    loadDataForPeriod,
    loadStats,
    loadTransactionsAndChart,
    refresh: () => loadDataForPeriod(currentPeriod)
};

