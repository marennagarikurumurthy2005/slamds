export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function formatDateTime(value) {
  if (!value) {
    return 'Not available yet'
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function shorten(text, maxLength = 140) {
  if (!text) {
    return 'No answer written yet.'
  }

  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trim()}...`
}

export function extractApiError(error, fallback = 'Something went wrong.') {
  const payload = error?.response?.data

  if (!payload) {
    return fallback
  }

  if (typeof payload === 'string') {
    const cleaned = payload.trim()
    if (!cleaned) {
      return fallback
    }
    if (cleaned.startsWith('<!DOCTYPE') || cleaned.startsWith('<html')) {
      return fallback
    }
    return cleaned
  }

  if (typeof payload.detail === 'string') {
    return payload.detail
  }

  if (typeof payload.message === 'string') {
    return payload.message
  }

  const firstEntry = Object.values(payload)[0]

  if (Array.isArray(firstEntry) && firstEntry.length > 0) {
    return firstEntry[0]
  }

  if (typeof firstEntry === 'string') {
    return firstEntry
  }

  return fallback
}
