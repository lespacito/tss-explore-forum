import { FormBase, type FormControlProps } from "@/components/form/FormBase";
import { useFieldContext } from "@/components/form/hooks";
import PasswordInput from "@/components/ui/password-input";

/**
 * Renders a form-integrated password input for the current password.
 *
 * @returns A password input connected to the form field context
 */
export function FormCurrentPasswordInput(props: FormControlProps) {
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
				autoComplete="current-password"
			/>
		</FormBase>
	);
}
