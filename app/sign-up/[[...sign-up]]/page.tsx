import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-0px)] w-full items-center justify-center p-6">
      <SignUp />
    </div>
  );
}
