export const FAMILY100_RESTART_COOLDOWN = 10 * 1000
export const FAMILY100_SURRENDER_DELAY = 60 * 1000

function getCooldownKey(chat) {
    return `family100_cooldown_${chat}`
}

export function getFamily100CooldownRemaining(game, chat, now = Date.now()) {
    const key = getCooldownKey(chat)
    const remaining = (game[key] || 0) - now
    if (remaining <= 0) {
        delete game[key]
        return 0
    }
    return remaining
}

export function startFamily100Cooldown(game, chat, now = Date.now()) {
    game[getCooldownKey(chat)] = now + FAMILY100_RESTART_COOLDOWN
}
