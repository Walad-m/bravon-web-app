interface BravonLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  iconOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function BravonLogo({
  size = 'sm',
  iconOnly = false,
  className = '',
  style,
}: BravonLogoProps) {
  // Optically tuned desktop dimensions matching official Bravon Design System (squircle badge + bold wordmark)
  const dimensions = {
    xs: { height: 16, width: iconOnly ? 16 : 71 },
    sm: { height: 22, width: iconOnly ? 22 : 97 },
    md: { height: 26, width: iconOnly ? 26 : 115 },
    lg: { height: 32, width: iconOnly ? 32 : 142 },
    xl: { height: 44, width: iconOnly ? 44 : 195 },
  };

  const current = dimensions[size] || dimensions.sm;
  const src = iconOnly ? '/bravon-mark.png' : '/bravon-logo.png';

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        userSelect: 'none',
        ...style,
      }}
    >
      <img
        src={src}
        alt="BRAVON"
        width={current.width}
        height={current.height}
        style={{
          height: `${current.height}px`,
          width: 'auto',
          display: 'block',
          objectFit: 'contain',
        }}
        draggable={false}
      />
    </div>
  );
}
