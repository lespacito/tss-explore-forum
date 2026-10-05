import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useId, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    AlertDialogPortal,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { submitFeedback } from "@/features/feedback/server/submit-feedback";
import { feedbackSchema } from "@/features/feedback/schemas/feedback";
import type { FeedbackFormData } from "@/features/feedback/schemas/feedback";
import { useAppForm } from "@/components/form/hooks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/feedback/")({
    component: FeedbackPage,
});

const RATING_ANCHORS = {
    overallRating: {
        question: "Votre impression globale sur la bêta",
        helpText: "De « la bêta ne répond pas à mes attentes » à « la bêta répond bien à mes attentes ».",
        labels: [
            "Pas du tout satisfait",
            "Peu satisfait",
            "Moyennement satisfait",
            "Plutôt satisfait",
            "Tout à fait satisfait",
        ],
    },
    easeOfUse: {
        question: "Facilité d'utilisation",
        helpText: "De « très difficile à utiliser » à « très facile à utiliser ».",
        labels: [
            "Très difficile",
            "Difficile",
            "Moyen",
            "Facile",
            "Très facile",
        ],
    },
    trustAnonymity: {
        question:
            "Dans quelle mesure avez-vous confiance dans l'anonymat de cette contribution ?",
        helpText:
            "Ce formulaire ne collecte aucun nom, email ou identifiant de session avec votre retour.",
        labels: [
            "Pas du tout confiant",
            "Peu confiant",
            "Moyennement confiant",
            "Plutôt confiant",
            "Tout à fait confiant",
        ],
    },
} as const;

function FieldScale(props: {
    name: string;
    question: string;
    helpText: string;
    labels: readonly string[];
    value: number;
    onChange: (val: number) => void;
    ariaInvalid: boolean;
}) {
    const { name, question, helpText, labels, value, onChange, ariaInvalid } = props;
    return (
        <Field className="space-y-2">
            <div className="space-y-1">
                <Label className="sr-only">{question}</Label>
                <p id={`${name}-question`} className="text-sm font-medium">{question} (obligatoire)</p>
                <p className="text-xs text-muted-foreground">{helpText}</p>
            </div>
            <RadioGroup
                onValueChange={(v) => onChange(Number(v))}
                value={String(value)}
                aria-invalid={ariaInvalid}
                aria-required="true"
                aria-labelledby={`${name}-question`}
                aria-describedby={ariaInvalid ? `${name}-error` : undefined}
                className="grid grid-cols-5 gap-2 sm:gap-3"
            >
                {labels.map((label, idx) => {
                    const n = idx + 1;
                    return (
                        <div key={n} className="flex flex-col items-center gap-1.5">
                            <RadioGroupItem value={String(n)} id={`${name}-${n}`} />
                            <Label
                                htmlFor={`${name}-${n}`}
                                className={cn(
                                    "cursor-pointer text-center text-xs leading-tight tabular-nums",
                                    value === n
                                        ? "font-semibold text-foreground"
                                        : "text-muted-foreground",
                                )}
                            >
                                {n}
                            </Label>
                            <span
                                className={cn(
                                    "w-full text-center text-[11px] leading-snug",
                                    value === n
                                        ? "text-foreground"
                                        : "text-muted-foreground",
                                )}
                            >
                                {label}
                            </span>
                        </div>
                    );
                })}
            </RadioGroup>
            {ariaInvalid && (
                <p id={`${name}-error`} className="text-sm text-destructive">
                    Veuillez répondre à cette question.
                </p>
            )}
        </Field>
    );
}

function FeedbackPage() {
    const id = useId();
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);

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
            onChange: feedbackSchema,
        },
        onSubmitInvalid: ({ value }) => {
            const missingRating = (["overallRating", "easeOfUse", "trustAnonymity"] as const)
                .find((name) => value[name] < 1);
            if (missingRating) {
                document.getElementById(`${missingRating}-1`)?.focus();
            }
        },
        onSubmit: useCallback(
            async ({ value }: { value: FeedbackFormData }) => {
                const result = await submitFeedback({ data: value });
                if (result.success) {
                    setSubmitted(true);
                    toast.success("Merci pour votre retour.");
                } else {
                    toast.error(result.error || "Impossible d'envoyer votre retour.");
                }
            },
            [],
        ),
    });

    const hasAnyValue = useMemo(() => {
        const values = form.state.values;
        if (values.overallRating > 0) return true;
        if (values.easeOfUse > 0) return true;
        if (values.trustAnonymity > 0) return true;
        if (values.misunderstood && values.misunderstood.trim().length > 0) return true;
        if (values.bugDescription && values.bugDescription.trim().length > 0) return true;
        if (values.bugPage && values.bugPage.trim().length > 0) return true;
        if (values.improvementSuggestion &&
            values.improvementSuggestion.trim().length > 0)
            return true;
        if (values.freeComment && values.freeComment.trim().length > 0) return true;
        return false;
    }, [form.state.values]);

    const handleClear = useCallback(() => {
        form.reset();
        setShowClearDialog(false);
    }, [form]);

    return (
        <>
            {submitted ? (
                <div
                    id={`feedback-form-${id}`}
                    className="mx-auto max-w-2xl space-y-6 px-4 py-8"
                >
                    <header className="space-y-3 text-center sm:text-left">
                        <h1 className="font-serif text-2xl font-semibold">
                            Votre avis sur la bêta
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Ce formulaire est anonyme. Aucun nom, email ou identifiant de
                            session n'est enregistré avec votre retour.
                        </p>
                    </header>
                    <div className="rounded-lg border bg-background p-6 shadow-sm">
                        <div className="space-y-2">
                            <p className="text-base font-medium">Merci pour votre retour.</p>
                            <p className="text-sm text-muted-foreground">
                                Votre contribution anonyme a bien été enregistrée.
                                <br />
                                Les équipes de la cohorte l'étudieront avant la prochaine itération.
                            </p>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Button type="button" onClick={() => setSubmitted(false)}>
                                Nouveau retour
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
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
                        <h1 className="font-serif text-2xl font-semibold">
                            Votre avis sur la bêta
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Ce formulaire est anonyme. Aucun nom, email ou identifiant de
                            session n'est enregistré avec votre retour.
                        </p>
                    </header>

                    <FieldGroup>
                        <form.AppField name="overallRating">
                            {(field) => (
                                <FieldScale
                                    name={field.name}
                                    question={
                                        RATING_ANCHORS.overallRating.question
                                    }
                                    helpText={RATING_ANCHORS.overallRating.helpText}
                                    labels={RATING_ANCHORS.overallRating.labels}
                                    value={field.state.value}
                                    onChange={(val: number) =>
                                        field.handleChange(() => val)
                                    }
                                    ariaInvalid={field.state.meta.isTouched && !field.state.meta.isValid}
                                />
                            )}
                        </form.AppField>

                        <form.AppField name="easeOfUse">
                            {(field) => (
                                <FieldScale
                                    name={field.name}
                                    question={RATING_ANCHORS.easeOfUse.question}
                                    helpText={RATING_ANCHORS.easeOfUse.helpText}
                                    labels={RATING_ANCHORS.easeOfUse.labels}
                                    value={field.state.value}
                                    onChange={(val: number) =>
                                        field.handleChange(() => val)
                                    }
                                    ariaInvalid={field.state.meta.isTouched && !field.state.meta.isValid}
                                />
                            )}
                        </form.AppField>

                        <form.AppField name="trustAnonymity">
                            {(field) => (
                                <FieldScale
                                    name={field.name}
                                    question={
                                        RATING_ANCHORS.trustAnonymity.question
                                    }
                                    helpText={RATING_ANCHORS.trustAnonymity.helpText}
                                    labels={RATING_ANCHORS.trustAnonymity.labels}
                                    value={field.state.value}
                                    onChange={(val: number) =>
                                        field.handleChange(() => val)
                                    }
                                    ariaInvalid={field.state.meta.isTouched && !field.state.meta.isValid}
                                />
                            )}
                        </form.AppField>
                    </FieldGroup>

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
                                        onChange={(e) =>
                                            field.handleChange(() => e.target.value)
                                        }
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
                                        onChange={(e) =>
                                            field.handleChange(() => e.target.value)
                                        }
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
                                        onChange={(e) =>
                                            field.handleChange(() => e.target.value)
                                        }
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
                                        onChange={(e) =>
                                            field.handleChange(() => e.target.value)
                                        }
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
                                        onChange={(e) =>
                                            field.handleChange(() => e.target.value)
                                        }
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
                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                {hasAnyValue && (
                                    <AlertDialog
                                        open={showClearDialog}
                                        onOpenChange={setShowClearDialog}
                                    >
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={isSubmitting}
                                            >
                                                Effacer mes réponses
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogPortal>
                                            <AlertDialogOverlay />
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Effacer mes réponses ?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Vous avez saisi des réponses. Voulez-vous
                                                        vraiment tout effacer ? Cette action est
                                                        irréversible.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        Annuler
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleClear}
                                                        className="bg-destructive text-white hover:bg-destructive/90"
                                                    >
                                                        Tout effacer
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialogPortal>
                                    </AlertDialog>
                                )}
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
            )}
        </>
    );
}
