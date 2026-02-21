import { useState } from 'react';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
}

export default function ProgressiveImage({ src, alt, className = '', loading = 'lazy' }: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full h-full">
      {!loaded && !error && (
        <div className="absolute inset-0 bg-navy-100 animate-pulse" />
      )}
      {error && (
        <div className="absolute inset-0 bg-navy-100 flex items-center justify-center">
          <span className="text-xs text-navy-400">Failed to load image</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading={loading}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}
