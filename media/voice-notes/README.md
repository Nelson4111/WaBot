Letakkan file voice note di folder ini.

Daftarkan nama file dan keyword-nya di `plugins/audio/voice-note.js`, contoh:

```js
const VOICE_NOTES = {
  halo: 'halo.mp3',
  ketawa: 'ketawa.ogg',
}
```

Format yang disarankan adalah `.ogg` dengan codec Opus. `.mp3`, `.m4a`, dan `.wav` juga didukung.