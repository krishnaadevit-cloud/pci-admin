interface EmptyTableMessageProps {
  title?: string;
  message: string;
}

export default function EmptyTableMessage({
  title = "No records found",
  message,
}: EmptyTableMessageProps) {
  return (
    <div className="fal-empty">
      <div className="fal-empty__icon-wrap">
        <i className="pi pi-inbox" />
      </div>
      <h3 className="fal-empty__title">{title}</h3>
      <p className="fal-empty__text">{message}</p>
    </div>
  );
}
