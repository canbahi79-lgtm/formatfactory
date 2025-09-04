/**
 * App: Main router and application shell.
 * - Uses HashRouter from react-router (not react-router-dom).
 */

import { HashRouter, Route, Routes } from 'react-router'
import HomePage from './pages/Home'

/** Renders routes inside a HashRouter. */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </HashRouter>
  )
}
