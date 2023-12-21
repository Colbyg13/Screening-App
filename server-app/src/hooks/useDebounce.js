// Got from web dev simplified: https://github.com/WebDevSimplified/useful-custom-react-hooks/blob/main/src/3-useDebounce/useDebounce.js

import { useEffect } from 'react'
import useTimeout from './useTimeout'

export default function useDebounce(callback, delay, dependencies) {
    const { reset, clear } = useTimeout(callback, delay)
    useEffect(reset, [...dependencies, reset])
    useEffect(clear, [])
}
