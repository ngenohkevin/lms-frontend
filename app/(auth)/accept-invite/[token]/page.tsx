import { AcceptInviteForm } from "@/components/auth/accept-invite-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accept Invitation - LMS",
  description: "Accept your invitation to join the library management system",
};

interface AcceptInvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function AcceptInvitePage({ params }: AcceptInvitePageProps) {
  const { token } = await params;
  return <AcceptInviteForm token={token} />;
}
