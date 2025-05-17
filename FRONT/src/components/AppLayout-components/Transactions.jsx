import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import "./styles/Transactions.css";
import apiService from "../../services/apiService";

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [filters, setFilters] = useState({
        kind: '',
        category: '',
        dateFrom: '',
        dateTo: '',
        search: ''
    });

    const itemsPerPage = window.innerHeight * 7 / 1030;
    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: Math.round(itemsPerPage)
    });

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const transactionData = await apiService.getTransactions();
                setTransactions(transactionData);
                setFilteredTransactions(transactionData);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    useEffect(() => {
        let result = [...transactions];

        if (filters.kind) {
            result = result.filter(t => t.kind === filters.kind);
        }

        if (filters.category) {
            result = result.filter(t => t.category && t.category.id.toString() === filters.category);
        }

        if (filters.dateFrom) {
            result = result.filter(t => new Date(t.date) >= new Date(filters.dateFrom));
        }
        if (filters.dateTo) {
            result = result.filter(t => new Date(t.date) <= new Date(filters.dateTo));
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            result = result.filter(t =>
                t.description.toLowerCase().includes(searchTerm) ||
                (t.category && t.category.name.toLowerCase().includes(searchTerm)) ||
                t.amount.toString().includes(searchTerm)
            );
        }

        setFilteredTransactions(result);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, [filters, transactions]);

    const indexOfLastItem = pagination.currentPage * pagination.itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - pagination.itemsPerPage;
    const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTransactions.length / pagination.itemsPerPage);

    const paginate = (pageNumber) => setPagination(prev => ({ ...prev, currentPage: pageNumber }));

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const categories = transactions
        .filter(t => t.category)
        .reduce((acc, transaction) => {
            const exists = acc.some(cat =>
                cat.id === transaction.category.id
            );
            if (!exists) {
                acc.push({
                    id: transaction.category.id,
                    name: transaction.category.name,
                    color: transaction.category.color
                });
            }
            return acc;
        }, [])
        .sort((a, b) => a.name.localeCompare(b.name));

    const getPaginationGroup = () => {
        const start = Math.max(1, pagination.currentPage - 1);
        const end = Math.min(totalPages, pagination.currentPage + 1);

        let pages = [];
        if (start > 1) pages.push(1);
        if (start > 2) pages.push('...');

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < totalPages - 1) pages.push('...');
        if (end < totalPages) pages.push(totalPages);

        return pages;
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5
            }
        }
    };

    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } }
    };

    const buttonHover = {
        scale: 1.05,
        transition: { duration: 0.2 }
    };

    const buttonTap = {
        scale: 0.95
    };

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

            {/* filtros */}
            <motion.div
                className="filters my-4 d-flex align-items-end justify-content-around"
                variants={containerVariants}
            >
                {['kind', 'category', 'dateFrom', 'dateTo', 'search'].map((filterName, index) => (
                    <motion.div
                        key={filterName}
                        className="filter-group"
                        variants={itemVariants}
                        custom={index}
                    >
                        <label>
                            {filterName === 'kind' ? 'Tipo:' :
                                filterName === 'category' ? 'Categoría:' :
                                    filterName === 'dateFrom' ? 'Desde:' :
                                        filterName === 'dateTo' ? 'Hasta:' : 'Buscar:'}
                        </label>
                        {filterName === 'kind' || filterName === 'category' ? (
                            <motion.select
                                className='select'
                                name={filterName}
                                value={filters[filterName]}
                                onChange={handleFilterChange}
                                whileHover={{ scale: 1.02 }}
                            >
                                <option value="">
                                    {filterName === 'kind' ? 'Todo' : 'Todas'}
                                </option>
                                {filterName === 'kind' ? (
                                    <>
                                        <option value="income">Income</option>
                                        <option value="expense">Expense</option>
                                    </>
                                ) : (
                                    categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))
                                )}
                            </motion.select>
                        ) : filterName === 'search' ? (
                            <motion.input
                                type="text"
                                name={filterName}
                                placeholder="Description or amount..."
                                value={filters[filterName]}
                                onChange={handleFilterChange}
                                whileFocus={{ scale: 1.02 }}
                            />
                        ) : (
                            <motion.input
                                type="date"
                                name={filterName}
                                value={filters[filterName]}
                                onChange={handleFilterChange}
                                whileFocus={{ scale: 1.02 }}
                            />
                        )}
                    </motion.div>
                ))}
                <motion.div variants={itemVariants}>
                    <motion.button
                        className='btn btn-primary'
                        whileHover={buttonHover}
                        whileTap={buttonTap}
                    >
                        IMPORTAR DATOS
                    </motion.button>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <motion.button
                        className='btn btn-primary'
                        whileHover={buttonHover}
                        whileTap={buttonTap}
                    >
                        EXPORTAR DATOS
                    </motion.button>
                </motion.div>
            </motion.div>

            {/* Transactiones */}
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
                        <AnimatePresence>
                            {currentTransactions.length > 0 ? (
                                currentTransactions.map((transaction, index) => (
                                    <motion.tr
                                        key={transaction.id}
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit={{ opacity: 0, x: -50 }}
                                        transition={{ delay: index * 0.05 }}
                                        layout
                                    >
                                        <td>{new Date(transaction.date).toLocaleDateString()}</td>
                                        <td>{transaction.description}</td>
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
                                            {transaction.kind.charAt(0).toUpperCase() + transaction.kind.slice(1)}
                                        </td>
                                        <td className={transaction.kind}>
                                            {transaction.kind === 'income' ? '+' : '-'}
                                            {transaction.amount.toFixed(2)}
                                        </td>
                                        <td className="d-flex gap-3">
                                            <motion.button
                                                className="edit-button btn btn-secondary"
                                                whileHover={buttonHover}
                                                whileTap={buttonTap}
                                            >
                                                Editar
                                            </motion.button>
                                            <motion.button
                                                className="delete-button btn btn-danger"
                                                whileHover={buttonHover}
                                                whileTap={buttonTap}
                                            >
                                                Eliminar
                                            </motion.button>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <motion.tr
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <td colSpan="6" className="no-transactions">
                                        No transactions found
                                    </td>
                                </motion.tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </motion.div>

            {/* Paginación */}
            {filteredTransactions.length > pagination.itemsPerPage && (
                <motion.div
                    className="compact-pagination"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <motion.button
                        onClick={() => paginate(1)}
                        disabled={pagination.currentPage === 1}
                        className="pagination-edge"
                        whileHover={buttonHover}
                        whileTap={buttonTap}
                    >
                        «
                    </motion.button>

                    <motion.button
                        onClick={() => paginate(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="pagination-prev-next"
                        whileHover={buttonHover}
                        whileTap={buttonTap}
                    >
                        ‹
                    </motion.button>

                    {getPaginationGroup().map((item, index) => (
                        item === '...' ? (
                            <motion.span
                                key={index}
                                className="pagination-ellipsis"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                ...
                            </motion.span>
                        ) : (
                            <motion.button
                                key={index}
                                onClick={() => paginate(item)}
                                className={`pagination-number ${pagination.currentPage === item ? 'active' : ''}`}
                                whileHover={buttonHover}
                                whileTap={buttonTap}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                            >
                                {item}
                            </motion.button>
                        )
                    ))}

                    <motion.button
                        onClick={() => paginate(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === totalPages}
                        className="pagination-prev-next"
                        whileHover={buttonHover}
                        whileTap={buttonTap}
                    >
                        ›
                    </motion.button>

                    <motion.button
                        onClick={() => paginate(totalPages)}
                        disabled={pagination.currentPage === totalPages}
                        className="pagination-edge"
                        whileHover={buttonHover}
                        whileTap={buttonTap}
                    >
                        »
                    </motion.button>
                </motion.div>
            )}

            <motion.div
                className="summary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTransactions.length)} de {filteredTransactions.length} transacciones
            </motion.div>
        </motion.div>
    );
};

export default Transactions;