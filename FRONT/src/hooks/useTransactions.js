import { useState, useEffect } from 'react';
import apiService from "../services/apiService";

export const useTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const fetchTransactions = async () => {
        try {
            const transactionData = await apiService.getTransactions();
            setTransactions(transactionData);
            setLoading(false);
            return transactionData;
        } catch (error) {
            console.error("Error fetching transactions:", error);
            setLoading(false);
            throw error;
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const categories = transactions
        .filter(t => t.category)
        .reduce((acc, transaction) => {
            const exists = acc.some(cat =>
                cat.id === transaction.category.id
            );
            if (!exists) {
                acc.push({
                    id: transaction.category.id,
                    name: transaction.category.name,
                    color: transaction.category.color
                });
            }
            return acc;
        }, [])
        .sort((a, b) => a.name.localeCompare(b.name));

    return { transactions, loading, categories, fetchTransactions };
};