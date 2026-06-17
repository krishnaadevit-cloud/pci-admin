import PrtsAuthShell from "@/components/ui/auth/PrtsAuthShell";
import PrtsCreateAccountForm from "@/components/ui/auth/PrtsCreateAccountForm";

export default function RegisterPage() {
  return (
    <PrtsAuthShell>
      <PrtsCreateAccountForm />
    </PrtsAuthShell>
  );
}
