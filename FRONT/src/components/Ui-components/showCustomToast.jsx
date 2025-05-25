import { toast } from 'react-toastify';
import CustomToast from './CustomToast';

export const showCustomToast = ({
    title,
    message,
    type = 'default',
    onConfirm,
    confirmText,
    cancelText,
    position = 'bottom-right'
}) => {
    toast(
        ({ closeToast }) => (
            <CustomToast
                title={title}
                message={message}
                type={type}
                closeToast={closeToast}
                onConfirm={onConfirm}
                confirmText={confirmText}
                cancelText={cancelText}
            />
        ),
        {
            position
        }
    );
};
