import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <Link to="/" className="navbar__logo">
        Play<span>IMDB</span>
      </Link>
      <div className="navbar__links">
        <Link to="/">Movies</Link>
      </div>
      <button
        className="navbar__search-btn"
        onClick={() => navigate('/search')}
        aria-label="Search"
        tabIndex={0}
      >
        &#9906;
      </button>
    </nav>
  )
}
