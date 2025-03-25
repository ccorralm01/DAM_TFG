import "./styles/LoginForm.css";
import AnimatedBackground from '../background/AnimatedBackground';

export default function LoginForm() {
    return (
        <div className="login-page-container">
            <AnimatedBackground/>
            <div className="login-container">
                <div className="wrapper">
                    <div className="title"><span>Inicia sesión</span></div>
                    <form action="#">
                        <div className="row">
                            <i className="fas fa-user"></i>
                            <input type="text" placeholder="Email or Phone" required />
                        </div>
                        <div className="row">
                            <i className="fas fa-lock"></i>
                            <input type="password" placeholder="Password" required />
                        </div>
                        <div className="pass"><a href="#">¿Olvidaste tu contraseña?</a></div>
                        <div className="row button">
                            <input type="submit" value="Login" />
                        </div>
                        <div className="signup-link">¿No tienes cuenta? <a href="#">Registrate</a></div>
                    </form>
                </div>
            </div>
        </div>
    );
}