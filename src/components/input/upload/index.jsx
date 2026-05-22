import { cn } from "@/helpers/utils";
import { UploadCloud } from "lucide-react";
import useFormHook from "@/hooks/useFormHook";

const UploadInput = ({
  name,
  className,
  required,
  disabled,
  accept,
  multiple,
  rules = {},
  ...props
}) => {
  const { register, formState: { errors } } = useFormHook();
  const hasError = !!errors[name];

  return (
    <div className="relative w-full h-6">
      <input
        id={name}
        type="file"
        aria-label="Upload file"
        className={cn(
          "flex h-6 w-full rounded-lg bg-gray-100 pl-2 pr-8 py-0.5 text-xs text-gray-600 transition-colors",
          "file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-blue-600 file:mr-4 hover:file:text-blue-700",
          "focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
          hasError && "ring-1 ring-red-500 focus:ring-red-500",
          className
        )}
        disabled={disabled}
        accept={accept}
        multiple={multiple}
        {...register(name, { required, ...rules })}
        {...props}
      />
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        <UploadCloud className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
};

export default UploadInput;
