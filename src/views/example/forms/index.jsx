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
    .required("Họ và tên là bắt buộc")
    .min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  email: string().email("Định dạng email không hợp lệ").required("Email là bắt buộc"),
  password: string()
    .required("Mật khẩu là bắt buộc")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  age: number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required("Tuổi là bắt buộc")
    .min(18, "Bạn phải từ 18 tuổi trở lên")
    .max(100, "Tuổi phải nhỏ hơn 100"),
  role: string().required("Vai trò là bắt buộc"),
  bio: string()
    .max(200, "Tiểu sử tối đa 200 ký tự")
    .min(10, "Vui lòng nhập tiểu sử."),
  salary: number().required("Mức lương là bắt buộc"),
});

const ExampleForms = () => {
  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "user", label: "User" },
    { value: "guest", label: "Guest" },
  ];

  const handleSubmit = () => {
    toast.success("Biểu mẫu đã được gửi thành công!");
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
        Ví dụ các thành phần Biểu mẫu (Form)
      </h1>

      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700">
            Biểu mẫu đăng ký
          </h2>
          <p className="text-sm text-gray-500">
            Biểu mẫu này minh họa tất cả các loại đầu vào với xác thực Yup bằng cách sử dụng thành phần Input chung.
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
              label={labelWithRequired("Họ và tên")}
              placeholder="Nhập họ và tên của bạn"
              classNameWrapper="cols-span-1 [&>span]:w-[60px]"
            />

            {/* Email Input */}
            <Input
              type={INPUT_TYPE.EMAIL}
              name="email"
              label={labelWithRequired("Email")}
              placeholder="Nhập email của bạn"
              classNameWrapper="cols-span-1 [&>span]:w-[60px]"
            />

            {/* Password Input */}
            <Input
              type={INPUT_TYPE.PASSWORD}
              name="password"
              label={labelWithRequired("Mật khẩu")}
              placeholder="Nhập mật khẩu"
              classNameWrapper="cols-span-1 [&>span]:w-[60px]"
            />

            {/* Number Input */}
            <Input
              type={INPUT_TYPE.NUMBER}
              name="age"
              label={labelWithRequired("Tuổi")}
              placeholder="Nhập tuổi"
              classNameWrapper="cols-span-1 [&>span]:w-[60px]"
            />

            {/* Select Input */}
            <Input
              type={INPUT_TYPE.SELECT}
              name="role"
              label={labelWithRequired("Vai trò")}
              options={roleOptions}
              placeholder="Chọn vai trò"
              classNameWrapper="cols-span-1 [&>span]:w-[60px]"
            />

            {/* Upload Input */}
            <div className="w-full">
              <Input
                type={INPUT_TYPE.FILE}
                name="avatar"
                label={labelWithRequired("Ảnh đại diện")}
                accept="image/*"
                classNameWrapper="cols-span-1 [&>span]:w-[60px]"
              />
              <p className="text-xs text-gray-400 mt-1">Tối đa 2MB, chỉ định dạng ảnh</p>
            </div>
          </div>

          {/* Textarea Input */}
          <Input
            type={INPUT_TYPE.TEXTAREA}
            name="bio"
            label="Tiểu sử"
            placeholder="Giới thiệu đôi chút về bản thân bạn..."
            rows={4}
            classNameWrapper="flex-col items-start gap-1"
          />

          {/* Checkbox */}
            <Input
              type={INPUT_TYPE.CHECKBOX}
              name="checkboxRequired"
              label='Đây là Checkbox bắt buộc'
              classNameWrapper="flex-col gap-1 justify-end items-start"
              thousandSeparator={true}
              icon={DollarSign}
            />

          <div className="border-t my-2"></div>
          
          <h3 className="font-semibold text-gray-700">Đầu vào có Biểu tượng (Icons)</h3>
          {/* Inputs with Icons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Text Input with Icon */}
            <Input
              type={INPUT_TYPE.TEXT}
              name="fullNameOptional"
              label={"Họ và tên"}
              placeholder="Nhập họ và tên của bạn"
              classNameWrapper="flex-col items-start gap-1"
              icon={User}
            />

            {/* Email Input with Icon */}
            <Input
              type={INPUT_TYPE.EMAIL}
              name="emailOptional"
              label={"Email"}
              placeholder="Nhập email của bạn"
              classNameWrapper="flex-col items-start gap-1"
              icon={Mail}
            />

            {/* Number Input with Icon */}
            <Input
              type={INPUT_TYPE.NUMBER}
              name="salary"
              label={labelWithRequired("Mức lương")}
              placeholder="Nhập mức lương"
              classNameWrapper="flex-col items-start gap-1"
              thousandSeparator={true}
              icon={DollarSign}
            />

            {/* Checkbox */}
            <Input
              type={INPUT_TYPE.CHECKBOX}
              name="checkboxOptional"
              label='Đây là Checkbox tùy chọn'
              value='checkboxOptional'
              classNameWrapper="flex-col gap-1 justify-end items-start"
              thousandSeparator={true}
              icon={DollarSign}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="primary">
              Gửi biểu mẫu
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ExampleForms;
