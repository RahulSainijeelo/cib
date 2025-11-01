import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from "@clerk/nextjs";
import { Button } from "./ui/button";
import Link from "next/link";

export function Appbar() {
	return (
    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-11/12 md:w-5/6 mx-auto flex justify-between border rounded-lg items-center bg-background px-4 py-2 md:py-3 md:px-6">
      {/* <h1 className="font-space-grotesk font-bold text-xl" >Bolty</h1> */}
      <Link href="/" className="cursor-pointer font-space-grotesk font-bold text-xl">
        Bolty
      </Link>
      <div className="flex justify-center items-center gap-2">
      <SignedOut>
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm" className="cursor-pointer">
              Sign in
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button variant="default" size="sm" className="cursor-pointer">
              Sign up
            </Button>
          </SignUpButton>
      </SignedOut>
      <SignedIn>
          <UserButton />
      </SignedIn>
      </div>
    </div>
  );
}