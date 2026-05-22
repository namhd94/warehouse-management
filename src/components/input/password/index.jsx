import { useState } from 'react';
import { cn } from "@/helpers/utils";
import { Eye, EyeOff, X } from "lucide-react";
import useFormHook from "@/hooks/useFormHook";

const PasswordInput = ({ 
  name, 
  placeholder, 
  className, 
  required, 
  disabled, 
  readOnly,
  rules = {},
  icon: Icon,
  allowClear = false,
  onClear,
  ...props 
}) => {
  const { register, formState: { errors }, watch, setValue } = useFormHook();
  const value = watch(name);
  const [showPassword, setShowPassword] = useState(false);
  
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
        <div className="flex h-full bg-slate-100 rounded-l-lg items-center justify-center px-2.5 text-gray-500">
          <Icon className="h-3 w-3" />
        </div>
      )}
        <input
          id={name}
          type={showPassword ? "text" : "password"}
          className={cn(
            "h-full w-full bg-slate-100 pl-2 pr-8 py-0.5 text-xs placeholder:text-gray-400 focus:outline-none",
            allowClear && "pr-14",
            disabled && "cursor-not-allowed",
            Icon ? 'rounded-r-lg pl-0' : 'rounded-lg'
          )}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          {...register(name, { required, ...rules })}
          {...props}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-400">
          {allowClear && value && !disabled && !readOnly && (
            <button
              type="button"
              onClick={handleClear}
              className="hover:text-gray-700 focus:outline-none"
              tabIndex={-1}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="hover:text-gray-700 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
    </div>
  );
};

export default PasswordInput;
