import { FormBase, type FormControlProps } from "@/components/form/FormBase";
import { useFieldContext } from "@/components/form/hooks";
import PasswordInput from "@/components/ui/password-input";

export function FormPasswordInput(props: FormControlProps) {
	const field = useFieldContext<string>();
	return (
		<FormBase {...props}>
			<PasswordInput
				id={field.name}
				name={field.name}
				value={field.state.value}
				onChange={(e) => field.handleChange(e.target.value)}
				onBlur={field.handleBlur}
				placeholder="********"
				autoComplete="new-password"
			/>
		</FormBase>
	);
}
