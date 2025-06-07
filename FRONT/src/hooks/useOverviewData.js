// hooks/useOverviewData.js
import { useState, useEffect } from "react";
import apiService from "../services/apiService";

// Hook para manejar datos de resumen (overview) con filtros de tiempo
const useOverviewData = (refreshTrigger) => {
    // Estados para controlar los filtros y carga de datos
    const [timeRange, setTimeRange] = useState("annual");  // 'annual' o 'monthly'
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [loading, setLoading] = useState(false);
    const [historyData, setHistoryData] = useState(null);  // Datos históricos

    // Generar array de los últimos 5 años para selector
    const yearOptions = Array.from(
        { length: 5 },
        (_, i) => new Date().getFullYear() - i
    );

    // Array de meses con nombres en español
    const monthOptions = [
        { value: 1, label: "Enero" },
        { value: 2, label: "Febrero" },
        { value: 3, label: "Marzo" },
        { value: 4, label: "Abril" },
        { value: 5, label: "Mayo" },
        { value: 6, label: "Junio" },
        { value: 7, label: "Julio" },
        { value: 8, label: "Agosto" },
        { value: 9, label: "Septiembre" },
        { value: 10, label: "Octubre" },
        { value: 11, label: "Noviembre" },
        { value: 12, label: "Diciembre" },
    ];

    // Efecto para resetear mes cuando se cambia a vista anual
    useEffect(() => {
        if (timeRange === "annual") {
            setSelectedMonth(new Date().getMonth() + 1);
        }
    }, [timeRange]);

    // Efecto principal para cargar datos cuando cambian los filtros
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let response;

                // Decide qué endpoint llamar según el rango de tiempo
                if (timeRange === "monthly") {
                    response = await apiService.getMonthlyHistoryByDate(selectedYear, selectedMonth);
                } else {
                    response = await apiService.getYearlyHistoryByDate(selectedYear);
                }

                setHistoryData(response);
            } catch (error) {
                console.error("Error fetching history data:", error);
                setHistoryData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [timeRange, selectedYear, selectedMonth, refreshTrigger]);  // Dependencias que trigger re-fetch

    // Retorna todos los estados y setters para ser usados por el componente
    return {
        timeRange,
        setTimeRange,
        selectedYear,
        setSelectedYear,
        selectedMonth,
        setSelectedMonth,
        loading,
        historyData,
        yearOptions,
        monthOptions,
    };
};

export default useOverviewData;



