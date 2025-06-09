const TITLE_NAME = "Spyfall Unlimited";
const inputStyle = "outline outline-2 rounded-lg p-3 ";
const buttonStyle = "py-3 w-30 rounded-full ";

export default function Home() {
  return (
    <>
      <div
        id="main-content"
        className="flex flex-col justify-center items-center mx-10 h-screen -mt-20 space-y-15"
      >
        <h1 className="text-5xl text-center">
          Welcome to <br></br>
          <b>{TITLE_NAME}</b>!
        </h1>
        <div className="my-4 h-1 bg-gray-400 rounded"></div>

        <div id="inputs" className="flex flex-col space-y-7 justify center">
          <input
            type="text"
            placeholder="Enter code here..."
            className={inputStyle}
          />
          <div id="buttons" className="space-x-3">
            <button
              id="create-game-button"
              className={buttonStyle + "bg-gray-300"}
            >
              Create Game
            </button>
            <button
              id="join-game-button"
              className={buttonStyle + "bg-gray-300"}
            >
              Join Game
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
