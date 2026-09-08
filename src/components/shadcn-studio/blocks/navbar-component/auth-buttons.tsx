import { Link } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
export function AuthButtons() { return <Button asChild variant="ghost" size="icon"><Link to="/auth/anonymous-signin" aria-label="Retrouver ma session"><KeyRound aria-hidden="true"/></Link></Button>; }
