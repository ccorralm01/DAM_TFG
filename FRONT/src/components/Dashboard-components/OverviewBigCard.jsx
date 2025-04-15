import { motion } from "framer-motion";
import "./styles/OverviewBigCard.css";

const OverviewBigCard = ({
    title = "Ingresos por categoría",
    bodyCard = "",
    isEmpty = true
}) => {
    // Animaciones
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
                        <motion.div
                            className="d-flex col gap-3"
                            variants={containerVariants}
                        >
                            {[0, 1, 2].map((i) => (
                                <motion.select
                                    key={i}
                                    className="form-select"
                                    custom={i}
                                    variants={selectVariants}
                                    whileHover="hover"
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <option selected>
                                        {i === 0 ? "2025" : i === 1 ? "2025" : "abril"}
                                    </option>
                                </motion.select>
                            ))}
                        </motion.div>

                        <motion.div
                            className="leyend d-flex col gap-3 align-items-center justify-content-end w-100"
                            variants={containerVariants}
                        >
                            {["income", "outcome"].map((item, i) => (
                                <motion.span
                                    key={item}
                                    className="d-flex align-items-center p-2"
                                    variants={itemVariants}
                                    custom={i}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <div className={`icon-${item === 'income' ? 'green' : 'red'} mx-1`} />
                                    {item}
                                </motion.span>
                            ))}
                        </motion.div>
                    </motion.header>

                    <motion.div
                        className="big-card-body d-flex flex-column h-100 w-100 justify-content-center align-items-center p-4"
                        variants={containerVariants}
                    >
                        {isEmpty ? (
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
                                    Prueba seleccionando un periodo diferente o añade ingresos
                                </motion.span>
                            </>
                        ) : (
                            <motion.div variants={itemVariants}>
                                {bodyCard}
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            </motion.article>
        </motion.div>
    );
};

export default OverviewBigCard;