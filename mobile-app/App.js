import { Provider } from '@react-native-material/core';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NavigationWrapper from './NavigationWrapper';
import AppErrorBoundary from './src/components/ErrorBoundary';
import CustomDataTypesProvider from './src/contexts/CustomDataContext';
import ServerProvider from './src/contexts/ServerContext';
import SessionProvider from './src/contexts/SessionContext';
import SnackbarProvider from './src/contexts/SnackbarContext';
const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <Provider>
            <NavigationContainer>
                <AppErrorBoundary>
                    <SnackbarProvider>
                        <ServerProvider>
                            <CustomDataTypesProvider>
                                <SessionProvider>
                                    <NavigationWrapper />
                                </SessionProvider>
                            </CustomDataTypesProvider>
                        </ServerProvider>
                    </SnackbarProvider>
                </AppErrorBoundary>
            </NavigationContainer>
        </Provider>
    );
}
