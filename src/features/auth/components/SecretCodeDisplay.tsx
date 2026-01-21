import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Check, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";

interface SecretCodeDisplayProps {
  secretCode: string;
  isExisting?: boolean;
}

/**
 * SecretCodeDisplay Component
 *
 * Displays a secret code to anonymous users with copy functionality and instructions.
 *
 * Features:
 * - Clear, readable code display with separators
 * - One-click copy to clipboard with visual feedback
 * - Calm, reassuring instructions (aligned with UX principles)
 * - Accessible keyboard navigation (WCAG 2.1 AA)
 * - Mobile-first responsive design
 *
 * AC2: Display and instructions for secret code
 * - Clear instructions on how to use the code
 * - Easy copy functionality
 * - Warning about importance of saving the code
 *
 * @param secretCode - The unique secret code to display (format: XXXX-XXXX-XXXX)
 * @param isExisting - Whether this is an existing code (vs newly generated)
 */
export function SecretCodeDisplay({
  secretCode,
  isExisting = false,
}: SecretCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(secretCode);
      setCopied(true);
      toast.success("Code copié dans le presse-papier");

      // Reset copied state after 3 seconds
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error("Impossible de copier le code");
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border-2 border-accent/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <AlertTriangle
            className="h-6 w-6 text-accent-foreground"
            aria-hidden="true"
          />
          {isExisting ? "Votre code secret" : "Code secret créé !"}
        </CardTitle>
        <CardDescription className="text-base">
          {isExisting
            ? "Voici votre code secret existant"
            : "Conservez ce code précieusement pour retrouver vos publications"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Code display with copy button */}
        <div className="flex items-center gap-3 p-6 bg-muted rounded-lg border border-border">
          <code
            className="flex-1 text-2xl md:text-3xl font-mono font-bold tracking-wider text-center select-all break-all"
            aria-label={`Code secret: ${secretCode}`}
            role="status"
          >
            {secretCode}
          </code>

          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            aria-label={copied ? "Code copié" : "Copier le code"}
            className="shrink-0 h-12 w-12"
          >
            {copied ? (
              <Check className="h-5 w-5 text-primary" aria-hidden="true" />
            ) : (
              <Copy className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>
        </div>

        {/* Instructions - calm and reassuring */}
        <Alert className="border-primary/20 bg-primary/5">
          <Info className="h-5 w-5 text-primary" aria-hidden="true" />
          <AlertDescription className="space-y-3 text-base">
            <p className="font-semibold text-foreground">
              Comment utiliser ce code :
            </p>
            <ol className="list-decimal list-inside space-y-2 text-foreground/90">
              <li>
                Notez ce code dans un endroit sûr (carnet, photo, gestionnaire
                de mots de passe)
              </li>
              <li>
                Utilisez-le pour vous reconnecter sur n'importe quel appareil
              </li>
              <li>Retrouvez toutes vos publications avec ce code</li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* Warning - important but not alarming */}
        <Alert
          variant="destructive"
          className="border-accent/30 bg-accent/10 text-accent-foreground"
        >
          <AlertTriangle
            className="h-5 w-5 text-accent-foreground"
            aria-hidden="true"
          />
          <AlertDescription className="text-base">
            <strong className="font-semibold">Important :</strong> Si vous
            perdez ce code, vous ne pourrez plus accéder à vos publications
            anonymes. Aucune récupération n'est possible pour préserver votre
            anonymat.
          </AlertDescription>
        </Alert>

        {/* Additional context for existing code */}
        {isExisting && (
          <Alert className="border-muted bg-muted/50">
            <Info
              className="h-5 w-5 text-muted-foreground"
              aria-hidden="true"
            />
            <AlertDescription className="text-sm text-muted-foreground">
              Ce code a été généré lors de votre première publication. Il reste
              valide tant que vous ne supprimez pas votre compte.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
