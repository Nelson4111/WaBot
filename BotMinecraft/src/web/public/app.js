/**
 * Minecraft Bot Dashboard — Frontend JavaScript
 * Vanilla JS, no framework. Uses Fetch API + SSE for real-time data.
 */

'use strict';

// ── State ────────────────────────────────────────────────────────────────────
const state = {
  refreshInterval: null,
  sseSource: null,
  selectedBot: 'all',
  logEntries: [],
  currentLogFilter: 'all',
};

// ── DOM Helpers ───────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const setText = (id, text) => { const el = $(id); if (el) el.textContent = text; };
const setWidth = (id, pct) => { const el = $(id); if (el) el.style.width = `${Math.max(0, Math.min(100, pct))}%`; };

// ── Tab Navigation ────────────────────────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    switchTab(tab);
  });
});

function switchTab(tab) {
  // Deactivate all
  document.querySelectorAll('.nav-item').forEach((b) => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));

  // Activate selected
  const navBtn = document.querySelector(`[data-tab="${tab}"]`);
  const tabContent = $(`tab-${tab}`);

  if (navBtn) navBtn.classList.add('active');
  if (tabContent) tabContent.classList.add('active');

  // Update page title
  const titles = { dashboard: 'Dashboard', inventory: 'Inventory', waypoints: 'Waypoints', logs: 'Live Logs', commands: 'Commands' };
  setText('pageTitle', titles[tab] || tab);

  // Lazy load tab data
  if (tab === 'inventory') loadInventory();
  if (tab === 'waypoints') loadWaypoints();
}

// ── Status Refresh (Multi-Bot List) ───────────────────────────────────────────
async function fetchStatus() {
  try {
    const res = await fetch('/api/status/all');
    const json = await res.json();

    if (!json.success || !Array.isArray(json.data)) throw new Error(json.error || 'Failed');

    const dot = $('statusDot');
    const statusText = $('statusText');
    if (dot && statusText) {
      const anyOnline = json.data.some(b => b.status && b.status.online);
      dot.className = `status-dot ${anyOnline ? 'online' : 'offline'}`;
      statusText.textContent = anyOnline ? 'Online (Squad Active)' : 'Offline';
    }

    updateMultiBotStatusUI(json.data);
  } catch (err) {
    setOfflineUI();
  }
}

function updateMultiBotStatusUI(botsData) {
  const container = $('statsGrid');
  if (!container) return;

  container.innerHTML = '';

  botsData.forEach(b => {
    const d = b.status || {};
    const card = document.createElement('div');
    card.className = 'stat-card';
    card.style.flexDirection = 'column';
    card.style.alignItems = 'flex-start';
    card.style.padding = '14px';

    if (!d.online) {
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
          <strong style="font-size: 15px; color:#f4f4f5;">🤖 ${b.username}</strong>
          <span style="background:#991b1b; color:#fecaca; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:600;">OFFLINE</span>
        </div>
      `;
    } else {
      const health = Math.round(d.health || 0);
      const food = Math.round(d.food || 0);
      const posStr = d.position ? `X:${d.position.x} Y:${d.position.y} Z:${d.position.z}` : 'Unknown';
      const uptimeStr = d.connectedAt ? formatDuration(Date.now() - d.connectedAt) : '—';
      const modesHtml = (d.activeModes || []).length === 0
        ? '<span class="badge badge-idle">idle</span>'
        : (d.activeModes || []).map(m => `<span class="badge badge-${m}">${m}</span>`).join(' ');

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; width:100%; align-items:center; margin-bottom: 10px;">
          <strong style="font-size: 15px; color:#60a5fa;">🤖 ${b.username}</strong>
          <span style="background:#15803d; color:#bbf7d0; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:600;">ONLINE</span>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 8px; width:100%; font-size: 13px;">
          <div>❤️ HP: <strong>${health}/20</strong></div>
          <div>🍖 Food: <strong>${food}/20</strong></div>
          <div>📍 Pos: <span class="mono">${posStr}</span></div>
          <div>⏱️ Uptime: <strong>${uptimeStr}</strong></div>
        </div>
        <div style="margin-top: 8px; font-size: 12px; color: #a1a1aa;">Modes: ${modesHtml}</div>
      `;
    }
    container.appendChild(card);
  });

  setText('lastUpdate', new Date().toLocaleTimeString('id-ID'));
}

function setOfflineUI() {
  const dot = $('statusDot');
  if (dot) dot.className = 'status-dot offline';
  setText('lastUpdate', new Date().toLocaleTimeString('id-ID'));
}

// ── Stats ─────────────────────────────────────────────────────────────────────
async function fetchStats() {
  try {
    const q = state.selectedBot && state.selectedBot !== 'all' ? `?bot=${encodeURIComponent(state.selectedBot)}` : '';
    const res = await fetch('/api/stats' + q);
    const json = await res.json();
    if (!json.success) return;

    const s = json.data;
    setText('statDeaths', s.totalDeaths ?? '0');
    setText('statLogins', s.totalLogins ?? '0');
    setText('statReconnects', s.totalReconnects ?? '0');
    setText('statItems', s.totalItemsLooted ?? '0');
    setText('statFarmCycles', s.farmCycles ?? '0');
    setText('statLastSeen', s.lastSeen ? new Date(s.lastSeen).toLocaleString('id-ID') : '—');
  } catch (err) {
    // Silent fail
  }
}



// ── Inventory (Multi-Bot List) ────────────────────────────────────────────────
async function loadInventory() {
  const grid = $('inventoryGrid');
  if (!grid) return;

  try {
    const res = await fetch('/api/inventory/all');
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error(json.error || 'Gagal memuat inventory');

    grid.innerHTML = '';

    json.data.forEach(botInv => {
      const card = document.createElement('div');
      card.className = 'section';
      card.style.marginBottom = '20px';

      const items = botInv.items || [];
      const itemMap = {};
      for (const item of items) {
        const key = item.name;
        if (itemMap[key]) itemMap[key].count += item.count;
        else itemMap[key] = { ...item };
      }

      const sortedItems = Object.values(itemMap).sort((a, b) => b.count - a.count);
      const itemsHtml = sortedItems.length === 0
        ? '<div class="empty-state">Inventory kosong</div>'
        : `<div class="inventory-grid">${sortedItems.map(i => `
            <div class="inventory-item">
              <div class="inventory-item-name">${formatItemName(i.name)}</div>
              <div class="inventory-item-count">×${i.count}</div>
            </div>
          `).join('')}</div>`;

      card.innerHTML = `
        <div class="section-header" style="margin-bottom: 10px;">
          <h2 class="section-title" style="font-size: 15px;">🎒 Inventory Bot: <strong style="color: #60a5fa;">${botInv.username}</strong></h2>
        </div>
        ${itemsHtml}
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = `<div class="empty-state">Error: ${err.message}</div>`;
  }
}

// ── Waypoints ─────────────────────────────────────────────────────────────────
async function loadWaypoints() {
  const list = $('waypointsList');
  if (!list) return;
  list.innerHTML = '<div class="empty-state">Loading...</div>';

  try {
    const res = await fetch('/api/waypoints');
    const json = await res.json();
    if (!json.success) throw new Error(json.error);

    const waypoints = json.data;
    const entries = Object.entries(waypoints);

    if (entries.length === 0) {
      list.innerHTML = '<div class="empty-state">Belum ada waypoint. Gunakan !waypoint add &lt;nama&gt; di in-game.</div>';
      return;
    }

    list.innerHTML = entries
      .map(([name, pos]) => `
        <div class="waypoint-card">
          <span class="waypoint-name">📍 ${name}</span>
          <span class="waypoint-coords">X:${pos.x} Y:${pos.y} Z:${pos.z}</span>
          <div class="waypoint-actions">
            <button class="btn btn-sm" onclick="quickCmd('!waypoint go ${name}')">Go</button>
          </div>
        </div>
      `)
      .join('');
  } catch (err) {
    list.innerHTML = `<div class="empty-state">Error: ${err.message}</div>`;
  }
}

// ── Live Logs (SSE) ───────────────────────────────────────────────────────────
function connectSSE() {
  if (state.sseSource) state.sseSource.close();

  state.sseSource = new EventSource('/api/logs/stream');

  state.sseSource.addEventListener('log', (e) => {
    const entry = JSON.parse(e.data);
    if (entry.type === 'ping') return;
    addLogEntry(entry);
  });

  state.sseSource.onerror = () => {
    setTimeout(connectSSE, 5000); // Reconnect SSE
  };
}

function addLogEntry(entry) {
  state.logEntries.push(entry);
  if (state.logEntries.length > 200) state.logEntries.shift();

  const container = $('logContainer');
  if (!container) return;

  const level = (entry.level || 'info').toLowerCase();
  const time = entry.timestamp ? entry.timestamp.split(' ')[1] || '' : '';
  const hidden = state.currentLogFilter !== 'all' && level !== state.currentLogFilter;

  const el = document.createElement('div');
  el.className = `log-entry ${hidden ? 'hidden' : ''}`;
  el.dataset.level = level;
  el.innerHTML = `
    <span class="log-time">${time}</span>
    <span class="log-level log-level-${level}">[${level.toUpperCase()}]</span>
    <span class="log-message">${escapeHtml(entry.message || '')}</span>
  `;

  container.appendChild(el);

  // Auto-clean log DOM node capacity (Maksimal 200 elemen agar RAM browser tetap ringan)
  while (container.children.length > 200) {
    container.removeChild(container.firstChild);
  }

  // Auto-scroll
  const autoScroll = $('autoScrollLogs');
  if (autoScroll?.checked) {
    container.scrollTop = container.scrollHeight;
  }
}

function filterLogs() {
  const filter = $('logLevelFilter')?.value || 'all';
  state.currentLogFilter = filter;

  document.querySelectorAll('.log-entry').forEach((el) => {
    const level = el.dataset.level;
    if (filter === 'all' || level === filter) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });
}

function clearLogs() {
  const container = $('logContainer');
  if (container) container.innerHTML = '';
  state.logEntries = [];
}

// ── Commands ──────────────────────────────────────────────────────────────────
let pendingCommand = null;

function sendCommand() {
  const input = $('commandInput');
  const command = input?.value?.trim();
  if (!command) return;
  openCommandModal(command);
}

function quickCmd(cmdText) {
  openCommandModal(cmdText);
}

async function openCommandModal(cmdText) {
  pendingCommand = cmdText;
  setText('modalCommandText', cmdText);

  const modal = $('commandTargetModal');
  const container = $('modalTargetButtons');
  if (!modal || !container) return;

  modal.style.display = 'flex';
  modal.onclick = (e) => {
    if (e.target === modal) closeCommandModal();
  };

  container.innerHTML = '<div style="color:#a1a1aa; font-size:12px;">Memuat target bot...</div>';

  try {
    const res = await fetch('/api/bots');
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) {
      container.innerHTML = '<div style="color:#ef4444;">Gagal memuat bot.</div>';
      return;
    }

    container.innerHTML = '';

    // Tombol: Kirim ke Semua Bot (All Squad)
    const btnAll = document.createElement('button');
    btnAll.className = 'btn btn-primary';
    btnAll.style.width = '100%';
    btnAll.style.padding = '10px';
    btnAll.style.fontWeight = '600';
    btnAll.style.cursor = 'pointer';
    btnAll.textContent = '⚡ Kirim ke Semua Bot (All Squad)';
    btnAll.onclick = () => executeCommandWithTarget(pendingCommand, 'all');
    container.appendChild(btnAll);

    // Tombol: Masing-masing bot aktif
    json.data.forEach(bot => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.style.background = '#27272a';
      btn.style.color = '#f4f4f5';
      btn.style.border = '1px solid #3f3f46';
      btn.style.width = '100%';
      btn.style.padding = '10px';
      btn.style.textAlign = 'left';
      btn.style.fontWeight = '500';
      btn.style.display = 'flex';
      btn.style.justifyContent = 'space-between';
      btn.style.alignItems = 'center';
      btn.style.cursor = 'pointer';

      const isOnline = bot.active;
      const statusBadge = isOnline
        ? '<span style="background: #15803d; color: #bbf7d0; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">ONLINE</span>'
        : '<span style="background: #991b1b; color: #fecaca; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">OFFLINE</span>';

      btn.innerHTML = `<span>🤖 ${bot.username}</span> ${statusBadge}`;
      btn.onclick = () => executeCommandWithTarget(pendingCommand, bot.username);
      container.appendChild(btn);
    });
  } catch (_e) {
    container.innerHTML = '<div style="color:#ef4444;">Gagal memuat bot.</div>';
  }
}

function closeCommandModal() {
  const modal = $('commandTargetModal');
  if (modal) modal.style.display = 'none';
  pendingCommand = null;
}

async function executeCommandWithTarget(command, targetBot) {
  closeCommandModal();
  const response = $('commandResponse');
  if (response) {
    response.className = 'command-response visible';
    response.textContent = `Mengirim "${command}" ke target: ${targetBot}...`;
  }

  try {
    const res = await fetch('/api/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, targetBot }),
    });
    const json = await res.json();

    if (json.success) {
      if (response) {
        response.className = 'command-response visible success';
        response.textContent = `✓ "${command}" berhasil dikirim ke: ${targetBot}`;
      }
      const input = $('commandInput');
      if (input) input.value = '';
    } else {
      if (response) {
        response.className = 'command-response visible error';
        response.textContent = `✗ Error: ${json.error}`;
      }
    }
  } catch (err) {
    if (response) {
      response.className = 'command-response visible error';
      response.textContent = `✗ Network error: ${err.message}`;
    }
  }
}

// ── Keyboard Shortcuts ────────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.target === $('commandInput') && e.key === 'Enter') {
    sendCommand();
  }
});

// ── Refresh ───────────────────────────────────────────────────────────────────
async function refreshAll() {
  await Promise.all([fetchStatus(), fetchStats()]);
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function formatDuration(ms) {
  if (!ms || ms < 0) return '0h 0m 0s';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`;
}

function formatItemName(name) {
  if (!name) return 'Unknown';
  return name.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function loadBotList() {
  try {
    const [resBots, resRoles] = await Promise.all([
      fetch('/api/bots').then(r => r.json()).catch(() => ({})),
      fetch('/api/roles').then(r => r.json()).catch(() => ({}))
    ]);

    if (!resBots.success || !Array.isArray(resBots.data)) return;

    const select = $('botTargetSelect');
    if (select) {
      const currentVal = select.value;
      select.innerHTML = '<option value="all">⚡ Semua Bot (All Squad)</option>';
      resBots.data.forEach(bot => {
        const opt = document.createElement('option');
        opt.value = bot.username;
        opt.textContent = `🤖 ${bot.username} (${bot.active ? 'Online' : 'Offline'})`;
        select.appendChild(opt);
      });
      if (currentVal) select.value = currentVal;
    }

    const squadGrid = $('squadGrid');
    if (squadGrid) {
      const rolesMap = resRoles.data || {};
      squadGrid.innerHTML = '';

      resBots.data.forEach(bot => {
        const roleInfo = rolesMap[bot.username] || { role: 'worker', autoFarm: 'none', autoGuard: false };
        const card = document.createElement('div');
        card.className = 'stat-card';
        card.style.cursor = 'pointer';
        card.onclick = () => {
          if (select) select.value = bot.username;
          onBotTargetChange();
        };

        const isOnline = bot.active;
        const statusBadge = isOnline
          ? '<span style="background: #15803d; color: #bbf7d0; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">ONLINE</span>'
          : '<span style="background: #991b1b; color: #fecaca; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">OFFLINE</span>';

        const readyBadge = roleInfo.note
          ? `<span style="background: ${roleInfo.ready ? '#14532d' : '#7f1d1d'}; color: ${roleInfo.ready ? '#86efac' : '#fca5a5'}; padding: 1px 6px; border-radius: 8px; font-size: 10px; font-weight: 600; margin-left: 4px;">${roleInfo.note}</span>`
          : '';

        card.innerHTML = `
          <div class="stat-icon">${roleInfo.role === 'primary' ? '👑' : '🤖'}</div>
          <div class="stat-body" style="width: 100%;">
            <div class="stat-label" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
              <span style="font-weight: 600;">${bot.username}</span>
              ${statusBadge}
            </div>
            <div class="stat-value" style="font-size: 13px; margin-top: 4px; color: #e4e4e7;">Peran: <strong>${roleInfo.role || 'worker'}</strong></div>
            <div style="font-size: 12px; color: #a1a1aa; margin-top: 2px;">Job: <strong>${roleInfo.autoFarm || 'none'}</strong> ${readyBadge} ${roleInfo.autoGuard ? '🛡' : ''}</div>
          </div>
        `;
        squadGrid.appendChild(card);
      });
    }
  } catch (_e) {}
}

async function loadDynamicCommands() {
  try {
    const res = await fetch('/api/commands');
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) return;

    const container = $('dynamicQuickCommands');
    if (!container) return;

    const emojiMap = {
      status: '📊', farm: '🌾', guard: '🛡', stop: '⏹', eat: '🍖',
      inventory: '🎒', waypoint: '📍', whitelist: '📋', help: '❓',
      afk: '💤', drop: '📦', give: '🎁', addchest: '🧱', pause: '⏸', resume: '▶'
    };

    container.innerHTML = '';
    json.data.forEach(cmdName => {
      const btn = document.createElement('button');
      btn.className = 'quick-cmd';
      const icon = emojiMap[cmdName] || '⌨';
      btn.textContent = `${icon} !${cmdName}`;
      btn.onclick = () => quickCmd(`!${cmdName}`);
      container.appendChild(btn);
    });
  } catch (_e) {}
}

function onBotTargetChange() {
  const select = $('botTargetSelect');
  if (select) state.selectedBot = select.value || 'all';
  console.log(`Bot Target diubah ke: ${state.selectedBot}`);
  refreshAll();
  loadInventory();
}

// ── Init ──────────────────────────────────────────────────────────────────────
function init() {
  connectSSE();
  refreshAll();
  loadBotList();
  loadDynamicCommands();

  // Auto-refresh setiap 5 detik
  state.refreshInterval = setInterval(refreshAll, 5000);
}

// Jalankan setelah DOM siap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
