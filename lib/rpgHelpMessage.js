const HELP_ACTIONS = new Set(['guide', 'panduan', 'command', 'commands', 'cmd', 'help'])

export function isRpgHelpRequest(message) {
  const text = String(message?.text || '').trim()
  const tokens = text.split(/\s+/)
  const command = tokens[0] || ''
  if (!/^[^a-z0-9]/i.test(command)) return false

  const action = tokens.at(-1)?.toLowerCase()
  const rootCommand = command.replace(/^[^a-z0-9]+/i, '').toLowerCase()
  return HELP_ACTIONS.has(action) || (rootCommand === 'guide' && tokens.length > 1)
}

export function getRpgHelpButtons(text, limit = 3) {
  const commands = new Set()
  const pattern = /([.!#][a-z][\w-]*(?:\s+[a-z][\w-]*){0,2})/gi

  for (const match of String(text || '').matchAll(pattern)) {
    const command = match[1].trim()
    const remainder = String(text || '').slice(match.index + match[0].length)
    if (/^\s*(?:<|@|\[)/.test(remainder)) continue
    if (!commands.has(command)) commands.add(command)
    if (commands.size >= limit) break
  }

  return [...commands].map(command => [
    command.length > 24 ? `${command.slice(0, 21)}...` : command,
    command
  ])
}
