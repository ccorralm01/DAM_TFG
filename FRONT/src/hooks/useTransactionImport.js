import { useState } from 'react';
import apiService from "../services/apiService";
import { showCustomToast } from '../components/Ui-components/showCustomToast.jsx';

// Hook para manejar la importación de transacciones
export const useTransactionImport = (fetchTransactions) => {
    // Estados del hook
    const [showImportModal, setShowImportModal] = useState(false);  // Controla visibilidad del modal
    const [selectedFile, setSelectedFile] = useState(null);         // Archivo seleccionado
    const [isImporting, setIsImporting] = useState(false);         // Estado de carga durante importación

    // Maneja la selección de archivo
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);  // Guarda el primer archivo seleccionado
    };

    // Maneja el proceso de importación
    const handleImport = async () => {
        // Validación de archivo seleccionado
        if (!selectedFile) {
            showCustomToast({
                title: "Advertencia",
                message: "Por favor selecciona un archivo",
                type: "warning"
            });
            return;
        }

        setIsImporting(true);  // Activa estado de carga

        try {
            // Llama al servicio de API para importar
            const result = await apiService.importTransactions(selectedFile);

            // Maneja resultados de la importación
            if (result.error_count > 0) {
                // Caso con errores (importación parcial)
                showCustomToast({
                    title: "Importación parcial",
                    message: `${result.success_count} transacciones importadas, ${result.error_count} errores`,
                    type: "warning"
                });
            } else {
                // Caso exitoso
                showCustomToast({
                    title: "Éxito!",
                    message: `${result.success_count} transacciones importadas correctamente`,
                    type: "success"
                });
                fetchTransactions();  // Actualiza la lista de transacciones
            }

            // Cierra modal y limpia selección
            setShowImportModal(false);
            setSelectedFile(null);
        } catch (error) {
            // Manejo de errores
            showCustomToast({
                title: "Error!",
                message: error.message || 'Error al importar datos',
                type: "error"
            });
        } finally {
            setIsImporting(false);  // Desactiva estado de carga
        }
    };

    // Retorna los estados y funciones necesarias
    return {
        showImportModal,    // Estado: mostrar modal de importación
        setShowImportModal, // Función: controlar visibilidad del modal
        selectedFile,       // Estado: archivo seleccionado
        isImporting,        // Estado: en proceso de importación
        handleFileChange,   // Función: manejar selección de archivo
        handleImport       // Función: ejecutar importación
    };
};