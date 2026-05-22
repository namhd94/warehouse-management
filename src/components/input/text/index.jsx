import { cn } from "@/helpers/utils";
import useFormHook from "@/hooks/useFormHook";
import { X } from "lucide-react";

const TextInput = ({
  name,
  placeholder,
  className,
  required,
  disabled,
  readOnly,
  type = "text",
  rules = {},
  icon: Icon,
  allowClear = true,
  onClear,
  ...props
}) => {
  const { register, formState: { errors }, watch, setValue } = useFormHook();
  const value = watch(name);
  
  const hasError = !!errors?.[name];

  const handleClear = (e) => {
    e.stopPropagation();
    setValue(name, "");
    onClear?.();
  };

  return (
    <div
      className={cn(
        "flex h-6 w-full items-center rounded-lg bg-slate-100 transition-colors relative",
        "focus-within:ring-1 focus-within:ring-blue-500",
        hasError && "ring-1 ring-red-500 focus-within:ring-red-500",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {Icon && (
        <div className="bg-slate-100 rounded-l-lg flex h-full items-center justify-center px-2.5 text-gray-500">
          <Icon className="h-3 w-3" />
        </div>
      )}
      <input
        id={name}
        type={type}
        className={cn(
          "flex-1 h-full w-full bg-slate-100 pl-2 pr-6 py-0.5 text-xs placeholder:text-gray-400 focus:outline-none",
          allowClear && "pr-8",
          disabled && "cursor-not-allowed",
          Icon ? "rounded-r-lg pl-0" : "rounded-lg"
        )}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        {...register(name, { required, ...rules })}
        {...props}
      />
      {allowClear && value && !disabled && !readOnly && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default TextInput;
