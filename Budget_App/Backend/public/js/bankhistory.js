/**
 * Bank History - Gestion de l'historique bancaire avec graphiques dynamiques
 * Charge les données depuis l'API et génère des graphiques Chart.js
 */

// État des filtres
let currentPeriod = '7days';
let currentMonthFilter = 'all';
let currentStatusFilter = 'all';


// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Bank History: Initialisation...');
    
    // Configurer les écouteurs d'événements pour les onglets
    setupTabListeners();
    
    // Configurer les écouteurs pour le modal de filtres
    setupFilterListeners();

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
 * Configurer les écouteurs d'événements pour les filtres du modal
 */
function setupFilterListeners() {
    const monthBtns = document.querySelectorAll('#monthFilters .btn-filter');
    monthBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            monthBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentMonthFilter = e.target.getAttribute('data-value');
        });
    });

    const statusBtns = document.querySelectorAll('#statusFilters .btn-filter');
    statusBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            statusBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentStatusFilter = e.target.getAttribute('data-value');
        });
    });

    const applyBtn = document.getElementById('applyFiltersBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            // Fermer l'offcanvas
            const offcanvasEl = document.getElementById('offcanvasFilter');
            const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl) || new bootstrap.Offcanvas(offcanvasEl);
            offcanvas.hide();
            
            // Recharger les données en appliquant les nouveaux filtres
            loadDataForPeriod(currentPeriod);
        });
    }
}

/**
 * Charger les données pour une période donnée
 * @param {string} period - '7days', '30days', ou 'custom'
 */
async function loadDataForPeriod(period) {
    currentPeriod = period;
    console.log(`Bank History: Chargement pour ${period}...`);
    
    // 1. Charger les statistiques (Try/Catch séparé pour ne pas bloquer la suite)
    try {
        await loadStats(period);
    } catch (error) {
        console.warn('Erreur chargement statistiques (ignorée):', error);
    }
    
    // 2. Charger les transactions (Try/Catch séparé)
    try {
        await loadTransactionsAndChart(period);
    } catch (error) {
        console.error('Erreur chargement des transactions:', error);
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
        let periodFilter = getPeriodFilter(period);
        
        // Si un mois spécifique est sélectionné, on récupère plus de données (l'année) pour pouvoir filtrer côté client
        if (currentMonthFilter !== 'all') {
            periodFilter = 'year';
        }
        
        const transactions = await api.getTransactions({ period: periodFilter });
        
        // Sécurité au cas où l'API renvoie une erreur au lieu d'un tableau
        let txList = Array.isArray(transactions) ? transactions : [];

        // Application du filtre de mois
        if (currentMonthFilter !== 'all') {
            const targetMonth = parseInt(currentMonthFilter);
            txList = txList.filter(tx => {
                const txDate = new Date(tx.created_at);
                return txDate.getMonth() === targetMonth; // 0 = Janvier, 1 = Février...
            });
        }

        // Application du filtre de statut
        if (currentStatusFilter !== 'all') {
            if (currentStatusFilter === 'success') {
                txList = txList.filter(tx => true); // Par défaut toutes les transactions en BDD sont "réussies"
            } else {
                txList = []; // Les statuts 'En cours' ou 'Échoué' ne renvoient rien car non existants en base
            }
        }

        // 1. Calcul et Mise à jour automatique des "Entrées" (income) et "Sorties" (expense)
        let tIncome = 0;
        let tExpense = 0;
        txList.forEach(tx => {
            if (tx.type === 'income') tIncome += parseFloat(tx.amount) || 0;
            else tExpense += parseFloat(tx.amount) || 0;
        });
        
        const elIn = document.getElementById('totalIncome');
        const elOut = document.getElementById('totalExpense');
        if (elIn) elIn.textContent = formatCurrency(tIncome);
        if (elOut) elOut.textContent = formatCurrency(tExpense);

        // 2. Mettre à jour la liste des transactions en premier
        renderTransactionsList(txList);
        
        // 3. Créer/mettre à jour le graphique s'il y a des données
        if (txList.length > 0) {
            try {
                const dailyData = groupTransactionsByDay(txList, period);
                await renderChart(dailyData, period);
            } catch (err) {
                console.error("Erreur génération graphique:", err);
            }
        } else {
            // Génère un graphique vide (plat) si aucune transaction
            const emptyData = groupTransactionsByDay([], period);
            await renderChart(emptyData, period);
        }
        
    } catch (error) {
        console.error('Erreur chargement transactions:', error);
        const container = document.getElementById('transactionsListContainer');
        if (container) container.innerHTML = '<p class="text-danger text-center py-4">Erreur serveur lors du chargement.</p>';
    }
}

/**
 * Afficher la liste des transactions
 * @param {Array} transactions 
 */
function renderTransactionsList(transactions) {
    const container = document.getElementById('transactionsListContainer');
    if (!container) return;
    
    if (!transactions || transactions.length === 0) {
        container.innerHTML = '<p class="text-center text-muted py-4">Aucune transaction pour cette période.</p>';
        return;
    }

    // Trier les transactions par date (la plus récente d'abord)
    transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Grouper par mois
    const grouped = {};
    transactions.forEach(tx => {
        const date = new Date(tx.created_at);
        // Ex: "Novembre"
        const monthYear = date.toLocaleDateString('fr-FR', { month: 'long' });
        const capitalizedMonth = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
        
        if (!grouped[capitalizedMonth]) {
            grouped[capitalizedMonth] = [];
        }
        grouped[capitalizedMonth].push(tx);
    });

    let html = '';
    for (const [month, txs] of Object.entries(grouped)) {
        html += `<h6 class="mb-3 mt-4">${month}</h6>`;
        
        txs.forEach(tx => {
            const isIncome = tx.type === 'income';
            const amountClass = isIncome ? 'text-success' : 'text-danger';
            const sign = isIncome ? '+' : '-';
            const formattedAmount = `${sign} €${Math.abs(parseFloat(tx.amount)).toFixed(2)}`;
            const dateStr = formatRelativeDate(tx.created_at);
            
            let iconClass = 'bi-cash-coin text-secondary';
            let link = '#';
            
            // Déterminer l'icône et le lien en fonction de la catégorie
            if (tx.category_id === 5) { iconClass = 'bi-phone text-primary'; link = './mobile.html'; }
            else if (tx.category_id === 6) { iconClass = 'bi-wifi text-primary'; link = './internet.html'; }
            else if (tx.category_id === 7) { iconClass = 'bi-lightning-charge-fill text-warning'; link = './electricity.html'; }
            else if (tx.category_id === 8) { iconClass = 'bi-droplet-fill text-info'; link = './waterbill.html'; }
            else if (isIncome) { iconClass = 'bi-arrow-down-left text-success'; }
            else { iconClass = 'bi-arrow-up-right text-danger'; }
            
            html += `
                <div class="d-flex align-items-center justify-content-between mb-4">
                    <div class="d-flex align-items-center">
                        <div class="transaction-icon me-3">
                            <i class="bi ${iconClass} fs-4"></i>
                        </div>
                        <div>
                            <a href="${link}" class="text-decoration-none text-dark">
                                <div class="fw-bold">${tx.title}</div>
                            </a>
                            <div class="text-muted small">${dateStr}</div>
                        </div>
                    </div>
                    <div class="fw-bold ${amountClass}">${formattedAmount}</div>
                </div>
            `;
        });
    }
    
    container.innerHTML = html;
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
            if (!tx.created_at) return;
            
            // Sécurisation de la lecture de la date venant de MySQL
            let dateObj = new Date(tx.created_at);
            if (isNaN(dateObj.getTime())) {
                dateObj = new Date(tx.created_at.replace(' ', 'T') + 'Z');
            }
            
            if (!isNaN(dateObj.getTime())) {
                const txDate = dateObj.toISOString().split('T')[0];
                const dayData = result.find(d => d.date === txDate);
                
                if (dayData) {
                    const amount = parseFloat(tx.amount);
                    if (tx.type === 'income') {
                        dayData.income += amount;
                    } else {
                        dayData.expense += amount;
                    }
                } // Ajout de l'accolade manquante qui bloquait le script !
            }
        });
    }
    
    return result;
}

/**
 * Afficher le graphique de façon dynamique avec le HTML/CSS d'origine (sans Chart.js)
 * @param {Array} dailyData 
 * @param {string} period 
 */
async function renderChart(dailyData, period) {
    let tabId = '7days';
    if (period === '30days') tabId = '30days';
    else if (period === 'custom') tabId = 'custom';
    
    const chartContainer = document.getElementById(tabId);
    if (!chartContainer) return;
    
    const barsContainer = chartContainer.querySelector('.chart-content .d-flex.justify-content-around');
    const yAxisContainer = chartContainer.querySelector('.y-axis');
    
    if (!barsContainer || !yAxisContainer) return;

    // 1. Calculer le solde net par jour
    const netData = dailyData.map(d => ({
        label: d.label,
        net: d.income - d.expense
    }));

    // 2. Déterminer l'échelle maximale pour l'axe Y
    let maxAbs = Math.max(...netData.map(d => Math.abs(d.net)));
    if (maxAbs === 0) maxAbs = 400; // Échelle par défaut
    
    let scaleMax = Math.ceil(maxAbs / 100) * 100; // Arrondi à la centaine supérieure
    if (scaleMax < 10) scaleMax = 10;

    // 3. Mettre à jour l'axe Y
    yAxisContainer.innerHTML = `
        <span>${scaleMax}</span>
        <span>${scaleMax / 2}</span>
        <span>0</span>
        <span>-${scaleMax / 2}</span>
        <span>-${scaleMax}</span>
    `;

    // 4. Gérer l'affichage (réduire la largeur si beaucoup de barres comme pour 30 jours)
    const barWidth = dailyData.length > 15 ? '8px' : '30px';
    const gapClass = dailyData.length > 15 ? 'gap-1' : 'gap-4';
    
    barsContainer.className = `d-flex justify-content-around align-items-center position-relative ${gapClass}`;

    // 5. Générer les barres HTML
    let barsHtml = '';
    const MAX_BAR_HEIGHT = 100; // Hauteur maximale visuelle d'une barre

    netData.forEach(d => {
        const isPositive = d.net >= 0;
        const value = Math.abs(d.net);
        const heightPx = Math.max((value / scaleMax) * MAX_BAR_HEIGHT, 2); // Minimum 2px pour être visible
        
        const tooltipText = `${d.label}: ${isPositive ? '+' : '-'}${value.toFixed(2)}€`;

        if (isPositive) {
            barsHtml += `<div class="bar up bg-success" style="height: ${heightPx}px; width: ${barWidth};" title="${tooltipText}"></div>`;
        } else {
            barsHtml += `<div class="bar down bg-danger" style="height: ${heightPx}px; width: ${barWidth};" title="${tooltipText}"></div>`;
        }
    });

    // Nettoyer si un canvas (Chart.js) traîne des versions précédentes
    const canvas = chartContainer.querySelector('canvas');
    if (canvas) canvas.remove();

    // 6. Injecter les nouvelles barres dynamiques
    barsContainer.innerHTML = barsHtml;
    
    // 7. Mettre à jour les dates affichées
    updateChartDates(dailyData, period);
}

/**
 * Mettre à jour les dates sous le graphique
 * @param {Array} dailyData 
 * @param {string} period 
 */
function updateChartDates(dailyData, period) {
    let dateContainer = null;
    
    if (period === '7days' || !document.getElementById('30days').classList.contains('active')) {
        dateContainer = document.getElementById('7days').querySelector('.d-flex.justify-content-between.text-muted.small');
    } else if (period === '30days') {
        dateContainer = document.getElementById('30days').querySelector('.d-flex.justify-content-between.text-muted.small');
    } else {
        dateContainer = document.getElementById('custom').querySelector('.d-flex.justify-content-between.text-muted.small');
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
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    
    if (diffDays === 0) {
        return `aujourd'hui ${timeStr}`;
    } else if (diffDays === 1) {
        return `hier ${timeStr}`;
    } else if (diffDays < 7) {
        return `il y a ${diffDays} jours à ${timeStr}`;
    }
    
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }) + ' ' + timeStr;
}

// Rendre disponible globalement
window.BankHistory = {
    loadDataForPeriod,
    loadStats,
    loadTransactionsAndChart,
    refresh: () => loadDataForPeriod(currentPeriod)
};
