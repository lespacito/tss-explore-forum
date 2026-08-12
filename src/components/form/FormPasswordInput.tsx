import { FormBase, type FormControlProps } from "@/components/form/FormBase";
import { useFieldContext } from "@/components/form/hooks";
import PasswordInput from "@/components/ui/password-input";

/**
 * Renders a password input connected to the current form field.
 *
 * @param props - Form control properties forwarded to the form container
 * @returns The rendered password form field
 */
export function FormPasswordInput(props: FormControlProps) {
	const field = useFieldContext<string>();
	return (
		<FormBase {...props}>
			<PasswordInput
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
				placeholder="********"
				autoComplete="new-password"
			/>
		</FormBase>
	);
}
