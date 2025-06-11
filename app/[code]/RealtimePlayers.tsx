"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Player = {
  id: string;
  is_spy: boolean;
  lobby_code: string;
  name: string;
  role: string;
};

export default function RealtimePlayers({ code }: { code: string }) {
  const [presence, setPresence] = useState<Record<string, Player>>({});

  useEffect(() => {
    const room = supabase.channel(`presence-${code}`);

    room
      .on("presence", { event: "sync" }, () => {
        const newState = room.presenceState();
        console.log("sync", newState);
        // setPresence(newState);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("join", key, newPresences);
        // setPresence(room.presenceState());
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("leave", key, leftPresences);
        // setPresence(room.presenceState());
      });

    room.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await room.track({
          user_id: "user-id-123", // replace with actual user ID
          metadata: { name: "PlayerName" }, // replace with actual user metadata
        });
      }
    });

    return () => {
      supabase.removeChannel(room);
    };
  }, [code]);

  return <pre>{JSON.stringify(presence, null, 2)}</pre>;
}
