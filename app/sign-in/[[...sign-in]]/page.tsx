import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-0px)] w-full items-center justify-center p-6">
      <SignIn />
    </div>
  );
}
