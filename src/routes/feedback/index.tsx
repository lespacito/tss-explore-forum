import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useId } from "react";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { submitFeedback } from "@/features/feedback/server/submit-feedback";
import { feedbackSchema } from "@/features/feedback/schemas/feedback";
import type { FeedbackFormData } from "@/features/feedback/schemas/feedback";
import { useAppForm } from "@/components/form/hooks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/feedback/")({
    component: FeedbackPage,
});

function FeedbackPage() {
    const id = useId();
    const defaultValues: {
        overallRating: number;
        easeOfUse: number;
        trustAnonymity: number;
        misunderstood?: string | undefined;
        bugDescription?: string | undefined;
        bugPage?: string | undefined;
        improvementSuggestion?: string | undefined;
        freeComment?: string | undefined;
    } = {
        overallRating: 0,
        easeOfUse: 0,
        trustAnonymity: 0,
        misunderstood: undefined,
        bugDescription: undefined,
        bugPage: undefined,
        improvementSuggestion: undefined,
        freeComment: undefined,
    };
    const form = useAppForm({
        defaultValues,
        validators: {
            onSubmit: feedbackSchema,
            onBlur: feedbackSchema,
        },
        onSubmit: useCallback(
            async ({ value }: { value: FeedbackFormData }) => {
                const result = await submitFeedback({ data: value });
                if (result.success) {
                    toast.success("Merci pour votre retour.");
                } else {
                    toast.error(result.error || "Impossible d'envoyer votre retour.");
                }
            },
            [],
        ),
    });

    return (
        <form
            id={`feedback-form-${id}`}
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
            className="mx-auto max-w-2xl space-y-6 px-4 py-8"
        >
            <header className="space-y-3 text-center sm:text-left">
                <h1 className="font-serif text-2xl font-semibold">Votre avis sur la bêta</h1>
                <p className="text-sm text-muted-foreground">
                    Ce formulaire est anonyme. Aucun nom, email ou identifiant de session n'est
                    enregistré avec votre retour.
                </p>
            </header>

            <FieldGroup>
                <form.AppField name="overallRating">
                    {(field) => (
                        <Field>
                            <Label className="sr-only">Note globale</Label>
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Note globale</p>
                                <RatingRadioGroup
                                    name={field.name}
                                    value={field.state.value}
                                    onChange={(val: number) => field.handleChange(() => val)}
                                    ariaInvalid={!field.state.meta.isValid}
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <p className="text-sm text-destructive">
                                        {field.state.meta.errors[0]?.message}
                                    </p>
                                )}
                            </div>
                        </Field>
                    )}
                </form.AppField>

                <form.AppField name="easeOfUse">
                    {(field) => (
                        <Field>
                            <Label className="sr-only">Facilité d'utilisation</Label>
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Facilité d'utilisation</p>
                                <RatingRadioGroup
                                    name={field.name}
                                    value={field.state.value}
                                    onChange={(val: number) => field.handleChange(() => val)}
                                    ariaInvalid={!field.state.meta.isValid}
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <p className="text-sm text-destructive">
                                        {field.state.meta.errors[0]?.message}
                                    </p>
                                )}
                            </div>
                        </Field>
                    )}
                </form.AppField>

                <form.AppField name="trustAnonymity">
                    {(field) => (
                        <Field>
                            <Label className="sr-only">Confiance et anonymat</Label>
                            <div className="space-y-2">
                                <p className="text-sm font-medium">
                                    Confiance dans l'anonymat de ce formulaire
                                </p>
                                <RatingRadioGroup
                                    name={field.name}
                                    value={field.state.value}
                                    onChange={(val: number) => field.handleChange(() => val)}
                                    ariaInvalid={!field.state.meta.isValid}
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <p className="text-sm text-destructive">
                                        {field.state.meta.errors[0]?.message}
                                    </p>
                                )}
                            </div>
                        </Field>
                    )}
                </form.AppField>
            </FieldGroup>

            <Separator />

            <FieldGroup>
                <form.AppField name="misunderstood">
                    {(field) => (
                        <Field className="sm:col-span-2">
                            <Label htmlFor={`${id}-misunderstood`}>
                                Élément que vous avez incompris (optionnel)
                            </Label>
                            <Textarea
                                id={`${id}-misunderstood`}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(() => e.target.value)}
                                placeholder="Décrivez brièvement ce qui n'était pas clair..."
                                aria-invalid={!field.state.meta.isValid}
                            />
                            {field.state.meta.errors.length > 0 && (
                                <p className="text-sm text-destructive">
                                    {field.state.meta.errors[0]?.message}
                                </p>
                            )}
                        </Field>
                    )}
                </form.AppField>

                <form.AppField name="bugDescription">
                    {(field) => (
                        <Field className="sm:col-span-2">
                            <Label htmlFor={`${id}-bug-description`}>
                                Bug rencontré (optionnel)
                            </Label>
                            <Textarea
                                id={`${id}-bug-description`}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(() => e.target.value)}
                                placeholder="Décrivez le problème..."
                                aria-invalid={!field.state.meta.isValid}
                            />
                            {field.state.meta.errors.length > 0 && (
                                <p className="text-sm text-destructive">
                                    {field.state.meta.errors[0]?.message}
                                </p>
                            )}
                        </Field>
                    )}
                </form.AppField>

                <form.AppField name="bugPage">
                    {(field) => (
                        <Field className="sm:col-span-2">
                            <Label htmlFor={`${id}-bug-page`}>
                                Page concernée (optionnel)
                            </Label>
                            <Textarea
                                id={`${id}-bug-page`}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(() => e.target.value)}
                                placeholder="Ex: /threads/nouveau ou URL de la page..."
                                aria-invalid={!field.state.meta.isValid}
                            />
                            {field.state.meta.errors.length > 0 && (
                                <p className="text-sm text-destructive">
                                    {field.state.meta.errors[0]?.message}
                                </p>
                            )}
                        </Field>
                    )}
                </form.AppField>

                <form.AppField name="improvementSuggestion">
                    {(field) => (
                        <Field className="sm:col-span-2">
                            <Label htmlFor={`${id}-improvement`}>
                                Amélioration souhaitée (optionnel)
                            </Label>
                            <Textarea
                                id={`${id}-improvement`}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(() => e.target.value)}
                                placeholder="Votre suggestion..."
                                aria-invalid={!field.state.meta.isValid}
                            />
                            {field.state.meta.errors.length > 0 && (
                                <p className="text-sm text-destructive">
                                    {field.state.meta.errors[0]?.message}
                                </p>
                            )}
                        </Field>
                    )}
                </form.AppField>

                <form.AppField name="freeComment">
                    {(field) => (
                        <Field className="sm:col-span-2">
                            <Label htmlFor={`${id}-free-comment`}>
                                Remarque libre (optionnel)
                            </Label>
                            <Textarea
                                id={`${id}-free-comment`}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(() => e.target.value)}
                                placeholder="Toute autre remarque..."
                                aria-invalid={!field.state.meta.isValid}
                            />
                            {field.state.meta.errors.length > 0 && (
                                <p className="text-sm text-destructive">
                                    {field.state.meta.errors[0]?.message}
                                </p>
                            )}
                        </Field>
                    )}
                </form.AppField>
            </FieldGroup>

            <form.Subscribe
                selector={(state) => ({
                    isSubmitting: state.isSubmitting,
                })}
            >
                {({ isSubmitting }) => (
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => form.reset()}
                            disabled={isSubmitting}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Skeleton className="mr-2 h-4 w-20" />
                                    Envoi...
                                </>
                            ) : (
                                "Envoyer mon retour"
                            )}
                        </Button>
                    </div>
                )}
            </form.Subscribe>
        </form>
    );
}

function RatingRadioGroup(props: {
    name: string;
    value: number;
    onChange: (val: number) => void;
    ariaInvalid: boolean;
}) {
    const { name, value, onChange, ariaInvalid } = props;
    return (
        <RadioGroup
            onValueChange={(v) => onChange(Number(v))}
            value={String(value)}
            className="flex flex-row items-center gap-2 sm:justify-center"
            aria-invalid={ariaInvalid}
        >
            {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="flex items-center gap-2">
                    <RadioGroupItem value={String(n)} id={`${name}-${n}`} />
                    <Label
                        htmlFor={`${name}-${n}`}
                        className={cn(
                            "cursor-pointer text-sm tabular-nums",
                            value === n ? "font-semibold text-foreground" : "text-muted-foreground",
                        )}
                    >
                        {n}
                    </Label>
                </div>
            ))}
        </RadioGroup>
    );
}
