import React, { forwardRef, useCallback } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { usePrefetch } from '@/hooks/usePrefetch';

interface PrefetchLinkProps extends LinkProps {
  prefetch?: boolean;
}

export const PrefetchLink = forwardRef<HTMLAnchorElement, PrefetchLinkProps>(
  ({ to, prefetch = true, onMouseEnter, onTouchStart, children, ...props }, ref) => {
    const { handleMouseEnter, handleTouchStart } = usePrefetch();

    const path = typeof to === 'string' ? to : to.pathname || '';

    const onHover = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (prefetch) {
          handleMouseEnter(path);
        }
        onMouseEnter?.(e);
      },
      [prefetch, handleMouseEnter, path, onMouseEnter]
    );

    const onTouch = useCallback(
      (e: React.TouchEvent<HTMLAnchorElement>) => {
        if (prefetch) {
          handleTouchStart(path);
        }
        onTouchStart?.(e);
      },
      [prefetch, handleTouchStart, path, onTouchStart]
    );

    return (
      <Link
        ref={ref}
        to={to}
        onMouseEnter={onHover}
        onTouchStart={onTouch}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

PrefetchLink.displayName = 'PrefetchLink';
