import { Suspense } from "react";
import ForgotPasswordContent from "./forgot-password-content";

export const metadata = {
  title: "Forgot Password | RoomLensAI",
  description: "Reset your RoomLensAI password.",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
