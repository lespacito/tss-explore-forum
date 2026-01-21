import { useFieldContext } from "@/components/form/hooks";
import { Input } from "@/components/ui/input";
import { FormBase, type FormControlProps } from "@/components/form/FormBase";

export function FormEmailInput(props: FormControlProps) {
  const field = useFieldContext<string>();
  return (
    <FormBase {...props}>
      <Input
        id={field.name}
        name={field.name}
        type="email"
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        placeholder="example@email.com"
        autoComplete="email"
      />
    </FormBase>
  );
}
