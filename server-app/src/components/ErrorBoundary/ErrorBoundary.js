import React from "react";
import { LOG_LEVEL } from "../../constants/log-levels";
import FallbackUI from "./FallbackUI";

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: "",
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        window.api.writeLog(LOG_LEVEL.ERROR, `Error in react: ${error} @ ${info.componentStack}`);
    }

    render() {
        if (this.state.hasError) {
            return (
                <FallbackUI />
            );
        }

        return this.props.children;
    }
}