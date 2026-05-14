import { useState } from 'react';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  loading?: 'eager' | 'lazy';
  width?: number;
  height?: number;
  sizes?: string;
}

/**
 * ProgressiveImage Component - Optimized for SEO and Performance
 * - Lazy loading by default
 * - Automatic WebP format support
 * - Proper alt text for accessibility
 * - Responsive images with srcset
 */
export default function ProgressiveImage({
  src,
  alt,
  className = '',
  wrapperClassName = 'relative w-full h-full',
  loading = 'lazy',
  width,
  height,
  sizes,
}: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Generate WebP alternative
  const webpSrc = src.includes('?') ? `${src}&fm=webp` : `${src}?fm=webp`;

  // Generate responsive srcset for different screen sizes
  const generateSrcSet = (imageUrl: string, isWebp: boolean = false) => {
    if (!imageUrl.includes('?')) return '';
    const ext = isWebp ? '&w=' : '?w=';
    return `${imageUrl}${ext}640 640w, ${imageUrl}${ext}1024 1024w, ${imageUrl}${ext}1920 1920w`;
  };

  return (
    <div className={wrapperClassName}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-navy-100 animate-pulse" />
      )}
      {error && (
        <div className="absolute inset-0 bg-navy-100 flex items-center justify-center">
          <span className="text-xs text-navy-400">Failed to load image</span>
        </div>
      )}
      <picture>
        {/* WebP format for modern browsers */}
        <source
          srcSet={generateSrcSet(webpSrc, true) || webpSrc}
          type="image/webp"
          sizes={sizes}
        />
        {/* Fallback to original format */}
        <img
          src={src}
          srcSet={generateSrcSet(src) || undefined}
          sizes={sizes}
          alt={alt}
          className={`${className} transition-opacity duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={loading}
          width={width}
          height={height}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      </picture>
    </div>
  );
}
