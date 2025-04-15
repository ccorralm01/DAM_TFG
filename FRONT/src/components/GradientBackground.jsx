import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from 'react-router-dom';

const routeColors = {
    '/': '#29f',
    '/signup': '#63e',
    '/dashboard': '#10b981',
    '/transactions': '#f43f5e',
    '/manage': '#cef43f'
};

const GradientBackground = ({ children }) => {
    const location = useLocation();
    const [colors, setColors] = useState({
        prev: '#29f',
        current: '#29f'
    });

    useEffect(() => {
        setColors(prev => ({
            prev: prev.current,
            current: routeColors[location.pathname] || '#29f'
        }));
    }, [location.pathname]);

    return (
        <>
            <motion.div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: -10,
                    backgroundImage: `radial-gradient(125% 125% at 50% 10%, #000 40%, ${colors.prev} 100%)`,
                }}
                animate={{
                    backgroundImage: `radial-gradient(125% 125% at 50% 10%, #000 40%, ${colors.current} 100%)`,
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <div style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </div>
        </>
    );
};

export default GradientBackground;