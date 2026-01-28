import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DataTable = ({ 
  columns, 
  data, 
  onRowClick, 
  itemsPerPage = 10,
  emptyMessage = "No data available"
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPaginationRange = () => {
    const range = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) range.push(i);
        range.push('...');
        range.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        range.push(1);
        range.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) range.push(i);
      } else {
        range.push(1);
        range.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) range.push(i);
        range.push('...');
        range.push(totalPages);
      }
    }
    
    return range;
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base">
        <p className="text-base dark:text-base-dark">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-base-dark dark:border-base">
        <table className="w-full">
          <thead className="bg-card-background dark:bg-card-background-dark border-b border-base-dark dark:border-base">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-4 text-left text-sm font-semibold text-text-primary dark:text-text-primary-dark ${column.headerClassName || ''}`}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-primary dark:bg-primary-dark divide-y divide-base-dark dark:divide-base">
            {currentData.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(item)}
                className={`transition-colors ${
                  onRowClick 
                    ? 'cursor-pointer hover:bg-card-background dark:hover:bg-card-background-dark' 
                    : 'hover:bg-card-background dark:hover:bg-card-background-dark'
                }`}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-6 py-4 ${column.cellClassName || ''}`}
                  >
                    {column.render ? column.render(item) : item[column.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base px-6 py-4">
          {/* Page Info */}
          <div className="text-sm text-base dark:text-base-dark">
            Showing <span className="font-medium text-text-primary dark:text-text-primary-dark">{startIndex + 1}</span> to{' '}
            <span className="font-medium text-text-primary dark:text-text-primary-dark">{Math.min(endIndex, data.length)}</span> of{' '}
            <span className="font-medium text-text-primary dark:text-text-primary-dark">{data.length}</span> results
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-base-dark dark:border-base text-text-primary dark:text-text-primary-dark hover:bg-primary dark:hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {getPaginationRange().map((page, index) => (
                page === '...' ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-3 py-2 text-base dark:text-base-dark"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`min-w-10 px-3 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-secondary dark:bg-accent text-white dark:text-black'
                        : 'border border-base-dark dark:border-base text-text-primary dark:text-text-primary-dark hover:bg-primary dark:hover:bg-primary-dark'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-base-dark dark:border-base text-text-primary dark:text-text-primary-dark hover:bg-primary dark:hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
