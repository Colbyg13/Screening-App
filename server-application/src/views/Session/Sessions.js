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
    </div>
  )
}
