import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Session } from "@/lib/types";
import { MobileIcon } from "@radix-ui/react-icons";
import { Laptop } from "lucide-react";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";
import { SignOutButton } from "./sign-out-button";

export default async function UserCard(props: {
  session: Session | null;
  activeSessions: Session["session"][];
}) {
  const { activeSessions, session } = props;

  return (
    <Card>
      <CardHeader>
        <CardTitle>User</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8 grid-cols-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="hidden h-9 w-9 sm:flex ">
              <AvatarImage
                src={session?.user.image || "#"}
                alt="Avatar"
                className="object-cover"
              />
              <AvatarFallback>{session?.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">
                {session?.user.name}
              </p>
              <p className="text-sm">{session?.user.email}</p>
            </div>
          </div>
        </div>
        <div className="border-l-2 px-2 w-max gap-1 flex flex-col">
          <p className="text-xs font-medium ">Active Sessions</p>
          {activeSessions
            .filter((session) => session.userAgent)
            .map((session) => {
              return (
                <div key={session.id}>
                  <div className="flex items-center gap-2 text-sm  text-black font-medium dark:text-white">
                    {new UAParser(session.userAgent).getDevice().type ===
                    "mobile" ? (
                      <MobileIcon />
                    ) : (
                      <Laptop size={16} />
                    )}
                    {new UAParser(session.userAgent).getOS().name},{" "}
                    {new UAParser(session.userAgent).getBrowser().name}
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
      <CardFooter className="gap-2 justify-between items-center">
        <SignOutButton headers={await headers()} />
      </CardFooter>
    </Card>
  );
}
