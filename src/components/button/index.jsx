import { cn } from "@/helpers/utils";
import { BUTTON_TYPE, ALIGN } from "@/helpers/constants";

const Button = ({
  children,
  className,
  variant = BUTTON_TYPE.PRIMARY,
  icon: Icon,
  iconPosition = ALIGN.LEFT,
  type = "button",
  disabled,
  isLoading,
  isSplitStyle,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-xl text-xs h-6 font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none w-fit";

  const variants = {
    [BUTTON_TYPE.PRIMARY]:
      "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500",
    [BUTTON_TYPE.SECONDARY]:
      "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500",
    [BUTTON_TYPE.OUTLINE]:
      "bg-transparent hover:bg-slate-100 focus:ring-slate-500 border border-slate-200",
    [BUTTON_TYPE.LINK]:
      "text-blue-600 underline-offset-4 hover:underline bg-transparent shadow-none p-0 h-auto font-normal",
    [BUTTON_TYPE.SUCCESS]:
      "bg-emerald-500 text-white font-bold hover:bg-emerald-600 focus:ring-emerald-500",
    [BUTTON_TYPE.ERROR]:
      "bg-red-500 text-white font-bold hover:bg-red-600 focus:ring-red-500",
    [BUTTON_TYPE.WARNING]:
      "bg-amber-400 text-white font-bold hover:bg-amber-500 focus:ring-amber-500",
  };

  return (
    <button
      type={type}
      className={cn(
        baseStyles,
        variants[variant],
        isSplitStyle ? "p-0 overflow-hidden" : "px-3",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className={cn("h-3.5 w-3.5 animate-spin", children ? "mr-2" : "")}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!isLoading && Icon && iconPosition === ALIGN.LEFT && (
        <div
          className={cn(
            "flex items-center justify-center",
            // Apply split styling if active
            isSplitStyle ? "h-full px-2.5 bg-black/5" : "",
            children && !isSplitStyle ? "mr-2" : ""
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      )}
      
      {children && (
        <span className={cn(isSplitStyle ? "px-3" : "")}>
            {children}
        </span>
      )}

      {!isLoading && Icon && iconPosition === ALIGN.RIGHT && (
        <div
          className={cn(
            "flex items-center justify-center",
             // Apply split styling if active
             isSplitStyle ? "h-full px-2.5 bg-black/10" : "",
            children && !isSplitStyle ? "ml-2" : ""
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      )}
    </button>
  );
};

export default Button;
