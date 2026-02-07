import { FormBase, type FormControlProps } from "@/components/form/FormBase";
import { useFieldContext } from "@/components/form/hooks";
import { Checkbox } from "@/components/ui/checkbox";

export function FormCheckboxInput(props: FormControlProps) {
	const field = useFieldContext<boolean>();
	return (
		<FormBase {...props} horizontal controlFirst>
			<Checkbox
				id={field.name}
				name={field.name}
				checked={field.state.value}
				onCheckedChange={(checked) => field.handleChange(checked === true)}
				onBlur={field.handleBlur}
			/>
		</FormBase>
	);
}
