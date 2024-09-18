import { useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSphere } from "@react-three/cannon"; // For the coin collider

const debug = false;

const Coins = ({ carRef, onCoinHit, setCoinCount }) => {
  const initialCoins = [
    { id: 10, position: [-0.5, 0.05, 0], visible: true, transparent: false, radius: 0.05 },
    { id: 1, position: [-1, 0.05, 0], visible: true, transparent: false, radius: 0.05 },
    { id: 2, position: [-1.5, 0.05, 0], visible: true, transparent: false, radius: 0.05 },
    { id: 3, position: [-2, 0.05, 0], visible: true, transparent: false, radius: 0.05 },
    { id: 4, position: [-2.5, 0.05, 0], visible: true, transparent: false, radius: 0.05 },
    { id: 5, position: [-3, 0.05, 0], visible: true, transparent: false, radius: 0.05 },
    { id: 6, position: [-3.5, 0.05, 0], visible: true, transparent: false, radius: 0.05 },
    { id: 7, position: [-4, 0.05, 0], visible: true, transparent: false, radius: 0.05 },
    { id: 8, position: [-4.5, 0.05, 0], visible: true, transparent: false, radius: 0.05 },
    { id: 9, position: [-5, 0.05, 0], visible: true, transparent: false, radius: 0.05 },
  ];

  const [coins, setCoins] = useState(initialCoins);
  const collisionDistance = 0.1; // Collision threshold (adjust as needed)

  const handleHit = (coinId, api) => {
    // Disable physics on the coin by setting velocity to 0 and its mass to 0
    api.velocity.set(0, 0, 0); 
    api.position.set(0, 0, 0);
    api.mass.set(0); 

    setCoins((prevCoins) =>
      prevCoins.map((coin) =>
        coin.id === coinId
          ? { ...coin, visible: false, transparent: true }
          : coin
      )
    );

    // Increment coin count and log to console
    setCoinCount((prevCount) => {
      const newCount = prevCount + 1;
      console.log(`Coins collected: ${newCount}`);
      return newCount;
    });

    // Trigger the speed boost effect
    onCoinHit();
  };

  const ColliderCoin = ({ position, radius, coinId }) => {
    const [ref, api] = useSphere(() => ({
      args: [radius],
      position,
      type: "Kinematic", // This makes sure it only responds to events and not physics interactions
      mass: 0, // Ensures the coin doesn't affect the car
      isTrigger: true, // This makes sure the collision does not affect the car physically
      onCollide: () => handleHit(coinId, api), 
    }));

    return (
      debug && (
        <mesh ref={ref} position={position}>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshBasicMaterial transparent={true} opacity={0.25} />
        </mesh>
      )
    );
  };

  useFrame(() => {
    if (!carRef?.current) return;

    // Get the car's world position
    const carPosition = new THREE.Vector3();
    carRef.current.getWorldPosition(carPosition);

    setCoins((prevCoins) =>
      prevCoins.map((coin) => {
        if (coin.visible && !coin.transparent) {
          // Get coin's world position
          const coinPosition = new THREE.Vector3(...coin.position);
          const distance = carPosition.distanceTo(coinPosition);

          if (distance < collisionDistance) {
            // Trigger hit when the car is close to the coin
            handleHit(coin.id, coin.api);
          }
        }
        return coin;
      })
    );
  });

  return (
    <>
      {coins.map(
        (coin) =>
          coin.visible && (
            <mesh key={coin.id} position={coin.position}>
              <sphereGeometry args={[coin.radius, 32, 32]} />
              <meshStandardMaterial
                color={coin.transparent ? "transparent" : "gold"}
                emissive={coin.transparent ? "transparent" : "yellow"}
                emissiveIntensity={1.5}
                metalness={0.7}
                roughness={0.3}
                opacity={coin.transparent ? 0 : 1}
                transparent={true}
              />
              <ColliderCoin
                key={`collider-${coin.id}`}
                position={coin.position}
                radius={coin.radius}
                coinId={coin.id}
              />
            </mesh>
          )
      )}
    </>
  );
};

export default Coins;
