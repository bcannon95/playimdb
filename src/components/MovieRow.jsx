import MovieCard from './MovieCard'

export default function MovieRow({ title, movies, onSelect }) {
  if (!movies?.length) return null

  return (
    <div className="movie-row">
      <h2 className="movie-row__title">{title}</h2>
      <div className="movie-row__track">
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}
