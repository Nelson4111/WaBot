import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const mediaRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../media/game-roles')
const rolesRoot = path.join(mediaRoot, 'roles')
const scenesRoot = path.join(mediaRoot, 'scenes')
const imageCache = new Map()

const listImages = (...segments) => {
    const directory = path.join(...segments)
    return fs.readdirSync(directory, { withFileTypes: true })
        .filter((entry) => entry.isFile() && /\.(?:jpe?g|png|webp)$/i.test(entry.name))
        .map((entry) => path.join(directory, entry.name))
        .sort()
}

const commonRoot = path.join(rolesRoot, 'common')
const commonRoles = fs.readdirSync(commonRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .map((name) => [name, Object.freeze(listImages(commonRoot, name))])

export const ROLE_IMAGES = Object.freeze({
    ...Object.fromEntries(commonRoles),
    warga: Object.freeze({
        village: Object.freeze(listImages(rolesRoot, 'warga', 'desa')),
        city: Object.freeze(listImages(rolesRoot, 'warga', 'kota')),
        space: Object.freeze(listImages(rolesRoot, 'warga', 'crewmate'))
    }),
    mayor: Object.freeze({
        village: Object.freeze(listImages(rolesRoot, 'mayor', 'desa')),
        city: Object.freeze(listImages(rolesRoot, 'mayor', 'kota')),
        district: Object.freeze(listImages(rolesRoot, 'mayor', 'distrik')),
        space: Object.freeze(listImages(rolesRoot, 'mayor', 'crewmate'))
    })
})

export const SCENE_IMAGES = Object.freeze(Object.fromEntries(
    fs.readdirSync(scenesRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => [entry.name, Object.freeze(listImages(scenesRoot, entry.name))])
))

const getRandom = (items) => items?.length
    ? items[Math.floor(Math.random() * items.length)]
    : null

const readImage = (imagePath) => {
    if (!imagePath) return null
    if (!imageCache.has(imagePath)) imageCache.set(imagePath, fs.readFileSync(imagePath))
    return imageCache.get(imagePath)
}

const locationKey = (location) => {
    const normalizedLocation = String(location).toLowerCase()
    return /desa/.test(normalizedLocation)
        ? 'village'
        : /distrik/.test(normalizedLocation)
            ? 'district'
            : /pesawat|arena|mars/.test(normalizedLocation)
                ? 'space'
                : 'city'
}

export const getRoleImagePaths = () => Object.values(ROLE_IMAGES)
    .flatMap((images) => Object.values(images).flatMap((value) => value))

export const getSceneImagePaths = () => Object.values(SCENE_IMAGES).flat()

export const getRoleImage = (role, location = '') => {
    const images = ROLE_IMAGES[role] || ROLE_IMAGES.warga
    const choices = Array.isArray(images)
        ? images
        : images[locationKey(location)] || images.city || images.space || images.village
    return readImage(getRandom(choices))
}

export const getSceneImage = (scene) => readImage(getRandom(SCENE_IMAGES[scene]))
