import CategoryCard from './CategoryCard';

const CategoriesGrid = ({ categories, onEdit, onDelete, isDeleting }) => {
    return (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
            {categories.map(category => (
                <div key={category.id} className="col">
                    <CategoryCard
                        category={category}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        isDeleting={isDeleting}
                    />
                </div>
            ))}
        </div>
    );
};

export default CategoriesGrid;