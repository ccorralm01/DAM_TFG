import { motion } from 'framer-motion';

const TransactionsFilters = ({
    filters,
    categories,
    onFilterChange,
    buttonHover,
    buttonTap,
}) => {
    
    return (
        <>
            <motion.div
                className="filters mt-4 mb-0 d-flex align-items-end justify-content-around"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
            >
                {['kind', 'category', 'dateFrom', 'dateTo', 'search'].map((filterName, index) => (
                    <motion.div
                        key={filterName}
                        className={`filter-group col-12 col-sm-6 col-md-4 col-lg-2 ${filterName === 'search' ? 'col-lg-3' : ''}`}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
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
                                onChange={onFilterChange}
                                whileHover={{ scale: 1.02 }}
                            >
                                <option value="">
                                    {filterName === 'kind' ? 'Todo' : 'Todas'}
                                </option>
                                {filterName === 'kind' ? (
                                    <>
                                        <option value="income">Ingreso</option>
                                        <option value="expense">Gasto</option>
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
                                onChange={onFilterChange}
                                whileFocus={{ scale: 1.02 }}
                            />
                        ) : (
                            <motion.input
                                type="date"
                                name={filterName}
                                value={filters[filterName]}
                                onChange={onFilterChange}
                                whileFocus={{ scale: 1.02 }}
                            />
                        )}
                    </motion.div>
                ))}
            </motion.div>


        </>
    );
};

export default TransactionsFilters;



