import { FormBase, type FormControlProps } from "@/components/form/FormBase";
import { useFieldContext } from "@/components/form/hooks";
import { Input } from "@/components/ui/input";

export function FormInput(props: FormControlProps) {
	const field = useFieldContext<string>();
	return (
		<FormBase {...props}>
			<Input
				id={field.name}
				name={field.name}
				value={field.state.value}
				onChange={(e) => field.handleChange(e.target.value)}
				onBlur={field.handleBlur}
				placeholder="Votre nom"
				autoComplete="name"
			/>
		</FormBase>
	);
}
