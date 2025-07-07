import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import { Car } from "./Car";
import { Ground } from "./Ground";
import { Track } from "./Track";
import { useRef } from "react";

export function Scene({ coinCount, setCoinCount }) {
  const [thirdPerson, setThirdPerson] = useState(false);
  const [cameraPosition, setCameraPosition] = useState([-6, 3.9, 6.21]);
  const carRef = useRef();

  useEffect(() => {
    function keydownHandler(e) {
      if (e.key == "k") {
       
        if(thirdPerson) setCameraPosition([-6, 3.9, 6.21 + Math.random() * 0.1]);
        setThirdPerson(!thirdPerson); 
      }
    }

    window.addEventListener("keydown", keydownHandler);
    return () => window.removeEventListener("keydown", keydownHandler);
  }, [thirdPerson]);

  return (
    <Suspense fallback={null}>
      <Environment
        files={process.env.PUBLIC_URL + "/textures/envmap.hdr"}
        background={"both"}
      />

      <PerspectiveCamera makeDefault position={cameraPosition} fov={40} />
      {!thirdPerson && (
        <OrbitControls target={[-2.64, -0.71, 0.03]} />
      )}

      <Ground />
      <Track carRef={carRef} coinCount={coinCount} setCoinCount={setCoinCount} />
      <Car ref={carRef} thirdPerson={thirdPerson} />
    </Suspense>
  );
}
