// This component does not require a <label>, placeholder, or aria-label since it is a layout card, not a form input.
import { cn } from "@/helpers/utils";

const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className, ...props }) => {
  return (
    <div
      className={cn("px-6 pt-6 pb-2 text-slate-500 font-medium text-sm", className)}
      {...props}
    >
      {children}
    </div>
  );
};

const CardBody = ({ children, className, ...props }) => {
  return (
    <div className={cn("px-6 pb-6 pt-2", className)} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className, ...props }) => {
  return (
    <div
      className={cn("px-6 py-4 bg-slate-50 border-t border-slate-100", className)}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
