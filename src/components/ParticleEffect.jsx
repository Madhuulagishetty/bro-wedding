import { useEffect, useRef } from 'react';

const ParticleEffect = ({ 
  numParticles = 100, 
  particleColor = '#ffffff', 
  particleSize = 3,
  particleSpeed = 1
}) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas to full window size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // Create particles
    const particles = [];
    
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * particleSize + 1,
        color: particleColor,
        speedX: (Math.random() - 0.5) * particleSpeed,
        speedY: (Math.random() - 0.5) * particleSpeed,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
    
    // Draw particles
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${hexToRgb(particle.color)}, ${particle.opacity})`;
        ctx.fill();
        
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.speedX = -particle.speedX;
        }
        
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.speedY = -particle.speedY;
        }
      });
      
      // Draw connections between particles
      drawConnections();
      
      requestAnimationFrame(draw);
    };
    
    // Draw connections between nearby particles
    const drawConnections = () => {
      const maxDistance = 150; // Maximum distance to draw connections
      
      particles.forEach((particle1, i) => {
        particles.slice(i + 1).forEach(particle2 => {
          const dx = particle1.x - particle2.x;
          const dy = particle1.y - particle2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            // Opacity based on distance
            const opacity = 1 - (distance / maxDistance);
            
            ctx.beginPath();
            ctx.moveTo(particle1.x, particle1.y);
            ctx.lineTo(particle2.x, particle2.y);
            ctx.strokeStyle = `rgba(${hexToRgb(particleColor)}, ${opacity * 0.2})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });
    };
    
    // Helper function to convert hex color to rgb
    const hexToRgb = (hex) => {
      // Remove # if present
      hex = hex.replace('#', '');
      
      // Parse the hex values
      const r = parseInt(hex.substring(0, 2), 16) || 255;
      const g = parseInt(hex.substring(2, 4), 16) || 255;
      const b = parseInt(hex.substring(4, 6), 16) || 255;
      
      return `${r}, ${g}, ${b}`;
    };
    
    // Start animation
    draw();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, [numParticles, particleColor, particleSize, particleSpeed]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ backgroundColor: 'transparent' }}
    />
  );
};

export default ParticleEffect;