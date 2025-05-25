import { useState, useEffect } from 'react';

const CategoryModal = ({ show, onClose, onSave, category }) => {
    const [formData, setFormData] = useState({
        name: '',
        color: '#4fb087',
        type: 'need'
    });

    // Inicializar formulario cuando cambia la categoría
    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
                color: category.color,
                type: category.type
            });
        } else {
            setFormData({
                name: '',
                color: '#4fb087',
                type: 'need'
            });
        }
    }, [category]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!show) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {category ? 'Editar Categoría' : 'Nueva Categoría'}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Nombre</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Tipo</label>
                                <select
                                    className="form-select"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="need">Necesidad</option>
                                    <option value="want">Deseo</option>
                                    <option value="save">Ahorro</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Color</label>
                                <input
                                    type="color"
                                    className="form-control form-control-color"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    style={{ height: '40px', width: '100%' }}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={onClose}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                            >
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CategoryModal;