import { useState } from 'react';
import { motion } from 'framer-motion';
import "./styles/Transactions.css";

// Components
import TransactionModal from '../Dashboard-components/TransactionModal'; // Modal para crear o editar transacciones
import TransactionsTable from '../Transactions-components/TransactionsTable'; // Tabla para mostrar las transacciones
import TransactionsFilters from '../Transactions-components/TransactionsFilters'; // Filtros para las transacciones

// Hooks
import { useTransactions } from '../../hooks/useTransactions'; // Hook para obtener las transacciones
import { useTransactionFilters } from '../../hooks/useTransactionFilters'; // Hook para manejar los filtros de las transacciones
import { usePagination } from '../../hooks/usePagination'; // Hook para manejar la paginación

const Transactions = () => {
    // Hooks
    const { transactions, loading, categories, fetchTransactions } = useTransactions(); // Hook para obtener las transacciones
    const { filters, filteredTransactions, handleFilterChange } = useTransactionFilters(transactions); // Hook para manejar los filtros
    const { currentTransactions } = usePagination(filteredTransactions, Math.round(window.innerHeight * 7 / 1030)); // Hook para manejar la paginación

    // Estados para el modal de edición
    const [editingTransaction, setEditingTransaction] = useState(null); // Transacción que se está editando
    const [showEditModal, setShowEditModal] = useState(false); // Estado para mostrar el modal
    const [modalType, setModalType] = useState('expense'); // Tipo de transacción (gasto o ingreso)

    // Animation variants
    const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5 } }}; // Variantes de animación para el fade in
    const buttonHover = { scale: 1.05, transition: { duration: 0.2 }}; // Variantes de animación para el hover del botón
    const buttonTap = { scale: 0.95, transition: { duration: 0.2 }}; // Variantes de animación para el tap del botón

    if (loading) {
        return (
            <motion.div
                className="loading-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                Loading transactions...
            </motion.div>
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
                    <div className="welcome-container container d-flex flex-md-row flex-column justify-content-lg-between justify-content-center align-items-center py-3">
                        <motion.span
                            className="welcome-text"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            Transacciones
                        </motion.span>
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
                            {['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Cantidad', 'Acciones'].map((header, i) => (
                                <motion.th
                                    key={header}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    {header}
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
                            buttonHover={buttonHover}
                            buttonTap={buttonTap}
                        />
                    </tbody>
                </table>
            </motion.div>
            <TransactionModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                type={modalType}
                onTransactionCreated={fetchTransactions}
                transactionToEdit={editingTransaction}
            />
        </motion.div>
    );
};

export default Transactions;