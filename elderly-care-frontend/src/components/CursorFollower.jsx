import React, { useEffect, useRef, useState } from 'react';

const CursorFollower = () => {
  const cursorRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const positionRef = useRef({ mouseX: window.innerWidth / 2, mouseY: window.innerHeight / 2, destX: window.innerWidth / 2, destY: window.innerHeight / 2 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      positionRef.current.mouseX = event.clientX;
      positionRef.current.mouseY = event.clientY;
      
      const target = event.target;
      const isClickable = 
        target.tagName.toLowerCase() === 'a' || 
        target.tagName.toLowerCase() === 'button' || 
        target.closest('button') || 
        target.closest('a') || 
        window.getComputedStyle(target).cursor === 'pointer';
        
      setIsHovering(isClickable);
    };

    document.addEventListener('mousemove', handleMouseMove);

    const followMouse = () => {
      // Linear interpolation to make the cursor lag smoothly
      positionRef.current.destX += (positionRef.current.mouseX - positionRef.current.destX) * 0.15;
      positionRef.current.destY += (positionRef.current.mouseY - positionRef.current.destY) * 0.15;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${positionRef.current.destX}px, ${positionRef.current.destY}px, 0)`;
      }
      requestAnimationFrame(followMouse);
    };
    
    const animationFrame = requestAnimationFrame(followMouse);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="cursor-follower"
      style={{
        position: 'fixed',
        top: isHovering ? '-20px' : '-10px',
        left: isHovering ? '-20px' : '-10px',
        width: isHovering ? '40px' : '20px',
        height: isHovering ? '40px' : '20px',
        borderRadius: '50%',
        backgroundColor: isHovering ? 'rgba(230, 240, 250, 0.3)' : 'rgba(230, 240, 250, 0.7)',
        boxShadow: isHovering 
            ? '0 0 20px 8px rgba(29, 78, 137, 0.4)' 
            : '0 0 15px 5px rgba(29, 78, 137, 0.3)',
        pointerEvents: 'none',
        zIndex: 99999,
        transition: 'width 0.3s ease, height 0.3s ease, top 0.3s ease, left 0.3s ease, background-color 0.3s, box-shadow 0.3s',
        willChange: 'transform'
      }}
    />
  );
};

export default CursorFollower;
