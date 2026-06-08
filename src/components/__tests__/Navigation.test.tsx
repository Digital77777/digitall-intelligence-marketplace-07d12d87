import { describe, it, expect, vi } from 'vitest';
import { render } from '@/test/test-utils';
import Navigation from '../Navigation';

// Mock useAuth hook while preserving AuthProvider
vi.mock('@/hooks/useAuth', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    useAuth: () => ({
      user: null,
      loading: false,
      signOut: vi.fn(),
    }),
  };
});

describe('Navigation', () => {
  it('renders navigation component', () => {
    const { container } = render(<Navigation />);
    const nav = container.querySelector('nav');
    expect(nav).toBeTruthy();
  });

  it('displays the logo/brand name', () => {
    const { getByText } = render(<Navigation />);
    expect(getByText(/Digital Intelligence Marketplace/i)).toBeTruthy();
  });

  it('shows sign in button when user is not authenticated', () => {
    const { getByText } = render(<Navigation />);
    expect(getByText(/Sign In/i)).toBeTruthy();
  });

  it('has accessible navigation structure', () => {
    const { container } = render(<Navigation />);
    const nav = container.querySelector('nav');
    expect(nav?.getAttribute('aria-label')).toBe('Main navigation');
  });
});
