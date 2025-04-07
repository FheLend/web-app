
import React from 'react';
import { cn } from '@/lib/utils';

interface ImageProps extends React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
  fallback?: React.ReactNode;
}

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, fallback, alt, ...props }, ref) => {
    const [error, setError] = React.useState(false);

    return error && fallback ? (
      <div className={className}>{fallback}</div>
    ) : (
      <img
        className={cn('max-w-full h-auto', className)}
        alt={alt || ''}
        onError={() => setError(true)}
        ref={ref}
        {...props}
      />
    );
  }
);

Image.displayName = 'Image';
