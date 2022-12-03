import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter } from "react-router-dom";
import './index.css';
import App from './App';

function render() {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
        <React.StrictMode>
            <MemoryRouter>
                <App />
            </MemoryRouter>
        </React.StrictMode>
    );
}

render()