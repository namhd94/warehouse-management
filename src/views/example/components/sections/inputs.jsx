import Input from "@/components/input";
import { INPUT_TYPE } from "@/helpers/constants";
import { Search, Lock, DollarSign, User } from "lucide-react";
import Form from "@/components/form";

const SectionInputs = () => (
  <Form className="grid grid-cols-1 md:grid-cols-2 gap-2">
    <div className="flex flex-col gap-2">
      <Input
        classNameWrapper="[&>span]:min-w-[90px]"
        type={INPUT_TYPE.TEXT}
        name="text"
        label="Text Input"
        placeholder="Enter some text"
      />
      <Input
        classNameWrapper="[&>span]:min-w-[90px]"
        type={INPUT_TYPE.EMAIL}
        name="email"
        label="Email Input"
        placeholder="example@email.com"
      />
      <Input
        classNameWrapper="[&>span]:min-w-[90px]"
        type={INPUT_TYPE.PASSWORD}
        name="password1"
        label="Password Input"
        placeholder="Enter password"
      />
      <Input
        classNameWrapper="[&>span]:min-w-[90px]"
        type={INPUT_TYPE.NUMBER}
        name="number"
        label="Number Input"
        placeholder="0"
      />
    </div>
    <div className="flex flex-col gap-2">
      <Input
        classNameWrapper="[&>span]:min-w-[90px]"
        type={INPUT_TYPE.TEXT}
        name="text"
        label="Text Input"
        placeholder="Enter some text"
        icon={Search}
      />
      <Input
        classNameWrapper="[&>span]:min-w-[90px]"
        type={INPUT_TYPE.EMAIL}
        name="email"
        label="Email Input"
        placeholder="example@email.com"
        icon={User}
      />
      <Input
        classNameWrapper="[&>span]:min-w-[90px]"
        type={INPUT_TYPE.PASSWORD}
        name="password"
        label="Password Input"
        placeholder="Enter password"
        icon={Lock}
      />
      <Input
        classNameWrapper="[&>span]:min-w-[90px]"
        type={INPUT_TYPE.NUMBER}
        name="number"
        label="Number Input"
        placeholder="0"
        icon={DollarSign}
      />
    </div>
    <Input
      classNameWrapper="[&>span]:min-w-[90px]"
      type={INPUT_TYPE.SELECT}
      name="select"
      label="Select Input"
      options={[
        { label: "Option 1", value: "opt1" },
        { label: "Option 2", value: "opt2" },
        { label: "Option 3", value: "opt3" },
      ]}
    />
    <Input
      classNameWrapper="[&>span]:min-w-[90px]"
      type={INPUT_TYPE.FILE}
      name="file"
      label="File Upload"
    />
    <div className="grid grid-cols-2 justify-between gap-2">
      <div className="flex flex-col gap-2">
        <Input
          classNameWrapper="[&>span]:min-w-[90px]"
          className="w-[230px]"
          type={INPUT_TYPE.DATE}
          name="date"
          label="Date Input"
        />
        <Input
          classNameWrapper="[&>span]:min-w-[90px]"
          className="w-[230px]"
          type={INPUT_TYPE.DATE_RANGE}
          name="dateRange"
          label="Date Range Input"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Input
          classNameWrapper="[&>span]:min-w-[90px]"
          className="w-[230px]"
          type={INPUT_TYPE.DATETIME}
          name="datetime"
          label="Datetime Input"
        />
        <Input
          classNameWrapper="[&>span]:min-w-[90px]"
          className="w-[230px]"
          type={INPUT_TYPE.TIME}
          name="time"
          label="Time Input"
        />
      </div>
    </div>
    <Input
      classNameWrapper="[&>span]:min-w-[90px] items-start"
      type={INPUT_TYPE.TEXTAREA}
      name="textarea"
      label="Textarea Input"
      placeholder="Enter long text here..."
      className="min-h-[65px]"
    />
  </Form>
);

export default SectionInputs;
