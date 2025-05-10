import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import "./styles/OverviewMiniCard.css";
import MiniCardIcon from "./MiniCardIcon";
import { useEffect, useState } from "react";

const OverviewMiniCard = ({
    bgColor = "#34d39911",
    iconColor = "#10b981",
    iconName = "trending-up",
    title = "Ingresos",
    amount = 0.00,
    currency = "€"
}) => {
    // Animaciones
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        },
        hover: {
            scale: 1.03,
            transition: {
                duration: 0.3,
                type: "spring",
                stiffness: 300
            }
        }
    };

    const textVariants = {
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

    // State for the animated value
    const [displayAmount, setDisplayAmount] = useState(0);

    useEffect(() => {
        const animation = animate(0, amount, {
            duration: 1.5,
            ease: "easeOut",
            onUpdate: (latest) => {
                setDisplayAmount(latest);
            }
        });

        return animation.stop;
    }, [amount]);

    return (
        <motion.article
            className="col-12 col-md-4"
            initial="hidden"
            animate="visible"
            whileHover="hover"
            variants={cardVariants}
        >
            <motion.div
                className="mini-card d-flex justify-content-start align-items-center gap-3 p-3"
                variants={{}}
            >
                <motion.span
                    className="overview-icon icon-income"
                    variants={textVariants}
                >
                    <MiniCardIcon
                        bgColor={bgColor}
                        iconColor={iconColor}
                        iconName={iconName}
                        size={60}
                    />
                </motion.span>

                <motion.div className="d-flex flex-column">
                    <motion.span
                        className="mini-card-text"
                        variants={textVariants}
                    >
                        {title}
                    </motion.span>

                    <motion.span
                        className="mini-card-amount"
                    >
                        {displayAmount.toLocaleString('es-ES', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}{currency}
                    </motion.span>
                </motion.div>
            </motion.div>
        </motion.article>
    );
};

export default OverviewMiniCard;