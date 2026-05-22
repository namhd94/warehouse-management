import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { useCallback, useRef } from "react";
import { cn } from "@/helpers/utils";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const Modal = ({
	children,
	onClose,
	className,
	style,
	parentClassName,
	showCloseButton = true,
	zIndex = 50,
	title,
}) => {
	const onCloseModal = useCallback(
		() => showCloseButton && onClose?.(),
		[onClose, showCloseButton],
	);
	const refWrapper = useRef(null);
	const onHandleClose = useCallback(
		(e) => {
			e.stopPropagation();
			if (e.target !== refWrapper.current) return;
			onCloseModal();
		},
		[onCloseModal],
	);

	return createPortal(
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				ref={refWrapper}
				onClick={onHandleClose}
				style={{ zIndex }}
				className="fixed inset-0 bg-black/60 flex items-center justify-center"
			>
				<motion.div
					initial={{ scale: 0.96, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					exit={{ scale: 0.96, opacity: 0 }}
					transition={{ type: "spring", stiffness: 260, damping: 20 }}
					className={cn(
						"relative max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 max-w-[95%] min-w-[80%] md:min-w-[500px] flex flex-col",
						parentClassName,
					)}
					style={style}
				>
					<div className="flex items-center justify-between px-6 py-2 bg-slate-100 border-b border-slate-100">
						<h3 className="text-lg font-bold text-gray-800">{title}</h3>
						{showCloseButton && (
							<button
								onClick={onClose}
								className="p-1 rounded-lg hover:bg-slate-200 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
							>
								<X className="w-4 h-4 text-slate-600" />
							</button>
						)}
					</div>

					<div className={cn("overflow-y-auto max-h-[80vh] px-5 pb-4 pt-2", className)}>
						{children}
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>,
		document.body,
	);
};

export default Modal;
