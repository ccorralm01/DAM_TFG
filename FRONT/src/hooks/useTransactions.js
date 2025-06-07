import { useState, useEffect } from 'react';
import apiService from "../services/apiService";

// Hook para manejar las transacciones y sus categorías
export const useTransactions = () => {
    // Estados para almacenar transacciones y estado de carga
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Función para obtener las transacciones desde la API
    const fetchTransactions = async () => {
        try {
            const transactionData = await apiService.getTransactions();
            setTransactions(transactionData);  // Almacena las transacciones
            setLoading(false);  // Finaliza el estado de carga
            return transactionData;  // Devuelve los datos para posibles usos
        } catch (error) {
            console.error("Error fetching transactions:", error);
            setLoading(false);  // Asegura que se quite el estado de carga incluso si hay error
            throw error;  // Relanza el error para manejo externo
        }
    };

    // Efecto para cargar las transacciones al montar el componente
    useEffect(() => {
        fetchTransactions();
    }, []);  // El array vacío asegura que solo se ejecute una vez

    // Extrae y procesa las categorías únicas de las transacciones
    const categories = transactions
        .filter(t => t.category)  // Filtra transacciones con categoría definida
        .reduce((acc, transaction) => {
            // Verifica si la categoría ya fue agregada
            const exists = acc.some(cat =>
                cat.id === transaction.category.id
            );
            if (!exists) {
                // Agrega la categoría si no existe
                acc.push({
                    id: transaction.category.id,
                    name: transaction.category.name,
                    color: transaction.category.color
                });
            }
            return acc;
        }, [])  // Acumulador inicial vacío
        .sort((a, b) => a.name.localeCompare(b.name));  // Ordena categorías alfabéticamente

    // Retorna los estados y funciones necesarias
    return { 
        transactions,    // Lista completa de transacciones
        loading,        // Estado de carga (true/false)
        categories,     // Lista de categorías únicas ordenadas
        fetchTransactions  // Función para recargar transacciones
    };
};