import { toast } from "react-toastify";
import Button from "@/components/button";
import { BUTTON_TYPE } from "@/helpers/constants";

const ToastComponents = () => {
  return (
    <div className="flex flex-col gap-2">
      <Button
        variant={BUTTON_TYPE.SUCCESS}
        onClick={() => toast.success("Success!")}
      >
        Success Toast
      </Button>
      <Button variant={BUTTON_TYPE.ERROR} onClick={() => toast.error("Error!")}>
        Error Toast
      </Button>
      <Button variant={BUTTON_TYPE.PRIMARY} onClick={() => toast.info("Info!")}>
        Info Toast
      </Button>
      <Button variant={BUTTON_TYPE.WARNING} onClick={() => toast.warn("Warn!")}>
        Warn Toast
      </Button>
      <Button
        variant={BUTTON_TYPE.OUTLINE}
        onClick={() => toast("Default Toast!")}
      >
        Default Toast
      </Button>
    </div>
  );
};

export default ToastComponents;
