import { IMG } from '../api/tmdb'

export default function MovieCard({ movie, onSelect }) {
  const poster = IMG.poster(movie.poster_path)
  const year = movie.release_date?.slice(0, 4)
  const rating = movie.vote_average > 0 ? movie.vote_average.toFixed(1) : null

  const handleActivate = () => onSelect(movie)

  return (
    <div
      className="movie-card"
      tabIndex={0}
      role="button"
      aria-label={movie.title}
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleActivate()
        }
      }}
      onFocus={(e) => {
        e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      }}
    >
      {poster
        ? <img className="movie-card__poster" src={poster} alt={movie.title} loading="lazy" />
        : <div className="movie-card__fallback">{movie.title}</div>
      }
      <div className="movie-card__info">
        <div className="movie-card__title">{movie.title}</div>
        <div className="movie-card__sub">
          <span>{year}</span>
          {rating && <span className="movie-card__rating">&#9733; {rating}</span>}
        </div>
      </div>
    </div>
  )
}
