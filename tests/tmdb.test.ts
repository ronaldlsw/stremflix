import { TMDBClient } from '../src/tmdb';
import {
  mockTrendingMoviesResponse,
  mockTrendingTVResponse,
  mockExternalIDsResponse,
  mockNullExternalIDsResponse,
  mockMovieDetailResponse,
  mockTVDetailResponse,
  mockDiscoverResponse,
} from './fixtures/tmdb-responses';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('TMDBClient', () => {
  const apiKey = 'test-api-key';
  let client: TMDBClient;

  beforeEach(() => {
    client = new TMDBClient(apiKey);
    mockFetch.mockReset();
  });

  describe('trending', () => {
    it('fetches trending movies', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTrendingMoviesResponse),
      });

      const result = await client.trending('movie');
      expect(result).toEqual(mockTrendingMoviesResponse.results);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/trending/movie/week?api_key=test-api-key&page=1'
      );
    });

    it('fetches trending TV', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTrendingTVResponse),
      });

      const result = await client.trending('tv');
      expect(result).toEqual(mockTrendingTVResponse.results);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/trending/tv/week?api_key=test-api-key&page=1'
      );
    });

    it('passes page parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTrendingMoviesResponse),
      });

      await client.trending('movie', 2);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      );
    });
  });

  describe('discover', () => {
    it('discovers with watch provider filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDiscoverResponse),
      });

      const result = await client.discover('movie', {
        with_watch_providers: '8',
        watch_region: 'US',
      });

      expect(result).toEqual(mockDiscoverResponse.results);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('with_watch_providers=8')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('watch_region=US')
      );
    });
  });

  describe('getExternalIDs', () => {
    it('returns external IDs for a movie', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExternalIDsResponse),
      });

      const result = await client.getExternalIDs('movie', 550);
      expect(result).toEqual(mockExternalIDsResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/movie/550/external_ids?api_key=test-api-key'
      );
    });

    it('returns external IDs for TV', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExternalIDsResponse),
      });

      const result = await client.getExternalIDs('tv', 1399);
      expect(result).toEqual(mockExternalIDsResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/tv/1399/external_ids?api_key=test-api-key'
      );
    });

    it('handles null imdb_id', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockNullExternalIDsResponse),
      });

      const result = await client.getExternalIDs('movie', 1);
      expect(result.imdb_id).toBeNull();
    });
  });

  describe('details', () => {
    it('returns movie details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMovieDetailResponse),
      });

      const result = await client.details('movie', 550);
      expect(result).toEqual(mockMovieDetailResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/movie/550')
      );
    });

    it('returns TV details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTVDetailResponse),
      });

      const result = await client.details('tv', 1399);
      expect(result).toEqual(mockTVDetailResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tv/1399')
      );
    });
  });

  describe('search', () => {
    it('searches movies with query', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTrendingMoviesResponse),
      });

      const result = await client.search('movie', 'Fight Club');
      expect(result).toEqual(mockTrendingMoviesResponse.results);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('query=Fight+Club')
      );
    });

    it('searches TV with query', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTrendingTVResponse),
      });

      const result = await client.search('tv', 'Game of Thrones');
      expect(result).toEqual(mockTrendingTVResponse.results);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search/tv')
      );
    });
  });

  describe('error handling', () => {
    it('throws on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(client.trending('movie')).rejects.toThrow('TMDB API error: 401');
    });

    it('throws on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.trending('movie')).rejects.toThrow('Network error');
    });
  });
});
