import { useBox, useRaycastVehicle } from "@react-three/cannon";
import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Quaternion, Vector3, Euler } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useControls } from "./useControls";
import { useWheels } from "./useWheels";
import { WheelDebug } from "./WheelDebug";

export function Car({ thirdPerson }) {
  let result = useLoader(
    GLTFLoader,
    process.env.PUBLIC_URL + "/models/car.glb"
  ).scene;

  const position = [-1.5, 0.5, 3];
  const width = 0.15;
  const height = 0.07;
  const front = 0.15;
  const wheelRadius = 0.05;

  const chassisBodyArgs = [width, height, front * 2];
  const [chassisBody, chassisApi] = useBox(
    () => ({
      allowSleep: false,
      args: chassisBodyArgs,
      mass: 250,
      position,
      fixedRotation: false, // Allows rotation, but we control it manually
    }),
    useRef(null)
  );

  const [wheels, wheelInfos] = useWheels(width, height, front, wheelRadius);
  const [vehicle, vehicleApi] = useRaycastVehicle(
    () => ({
      chassisBody,
      wheelInfos,
      wheels,
    }),
    useRef(null)
  );

  useControls(vehicleApi, chassisApi);

  // Mouse state for camera control
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [cameraRotation, setCameraRotation] = useState({
    x: 0,
    y: 0,
  });

  useFrame((state) => {
    if (!thirdPerson) return;
  
    // Get the car's position, rotation, and velocity
    let carPosition = new Vector3();
    let carQuaternion = new Quaternion();
    chassisBody.current.getWorldPosition(carPosition);
    chassisBody.current.getWorldQuaternion(carQuaternion);
  
    // Convert car's quaternion to Euler angles for rotation
    let carEuler = new Euler().setFromQuaternion(carQuaternion);
  
    // Calculate velocity for dynamic camera adjustments
    const velocity = new Vector3();
    chassisApi.velocity.subscribe((v) => velocity.set(...v));
    const speed = velocity.length();
  
    // Dynamic camera distance and height based on speed
    const cameraDistance = 0.5 + speed * 0.01;
    const cameraHeight = 0.2 + speed * 0.01;
  
    // Define the camera offset behind the car
    const cameraOffset = new Vector3(0, cameraHeight, cameraDistance);
    
    // Calculate camera position with a fixed rear view
    const desiredCameraPosition = carPosition.clone().add(cameraOffset.applyQuaternion(carQuaternion));
  
    // Check if the car is in the air by checking if any wheels are grounded
    const isInAir = wheels.every((wheelRef) => {
      const wheelWorldPosition = new Vector3();
      wheelRef.current.getWorldPosition(wheelWorldPosition);
      return wheelWorldPosition.y > carPosition.y + wheelRadius * 1.5;
    });
  
    // Smoothly move the camera to the calculated position
    state.camera.position.lerp(desiredCameraPosition, 0.02); // Lower lerp factor for smoother movement
  
    if (!isInAir) {
      // On the ground: Smoothly update the camera's rotation to follow the car's yaw (keep it stable in yaw)
      const stableQuaternion = new Quaternion().setFromEuler(new Euler(0, carEuler.y, 0));
      state.camera.quaternion.slerp(stableQuaternion, 0.02); // Lower slerp factor for smoother rotation
    }
  
    // Keep the camera looking at the car
    state.camera.lookAt(carPosition);
  });
  
  useEffect(() => {
    if (!result) return;

    let mesh = result;
    mesh.scale.set(0.0012, 0.0012, 0.0012);
    mesh.children[0].position.set(-365, -18, -67);
  }, [result]);

  return (
    <group ref={vehicle} name="vehicle">
      <group ref={chassisBody} name="chassisBody">
        <primitive
          object={result}
          rotation-y={Math.PI}
          position={[0, -0.055, 0]}
        />
      </group>

      <WheelDebug wheelRef={wheels[0]} radius={wheelRadius} />
      <WheelDebug wheelRef={wheels[1]} radius={wheelRadius} />
      <WheelDebug wheelRef={wheels[2]} radius={wheelRadius} />
      <WheelDebug wheelRef={wheels[3]} radius={wheelRadius} />
    </group>
  );
}
