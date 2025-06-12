"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import CountdownTimer from "./CountdownTimer";

export default function Lobby() {
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
  const namesArray = [
    "craig",
    "michael",
    "joseph",
    "ashley",
    "jessica",
    "jamie",
    "elizabeth",
    "atlas",
  ];

  const location = "Ocean Liner";
  const role = "Sea Man";
  const isSpy = false;

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

  const [nameArrayStyles, setNameArrayStyles] = useState<number[]>(
    Array(namesArray.length).fill(false)
  );

  const setNameStyle = (index: number) => {
    setNameArrayStyles((prev) => {
      const newArr = [...prev];
      newArr[index] = (newArr[index] + 1) % 4;
      return newArr;
    });
  };

  function getClassForStyle(value) {
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

  const maxTimeS = 2000;

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
              <div className="my-3 h-0.5 w-full bg-gray-700 rounded" />
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
          onClick={() => router.push("/")}
          id="join-game-button"
          className={buttonStyle + "bg-red-500 my-5"}
        >
          <b>End Game</b>
        </button>
      </div>
    </>
  );
}
