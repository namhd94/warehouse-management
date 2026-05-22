import Input from "@/components/input";
import { BUTTON_TYPE } from "@/helpers/constants";
import Button from "@/components/button";
import {
  Ambulance,
  Send,
  Search,
  Lock,
  DollarSign,
  AArrowDown,
  AlertCircle,
} from "lucide-react";

const SectionButtons = () => {
  return (
    <div className="grid grid-cols-4 gap-2">
      <div className="flex flex-col gap-3">
        <Button variant={BUTTON_TYPE.PRIMARY}>Primary</Button>
        <Button variant={BUTTON_TYPE.SECONDARY}>Secondary</Button>
        <Button variant={BUTTON_TYPE.SUCCESS}>Success</Button>
        <Button variant={BUTTON_TYPE.ERROR}>Error</Button>
        <Button variant={BUTTON_TYPE.WARNING}>Warning</Button>
        <Button variant={BUTTON_TYPE.OUTLINE}>Outline</Button>
        <Button variant={BUTTON_TYPE.LINK}>Link</Button>
      </div>
      <div className="flex flex-col gap-3">
        <Button icon={Ambulance} variant={BUTTON_TYPE.PRIMARY}>
          Primary
        </Button>
        <Button icon={Send} variant={BUTTON_TYPE.SECONDARY}>
          Secondary
        </Button>
        <Button icon={DollarSign} variant={BUTTON_TYPE.SUCCESS}>
          Success
        </Button>
        <Button icon={AArrowDown} variant={BUTTON_TYPE.ERROR}>
          Error
        </Button>
        <Button icon={AlertCircle} variant={BUTTON_TYPE.WARNING}>
          Warning
        </Button>
        <Button icon={Search} variant={BUTTON_TYPE.OUTLINE}>
          Outline
        </Button>
        <Button icon={Lock} variant={BUTTON_TYPE.LINK}>
          Link
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        <Button icon={Ambulance} variant={BUTTON_TYPE.PRIMARY} disabled={true}>
          Primary
        </Button>
        <Button icon={Send} variant={BUTTON_TYPE.SECONDARY} disabled={true}>
          Secondary
        </Button>
        <Button icon={DollarSign} variant={BUTTON_TYPE.SUCCESS} disabled={true}>
          Success
        </Button>
        <Button icon={AArrowDown} variant={BUTTON_TYPE.ERROR} disabled={true}>
          Error
        </Button>
        <Button
          icon={AlertCircle}
          variant={BUTTON_TYPE.WARNING}
          disabled={true}
        >
          Warning
        </Button>
        <Button icon={Search} variant={BUTTON_TYPE.OUTLINE} disabled={true}>
          Outline
        </Button>
        <Button icon={Lock} variant={BUTTON_TYPE.LINK} disabled={true}>
          Link
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        <Button icon={Ambulance} isLoading={true} variant={BUTTON_TYPE.PRIMARY}>
          Primary
        </Button>
        <Button icon={Send} isLoading={true} variant={BUTTON_TYPE.SECONDARY}>
          Secondary
        </Button>
        <Button
          icon={DollarSign}
          isLoading={true}
          variant={BUTTON_TYPE.SUCCESS}
        >
          Success
        </Button>
        <Button icon={AArrowDown} isLoading={true} variant={BUTTON_TYPE.ERROR}>
          Error
        </Button>
        <Button
          icon={AlertCircle}
          isLoading={true}
          variant={BUTTON_TYPE.WARNING}
        >
          Warning
        </Button>
        <Button icon={Search} isLoading={true} variant={BUTTON_TYPE.OUTLINE}>
          Outline
        </Button>
        <Button icon={Lock} isLoading={true} variant={BUTTON_TYPE.LINK}>
          Link
        </Button>
      </div>
    </div>
  );
};

export default SectionButtons;
