import FreshRegistrationProvider from "../fresh-registration/FreshRegistrationProvider";
import PrtsRegistrationFlow from "./PrtsRegistrationFlow";

export default function FreshRegistrationOtherStatePage() {
  return (
    <FreshRegistrationProvider>
      <PrtsRegistrationFlow applicationTypeName="Fresh Registration Other State" />
    </FreshRegistrationProvider>
  );
}
