// hooks/useOverviewData.js
import { useState, useEffect } from "react";
import apiService from "../services/apiService";

const useOverviewData = (refreshTrigger) => {
    const [timeRange, setTimeRange] = useState("annual");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [loading, setLoading] = useState(false);
    const [historyData, setHistoryData] = useState(null);

    // Generar opciones de años (últimos 5 años)
    const yearOptions = Array.from(
        { length: 5 },
        (_, i) => new Date().getFullYear() - i
    );

    // Opciones de meses
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

    // Resetear mes cuando cambia el rango de tiempo
    useEffect(() => {
        if (timeRange === "annual") {
            setSelectedMonth(new Date().getMonth() + 1);
        }
    }, [timeRange]);

    // Cargar datos cuando cambian los filtros
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let response;

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
    }, [timeRange, selectedYear, selectedMonth, refreshTrigger]);

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