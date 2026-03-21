/**
 * API Client - Client JavaScript pour communiquer avec le backend
 * Gère les requêtes HTTP vers l'API
 */
class APIClient {
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
    }

    /**
     * Effectuer une requête HTTP générique
     * @param {string} endpoint - Point de terminaison de l'API
     * @param {string} method - Méthode HTTP
     * @param {Object} data - Données à envoyer
     * @returns {Promise<Object>}
     */
    // 
    async request(endpoint, method = 'GET', data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
            options.body = new URLSearchParams(data).toString();
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, options);
            
            // Gérer les redirections
            if (response.redirected) {
                window.location.href = response.url;
                return null;
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return { success: response.ok };
        } catch (error) {
            console.error('Erreur API:', error);
            throw error;
        }
    }

    // ===== UTILISATEURS ======

    /**
     * Obtenir le profil de l'utilisateur connecté
     * @returns {Promise<Object>}
     */
    async getProfile() {
        return this.request('/users/profile', 'GET');
    }

    /**
     * Mettre à jour le profil
     * @param {Object} data - Données du profil
     * @returns {Promise<Object>} - Résultat de la mise à jour
     */
    async updateProfile(data) {
        return this.request('/users/profile', 'PUT', data);
    }

    /**
     * Changer le mot de passe
     * @param {string} oldPassword 
     * @param {string} newPassword 
     * @returns {Promise<Object>}
     */
    async changePassword(oldPassword, newPassword) {
        return this.request('/users/change-password', 'POST', { oldPassword, newPassword });
    }

    /**
     * Demander la réinitialisation du mot de passe
     * @param {string} email 
     * @returns {Promise<Object>}
     */
    async requestPasswordReset(email) {
        return this.request('/users/reset-password', 'POST', { email });
    }

    /**
     * Réinitialiser le mot de passe avec un token
     * @param {string} token 
     * @param {string} newPassword 
     * @returns {Promise<Object>}
     */
    async resetPassword(token, newPassword) {
        return this.request('/users/reset-password/confirm', 'POST', { token, newPassword });
    }

    // ===== TRANSACTIONS =====

    /**
     * Obtenir toutes les transactions
     * @param {Object} filters - Filtres optionnels
     * @returns {Promise<Object[]>}
     */
    async getTransactions(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return this.request(`/transactions?${params}`, 'GET');
    }

    /**
     * Obtenir une transaction par ID
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    async getTransaction(id) {
        return this.request(`/transactions/${id}`, 'GET');
    }

    /**
     * Créer une transaction
     * @param {Object} data - Données de la transaction
     * @returns {Promise<Object>}
     */
    async createTransaction(data) {
        return this.request('/transactions', 'POST', data);
    }

    /**
     * Mettre à jour une transaction
     * @param {number} id 
     * @param {Object} data - Données à mettre à jour
     * @returns {Promise<Object>}
     */
    async updateTransaction(id, data) {
        return this.request(`/transactions/${id}`, 'PUT', data);
    }

    /**
     * Supprimer une transaction
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    async deleteTransaction(id) {
        return this.request(`/transactions/${id}`, 'DELETE');
    }

    // ====== CATÉGORIES =======

    /**
     * Obtenir toutes les catégories
     * @returns {Promise<Object[]>}
     */
    async getCategories() {
        return this.request('/categories', 'GET');
    }

    /**
     * Créer une catégorie
     * @param {string} name - Nom de la catégorie
     * @returns {Promise<Object>}
     */
    async createCategory(name) {
        return this.request('/categories', 'POST', { name });
    }

    /**
     * Mettre à jour une catégorie
     * @param {number} id 
     * @param {string} name - Nouveau nom
     * @returns {Promise<Object>}
     */
    async updateCategory(id, name) {
        return this.request(`/categories/${id}`, 'PUT', { name });
    }

    /**
     * Supprimer une catégorie
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    async deleteCategory(id) {
        return this.request(`/categories/${id}`, 'DELETE');
    }

    // ======= STATISTIQUES ========

    /**
     * Obtenir les statistiques globales
     * @param {Object} filters - Filtres optionnels (type, period)
     * @returns {Promise<Object>}
     */
    async getStats(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return this.request(`/stats?${params}`, 'GET');
    }

    /**
     * Obtenir les statistiques par catégorie
     * @param {string} type - 'income' ou 'expense'
     * @param {string} period - Période
     * @returns {Promise<Object[]>}
     */
    async getCategoryStats(type = 'expense', period = 'month') {
        return this.request(`/stats/categories?type=${type}&period=${period}`, 'GET');
    }

    /**
     * Obtenir l'évolution mensuelle
     * @param {number} months 
     * @returns {Promise<Object[]>}
     */
    async getMonthlyEvolution(months = 6) {
        return this.request(`/stats/monthly?months=${months}`, 'GET');
    }

    /**
     * Obtenir le graphique en secteurs
     * @param {string} type 
     * @returns {Promise<Object>}
     */
    async getPieChartData(type = 'expense') {
        return this.request(`/stats/pie?type=${type}`, 'GET');
    }

    /**
     * Obtenir les données du graphique linéaire
     * @returns {Promise<Object>}
     */
    async getLineChartData() {
        return this.request('/stats/line', 'GET');
    }

    // ========== HOMEPAGE ===========

    /**
     * Obtenir les données de la page d'accueil
     * @returns {Promise<Object>} - Données globales pour l'accueil (solde, transactions récentes, etc.)
     */
    async getHomeData() {
        return this.request('/home', 'GET'); // Point de terminaison pour les données globales de l'accueil
    }

    /**
     * Obtenir le solde
     * @returns {Promise<number>}
     */
    async getBalance() {
        return this.request('/balance', 'GET');
    }

    /**
     * Effectuer un top-up/recharge
     * @param {number} amount - Montant à recharger
     * @returns {Promise<Object>}
     */
    async topup(amount) {
        return this.request('/topup', 'POST', { amount });
    }

    // =========== DESTINATAIRES =============

    /**
     * Obtenir tous les destinataires
     * @returns {Promise<Object[]>}
     */
    async getRecipients() {
        return this.request('/recipients', 'GET');
    }

    /**
     * Créer un destinataire
     * @param {Object} data - Données du destinataire
     * @returns {Promise<Object>}
     */
    async createRecipient(data) {
        return this.request('/recipients', 'POST', data);
    }

    /**
     * Supprimer un destinataire
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    async deleteRecipient(id) {
        return this.request(`/recipients/${id}`, 'DELETE');
    }

    // =========== CARTES BANCAIRES =============

    /**
     * Obtenir toutes les cartes
     */
    async getCards() {
        return this.request('/cards', 'GET');
    }

    /**
     * Obtenir une carte spécifique
     */
    async getCard(id) {
        return this.request(`/cards/${id}`, 'GET');
    }

    /**
     * Supprimer une carte
     */
    async deleteCard(id) {
        return this.request(`/cards/${id}`, 'DELETE');
    }
}

// Créer une instance globale du client API
const api = new APIClient();

// Fonctions utilitaires pour l'interface utilisateur
const UI = {
    /**
     * Afficher une notification
     * @param {string} message 
     * @param {string} type - 'success', 'error', 'warning', 'info'
     */
    showNotification(message, type = 'info') {
        // Supprimer les notifications existantes
        const existingNotifications = document.querySelectorAll('.notification-toast');
        existingNotifications.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `notification-toast alert alert-${type} position-fixed top-0 end-0 m-3`;
        notification.style.zIndex = '9999';
        notification.textContent = message;

        document.body.appendChild(notification);

        // Supprimer après 3 secondes
        setTimeout(() => {
            notification.remove();
        }, 3000);
    },

    /**
     * Formater un montant en euros
     * @param {number} amount 
     * @returns {string}
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    },

    /**
     * Formater une date
     * @param {string|Date} date 
     * @returns {string}
     */
    formatDate(date) {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    },

    /**
     * Formater une date relative (aujourd'hui, hier, il y a X jours)
     * @param {string|Date} date 
     * @returns {string}
     */
    formatRelativeDate(date) {
        const now = new Date();
        const transactionDate = new Date(date);
        const diffMs = now - transactionDate;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Aujourd\'hui';
        if (diffDays === 1) return 'Hier';
        if (diffDays < 7) return `Il y a ${diffDays} jours`;
        
        return this.formatDate(date);
    },

    /**
     * Charger et afficher les transactions
     * @param {string} containerId 
     * @param {Object} filters 
     */
    async loadTransactions(containerId, filters = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            const transactions = await api.getTransactions(filters);
            
            if (!transactions || transactions.length === 0) {
                container.innerHTML = '<p class="text-muted text-center">Aucune transaction</p>';
                return;
            }
            // Afficher les transactions
            container.innerHTML = transactions.map(tx => `
                <div class="transaction-item px-3 py-3 border-bottom">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <div class="p-2 me-3 rounded-circle ${tx.type === 'income' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}">
                                <i class="bi bi-${tx.type === 'income' ? 'arrow-down' : 'arrow-up'}"></i>
                            </div>
                            <div>
                                <p class="fw-medium text-dark mb-0">${tx.title}</p>
                                <p class="small text-muted mb-0">${tx.category_name || 'Sans catégorie'} • ${UI.formatRelativeDate(tx.created_at)}</p>
                            </div>
                        </div>
                        <p class="fs-6 fw-semibold mb-0 ${tx.type === 'income' ? 'text-success' : 'text-danger'}">
                            ${tx.type === 'income' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)} €
                        </p>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Erreur chargement transactions:', error);
            container.innerHTML = '<p class="text-danger">Erreur lors du chargement</p>';
        }
    },

    /**
     * Charger le solde
     * @param {string} elementId 
     */
    async loadBalance(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        try {
            const data = await api.getHomeData();
            element.textContent = UI.formatCurrency(data.balance);
        } catch (error) {
            console.error('Erreur chargement solde:', error);
            element.textContent = 'Erreur';
        }
    }
};

// Rendre les fonctions disponibles globalement
window.api = api;
window.UI = UI;
