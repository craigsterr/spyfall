"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { UUID } from "crypto";

type Player = {
  id: UUID;
  is_spy: boolean;
  lobby_code: string;
  name: string;
  role: string;
};

export default function RealtimePlayers({
  serverPlayers,
}: {
  serverPlayers: Player[];
}) {
  const [players, setPlayers] = useState<Player[]>(serverPlayers);
  useEffect(() => {
    const channel = supabase
      .channel("realtime_players")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
        },
        (payload) => {
          console.log("Realtime update:", payload);
          setPlayers((prev) => [...prev, payload.new as Player]);
          console.log("PASS setPlayers");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <pre>{JSON.stringify(players, null, 2)}</pre>;
}
