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
        case 'CNY':
            return '¥';
        case 'INR':
            return '₹';
        case 'RUB':
            return '₽';
        case 'BRL':
            return 'R$';
        case 'MXN':
            return '$';
        case 'CAD':
            return '$';
        case 'AUD':
            return '$';
        case 'KRW':
            return '₩';
        case 'TRY':
            return '₺';
        // Añade más monedas según necesites
        default:
            return currencyCode || '$'; // Si no está en la lista, devuelve el código o $ por defecto
    }
};

export const useCurrency = () => {
    const [currency, setCurrencySymbol] = useState('$');
    const [currencyCode, setCurrencyCode] = useState('USD');
    const [loading, setLoading] = useState(true);
    
    const fetchCurrency = async () => {
        try {
            const response = await apiService.getSettings();
            console.log("Currency response:", response);
            
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