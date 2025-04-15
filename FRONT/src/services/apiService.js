const API_BASE_URL = 'http://localhost:5000';

class ApiService {
    constructor() {
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
    }

    // Método genérico para manejar todas las peticiones
    async _fetch(endpoint, method = 'GET', body = null, customHeaders = {}) {
        const headers = {
            ...this.defaultHeaders,
            ...customHeaders
        };

        const config = {
            method,
            headers,
            credentials: 'include', // Para enviar cookies (JWT)
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg = errorData.msg || 'Error en la solicitud';
                throw new Error(errorMsg);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ==================== AUTHENTICATION ====================
    login = (credentials) => this._fetch('/login', 'POST', credentials);
    register =  (credentials) => this._fetch('/register', 'POST', credentials);
    logout = () => this._fetch('/logout', 'POST');
    checkAuth = () => this._fetch('/check-auth', 'GET');
    getProfile = () => this._fetch('/profile', 'GET');

    // ==================== USER SETTINGS ====================
    getSettings = () => this._fetch('/settings', 'GET');
    updateSettings = (settings) => this._fetch('/settings', 'PUT', settings);

    // ==================== CATEGORIES ====================
    getCategories = () => this._fetch('/categories', 'GET');
    getCategory = (categoryId) => this._fetch(`/categories/${categoryId}`, 'GET');
    createCategory = (category) => this._fetch('/categories', 'POST', category);
    updateCategory = (categoryId, category) => this._fetch(`/categories/${categoryId}`, 'PUT', category);
    deleteCategory = (categoryId) => this._fetch(`/categories/${categoryId}`, 'DELETE');

    // ==================== TRANSACTIONS ====================
    getTransactions = () => this._fetch('/transactions', 'GET');
    getTransaction = (transactionId) => this._fetch(`/transactions/${transactionId}`, 'GET');
    createTransaction = (transaction) => this._fetch('/transactions', 'POST', transaction);
    updateTransaction = (transactionId, transaction) => this._fetch(`/transactions/${transactionId}`, 'PUT', transaction);
    deleteTransaction = (transactionId) => this._fetch(`/transactions/${transactionId}`, 'DELETE');
    getTransactionsSummary = () => this._fetch('/transactions/summary', 'GET');

    // ==================== HISTORY ====================
    getMonthlyHistory = () => this._fetch('/history/monthly', 'GET');
    getYearlyHistory = () => this._fetch('/history/yearly', 'GET');
}

export default new ApiService();
