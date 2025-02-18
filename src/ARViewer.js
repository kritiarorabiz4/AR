import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { XRButton, XR, useXR } from "@react-three/xr";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { Html5QrcodeScanner } from "html5-qrcode";
import * as THREE from "three";

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1} />;
}

function PlacementIndicator() {
  const ref = useRef();
  const { isPresenting } = useXR();

  useFrame(({ camera }) => {
    if (isPresenting) {
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera({ x: 0, y: 0 }, camera);

      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      plane.rotation.x = -Math.PI / 2; // Corrected rotation

      const intersection = raycaster.intersectObject(plane);
      if (intersection.length > 0) {
        ref.current.position.copy(intersection[0].point);
      }
    }
  });

  return (
    <mesh ref={ref} scale={[0.1, 0.1, 0.01]} rotation-x={-Math.PI / 2}>
      <planeGeometry />
      <meshBasicMaterial color="white" transparent opacity={0.5} />
    </mesh>
  );
}

function ARViewer() {
  const [modelUrl, setModelUrl] = useState(null);
  const [modelPlaced, setModelPlaced] = useState(false);
  const modelRef = useRef();
  const [placementPosition, setPlacementPosition] = useState([0, 0, 0]);
  const { isPresenting } = useXR();
  const [hasScanned, setHasScanned] = useState(false); // Track if QR has been scanned

  useEffect(() => {
    const qrScanner = new Html5QrcodeScanner(
      "qr-scanner",
      { fps: 10, qrbox: 250 },
      false
    );

    qrScanner.render((decodedText) => {
      console.log("QR Code Scanned:", decodedText);
      setModelUrl(decodedText);
      qrScanner.clear();
      setHasScanned(true); // Set flag after successful scan
    });

    return () => {
      qrScanner.clear();
    };
  }, []);

  const placeModel = () => {
    if (placementPosition && modelRef.current) {
      modelRef.current.position.set(...placementPosition);
      setModelPlaced(true);
    }
  };

  const onSelectStart = (event) => {
    if (!modelPlaced && isPresenting) {
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera({ x: 0, y: 0 }, event.frame.camera);

      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      plane.rotation.x = -Math.PI / 2;

      const intersection = raycaster.intersectObject(plane);
      if (intersection.length > 0) {
        setPlacementPosition(intersection[0].point.toArray());
      }
    }
  };

  return (
    <>
      <div id="qr-scanner" style={{ width: "100%", maxWidth: "500px", margin: "0 auto" }} />
      {/* Conditionally render the AR view based on scan and URL */}
      {hasScanned && modelUrl && (
        <>
          <XRButton
            mode="AR"
            sessionInit={{
              requiredFeatures: ["hit-test"],
              optionalFeatures: ["dom-overlay"],
            }}
            style={{ /* ... your button styles ... */ }}
          >
            Enter AR
          </XRButton>
          <Canvas>
            <XR onSelectStart={onSelectStart}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={0.5} />
              <Suspense fallback={null}>
                <Model url={modelUrl} ref={modelRef} />
                {!modelPlaced && isPresenting && <PlacementIndicator />}
              </Suspense>
              {!modelPlaced && isPresenting && (
                <mesh onClick={placeModel} position={[0, 0, -2]}> {/* Clickable plane */}
                  <planeGeometry />
                  <meshBasicMaterial transparent opacity={0} />
                </mesh>
              )}
            </XR>
            {!isPresenting && <OrbitControls />}
          </Canvas>
        </>
      )}
    </>
  );
}

export default ARViewer;