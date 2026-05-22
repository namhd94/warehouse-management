import { forwardRef } from "react";
import ReactDatePicker from "react-datepicker";
import { Controller } from "react-hook-form";
import { cn } from "@/helpers/utils";
import useFormHook from "@/hooks/useFormHook";
import { Calendar as CalendarIcon, X } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import "../datepicker-custom.css";

const CustomInput = forwardRef(
  ({ value, onClick, placeholder, disabled, readOnly, icon: Icon, allowClear, onClear, hasError, className, id }, ref) => (
    <div
      onClick={!disabled && !readOnly ? onClick : undefined}
      className={cn(
        "flex h-6 w-full items-center rounded-lg bg-slate-100 transition-colors relative cursor-pointer",
        "focus-within:ring-1 focus-within:ring-blue-500",
        hasError && "ring-1 ring-red-500 focus-within:ring-red-500",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <div className="flex h-full items-center justify-center px-2.5 text-gray-500">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : <CalendarIcon className="h-3.5 w-3.5" />}
      </div>
      <input
        id={id}
        ref={ref}
        value={value}
        onClick={disabled || readOnly ? undefined : onClick}
        onChange={() => {}}
        readOnly
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "flex-1 h-full w-full bg-transparent pr-6 py-0.5 text-xs placeholder:text-gray-400 focus:outline-none cursor-pointer",
          allowClear && "pr-8",
          disabled && "cursor-not-allowed"
        )}
      />
      {allowClear && value && !disabled && !readOnly && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClear?.();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
);

CustomInput.displayName = "CustomInput";

const DateTimePicker = ({
  name,
  placeholder,
  className,
  required,
  disabled,
  readOnly,
  rules = {},
  icon,
  allowClear = false,
  dateFormat = "dd/MM/yyyy HH:mm",
  timeIntervals = 15,
  ...props
}) => {
  const { control, formState: { errors } } = useFormHook();
  const hasError = !!errors?.[name];

  if (!control) {
    console.error("DateTimePicker must be used within a FormHookProvider or FormProvider");
    return null;
  }

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required, ...rules }}
      render={({ field: { onChange, value, ref, onBlur } }) => (
        <ReactDatePicker
          selected={value}
          onChange={onChange}
          onBlur={onBlur}
          showTimeSelect
          timeIntervals={timeIntervals}
          dateFormat={dateFormat}
          disabled={disabled}
          readOnly={readOnly}
          customInput={
            <CustomInput
              id={name}
              ref={ref}
              placeholder={placeholder}
              disabled={disabled}
              readOnly={readOnly}
              icon={icon}
              allowClear={allowClear}
              onClear={() => onChange(null)}
              hasError={hasError}
              className={className}
            />
          }
          {...props}
        />
      )}
    />
  );
};

export default DateTimePicker;
