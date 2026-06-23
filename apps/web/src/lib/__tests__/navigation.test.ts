import { describe, it, expect } from 'vitest'
import { sidebarNav, mobileNav } from '../navigation'

describe('navigation config', () => {
  it('exposes the dashboard as the first sidebar item pointing at /app', () => {
    expect(sidebarNav[0].id).toBe('dashboard')
    expect(sidebarNav[0].path).toBe('/app')
  })

  it('every sidebar item has unique ids and paths', () => {
    const ids = sidebarNav.map((n) => n.id)
    const paths = sidebarNav.map((n) => n.path)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('every nav item has a non-empty icon and both language labels', () => {
    for (const item of [...sidebarNav, ...mobileNav]) {
      expect(item.icon.length).toBeGreaterThan(0)
      expect(item.label_es.length).toBeGreaterThan(0)
      expect(item.label_en.length).toBeGreaterThan(0)
    }
  })

  it('all paths begin with /app', () => {
    for (const item of sidebarNav) {
      expect(item.path.startsWith('/app')).toBe(true)
    }
  })

  it('mobile nav is a subset of sidebar by path', () => {
    const sidebarPaths = new Set(sidebarNav.map((n) => n.path))
    for (const item of mobileNav) {
      expect(sidebarPaths.has(item.path)).toBe(true)
    }
  })
})