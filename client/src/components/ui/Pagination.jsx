import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 10,
  totalItems,
}) => {
  const pages = [];
  const maxPagesToShow = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-card-background dark:bg-card-background-dark border-t border-base-dark dark:border-base">
      {/* Page info */}
      <div className="text-sm text-base dark:text-base-dark">
        Showing <span className="font-num font-medium text-text-primary dark:text-text-primary-dark">{startItem}</span> to{" "}
        <span className="font-num font-medium text-text-primary dark:text-text-primary-dark">{endItem}</span> of{" "}
        <span className="font-num font-medium text-text-primary dark:text-text-primary-dark">{totalItems}</span> items
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-base-dark dark:border-base hover:bg-base-dark/10 dark:hover:bg-base/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-1.5 rounded-lg border border-base-dark dark:border-base hover:bg-base-dark/10 dark:hover:bg-base/10 transition-colors"
            >
              <span className="font-num">1</span>
            </button>
            {startPage > 2 && (
              <span className="text-base dark:text-base-dark">...</span>
            )}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1.5 rounded-lg border transition-colors ${
              currentPage === page
                ? "bg-secondary text-white border-secondary"
                : "border-base-dark dark:border-base hover:bg-base-dark/10 dark:hover:bg-base/10"
            }`}
          >
            <span className="font-num">{page}</span>
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="text-base dark:text-base-dark">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-1.5 rounded-lg border border-base-dark dark:border-base hover:bg-base-dark/10 dark:hover:bg-base/10 transition-colors"
            >
              <span className="font-num">{totalPages}</span>
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-base-dark dark:border-base hover:bg-base-dark/10 dark:hover:bg-base/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
