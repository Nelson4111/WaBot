import assert from 'node:assert/strict'
import test from 'node:test'
import family100 from '../plugins/game/game-family100.js'
import { before as handleFamily100Answer } from '../plugins/game/game-family100_ans.js'
import { awardFamily100Mvp } from '../plugins/game/game-family100-score.js'
import { FAMILY100_RESTART_COOLDOWN, getFamily100CooldownRemaining, startFamily100Cooldown } from '../plugins/game/game-family100-state.js'

function createMessage(sender, text = '', pushName = sender) {
    const replies = []
    return {
        chat: 'group@g.us',
        sender,
        text,
        pushName,
        replies,
        async reply(message) {
            replies.push(message)
        }
    }
}

function createConnection() {
    return {
        game: {},
        sent: [],
        async sendMessage(chat, content) {
            this.sent.push({ chat, content })
            return { key: { id: `message-${this.sent.length}` } }
        }
    }
}

test('Family100 start aliases and score subcommands are available', async () => {
    for (const alias of ['family100', 'f100', 'fam100', 'fam']) {
        assert.equal(family100.command.test(alias), true)
    }

    global.db = { data: { users: { 'player@s.whatsapp.net': { family100Score: 7 } } } }
    const message = createMessage('player@s.whatsapp.net')
    await family100.call({}, message, { args: ['score'] })
    assert.match(message.replies[0], /7 poin/)

    message.replies.length = 0
    await family100.call({}, message, { args: ['poin'] })
    assert.match(message.replies[0], /7 poin/)

    global.db.data.users['other@s.whatsapp.net'] = { family100Score: 12, family100Name: 'Pemain Lain' }
    message.replies.length = 0
    await family100.call({}, message, { args: ['top'] })
    assert.match(message.replies[0], /TOP 10 FAMILY100/)
    assert.match(message.replies[0], /Pemain Lain — \*12 poin\*/)
})

test('correct answers award persistent points and only answerers can vote surrender', async () => {
    global.db = { data: { users: {} } }
    const conn = createConnection()
    const roomId = 'family100_' + 'group@g.us'
    const timeout = setTimeout(() => {}, 60_000)
    conn.game[roomId] = {
        soal: 'Pertanyaan',
        jawaban: ['satu', 'dua', 'tiga', 'empat', 'lima', 'enam'],
        terjawab: Array(6).fill(false),
        winScore: 4999,
        answerPoint: 1,
        creator: 'creator@s.whatsapp.net',
        participants: [],
        surrenderVotes: [],
        startedAt: Date.now() - 60_000,
        timeout
    }

    for (const [index, word] of ['satu', 'dua', 'tiga', 'empat'].entries()) {
        const sender = `player${index + 1}@s.whatsapp.net`
        await handleFamily100Answer.call(conn, createMessage(sender, word, `Player ${index + 1}`))
        assert.equal(global.db.data.users[sender].family100Score, 1)
    }
    assert.equal(conn.game[roomId].participants.length, 4)

    const outsider = createMessage('outsider@s.whatsapp.net', 'nyerah')
    await handleFamily100Answer.call(conn, outsider)
    assert.match(outsider.replies[0], /belum menjawab/)
    assert.equal(conn.game[roomId].surrenderVotes.length, 0)

    const creator = createMessage('creator@s.whatsapp.net', 'nyerah')
    await handleFamily100Answer.call(conn, creator)
    assert.equal(conn.game[roomId].surrenderVotes.length, 1)
    assert.ok(conn.game[roomId])

    for (const player of ['player1@s.whatsapp.net', 'player2@s.whatsapp.net']) {
        await handleFamily100Answer.call(conn, createMessage(player, 'nyerah'))
    }
    assert.ok(conn.game[roomId])

    await handleFamily100Answer.call(conn, createMessage('player3@s.whatsapp.net', 'nyerah'))
    assert.equal(conn.game[roomId], undefined)
    assert.match(conn.sent.at(-1).content.text, /Suara pemain mencukupi/)
})

test('three participants need two surrender votes', async () => {
    const conn = createConnection()
    const roomId = 'family100_' + 'group@g.us'
    conn.game[roomId] = {
        soal: 'Pertanyaan',
        jawaban: ['satu', 'dua', 'tiga'],
        terjawab: ['player1@s.whatsapp.net', 'player2@s.whatsapp.net', 'player3@s.whatsapp.net'],
        participants: ['player1@s.whatsapp.net', 'player2@s.whatsapp.net', 'player3@s.whatsapp.net'],
        surrenderVotes: [],
        startedAt: Date.now() - 60_000
    }

    await handleFamily100Answer.call(conn, createMessage('player1@s.whatsapp.net', 'nyerah'))
    assert.ok(conn.game[roomId])
    await handleFamily100Answer.call(conn, createMessage('player2@s.whatsapp.net', 'nyerah'))
    assert.equal(conn.game[roomId], undefined)
    assert.ok(getFamily100CooldownRemaining(conn.game, 'group@g.us') > 0)
})

test('surrender is blocked until one minute after the game starts', async () => {
    const conn = createConnection()
    const roomId = 'family100_' + 'group@g.us'
    conn.game[roomId] = {
        startedAt: Date.now() - 59_000,
        creator: 'creator@s.whatsapp.net',
        participants: ['player1@s.whatsapp.net'],
        surrenderVotes: [],
        terjawab: ['player1@s.whatsapp.net'],
        jawaban: ['satu']
    }

    const earlyVote = createMessage('player1@s.whatsapp.net', 'nyerah')
    await handleFamily100Answer.call(conn, earlyVote)
    assert.match(earlyVote.replies[0], /Voting menyerah bisa dimulai/)
    assert.deepEqual(conn.game[roomId].surrenderVotes, [])

    conn.game[roomId].startedAt = Date.now() - 60_000
    await handleFamily100Answer.call(conn, createMessage('player1@s.whatsapp.net', 'nyerah'))
    assert.equal(conn.game[roomId], undefined)
})

test('restart cooldown lasts ten seconds', () => {
    const game = {}
    startFamily100Cooldown(game, 'group@g.us', 1_000)
    assert.equal(getFamily100CooldownRemaining(game, 'group@g.us', 1_000), FAMILY100_RESTART_COOLDOWN)
    assert.equal(getFamily100CooldownRemaining(game, 'group@g.us', 10_999), 1)
    assert.equal(getFamily100CooldownRemaining(game, 'group@g.us', 11_000), 0)
})

test('Family100 command refuses to start during the restart cooldown', async () => {
    const conn = createConnection()
    startFamily100Cooldown(conn.game, 'group@g.us')

    const message = createMessage('player@s.whatsapp.net')
    await family100.call(conn, message, { args: [] })

    assert.match(message.replies[0], /Tunggu 10 detik/)
    assert.equal(conn.game['family100_group@g.us'], undefined)
})

test('unique top answerer receives two bonus points and is announced as MVP', async () => {
    global.db = { data: { users: {} } }
    const conn = createConnection()
    const roomId = 'family100_' + 'group@g.us'
    conn.game[roomId] = {
        soal: 'Pertanyaan',
        jawaban: ['satu', 'dua', 'tiga'],
        terjawab: [false, false, false],
        participants: [],
        surrenderVotes: [],
        winScore: 0,
        answerPoint: 1
    }

    await handleFamily100Answer.call(conn, createMessage('player1@s.whatsapp.net', 'satu', 'Pemain Satu'))
    await handleFamily100Answer.call(conn, createMessage('player1@s.whatsapp.net', 'dua', 'Pemain Satu'))
    await handleFamily100Answer.call(conn, createMessage('player2@s.whatsapp.net', 'tiga', 'Pemain Dua'))

    assert.equal(global.db.data.users['player1@s.whatsapp.net'].family100Score, 4)
    assert.match(conn.sent.at(-1).content.text, /MVP: Pemain Satu \(\+2 poin\)/)
})

test('MVP bonus is skipped for a solo player or a tie', () => {
    global.db = { data: { users: {} } }
    const soloRoom = { terjawab: ['player1@s.whatsapp.net', 'player1@s.whatsapp.net'] }
    assert.equal(awardFamily100Mvp(soloRoom), null)
    assert.equal(global.db.data.users['player1@s.whatsapp.net'], undefined)

    const tiedRoom = { terjawab: ['player1@s.whatsapp.net', 'player2@s.whatsapp.net'] }
    assert.equal(awardFamily100Mvp(tiedRoom), null)
    assert.equal(global.db.data.users['player1@s.whatsapp.net'], undefined)
    assert.equal(global.db.data.users['player2@s.whatsapp.net'], undefined)
})
