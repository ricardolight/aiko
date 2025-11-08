'use client';

import { ReactNode, useRef } from 'react';

interface Card3DProps {
  children: ReactNode;
  className?: string;
  intensity?: number; // NEW: Control seberapa kuat efeknya
}

export default function Card3D({ 
  children, 
  className = '',
  intensity = 0.5 // DEFAULT: 0.5 (50% intensity) 
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // 🔥 LIMITED MOVEMENT: 
    // Divide by LARGER number = less movement
    const rotateX = ((y - centerY) / 20) * intensity;    // dari 10 jadi 20 (50% lebih kecil)
    const rotateY = ((centerX - x) / 20) * intensity;    // dari 10 jadi 20 (50% lebih kecil)
    
    // 🔥 SUBTLE SCALE: 
    const scale = 1 + (0.02 * intensity);               // dari 1.02 jadi max 1.01

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-300 ease-out ${className}`} // 🔥 Durasi lebih lama
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}