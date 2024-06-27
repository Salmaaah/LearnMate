import { useRef, useEffect } from 'react';

const IconButton = ({
  provided,
  icon,
  iColor = 'var(--D200)',
  iHcolor = 'var(--P200)',
  bColor = '',
  bHcolor = 'var(--M50)',
  shadow,
  onClick,
  size,
}) => {
  const buttonRef = useRef(null);
  const buttonStyle = {
    '--iColor': iColor,
    '--iHcolor': iHcolor,
    '--bColor': bColor,
    '--bHcolor': bHcolor,
    padding: `${parseInt(size) / 1.3}px`,
  };

  useEffect(() => {
    const paths = buttonRef.current.querySelectorAll('path');
    paths.forEach((path) => {
      if (
        path.hasAttribute('stroke') &&
        path.getAttribute('stroke') !== 'none'
      ) {
        path.classList.add('stroke');
      } else if (
        path.hasAttribute('fill') &&
        path.getAttribute('fill') !== 'none'
      ) {
        path.classList.add('fill');
      }
    });
  }, [icon]);

  return (
    <button
      ref={buttonRef}
      style={buttonStyle}
      className={`iconButton${shadow ? ' shadow' : ''}`}
      onClick={onClick}
      {...provided?.dragHandleProps}
    >
      <div
        style={{
          display: 'flex',
          width: `${size}`,
          height: `${size}`,
        }}
      >
        {icon}
      </div>
    </button>
  );
};

export default IconButton;
