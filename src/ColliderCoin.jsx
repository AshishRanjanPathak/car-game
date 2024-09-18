import { useSphere } from "@react-three/cannon";

export function ColliderCoin({ position, radius, onCollect }) {
  const [ref] = useSphere(() => ({
    args: [radius], // The radius of the coin
    position,
    type: "Kinematic", // Kinematic so it doesn't affect other physics objects
    onCollide: (e) => {
      // Check if the colliding body is the car
      if (e.body.userData && e.body.userData.type === 'car') {
        onCollect(); // Trigger action when the car touches the coin
      }
    },
    collisionFilterGroup: 1, // Group for coins
    collisionFilterMask: 1 | 2, // Collide with the car and other coins
  }));

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshBasicMaterial transparent={true} opacity={0.25} />
    </mesh>
  );
}
