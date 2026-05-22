import { useState } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/helpers/utils";

const Pagination = ({
  totalPage = 1,
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  className,
}) => {
  const [inputPage, setInputPage] = useState(currentPage.toString());
  const [prevCurrentPage, setPrevCurrentPage] = useState(currentPage);

  if (currentPage !== prevCurrentPage) {
    setPrevCurrentPage(currentPage);
    setInputPage(currentPage.toString());
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPage && page !== currentPage) {
      onPageChange?.(page);
    }
  };

  const handleInputChange = (e) => {
    // Only allow numbers
    const value = e.target.value.replace(/\D/g, "");
    setInputPage(value);
  };

  const handleInputSubmit = (e) => {
    if (e.key === "Enter" || e.type === "blur") {
      let page = parseInt(inputPage, 10);
      if (isNaN(page) || page < 1) page = 1;
      if (page > totalPage) page = totalPage;

      setInputPage(page.toString());
      if (page !== currentPage) {
        onPageChange?.(page);
      }
    }
  };

  const renderPaginationItems = () => {
    const pages = [];

    if (totalPage <= 7) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPage; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Calculate range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPage - 1, currentPage + 1);

      // Adjust if close to beginning or end
      if (currentPage <= 3) {
        end = 4;
      }
      if (currentPage >= totalPage - 2) {
        start = totalPage - 3;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPage - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPage);
    }

    return pages.map((page, index) => {
      if (page === "...") {
        return (
          <span
            key={`ellipsis-${index}`}
            className="flex items-center justify-center w-6 h-6 text-slate-400"
          >
            <MoreHorizontal className="w-4 h-4" />
          </span>
        );
      }

      return (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={cn(
            "flex items-center justify-center w-6 h-6 rounded-xl text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500",
            currentPage === page
              ? "bg-blue-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          )}
        >
          {page}
        </button>
      );
    });
  };

  if (totalPage <= 1)
    return (
      <div className="text-xs text-slate-500 font-medium pl-2">
        Showing{" "}
        {totalItems > 0 ? (currentPage - 1) * (pageSize || 10) + 1 : 0} to{" "}
        {Math.min(currentPage * (pageSize || 10), totalItems || 0)} of{" "}
        {totalItems || 0} entries.
      </div>
    );

  return (
    <div
      className={cn(
        "flex items-center justify-between w-full px-5 py-2 bg-white border border-slate-200 rounded-2xl",
        className
      )}
    >
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>
          Page {currentPage} of {totalPage}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-6 h-6 rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {renderPaginationItems()}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPage}
          className="flex items-center justify-center w-6 h-6 rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-500">Go to</span>
        <input
          type="text"
          value={inputPage}
          onChange={handleInputChange}
          onKeyDown={handleInputSubmit}
          onBlur={handleInputSubmit}
          aria-label="Go to page"
          className="w-12 h-6 px-2 text-center rounded-lg bg-slate-100 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
        />
      </div>
    </div>
  );
};

export default Pagination;
