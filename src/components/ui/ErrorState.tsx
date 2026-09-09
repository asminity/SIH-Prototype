type ErrorStateProps = {
  message?: string
}

export function ErrorState({ message = 'This module is temporarily unavailable.' }: ErrorStateProps) {
  return (
    <div className="state-message state-message--error" role="alert">
      <span className="state-message__marker" aria-hidden="true">!</span>
      {message}
    </div>
  )
}
