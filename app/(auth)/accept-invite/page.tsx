import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accept Invitation - LMS",
  description: "Accept your invitation to join the library management system",
};

interface AcceptInviteRedirectProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AcceptInviteRedirect({ searchParams }: AcceptInviteRedirectProps) {
  const { token } = await searchParams;

  if (token) {
    // Redirect from ?token= format to /accept-invite/[token] format
    redirect(`/accept-invite/${encodeURIComponent(token)}`);
  }

  // No token provided - redirect to login
  redirect("/login");
}
