/**
 * useAnalytics.ts
 * Auto-tracks page views, session management, and custom events.
 * 
 * Usage:
 *   const analytics = useAnalytics()
 *   analytics.track('feature_usage', { feature: 'document_upload', count: 5 })
 */

import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '../../../lib/axios'
// ─── Session Management ──────────────────────────────────────────────────────

const SESSION_KEY = 'context_analytics_session'
const SESSION_DURATION = 30 * 60 * 1000 // 30 minutes

function getOrCreateSessionId(): string {
  const stored = localStorage.getItem(SESSION_KEY)
  if (stored) {
    const { sessionId, timestamp } = JSON.parse(stored)
    // Extend session if activity within last 30 minutes
    if (Date.now() - timestamp < SESSION_DURATION) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ sessionId, timestamp: Date.now() }))
      return sessionId
    }
  }
  
  // Create new session
  const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  localStorage.setItem(SESSION_KEY, JSON.stringify({ sessionId, timestamp: Date.now() }))
  return sessionId
}

// ─── Analytics API ───────────────────────────────────────────────────────────

// Global cooldown to prevent analytics bursting / infinite loops
let lastTrackTime = 0;
const TRACK_COOLDOWN_MS = 500;

async function trackEvent(
  eventType: string,
  route?: string,
  metadata?: Record<string, any>,
  errorMessage?: string,
  errorStack?: string
) {
  // 1. Prevent Logging Loops & Bursting
  const now = Date.now();
  if (now - lastTrackTime < TRACK_COOLDOWN_MS) {
    console.debug('[Analytics] Event dropped (rate limited)');
    return;
  }
  lastTrackTime = now;

  const sessionId = getOrCreateSessionId()

  // 2. Stack Trace Sanitation (Strip local file paths and sensitive internal directories)
  let cleanStack = errorStack;
  if (cleanStack) {
    // Regex matches common absolute paths (e.g., C:\Users\..., /var/www/..., file:///)
    cleanStack = cleanStack.replace(/(?:\bfile:\/\/|\b[a-zA-Z]:[\\/]|^\/)[^\s()]+/gm, '[redacted_path]');
  }

  try {
    await api.post(
      '/analytics/track',
      { eventType, route, metadata, errorMessage, errorStack: cleanStack },
      { headers: { 'X-Session-Id': sessionId } }
    )
  } catch (error) {
    // Fail silently — analytics should never break the app
    console.warn('[Analytics] Failed to track event:', error)
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export const useAnalytics = () => {
  const location = useLocation()
  const lastRouteRef = useRef<string | null>(null)

  // Auto-track pageviews on route change
  useEffect(() => {
    const currentRoute = location.pathname

    // Avoid double-tracking on initial mount in StrictMode
    if (lastRouteRef.current === currentRoute) return
    lastRouteRef.current = currentRoute

    trackEvent('pageview', currentRoute)
  }, [location.pathname])

  return {
    /**
     * Track a custom event.
     * 
     * Examples:
     *   track('feature_usage', '/dashboard', { feature: 'document_upload', count: 3 })
     *   track('user_action', '/settings', { action: 'changed_theme', theme: 'dark' })
     *   track('error', '/library', {}, 'Failed to load documents', stackTrace)
     */
    track: (
      eventType: string,
      route?: string,
      metadata?: Record<string, any>,
      errorMessage?: string,
      errorStack?: string
    ) => {
      trackEvent(eventType, route || location.pathname, metadata, errorMessage, errorStack)
    },

    /**
     * Get current session ID (useful for debugging or manual tracking).
     */
    getSessionId: getOrCreateSessionId
  }
}