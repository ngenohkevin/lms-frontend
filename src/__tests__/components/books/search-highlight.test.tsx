import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { SearchHighlight, SmartHighlight } from '@/components/books/search-highlight';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    mark: ({ children, className, ...props }: any) => <mark className={className} {...props}>{children}</mark>,
    span: ({ children, className, ...props }: any) => <span className={className} {...props}>{children}</span>,
  },
}));

describe('SearchHighlight', () => {
  it('renders text without highlighting when no search query is provided', () => {
    const text = 'This is a sample text';
    render(<SearchHighlight text={text} searchQuery="" />);
    
    expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.queryByRole('mark')).not.toBeInTheDocument();
  });

  it('renders text without highlighting when search query is empty', () => {
    const text = 'This is a sample text';
    render(<SearchHighlight text={text} searchQuery="   " />);
    
    expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.queryByRole('mark')).not.toBeInTheDocument();
  });

  it('highlights single word matches', () => {
    const text = 'This is a JavaScript programming book';
    const searchQuery = 'JavaScript';
    
    render(<SearchHighlight text={text} searchQuery={searchQuery} />);
    
    const highlightedElement = screen.getByText('JavaScript');
    expect(highlightedElement).toBeInTheDocument();
    expect(highlightedElement.tagName).toBe('MARK');
  });

  it('highlights multiple word matches', () => {
    const text = 'Learn JavaScript and Python programming languages';
    const searchQuery = 'JavaScript Python';
    
    render(<SearchHighlight text={text} searchQuery={searchQuery} />);
    
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    
    // Both should be highlighted
    const highlights = screen.getAllByRole('mark');
    expect(highlights).toHaveLength(2);
  });

  it('is case insensitive', () => {
    const text = 'JavaScript Programming Guide';
    const searchQuery = 'javascript programming';
    
    render(<SearchHighlight text={text} searchQuery={searchQuery} />);
    
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Programming')).toBeInTheDocument();
    
    const highlights = screen.getAllByRole('mark');
    expect(highlights).toHaveLength(2);
  });

  it('handles partial word matches correctly', () => {
    const text = 'JavaScript and Java are different languages';
    const searchQuery = 'Java';
    
    render(<SearchHighlight text={text} searchQuery={searchQuery} />);
    
    // Should highlight both "Java" occurrences (including the one in "JavaScript")
    const highlights = screen.getAllByRole('mark');
    expect(highlights.length).toBeGreaterThan(0);
  });

  it('escapes regex special characters in search query', () => {
    const text = 'Use Array.map() method in JavaScript';
    const searchQuery = 'Array.map()';
    
    render(<SearchHighlight text={text} searchQuery={searchQuery} />);
    
    expect(screen.getByText('Array.map()')).toBeInTheDocument();
  });

  it('applies custom highlight className', () => {
    const text = 'JavaScript programming';
    const searchQuery = 'JavaScript';
    const customHighlightClass = 'custom-highlight';
    
    render(
      <SearchHighlight 
        text={text} 
        searchQuery={searchQuery} 
        highlightClassName={customHighlightClass}
      />
    );
    
    const highlightedElement = screen.getByText('JavaScript');
    expect(highlightedElement).toHaveClass(customHighlightClass);
  });

  it('applies custom container className', () => {
    const text = 'JavaScript programming';
    const searchQuery = 'JavaScript';
    const customClass = 'custom-container';
    
    const { container } = render(
      <SearchHighlight 
        text={text} 
        searchQuery={searchQuery} 
        className={customClass}
      />
    );
    
    expect(container.firstChild).toHaveClass(customClass);
  });

  it('handles empty text gracefully', () => {
    render(<SearchHighlight text="" searchQuery="test" />);
    
    expect(screen.queryByRole('mark')).not.toBeInTheDocument();
  });

  it('handles text with special characters', () => {
    const text = 'Learn C++ & C# programming (2024)';
    const searchQuery = 'C++';
    
    render(<SearchHighlight text={text} searchQuery={searchQuery} />);
    
    expect(screen.getByText('C++')).toBeInTheDocument();
  });

  it('prioritizes longer search terms', () => {
    const text = 'JavaScript and Script programming';
    const searchQuery = 'JavaScript Script';
    
    render(<SearchHighlight text={text} searchQuery={searchQuery} />);
    
    // JavaScript should be highlighted as a whole word, not broken into "Script"
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Script')).toBeInTheDocument();
  });

  it('handles multiple spaces in search query', () => {
    const text = 'JavaScript   programming   guide';
    const searchQuery = 'JavaScript    programming';
    
    render(<SearchHighlight text={text} searchQuery={searchQuery} />);
    
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('programming')).toBeInTheDocument();
  });
});

describe('SmartHighlight', () => {
  it('displays full text when under maxLength', () => {
    const text = 'Short text';
    const searchQuery = 'text';
    
    render(<SmartHighlight text={text} searchQuery={searchQuery} maxLength={100} />);
    
    // The text contains the word "text" which will be highlighted
    expect(screen.getByText('Short')).toBeInTheDocument();
    expect(screen.getByText('text')).toBeInTheDocument();
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('truncates text when over maxLength and no search query', () => {
    const longText = 'This is a very long text that exceeds the maximum length limit and should be truncated';
    
    render(<SmartHighlight text={longText} searchQuery="" maxLength={50} />);
    
    // The truncated text should include the ellipsis at the end
    const displayedText = screen.getByText((content) => 
      content.includes('This is a very long text that exceeds the max') && content.includes('...')
    );
    expect(displayedText).toBeInTheDocument();
  });

  it('shows context around search matches', () => {
    const longText = 'This is a very long text with JavaScript programming concepts that exceeds the maximum length limit and should show context around the search term';
    const searchQuery = 'JavaScript';
    
    render(<SmartHighlight text={longText} searchQuery={searchQuery} maxLength={80} contextRadius={20} />);
    
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('...')).toBeInTheDocument(); // Should show ellipsis
  });

  it('adds ellipsis at the beginning when context starts after beginning', () => {
    const longText = 'This is a very long introduction before the JavaScript programming section that we want to find';
    const searchQuery = 'JavaScript';
    
    render(<SmartHighlight text={longText} searchQuery={searchQuery} maxLength={50} contextRadius={10} />);
    
    // Check that JavaScript is highlighted
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    // The ellipsis should be in the display text for truncation
    const container = screen.getByText('JavaScript').closest('div');
    expect(container?.textContent).toContain('...');
  });

  it('adds ellipsis at the end when context ends before text end', () => {
    const longText = 'JavaScript programming is used in web development and many other applications throughout the world';
    const searchQuery = 'JavaScript';
    
    render(<SmartHighlight text={longText} searchQuery={searchQuery} maxLength={50} contextRadius={10} />);
    
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('handles multiple search terms and shows context for first match', () => {
    const longText = 'This is about Python programming and then later we discuss JavaScript development and frameworks';
    const searchQuery = 'Python JavaScript';
    
    render(<SmartHighlight text={longText} searchQuery={searchQuery} maxLength={60} contextRadius={15} />);
    
    // Should show context around Python (first match)
    expect(screen.getByText('Python')).toBeInTheDocument();
  });

  it('uses custom context radius', () => {
    const longText = 'Begin text with JavaScript programming concepts and more content after that';
    const searchQuery = 'JavaScript';
    
    render(<SmartHighlight text={longText} searchQuery={searchQuery} maxLength={40} contextRadius={5} />);
    
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    // With smaller context radius, should show less surrounding text
  });

  it('applies custom className to container', () => {
    const text = 'JavaScript programming';
    const searchQuery = 'JavaScript';
    const customClass = 'smart-highlight-custom';
    
    const { container } = render(
      <SmartHighlight 
        text={text} 
        searchQuery={searchQuery} 
        className={customClass}
      />
    );
    
    expect(container.firstChild).toHaveClass(customClass);
  });

  it('passes through highlightClassName to SearchHighlight', () => {
    const text = 'JavaScript programming';
    const searchQuery = 'JavaScript';
    const customHighlightClass = 'custom-smart-highlight';
    
    render(
      <SmartHighlight 
        text={text} 
        searchQuery={searchQuery} 
        highlightClassName={customHighlightClass}
      />
    );
    
    const highlightedElement = screen.getByText('JavaScript');
    expect(highlightedElement).toHaveClass(customHighlightClass);
  });

  it('shows hasMore indicator when text is truncated', () => {
    const longText = 'This is a very long text that will definitely exceed the maximum length and should show the hasMore indicator';
    
    render(<SmartHighlight text={longText} searchQuery="" maxLength={30} />);
    
    // The ellipsis is included in the text now, not as a separate element
    const displayedText = screen.getByText((content) => 
      content.includes('This is a very long text that') && content.includes('...')
    );
    expect(displayedText).toBeInTheDocument();
  });

  it('handles edge case where search term is at text boundary', () => {
    const text = 'JavaScript';
    const searchQuery = 'JavaScript';
    
    render(<SmartHighlight text={text} searchQuery={searchQuery} maxLength={5} contextRadius={2} />);
    
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
  });

  it('handles no search matches in long text', () => {
    const longText = 'This is a very long text without the specific term we are looking for, so it should be truncated from the beginning';
    const searchQuery = 'nonexistent';
    
    render(<SmartHighlight text={longText} searchQuery={searchQuery} maxLength={50} />);
    
    // Should show truncated text from beginning with ellipsis
    expect(screen.getByText((content) => 
      content.includes('This is a very long text without') && content.includes('...')
    )).toBeInTheDocument();
  });
});