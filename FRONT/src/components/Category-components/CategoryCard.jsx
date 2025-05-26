import React from 'react';
import { motion } from 'framer-motion';
import './styles/CategoryCard.css';

const CategoryCard = ({ category, onEdit, onDelete }) => {
    // Animaciones
    const cardVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 }
        }
    };

    const iconVariants = {
        hover: { scale: 1.2 },
        tap: { scale: 0.9 }
    };

    // Obtener clase según tipo
    const getTypeClass = () => {
        switch (category.type) {
            case 'need': return 'category-badge-need';
            case 'want': return 'category-badge-want';
            case 'save': return 'category-badge-save';
            default: return '';
        }
    };

    // Texto para el tipo
    const getTypeText = () => {
        switch (category.type) {
            case 'need': return 'Necesidad';
            case 'want': return 'Deseo';
            case 'save': return 'Ahorro';
            default: return '';
        }
    };

    return (
        <motion.div
            className="category-card card mb-2"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            style={{ borderLeftColor: category.color }}
        >
            <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="card-title mb-0" style={{ fontSize: '1rem' }}>
                        {category.name}
                    </h5>
                    <small className="text-light">
                        {new Date(category.created_at).toLocaleDateString()}
                    </small>
                </div>

                <div className="d-flex justify-content-start align-items-center">
                    <span className={`badge ${getTypeClass()}`}>
                        {getTypeText()}
                    </span>
                </div>
            </div>
            <div className="category-actions d-flex w-100 justify-content-end gap-2 p-3">
                <motion.button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(category);
                    }}
                    variants={iconVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="card-actions-edit btn btn-link text-secondary"
                    aria-label="Editar"
                >
                    <i className="card-icon bi bi-pencil-fill"></i>
                </motion.button>

                <motion.button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(category.id);
                    }}
                    variants={iconVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="card-actions-delete btn btn-link text-secondary"
                    aria-label="Eliminar"
                >
                    <i className="card-icon bi bi-trash-fill"></i>
                </motion.button>
            </div>
        </motion.div>
    );
};

export default CategoryCard;