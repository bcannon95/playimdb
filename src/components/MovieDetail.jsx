import { useEffect, useRef, useState } from 'react'
import { getMovieDetails, getImdbRating, IMG, playImdbUrl } from '../api/tmdb'

export default function MovieDetail({ movie, onClose }) {
  const [details, setDetails] = useState(null)
  const [imdbRating, setImdbRating] = useState(null)
  const closeRef = useRef(null)
  const overlayRef = useRef(null)

  useEffect(() => {
    getMovieDetails(movie.id).then(d => {
      setDetails(d)
      if (d?.imdb_id) getImdbRating(d.imdb_id).then(setImdbRating)
    })
  }, [movie.id])

  // Focus close button on open, restore focus on unmount
  useEffect(() => {
    const prev = document.activeElement
    closeRef.current?.focus()
    return () => prev?.focus()
  }, [])

  // Close on Escape + trap Tab within modal
  useEffect(() => {
    const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), [tabindex="0"]'
    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'Tab') {
        const els = Array.from(overlayRef.current?.querySelectorAll(FOCUSABLE) ?? [])
          .filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
        if (els.length === 0) return
        const first = els[0], last = els[els.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus() }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus() }
        }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const d = details ?? movie
  const backdrop = IMG.backdrop(d.backdrop_path, 'original')
  const poster    = IMG.poster(d.poster_path, 'w342')
  const year      = d.release_date?.slice(0, 4)
  const rating    = imdbRating ?? (d.vote_average > 0 ? d.vote_average.toFixed(1) : null)
  const ratingLabel = imdbRating ? 'IMDb' : 'TMDB'
  const votes     = !imdbRating && d.vote_count ? `(${d.vote_count.toLocaleString()})` : ''
  const runtime   = d.runtime ? `${Math.floor(d.runtime / 60)}h ${d.runtime % 60}m` : null
  const genres    = d.genres?.map(g => g.name) ?? []
  const director  = details?.credits?.crew?.find(c => c.job === 'Director')
  const writers   = details?.credits?.crew?.filter(c => c.job === 'Screenplay' || c.job === 'Writer').slice(0, 2)
  const cast      = details?.credits?.cast?.slice(0, 8) ?? []
  const watchUrl  = playImdbUrl(details?.imdb_id)

  return (
    <div
      className="overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label={d.title}>
        <button ref={closeRef} className="modal__close" onClick={onClose} aria-label="Close">
          &#x2715;
        </button>

        {backdrop && (
          <div className="modal__backdrop-wrap">
            <img className="modal__backdrop" src={backdrop} alt="" />
          </div>
        )}

        <div className="modal__body">
          <div className="modal__header">
            {poster && <img className="modal__poster" src={poster} alt={d.title} />}
            <div className="modal__info">
              <h2 className="modal__title">{d.title}</h2>
              <div className="modal__meta">
                {rating && (
                  <span className="modal__score">
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, marginRight: 4, opacity: 0.8 }}>{ratingLabel}</span>
                    &#9733; {rating}
                    {votes && <span style={{ fontWeight: 400, fontSize: '0.8rem' }}> {votes}</span>}
                  </span>
                )}
                {year && <span>{year}</span>}
                {runtime && <span>{runtime}</span>}
                {genres.map(g => <span key={g} className="modal__tag">{g}</span>)}
              </div>
            </div>
          </div>

          {d.overview && <p className="modal__overview">{d.overview}</p>}

          {(director || writers?.length > 0) && (
            <div className="modal__crew">
              {director && (
                <div className="modal__crew-block">
                  <label>Director</label>
                  <span>{director.name}</span>
                </div>
              )}
              {writers?.length > 0 && (
                <div className="modal__crew-block">
                  <label>Screenplay</label>
                  <span>{writers.map(w => w.name).join(', ')}</span>
                </div>
              )}
            </div>
          )}

          {watchUrl ? (
            <a href={watchUrl} className="modal__watch" tabIndex={0}>
              &#9654; Watch Now
            </a>
          ) : (
            <button className="modal__watch modal__watch--disabled" disabled>
              &#9654; {details ? 'Not Available' : 'Loading…'}
            </button>
          )}

          {cast.length > 0 && (
            <>
              <div className="modal__section-label">Cast</div>
              <div className="modal__cast">
                {cast.map(person => {
                  const photo = IMG.profile(person.profile_path)
                  return (
                    <div key={person.id} className="modal__cast-item">
                      {photo
                        ? <img className="modal__cast-photo" src={photo} alt={person.name} />
                        : <div className="modal__cast-no-photo">&#128100;</div>
                      }
                      <div className="modal__cast-name">{person.name}</div>
                      <div className="modal__cast-char">{person.character}</div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
