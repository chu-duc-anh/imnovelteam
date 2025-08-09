

import React from 'react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers: number[] = [];
  const maxPagesToShow = 5;

  if (totalPages <= maxPagesToShow) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
        startPage = 1;
        endPage = maxPagesToShow;
    } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
  }

  const Button = ({ onClick, disabled, children, isActive = false }: { onClick: () => void, disabled?: boolean, children: React.ReactNode, isActive?: boolean}) => {
    const baseClasses = "w-11 h-11 flex items-center justify-center font-bold text-sm rounded-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 focus:ring-offset-primary-100 dark:focus:ring-offset-primary-950";
    
    let stateClasses = 'bg-primary-200/70 dark:bg-primary-800/70 text-primary-700 dark:text-primary-200 hover:bg-primary-300 dark:hover:bg-primary-700 shadow-sm hover:shadow-md transform hover:-translate-y-0.5';
    if (isActive) {
      stateClasses = "bg-secondary-500 text-white shadow-lg shadow-secondary-500/30 cursor-default pointer-events-none transform scale-110";
    } else if (disabled) {
      stateClasses = "bg-primary-100/50 dark:bg-primary-800/40 text-primary-400 dark:text-primary-600 cursor-not-allowed opacity-60";
    }

    return (
      <button onClick={onClick} disabled={disabled || isActive} className={`${baseClasses} ${stateClasses}`}>
        {children}
      </button>
    );
  };

  return (
    <div className="flex justify-center mt-10 sm:mt-12">
        <div className="bg-primary-100/95 dark:bg-primary-950/90 backdrop-blur-lg rounded-2xl shadow-xl border border-primary-200/50 dark:border-primary-800/50 p-2 inline-flex items-center justify-center space-x-2">
            <button onClick={() => onPageChange(1)} disabled={currentPage === 1}>{"«"}</button>
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>{"‹"}</button>
            
            {pageNumbers.map((page) => (
                <Button 
                    key={page}
                    onClick={() => onPageChange(page)}
                    isActive={currentPage === page}
                >
                    {page}
                </Button>
            ))}

            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>{"›"}</button>
            <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>{"»"}</button>
        </div>
    </div>
  );
};

export default PaginationControls;