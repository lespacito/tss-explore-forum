import { FormBase, type FormControlProps } from "@/components/form/FormBase";
import { useFieldContext } from "@/components/form/hooks";
import { Input } from "@/components/ui/input";

/**
 * Renders a form-controlled username input.
 *
 * @param props - Form control properties applied to the field container
 * @returns The username input component
 */
export function FormUsernameInput(props: FormControlProps) {
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
				placeholder="votre_pseudo"
				autoComplete="username"
			/>
		</FormBase>
	);
}
