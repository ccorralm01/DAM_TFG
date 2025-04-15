import React from 'react';

const MiniCardIcon = ({
    iconName = "trending-up", // trending-up, trending-down, wallet
    size = 60,
    iconColor = "", // Color personalizado (anula las clases de color)
    bgColor = "",   // Fondo personalizado (anula las clases de fondo)
    className = ""  // Clases adicionales
}) => {
    // Mapeo de iconos con sus paths
    const icons = {
        "trending-up": (
            <>
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
            </>
        ),
        "trending-down": (
            <>
                <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
                <polyline points="16 17 22 17 22 11" />
            </>
        ),
        "wallet": (
            <>
                <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
            </>
        )
    };

    // Clases por defecto según el icono
    const defaultClasses = {
        "trending-up": "text-emerald-500 bg-emerald-400/10",
        "trending-down": "text-red-500 bg-red-400/10",
        "wallet": "text-violet-500 bg-violet-400/10"
    };

    // Determinar las clases a aplicar
    const baseClasses = `lucide lucide-${iconName} h-12 w-12 items-center rounded-lg p-2 ${defaultClasses[iconName] || ''}`;
    const finalClasses = `${baseClasses} ${className}`;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={finalClasses}
            style={{
                ...(iconColor && { color: iconColor }),
                ...(bgColor && { backgroundColor: bgColor })
            }}
        >
            {icons[iconName] || icons["trending-up"]}
        </svg>
    );
};

export default MiniCardIcon;