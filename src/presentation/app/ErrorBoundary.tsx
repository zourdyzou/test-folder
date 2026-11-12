import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert } from '@mui/material';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          Something went wrong: {this.state.error.message}
        </Alert>
      );
    }
    return this.props.children;
  }
}
