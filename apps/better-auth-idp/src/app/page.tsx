import { SignInButton, SignInFallback } from "@/components/sign-in-btn";
import { Suspense } from "react";

export default async function Home() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center overflow-hidden no-visible-scrollbar px-6 md:px-0">
      <main className="flex flex-col gap-4 row-start-2 items-center justify-center">
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-4xl text-black dark:text-white text-center">
            Better Auth IDP
          </h3>
        </div>
        <div className="md:w-10/12 w-full flex flex-col gap-4">
          <Suspense fallback={<SignInFallback />}>
            <SignInButton />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
