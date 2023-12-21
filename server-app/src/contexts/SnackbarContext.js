import React from 'react'
import { uniqueId } from 'lodash'
import { createContext, useCallback, useContext, useState } from 'react'
import SnackBar from '../components/SnackBar/SnackBar'

export const SnackBarContext = createContext({
    addSnackBar: () => {},
})
export const useSnackBarContext = () => useContext(SnackBarContext)

export default function SnackBarProvider({ children }) {
    const [snackBars, setSnackBars] = useState([])
    const removeSnackBar = useCallback(snackBarId => {
        setSnackBars(snackBars => snackBars.filter(sb => sb?.props?.id !== snackBarId))
    }, [])

    const addSnackBar = useCallback(
        snackBarProps => {
            const id = uniqueId()
            setSnackBars(snackBars => [
                ...snackBars,
                <SnackBar
                    {...{
                        key: id,
                        ...snackBarProps,
                        id,
                        onClose: () => removeSnackBar(id),
                    }}
                />,
            ])
        },
        [removeSnackBar],
    )

    return (
        <SnackBarContext.Provider
            value={{
                addSnackBar,
            }}
        >
            {children}
            <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-50">{snackBars}</div>
        </SnackBarContext.Provider>
    )
}
