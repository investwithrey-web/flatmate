import { Suspense } from "react";
import ResetPasswordContent from "./reset-password-content";

export const metadata = {
  title: "Reset Password | RoomLensAI",
  description: "Set a new password for your RoomLensAI account.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
