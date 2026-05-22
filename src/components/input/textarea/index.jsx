import { cn } from "@/helpers/utils";
import useFormHook from "@/hooks/useFormHook";

const TextareaInput = ({
  name,
  placeholder,
  className,
  required,
  disabled,
  readOnly,
  rows = 4,
  rules = {},
  ...props
}) => {
  const { register, formState: { errors } } = useFormHook();
  
  const hasError = !!errors?.[name];

  return (
    <textarea
      id={name}
      className={cn(
        "flex w-full rounded-lg bg-slate-100 px-2 py-2 text-xs transition-colors",
        "placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
        hasError && "ring-1 ring-red-500 focus:ring-red-500",
        className
      )}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      rows={rows}
      {...register(name, { required, ...rules })}
      {...props}
    />
  );
};

export default TextareaInput;
