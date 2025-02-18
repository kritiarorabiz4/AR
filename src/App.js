import React, { useState, useEffect } from "react";
import ModelViewer from "./ModelViewer";
import ARViewer from "./ARViewer";
import { QRCodeSVG } from "qrcode.react";

function App() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const modelUrl = "https://drive.google.com/file/d/1ezSpgFTLAP_XfldFnc4pQsda8D7ozBCo/view?usp=drive_link";
  // const [modelUrl, setModelUrl] = useState("/models/model.glb");
  useEffect(() => {
    // Generate QR code URL based on current URL
    setQrCodeUrl('/models/model.glb'); // Or a specific URL if needed
  }, []);

  return (
    <div className="App">
      {isMobile ? (
        <>
        {console.log("mobile")}
        <ARViewer modelUrl="/models/model.glb" />
        </>
      ) : (
        <div>
        {console.log("web")}
          <ModelViewer />
          <h1>Scan the QR Code with your phone to view in AR</h1>
          {qrCodeUrl && (
            <QRCodeSVG value={modelUrl} size={256} level="H" /> // Or QRCodeCanvas
          )}
        </div>
      )}
    </div>
  );
}

export default App;
