function normalizeText(value) {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim()
}

export function buildWriteSlamText(slam) {
  if (!slam) {
    return ''
  }

  const parts = []
  const mainThought = normalizeText(slam.what_do_you_think)
  const description = normalizeText(slam.how_would_you_describe)
  const bestMemory = normalizeText(slam.best_memory)

  if (mainThought) {
    parts.push(mainThought)
  }

  if (description) {
    parts.push(`How I would describe MK\n${description}`)
  }

  if (bestMemory) {
    parts.push(`Best memory with MK\n${bestMemory}`)
  }

  return parts.join('\n\n').trim()
}

export function buildBetterVersionText(slam) {
  if (!slam) {
    return ''
  }

  return normalizeText(slam.suggestions_or_message)
}
