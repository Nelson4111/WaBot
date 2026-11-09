import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const mediaRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../media/game-roles')
const rolesRoot = path.join(mediaRoot, 'roles')
const scenesRoot = path.join(mediaRoot, 'scenes')
const imageCache = new Map()

export const TERMAI_ROLE_IMAGES = Object.freeze({
    warga: Object.freeze({
        village: Object.freeze([
            'https://c.termai.cc/i114/m6d5Xr.png',
            'https://c.termai.cc/i160/qEL5l.png',
            'https://c.termai.cc/i139/FIJMF5.png',
            'https://c.termai.cc/i101/gr2k6Pg.png',
            'https://c.termai.cc/i118/FxySI2.png',
            'https://c.termai.cc/i140/jvB.png',
            'https://c.termai.cc/i193/9ATxEGy.png'
        ]),
        city: Object.freeze([
            'https://c.termai.cc/i131/BvT.png',
            'https://c.termai.cc/i196/jLF.png',
            'https://c.termai.cc/i114/JuSVWA.png',
            'https://c.termai.cc/i116/cjB6.png'
        ]),
        space: Object.freeze([
            'https://c.termai.cc/i116/SQUH.png',
            'https://c.termai.cc/i132/hrDtk.png',
            'https://c.termai.cc/i128/RWiHR.png',
            'https://c.termai.cc/i146/RDTNazG.png',
            'https://c.termai.cc/i108/6YaaM.png'
        ])
    }),
    seer: Object.freeze(['https://c.termai.cc/i116/w58etj.png', 'https://c.termai.cc/i104/dFpjV1.png']),
    guardian: Object.freeze(['https://c.termai.cc/i139/GC6X3.png', 'https://c.termai.cc/i147/N827fdq.png']),
    sorcerer: Object.freeze(['https://c.termai.cc/i154/iYU5o.png', 'https://c.termai.cc/i173/TAR.png']),
    werewolf: Object.freeze(['https://c.termai.cc/i132/4iL.png', 'https://c.termai.cc/i184/i4L9.png', 'https://c.termai.cc/i105/CDq6P.png']),
    mafia: Object.freeze(['https://c.termai.cc/i141/imPykA.png']),
    killer: Object.freeze(['https://c.termai.cc/i129/XeUEgya.png', 'https://c.termai.cc/i127/dQIvVr.png']),
    assassin: Object.freeze(['https://c.termai.cc/i117/Nyq0.png']),
    impostor: Object.freeze(['https://c.termai.cc/i132/ZqxepMr.png', 'https://c.termai.cc/i119/IjWcB3.png', 'https://c.termai.cc/i150/i42q.png', 'https://c.termai.cc/i187/EfAI.png']),
    alien: Object.freeze(['https://c.termai.cc/i193/wtoSAc.png', 'https://c.termai.cc/i143/Sqn.png']),
    zombie: Object.freeze(['https://c.termai.cc/i148/YZvGxP.png', 'https://c.termai.cc/i150/tSkeiTz.png', 'https://c.termai.cc/i113/ubiURO.png']),
    vampire: Object.freeze(['https://c.termai.cc/i120/M7mpH2y.png']),
    hunter: Object.freeze(['https://c.termai.cc/i188/Rk9XLP.png', 'https://c.termai.cc/i191/8r2.png', 'https://c.termai.cc/i163/06oEn.png']),
    mayor: Object.freeze({
        village: Object.freeze(['https://c.termai.cc/i145/ch9.png']),
        city: Object.freeze(['https://c.termai.cc/i194/pj3wTj.png']),
        district: Object.freeze(['https://c.termai.cc/i142/K3PH.png']),
        space: Object.freeze(['https://c.termai.cc/i160/wQ4uUL.png'])
    }),
    jester: Object.freeze(['https://c.termai.cc/i148/90GUU.png', 'https://c.termai.cc/i150/Vug.png']),
    warden: Object.freeze(['https://c.termai.cc/i151/5FP.png']),
    cipher: Object.freeze(['https://c.termai.cc/i155/JJ5.png']),
    parasite: Object.freeze(['https://c.termai.cc/i176/JDjQ9s.png', 'https://c.termai.cc/i148/4MZsxu.png']),
    fixer: Object.freeze(['https://c.termai.cc/i176/FLUequ5.png']),
    vigilante: Object.freeze(['https://c.termai.cc/i195/BdXE.png']),
    ghost: Object.freeze(['https://c.termai.cc/i112/3rCnbHx.png'])
})

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
    const images = ROLE_IMAGES[role]
    if (!images) return null
    const choices = Array.isArray(images)
        ? images
        : images[locationKey(location)] || images.city || images.space || images.village
    return readImage(getRandom(choices))
}

export const getSceneImage = (scene) => readImage(getRandom(SCENE_IMAGES[scene]))
