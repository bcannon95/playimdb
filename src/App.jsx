import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import { useTvNav } from './hooks/useTvNav'
import Navbar from './components/Navbar'
import MovieDetail from './components/MovieDetail'
import Home from './pages/Home'
import SearchPage from './pages/SearchPage'

export default function App() {
  const [selected, setSelected] = useState(null)
  useTvNav()

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"       element={<Home       onSelect={setSelected} />} />
        <Route path="/search" element={<SearchPage onSelect={setSelected} />} />
      </Routes>
      {selected && (
        <MovieDetail movie={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
