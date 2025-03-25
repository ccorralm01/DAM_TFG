import CurrencySymbol from "./CurrencySymbol";
import "./styles/AnimatedBackground.css";

const getRandomValue = (min: number, max: number, step = 1): number => {
    const range = (max - min) / step;
    return Math.floor(Math.random() * (range + 1)) * step + min;
};

interface RandomConfig {
    left: string;
    width: number;
    height: number;
    animationDelay: string;
    animationDuration: string;
}

interface AnimatedSymbolProps {
    index: number;
}

const getRandomConfig = (): RandomConfig => {
    return {
        left: `${getRandomValue(0, 100, 10)}%`,
        width: getRandomValue(20, 150, 10),
        height: getRandomValue(20, 150, 10),
        animationDelay: `${getRandomValue(0, 15)}s`,
        animationDuration: `${getRandomValue(10, 45)}s`
    };
};

const AnimatedSymbol: React.FC<AnimatedSymbolProps> = ({ index }) => {
    const style = getRandomConfig();
    return (
        <li style={{
            left: style.left,
            width: style.width,
            height: style.height,
            animationDelay: style.animationDelay,
            animationDuration: style.animationDuration
        }}>
            <CurrencySymbol type={(index % 8) + 1} />
        </li>
    );
};

export default function AnimatedBackground() {
    return (
        <div className="area">
            <ul className="circles">
                {Array.from({ length: 15 }).map((_, index) => (
                    <AnimatedSymbol key={index} index={index}/>
                ))}
            </ul>
        </div>
    );
}
