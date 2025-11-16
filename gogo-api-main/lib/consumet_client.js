/**
 * Consumet API Client Wrapper
 *
 * This module provides a wrapper around the Consumet extensions library
 * to maintain compatibility with the existing API structure while using
 * multiple anime providers (Zoro/HiAnime, GogoAnime, 9Anime, etc.)
 *
 * Provider Priority:
 * 1. Zoro/HiAnime (most reliable, actively maintained)
 * 2. GogoAnime (fallback)
 * 3. 9Anime (fallback)
 */

import { ANIME } from '@consumet/extensions';

// Initialize providers
const zoro = new ANIME.Zoro();
const gogoanime = new ANIME.Gogoanime();
const nineanime = new ANIME.NineAnime();

// Provider selection based on priority
const PRIMARY_PROVIDER = zoro;
const FALLBACK_PROVIDERS = [gogoanime, nineanime];

/**
 * Execute a function with automatic provider fallback
 * @param {Function} fn - Function to execute
 * @param {...any} args - Arguments to pass to the function
 * @returns {Promise<any>} Result from the function
 */
async function withFallback(fn, ...args) {
  try {
    const result = await fn(PRIMARY_PROVIDER, ...args);
    if (result && (Array.isArray(result) ? result.length > 0 : true)) {
      return result;
    }
  } catch (error) {
    console.warn(`Primary provider failed: ${error.message}`);
  }

  // Try fallback providers
  for (const provider of FALLBACK_PROVIDERS) {
    try {
      const result = await fn(provider, ...args);
      if (result && (Array.isArray(result) ? result.length > 0 : true)) {
        console.log(`Using fallback provider: ${provider.constructor.name}`);
        return result;
      }
    } catch (error) {
      console.warn(`Fallback provider ${provider.constructor.name} failed: ${error.message}`);
    }
  }

  throw new Error('All providers failed');
}

/**
 * Search for anime
 * @param {string} query - Search query
 * @param {number} page - Page number (1-indexed)
 * @returns {Promise<Array>} Array of search results
 */
export const search = async (query, page = 1) => {
  return withFallback(
    async (provider, q, p) => {
      const result = await provider.search(q, p);
      return result.results || [];
    },
    query,
    page
  );
};

/**
 * Get recent episodes/releases
 * @param {number} page - Page number
 * @param {number} type - Type (1=SUB, 2=DUB, 3=CHINESE)
 * @returns {Promise<Array>} Array of recent episodes
 */
export const getRecentEpisodes = async (page = 1, type = 1) => {
  return withFallback(
    async (provider, p, t) => {
      // Map type: 1=SUB, 2=DUB, 3=CHINESE
      const typeMap = { 1: 1, 2: 2, 3: 3 };
      const result = await provider.fetchRecentEpisodes(p, typeMap[t] || 1);
      return result.results || [];
    },
    page,
    type
  );
};

/**
 * Get top airing anime
 * @param {number} page - Page number
 * @returns {Promise<Array>} Array of top airing anime
 */
export const getTopAiring = async (page = 1) => {
  return withFallback(
    async (provider, p) => {
      const result = await provider.fetchTopAiring(p);
      return result.results || [];
    },
    page
  );
};

/**
 * Get popular anime
 * @param {number} page - Page number
 * @returns {Promise<Array>} Array of popular anime
 */
export const getPopular = async (page = 1) => {
  return withFallback(
    async (provider, p) => {
      // Zoro has fetchMostPopular, GogoAnime has fetchPopular
      if (provider.fetchMostPopular) {
        const result = await provider.fetchMostPopular(p);
        return result.results || [];
      } else if (provider.fetchPopular) {
        const result = await provider.fetchPopular(p);
        return result.results || [];
      }
      throw new Error('Popular endpoint not available');
    },
    page
  );
};

/**
 * Get anime details and episode list
 * @param {string} id - Anime ID
 * @returns {Promise<Object>} Anime details object
 */
export const getAnimeInfo = async (id) => {
  return withFallback(
    async (provider, animeId) => {
      const result = await provider.fetchAnimeInfo(animeId);
      return result;
    },
    id
  );
};

/**
 * Get streaming links for an episode
 * @param {string} episodeId - Episode ID
 * @returns {Promise<Object>} Streaming sources object
 */
export const getStreamingLinks = async (episodeId) => {
  return withFallback(
    async (provider, epId) => {
      const result = await provider.fetchEpisodeSources(epId);
      return result;
    },
    episodeId
  );
};

/**
 * Get anime by genre
 * @param {string} genre - Genre name
 * @param {number} page - Page number
 * @returns {Promise<Array>} Array of anime in genre
 */
export const getByGenre = async (genre, page = 1) => {
  return withFallback(
    async (provider, g, p) => {
      // Zoro has fetchAnimeByGenre
      if (provider.fetchAnimeByGenre) {
        const result = await provider.fetchAnimeByGenre(g, p);
        return result.results || [];
      }
      throw new Error('Genre filtering not available for this provider');
    },
    genre,
    page
  );
};

/**
 * Get recently added anime
 * @param {number} page - Page number
 * @returns {Promise<Array>} Array of recently added anime
 */
export const getRecentlyAdded = async (page = 1) => {
  return withFallback(
    async (provider, p) => {
      // Use recently added or fallback to recent episodes
      if (provider.fetchRecentlyAdded) {
        const result = await provider.fetchRecentlyAdded(p);
        return result.results || [];
      } else {
        const result = await provider.fetchRecentEpisodes(p, 1);
        return result.results || [];
      }
    },
    page
  );
};

/**
 * Get ongoing anime series
 * @param {number} page - Page number
 * @returns {Promise<Array>} Array of ongoing anime
 */
export const getOngoingSeries = async (page = 1) => {
  return withFallback(
    async (provider, p) => {
      // Zoro has specific ongoing endpoint
      if (provider.fetchCompletedAnime) {
        // If has completed, likely has ongoing too
        const result = await provider.fetchTopAiring(p);
        return result.results || [];
      } else {
        // Fallback to top airing as proxy for ongoing
        const result = await provider.fetchTopAiring(p);
        return result.results || [];
      }
    },
    page
  );
};

/**
 * Get completed anime
 * @param {number} page - Page number
 * @returns {Promise<Array>} Array of completed anime
 */
export const getCompletedAnime = async (page = 1) => {
  return withFallback(
    async (provider, p) => {
      if (provider.fetchCompletedAnime) {
        const result = await provider.fetchCompletedAnime(p);
        return result.results || [];
      }
      throw new Error('Completed anime endpoint not available');
    },
    page
  );
};

/**
 * Get anime movies
 * @param {number} page - Page number
 * @returns {Promise<Array>} Array of anime movies
 */
export const getAnimeMovies = async (page = 1) => {
  return withFallback(
    async (provider, p) => {
      if (provider.fetchAnimeMovies) {
        const result = await provider.fetchAnimeMovies(p);
        return result.results || [];
      }
      throw new Error('Anime movies endpoint not available');
    },
    page
  );
};

/**
 * Transform Consumet result to match legacy format
 * Used to maintain backward compatibility with existing API responses
 */
export const transformToLegacyFormat = (item, type = 'list') => {
  if (!item) return null;

  if (type === 'list') {
    // Transform list item
    return {
      animeId: item.id || '',
      animeTitle: item.title?.english || item.title?.romaji || item.title || '',
      animeUrl: item.url || '',
      animeImg: item.image || item.cover || '',
      releasedDate: item.releaseDate || '',
      status: item.status || '',
      subOrDub: item.subOrDub || 'sub',
    };
  } else if (type === 'info') {
    // Transform anime info
    return {
      animeId: item.id || '',
      animeTitle: item.title?.english || item.title?.romaji || item.title || '',
      type: item.type || '',
      animeImg: item.image || item.cover || '',
      releasedDate: item.releaseDate || '',
      status: item.status || '',
      genres: item.genres || [],
      otherNames: item.synonyms || item.title?.native || [],
      synopsis: item.description || '',
      totalEpisodes: item.totalEpisodes || 0,
      episodesList: (item.episodes || []).map(ep => ({
        episodeId: ep.id || '',
        episodeNum: ep.number || ep.episode || 0,
        episodeUrl: ep.url || '',
      })),
    };
  }

  return item;
};

export default {
  search,
  getRecentEpisodes,
  getTopAiring,
  getPopular,
  getAnimeInfo,
  getStreamingLinks,
  getByGenre,
  getRecentlyAdded,
  getOngoingSeries,
  getCompletedAnime,
  getAnimeMovies,
  transformToLegacyFormat,
};
