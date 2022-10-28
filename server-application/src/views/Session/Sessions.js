import { useSessionContext } from "../../contexts/SessionContext";
import SessionInfo from "./SessionInfo/SessionInfo";
import SessionManager from "./SessionManager/SessionManager";

export default function Sessions() {

  const { sessionIsRunning } = useSessionContext();

  return (
    <div className="w-full h-full">
      {sessionIsRunning ? (
        <SessionInfo />
      ) : (
        <SessionManager />
      )}
      <div className={`absolute bottom-2 left-4 text-sm`}>IPv4: {window.api.getIP()}</div>
    </div>
  )
}
