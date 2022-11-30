import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from './App';
import './index.css';

function render() {

    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(
        <React.StrictMode>
            {/* FOR DEV */}
            {/* <BrowserRouter>
                <App />
            </BrowserRouter> */}
            {/* FOR PROD */}
            <HashRouter>
                <App />
            </HashRouter>
        </React.StrictMode>
    );
}

render();