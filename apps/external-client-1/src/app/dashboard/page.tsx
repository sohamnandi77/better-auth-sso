import { authApi } from "@/api";
import { headers } from "next/headers";
import UserCard from "./user-card";

export default async function DashboardPage() {
  const [{ data: session }, { data: activeSessions }] = await Promise.all([
    authApi.getSession({
      headers: await headers(),
    }),
    authApi.listSessions({
      headers: await headers(),
    }),
  ]).catch((error) => {
    // Handle errors appropriately
    console.error("Failed to fetch sessions:", error);
    throw error; // Or handle it as needed
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
