import { Button } from "@mui/material";
import { useSessionContext } from "../../contexts/SessionContext";

export default function Sessions() {

  const {
    sessionStarted,
    setSessionStarted,
    generalFields,
    stations,
    sessionRecords,
    createOrUpdateRecord,
  } = useSessionContext();

  console.log({
    sessionStarted,
    setSessionStarted,
    generalFields,
    stations,
    sessionRecords,
  })


  return (
    <div className="w-full h-full bg-gray-200 flex justify-center items-center" >
      <div className="flex flex-col space-y-4 text">
        {sessionStarted ? (
          <>
            <div>
              <h2 className="text-2xl ">General Info:</h2>
              {generalFields.map(({ name, value }) => (
                <div className="ml-4">{name} - {value}</div>
              ))}
            </div>
            <div>
              <h2 className="text-2xl ">Stations:</h2>
              {stations.map(({ name, fields = [] }) => (
                <div>
                  <div className="text-lg ml-4">{name}:</div>
                  {fields.map(({ name, type }) => (
                    <div className="ml-8">* {name} - {type}</div>
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
              onClick={() => setSessionStarted(false)}
            >
              Finish Session
            </Button>
          </>
        ) : (
          <Button
            size="large"
            variant="outlined"
            onClick={() => setSessionStarted(true)}
          >
            Start Session
          </Button>
        )}
      </div>
      <div className="absolute bottom-2 left-4 text-sm">IPv4: {window.api.getIP()}</div>
    </div>
  )
}
