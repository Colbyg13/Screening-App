import { Button } from "@mui/material";
import { useSessionContext } from "../../contexts/SessionContext";

export default function Sessions() {

  const {
    sessionIsRunning,
    startSession,
    stopSession,
    generalFields,
    stations,
    sessionRecords,
  } = useSessionContext();

  return (
    <div className="w-full h-full flex justify-center items-center" >
      <div className="flex flex-col space-y-4 text">
        {sessionIsRunning ? (
          <>
            <div>
              <h2 className="text-2xl ">General Info:</h2>
              {generalFields.map(({ name, value }) => (
                <div className="ml-4" key={name}>{name} - {value}</div>
              ))}
            </div>
            <div>
              <h2 className="text-2xl ">Stations:</h2>
              {stations.map(({ name, fields = [] }) => (
                <div key={name}>
                  <div className="text-lg ml-4">{name}:</div>
                  {fields.map(({ name, type }) => (
                    <div className="ml-8" key={name}>* {name} - {type}</div>
                  ))}
                </div>
              ))}
            </div>
            <div>
              <h2 className="text-2xl ">Records:</h2>
              {sessionRecords.map(record => (
                <div>Object.values(record)</div>
              ))}
            </div>
            <Button
              size="large"
              variant="outlined"
              onClick={stopSession}
            >
              Finish Session
            </Button>
          </>
        ) : (
          <Button
            size="large"
            variant="outlined"
            onClick={startSession}
          >
            Start Session
          </Button>
        )}
      </div>
      <div className="absolute bottom-2 left-4 text-sm">IPv4: {window.api.getIP()}</div>
    </div>
  )
}
