import { useEffect, useRef, useState } from 'react'
import { searchMovies } from '../api/tmdb'
import MovieCard from '../components/MovieCard'

function useDebounce(value, ms) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return debounced
}

export default function SearchPage({ onSelect }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)
  const inputRef = useRef(null)
  const dq = useDebounce(query, 380)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    if (!dq.trim()) { setResults([]); setSearched(false); return }
    searchMovies(dq).then(d => {
      setResults(d.results ?? [])
      setSearched(true)
    })
  }, [dq])

  return (
    <div className="search-page">
      <div className="search-bar">
        <span className="search-bar__icon">&#128269;</span>
        <input
          ref={inputRef}
          className="search-bar__input"
          type="text"
          placeholder="Search movies..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {searched && (
        <div className="search-label">
          {results.length > 0
            ? `${results.length} results for "${dq}"`
            : `No results for "${dq}"`
          }
        </div>
      )}

      {results.length > 0 && (
        <div className="search-grid">
          {results.map(movie => (
            <MovieCard key={movie.id} movie={movie} onSelect={onSelect} />
          ))}
        </div>
      )}

      {searched && results.length === 0 && (
        <p className="search-empty">Try a different search term.</p>
      )}
    </div>
  )
}
