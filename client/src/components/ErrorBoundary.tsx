import React, { useEffect, useState } from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ErrorBoundary: React.FC<Props> = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      setHasError(true);
      console.error("Caught error:", event.error);
    };

    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  if (hasError) {
    return <>{fallback ?? <p>Something went wrong.</p>}</>;
  }
  return <>{children}</>;
};

export default ErrorBoundary;
