import { cn } from "@/helpers/utils";
import useFormHook from "@/hooks/useFormHook";

const CheckboxInput = ({
  name,
  label,
  className,
  disabled,
  value, // User said value is required, so we accept it.
  ...props
}) => {
  const { register, formState: { errors } } = useFormHook();
  const hasError = !!errors?.[name];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        id={name}
        type="checkbox"
        value={value}
        className={cn(
          "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500",
          disabled && "cursor-not-allowed opacity-50",
          hasError && "border-red-500 ring-1 ring-red-500"
        )}
        disabled={disabled}
        {...register(name)}
        {...props}
      />
      {label && (
        <label
          htmlFor={name}
          className={cn(
            "text-sm font-medium text-gray-700 select-none cursor-pointer",
            disabled && "cursor-not-allowed opacity-50",
            hasError && "text-red-500"
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default CheckboxInput;
