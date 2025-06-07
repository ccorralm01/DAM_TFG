import { useState, useEffect } from "react";
import { addDays } from 'date-fns';  // Librería para manipulación de fechas
import apiService from "../services/apiService";

// Hook personalizado para manejar la lógica del dashboard
export const useDashboard = (isAuthenticated) => {
    const [profile, setProfile] = useState(null);  // Estado para datos del perfil
    const [showModal, setShowModal] = useState(false);  // Estado para visibilidad del modal
    const [modalType, setModalType] = useState('');  // Tipo de modal a mostrar
    const [refreshData, setRefreshData] = useState(false);  // Flag para refrescar datos

    // Genera rango de fechas del mes actual [inicio, fin]
    const getCurrentMonthRange = () => {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);  // Primer día del mes
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);  // Último día del mes
        return [startDate, endDate];
    };

    const [dateRange, setDateRange] = useState(getCurrentMonthRange());  // Rango de fechas seleccionado

    // Rangos predefinidos para selector de fechas
    const predefinedRanges = [
        { label: 'Hoy', value: [new Date(), new Date()], placement: 'left' },
        { label: 'Ayer', value: [addDays(new Date(), -1), addDays(new Date(), -1)], placement: 'left' },
        { label: 'Últimos 7 días', value: [addDays(new Date(), -7), new Date()], placement: 'left' },
        { label: 'Últimos 30 días', value: [addDays(new Date(), -30), new Date()], placement: 'left' },
        { label: 'Mes actual', value: getCurrentMonthRange(), placement: 'left' }
    ];

    // Controladores para el modal
    const handleOpenModal = (type) => {
        setModalType(type);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalType('');
    };

    // Callback para refrescar datos después de una transacción
    const handleTransactionCreated = () => {
        setRefreshData(prev => !prev);  // Alterna el valor para trigger re-render
    };

    // Efecto para cargar perfil cuando cambia autenticación
    useEffect(() => {
        if (!isAuthenticated) return;  // Salir si no está autenticado

        const fetchProfile = async () => {
            try {
                const profileData = await apiService.getProfile();
                setProfile(profileData);
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        fetchProfile();
    }, [isAuthenticated]);  // Dependencia: solo ejecuta cuando cambia isAuthenticated

    // Retorna estados y métodos para el componente
    return {
        profile,
        refreshData,
        showModal,
        modalType,
        dateRange,
        predefinedRanges,
        handleOpenModal,
        handleCloseModal,
        handleTransactionCreated,
        setDateRange
    };
};