// components/Ui-components/Pagination.jsx
import { motion } from 'framer-motion';
import './styles/Pagination.css';
const Pagination = ({
    currentPage,
    totalPages,
    paginate,
    getPaginationGroup,
    buttonHover,
    buttonTap
}) => {
    return (
        <motion.div
            className="dark-pagination"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <motion.button
                onClick={() => paginate(1)}
                disabled={currentPage === 1}
                className="pagination-edge"
                whileHover={buttonHover}
                whileTap={buttonTap}
            >
                «
            </motion.button>

            <motion.button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
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
                        className={`pagination-number ${currentPage === item ? 'active' : ''}`}
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
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-prev-next"
                whileHover={buttonHover}
                whileTap={buttonTap}
            >
                ›
            </motion.button>

            <motion.button
                onClick={() => paginate(totalPages)}
                disabled={currentPage === totalPages}
                className="pagination-edge"
                whileHover={buttonHover}
                whileTap={buttonTap}
            >
                »
            </motion.button>
        </motion.div>
    );
};

export default Pagination;