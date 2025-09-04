'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calendar, Users, MapPin, Eye, Edit, Trash2, Heart, Share2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookWithStats } from '@/lib/types';
import { cn } from '@/lib/utils';

interface BookCardProps {
  book: BookWithStats;
  view: 'grid' | 'list';
  density: 'comfortable' | 'compact' | 'spacious';
  showCovers?: boolean;
  onView?: (book: BookWithStats) => void;
  onEdit?: (book: BookWithStats) => void;
  onDelete?: (book: BookWithStats) => void;
  onFavorite?: (book: BookWithStats) => void;
  onShare?: (book: BookWithStats) => void;
  className?: string;
}

export function BookCard({
  book,
  view = 'grid',
  density = 'comfortable',
  showCovers = true,
  onView,
  onEdit,
  onDelete,
  onFavorite,
  onShare,
  className,
}: BookCardProps): React.JSX.Element {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isAvailable = book.available_copies > 0;
  const popularityBadge = book.popularity_rank && book.popularity_rank <= 10;

  const cardVariants = {
    initial: { scale: 1, y: 0, boxShadow: 'var(--shadow-sm)' },
    hover: { 
      scale: 1.02, 
      y: -4, 
      boxShadow: 'var(--shadow-lg)'
    },
  };

  const overlayVariants = {
    initial: { opacity: 0 },
    hover: { 
      opacity: 1,
      transition: { duration: 0.2 }
    },
  };

  if (view === 'list') {
    return (
      <motion.div
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          'group relative overflow-hidden rounded-xl border border-border/20 bg-card',
          'transition-all duration-200 ease-out-expo hover:border-border/40',
          className
        )}
      >
        <div className={cn(
          'flex items-center gap-3 p-3',
          density === 'compact' && 'p-2 gap-2',
          density === 'spacious' && 'p-4 gap-4'
        )}>
          {/* Book Cover */}
          {showCovers && (
            <div className="flex-shrink-0">
              <div className={cn(
                'relative overflow-hidden rounded-lg bg-muted',
                density === 'compact' ? 'h-12 w-9' : 'h-16 w-12',
                density === 'spacious' && 'h-20 w-15'
              )}>
                {book.cover_image_url && !imageError ? (
                  <Image
                    src={book.cover_image_url}
                    alt={`Cover of ${book.title}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    className={cn(
                      'object-cover transition-opacity duration-200',
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    )}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Book Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className={cn(
                'font-semibold text-foreground line-clamp-1',
                density === 'compact' ? 'text-sm' : 'text-sm',
                density === 'spacious' && 'text-base'
              )}>
                {book.title}
              </h3>
              <div className="flex gap-1 flex-shrink-0">
                {popularityBadge && (
                  <Badge variant="secondary" className="text-xs">
                    Popular
                  </Badge>
                )}
                <Badge 
                  variant={isAvailable ? 'success' : 'destructive'}
                  className="text-xs"
                >
                  {isAvailable ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
            </div>
            
            <p className={cn(
              "text-muted-foreground line-clamp-1 mb-1",
              density === 'compact' ? 'text-xs' : 'text-xs'
            )}>
              by {book.author}
            </p>
            
            <div className={cn(
              "flex items-center gap-3 text-muted-foreground flex-wrap",
              density === 'compact' ? 'text-xs gap-2' : 'text-xs'
            )}>
              {book.genre && (
                <span className="flex items-center gap-1 flex-shrink-0">
                  <BookOpen className="h-3 w-3" />
                  {book.genre}
                </span>
              )}
              {book.published_year && (
                <span className="flex items-center gap-1 flex-shrink-0">
                  <Calendar className="h-3 w-3" />
                  {book.published_year}
                </span>
              )}
              <span className="flex items-center gap-1 flex-shrink-0">
                <Users className="h-3 w-3" />
                {book.available_copies}/{book.total_copies}
              </span>
              {book.shelf_location && density !== 'compact' && (
                <span className="flex items-center gap-1 flex-shrink-0">
                  <MapPin className="h-3 w-3" />
                  {book.shelf_location}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                variants={overlayVariants}
                initial="initial"
                animate="hover"
                exit="initial"
                className="flex gap-1"
              >
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView?.(book);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(book);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare?.(book);
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(book);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-xl border border-border/20',
        'bg-card backdrop-blur-sm transition-all duration-200 ease-out-expo hover:border-border/40',
        className
      )}
      onClick={() => onView?.(book)}
    >
      {/* Cover Image */}
      {showCovers && (
        <div className={cn(
          'relative overflow-hidden bg-muted',
          density === 'compact' ? 'aspect-[3/4]' : 'aspect-[2/3]',
          density === 'spacious' && 'aspect-[3/4]'
        )}>
          {book.cover_image_url && !imageError ? (
            <Image
              src={book.cover_image_url}
              alt={`Cover of ${book.title}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={book.popularity_rank === 1}
              className={cn(
                'object-cover transition-all duration-300',
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          
          {/* Overlay with Actions */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                variants={overlayVariants}
                initial="initial"
                animate="hover"
                exit="initial"
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onView?.(book);
                      }}
                      className="rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                    >
                      <Eye className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(book);
                      }}
                      className="rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                    >
                      <Edit className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onFavorite?.(book);
                      }}
                      className="rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                    >
                      <Heart className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {popularityBadge && (
              <Badge variant="secondary" className="text-xs">
                Popular
              </Badge>
            )}
          </div>
          
          <div className="absolute top-2 right-2">
            <Badge 
              variant={isAvailable ? 'success' : 'destructive'}
              className="text-xs"
            >
              {isAvailable ? 'Available' : 'Unavailable'}
            </Badge>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={cn(
        'p-3 space-y-1.5',
        density === 'compact' && 'p-2 space-y-1',
        density === 'spacious' && 'p-4 space-y-2'
      )}>
        <div className="space-y-0.5">
          <h3 className={cn(
            'font-semibold text-foreground line-clamp-1',
            density === 'compact' ? 'text-sm' : 'text-sm',
            density === 'spacious' && 'text-base'
          )}>
            {book.title}
          </h3>
          <p className={cn(
            "text-muted-foreground line-clamp-1",
            density === 'compact' ? 'text-xs' : 'text-xs'
          )}>
            by {book.author}
          </p>
        </div>

        {density === 'spacious' && book.description && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {book.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 truncate">
            {book.genre && (
              <span className="flex items-center gap-1 truncate">
                <BookOpen className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{book.genre}</span>
              </span>
            )}
            {book.published_year && density !== 'compact' && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {book.published_year}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 flex-shrink-0">
            <Users className="h-3 w-3" />
            {book.available_copies}/{book.total_copies}
          </span>
        </div>

        {density === 'spacious' && book.shelf_location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            Location: {book.shelf_location}
          </div>
        )}
      </div>
    </motion.div>
  );
}