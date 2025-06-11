"use client";

import { closeLobby } from "@/lib/lobby";
import { useRouter } from "next/navigation";

export default function EndGame({ code }: { code: string }) {
  const buttonStyle = "py-3 w-30 rounded-full text-black ";
  const router = useRouter();
  return (
    <button
      onClick={() => {
        closeLobby(code);
        router.push("/");
      }}
      id="join-game-button"
      className={buttonStyle + "bg-red-500 my-5"}
    >
      <b>End Game</b>
    </button>
  );
}
