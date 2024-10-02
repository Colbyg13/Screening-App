import { createContext, useCallback, useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Snackbar from '../components/Snackbar';

const SNACKBAR_TIMEOUT = 5000;

const SnackbarContext = createContext({
    addSnackbar: ({ message, severity }) => {},
});

export const useSnackbarContext = () => useContext(SnackbarContext);

export default function SnackbarProvider({ children }) {
    const [snackbars, setSnackbars] = useState([]);

    const closeSnackbar = () => setSnackbars(messages => messages.splice(1));
    const addSnackbar = useCallback(
        ({ message, severity }) => {
            const foundMessage = snackbars.find(snackbar => snackbar.message === message);
            if (foundMessage) {
                clearTimeout(foundMessage.timeoutId);
            }

            const timeoutId = setTimeout(closeSnackbar, SNACKBAR_TIMEOUT);
            const newSnackbar = { message, severity, timeoutId };
            setSnackbars(snackbars => [
                ...snackbars.filter(s => s.message !== message),
                newSnackbar,
            ]);
        },
        [snackbars],
    );

    return (
        <SnackbarContext.Provider
            value={{
                addSnackbar,
            }}
        >
            <View
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'white',
                }}
            >
                <View
                    style={{
                        position: 'absolute',
                        zIndex: 99,
                        bottom: 16,
                        start: 16,
                        end: 16,
                    }}
                >
                    {snackbars.map(snackbar => (
                        <Snackbar key={snackbar.message} open message={snackbar.message} severity={snackbar.severity} />
                    ))}
                </View>
                {children}
            </View>
        </SnackbarContext.Provider>
    );
}

const styles = StyleSheet.create({});
