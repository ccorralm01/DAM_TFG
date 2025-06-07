import apiService from "../services/apiService";
import { showCustomToast } from '../components/Ui-components/showCustomToast.jsx';

// Hook para manejar la eliminación de transacciones
export const useTransactionDeletion = (fetchTransactions) => {
    // Función para eliminar una transacción
    const deleteTransaction = async (transactionId) => {
        try {
            // Llama al servicio API para eliminar la transacción
            const response = await apiService.deleteTransaction(transactionId);
            
            // Muestra notificación de éxito
            showCustomToast({
                title: "Éxito!",
                message: response.msg,
                type: "success"
            });
            
            // Actualiza la lista de transacciones
            fetchTransactions();
        } catch (error) {
            console.error('Error al eliminar la transacción:', error);
            
            // Muestra notificación de error
            showCustomToast({
                title: "Error!",
                message: error.message || 'Error al eliminar la transacción',
                type: "error"
            });
        }
    };

    // Función que maneja la confirmación antes de eliminar
    const handleDeleteTransaction = async (transactionId) => {
        showCustomToast({
            title: "Confirmación",
            message: "¿Estás seguro de eliminar esta transacción?",
            type: "confirm",  // Tipo de toast de confirmación
            onConfirm: () => deleteTransaction(transactionId),  // Acción al confirmar
            confirmText: "Sí, eliminar",  // Texto del botón de confirmación
            cancelText: "Cancelar",  // Texto del botón de cancelación
            position: "top-center"  // Posición del toast
        });
    };

    // Retorna la función para manejar la eliminación
    return { handleDeleteTransaction };
};