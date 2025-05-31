import { useState, useEffect } from 'react';
import apiService from "../services/apiService";

// Función para convertir código de moneda a símbolo
const getCurrencySymbol = (currencyCode) => {
    switch(currencyCode?.toUpperCase()) {
        case 'USD':
            return '$';
        case 'EUR':
            return '€';
        case 'GBP':
            return '£';
        case 'JPY':
            return '¥';
        default:
            return currencyCode || '$';
    }
};

export const useCurrency = () => {
    const [currency, setCurrencySymbol] = useState('$');
    const [currencyCode, setCurrencyCode] = useState('USD');
    const [loading, setLoading] = useState(true);
    
    const fetchCurrency = async () => {
        try {
            const response = await apiService.getSettings();            
            const code = response?.currency || 'USD';
            const symbol = getCurrencySymbol(code);
            
            setCurrencyCode(code);
            setCurrencySymbol(symbol);
            setLoading(false);
            
            return { code, symbol };
        } catch (error) {
            console.error("Error fetching currency:", error);
            setLoading(false);
            throw error;
        }
    };

    useEffect(() => {
        fetchCurrency();
    }, []);

    return { 
        currencyCode,  // Ejemplo: 'USD'
        currency, // Ejemplo: '$'
        loading
    };
};