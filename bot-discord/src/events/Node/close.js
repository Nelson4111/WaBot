const lastCloseTime = new Map();
const CLOSE_THROTTLE_MS = 60000;

module.exports = {
  name: "close",
  run: async (client, name, code, reason) => {
    if (code && code.toString().includes('ETIMEDOUT')) {
      return;
    }

    const closeKey = `${name}_${code}`;
    const now = Date.now();
    const lastTime = lastCloseTime.get(closeKey) || 0;

    if (now - lastTime < CLOSE_THROTTLE_MS) {
      return;
    }
    lastCloseTime.set(closeKey, now);

    client.logger.log(
      `Lavalink ${name}: Closed, Code ${code}, Reason ${reason || "No reason"}`,
      "warn",
    );
  },
};
