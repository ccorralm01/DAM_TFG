import { useState, useEffect } from "react";
import { format, addDays } from 'date-fns';
import apiService from "../services/apiService";

export const useDashboard = (isAuthenticated) => {
    const [profile, setProfile] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [refreshData, setRefreshData] = useState(false);

    // Obtener rango de fechas del mes actual
    const getCurrentMonthRange = () => {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return [startDate, endDate];
    };

    const [dateRange, setDateRange] = useState(getCurrentMonthRange());

    // Rangos predefinidos para el DatePicker
    const predefinedRanges = [
        { label: 'Hoy', value: [new Date(), new Date()], placement: 'left' },
        { label: 'Ayer', value: [addDays(new Date(), -1), addDays(new Date(), -1)], placement: 'left' },
        { label: 'Últimos 7 días', value: [addDays(new Date(), -7), new Date()], placement: 'left' },
        { label: 'Últimos 30 días', value: [addDays(new Date(), -30), new Date()], placement: 'left' },
        { label: 'Mes actual', value: getCurrentMonthRange(), placement: 'left' }
    ];

    // Manejar apertura/cierre del modal
    const handleOpenModal = (type) => {
        setModalType(type);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalType('');
    };

    const handleTransactionCreated = () => {
        setRefreshData(prev => !prev);
    };

    // Cargar perfil del usuario
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchProfile = async () => {
            try {
                const profileData = await apiService.getProfile();
                setProfile(profileData);
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        fetchProfile();
    }, [isAuthenticated]);

    return {
        profile,
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