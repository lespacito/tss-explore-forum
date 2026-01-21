import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { FormInput } from "@/components/form/FormInput";
import { FormUsernameInput } from "@/components/form/FormUsernameInput";
import { FormDisplayUsernameInput } from "@/components/form/FormDisplayUsernameInput";
import { FormEmailInput } from "@/components/form/FormEmailInput";
import { FormPasswordInput } from "@/components/form/FormPasswordInput";
import { FormCurrentPasswordInput } from "@/components/form/FormCurrentPasswordInput";
import { FormTextarea } from "@/components/form/FormTextArea";
import { FormCheckboxInput } from "@/components/form/FormCheckboxInput";

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
