import { Navigate, Route, Routes } from "react-router-dom";
import Navbar, { ROUTES } from "./components/Navbar/Navbar";
import CustomDataTypesProvider from "./contexts/CustomDataContext";
import SessionProvider from "./contexts/SessionContext";
import CustomFields from "./views/CustomFields/CustomFields";
import HomePage from "./views/Home/HomePage";
import Offline from "./views/Offline/Offline";
import Records from "./views/Record/Records";
import Sessions from "./views/Session/Sessions";
import Settings from "./views/Settings/Settings";

function App() {
  return (
    <CustomDataTypesProvider>
        <SessionProvider>
          <div className="h-screen w-full flex">
            <Navbar />
            <div className="w-full h-full relative bg-gray-200">
              <Routes>
                <Route path={ROUTES.Home.path} element={<HomePage />} />
                <Route path={ROUTES.Session.path} element={<Sessions />} />
                <Route path={ROUTES.Records.path} element={<Records />} />
                <Route path={ROUTES.CustomFields.path} element={<CustomFields />} />
                <Route path={ROUTES.Offline.path} element={<Offline />} />
                <Route path={ROUTES.Settings.path} element={<Settings />} />
                <Route
                  path="*"
                  element={<Navigate to={ROUTES.Home.path} replace />}
                />
              </Routes>
            </div>
          </div>
        </SessionProvider>
    </CustomDataTypesProvider>
  );
}

export default App;
