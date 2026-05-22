import ErrorBoundary from "@/components/error-boundary";
import { FormHookContext } from "@/hooks/useFormHook";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { cn } from "@/helpers/utils";
import { toast } from "react-toastify";

const Form = ({
  className,
  children,
  defaultValues = {},
  values = {},
  mode = "onBlur",
  reValidateMode = "onChange",
  shouldFocusError = true,
  schema,
  onSubmit,
  context,
}) => {
  const {
    handleSubmit,
    watch,
    register,
    setValue,
    setFocus,
    getValues,
    control,
    formState,
    reset,
    resetField,
  } = useForm({
    defaultValues,
    values,
    mode,
    reValidateMode,
    shouldFocusError,
    resolver: schema && yupResolver(schema),
    context: context,
  });

  const { errors } = formState;

  // Handle errors: Show in Toast
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      // Clear existing toasts to prevent stacking
      toast.dismiss();

      const errorMessages = Object.values(errors).map((err) => (
        <li key={err.message} className="text-sm">
          {err.message}
        </li>
      ));

      if (errorMessages.length > 0) {
        toast.error(
          <div>
             <p className="font-bold mb-1">Validation Error</p>
             <ul className="list-disc pl-4 space-y-1">{errorMessages}</ul>
          </div>,
          {
            autoClose: 5000,
            closeOnClick: true,
            pauseOnHover: true,
          }
        );
      }
    }
  }, [errors]);

  const onFormSubmit = useCallback(
    (data) => onSubmit?.(data),
    [onSubmit]
  );
  return (
    <FormHookContext.Provider
      value={{
        watch,
        control,
        register,
        formState,
        setValue,
        setFocus,
        getValues,
        resetField,
        reset,
        defaultValues,
      }}
    >
      <ErrorBoundary>
        <form
          className={cn("gap-5", className)}
          onSubmit={handleSubmit(onFormSubmit)}
          aria-label="Form"
        >
          {children}
        </form>
      </ErrorBoundary>
    </FormHookContext.Provider>
  );
};

export default Form;
