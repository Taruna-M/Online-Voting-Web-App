import React, { useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';

const WebcamComponent = () => {
  const [scannedCode, setScannedCode] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const webcamRef = React.createRef();

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    const handleScan = (result) => {
      if (result) {
        setScannedCode(result.text);
      }
    };

    const handleError = (error) => {
      setCameraError(error);
    };

    if (webcamRef.current) {
      codeReader.decodeFromVideoDevice(webcamRef.current.video, null, handleScan, handleError);
    }

    return () => {
      codeReader.reset();
    };
  }, [webcamRef]);

  return (
    <div>
      <Webcam
        ref={webcamRef}
        onUserMediaError={(error) => setCameraError(error)}
        screenshotFormat="image/jpeg"
      />
      {scannedCode && (
        <p>Scanned code: {scannedCode}</p>
      )}
      {cameraError && (
        <p>Error: {cameraError.name}</p>
      )}
    </div>
  );
};

export default WebcamComponent;