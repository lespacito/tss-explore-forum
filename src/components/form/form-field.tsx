import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/ui/password-input";

type FormFieldProps = {
  field: any;
  label: string;
  type?: string;
  placeholder: string;
  autoComplete: string;
  isPassword?: boolean;
};

export const FormField = ({
  field,
  label,
  type = "text",
  placeholder,
  autoComplete,
  isPassword = false,
}: FormFieldProps) => {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      {isPassword ? (
        <PasswordInput
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
      ) : (
        <Input
          id={field.name}
          name={field.name}
          type={type}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
      )}
      {isInvalid && (() => {
        const transformedErrors = field.state.meta.errors.map((error: any) =>
          typeof error === "string" ? { message: error } : error,
        );
        return <FieldError errors={transformedErrors} />;
      })()}
    </Field>
  );
};
