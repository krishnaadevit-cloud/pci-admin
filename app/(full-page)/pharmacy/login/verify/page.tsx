import PrtsAuthShell from "@/components/ui/auth/PrtsAuthShell";
import PrtsOtpVerification from "@/components/ui/auth/PrtsOtpVerification";

export default function LoginVerifyPage() {
  return (
    <PrtsAuthShell>
      <PrtsOtpVerification flow="login" />
    </PrtsAuthShell>
  );
}
