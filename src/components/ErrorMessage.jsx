export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="status status--error" role="alert">
      <p className="status__title">Something went wrong</p>
      <p>{message}</p>
      <button type="button" className="button" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}
