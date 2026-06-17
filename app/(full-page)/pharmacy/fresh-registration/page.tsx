import FreshRegistrationProvider from "./FreshRegistrationProvider";
import PrtsRegistrationFlow from "./PrtsRegistrationFlow";


export default function RegistrationPage() {
  return (
    <FreshRegistrationProvider>
      <PrtsRegistrationFlow />
    </FreshRegistrationProvider>
  );
}
