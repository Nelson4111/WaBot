import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'

const databasePath = path.join(process.cwd(), 'lib/database/totalchat.json')

const dir = path.dirname(databasePath)
if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

let totalChatData = {}
try {
    if (existsSync(databasePath)) {
        const content = readFileSync(databasePath, 'utf-8')
        totalChatData = content ? JSON.parse(content) : {}
        if (Array.isArray(totalChatData)) totalChatData = {}
    } else {
        totalChatData = {}
    }
} catch (e) {
    totalChatData = {}
}

export function addChat(chatId, senderId) {
    if (!chatId || !chatId.endsWith('@g.us')) return 
    if (!senderId || senderId.includes(':')) return 

    if (!totalChatData[chatId]) totalChatData[chatId] = {}
    if (!totalChatData[chatId][senderId]) totalChatData[chatId][senderId] = 0
    
    totalChatData[chatId][senderId] += 1
}

export function getChatData() {
    return totalChatData
}

export function saveChatData() {
    try {
        writeFileSync(databasePath, JSON.stringify(totalChatData, null, 2))
    } catch (e) {
        console.error('Gagal menyimpan totalchat.json:', e)
    }
}

setInterval(saveChatData, 30000)
