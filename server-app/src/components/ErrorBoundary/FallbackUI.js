import React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../Navbar/Navbar";

export default function FallbackUI() {
    const navigate = useNavigate();

    const onClick = () => {
        window.location.reload(true);
        navigate(ROUTES.Home, { state: { forceRefresh: true } });
    }

    return (
        <div className="h-screen w-screen bg-gray-200 flex flex-col justify-center items-center text-lg text-red-600 space-y-8">
            <div className="text-4xl">Something went wrong!</div>
            <button className="p-2 border border-red-600 hover:bg-gray-400" onClick={onClick}>Refresh App</button>
        </div>
    )
}
