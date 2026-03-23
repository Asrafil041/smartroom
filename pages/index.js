import { useEffect, useRef } from "react";
import Phaser from "phaser";

export default function Home() {
  const gameRef = useRef(null);
  useEffect(() => {
    if (gameRef.current) return;
    const config = { /* ...lihat contoh sebelumnya...*/ };
    gameRef.current = new Phaser.Game(config);
  }, []);
  return <div id="phaser-container" />;
}