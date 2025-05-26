import { motion } from "framer-motion";
import './styles/TransactionImportModal.css';

const TransacctionsImportModal = ({
    setShowImportModal,
    handleImport,
    isImporting,
    setIsImporting,
    selectedFile,
    buttonHover,
    buttonTap,
    buttonVariants,
    handleFileChange,
}) => {

    return (<motion.div
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
                    className="btn-modal btn btn-primary"
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
    )
}


export default TransacctionsImportModal;