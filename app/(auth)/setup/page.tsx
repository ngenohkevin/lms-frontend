import { SetupForm } from "@/components/auth/setup-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setup - LMS",
  description: "Set up your library management system",
};

export default function SetupPage() {
  return <SetupForm />;
}
