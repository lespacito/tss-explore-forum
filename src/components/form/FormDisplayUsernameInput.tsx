import { FormBase, type FormControlProps } from "@/components/form/FormBase";
import { useFieldContext } from "@/components/form/hooks";
import { Input } from "@/components/ui/input";

/**
 * Renders a form input for editing a display username.
 *
 * @param props - Form control properties forwarded to the field container.
 */
export function FormDisplayUsernameInput(props: FormControlProps) {
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
				value={field.state.value}
				onChange={(e) => field.handleChange(e.target.value)}
				onBlur={field.handleBlur}
				placeholder="Pseudo Affiché"
				autoComplete="username"
			/>
		</FormBase>
	);
}
