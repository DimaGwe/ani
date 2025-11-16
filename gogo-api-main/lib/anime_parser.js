/**
 * Anime Parser - Consumet Edition
 *
 * This module replaces the original web scraping logic with calls to the Consumet library.
 * Function signatures are preserved for backward compatibility with existing API routes.
 *
 * Migration from v1.0 (Gogoanime scraping) to v2.0 (Consumet multi-provider)
 */

import * as consumet from './consumet_client.js';

// Re-export for compatibility (though deprecated)
export const DownloadReferer = 'https://embtaku.pro/';

/**
 * DEPRECATED: Fembed extractor no longer works (returns 410)
 * Maintained for API compatibility only
 */
export const scrapeFembed = async ({ id }) => {
  return { error: 'Fembed is deprecated and no longer supported. Use /vidcdn/watch or /streamsb/watch instead.' };
};

/**
 * DEPRECATED: StreamSB extractor
 * Now uses Consumet's episode sources
 */
export const scrapeStreamSB = async ({ id }) => {
  try {
    const sources = await consumet.getStreamingLinks(id);
    return sources;
  } catch (err) {
    return { error: err.message };
  }
};

/**
 * Get video streaming sources for an episode
 * Primary method for getting video links
 */
export const scrapeMP4 = async ({ id }) => {
  try {
    const sources = await consumet.getStreamingLinks(id);

    // Transform to legacy format if needed
    if (sources && sources.sources) {
      return {
        Referer: sources.headers?.Referer || '',
        sources: sources.sources,
        download: sources.download || '',
      };
    }

    return sources;
  } catch (err) {
    console.error('Error fetching video sources:', err);
    return { error: err.message };
  }
};

/**
 * Search for anime by keyword
 */
export const scrapeSearch = async ({ list = [], keyw, page = 1 }) => {
  try {
    const results = await consumet.search(keyw, page);
    return results.map(item => consumet.transformToLegacyFormat(item, 'list'));
  } catch (err) {
    console.error('Error searching anime:', err);
    return [];
  }
};

/**
 * Get recent anime releases
 * @param {number} type - 1=SUB, 2=DUB, 3=CHINESE
 */
export const scrapeRecentRelease = async ({ list = [], page = 1, type = 1 }) => {
  try {
    const results = await consumet.getRecentEpisodes(page, type);
    return results.map(item => consumet.transformToLegacyFormat(item, 'list'));
  } catch (err) {
    console.error('Error fetching recent releases:', err);
    return [];
  }
};

/**
 * Get complete anime list
 */
export const scrapeAnimeList = async ({ list = [], page = 1 }) => {
  try {
    // Use popular as proxy for full list
    const results = await consumet.getPopular(page);
    return results.map(item => consumet.transformToLegacyFormat(item, 'list'));
  } catch (err) {
    console.error('Error fetching anime list:', err);
    return [];
  }
};

/**
 * Get anime filtered by alphabetical character
 */
export const scrapeAnimeAZ = async ({ list = [], aph, page = 1 }) => {
  try {
    // Consumet doesn't have direct A-Z filtering
    // Use search with the letter as a workaround
    const results = await consumet.search(aph || 'a', page);
    return results.map(item => consumet.transformToLegacyFormat(item, 'list'));
  } catch (err) {
    console.error('Error fetching A-Z anime:', err);
    return [];
  }
};

/**
 * Get recently added anime
 */
export const scrapeRecentlyAdded = async ({ list = [], page = 1 }) => {
  try {
    const results = await consumet.getRecentlyAdded(page);
    return results.map(item => consumet.transformToLegacyFormat(item, 'list'));
  } catch (err) {
    console.error('Error fetching recently added:', err);
    return [];
  }
};

/**
 * Get ongoing anime series
 */
export const scrapeOngoingSeries = async ({ list = [], page = 1 }) => {
  try {
    const results = await consumet.getOngoingSeries(page);
    return results.map(item => consumet.transformToLegacyFormat(item, 'list'));
  } catch (err) {
    console.error('Error fetching ongoing series:', err);
    return [];
  }
};

/**
 * Get new season anime
 */
export const scrapeNewSeason = async ({ list = [], page = 1 }) => {
  try {
    // Use top airing as proxy for new season
    const results = await consumet.getTopAiring(page);
    return results.map(item => consumet.transformToLegacyFormat(item, 'list'));
  } catch (err) {
    console.error('Error fetching new season:', err);
    return [];
  }
};

/**
 * Get ongoing anime (duplicate of scrapeOngoingSeries)
 */
export const scrapeOngoingAnime = async ({ list = [], page = 1 }) => {
  return scrapeOngoingSeries({ list, page });
};

/**
 * Get completed anime
 */
export const scrapeCompletedAnime = async ({ list = [], page = 1 }) => {
  try {
    const results = await consumet.getCompletedAnime(page);
    return results.map(item => consumet.transformToLegacyFormat(item, 'list'));
  } catch (err) {
    console.error('Error fetching completed anime:', err);
    // Fallback to popular if completed not available
    try {
      const fallback = await consumet.getPopular(page);
      return fallback.map(item => consumet.transformToLegacyFormat(item, 'list'));
    } catch {
      return [];
    }
  }
};

/**
 * Get popular anime
 */
export const scrapePopularAnime = async ({ list = [], page = 1 }) => {
  try {
    const results = await consumet.getPopular(page);
    return results.map(item => consumet.transformToLegacyFormat(item, 'list'));
  } catch (err) {
    console.error('Error fetching popular anime:', err);
    return [];
  }
};

/**
 * Get anime movies
 */
export const scrapeAnimeMovies = async ({ list = [], aph = '', page = 1 }) => {
  try {
    const results = await consumet.getAnimeMovies(page);
    return results.map(item => consumet.transformToLegacyFormat(item, 'list'));
  } catch (err) {
    console.error('Error fetching anime movies:', err);
    // Fallback: search for "movie"
    try {
      const fallback = await consumet.search('movie', page);
      return fallback.filter(item => item.type === 'MOVIE')
        .map(item => consumet.transformToLegacyFormat(item, 'list'));
    } catch {
      return [];
    }
  }
};

/**
 * Get top airing anime
 */
export const scrapeTopAiringAnime = async ({ list = [], page = 1 }) => {
  try {
    const results = await consumet.getTopAiring(page);
    return results.map(item => consumet.transformToLegacyFormat(item, 'list'));
  } catch (err) {
    console.error('Error fetching top airing:', err);
    return [];
  }
};

/**
 * Get anime by genre
 */
export const scrapeGenre = async ({ list = [], genre, page = 1 }) => {
  try {
    const results = await consumet.getByGenre(genre, page);
    return results.map(item => consumet.transformToLegacyFormat(item, 'list'));
  } catch (err) {
    console.error(`Error fetching genre ${genre}:`, err);
    // Fallback: search by genre name
    try {
      const fallback = await consumet.search(genre, page);
      return fallback.map(item => consumet.transformToLegacyFormat(item, 'list'));
    } catch {
      return [];
    }
  }
};

/**
 * Get detailed anime information including episodes
 * This is called by /getAnime/:id endpoint
 */
export const scrapeAnimeDetails = async ({ id }) => {
  try {
    const info = await consumet.getAnimeInfo(id);

    // Transform to legacy format
    const transformed = consumet.transformToLegacyFormat(info, 'info');

    return transformed;
  } catch (err) {
    console.error(`Error fetching anime details for ${id}:`, err);
    return { error: err.message };
  }
};

/**
 * Get anime by season
 * Note: Consumet may not have direct season filtering
 */
export const scrapeSeason = async ({ list = [], season, page = 1 }) => {
  try {
    // Fallback: search by season name
    const results = await consumet.search(season, page);
    return results.map(item => consumet.transformToLegacyFormat(item, 'list'));
  } catch (err) {
    console.error(`Error fetching season ${season}:`, err);
    return [];
  }
};

/**
 * Get Disqus comment threads for an episode
 * This functionality is not supported by Consumet
 */
export const scrapeThread = async ({ episodeId, page = 0 }) => {
  return {
    threadId: null,
    currentPage: '0:0:0',
    hasNextPage: false,
    comments: [],
    error: 'Comment threads are not supported in Consumet version. Please use Disqus directly.',
  };
};

/**
 * Get watch page data for an episode
 * Returns episode details and streaming sources
 */
export const scrapeWatchAnime = async ({ id }) => {
  try {
    // Extract anime ID and episode number from episode ID
    // Episode ID format varies, but typically: "anime-name-episode-1"
    const parts = id.split('-episode-');
    const animeId = parts[0];
    const episodeNum = parts[1] || '1';

    // Get anime details
    const animeInfo = await consumet.getAnimeInfo(animeId);

    // Get streaming sources
    const sources = await consumet.getStreamingLinks(id);

    return {
      animeId: animeInfo.id || animeId,
      animeTitle: animeInfo.title?.english || animeInfo.title?.romaji || animeInfo.title || '',
      episodeNum: episodeNum,
      sources: sources.sources || [],
      download: sources.download || '',
    };
  } catch (err) {
    console.error(`Error fetching watch anime for ${id}:`, err);
    return { error: err.message };
  }
};

// ============================================================================
// PAGE VARIANTS
// These are duplicate endpoints with "Page" suffix for backward compatibility
// ============================================================================

export const scrapeSearchPage = async ({ keyw, page }) => {
  return scrapeSearch({ keyw, page });
};

export const scrapePopularPage = async ({ page }) => {
  return scrapePopularAnime({ page });
};

export const scrapeCompletedPage = async ({ page }) => {
  return scrapeCompletedAnime({ page });
};

export const scrapeOngoingPage = async ({ page }) => {
  return scrapeOngoingAnime({ page });
};

export const scrapeMoviePage = async ({ page }) => {
  return scrapeAnimeMovies({ page });
};

export const scrapeSubCategoryPage = async ({ subCategory, page }) => {
  // Use search as fallback for subcategories
  return scrapeSearch({ keyw: subCategory, page });
};

export const scrapeRecentPage = async ({ page, type }) => {
  return scrapeRecentRelease({ page, type });
};

export const scrapeNewSeasonPage = async ({ page }) => {
  return scrapeNewSeason({ page });
};

export const scrapeGenrePage = async ({ genre, page }) => {
  return scrapeGenre({ genre, page });
};

export const scrapeAnimeListPage = async ({ page }) => {
  return scrapeAnimeList({ page });
};

export const scrapeAnimeAZPage = async ({ aph, page = 1 }) => {
  return scrapeAnimeAZ({ aph, page });
};

// ============================================================================
// LEGACY COMPATIBILITY
// Maintain exports for any code that imports these directly
// ============================================================================

export default {
  scrapeSearch,
  scrapeRecentRelease,
  scrapeAnimeList,
  scrapeAnimeAZ,
  scrapeRecentlyAdded,
  scrapeOngoingSeries,
  scrapeNewSeason,
  scrapeOngoingAnime,
  scrapeCompletedAnime,
  scrapePopularAnime,
  scrapeAnimeMovies,
  scrapeTopAiringAnime,
  scrapeGenre,
  scrapeAnimeDetails,
  scrapeSeason,
  scrapeThread,
  scrapeWatchAnime,
  scrapeMP4,
  scrapeStreamSB,
  scrapeFembed,
  // Page variants
  scrapeSearchPage,
  scrapePopularPage,
  scrapeCompletedPage,
  scrapeOngoingPage,
  scrapeMoviePage,
  scrapeSubCategoryPage,
  scrapeRecentPage,
  scrapeNewSeasonPage,
  scrapeGenrePage,
  scrapeAnimeListPage,
  scrapeAnimeAZPage,
};
