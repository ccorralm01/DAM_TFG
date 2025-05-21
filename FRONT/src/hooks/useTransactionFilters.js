import { useState, useEffect } from 'react';

export const useTransactionFilters = (transactions) => {
    const [filters, setFilters] = useState({
        kind: '',
        category: '',
        dateFrom: '',
        dateTo: '',
        search: ''
    });
    
    const [filteredTransactions, setFilteredTransactions] = useState([]);

    useEffect(() => {
        let result = [...transactions];

        if (filters.kind) {
            result = result.filter(t => t.kind === filters.kind);
        }

        if (filters.category) {
            result = result.filter(t => t.category && t.category.id.toString() === filters.category);
        }

        if (filters.dateFrom) {
            result = result.filter(t => new Date(t.date) >= new Date(filters.dateFrom));
        }
        if (filters.dateTo) {
            result = result.filter(t => new Date(t.date) <= new Date(filters.dateTo));
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            result = result.filter(t =>
                t.description.toLowerCase().includes(searchTerm) ||
                (t.category && t.category.name.toLowerCase().includes(searchTerm)) ||
                t.amount.toString().includes(searchTerm)
            );
        }

        setFilteredTransactions(result);
    }, [filters, transactions]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return { filters, filteredTransactions, handleFilterChange };
};