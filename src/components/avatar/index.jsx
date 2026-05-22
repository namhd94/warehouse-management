import { cn } from "@/helpers/utils";

const Avatar = ({
  src,
  alt,
  fallback,
  className,
  color,
  size = "sm", // sm, md, lg
  name,
  ...props
}) => {
  const sizeClasses = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold overflow-hidden",
          sizeClasses[size] || sizeClasses.md,
          color || "bg-gray-200 text-gray-500", // Default color if none provided
          className
        )}
        {...props}
      >
        {src ? (
          <img src={src} alt={alt} className="w-6 h-full object-cover" />
        ) : (
          <span className="text-white">{fallback}</span>
        )}
      </div>
      <span className="font-semibold text-gray-700">{name}</span>
    </div>
  );
};

export default Avatar;
