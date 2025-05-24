import { motion } from 'framer-motion';
import apiService from '../../services/apiService';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import CustomToast from '../Ui-components/CustomToast';

const TransactionsFilters = ({ 
    filters, 
    categories, 
    onFilterChange,
    buttonHover,
    buttonTap
}
) => {

    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Llamar al servicio de exportación
            const blob = await apiService.exportTransactions();
            
            // Crear enlace de descarga
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transacciones_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            
            // Limpiar
            window.URL.revokeObjectURL(url);
            a.remove();
            
            toast(<CustomToast title="Éxito!" message="Datos exportados" type='success' onClose={() => toast.dismiss()} />);
        } catch (error) {
            console.error('Error al exportar:', error);
            toast(<CustomToast title="Error!" message={err.message || 'Error en la autenticación'} type='error' onClose={() => toast.dismiss()} />);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <motion.div
            className="filters my-4 d-flex align-items-end justify-content-around"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
        >
            {['kind', 'category', 'dateFrom', 'dateTo', 'search'].map((filterName, index) => (
                <motion.div
                    key={filterName}
                    className="filter-group"
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
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <motion.button
                    className='btn btn-primary'
                    whileHover={buttonHover}
                    whileTap={buttonTap}
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
                    className='btn btn-primary'
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                    onClick={handleExport}
                    disabled={isExporting}
                >
                    {isExporting ? (
                        <span>Exportando...</span>
                    ) : (
                        <span>EXPORTAR DATOS</span>
                    )}
                </motion.button>

            </motion.div>
        </motion.div>
    );
};

export default TransactionsFilters;