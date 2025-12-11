import Particles from "@tsparticles/react";
import { useMemo } from "react";

export default function ParticlesBackground() {

  const options = useMemo(() => ({
    background: { color: "transparent" },
    fpsLimit: 60,

    particles: {
      number: { value: 30 },
      size: { value: 3 },
      move: { enable: true, speed: 1 },
      opacity: { value: 0.4 },

      links: {
        enable: true,
        distance: 140,
        color: "#ffffff",
        opacity: 0.3,
        width: 1,
      },
    },
  }), []);

  return (
    <Particles
      id="loginParticles"
      options={options}
      particlesLoaded={async () => {}}
    />
  );
}
