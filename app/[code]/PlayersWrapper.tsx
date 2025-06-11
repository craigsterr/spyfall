import { supabase } from "@/lib/supabaseClient";
import RealtimePlayers from "./RealtimePlayers";

export default async function PlayersWrapper({ code }: { code: string }) {
  const { data, error } = await supabase
    .from("players")
    .select()
    .eq("lobby_code", code);

  if (error) {
    console.error(error);
    return <p>Error loading player list</p>;
  }

  return <RealtimePlayers serverPlayers={data} code={code} />;
}
