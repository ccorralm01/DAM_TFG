import { useState } from 'react';
import apiService from "../services/apiService";
import '../components/Ui-components/showCustomToast.jsx';
import { showCustomToast } from '../components/Ui-components/showCustomToast.jsx';

// Hook para manejar la exportación de transacciones
export const useTransactionExport = () => {
    // Estado para controlar si se está exportando
    const [isExporting, setIsExporting] = useState(false);

    // Función para manejar la exportación de transacciones
    const handleExport = async () => {
        setIsExporting(true); // Activa el estado de carga/exportación
        try {
            // Obtiene el archivo blob desde la API
            const blob = await apiService.exportTransactions();
            
            // Crea una URL temporal para el blob
            const url = window.URL.createObjectURL(blob);
            
            // Crea un elemento <a> temporal para la descarga
            const a = document.createElement('a');
            a.href = url;
            
            // Establece el nombre del archivo con la fecha actual
            a.download = `transacciones_${new Date().toISOString().split('T')[0]}.xlsx`;
            
            // Descarga el archivo
            document.body.appendChild(a);
            a.click();
            
            // Limpieza
            window.URL.revokeObjectURL(url);
            a.remove();
            
            // Muestra notificación de éxito
            showCustomToast({
                title: "Éxito!",
                message: "Datos exportados correctamente",
                type: "success"
            });
        } catch (error) {
            // Muestra notificación de error
            showCustomToast({
                title: "Error!",
                message: error.message || 'Error al exportar datos',
                type: "error"
            });
        } finally {
            // Desactiva el estado de carga/exportación
            setIsExporting(false);
        }
    };

    // Retorna el estado y la función de exportación
    return { isExporting, handleExport };
};