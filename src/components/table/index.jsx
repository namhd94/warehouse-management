import { cn } from "@/helpers/utils";
import { ALIGN } from "@/helpers/constants";

const Table = ({
  className,
  isLoading,
  data = [],
  columns = [],
  title,
  action,
  onRowClick,
}) => {
  const alignClasses = {
    [ALIGN.LEFT]: "text-left",
    [ALIGN.CENTER]: "text-center",
    [ALIGN.RIGHT]: "text-right",
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "w-full bg-white rounded-2xl border border-slate-200 overflow-hidden",
          className,
        )}
      >
        {(title || action) && (
          <div className="flex justify-between items-center px-5 py-3 bg-slate-100 border-b border-slate-100">
            {title && <h3 className="font-bold text-base text-gray-800">{title}</h3>}
            {action && <div>{action}</div>}
          </div>
        )}
        <div className="p-8 flex flex-col items-center justify-center space-y-4 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden",
        className,
      )}
    >
      {(title || action) && (
        <div className="flex justify-between items-center px-5 py-3 bg-slate-100 border-b border-slate-100">
          {title && <h3 className="font-bold text-base text-gray-800">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-200">
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={cn(
                    "px-5 py-3 font-medium text-slate-600 whitespace-nowrap",
                    alignClasses[col.align || ALIGN.LEFT],
                    col.className,
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn(
                    "hover:bg-slate-50 transition-colors",
                    onRowClick && "cursor-pointer",
                  )}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={`${rowIndex}-${colIndex}`}
                      className={cn(
                        "px-5 py-3 text-slate-700 whitespace-nowrap font-medium",
                        alignClasses[col.align || ALIGN.LEFT],
                        col.className,
                      )}
                    >
                      {col.render ? col.render(row) : row[col.id]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-12 text-center text-slate-500"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
