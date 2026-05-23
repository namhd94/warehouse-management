import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import Button from '@/components/button';
import PATHs from '@/helpers/paths';
import { BUTTON_TYPE } from '@/helpers/constants';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <div className="bg-gray-100 p-6 rounded-full mb-6">
        <FileQuestion className="h-16 w-16 text-gray-400" />
      </div>
      
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Không tìm thấy trang</h2>
      
      <p className="text-gray-500 max-w-md mb-8">
        Trang bạn đang tìm kiếm có thể đã bị xóa, thay đổi tên hoặc tạm thời không khả dụng.
      </p>

      <Button 
        variant={BUTTON_TYPE.PRIMARY} 
        icon={Home}
        onClick={() => navigate(PATHs.HOME)}
      >
        Quay lại Trang chủ
      </Button>
    </div>
  );
};

export default NotFound;
