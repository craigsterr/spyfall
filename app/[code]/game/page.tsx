"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import CountdownTimer from "./CountdownTimer";
import { supabase } from "@/lib/supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useRef } from "react";
import { closeLobby } from "@/lib/lobby";

export default function Game({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const router = useRouter();
  // For display in the lobby
  const locationsArray = [
    "Airplane",
    "Bank",
    "Beach",
    "Cathedral",
    "Circus Tent",
    "Corporate Party",
    "Crusader Army",
    "Casino",
    "Day Spa",
    "Embassy",
    "Hospital",
    "Hotel",
    "Military Base",
    "Movie Studio",
    "Ocean Liner",
    "Passenger Train",
    "Pirate Ship",
    "Polar Station",
    "Police Station",
    "Restaurant",
    "School",
    "Service Station",
    "Space Station",
    "Submarine",
    "Supermarket",
    "Theater",
    "University",
  ];

  const buttonStyle = "py-3 w-30 rounded-full text-black ";
  const h2Style = "text-3xl text-center";

  const [locationArrayStyles, setLocationArrayStyles] = useState<number[]>(
    Array(locationsArray.length).fill(false)
  );

  const toggleCrossLocn = (index: number) => {
    setLocationArrayStyles((prev) => {
      const newArr = [...prev];
      newArr[index] = (newArr[index] + 1) % 4;
      return newArr;
    });
  };

  const setNameStyle = (index: number) => {
    setNameArrayStyles((prev) => {
      const newArr = [...prev];
      newArr[index] = (newArr[index] + 1) % 4;
      return newArr;
    });
  };

  function getClassForStyle(value: number) {
    const baseClass = "p-1 transition-all cursor-pointer ";
    let addedClass = "";
    switch (value) {
      case 1:
        addedClass = "underline text-green-400";
        break;
      case 2:
        addedClass = "underline text-red-400";
        break;
      case 3:
        addedClass = "line-through text-gray-500";
        break;
    }

    return baseClass + addedClass;
  }

  const maxTimeS = 60 * 8;

  const resolvedParams = use(params);
  const lobbyCode = resolvedParams.code as string;

  const [namesArray, setNamesArray] = useState<string[]>([]);
  const [nameArrayStyles, setNameArrayStyles] = useState<number[]>(
    Array(namesArray.length).fill(false)
  );
  const roomRef = useRef<RealtimeChannel>(null);

  const [location, setLocation] = useState("Loading...");
  const [role, setRole] = useState<string | undefined>("Loading...");
  const [isSpy, setIsSpy] = useState<boolean | undefined>(undefined);

  // Grabs the players in the database corresponding to the code for the list
  useEffect(() => {
    async function grabPlayers() {
      const { data, error } = await supabase
        .from("players")
        .select("name")
        .eq("lobby_code", lobbyCode);

      if (error) throw new Error("Error grabbing players: ", error);

      const playersList = data.map((item) => item.name);

      setNamesArray(playersList);
    }

    grabPlayers();

    const setupPresence = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("User not signed in");
        return;
      }

      const { data: dataSpy, error: errorSpy } = await supabase
        .from("players")
        .select("is_spy")
        .eq("id", user.id)
        .single();

      if (errorSpy) throw errorSpy;

      if (dataSpy?.is_spy) setIsSpy(dataSpy?.is_spy);

      const { data: dataSpyD, error: errorSpyD } = await supabase
        .from("players")
        .select("name")
        .eq("is_spy", true)
        .eq("lobby", lobbyCode);

      if (errorSpyD) throw errorSpyD;

      console.log(dataSpyD, " is the SPY!");

      const { data: dataRole, error: errorRole } = await supabase
        .from("players")
        .select("role")
        .eq("id", user.id)
        .single();

      if (errorRole) throw errorRole;

      if (dataRole?.role) setRole(dataRole?.role);

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
          console.log("players: ", players);
        })
        .on("presence", { event: "join" }, ({ key, newPresences }) => {
          console.log("🟢 Player joined:", key, newPresences);
        })
        .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
          console.log("🔴 Player left:", key, leftPresences);
        })
        .on("broadcast", { event: "end-game" }, () => {
          if (!hasAlertedRef.current) {
            hasAlertedRef.current = true;
            alert("Room was closed!");
            router.push("/");
          }
        })
        .on("broadcast", { event: "voting" }, () => {
          router.push("/");
          alert("Room was closed!");
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

    async function grabCurrentLobby() {
      const { data, error } = await supabase
        .from("lobbies")
        .select("location")
        .eq("code", lobbyCode)
        .single();

      if (error) {
        throw error;
      }

      if (data.location) {
        setLocation(data.location);
      }
    }

    grabCurrentLobby();
  }, []);

  useEffect(() => {
    setNameArrayStyles(Array(namesArray.length).fill(0));
  }, [namesArray]);

  const hasAlertedRef = useRef(false);

  return (
    <>
      <div
        id="main-content"
        className="flex flex-col text-center items-center mx-10 mt-10 space-y-10"
      >
        <div className="space-y-3">
          {!isSpy ? (
            <>
              <h2 className={h2Style}>
                Your location: <br />
                <b>{location}</b>
              </h2>
              <h2 className={h2Style}>
                Your role:
                <br /> <b>{role}</b>
              </h2>
            </>
          ) : (
            <>
              <h2 className={h2Style}>
                <b>You</b> are the <b>SPY!</b>
              </h2>
            </>
          )}
          <div className="my-3 h-0.5 w-full bg-gray-700 rounded" />
        </div>
        <div>
          <CountdownTimer initialSeconds={maxTimeS} />
          <div className="my-3 h-0.5 w-full bg-gray-700 rounded" />
        </div>
        <div className="space-y-5">
          <h2 className={h2Style}>
            <b>Players</b>
            <div className="my-3 h-0.5 w-full bg-gray-700 rounded" />
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {namesArray.map((item, index) => (
              <div key={index}>
                <div className="flex justify-center items-center">
                  <p
                    onClick={() => setNameStyle(index)}
                    className={getClassForStyle(nameArrayStyles[index])}
                  >
                    {item}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <h2 className={h2Style}>
            <b>Locations</b>
          </h2>
          <div className="my-3 h-0.5 w-full bg-gray-700 rounded" />
          <ul className="grid grid-cols-3 space-x-4 space-y-4">
            {locationsArray.map((location, index) => (
              <li
                onClick={() => toggleCrossLocn(index)}
                key={index}
                className={getClassForStyle(locationArrayStyles[index])}
              >
                {location}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xl">
          <b>Hint:</b> Tap on the names/locations multiple times to note a
          person as suspicious/clear!
        </p>
        <button
          onClick={() => {
            closeLobby(lobbyCode);
            roomRef.current?.send({
              type: "broadcast",
              event: "end-game",
            });
            router.push("/");
          }}
          id="end-game-button"
          className={buttonStyle + "bg-red-500 my-5"}
        >
          <b>End Game</b>
        </button>
      </div>
    </>
  );
}
