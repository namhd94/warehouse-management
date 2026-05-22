import TextInput from "./text";
import NumberInput from "./number";
import PasswordInput from "./password";
import SelectInput from "./select";
import TextareaInput from "./textarea";
import UploadInput from "./upload";
import CheckboxInput from "./checkbox";
import DateTimeInput from "./datetime-picker";
import TimeInput from "./time-picker";
import DateRangeInput from "./date-range-picker";
import DatePicker from "./date-picker";
import { INPUT_TYPE } from "@/helpers/constants";
import { cn } from "@/helpers/utils";


const Input = ({ name, classNameWrapper, label, type = INPUT_TYPE.TEXT, ...rest }) => {
  return (
    <div className={cn("gap-4 flex items-center", classNameWrapper)}>
      {label && type !== INPUT_TYPE.CHECKBOX && (
        <label
          htmlFor={name}
          className="text-xs font-medium text-gray-700 whitespace-nowrap"
        >
          {label}
        </label>
      )}
      <InputWrapper type={type} name={name} label={label} {...rest} />
    </div>
  );
};

const InputWrapper = ({ type = INPUT_TYPE.TEXT, ...props }) => {
  switch (type) {
    case INPUT_TYPE.PASSWORD:
      return <PasswordInput {...props} />;
    case INPUT_TYPE.NUMBER:
      return <NumberInput {...props} />;
    case INPUT_TYPE.SELECT:
      return <SelectInput {...props} />;
    case INPUT_TYPE.TEXTAREA:
      return <TextareaInput {...props} />;
    case INPUT_TYPE.FILE:
      return <UploadInput {...props} />;
    case INPUT_TYPE.CHECKBOX:
      return <CheckboxInput {...props} />;
    case INPUT_TYPE.DATETIME:
      return <DateTimeInput {...props} />;
    case INPUT_TYPE.TIME:
      return <TimeInput {...props} />;
    case INPUT_TYPE.DATE_RANGE:
      return <DateRangeInput {...props} />;
    case INPUT_TYPE.DATE:
      return <DatePicker {...props} />;
    case INPUT_TYPE.EMAIL:
      return <TextInput type="email" {...props} />;
    case INPUT_TYPE.TEXT:
    default:
      return <TextInput type="text" {...props} />;
  }
};

export default Input;