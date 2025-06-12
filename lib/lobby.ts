import { supabase } from "./supabaseClient";

// For pushing the lobby code and player info to the database
export async function createLobby(userId: string, code: string, name: string) {
  const { error: lobbyError } = await supabase
    .from("lobbies")
    .insert([{ code, status: "waiting" }]);

  if (lobbyError) {
    throw new Error(`Failed to create lobby: ${lobbyError.message}`);
  }

  await upsertUser(userId, code, name);
}

export async function joinLobby(userId: string, code: string, name: string) {
  const { data: lobby, error } = await supabase
    .from("lobbies")
    .select("*")
    .eq("code", code)
    .single();

  if (!lobby || error) throw new Error("Lobby not found!");

  await upsertUser(userId, code, name);
}

async function upsertUser(userId: string, code: string, name: string) {
  console.log("name: ", name);

  const { error: upsertError } = await supabase
    .from("players")
    .upsert([{ id: userId, name, lobby_code: code }]);

  if (upsertError) {
    throw new Error(`Failed to upsert user: ${upsertError.message}`);
  }

  const { error } = await supabase.auth.updateUser({
    data: { name },
  });

  if (error) {
    throw new Error(`Failed to update metadata: ${error.message}`);
  }
}

export async function closeLobby(code: string) {
  // First delete all players in the lobby
  const { data: playerData, error: playerError } = await supabase
    .from("players")
    .delete()
    .eq("lobby_code", code);

  if (playerError) {
    console.error("Failed to delete lobby:", playerError);
  } else {
    console.log("Lobby deleted with code:", code);
    console.log("Deleted lobby data:", playerData);
  }

  // Then delete the lobby itself
  const { data: lobbyData, error: lobbyError } = await supabase
    .from("lobbies")
    .delete()
    .eq("code", code);

  if (lobbyError) {
    console.error("Failed to delete lobby:", lobbyError);
  } else {
    console.log("Lobby deleted with code:", code);
    console.log("Deleted lobby data:", lobbyData);
  }
}
