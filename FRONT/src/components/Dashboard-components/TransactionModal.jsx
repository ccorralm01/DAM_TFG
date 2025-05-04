import { useState, useEffect } from "react";
import apiService from "../../services/apiService";
import "./styles/TransactionModal.css";
import { toast } from 'react-toastify';

const TransactionModal = ({ show, onClose, type }) => {
    const [formData, setFormData] = useState({
        amount: "",
        description: "",
        category: "",
        newCategory: "",
        categoryType: "need", // Nuevo campo para el tipo de categoría
        color: "#3b82f6",
        date: new Date().toISOString().split('T')[0]
    });

    const [categories, setCategories] = useState([]);

    // Opciones para los tipos de categoría
    const categoryTypes = [
        { value: "need", label: "Necesidad" },
        { value: "want", label: "Deseo" },
        { value: "save", label: "Ahorro" }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleColorSelect = (color) => {
        setFormData(prev => ({ ...prev, color }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const transactionData = {
            amount: formData.amount,
            description: formData.description,
            date: formData.date,
            newCategory: formData.category === "new" ? formData.newCategory : null,
            color: formData.color,
            category_id: formData.category !== "new" ? formData.category : null,
            kind: type === 'income' ? 'income' : 'expense',
            categoryType: formData.category === "new" ? formData.categoryType : null // Enviamos el tipo de categoría
        };

        if (formData.category === "new" && formData.newCategory) {
            const newCategory = {
                value: formData.newCategory.toLowerCase().replace(/\s+/g, '-'),
                name: formData.newCategory,
                color: formData.color,
                type: formData.categoryType
            };
            console.log("Nueva categoría:", newCategory);
            try {
                const response = await apiService.createCategory(newCategory);
                transactionData.category_id = response.category.id;
                console.log("Categoría creada:", response.category);
                toast.success(response.msg || "Nueva categoría creada", {
                    autoClose: 1500,
                });
            } catch (err) {
                toast.error(err.message || 'Error al crear categoría');
            }
        }

        try {
            const response = await apiService.createTransaction(transactionData);
            toast.success(response.msg || "Nuevo " + (type === 'income' ? 'ingreso' : 'gasto') + " creado", {
                autoClose: 1500,
            });
        } catch (err) {
            toast.error(err.message || 'Error al crear transacción');
        }
        onClose();
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesData = await apiService.getCategories();
                setCategories(categoriesData);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h4>{type === 'income' ? 'Nuevo Ingreso' : 'Nuevo Gasto'}</h4>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Cantidad</label>
                            <input
                                type="number"
                                className="form-control"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                                step="0.01"
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Descripción</label>
                            <textarea
                                className="form-control"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Categoría</label>
                                <div className="custom-select">
                                    <select
                                        className="form-control"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="" className="text-light" disabled>Seleccione una categoría</option>
                                        <option value="new">➕ Nueva categoría</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id} style={{ color: cat.color }}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>

                                    {formData.category && formData.category !== "new" && (
                                        <div className="color-dot"
                                            style={{
                                                backgroundColor: categories.find(c => c.id == formData.category)?.color || "#ccc"
                                            }}
                                        ></div>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Fecha</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {formData.category === "new" && (
                            <div className="new-category-form">
                                <div className="form-group">
                                    <label>Nombre</label>
                                    <div className="d-flex align-items-center gap-2">
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="newCategory"
                                            value={formData.newCategory}
                                            onChange={handleChange}
                                            required
                                        />
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => handleColorSelect(e.target.value)}
                                            className="color-preview"
                                        />
                                    </div>
                                </div>
                                
                                {/* Selector para el tipo de categoría */}
                                <div className="form-group">
                                    <label>Tipo de categoría</label>
                                    <select
                                        className="form-control"
                                        name="categoryType"
                                        value={formData.categoryType}
                                        onChange={handleChange}
                                        required
                                    >
                                        {categoryTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionModal;