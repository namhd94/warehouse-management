import { toast } from "react-toastify";
import Form from "@/components/form";
import Input from "@/components/input";
import Button from "@/components/button";
import Card from "@/components/card";
import { INPUT_TYPE } from "@/helpers/constants";
import { object, string, number } from "yup";
import { User, Mail, DollarSign } from "lucide-react";

// Define the validation schema
const schema = object().shape({
  fullName: string()
    .required("Full name is required")
    .min(2, "Full name must be at least 2 characters"),
  email: string().email("Invalid email format").required("Email is required"),
  password: string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  age: number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required("Age is required")
    .min(18, "You must be at least 18 years old")
    .max(100, "Age must be less than 100"),
  role: string().required("Role is required"),
  bio: string()
    .max(200, "Bio must be at most 200 characters")
    .min(10, "Please enter bio."),
  salary: number().required("Salary is required"),
});

const ExampleForms = () => {
  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "user", label: "User" },
    { value: "guest", label: "Guest" },
  ];

  const handleSubmit = () => {
    toast.success("Form submitted successfully!");
  };

  const labelWithRequired = (text) => (
    <>
      {text} <span className="text-red-500">*</span>
    </>
  );

  const defaultValues = {
    fullNameOptional: 'John Cena',
    emailOptional: 'john.cena@example.com',
    role: 'admin',
    salary: 50000
  }

  return (
    <div className="p-4 w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Form Components Example
      </h1>

      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700">
            Registration Form
          </h2>
          <p className="text-sm text-gray-500">
            This form demonstrates all input types with Yup validation using the
            generic Input component.
          </p>
        </div>

        <Form
          schema={schema}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          defaultValues={defaultValues}
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {/* Text Input */}
            <Input
              type={INPUT_TYPE.TEXT}
              name="fullName"
              label={labelWithRequired("Full Name")}
              placeholder="Enter your full name"
              classNameWrapper="cols-span-1 [&>span]:w-[60px]"
            />

            {/* Email Input */}
            <Input
              type={INPUT_TYPE.EMAIL}
              name="email"
              label={labelWithRequired("Email")}
              placeholder="Enter your email"
              classNameWrapper="cols-span-1 [&>span]:w-[60px]"
            />

            {/* Password Input */}
            <Input
              type={INPUT_TYPE.PASSWORD}
              name="password"
              label={labelWithRequired("Password")}
              placeholder="Enter your password"
              classNameWrapper="cols-span-1 [&>span]:w-[60px]"
            />

            {/* Number Input */}
            <Input
              type={INPUT_TYPE.NUMBER}
              name="age"
              label={labelWithRequired("Age")}
              placeholder="Enter your age"
              classNameWrapper="cols-span-1 [&>span]:w-[60px]"
            />

            {/* Select Input */}
            <Input
              type={INPUT_TYPE.SELECT}
              name="role"
              label={labelWithRequired("Role")}
              options={roleOptions}
              placeholder="Select a role"
              classNameWrapper="cols-span-1 [&>span]:w-[60px]"
            />

            {/* Upload Input */}
            <div className="w-full">
              <Input
                type={INPUT_TYPE.FILE}
                name="avatar"
                label={labelWithRequired("Avatar")}
                accept="image/*"
                classNameWrapper="cols-span-1 [&>span]:w-[60px]"
              />
              <p className="text-xs text-gray-400 mt-1">Max 2MB, Image only</p>
            </div>
          </div>

          {/* Textarea Input */}
          <Input
            type={INPUT_TYPE.TEXTAREA}
            name="bio"
            label="Bio"
            placeholder="Tell us about yourself..."
            rows={4}
            classNameWrapper="flex-col items-start gap-1"
          />

          {/* Checkbox */}
            <Input
              type={INPUT_TYPE.CHECKBOX}
              name="checkboxRequired"
              label='This is a Required Checkbox'
              classNameWrapper="flex-col gap-1 justify-end items-start"
              thousandSeparator={true}
              icon={DollarSign}
            />

          <div className="border-t my-2"></div>
          
          <h3 className="font-semibold text-gray-700">Inputs with Icons</h3>
          {/* Inputs with Icons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Text Input with Icon */}
            <Input
              type={INPUT_TYPE.TEXT}
              name="fullNameOptional"
              label={"Full Name"}
              placeholder="Enter your full name"
              classNameWrapper="flex-col items-start gap-1"
              icon={User}
            />

            {/* Email Input with Icon */}
            <Input
              type={INPUT_TYPE.EMAIL}
              name="emailOptional"
              label={"Email"}
              placeholder="Enter your email"
              classNameWrapper="flex-col items-start gap-1"
              icon={Mail}
            />

            {/* Number Input with Icon */}
            <Input
              type={INPUT_TYPE.NUMBER}
              name="salary"
              label={labelWithRequired("Salary")}
              placeholder="Enter salary"
              classNameWrapper="flex-col items-start gap-1"
              thousandSeparator={true}
              icon={DollarSign}
            />

            {/* Checkbox */}
            <Input
              type={INPUT_TYPE.CHECKBOX}
              name="checkboxOptional"
              label='This is a Optional Checkbox'
              value='checkboxOptional'
              classNameWrapper="flex-col gap-1 justify-end items-start"
              thousandSeparator={true}
              icon={DollarSign}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="primary">
              Submit Form
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ExampleForms;
