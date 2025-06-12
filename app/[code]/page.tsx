"use client";

import React, { use, useEffect, useState } from "react";
import EndGame from "./EndGame";
import { supabase } from "@/lib/supabaseClient";
import { useRef } from "react";

export default function Lobby({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const resolvedParams = use(params);
  const lobbyCode = resolvedParams.code as string;
  const buttonStyle = "py-3 w-30 rounded-full text-black ";

  const [players, setPlayers] = useState<any[]>([]);
  const roomRef = useRef<any>(null);

  const handleLeaveGame = async () => {
    if (roomRef.current) {
      await roomRef.current.unsubscribe(); // Leave the presence channel
      console.log("✅ Left presence channel");
    }

    // Navigate away from the page
    window.location.href = "/";
  };

  const handleStartGame = async () => {
    if (roomRef.current) {
      await roomRef.current.unsubscribe(); // Leave the presence channel
      console.log("✅ Started game");
    }

    // Navigate away from the page
    window.location.href = "/game";
  };

  useEffect(() => {
    const setupPresence = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("User not signed in");
        return;
      }

      console.log("User: ", user);

      const room = supabase.channel(`presence-${lobbyCode}`, {
        config: {
          presence: { key: user.id },
        },
      });

      roomRef.current = room;

      room
        .on("presence", { event: "sync" }, () => {
          const newState = room.presenceState();
          const players = Object.values(newState).flat();
          console.log("🔁 Presence Sync:", players);
          setPlayers(players); // this will update your UI
        })
        .on("presence", { event: "join" }, ({ key, newPresences }) => {
          console.log("🟢 Player joined:", key, newPresences);
        })
        .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
          console.log("🔴 Player left:", key, leftPresences);
        })
        .subscribe(async (status) => {
          console.log("metadata: ", user.user_metadata);
          if (status === "SUBSCRIBED") {
            await room.track({
              name: user.user_metadata.name || "Unnamed",
            });
          }
        });

      return () => {
        room.unsubscribe();
      };
    };

    setupPresence();
  }, [lobbyCode]);

  return (
    <>
      <div
        id="main-content"
        className="flex flex-col justify-center items-center mx-10 h-screen"
      >
        <h1 className="text-5xl/15 text-center">
          Lobby Code: <br />
          <div
            // onClick={copyLobbyCode}
            className="bg-red-900 rounded-xl cursor-pointer"
          >
            <b>{lobbyCode}</b>
          </div>
        </h1>
        <h2 className="text-3xl/15 text-center">Players:</h2>
        <div>
          {players.map((player, index) => (
            <div key={index} className="my-2 flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p>{player.name}</p>
            </div>
          ))}
        </div>
        <div className="space-x-4 mt-10">
          <button
            onClick={handleStartGame}
            id="start-game-button"
            className={buttonStyle + "bg-yellow-300"}
          >
            Start Game
          </button>
          <button
            onClick={handleLeaveGame}
            id="leave-game-button"
            className={buttonStyle + "bg-blue-300"}
          >
            Leave Game
          </button>
        </div>
        <EndGame code={lobbyCode} />
      </div>
    </>
  );
}

{
  /* {namesArray.map((item, index) => (
            <div key={index}>
              <div className="my-3 h-0.5 w-full bg-gray-700 rounded" />
              <div className="flex flex-row space-x-1.5">
                <Image
                  src="/icon.png"
                  alt="Craig's Logo"
                  width={25}
                  height={25}
                  className="opacity-50 w-auto h-auto"
                />
                <p className="p-1">{item}</p>
                <button className="hover:bg-red-600/30 rounded-lg text-red-400">
                  (Remove)
                </button>
              </div>
            </div>
          ))} */
}
