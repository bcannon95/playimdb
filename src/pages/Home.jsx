import { useEffect, useState } from 'react'
import { getTrending, getPopular, getTopRated, getByGenre, FEATURED_GENRES } from '../api/tmdb'
import Hero from '../components/Hero'
import MovieRow from '../components/MovieRow'

export default function Home({ onSelect }) {
  const [trending, setTrending] = useState([])
  const [popular, setPopular]   = useState([])
  const [topRated, setTopRated] = useState([])
  const [genres, setGenres]     = useState([])

  useEffect(() => {
    getTrending().then(d => setTrending(d.results ?? []))
    getPopular().then(d => setPopular(d.results ?? []))
    getTopRated().then(d => setTopRated(d.results ?? []))

    Promise.all(
      FEATURED_GENRES.map(g =>
        getByGenre(g.id).then(d => ({ ...g, movies: d.results ?? [] }))
      )
    ).then(setGenres)
  }, [])

  return (
    <div className="home">
      <Hero movie={trending[0]} onSelect={onSelect} />
      <div className="home__rows">
        <MovieRow title="Trending This Week" movies={trending.slice(1)} onSelect={onSelect} />
        <MovieRow title="Popular Now"         movies={popular}           onSelect={onSelect} />
        <MovieRow title="Top Rated"           movies={topRated}          onSelect={onSelect} />
        {genres.map(row => (
          <MovieRow key={row.id} title={row.name} movies={row.movies} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}
