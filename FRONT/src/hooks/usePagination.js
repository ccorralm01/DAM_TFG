import { useState } from 'react';

// Hook para manejar paginación de transacciones
export const usePagination = (filteredTransactions, initialItemsPerPage) => {
    // Estado para almacenar la configuración de paginación
    const [pagination, setPagination] = useState({
        currentPage: 1,                     // Página actual (comienza en 1)
        itemsPerPage: initialItemsPerPage   // Items por página (valor inicial recibido)
    });

    // Calcula el total de páginas necesarias
    const totalPages = Math.ceil(filteredTransactions.length / pagination.itemsPerPage);
    
    // Calcula índices para el slice de transacciones
    const indexOfLastItem = pagination.currentPage * pagination.itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - pagination.itemsPerPage;
    
    // Obtiene las transacciones para la página actual
    const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

    // Función para cambiar de página
    const paginate = (pageNumber) => {
        setPagination(prev => ({ 
            ...prev, 
            currentPage: pageNumber 
        }));
    };

    // Genera el grupo de páginas a mostrar en el paginador
    const getPaginationGroup = () => {
        const start = Math.max(1, pagination.currentPage - 1);  // Página inicial del grupo
        const end = Math.min(totalPages, pagination.currentPage + 1);  // Página final del grupo

        let pages = [];
        
        // Lógica para mostrar primera página y puntos suspensivos si es necesario
        if (start > 1) pages.push(1);
        if (start > 2) pages.push('...');

        // Agrega páginas del rango actual
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        // Lógica para mostrar puntos suspensivos y última página si es necesario
        if (end < totalPages - 1) pages.push('...');
        if (end < totalPages) pages.push(totalPages);

        return pages;
    };

    // Retorna todos los valores y funciones necesarias
    return {
        pagination,            // Estado de paginación {currentPage, itemsPerPage}
        totalPages,           // Número total de páginas
        currentTransactions,   // Transacciones de la página actual
        indexOfFirstItem,      // Índice del primer item de la página
        indexOfLastItem,       // Índice del último item de la página
        paginate,              // Función para cambiar de página
        getPaginationGroup     // Función para obtener el grupo de páginas a mostrar
    };
};