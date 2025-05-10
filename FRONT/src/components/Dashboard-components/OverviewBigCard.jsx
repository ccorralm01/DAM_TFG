import { motion } from "framer-motion";
import "./styles/OverviewBigCard.css";
import { useState, useEffect } from "react";
import apiService from "../../services/apiService";
import IncomeExpenseChart from "./IncomeExpenseChart";

const OverviewBigCard = ({ title = "Ingresos por categoría", bodyCard = "", isEmpty = false, refreshTrigger }) => {
    const [timeRange, setTimeRange] = useState("annual"); // Estado para el rango de tiempo (mensual/anual)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Año seleccionado (inicialmente el año actual)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Mes seleccionado (inicialmente el mes actual)
    const [loading, setLoading] = useState(false); // Estado de carga
    const [historyData, setHistoryData] = useState(null); // Datos históricos

    // Generar opciones de años (últimos 5 años)
    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 5 }, (_, i) => currentYear - i);
    };

    // Efecto para resetar mes cuando cambia el rango de tiempo
    useEffect(() => {
        if (timeRange === "annual") {
            setSelectedMonth(new Date().getMonth() + 1);
        }
    }, [timeRange]);

    // Efecto para cargar datos cuando cambian los filtros
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let response;

                if (timeRange === "monthly") {
                    // Llamada para datos mensuales con parámetros
                    response = await apiService.getMonthlyHistoryByDate(selectedYear, selectedMonth);
                    console.log("Datos mensuales:", response);
                    setHistoryData(response);
                } else {
                    // Llamada para datos anuales con parámetro
                    response = await apiService.getYearlyHistoryByDate(selectedYear);
                    console.log("Datos anuales:", response);
                    setHistoryData(response);
                }
            } catch (error) {
                console.error("Error fetching history data:", error);
                setHistoryData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [timeRange, selectedYear, selectedMonth, refreshTrigger]);

    // Generar opciones de meses
    const months = [
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
        { value: 12, label: "Diciembre" }
    ];

    // Animaciones (se mantienen igual)
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1]
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                type: "spring",
                stiffness: 100
            }
        },
        hover: {
            y: -2,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            transition: {
                duration: 0.3
            }
        }
    };

    const selectVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: {
                delay: i * 0.1 + 0.4,
                duration: 0.5
            }
        }),
        hover: {
            scale: 1.02,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        }
    };

    return (
        <motion.div
            className="col-12"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {loading && (
                <motion.div
                    className="loading-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    Cargando datos...
                </motion.div>
            )}

            <motion.span
                className="history"
                variants={itemVariants}
            >
                Historial
            </motion.span>

            <motion.article
                className="col-12"
                variants={containerVariants}
            >
                <motion.div
                    className="big-card d-flex flex-column px-4 py-3 gap-4"
                    variants={cardVariants}
                    whileHover="hover"
                >
                    <motion.header
                        className="d-flex row flex-md-row flex-column justify-content-between align-items-start gap-3"
                        variants={containerVariants}
                    >
                        <motion.div className="d-flex col gap-3">
                            {/* Switch Mensual/Anual */}
                            <motion.div
                                className="time-range-switch"
                                whileHover={{ scale: 1.05 }}
                            >
                                <button
                                    className={`switch-option ${timeRange === "monthly" ? "active" : ""}`}
                                    onClick={() => setTimeRange("monthly")}
                                >
                                    Mes
                                </button>
                                <button
                                    className={`switch-option ${timeRange === "annual" ? "active" : ""}`}
                                    onClick={() => setTimeRange("annual")}
                                >
                                    Año
                                </button>
                            </motion.div>

                            {/* Select de Año */}
                            <motion.select
                                className="form-select"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                whileHover="hover"
                            >
                                {generateYearOptions().map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </motion.select>

                            {/* Select de Mes (solo visible en modo mensual) */}
                            {timeRange === "monthly" && (
                                <motion.select
                                    className="form-select"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    whileHover="hover"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {months.map(month => (
                                        <option key={month.value} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </motion.select>
                            )}
                        </motion.div>

                        <motion.div
                            className="leyend d-flex col gap-3 align-items-center justify-content-end w-100"
                            variants={containerVariants}
                        >
                            {["ingreso", "gasto"].map((item, i) => (
                                <motion.span
                                    key={item}
                                    className="d-flex align-items-center p-2"
                                    variants={itemVariants}
                                    custom={i}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <div className={`icon-${item === 'ingreso' ? 'green' : 'red'} mx-1`} />
                                    {item}
                                </motion.span>
                            ))}
                        </motion.div>
                    </motion.header>

                    <motion.div
                        className="big-card-body d-flex flex-column h-100 w-100 justify-content-center align-items-center py-4"
                        variants={containerVariants}
                    >
                        {loading ? (
                            <div>Cargando datos...</div>
                        ) : isEmpty || !historyData ? (
                            <>
                                <motion.span
                                    className="msg-1 mb-2 fs-5"
                                    variants={itemVariants}
                                >
                                    Sin datos para el periodo seleccionado
                                </motion.span>
                                <motion.span
                                    className="msg-2 text-center"
                                    variants={itemVariants}
                                >
                                    Prueba seleccionando un periodo diferente
                                </motion.span>
                            </>
                        ) : (
                            <IncomeExpenseChart
                                data={historyData}
                                selectedMonth={selectedMonth}  // Número de mes (1-12)
                                selectedYear={selectedYear}   // Año completo (ej. 2023)
                            />
                        )}
                    </motion.div>
                </motion.div>
            </motion.article>
        </motion.div>
    );
};

export default OverviewBigCard;