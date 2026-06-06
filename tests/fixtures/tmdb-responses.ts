export const mockTrendingMoviesResponse = {
  results: [
    {
      id: 550,
      title: "Fight Club",
      poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      backdrop_path: "/hZkgoQYus5dXo3H8T7Uef6DNknx.jpg",
      release_date: "1999-10-15",
      vote_average: 8.4,
      overview: "A ticking-Loss and disillusioned office worker finds himself...",
      genre_ids: [18, 53],
    },
  ],
  page: 1,
  total_pages: 10,
  total_results: 200,
};

export const mockTrendingTVResponse = {
  results: [
    {
      id: 1399,
      name: "Game of Thrones",
      poster_path: "/u3bZgnGQ9T01sWNBdA7o7rWYKLb.jpg",
      backdrop_path: "/suopoADq0kQQYZzEkChWj7Wiw7O.jpg",
      first_air_date: "2011-04-17",
      vote_average: 8.4,
      overview: "Seven noble families fight for control of the mythical land of Westeros.",
      genre_ids: [10765, 18],
    },
  ],
  page: 1,
  total_pages: 5,
  total_results: 100,
};

export const mockExternalIDsResponse = {
  imdb_id: "tt0137523",
};

export const mockMovieDetailResponse = {
  id: 550,
  title: "Fight Club",
  poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
  backdrop_path: "/hZkgoQYus5dXo3H8T7Uef6DNknx.jpg",
  release_date: "1999-10-15",
  vote_average: 8.4,
  overview: "A ticking-Loss...",
  runtime: 139,
  genres: [{ id: 18, name: "Drama" }, { id: 53, name: "Thriller" }],
  credits: {
    cast: [{ name: "Brad Pitt" }, { name: "Edward Norton" }],
    crew: [{ name: "David Fincher", job: "Director" }],
  },
};

export const mockTVDetailResponse = {
  id: 1399,
  name: "Game of Thrones",
  poster_path: "/u3bZgnGQ9T01sWNBdA7o7rWYKLb.jpg",
  backdrop_path: "/suopoADq0kQQYZzEkChWj7Wiw7O.jpg",
  first_air_date: "2011-04-17",
  vote_average: 8.4,
  overview: "Seven noble families...",
  episode_run_time: [60],
  genres: [{ id: 18, name: "Drama" }, { id: 10765, name: "Sci-Fi & Fantasy" }],
  credits: {
    cast: [{ name: "Emilia Clarke" }, { name: "Kit Harington" }],
    crew: [{ name: "David Benioff", job: "Showrunner" }, { name: "Miguel Sapochnik", job: "Director" }],
  },
};

export const mockNullExternalIDsResponse = {
  imdb_id: null,
};

export const mockDiscoverResponse = {
  results: [mockTrendingMoviesResponse.results[0]],
  page: 1,
  total_pages: 10,
  total_results: 100,
};
