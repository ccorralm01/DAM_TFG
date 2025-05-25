import { useState } from 'react';
import { toast } from 'react-toastify';
import apiService from "../services/apiService";
import '../components/Ui-components/showCustomToast.jsx';
import { showCustomToast } from '../components/Ui-components/showCustomToast.jsx';

export const useTransactionExport = () => {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const blob = await apiService.exportTransactions();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transacciones_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            showCustomToast({
                title: "Éxito!",
                message: "Datos exportados correctamente",
                type: "success"
            }
            );
        } catch (error) {
            showCustomToast({
                title: "Error!",
                message: error.message || 'Error al exportar datos',
                type: "error"
            });
        } finally {
            setIsExporting(false);
        }
    };

    return { isExporting, handleExport };
};