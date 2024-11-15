import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import UserCard from "./user-card";

export default async function DashboardPage() {
  const [session, activeSessions] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    auth.api.listSessions({
      headers: await headers(),
    }),
  ]).catch(() => {
    throw redirect("/sign-in");
  });

  return (
    <div className="w-full">
      <div className="flex gap-4 flex-col">
        <UserCard
          session={JSON.parse(JSON.stringify(session))}
          activeSessions={JSON.parse(JSON.stringify(activeSessions))}
        />
      </div>
    </div>
  );
}
