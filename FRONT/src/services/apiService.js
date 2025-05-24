const API_BASE_URL = 'http://localhost:5000';
class ApiService {
    constructor() {
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
    }

    // Método genérico para manejar todas las peticiones
    async _fetch(endpoint, method = 'GET', body = null, customHeaders = {}, responseType = 'json') {
        const headers = {
            ...this.defaultHeaders,
            ...customHeaders
        };

        const config = {
            method,
            headers,
            credentials: 'include',
        };

        // No stringify si es FormData (para importar)
        if (body && !(body instanceof FormData)) {
            config.body = JSON.stringify(body);
        } else if (body) {
            config.body = body;
            // El navegador establecerá automáticamente el Content-Type con el boundary
            delete headers['Content-Type'];
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg = errorData.msg || 'Error en la solicitud';
                throw new Error(errorMsg);
            }

            // Manejar diferentes tipos de respuesta
            switch (responseType) {
                case 'blob':
                    return await response.blob();
                case 'text':
                    return await response.text();
                default:
                    return await response.json();
            }
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ==================== AUTHENTICATION ====================
    login = (credentials) => this._fetch('/login', 'POST', credentials);
    register = (credentials) => this._fetch('/register', 'POST', credentials);
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
    getTransactionsSummary = (startDate = null, endDate = null) => {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        return this._fetch(`/transactions/summary?${params.toString()}`, 'GET');
    }

    importTransactions = (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return this._fetch('/transactions/import', 'POST', formData, {}, 'json');
    };

    exportTransactions = () => this._fetch(
        '/transactions/export',
        'GET',
        null,
        { 'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        'blob'
    );

    // ==================== HISTORY ====================
    getMonthlyHistoryByDate = (year, month) => this._fetch(`/history/monthly?year=${year}&month=${month}`, 'GET');
    getYearlyHistoryByDate = (year) => this._fetch(`/history/yearly?year=${year}`, 'GET');
}

export default new ApiService();
