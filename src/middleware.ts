export { default } from "next-auth/middleware";

// export const config = { matcher: ["/:path*"] };
export const config = {
    matcher: ['/((?!sign-up).*)'],
  };