import { Controller } from "react-hook-form";
import ReactSelect, { components as SelectComponents } from "react-select";
import { cn } from "@/helpers/utils";
import useFormHook from "@/hooks/useFormHook";
import { ChevronDown, X } from "lucide-react";

const CustomDropdownIndicator = (props) => {
  return (
    <SelectComponents.DropdownIndicator {...props}>
      <ChevronDown className="h-3.5 w-3.5 mx-1.5" />
    </SelectComponents.DropdownIndicator>
  );
};

const CustomClearIndicator = (props) => {
  return (
    <SelectComponents.ClearIndicator {...props}>
      <X className="h-3.5 w-3.5" />
    </SelectComponents.ClearIndicator>
  );
};

const SelectInput = ({
  name,
  placeholder = "Select an option",
  options = [],
  className,
  disabled,
  rules = {},
  isMulti = false,
  isClearable = true,
  isSearchable = true,
  ...props
}) => {
  const { control, formState: { errors } } = useFormHook();

  const hasError = !!errors?.[name];

  // Custom styles for react-select to match the other inputs (h-6, rounded-lg, bg-gray-100)
  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "24px",
      height: "24px",
      fontSize: "0.75rem", // text-xs
      lineHeight: "1rem",
      borderRadius: "0.5rem", // rounded-lg
      borderWidth: 0,
      backgroundColor: "#f1f5f9", // bg-slate-100
      boxShadow: state.isFocused
        ? hasError ? "0 0 0 1px #ef4444" : "0 0 0 1px #3b82f6" // ring-1
        : hasError ? "0 0 0 1px #ef4444" : "none",
      "&:hover": {
        cursor: "pointer", // bg-gray-200 on hover
      },
    }),
    valueContainer: (base) => ({
      ...base,
      height: "24px",
      padding: "0 8px",
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
      color: "inherit",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: "24px",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: "0 4px",
      color: "#6b7280", // gray-500
      "&:hover": {
        color: "#374151", // gray-700
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: "auto 4px",
      color: "#9ca3af",
      "&:hover": {
        color: "#6b7280",
      },
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9ca3af", // gray-400
      fontSize: "0.75rem",
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: "0.75rem",
      color: "inherit",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#e5e7eb", // gray-200
      borderRadius: "0.25rem",
      margin: "1px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      fontSize: "0.75rem",
      color: "inherit",
      padding: "1px 4px",
    }),
    multiValueRemove: (base) => ({
      ...base,
      padding: "0 2px",
      ":hover": {
        backgroundColor: "#d1d5db",
        color: "#1f2937",
      },
    }),
    menu: (base) => ({
      ...base,
      fontSize: "0.75rem",
      zIndex: 50,
      borderRadius: "0.5rem",
      overflow: "hidden",
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#3b82f6" // blue-500
        : state.isFocused
        ? "#eff6ff" // blue-50
        : "transparent",
      color: state.isSelected ? "white" : "inherit",
      cursor: "pointer",
      padding: '4px 10px',
      ":active": {
        backgroundColor: "#2563eb", // blue-600
      },
    }),
  };

  if (!control) {
    console.error("SelectInput must be used within a FormHookProvider or FormProvider");
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { onChange, value, ref, onBlur } }) => (
          <ReactSelect
            ref={ref}
            options={options}
            value={
              isMulti
                ? options.filter((c) => value?.includes(c.value))
                : options.find((c) => c.value === value) || null
            }
            onChange={(val) => {
              if (isMulti) {
                onChange(val ? val.map((c) => c.value) : []);
              } else {
                onChange(val ? val.value : null);
              }
            }}
            onBlur={onBlur}
            isDisabled={disabled}
            placeholder={placeholder}
            styles={customStyles}
            components={{ 
              DropdownIndicator: CustomDropdownIndicator,
              ClearIndicator: CustomClearIndicator
            }}
            isMulti={isMulti}
            isClearable={isClearable}
            isSearchable={isSearchable}
            menuPortalTarget={document.body} 
            menuPosition="fixed"
            {...props}
          />
        )}
      />
    </div>
  );
};

export default SelectInput;
