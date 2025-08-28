import { render, screen, fireEvent } from '@/lib/test-utils'

import { Button } from '../button'

describe('Button Component', () => {
  it('renders with correct default props', () => {
    render(<Button>Test Button</Button>)
    
    const button = screen.getByRole('button', { name: /test button/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center')
  })

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Button variant="default">Default</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-primary')

    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass('border', 'border-input')

    rerender(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button')).toHaveClass('hover:bg-accent')

    rerender(<Button variant="destructive">Destructive</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-destructive')

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-secondary')
  })

  it('applies size classes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-8', 'px-3', 'text-xs')

    rerender(<Button size="default">Default</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-9', 'px-4', 'py-2')

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-10', 'px-8')

    rerender(<Button size="icon">Icon</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-9', 'w-9')
  })

  it('handles disabled state correctly', () => {
    render(<Button disabled>Disabled Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
  })

  it('forwards click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Clickable Button</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not fire click event when disabled', () => {
    const handleClick = jest.fn()
    render(<Button disabled onClick={handleClick}>Disabled Button</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('renders as different elements when asChild is used', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  it('supports keyboard navigation', () => {
    render(<Button>Keyboard Button</Button>)
    
    const button = screen.getByRole('button')
    button.focus()
    
    expect(button).toHaveFocus()
    
    fireEvent.keyDown(button, { key: 'Enter' })
    fireEvent.keyDown(button, { key: ' ' })
    
    // Button should remain focused
    expect(button).toHaveFocus()
  })

  it('has correct accessibility attributes', () => {
    render(
      <Button aria-label="Custom accessible label" aria-describedby="helper-text">
        Button with Accessibility
      </Button>
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Custom accessible label')
    expect(button).toHaveAttribute('aria-describedby', 'helper-text')
  })
})