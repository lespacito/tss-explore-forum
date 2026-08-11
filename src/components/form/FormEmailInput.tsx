import { FormBase, type FormControlProps } from "@/components/form/FormBase";
import { useFieldContext } from "@/components/form/hooks";
import { Input } from "@/components/ui/input";

/**
 * Renders a form-controlled email input.
 *
 * @param props - Properties applied to the form control.
 */
export function FormEmailInput(props: FormControlProps) {
	const field = useFieldContext<string>();
	return (
		<FormBase {...props}>
			<Input
				id={field.name}
				name={field.name}
				aria-invalid={
					props["aria-invalid"] ||
					(field.state.meta.isTouched && !field.state.meta.isValid) ||
					undefined
				}
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
