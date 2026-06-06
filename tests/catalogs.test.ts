import { CATALOGS, mapTMDBResultToCatalogItem } from '../src/catalogs';
import type { TMDBMovieResult, TMDBTVResult } from '../src/types';

describe('CATALOGS', () => {
  it('defines 6 catalogs', () => {
    expect(CATALOGS).toHaveLength(6);
  });

  it('has correct structure for each catalog', () => {
    for (const catalog of CATALOGS) {
      expect(catalog).toHaveProperty('id');
      expect(catalog).toHaveProperty('type');
      expect(catalog).toHaveProperty('title');
      expect(catalog).toHaveProperty('tmdbEndpoint');
    }
  });

  it('includes trending movie catalog', () => {
    const trending = CATALOGS.find(c => c.id === 'netflix-trending-movie');
    expect(trending).toBeDefined();
    expect(trending!.type).toBe('movie');
  });

  it('includes trending series catalog', () => {
    const trending = CATALOGS.find(c => c.id === 'netflix-trending-series');
    expect(trending).toBeDefined();
    expect(trending!.type).toBe('series');
  });

  it('includes new movie catalog', () => {
    const newMovies = CATALOGS.find(c => c.id === 'netflix-new-movie');
    expect(newMovies).toBeDefined();
    expect(newMovies!.type).toBe('movie');
  });

  it('includes new series catalog', () => {
    const newSeries = CATALOGS.find(c => c.id === 'netflix-new-series');
    expect(newSeries).toBeDefined();
    expect(newSeries!.type).toBe('series');
  });
});

describe('mapTMDBResultToCatalogItem', () => {
  it('maps a movie result to catalog item', () => {
    const movieResult: TMDBMovieResult = {
      id: 550,
      title: 'Fight Club',
      poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      backdrop_path: '/hZkgoQYus5dXo3H8T7Uef6DNknx.jpg',
      release_date: '1999-10-15',
      vote_average: 8.4,
      overview: 'A description',
      genre_ids: [18],
    };

    const item = mapTMDBResultToCatalogItem(movieResult, 'movie');
    expect(item.name).toBe('Fight Club');
    expect(item.type).toBe('movie');
    expect(item.year).toBe(1999);
    expect(item.imdbRating).toBe('8.4');
    expect(item.poster).toContain('pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg');
  });

  it('maps a TV result to catalog item', () => {
    const tvResult: TMDBTVResult = {
      id: 1399,
      name: 'Game of Thrones',
      poster_path: '/u3bZgnGQ9T01sWNBdA7o7rWYKLb.jpg',
      backdrop_path: '/suopoADq0kQQYZzEkChWj7Wiw7O.jpg',
      first_air_date: '2011-04-17',
      vote_average: 8.4,
      overview: 'Seven noble families...',
      genre_ids: [18],
    };

    const item = mapTMDBResultToCatalogItem(tvResult, 'series');
    expect(item.name).toBe('Game of Thrones');
    expect(item.type).toBe('series');
    expect(item.year).toBe(2011);
    expect(item.imdbRating).toBe('8.4');
  });

  it('handles missing dates gracefully', () => {
    const movieResult: Partial<TMDBMovieResult> = {
      id: 1,
      title: 'No Date',
      poster_path: null,
      backdrop_path: null,
      release_date: '',
      vote_average: 0,
      overview: '',
      genre_ids: [],
    };

    const item = mapTMDBResultToCatalogItem(movieResult as TMDBMovieResult, 'movie');
    expect(item.year).toBeUndefined();
    expect(item.poster).toBeUndefined();
  });
});
