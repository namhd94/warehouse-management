import Button from "@/components/button";
import Modal from "@/components/modal";
import { BUTTON_TYPE } from "@/helpers/constants";
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { toast } from "react-toastify";

const ModalShowcase = () => {
  const [showDefaultModal, setShowDefaultModal] = useState(false);
  const [showSmallModal, setShowSmallModal] = useState(false);
  const [showLargeModal, setShowLargeModal] = useState(false);
  const [showScrollModal, setShowScrollModal] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <Button onClick={() => setShowDefaultModal(true)}>Default Modal</Button>
      <Button
        variant={BUTTON_TYPE.SUCCESS}
        onClick={() => setShowSmallModal(true)}
      >
        Small Modal
      </Button>
      <Button
        variant={BUTTON_TYPE.WARNING}
        onClick={() => setShowLargeModal(true)}
      >
        Large Modal
      </Button>
      <Button
        variant={BUTTON_TYPE.ERROR}
        onClick={() => setShowScrollModal(true)}
      >
        Long Content Modal
      </Button>

      {/* Default Modal */}
      {showDefaultModal && (
        <Modal title="Confirmation" onClose={() => setShowDefaultModal(false)}>
          <div className="space-y-4">
            <p className="text-slate-600 text-sm">
              Are you sure you want to proceed with this action? This cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant={BUTTON_TYPE.SECONDARY}
                onClick={() => setShowDefaultModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant={BUTTON_TYPE.PRIMARY}
                onClick={() => {
                  toast.success("Action confirmed!");
                  setShowDefaultModal(false);
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Small Modal */}
      {showSmallModal && (
        <Modal
          title="Success"
          onClose={() => setShowSmallModal(false)}
          parentClassName="max-w-sm md:min-w-[300px]"
        >
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <p className="text-slate-600 text-sm">
              Your changes have been saved successfully.
            </p>
            <Button className="w-full" onClick={() => setShowSmallModal(false)}>
              Close
            </Button>
          </div>
        </Modal>
      )}

      {/* Large Modal */}
      {showLargeModal && (
        <Modal
          title="Detailed Report"
          onClose={() => setShowLargeModal(false)}
          parentClassName="max-w-4xl w-full"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <h4 className="text-gray-800 font-semibold mb-2">Section A</h4>
                <p className="text-sm text-slate-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <h4 className="text-gray-800 font-semibold mb-2">Section B</h4>
                <p className="text-sm text-slate-600">
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl col-span-2">
                <h4 className="text-gray-800 font-semibold mb-2">Full Width Section</h4>
                <p className="text-sm text-slate-600">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse
                  cillum dolore eu fugiat nulla pariatur. Excepteur sint
                  occaecat cupidatat non proident.
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t">
              <Button onClick={() => setShowLargeModal(false)}>
                Close Report
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Scrollable Modal */}
      {showScrollModal && (
        <Modal
          title="Terms and Conditions"
          onClose={() => setShowScrollModal(false)}
        >
          <div className="space-y-4">
            <div className="space-y-4 text-slate-600 text-sm">
              {Array.from({ length: 10 }).map((_, i) => (
                <p key={i}>
                  Paragraph {i + 1}: Lorem ipsum dolor sit amet, consectetur
                  adipiscing elit. Vivamus lacinia odio vitae vestibulum
                  vestibulum. Cras venenatis euismod malesuada. Nulla facilisi.
                  Integer in magna sed justo finibus mollis. Suspendisse
                  potenti. Sed egestas, ante et vulputate volutpat, eros pede
                  semper est, vitae luctus metus libero eu augue.
                </p>
              ))}
            </div>
            <div className="sticky bottom-0 bg-slate-50 py-2 border-t border-slate-100 flex justify-end gap-2">
              <Button
                variant={BUTTON_TYPE.SECONDARY}
                onClick={() => setShowScrollModal(false)}
              >
                Decline
              </Button>
              <Button onClick={() => setShowScrollModal(false)}>Accept</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ModalShowcase;
