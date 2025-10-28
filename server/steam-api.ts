import axios from 'axios';

const STEAM_API_BASE = 'https://store.steampowered.com/api';

export interface SteamGameDetails {
  appId: string;
  name: string;
  type: string;
  shortDescription: string;
  detailedDescription: string;
  fullDescription: string;
  aboutTheGame: string;
  headerImage: string;
  background: string;
  backgroundRaw: string;
  developers: string[];
  publishers: string[];
  genres: string[];
  categories: string[];
  releaseDate: string;
  comingSoon: boolean;
  screenshots: Array<{
    id: number;
    path_thumbnail: string;
    path_full: string;
  }>;
  movies: Array<{
    id: number;
    name: string;
    thumbnail: string;
    webm: {
      '480'?: string;
      max?: string;
    };
    mp4: {
      '480'?: string;
      max?: string;
    };
    highlight: boolean;
  }>;
  achievements: {
    total: number;
    highlighted: Array<{
      name: string;
      path: string;
    }>;
  };
  platforms: {
    windows: boolean;
    mac: boolean;
    linux: boolean;
  };
  price: string;
  priceData: {
    currency: string;
    initial: number;
    final: number;
    discountPercent: number;
    initialFormatted: string;
    finalFormatted: string;
  } | null;
  isFree: boolean;
  metacritic: number | null;
  metacriticUrl: string | null;
  recommendations: number;
  requiredAge: number;
  controllerSupport: string | null;
  supportedLanguages: string;
  website: string | null;
  pcRequirements: {
    minimum: string;
    recommended: string;
  };
  macRequirements: {
    minimum: string;
    recommended: string;
  };
  linuxRequirements: {
    minimum: string;
    recommended: string;
  };
  legalNotice: string | null;
  drmNotice: string | null;
  extUserAccountNotice: string | null;
  contentDescriptors: {
    ids: number[];
    notes: string | null;
  };
  reviews: string | null;
  supportInfo: {
    url: string;
    email: string;
  };
  dlc: number[];
  demos: Array<{
    appid: number;
    description: string;
  }>;
}

export async function getSteamGameDetails(appId: string): Promise<SteamGameDetails | null> {
  try {
    const response = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${appId}`);
    const data = response.data[appId];

    if (!data || !data.success) {
      return null;
    }

    const gameData = data.data;

    // Helper function to strip HTML tags
    const stripHtml = (html: string) => html?.replace(/<[^>]*>/g, '') || '';

    // Helper function to parse requirements
    const parseRequirements = (req: any) => ({
      minimum: stripHtml(req?.minimum || ''),
      recommended: stripHtml(req?.recommended || '')
    });

    return {
      appId,
      name: gameData.name || '',
      type: gameData.type || 'game',
      shortDescription: gameData.short_description || '',
      detailedDescription: stripHtml(gameData.detailed_description) || gameData.short_description || '',
      fullDescription: stripHtml(gameData.detailed_description) || gameData.short_description || '',
      aboutTheGame: stripHtml(gameData.about_the_game) || gameData.short_description || '',
      headerImage: gameData.header_image || '',
      background: gameData.background || '',
      backgroundRaw: gameData.background_raw || '',
      developers: gameData.developers || [],
      publishers: gameData.publishers || [],
      genres: gameData.genres?.map((g: any) => g.description) || [],
      categories: gameData.categories?.map((c: any) => c.description) || [],
      releaseDate: gameData.release_date?.date || '',
      comingSoon: gameData.release_date?.coming_soon || false,
      screenshots: gameData.screenshots?.map((s: any) => ({
        id: s.id,
        path_thumbnail: s.path_thumbnail,
        path_full: s.path_full
      })) || [],
      movies: gameData.movies?.map((m: any) => ({
        id: m.id,
        name: m.name || '',
        thumbnail: m.thumbnail || '',
        webm: {
          '480': m.webm?.['480'],
          max: m.webm?.max
        },
        mp4: {
          '480': m.mp4?.['480'],
          max: m.mp4?.max
        },
        highlight: m.highlight || false
      })) || [],
      achievements: {
        total: gameData.achievements?.total || 0,
        highlighted: gameData.achievements?.highlighted?.map((a: any) => ({
          name: a.name || '',
          path: a.path || ''
        })) || []
      },
      platforms: {
        windows: gameData.platforms?.windows || false,
        mac: gameData.platforms?.mac || false,
        linux: gameData.platforms?.linux || false
      },
      price: gameData.price_overview?.final_formatted || (gameData.is_free ? 'Free' : 'N/A'),
      priceData: gameData.price_overview ? {
        currency: gameData.price_overview.currency || 'USD',
        initial: gameData.price_overview.initial || 0,
        final: gameData.price_overview.final || 0,
        discountPercent: gameData.price_overview.discount_percent || 0,
        initialFormatted: gameData.price_overview.initial_formatted || '',
        finalFormatted: gameData.price_overview.final_formatted || ''
      } : null,
      isFree: gameData.is_free || false,
      metacritic: gameData.metacritic?.score || null,
      metacriticUrl: gameData.metacritic?.url || null,
      recommendations: gameData.recommendations?.total || 0,
      requiredAge: parseInt(gameData.required_age) || 0,
      controllerSupport: gameData.controller_support || null,
      supportedLanguages: stripHtml(gameData.supported_languages) || '',
      website: gameData.website || null,
      pcRequirements: parseRequirements(gameData.pc_requirements),
      macRequirements: parseRequirements(gameData.mac_requirements),
      linuxRequirements: parseRequirements(gameData.linux_requirements),
      legalNotice: gameData.legal_notice || null,
      drmNotice: gameData.drm_notice || null,
      extUserAccountNotice: gameData.ext_user_account_notice || null,
      contentDescriptors: {
        ids: gameData.content_descriptors?.ids || [],
        notes: gameData.content_descriptors?.notes || null
      },
      reviews: gameData.reviews || null,
      supportInfo: {
        url: gameData.support_info?.url || '',
        email: gameData.support_info?.email || ''
      },
      dlc: gameData.dlc || [],
      demos: gameData.demos?.map((d: any) => ({
        appid: d.appid,
        description: d.description || ''
      })) || []
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
