import { useEffect, useRef } from 'react'
import { IMG } from '../api/tmdb'

export default function Hero({ movie, onSelect }) {
  const btnRef = useRef(null)

  useEffect(() => {
    if (movie) btnRef.current?.focus()
  }, [!!movie])

  if (!movie) return null

  const backdrop = IMG.backdrop(movie.backdrop_path, 'original')
  const year = movie.release_date?.slice(0, 4)
  const rating = movie.vote_average?.toFixed(1)
  const overview = movie.overview?.length > 220
    ? movie.overview.slice(0, 220) + '…'
    : movie.overview

  return (
    <div className="hero">
      <div
        className="hero__bg"
        style={{ backgroundImage: backdrop ? `url(${backdrop})` : 'none' }}
      />
      <div className="hero__content">
        <h1 className="hero__title">{movie.title}</h1>
        <div className="hero__meta">
          {rating && <span className="hero__rating">&#9733; {rating}</span>}
          {year && <span>{year}</span>}
          {movie.original_language && (
            <span>{movie.original_language.toUpperCase()}</span>
          )}
        </div>
        {overview && <p className="hero__overview">{overview}</p>}
        <div className="hero__actions">
          <button
            ref={btnRef}
            className="btn btn--ghost"
            onClick={() => onSelect(movie)}
            tabIndex={0}
          >
            More Info
          </button>
        </div>
      </div>
    </div>
  )
}
