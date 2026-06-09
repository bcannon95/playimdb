const BASE = 'https://api.themoviedb.org/3'
const KEY = import.meta.env.VITE_TMDB_API_KEY

export const IMG = {
  poster:   (path, size = 'w342')  => path ? `https://image.tmdb.org/t/p/${size}${path}` : null,
  backdrop: (path, size = 'w1280') => path ? `https://image.tmdb.org/t/p/${size}${path}` : null,
  profile:  (path, size = 'w185')  => path ? `https://image.tmdb.org/t/p/${size}${path}` : null,
}

const get = async (endpoint, params = {}) => {
  const url = new URL(`${BASE}${endpoint}`)
  url.searchParams.set('api_key', KEY)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`TMDB ${res.status}`)
  return res.json()
}

export const getTrending    = ()       => get('/trending/movie/week')
export const getPopular     = ()       => get('/movie/popular')
export const getTopRated    = ()       => get('/movie/top_rated')
export const getByGenre     = (id)     => get('/discover/movie', { with_genres: id, sort_by: 'popularity.desc' })
export const searchMovies   = (query)  => get('/search/movie', { query })
export const getMovieDetails = (id)   => get(`/movie/${id}`, { append_to_response: 'credits' })

export const FEATURED_GENRES = [
  { id: 28,    name: 'Action' },
  { id: 35,    name: 'Comedy' },
  { id: 18,    name: 'Drama' },
  { id: 878,   name: 'Science Fiction' },
  { id: 27,    name: 'Horror' },
  { id: 53,    name: 'Thriller' },
  { id: 16,    name: 'Animation' },
  { id: 10749, name: 'Romance' },
]

export const playImdbUrl = (imdbId) =>
  imdbId ? `https://www.playimdb.com/title/${imdbId}/` : null

const OMDB_KEY = import.meta.env.VITE_OMDB_API_KEY
export const getImdbRating = async (imdbId) => {
  if (!OMDB_KEY || !imdbId) return null
  const res = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_KEY}`)
  if (!res.ok) return null
  const d = await res.json()
  return d.imdbRating && d.imdbRating !== 'N/A' ? d.imdbRating : null
}
