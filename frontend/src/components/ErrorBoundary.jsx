class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <InlineNotification
                    kind="error"
                    title="Something went wrong"
                    subtitle={this.state.error?.message || 'Please try again later'}
                />
            );
        }
        return this.props.children;
    }
}