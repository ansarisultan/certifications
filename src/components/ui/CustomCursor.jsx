import { useState, useEffect } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      const isInteractive = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('.cursor-pointer') ||
        target.closest('.panel-3d') ||
        target.closest('.btn-3d');
      setIsHovering(!!isInteractive);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (window.matchMedia('(pointer: coarse)').matches) return null;

  return (
    <>
      {/* Main cursor */}
      <div
        className="fixed pointer-events-none z-[9999] transition-transform duration-75"
        style={{
          left: position.x - 8,
          top: position.y - 8,
          transform: `scale(${isClicking ? 0.7 : isHovering ? 1.3 : 1})`,
        }}
      >
        <div className="relative">
          <div className={`absolute inset-[-8px] rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 opacity-20 blur-md transition-all duration-300 ${
            isHovering ? 'opacity-40 blur-xl scale-150' : ''
          }`} />
          <div className={`w-4 h-4 rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 transition-all duration-300 ${
            isHovering ? 'scale-150' : ''
          }`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-white/80" />
            </div>
          </div>
        </div>
      </div>

      {/* Trail effect */}
      <div
        className="fixed pointer-events-none z-[9998] transition-all duration-200"
        style={{
          left: position.x - 16,
          top: position.y - 16,
          opacity: isHovering ? 0.4 : 0.2,
          transform: `scale(${isClicking ? 0.5 : isHovering ? 1.2 : 0.8})`,
        }}
      >
        <div className="w-8 h-8 rounded-full border border-primary-500/20 animate-pulse" />
      </div>

      {/* Label */}
      {isHovering && (
        <div
          className="fixed pointer-events-none z-[9997] transition-opacity duration-200"
          style={{
            left: position.x + 16,
            top: position.y - 8,
          }}
        >
          <div className="text-[8px] font-mono text-primary-400 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-primary-500/20 whitespace-nowrap">
            ✦ interactive
          </div>
        </div>
      )}
    </>
  );
}
