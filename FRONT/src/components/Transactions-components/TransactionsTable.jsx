import { motion, AnimatePresence } from 'framer-motion';

// Componente para mostrar una tabla de transacciones con animaciones
const TransactionsTable = ({ 
    transactions, 
    categories,
    onEditTransaction,
    onDeleteTransaction,
    buttonHover,
    buttonTap
}) => {
    if (transactions.length === 0) {
        return (
            <motion.tr
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <td colSpan="6" className="no-transactions">
                    No transactions found
                </td>
            </motion.tr>
        );
    }

    return (
        <AnimatePresence>
            {transactions.map((transaction, index) => (
                <motion.tr
                    key={transaction.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                >
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td>{transaction.description === 'nan' ? '' : transaction.description}</td>
                    <td>
                        {transaction.category ? (
                            <motion.span
                                className="category-tag"
                                style={{ backgroundColor: transaction.category.color }}
                                whileHover={{ scale: 1.05 }}
                            >
                                {transaction.category.name}
                            </motion.span>
                        ) : 'Uncategorized'}
                    </td>
                    <td className={transaction.kind}>
                        {transaction.kind === 'income' ? 'Ingreso' : 'Gasto'}
                    </td>
                    <td className={transaction.kind}>
                        {transaction.kind === 'income' ? '+' : '-'}
                        {transaction.amount.toFixed(2)}
                    </td>
                    <td className="td-acciones d-flex gap-3">
                        <motion.button
                            className="edit-button btn btn-secondary"
                            whileHover={buttonHover}
                            whileTap={buttonTap}
                            onClick={() => onEditTransaction(transaction)}
                        >
                            <i className="card-icon bi bi-pencil-fill"></i>
                        </motion.button>
                        <motion.button
                            className="delete-button btn btn-danger"
                            whileHover={buttonHover}
                            whileTap={buttonTap}
                            onClick={() => onDeleteTransaction(transaction.id)} // Llamar a la función de eliminación
                        >
                            <i className="card-icon bi bi-trash-fill"></i>
                        </motion.button>
                    </td>
                </motion.tr>
            ))}
        </AnimatePresence>
    );
};

export default TransactionsTable;