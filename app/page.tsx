"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createLobby, joinLobby } from "@/lib/lobby";

export default function Home() {
  const TITLE_NAME = "Spyfall Unlimited";
  const inputStyle = "outline outline-2 rounded-lg p-3 ";
  const buttonStyle = "py-3 w-30 rounded-full text-black ";

  const router = useRouter();
  const [inputCode, setInputCode] = useState("");
  const [name, setName] = useState("");

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
    }

    if (inputCode.trim() !== "" && inputCode.length <= 4) {
      router.push(`/${inputCode.trim().toUpperCase()}`);
    } else if (inputCode.length > 4) {
      alert("Code must be at most four characters!");
    } else {
      alert("Enter a valid lobby code!");
    }

    await joinLobby(code, name);
  }

  return (
    <>
      <div
        id="main-content"
        className="flex flex-col justify-center items-center mx-10 h-screen -mt-20 space-y-5"
      >
        <h1 className="text-5xl text-center">
          Welcome to <br></br>
          <b>{TITLE_NAME}</b>!
          <div className="my-4 h-0.5 w-full bg-gray-400 rounded" />
        </h1>

        <div id="inputs" className="flex flex-col space-y-7 justify-center">
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
          <div id="buttons" className="space-x-3">
            <button
              onClick={async () => {
                const code = generateCode();
                await createLobby(code, name);
                router.push(`/${code}`);
                try {
                } catch (err) {
                  alert("Failed to create lobby");
                  console.error(err);
                }
              }}
              id="create-game-button"
              className={buttonStyle + "bg-blue-300"}
            >
              Create Game
            </button>
            <button
              onClick={() => handleJoinGame(inputCode, name)}
              id="join-game-button"
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
