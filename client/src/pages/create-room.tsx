import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Loader2 } from "lucide-react";

export default function CreateRoom() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const playerName = searchParams.get("name") || "";

  useEffect(() => {
    // Generate a random 6-character room code
    const generateRoomCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    const roomCode = generateRoomCode();
    
    // Redirect to lobby with the generated room code
    setLocation(`/lobby/${roomCode}?name=${encodeURIComponent(playerName)}&host=true`);
  }, [playerName, setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-blue-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-neon-purple animate-spin mx-auto mb-4" />
        <p className="text-xl text-white font-medium">Creating your room...</p>
      </div>
    </div>
  );
}
