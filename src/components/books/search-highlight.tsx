'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface SearchHighlightProps {
  text: string;
  searchQuery: string;
  className?: string;
  highlightClassName?: string;
}

export function SearchHighlight({ 
  text, 
  searchQuery, 
  className = '', 
  highlightClassName = 'bg-yellow-200/80 dark:bg-yellow-800/50 text-yellow-900 dark:text-yellow-100 px-1 rounded-sm font-medium'
}: SearchHighlightProps): React.JSX.Element {
  const highlightedText = useMemo(() => {
    if (!searchQuery || !text) return text;
    
    // Clean the search query and create search terms
    const query = searchQuery.trim();
    if (!query) return text;
    
    const searchTerms = query
      .toLowerCase()
      .split(' ')
      .filter(term => term.length > 0)
      .sort((a, b) => b.length - a.length); // Sort by length desc to avoid partial matches
    
    if (searchTerms.length === 0) return text;
    
    // Create a regex pattern that matches any of the search terms
    const pattern = searchTerms
      .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');
    
    const regex = new RegExp(`(${pattern})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      const isMatch = searchTerms.some(term => 
        part.toLowerCase() === term.toLowerCase()
      );
      
      if (isMatch) {
        return (
          <motion.mark
            key={index}
            initial={{ backgroundColor: 'transparent' }}
            animate={{ 
              backgroundColor: ['transparent', 'rgb(254 240 138 / 0.8)', 'transparent'],
            }}
            transition={{ 
              duration: 1.5,
              ease: 'easeInOut',
              delay: index * 0.1
            }}
            className={highlightClassName}
          >
            {part}
          </motion.mark>
        );
      }
      
      return part;
    });
  }, [text, searchQuery, highlightClassName]);

  return (
    <span className={className}>
      {highlightedText}
    </span>
  );
}

interface SmartHighlightProps extends SearchHighlightProps {
  maxLength?: number;
  contextRadius?: number;
}

export function SmartHighlight({ 
  text, 
  searchQuery, 
  className = '', 
  highlightClassName,
  maxLength = 200,
  contextRadius = 50 
}: SmartHighlightProps): React.JSX.Element {
  const { displayText, hasMore } = useMemo(() => {
    if (!text) {
      return { displayText: text, hasMore: false };
    }
    
    // If no search query but text exceeds maxLength, truncate it
    if (!searchQuery || searchQuery.trim() === '') {
      if (text.length <= maxLength) {
        return { displayText: text, hasMore: false };
      }
      return { 
        displayText: text.slice(0, maxLength) + '...', 
        hasMore: false // We're including the ellipsis in displayText
      };
    }
    
    // If text is short enough regardless of search, return full text
    if (text.length <= maxLength) {
      return { displayText: text, hasMore: false };
    }
    
    const query = searchQuery.toLowerCase().trim();
    const textLower = text.toLowerCase();
    
    // Find the first occurrence of any search term
    const searchTerms = query.split(' ').filter(term => term.length > 0);
    let firstMatchIndex = -1;
    
    for (const term of searchTerms) {
      const index = textLower.indexOf(term);
      if (index !== -1) {
        if (firstMatchIndex === -1 || index < firstMatchIndex) {
          firstMatchIndex = index;
        }
      }
    }
    
    if (firstMatchIndex === -1) {
      // No matches found, return truncated text from beginning
      if (text.length <= maxLength) {
        return { displayText: text, hasMore: false };
      }
      return { 
        displayText: text.slice(0, maxLength) + '...', 
        hasMore: false  // We're including the ellipsis in displayText
      };
    }
    
    // Calculate the context window around the first match
    const start = Math.max(0, firstMatchIndex - contextRadius);
    const end = Math.min(text.length, firstMatchIndex + contextRadius + query.length);
    
    let contextText = text.slice(start, end);
    
    // Add ellipsis if we're not at the beginning/end
    if (start > 0) contextText = '...' + contextText;
    if (end < text.length) contextText = contextText + '...';
    
    return { 
      displayText: contextText, 
      hasMore: end < text.length || start > 0 
    };
  }, [text, searchQuery, maxLength, contextRadius]);

  return (
    <div className={className}>
      <SearchHighlight 
        text={displayText} 
        searchQuery={searchQuery}
        {...(highlightClassName && { highlightClassName })}
      />
      {hasMore && (
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-sm ml-2"
        >
          ...
        </motion.span>
      )}
    </div>
  );
}