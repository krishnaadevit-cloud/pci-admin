import PrtsAuthBranding from "./PrtsAuthBranding";

export default function PrtsAuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="prts-auth-page">
      <div className="prts-auth-shell">
        <PrtsAuthBranding />
        <div className="prts-auth-shell__form-panel">
          <div className="prts-auth-shell__form">{children}</div>
        </div>
      </div>
    </div>
  );
}
