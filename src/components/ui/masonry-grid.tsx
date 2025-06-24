import React, { useRef, useEffect, useState } from 'react';

interface MasonryGridProps {
  children: React.ReactNode[];
  columns?: {
    default: number;
    md: number;
    lg: number;
  };
  gap?: number;
  className?: string;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({
  children,
  columns = { default: 2, md: 3, lg: 4 },
  gap = 16,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentColumns, setCurrentColumns] = useState(columns.default);

  // Responsive column detection
  useEffect(() => {
    const updateColumns = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        if (width >= 1024) {
          setCurrentColumns(columns.lg);
        } else if (width >= 768) {
          setCurrentColumns(columns.md);
        } else {
          setCurrentColumns(columns.default);
        }
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [columns]);

  // Distribute children across columns
  const distributeItems = () => {
    const columnArrays: React.ReactNode[][] = Array.from({ length: currentColumns }, () => []);
    
    children.forEach((child, index) => {
      const columnIndex = index % currentColumns;
      columnArrays[columnIndex].push(child);
    });
    
    return columnArrays;
  };

  const columnArrays = distributeItems();

  return (
    <div 
      ref={containerRef}
      className={`grid gap-${Math.floor(gap / 4)} ${className}`}
      style={{
        gridTemplateColumns: `repeat(${currentColumns}, minmax(0, 1fr))`,
        gap: `${gap}px`
      }}
    >
      {columnArrays.map((column, columnIndex) => (
        <div key={columnIndex} className="flex flex-col" style={{ gap: `${gap}px` }}>
          {column.map((child, itemIndex) => (
            <div key={`${columnIndex}-${itemIndex}`}>
              {child}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MasonryGrid;