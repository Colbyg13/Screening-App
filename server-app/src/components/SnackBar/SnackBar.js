import React, { useEffect, useRef } from 'react'
import match from '../../utils/match'

export default function SnackBar({ variant, title, message, timeout, onClose = () => {} }) {
    const timeoutRef = useRef()

    useEffect(() => {
        if (timeout && onClose) {
            timeoutRef.current = setTimeout(() => {
                onClose()
            }, timeout)
        }
        return () => {
            clearTimeout(timeoutRef.current)
        }
    }, [timeout, onClose])

    return (
        <div
            className={`z-50 relative min-w-fit w-80 shadow-2xl bg-slate-100 border-l-8  p-4 ${match(
                variant,
            )
                .against({
                    danger: 'border-red-500',
                    warning: 'border-yellow-500',
                    info: 'border-sky-500',
                    success: 'border-green-500',
                })
                .otherwise('border-gray-500')}`}
        >
            <div
                className={`font-bold ${match(variant)
                    .against({
                        danger: 'text-red-500',
                        warning: 'text-yellow-500',
                        info: 'text-sky-500',
                        success: 'text-green-500',
                    })
                    .otherwise('text-black')}`}
            >
                {title}
            </div>
            <div className="text-black">{message}</div>
            <button
                className="absolute top-1 right-2 w-3 bg-white border border-red-500 text-red-500 rounded-full"
                onClick={onClose}
            >
                X
            </button>
        </div>
    )
}
