import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { AuthProvider } from './providers/AuthProvider'
import { ThemeProvider } from './providers/ThemeProvider'

// Scroll-triggered reveal animations using IntersectionObserver
function initScrollReveal() {
  const selectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade, .reveal-up, .reveal-rotate'

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          // Once revealed, stop observing (animate only once)
          observer.unobserve(entry.target)
        }
      })
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  )

  // Observe all current reveal elements
  function observeAll() {
    document.querySelectorAll(selectors).forEach((el) => {
      if (!el.classList.contains('visible')) {
        observer.observe(el)
      }
    })
  }

  // Initial observation
  observeAll()

  // Re-observe when new elements appear (for SPA route changes)
  const mutationObserver = new MutationObserver(() => {
    observeAll()
  })

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
  })
}

// Start observing after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollReveal)
} else {
  // Small delay to ensure React has rendered
  setTimeout(initScrollReveal, 100)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)
