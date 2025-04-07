import "./styles/LoginForm.css";
import AnimatedBackground from '../background/AnimatedBackground';

export default function LoginForm() {
    return (
        <div className="login-page-container">
            <AnimatedBackground />
            <div className="container">
                <form className="login">
                    <span>logo</span>
                    <input type="text" placeholder="Username" />
                    <input type="password" placeholder="Password" />
                    <button>Iniciar sesión</button>
                </form>
            </div>
        </div>
                );
}