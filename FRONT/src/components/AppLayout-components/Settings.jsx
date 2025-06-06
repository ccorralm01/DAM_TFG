import { motion } from "framer-motion";
import '../../index.css';
import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import apiService from "../../services/apiService";
import CustomToast from "../Ui-components/CustomToast";
import LoadingSpinner from '../Ui-components/LoadingSpinner';

// Función de validación de contraseña
const validatePassword = (password) => {
    const hasMinLength = password.length >= 8;
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
        isValid: hasMinLength && hasLowercase && hasNumber && hasSpecialChar,
        checks: {
            length: hasMinLength,
            lowercase: hasLowercase,
            number: hasNumber,
            specialChar: hasSpecialChar
        }
    };
};

const Settings = () => {
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        id: '',
        created_at: ''
    });
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currencyData, setCurrencyData] = useState({
        currency: "EUR",
        symbol: "€"
    });
    const [previousCurrency, setPreviousCurrency] = useState("EUR");
    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: ""
    });
    const [passwordValidation, setPasswordValidation] = useState({
        isValid: false,
        checks: {
            length: false,
            lowercase: false,
            number: false,
            specialChar: false
        }
    });
    const [exchangeRates, setExchangeRates] = useState(null);

    
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const toggleShowOldPassword = () =>{
        setShowOldPassword(!showOldPassword)
    }

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    // Efecto para validar la nueva contraseña en tiempo real
    useEffect(() => {
        if (passwordData.new_password) {
            setPasswordValidation(validatePassword(passwordData.new_password));
        } else {
            setPasswordValidation({
                isValid: false,
                checks: {
                    length: false,
                    lowercase: false,
                    number: false,
                    specialChar: false
                }
            });
        }
    }, [passwordData.new_password]);

    // Recuperar datos del perfil y ajustes
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Obtener datos del perfil
                const profileData = await apiService.getProfile();
                setUserData({
                    username: profileData.username,
                    email: profileData.email,
                    id: profileData.id,
                    created_at: profileData.created_at
                });

                // Obtener configuración de moneda
                const settingsData = await apiService.getSettings();
                if (settingsData && settingsData.currency) {
                    const symbol = getCurrencySymbol(settingsData.currency);
                    setCurrencyData({
                        currency: settingsData.currency,
                        symbol: symbol
                    });
                    setPreviousCurrency(settingsData.currency);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Función auxiliar para obtener símbolo de moneda
    const getCurrencySymbol = (currency) => {
        switch (currency) {
            case 'USD': return '$';
            case 'EUR': return '€';
            case 'GBP': return '£';
            case 'JPY': return '¥';
            default: return '€';
        }
    };

    // Actualizar perfil
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Actualizar datos básicos del perfil
            console.log(userData)
            await apiService.updateProfile(userData);

            // Si se proporcionó nueva contraseña, actualizarla
            if (passwordData.new_password && passwordData.new_password.trim() !== '') {
                if (passwordData.new_password !== passwordData.confirm_password) {
                    throw new Error("Las contraseñas nuevas no coinciden");
                }

                if (!passwordData.current_password) {
                    throw new Error("Debes ingresar tu contraseña actual para cambiarla");
                }

                if (!passwordValidation.isValid) {
                    throw new Error("La nueva contraseña no cumple con los requisitos");
                }

                console.log(passwordData)

                await apiService.updatePassword(passwordData);
            }

            toast(<CustomToast title="Éxito!" message="Perfil actualizado correctamente" type='success' onClose={() => toast.dismiss()} />);
            setIsEditing(false);

            // Limpiar campos de contraseña después de actualizar
            setPasswordData({
                current_password: '',
                new_password: '',
                confirm_password: ''
            });
        } catch (error) {
            toast(<CustomToast title="Error" message={error.message || "Error al actualizar el perfil"} type='error' onClose={() => toast.dismiss()} />);
        } finally {
            setLoading(false);
        }
    };

    // Actualizar moneda con factor de conversión
    const handleCurrencyUpdate = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            // 1. Obtener las tasas de cambio para todas las monedas desde la nueva base
            const ratesResponse = await fetch(
                `https://api.frankfurter.dev/v1/latest?symbols=USD,EUR,GBP,JPY&base=${currencyData.currency}`
            );
            const ratesData = await ratesResponse.json();

            // 2. Obtener específicamente la tasa de conversión de la moneda anterior a la nueva
            const conversionResponse = await fetch(
                `https://api.frankfurter.dev/v1/latest?from=${previousCurrency}&to=${currencyData.currency}`
            );
            const conversionData = await conversionResponse.json();
            const conversionRate = conversionData.rates[currencyData.currency];

            // 3. Enviar al backend la nueva moneda y el factor de conversión
            const response = await apiService.updateSettings({
                currency: currencyData.currency,
                conversion_rate: conversionRate
            });

            console.log("Actualizado a ", currencyData.currency, " Con cambio de ", conversionRate)

            if (response && response.settings) {
                // 4. Actualizar los estados locales
                setCurrencyData({
                    currency: response.settings.currency,
                    symbol: getCurrencySymbol(response.settings.currency)
                });
                setPreviousCurrency(response.settings.currency);
                setExchangeRates(ratesData.rates);
            }

            toast(<CustomToast title="Éxito!" message={response.msg} type='success' onClose={() => toast.dismiss()} />);
        } catch (error) {
            console.error("Error updating currency:", error);
            toast(<CustomToast title="Error" message="No se pudo actualizar la moneda" type='error' onClose={() => toast.dismiss()} />);

            // Revertir al valor anterior si falla
            setCurrencyData(prev => ({
                ...prev,
                currency: previousCurrency,
                symbol: getCurrencySymbol(previousCurrency)
            }));
        } finally {
            setLoading(false);
        }
    };

    const fetchExchangeRates = async () => {
        try {
            const response = await fetch(
                `https://api.frankfurter.dev/v1/latest?symbols=USD,EUR,GBP,JPY&base=${currencyData.currency}`
            );
            const data = await response.json();
            setExchangeRates(data.rates);
        } catch (error) {
            console.error("Error fetching exchange rates:", error);
        }
    };

    useEffect(() => {
        fetchExchangeRates();
    }, [currencyData.currency]);

    // Animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1]
            }
        },
        hover: {
            y: -3,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            transition: {
                duration: 0.3,
                type: "spring",
                stiffness: 400
            }
        }
    };

    const headerVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                delay: 0.2,
                duration: 0.5
            }
        }
    };

    const bodyVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delay: 0.4,
                duration: 0.7,
                staggerChildren: 0.1
            }
        }
    };

    const textVariants = {
        hidden: { opacity: 0, y: 5 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <>
            <motion.header
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="welcome">
                    <div className="welcome-container container d-flex flex-md-row flex-column justify-content-between align-items-center py-3">
                        <span className="welcome-text">Ajustes</span>
                    </div>
                </div>
            </motion.header>


            <div className="container mt-4">
                <div className="row g-4">
                    <motion.article
                        className="col-12 col-md-6"
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        variants={cardVariants}
                    >
                        <motion.div className="middle-card d-flex flex-column px-4 py-3 gap-3 h-100">
                            <motion.header
                                variants={headerVariants}
                                className="h5 fw-semibold d-flex justify-content-between align-items-center"
                            >
                                <span>Perfil de Usuario</span>
                                {!isEditing ? (
                                    <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Editar
                                    </button>
                                ) : null}
                            </motion.header>

                            <motion.form
                                className="middle-card-body d-flex flex-column h-100 w-100 p-3"
                                variants={bodyVariants}
                                onSubmit={handleSubmit}
                            >
                                <motion.div className="mb-3" variants={textVariants}>
                                    <label htmlFor="username" className="form-label">Nombre de usuario</label>
                                    <input
                                        id="username"
                                        type="text"
                                        className="form-control fs-6"
                                        value={userData.username}
                                        onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                                        readOnly={!isEditing}
                                        disabled={!isEditing}
                                    />
                                </motion.div>

                                <motion.div className="mb-3" variants={textVariants}>
                                    <label htmlFor="email" className="form-label">Correo electrónico</label>
                                    <input
                                        id="email"
                                        type="email"
                                        className="form-control fs-6"
                                        value={userData.email}
                                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                        readOnly={!isEditing}
                                        disabled={!isEditing}
                                    />
                                </motion.div>

                                {isEditing && (
                                    <>
                                        <div className="border-top my-3 pt-3">
                                            <h6 className="fw-semibold">Cambiar contraseña</h6>
                                            <small className="msg-2">Dejar en blanco si no deseas cambiar la contraseña</small>

                                            <motion.div className="mb-3 mt-2" variants={textVariants}>
                                                <label htmlFor="currentPassword" className="form-label">Contraseña actual</label>
                                                <div className="input-group">
                                                    <input
                                                        id="currentPassword"
                                                        type={showOldPassword ? "text" : "password"}
                                                        className="form-control fs-6"
                                                        placeholder="Ingresa tu contraseña actual"
                                                        value={passwordData.current_password}
                                                        onChange={(e) => setPasswordData({
                                                            ...passwordData,
                                                            current_password: e.target.value
                                                        })}
                                                    />
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        type="button"
                                                        onClick={toggleShowOldPassword}
                                                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                                    >
                                                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                                    </button>
                                                </div>
                                            </motion.div>

                                            <motion.div className="mb-3" variants={textVariants}>
                                                <label htmlFor="newPassword" className="form-label">Nueva contraseña</label>
                                                <div className="input-group">
                                                    <input
                                                        id="newPassword"
                                                        type={showPassword ? "text" : "password"}
                                                        className="form-control fs-6"
                                                        placeholder="Ingresa tu nueva contraseña"
                                                        value={passwordData.new_password}
                                                        onChange={(e) => setPasswordData({
                                                            ...passwordData,
                                                            new_password: e.target.value
                                                        })}
                                                    />
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        type="button"
                                                        onClick={toggleShowPassword}
                                                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                                    >
                                                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                                    </button>
                                                </div>
                                                {passwordData.new_password && (
                                                    <div className="password-feedback mt-2">
                                                        <small>La contraseña debe contener:</small>
                                                        <ul className="list-unstyled mb-0">
                                                            <li className={passwordValidation.checks.length ? 'text-success' : 'text-danger'}>
                                                                {passwordValidation.checks.length ? '✓' : '✗'} Mínimo 8 caracteres
                                                            </li>
                                                            <li className={passwordValidation.checks.lowercase ? 'text-success' : 'text-danger'}>
                                                                {passwordValidation.checks.lowercase ? '✓' : '✗'} Al menos una letra minúscula
                                                            </li>
                                                            <li className={passwordValidation.checks.number ? 'text-success' : 'text-danger'}>
                                                                {passwordValidation.checks.number ? '✓' : '✗'} Al menos un número
                                                            </li>
                                                            <li className={passwordValidation.checks.specialChar ? 'text-success' : 'text-danger'}>
                                                                {passwordValidation.checks.specialChar ? '✓' : '✗'} Al menos un carácter especial (!@#$%^&*)
                                                            </li>
                                                        </ul>
                                                    </div>
                                                )}
                                            </motion.div>

                                            <motion.div className="mb-3" variants={textVariants}>
                                                <label htmlFor="confirmPassword" className="form-label">Confirmar nueva contraseña</label>
                                                <div className="input-group">
                                                    <input
                                                        id="confirmPassword"
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        className={`form-control fs-6 ${passwordData.confirm_password && passwordData.new_password !== passwordData.confirm_password ? 'is-invalid' : passwordData.confirm_password && passwordData.new_password === passwordData.confirm_password ? 'is-valid' : ''}`}
                                                        placeholder="Confirma tu nueva contraseña"
                                                        value={passwordData.confirm_password}
                                                        onChange={(e) => setPasswordData({
                                                            ...passwordData,
                                                            confirm_password: e.target.value
                                                        })}
                                                    />
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        type="button"
                                                        onClick={toggleShowConfirmPassword}
                                                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                                    >
                                                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                                    </button>
                                                    </div>
                                                    {passwordData.confirm_password && (
                                                        <div className={`mt-1 small ${passwordData.new_password === passwordData.confirm_password ? 'text-success' : 'text-danger'}`}>
                                                            {passwordData.new_password === passwordData.confirm_password ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                                                        </div>
                                                    )}
                                                
                                            </motion.div>
                                        </div>
                                    </>
                                )}

                                <motion.div className="mb-3" variants={textVariants}>
                                    <label htmlFor="createdAt" className="form-label">Fecha de creación</label>
                                    <input
                                        id="createdAt"
                                        type="text"
                                        className="form-control fs-6"
                                        value={new Date(userData.created_at).toLocaleDateString()}
                                        readOnly
                                        disabled
                                    />
                                </motion.div>

                                {isEditing && (
                                    <motion.div
                                        className="mt-auto d-flex gap-2"
                                        variants={textVariants}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{ delay: 0.6 }}
                                    >
                                        <button
                                            type="submit"
                                            className="btn btn-primary flex-grow-1"
                                            disabled={loading ||
                                                (passwordData.new_password &&
                                                    (!passwordValidation.isValid ||
                                                        passwordData.new_password !== passwordData.confirm_password ||
                                                        !passwordData.current_password))}
                                        >
                                            {loading ? (
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            ) : 'Guardar cambios'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary flex-grow-1"
                                            onClick={() => setIsEditing(false)}
                                            disabled={loading}
                                        >
                                            Cancelar
                                        </button>
                                    </motion.div>
                                )}
                            </motion.form>
                        </motion.div>
                    </motion.article>
                    <motion.article
                        className="col-12 col-md-6"
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        variants={cardVariants}
                        transition={{ delay: 0.1 }}
                    >
                        <motion.div className="middle-card d-flex flex-column px-4 py-3 gap-3 h-100">
                            <motion.header
                                variants={headerVariants}
                                className="h5 fw-semibold"
                            >
                                Configuración de Moneda
                            </motion.header>

                            <motion.form
                                className="middle-card-body d-flex flex-column h-100 w-100 p-3"
                                variants={bodyVariants}
                                onSubmit={handleCurrencyUpdate}
                            >
                                <motion.div className="mb-3" variants={textVariants}>
                                    <label className="form-label">Moneda principal</label>
                                    <select
                                        className="form-select fs-6"
                                        value={currencyData.currency}
                                        onChange={(e) => {
                                            const newCurrency = e.target.value;
                                            setCurrencyData(prev => ({
                                                ...prev,
                                                currency: newCurrency,
                                                symbol: getCurrencySymbol(newCurrency)
                                            }));
                                        }}
                                        disabled={loading}
                                    >
                                        <option value="USD">Dólar Estadounidense (USD)</option>
                                        <option value="EUR">Euro (EUR)</option>
                                        <option value="GBP">Libra Esterlina (GBP)</option>
                                        <option value="JPY">Yen Japonés (JPY)</option>
                                    </select>
                                </motion.div>

                                <motion.div className="mb-3" variants={textVariants}>
                                    <label className="form-label">Símbolo</label>
                                    <input
                                        type="text"
                                        className="form-control fs-6"
                                        value={currencyData.symbol}
                                        readOnly
                                    />
                                </motion.div>
                                <motion.div className="mb-3" variants={textVariants}>
                                    <label className="form-label">Tipos de cambio (base {currencyData.currency})</label>
                                    <div className="exchange-rates-container p-2 rounded">
                                        {exchangeRates && Object.entries(exchangeRates).map(([currency, rate]) => (
                                            currency !== currencyData.currency && (
                                                <div
                                                    key={currency}
                                                    className={`d-flex justify-content-between ${rate < 1 ? 'text-danger' : 'text-success'}`}
                                                >
                                                    <span>{currency}:</span>
                                                    <span className={`ms-2 small ${rate < 1 ? 'text-danger' : 'text-success'}`}>
                                                        {(Math.abs(rate)).toFixed(4)}
                                                        {rate > 1 ? (
                                                            <i className="bi bi-arrow-up"></i>
                                                        ) : rate < 1 ? (
                                                            <i className="bi bi-arrow-down"></i>
                                                        ) : (
                                                            <i className="bi bi-dash"></i>
                                                        )}
                                                    </span>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                    <small className="msg-2">Actualizado: {new Date().toLocaleString()}</small>
                                </motion.div>

                                <motion.div
                                    className="mt-auto"
                                    variants={textVariants}
                                >
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : 'Actualizar moneda'}
                                    </button>
                                </motion.div>
                            </motion.form>
                        </motion.div>
                    </motion.article>
                </div>
            </div>
        </>
    );
};

export default Settings;