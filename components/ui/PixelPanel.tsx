interface PixelPanelProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function PixelPanel({ children, title, className = '' }: PixelPanelProps) {
  return (
    <div className={`bg-fantasy-brown border-4 border-fantasy-tan p-4 ${className}`}>
      {title && (
        <h3 className="mb-4 pb-2 border-b-2 border-fantasy-tan">{title}</h3>
      )}
      {children}
    </div>
  );
}
