import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      } else {
        return (
          <div className="border p-3 rounded inline-block">
            <h4 className="text-xl font-semibold">Oops, an error occured!</h4>
            <p className="text-xs">{this.state.error.message}</p>
          </div>
        );
      }
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
