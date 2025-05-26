import { useState, useEffect } from "react";
import apiService from "../../services/apiService";
import "./styles/TransactionModal.css";
import { toast } from 'react-toastify';

const TransactionModal = ({
    show,
    onClose,
    type,
    onTransactionCreated,
    transactionToEdit // Nueva prop para la transacción a editar
}) => {
    const isEditMode = Boolean(transactionToEdit);

    const [formData, setFormData] = useState({
        amount: "",
        description: "",
        category: "",
        newCategory: "",
        categoryType: "need",
        color: "#3b82f6",
        date: new Date().toISOString().split('T')[0]
    });

    const [categories, setCategories] = useState([]);

    const categoryTypes = [
        { value: "need", label: "Necesidad" },
        { value: "want", label: "Deseo" },
        { value: "save", label: "Ahorro" }
    ];

    // Efecto para cargar los datos de la transacción a editar
    useEffect(() => {
        if (isEditMode && transactionToEdit) {
            setFormData({
                amount: transactionToEdit.amount.toString(),
                description: transactionToEdit.description,
                category: transactionToEdit.category?.id || "",
                newCategory: "",
                categoryType: transactionToEdit.category?.type || "need",
                color: transactionToEdit.category?.color || "#3b82f6",
                date: transactionToEdit.date.split('T')[0]
            });
        } else {
            // Resetear el formulario si no estamos en modo edición
            setFormData({
                amount: "",
                description: "",
                category: "",
                newCategory: "",
                categoryType: "need",
                color: "#3b82f6",
                date: new Date().toISOString().split('T')[0]
            });
        }
    }, [isEditMode, transactionToEdit]);

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
            amount: parseFloat(formData.amount),
            description: formData.description,
            date: formData.date,
            newCategory: formData.category === "new" ? formData.newCategory : null,
            color: formData.color,
            category_id: formData.category !== "new" ? formData.category : null,
            kind: type === 'income' ? 'income' : 'expense',
            categoryType: formData.category === "new" ? formData.categoryType : null
        };

        if (formData.category === "new" && formData.newCategory) {
            const newCategory = {
                value: formData.newCategory.toLowerCase().replace(/\s+/g, '-'),
                name: formData.newCategory,
                color: formData.color,
                type: formData.categoryType
            };

            try {
                const response = await apiService.createCategory(newCategory);
                transactionData.category_id = response.category.id;
                toast.success(response.msg || "Nueva categoría creada", {
                    autoClose: 1500,
                });
            } catch (err) {
                toast.error(err.message || 'Error al crear categoría');
                return;
            }
        }

        try {
            let response;
            if (isEditMode) {
                // Llamada para actualizar la transacción existente
                response = await apiService.updateTransaction(transactionToEdit.id, transactionData);
                toast.success(response.msg || "Transacción actualizada", {
                    autoClose: 1500,
                });
            } else {
                // Llamada para crear nueva transacción
                response = await apiService.createTransaction(transactionData);
                toast.success(response.msg || "Nuevo " + (type === 'income' ? 'ingreso' : 'gasto') + " creado", {
                    autoClose: 1500,
                });
            }

            onTransactionCreated(); // Actualizar el estado en el componente padre
        } catch (err) {
            toast.error(err.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} transacción`);
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
                <div className="d-flex justify-content-between align-items-center modal-header">
                    <h4>
                        {isEditMode ? 'Editar Transacción' :
                            type === 'income' ? 'Nuevo Ingreso' : 'Nuevo Gasto'}
                    </h4>
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
                                            required={formData.category === "new"}
                                        />
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => handleColorSelect(e.target.value)}
                                            className="color-preview"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Tipo de categoría</label>
                                    <select
                                        className="form-control"
                                        name="categoryType"
                                        value={formData.categoryType}
                                        onChange={handleChange}
                                        required={formData.category === "new"}
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

                    <div className="d-flex justify-content-end gap-2 modal-footer">
                        <button type="button" className="btn btn-cancelar" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-aceptar btn">
                            {isEditMode ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionModal;