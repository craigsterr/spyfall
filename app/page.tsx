"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createLobby, joinLobby } from "@/lib/lobby";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

export default function Home() {
  const TITLE_NAME = "Spyfall Unlimited";
  const router = useRouter();

  // For repeated use of Tailwind styles
  const inputStyle = "outline outline-2 rounded-lg p-3 ";
  const buttonStyle = "py-3 w-30 rounded-full text-black ";

  // Set name and code for transferring the code/names to the database
  const [inputCode, setInputCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  function generateCode(length = 4) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
      const randInt = Math.floor(Math.random() * chars.length);
      code += chars[randInt];
    }

    return code;
  }

  async function handleJoinGame(code: string, name: string) {
    if (!name) {
      alert("Enter a name!");
      return;
    }

    const trimmedCode = inputCode.trim().toUpperCase();

    if (trimmedCode === "" || trimmedCode.length !== 4) {
      alert("Enter a valid 4-character lobby code!");
      return;
    }

    try {
      await joinLobby(userId || "", trimmedCode, name); // Wait for DB write
      router.push(`/${trimmedCode}`); // Then navigate
    } catch (err) {
      console.error("Failed to join lobby:", err);
      alert("Could not join lobby. Does it exist?");
    }
  }

  const [userId, setUserId] = useState<string>();

  // On render
  useEffect(() => {
    async function checkSessionAndUser() {
      try {
        setLoading(true);
        setConnectionError(false);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          const { error } = await supabase.auth.signInAnonymously();
          if (error) throw error;
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        setUserId(user?.id);
      } catch (error) {
        setConnectionError(true);
        console.error("Supabase connection failed:", error);
        alert(
          "Unable to connect to authentication service. Please try again later."
        );
        setUserId(undefined); // Clear user ID so you don't rely on a stale or invalid value
      } finally {
        setLoading(false);
      }
    }

    checkSessionAndUser();
  }, []);
  console.log("userId: ", userId);

  if (loading)
    return (
      <div
        id="main-content"
        className="text-5xl text-center flex flex-col justify-center items-center mx-10 h-screen -mt-20 space-y-5"
      >
        <h2>Connecting to service...</h2>
        <Image src="/loading.gif" alt="loading-icon" width={100} height={100} />
      </div>
    );
  if (connectionError)
    return (
      <>
        <div
          id="main-content"
          className="text-2xl text-center flex flex-col justify-center items-center mx-10 h-screen -mt-20 space-y-5"
        >
          <h2>
            Sorry, the authentication service is currently unavailable. Please
            refresh or try again later.
          </h2>
        </div>
      </>
    );

  return (
    <>
      <div
        id="main-content"
        className="flex flex-col justify-center items-center mx-10 h-screen -mt-20 space-y-5"
      >
        {/* Title Card */}
        <h1 className="text-5xl text-center">
          Welcome to <br></br>
          <b>{TITLE_NAME}</b>!
          <div className="my-4 h-0.5 w-full bg-gray-400 rounded" />
        </h1>

        <div id="inputs" className="flex flex-col space-y-7 justify-center">
          {/* Input boxes */}
          <div className="flex flex-col justify-center space-y-4">
            <h2 className="mx-auto text-xl">Name:</h2>
            <input
              type="text"
              placeholder="Your name here..."
              className={inputStyle}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <h2 className="mx-auto text-xl">Lobby code:</h2>
            <input
              type="text"
              placeholder="CODE"
              className={inputStyle + "w-30 mx-auto"}
              onChange={(e) => setInputCode(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div id="buttons" className="space-x-3">
            <button
              id="create-game-button"
              onClick={async () => {
                try {
                  const code = generateCode();
                  await createLobby(userId || "", code, name);
                  router.push(`/${code}`);
                } catch (err) {
                  alert("Failed to create lobby");
                  console.error(err);
                }
              }}
              className={buttonStyle + "bg-blue-300"}
            >
              Create Game
            </button>
            <button
              id="join-game-button"
              onClick={() => handleJoinGame(inputCode, name)}
              className={buttonStyle + "bg-yellow-300"}
            >
              Join Game
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
