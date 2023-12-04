'use client';

import HomePage from "@/components/Home";
import Login from "@/components/Login";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";
 

type Props = {
  searchParams?: Record<"callbackUrl" | "error", string>;
};

const SignInPage = (props: Props) => {
  const { data: session } = useSession();
  const router = useRouter()

  return (
    <div>
      {session && (<HomePage/>)}

      {!session && (<Login
        className="flex items-center justify-center"
        error={props.searchParams?.error}
        callbackUrl='/home'
      />)}    
    </div>
    
  );
};

export default SignInPage;