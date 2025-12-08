import { Link, useRouter } from "@tanstack/react-router";
import { LogOut, Settings, User } from "lucide-react";
import { useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/features/auth/lib/auth-client";
import type { getAuthSession } from "@/features/auth/server/get-auth-session";

interface UserProfileMenuProps {
  user: NonNullable<Awaited<ReturnType<typeof getAuthSession>>["user"]>;
}

export function UserProfileMenu({ user }: UserProfileMenuProps) {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleSignOut = useCallback(async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.invalidate();
          router.navigate({ to: "/" });
        },
      },
    });
  }, [router]);

  const getUserInitials = useCallback(() => {
    if (!user?.displayUsername) return "U";
    return user.displayUsername
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user?.displayUsername]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 gap-2 rounded-full pl-2 pr-3 hover:bg-accent"
        >
          <Avatar className="h-8 w-8">
            {user.image && (
              <>
                {!imageLoaded && (
                  <div className="h-full w-full bg-muted animate-pulse rounded-full" />
                )}
                <AvatarImage
                  src={user.image}
                  alt={user.displayUsername || user.username || ""}
                  onLoad={() => setImageLoaded(true)}
                  className={imageLoaded ? "opacity-100" : "opacity-0"}
                />
              </>
            )}
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm font-medium">
            {user.displayUsername}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.displayUsername}
            </p>
            {user.username && (
              <p className="text-xs leading-none text-muted-foreground">
                @{user.username}
              </p>
            )}
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/account/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Paramètres</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
