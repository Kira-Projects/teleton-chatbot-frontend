import React from "react"

const CopilotChat: React.FC = () => {
  return (
    <iframe
      src="https://copilotstudio.microsoft.com/environments/Default-822a158f-1982-4be3-afd9-2331aa35b01b/bots/cr3a3_teletonDeResponde/webchat?__version__=2"
      frameBorder="0"
      style={{
        width: "300px",
        height: "500px",
        zIndex: 9999,
        position: "absolute",
        bottom: "0px",
        left: "0px",
      }} // Ajusta la altura a lo que necesites
      title="Copilot Studio Chat"
    ></iframe>
  )
}

export default CopilotChat
