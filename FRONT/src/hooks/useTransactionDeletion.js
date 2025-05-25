import { useState } from 'react';
import { toast } from 'react-toastify';
import apiService from "../services/apiService";
import CustomToast from '../components/Ui-components/CustomToast.jsx';
import { showCustomToast } from '../components/Ui-components/showCustomToast.jsx';

export const useTransactionDeletion = (fetchTransactions) => {
    const deleteTransaction = async (transactionId) => {
        try {
            const response = await apiService.deleteTransaction(transactionId);
            showCustomToast({
                title: "Éxito!",
                message: response.msg,
                type: "success"
            });
            fetchTransactions();
        } catch (error) {
            console.error('Error al eliminar la transacción:', error);
            showCustomToast({
                title: "Error!",
                message: error.message || 'Error al eliminar la transacción',
                type: "error"
            });
        }
    };

    const handleDeleteTransaction = async (transactionId) => {
        showCustomToast({
            title: "Confirmación",
            message: "¿Estás seguro de eliminar esta transacción?",
            type: "confirm",
            onConfirm: () => deleteTransaction(transactionId),
            confirmText: "Sí, eliminar",
            cancelText: "Cancelar",
            position: "top-center"
        });
    };

    return { handleDeleteTransaction };
};