import { describe, it, expect, vi } from 'vitest';
import { render } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';

describe('Button', () => {
  it('renders button with text', () => {
    const { getByRole } = render(<Button>Click me</Button>);
    expect(getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const { getByRole } = render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    const { getByRole } = render(<Button disabled>Disabled</Button>);
    expect(getByRole('button')).toBeDisabled();
  });

  it('applies different variants', () => {
    const { rerender, getByRole } = render(<Button variant="default">Default</Button>);
    expect(getByRole('button')).toHaveClass('bg-primary');
    
    rerender(<Button variant="outline">Outline</Button>);
    expect(getByRole('button')).toHaveClass('border-input');
  });

  it('applies different sizes', () => {
    const { rerender, getByRole } = render(<Button size="default">Default</Button>);
    expect(getByRole('button')).toHaveClass('h-8');
    
    rerender(<Button size="sm">Small</Button>);
    expect(getByRole('button')).toHaveClass('h-7');
    
    rerender(<Button size="lg">Large</Button>);
    expect(getByRole('button')).toHaveClass('h-9');
  });
});
