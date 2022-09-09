import { Button } from "@mui/material";

export default function Sessions() {
  return (
    <div className="w-full h-full bg-gray-200 flex justify-center items-center" >
      <Button variant="contained" onClick={() => console.log(`I've been hit!`)}>Start Session</Button>
    </div>
  )
}
