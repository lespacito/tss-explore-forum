import { useFieldContext } from "@/components/form/hooks";
import { Input } from "@/components/ui/input";
import { FormBase, type FormControlProps } from "@/components/form/FormBase";

export function FormEmailInput(props: FormControlProps) {
  const field = useFieldContext<string>();
  const isInvalid =
    props["aria-invalid"] ??
    (field.state.meta.isTouched && !field.state.meta.isValid);
  return (
    <FormBase {...props}>
      <Input
        id={field.name}
        name={field.name}
        type="email"
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        aria-invalid={isInvalid}
        placeholder="example@email.com"
        autoComplete="email"
      />
    </FormBase>
  );
}
