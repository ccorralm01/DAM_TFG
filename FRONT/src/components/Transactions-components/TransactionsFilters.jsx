import { motion } from 'framer-motion';
import apiService from '../../services/apiService';
import { useState } from 'react';
import { toast } from 'react-toastify';
import CustomToast from '../Ui-components/CustomToast';
import './styles/TransactionsFilters.css'; // Asegúrate de tener estilos para el modal y los botones

const TransactionsFilters = ({ 
    filters, 
    categories, 
    onFilterChange,
    buttonHover,
    buttonTap,
    onImportSuccess // Callback cuando la importación es exitosa
}) => {
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
            }
            
            setShowImportModal(false);
            setSelectedFile(null);
            onImportSuccess?.(); // Actualizar la lista de transacciones
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

    return (
        <>
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
            </motion.div>

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
        </>
    );
};

export default TransactionsFilters;



