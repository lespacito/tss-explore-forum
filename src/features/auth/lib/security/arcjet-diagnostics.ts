/** TEMPORARY: remove this module and its policy hooks after preprod validation. */
import { randomUUID } from "node:crypto";
import { isIP } from "node:net";
import { findIp } from "@arcjet/ip";
import type { ArcjetDecision } from "@arcjet/node";

export function ipCategory(value: unknown) {
	if (typeof value !== "string" || !isIP(value)) return "missing";
	const ip = value.toLowerCase().replace(/^::ffff:/, "");
	if (ip === "::1" || /^127\./.test(ip)) return "loopback";
	// "private" groups all valid non-global addresses, including reserved ranges.
	return findIp({ ip: value, headers: {} }) ? "public" : "private";
}

export function headerStructure(headers: Headers, name: string) {
	const value = headers.get(name);
	if (value === null) return { present: false, entries: [] };
	// Bound output; never retain input, header names from input, or raw values.
	const parts = value.split(",", 17);
	return {
		present: true,
		truncated: parts.length > 16,
		entries: parts.slice(0, 16).map((part) => {
			if (name === "forwarded") {
				const match = /(?:^|;)\s*for\s*=\s*("[^"]*"|[^;]*)/i.exec(part);
				const address = match?.[1]
					.trim()
					.replace(/^"|"$/g, "")
					.replace(/^\[([^\]]+)\](?::\d+)?$/, "$1")
					.replace(/^(\d+\.\d+\.\d+\.\d+):\d+$/, "$1");
				return {
					form: match ? "for-parameter" : "unparsed",
					category: ipCategory(address),
				};
			}
			return { form: "address", category: ipCategory(part.trim()) };
		}),
	};
}

export function beginArcjetDiagnostic(
	request: Request,
	policyIp: string | undefined,
	fallbackUsed: boolean,
) {
	// Explicit opt-in only. No change to Arcjet logging, rules or request metadata.
	if (process.env.ARCJET_PREPROD_DIAGNOSTICS !== "true") return undefined;
	try {
		const correlationId = randomUUID();
		const emit = (fields: Record<string, unknown>) => {
			try {
				console.info(
					JSON.stringify({
						event: "arcjet-preprod-diagnostic",
						correlationId,
						...fields,
					}),
				);
			} catch {
				/* Diagnostics must never affect protection. */
			}
		};
		emit({
			phase: "policy-entry",
			headers: Object.fromEntries(
				["forwarded", "x-forwarded-for", "x-real-ip", "x-client-ip"].map(
					(name) => [name, headerStructure(request.headers, name)],
				),
			),
			requestIpCategory: ipCategory((request as Request & { ip?: string }).ip),
			policyIpResolution:
				policyIp === undefined
					? "not-run-session"
					: policyIp
						? "success"
						: "failure",
			// The adapter exposes no stable IP observation hook in beta.15. Do not
			// misrepresent a second findIp call as the adapter's actual result.
			adapterIpResolution: "not-observable",
			fallbackUsed,
		});
		return (decision?: ArcjetDecision) => {
			try {
				emit({
					phase: decision ? "arcjet-decision" : "arcjet-error",
					...(decision
						? {
								conclusion: decision.conclusion,
								results: decision.results.map((result) => ({
									state: result.state,
									conclusion: result.conclusion,
								})),
							}
						: {}),
				});
			} catch {
				/* Preserve protection if diagnostics fail. */
			}
		};
	} catch {
		return undefined;
	}
}
