import { useFieldContext } from "@/components/form/hooks";
import PasswordInput from "@/components/ui/password-input";
import { FormBase, type FormControlProps } from "@/components/form/FormBase";

export function FormPasswordInput(props: FormControlProps) {
  const field = useFieldContext<string>();
  const isInvalid =
    props["aria-invalid"] ??
    (field.state.meta.isTouched && !field.state.meta.isValid);
  return (
    <FormBase {...props}>
      <PasswordInput
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        aria-invalid={isInvalid}
        placeholder="*******"
        autoComplete="new-password"
      />
    </FormBase>
  );
}
