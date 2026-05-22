import { useId, useState } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { cn } from "@/helpers/utils";

const SegmentedSwitch = ({ items, value, onChange, className, name }) => {
  const uniqueId = useId();
  const layoutId = name ? `segmented-switch-${name}` : `segmented-switch-${uniqueId}`;
  const [activeItem, setActiveItem] = useState(value ?? items[0].value);
  return (
    <div
      className={cn(
        "flex p-1 bg-gray-100 rounded-full w-fit relative isolate",
        className
      )}
    >
      {items.map((item) => {
        const isActive = activeItem === item.value;
        return (
          <button
            key={item.value}
            onClick={() => {
              item?.onClickEvent();
              onChange?.(item.value);
              setActiveItem(item.value);
            }}
            className={cn(
              "relative z-10 flex-1 px-4 py-0.5 text-sm font-medium rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 whitespace-nowrap",
              isActive ? "text-white" : "text-slate-600 hover:text-slate-900"
            )}
            type="button"
            aria-pressed={isActive}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full -z-10 shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

SegmentedSwitch.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      onClickEvent: PropTypes.func,
    })
  ).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  className: PropTypes.string,
  name: PropTypes.string,
};

export default SegmentedSwitch;
