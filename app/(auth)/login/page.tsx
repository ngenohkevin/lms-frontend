import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - LMS",
  description: "Sign in to your library account",
};

export default function LoginPage() {
  return <LoginForm />;
}
