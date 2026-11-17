import fs from 'fs'

const RPG_MEDIA_DIRECTORY = new URL('../media/rpg/', import.meta.url)
const mediaCache = new Map()

export function resolveRpgMedia(media) {
  if (typeof media !== 'string' || !/^https?:\/\//i.test(media)) return media

  const url = new URL(media)
  if (url.hostname !== 'c.termai.cc') return media

  const suffix = url.pathname.split('/').filter(Boolean).pop()
  if (!suffix || suffix === '.' || suffix === '..' || !/^[\w.-]+$/.test(suffix)) return media

  const extensionlessName = suffix.replace(/\.(?:jpe?g|png|webp)$/i, '')
  const candidates = [...new Set([
    suffix,
    `${extensionlessName}.jpg`,
    `${extensionlessName}.jpeg`,
    `${extensionlessName}.png`,
    `${extensionlessName}.webp`
  ])]

  for (const candidate of candidates) {
    const file = new URL(candidate, RPG_MEDIA_DIRECTORY)
    if (mediaCache.has(file.href)) return mediaCache.get(file.href)
    if (fs.existsSync(file)) {
      const image = fs.readFileSync(file)
      mediaCache.set(file.href, image)
      return image
    }
  }

  return media
}
