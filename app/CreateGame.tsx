import { createLobby, joinLobby } from "@/lib/lobby";

export default function CreateGame() {
  function generateCode(length = 4) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
      const randInt = Math.floor(Math.random() * chars.length);
      code += chars[randInt];
    }

    return code;
  }

  async function handleJoinGame(code: string) {
    await joinLobby(code, "TEST");
    if (inputCode.trim() !== "" && inputCode.length <= 4) {
      redirect(`/${inputCode.trim().toUpperCase()}`);
    } else if (inputCode.length > 4) {
      alert("Code must be at most four characters!");
    } else {
      alert("Enter a valid lobby code!");
    }
  }
  return (
    <button
      onClick={async () => {
        const code = generateCode();
        await createLobby(code, "TEST");
        redirect(`/${code}`);
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
  );
}
