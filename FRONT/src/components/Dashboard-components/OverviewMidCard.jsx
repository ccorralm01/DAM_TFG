import { motion } from "framer-motion";
import "./styles/OverviewMidCard.css";

const OverviewMidCard = ({
    title = "Ingresos por categoría",
    bodyCard = "",
    isEmpty = true // Nuevo prop para controlar estado
}) => {
    // Animaciones
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1]
            }
        },
        hover: {
            y: -3,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            transition: {
                duration: 0.3,
                type: "spring",
                stiffness: 400
            }
        }
    };

    const headerVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                delay: 0.2,
                duration: 0.5
            }
        }
    };

    const bodyVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delay: 0.4,
                duration: 0.7,
                staggerChildren: 0.1
            }
        }
    };

    const textVariants = {
        hidden: { opacity: 0, y: 5 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.article
            className="col-12 col-md-6"
            initial="hidden"
            animate="visible"
            whileHover="hover"
            variants={cardVariants}
        >
            <motion.div
                className="middle-card d-flex flex-column px-4 py-3 gap-3 h-100"
            >
                <motion.header
                    variants={headerVariants}
                    className="h5 fw-semibold"
                >
                    {title}
                </motion.header>

                <motion.div
                    className="middle-card-body p-4 d-flex flex-column h-100 w-100 justify-content-center align-items-center"
                    variants={bodyVariants}
                >
                    {isEmpty ? (
                        <>
                            <motion.span
                                className="msg-1 mb-2 fs-5"
                                variants={textVariants}
                            >
                                Sin datos para el periodo seleccionado
                            </motion.span>
                            <motion.span
                                className="msg-2 text-center"
                                variants={textVariants}
                            >
                                Prueba seleccionando un periodo diferente o añade ingresos
                            </motion.span>
                        </>
                    ) : (
                        <motion.div
                            variants={textVariants}
                        >
                            {bodyCard}
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </motion.article>
    );
};

export default OverviewMidCard;