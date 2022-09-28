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
      <div className="absolute bottom-2 right-4 text-sm">IPv4: {window.api.getIP()}</div>
    </div>

  )
  //   <div className="flex flex-col space-y-4 text">
  //     {sessionIsRunning ? (
  //       <>
  //         <div>
  //           <h2 className="text-2xl ">General Info:</h2>
  //           {generalFields.map(({ name, value }) => (
  //             <div className="ml-4" key={name}>{name} - {value}</div>
  //           ))}
  //         </div>
  //         <div>
  //           <h2 className="text-2xl ">Stations:</h2>
  //           {stations.map(({ name, fields = [] }) => (
  //             <div key={name}>
  //               <div className="text-lg ml-4">{name}:</div>
  //               {fields.map(({ name, type }) => (
  //                 <div className="ml-8" key={name}>* {name} - {type}</div>
  //               ))}
  //             </div>
  //           ))}
  //         </div>
  //         <div>
  //           <h2 className="text-2xl ">Records:</h2>
  //           {sessionRecords.map(record => (
  //             <div>Object.values(record)</div>
  //           ))}
  //         </div>
  //         <Button
  //           size="large"
  //           variant="outlined"
  //           onClick={stopSession}
  //         >
  //           Finish Session
  //         </Button>
  //       </>
  //     ) : (
  //       <Button
  //         size="large"
  //         variant="outlined"
  //         onClick={startSession}
  //       >
  //         Start Session
  //       </Button>
  //     )}
  //   </div>
  // </div>
  // )
}
