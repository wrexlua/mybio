const DISCORD_ID = '1448712157381398682';

function initDiscord() {
  var link = document.getElementById('discordLink');
  var overlay = document.getElementById('discordOverlay');
  if (!link || !overlay) return;

  link.addEventListener('click', function(e) {
    e.preventDefault();
    overlay.classList.add('active');
    fetchDiscordData();
  });

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) overlay.classList.remove('active');
  });

  document.getElementById('discordClose').addEventListener('click', function() {
    overlay.classList.remove('active');
  });
}

function fetchDiscordData() {
  var statusEl = document.getElementById('discordStatus');
  var avatarEl = document.getElementById('discordAvatar');
  var nameEl = document.getElementById('discordName');
  var activityEl = document.getElementById('discordActivity');
  var dotEl = document.getElementById('discordStatusDot');

  statusEl.textContent = 'Loading...';
  statusEl.style.color = 'rgba(255,255,255,0.4)';
  if (dotEl) dotEl.style.background = 'rgba(255,255,255,0.2)';
  activityEl.innerHTML = '<div class="discord-no-activity">Fetching your activity...</div>';

  fetch('https://api.lanyard.rest/v1/users/' + DISCORD_ID)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data || !data.data) {
        statusEl.textContent = 'Offline';
        if (dotEl) dotEl.style.background = '#747f8d';
        activityEl.innerHTML = '<div class="discord-no-activity">User is offline</div>';
        return;
      }
      renderDiscord(data.data, statusEl, avatarEl, nameEl, activityEl, dotEl);
    })
    .catch(function() {
      statusEl.textContent = 'Error loading';
      statusEl.style.color = 'rgba(255,100,100,0.7)';
      activityEl.innerHTML = '<div class="discord-no-activity" style="color:rgba(255,100,100,0.5)">Failed to load. Try again later.</div>';
    });
}

function renderDiscord(d, statusEl, avatarEl, nameEl, activityEl, dotEl) {
  var status = d.discord_status || 'offline';
  var statusColors = { online: '#43b581', idle: '#faa61a', dnd: '#f04747', offline: '#747f8d' };
  var statusMap = { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', offline: 'Offline' };

  if (dotEl) dotEl.style.background = statusColors[status] || '#747f8d';
  statusEl.textContent = statusMap[status] || 'Offline';
  statusEl.style.color = statusColors[status] ? (status === 'online' ? 'rgba(67,181,129,0.8)' : status === 'idle' ? 'rgba(250,166,26,0.8)' : status === 'dnd' ? 'rgba(240,71,71,0.8)' : 'rgba(116,127,141,0.8)') : 'rgba(255,255,255,0.4)';

  var avatarUrl = 'https://cdn.discordapp.com/avatars/' + DISCORD_ID + '/' + d.discord_user.avatar + '.png?size=128';
  avatarEl.src = avatarUrl;
  nameEl.textContent = d.discord_user.global_name || d.discord_user.username;

  var activities = d.activities || [];
  if (activities.length === 0) {
    activityEl.innerHTML = '<div class="discord-no-activity">No activity right now</div>';
    return;
  }

  var html = '';
  for (var i = 0; i < Math.min(activities.length, 3); i++) {
    var a = activities[i];
    html += '<div class="discord-activity-item">';
    if (a.assets && a.assets.large_image) {
      var img = a.assets.large_image;
      var imgUrl = img.startsWith('mp:external/')
        ? 'https://media.discordapp.net/external/' + img.replace('mp:external/', '')
        : 'https://cdn.discordapp.com/app-assets/' + a.application_id + '/' + img + '.png';
      html += '<img src="' + imgUrl + '" alt="" class="discord-activity-img" onerror="this.style.display=\'none\'">';
    }
    html += '<div class="discord-activity-info">';
    if (a.name) html += '<div class="discord-activity-name">' + escapeHtml(a.name) + '</div>';
    if (a.details) html += '<div class="discord-activity-detail">' + escapeHtml(a.details) + '</div>';
    if (a.state) html += '<div class="discord-activity-state">' + escapeHtml(a.state) + '</div>';
    html += '</div></div>';
  }
  activityEl.innerHTML = html;
}

function escapeHtml(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

if (document.readyState === 'complete') {
  initDiscord();
} else {
  window.addEventListener('load', initDiscord);
}
