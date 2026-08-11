import type { ReactNode } from "react";
import { useFieldContext } from "@/components/form/hooks";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";

export type FormControlProps = {
	label: string;
	description?: string;
	"aria-invalid"?: boolean;
};

type FormBaseProps = FormControlProps & {
	children: ReactNode;
	horizontal?: boolean;
	controlFirst?: boolean;
};

export function FormBase({
	children,
	label,
	description,
	controlFirst,
	horizontal,
	"aria-invalid": externalAriaInvalid,
}: FormBaseProps) {
	const field = useFieldContext<string>();
	const isInvalid =
		externalAriaInvalid ||
		(field.state.meta.isTouched && !field.state.meta.isValid);
	const labelElement = (
		<>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			{description && <FieldDescription>{description}</FieldDescription>}
		</>
	);
	const errorElement = isInvalid && (
		<FieldError errors={field.state.meta.errors}></FieldError>
	);
	return (
		<Field
			data-invalid={isInvalid}
			orientation={horizontal ? "horizontal" : "vertical"}
		>
			{controlFirst ? (
				<>
					{children}
					<FieldContent>
						{labelElement}
						{errorElement}
					</FieldContent>
				</>
			) : (
				<>
					<FieldContent>{labelElement}</FieldContent>
					{children}
					{errorElement}
				</>
			)}
		</Field>
	);
}
