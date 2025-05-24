import './styles/LoadingSpinner.css'; 

// Componente de spinner de carga
const LoadingSpinner = () => {
    return (
        <div className="loader-overlay">
            <div className="loader-container">
                <span className="loader"></span>
            </div>
        </div>
    );
};

export default LoadingSpinner;