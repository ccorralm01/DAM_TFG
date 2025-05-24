// components/NotificationProvider.jsx
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componente para proporcionar notificaciones en la aplicación
const NotificationProvider = ({ children }) => {
    return (
        <>
            {children}
            <ToastContainer
                toastClassName={() => "custom-toast-wrapper"}
                bodyClassName={() => "custom-toast-body"}
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={true}
                closeButton={false}
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