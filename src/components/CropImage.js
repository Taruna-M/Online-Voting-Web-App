// CropImage.js
import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './crop'; // Ensure this function is correctly imported from the provided example
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import './styling/style.css'
const CropImage = ({ image, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    const croppedImage = await getCroppedImg(image, croppedAreaPixels);
    onCropComplete(croppedImage);
  };

  return (
    <Modal show centered>
      <Modal.Header>
        <Modal.Title>Crop Image</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="crop-container p-5">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1 / 1}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
          />
        </div>
        <div className="controls mt-5">
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(e.target.value)}
            className="zoom-range"
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => onCropComplete(null)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleCrop}>
          Crop
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CropImage;
