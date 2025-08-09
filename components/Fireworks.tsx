import React from 'react';

const Fireworks: React.FC = () => {
  const numFireworks = 7;
  const numParticles = 40;

  return (
    <div className="fireworks-container" aria-hidden="true">
      {Array.from({ length: numFireworks }).map((_, i) => (
        <div
          key={i}
          className="firework"
          style={
            {
              top: `${15 + Math.random() * 70}%`,
              left: `${10 + Math.random() * 80}%`,
              '--firework-delay': `${i * 0.3 + Math.random() * 0.2}s`,
            } as React.CSSProperties
          }
        >
          {Array.from({ length: numParticles }).map((_, j) => (
            <div
              key={j}
              className="particle"
              style={
                {
                  '--particle-angle': `${j * (360 / numParticles)}deg`,
                  '--particle-radius': `${Math.random() * 6 + 4}rem`,
                  '--particle-duration': `${Math.random() * 0.5 + 1.2}s`,
                  '--particle-delay': `${Math.random() * 0.3}s`,
                  '--particle-color': `hsl(${Math.random() * 60 + 20}, 100%, 65%)`, // Gold/Yellow/Orange tones
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      ))}
      <style>{`
        .fireworks-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1000;
        }

        .firework {
          position: absolute;
          opacity: 0;
          animation: firework-show 2.5s var(--firework-delay) ease-out forwards;
        }
        
        @keyframes firework-show {
          0%, 100% { opacity: 0; }
          1%, 99% { opacity: 1; }
        }

        .particle {
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: var(--particle-color);
          box-shadow: 0 0 5px var(--particle-color);
          transform-origin: center center;
          opacity: 0;
          animation: particle-explode var(--particle-duration) var(--particle-delay) ease-out forwards;
        }

        @keyframes particle-explode {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          60% {
            opacity: 1;
          }
          100% {
            transform: rotate(var(--particle-angle)) translateX(var(--particle-radius)) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Fireworks;
