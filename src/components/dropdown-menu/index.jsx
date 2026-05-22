import React, { useState } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useDismiss,
  useRole,
  useClick,
  useInteractions,
  FloatingPortal,
  useHover,
  safePolygon,
} from '@floating-ui/react';
import { cn } from '@/helpers/utils';
import { useDropdown, DropdownContext } from './useDropdown';

export function Dropdown({
  children,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const floating = useFloating({
    open,
    onOpenChange: setOpen,
    middleware: [offset(5), flip(), shift()],
    whileElementsMounted: autoUpdate,
    placement: 'bottom-start',
  });

  const hover = useHover(floating.context, {
    enabled: true,
    handleClose: safePolygon(),
  });
  const click = useClick(floating.context);
  const dismiss = useDismiss(floating.context);
  const role = useRole(floating.context);

  const interactions = useInteractions([hover, click, dismiss, role]);

  return (
    <DropdownContext.Provider
      value={{
        open,
        setOpen,
        ...floating,
        ...interactions,
      }}
    >
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  );
}

// =======================
// Trigger
// =======================
export const DropdownTrigger = React.forwardRef(
  ({ children, className, asChild = false, ...props }, forwardedRef) => {
    const { refs, getReferenceProps } = useDropdown();

    // Stable merged ref (React 19 safe)
    const setReferenceRef = React.useCallback(
      (node) => {
        refs.setReference(node);
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [refs, forwardedRef]
    );

    const referenceProps = getReferenceProps(props);

    if (asChild && React.isValidElement(children)) {
      return (
        <span ref={setReferenceRef} {...referenceProps}>
          {React.cloneElement(children, {
            className: cn(children.props.className, className),
          })}
        </span>
      );
    }

    return (
      <button
        ref={setReferenceRef}
        type="button"
        className={cn(
          'flex items-center gap-1 cursor-pointer bg-transparent!',
          className
        )}
        {...referenceProps}
      >
        {children}
      </button>
    );
  }
);

// =======================
// Content
// =======================
export const DropdownContent = React.forwardRef(
  ({ children, className, ...props }, forwardedRef) => {
    const {
      context,
      floatingStyles,
      open,
      getFloatingProps,
    } = useDropdown();

    const setFloatingRef = React.useCallback(
      (node) => {
        context.refs.setFloating(node);
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [context.refs, forwardedRef]
    );

    if (!open) return null;

    return (
      <FloatingPortal>
        <div
          ref={setFloatingRef}
          style={floatingStyles}
          className={cn(
            'z-50 overflow-hidden rounded-2xl border border-slate-100 bg-white p-1 text-slate-950 shadow-lg',
            className
          )}
          {...getFloatingProps(props)}
        >
          {children}
        </div>
      </FloatingPortal>
    );
  }
);

// =======================
// Item
// =======================
export const DropdownItem = React.forwardRef(
  ({ children, className, onClick, ...props }, ref) => {
    const { setOpen } = useDropdown();

    const handleClick = (e) => {
      onClick?.(e);
      setOpen(false);
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-lg px-2.5 py-1.5 text-sm font-medium outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 focus:text-slate-900 text-slate-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    );
  }
);
