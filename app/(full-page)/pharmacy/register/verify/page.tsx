import PrtsAuthShell from "@/components/ui/auth/PrtsAuthShell";
import PrtsRegisterOtpVerification from "@/components/ui/auth/PrtsRegisterOtpVerification";

export default function RegisterVerifyPage() {
  return (
    <PrtsAuthShell>
      <PrtsRegisterOtpVerification  flow="register" />
    </PrtsAuthShell>
  );
}
