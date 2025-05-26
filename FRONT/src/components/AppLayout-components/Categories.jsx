import { useEffect, useState } from "react";
import apiService from "../../services/apiService";
import { toast } from 'react-toastify';
import CustomToast from "../Ui-components/CustomToast";
import CategoriesGrid from "../Category-components/CategoriesGrid";
import CategoryModal from "../Category-components/CategoryModal";
import LoadingSpinner from "../Ui-components/LoadingSpinner";
import './styles/Categories.css';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [loading, setLoading] = useState(true);

    // Obtener categorías
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await apiService.getCategories();
            setCategories(response);
        } catch (error) {
            console.error("Error al obtener las categorías:", error);
            toast.error("Error al cargar las categorías");
        } finally {
            setLoading(false);
        }
    };

    // Manejar edición
    const handleEdit = (category) => {
        setCurrentCategory(category);
        setShowModal(true);
    };

    // Manejar eliminación
    const handleDelete = async (id) => {
        toast(
            <CustomToast
                title="Confirmar eliminación"
                message="¿Estás seguro de eliminar esta categoría?"
                type="confirm"
                onConfirm={async () => {
                    try {
                        setIsDeleting(true);
                        const response = await apiService.deleteCategory(id);
                        setCategories(categories.filter(cat => cat.id !== id));
                        toast(<CustomToast title="Éxito!" message={response.msg} type='success' onClose={() => toast.dismiss()} />);
                    } catch (error) {
                        console.error("Error al eliminar:", error);
                        toast(<CustomToast title="Error!" message={error.message || "Error al eliminar la categoría"} type='error' onClose={() => toast.dismiss()} />);
                    } finally {
                        setIsDeleting(false);
                    }
                }}
                onClose={() => toast.dismiss()}
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
            />,
            {
                position: "top-center",
                autoClose: false,
                closeOnClick: false
            }
        );
    };

    // Guardar cambios (crear/actualizar)
    const handleSave = async (categoryData) => {
        try {
            if (currentCategory) {
                // Edición
                const response = await apiService.updateCategory(currentCategory.id, categoryData);
                toast(<CustomToast title="Éxito!" message={response.msg} type='success' onClose={() => toast.dismiss()} />);
            } else {
                // Creación
                const response = await apiService.createCategory(categoryData);
                toast(<CustomToast title="Éxito!" message={response.msg} type='success' onClose={() => toast.dismiss()} />);

            }
            fetchCategories(); // Refrescar lista
            setShowModal(false);
        } catch (error) {
            console.error("Error al guardar:", error);
            toast(<CustomToast title="Error!" message={error.message || "Error al guardar la categoría"} type='error' onClose={() => toast.dismiss()} />);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container-fluid">
            <header className="mb-4">
                <div className="welcome">
                    <div className="welcome-container container d-flex flex-md-row flex-column justify-content-between align-items-center py-3">
                        <span className="welcome-text">Mis Categorías</span>
                        <button 
                            className="btn btn-nueva-categoria"
                            onClick={() => {
                                setCurrentCategory(null);
                                setShowModal(true);
                            }}
                        >
                            + Nueva Categoría
                        </button>
                    </div>
                </div>
            </header>
            
            <CategoriesGrid
                categories={categories}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={isDeleting}
            />

            {/* Modal para edición/creación */}
            <CategoryModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSave}
                category={currentCategory}
            />
        </div>
    );
}

export default Categories;