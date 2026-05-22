import { useState } from "react";
import { Controller } from "react-hook-form";
import { cn } from "@/helpers/utils";
import useFormHook from "@/hooks/useFormHook";
import { X } from "lucide-react";

const FormattedNumberInput = ({
  value,
  onChange,
  onBlur,
  thousandSeparator,
  placeholder,
  className,
  disabled,
  readOnly,
  name,
  ref,
  error,
  icon: Icon,
  allowClear = false,
  onClear,
  ...props
}) => {
  const getInitialDisplayValue = () => {
    if (value === undefined || value === null || value === "") {
      return "";
    }
    const parts = value.toString().split(".");
    if (thousandSeparator) {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return parts.join(".");
  };

  const [displayValue, setDisplayValue] = useState(getInitialDisplayValue);
  const [prevValue, setPrevValue] = useState(value);
  const [prevThousandSeparator, setPrevThousandSeparator] = useState(thousandSeparator);

  if (value !== prevValue || thousandSeparator !== prevThousandSeparator) {
    setPrevValue(value);
    setPrevThousandSeparator(thousandSeparator);
    if (value === undefined || value === null || value === "") {
      setDisplayValue("");
    } else {
      const rawDisplay = displayValue.toString().replace(/,/g, "");
      const parsedDisplay = parseFloat(rawDisplay);
      if (parsedDisplay !== value) {
        const parts = value.toString().split(".");
        if (thousandSeparator) {
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        setDisplayValue(parts.join("."));
      }
    }
  }

  const handleChange = (e) => {
    let inputValue = e.target.value;

    // Remove existing commas for validation
    const rawValue = inputValue.replace(/,/g, "");

    // Allow empty or minus sign only (intermediate states)
    if (rawValue === "" || rawValue === "-") {
      setDisplayValue(inputValue);
      onChange("");
      return;
    }

    // Validate number format (integers or floats)
    if (!/^-?\d*\.?\d*$/.test(rawValue)) {
      return; // Ignore invalid characters
    }

    // Format the valid number string
    let nextDisplay = rawValue;
    if (thousandSeparator) {
      const parts = rawValue.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      nextDisplay = parts.join(".");
    }

    setDisplayValue(nextDisplay);

    // Update form value as number
    const numberValue = parseFloat(rawValue);
    if (!isNaN(numberValue)) {
      onChange(numberValue);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setDisplayValue("");
    onChange("");
    onClear?.();
  };

  const hasValue = value !== undefined && value !== null && value !== "";

  return (
    <div
      className={cn(
        "flex h-6 w-full items-center rounded-lg bg-slate-100 transition-colors relative",
        "focus-within:ring-1 focus-within:ring-blue-500",
        error && "ring-1 ring-red-500 focus-within:ring-red-500",
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
        ref={ref}
        type="text"
        className={cn(
          "flex-1 h-full w-full bg-slate-100 pl-2 pr-6 py-0.5 text-xs placeholder:text-gray-400 focus:outline-none",
          allowClear && "pr-8",
          disabled && "cursor-not-allowed",
          Icon ? 'rounded-r-lg pl-0' : 'rounded-lg'
        )}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        value={displayValue}
        onChange={handleChange}
        onBlur={onBlur}
        {...props}
      />
      {allowClear && hasValue && !disabled && !readOnly && (
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

const NumberInput = ({
  name,
  placeholder,
  className,
  required,
  disabled,
  readOnly,
  thousandSeparator = false,
  rules = {},
  icon,
  ...props
}) => {
  const { control, formState: { errors } } = useFormHook();

  const hasError = !!errors?.[name];

  if (!control) {
    console.error("NumberInput must be used within a FormHookProvider or FormProvider");
    return null;
  }

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required, ...rules }}
      render={({ field: { onChange, value, ref, onBlur } }) => (
        <FormattedNumberInput
          name={name}
          ref={ref}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          thousandSeparator={thousandSeparator}
          placeholder={placeholder}
          className={className}
          disabled={disabled}
          readOnly={readOnly}
          error={hasError}
          icon={icon}
          {...props}
        />
      )}
    />
  );
};

export default NumberInput;
