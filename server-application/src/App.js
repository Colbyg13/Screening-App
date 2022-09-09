import { Navigate, Route, Routes } from "react-router-dom";
import Navbar, { ROUTES } from "./components/Navbar/Navbar";
import HomePage from "./views/Home/HomePage";
import Offline from "./views/Offline/Offline";
import Records from "./views/Record/Records";
import Sessions from "./views/Session/Sessions";
import Settings from "./views/Settings/Settings";

function App() {
  return (
    <div className="h-screen w-full flex">
      <Navbar />
      <Routes>
        <Route path={ROUTES.Home.path} element={<HomePage />} />
        <Route path={ROUTES.Session.path} element={<Sessions />} />
        <Route path={ROUTES.Records.path} element={<Records />} />
        <Route path={ROUTES.Offline.path} element={<Offline />} />
        <Route path={ROUTES.Settings.path} element={<Settings />} />
        <Route
          path="*"
          element={<Navigate to={ROUTES.Home.path} replace />}
        />
      </Routes>
    </div>
  );
}

export default App;
