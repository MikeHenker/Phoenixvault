import axios from 'axios';

const STEAM_API_BASE = 'https://store.steampowered.com/api';

export interface SteamGameDetails {
  appId: string;
  name: string;
  shortDescription: string;
  detailedDescription: string;
  headerImage: string;
  developers: string[];
  publishers: string[];
  genres: string[];
  releaseDate: string;
  screenshots: Array<{
    id: number;
    pathThumbnail: string;
    pathFull: string;
  }>;
  price: string;
  metacritic: number | null;
  recommendations: number;
}

export async function getSteamGameDetails(appId: string): Promise<SteamGameDetails | null> {
  try {
    const response = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${appId}`);
    const data = response.data[appId];

    if (!data || !data.success) {
      return null;
    }

    const gameData = data.data;

    return {
      appId,
      name: gameData.name,
      shortDescription: gameData.short_description,
      detailedDescription: gameData.detailed_description?.replace(/<[^>]*>/g, '') || gameData.short_description, // Strip HTML tags
      headerImage: gameData.header_image,
      developers: gameData.developers || [],
      publishers: gameData.publishers || [],
      genres: gameData.genres?.map((g: any) => g.description) || [],
      releaseDate: gameData.release_date?.date || '',
      screenshots: gameData.screenshots || [],
      price: gameData.price_overview?.final_formatted || 'Free',
      metacritic: gameData.metacritic?.score || null,
      recommendations: gameData.recommendations?.total || 0,
    };
  } catch (error) {
    console.error("Error fetching Steam game details:", error);
    return null;
  }
}

export async function searchSteamGames(query: string): Promise<Array<{ appId: string; name: string }>> {
  try {
    // Steam doesn't have an official search API, so we'll use a workaround
    // This searches the Steam store and returns app IDs
    const response = await axios.get('https://steamcommunity.com/actions/SearchApps/' + encodeURIComponent(query));

    if (Array.isArray(response.data)) {
      return response.data.slice(0, 10).map((game: any) => ({
        appId: game.appid.toString(),
        name: game.name
      }));
    }

    return [];
  } catch (error) {
    console.error('Error searching Steam games:', error);
    return [];
  }
}