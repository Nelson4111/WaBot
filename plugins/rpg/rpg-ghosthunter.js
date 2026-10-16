import { createRpgCreatureHunt } from '../../lib/rpgCreatureHunt.js'
import { GHOST_COMBAT_DATA, GHOST_HUNTER_DATA, GHOST_HUNTER_STORIES } from '../../lib/ghostHunterData.js'

const handler = createRpgCreatureHunt({
  type: 'ghost',
  command: 'ghost',
  data: GHOST_HUNTER_DATA,
  combatData: GHOST_COMBAT_DATA,
  stories: GHOST_HUNTER_STORIES
})

export default handler
