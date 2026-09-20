/**
 * JavaScript Code Execution Plugin (Eval & Async Eval)
 * Mendukung eksekusi kode JavaScript langsung dari WhatsApp (Owner Only)
 * Prefiks yang didukung:
 * - '=> <kode>' (Async eval dengan auto-return)
 * - '> <kode>'  (Ekspresi / eval standar)
 * - '.eval <kode>' / '!js <kode>'
 */

import syntaxerror from 'syntax-error'
import { format, inspect } from 'util'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const AsyncFunction = (async () => {}).constructor

export const handler = async (m, extra = {}) => {
  let {
    conn = global.conn,
    isOwner = false,
    isROwner = false,
    usedPrefix = '',
    noPrefix = '',
    text = '',
    command = '',
    args = [],
    participants = [],
    groupMetadata = {}
  } = extra

  // Keamanan: Tolak jika dipanggil dari sub-bot / jadibot selain instance utama
  if (global.conn?.user?.jid && conn?.user?.jid && global.conn.user.jid !== conn.user.jid) return

  let code = (noPrefix || text || '').trim()
  if (!code) {
    return m.reply('Ketik kode JavaScript yang ingin dieksekusi!\nContoh:\n=> await conn.relayMessage(...)')
  }

  let _return
  let _syntax = ''
  let output = ''

  // Jika kode belum memiliki keyword return dan valid jika diawali return, bungkus dengan return
  let execCode = code
  if (!/\breturn\b/.test(execCode)) {
    let testCode = 'return ' + execCode
    let err = syntaxerror('(async () => {\n' + testCode + '\n})', 'Execution Function', {
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true
    })
    if (!err) {
      execCode = testCode
    }
  }

  // Print helper untuk mencatat output manual
  const print = (...args) => {
    const formatted = args.map(a => typeof a === 'string' ? a : inspect(a, { depth: 2, colors: false })).join(' ')
    output += formatted + '\n'
  }

  // Intercept console lokal agar console.log di dalam kode ikut tertangkap
  const customConsole = {
    ...console,
    log: (...cArgs) => {
      console.log(...cArgs)
      print(...cArgs)
    },
    error: (...cArgs) => {
      console.error(...cArgs)
      print(...cArgs)
    },
    warn: (...cArgs) => {
      console.warn(...cArgs)
      print(...cArgs)
    }
  }

  try {
    const fn = new AsyncFunction(
      'conn',
      'm',
      'chat',
      'sender',
      'usedPrefix',
      'command',
      'args',
      'noPrefix',
      'participants',
      'groupMetadata',
      'isOwner',
      'isROwner',
      'require',
      'process',
      'global',
      'console',
      'print',
      'inspect',
      'format',
      execCode
    )

    _return = await fn.call(
      conn,
      conn,
      m,
      m.chat,
      m.sender,
      usedPrefix,
      command,
      args,
      noPrefix,
      participants,
      groupMetadata,
      isOwner,
      isROwner,
      require,
      process,
      global,
      customConsole,
      print,
      inspect,
      format
    )
  } catch (err) {
    const synErr = syntaxerror(code, 'Execution Function', {
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true
    })
    if (synErr) {
      _syntax = '```\n' + synErr + '\n```\n\n'
    }
    _return = err
  }

  let finalReply = ''
  if (_syntax) {
    finalReply += _syntax
  }
  if (output.trim()) {
    finalReply += output.trim() + '\n\n'
  }
  if (typeof _return !== 'undefined') {
    let formattedResult
    if (typeof _return === 'string') {
      formattedResult = _return
    } else if (_return instanceof Error) {
      formattedResult = _return.stack || String(_return)
    } else {
      formattedResult = inspect(_return, { depth: 1, colors: false, maxArrayLength: 50 })
    }
    finalReply += formattedResult
  }

  if (finalReply.trim()) {
    // Batasi panjang teks agar tidak melebihi kapasitas WhatsApp
    if (finalReply.length > 60000) {
      finalReply = finalReply.slice(0, 60000) + '\n\n... (output dipotong karena terlalu panjang)'
    }
    await m.reply(finalReply.trim(), false, false, { smlcap: false })
  }
}

handler.help = ['=> <kode>', '> <kode>', 'eval <kode>']
handler.tags = ['owner']
handler.customPrefix = /^(=?>|~>|([.#!](eval|js)\b))\s*/
handler.command = new RegExp
handler.owner = true

export default handler
