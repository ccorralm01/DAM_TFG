import { useState, useMemo } from 'react';

// Hook para filtrar y ordenar transacciones
export const useTransactionFilters = (transactions = []) => {
    // Estado para los filtros y ordenación
    const [filters, setFilters] = useState({
        kind: '',             // Tipo de transacción (ingreso/gasto)
        category: '',         // ID de categoría
        dateFrom: '',         // Fecha inicial
        dateTo: '',           // Fecha final
        search: '',           // Término de búsqueda
        sortBy: 'date',       // Campo para ordenar (por defecto: fecha)
        sortOrder: 'desc'     // Orden (por defecto: descendente)
    });

    // Transacciones filtradas y ordenadas (memorizadas para mejor rendimiento)
    const filteredTransactions = useMemo(() => {
        let resultado = [...transactions]; // Copia de las transacciones originales

        // Aplicar filtro por tipo
        if (filters.kind) {
            resultado = resultado.filter(t => t.kind === filters.kind);
        }

        // Aplicar filtro por categoría
        if (filters.category) {
            resultado = resultado.filter(t => t.category && t.category.id.toString() === filters.category);
        }

        // Aplicar filtro por fecha inicial
        if (filters.dateFrom) {
            const fechaInicio = new Date(filters.dateFrom);
            fechaInicio.setHours(0, 0, 0, 0);
            resultado = resultado.filter(t => new Date(t.date) >= fechaInicio);
        }

        // Aplicar filtro por fecha final
        if (filters.dateTo) {
            const fechaFin = new Date(filters.dateTo);
            fechaFin.setHours(23, 59, 59, 999);
            resultado = resultado.filter(t => new Date(t.date) <= fechaFin);
        }

        // Aplicar búsqueda
        if (filters.search) {
            const terminoBusqueda = filters.search.toLowerCase();
            resultado = resultado.filter(t =>
                t.description.toLowerCase().includes(terminoBusqueda) ||
                (t.category && t.category.name.toLowerCase().includes(terminoBusqueda)) ||
                t.amount.toString().includes(terminoBusqueda)
            );
        }

        // Aplicar ordenación
        resultado.sort((a, b) => {
            let comparacion = 0;

            switch (filters.sortBy) {
                case 'date':
                    comparacion = new Date(a.date).getTime() - new Date(b.date).getTime();
                    break;

                case 'description':
                    comparacion = a.description.localeCompare(b.description);
                    break;

                case 'category':
                    comparacion = (a.category?.name || '').localeCompare(b.category?.name || '');
                    break;

                case 'kind':
                    comparacion = a.kind.localeCompare(b.kind);
                    break;

                case 'amount':
                    if (filters.sortOrder === 'asc') {
                        // Orden ascendente: negativos primero, luego positivos
                        if (a.amount < 0 && b.amount >= 0) return -1;
                        if (a.amount >= 0 && b.amount < 0) return 1;
                        return a.amount - b.amount;
                    } else {
                        // Orden descendente: positivos primero, luego negativos
                        if (a.amount > 0 && b.amount <= 0) return -1;
                        if (a.amount <= 0 && b.amount > 0) return 1;
                        return b.amount - a.amount;
                    }

                default:
                    comparacion = 0;
            }

            return filters.sortOrder === 'asc' ? comparacion : -comparacion;
        });

        return resultado;
    }, [transactions, filters]);

    // Manejar cambios en los filtros
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Manejar ordenación por columna
    const handleSort = (columna) => {
        setFilters(prev => {
            // Si ya está ordenado por esta columna, invertir el orden
            if (prev.sortBy === columna) {
                return {
                    ...prev,
                    sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                };
            }
            // Si es una nueva columna, orden ascendente por defecto
            return {
                ...prev,
                sortBy: columna,
                sortOrder: 'asc'
            };
        });
    };

    // Reiniciar todos los filtros
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
        filters,                   // Estado actual de los filtros
        filteredTransactions,      // Transacciones filtradas/ordenadas
        handleFilterChange,        // Función para cambiar filtros
        handleSort,                // Función para ordenar
        resetFilters               // Función para reiniciar filtros
    };
};