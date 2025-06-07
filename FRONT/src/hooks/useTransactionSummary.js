import { useState, useEffect } from "react";
import { format } from 'date-fns';  // Librería para formateo de fechas
import apiService from "../services/apiService";

// Hook para obtener resumen de transacciones por rango de fechas
export const useTransactionSummary = (dateRange, refreshTrigger) => {
    // Estado para almacenar el resumen (ingresos, gastos, balance)
    const [summary, setSummary] = useState({
        income: 0,    // Total de ingresos
        expenses: 0,  // Total de gastos
        balance: 0    // Balance (ingresos - gastos)
    });

    // Estado para transacciones agrupadas por categoría
    const [transactionsByCategory, setTransactionsByCategory] = useState({
        income: {},    // Ingresos por categoría
        expenses: {}   // Gastos por categoría
    });

    // Estados para manejar carga y errores
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                setLoading(true);
                setError(null);

                // Formatea fechas para la API (yyyy-MM-dd)
                const formattedStart = dateRange ? format(dateRange[0], 'yyyy-MM-dd') : null;
                const formattedEnd = dateRange ? format(dateRange[1], 'yyyy-MM-dd') : null;

                // Obtiene datos del resumen desde la API
                const profileDataSummary = await apiService.getTransactionsSummary(
                    formattedStart,
                    formattedEnd
                );

                // Actualiza estado de transacciones por categoría
                setTransactionsByCategory({
                    income: profileDataSummary.categories.income || {},
                    expenses: profileDataSummary.categories.expenses || {}
                });

                // Actualiza estado del resumen general
                setSummary({
                    income: profileDataSummary.summary.income || 0,
                    expenses: profileDataSummary.summary.expenses || 0,
                    balance: profileDataSummary.summary.balance || 0
                });
            } catch (error) {
                console.error("Error fetching summary:", error);
                setError(error.message || "Error al cargar el resumen");
            } finally {
                setLoading(false);  // Finaliza estado de carga
            }
        };

        fetchSummary();
    }, [dateRange, refreshTrigger]);  // Se ejecuta cuando cambian estas dependencias

    return {
        summary,                  // Resumen general {income, expenses, balance}
        transactionsByCategory,    // Transacciones agrupadas por categoría
        loading,                   // Estado de carga (true/false)
        error                      // Mensaje de error (si existe)
    };
};