import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/cannon";
import { Scene } from "./Scene"; // Import the Scene component
import "./index.css"; // Import styles

function App() {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Canvas>
        <Physics broadphase="SAP" gravity={[0, -2.8, 0]}>
          <Scene />
        </Physics>
      </Canvas>

      <div className="controls">
        <p>Time Elapsed: {elapsedTime} seconds</p>
        <p>Press W A S D to move</p>
        <p>Press K to swap camera</p>
        <p>Press R to reset</p>
        <p>Press arrows for flips</p>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
