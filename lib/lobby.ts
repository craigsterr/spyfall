import { supabase } from "./supabaseClient";

export async function createLobby(code: string, name: string) {
  signInUser(name, code);

  const { error: lobbyError } = await supabase
    .from("lobbies")
    .insert([{ code, status: "waiting" }]);

  const { error: playerError } = await supabase
    .from("players")
    .insert([{ name, lobby_code: code }]);

  if (lobbyError) {
    throw new Error(`Failed to create lobby: ${lobbyError.message}`);
  }

  if (playerError) {
    throw new Error(`Failed to create player: ${playerError.message}`);
  }
}

export async function joinLobby(code: string, name: string) {
  signInUser(name, code);

  const { data: lobby, error } = await supabase
    .from("lobbies")
    .select("*")
    .eq("code", code)
    .single();

  if (!lobby || error) throw new Error("Lobby not found!");

  const { error: playerError } = await supabase
    .from("players")
    .insert([{ name, lobby_code: code }]);

  if (playerError) throw new Error("Could not join");
}

export async function closeLobby(code: string) {
  // First delete all players in the lobby

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

async function signInUser(name: string, code: string) {
  const { error: signInError } = await supabase.auth.signInAnonymously();
  if (signInError) {
    console.error("Anon login failed:", signInError);
    return;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Failed to get user:", userError);
    return;
  }

  await supabase.auth.updateUser({
    data: { name },
  });

  await supabase
    .from("players")
    .upsert([{ id: user.id, name, lobby_code: code }]);
}
