import { render, screen } from '@/lib/test-utils'

import Home from '../page'

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({ alt, ...props }: any) {
    return <img alt={alt} {...props} />
  },
}))

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  },
}))

describe('Homepage', () => {
  it('renders the main heading', () => {
    render(<Home />)
    
    const heading = screen.getByRole('heading', { name: /modern library management/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders the feature cards', () => {
    render(<Home />)
    
    // Check for feature card headings
    expect(screen.getByText('Book Management')).toBeInTheDocument()
    expect(screen.getByText('Student Management')).toBeInTheDocument()
    expect(screen.getByText('Analytics & Reports')).toBeInTheDocument()
    expect(screen.getByText('Advanced Features')).toBeInTheDocument()
  })

  it('renders the action buttons', () => {
    render(<Home />)
    
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /view documentation/i })).toBeInTheDocument()
  })

  it('renders the theme toggle', () => {
    render(<Home />)
    
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
  })

  it('renders the status badge', () => {
    render(<Home />)
    
    expect(screen.getByText(/phase 1\.2 implementation/i)).toBeInTheDocument()
  })

  it('has main content section with correct id', () => {
    render(<Home />)
    
    const mainContent = screen.getByRole('main')
    expect(mainContent).toBeInTheDocument()
    expect(mainContent).toHaveAttribute('id', 'main-content')
  })

  it('displays feature descriptions', () => {
    render(<Home />)
    
    expect(screen.getByText(/comprehensive catalog with advanced search/i)).toBeInTheDocument()
    expect(screen.getByText(/organize students by year with bulk import/i)).toBeInTheDocument()
    expect(screen.getByText(/year-based reporting with visual dashboards/i)).toBeInTheDocument()
    expect(screen.getByText(/notifications, reservations, fine management/i)).toBeInTheDocument()
  })
})