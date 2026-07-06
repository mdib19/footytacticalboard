const pitchWrapper = document.getElementById('pitch-wrapper');
let ballExists = false;
let history = [];

/* Drag function */
function makeDraggable(el) {
  let dragging = false;

  el.addEventListener('pointerdown', e => {
    dragging = true;
    el.setPointerCapture(e.pointerId);
  });

  el.addEventListener('pointermove', e => {
    if (!dragging) return;
    const rect = pitchWrapper.getBoundingClientRect();
    el.style.left = ((e.clientX - rect.left) / rect.width  * 100) + '%';
    el.style.top  = ((e.clientY - rect.top)  / rect.height * 100) + '%';
  });

  el.addEventListener('pointerup', () => {
    dragging = false;
    saveHistory();
  });
}

/* create */
function createPlayer(type) {
  const el = document.createElement('div');
  el.classList.add('player', type);
  el.style.left = '50%';
  el.style.top  = '50%';
  makeDraggable(el);
  pitchWrapper.appendChild(el);
  saveHistory();
}

function createBall() {
  if (ballExists) return;
  const el = document.createElement('div');
  el.id = 'ball';
  el.style.left = '50%';
  el.style.top  = '50%';
  makeDraggable(el);
  pitchWrapper.appendChild(el);
  ballExists = true;
  saveHistory();
}

/* State */
function getBoardState() {
  const tokens = [];
  pitchWrapper.querySelectorAll('.player, #ball').forEach(el => {
    tokens.push({
      id:    el.id || null,
      class: el.className,
      left:  el.style.left,
      top:   el.style.top,
    });
  });
  return { tokens, ballExists };
}

function restoreState(state) {
  pitchWrapper.querySelectorAll('.player, #ball').forEach(el => el.remove());
  ballExists = false;

  state.tokens.forEach(t => {
    const el = document.createElement('div');
    if (t.id) el.id = t.id;
    el.className   = t.class;
    el.style.left  = t.left;
    el.style.top   = t.top;
    if (t.id === 'ball') {
      ballExists = true;
    }
    makeDraggable(el);
    pitchWrapper.appendChild(el);
  });
}

/* History */
function saveHistory() {
  history.push(JSON.stringify(getBoardState()));
  if (history.length > 50) history.shift();
}

/* Undo */
function undo() {
  if (history.length < 2) return;
  history.pop();
  restoreState(JSON.parse(history[history.length - 1]));
}

/* clear */
function clearAll() {
  pitchWrapper.querySelectorAll('.player, #ball').forEach(el => el.remove());
  ballExists = false;
  saveHistory();
}

/* Save and Load */
function saveBoard() {
  const blob = new Blob([JSON.stringify(getBoardState(), null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'saved_board.json';
  a.click();
  URL.revokeObjectURL(url);
}

function loadBoard(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      restoreState(JSON.parse(e.target.result));
      saveHistory();
    } catch {
      alert('Could not load file.');
    }
  };
  reader.readAsText(file);
}

/* Buttons */
document.getElementById('toggleBtn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('collapsed');
});
document.getElementById('addHome').addEventListener('click', () => createPlayer('home'));
document.getElementById('addAway').addEventListener('click', () => createPlayer('away'));
document.getElementById('addBall').addEventListener('click', createBall);
document.getElementById('undoBtn').addEventListener('click', undo);
document.getElementById('clearBtn').addEventListener('click', clearAll);
document.getElementById('saveBtn').addEventListener('click', saveBoard);
document.getElementById('loadBtn').addEventListener('click', () => document.getElementById('fileInput').click());
document.getElementById('fileInput').addEventListener('change', e => {
  if (e.target.files[0]) { loadBoard(e.target.files[0]); e.target.value = ''; }
});

saveHistory();