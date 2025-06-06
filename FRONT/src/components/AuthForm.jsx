import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import './styles/AuthLogin.css';

// Servicios
import apiService from '../services/apiService';

// Componentes
import CustomToast from '../components/Ui-components/CustomToast';

// Validación de contraseña
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

// Componente de formulario de autenticación con animaciones y transiciones
const AuthForm = ({ authMode, onToggleAuthMode }) => {
    const location = useLocation();
    const isLogin = location.pathname === '/';
    const mainColor = isLogin ? '#29f' : '#63e';
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        confirmPassword: ''
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
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const toggleAuthMode = () => {
        navigate(isLogin ? '/signup' : '/');
    };

    // Efecto para validar la contraseña en tiempo real
    useEffect(() => {
        if (formData.password) {
            setPasswordValidation(validatePassword(formData.password));
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
    }, [formData.password]);

    // Animaciones
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 200 }
        }
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!isLogin && formData.password !== formData.confirmPassword) {
            toast(<CustomToast title="Error!" message={'Las contraseñas no coinciden'} type='error' onClose={() => toast.dismiss()} />);
            setLoading(false);
            return;
        }

        if (!isLogin && !passwordValidation.isValid) {
            toast(<CustomToast title="Error!" message={'La contraseña no cumple con los requisitos'} type='error' onClose={() => toast.dismiss()} />);
            setLoading(false);
            return;
        }

        try {
            if (isLogin) {
                const credentials = {
                    email: formData.email,
                    password: formData.password
                };
                const response = await apiService.login(credentials);
                toast(<CustomToast title="Éxito!" message={response.msg} type='success' onClose={() => toast.dismiss()} />);
                navigate('/dashboard')
            } else {
                const newUser = {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                };
                const response = await apiService.register(newUser);
                toast(<CustomToast title="Éxito!" message={response.msg} type='success' onClose={() => toast.dismiss()} />);
                navigate('/')
            }
        } catch (err) {
            toast(<CustomToast title="Error!" message={err.message || 'Error en la autenticación'} type='error' onClose={() => toast.dismiss()} />);
            toast.error();
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="position-relative d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow-lg col-md-6 col-lg-4 col-11">
                <div className="card-body p-4">
                    <motion.div
                        className="text-center mb-4"
                        key={isLogin ? "login-header" : "signup-header"}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.svg
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            xmlns="http://www.w3.org/2000/svg"
                            width="50"
                            height="50"
                            fill={mainColor}
                            className="bi bi-person-circle"
                            viewBox="0 0 16 16"
                        >
                            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                            <path
                                fillRule="evenodd"
                                d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"
                            />
                        </motion.svg>
                        <motion.h2
                            className="mt-3"
                            initial={{ y: -10 }}
                            animate={{ y: 0 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            {isLogin ? "Iniciar Sesión" : "Regístrate"}
                        </motion.h2>
                    </motion.div>

                    {error && (
                        <motion.div
                            className="alert alert-danger"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLogin ? "login-form" : "signup-form"}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            <form id="authForm" onSubmit={handleSubmit}>
                                {!isLogin && (
                                    <motion.div className="mb-3" variants={itemVariants}>
                                        <label htmlFor="username" className="form-label">Nombre de Usuario</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="username"
                                            placeholder="Usuario"
                                            required
                                            value={formData.username}
                                            onChange={handleChange}
                                        />
                                    </motion.div>
                                )}

                                <motion.div className="mb-3" variants={itemVariants}>
                                    <label htmlFor="email" className="form-label">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        placeholder="tu@email.com"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </motion.div>

                                <motion.div className="mb-3" variants={itemVariants}>
                                    <label htmlFor="password" className="form-label">Contraseña</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        placeholder="••••••••"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    {!isLogin && formData.password && (
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

                                {!isLogin && (
                                    <motion.div className="mb-3" variants={itemVariants}>
                                        <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
                                        <input
                                            type="password"
                                            className={`form-control ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'is-invalid' : formData.confirmPassword && formData.password === formData.confirmPassword ? 'is-valid' : ''}`}
                                            id="confirmPassword"
                                            placeholder="••••••••"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                        {formData.confirmPassword && (
                                            <div className={`mt-1 small ${formData.password === formData.confirmPassword ? 'text-success' : 'text-danger'}`}>
                                                {formData.password === formData.confirmPassword ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                <motion.div className="d-grid mb-3" variants={itemVariants}>
                                    <motion.button
                                        type="submit"
                                        className="btn btn-primary py-2"
                                        style={{ backgroundColor: mainColor }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={loading || (!isLogin && (!passwordValidation.isValid || (formData.confirmPassword && formData.password !== formData.confirmPassword)))}
                                    >
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : isLogin ? "Ingresar" : "Crear cuenta"}
                                    </motion.button>
                                </motion.div>
                            </form>
                        </motion.div>
                    </AnimatePresence>

                    <motion.div
                        className="d-flex align-items-center my-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <hr className="flex-grow-1" />
                        <span className="px-2 text-muted">o</span>
                        <hr className="flex-grow-1" />
                    </motion.div>

                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <p className="mb-0">
                            {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
                            <motion.button
                                className="btn btn-link text-decoration-none ms-1 p-0 border-0 bg-transparent"
                                onClick={(e) => {
                                    e.preventDefault();
                                    toggleAuthMode();
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {isLogin ? "Regístrate" : "Inicia sesión"}
                            </motion.button>
                        </p>
                    </motion.div>
                </div>
            </div>
        </main>
    );
};

export default AuthForm;