import { AlertCircle } from "lucide-react";

interface RejectionMessageProps {
	reason: string;
}

export function RejectionMessage({ reason }: RejectionMessageProps) {
	return (
		<div className="p-4 bg-warning/10 rounded-lg border border-warning/30">
			<div className="flex gap-3">
				<AlertCircle
					className="h-5 w-5 text-warning-foreground dark:text-warning mt-0.5 flex-shrink-0"
					aria-hidden="true"
				/>
				<div className="space-y-2">
					<h4 className="font-semibold text-warning-foreground dark:text-warning">
						Pourquoi des modifications sont nécessaires
					</h4>
					<p className="text-sm text-foreground/80">
						{reason}
					</p>
					<p className="text-sm text-muted-foreground">
						Notre équipe est là pour vous aider. N'hésitez pas à nous
						contacter si vous avez des questions.
					</p>
				</div>
			</div>
		</div>
	);
}
