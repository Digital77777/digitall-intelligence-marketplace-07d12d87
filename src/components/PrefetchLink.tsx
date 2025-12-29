import React, { forwardRef, useCallback, useEffect, useRef } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { usePrefetch } from '@/hooks/usePrefetch';

interface PrefetchLinkProps extends LinkProps {
  prefetch?: boolean;
  prefetchOnViewport?: boolean;
}

export const PrefetchLink = forwardRef<HTMLAnchorElement, PrefetchLinkProps>(
  ({ to, prefetch = true, prefetchOnViewport = false, onMouseEnter, onTouchStart, children, ...props }, ref) => {
    const { handleMouseEnter, handleTouchStart, prefetch: doPrefetch } = usePrefetch();
    const internalRef = useRef<HTMLAnchorElement>(null);
    const prefetchedRef = useRef(false);

    const path = typeof to === 'string' ? to : to.pathname || '';

    // Viewport-based prefetching
    useEffect(() => {
      if (!prefetchOnViewport || prefetchedRef.current) return;
      
      const element = internalRef.current;
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !prefetchedRef.current) {
              prefetchedRef.current = true;
              doPrefetch(path);
              observer.disconnect();
            }
          });
        },
        { rootMargin: '100px' }
      );

      observer.observe(element);

      return () => observer.disconnect();
    }, [path, prefetchOnViewport, doPrefetch]);

    const onHover = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (prefetch && !prefetchedRef.current) {
          handleMouseEnter(path);
          prefetchedRef.current = true;
        }
        onMouseEnter?.(e);
      },
      [prefetch, handleMouseEnter, path, onMouseEnter]
    );

    const onTouch = useCallback(
      (e: React.TouchEvent<HTMLAnchorElement>) => {
        if (prefetch && !prefetchedRef.current) {
          handleTouchStart(path);
          prefetchedRef.current = true;
        }
        onTouchStart?.(e);
      },
      [prefetch, handleTouchStart, path, onTouchStart]
    );

    // Merge refs
    const mergedRef = useCallback(
      (node: HTMLAnchorElement | null) => {
        internalRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    return (
      <Link
        ref={mergedRef}
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
