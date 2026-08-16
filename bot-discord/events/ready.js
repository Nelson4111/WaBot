/**
 * events/ready.js
 * Fired saat bot berhasil login dan siap
 */

export default {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`[BOT-DC] ✅ ${client.user.tag} Online! Siap melayani musik 🎵`)
        client.user.setActivity('/play untuk mulai musik!', { type: 2 }) // 2 = LISTENING
    }
}
