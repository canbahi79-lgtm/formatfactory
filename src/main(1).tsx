/**
 * Entry of the React app.
 * - Creates root and renders App into #app.
 * - If shadcn.css does not exist locally, keep the import commented out.
 */

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/app.css'

// import './shadcn.css' // Uncomment only if you have this file

const container = document.getElementById('app')
if (!container) {
  throw new Error('Root element #app not found in index.html')
}

createRoot(container).render(<App />)
