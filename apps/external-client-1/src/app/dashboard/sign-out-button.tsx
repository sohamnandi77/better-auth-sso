"use client";
import { authApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export const SignOutButton = ({ headers }: { headers: Headers }) => {
  const [isSignOut, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      className="gap-2 z-10"
      variant="secondary"
      onClick={async () => {
        startTransition(async () => {
          await authApi.signOut({
            headers,
            credentials: "include",
            onSuccess() {
              router.push("/");
            },
          });
        });
      }}
      disabled={isSignOut}
    >
      <span className="text-sm">
        {isSignOut ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <div className="flex items-center gap-2">
            <LogOut size={16} />
            Sign Out
          </div>
        )}
      </span>
    </Button>
  );
};
