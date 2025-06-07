import { useState, useEffect } from 'react';
import apiService from "../services/apiService";

// Función para convertir código de moneda a símbolo
const getCurrencySymbol = (currencyCode) => {
    switch(currencyCode?.toUpperCase()) {
        case 'USD':  // Dólar estadounidense
            return '$';
        case 'EUR':  // Euro
            return '€';
        case 'GBP':  // Libra esterlina
            return '£';
        case 'JPY':  // Yen japonés
            return '¥';
        default:     // Código no reconocido o undefined
            return currencyCode || '$';  // Devuelve el código o $ por defecto
    }
};

// Hook personalizado para manejar la moneda
export const useCurrency = () => {
    const [currency, setCurrencySymbol] = useState('$');  // Símbolo de moneda (estado)
    const [currencyCode, setCurrencyCode] = useState('USD');  // Código de moneda (estado)
    const [loading, setLoading] = useState(true);  // Estado de carga
    
    // Función para obtener la moneda desde la API
    const fetchCurrency = async () => {
        try {
            const response = await apiService.getSettings();            
            const code = response?.currency || 'USD';  // Obtiene código o usa USD por defecto
            const symbol = getCurrencySymbol(code);  // Obtiene símbolo
            
            // Actualiza estados
            setCurrencyCode(code);
            setCurrencySymbol(symbol);
            setLoading(false);
            
            return { code, symbol };  // Devuelve código y símbolo
        } catch (error) {
            console.error("Error fetching currency:", error);
            setLoading(false);
            throw error;  // Relanza el error
        }
    };

    // Efecto para cargar la moneda al montar el componente
    useEffect(() => {
        fetchCurrency();
    }, []);  // Array de dependencias vacío = solo al montar

    return { 
        currencyCode,  // Código de moneda (ej: 'USD')
        currency,      // Símbolo de moneda (ej: '$')
        loading        // Estado de carga (true/false)
    };
};