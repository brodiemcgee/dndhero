interface PixelButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  className?: string;
}

export function PixelButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = ''
}: PixelButtonProps) {
  const variantStyles = {
    primary: 'bg-fantasy-gold hover:bg-fantasy-tan text-fantasy-dark',
    secondary: 'bg-fantasy-green hover:bg-fantasy-moss text-fantasy-light',
    danger: 'bg-fantasy-red hover:bg-red-700 text-fantasy-light',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`retro-button ${variantStyles[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
