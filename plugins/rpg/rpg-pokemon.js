import { createRpgCreatureHunt } from '../../lib/rpgCreatureHunt.js'
import { POKEMON_COMBAT_DATA, POKEMON_DATA, POKEMON_STORIES } from '../../lib/pokemonData.js'

const handler = createRpgCreatureHunt({
  type: 'pokemon',
  command: 'pokemon',
  data: POKEMON_DATA,
  combatData: POKEMON_COMBAT_DATA,
  stories: POKEMON_STORIES
})

export default handler
