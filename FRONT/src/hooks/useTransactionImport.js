import { useState } from 'react';
import { toast } from 'react-toastify';
import apiService from "../services/apiService";
import CustomToast from '../components/Ui-components/CustomToast.jsx';
import { showCustomToast } from '../components/Ui-components/showCustomToast.jsx';

export const useTransactionImport = (fetchTransactions) => {
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleImport = async () => {
        if (!selectedFile) {
            showCustomToast({
                title: "Advertencia",
                message: "Por favor selecciona un archivo",
                type: "warning"
            });
            return;
        }

        setIsImporting(true);
        try {
            const result = await apiService.importTransactions(selectedFile);

            if (result.error_count > 0) {
                showCustomToast({
                    title: "Importación parcial",
                    message: `${result.success_count} transacciones importadas, ${result.error_count} errores`,
                    type: "warning"
                });
            } else {
                showCustomToast({
                    title: "Éxito!",
                    message: `${result.success_count} transacciones importadas correctamente`,
                    type: "success"
                });
                fetchTransactions();
            }

            setShowImportModal(false);
            setSelectedFile(null);
        } catch (error) {
            showCustomToast({
                title: "Error!",
                message: error.message || 'Error al importar datos',
                type: "error"
            });
        } finally {
            setIsImporting(false);
        }
    };

    return {
        showImportModal,
        setShowImportModal,
        selectedFile,
        isImporting,
        handleFileChange,
        handleImport
    };
};