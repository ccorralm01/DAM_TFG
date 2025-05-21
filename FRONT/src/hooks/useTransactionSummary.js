import { useState, useEffect } from "react";
import { format } from 'date-fns';
import apiService from "../services/apiService";

export const useTransactionSummary = (dateRange, refreshTrigger) => {
    const [summary, setSummary] = useState({
        income: 0,
        expenses: 0,
        balance: 0
    });

    const [transactionsByCategory, setTransactionsByCategory] = useState({
        income: {},
        expenses: {}
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                setLoading(true);
                setError(null);

                const formattedStart = dateRange ? format(dateRange[0], 'yyyy-MM-dd') : null;
                const formattedEnd = dateRange ? format(dateRange[1], 'yyyy-MM-dd') : null;

                const profileDataSummary = await apiService.getTransactionsSummary(
                    formattedStart,
                    formattedEnd
                );

                setTransactionsByCategory({
                    income: profileDataSummary.categories.income,
                    expenses: profileDataSummary.categories.expenses
                });

                setSummary({
                    income: profileDataSummary.summary.income,
                    expenses: profileDataSummary.summary.expenses,
                    balance: profileDataSummary.summary.balance
                });
            } catch (error) {
                console.error("Error fetching summary:", error);
                setError(error.message || "Error al cargar el resumen");
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [dateRange]);

    return {
        summary,
        transactionsByCategory,
        loading,
        error
    };
};