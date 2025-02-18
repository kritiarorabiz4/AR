import { useFrame, useState } from "@react-three/fiber";
import { useRef } from "react";

const Object = () => {
  const mesh = useRef();
  const [vertices, setVertices] = useState([]);

  const generate3DModel = async () => {
    if (images.length === 0) return;

    const newVertices = [];
    const newColors = [];

    for (let imgSrc of images) {
      const img = new Image();
      img.src = imgSrc;
      await img.decode();

      // Placeholder for depth estimation (replace with a suitable alternative)
      // Since we're removing TensorFlow, we need a different approach.
      // One simple (but less accurate) alternative is to use the image's
      // luminance (brightness) as a proxy for depth.  Darker areas will be
      // considered "deeper".

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height).data;


      for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
          const index = (y * img.width + x) * 4;
          const r = imageData[index];
          const g = imageData[index + 1];
          const b = imageData[index + 2];

          // Calculate luminance (simple average for demonstration)
          const luminance = (r + g + b) / 3;
          const depthValue = 1 - (luminance / 255); // Invert for depth (darker = deeper)

          newVertices.push(x / img.width - 0.5, -(y / img.height - 0.5), depthValue * 0.2); // Scale depth for visibility
          newColors.push(r / 255, g / 255, b / 255); // Use original color
        }
      }
    }

    setVertices(newVertices);
    setColors(newColors);
  };
  
  useFrame(() => {
    // <-- This is the crucial change
    if (mesh.current && vertices.length > 0) {
      const geometry = mesh.current.geometry;
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3)
      );
      geometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(colors, 3)
      );
      geometry.computeVertexNormals();
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
    }
  });

  return (
    <>
      {vertices.length > 0 && ( // Conditionally render the points
        <points ref={mesh}>
          <bufferGeometry />
          <pointsMaterial vertexColors size={0.01} />
        </points>
      )}
    </>
  );
};

export default Object;
