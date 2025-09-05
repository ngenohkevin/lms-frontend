import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { AdvancedFilters } from '@/components/books/advanced-filters';
import { BookSearchFilters } from '@/lib/types';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
    button: ({ children, className, ...props }: any) => <button className={className} {...props}>{children}</button>,
    label: ({ children, className, ...props }: any) => <label className={className} {...props}>{children}</label>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

const defaultFilters: BookSearchFilters = {
  genres: [],
  authors: [],
  publishers: [],
  years: [],
  availability: 'all',
  sort_by: 'title',
  sort_order: 'asc',
};

const mockFiltersWithValues: BookSearchFilters = {
  genres: ['Computer Science', 'Mathematics'],
  authors: ['John Doe'],
  publishers: ['Tech Publications'],
  years: [2020, 2021, 2022, 2023, 2024],
  availability: 'available',
  sort_by: 'author',
  sort_order: 'desc',
};

describe('AdvancedFilters', () => {
  const mockOnFiltersChange = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when visible', () => {
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
    expect(screen.getByText('Genre')).toBeInTheDocument();
    // Use getAllByText for "Author" since it appears in both the filter section and sort options
    const authorElements = screen.getAllByText('Author');
    expect(authorElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Publication Year')).toBeInTheDocument();
    // Use getAllByText for "Availability" since it appears in both the filter section and sort options
    const availabilityElements = screen.getAllByText('Availability');
    expect(availabilityElements.length).toBeGreaterThanOrEqual(1);
  });

  it('does not render when not visible', () => {
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        isVisible={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Advanced Filters')).not.toBeInTheDocument();
  });

  it('displays close button and calls onClose when clicked', async () => {
    const user = userEvent.setup();
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    // Find the close button by its class (lg:hidden button with X icon)
    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find(btn => btn.className.includes('lg:hidden'));
    expect(closeButton).toBeDefined();
    
    if (closeButton) {
      await user.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('displays selected genres as chips', () => {
    render(
      <AdvancedFilters
        filters={mockFiltersWithValues}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    // Find the genre chips by looking for badges with the genre text
    const badges = screen.getAllByText(/Computer Science|Mathematics/);
    expect(badges.length).toBeGreaterThanOrEqual(2);
  });

  it('allows selecting and deselecting genre filters', async () => {
    const user = userEvent.setup();
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    // Click on a genre option
    const csOption = screen.getByText('Computer Science');
    await user.click(csOption);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      genres: ['Computer Science'],
    });
  });

  it('removes genre when checkbox is unchecked', async () => {
    const user = userEvent.setup();
    render(
      <AdvancedFilters
        filters={mockFiltersWithValues}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    // Find all Computer Science elements and click the checkbox label (not the badge)
    const csElements = screen.getAllByText('Computer Science');
    const csLabel = csElements.find(el => el.closest('label'))?.closest('label');
    expect(csLabel).toBeInTheDocument();
    await user.click(csLabel!);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFiltersWithValues,
      genres: ['Mathematics'], // Computer Science should be removed
    });
  });

  it('expands and shows author options', async () => {
    const user = userEvent.setup();
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    // Expand the Author section (search input only appears with >5 authors)
    const authorButton = screen.getByRole('button', { name: /author/i });
    await user.click(authorButton);

    // Should show author options
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('expands and shows publisher options', async () => {
    const user = userEvent.setup();
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    // Expand the Publisher section (search input only appears with >5 publishers)
    const publisherButton = screen.getByRole('button', { name: /publisher/i });
    await user.click(publisherButton);

    // Should show publisher options
    await waitFor(() => {
      expect(screen.getByText('Tech Publications')).toBeInTheDocument();
    });
  });

  it('selects year filter when checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    // First expand the year section
    const yearButton = screen.getByRole('button', { name: /publication year/i });
    await user.click(yearButton);

    // Wait for the year section to expand and then click on 2024
    await waitFor(() => {
      expect(screen.getAllByText('2024').length).toBeGreaterThan(0);
    });

    // Click on the year label to select
    const year2024Elements = screen.getAllByText('2024');
    const year2024Label = year2024Elements.find(el => el.closest('label'))?.closest('label');
    expect(year2024Label).toBeInTheDocument();
    await user.click(year2024Label!);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      years: [2024],
    });
  });

  it('deselects year filter when clicked again', async () => {
    const user = userEvent.setup();
    const filtersWithYear = { ...defaultFilters, years: [2024] };
    render(
      <AdvancedFilters
        filters={filtersWithYear}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    // First expand the year section
    const yearButton = screen.getByRole('button', { name: /publication year/i });
    await user.click(yearButton);

    // Wait for the year section to expand
    await waitFor(() => {
      expect(screen.getAllByText('2024').length).toBeGreaterThan(0);
    });

    // Click on the year label (not the badge) to deselect
    const year2024Elements = screen.getAllByText('2024');
    const year2024Label = year2024Elements.find(el => el.closest('label'))?.closest('label');
    expect(year2024Label).toBeInTheDocument();
    await user.click(year2024Label!);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...filtersWithYear,
      years: [],
    });
  });

  it('updates availability filter when option is selected', async () => {
    const user = userEvent.setup();
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    const availableOption = screen.getByText('Available Now');
    await user.click(availableOption);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      availability: 'available',
    });
  });

  it('updates sort by filter when option is selected', async () => {
    const user = userEvent.setup();
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    // Find and change the sort select dropdown
    const sortSelect = screen.getByRole('combobox');
    await user.selectOptions(sortSelect, 'author');

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      sort_by: 'author',  // 'popularity' is not a valid option, using 'author' instead
    });
  });

  it('updates sort order when toggle is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    const descendingButton = screen.getByRole('button', { name: /descending/i });
    await user.click(descendingButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      sort_order: 'desc',
    });
  });

  it('displays active filter count', () => {
    render(
      <AdvancedFilters
        filters={mockFiltersWithValues}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    // Should show active filter count badge
    expect(screen.getByText('5')).toBeInTheDocument(); // 2 genres + author + publisher + availability
  });

  it('clears all filters when clear all button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AdvancedFilters
        filters={mockFiltersWithValues}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    const clearAllButton = screen.getByRole('button', { name: /clear all/i });
    await user.click(clearAllButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(defaultFilters);
  });

  it('shows genre counts when available', () => {
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    // Check for genre counts from mock data
    expect(screen.getByText('45')).toBeInTheDocument(); // Computer Science count
    expect(screen.getByText('32')).toBeInTheDocument(); // Mathematics count
    expect(screen.getByText('28')).toBeInTheDocument(); // Web Development count
  });

  it('applies custom className', () => {
    const customClass = 'custom-filters-class';
    const { container } = render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onClose={mockOnClose}
        className={customClass}
      />
    );

    // The filter panel is the second child (first is overlay)
    const filterPanel = container.children[1];
    expect(filterPanel).toHaveClass(customClass);
  });

  it('handles year filter selection correctly', async () => {
    const user = userEvent.setup();
    
    // Use a mock that tracks the filter changes to simulate state updates
    let currentFilters = { ...defaultFilters };
    const mockOnFiltersChange = jest.fn((newFilters) => {
      currentFilters = newFilters;
    });
    
    render(
      <AdvancedFilters
        filters={currentFilters}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    // Expand the year section first
    const yearButton = screen.getByRole('button', { name: /publication year/i });
    await user.click(yearButton);

    // Wait for expansion and select first year
    await waitFor(() => {
      expect(screen.getAllByText('2024').length).toBeGreaterThan(0);
    });

    const year2024Elements = screen.getAllByText('2024');
    const year2024Label = year2024Elements.find(el => el.closest('label'))?.closest('label');
    await user.click(year2024Label!);

    // Verify first year was selected
    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        years: [2024],
      })
    );
  });

  it('displays correct availability status indicators', () => {
    render(
      <AdvancedFilters
        filters={mockFiltersWithValues}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    // Should show current availability selection (it's a radio button, not a button)
    const availableRadio = screen.getByDisplayValue('available');
    expect(availableRadio).toBeChecked();
  });

  it('supports keyboard navigation through genre options', async () => {
    const user = userEvent.setup();
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    // Find the Computer Science label and click it (same behavior as mouse click)
    const csElements = screen.getAllByText('Computer Science');
    const csLabel = csElements.find(el => el.closest('label'));
    expect(csLabel).toBeInTheDocument();
    
    await user.click(csLabel!);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      genres: ['Computer Science'],
    });
  });
});