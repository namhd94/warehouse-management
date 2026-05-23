import {
  Users,
  Boxes,
  ClipboardList,
  PlusCircle,
  Layers,
  FormInput,
} from "lucide-react";
import PATHs from "@/helpers/paths";

export const getMenuItems = () => [
  {
    label: "Quản lý Kho",
    icon: Boxes,
    children: [
      { label: "Nhập / Xuất Kho", path: PATHs.TRANSACTIONS, icon: PlusCircle },
      { label: "Sổ kho Vật tư", path: PATHs.LEDGER, icon: ClipboardList },
      { label: "Vật tư Tồn kho", path: PATHs.MATERIALS, icon: Boxes },
      { label: "Quản lý Tài xế", path: PATHs.DRIVERS, icon: Users },
    ],
    isOpen: true,
  },
  {
    label: "Các ví dụ",
    icon: Layers,
    children: [
      { label: "Thành phần UI", path: PATHs.UI_COMPONENTS, icon: Layers },
      { label: "Biểu mẫu", path: PATHs.UI_FORM, icon: FormInput },
    ],
    isOpen: false,
  }
];
