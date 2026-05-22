import ToastComponents from "./toasts";
import SwitchShowcase from "./switch";
import ModalShowcase from "./modals";

const SectionOthers = () => {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-bold">Toast Showcases</h2>
        <ToastComponents />
      </div>
      <div>
        <h2 className="text-sm font-bold">Switch Showcase</h2>
        <SwitchShowcase />
      </div>
      <div>
        <h2 className="text-sm font-bold">Modal Showcases</h2>
        <ModalShowcase />
      </div>
    </div>
  );
};

export default SectionOthers;
