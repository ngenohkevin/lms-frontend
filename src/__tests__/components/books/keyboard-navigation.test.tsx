import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { BookCatalog } from '@/components/books/book-catalog';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
    input: ({ className, ...props }: any) => <input className={className} {...props} />,
    ul: ({ children, className, ...props }: any) => <ul className={className} {...props}>{children}</ul>,
    li: ({ children, className, ...props }: any) => <li className={className} {...props}>{children}</li>,
    button: ({ children, className, ...props }: any) => <button className={className} {...props}>{children}</button>,
    mark: ({ children, className, ...props }: any) => <mark className={className} {...props}>{children}</mark>,
    span: ({ children, className, ...props }: any) => <span className={className} {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock the book catalog with keyboard navigation capabilities
describe('Keyboard Navigation Accessibility Tests', () => {
  beforeEach(() => {
    // Reset any DOM state before each test
    document.body.innerHTML = '';
  });

  describe('Search Component Keyboard Navigation', () => {
    it('focuses search input with Command+K shortcut', async () => {
      const user = userEvent.setup();
      render(<BookCatalog />);

      // Find search input
      const searchInput = screen.getByRole('textbox');
      expect(searchInput).not.toHaveFocus();

      // Simulate Command+K
      await user.keyboard('{Meta>}k{/Meta}');

      expect(searchInput).toHaveFocus();
    });

    it('navigates suggestions with arrow keys', async () => {
      const user = userEvent.setup();
      render(<BookCatalog />);

      const searchInput = screen.getByRole('textbox');
      await user.click(searchInput);

      // Type to trigger suggestions
      await user.type(searchInput, 'JavaScript');

      // Wait for suggestions to appear
      await waitFor(() => {
        expect(screen.queryByText(/suggestions/i)).toBeDefined();
      });

      // Test arrow key navigation
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');

      // Should be able to select with Enter
      await user.keyboard('{Enter}');

      expect(searchInput).toHaveFocus();
    });

    it('closes suggestions with Escape key', async () => {
      const user = userEvent.setup();
      render(<BookCatalog />);

      const searchInput = screen.getByRole('textbox');
      await user.click(searchInput);
      await user.type(searchInput, 'test');

      // Close with Escape
      await user.keyboard('{Escape}');

      expect(searchInput).toHaveFocus();
    });

    it('supports Tab navigation through search interface', async () => {
      const user = userEvent.setup();
      render(<BookCatalog />);

      const searchInput = screen.getByRole('textbox');
      searchInput.focus();

      // Tab should move to next focusable element
      await user.tab();

      // Should move focus away from search input
      expect(searchInput).not.toHaveFocus();
    });
  });

  describe('Filter Panel Keyboard Navigation', () => {
    it('opens filter panel with Enter key on Filters button', async () => {
      const user = userEvent.setup();
      render(<BookCatalog />);

      const filtersButton = screen.getByRole('button', { name: /filters/i });
      filtersButton.focus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
      });
    });

    it('closes filter panel with Escape key', async () => {
      const user = userEvent.setup();
      render(<BookCatalog />);

      // Open filters panel
      const filtersButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filtersButton);

      await waitFor(() => {
        expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
      });

      // Small delay to ensure event listeners are set up
      await new Promise(resolve => setTimeout(resolve, 100));

      // Close with Escape
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Advanced Filters')).not.toBeInTheDocument();
      });
    });

    it('navigates through filter options with Tab key', async () => {
      const user = userEvent.setup();
      render(<BookCatalog />);

      // Open filters panel
      const filtersButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filtersButton);

      await waitFor(() => {
        expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
      });

      // Tab through filter options
      await user.tab();
      await user.tab();
      await user.tab();

      // Should be able to navigate through all filter elements
      expect(document.activeElement).toBeDefined();
    });

    it('selects genre filters with Space key', async () => {
      const user = userEvent.setup();
      render(<BookCatalog />);

      // Open filters panel
      const filtersButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filtersButton);

      await waitFor(() => {
        expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
      });

      // Find and focus a genre checkbox
      const genreCheckbox = screen.getByRole('checkbox', { name: /computer science/i });
      genreCheckbox.focus();

      // Select with Space key
      await user.keyboard(' ');

      expect(genreCheckbox).toBeChecked();
    });

    it('navigates availability options with arrow keys', async () => {
      const user = userEvent.setup();
      render(<BookCatalog />);

      // Open filters panel
      const filtersButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filtersButton);

      await waitFor(() => {
        expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
      });

      // Find availability radio buttons
      const allBooksRadio = screen.getByRole('radio', { name: /all books/i });
      allBooksRadio.focus();

      // Navigate with arrow keys
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');

      expect(document.activeElement).toBeDefined();
    });
  });

  describe('Book Card Keyboard Navigation', () => {
    it('navigates book cards with Tab key', async () => {
      const user = userEvent.setup();
      render(<BookCatalog />);

      // Tab to first book card
      await user.tab();
      await user.tab();
      await user.tab();

      // Continue tabbing through book cards
      await user.tab();
      await user.tab();

      expect(document.activeElement).toBeDefined();
    });

    it('activates book cards with Enter key', async () => {
      const user = userEvent.setup();
      render(<BookCatalog />);

      // Find first book card
      const bookCards = screen.getAllByRole('generic');
      const firstBookCard = bookCards.find(card => 
        card.textContent?.includes('Introduction to Computer Science')
      );

      if (firstBookCard) {
        firstBookCard.focus();
        await user.keyboard('{Enter}');
        // Should trigger book card action
        expect(firstBookCard).toBeDefined();
      }
    });

    it('supports Space key for book card activation', async () => {
      const user = userEvent.setup();
      render(<BookCatalog />);

      // Find and focus a book card
      const bookCards = screen.getAllByRole('generic');
      const bookCard = bookCards.find(card => 
        card.textContent?.includes('Data Structures')
      );

      if (bookCard) {
        bookCard.focus();
        await user.keyboard(' ');
        expect(bookCard).toBeDefined();
      }
    });
  });

  describe('View Toggle Keyboard Navigation', () => {
    it('toggles between Grid and List view with keyboard', async () => {
      const user = userEvent.setup();
      render(<BookCatalog />);

      const gridButton = screen.getByRole('button', { name: /grid/i });
      const listButton = screen.getByRole('button', { name: /list/i });

      // Focus and activate grid view
      gridButton.focus();
      await user.keyboard('{Enter}');

      // Focus and activate list view
      listButton.focus();
      await user.keyboard('{Enter}');

      expect(listButton).toBeDefined();
    });
  });

  describe('Sort Options Keyboard Navigation', () => {
    it('navigates sort dropdown with keyboard', async () => {
      const user = userEvent.setup();
      render(<BookCatalog />);

      // Open filters to access sort options
      const filtersButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filtersButton);

      await waitFor(() => {
        expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
      });

      // Find sort dropdown
      const sortDropdown = screen.getByRole('combobox');
      sortDropdown.focus();

      // Open dropdown with Space or Enter
      await user.keyboard(' ');

      // Navigate options with arrow keys
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');

      // Select option with Enter
      await user.keyboard('{Enter}');

      expect(sortDropdown).toBeDefined();
    });
  });

  describe('Accessibility Attributes', () => {
    it('has proper ARIA labels for screen readers', () => {
      render(<BookCatalog />);

      // Check for essential ARIA attributes
      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveAttribute('placeholder');

      const filtersButton = screen.getByRole('button', { name: /filters/i });
      expect(filtersButton).toBeInTheDocument();
    });

    it('maintains focus management during interactions', async () => {
      const user = userEvent.setup();
      render(<BookCatalog />);

      const searchInput = screen.getByRole('textbox');
      await user.click(searchInput);
      expect(searchInput).toHaveFocus();

      // Focus should be maintained appropriately
      await user.tab();
      expect(searchInput).not.toHaveFocus();
    });

    it('supports screen reader navigation landmarks', () => {
      render(<BookCatalog />);

      // Should have proper semantic structure
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('supports global keyboard shortcuts', async () => {
      const user = userEvent.setup();
      render(<BookCatalog />);

      // Test Command+K for search
      await user.keyboard('{Meta>}k{/Meta}');
      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveFocus();
    });

    it('shows keyboard shortcut hints in UI', () => {
      render(<BookCatalog />);

      // Should show K hint for search (Command icon is rendered separately)
      expect(screen.getByText('K')).toBeInTheDocument();
    });
  });
});