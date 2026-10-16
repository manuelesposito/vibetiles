/*
 * THE NEW WINDOW'S HOST ON WORDPRESS (2026-09-27): the one file that tells the
 * site-independent window (panel-window.js) where it is. It reads what window.php
 * printed (the owner's choice, the route, the nonce, the words, the sections and
 * the settings from plugin/settings.json), saves the choice through
 * architrave/v1/window, and opens today's window on the page that holds a section
 * the new one has not built yet.
 *
 * THE STYLE (build plan step 7, from the Colour section on): `style` below is the
 * window's only way to read and change the look. It speaks the list's saved names
 * (soft, markercolour, colours.<side>.paper…) and hands every change to the engine
 * today's window uses (window.ArchitraveStyles), so a change made in the new window
 * is the same change, kept the same way, with the same Undo, as one made in today's.
 */
(function () {
	'use strict';
	var W = window.liveDesignWindow, B = window.LiveDesignWindowBoot;
	if (!W || !B || !window.LiveDesignWindow) return;
	
	var LEVEL = { colour: 4, type: 8, layout: 14, 'corners-and-lines': 15, pictures: 16 };
	var styles = W.url.replace(/\/window(\?|$)/, '/site-styles$1');
	var root = document.documentElement;
	var PALETTE = '[data-quire-modes="palette"] ';
	var versionsHeld = null; 
	var TOKEN = { background: '--surface-base', text: '--text-primary', accent: '--accent', background2: '--surface-canvas', card: '--surface-subtle', mutedText: '--text-muted', button: '--accent', highlight: '--marker' };
	var ROLE_WELLS = ['title', 'headings', 'body', 'quote', 'meta', 'interface', 'code'];
	ROLE_WELLS.forEach(function (r) { TOKEN[r] = '--text-primary'; });
	var OWN_BESIDE_PRESET = ['button', 'highlight', 'mutedText'].concat(ROLE_WELLS); 
	var ORIGINAL = { light: ['#ffffff', '#232323', '#7444b4'], dark: ['#373737', '#dfdfdf', '#9a73ff'] }; 
	var PUBLIC = { paper: 'background', ink: 'text', ground: 'background2', lift: 'card', marker: 'highlight', muted: 'mutedText' }; 
	var PICK = { markercolour: ['markerColour', 'setMarkerColour'], button: ['buttonColour', 'setButtonColour'], fadeedges: ['fadeEdges', 'setFadeEdges'], linestyle: ['lineStyle', 'setLineStyle'], corners: ['corners', 'setCorners'], pictures: ['picturesNow', 'setPictures'], framepattern: ['framePattern', 'setFramePattern'] };
	function ask(method, url, body) {
		return fetch(url, { method: method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': W.nonce }, body: body ? JSON.stringify(body) : undefined })
			.then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); });
	}
	function notYet() { return Promise.reject(new Error('The new window does not save styles yet.')); }
	function today() { return window.ArchitraveReadingPanel && window.ArchitraveReadingPanel.openAt ? window.ArchitraveReadingPanel : null; }
	function S() { return window.ArchitraveStyles || null; }
	function Modes() { return window.QuireModes || null; }
	
	function press(selector) { var el = document.querySelector(selector); if (el) el.click(); }
	var hexCanvas = null;
	function cssHex(token, el, under) {
		try {
			var v = getComputedStyle(el || root).getPropertyValue(token).trim(); if (!v) return '';
			if (!hexCanvas) hexCanvas = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
			hexCanvas.clearRect(0, 0, 1, 1);
			if (under) { hexCanvas.fillStyle = under; hexCanvas.fillRect(0, 0, 1, 1); } 
			hexCanvas.fillStyle = '#000'; hexCanvas.fillStyle = v; hexCanvas.fillRect(0, 0, 1, 1);
			var d = hexCanvas.getImageData(0, 0, 1, 1).data;
			return '#' + [d[0], d[1], d[2]].map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
		} catch (e) { return ''; }
	}
	function lum(hex) {
		var c = String(hex || '').replace('#', '');
		if (c.length !== 6) return 0.5;
		var v = [0, 2, 4].map(function (i) { var x = parseInt(c.substr(i, 2), 16) / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
		return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
	}
	function isHex(v) { return /^#[0-9a-f]{6}$/i.test(v || ''); }
	function side() { var m = String(root.getAttribute('data-theme') || (Modes() ? Modes().default : 'neutral-light')); return m.split('-')[1] === 'dark' ? 'dark' : 'light'; }
	function palette() { return String(root.getAttribute('data-theme') || (Modes() ? Modes().default : 'neutral-light')).split('-')[0]; }
	function currentStyle() { var s = S(); if (!s) return null; var id = s.current(); return s.list.filter(function (x) { return x.id === id; })[0] || null; }
	function ownColours() { var s = S(), c = (s && s.colours ? s.colours()[side()] : null) || {}, out = {}; Object.keys(c).forEach(function (k) { out[PUBLIC[k] || k] = c[k]; }); return out; }
	function modeTriple(id, sd) {
		var m = ((Modes() && Modes().modes) || []).filter(function (x) { return x.palette === id && x.side === sd; })[0] || {};
		var paper = m.swatch || (sd === 'dark' ? '#222222' : '#eeeeee');
		var ink = 'color-mix(in oklab, ' + paper + ', ' + (lum(paper) > 0.45 ? '#000000' : '#ffffff') + ' 86%)';
		return { paper: paper, ink: ink, accent: m.swatchInk || ink };
	}
	var style = {
		view: function () { var b = document.querySelector(PALETTE + '[data-side][aria-pressed="true"]'); return b ? b.getAttribute('data-side') : 'auto'; },
		setView: function (v) { press(PALETTE + '[data-side="' + v + '"]'); },
		side: side,
		name: function () { var c = currentStyle(); return c ? c.label : ''; },
		editable: function () { var c = currentStyle(); return !!c && !c.host; },
		makeCopy: function () {
			var s = S(), c = currentStyle(); if (!s || !c || !s.duplicate) return false;
			var id = s.duplicate(c.id); if (id) press('[data-architrave-presets] [data-preset="' + id + '"]');
			return !!id;
		},
		
		get: function (key) {
			var s = S(); if (!s) return null;
			if (/^effects\./.test(key)) { var fx = key.split('.'); return s.effect ? s.effect(fx[1])[fx[2]] : null; } 
			if (s.layouts && s.layouts[key]) return s.layout(key); 
			if (PICK[key]) return s[PICK[key][0]]();
			if (s.picks && s.picks[key]) return s.pick(key);
			if (s.levels && s.levels[key]) return s.level(key);
			return !!s.option(key);
		},
		set: function (key, v) {
			var s = S(); if (!s) return;
			if (/^effects\./.test(key)) { var fx = key.split('.'); if (s.setEffect) s.setEffect(fx[1], fx[2], v); }
			else if (s.layouts && s.layouts[key]) s.setLayout(key, v);
			else if (PICK[key]) s[PICK[key][1]](v);
			else if (s.picks && s.picks[key]) s.setPick(key, v);
			else if (s.levels && s.levels[key]) s.setLevel(key, v);
			else s.setOption(key, !!v);
		},
		guest: function () { return !!window.architravePanelGuest; },
		gone: function (what) { return (window.architravePanelGuestGone || []).indexOf(what) !== -1; },
		dead: function (what) {
			var SIZE_OF = { title: ['head'], headings: ['head'], body: ['read', 'comment'], quote: ['quote'], meta: ['small', 'kicker'], 'meta.category': ['kicker'], 'interface': ['ui'], code: ['code'] }, lim = window.architravePanelGuestLimits || [];
			if (/^size:/.test(what) && SIZE_OF[what.slice(5)]) return SIZE_OF[what.slice(5)].every(function (r) { return lim.indexOf('size:' + r) !== -1; });
			if (lim.indexOf(what) !== -1) return true;
			var s = S();
			return (window.architravePanelGuestHostLimits || []).indexOf(what) !== -1 && !!(s && s.current && s.current() === 'host');
		},
		
		custom: function () { var s = S(); return !!(s && s.custom && s.custom()); },
		setCustom: function (on) { var s = S(); if (s && s.setCustom) s.setCustom(!!on, on ? { paper: cssHex(TOKEN.background), ink: cssHex(TOKEN.text), accent: cssHex(TOKEN.accent) } : null); },
		presets: function () {
			var s = S(); if (!s) return [];
			var sd = side(), c = currentStyle(), now = s.preset ? s.preset() : '';
			var all = (s.presets ? s.presets() : []).map(function (p) {
				return { id: 'preset:' + p.id, label: p.label, paper: p[sd].paper, ink: p[sd].ink, accent: p[sd].accent, day: p.light.paper, on: now === p.id, fresh: !!p.fresh, group: p.group || '', fixed: !!p.fixed }; 
			});
			if (!c || c.host) return all;
			var mine = ownColours(), hc = c.bare && c.colours && c.colours[sd], O = hc && hc.paper ? [hc.paper, hc.ink || ORIGINAL[sd][1], hc.accent || hc.ink || ORIGINAL[sd][2]] : ORIGINAL[sd]; 
			var bare = !now && !['background', 'text', 'accent'].some(function (k) { return isHex(mine[k]); });
			return [{ id: 'own', label: 'Original',  paper: O[0], ink: O[1], accent: O[2], on: bare, group: 'base' }].concat(all);
		},
		choosePreset: function (id) {
			var s = S(); if (!s) return;
			var c = currentStyle();
			if (id === 'own') {
				if (s.preset && s.preset()) s.setPreset('');
				['light', 'dark'].forEach(function (sd) { ['background', 'text', 'accent', 'background2', 'card', 'mutedText'].forEach(function (k) { s.clearColour(sd, k); }); });
				return;
			}
			var kind = id.split(':')[0], v = id.slice(kind.length + 1);
			if (kind === 'preset') s.setPreset(v);
		},
		
		colour: function (key) {
			var c = ownColours(); key = PUBLIC[key] || key;
			if (isHex(c[key])) return c[key].toLowerCase();
			if (key === 'highlight') { var h = S() && S().highlight ? S().highlight() : ''; return isHex(h) ? h : '#fff347'; }
			return cssHex(TOKEN[key] || '--accent', key === 'mutedText' ? document.body : null, key === 'mutedText' ? cssHex('--surface-base') : '') || '#000000'; 
		},
		own: function (key) { return isHex(ownColours()[PUBLIC[key] || key]); },
		highlight: function () { var s = S(); return s && s.highlight ? s.highlight() : ''; },
		setHighlight: function (hex) { var s = S(); if (s && s.setHighlight) s.setHighlight(hex); },
		groundNudged: function () { var s = S(); return !!(s && s.groundNudged && s.groundNudged(side())); },
		otherGround: function () { var s = S(); return s && s.otherGround ? s.otherGround(side()) : ''; },
		setColour: function (key, hex) {
			var s = S(); if (!s || !isHex(hex)) return;
			var sd = side();
			key = PUBLIC[key] || key;
			if (key === 'highlight') { if (s.setHighlight) s.setHighlight(hex.toLowerCase()); return; }
			if (key === 'background' || key === 'text') {
				var other = key === 'background' ? 'text' : 'background', otherHex = cssHex(TOKEN[other]);
				if (!isHex(ownColours()[other]) && isHex(otherHex)) s.setColour(sd, other, otherHex);
			}
			s.setColour(sd, key, hex.toLowerCase());
			if (key === 'accent' && s.setAccent && s.accent && !s.accent()) s.setAccent(true);
			if (key === 'button' && s.buttonColour() !== 'own') s.setButtonColour('own');
			if (ROLE_WELLS.indexOf(key) !== -1 && s.type(key).colour !== 'own') s.setType(key, 'colour', 'own');
		},
		ownBesidePreset: function (key) { return OWN_BESIDE_PRESET.indexOf(key) !== -1; },
		swatches: function (key) {
			var s = S(), sd = side(), one = currentStyle() && currentStyle().host && currentStyle().hostSide;
			var list = s && s.swatchList ? s.swatchList(PUBLIC[key] || key) : [];
			return list.map(function (x) { return { label: x.label, hex: String(x[one || sd] || '').toLowerCase() }; }).filter(function (x) { return isHex(x.hex); });
		},
		contrast: function (a, b) { var s = S(); return s && s.contrast && isHex(a) && isHex(b) ? s.contrast(a, b) : 0; },
		writingOn: function (x, p, i) { var s = S(); return s && s.writingOn && isHex(x) && isHex(p) && isHex(i) ? s.writingOn(x, p, i) : null; },
		
		type: function (id) { var s = S(); return s && s.type ? s.type(id) : {}; },
		setType: function (id, dial, v) { var s = S(); if (s && s.setType) s.setType(id, dial, v); },
		typeDials: function (id) { var s = S(); return s && s.typeDials ? s.typeDials(id) : []; },
		typeSizes: function (id, dial) { var s = S(); return s && s.typeSizes ? s.typeSizes(id, dial) : []; }, 
		typeLines: ['tight', 'snug', 'normal', 'relaxed', 'loose'],
		typeLetters: ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest'],
		weights: function (face) { var s = S(); return s ? s.weightsFor(face) : []; },
		hasItalic: function (face) { var s = S(); return !!(s && s.hasItalic(face)); },
		faces: function (wearing) {
			var s = S(), all = (window.ArchitraveFaces || []).map(function (f) { return { id: f.id, label: f.label, group: f.group, listed: f.listed !== false }; });
			((s && s.sans) || []).forEach(function (f) { var hit = all.filter(function (x) { return x.id === f.id; })[0]; if (hit) hit.listed = true; else all.push({ id: f.id, label: f.label, group: f.group, listed: true }); });
			return all.filter(function (f) { return f.listed || f.id === wearing; });
		},
		faceOf: function (face) { var s = S(); return s && s.faceOf ? s.faceOf(face) : face; },
		capLines: function () { return root.getAttribute('data-dropcap-lines') || '3'; },
		setCapLines: function (v) { var s = S(); if (s && s.setCapLines) s.setCapLines(v); },
		roleColour: function (id) { var r = S() ? S().type(id) : {}; return r.colour === 'accent' ? cssHex('--accent') : r.colour === 'own' ? (isHex(ownColours()[id]) ? ownColours()[id] : cssHex('--accent')) : r.colour === 'mutedText' ? cssHex('--text-muted', document.body, cssHex('--surface-base')) : cssHex('--text-primary'); },
		
		styles: function () {
			var s = S(); if (!s) return { shown: [], hidden: [], original: null };
			var all = s.shown(), host = all.filter(function (x) { return x.host; })[0], seen = s.visibleOrder();
			var orig = host ? host.id : (!window.architravePanelGuest && all.some(function (x) { return x.id === 'standard'; }) ? 'standard' : null);
			var ids = all.filter(function (x) { return !x.host && x.id !== orig; }).map(function (x) { return x.id; });
			return { original: orig, shown: seen.filter(function (id) { return ids.indexOf(id) !== -1; }), hidden: ids.filter(function (id) { return seen.indexOf(id) === -1; }) };
		},
		restoreStarters: function () { var s = S(); return s && s.restoreStarters ? s.restoreStarters() : Promise.reject(new Error('cannot publish')); },
		tile: function (id) {
			var s = S(), x = s ? s.list.filter(function (y) { return y.id === id; })[0] : null; if (!x) return null;
			var sd = side(), c = (s.colours ? s.colours(id)[sd] : null) || {}, w = s.wanted ? s.wanted(id) : {};
			var p = w.preset || x.preset ? (s.presets ? s.presets() : []).filter(function (q) { return q.id === (w.preset || x.preset); })[0] : null;
			var m = modeTriple(w.palette || x.palette || 'neutral', sd), pc = p ? p[sd] : {};
			var face = x.hostFace || ((window.ArchitraveFaces || []).filter(function (f) { return f.id === (w.face || x.face); })[0] || {}).family || '';
			return {
				id: id, label: x.label, own: !!x.own, site: !!x.site, host: !!x.host,
				paper: c.paper || pc.paper || m.paper, ink: c.ink || pc.ink || m.ink, accent: c.accent || pc.accent || m.accent, face: face,
				faces: (function () { 
					var F = window.ArchitraveFaces || [], ids = [w.face || x.face, w.sans || x.sans], roles = w.roles || x.roles || {}, out = [];
					Object.keys(roles).forEach(function (r) { if (roles[r] && roles[r].font) ids.push(roles[r].font); });
					if (x.hostFace) out.push(x.hostFace);
					ids.forEach(function (fid) { var f = F.filter(function (y) { return y.id === fid; })[0]; if (f && out.indexOf(f.family) === -1) out.push(f.family); });
					return out;
				}()),
				on: s.current() === id, edited: !!(s.adjusted && s.adjusted(id)), saving: !!(s.siteSaving && s.siteSaving(id)), isDefault: (s.readerFirst ? s.readerFirst() : s.visibleOrder()[0]) === id , seen: !!(s.seenByReaders && s.seenByReaders(id))
			};
		},
		current: function () { var s = S(); return s ? s.current() : ''; },
		fonts: {
			library: function () { return (window.ArchitraveFontLibrary || []).map(function (f) { return f.id; }); },
			can: function () { return !!(window.architraveFonts && window.architraveFonts.url); },
			have: function (id) { var c = window.architraveFonts; return !!(c && c.have && c.have.indexOf(id) !== -1); },
			get: function (id) {
				var c = window.architraveFonts; if (!c || !c.url) return Promise.reject(new Error('fonts'));
				return fetch(c.url, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': c.nonce }, body: JSON.stringify({ id: id }) })
					.then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error((j && j.message) || r.status); return j; }); })
					.then(function (j) {
						c.have = j.have || c.have;
						if (j.css) { var l = document.getElementById('architrave-font-files-css'); if (!l) { l = document.createElement('link'); l.id = 'architrave-font-files-css'; l.rel = 'stylesheet'; document.head.appendChild(l); } l.href = j.css; }
						return j;
					});
			},
			prune: function (keep) {
				var c = window.architraveFonts; if (!c || !c.url) return Promise.reject(new Error('fonts'));
				return fetch(c.url, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': c.nonce }, body: JSON.stringify({ prune: true, keep: keep || [] }) })
					.then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error((j && j.message) || r.status); return j; }); })
					.then(function (j) { c.have = j.have || c.have; return j; });
			}
		},
		visibleOrder: function () { var s = S(); return s && s.visibleOrder ? s.visibleOrder().slice() : []; }, 
		choose: function (id) { press('[data-architrave-presets] [data-preset="' + id + '"]'); },
		duplicate: function (id) { var s = S(), nid = s && s.duplicate ? s.duplicate(id) : null; if (nid) press('[data-architrave-presets] [data-preset="' + nid + '"]'); return nid; },
		revert: function (id) { var s = S(); if (s && s.resetChanges) s.resetChanges(id); },
		remove: function (id) { var s = S(); if (s && s.remove) s.remove(id); },
		rename: function (id, name) { var s = S(); return s ? s.rename(id, name) : Promise.reject(new Error('no styles')); },
		makeDefault: function (id) { var s = S(); return s ? s.makeDefault(id) : Promise.reject(new Error('no styles')); },
		setSeen: function (id, on) { var s = S(); return s ? s.setSeen(id, on) : Promise.reject(new Error('no styles')); },
		setVisible: function (ids) { var s = S(); return s ? s.setVisible(ids) : Promise.reject(new Error('no styles')); },
		unpublish: function (id) { var s = S(); return s ? s.unpublishKeep(id) : Promise.reject(new Error('no styles')); }, 
		saveAs: function (name) { var s = S(); return s ? s.saveAs(name) : null; },
		canPublish: function () { var s = S(); return !!(s && s.canPublish && s.canPublish()); },
		publish: function () { var s = S(); return s ? s.updateSite() : Promise.reject(new Error('no styles')); },
		
		button: function () { var s = S(); return s && s.button ? s.button() : null; },
		setButton: function (key, v) {
			var s = S(); if (!s || !s.setButton) return Promise.reject(new Error('no button'));
			if (key === 'auto') return s.setButton('place', v ? 'auto' : ((s.button() || {}).fixed || 'bottom-center'));
			return s.setButton(key, v);
		},
		buttonInSlot: function () { return !!document.querySelector('.architrave-panel-opener[data-docked="slot"]'); }, 
		buttonInMenu: function () { return !!document.querySelector('.architrave-panel-opener[data-docked="menu"][data-match="true"]'); },
		buttonWordInMenu: function () { var b = this.button() || {}; return this.buttonInMenu() && (!!String(b.label || '').trim() || b.icon === false || !!document.querySelector('.architrave-panel-opener[data-docked="menu"][data-folded]')); },
		readersCopy: function () { var s = S(); return !!(s && s.readersCopy && s.readersCopy()); },
		setReadersCopy: function (on) { var s = S(); return s ? s.setReadersCopy(on) : Promise.reject(new Error('no styles')); },
		
		changes: function () {
			var s = S(), out = []; if (!s || !s.changes) return out;
			(function walk(o, p) {
				Object.keys(o).forEach(function (k) {
					var v = o[k], q = p ? p + '.' + k : k;
					if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, q); else out.push({ path: q, value: v });
				});
			}(s.changes(), ''));
			return out;
		},
		revertPath: function (path) { var s = S(); if (s && s.resetPaths) s.resetPaths([path]); },
		previews: function () { return ask('GET', styles.replace(/\/site-styles(\?|$)/, '/site-styles/previews$1')); },
		sharePreview: function (name) {
			var s = S(); if (!s || !s.exportStyle) return Promise.reject(new Error('no style'));
			return ask('POST', styles.replace(/\/site-styles(\?|$)/, '/site-styles/previews$1'), { record: JSON.parse(s.exportStyle()), name: name });
		},
		stopPreview: function (id) { return ask('DELETE', styles.replace(/\/site-styles(\?|$)/, '/site-styles/previews/' + id + '$1')); },
		previewURL: function (id) { return window.location.origin + window.location.pathname + '?ldp-preview=' + id; },
		shareLink: function () { var s = S(); return s && s.shareLink ? s.shareLink(true) : ''; },
		importLink: function (text) {
			var s = S(); if (!s) return Promise.resolve(null);
			var txt = String(text || '').trim();
			if (/^\{/.test(txt) && s.importStyle) { try { return Promise.resolve(s.importStyle(txt)); } catch (e) { return Promise.resolve(null); } }
			return s.importLink ? s.importLink(txt) : Promise.resolve(null);
		},
		revertAll: function () { var s = S(); if (s && s.resetChanges) s.resetChanges(s.current()); },
		
		versions: function () {
			var s = S(); if (!s || !s.versions) return null;
			var id = s.current(), x = s.list.filter(function (y) { return y.id === id; })[0]; if (!x || x.host) return null;
			var list = s.versions().map(function (v) { return { key: 'w' + v.t, t: v.t, record: v.record, published: false }; });
			((versionsHeld && versionsHeld.styles && versionsHeld.styles[id]) || []).forEach(function (v) { list.push({ key: 'p' + v.t, t: v.t * 1000, record: v.record, published: true }); });
			return { now: s.nowRecord(), saved: s.savedRecord(), savedAt: x.site && versionsHeld && versionsHeld.at ? (versionsHeld.at[id] || 0) * 1000 : 0, list: list, site: !!x.site, own: !!x.own };
		},
		loadVersions: function () {
			var s = S(); if (!s || !s.canPublish || !s.canPublish()) return Promise.resolve();
			return ask('GET', styles.replace(/\/site-styles(\?|$)/, '/site-styles/versions$1')).then(function (v) { versionsHeld = v; }, function () {  });
		},
		versionDiff: function (a, b) {
			var out = [], skip = { architrave: 1, label: 1, base: 1, id: 1 };
			(function walk(x, y, p) {
				Object.keys(x || {}).forEach(function (k) {
					if (!p && skip[k]) return;
					var q = p ? p + '.' + k : k, u = x[k], v = y ? y[k] : undefined;
					
					var inner = /^(colours|roles)(\.|$)/.test(q);
					if (v === undefined && inner) { if (u && typeof u === 'object' && !Array.isArray(u)) walk(u, {}, q); else out.push(q); return; }
					if (v === undefined && !p && k === 'preset') { out.push(q); return; }
					if (v === undefined) return;
					if (u && typeof u === 'object' && !Array.isArray(u) && v && typeof v === 'object') walk(u, v, q);
					else if (JSON.stringify(u) !== JSON.stringify(v)) out.push(q);
				});
			}(a, b, ''));
			return out;
		},
		previewVersion: function (rec) { var s = S(); return !!(s && s.previewVersion && s.previewVersion(rec || null)); },
		previewing: function () { var s = S(); return !!(s && s.previewing && s.previewing()); },
		restoreVersion: function (rec, what) { var s = S(); return !!(s && s.restoreVersion && s.restoreVersion(rec, what)); },
		keepVersion: function () { var s = S(); return !!(s && s.keepVersion && s.keepVersion()); },
		startRecord: function (id) {
			var s = S(); if (!s) return null;
			id = id || s.current(); var x = s.list.filter(function (y) { return y.id === id; })[0];
			return x && x.site && versionsHeld && versionsHeld.start && versionsHeld.start[id] || null;
		},
		startDiffers: function (rec, id) {
			var s = S(); if (!s || !rec) return false;
			var cur = !id || id === s.current(), x = cur ? null : s.list.filter(function (y) { return y.id === id; })[0];
			var now = cur ? s.nowRecord() : x; if (!now) return false;
			var skip = { id: 1, label: 1, site: 1, own: 1, architrave: 1, base: 1 };
			var tidy = function (o, top) { var c = {}; Object.keys(o).forEach(function (k) { var v = o[k]; if (top && skip[k]) return; if (v && typeof v === 'object' && !Object.keys(v).length) return; c[k] = v && typeof v === 'object' && !Array.isArray(v) ? tidy(v) : v; }); return c; };
			var form = function (o) {
				o = JSON.parse(JSON.stringify(o || {})); var r = o.roles = o.roles || {};
				var put = function (role, k, v) { if (v === undefined || v === null || v === '') return; r[role] = r[role] || {}; if (r[role][k] === undefined) r[role][k] = v; };
				put('body', 'font', o.face); put('interface', 'font', o.sans);
				put('body', 'lineHeight', { dense: 'tight', tight: 'snug', airy: 'relaxed', wide: 'loose' }[o.leading]);
				delete o.face; delete o.sans; delete o.leading;
				return o;
			};
			var a = tidy(form(now), true), b = tidy(form(rec), true);
			return !!(style.versionDiff(a, b).length || style.versionDiff(b, a).length);
		},
		
		canUndo: function () { var s = S(); return !!(s && s.canUndo && s.canUndo()); },
		undoWhat: function () { var s = S(); return s && s.undoWhat ? s.undoWhat() : ''; },
		undo: function () { var s = S(); if (s && s.undo) s.undo(); },
		exportStyle: function () { var s = S(); return s && s.exportStyle ? s.exportStyle() : '{}'; }, 
		canRedo: function () { var s = S(); return !!(s && s.canRedo && s.canRedo()); },
		redo: function () { var s = S(); if (s && s.redo) s.redo(); },
		redoWhat: function () { var s = S(); return s && s.redoWhat ? s.redoWhat() : ''; },
		
		watch: function (fn) {
			var mo = new MutationObserver(function () { fn(); });
			mo.observe(root, { attributes: true });
			window.addEventListener('storage', function () { fn(); });
		}
	};
	window.LiveDesignHost = {
		name: 'wordpress',
		words: B.words || {}, 
		settings: { sections: B.sections || [], list: B.settings || [], roles: B.roles || [] },
		style: style,
		load: function () { return ask('GET', styles); },
		save: notYet,
		publish: notYet,
		
		tryMode: !!W.try,
		reader: W.reader ? {
			preview: /[?&]ldp-as-reader=/.test(window.location.search), 
			sizes: function () { var R = window.QuireReading; return R ? R.ids : []; },
			size: function () { var R = window.QuireReading; return R ? (root.getAttribute(R.attribute) || 'default') : 'default'; },
			setSize: function (id) { press('[data-quire-reading] [data-reading-step="' + id + '"]'); },
			side: function () { var b = document.querySelector(PALETTE + '[data-side][aria-pressed="true"]'); return b ? b.getAttribute('data-side') : 'auto'; },
			setSide: function (v) { press(PALETTE + '[data-side="' + v + '"]'); },
			canCopy: function () { var s = S(); return !!(s && s.readersCopy && s.readersCopy() && s.shareLink); },
			link: function () { var s = S(); return s && s.shareLink ? s.shareLink(true) : ''; }
		} : null,
		choice: function () { return W.now === 'new' ? 'new' : 'current'; },
		setChoice: function (v) {
			return ask('POST', W.url, { window: v }).then(function (a) { W.window = W.now = a.window === 'new' ? 'new' : 'current'; return W.now; });
		},
		canOpenCurrent: function () { return false; }, 
		openCurrent: function (id) { return !!LEVEL[id] && !!today() && today().openAt(LEVEL[id]); }
	};
	window.LiveDesignWindow.mount(window.LiveDesignHost);
}());
