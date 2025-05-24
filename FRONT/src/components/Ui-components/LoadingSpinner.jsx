import './styles/LoadingSpinner.css'; 

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