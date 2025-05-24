import './styles/CustomToast.css';

const CustomToast = ({ title, message, closeToast, type = 'default' }) => ( // default | success | error | info | warning
    <div className={`custom-toast ${type}`}>
        <div className="toast-logo">
            <img alt="Logo" width="32" height="32" src="/src/assets/Small-logo.png" />
        </div>
        <div className="toast-content">
            <h4 className="toast-title">{title}</h4>
            <p className="toast-message">{message}</p>
        </div>
        <button className="toast-close" onClick={closeToast}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 1L1 13M1 1L13 13" stroke="#A0B2B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </button>
    </div>
);

export default CustomToast;