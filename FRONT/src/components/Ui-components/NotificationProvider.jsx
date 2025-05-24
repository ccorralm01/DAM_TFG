// components/NotificationProvider.jsx
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NotificationProvider = ({ children }) => {
    return (
        <>
            {children}
            <ToastContainer
                toastClassName={() => "custom-toast-wrapper"}
                bodyClassName={() => "custom-toast-body"}
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={true}  // Oculta la barra de progreso por defecto
                closeButton={false}     // Oculta el botón de cerrar por defecto
                newestOnTop
                closeOnClick={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </>
    );
};

export default NotificationProvider;