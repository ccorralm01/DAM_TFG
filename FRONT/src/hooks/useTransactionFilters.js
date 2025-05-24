import { useState, useMemo } from 'react';

export const useTransactionFilters = (transactions = []) => {
    const [filters, setFilters] = useState({
        kind: '',
        category: '',
        dateFrom: '',
        dateTo: '',
        search: '',
        sortBy: 'date',       // Campo por defecto para ordenar
        sortOrder: 'desc'     // Orden por defecto (descendente)
    });

    const filteredTransactions = useMemo(() => {
        let result = [...transactions];

        // Aplicar filtros
        if (filters.kind) {
            result = result.filter(t => t.kind === filters.kind);
        }

        if (filters.category) {
            result = result.filter(t => t.category && t.category.id.toString() === filters.category);
        }

        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            fromDate.setHours(0, 0, 0, 0);
            result = result.filter(t => new Date(t.date) >= fromDate);
        }

        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            toDate.setHours(23, 59, 59, 999);
            result = result.filter(t => new Date(t.date) <= toDate);
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            result = result.filter(t =>
                t.description.toLowerCase().includes(searchTerm) ||
                (t.category && t.category.name.toLowerCase().includes(searchTerm)) ||
                t.amount.toString().includes(searchTerm)
            );
        }

        // Aplicar ordenación
        result.sort((a, b) => {
            let comparison = 0;

            switch (filters.sortBy) {
                case 'date':
                    comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
                    break;

                case 'description':
                    comparison = a.description.localeCompare(b.description);
                    break;

                case 'category':
                    comparison = (a.category?.name || '').localeCompare(b.category?.name || '');
                    break;

                case 'kind':
                    comparison = a.kind.localeCompare(b.kind);
                    break;

                case 'amount':
                    if (filters.sortOrder === 'asc') {
                        // Orden ascendente: negativos primero, luego positivos
                        if (a.amount < 0 && b.amount >= 0) return -1;
                        if (a.amount >= 0 && b.amount < 0) return 1;
                        return a.amount - b.amount;
                    } else {
                        if (a.amount > 0 && b.amount <= 0) return -1;
                        if (a.amount <= 0 && b.amount > 0) return 1;
                        return b.amount - a.amount;
                    }

                default:
                    comparison = 0;
            }

            return filters.sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [transactions, filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSort = (column) => {
        setFilters(prev => {
            // Si ya estamos ordenando por esta columna, invertimos el orden
            if (prev.sortBy === column) {
                return {
                    ...prev,
                    sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                };
            }
            // Si es una nueva columna, ordenamos ascendentemente por defecto
            return {
                ...prev,
                sortBy: column,
                sortOrder: 'asc'
            };
        });
    };

    const resetFilters = () => {
        setFilters({
            kind: '',
            category: '',
            dateFrom: '',
            dateTo: '',
            search: '',
            sortBy: 'date',
            sortOrder: 'desc'
        });
    };

    return {
        filters,
        filteredTransactions,
        handleFilterChange,
        handleSort,
        resetFilters
    };
};