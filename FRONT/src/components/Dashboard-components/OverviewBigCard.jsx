import { motion } from "framer-motion";
import "./styles/OverviewBigCard.css";
import IncomeExpenseChart from "./IncomeExpenseChart";
import useOverviewData from "../../hooks/useOverviewData";

const OverviewBigCard = ({ isEmpty = false, refreshTrigger }) => {
    const {
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
    } = useOverviewData(refreshTrigger);

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

            <motion.span className="history" variants={itemVariants}>
                Historial
            </motion.span>

            <motion.article className="col-12" variants={containerVariants}>
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
                            <motion.div className="time-range-switch" whileHover={{ scale: 1.05 }}>
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
                                whileHover={{ scale: 1.02 }}
                            >
                                {yearOptions.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </motion.select>

                            {/* Select de Mes (solo visible en modo mensual) */}
                            {timeRange === "monthly" && (
                                <motion.select
                                    className="form-select"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    whileHover={{ scale: 1.02 }}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {monthOptions.map(month => (
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
                                <motion.span className="msg-1 mb-2 fs-5" variants={itemVariants}>
                                    Sin datos para el periodo seleccionado
                                </motion.span>
                                <motion.span className="msg-2 text-center" variants={itemVariants}>
                                    Prueba seleccionando un periodo diferente
                                </motion.span>
                            </>
                        ) : (
                            <IncomeExpenseChart
                                data={historyData}
                                selectedMonth={selectedMonth}
                                selectedYear={selectedYear}
                            />
                        )}
                    </motion.div>
                </motion.div>
            </motion.article>
        </motion.div>
    );
};

export default OverviewBigCard;