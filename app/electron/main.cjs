const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, screen, shell } = require('electron')
const fs = require('fs')
const path = require('path')

// One transparent, click-through window covers the primary display's work area (above taskbar/Dock);
// the cat is dragged around inside it. SCALE zooms the whole pet uniformly; 1 = design size.
const SCALE = 0.75
const COATS = ['Pink', 'Peach', 'Lavender', 'Cloud gray']
const CORNERS = ['br', 'bl', 'tr', 'tl']
const DEFAULTS = {
  coat: 'Pink',
  corner: 'br',
  link: { url: 'https://digi-pet-indol.vercel.app/', label: 'Visit digi-pet-indol.vercel.app →' },
  quotes: [
    { text: 'Act as if what you do makes a difference. It does.', by: 'William James' },
    { text: 'It always seems impossible until it’s done.', by: 'Nelson Mandela' },
    { text: 'What you do today can improve all your tomorrows.', by: 'Ralph Marston' },
    { text: 'Start where you are. Use what you have. Do what you can.', by: 'Arthur Ashe' },
  ],
}

let win, tray

const settingsPath = () => path.join(app.getPath('userData'), 'settings.json')

function readSettings() {
  let raw
  try {
    raw = JSON.parse(fs.readFileSync(settingsPath(), 'utf8'))
  } catch (e) {
    // A hand-edited file with a typo: show defaults, but never overwrite the user's file.
    return { ...DEFAULTS, broken: e.code !== 'ENOENT' }
  }
  const quotes = Array.isArray(raw.quotes) ? raw.quotes.filter((q) => q && typeof q.text === 'string') : []
  return {
    coat: COATS.includes(raw.coat) ? raw.coat : DEFAULTS.coat,
    corner: CORNERS.includes(raw.corner) ? raw.corner : DEFAULTS.corner,
    link: raw.link && typeof raw.link.url === 'string' ? raw.link : DEFAULTS.link,
    quotes: quotes.length ? quotes : DEFAULTS.quotes,
  }
}

function saveSettings(s) {
  if (s.broken) return false
  fs.writeFileSync(settingsPath(), JSON.stringify(s, null, 2))
  return true
}

function setCoat(coat) {
  const s = readSettings()
  if (saveSettings({ ...s, coat })) win.webContents.send('settings', readSettings())
  buildMenu()
}

function placeWindow() {
  win.setBounds(screen.getPrimaryDisplay().workArea)
}

function createWindow() {
  win = new BrowserWindow({
    transparent: true,
    backgroundColor: '#00000000',
    frame: false,
    resizable: false,
    movable: false,
    hasShadow: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), zoomFactor: SCALE },
  })
  win.setAlwaysOnTop(true, 'floating')
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  // Clicks pass through to the desktop until the renderer says the cursor is over the cat.
  win.setIgnoreMouseEvents(true, { forward: true })
  placeWindow()

  // The quote link opens in the real browser; never navigate the pet window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) {
      // A screen-sized top window that isn't click-through makes Chromium browsers think they're
      // fully occluded, so they stop painting (gray tab). Go click-through before handing off.
      win.setIgnoreMouseEvents(true, { forward: true })
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })
  win.webContents.on('will-navigate', (e) => e.preventDefault())

  if (process.argv.includes('--dev')) win.loadURL('http://localhost:5173')
  else win.loadFile(path.join(__dirname, '../dist/index.html'))
  win.once('ready-to-show', () => win.showInactive())
}

// Tray icon drawn in code (cat head: circle + two ear triangles) so there's no image asset to ship.
function catIcon(rgb) {
  const S = 32
  const buf = Buffer.alloc(S * S * 4)
  const tri = (px, py, [ax, ay], [bx, by], [cx, cy]) => {
    const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by)
    const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy)
    const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay)
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0))
  }
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const inside =
        (x - 16) ** 2 + (y - 19) ** 2 <= 11 ** 2 ||
        tri(x, y, [5, 15], [7, 2], [15, 10]) ||
        tri(x, y, [27, 15], [25, 2], [17, 10])
      if (!inside) continue
      const i = (y * S + x) * 4
      buf[i] = rgb[2]; buf[i + 1] = rgb[1]; buf[i + 2] = rgb[0]; buf[i + 3] = 255 // BGRA
    }
  }
  const img = nativeImage.createFromBitmap(buf, { width: S, height: S, scaleFactor: 2 })
  if (process.platform === 'darwin') img.setTemplateImage(true) // menu bar tints it for light/dark
  return img
}

function buildMenu() {
  const s = readSettings()
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Show cat',
        type: 'checkbox',
        checked: win.isVisible(),
        click: (item) => (item.checked ? win.showInactive() : win.hide()),
      },
      {
        label: 'Coat',
        submenu: COATS.map((c) => ({ label: c, type: 'radio', checked: s.coat === c, click: () => setCoat(c) })),
      },
      {
        label: s.broken ? 'Edit quotes & link… (file has an error)' : 'Edit quotes & link…',
        click: () => {
          if (!fs.existsSync(settingsPath())) saveSettings(DEFAULTS)
          shell.openPath(settingsPath())
        },
      },
      {
        // ponytail: only meaningful in a packaged build; in dev it registers the bare electron binary.
        label: 'Launch at login',
        type: 'checkbox',
        checked: app.getLoginItemSettings().openAtLogin,
        click: (item) => app.setLoginItemSettings({ openAtLogin: item.checked }),
      },
      { type: 'separator' },
      { label: 'Quit', role: 'quit' },
    ])
  )
}

if (!app.requestSingleInstanceLock()) app.quit()

app.whenReady().then(() => {
  if (process.platform === 'darwin') app.dock.hide()
  if (!fs.existsSync(settingsPath())) saveSettings(DEFAULTS)

  ipcMain.on('set-interactive', (_e, on) => win.setIgnoreMouseEvents(!on, { forward: true }))
  ipcMain.handle('get-settings', () => readSettings())
  ipcMain.on('set-corner', (_e, corner) => {
    if (CORNERS.includes(corner)) saveSettings({ ...readSettings(), corner })
  })

  createWindow()
  tray = new Tray(catIcon([0xff, 0x8f, 0xb3]))
  tray.setToolTip('Digi-Pet')
  if (process.platform === 'win32') tray.on('click', () => tray.popUpContextMenu())
  buildMenu()

  screen.on('display-metrics-changed', placeWindow)
  screen.on('display-added', placeWindow)
  screen.on('display-removed', placeWindow)
})

// Tray app: closing the window shouldn't quit; Quit lives in the tray menu.
app.on('window-all-closed', (e) => e.preventDefault())
