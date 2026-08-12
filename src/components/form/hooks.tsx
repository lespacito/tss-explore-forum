import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { FormCheckboxInput } from "@/components/form/FormCheckboxInput";
import { FormCurrentPasswordInput } from "@/components/form/FormCurrentPasswordInput";
import { FormDisplayUsernameInput } from "@/components/form/FormDisplayUsernameInput";
import { FormEmailInput } from "@/components/form/FormEmailInput";
import { FormInput } from "@/components/form/FormInput";
import { FormPasswordInput } from "@/components/form/FormPasswordInput";
import { FormTextarea } from "@/components/form/FormTextArea";
import { FormUsernameInput } from "@/components/form/FormUsernameInput";

const { fieldContext, formContext, useFieldContext, useFormContext } =
	createFormHookContexts();

const { useAppForm } = createFormHook({
	fieldComponents: {
		Input: FormInput,
		UsernameInput: FormUsernameInput,
		DisplayUsernameInput: FormDisplayUsernameInput,
		EmailInput: FormEmailInput,
		PasswordInput: FormPasswordInput,
		CurrentPasswordInput: FormCurrentPasswordInput,
		Textarea: FormTextarea,
		CheckboxInput: FormCheckboxInput,
	},
	formComponents: {},
	fieldContext,
	formContext,
});

export { useAppForm, useFieldContext, useFormContext };
