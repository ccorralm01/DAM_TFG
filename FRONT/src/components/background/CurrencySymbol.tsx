import "./styles/CurrencySymbol.css";

interface CurrencySymbolProps {
    type: number; // Número del 1 al 10
}

export default function CurrencySymbol({ type }: CurrencySymbolProps) {
    const symbols = ["$", "€", "¥", "£", "₽", "₩", "₹", "₣"];
    const classes = [
        "dollar", "euro", "yen", "pound", "ruble",
        "won", "rupee", "franc"
    ];

    // Validar el número y asignar el símbolo correcto
    const index = Math.max(0, Math.min(type - 1, symbols.length - 1));

    return (
        <div className={`currency-symbol primary-color-text ${classes[index]}`}>
            <span className="s-shape">{symbols[index]}</span>
        </div>
    );
}
