import { useState } from 'react';
import { motion } from 'framer-motion';
import "./styles/Transactions.css";
import { toast } from 'react-toastify';
import apiService from '../../services/apiService';

// Components
import TransactionModal from '../Dashboard-components/TransactionModal';
import TransactionsTable from '../Transactions-components/TransactionsTable';
import TransactionsFilters from '../Transactions-components/TransactionsFilters';
import LoadingSpinner from '../Ui-components/LoadingSpinner';
import Pagination from '../Transactions-components/Pagination';
import CustomToast from '../Ui-components/CustomToast';

// Hooks
import { useTransactions } from '../../hooks/useTransactions';
import { useTransactionFilters } from '../../hooks/useTransactionFilters';
import { usePagination } from '../../hooks/usePagination';

const Transactions = () => {
    // Paginación
    const itemsPerPage = Math.round(window.innerHeight * 7 / 1030);

    // Hooks
    const { transactions, loading, categories, fetchTransactions } = useTransactions();
    const { filters, filteredTransactions, handleFilterChange, handleSort } = useTransactionFilters(transactions);
    const { pagination, totalPages, currentTransactions, indexOfFirstItem, indexOfLastItem, paginate, getPaginationGroup } = usePagination(filteredTransactions, itemsPerPage);

    // Estados para el modal de edición
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [modalType, setModalType] = useState('expense');

    // Animation variants
    const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5 } } };
    const buttonHover = { scale: 1.05, transition: { duration: 0.2 } };
    const buttonTap = { scale: 0.95 };

    const deleteTransaction = async (transactionId) => {
        try {
            const response = await apiService.deleteTransaction(transactionId);
            toast(<CustomToast title="Éxito!" message={response.msg} type='success' onClose={() => toast.dismiss()} />);
            fetchTransactions(); // Refrescar la lista de transacciones
        } catch (error) {
            console.error('Error al eliminar la transacción:', error);
            toast(<CustomToast title="Error!" message={err.message || 'Error en la autenticación'} type='error' onClose={() => toast.dismiss()} />);
        }
    };

    // Función para manejar la eliminación
    const handleDeleteTransaction = async (transactionId) => {
        toast(
            <CustomToast
                title="Confirmar eliminación"
                message="¿Estás seguro de eliminar esta transacción?"
                type="confirm"
                onConfirm={() => deleteTransaction(transactionId)}
                onClose={() => toast.dismiss()}
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
            />,
            {
                position: "top-center",
            }
        );
    };


    const [isExporting, setIsExporting] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);

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

            toast(
                <CustomToast
                    title="Éxito!"
                    message="Datos exportados correctamente"
                    type="success"
                />
            );
        } catch (error) {
            toast(
                <CustomToast
                    title="Error!"
                    message={error.message || 'Error al exportar datos'}
                    type="error"
                />
            );
        } finally {
            setIsExporting(false);
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleImport = async () => {
        if (!selectedFile) {
            toast(
                <CustomToast
                    title="Advertencia"
                    message="Por favor selecciona un archivo"
                    type="warning"
                />
            );
            return;
        }

        setIsImporting(true);
        try {
            const result = await apiService.importTransactions(selectedFile);

            if (result.error_count > 0) {
                toast(
                    <CustomToast
                        title="Importación parcial"
                        message={`${result.success_count} transacciones importadas, ${result.error_count} errores`}
                        type="warning"
                    />
                );
            } else {
                toast(
                    <CustomToast
                        title="Éxito!"
                        message={`${result.success_count} transacciones importadas correctamente`}
                        type="success"
                    />
                );
                fetchTransactions()
            }

            setShowImportModal(false);
            setSelectedFile(null);
        } catch (error) {
            toast(
                <CustomToast
                    title="Error!"
                    message={error.message || 'Error al importar datos'}
                    type="error"
                />
            );
        } finally {
            setIsImporting(false);
        }
    };

    if (loading) {
        return (
            <LoadingSpinner />
        );
    }

    return (
        <motion.div
            className="transactions-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.header variants={fadeIn}>
                <div className="welcome">
                    <div className="welcome-container container d-flex flex-md-row flex-column justify-content-between align-items-center py-3">
                        <motion.span
                            className="welcome-text"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            Transacciones
                        </motion.span>
                        <div className='d-flex flex-md-row flex-column gap-2 gap-md-4 mt-2 mt-md-0'>
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <motion.button
                                    className='btn btn-import'
                                    whileHover={buttonHover}
                                    whileTap={buttonTap}
                                    onClick={() => setShowImportModal(true)}
                                >
                                    IMPORTAR DATOS
                                </motion.button>
                            </motion.div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <motion.button
                                    className='btn btn-export'
                                    whileHover={buttonHover}
                                    whileTap={buttonTap}
                                    onClick={handleExport}
                                    disabled={isExporting}
                                >
                                    {isExporting ? "Exportando..." : "EXPORTAR DATOS"}
                                </motion.button>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.header>

            <TransactionsFilters
                filters={filters}
                categories={categories}
                onFilterChange={handleFilterChange}
                buttonHover={buttonHover}
                buttonTap={buttonTap}
            />

            <motion.div
                className="transactions-table-container"
                variants={fadeIn}
            >
                <table className="transactions-table overflow-hidden">
                    <thead>
                        <tr>
                            {[
                                { key: 'date', label: 'Fecha' },
                                { key: 'description', label: 'Descripción' },
                                { key: 'category', label: 'Categoría' },
                                { key: 'kind', label: 'Tipo' },
                                { key: 'amount', label: 'Cantidad' },
                                { key: 'actions', label: 'Acciones' }
                            ].map((header, i) => (
                                <motion.th
                                    key={header.key}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => header.key !== 'actions' && handleSort(header.key)}
                                    className={header.key !== 'actions' ? 'sortable-header' : ''}
                                    whileHover={header.key !== 'actions' ? { backgroundColor: 'rgba(0,0,0,0.05)' } : {}}
                                >
                                    <div className="header-content">
                                        {header.label}
                                        {filters.sortBy === header.key && (
                                            <span className="sort-icon">
                                                {filters.sortOrder === 'asc' ? ' ↑' : ' ↓'}
                                            </span>
                                        )}
                                    </div>
                                </motion.th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <TransactionsTable
                            transactions={currentTransactions}
                            categories={categories}
                            onEditTransaction={(transaction) => {
                                setEditingTransaction(transaction);
                                setModalType(transaction.kind);
                                setShowEditModal(true);
                            }}
                            onDeleteTransaction={handleDeleteTransaction}
                            buttonHover={buttonHover}
                            buttonTap={buttonTap}
                        />
                    </tbody>
                </table>
            </motion.div>

            {/* Componente de Paginación */}
            {filteredTransactions.length > itemsPerPage && (
                <Pagination
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredTransactions.length}
                    paginate={paginate}
                    currentPage={pagination.currentPage}
                    totalPages={totalPages}
                    getPaginationGroup={getPaginationGroup}
                />
            )}

            {/* Resumen de transacciones mostradas */}
            <motion.div
                className="summary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTransactions.length)} de {filteredTransactions.length} transacciones
            </motion.div>

            <TransactionModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                type={modalType}
                onTransactionCreated={fetchTransactions}
                transactionToEdit={editingTransaction}
            />
            {/* Modal de Importación */}
            {showImportModal && (
                <motion.div
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => !isImporting && setShowImportModal(false)}
                >
                    <motion.div
                        className="modal-content"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>Importar Transacciones</h3>
                        <p>Selecciona un archivo Excel para importar:</p>

                        <div className="file-input-container">
                            <input
                                type="file"
                                id="file-upload"
                                accept=".xlsx,.xls"
                                onChange={handleFileChange}
                                disabled={isImporting}
                            />
                            <label htmlFor="file-upload" className="file-upload-label">
                                {selectedFile ? selectedFile.name : "Seleccionar archivo"}
                            </label>
                        </div>

                        <div className="modal-actions">
                            <motion.button
                                className="btn btn-secondary"
                                whileHover={buttonHover}
                                whileTap={buttonTap}
                                onClick={() => setShowImportModal(false)}
                                disabled={isImporting}
                            >
                                Cancelar
                            </motion.button>
                            <motion.button
                                className="btn btn-primary"
                                whileHover={buttonHover}
                                whileTap={buttonTap}
                                onClick={handleImport}
                                disabled={isImporting || !selectedFile}
                            >
                                {isImporting ? "Importando..." : "Importar"}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default Transactions;