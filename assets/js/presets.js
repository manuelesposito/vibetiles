/**
 * Architrave — the styles.
 *
 * Four named looks a reader can put on: Standard, Book, Clear and Terminal
 * (Arcade waits backstage). Until 2026-09-09 they were "presets": a press that set the four
 * dials (colours, reading size, face, line spacing) and remembered nothing of
 * its own, so the moment a dial moved the preset was simply gone, and the
 * looks that made a style a style, grain, a drop cap, a justified column,
 * hung on the COLOUR room instead. Manuel, in Book, switching the colour to
 * Matrix: "that would probably be a customisation of the Book style, and Book
 * would lose its check mark". That is the Apple Books shape, and it is the
 * shape now:
 *
 * A STYLE IS A STATE OF ITS OWN. It is written on <html> as `data-style`
 * before first paint and held in localStorage like the dials, and the
 * stylesheet hangs the style's looks on that attribute: `data-style="book"`
 * is what draws the grain and the drop cap, whichever colours are under it.
 * Standard is the absence of the attribute, as Newsreader is the absence of
 * a face.
 *
 * A STYLE HAS A RECIPE, the four dial values it presses when chosen. It does
 * not name a side: light or dark is the reader's, and a style keeps it.
 *
 * A STYLE IS NOT LOST BY TWEAKING IT. Move a dial while Book is on and Book
 * stays on, marked "adjusted"; the tweak is remembered for Book, so coming
 * back to Book after a visit to Terminal finds it as you left it. Only a
 * tweak made by a reader's own press is remembered: a dial the site moves
 * for other reasons (a hidden room falling back to Neutral) is not a wish.
 *
 * IT DRIVES THE CONTROLS RATHER THAN THE STORAGE. Each dial has its own
 * script with its own key, its own attribute and its own marks; a style
 * presses the rows the reader would press, so every control keeps its own
 * handler, its own storage and its own proof. The rows exist on every page,
 * because the rail's flyouts are in the document whether open or not.
 *
 * THE LIST IS THIS THEME'S, like the faces: which looks a site offers whole
 * is the site's decision. Palettes and sides are the system's registry
 * (quire.modes.js); the ids below are checked against it.
 */
(function () {
	var root = document.documentElement;
	var still = window.ldpStill || (window.ldpStill = (function () {
		var sheet = null, depth = 0;
		return function (fn) {
			if (!sheet) {
				var st = document.createElement('style');
				st.id = 'ldp-still';
				st.textContent = ':root, :root *, :root *::before, :root *::after { transition-duration: 0s !important; transition-delay: 0s !important; }';
				(document.head || document.documentElement).appendChild(st);
				sheet = st.sheet;
				sheet.disabled = true;
			}
			depth++;
			sheet.disabled = false;
			try { return fn(); } finally {
				if (--depth === 0) { void document.documentElement.offsetWidth; sheet.disabled = true; }
			}
		};
	}()));
	var Modes = window.QuireModes;
	var KEY = 'architrave-style';
	var TWEAKS_KEY = 'architrave-style-tweaks';
	var ATTR = 'data-style';
	var DEFAULT = 'standard';
	var GUEST = !!window.architravePanelGuest, NONE = GUEST ? 'host' : 'standard';
	var PENDING = null; 
	var WORDS = window.architraveWords || {};
	function t(word) { return WORDS[word] || word; }
	
	var PRESETS = [
		{ id: 'still', label: 'Slate', light: { paper: '#f2f2f4', ink: '#1d1d1f', accent: '#0066cc', button: '#0071e3', ground: '#e8e8ec', lift: '#ffffff', muted: '#66666b' }, dark: { paper: '#2c2c2e', ink: '#f5f5f7', accent: '#2997ff', button: '#2997ff', ground: '#1c1c1e', lift: '#3a3a3c', muted: '#a1a1a6' }, group: 'base', fixed: true }, 
		{ id: 'clear', label: 'Titanium White', light: { paper: '#ffffff', ink: '#000000', accent: '#000000', ground: '#f2f2f2', lift: '#f0f0f0', muted: '#4a4a4a' }, dark: { paper: '#000000', ink: '#ffffff', accent: '#ffffff', ground: '#000000', lift: '#1a1a1a', muted: '#c7c7c7' }, group: 'base', fixed: true },
		{ id: 'soft', label: 'Dove Grey', light: { paper: '#e9e7e3', ink: '#4a4845', accent: '#4f6178', ground: '#dfddd8', lift: '#e1ded9', muted: '#66635e' }, dark: { paper: '#2b2b2d', ink: '#a9a9ad', accent: '#8fa3bf', ground: '#222224', lift: '#353537', muted: '#8a8a8f' }, group: 'base', fixed: true },
		{ id: 'essay', label: 'Ivory', light: { paper: '#faf5e9', ink: '#26231f', accent: '#8b1e1e', ground: '#faf5e9', lift: '#f1eadb', muted: '#6b665e' }, dark: { paper: '#1a1917', ink: '#d9d4ca', accent: '#e08a7c', ground: '#1a1917', lift: '#24221f', muted: '#9a948a' }, group: 'base', fixed: true },
		{ id: 'folio', label: 'Sepia', light: { paper: '#f8f1e3', ink: '#4f321c', accent: '#9a4a1e', ground: '#efe4cf', lift: '#f1e6d0', muted: '#7a5f45' }, dark: { paper: '#2a2118', ink: '#e9dcc6', accent: '#e39a6b', ground: '#1f1912', lift: '#352a1f', muted: '#b5a48c' }, group: 'base', fixed: true },
		{ id: 'brick', label: 'Terracotta', light: { paper: '#f5e9e2', ink: '#2b1d18', accent: '#a8402a' }, dark: { paper: '#201715', ink: '#eddcd4', accent: '#e08268' }, group: 'warm' },
		{ id: 'rose', label: 'Rose', light: { paper: '#f8e9ec', ink: '#2e1a20', accent: '#a3324f' }, dark: { paper: '#221519', ink: '#f0dde2', accent: '#e88aa3' }, group: 'warm' },
		{ id: 'apricot', label: 'Apricot', light: { paper: '#fbeadb', ink: '#2f1f14', accent: '#a8480f' }, dark: { paper: '#24180f', ink: '#f2e0d1', accent: '#f0a066' }, group: 'warm' },
		{ id: 'ochre', label: 'Ochre', light: { paper: '#f3edd6', ink: '#2b2714', accent: '#7a5b00' }, dark: { paper: '#1f1c10', ink: '#ebe5cc', accent: '#d9b44a' }, group: 'warm' },
		{ id: 'plum', label: 'Mauve', light: { paper: '#f2ecf3', ink: '#271e2c', accent: '#6f3a80' }, dark: { paper: '#1b161e', ink: '#e8dfea', accent: '#c496d6' }, group: 'warm' },
		{ id: 'umber', label: 'Umber', light: { paper: '#ece6dd', ink: '#29231c', accent: '#6e5233' }, dark: { paper: '#1c1814', ink: '#e6ded2', accent: '#c7a988' }, group: 'warm' },
		{ id: 'cobalt', label: 'Cobalt', light: { paper: '#eef1f8', ink: '#16203a', accent: '#2743a8' }, dark: { paper: '#121727', ink: '#e1e7f5', accent: '#8ba3f5' }, group: 'cool' },
		{ id: 'azure', label: 'Azure', light: { paper: '#e8f3fa', ink: '#0f2533', accent: '#0a5f99' }, dark: { paper: '#0f1c25', ink: '#dcebf5', accent: '#6bb8ea' }, group: 'cool' },
		{ id: 'teal', label: 'Teal', light: { paper: '#e6f2f0', ink: '#10292a', accent: '#0d6661' }, dark: { paper: '#0e1e1d', ink: '#d8ebe8', accent: '#5cc6bb' }, group: 'cool' },
		{ id: 'moss', label: 'Jade', light: { paper: '#eaf0e6', ink: '#1c2a1c', accent: '#2f6b36' }, dark: { paper: '#141a14', ink: '#dfe8dc', accent: '#7fc98a' }, group: 'cool' },
		{ id: 'lichen', label: 'Lichen', light: { paper: '#f7f7f5', ink: '#222f30', accent: '#46731a' }, dark: { paper: '#222f30', ink: '#ffffff', accent: '#cef79e' }, group: 'cool' },
		{ id: 'lavender', label: 'Lavender', light: { paper: '#efedf8', ink: '#1f1b33', accent: '#5541b0' }, dark: { paper: '#17152a', ink: '#e5e1f5', accent: '#a99af0' }, group: 'cool' },
		{ id: 'vermilion', label: 'Vermilion', light: { paper: '#b82a16', ink: '#fff6ec', accent: '#fff6ec' }, dark: { paper: '#2a0a06', ink: '#ffd9cc', accent: '#ffd9cc' }, group: 'bold' },
		{ id: 'tangerine', label: 'Tangerine', light: { paper: '#ff8a1f', ink: '#1f0e00', accent: '#1f0e00' }, dark: { paper: '#2a1300', ink: '#ffe3c7', accent: '#ffe3c7' }, group: 'bold' },
		{ id: 'cadmium', label: 'Cadmium Yellow', light: { paper: '#ffd23f', ink: '#231c00', accent: '#231c00' }, dark: { paper: '#1f1a05', ink: '#fff3c4', accent: '#fff3c4' }, group: 'bold' },
		{ id: 'viridian', label: 'Viridian', light: { paper: '#0b6358', ink: '#eafff9', accent: '#eafff9' }, dark: { paper: '#062521', ink: '#cff5ec', accent: '#cff5ec' }, group: 'bold' },
		{ id: 'ultramarine', label: 'Ultramarine', light: { paper: '#1f33c9', ink: '#f2f4ff', accent: '#f2f4ff' }, dark: { paper: '#0a0f33', ink: '#dfe4ff', accent: '#dfe4ff' }, group: 'bold' },
		{ id: 'flamingo', label: 'Flamingo', light: { paper: '#ffc9da', ink: '#3b0a1f', accent: '#3b0a1f' }, dark: { paper: '#2a0b18', ink: '#ffe0ea', accent: '#ffe0ea' }, group: 'bold' },
		{ id: 'sandstone', label: 'Venetian Red', light: { paper: '#f8f4e9', ink: '#b84b30', accent: '#b84b30' }, dark: { paper: '#2a1712', ink: '#f0a58e', accent: '#f0a58e' }, group: 'text' },
		{ id: 'corten', label: 'Burnt Sienna', light: { paper: '#3a1712', ink: '#f4a585', accent: '#f4a585' }, dark: { paper: '#24100c', ink: '#eb9a7a', accent: '#eb9a7a' }, group: 'text' },
		{ id: 'prussian', label: 'Prussian Blue', light: { paper: '#f4f3ee', ink: '#1d3f8f', accent: '#1d3f8f' }, dark: { paper: '#121726', ink: '#a9bdf2', accent: '#a9bdf2' }, group: 'text' },
		{ id: 'indigo', label: 'Indigo', light: { paper: '#141f45', ink: '#a9bdf7', accent: '#a9bdf7' }, dark: { paper: '#0c1430', ink: '#9fb4f2', accent: '#9fb4f2' }, group: 'text' },
		{ id: 'sapgreen', label: 'Sap Green', light: { paper: '#f3f2e8', ink: '#2a5e34', accent: '#2a5e34' }, dark: { paper: '#131a14', ink: '#9fd0a6', accent: '#9fd0a6' }, group: 'text' },
		{ id: 'forest', label: 'Forest', light: { paper: '#13291a', ink: '#97d4a4', accent: '#97d4a4' }, dark: { paper: '#0b1b10', ink: '#8ccb99', accent: '#8ccb99' }, group: 'text' }
	];
	var STYLES = [
		
		{ id: 'standard', label: 'Classic',  palette: 'neutral', tint: 'purple', sans: 'inter', reading: 'default', face: 'newsreader', leading: 'default', justify: false, dropcap: false, rounded: true, lines: false, bold: false, scope: 'article', fills: true, roles: {} },
	];
	if (!window.architravePanelGuest) STYLES.forEach(function (s) { if (s.id === 'standard') s.label = 'Original'; });
	var OWN_KEY = 'architrave-own-styles';
	var HIDDEN_KEY = 'architrave-hidden-order'; 
	function hiddenOrder() { try { var l = JSON.parse(localStorage.getItem(HIDDEN_KEY) || '[]'); return Array.isArray(l) ? l : []; } catch (e) { return []; } }
	function readOwn() {
		try { var list = JSON.parse(localStorage.getItem(OWN_KEY) || '[]'); return Array.isArray(list) ? list : []; } catch (e) { return []; }
	}
	function writeOwn() {
		try { localStorage.setItem(OWN_KEY, JSON.stringify(STYLES.filter(function (x) { return x.own; }))); } catch (e) {  }
	}
	readOwn().forEach(function (o) { if (o && typeof o.id === 'string' && /^own-/.test(o.id) && o.label) { liftCentre(o); o.own = true; STYLES.push(o); } });
	var SITE = { styles: [], 'default': '' };
	var PUBLISH = window.architravePublish || null;
	function baseOf(s) { return (s.own || s.site) ? (s.base || 'standard') : s.id; }
	var siteStamp = 0;
	function takeSite(state) {
		if (state && typeof state.stamp === 'number' && state.stamp > siteStamp) siteStamp = state.stamp;
		for (var i = STYLES.length - 1; i >= 0; i--) if (STYLES[i].site) STYLES.splice(i, 1);
		SITE = state && typeof state === 'object' ? state : { styles: [], 'default': '' };
		(Array.isArray(SITE.styles) ? SITE.styles : []).forEach(function (o) {
			if (o && typeof o.id === 'string' && /^site-[a-z0-9]+$/.test(o.id) && o.label) { var lb = plainName(o.label); o = liftCentre(plain(o) || {}); o.label = lb; o.site = true; delete o.own; STYLES.push(o); }
		});
		var d = STYLES.filter(function (x) { return !x.own && !x.host && (GUEST || x.id !== 'standard') && x.id === SITE['default']; })[0];
		var host = STYLES.filter(function (x) { return x.host; })[0];
		if (d) { STYLES.splice(STYLES.indexOf(d), 1); STYLES.splice(0, 0, d); DEFAULT = d.id; }
		else DEFAULT = NONE; 
		if (host) { STYLES.splice(STYLES.indexOf(host), 1); STYLES.splice(d ? 1 : 0, 0, host); }
	}
	takeSite(window.architraveSiteStyles);
	function encodeRecord(obj) {
		try { return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); } catch (e) { return ''; }
	}
	function decodeRecord(str) {
		try {
			str = String(str || '').replace(/-/g, '+').replace(/_/g, '/');
			while (str.length % 4) str += '=';
			var data = JSON.parse(decodeURIComponent(escape(atob(str))));
			return data && (data.architrave === 1 || data.architrave === 2 || data.architrave === 3) ? data : null;
		} catch (e) { return null; }
	}
	
	function plain(v, depth) {
		if (typeof v === 'string') return /[<>"'`\\&]/.test(v) ? undefined : v;
		if (typeof v === 'number' || typeof v === 'boolean') return v;
		if (!v || typeof v !== 'object' || Array.isArray(v) || (depth || 0) > 6) return undefined;
		var out = {};
		Object.keys(v).forEach(function (k) { if (!/^[A-Za-z][A-Za-z0-9_-]{0,47}$/.test(k)) return; var c = k === 'hostFace' && typeof v[k] === 'string' && /^[\w\s,.'"-]{1,200}$/.test(v[k]) ? v[k] : plain(v[k], (depth || 0) + 1); if (c !== undefined) out[k] = c; }); 
		return out;
	}
	function plainName(x) { return String(x || '').replace(/[<>"'`\\&]/g, '').trim(); }
	function liftCentre(rec, style) { return liftLayout(liftColours(liftType(liftLeading(liftCentreOnly(rec, style), !style)), style), style); }
	function liftType(rec) {
		if (!rec || typeof rec !== 'object') return rec;
		['light', 'dark'].forEach(function (side) {
			var c = rec.colours && rec.colours[side];
			if (!c || typeof c !== 'object') return;
			if (c.head !== undefined) { if (c.title === undefined) c.title = c.head; delete c.head; }
			if (c.kicker !== undefined) { if (c.meta === undefined) c.meta = c.kicker; delete c.kicker; }
		});
		var R = rec.roles && typeof rec.roles === 'object' ? rec.roles : null, sub = rec.subcolour;
		delete rec.subcolour;
		if (!R || rec.architrave >= 2) return rec;
		var ids = Object.keys(R), NEWER = ['headings', 'body', 'meta', 'interface', 'code'];
		var oldDial = /^(face|tracking|words|caps|leading|members)$/;
		var old = ids.some(function (k) { return ['head', 'read', 'kicker', 'small', 'comment', 'ui'].indexOf(k) !== -1; }) ||
			ids.some(function (k) { var o = R[k]; return o && typeof o === 'object' && Object.keys(o).some(function (d) { return oldDial.test(d) || (d === 'size' && String(o[d]) !== '0' && /^[0-9a-z]+$/.test(String(o[d]))); }); }) ||
			(R.title && !ids.some(function (k) { return NEWER.indexOf(k) !== -1; }));
		if (!old) return rec;
		var RUNGS = [11, 12, 13, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 44, 48, 56, 64, 72, 80, 96, 112, 128];
		var PCT = { '50': 50, '65': 65, '90': 90, '100': 100, '110': 110, '120': 120, '135': 135, '150': 150, xs: 80, s: 90, m: 100, l: 110, xl: 120 };
		var EM = { 25: 0.25, 22: 0.225, 20: 0.2, 17: 0.175, 15: 0.15, 12: 0.125, 10: 0.1, 7: 0.075, 5: 0.05, 2: 0.025, 1: 0.0125 };
		var TRACK_OLD = { tightest: 'm7', tighter: 'm5', tight: 'm2', loose: 'p2', wide: 'p5', widest: 'p10' };
		var LETTER = [['tighter', -0.05], ['tight', -0.025], ['normal', 0], ['wide', 0.025], ['wider', 0.05], ['widest', 0.1]];
		var LINE = { solid: 'tight', packed: 'tight', close: 'tight', densest: 'tight', dense: 'tight', tight: 'snug', relaxed: 'relaxed', airy: 'relaxed', wider: 'relaxed', wide: 'loose', open: 'loose', loose: 'loose', loosest: 'loose' };
		var WEIGHTS = { lighter: 'light', normal: 'regular', heavy: 'extrabold' };
		var P = {};
		var put = function (role, dial, v) { if (v === undefined || v === null) return; P[role] = P[role] || {}; if (P[role][dial] === undefined) P[role][dial] = v; };
		var step = function (v, base) {
			var px = /^\d+$/.test(String(v)) && RUNGS.indexOf(+v) !== -1 ? +v : PCT[v] ? base * PCT[v] / 100 : v === 'text' ? base : 0;
			if (!px) return undefined;
			var n = Math.max(-4, Math.min(6, Math.round(Math.log(px / base) / Math.log(1.125))));
			return n ? (n > 0 ? '+' + n : String(n)) : undefined;
		};
		var letter = function (v) {
			v = TRACK_OLD[v] || v;
			var m = /^([mp])(\d+)$/.exec(String(v)); if (!m || !EM[m[2]]) return undefined;
			var em = (m[1] === 'm' ? -1 : 1) * EM[m[2]], best = LETTER[0];
			LETTER.forEach(function (x) { if (Math.abs(x[1] - em) < Math.abs(best[1] - em)) best = x; });
			return best[0] === 'normal' ? undefined : best[0];
		};
		var conv = function (to, o, base, only) {
			if (!o || typeof o !== 'object') return;
			var want = function (d) { return !only || only.indexOf(d) !== -1; };
			if (want('font') && o.face !== undefined) put(to, 'font', o.face === 'read' || o.face === 'inherit' ? 'body' : o.face === 'ui' ? 'interface' : o.face);
			if (want('weight') && o.weight !== undefined) put(to, 'weight', WEIGHTS[o.weight] || o.weight);
			if (want('size') && o.size !== undefined) put(to, 'size', step(o.size, base));
			if (want('letterSpacing') && o.tracking !== undefined) put(to, 'letterSpacing', letter(o.tracking));
			if (want('capitals') && typeof o.caps === 'boolean') put(to, 'capitals', o.caps || undefined);
			if (want('italic') && typeof o.italic === 'boolean') put(to, 'italic', o.italic);
			if (want('lineHeight') && o.leading !== undefined) put(to, 'lineHeight', LINE[o.leading]);
			if (want('align') && o.align !== undefined && o.align !== 'default') put(to, 'align', o.align);
			if (want('colour') && o.colour !== undefined && o.colour !== 'ink') put(to, 'colour', o.colour);
		};
		var head = R.head, subm = head && head.members && head.members.sub;
		conv('title', head, 64);
		conv('headings', subm, 36, ['weight', 'size', 'letterSpacing', 'capitals', 'align']);
		conv('headings', head, 64, ['font', 'weight', 'size', 'letterSpacing', 'capitals', 'italic', 'lineHeight', 'align']);
		if (head && head.colour && head.colour !== 'ink') put('headings', 'colour', sub === 'ink' ? 'ink' : head.colour);
		conv('body', R.read, 22);
		conv('quote', R.quote, 26);
		conv('meta', R.small, 16);
		conv('meta', R.kicker, 26, ['font', 'weight', 'size', 'letterSpacing', 'capitals', 'italic', 'lineHeight', 'colour']);
		if (R.kicker && R.kicker.align && R.kicker.align !== 'default') put('title', 'align', R.kicker.align);
		conv('interface', R.ui, 13);
		conv('interface', R.title, 11);
		Object.keys(P).forEach(function (r) { Object.keys(P[r]).forEach(function (d) { if (P[r][d] === undefined) delete P[r][d]; }); if (!Object.keys(P[r]).length) delete P[r]; });
		rec.roles = P;
		rec.architrave = 2;
		return rec;
	}
	function liftLeading(rec, whole) {
		if (!rec || typeof rec !== 'object') return rec;
		var NEAR = { solid: 'dense', packed: 'dense', close: 'dense', densest: 'dense', snug: 'default', relaxed: 'airy', wider: 'airy', open: 'wide', loose: 'wide', loosest: 'wide' };
		var STEP = { tight: 'dense', snug: 'tight', normal: 'default', relaxed: 'airy', loose: 'wide' };
		var R = rec.roles && typeof rec.roles === 'object' ? rec.roles : null;
		var own = function (role) { return R && R[role] && typeof R[role] === 'object' ? R[role] : null; };
		var done = function (role) { if (!Object.keys(R[role]).length) delete R[role]; };
		var body = own('body'), ui = own('interface');
		if (body && body.lineHeight !== undefined) {
			if (STEP[body.lineHeight]) rec.leading = STEP[body.lineHeight];
			delete body.lineHeight; done('body');
		}
		if (body && body.font !== undefined) {
			if (typeof body.font === 'string' && body.font && body.font !== 'body' && body.font !== 'interface') rec.face = body.font;
			delete body.font; done('body');
		}
		if (ui && ui.font !== undefined) {
			if (typeof ui.font === 'string' && ui.font && ui.font !== 'body' && ui.font !== 'interface') rec.sans = ui.font;
			delete ui.font; done('interface');
		}
		if (rec.leading !== undefined && NEAR[rec.leading]) rec.leading = NEAR[rec.leading];
		if (rec.leading === undefined && whole) rec.leading = 'default';
		return rec;
	}
	function liftLayout(rec, style) {
		if (!rec || typeof rec !== 'object') return rec;
		if (rec.measure !== undefined) { if (rec.lineLength === undefined) rec.lineLength = String(rec.measure); delete rec.measure; }
		if (rec.widehead !== undefined) { if (rec.titleWidth === undefined && (rec.widehead === true || style)) rec.titleWidth = rec.widehead === true ? 'wide' : 'content'; delete rec.widehead; }
		if (rec.widepicture !== undefined || rec.fullpicture !== undefined) {
			if (rec.pictureWidth === undefined && (rec.widepicture === true || (style && rec.widepicture === false))) rec.pictureWidth = rec.widepicture === true ? (rec.fullpicture === 'on' ? 'full' : 'wide') : 'content';
			delete rec.widepicture; delete rec.fullpicture;
		}
		if (rec.widefigures !== undefined) { if (rec.figureWidth === undefined && (rec.widefigures === 'on' || style)) rec.figureWidth = rec.widefigures === 'on' ? 'wide' : 'content'; delete rec.widefigures; }
		var own = function (k, d) { return rec[k] !== undefined ? rec[k] : style && style[k] !== undefined ? style[k] : d; };
		if (rec.rounded !== undefined || rec.corners !== undefined) {
			if (rec.radius === undefined) rec.radius = own('rounded', true) === false ? 'none' : String(own('corners', 'medium'));
			delete rec.rounded; delete rec.corners;
		}
		if (rec.lines !== undefined || rec.linewidth !== undefined || rec.hairlines !== undefined) {
			if (rec.borderWidth === undefined) rec.borderWidth = own('lines', false) !== true ? 'none' : own('hairlines', false) === true && String(own('linewidth', '1')) === '1' ? 'hairline' : String(own('linewidth', '1'));
			delete rec.lines; delete rec.linewidth; delete rec.hairlines;
		}
		if (rec.line !== undefined) { if (rec.borderStrength === undefined) rec.borderStrength = String(rec.line); delete rec.line; }
		if (rec.linestyle !== undefined) { if (rec.borderStyle === undefined) rec.borderStyle = rec.linestyle; delete rec.linestyle; }
		if (rec.fills !== undefined) { rec.fill = own('fills', true) === false ? 'none' : String(rec.fill !== undefined ? rec.fill : own('fill', '100')); delete rec.fills; }
		if (rec.fill !== undefined) {
			if (String(rec.fill) === 'none') ['cards', 'fields'].forEach(function (k) { if (rec[k] === undefined || rec[k] === 'filled' || rec[k] === 'flat' || rec[k] === 'box' && k === 'cards' || rec[k] === 'fillOnly') rec[k] = 'outlined'; });
			delete rec.fill;
		}
		delete rec.notes;
		if (rec.borderStrength !== undefined) { var bs = +rec.borderStrength; rec.borderStrength = isNaN(bs) ? '45' : ['10', '20', '45', '70', '100'].reduce(function (a, b) { return Math.abs(+b - bs) < Math.abs(+a - bs) ? b : a; }); }
		var SURF = { cards: { box: 'filled', flat: 'filled', fillOnly: 'filled', top: 'outlined', topLine: 'outlined', ticks: 'outlined', cornerMarks: 'outlined', outline: 'outlined' }, quotes: { line: 'indented', indent: 'indented', box: 'filled' }, notes: { flat: 'filled', box: 'outlined' }, fields: { flat: 'filled', box: 'outlined' } };
		Object.keys(SURF).forEach(function (k) { if (rec[k] !== undefined && SURF[k][rec[k]]) rec[k] = SURF[k][rec[k]]; });
		var FILTER = { plain: 'none', bw: 'grayscale', duo: 'tinted', accent: 'duotone' };
		if (rec.pictures !== undefined) { if (rec.pictureFilter === undefined) rec.pictureFilter = FILTER[rec.pictures] || rec.pictures; delete rec.pictures; }
		if (rec.picturehover !== undefined) { if (rec.colourOnHover === undefined) rec.colourOnHover = rec.picturehover === true; delete rec.picturehover; }
		if (rec.picturedim !== undefined) { if (rec.dimInDark === undefined) rec.dimInDark = rec.picturedim === true; delete rec.picturedim; }
		if (rec.pictureframe !== undefined || rec.framepattern !== undefined) { if (rec.pictureFrame === undefined) rec.pictureFrame = own('pictureframe', true) === false ? 'none' : String(own('framepattern', 'plain')); delete rec.pictureframe; delete rec.framepattern; }
		if (rec.framewidth !== undefined) { if (rec.frameWidth === undefined) rec.frameWidth = String(rec.framewidth); delete rec.framewidth; }
		if (rec.picturefade !== undefined || rec.fadeedges !== undefined) { if (rec.pictureFade === undefined) rec.pictureFade = own('picturefade', false) !== true ? 'none' : String(own('fadeedges', 'sides')); delete rec.picturefade; delete rec.fadeedges; }
		if (rec.pictureshadow !== undefined) { if (rec.pictureShadow === undefined) rec.pictureShadow = rec.pictureshadow === 'soft' ? 'soft' : 'none'; delete rec.pictureshadow; }
		if (rec.piccorners !== undefined) { if (rec.pictureCorners === undefined) rec.pictureCorners = rec.piccorners === 'square' ? 'square' : 'match'; delete rec.piccorners; }
		var REN = { button: 'buttonColour', buttonshape: 'buttonShape', buttonstyle: 'primaryButton', buttonmedium: 'secondaryButton', buttonquiet: 'tertiaryButton', tagsfollow: 'tagsMatchButtons', chosenitem: 'currentItem' };
		Object.keys(REN).forEach(function (k) {
			if (rec[k] === undefined) return;
			var v = rec[k]; if (k === 'button' && v === 'ink') v = 'text'; if (k === 'buttonshape' && v === 'cards') v = 'match';
			if (rec[REN[k]] === undefined) rec[REN[k]] = v; delete rec[k];
		});
		return rec;
	}
	function liftColours(rec, style) {
		if (!rec || typeof rec !== 'object') return rec;
		var NAMES = { paper: 'background', ink: 'text', ground: 'background2', lift: 'card', marker: 'highlight', muted: 'mutedText', primary: 'accent', foreground: 'text', 'muted-foreground': 'mutedText', mutedForeground: 'mutedText', surface: 'card' };
		var PAIRS = { neutral: [['#ffffff', '#232323'], ['#373737', '#dfdfdf']], godfather: [['#fff9f2', '#2c200f'], ['#3a3630', '#f0e4d5']], fargo: [['#f7fbfe', '#1b242c'], ['#34373a', '#dfe7f0']], matrix: [['#f3fdf4', '#132818'], ['#323933', '#d9ecdc']], dune: [['#fff8f8', '#311d1b'], ['#3c3434', '#f6e1de']], persona: [['#fefefe', '#0c0c0c'], ['#202020', '#ededed']], paper: [['#f3e1c6', '#342817'], ['#504739', '#faecd8']], terminal: [['#ddffdc', '#003400'], ['#001902', '#4dff5e']], grey: [['#ffffff', '#2a2a30'], ['#4a4a4d', '#ebebf6']], news: [['#f2efe8', '#1d1c1a'], ['#1e1c19', '#e6e1d6']], arcade: [['#eef1ff', '#12124a'], ['#10113a', '#eaeeff']] };
		var TINT = { purple: ['#7444b4', '#9a73ff'], brown: ['#8b5727', '#e0b490'], green: ['#03791f', '#5af169'], blue: ['#0000ff', '#6b7fff'], orange: ['#c24400', '#ff9a2e'] };
		var PAIR_TINT = { neutral: 'purple', paper: 'brown', grey: 'blue', terminal: 'green', arcade: 'orange' };
		var PEN = { yellow: '#fff347', green: '#b4f07c', pink: '#ffb0d8', blue: '#a4d8ff', orange: '#ffc46e' };
		var SIDES = ['light', 'dark'], had = false;
		var C = rec.colours && typeof rec.colours === 'object' ? rec.colours : null;
		if (C) SIDES.forEach(function (side) {
			var c = C[side]; if (!c || typeof c !== 'object') return;
			Object.keys(NAMES).forEach(function (k) { if (c[k] === undefined) return; if (c[NAMES[k]] === undefined) c[NAMES[k]] = c[k]; delete c[k]; had = true; });
		});
		var KEYS = ['palette', 'tint', 'soft', 'softlevel', 'quietlevel', 'smallsoft', 'marker', 'markercolour', 'darkground'];
		var inv = C && SIDES.some(function (sd) { return C[sd] && C[sd].inverse !== undefined; });
		if (!KEYS.some(function (k) { return rec[k] !== undefined; }) && !inv) { if (rec.architrave) rec.architrave = 3; return rec; }
		var own = function (side) { var a = rec.colours && rec.colours[side], b = style && style.colours && style.colours[side]; return function (k) { return (a && a[k]) || (b && (b[k] || b[{ background: 'paper', text: 'ink' }[k]])) || ''; }; };
		var col = function (side) { rec.colours = rec.colours || {}; return (rec.colours[side] = rec.colours[side] || {}); };
		var pal = PAIRS[rec.palette] ? rec.palette : 'neutral';
		if (rec.palette && rec.palette !== 'neutral' && PAIRS[rec.palette]) SIDES.forEach(function (side, i) {
			var o = own(side);
			if (!o('background')) col(side).background = PAIRS[pal][i][0];
			if (!o('text')) col(side).text = PAIRS[pal][i][1];
		});
		var tint = TINT[rec.tint] ? rec.tint : rec.palette && PAIR_TINT[rec.palette] ? PAIR_TINT[rec.palette] : '';
		if (tint && tint !== 'purple') SIDES.forEach(function (side, i) { if (!own(side)('accent')) col(side).accent = TINT[tint][i]; });
		if (rec.soft === true) {
			rec.roles = rec.roles && typeof rec.roles === 'object' ? rec.roles : {};
			var body = rec.roles.body && typeof rec.roles.body === 'object' ? rec.roles.body : (rec.roles.body = {});
			if (body.colour === undefined) body.colour = 'mutedText';
			if (rec.links === undefined) rec.links = 'underlined';
		}
		var ss = rec.smallsoft !== undefined ? rec.smallsoft : rec.soft === true && rec.quietlevel !== undefined ? rec.quietlevel : undefined;
		if (ss !== undefined && String(ss) !== '25' && !isNaN(+ss)) SIDES.forEach(function (side, i) {
			var o = own(side), P = o('background') || PAIRS[pal][i][0], I = o('text') || PAIRS[pal][i][1];
			if (!o('mutedText') && /^#[0-9a-f]{6}$/i.test(P) && /^#[0-9a-f]{6}$/i.test(I)) col(side).mutedText = mixHex(I, P, +ss / 100);
		});
		if (rec.marker === true) {
			var pen = PEN[rec.markercolour] || (rec.markercolour === 'own' ? '' : PEN.yellow);
			SIDES.forEach(function (side) { var c = rec.colours && rec.colours[side]; if (pen) col(side).highlight = pen; else if (!(c && c.highlight)) col(side).highlight = PEN.yellow; });
		} else if (rec.marker === false || rec.marker === undefined && rec.markercolour !== undefined) {
			SIDES.forEach(function (side) { if (rec.colours && rec.colours[side]) delete rec.colours[side].highlight; });
		}
		if (rec.darkground === true) {
			var od = own('dark'), cl = rec.colours && rec.colours.light;
			var night = od('background2') || (od('background') ? sink(od('background'), 0.05) : pal === 'neutral' ? '#2b2b2b' : sink(PAIRS[pal][1][0], 0.05));
			col('light').background2 = (cl && cl.inverse) || night;
		}
		SIDES.forEach(function (side) { var c = rec.colours && rec.colours[side]; if (!c) return; delete c.inverse; if (!Object.keys(c).length) delete rec.colours[side]; });
		if (rec.colours && !Object.keys(rec.colours).length) delete rec.colours;
		var hadPalette = rec.palette !== undefined;
		KEYS.forEach(function (k) { delete rec[k]; });
		if (hadPalette && rec.id) rec.palette = 'neutral'; 
		if (rec.architrave) rec.architrave = 3;
		return rec;
	}
	function liftCentreOnly(rec, style) {
		if (!rec || typeof rec !== 'object') return rec;
		if (rec.corners === 'pill') { delete rec.corners; if (typeof rec.pillbuttons !== 'boolean') rec.pillbuttons = true; }
		if (rec.pillbuttons !== undefined) { var pb = rec.pillbuttons === true; delete rec.pillbuttons; if (pb) { if (rec.buttonshape === undefined) rec.buttonshape = 'pill'; } else if (style && rec.buttonshape === undefined) rec.buttonshape = 'cards'; }
		if (rec.inkbutton !== undefined) { var ib = rec.inkbutton === true; delete rec.inkbutton; if (ib) { if (rec.button === undefined) rec.button = 'ink'; } else if (style && rec.button === undefined) rec.button = 'accent'; }
		if (rec.kickerabove !== undefined) { var ka = rec.kickerabove === true; delete rec.kickerabove; if (ka) { if (rec.categories === undefined) rec.categories = 'above'; } else if (style && rec.categories === undefined) rec.categories = 'below'; }
		if (rec.centretitle === undefined) return rec;
		var on = rec.centretitle === true;
		delete rec.centretitle;
		if (!on && !style) return rec;
		var roles = rec.roles && typeof rec.roles === 'object' ? rec.roles : (rec.roles = {});
		['head', 'kicker'].forEach(function (r) {
			var o = roles[r] && typeof roles[r] === 'object' ? roles[r] : (roles[r] = {});
			if (o.align === undefined) o.align = on ? 'center' : 'default';
		});
		if (on) {
			var h = roles.head;
			if (!h.members || typeof h.members !== 'object') {
				var sm = style && style.roles && style.roles.head && style.roles.head.members;
				h.members = sm ? JSON.parse(JSON.stringify(sm)) : {};
			}
			var sub = h.members.sub && typeof h.members.sub === 'object' ? h.members.sub : (h.members.sub = {});
			if (sub.align === undefined) sub.align = 'default';
		}
		return rec;
	}
	function ownFromRecord(data, name) {
		var named = plainName(name || data.label);
		data = liftCentre(plain(data) || {});
		data.label = named;
		var entry = { id: 'own-' + Date.now().toString(36), label: data.label.slice(0, 40) || t('My style'), own: true, base: byId(data.base) ? data.base : STYLES[0].id };
		DIALS.forEach(function (d) { if (data[d] !== undefined) entry[d] = data[d]; });
		if (entry.palette === undefined) entry.palette = 'neutral';
		OPTS.forEach(function (k) { if (typeof data[k] === 'boolean' && inRecord(k)) entry[k] = data[k]; });
		['pictureFilter', 'colourOnHover', 'dimInDark', 'pictureFrame', 'frameWidth', 'pictureFade', 'pictureShadow', 'pictureCorners', 'buttonColour', 'buttonShape', 'primaryButton', 'secondaryButton', 'tertiaryButton', 'tagsMatchButtons', 'currentItem', 'lineLength', 'titleWidth', 'pictureWidth', 'figureWidth', 'radius', 'borderWidth', 'borderStyle', 'borderStrength', 'tint', 'sans', 'scope', 'pictures', 'capLines', 'line', 'fill', 'softlevel', 'quietlevel', 'smallsoft', 'measure', 'space', 'spaceInside', 'spaceItems', 'spaceSections', 'spaceTitle', 'framewidth', 'linestyle', 'corners', 'fadeedges', 'markercolour', 'framepattern', 'button', 'buttonshape', 'buttonstyle', 'buttonmedium', 'buttonquiet', 'tags', 'chosenitem', 'linewidth', 'cards', 'quotes', 'notes', 'fields', 'paragraphs', 'capface', 'hyphenate', 'piccorners', 'pictureshadow', 'pictureEdge', 'opening', 'widefigures', 'fullpicture', 'categories', 'links'].forEach(function (k) { if (data[k] !== undefined) entry[k] = data[k]; });
		['spaceInside', 'spaceItems', 'spaceSections', 'spaceTitle'].forEach(function (k) { if (typeof entry[k] === 'number') entry[k] = String(entry[k]); }); 
		if (data.roles && typeof data.roles === 'object') { entry.roles = data.roles; entry.architrave = 3; }
		if (data.effects && typeof data.effects === 'object') { var fx0 = effectsOf({ effects: data.effects }, null); if (Object.keys(fx0).length) entry.effects = fx0; } 
		if (data.colours && typeof data.colours === 'object') entry.colours = data.colours;
		if (typeof data.preset === 'string' && presetById(data.preset)) entry.preset = data.preset; 
		var shape = function (x) { var c = {}; Object.keys(x).forEach(function (k) { if (k !== 'id') c[k] = x[k]; }); return JSON.stringify(c); };
		var had = STYLES.filter(function (x) { return x.own && shape(x) === shape(entry); })[0];
		if (had) return had;
		STYLES.push(entry); writeOwn();
		return entry;
	}
	
	var READER = !!window.architravePanelReader;
	function isOriginal(id) { var x = byId(id); return !!x && (!!x.host || (!GUEST && x.id === 'standard')); }
	function readerPicks() {
		if (SITE && Array.isArray(SITE.readers)) return SITE.readers.filter(function (id) { return typeof id === 'string'; }); 
		return [];  
	}
	var PUBLIC = ['standard']; 
	function offered(p) {
		if (READER) return !!(p.host || p.id === DEFAULT || readerPicks().indexOf(p.id) !== -1);
		if (window.architravePanelGuest && !(p.host || p.own || p.site || p.id === DEFAULT || PUBLIC.indexOf(p.id) !== -1 || readerPicks().indexOf(p.id) !== -1)) return false;
		return true;
	}
	
	var DIALS = ['palette', 'leading', 'face', 'reading'];
	var OPTS = ['justify', 'dropcap', 'alternates', 'widehead', 'widepicture', 'rounded', 'lines', 'hairlines', 'fills', 'tagsfollow', 'picturehover', 'picturedim', 'pictureframe', 'picturefade'];
	var TINTS = ['purple', 'brown', 'green', 'blue', 'orange'];
	var SCOPE = ['article', 'all'];
	var PICTURES = ['plain', 'bw', 'sepia', 'duo', 'accent', 'grain', 'warm', 'hidden'];
	var CAP_LINES = ['3', '2', '4'];
	var BUTTONS = ['accent', 'ink', 'own'];
	var LINE_STYLE = ['solid', 'dashed', 'dotted'];
	var CORNERS = ['medium', 'small', 'large', 'xlarge'];
	var FADE_EDGES = ['sides', 'bottom', 'all'];
	var MARKERS = ['yellow', 'green', 'pink', 'blue', 'orange', 'text', 'muted', 'own'];
	var FRAME_PATTERNS = ['plain', 'dots', 'checker'];
	var PICKS = { categories: { attr: 'data-categories', list: ['below', 'above', 'hidden'] }, tags: { attr: 'data-tags', list: ['text', 'filled', 'tinted', 'gray', 'outlined'] }, cards: { attr: 'data-cards', list: ['filled', 'outlined', 'raised'] }, quotes: { attr: 'data-quotes', list: ['indented', 'plain', 'sideLine', 'filled'] }, fields: { attr: 'data-fields', list: ['filled', 'outlined', 'raised'] }, paragraphs: { attr: 'data-paragraphs', list: ['spaced', 'indented'] }, capface: { attr: 'data-cap-face', list: ['text', 'bold', 'fraunces', 'title'] }, hyphenate: { attr: 'data-hyphenate', list: ['auto', 'few', 'any', 'off'] }, opening: { attr: 'data-opening', list: ['off', 'big'] }, links: { attr: 'data-links', list: ['both', 'coloured', 'underlined', 'bold', 'wash'] }, pictureEdge: { attr: 'data-picture-edge', list: ['none', 'faint', 'medium', 'strong'] }, fullpicture: { attr: 'data-full-picture', list: ['off', 'on'] }, widefigures: { attr: 'data-wide-figures', list: ['off', 'on'] }, linewidth: { attr: 'data-line-width', list: ['1', '2', '3', '5'] }, buttonstyle: { attr: 'data-button-style', list: ['filled', 'outlined', 'shadow', 'tinted', 'gray', 'text'] }, buttonmedium: { attr: 'data-button-medium', list: ['gray', 'filled', 'tinted', 'outlined', 'shadow', 'text'] }, buttonquiet: { attr: 'data-button-quiet', list: ['text', 'filled', 'tinted', 'gray', 'outlined', 'shadow'] }, buttonshape: { attr: 'data-button-shape', list: ['cards', 'square', 'rounded', 'pill'] }, chosenitem: { attr: 'data-chosen-item', list: ['gray', 'filled', 'outlined', 'bold'] }, pictureshadow: { attr: 'data-picture-shadow', list: ['off', 'soft'] }, piccorners: { attr: 'data-pic-corners', list: ['cards', 'square'] } };
	var EFFECTS = {};
	var LEVELS = {
		space: { stops: ['xcompact', 'compact', 'standard', 'spacious', 'xspacious'], rest: 'standard', attr: 'data-space', prop: '--space-step' },
		spaceInside: { stops: ['16', '20', '24', '32', '40', '48'], rest: '32', attr: 'data-space-inside', prop: '--space-inside' },
		spaceItems: { stops: ['48', '64', '80', '96', '128', '160'], rest: '80', attr: 'data-space-items', prop: '--space-items' },
		spaceSections: { stops: ['40', '48', '64', '80', '96', '128'], rest: '64', attr: 'data-space-sections', prop: '--space-sections' },
		spaceTitle: { stops: ['48', '64', '80', '96', '128', '160', '192'], rest: '96', attr: 'data-space-title', prop: '--space-title' },
		measure: { stops: ['60', '64', '68', '72', '76', '80', '84', '88'], rest: '72', attr: 'data-measure', prop: '--measure-factor' },
		line: { stops: ['6', '10', '14', '20', '30', '45', '60', '80', '100'], rest: '45', attr: 'data-line', prop: '--line-strength' },
		fill: { stops: ['25', '50', '75', '100', '125', '150', '200', '300'], rest: '100', attr: 'data-fill', steps: true },
		framewidth: { stops: ['4', '8', '12', '16', '24', '32'], rest: '8', attr: 'data-frame-width', prop: '--picture-frame' }
	};
	var TYPE_ROLES = ['title', 'headings', 'body', 'quote', 'meta', 'interface', 'code'];
	var TYPE_DIALS = {
		title: ['font', 'size', 'weight', 'lineHeight', 'letterSpacing', 'capitals', 'italic', 'align', 'colour'],
		headings: ['font', 'size', 'weight', 'lineHeight', 'letterSpacing', 'capitals', 'italic', 'align', 'colour'],
		body: ['size', 'weight', 'letterSpacing', 'capitals', 'italic', 'colour'],
		quote: ['font', 'size', 'weight', 'lineHeight', 'letterSpacing', 'capitals', 'italic', 'colour'],
		meta: ['font', 'size', 'categorySize', 'weight', 'lineHeight', 'letterSpacing', 'capitals', 'italic', 'colour'],
		interface: ['size', 'weight', 'lineHeight', 'letterSpacing', 'capitals', 'italic', 'colour'],
		code: ['font', 'size', 'weight', 'lineHeight', 'letterSpacing', 'capitals', 'italic', 'colour']
	};
	var TYPE_SIZES = ['-4', '-3', '-2', '-1', '0', '+1', '+2', '+3', '+4', '+5', '+6'];
	var TYPE_LINE = { tight: 'dense', snug: 'tight', normal: 'default', relaxed: 'airy', loose: 'wide' };
	var TYPE_LETTER = { tighter: 'm5', tight: 'm2', normal: 'default', wide: 'p2', wider: 'p5', widest: 'p10' };
	var TYPE_BASE = { title: 64, headings: 36, body: 22, quote: 26, meta: 16, interface: 13, code: 18 };
	var TYPE_MEANS = { roles: { title: 'The one big line of a page: the article\'s title, a page\'s name.', headings: 'The headings inside the text, and the site\'s name.', body: 'What people read: paragraphs, lists, excerpts, the comments\' words.', quote: 'Quotations and pull quotes.', meta: 'Small facts around the text: dates, authors, categories, tags, captions, names in comments.', interface: 'The site around the text: menus, buttons, fields, labels, section titles.', code: 'Code and keys, inline and in blocks.' }, dials: { font: 'A face id from the list, or body / interface to follow the reading or the interface font. Left out: the theme\'s own.', size: 'Steps from the role\'s own size, each 1.125 times the one before: -1 a little smaller, +1 a little larger, +3 about half again as large. 0 or left out: the theme\'s own.', weight: 'thin 100 to black 900; a face offers the weights it has and falls to the nearest.', lineHeight: 'tight for big titles, snug for headings, normal is the theme\'s own, relaxed for long reading, loose for airy small text.', letterSpacing: 'tighter and tight close large type up, normal is the theme\'s own, wide to widest open small capitals and labels.', capitals: 'true sets the role in capitals.', italic: 'true sets it in italic, where the face has one.', align: 'default (the start), center or right; title and headings.', categorySize: 'meta only: the category line under the title, on the article and its cards. same (the rest): it follows size. Or its own step from its own 26 px, -4 to +6, each 1.125 apart; the dates keep size.', colour: 'text (the text colour), mutedText (Soft text, the quiet colour of dates and captions), accent (the brand colour), or own (the role\'s own colour, colours.<side>.<role>). Left out: text, and for meta mutedText.' } };
	var ROLES = ['head', 'read', 'quote', 'kicker', 'small', 'comment', 'ui', 'title'];
	var ROLE_DEFAULT = {
		head: { face: 'read', weight: 'bold', size: '64', tracking: 'default', words: 'default', caps: false, italic: false, leading: 'default', align: 'default', colour: 'ink', members: {} },
		read: { face: 'newsreader', weight: 'regular', size: '22', tracking: 'default', words: 'default', caps: false, italic: false, leading: 'default', members: {} },
		quote: { face: 'read', weight: 'regular', size: '28', tracking: 'default', words: 'default', caps: false, italic: true, leading: 'default' },
		kicker: { face: 'read', weight: 'regular', size: '26', tracking: 'default', words: 'default', caps: false, italic: true, leading: 'default', align: 'default', colour: 'ink' },
		small: { face: 'ui', weight: 'regular', size: '16', tracking: 'default', words: 'default', caps: false, italic: false, leading: 'default', members: {} },
		comment: { face: 'ui', weight: 'regular', size: '14', tracking: 'default', words: 'default', caps: false, italic: false, leading: 'default', members: {} },
		ui: { face: 'inter', weight: 'regular', size: '13', tracking: 'default', words: 'default', caps: false, italic: false, leading: 'default', members: {} },
		title: { face: 'ui', weight: 'medium', size: '11', tracking: 'default', words: 'default', caps: false, italic: false, leading: 'default', members: {} }
	};
	var MEMBERS = {
		ui: [
			{ id: 'masthead', rest: 20, weight: 'semibold' },
			{ id: 'cards', rest: 13, weight: 'regular' },
			{ id: 'linkcard', rest: 18, weight: 'regular' },
			{ id: 'newsletter', rest: 16, weight: 'regular' },
			{ id: 'fields', rest: 13, weight: 'regular' },
			{ id: 'menus', rest: 13, lead: true },
			{ id: 'labels', rest: 11, weight: 'regular' },
			{ id: 'credit', rest: 12, weight: 'regular' }
		],
		head: [
			{ id: 'title', rest: 64, lead: true },
			{ id: 'sub', rest: 36, weight: 'semibold' }
		],
		small: [
			{ id: 'date', rest: 16, lead: true },
			{ id: 'author', rest: 16, weight: 'regular' },
			{ id: 'terms', rest: 13, weight: 'regular' },
			{ id: 'captions', rest: 13, weight: 'regular' },
			{ id: 'carddates', rest: 13, weight: 'regular' },
			{ id: 'release', rest: 16, weight: 'regular' }
		],
		comment: [
			{ id: 'title', rest: 18, weight: 'medium' },
			{ id: 'name', rest: 16, weight: 'medium' },
			{ id: 'text', rest: 14, lead: true },
			{ id: 'small', rest: 13, weight: 'regular' },
			{ id: 'form', rest: 13, weight: 'regular' }
		],
		read: [
			{ id: 'text', rest: 22, lead: true },
			{ id: 'excerpts', rest: 22, weight: 'regular' },
			{ id: 'boxes', rest: 18, weight: 'regular' }
		],
		title: [
			{ id: 'sections', rest: 11, lead: true },
			{ id: 'years', rest: 16, weight: 'medium' },
			{ id: 'release', rest: 16, weight: 'semibold' }
		]
	};
	var TRACK_ALIAS = { tightest: 'm7', tighter: 'm5', tight: 'm2', loose: 'p2', wide: 'p5', widest: 'p10' };
	var WORDS_ALIAS = { tighter: 'm10', tight: 'm5', loose: 'p5', wide: 'p10', widest: 'p15' };
	var WEIGHT_ALIAS = { lighter: 'light', normal: 'regular', heavy: 'extrabold' };
	var FOLLOW_ALIAS = { inherit: 'read' };
	var ROLE_COLOURS = ['ink', 'accent', 'own', 'muted'];
	var LIST = {
		labelMax: 40,
		schema: ['architrave', 'label', 'base', 'reading', 'justify', 'dropcap', 'radius', 'borderWidth', 'titleWidth', 'colourOnHover', 'dimInDark', 'pictureFade', 'pictureFrame', 'pictureWidth', 'categories', 'tagsMatchButtons', 'alternates', 'scope', 'pictureFilter', 'capLines', 'borderStrength', 'links', 'lineLength', 'space', 'spaceInside', 'spaceItems', 'spaceSections', 'spaceTitle', 'frameWidth', 'borderStyle', 'buttonColour', 'buttonShape', 'primaryButton', 'secondaryButton', 'tertiaryButton', 'tags', 'currentItem', 'cards', 'quotes', 'fields', 'paragraphs', 'capface', 'hyphenate', 'pictureCorners', 'pictureShadow', 'pictureEdge', 'opening', 'figureWidth', 'effects', 'roles', 'colours'],
		choices: { scope: SCOPE, capLines: ['2', '3', '4'], borderStyle: LINE_STYLE },
		wells: ['background', 'background2', 'card', 'text', 'mutedText', 'accent', 'highlight', 'button', 'title', 'headings', 'body', 'quote', 'meta', 'interface', 'code'],
		meaning: {
			architrave: 'Always 1. Marks the JSON as a style record.',
			label: 'The name on the tile.',
			base: 'The built-in style this record starts from; every key left out rests on it. See examples for what each base is.',
			palette: 'Retired 2026-10-03 and still read: a pair other than neutral is written out as its background and text on both sides.',
			reading: 'The reading size step of the article, a fluid rung and not a pixel value; default is about 22px on a desktop. Do not set a size for a monospaced reading face, its phone floor is handled by the theme.',
			justify: 'Justified paragraphs with hyphenation.',
			dropcap: 'A large initial on the first paragraph; capLines is its height in lines.',
			capLines: 'Height of the initial in lines. Only with dropcap.',
			radius: 'The corners of cards, buttons, fields and pictures: none (square), small, medium (the theme\'s own), large or xlarge. One step re-cuts every corner together; corners inside corners stay sums.',
			rounded: 'Retired 2026-10-03 and still read: false becomes radius none.',
			borderWidth: 'How wide every line is: the lines between rows, around buttons and the line of an outlined card, quote or field. none (the theme\'s own: no lines but link underlines), hairline (half a pixel), or 1, 2, 3 or 5 px. It adds no line to a filled box: that is the Cards, Quotes and Fields rows\' choice.',
			lines: 'Retired 2026-10-03 and still read: false becomes borderWidth none; true takes linewidth (and hairline with hairlines).',
			borderStrength: 'How strong the lines are: the text colour\'s share in the line colour, 10, 20, 45 (the theme\'s own), 70 or 100 per cent. Only with a borderWidth.',
			line: 'Retired 2026-10-03 and still read: the lines\' strength becomes borderStrength, the same steps.',
			corners: 'Retired 2026-10-03 and still read: the corner size becomes radius (small, medium, large, xlarge).',
			marker: 'Retired 2026-10-03 and still read: true becomes colours.<side>.highlight, the pen\'s colour; false none.',
			markercolour: 'Retired 2026-10-03 and still read: the pen becomes the highlight\'s colour (text and muted become yellow).',
			lineLength: 'How many letters a line of reading text holds: 60 to 88 in steps of 4; 72 is the theme\'s own (45 to 75 is the classic range for comfortable reading). The column grows with the text size. On another theme it sets the theme\'s content width.',
			measure: 'Retired 2026-10-03 and still read: the line length is lineLength now, the same steps.',
			space: 'The space of the page: xcompact, compact, standard, spacious or xspacious. Standard is the rest, the theme\'s own. Each kind of gap moves by its own amount: inside a group a little, between items more, between sections most, so what belongs together stays together. The reading text of an article keeps its own rhythm.',
			spaceInside: 'Space inside a group, a style\'s own: a title and the line under it, the date and the text, the padding in a button. 32 is the rest; smaller gaps of the same job follow by the same steps, and a growing gap stops at spaceSections. In px of the theme\'s own scale; the theme\'s own is the rest. On another theme the gaps move by the same number of steps along the scale (2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192, 256). On a phone the three big jobs move half as many steps. The Space dial moves all four together, one step at a time.',
			spaceItems: 'Space between items, a style\'s own: posts in a list, cards in a grid, given per side (two posts stand twice this far apart). 80 is the rest; the room above a heading moves with it. In px of the theme\'s own scale; the theme\'s own is the rest. On another theme the gaps move by the same number of steps along the scale (2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192, 256). On a phone the three big jobs move half as many steps. The Space dial moves all four together, one step at a time.',
			spaceSections: 'Space between sections, a style\'s own: the bands a page is stacked from, the parts at the end of an article. 64 is the rest; a shrinking gap stops at spaceInside. In px of the theme\'s own scale; the theme\'s own is the rest. On another theme the gaps move by the same number of steps along the scale (2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192, 256). On a phone the three big jobs move half as many steps. The Space dial moves all four together, one step at a time.',
			spaceTitle: 'Space above a page\'s title, a style\'s own: the room the title stands in. 96 is the rest. In px of the theme\'s own scale; the theme\'s own is the rest. On another theme the gaps move by the same number of steps along the scale (2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192, 256). On a phone the three big jobs move half as many steps. The Space dial moves all four together, one step at a time.',
			frameWidth: 'Width of the frame around pictures in pixels: 4, 8 (the rest), 12, 16, 24 or 32. Only with a pictureFrame.',
			framewidth: 'Retired 2026-10-03 and still read: becomes frameWidth, the same steps.',
			framepattern: 'Retired 2026-10-03 and still read: with the frame on, becomes pictureFrame (plain, dots, checker).',
			titleWidth: 'How wide the article\'s title, categories and date stand: content (the reading column, the rest) or wide (the theme\'s wide width, as the wide top picture). WordPress\'s own words. Architrave\'s page only.',
			widehead: 'Retired 2026-10-03 and still read: true becomes titleWidth wide.',
			pictureWidth: 'How wide the article\'s first picture stands: content (the reading column, the rest), wide (the theme\'s wide width) or full (edge to edge across the paper, a low 21:9 banner with square corners). WordPress\'s own words. Architrave\'s page only.',
			widepicture: 'Retired 2026-10-03 and still read: true becomes pictureWidth wide (full with fullpicture on).',
			fullpicture: 'Retired 2026-10-03 and still read: on, with widepicture, becomes pictureWidth full.',
			categories: 'Where the line of categories stands on the article and on its cards: below the title (the rest), above it, or hidden. It replaced the switch kickerabove.',
			kickerabove: 'Retired 2026-09-27 and still read: true becomes categories above.',
			buttonColour: 'What fills the main buttons: accent (the brand colour, the rest), text, or own (colours.<side>.button). The links keep the accent either way.',
			button: 'Retired 2026-10-03 and still read: becomes buttonColour (ink is text).',
			inkbutton: 'Retired 2026-09-26 and still read: true becomes button ink.',
			buttonShape: 'The buttons\' corners: match (the corners every card has, the rest), square, rounded (8 px) or pill. Only with a radius.',
			buttonshape: 'Retired 2026-10-03 and still read: becomes buttonShape (cards is match).',
			tagsMatchButtons: 'true: the tags\' pills take the buttons\' corner instead of staying round.',
			tagsfollow: 'Retired 2026-10-03 and still read: becomes tagsMatchButtons.',
			primaryButton: 'How the main buttons look (the one action, like Subscribe): filled (the rest), outlined, shadow (outlined with a hard shadow), tinted, gray or text (text only), in the button colour.',
			buttonstyle: 'Retired 2026-10-03 and still read: becomes primaryButton, the same looks.',
			secondaryButton: 'How the other buttons look (a second choice beside the main one): gray (the rest), filled, tinted, outlined, shadow or text, in the button colour where it has one.',
			buttonmedium: 'Retired 2026-10-03 and still read: becomes secondaryButton, the same looks.',
			tertiaryButton: 'How the quiet buttons look (small actions, like Share): text (the rest), filled, tinted, gray, outlined or shadow. Architrave\'s alone; another theme has no quiet kind.',
			buttonquiet: 'Retired 2026-10-03 and still read: becomes tertiaryButton, the same looks.',
			tags: 'How the tags at the end of an article look: text (the rest: words, as the theme sets them), or small pills that are filled, tinted, gray or outlined, made from the button colour. Tags follow the buttons gives the pills the buttons\' corner.',
			currentItem: 'How the current item is marked (the page you are on in the menu, the open tab): gray (the rest: the theme\'s own mark), filled with the button colour, outlined in it, or bold and underlined.',
			chosenitem: 'Retired 2026-10-03 and still read: becomes currentItem, the same looks.',
			linewidth: 'Retired 2026-10-03 and still read: with lines, it becomes borderWidth (1, 2, 3, 5).',
			cards: 'How cards and boxes look: the theme\'s cards (link cards, the support box) and a box the writer coloured in an article (a Group block with a background): filled (the rest: the card\'s own fill, no line, whatever the Lines slider), outlined (a line on the paper, as wide as the Lines slider says, never under 1 px; a coloured box keeps its colour) or raised (lifted by a shadow).',
			quotes: 'How quotes look, in an article and as a quote post: sideLine (set in, with a vertical line at the side, whatever the lines setting; the rest on Architrave), indented (set in from the edge, no line; the rest on another theme), plain (the words alone, not set in) or filled (in a box with its fill and no line, whatever the Lines slider; a quote post\'s card). Quotes are italic.',
			notes: 'Retired 2026-10-05 and still read: a box the writer coloured follows cards now.',
			fields: 'How search, comment and sign-up fields look: filled (the rest: the fill, no line, whatever the Lines slider), outlined (a line on the paper, as wide as the Lines slider says) or raised (lifted by a shadow).',
			paragraphs: 'Paragraphs spaced apart (the rest) or indented with no space between, as print sets them.',
			capface: 'The drop cap\'s letter: text (the rest, the reading text\'s own face and weight), bold (the reading face in bold, as the title), fraunces (a soft old-style display capital) or title (the heading role\'s own face, weight, slant and colour). Shows with Drop cap on.',
			hyphenate: 'Where words break at the line\'s end: auto (the rest: with Justified text, every word that may), few (long words only, on any edge, never on two lines in a row), any (every word that may, on any edge) or off (never).',
			pictureCorners: 'The pictures\' corners: match (the corners every card and button has, the rest) or square (pictures cut square while cards and buttons keep theirs).',
			piccorners: 'Retired 2026-10-03 and still read: becomes pictureCorners (cards is match).',
			pictureShadow: 'A soft shadow under the pictures, so a white screenshot stands off a white paper: none (the rest) or soft; by night a faint light edge instead. Architrave\'s page only.',
			pictureEdge: 'A fine line around pictures without a frame, so a white screenshot keeps its edge on a white paper: none (the rest), faint (the ink at 8 %), medium (16 %) or strong (30 %), drawn inside the picture. Architrave\'s page only.',
			pictureshadow: 'Retired 2026-10-03 and still read: becomes pictureShadow (off is none).',
			subcolour: 'Retired 2026-10-02 and still read: ink keeps the headings in the ink under a coloured title (roles.headings.colour ink).',
			opening: 'The article\'s first paragraph speaks up, as a launch page opens on one big sentence: off (the rest) or big (1.4 times the text, medium, in the ink). Architrave\'s page only.',
			figureWidth: 'How wide the pictures inside the article stand: content (the reading column, the rest) or wide (as the wide top picture, centred, with more air). Architrave\'s page only.',
			widefigures: 'Retired 2026-10-03 and still read: on becomes figureWidth wide.',
			pillbuttons: 'Retired 2026-09-26 and still read: true becomes buttonshape pill.',
			centretitle: 'Retired 2026-09-25 and still read: true becomes roles.head.align and roles.kicker.align center, with roles.head.members.sub.align default.',
			fadeedges: 'Retired 2026-10-03 and still read: with the fade on, becomes pictureFade (bottom, sides, all).',
			borderStyle: 'solid (the rest), dashed or dotted lines. Dashes are long only with radius none. Only with a borderWidth.',
			linestyle: 'Retired 2026-10-03 and still read: becomes borderStyle (solid, dashed, dotted).',
			fills: 'Retired 2026-10-03 and still read: false becomes fill none.',
			fill: 'Retired 2026-10-05 and still read: none becomes cards and fields outlined; a strength is dropped (the fills are the colours\' own, the Cards colour).',
			softlevel: 'Retired 2026-10-03: Softer reading text\'s strength; the reading text takes Soft text\'s one shade.',
			quietlevel: 'Retired 2026-10-03 and still read: with soft, the small text\'s strength becomes Soft text\'s own colour (colours.<side>.mutedText).',
			smallsoft: 'Retired 2026-10-03 and still read: the small text\'s strength becomes Soft text\'s own colour (colours.<side>.mutedText), the text that far toward the background.',
			links: 'How links in the text are marked: both (the rest: the accent and an underline), coloured (the accent alone, no underline even under the pointer), underlined (the ink with a quiet underline), bold (the ink on a thick underline in the accent, filled with the accent under the pointer) or wash (the ink on a pale wash of the accent, as a highlighter lays it, filled with the accent under the pointer). Not set, a style with soft marks them underlined, and an export leaves it out.',
			pictureFilter: 'How every image on the site is shown: none (as published, the rest), grayscale, sepia, tinted (in the colour pair\'s paper and text), duotone (paper and accent), grain (film grain), warm, or hidden (no pictures).',
			pictures: 'Retired 2026-10-03 and still read: becomes pictureFilter (plain is none, bw grayscale, duo tinted, accent duotone).',
			colourOnHover: 'true: the picture look lifts under the pointer and the real colours show. Nothing with pictureFilter none or hidden.',
			picturehover: 'Retired 2026-10-03 and still read: becomes colourOnHover.',
			alternates: 'Inter\'s alternate letters: the one with a longer flag, round quotes, commas and apostrophes. Only while the interface face is Inter; the article keeps its own face\'s letters.',
			soft: 'Retired 2026-10-03 and still read: true becomes roles.body.colour mutedText, and links underlined.',
			dimInDark: 'true: pictures are dimmed a little on the dark side.',
			picturedim: 'Retired 2026-10-03 and still read: becomes dimInDark.',
			pictureFade: 'The article\'s top picture fades into the paper: none (the rest), bottom, sides (bottom and sides) or all four edges. Architrave\'s page only.',
			picturefade: 'Retired 2026-10-03 and still read: false becomes pictureFade none; true takes fadeedges.',
			pictureFrame: 'The frame around pictures: none (a picture stands on the paper with its corner alone), plain (a mat in the fields\' colour, the rest), dots (the dot grid) or checker (a transparency checkerboard). With a borderWidth, a line around it too.',
			pictureframe: 'Retired 2026-10-03 and still read: false becomes pictureFrame none; true takes framepattern.',
			darkground: 'Retired 2026-10-03 and still read: true becomes the light side\'s background2, the night\'s own ground (or the dark ground\'s own colour).',
			hairlines: 'Retired 2026-10-03 and still read: with lines at 1, true becomes borderWidth hairline.',
			tint: 'Retired 2026-10-03 and still read: the accent\'s name becomes the accent colour on both sides.',
			scope: 'Legacy. The theme always applies paragraph settings everywhere.',
			effects: 'The extras\' details, one object per effect (title, serif, arrival, cardlight, moving, button, pattern, guides, tint, aurora, pointer, dividers, topline, picglow), each holding only the details that differ from their rest; the effect\'s own switch is its flat pick (titlefinish, headitalics, headarrival, cardlight, buttonfinish, toppattern, guides, greytint, pageglow, movinglight) or, for the last four, its look.',
			roles: 'Typography by seven roles, named for their job and tied to the HTML every site has. title: the one big line of a page (h1, the post title). headings: the headings inside the text (h2 to h6) and the site\'s name. body: what people read (p, li). quote: quotations. meta: small facts around the text (dates, authors, categories, tags, captions). interface: menus, buttons, fields, labels. code: code, pre, kbd. Every role takes font, size, weight, lineHeight, letterSpacing, capitals, italic; title and headings also align; meta also takes categorySize (the category line under the title, same or its own step); every role also takes a colour (text, mutedText, accent or own). A dial left out is the theme\'s own. size is a step from the role\'s own size (-4 to +6, each 1.125 apart). lineHeight: tight, snug, normal, relaxed, loose. letterSpacing: tighter, tight, normal, wide, wider, widest. Records say architrave 3 (2 before the seven colours); older records with the eight roles are read into the seven.',
			colours: 'Seven colours per side, named for their job, as hex: background (Paper: the page the text sits on), background2 (Ground: the space around the page and the rails, a theme\'s second background), card (Cards: menus, boxes, fields standing on the page), text, mutedText (Soft text: dates, captions, small facts), accent (the brand colour: links and the main buttons) and highlight (the highlighter\'s colour; left out, none). Beside them the button\'s own colour and each type role\'s own (title, headings, body, quote, meta, interface, code), used with button own and roles.<role>.colour own. Leave out what you do not need: the rest is mixed from background and text. text on background must reach 4.5:1 and accent on background 3:1 on both sides. A background2 on the other side of its background (dark around a light page, light around a dark one) is a dark ground, worn around the page on wide screens with its own words, lines and links. Older records name paper, ink, ground, lift and marker; they are read as these. primary, foreground and muted-foreground are read as accent, text and mutedText.'
		}
	};
	
	var COLOUR_ENGINE = { background: 'paper', text: 'ink', background2: 'ground', card: 'lift', highlight: 'marker', mutedText: 'muted' };
	var COLOUR_PUBLIC = { paper: 'background', ink: 'text', ground: 'background2', lift: 'card', marker: 'highlight', muted: 'mutedText' };
	var COLOUR_KEYS = ['background', 'background2', 'card', 'text', 'mutedText', 'accent', 'highlight'];
	var ROLE_WELLS = ['title', 'headings', 'body', 'quote', 'meta', 'interface', 'code'];
	var WELL_KEYS = COLOUR_KEYS.concat(['button'], ROLE_WELLS);
	var BESIDE_PRESET = ['button', 'highlight', 'mutedText'].concat(ROLE_WELLS); 
	var ENGINE_WELLS = ['paper', 'ink', 'accent', 'button', 'ground', 'lift', 'marker', 'muted', 'inverse'].concat(ROLE_WELLS);
	var PENS = { yellow: '#fff347', green: '#b4f07c', pink: '#ffb0d8', blue: '#a4d8ff', orange: '#ffc46e' };
	function penOf(hex) { var h = String(hex || '').toLowerCase(); return Object.keys(PENS).filter(function (n) { return PENS[n] === h; })[0] || ''; }
	var TYPE_COLOURS = ['text', 'mutedText', 'accent', 'own'];
	function typeColourRest(role) { return role === 'meta' ? 'mutedText' : 'text'; } 
	var ENGINE_ONLY = ['palette', 'tint', 'soft', 'softlevel', 'quietlevel', 'smallsoft', 'marker', 'markercolour', 'darkground', 'measure', 'widehead', 'widepicture', 'fullpicture', 'widefigures', 'rounded', 'corners', 'lines', 'linewidth', 'hairlines', 'line', 'linestyle', 'fills', 'button', 'buttonshape', 'buttonstyle', 'buttonmedium', 'buttonquiet', 'tagsfollow', 'chosenitem', 'pictures', 'picturehover', 'picturedim', 'pictureframe', 'framepattern', 'framewidth', 'picturefade', 'fadeedges', 'pictureshadow', 'piccorners', 'fill']; 
	var LAYOUT = { lineLength: { list: ['60', '64', '68', '72', '76', '80', '84', '88'], rest: '72' }, titleWidth: { list: ['content', 'wide'], rest: 'content' }, pictureWidth: { list: ['content', 'wide', 'full'], rest: 'content' }, figureWidth: { list: ['content', 'wide'], rest: 'content' },
		radius: { list: ['none', 'small', 'medium', 'large', 'xlarge'], rest: 'medium' }, borderWidth: { list: ['none', 'hairline', '1', '2', '3', '5'], rest: 'none' }, borderStyle: { list: ['solid', 'dashed', 'dotted'], rest: 'solid' }, borderStrength: { list: ['10', '20', '45', '70', '100'], rest: '45' },
		buttonColour: { list: ['accent', 'text', 'own'], rest: 'accent' }, buttonShape: { list: ['match', 'square', 'rounded', 'pill'], rest: 'match' },
		primaryButton: { list: ['filled', 'outlined', 'shadow', 'tinted', 'gray', 'text'], rest: 'filled' }, secondaryButton: { list: ['gray', 'filled', 'tinted', 'outlined', 'shadow', 'text'], rest: 'gray' }, tertiaryButton: { list: ['text', 'filled', 'tinted', 'gray', 'outlined', 'shadow'], rest: 'text' },
		tagsMatchButtons: { list: [false, true], rest: false }, currentItem: { list: ['gray', 'filled', 'outlined', 'bold'], rest: 'gray' },
		pictureFilter: { list: ['none', 'grayscale', 'sepia', 'tinted', 'duotone', 'grain', 'warm', 'hidden'], rest: 'none' }, colourOnHover: { list: [false, true], rest: false }, dimInDark: { list: [false, true], rest: false },
		pictureFrame: { list: ['none', 'plain', 'dots', 'checker'], rest: 'plain' }, frameWidth: { list: ['4', '8', '12', '16', '24', '32'], rest: '8' }, pictureFade: { list: ['none', 'bottom', 'sides', 'all'], rest: 'none' },
		pictureShadow: { list: ['none', 'soft'], rest: 'none' }, pictureCorners: { list: ['match', 'square'], rest: 'match' } };
	var FILTER_ENGINE = { none: 'plain', grayscale: 'bw', tinted: 'duo', duotone: 'accent' };
	var RENAMED_PICK = { buttonstyle: 'primaryButton', buttonmedium: 'secondaryButton', buttonquiet: 'tertiaryButton', buttonshape: 'buttonShape', chosenitem: 'currentItem' }; 
	var SURFACE_ENGINE = { cards: { filled: 'box', outlined: 'outline', raised: 'raised' }, quotes: { indented: 'indent', sideLine: 'line', plain: 'plain', filled: 'box' }, notes: { filled: 'flat', outlined: 'box', raised: 'raised' }, fields: { filled: 'flat', outlined: 'box', raised: 'raised' } };
	function surfaceWord(key, v) { var m = SURFACE_ENGINE[key]; if (!m || m[v]) return v; var w = Object.keys(m).filter(function (k) { return m[k] === v; })[0]; return w || v; }
	function layoutOwn(k) { var L = LAYOUT[k], s = byId(current), b = s && byId(baseOf(s)); if (s && L.list.indexOf(s[k]) !== -1) return s[k]; if (b && L.list.indexOf(b[k]) !== -1) return b[k]; return L.rest; }
	function layoutOf(k) { var tw = readTweaks()[current]; return tw && LAYOUT[k].list.indexOf(tw[k]) !== -1 ? tw[k] : layoutOwn(k); }
	function inRecord(k) { return ENGINE_ONLY.indexOf(k) === -1; }
	function colourKey(k) { return COLOUR_PUBLIC[k] || k; }
	function engineSide(o) { var out = {}; Object.keys(o || {}).forEach(function (k) { if (o[k] !== undefined) out[COLOUR_ENGINE[k] || k] = o[k]; }); return out; }
	function publicSide(o) { var out = {}; Object.keys(o || {}).forEach(function (k) { if (o[k] !== undefined && k !== 'inverse') out[COLOUR_PUBLIC[k] || k] = o[k]; }); return out; }
	function groundFlip(G, P, I) {
		if (!G || !P || !/^#[0-9a-f]{6}$/i.test(G) || !/^#[0-9a-f]{6}$/i.test(P)) return false;
		var other = lum(P) > 0.18 ? '#dfdfdf' : '#232323'; 
		I = /^#[0-9a-f]{6}$/i.test(I || '') ? I : lum(P) > 0.18 ? '#232323' : '#dfdfdf';
		return contrast(other, G) > contrast(I, G); 
	}
	function paperNow(side) { return side === 'dark' ? '#373737' : '#ffffff'; }
	function inkOf(side) { return side === 'dark' ? '#dfdfdf' : '#232323'; }
	function canvasOf(side) { return side === 'dark' ? '#2b2b2b' : '#ebebeb'; }
	if (window.architravePanelGuest) ROLE_DEFAULT.quote.italic = false;
	
	
	
	
	            
	
	
	var PAIR_TINTS = { neutral: 'purple', paper: 'brown', grey: 'blue', terminal: 'green', arcade: 'orange' };
	function tintOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && TINTS.indexOf(tw.tint) !== -1) return tw.tint;
		return (s && s.tint) || TINTS[0];
	}
	function applyTint() { var v = tintOf(); if (root.getAttribute('data-tint') !== v) root.setAttribute('data-tint', v); }
	
	var SANS = [
		{ id: 'inter', label: 'Inter' },
		{ id: 'hyperlegible', label: 'Atkinson Hyperlegible' },
		{ id: 'geist', label: 'Geist' },
		{ id: 'plex-sans', label: 'IBM Plex Sans' },
		{ id: 'newsreader', label: 'Newsreader' },
		{ id: 'libre-baskerville', label: 'Libre Baskerville' },
		{ id: 'vollkorn', label: 'Vollkorn' },
		{ id: 'mono', label: 'Geist Mono' },
		{ id: 'martian-mono', label: 'Martian Mono' },
		{ id: 'kode-mono', label: 'Kode Mono' },
		{ id: 'jetbrains-mono', label: 'JetBrains Mono' },
		{ id: 'doto', label: 'Doto' },
		{ id: 'vt323', label: 'VT323' },
		{ id: 'handjet', label: 'Handjet' }
	];
	function sansOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && SANS.some(function (f) { return f.id === tw.sans; })) return tw.sans;
		return (s && s.sans) || SANS[0].id;
	}
	function applySans() {
		var v = sansOf(); if (root.getAttribute('data-sans') !== v) root.setAttribute('data-sans', v);
		var own = window.architravePanelGuest && !isLook(current) && (readTweaks()[current] || {}).sans !== undefined;
		if (own) root.setAttribute('data-sans-own', ''); else root.removeAttribute('data-sans-own');
	}
	
	
	
	
	
	
	var FAMILY = {
		inter: 'var(--face-inter)',
		hyperlegible: 'var(--wp--preset--font-family--font-atkinson-hyperlegible-next)',
		geist: 'var(--wp--preset--font-family--font-geist)',
		newsreader: 'var(--face-newsreader)',
		'libre-baskerville': 'var(--wp--preset--font-family--font-libre-baskerville)',
		vollkorn: 'var(--wp--preset--font-family--font-vollkorn)',
		mono: 'var(--wp--preset--font-family--font-geist-mono)',
		'martian-mono': 'var(--wp--preset--font-family--font-martian-mono)',
		'kode-mono': 'var(--wp--preset--font-family--font-kode-mono)',
		'plex-sans': 'var(--wp--preset--font-family--font-plex-sans)',
		'jetbrains-mono': 'var(--wp--preset--font-family--font-jetbrains-mono)',
		'plex-mono': 'var(--wp--preset--font-family--font-jetbrains-mono)', 
		doto: 'var(--wp--preset--font-family--font-doto)',
		vt323: 'var(--wp--preset--font-family--font-vt-323)',
		handjet: 'var(--wp--preset--font-family--font-handjet)'
	};
	var SERIFS = ['newsreader', 'libre-baskerville', 'vollkorn'];
	
	var ITALICS = ['newsreader', 'libre-baskerville', 'vollkorn', 'geist', 'plex-sans', 'jetbrains-mono', 'inter', 'hyperlegible']; 
	function hasItalic(face) {
		face = realFace(face); return ITALICS.indexOf(face) !== -1; }
	
	var WEIGHT = { thin: 100, extralight: 200, light: 300, regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900 };
	
	var RANGE = { inter: [100, 900], hyperlegible: [200, 800], geist: [100, 900], newsreader: [200, 800], 'libre-baskerville': [400, 700], vollkorn: [400, 900], mono: [100, 900], 'martian-mono': [100, 800], 'kode-mono': [400, 700], 'plex-sans': [100, 700], 'jetbrains-mono': [100, 800], doto: [100, 900], vt323: [], handjet: [100, 900] }; 
	
	function isAnchor(face) { return face === 'read' || face === 'ui'; }
	function realFace(face) {
		face = FOLLOW_ALIAS[face] || face;
		if (face === 'read') return root.getAttribute('data-face') || 'newsreader';
		if (face === 'ui') return root.getAttribute('data-sans') || 'inter';
		return face;
	}
	function faceValue(face) {
		if (face === 'read') return 'var(--font-reading)';
		if (face === 'ui') return 'var(--font-sans)';
		return FAMILY[face] || FAMILY.newsreader;
	}
	var CUTS = {};
	(window.ArchitraveFontLibrary || []).forEach(function (f) {
		if (FAMILY[f.id]) return;
		SANS.push({ id: f.id, label: f.label });
		FAMILY[f.id] = f.family;
		if (f.weights) { CUTS[f.id] = f.weights; RANGE[f.id] = [f.weights[0], f.weights[f.weights.length - 1]]; } else RANGE[f.id] = f.range;
		if (f.italic) ITALICS.push(f.id);
	});
	function weightsFor(face) {
		face = realFace(face);
		if (CUTS[face]) return Object.keys(WEIGHT).filter(function (k) { return CUTS[face].indexOf(WEIGHT[k]) !== -1; });
		var r = RANGE[face] || [100, 900];
		return Object.keys(WEIGHT).filter(function (k) { return WEIGHT[k] >= r[0] && WEIGHT[k] <= r[1]; });
	}
	function fitWeight(face, w) {
		face = realFace(face);
		var ok = weightsFor(face);
		if (!ok.length) return w;
		if (ok.indexOf(w) !== -1) return w;
		var want = WEIGHT[w] || 400, best = ok[0];
		ok.forEach(function (k) { if (Math.abs(WEIGHT[k] - want) < Math.abs(WEIGHT[best] - want)) best = k; });
		return best;
	}
	
	var ROLE_BASE = { head: 64, read: 22, quote: 26, kicker: 26, small: 16, comment: 14, ui: 13, title: 11 }; 
	
	
	
	
	
	
	
	
	
	
	
	var MEMBER_DIALS = ['size', 'weight', 'caps', 'tracking'];
	var ALIGN = { 'default': 'start', center: 'center', right: 'right' };
	var ALIGNS = Object.keys(ALIGN);
	
	var MEMBER_MORE = { 'head.sub': ['face', 'italic', 'leading', 'colour'], 'comment.title': ['face', 'italic'], 'comment.name': ['face', 'italic'], 'comment.small': ['face', 'italic'], 'comment.form': ['face', 'italic'] };
	function memberDialsOf(role, id) {
		var base = ROLE_DEFAULT[role] && ROLE_DEFAULT[role].align !== undefined ? MEMBER_DIALS.concat('align') : MEMBER_DIALS;
		return id && MEMBER_MORE[role + '.' + id] ? base.concat(MEMBER_MORE[role + '.' + id]) : base;
	}
	function membersOf(role) { return MEMBERS[role] || []; }
	
	var TYPE_LEADS = { head: 'title', read: 'body', comment: 'body', quote: 'quote', small: 'meta', kicker: 'meta', ui: 'interface', title: 'interface' };
	var TYPE_PARTS = [['headings', 'head', 'sub'], ['headings', 'comment', 'title'], ['meta', 'comment', 'name'], ['meta', 'comment', 'small'], ['interface', 'comment', 'form']];
	var ENGINE_DIAL = { font: 'face', size: 'factor', weight: 'weight', lineHeight: 'leading', letterSpacing: 'tracking', capitals: 'caps', italic: 'italic', align: 'align', colour: 'colour' };
	function typeFactor(step) { var n = parseInt(step, 10); return isNaN(n) ? 1 : Math.pow(1.125, n); }
	function typeOk(role, dial, v) {
		if (v === undefined || v === null || TYPE_DIALS[role].indexOf(dial) === -1) return false;
		if (dial === 'font') return typeof v === 'string' && (v === 'body' || v === 'interface' || !!FAMILY[v]);
		if (dial === 'weight') return !!WEIGHT[WEIGHT_ALIAS[v] || v];
		if (dial === 'size') return TYPE_SIZES.indexOf(String(v)) !== -1;
		if (dial === 'categorySize') return v === 'same' || TYPE_SIZES.indexOf(String(v)) !== -1;
		if (dial === 'lineHeight') return !!TYPE_LINE[v];
		if (dial === 'letterSpacing') return !!TYPE_LETTER[v];
		if (dial === 'capitals' || dial === 'italic') return typeof v === 'boolean';
		if (dial === 'align') return ALIGNS.indexOf(v) !== -1;
		if (dial === 'colour') return TYPE_COLOURS.indexOf(v) !== -1;
		return false;
	}
	function typeOf(src) {
		var out = {}, R = src && src.roles;
		if (!R || typeof R !== 'object') return out;
		TYPE_ROLES.forEach(function (r) {
			var o = R[r], k = {};
			if (!o || typeof o !== 'object') return;
			TYPE_DIALS[r].forEach(function (d) { if (typeOk(r, d, o[d])) k[d] = d === 'weight' ? WEIGHT_ALIAS[o[d]] || o[d] : d === 'size' || d === 'categorySize' ? String(o[d]) : o[d]; });
			if (Object.keys(k).length) out[r] = k;
		});
		return out;
	}
	function typeNow() {
		var a = typeOf(byId(current)), b = typeOf(readTweaks()[current]);
		Object.keys(b).forEach(function (r) { a[r] = a[r] || {}; Object.keys(b[r]).forEach(function (d) { a[r][d] = b[r][d]; }); });
		return a;
	}
	function engineValue(dial, v) {
		if (dial === 'font') return v === 'body' ? 'read' : v === 'interface' ? 'ui' : v;
		if (dial === 'size') return typeFactor(v);
		if (dial === 'lineHeight') return TYPE_LINE[v];
		if (dial === 'letterSpacing') return TYPE_LETTER[v];
		if (dial === 'capitals' || dial === 'italic') return !!v;
		if (dial === 'colour') return v === 'text' ? 'ink' : v === 'mutedText' ? 'muted' : v;
		return v;
	}
	function memberRest(role, m, d) {
		if (d === 'factor') return 1;
		if (d === 'weight') return m.weight || ROLE_DEFAULT[role].weight;
		if (d === 'caps') return false;
		if (d === 'tracking' || d === 'leading') return 'default';
		if (d === 'align') return 'default';
		if (d === 'colour') return 'ink';
		return ROLE_DEFAULT[role][d];
	}
	function engineFrom(P, bodyFace) {
		var E = {};
		Object.keys(TYPE_LEADS).forEach(function (er) {
			var pub = P[TYPE_LEADS[er]] || {}, o = {};
			Object.keys(pub).forEach(function (d) {
				var ed = ENGINE_DIAL[d];
				if (er === 'kicker' && d === 'align') return; 
				if (ed !== 'factor' && !(ed in ROLE_DEFAULT[er])) return;
				o[ed] = engineValue(d, pub[d]);
			});
			if (er === 'kicker' && P.title && P.title.align !== undefined) o.align = P.title.align;
			if (er === 'kicker' && pub.categorySize !== undefined && pub.categorySize !== 'same') o.factor = typeFactor(pub.categorySize);
			if (er === 'comment' && bodyFace && o.face === undefined) o.face = 'read';
			if (Object.keys(o).length) E[er] = o;
		});
		TYPE_PARTS.forEach(function (pt) {
			var own = P[pt[0]] || {}, lead = P[TYPE_LEADS[pt[1]]] || {}, m = membersOf(pt[1]).filter(function (x) { return x.id === pt[2]; })[0], mo = {};
			if (!m) return;
			memberDialsOf(pt[1], pt[2]).forEach(function (ed) {
				var key = ed === 'size' ? 'factor' : ed, pd = Object.keys(ENGINE_DIAL).filter(function (k) { return ENGINE_DIAL[k] === key; })[0];
				if (!pd) return;
				if (own[pd] !== undefined) mo[key] = engineValue(pd, own[pd]);
				else if (lead[pd] !== undefined || (key === 'face' && pt[1] === 'comment' && E.comment && E.comment.face !== undefined) || (key === 'align' && pt[1] === 'head' && P.title && P.title.align !== undefined)) mo[key] = memberRest(pt[1], m, key);
			});
			if (Object.keys(mo).length) { E[pt[1]] = E[pt[1]] || {}; (E[pt[1]].members = E[pt[1]].members || {})[pt[2]] = mo; }
		});
		return E;
	}
	function bodyFaceMoved() { var f = realFace('read'); return !!f && f !== 'newsreader' && f !== 'host'; }
	function engineNow() { return engineFrom(typeNow(), bodyFaceMoved()); }
	function engineOf(src) { return engineFrom(typeOf(src), false); }
	var TYPE_REST = { size: '0', categorySize: 'same', lineHeight: 'normal', letterSpacing: 'normal', align: 'default' };
	function typeRest(role, d) { return d === 'colour' ? typeColourRest(role) : TYPE_REST[d]; }
	function typeMerged(s, tw) {
		var a = typeOf(s), b = typeOf(tw), out = {};
		Object.keys(b).forEach(function (r) { a[r] = a[r] || {}; Object.keys(b[r]).forEach(function (d) { a[r][d] = b[r][d]; }); });
		Object.keys(a).forEach(function (r) { var o = {}; Object.keys(a[r]).forEach(function (d) { if (typeRest(r, d) !== a[r][d]) o[d] = a[r][d]; }); if (Object.keys(o).length) out[r] = o; });
		return out;
	}
	function typeTweak(e, s) {
		var t = typeOf(e), own = typeOf(s), out = {};
		Object.keys(t).forEach(function (r) {
			var o = {};
			Object.keys(t[r]).forEach(function (d) {
				var mine = own[r] && own[r][d];
				if (mine !== undefined ? t[r][d] !== mine : typeRest(r, d) !== t[r][d]) o[d] = t[r][d];
			});
			if (Object.keys(o).length) out[r] = o;
		});
		return out;
	}
	
	var ALL_RUNGS = [13, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 44, 48, 56, 64, 72];
	var UI_RUNGS = ALL_RUNGS;
	var ROLE_RUNGS = {};
	['head', 'read', 'quote', 'kicker', 'small', 'comment'].forEach(function (r) { ROLE_RUNGS[r] = ALL_RUNGS; });
	ROLE_RUNGS.head = ALL_RUNGS.concat([80, 96, 112, 128]);
	['ui', 'title'].forEach(function (r) { ROLE_RUNGS[r] = UI_RUNGS; });
	var PERCENTS = { '50': 50, '65': 65, '80': 80, '90': 90, '100': 100, '110': 110, '120': 120, '135': 135, '150': 150, xs: 80, s: 90, m: 100, l: 110, xl: 120 };
	function rungFor(role, v) {
		var rungs = ROLE_RUNGS[role] || ROLE_RUNGS.read;
		if (v === 'text') return String(ROLE_BASE[role] || ROLE_BASE.read); 
		if (rungs.indexOf(+v) !== -1) return String(v);
		if (+v && +v < rungs[0]) return String(rungs[0]); 
		var pct = PERCENTS[v];
		if (!pct) return String(ROLE_BASE[role] || ROLE_BASE.read);
		var want = (ROLE_BASE[role] || ROLE_BASE.read) * pct / 100, best = rungs[0];
		rungs.forEach(function (r) { if (Math.abs(r - want) < Math.abs(best - want)) best = r; });
		return String(best);
	}
	function nearestRung(role, v) {
		var rungs = ROLE_RUNGS[role] || ROLE_RUNGS.read, want = +v, best = rungs[0];
		if (!want) return rungFor(role, v);
		rungs.forEach(function (r) { if (Math.abs(r - want) < Math.abs(best - want)) best = r; });
		return String(best);
	}
	function ownSize(role, v) {
		var rungs = ROLE_RUNGS[role] || ROLE_RUNGS.read, n = Math.round(+v);
		return n >= rungs[0] && n <= rungs[rungs.length - 1] ? String(n) : nearestRung(role, v);
	}
	function sizeFactor(role, v) { return (+v || ROLE_BASE[role]) / (ROLE_BASE[role] || ROLE_BASE.read); }
	function sizesFor(role) { return (ROLE_RUNGS[role] || ROLE_RUNGS.read).map(String); }
	
	var TRACK = { m25: '-0.25em', m22: '-0.225em', m20: '-0.2em', m17: '-0.175em', m15: '-0.15em', m12: '-0.125em', m10: '-0.1em', m7: '-0.075em', m5: '-0.05em', m2: '-0.025em', m1: '-0.0125em', 'default': '0', p1: '0.0125em', p2: '0.025em', p5: '0.05em', p7: '0.075em', p10: '0.1em', p12: '0.125em', p15: '0.15em', p17: '0.175em', p20: '0.2em', p22: '0.225em', p25: '0.25em' }; 
	
	var TRACKING = Object.keys(TRACK);
	var WORDS = { m25: '-0.25em', m22: '-0.225em', m20: '-0.2em', m17: '-0.175em', m15: '-0.15em', m12: '-0.125em', m10: '-0.1em', m7: '-0.075em', m5: '-0.05em', m2: '-0.025em', 'default': 'normal', p2: '0.025em', p5: '0.05em', p7: '0.075em', p10: '0.1em', p12: '0.125em', p15: '0.15em', p17: '0.175em', p20: '0.2em', p22: '0.225em', p25: '0.25em' };
	var LEAD = { solid: 0.56, packed: 0.62, close: 0.69, densest: 0.75, dense: 0.85, tight: 0.92, snug: 0.96, 'default': 1, relaxed: 1.06, airy: 1.1, wider: 1.15, wide: 1.25, open: 1.37, loose: 1.5, loosest: 1.62 };  
	function ownItalic(role) {
		var E = engineNow()[role];
		return !!(E && E.italic !== undefined);
	}
	var SLANT_PART = { read: '.wp-block-post-content p, .entry-content p', head: '.wp-block-post-title, .entry-title, .wp-block-heading', quote: '.wp-block-quote, .wp-block-pullquote', kicker: '.wp-block-post-terms', small: '.wp-block-post-date, .entry-meta, figcaption', comment: '.wp-block-comment-content', ui: '.wp-block-navigation-item__content, .wp-block-site-title' };
	function hostSlant(role) {
		var el = SLANT_PART[role] && document.querySelector(SLANT_PART[role]);
		if (!el) return false;
		var a = 'data-' + role + '-italic', had = root.getAttribute(a);
		if (had !== null) root.removeAttribute(a);
		var it = window.getComputedStyle(el).fontStyle !== 'normal';
		if (had !== null) root.setAttribute(a, had);
		return it;
	}
	function roleOf(role) {
		var E = engineNow()[role] || {}, out = {};
		Object.keys(ROLE_DEFAULT[role]).forEach(function (k) {
			out[k] = ROLE_DEFAULT[role][k];
			if (k !== 'members' && E[k] !== undefined) out[k] = E[k];
		});
		if (FOLLOW_ALIAS[out.face]) out.face = FOLLOW_ALIAS[out.face]; 
		if (membersOf(role).length) out.members = E.members || {}; else delete out.members;
		out.factor = E.factor !== undefined ? E.factor : 1;
		if (role === 'read') out.face = root.getAttribute('data-face') || 'newsreader';
		if (role === 'ui') out.face = sansOf();
		out.weight = fitWeight(out.face, WEIGHT_ALIAS[out.weight] || out.weight);
		out.size = Math.abs(out.factor - 1) > 0.0001 ? String(Math.round((ROLE_BASE[role] || ROLE_BASE.read) * out.factor)) : rungFor(role, out.size); 
		out.tracking = TRACK_ALIAS[out.tracking] || out.tracking; 
		out.words = WORDS_ALIAS[out.words] || out.words;
		if (window.architravePanelGuest && !isLook(current) && !ownItalic(role)) out.italic = hostSlant(role);
		if (!hasItalic(out.face)) out.italic = false;
		if (out.align !== undefined && ALIGNS.indexOf(out.align) === -1) out.align = 'default';
		if (out.colour !== undefined && ROLE_COLOURS.indexOf(out.colour) === -1) out.colour = 'ink';
		return out;
	}
	function applyRoles() {
		var st = root.style;
		ROLES.forEach(function (role) {
			var v = roleOf(role), p = '--' + role + '-', rest = ROLE_DEFAULT[role], s0 = byId(current);
			var hostTw = window.architravePanelGuest && !isLook(current) ? engineOf(readTweaks()[current] || {})[role] || {} : {};
			var styleE = engineOf(s0)[role] || {};
			if (role !== 'read' && role !== 'ui') st.setProperty(p + 'face', faceValue(v.face));
			if (role === 'small') { if (v.face !== rest.face) root.setAttribute('data-small-face-own', ''); else root.removeAttribute('data-small-face-own'); }
			if (v.weight === rest.weight && hostTw.weight === undefined) st.removeProperty(p + 'weight'); else st.setProperty(p + 'weight', String(WEIGHT[v.weight] || 400));
			if (role === 'read' || role === 'ui' || role === 'comment') { if (v.weight === rest.weight) root.removeAttribute('data-' + role + '-weight'); else root.setAttribute('data-' + role + '-weight', v.weight); }
			st.setProperty(p + 'size', String(v.factor));
			if (window.architravePanelGuest) {
				var mine = v.factor / (styleE.factor || 1);
				if (Math.abs(mine - 1) < 0.0001) st.removeProperty(p + 'size-mine'); else st.setProperty(p + 'size-mine', String(mine));
			}
			if (role === 'head') root.removeAttribute('data-head-size'); 
			if (role === 'ui' || role === 'comment') { if (Math.abs(v.factor - 1) < 0.0001) root.removeAttribute('data-' + role + '-size'); else root.setAttribute('data-' + role + '-size', v.size); }
			if (membersOf(role).length) {
				var free = 0;
				membersOf(role).forEach(function (m) {
					var own = (!m.lead && v.members && v.members[m.id]) || {}, any = false;
					memberDialsOf(role, m.id).forEach(function (d) {
						var tok = p + ({ caps: 'case', italic: 'style' }[d] || d) + '-' + m.id, attr = 'data-' + role + '-m-' + m.id + '-' + d, val = null, said = null;
						if (d === 'size' && own.factor !== undefined) { val = String(own.factor); said = String(Math.round(m.rest * own.factor)); }
						else if (own[d] !== undefined) {
							if (d === 'size') val = String((+own.size || m.rest) / m.rest);
							else if (d === 'weight') val = String(WEIGHT[fitWeight(own.face || v.face, own.weight)] || WEIGHT[own.weight] || 400);
							else if (d === 'caps') val = own.caps ? 'uppercase' : 'none';
							else if (d === 'align') val = ALIGN[own.align] || 'start';
							else if (d === 'face') { val = faceValue(own.face); said = own.face; }
							else if (d === 'italic') { val = own.italic && hasItalic(own.face || v.face) ? 'italic' : 'normal'; said = own.italic ? 'on' : 'off'; }
							else if (d === 'leading') { val = String(LEAD[own.leading] || 1); said = own.leading; }
							else if (d === 'colour') { val = own.colour === 'accent' ? 'var(--accent)' : own.colour === 'own' ? 'var(--headings-own-colour, var(--accent))' : own.colour === 'muted' ? 'var(--ldp-muted, var(--text-muted, color-mix(in oklab, currentColor 62%, transparent)))' : 'var(--text-primary)'; said = own.colour; }
							else val = TRACK[own.tracking] || '0';
						}
						if (val === null) { st.removeProperty(tok); root.removeAttribute(attr); } else { any = true; st.setProperty(tok, val); root.setAttribute(attr, said !== null ? said : d === 'size' ? own.size : d === 'align' ? own.align : String(val)); }
					});
					if (any) free++;
				});
				if (free) root.setAttribute('data-' + role + '-members', String(free)); else root.removeAttribute('data-' + role + '-members');
			} 
			if (v.tracking === rest.tracking && hostTw.tracking === undefined) st.removeProperty(p + 'tracking'); else st.setProperty(p + 'tracking', TRACK[v.tracking] || '0');
			if (v.words === rest.words && hostTw.words === undefined) st.removeProperty(p + 'words'); else st.setProperty(p + 'words', WORDS[v.words] || 'normal');
			st.setProperty(p + 'case', v.caps ? 'uppercase' : 'none');
			if (rest.colour !== undefined) { if (v.colour === rest.colour) { st.removeProperty(p + 'colour'); root.removeAttribute('data-' + role + '-colour'); } else { st.setProperty(p + 'colour', v.colour === 'accent' ? 'var(--accent)' : v.colour === 'muted' ? 'var(--ldp-muted, var(--text-muted, color-mix(in oklab, currentColor 62%, transparent)))' : 'var(--' + role + '-own-colour, var(--accent))'); root.setAttribute('data-' + role + '-colour', v.colour); } }
			if (rest.align !== undefined) { if (v.align === rest.align) { st.removeProperty(p + 'align'); root.removeAttribute('data-' + role + '-align'); } else { st.setProperty(p + 'align', ALIGN[v.align]); root.setAttribute('data-' + role + '-align', v.align); } }
			
			if (role === 'quote' && !hasItalic(v.face)) st.setProperty(p + 'style', 'normal');
			else if (role === 'quote' && v.italic === rest.italic && styleE.italic === undefined) st.removeProperty(p + 'style'); 
			else if (v.italic) st.setProperty(p + 'style', 'italic');
			else if (role === 'quote') st.setProperty(p + 'style', 'normal');
			else st.removeProperty(p + 'style');
			if (role !== 'read') { if (v.leading === rest.leading || !LEAD[v.leading]) { st.removeProperty(p + 'leading'); root.removeAttribute('data-' + role + '-leading'); } else { st.setProperty(p + 'leading', String(LEAD[v.leading])); root.setAttribute('data-' + role + '-leading', v.leading); } }
			if (role === 'read') { st.setProperty('--reading-tracking', TRACK[v.tracking] || '0'); st.setProperty('--reading-word-gap', WORDS[v.words] || 'normal'); }
			if (window.architravePanelGuest) {
				var look = isLook(current);
				if (look) st.setProperty(p + 'weight', String(WEIGHT[v.weight] || 400));
				var readChosen = root.hasAttribute('data-face'), uiChosen = (root.getAttribute('data-sans') || 'inter') !== 'inter';
				if (!look && isAnchor(v.face) && !(v.face === 'read' ? readChosen : uiChosen)) {
					var hostRec = byId('host');
					if (hostRec && hostRec.hostFace) st.setProperty(p + 'face', hostRec.hostFace);
				}
				var picked = {
					face: role === 'read' ? (root.getAttribute('data-face') || rest.face) !== rest.face
						: role === 'ui' ? v.face !== rest.face
						: look || v.face !== rest.face || (v.face === 'read' && readChosen) || (v.face === 'ui' && uiChosen),
					weight: v.weight !== rest.weight || look || hostTw.weight !== undefined,
					tracking: v.tracking !== rest.tracking || hostTw.tracking !== undefined,
					words: v.words !== rest.words || hostTw.words !== undefined,
					size: Math.abs(v.factor - 1) > 0.0001 || hostTw.factor !== undefined,
					caps: !!v.caps,
					italic: look ? (v.italic !== rest.italic || v.italic) : ownItalic(role) 
				};
				Object.keys(picked).forEach(function (d) {
					if (picked[d]) root.setAttribute('data-' + role + '-' + d, String(v[d] === true ? 'on' : v[d]));
					else root.removeAttribute('data-' + role + '-' + d);
				});
			}
		});
		applyTypeExtras();
	}
	function applyTypeExtras() {
		var st = root.style, c = typeNow().code || {}, meta = typeNow().meta || {};
		var put = function (d, tok, val, said) { if (val === null) { st.removeProperty('--code-' + tok); root.removeAttribute('data-code-' + d); } else { st.setProperty('--code-' + tok, val); root.setAttribute('data-code-' + d, said); } };
		var f = c.font !== undefined ? engineValue('font', c.font) : null;
		put('face', 'face', f ? faceValue(f) : null, c.font);
		put('size', 'size', c.size !== undefined && c.size !== '0' ? String(typeFactor(c.size)) : null, c.size);
		put('weight', 'weight', c.weight !== undefined ? String(WEIGHT[fitWeight(f || 'mono', c.weight)] || 400) : null, c.weight);
		put('leading', 'leading', c.lineHeight !== undefined && c.lineHeight !== 'normal' ? String(LEAD[TYPE_LINE[c.lineHeight]]) : null, c.lineHeight);
		put('tracking', 'tracking', c.letterSpacing !== undefined && c.letterSpacing !== 'normal' ? TRACK[TYPE_LETTER[c.letterSpacing]] : null, c.letterSpacing);
		put('caps', 'case', c.capitals ? 'uppercase' : null, 'on');
		put('italic', 'style', c.italic !== undefined ? (c.italic && (!f || hasItalic(f)) ? 'italic' : 'normal') : null, c.italic ? 'on' : 'off');
		var colourOf = function (v, own) { return v === 'accent' ? 'var(--accent)' : v === 'mutedText' ? 'var(--ldp-muted, var(--text-muted, color-mix(in oklab, currentColor 62%, transparent)))' : v === 'own' ? 'var(--' + own + '-own-colour, var(--accent))' : 'var(--text-primary)'; };
		if (meta.colour && meta.colour !== 'mutedText') { st.setProperty('--small-colour', colourOf(meta.colour, 'kicker')); root.setAttribute('data-small-colour', meta.colour); }
		else { st.removeProperty('--small-colour'); root.removeAttribute('data-small-colour'); }
		['body', 'quote', 'interface', 'code'].forEach(function (r) {
			var v = (typeNow()[r] || {}).colour;
			if (v && v !== typeColourRest(r)) { st.setProperty('--' + r + '-colour', colourOf(v, r)); root.setAttribute('data-' + r + '-colour', v); }
			else { st.removeProperty('--' + r + '-colour'); root.removeAttribute('data-' + r + '-colour'); }
		});
	}
	function trackingOf() { return roleOf('read').tracking; }
	function applyTracking() { applyRoles(); }
	
	 
	function picturesOf() {
		var pf = layoutOf('pictureFilter'); return FILTER_ENGINE[pf] || pf; 
		var s = byId(current), tw = readTweaks()[current];
		if (tw && PICTURES.indexOf(tw.pictures) !== -1) return tw.pictures;
		return (s && s.pictures) || PICTURES[0];
	}
	
	function capLinesOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && CAP_LINES.indexOf(tw.capLines) !== -1) return tw.capLines;
		return (s && s.capLines) || CAP_LINES[0];
	}
	function applyCapLines() {
		var v = capLinesOf(), was = root.getAttribute('data-dropcap-lines') || CAP_LINES[0];
		if (v === CAP_LINES[0]) root.removeAttribute('data-dropcap-lines'); else if (root.getAttribute('data-dropcap-lines') !== v) root.setAttribute('data-dropcap-lines', v);
		if (was !== v) nextFrame(redrawInitials);
	}
	function redrawInitials() {
		var ps = Array.prototype.slice.call(document.querySelectorAll('.wp-block-post-content > p:first-of-type, .wp-block-post-excerpt > p:first-of-type')), was = ps.map(function (p) { return p.style.display; });
		if (!ps.length) return;
		ps.forEach(function (p) { p.style.display = 'none'; });
		void ps[0].offsetHeight;
		ps.forEach(function (p, i) { p.style.display = was[i]; });
	}
	
	var LEVEL_CSS = {
		line: function (v) { return v + '%'; },
		
		softlevel: function (v) { return v + '%'; }, 
		quietlevel: function (v) { return v + '%'; },
		smallsoft: function (v) { return v + '%'; },
		measure: function (v) { return String(Math.round(+v / 72 * 1000) / 1000); },
		space: function (v) { return { xcompact: '0.5', compact: '0.7', spacious: '1.4', xspacious: '1.8' }[v]; }, 
		framewidth: function (v) { return v + 'px'; },
		spaceInside: function (v) { return v + 'px'; }, spaceItems: function (v) { return v + 'px'; }, spaceSections: function (v) { return v + 'px'; }, spaceTitle: function (v) { return v + 'px'; },
	};
	Object.keys(LEVEL_CSS).forEach(function (k) { if (LEVELS[k]) LEVELS[k].css = LEVEL_CSS[k]; }); 
	function levelRest(k) {
		var L = LEVELS[k], s = byId(current), b = s && byId(baseOf(s));
		if (s && L.stops.indexOf(s[k]) !== -1) return s[k];
		if (b && L.stops.indexOf(b[k]) !== -1) return b[k];
		return L.rest;
	}
	function levelOf(k) {
		var L = LEVELS[k], tw = readTweaks()[current];
		if (!L) return ''; 
		if (k === 'measure') return layoutOf('lineLength');
		if (k === 'line') return layoutOf('borderStrength');
		if (k === 'framewidth') return layoutOf('frameWidth');
		if (k === 'fill') return L.rest; 
		if (tw && L.stops.indexOf(tw[k]) !== -1) return tw[k];
		return levelRest(k);
	}
	function applyLevels() {
		Object.keys(LEVELS).forEach(function (k) {
			var L = LEVELS[k], v = levelOf(k);
			if (L.steps) {
				var names = ['--step-surface-hover', '--step-surface-selected', '--step-surface-pressed'];
				names.forEach(function (nm) { root.style.removeProperty(nm); });
				root.style.removeProperty('--fill-factor'); 
				if (v === L.rest) { root.removeAttribute(L.attr); return; }
				if (root.getAttribute(L.attr) !== v) root.setAttribute(L.attr, v);
				root.style.setProperty('--fill-factor', String(+v / 100));
				var cs = getComputedStyle(root);
				names.forEach(function (nm) { var own = parseFloat(cs.getPropertyValue(nm)); if (own > 0) root.style.setProperty(nm, (Math.round(own * +v) / 100) + '%'); });
				return;
			}
			if (v === L.rest) { root.removeAttribute(L.attr); root.style.removeProperty(L.prop); }
			else { if (root.getAttribute(L.attr) !== v) root.setAttribute(L.attr, v); root.style.setProperty(L.prop, L.css(v)); }
		});
	}
	
	function lineStyleOf() {
		return layoutOf('borderStyle'); 
		var s = byId(current), tw = readTweaks()[current];
		if (tw && LINE_STYLE.indexOf(tw.linestyle) !== -1) return tw.linestyle;
		return (s && LINE_STYLE.indexOf(s.linestyle) !== -1) ? s.linestyle : LINE_STYLE[0];
	}
	  
	function cornersOf() {
		var rv = layoutOf('radius'); return rv === 'none' ? CORNERS[0] : rv; 
		var s = byId(current), tw = readTweaks()[current];
		if (tw && CORNERS.indexOf(tw.corners) !== -1) return tw.corners;
		return (s && CORNERS.indexOf(s.corners) !== -1) ? s.corners : CORNERS[0];
	}
	
	function fadeEdgesOf() {
		var fe = layoutOf('pictureFade'); return fe === 'none' ? FADE_EDGES[0] : fe; 
		var s = byId(current), tw = readTweaks()[current];
		if (tw && FADE_EDGES.indexOf(tw.fadeedges) !== -1) return tw.fadeedges;
		return (s && FADE_EDGES.indexOf(s.fadeedges) !== -1) ? s.fadeedges : FADE_EDGES[0];
	}
	 
	function highlightNow() { var c = coloursOf(null, true); return c.light.marker || c.dark.marker || ''; }
	function markerColourOf() { var h = highlightNow(); return h ? (penOf(h) || 'own') : MARKERS[0]; }
	
	function framePatternOf() {
		var fp = layoutOf('pictureFrame'); return fp === 'none' ? FRAME_PATTERNS[0] : fp; 
		var s = byId(current), tw = readTweaks()[current];
		if (tw && FRAME_PATTERNS.indexOf(tw.framepattern) !== -1) return tw.framepattern;
		return (s && FRAME_PATTERNS.indexOf(s.framepattern) !== -1) ? s.framepattern : FRAME_PATTERNS[0];
	}
	function applyFramePattern() { var v = framePatternOf(); if (v === FRAME_PATTERNS[0]) root.removeAttribute('data-frame-pattern'); else if (root.getAttribute('data-frame-pattern') !== v) root.setAttribute('data-frame-pattern', v); }
	
	function buttonOf() {
		var bc = layoutOf('buttonColour'); if (bc === 'accent') { var cs = coloursOf(); if (cs.light.button || cs.dark.button) bc = 'own'; } return bc === 'text' ? 'ink' : bc; 
		var s = byId(current), tw = readTweaks()[current];
		if (tw && BUTTONS.indexOf(tw.button) !== -1) return tw.button;
		return (s && BUTTONS.indexOf(s.button) !== -1) ? s.button : BUTTONS[0];
	}
	
	
	function followers() {
		var s = byId(current), b = s && byId(baseOf(s)), tw = readTweaks()[current] || {};
		return []; 
	}
	function pickRest(key) { return key === 'links' && optionOn('soft') ? 'underlined' : key === 'quotes' && !GUEST ? 'sideLine' : PICKS[key].list[0]; } 
	function pickOf(key) {
		if (key === 'fullpicture') return layoutOf('pictureWidth') === 'full' ? 'on' : 'off';
		if (key === 'widefigures') return layoutOf('figureWidth') === 'wide' ? 'on' : 'off';
		if (key === 'linewidth') { var bw = layoutOf('borderWidth'); return /^[0-9]$/.test(bw) ? bw : '1'; }
		if (key === 'pictureshadow') return layoutOf('pictureShadow') === 'soft' ? 'soft' : 'off';
		if (key === 'piccorners') return layoutOf('pictureCorners') === 'square' ? 'square' : 'cards';
		if (RENAMED_PICK[key]) { var rv = layoutOf(RENAMED_PICK[key]); return key === 'buttonshape' && rv === 'match' ? 'cards' : rv; }
		var d = PICKS[key], s = byId(current), tw = readTweaks()[current];
		if (tw && d.list.indexOf(tw[key]) !== -1) return tw[key];
		return (s && d.list.indexOf(s[key]) !== -1) ? s[key] : pickRest(key);
	}
	function applyPicks() { Object.keys(PICKS).forEach(function (k) { var d = PICKS[k], v = pickOf(k), e = SURFACE_ENGINE[k] && SURFACE_ENGINE[k][v] ? SURFACE_ENGINE[k][v] : v; if (v === (k === 'quotes' ? pickRest(k) : d.list[0])) root.removeAttribute(d.attr); else if (root.getAttribute(d.attr) !== e) root.setAttribute(d.attr, e); }); } 
	function effectsOf(s, tw) {
		var out = {};
		Object.keys(EFFECTS).forEach(function (fid) {
			var o = {};
			[s && s.effects && s.effects[fid], tw && tw.effects && tw.effects[fid]].forEach(function (src) {
				if (!src || typeof src !== 'object') return;
				Object.keys(src).forEach(function (d) { if (EFFECTS[fid][d] && EFFECTS[fid][d].list.indexOf(src[d]) !== -1) o[d] = src[d]; });
			});
			Object.keys(o).forEach(function (d) { if (o[d] === EFFECTS[fid][d].rest) delete o[d]; });
			if (Object.keys(o).length) out[fid] = o;
		});
		return out;
	}
	function effectOf(fid) {
		var e = (effectsOf(byId(current), readTweaks()[current] || {})[fid]) || {}, out = {};
		Object.keys(EFFECTS[fid] || {}).forEach(function (d) { out[d] = e[d] !== undefined ? e[d] : EFFECTS[fid][d].rest; });
		return out;
	}
	function applyEffects() {
		var e = effectsOf(byId(current), readTweaks()[current] || {});
		Object.keys(EFFECTS).forEach(function (fid) {
			Object.keys(EFFECTS[fid]).forEach(function (d) {
				var a = 'data-fx-' + fid + '-' + d, v = e[fid] && e[fid][d];
				if (v === undefined) root.removeAttribute(a); else if (root.getAttribute(a) !== v) root.setAttribute(a, v);
			});
		});
	}
	
	var frameJobs = [], frameAsk = 0, frameSeq = 0;
	function nextFrame(job) {
		if (frameJobs.indexOf(job) === -1) frameJobs.push(job);
		if (frameAsk) return;
		var ask = frameAsk = ++frameSeq, run = function () { if (frameAsk !== ask) return; frameAsk = 0; var jobs = frameJobs; frameJobs = []; jobs.forEach(function (f) { try { f(); } catch (e) {  } }); };
		if (window.requestAnimationFrame) window.requestAnimationFrame(run);
		setTimeout(run, 250);
	}
	function applyButton() { var v = buttonOf(); if (v === BUTTONS[0]) root.removeAttribute('data-button'); else if (root.getAttribute('data-button') !== v) root.setAttribute('data-button', v); }
	function applyMarkerColour() { var v = markerColourOf(); if (v === MARKERS[0]) root.removeAttribute('data-marker-colour'); else if (root.getAttribute('data-marker-colour') !== v) root.setAttribute('data-marker-colour', v); }
	function applyFadeEdges() { var v = fadeEdgesOf(); if (v === FADE_EDGES[0]) root.removeAttribute('data-fade-edges'); else if (root.getAttribute('data-fade-edges') !== v) root.setAttribute('data-fade-edges', v); }
	function applyCorners() { var v = cornersOf(); if (v === CORNERS[0]) root.removeAttribute('data-corners'); else if (root.getAttribute('data-corners') !== v) root.setAttribute('data-corners', v); }
	function applyLineStyle() { var v = lineStyleOf(); if (v === LINE_STYLE[0]) root.removeAttribute('data-line-style'); else if (root.getAttribute('data-line-style') !== v) root.setAttribute('data-line-style', v); }
	function applyPictures() { var v = picturesOf(); if (v === PICTURES[0]) root.removeAttribute('data-pictures'); else if (root.getAttribute('data-pictures') !== v) root.setAttribute('data-pictures', v); }
	function scopeOf() {
		return 'all';
	}
	function applyScope() { var v = scopeOf(); if (root.getAttribute('data-scope') !== v) root.setAttribute('data-scope', v); }
	function byId(id) {
		return STYLES.filter(function (s) { return s.id === id; })[0];
	}
	
	var linked = null; 
	var PREVIEW_LINK = null; 
	(function () {
		var q = window.location.search, h = window.location.hash, m, data;
		if ((m = /[?&]style=([^&]+)/.exec(q))) {
			var id = decodeURIComponent(m[1]);
			if (byId(id) && id !== 'standard') linked = byId(id);
			else if (id === 'standard' && (DEFAULT === 'standard' || DEFAULT === 'host')) linked = byId('standard') || STYLES[0];
		} else if ((m = /^#style=(.+)$/.exec(h)) && (data = decodeRecord(m[1]))) {
			linked = ownFromRecord(data);
		}
		var pv = window.architraveSiteStyles && window.architraveSiteStyles.preview;
		if (pv) {
			PREVIEW_LINK = pv;
			try {
				var held = {}; for (var li = 0; li < localStorage.length; li++) { var lk = localStorage.key(li); held[lk] = localStorage.getItem(lk); }
				window.addEventListener('pagehide', function () { try { localStorage.clear(); Object.keys(held).forEach(function (k) { localStorage.setItem(k, held[k]); }); } catch (e) {  } });
			} catch (e) {  }
			if (pv.id && byId(pv.id)) linked = byId(pv.id);
			root.setAttribute('data-ldp-preview', pv.ended ? 'ended' : 'on');
			var bar = function () {
				if (!document.body || document.querySelector('.ldp-preview-bar')) return;
				var b = document.createElement('div'), W = window.architraveWords || {}, w = function (x) { return W[x] || x; };
				b.className = 'ldp-preview-bar'; b.setAttribute('role', 'status');
				if (pv.ended) b.textContent = w('This preview link has ended.');
				else { var until = new Date(pv.until * 1000), strong = document.createElement('b'); strong.textContent = pv.name; b.appendChild(document.createTextNode(w('Preview of') + ' ')); b.appendChild(strong); b.appendChild(document.createTextNode(' · ' + w('Ends') + ' ' + until.toLocaleDateString('en', { day: 'numeric', month: 'long' }) )); }
				document.body.appendChild(b);
			};
			if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bar); else bar();
		}
		if (linked && window.history && history.replaceState) {
			try { history.replaceState(null, '', window.location.pathname + q.replace(/([?&])style=[^&]*(&|$)/, function (a, b, c) { return c ? b : ''; }) + (/^#style=/.test(h) ? '' : h)); } catch (e) {  }
		}
	})();
	var HOST = window.architravePanelHostStyle || null;
	if (HOST) {
		STYLES.unshift({ id: 'host', label: HOST.label, host: true, palette: 'neutral', tint: 'default', sans: 'inter', reading: 'default', face: 'host', leading: 'default', justify: false, dropcap: false, rounded: true, lines: false, bold: false, scope: 'all', fills: true, roles: {} });
		if (DEFAULT !== 'host') { var dRec = byId(DEFAULT); STYLES.splice(STYLES.indexOf(dRec), 1); STYLES.unshift(dRec); } 
		document.addEventListener('DOMContentLoaded', function () { still(function () { 
			var rec = byId('host'), had = root.hasAttribute('data-chosen'), hadC = root.getAttribute('data-colours'), hadT = root.getAttribute('data-theme');
			if (!rec) return;
			if (had) root.removeAttribute('data-chosen');
			if (hadC !== null) root.removeAttribute('data-colours'); 
			var bodyT = document.body.style.getPropertyValue('transition'), bodyP = document.body.style.getPropertyPriority('transition');
			document.body.style.setProperty('transition', 'none', 'important');
			var read = function (side) {
				root.setAttribute('data-theme', 'neutral-' + side);
				var cs = window.getComputedStyle(document.body), paper = cs.backgroundColor;
				if (!paper || /rgba\(0, 0, 0, 0\)|transparent/.test(paper)) paper = '#ffffff';
				
				var lumIn = function (c2) { var v2 = (String(c2).match(/[\d.]+/g) || []).map(Number); return v2.length >= 3 ? 0.2126 * v2[0] + 0.7152 * v2[1] + 0.0722 * v2[2] : null; };
				var paperLum = lumIn(paper), accent = '';
				var links = document.querySelectorAll('.wp-block-post-content a, .entry-content a, main a, article a');
				for (var li = 0; li < links.length && li < 60; li++) {
					var a1 = links[li];
					if (a1.closest('.wp-block-button, .wp-block-buttons, button, .wp-block-social-links, .reading-panel, .architrave-panel-opener')) continue;
					var c1 = window.getComputedStyle(a1).color, l1 = lumIn(c1);
					if (l1 === null || paperLum === null || Math.abs(l1 - paperLum) < 40) continue;
					accent = c1; break;
				}
				return { paper: paper, ink: cs.color, accent: accent && accent !== cs.color ? accent : cs.color };
			};
			var light = read('light'), dark = read('dark'), face = window.getComputedStyle(document.body).fontFamily;
			var own = window.architravePanelHostSide, other = own === 'dark' ? 'light' : 'dark';
			if (own && window.architravePanelGuest) {
				var bands = Array.prototype.slice.call(document.querySelectorAll('header, footer, nav, main, aside, [id*="header"], [id*="footer"], [id*="masthead"], [class*="site-header"], [class*="site-footer"]'), 0, 120)
					.filter(function (e) { return !e.closest('.reading-panel, .architrave-panel-opener, #wpadminbar'); });
				var bgOf = function () { return bands.map(function (e) { return window.getComputedStyle(e).backgroundColor; }); };
				var lum = function (c) { var v = (String(c).match(/[\d.]+/g) || []).map(Number); return v.length >= 3 && (v[3] === undefined || v[3] > 0.5) ? 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2] : null; };
				root.setAttribute('data-theme', 'neutral-' + own); var ownBg = bgOf();
				root.setAttribute('data-theme', 'neutral-' + other); var otherBg = bgOf();
				var pageLum = lum((own === 'light' ? light : dark).paper);
				bands.forEach(function (e, i) {
					var l = lum(ownBg[i]);
					if (l === null || pageLum === null || ownBg[i] !== otherBg[i]) return;
					var same = Math.abs(l - pageLum) < 2, beyond = own === 'light' ? l > pageLum + 2 : l < pageLum - 2;
					if (same) e.setAttribute('data-ldp-paper', ''); else if (beyond) e.setAttribute('data-ldp-raised', '');
				});
			}
			if (hadT !== null) root.setAttribute('data-theme', hadT); else root.removeAttribute('data-theme');
			if (bodyT) document.body.style.setProperty('transition', bodyT, bodyP); else document.body.style.removeProperty('transition');
			if (had) root.setAttribute('data-chosen', '');
			if (hadC !== null) root.setAttribute('data-colours', hadC);
			var hexOf = function (c) {
				if (!c || /^#[0-9a-f]{6}$/i.test(c)) return c;
				try { var cv = document.createElement('canvas'); cv.width = cv.height = 1; var cx = cv.getContext('2d'); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); var px = cx.getImageData(0, 0, 1, 1).data; return '#' + [px[0], px[1], px[2]].map(function (n) { return (n < 16 ? '0' : '') + n.toString(16); }).join(''); } catch (e) { return c; }
			};
			[light, dark].forEach(function (sd) { Object.keys(sd).forEach(function (k) { sd[k] = hexOf(sd[k]); }); });
			rec.colours = { light: light, dark: dark };
			rec.hostFace = face;
			var ch = /^#[0-9a-f]{6}$/i.test(light.paper || '') ? [1, 3, 5].map(function (i) { return parseInt(light.paper.substr(i, 2), 16); }) : [255, 255, 255];
			rec.hostSide = window.architravePanelHostSide || ((0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]) < 128 ? 'dark' : 'light');
		}); });
	}
	function isLook(id) { var s = byId(id); return id !== 'host' && !(s && s.bare); }
	function markChosen() {
		if (!HOST) return;
		if (isLook(current)) root.setAttribute('data-chosen', '');
		else root.removeAttribute('data-chosen');
		if (isLook(current) && typeof current === 'string') root.setAttribute('data-look', current);
		else root.removeAttribute('data-look');
	}
	
	var KEEP_HOME = ['quire-side', 'architrave-opener-spot', HIDDEN_KEY, 'architrave-versions', 'architrave-panel-anchor', 'architrave-panel-place', 'architrave-panel-glow', 'architrave-panel-goo', 'architrave-goo', 'architrave-button-settings', 'architrave-door-ghosts', 'architrave-font-files-css', 'architrave-font-fetch-busy'];
	function goHome() {
		var kill = [];
		try {
			for (var i = 0; i < localStorage.length; i++) {
				var k = localStorage.key(i);
				if (/^(architrave|quire)-/.test(k || '') && k !== OWN_KEY && k !== TWEAKS_KEY && KEEP_HOME.indexOf(k) === -1) kill.push(k);
			}
			kill.forEach(function (k) { localStorage.removeItem(k); });
			var all = readTweaks(); 
			if (all.host) { delete all.host; writeTweaks(all); }
		} catch (e) {  }
		var h = byId('host');
		if (!h) { location.reload(); return; }
		applyNow(h, { palette: wanted(h).palette, reading: wanted(h).reading, face: wanted(h).face, leading: wanted(h).leading, colours: null });
		root.removeAttribute('data-colours');
		root.removeAttribute('data-chosen');
		root.removeAttribute('data-look');
		if (wanted(h).face === 'host') {
			root.removeAttribute('data-face');
			try { localStorage.removeItem('architrave-face'); } catch (e) {  }
		}
		applyRoles();
		mark();
	}
	var stored = null;
	try { stored = localStorage.getItem(KEY); } catch (e) { stored = null; }
	
	var current = linked ? linked.id : (byId(stored) && !(stored === 'standard' && !GUEST && DEFAULT !== 'standard' && !offered(byId('standard'))) ? stored : DEFAULT); 
	function stamp(id) {
		current = id;
		if (id === 'standard' || id === 'host') root.removeAttribute(ATTR); 
		else root.setAttribute(ATTR, id);
		try {
			if (PREVIEW_LINK) {  }
			else if (id === 'host' && DEFAULT === 'host') localStorage.removeItem(KEY); 
			else localStorage.setItem(KEY, id);
		} catch (e) {  }
		markChosen(); 
	}
	stamp(current);
	var seeded = false;
	if (linked || (current !== stored && current === DEFAULT && DEFAULT !== NONE)) {
		var w0 = wanted(byId(current));
		try {
			var sideNow = String(root.getAttribute('data-theme') || (Modes ? Modes.default : '')).split('-')[1] || 'light';
			if (Modes && Modes.apply) Modes.apply(w0.palette, root, sideNow);
			if (window.QuireReading && window.QuireReading.apply) window.QuireReading.apply(w0.reading, root);
			if (w0.face && w0.face !== 'newsreader') root.setAttribute('data-face', w0.face); else root.removeAttribute('data-face');
			if (w0.leading && w0.leading !== 'default') root.setAttribute('data-leading', w0.leading); else root.removeAttribute('data-leading');
		} catch (e) {  }
		seeded = true;
	}
	
	
	var OPT_ON = { pictureframe: true };
	function restOf(k) {
		var s = byId(current);
		if (s && typeof s[k] === 'boolean') return s[k];
		return !!OPT_ON[k];
	}
	function optionOn(k) {
		if (k === 'soft') return false; 
		if (k === 'marker') return !!highlightNow();
		if (k === 'darkground') { var gs = groundSides(); return gs.light || gs.dark; }
		if (k === 'widehead') return layoutOf('titleWidth') === 'wide';
		if (k === 'rounded') return layoutOf('radius') !== 'none';
		if (k === 'lines') return layoutOf('borderWidth') !== 'none';
		if (k === 'hairlines') return layoutOf('borderWidth') === 'hairline';
		if (k === 'fills') return true; 
		if (k === 'tagsfollow') return layoutOf('tagsMatchButtons') === true;
		if (k === 'picturehover') return layoutOf('colourOnHover') === true;
		if (k === 'picturedim') return layoutOf('dimInDark') === true;
		if (k === 'pictureframe') return layoutOf('pictureFrame') !== 'none';
		if (k === 'picturefade') return layoutOf('pictureFade') !== 'none';
		if (k === 'widepicture') return layoutOf('pictureWidth') !== 'content';
		var tw = readTweaks()[current];
		if (tw && typeof tw[k] === 'boolean') return tw[k];
		return restOf(k);
	}
	function applyOptions() {
		var wasCap = root.getAttribute('data-dropcap');
		function stampAttr(name, value) { if (root.getAttribute(name) !== value) root.setAttribute(name, value); }
		OPTS.concat(['darkground', 'soft', 'marker'].filter(function (k) { return OPTS.indexOf(k) === -1; })).forEach(function (k) { stampAttr('data-' + k, optionOn(k) ? 'on' : 'off'); }); 
		applyColourStamps();
		(function () { var st = byId(current), b = st && byId(baseOf(st)); stampAttr('data-reading-base', (st && st.reading) || (b && b.reading) || 'default'); })();
		stampAttr('data-hyphens', optionOn('justify') ? 'on' : 'off');
		if (wasCap !== null && wasCap !== root.getAttribute('data-dropcap')) nextFrame(redrawInitials); 
		try { localStorage.removeItem('architrave-justify'); localStorage.removeItem('architrave-hyphens'); } catch (e) {  }
	}
	
	var ACCENT_KEY = 'architrave-accent';
	function accentOn() {
		try { return localStorage.getItem(ACCENT_KEY) !== 'off'; } catch (e) { return true; }
	}
	function applyAccent() {
		if (accentOn()) root.removeAttribute('data-accent'); else root.setAttribute('data-accent', 'off');
		try { localStorage.removeItem('architrave-links'); } catch (e) {  }
	}
	
	var TWEAK_KEYS = DIALS.concat(OPTS, ['pictureFilter', 'colourOnHover', 'dimInDark', 'pictureFrame', 'frameWidth', 'pictureFade', 'pictureShadow', 'pictureCorners', 'buttonColour', 'buttonShape', 'primaryButton', 'secondaryButton', 'tertiaryButton', 'tagsMatchButtons', 'currentItem', 'lineLength', 'titleWidth', 'pictureWidth', 'figureWidth', 'radius', 'borderWidth', 'borderStyle', 'borderStrength', 'tint', 'sans', 'scope', 'roles', 'colours', 'pictures', 'capLines', 'line', 'fill', 'softlevel', 'quietlevel', 'smallsoft', 'measure', 'space', 'spaceInside', 'spaceItems', 'spaceSections', 'spaceTitle', 'framewidth', 'linestyle', 'corners', 'fadeedges', 'markercolour', 'framepattern', 'button', 'buttonshape', 'buttonstyle', 'buttonmedium', 'buttonquiet', 'tags', 'chosenitem', 'linewidth', 'cards', 'quotes', 'notes', 'fields', 'paragraphs', 'capface', 'hyphenate', 'piccorners', 'pictureshadow', 'pictureEdge', 'opening', 'widefigures', 'fullpicture', 'categories', 'links', 'preset', 'was', 'effects']).filter(function (k) { return k === 'palette' || inRecord(k); });
	function cleanTweaks(all) {
		var out = {};
		Object.keys(all || {}).forEach(function (id) {
			var e = all[id], s = byId(id), clean = {};
			if (!s || !e || typeof e !== 'object') return;
			liftCentre(e, s);
			TWEAK_KEYS.forEach(function (k) { if (k !== 'roles' && k !== 'colours' && k !== 'effects' && e[k] !== undefined) clean[k] = e[k]; });
			
			if (e.colours && typeof e.colours === 'object') {
				var colours = {};
				['light', 'dark'].forEach(function (side) {
					var c0 = e.colours[side]; if (!c0 || typeof c0 !== 'object') return;
					var keptC = {}, c = {}, sc = s.colours && s.colours[side];
					Object.keys(c0).forEach(function (k) { c[colourKey(k)] = c0[k]; }); 
					var own = function (k) { return sc && (sc[k] !== undefined ? sc[k] : sc[COLOUR_ENGINE[k]]); };
					WELL_KEYS.forEach(function (k) { 
						var v = c[k];
						if (v === '' && own(k)) { keptC[k] = ''; return; }
						if (typeof v !== 'string' || !/^#[0-9a-f]{6}$/i.test(v)) return;
						var rest = own(k);
						if (String(v).toLowerCase() !== String(rest || '').toLowerCase()) keptC[k] = v.toLowerCase();
					});
					if (Object.keys(keptC).length) colours[side] = keptC;
				});
				if (Object.keys(colours).length) clean.colours = colours;
			}
			if (e.roles && typeof e.roles === 'object') {
				var roles = typeTweak(e, s);
				if (Object.keys(roles).length) { clean.roles = roles; clean.architrave = 3; }
			}
			if (e.effects && typeof e.effects === 'object') {
				var fx = {};
				Object.keys(EFFECTS).forEach(function (fid) {
					var r = e.effects[fid]; if (!r || typeof r !== 'object') return;
					var kept = {};
					Object.keys(EFFECTS[fid]).forEach(function (d) {
						var v = r[d]; if (EFFECTS[fid][d].list.indexOf(v) === -1) return;
						var own = s.effects && s.effects[fid] && s.effects[fid][d];
						if (v !== (own !== undefined ? own : EFFECTS[fid][d].rest)) kept[d] = v;
					});
					if (Object.keys(kept).length) fx[fid] = kept;
				});
				if (Object.keys(fx).length) clean.effects = fx;
			}
			if (Object.keys(clean).length) out[id] = clean;
		});
		return out;
	}
	function readTweaks() {
		try { return cleanTweaks(JSON.parse(localStorage.getItem(TWEAKS_KEY) || '{}') || {}); } catch (e) { return {}; }
	}
	var HISTORY = [], FUTURE = [], lastPush = 0, undoing = false; 
	var UNDO_KEY = 'architrave-undo';
	function keepHistory() { if (READER) return; try { sessionStorage.setItem(UNDO_KEY, JSON.stringify({ h: HISTORY, f: FUTURE })); } catch (e) {  } }
	(function () {
		if (READER) return;
		try {
			var o = JSON.parse(sessionStorage.getItem(UNDO_KEY) || '{}'), ok = function (x) { return x && typeof x === 'object' && typeof x.tweaks === 'string' && typeof x.style === 'string'; };
			if (Array.isArray(o.h)) HISTORY = o.h.filter(ok).slice(-40);
			if (Array.isArray(o.f)) FUTURE = o.f.filter(ok).slice(-40);
		} catch (e) {  }
	})();
	function storedSide() { try { return localStorage.getItem('quire-side') || ''; } catch (e) { return ''; } } 
	function changedKey(wasText, nextText) {
		var a, b;
		try { a = (JSON.parse(wasText || '{}') || {})[current] || {}; b = (JSON.parse(nextText || '{}') || {})[current] || {}; } catch (e) { return ''; }
		var keys = Object.keys(a).concat(Object.keys(b));
		for (var i = 0; i < keys.length; i++) {
			var k = keys[i];
			if (JSON.stringify(a[k]) === JSON.stringify(b[k])) continue;
			if (k === 'roles') {
				var ra = a.roles || {}, rb = b.roles || {}, rk = Object.keys(ra).concat(Object.keys(rb));
				for (var j = 0; j < rk.length; j++) if (JSON.stringify(ra[rk[j]]) !== JSON.stringify(rb[rk[j]])) return 'role:' + rk[j];
			}
			if (k === 'effects') {
				var fa = a.effects || {}, fb = b.effects || {}, fk = Object.keys(fa).concat(Object.keys(fb));
				for (var q = 0; q < fk.length; q++) if (JSON.stringify(fa[fk[q]]) !== JSON.stringify(fb[fk[q]])) return 'effect:' + fk[q];
			}
			return k;
		}
		return a && b && JSON.stringify(a) !== JSON.stringify(b) ? '' : 'reset';
	}
	function writeTweaks(all) {
		var next = JSON.stringify(all);
		try {
			var was = localStorage.getItem(TWEAKS_KEY) || '{}';
			if (!undoing && !previewing && was !== next) {
				versionSoon(); FUTURE = []; 
				var nowMs = Date.now();
				if (nowMs - lastPush > 700) { HISTORY.push({ tweaks: was, side: storedSide(), style: current, what: changedKey(was, next), base: siteBase(current) }); if (HISTORY.length > 40) HISTORY.shift(); }
				lastPush = nowMs;
				keepHistory();
			}
			if (next === '{}') localStorage.removeItem(TWEAKS_KEY); else localStorage.setItem(TWEAKS_KEY, next);
		} catch (e) {  }
		if (!previewing) siteSaveSoon();
	}
	var siteSaveTimer = 0, siteSaving = '', siteSent = {};
	function siteBase(id) { var o = byId(id); return o && o.site ? JSON.stringify(o) : null; }
	function restoreBase(id, json) { var o = byId(id); if (!o || !o.site) return; try { STYLES[STYLES.indexOf(o)] = JSON.parse(json); } catch (e) {  } }
	function landStep(h) {
		var s = byId(h.style) || byId(current);
		if (s && s.site && h.base && h.style === current) {
			var keep = siteBase(s.id), rec = null;
			restoreBase(s.id, h.base);
			try { localStorage.setItem(TWEAKS_KEY, h.tweaks); } catch (e) {  }
			try { rec = lookOf(JSON.parse(window.ArchitraveStyles.exportStyle() || '{}')); } catch (e) { rec = null; }
			restoreBase(s.id, keep);
			if (rec) {
				var all = readTweaks(), e = entryFromRecord(rec);
				if (Object.keys(e).length) all[s.id] = e; else delete all[s.id];
				try { if (JSON.stringify(all) === '{}') localStorage.removeItem(TWEAKS_KEY); else localStorage.setItem(TWEAKS_KEY, JSON.stringify(all)); } catch (e) {  }
			}
			return s;
		}
		try { localStorage.setItem(TWEAKS_KEY, h.tweaks); } catch (e) {  }
		if (h.base) restoreBase(h.style, h.base); 
		return s;
	}
	var siteFresh = 0, siteFreshing = null;
	function refreshSite(now) {
		if (!PUBLISH || !PUBLISH.url || !window.fetch) return Promise.resolve(false);
		if (siteFreshing) return siteFreshing;
		if (!now && Date.now() - siteFresh < 3000) return Promise.resolve(false);
		siteFreshing = fetch(PUBLISH.url + (PUBLISH.url.indexOf('?') === -1 ? '?' : '&') + 'now=' + Date.now(), { credentials: 'same-origin', cache: 'no-store' })
			.then(function (r) { return r.ok ? r.json() : null; })
			.then(function (state) {
				siteFresh = Date.now();
				if (!state || !Array.isArray(state.styles)) return false;
				if (typeof state.stamp === 'number' && state.stamp < siteStamp) return false;
				var was = {}, moved = false;
				STYLES.forEach(function (o) { if (o.site) was[o.id] = siteBase(o.id); });
				takeSite(state);
				STYLES.forEach(function (o) { if (o.site && was[o.id] !== siteBase(o.id)) { moved = true; delete siteSent[o.id]; } });
				Object.keys(was).forEach(function (id) { if (!byId(id)) { moved = true; delete siteSent[id]; } });
				if (!moved) return false;
				var s = byId(current);
				if (s) { applyNow(s, wanted(s)); applyRoles(); } else apply(STYLES[0], wanted(STYLES[0]));
				renderHosts();
				return true;
			}, function () { return false; })
			.then(function (v) { siteFreshing = null; return v; });
		return siteFreshing;
	}
	document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') refreshSite(); });
	window.addEventListener('focus', function () { refreshSite(); });
	function siteSaveSoon() {
		if (!PUBLISH) return;
		var s = byId(current); if (!s || !s.site) return;
		refreshSite();
		clearTimeout(siteSaveTimer); siteSaveTimer = setTimeout(siteSaveNow, 1200);
		root.setAttribute('data-site-saving', s.id); 
	}
	function siteSaveNow() {
		clearTimeout(siteSaveTimer); siteSaveTimer = 0;
		var s = byId(current), done = function () { if (!siteSaving && !siteSaveTimer) root.removeAttribute('data-site-saving'); };
		if (!s || !s.site || !(readTweaks()[s.id] || siteSent[s.id])) { done(); return; }
		var rec = window.ArchitraveStyles.exportStyle();
		if (rec === siteSent[s.id]) { 
			var all = readTweaks(); if (all[s.id]) { delete all[s.id]; previewing = true; try { writeTweaks(all); } finally { previewing = null; } mark(); }
			done(); return;
		}
		if (siteSaving) { siteSaveSoon(); return; } 
		siteSaving = s.id;
		window.ArchitraveStyles.updateSite().then(function () { siteSaving = ''; done(); renderHosts(); }, function () { siteSaving = ''; renderHosts(); setTimeout(siteSaveSoon, 5000); }); 
	}
	window.addEventListener('pagehide', function () { if (siteSaveTimer) siteSaveNow(); });
	window.addEventListener('load', function () { if (PUBLISH && byId(current) && byId(current).site && readTweaks()[current]) siteSaveSoon(); });
	applyOptions();
	applyTint();
	applySans();
	applyTracking();
	applyScope();
	applyPictures();
	applyCapLines();
	applyLevels();
	applyLineStyle();
	applyFadeEdges();
	applyMarkerColour();
	applyButton();
	applyPicks();
	applyEffects();
	applyFramePattern();
	applyCorners();
	applyAccent();
	
	var Focus = window.ArchitraveFocus || { on: function () { return false; }, motion: function () { return 0; }, retime: function () { return 0; }, set: function () {} };
	
	function coloursOf(id, own) {
		var s = byId(id || current), tw = readTweaks()[(s && s.id) || current] || {}, out = { light: {}, dark: {} };
		['light', 'dark'].forEach(function (side) {
			
			var named = (s && s.preset && tw.preset === undefined) ? presetById(s.preset) : null;
			var base = {}, t = engineSide((tw.colours && tw.colours[side]) || {}); 
			var mine = engineSide(s && s.colours && s.colours[side]);
			if (tw.preset) Object.keys(mine).forEach(function (k) { if (BESIDE_PRESET.indexOf(colourKey(k)) === -1 || (k === 'muted' && !s.preset)) delete mine[k]; }); 
			[(named && named[side]) || {}, mine].forEach(function (src) { Object.keys(src).forEach(function (k) { if (src[k]) base[k] = src[k]; }); });
			ENGINE_WELLS.forEach(function (k) { var v = t[k] !== undefined ? t[k] : base[k]; if (v) out[side][k] = v; });
		});
		return out;
	}
	var ACCENTS = [
		{ id: 'red', label: 'Red', light: '#dc2626', dark: '#f87171' },
		{ id: 'orange', label: 'Orange', light: '#c24400', dark: '#ff9a2e' },
		{ id: 'amber', label: 'Amber', light: '#b45309', dark: '#fbbf24' },
		{ id: 'yellow', label: 'Yellow', light: '#a16207', dark: '#facc15' },
		{ id: 'lime', label: 'Lime', light: '#4d7c0f', dark: '#a3e635' },
		{ id: 'green', label: 'Green', light: '#03791f', dark: '#5af169' },
		{ id: 'emerald', label: 'Emerald', light: '#047857', dark: '#34d399' },
		{ id: 'teal', label: 'Teal', light: '#0f766e', dark: '#2dd4bf' },
		{ id: 'cyan', label: 'Cyan', light: '#0e7490', dark: '#22d3ee' },
		{ id: 'sky', label: 'Sky', light: '#0369a1', dark: '#38bdf8' },
		{ id: 'blue', label: 'Blue', light: '#0000ff', dark: '#6b7fff' },
		{ id: 'indigo', label: 'Indigo', light: '#4338ca', dark: '#818cf8' },
		{ id: 'violet', label: 'Violet', light: '#6d28d9', dark: '#a78bfa' },
		{ id: 'purple', label: 'Purple', light: '#7444b4', dark: '#9a73ff' },
		{ id: 'fuchsia', label: 'Fuchsia', light: '#a21caf', dark: '#e879f9' },
		{ id: 'pink', label: 'Pink', light: '#be185d', dark: '#f472b6' },
		{ id: 'rose', label: 'Rose', light: '#be123c', dark: '#fb7185' },
		{ id: 'brown', label: 'Brown', light: '#8b5727', dark: '#e0b490' },
		{ id: 'slate', label: 'Slate', light: '#475569', dark: '#94a3b8' },
		{ id: 'stone', label: 'Stone', light: '#57534e', dark: '#a8a29e' }
	];
	var PAPERS = [
		{ id: 'red', label: 'Red', light: '#fef2f2', dark: '#450a0a' },
		{ id: 'orange', label: 'Orange', light: '#fff7ed', dark: '#431407' },
		{ id: 'amber', label: 'Amber', light: '#fffbeb', dark: '#451a03' },
		{ id: 'yellow', label: 'Yellow', light: '#fefce8', dark: '#422006' },
		{ id: 'lime', label: 'Lime', light: '#f7fee7', dark: '#1a2e05' },
		{ id: 'green', label: 'Green', light: '#f0fdf4', dark: '#052e16' },
		{ id: 'emerald', label: 'Emerald', light: '#ecfdf5', dark: '#022c22' },
		{ id: 'teal', label: 'Teal', light: '#f0fdfa', dark: '#042f2e' },
		{ id: 'cyan', label: 'Cyan', light: '#ecfeff', dark: '#083344' },
		{ id: 'sky', label: 'Sky', light: '#f0f9ff', dark: '#082f49' },
		{ id: 'blue', label: 'Blue', light: '#eff6ff', dark: '#172554' },
		{ id: 'indigo', label: 'Indigo', light: '#eef2ff', dark: '#1e1b4b' },
		{ id: 'violet', label: 'Violet', light: '#f5f3ff', dark: '#2e1065' },
		{ id: 'purple', label: 'Purple', light: '#faf5ff', dark: '#3b0764' },
		{ id: 'fuchsia', label: 'Fuchsia', light: '#fdf4ff', dark: '#4a044e' },
		{ id: 'pink', label: 'Pink', light: '#fdf2f8', dark: '#500724' },
		{ id: 'rose', label: 'Rose', light: '#fff1f2', dark: '#4c0519' },
		{ id: 'brown', label: 'Brown', light: '#faf5f0', dark: '#2a1a12' },
		{ id: 'slate', label: 'Slate', light: '#f8fafc', dark: '#020617' },
		{ id: 'stone', label: 'Stone', light: '#fafaf9', dark: '#0c0a09' }
	];
	var INKS = [
		{ id: 'red', label: 'Red', light: '#7f1d1d', dark: '#fee2e2' },
		{ id: 'orange', label: 'Orange', light: '#7c2d12', dark: '#ffedd5' },
		{ id: 'amber', label: 'Amber', light: '#78350f', dark: '#fef3c7' },
		{ id: 'yellow', label: 'Yellow', light: '#713f12', dark: '#fef9c3' },
		{ id: 'lime', label: 'Lime', light: '#365314', dark: '#ecfccb' },
		{ id: 'green', label: 'Green', light: '#14532d', dark: '#dcfce7' },
		{ id: 'emerald', label: 'Emerald', light: '#064e3b', dark: '#d1fae5' },
		{ id: 'teal', label: 'Teal', light: '#134e4a', dark: '#ccfbf1' },
		{ id: 'cyan', label: 'Cyan', light: '#164e63', dark: '#cffafe' },
		{ id: 'sky', label: 'Sky', light: '#0c4a6e', dark: '#e0f2fe' },
		{ id: 'blue', label: 'Blue', light: '#1e3a8a', dark: '#dbeafe' },
		{ id: 'indigo', label: 'Indigo', light: '#312e81', dark: '#e0e7ff' },
		{ id: 'violet', label: 'Violet', light: '#4c1d95', dark: '#ede9fe' },
		{ id: 'purple', label: 'Purple', light: '#581c87', dark: '#f3e8ff' },
		{ id: 'fuchsia', label: 'Fuchsia', light: '#701a75', dark: '#fae8ff' },
		{ id: 'pink', label: 'Pink', light: '#831843', dark: '#fce7f3' },
		{ id: 'rose', label: 'Rose', light: '#881337', dark: '#ffe4e6' },
		{ id: 'brown', label: 'Brown', light: '#4a2f1c', dark: '#f0e4d8' },
		{ id: 'slate', label: 'Slate', light: '#0f172a', dark: '#f1f5f9' },
		{ id: 'stone', label: 'Stone', light: '#1c1917', dark: '#f5f5f4' }
	];
	var LISTS = { paper: PAPERS, ink: INKS, accent: ACCENTS, button: ACCENTS, ground: PAPERS, lift: PAPERS, marker: ACCENTS, muted: INKS, title: ACCENTS, headings: ACCENTS, body: ACCENTS, quote: ACCENTS, meta: ACCENTS, 'interface': ACCENTS, code: ACCENTS };  
	function listColourOf(key) {
		key = COLOUR_ENGINE[key] || key;
		var c = coloursOf(null, true), light = (c.light || {})[key], dark = (c.dark || {})[key];
		if (!light || !dark) return '';
		var hit = (LISTS[key] || []).filter(function (x) { return x.light === light && x.dark === dark; })[0];
		return hit ? hit.id : ''; 
	}
	function accentById(id) { return ACCENTS.filter(function (a) { return a.id === id; })[0] || null; }
	function accentColourOf() { return listColourOf('accent'); }
	function presetById(id) { return PRESETS.filter(function (p) { return p.id === id; })[0] || null; }
	function presetOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && tw.preset !== undefined) return tw.preset || '';
		return (s && s.preset) || '';
	}
	function hexToOklch(hex) {
		var c = hex.replace('#', ''), rgb = [0, 2, 4].map(function (i) { var n = parseInt(c.substr(i, 2), 16) / 255; return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4); });
		var l = 0.4122214708 * rgb[0] + 0.5363325363 * rgb[1] + 0.0514459929 * rgb[2], m = 0.2119034982 * rgb[0] + 0.6806995451 * rgb[1] + 0.1073969566 * rgb[2], s = 0.0883024619 * rgb[0] + 0.2817188376 * rgb[1] + 0.6299787005 * rgb[2];
		l = Math.cbrt(l); m = Math.cbrt(m); s = Math.cbrt(s);
		var L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, b = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
		return { L: L, C: Math.sqrt(a * a + b * b), h: Math.atan2(b, a) };
	}
	function oklchToHex(o) {
		var a = o.C * Math.cos(o.h), b = o.C * Math.sin(o.h);
		var l = o.L + 0.3963377774 * a + 0.2158037573 * b, m = o.L - 0.1055613458 * a - 0.0638541728 * b, s = o.L - 0.0894841775 * a - 1.291485548 * b;
		l = l * l * l; m = m * m * m; s = s * s * s;
		var rgb = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
		return '#' + rgb.map(function (v) { v = Math.max(0, Math.min(1, v)); v = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055; var h = Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16); return h.length < 2 ? '0' + h : h; }).join('');
	}
	function deriveColour(hex, key, toSide) {
		if (key === 'accent') return hex; 
		var o = hexToOklch(hex), L = o.L;
		if (toSide === 'dark') { if (key === 'paper') { L = 0.26 + (1 - L) * 0.6; o.C *= 0.7; } else L = 0.6 + (1 - L) * 0.4; } 
		else { if (key === 'paper') L = 0.82 + (1 - L) * 0.18; else L = 0.42 - 0.2 * L; }
		o.L = Math.max(0, Math.min(1, L));
		return oklchToHex(o);
	}
	
	function darkByHand(entry, key, presets) {
		var d = entry.colours && entry.colours.dark, v = d && (d[key] || d[COLOUR_ENGINE[key]]);
		if (!v) return false;
		return !presets.some(function (p) {
			var pv = '';
			if (p && p.dark) Object.keys(p.dark).forEach(function (k) { if (colourKey(k) === key) pv = p.dark[k]; });
			return pv && String(pv).toLowerCase() === String(v).toLowerCase();
		});
	}
	function accentForPaper(hex, paper, min) {
		min = min || 4.5;
		if (!paper || contrast(hex, paper) >= min) return hex;
		var o = hexToOklch(hex), towardDark = lum(paper) > 0.18, best = hex;
		for (var i = 0; i < 40; i++) {
			o.L = Math.max(0.05, Math.min(0.97, o.L + (towardDark ? -0.02 : 0.02)));
			best = oklchToHex(o);
			if (contrast(best, paper) >= min) break;
		}
		return best;
	}
	function coloursResolved(id) {
		var out = coloursOf(id, true); out.derived = { light: [], dark: [] };
		[['light', 'dark'], ['dark', 'light']].forEach(function (pair) {
			var from = pair[0], to = pair[1];
			['paper', 'ink', 'accent', 'button', 'ground', 'lift'].concat(ROLE_WELLS).forEach(function (k) {
				if (!out[from][k] || out[to][k] || out.derived[from].indexOf(k) !== -1) return;
				if (k === 'ground' && groundFlip(out[from].ground, out[from].paper || paperNow(from), out[from].ink)) return;
				out[to][k] = deriveColour(out[from][k], k === 'paper' || k === 'ink' ? k : k === 'ground' || k === 'lift' ? 'paper' : 'accent', to); out.derived[to].push(k);
			});
			if (out[from].marker && !out[to].marker && out.derived[from].indexOf('marker') === -1) { out[to].marker = out[from].marker; out.derived[to].push('marker'); }
			if (out[from].muted && !out[to].muted && out.derived[from].indexOf('muted') === -1) {
				var fP = hexToOklch(out[from].paper || paperNow(from)).L, fI = hexToOklch(out[from].ink || inkOf(from)).L, f = fI === fP ? 0.5 : (hexToOklch(out[from].muted).L - fI) / (fP - fI);
				out.derived[to].push('muted'); out[to].muted = '#pending:' + Math.max(0, Math.min(1, f)) + ':' + out[from].muted;
			}
		});
		['light', 'dark'].forEach(function (side) {
			var paper = out[side].paper || paperOf(side);
			if (out.derived[side].indexOf('accent') !== -1) out[side].accent = accentForPaper(out[side].accent, paper);
			['button'].concat(ROLE_WELLS).forEach(function (k) { if (out.derived[side].indexOf(k) !== -1) out[side][k] = accentForPaper(out[side][k], paper); }); 
			if (/^#pending:/.test(out[side].muted || '')) { var mp = out[side].muted.split(':'), ink = out[side].ink || inkOf(side), o = hexToOklch(mp[2]); var pp = out[side].paper || paperNow(side); o.L = hexToOklch(ink).L + (hexToOklch(pp).L - hexToOklch(ink).L) * +mp[1]; out[side].muted = oklchToHex(o); }
			if (out.derived[side].indexOf('marker') !== -1 && !penOf(out[side].marker)) out[side].marker = accentForPaper(out[side].marker, paper, 3);
		});
		return out;
	}
	function lum(hex) {
		var c = hex.replace('#', ''), v = [0, 2, 4].map(function (i) { var n = parseInt(c.substr(i, 2), 16) / 255; return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4); });
		return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
	}
	function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
	
	function sideSelectors(side, extra) {
		var on = 'html:root[data-colours="on"]';
		var list = [on + '[data-theme$="-' + side + '"]' + (extra || '')];
		if (side === 'light') list.push(on + ':not([data-theme])' + (extra || ''));
		return list;
	}
	function sideRule(side, extra, suffix, body) {
		return sideSelectors(side, extra).map(function (sel) { return sel + (suffix || ''); }).join(',') + '{' + body + '}';
	}
	function shade(hex, dL) {
		var o = hexToOklch(hex);
		o.L = Math.max(0, Math.min(1, o.L + dL));
		return oklchToHex(o);
	}
	function sink(hex, d) { var o = hexToOklch(hex); return o.L <= 0.03 ? hex : shade(hex, -d); }
	function rise(hex, d, dBlack) {
		var L = hexToOklch(hex).L;
		if (L >= 0.18) return d;
		var t = 1 - L / 0.18;
		return d + (dBlack - d) * t * t;
	}
	function field(hex, d, dBlack) {
		var L = hexToOklch(hex).L;
		return L < 0.18 ? shade(hex, rise(hex, d, dBlack)) : shade(hex, -d);
	}
	
	function pairLooks(c, side) {
		var G = c.ground && !groundFlip(c.ground, c.paper, c.ink) ? c.ground : '';
		return { flat: !!window.architravePanelGuest, G: G, F: c.lift || '' };
	}
	function pairBody(c, side) {
		var P = c.paper, I = c.ink, Ig = I, dark = lum(P) < lum(I); 
		var mix = function (a, b, pct) { return 'color-mix(in oklab, ' + a + ', ' + b + ' ' + pct + '%)'; };
		var k = pairLooks(c, side), flat = k.flat, G = k.G, F = k.F;
		return '' +
			'color-scheme:' + (dark ? 'dark' : 'light') + ';' +
			'--surface-base:' + P + ';--text-primary:' + I + ';' +
			'--surface-canvas:' + (G || (flat ? P : sink(P, 0.05))) + ';' +
			'--surface-plane:' + (G || (flat ? P : sink(P, 0.025))) + ';' +
			'--surface-navigation:' + (G || sink(P, dark ? 0.08 : 0.035)) + ';' +
			'--surface-subtle:' + (F || field(P, 0.045, 0.20)) + ';' +
			(F ? '--surface-floating:' + F + ';--ldp-lift:' + F + ';' : '') + 
			'--surface-raised:' + (dark ? shade(P, rise(P, 0.03, 0.24)) : P) + ';' +
			'--surface-hover:' + liftRest(F, P, Ig, dark) + ';' +
			'--surface-selected:color-mix(in srgb, ' + P + ', ' + Ig + ' var(--step-surface-selected, 10%));' +
			'--surface-pressed:color-mix(in srgb, ' + P + ', ' + Ig + ' var(--step-surface-pressed, 16%));' +
			'--surface-track:color-mix(in srgb, ' + P + ', ' + Ig + ' var(--step-surface-hover, 6%));' +
			'--surface-track-selected:color-mix(in srgb, ' + P + ', ' + Ig + ' var(--step-track-selected, 12%));' +
			(G ? '--ldp-ground:' + G + ';' : '') + 
			'--text-secondary:' + mix(Ig, P, 15) + ';--text-muted:' + mix(Ig, P, 25) + ';--text-subtle:' + mix(Ig, P, 61) + ';--text-disabled:' + mix(Ig, P, 72) + ';' +
			'--border-subtle:' + mix(P, Ig, 7) + ';--border-default:' + mix(P, Ig, 14) + ';--border-strong:' + mix(P, Ig, 29) + ';--border-control:' + mix(P, Ig, 52) + ';' +
			'--code-surface:' + (F && dark ? F : field(P, dark ? 0.06 : 0.04, 0.12)) + ';' +  '--code-plain:' + I + ';' +
			'--surface-inverse:' + I + ';--surface-inverse-subtle:' + mix(I, P, 10) + ';--text-inverse:' + P + ';--text-inverse-subtle:' + mix(P, I, 35) + ';--border-inverse:' + mix(I, P, 30) + ';' +
			'--ink-alpha-weak:rgb(from ' + I + ' r g b / 0.06);--ink-alpha-soft:rgb(from ' + I + ' r g b / 0.12);--ink-alpha-medium:rgb(from ' + I + ' r g b / 0.24);--ink-alpha-strong:rgb(from ' + I + ' r g b / 0.48);' +
			'--mode-swatch:' + P + ';' +
			'--toggle-knob-ink:' + (dark ? I : 'var(--surface-raised)') + ';' +
			'--lift-surface:' + (F || 'var(--surface-raised)') + ';' +
			'--lift-rest:' + liftRest(F, P, I, dark) + ';' +
			graySteps(P, dark);
	}
	function graySteps(P, dark) {
		var L = hexToOklch(P).L;
		if (!dark || L >= 0.18) return '';
		var r = Math.round(rise(P, 0.06, 0.14) * 100);
		return '--gray-step:' + r + '%;--gray-step-hover:' + (r + 4) + '%;--gray-step-press:' + (r + 10) + '%;';
	}
	function liftRest(F, P, I, dark) {
		if (!F) return 'var(--surface-hover)';
		return !dark && contrast(F, P) < 1.15 ? 'color-mix(in srgb, ' + P + ', ' + I + ' var(--step-surface-hover, 6%))' : F;
	}
	var LIFT_CARDS = ' :is(.support-box, .about-numbers, .release-panel, .release-archive-card, [data-quotes="box"] :is(.post-card.format-quote, .single-format-quote .single-post-article .wp-block-post-content) blockquote.wp-block-quote)'; 
	function pairCss(side, c) {
		var P = c.paper, I = c.ink, dark = lum(P) < lum(I);
		var mix = function (a, b, pct) { return 'color-mix(in oklab, ' + a + ', ' + b + ' ' + pct + '%)'; };
		var k = pairLooks(c, side), G = k.G, F = k.F;
		var css = sideRule(side, '', '', pairBody(c, side)) +
			sideRule(side, '', ' .quire-segmented:not(:where(.reading-panel, .reading-panel *))', dark
				? '--groove-page:color-mix(in srgb, var(--interaction-surface, var(--surface-canvas)), var(--text-primary) var(--step-surface-hover, 10%));--chip-page:color-mix(in srgb, var(--interaction-surface, var(--surface-canvas)), var(--text-primary) var(--step-surface-pressed, 24%));'
				: '--groove-page:color-mix(in srgb, var(--interaction-surface, var(--surface-canvas)), var(--text-primary) var(--switch-groove, 10%));--chip-page:var(--surface-raised);');
		if (c.accent) css += accentCss(side, c.accent, P, I);
		
		
		var B = 'var(--lift-rest)', LS = 'var(--lift-surface)', INK = 'var(--text-primary)';
		if (F) css += sideRule(side, ':not([data-fills="off"])', ' .post-link-card:not(:hover, :active, [aria-expanded="true"], [aria-pressed="true"]):not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener))', 'background-color:' + B + ';');
		if (F) css += sideRule(side, ':not([data-fills="off"])', ' .quire-badge:not(.comments-count):not(:hover, :active, [aria-expanded="true"], [aria-pressed="true"]):not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener))', 'background-color:' + B + ';');
		var GROUND = 'var(--interaction-surface, var(--surface-base))';
		var GRAY = ' :is(.quire-button:not(.primary, .ghost, .comments-pill), .comments-open-btn, .paper-stack-btn, .rail-collapse-btn, .rail-collapse-corner .quire-icon-button, .rail-expand .quire-icon-button, .quire-search-field)';
		var grayRung = function (step, fall) { return 'background-color:color-mix(in srgb, ' + GROUND + ', var(--text-primary) var(' + step + ', var(' + fall + ')));'; };
		if (F) css += sideRule(side, ':not([data-fills="off"])', GRAY + ':not(:hover, :active, [aria-expanded="true"], [aria-pressed="true"]):not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener))', grayRung('--gray-step', '--step-surface-hover'));
		if (F) css += sideRule(side, ':not([data-fills="off"])', ' :is(.rail-collapse-btn, .rail-collapse-corner .quire-icon-button, .rail-expand .quire-icon-button):not(:hover, :active):not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener))', grayRung('--gray-step', '--step-surface-hover'));
		var NOT_PANEL = ':not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener))';
		var rung = function (step, from) { return 'background-color:color-mix(in srgb, ' + (from || B) + ', ' + INK + ' var(' + step + '));'; };
		if (F) {
			var LIFTED_CARD = ' .post-link-card'; 
			var LIFTED = ' :is(a, button).quire-badge:not(.comments-count)'; 
			css += sideRule(side, ':not([data-fills="off"])', GRAY + ':hover' + NOT_PANEL, grayRung('--gray-step-hover', '--step-surface-selected'));
			css += sideRule(side, ':not([data-fills="off"])', GRAY + ':is([aria-expanded="true"], [aria-pressed="true"]):not(.rail-collapse-btn, .quire-icon-button)' + NOT_PANEL, grayRung('--gray-step-hover', '--step-surface-selected'));
			css += sideRule(side, ':not([data-fills="off"])', GRAY + ':active' + NOT_PANEL, grayRung('--gray-step-press', '--step-surface-pressed'));
			[[LIFTED_CARD, B], [LIFTED, B]].forEach(function (g) {
				css += sideRule(side, ':not([data-fills="off"])', g[0] + ':hover' + NOT_PANEL, rung('--step-surface-hover', g[1]));
				css += sideRule(side, ':not([data-fills="off"])', g[0] + ':is([aria-expanded="true"], [aria-pressed="true"]):not(.rail-collapse-btn, .quire-icon-button)' + NOT_PANEL, rung('--step-surface-selected', g[1]));
				css += sideRule(side, ':not([data-fills="off"])', g[0] + ':active' + NOT_PANEL, rung('--step-surface-pressed', g[1]));
			});
		}
		if (F) css += sideRule(side, ':not([data-fills="off"])', LIFT_CARDS + ':not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener))', 'background-color:' + B + ';');
		if (F) {
			var ON_CARD = ' :is(' + LIFT_CARDS + ', .single-post-article .wp-block-post-content .code-block, .quire-menu, .rail-more-menu, .rail-more-sub, .paper-stack-menu) :is(.quire-button:not(.primary, .ghost, .comments-pill), .quire-badge:not(.comments-count), .quire-search-field)' + NOT_PANEL;
			css += sideRule(side, ':not([data-fills="off"])', ON_CARD, rung('--step-surface-hover', B));
			var ON_CARD_PRESS = ON_CARD.replace('.quire-badge:not(.comments-count)', ':is(a, button).quire-badge:not(.comments-count)'); 
			css += sideRule(side, ':not([data-fills="off"])', ON_CARD_PRESS.replace(')' + NOT_PANEL, '):hover' + NOT_PANEL), rung('--step-surface-selected', B));
			css += sideRule(side, ':not([data-fills="off"])', ON_CARD_PRESS.replace(')' + NOT_PANEL, '):active' + NOT_PANEL), rung('--step-surface-pressed', B));
		}
		
		if (F) css += sideRule(side, ':not([data-fills="off"])', ' .single-post-article .wp-block-post-content .code-block', '--interaction-surface:' + B + ';');
		if (F) css += sideRule(side, '', ' :is(.quire-menu, .rail-more-menu, .rail-more-sub, .paper-stack-menu, .quire-tooltip-bubble):not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener))', 'background-color:' + LS + ';--interaction-surface:' + LS + ';');
		
		if (G) css += sideRule(side, '', ' .sidebar-column', '--text-subtle:' + mix(INK, 'var(--surface-navigation)', 45) + ';--text-muted:' + mix(INK, 'var(--surface-navigation)', 25) + ';');
		return css;
	}
	function accentCss(side, A, P, I) {
		return sideRule(side, ':not([data-accent="off"])', '', accentBody(A, P, I));
	}
	function writingOn(X, P, I) {
		if (!(P && I)) return lum(X) > 0.35 ? '#111111' : '#ffffff';
		var darkFill = lum(X) <= 0.35, lighter = lum(P) >= lum(I) ? P : I, darker = lighter === P ? I : P;
		var want = darkFill ? lighter : darker, other = want === P ? I : P;
		return contrast(X, want) >= 2.5 ? want : other;
	}
	function linkWriting(A) {
		return lum(A) <= 0.35 ? '#ffffff' : '#000000';
	}
	function accentBody(A, P, I) {
		var contrastInk = writingOn(A, P, I);
		return '--accent:' + A + ';--accent-contrast:' + contrastInk + ';--accent-writing:' + linkWriting(A) + ';--accent-muted:color-mix(in oklab, ' + A + ', ' + (P || 'var(--surface-base)') + ' 78%);--focus:color-mix(in srgb, ' + A + ' 40%, transparent);';
	}
	function markerBody(M) {
		var light = lum(M) > 0.35;
		return '--marker:' + M + ';--marker-ink:' + (light ? '#1c1c18' : '#f7f7f5') + ';';
	}
	function buttonBody(B, P, I) {
		var writing = writingOn(B, P, I);
		return '--button-colour:' + B + ';--button-contrast:' + writing + ';';
	}
	
	function letGoPreset(entry) {
		var s = byId(current), p = s && s.preset && entry.preset === undefined ? presetById(s.preset) : null;
		if (p) {
			entry.colours = entry.colours || {};
			['light', 'dark'].forEach(function (sd) {
				var have = entry.colours[sd] = entry.colours[sd] || {};
				Object.keys(p[sd]).forEach(function (k) { var pub = colourKey(k); if (have[pub] === undefined && have[k] === undefined) have[pub] = p[sd][k]; });
			});
		}
		if (s && s.preset) entry.preset = ''; else delete entry.preset;
	}
	function writeColours(into) {
		var c = coloursOf(null, true), pn = presetById(presetOf());
		delete into.preset; into.colours = {};
		if (pn) {
			into.preset = pn.id;
			['light', 'dark'].forEach(function (side) { Object.keys(c[side]).forEach(function (k) { if (pn[side][k] === c[side][k]) delete c[side][k]; }); });
		}
		['light', 'dark'].forEach(function (side) { if (Object.keys(c[side]).length) into.colours[side] = publicSide(c[side]); });
	}
	var COLOURS_STYLE = 'architrave-own-colours';
	function mixHex(a, b, w) {
		var x = hexToOklch(a), y = hexToOklch(b), lab = function (o) { return [o.L, o.C * Math.cos(o.h), o.C * Math.sin(o.h)]; };
		var p = lab(x), q = lab(y), m = [0, 1, 2].map(function (i) { return p[i] + (q[i] - p[i]) * w; });
		return oklchToHex({ L: m[0], C: Math.sqrt(m[1] * m[1] + m[2] * m[2]), h: Math.atan2(m[2], m[1]) });
	}
	function groundSides(c) {
		c = c || coloursResolved();
		var out = {};
		['light', 'dark'].forEach(function (side) { out[side] = groundFlip(c[side].ground, c[side].paper || paperNow(side), c[side].ink); });
		return out;
	}
	var GROUND_NUDGED = { light: false, dark: false };
	function groundSet(c, side) {
		var other = side === 'light' ? 'dark' : 'light', o = c[other], G = c[side].ground;
		var oCanvas = o.ground && !groundFlip(o.ground, o.paper || paperNow(other), o.ink) ? o.ground : o.paper ? sink(o.paper, 0.05) : canvasOf(other);
		GROUND_NUDGED[side] = false;
		if (String(G).toLowerCase() === String(oCanvas).toLowerCase() || String(G).toLowerCase() === String(o.paper || paperNow(other)).toLowerCase()) return null; 
		var inks = [o.ink || inkOf(other), c[side].paper || paperNow(side), '#ffffff', '#111111'];
		var best = function (g) { return inks.reduce(function (b, x) { return contrast(x, g) > contrast(b, g) + 0.5 ? x : b; }); };
		var GP = G, GI = best(GP);
		if (contrast(GI, GP) < 4.5) {
			var og = hexToOklch(GP), toDark = lum(GP) < 0.18;
			for (var i = 0; i < 40 && contrast(GI, GP) < 4.5; i++) { og.L = Math.max(0, Math.min(1, og.L + (toDark ? -0.015 : 0.015))); GP = oklchToHex(og); GI = best(GP); }
			GROUND_NUDGED[side] = true;
		}
		var GA = accentForPaper(o.accent || c[side].accent || GI, GP); 
		return pairBody({ paper: GP, ink: GI, ground: GP }, lum(GP) < lum(GI) ? 'dark' : 'light') + accentBody(GA, GP, GI);
	}
	function setBothSides(key, hex) {
		var all = readTweaks(), entry = all[current] || {}, s = byId(current);
		entry.colours = entry.colours || {};
		['light', 'dark'].forEach(function (side) {
			var c = entry.colours[side] = entry.colours[side] || {};
			delete c[COLOUR_ENGINE[key]];
			if (hex) c[key] = hex.toLowerCase();
			else if (s && s.colours && s.colours[side] && (s.colours[side][key] || s.colours[side][COLOUR_ENGINE[key]])) c[key] = ''; 
			else delete c[key];
			if (!Object.keys(c).length) delete entry.colours[side];
		});
		if (!Object.keys(entry.colours).length) delete entry.colours;
		if (Object.keys(entry).length) all[current] = entry; else delete all[current];
		writeTweaks(all);
		applyColours(); mark();
	}
	function applyColourStamps() {
		var put = function (n, v) { if (v === null) root.removeAttribute(n); else if (root.getAttribute(n) !== v) root.setAttribute(n, v); };
		var gs = groundSides();
		put('data-darkground', gs.light || gs.dark ? 'on' : 'off');
		put('data-night-ground', gs.dark ? 'inverted' : null);
		put('data-marker', highlightNow() ? 'on' : 'off');
		applyMarkerColour();
	}
	function applyColours() {
		var c = coloursResolved(), css = '';
		['light', 'dark'].forEach(function (side) {
			var v = c[side];
			if ((v.paper && v.ink) || !((v.ground && !groundFlip(v.ground, v.paper || paperNow(side), v.ink)) || v.lift)) return;
			if (!v.paper) v.paper = paperNow(side);
			if (!v.ink) v.ink = inkOf(side);
		});
		var flips = groundSides(c);
		['light', 'dark'].forEach(function (side) {
			var v = c[side]; GROUND_NUDGED[side] = false;
			if (!v.ground || flips[side] || !v.ink) return;
			var o = hexToOklch(v.ground), toLight = lum(v.ink) < lum(v.ground), i = 0;
			while (contrast(v.ink, v.ground) < 4.5 && i++ < 60) { o.L = Math.max(0, Math.min(1, o.L + (toLight ? 0.01 : -0.01))); v.ground = oklchToHex(o); GROUND_NUDGED[side] = true; }
		});
		['light', 'dark'].forEach(function (side) {
			var v = c[side];
			if (v.paper && v.ink) css += pairCss(side, v);
			else if (v.accent) css += accentCss(side, v.accent, null, null); 
			if (v.button) css += sideRule(side, '', '', buttonBody(v.button, v.paper || null, v.ink || null));
			if (v.button && v.paper && v.ink) {
				var LF = pairLooks(v, side).F;
				if (LF && contrast(v.button, LF) < 1.3) css += sideRule(side, ':not([data-fills="off"])', LIFT_CARDS, buttonBody(contrast(v.paper, LF) >= 1.3 ? v.paper : v.ink, v.paper, v.ink));
			}
			if (v.title) css += sideRule(side, '', '', '--head-own-colour:' + v.title + ';');
			if (v.headings) css += sideRule(side, '', '', '--headings-own-colour:' + v.headings + ';');
			['body', 'quote', 'interface', 'code'].forEach(function (r) { if (v[r]) css += sideRule(side, '', '', '--' + r + '-own-colour:' + v[r] + ';'); });
			if (v.muted) css += sideRule(side, '', '', '--ldp-muted:' + v.muted + ';') + sideRule(side, '', ' body', '--text-muted:' + v.muted + ';--wp--preset--color--text-muted:' + v.muted + ';--ldp-muted:' + v.muted + ';'); 
			
			if (v.marker && !penOf(v.marker)) css += sideRule(side, '[data-marker-colour="own"]', '', markerBody(v.marker)); 
			if (v.meta) css += sideRule(side, '', '', '--kicker-own-colour:' + v.meta + ';');
		});
		if (c.light.paper && c.light.ink && c.dark.paper && c.dark.ink) {
			var on = 'html:root[data-colours="on"]';
			css += on + ' .ground-dark{' + pairBody(c.dark, 'dark') + (c.dark.accent ? accentBody(c.dark.accent, c.dark.paper, c.dark.ink) : '') + '}' +
				on + ' .ground-light{' + pairBody(c.light, 'light') + (c.light.accent ? accentBody(c.light.accent, c.light.paper, c.light.ink) : '') + '}';
		}
		['light', 'dark'].forEach(function (side) {
			if (!flips[side]) return;
			var body = groundSet(c, side);
			if (body) css += sideRule(side, '[data-darkground="on"]', side === 'light' ? ' .ground-dark' : ' .ground-light', body);
		});
		if (c.dark.accent) css += 'html:root[data-colours="on"]:not([data-accent="off"]) .theme-neutral-dark:not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener)){' + accentBody(c.dark.accent, null, null) + '}';
		var el = document.getElementById(COLOURS_STYLE);
		if (!el && css) { el = document.createElement('style'); el.id = COLOURS_STYLE; (document.head || root).appendChild(el); }
		if (el && el.textContent !== css) el.textContent = css;
		if (typeof markerInk === 'function' && document.readyState !== 'loading') markerInk(); 
		if (css) { if (root.getAttribute('data-colours') !== 'on') root.setAttribute('data-colours', 'on'); }
		else root.removeAttribute('data-colours');
		if (root.hasAttribute('data-darkground')) applyColourStamps(); 
		
		var tw = (readTweaks()[current] || {}).colours || {}, rec = (byId(current) || {}).colours || {};
		var ownAccent = window.architravePanelGuest && ((tw.light && tw.light.accent) || (tw.dark && tw.dark.accent) || (rec.light && rec.light.accent) || (rec.dark && rec.dark.accent));
		if (ownAccent) root.setAttribute('data-accent-own', ''); else root.removeAttribute('data-accent-own');
	}
	
	var markerInkProbe = null;
	function markerInk() {
		var body = document.body; if (!body) return;
		var pen = root.getAttribute('data-marker-colour');
		var clear = function () { body.style.removeProperty('--marker-ink'); body.style.removeProperty('--marker-wash'); };
		if (root.getAttribute('data-marker') !== 'on' || (pen !== 'text' && pen !== 'muted')) { clear(); return; }
		try {
			if (!markerInkProbe) { markerInkProbe = document.createElement('canvas'); markerInkProbe.width = markerInkProbe.height = 1; }
			var x = markerInkProbe.getContext('2d', { willReadFrequently: true });
			var read = function (colours) {
				x.clearRect(0, 0, 1, 1);
				colours.forEach(function (c) { x.fillStyle = '#ffffff'; x.fillStyle = c; x.fillRect(0, 0, 1, 1); });
				var d = x.getImageData(0, 0, 1, 1).data;
				return '#' + [d[0], d[1], d[2]].map(function (n) { return ('0' + n.toString(16)).slice(-2); }).join('');
			};
			var i = document.createElement('i');
			i.style.cssText = 'position:absolute;visibility:hidden';
			body.appendChild(i);
			i.style.color = 'var(--surface-base)'; var P = getComputedStyle(i).color;
			i.style.color = 'var(--text-primary)'; var I = getComputedStyle(i).color;
			i.style.color = 'var(--marker)'; var M = getComputedStyle(i).color;
			body.removeChild(i);
			var paper = read([P]), wash = read([P, M]), ink = read([P, I]);
			var mix = function (a, b, t) { var h = function (c, i) { return parseInt(c.substr(1 + i * 2, 2), 16); }; return '#' + [0, 1, 2].map(function (i) { return ('0' + Math.round(h(a, i) + (h(b, i) - h(a, i)) * t).toString(16)).slice(-2); }).join(''); };
			var fit = function (letters, toward) { for (var t = 0; t <= 1.0001; t += 0.02) { var w = mix(wash, toward, t); if (contrast(letters, w) >= 4.5) return { t: t, wash: w }; } return { t: 2, wash: wash }; };
			var onInk = fit(ink, paper), onPaper = fit(paper, ink), best = onPaper.t <= onInk.t ? 'paper' : 'ink';
			if (onInk.t === 2 && onPaper.t === 2) best = contrast(paper, wash) >= contrast(ink, wash) ? 'paper' : 'ink';
			body.style.setProperty('--marker-ink', best === 'paper' ? 'var(--surface-base)' : 'var(--text-primary)');
			var W = best === 'paper' ? onPaper : onInk;
			if (W.t > 0 && W.t <= 1) body.style.setProperty('--marker-wash', W.wash); else body.style.removeProperty('--marker-wash');
		} catch (e) { clear(); }
	}
	(function () {
		var go = function () {
			markerInk();
			new MutationObserver(markerInk).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-marker', 'data-style', 'data-colours', 'data-preset', 'data-marker-colour', 'data-soft', 'data-soft-level', 'data-quiet-level', 'data-small-soft', 'style'] }); 
		};
		if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
	})();
	var GROUND_WIDE = window.matchMedia ? window.matchMedia('(min-width: 1010px)') : null;
	var groundWorn = [];
	function applyGround() {
		var body = document.body;
		groundWorn.forEach(function (w) { w.el.classList.remove(w.cls, w.scope); });
		groundWorn = [];
		if (!body || root.getAttribute('data-darkground') !== 'on') return;
		var day = root.getAttribute('data-theme') || 'neutral-light', gs = groundSides();
		var M = window.QuireModes;
		var wear = function (el, mode, scope) { if (!el) return; el.classList.add('theme-' + mode, scope); groundWorn.push({ el: el, cls: 'theme-' + mode, scope: scope }); };
		if (/-dark$/.test(day)) {
			if (!gs.dark || GUEST) return;
			if (!body.classList.contains('has-frame') || (GROUND_WIDE && !GROUND_WIDE.matches)) return;
			var light = M && M.resolve ? M.resolve(day, 'light') : day.replace(/-dark$/, '-light');
			wear(body, light, 'ground-light');
			Array.prototype.forEach.call(document.querySelectorAll(ON_PAPER), function (el) { wear(el, day, 'ground-dark'); });
			return;
		}
		if (!/-light$/.test(day) || !gs.light) return;
		var night = M && M.resolve ? M.resolve(day, 'dark') : day.replace(/-light$/, '-dark');
		if (GUEST) return;
		if (!body.classList.contains('has-frame') || (GROUND_WIDE && !GROUND_WIDE.matches)) return;
		wear(body, night, 'ground-dark');
		Array.prototype.forEach.call(document.querySelectorAll(ON_PAPER), function (el) { wear(el, day, 'ground-light'); });
	}
	var ON_PAPER = '.frame-paper, .paper-stack, .rail-collapse-corner, .rail-expand, .comments-open';
	(function () {
		var go = function () {
			applyGround();
			new MutationObserver(applyGround).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-darkground', 'data-night-ground'] });
			if (GROUND_WIDE) { if (GROUND_WIDE.addEventListener) GROUND_WIDE.addEventListener('change', applyGround); else GROUND_WIDE.addListener(applyGround); }
		};
		if (document.readyState === 'loading' && window.MutationObserver) {
			var EARLY = ON_PAPER + ', .wp-site-blocks > footer', bodySeen = false;
			var early = new MutationObserver(function (records) {
				var hit = !bodySeen && !!document.body;
				for (var r = 0; !hit && r < records.length; r++) {
					for (var n = 0; n < records[r].addedNodes.length; n++) {
						var el = records[r].addedNodes[n];
						if (el.nodeType === 1 && el.matches && el.matches(EARLY)) { hit = true; break; }
					}
				}
				if (hit) { bodySeen = true; applyGround(); }
			});
			early.observe(root, { childList: true, subtree: true });
			document.addEventListener('DOMContentLoaded', function () { early.disconnect(); go(); });
		} else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
	})();
	function paperOf(side) {
		var pal = String(root.getAttribute('data-theme') || (Modes ? Modes.default : 'neutral-light')).split('-')[0];
		var m = ((Modes && Modes.modes) || []).filter(function (x) { return x.palette === pal && x.side === side; })[0];
		return (m && m.swatch) || (side === 'dark' ? '#373737' : '#ffffff'); 
	}
	applyColours();
	function now() {
		var mode = root.getAttribute('data-theme') || (Modes ? Modes.default : 'neutral-light');
		return {
			palette: String(mode).split('-')[0],
			reading: root.getAttribute('data-reading') || 'default',
			face: root.getAttribute('data-face') || (window.architravePanelGuest ? 'host' : 'newsreader'),
			leading: root.getAttribute('data-leading') || 'default'
		};
	}
	function same(a, b) {
		var v = function (o, d) { return o[d] === undefined && d === 'palette' ? 'neutral' : o[d]; }; 
		return DIALS.every(function (d) { return v(a, d) === v(b, d); });
	}
	function wanted(s) {
		var tw = readTweaks()[s.id];
		var out = {};
		DIALS.forEach(function (d) { out[d] = (tw && tw[d]) || s[d]; });
		if (!out.palette) out.palette = 'neutral'; 
		return out;
	}
	function press(selector) {
		var row = document.querySelector(selector);
		if (row) row.click();
	}
	function slowly(change) {
		var quiet = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (quiet || !document.startViewTransition) { change(); return; }
		try {
			var t = document.startViewTransition(change);
			if (t && t.finished && t.finished.catch) t.finished.catch(function () {});
			if (t && t.updateCallbackDone && t.updateCallbackDone.catch) t.updateCallbackDone.catch(function () {});
			if (t && t.ready && t.ready.catch) t.ready.catch(function () {});
		} catch (e) { change(); }
	}
	var applying = false, applyTimer = null;
	function apply(s, dials) {
		if (s && s.host) { goHome(); return; } 
		slowly(function () { window.architraveRestyling = true; try { applyNow(s, dials); } finally { window.architraveRestyling = false; } }); 
	}
	function applyNow(s, dials) {
		if (versionTimer && s && s.id !== current) versionNow();
		if (siteSaveTimer && s && s.id !== current) siteSaveNow(); 
		applying = true;
		stamp(s.id);
		press('[data-quire-modes="palette"] [data-palette="' + dials.palette + '"]');
		press('[data-reading-step="' + dials.reading + '"]');
		if (s.bare && dials.face === 'host') { root.removeAttribute('data-face'); try { localStorage.removeItem('architrave-face'); } catch (e) {  } }
		else press('[data-face-choice="' + dials.face + '"]');
		press('[data-leading-step="' + dials.leading + '"]');
		if (String(root.getAttribute('data-theme') || (Modes ? Modes.default : '')).split('-')[0] === dials.palette) applying = false;
		else { if (applyTimer) clearTimeout(applyTimer); applyTimer = setTimeout(function () { applying = false; remember(); }, 1500); }
		applyOptions();
		applyTint();
		applyColours();
		applySans();
		applyTracking();
		applyScope();
		applyPictures();
		applyCapLines();
		applyLevels();
		applyLineStyle();
		applyFadeEdges();
		applyMarkerColour();
		applyButton();
		applyPicks();
		applyEffects();
		applyFramePattern();
		applyCorners();
		mark();
	}
	
	function remember() {
		var s = byId(current), all = readTweaks(), dials = now();
		if (!s || s.host) return; 
		var entry = {}, held = all[s.id] || {};
		TWEAK_KEYS.forEach(function (k) { if (DIALS.indexOf(k) === -1 && held[k] !== undefined) entry[k] = held[k]; });
		if (entry.roles && held.architrave) entry.architrave = held.architrave;
		if (!same(dials, s)) DIALS.forEach(function (d) { entry[d] = dials[d]; });
		if (Object.keys(entry).length) all[s.id] = entry; else delete all[s.id];
		if (JSON.stringify(all) !== JSON.stringify(readTweaks())) writeTweaks(all);
		applyOptions(); 
		mark();
	}
	var SHOWN = ['standard']; 
	
	function mark() {
		var dials = now(), s = byId(current);
		var offStandard = current !== DEFAULT || !same(dials, STYLES[0]);
		document.querySelectorAll('[data-architrave-reset]').forEach(function (r) { r.hidden = !offStandard; });
		document.querySelectorAll('[data-preset]').forEach(function (b) {
			var p = byId(b.getAttribute('data-preset'));
			var on = !!p && p.id === current;
			var label = b.querySelector('.quire-menu-label');
			if (label) label.textContent = t(p.label) + (on && s && !same(dials, s) ? ' · ' + t('adjusted') : '');
			b.classList.toggle('is-selected', on);
			b.setAttribute('aria-checked', on ? 'true' : 'false');
		});
	}
	
	var VERSIONS_KEY = 'architrave-versions', VERSIONS_KEEP = 20, versionTimer = 0, versionFor = '', previewing = null;
	function readVersions() { try { var v = JSON.parse(localStorage.getItem(VERSIONS_KEY) || '{}'); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; } catch (e) { return {}; } }
	function versionSoon() { if (previewing || READER) return;  clearTimeout(versionTimer); versionFor = current; versionTimer = setTimeout(function () { versionTimer = 0; if (versionFor === current) keepVersion(); }, 60000); }
	function versionNow() { if (!versionTimer) return; clearTimeout(versionTimer); versionTimer = 0; if (versionFor === current) keepVersion(); }
	function lookOf(rec) { var o = {}; Object.keys(rec || {}).forEach(function (k) { if (k !== 'architrave' && k !== 'label' && k !== 'base' && k !== 'id') o[k] = rec[k]; }); return o; }
	function savedRecord() {
		var raw = null; try { raw = localStorage.getItem(TWEAKS_KEY); } catch (e) { return null; }
		var all = readTweaks(); if (!all[current]) return lookOf(JSON.parse(window.ArchitraveStyles.exportStyle() || '{}'));
		delete all[current];
		try { localStorage.setItem(TWEAKS_KEY, JSON.stringify(all)); } catch (e) {  }
		var out = lookOf(JSON.parse(window.ArchitraveStyles.exportStyle() || '{}'));
		try { if (raw === null) localStorage.removeItem(TWEAKS_KEY); else localStorage.setItem(TWEAKS_KEY, raw); } catch (e) {  }
		return out;
	}
	function keepVersion() {
		var s = byId(current); if (!s || s.host || previewing || READER) return false;
		var all = readVersions(), list = Array.isArray(all[s.id]) ? all[s.id] : [], rec = lookOf(JSON.parse(window.ArchitraveStyles.exportStyle() || '{}'));
		if (list[0] && JSON.stringify(list[0].record) === JSON.stringify(rec)) return false;
		if (!list.length && JSON.stringify(savedRecord()) === JSON.stringify(rec)) return false; 
		list.unshift({ t: Date.now(), record: rec }); if (list.length > VERSIONS_KEEP) list.length = VERSIONS_KEEP;
		all[s.id] = list;
		try { localStorage.setItem(VERSIONS_KEY, JSON.stringify(all)); } catch (e) {  }
		return true;
	}
	function entryFromRecord(rec) {
		var base = liftLeading(JSON.parse(JSON.stringify(savedRecord() || {})), true), e = {}, J = JSON.stringify;
		rec = liftLeading(JSON.parse(JSON.stringify(rec || {})), true); 
		['spaceInside', 'spaceItems', 'spaceSections', 'spaceTitle'].forEach(function (k) { if (typeof rec[k] === 'number') rec[k] = String(rec[k]); }); 
		if (DIALS.some(function (d) { return rec[d] !== undefined && rec[d] !== base[d]; })) DIALS.forEach(function (d) { e[d] = rec[d] !== undefined ? rec[d] : base[d]; });
		TWEAK_KEYS.forEach(function (k) { if (DIALS.indexOf(k) !== -1 || k === 'roles' || k === 'colours' || k === 'effects' || k === 'was') return; if (rec[k] !== undefined && J(rec[k]) !== J(base[k])) e[k] = rec[k]; });
		var roles = {}, ra = typeOf(rec), rb = typeOf(base);
		TYPE_ROLES.forEach(function (role) {
			var a = ra[role] || {}, b = rb[role] || {}, r = {};
			TYPE_DIALS[role].forEach(function (d) {
				var want = a[d] !== undefined ? a[d] : typeRest(role, d), was = b[d] !== undefined ? b[d] : typeRest(role, d);
				if (J(want) !== J(was) && want !== undefined) r[d] = want;
			});
			if (Object.keys(r).length) roles[role] = r;
		});
		if (Object.keys(roles).length) { e.roles = roles; e.architrave = 3; }
		var fxs = {};
		Object.keys(EFFECTS).forEach(function (fid) {
			var a = (rec.effects || {})[fid] || {}, b = (base.effects || {})[fid] || {}, r = {};
			Object.keys(EFFECTS[fid]).forEach(function (d) { var rest = EFFECTS[fid][d].rest, want = a[d] !== undefined ? a[d] : rest, was = b[d] !== undefined ? b[d] : rest; if (want !== was) r[d] = want; });
			if (Object.keys(r).length) fxs[fid] = r;
		});
		if (Object.keys(fxs).length) e.effects = fxs;
		var colours = {};
		['light', 'dark'].forEach(function (side) {
			var a = (rec.colours || {})[side] || {}, b = (base.colours || {})[side] || {}, c = {};
			Object.keys(a).concat(Object.keys(b)).forEach(function (k) { var want = a[k] !== undefined ? a[k] : ''; if (String(want).toLowerCase() !== String(b[k] || '').toLowerCase()) c[k] = want; });
			if (Object.keys(c).length) colours[side] = c;
		});
		if (Object.keys(colours).length) e.colours = colours;
		var rp = rec.preset || '', bp = base.preset || '', pr = presetById(rp);
		delete e.preset;
		if (rp !== bp) {
			if (pr) {
				e.preset = rp; e.colours = {};
				['light', 'dark'].forEach(function (side) { var c = publicSide(pr[side]), own = (rec.colours || {})[side] || {}; Object.keys(own).forEach(function (k) { c[colourKey(k)] = own[k]; }); e.colours[side] = c; });
			} else if (bp) { e.preset = ''; e.colours = {}; ['light', 'dark'].forEach(function (side) { if ((rec.colours || {})[side]) e.colours[side] = rec.colours[side]; }); }
		}
		return e;
	}
	function writeQuiet(all) { var was = undoing; undoing = true; writeTweaks(all); undoing = was; }
	function endPreview() {
		if (!previewing) return false;
		var p = previewing; previewing = null;
		try { if (p.raw === null) localStorage.removeItem(TWEAKS_KEY); else localStorage.setItem(TWEAKS_KEY, p.raw); } catch (e) {  }
		var s = byId(p.id); if (s) applyNow(s, wanted(s));
		return true;
	}
	window.addEventListener('pagehide', function () { endPreview(); versionNow(); });
	
	var SENT = 0;
	function sendSite(body) {
		if (!PUBLISH || !PUBLISH.url || !window.fetch) return Promise.reject(new Error('cannot publish'));
		var mine = ++SENT;
		return fetch(PUBLISH.url, {
			method: 'POST', credentials: 'same-origin', keepalive: true, 
			headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': PUBLISH.nonce },
			body: JSON.stringify(body)
		}).then(function (r) { return r.json().then(function (j) { if (!r.ok) { var e = new Error((j && j.message) || r.status); e.said = !!(j && j.code && j.message); throw e; } return j; }); }) 
		.then(function (state) { if (mine === SENT) { takeSite(state); renderHosts(); } return state; });
	}
	window.ArchitraveStyles = {
		list: STYLES,
		shown: function () {
			var all = STYLES.filter(offered);
			if (READER) {
				return this.visibleOrder().map(function (id) { return all.filter(function (s) { return s.id === id; })[0]; }).filter(Boolean);
			}
			var seen = this.visibleOrder(), rest = all.filter(function (s) { return seen.indexOf(s.id) === -1; });
			rest = rest.filter(function (s) { return !s.own && !s.site; })
				.concat(rest.filter(function (s) { return s.site; }))
				.concat(rest.filter(function (s) { return s.own; }).reverse());
			var mine = hiddenOrder();
			if (mine.length) rest = rest.filter(function (s) { return mine.indexOf(s.id) === -1; })
				.concat(mine.map(function (id) { return rest.filter(function (s) { return s.id === id; })[0]; }).filter(Boolean));
			return seen.map(byId).filter(Boolean).concat(rest);
		},
		setHiddenOrder: function (ids) { try { localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids || [])); } catch (e) {  } },
		isOwn: function (id) { var s = byId(id); return !!(s && s.own); },
		hostSide: function () { var h = byId('host'); return h && h.hostSide ? h.hostSide : ''; },
		isSite: function (id) { var s = byId(id); return !!(s && s.site); },
		isBase: function (id) { return !!(SITE && Array.isArray(SITE.base) && SITE.base.indexOf(id) !== -1); },
		
		guide: function () {
			var meaning = {};
			Object.keys(LIST.meaning).forEach(function (k) { meaning[k] = LIST.meaning[k]; });
			var recipes = {};
			STYLES.filter(function (x) { return !x.own && !x.site && SHOWN.indexOf(x.id) !== -1; }).forEach(function (x) {
				var rec = { architrave: 3, label: x.label, base: x.id };
				Object.keys(x).forEach(function (k) { if (k !== 'id' && k !== 'label' && k !== 'bold' && k !== 'preset' && inRecord(k)) rec[k] = x[k]; });
				var p = x.preset && presetById(x.preset);
				if (p) rec.colours = { light: { background: p.light.paper, text: p.light.ink, accent: p.light.accent }, dark: { background: p.dark.paper, text: p.dark.ink, accent: p.dark.accent } };
				recipes[x.id] = rec;
			});
			return {
				meaning: meaning,
				rules: [
					'Send only the keys you want to change from the base; a smaller record is a better record.',
					'The day leads: set the light colours, and the dark side works each one out from them unless you set it too. Check both sides.', 
					'Colours: seven per side, named for their job. background is the page the text sits on (people see Paper); background2 the space around it and the rails, a second background a theme may have (Ground); card what stands on the page: menus, boxes, fields (Cards); text; mutedText the quiet text of dates and captions (Soft text); accent the brand colour of links and main buttons; highlight the highlighter, left out for none. Leave out what you do not need: the rest is worked out from background and text.',
					'Contrast: text on background at 4.5:1 or better, accent on background at 3:1 or better, on both sides.',
					'A background2 on the other side of the background (dark around a light page, or light around a dark one) is a dark ground: it is worn around the page on wide screens, with its own words, lines and links.',
					'A detail shows only with its setting on: borderStyle and borderStrength need a borderWidth, frameWidth a pictureFrame, capLines and capface a dropcap, colourOnHover a pictureFilter.', 
					'Pick fonts from the listed ids only; the theme ships no others.',
					'To try a record without publishing it, open the site at /#style= followed by the base64url of the record JSON.'
				],
				typography: TYPE_MEANS,
				examples: recipes,
				colourPresets: PRESETS.map(function (p) { return { id: p.id, label: p.label, light: publicSide(p.light), dark: publicSide(p.dark) }; })
			};
		},
		schema: function () {
			var faces = (window.ArchitraveFaces || []).map(function (f) { return f.id; });
			var roles = {};
			TYPE_ROLES.forEach(function (r) {
				var o = {};
				(r === 'body' ? ['font'].concat(TYPE_DIALS[r].slice(0, 2), 'lineHeight', TYPE_DIALS[r].slice(2)) : r === 'interface' ? ['font'].concat(TYPE_DIALS[r]) : TYPE_DIALS[r]).forEach(function (d) {
					o[d] = d === 'font' && r === 'body' ? faces : d === 'font' && r === 'interface' ? SANS.map(function (x) { return x.id; }) : d === 'font' ? (r === 'code' ? [] : ['body', 'interface']).concat(Object.keys(FAMILY)) : d === 'size' ? TYPE_SIZES : d === 'categorySize' ? ['same'].concat(TYPE_SIZES) : d === 'weight' ? Object.keys(WEIGHT) : d === 'lineHeight' ? Object.keys(TYPE_LINE) : d === 'letterSpacing' ? Object.keys(TYPE_LETTER) : d === 'align' ? ALIGNS : d === 'colour' ? TYPE_COLOURS : 'boolean';
				});
				roles[r] = o;
			});
			var side = {}; WELL_KEYS.forEach(function (w) { side[w] = 'hex'; });
			var from = {
				architrave: 3,
				label: 'string, at most ' + LIST.labelMax + ' characters',
				base: STYLES.filter(function (x) { return !x.own && !x.site; }).map(function (x) { return x.id; }),
				palette: Modes && Modes.palettes ? Modes.palettes.map(function (p) { return p.id; }) : [],
				reading: window.QuireReading ? window.QuireReading.ids : [],
				lineLength: LAYOUT.lineLength.list, titleWidth: LAYOUT.titleWidth.list, pictureWidth: LAYOUT.pictureWidth.list, figureWidth: LAYOUT.figureWidth.list,
				pictureFilter: LAYOUT.pictureFilter.list, colourOnHover: 'boolean', dimInDark: 'boolean', pictureFrame: LAYOUT.pictureFrame.list, frameWidth: LAYOUT.frameWidth.list, pictureFade: LAYOUT.pictureFade.list, pictureShadow: LAYOUT.pictureShadow.list, pictureCorners: LAYOUT.pictureCorners.list,
				buttonColour: LAYOUT.buttonColour.list, buttonShape: LAYOUT.buttonShape.list, primaryButton: LAYOUT.primaryButton.list, secondaryButton: LAYOUT.secondaryButton.list, tertiaryButton: LAYOUT.tertiaryButton.list, tagsMatchButtons: 'boolean', currentItem: LAYOUT.currentItem.list,
				radius: LAYOUT.radius.list, borderWidth: LAYOUT.borderWidth.list, borderStyle: LAYOUT.borderStyle.list, borderStrength: LAYOUT.borderStrength.list,
				roles: roles,
				effects: (function () { var o = {}; Object.keys(EFFECTS).forEach(function (fid) { o[fid] = {}; Object.keys(EFFECTS[fid]).forEach(function (d) { o[fid][d] = EFFECTS[fid][d].list; }); }); return o; })(),
				colours: { light: side, dark: side }
			};
			var out = {};
			LIST.schema.forEach(function (k) {
				out[k] = k in from ? from[k] : OPTS.indexOf(k) !== -1 ? 'boolean' : LEVELS[k] ? LEVELS[k].stops : PICKS[k] ? PICKS[k].list : LIST.choices[k];
			});
			return out;
		},
		siteDefault: function () { return DEFAULT === NONE ? '' : DEFAULT; },
		canPublish: function () { return !!(PUBLISH && PUBLISH.url && window.fetch); },
		publish: function (name, makeDefault) {
			var s = byId(current); if (!s) return Promise.reject(new Error('no style'));
			var record = JSON.parse(this.exportStyle());
			return sendSite({ action: 'publish', record: record, name: String(name || '').trim().slice(0, 40), 'default': !!makeDefault }).then(function (state) {
				var all = readTweaks(); delete all[s.id]; writeTweaks(all);
				var landed = state.styles[state.styles.length - 1];
				var e = landed && byId(landed.id); if (e) apply(e, e);
				return e ? e.id : null;
			});
		},
		
		seenByReaders: function (id) {
			var s = byId(id); if (!s) return false;
			return !!(s.host || id === DEFAULT || readerPicks().indexOf(id) !== -1);
		},
		makeDefault: function (id) {
			if (!byId(id)) return Promise.reject(new Error('no style'));
			var self = this, go = byId(id).own ? this.publishOwn(id, false) : Promise.resolve(id);
			return go.then(function (nid) {
				nid = nid || id;
				var order = self.visibleOrder(), wasDefault = SITE['default'] || '', def = isOriginal(nid) ? '' : nid;
				if (def && order.indexOf(def) === -1) order = order.concat([def]);
				var picks = order.filter(function (x) { return !isOriginal(x); }), wasReaders = SITE.readers;
				SITE['default'] = def; SITE.readers = picks.slice(); takeSite(SITE); renderHosts();
				return sendSite({ action: 'readers', ids: picks })
					.then(function () { return def !== wasDefault ? sendSite({ action: 'default', id: def }) : null; })
					.then(function () { mark(); return true; }, function (e) { SITE['default'] = wasDefault; SITE.readers = wasReaders; takeSite(SITE); renderHosts(); throw e; });
			});
		},
		
		unpublishKeep: function (id) {
			var s = byId(id); if (!s || !s.site) return Promise.reject(new Error('not a site style'));
			var rec = JSON.parse(JSON.stringify(s)); delete rec.site; rec.architrave = 1;
			var wasCurrent = current === id, carried = readTweaks()[id]; 
			return sendSite({ action: 'remove', id: id }).then(function () {
				var entry = ownFromRecord(rec, s.label);
				if (carried) { var all = readTweaks(); all[entry.id] = carried; writeTweaks(all); }
				renderHosts();
				if (wasCurrent || !byId(current)) apply(entry, entry); else mark();
				return entry.id;
			});
		},
		setSeen: function (id, on) {
			if (!byId(id)) return Promise.reject(new Error('no style'));
			if (!on && byId(id).site) { var self = this; return this.unpublishKeep(id).then(function () { return self.setVisible(self.visibleOrder()); }); }
			var order = this.visibleOrder().filter(function (x) { return x !== id; });
			return this.setVisible(on ? order.concat([id]) : order);
		},
		rename: function (id, name) {
			var s = byId(id); name = String(name || '').trim().slice(0, 40);
			if (!s || !name) return Promise.reject(new Error('nothing to rename'));
			if (s.own) { s.label = name; writeOwn(); renderHosts(); return Promise.resolve(true); }
			if (!s.site) return Promise.reject(new Error('a built-in style keeps its name'));
			return refreshSite(true).then(function () { 
				var now = byId(id); if (!now || !now.site) throw new Error('no such style');
				var record = JSON.parse(JSON.stringify(now)); delete record.site; record.label = name;
				return sendSite({ action: 'update', id: id, record: record }).then(function () { return true; });
			});
		},
		publishOwn: function (id, makeDefault) {
			var s = byId(id); if (!s || !s.own) return Promise.reject(new Error('not your style'));
			if (current !== id) applyNow(s, wanted(s));
			return this.publish(s.label, makeDefault).then(function (newId) {
				if (newId) {
					if (PENDING) { var k = PENDING.indexOf(id); if (k !== -1) PENDING[k] = newId; } 
					var o = byId(id), all = readTweaks();
					if (all[id]) { delete all[id]; writeTweaks(all); }
					if (o) { STYLES.splice(STYLES.indexOf(o), 1); writeOwn(); renderHosts(); }
				}
				return newId;
			});
		},
		siteSaving: function (id) { return siteSaving === id || (!!siteSaveTimer && current === id); },
		refreshSite: function (now) { return refreshSite(now); },
		updateSite: function () {
			var s = byId(current); if (!s || !s.site) return Promise.reject(new Error('not a site style'));
			var record = JSON.parse(this.exportStyle()); record.label = s.label;
			var rawOf = function (id) { try { return JSON.stringify((JSON.parse(localStorage.getItem(TWEAKS_KEY) || '{}') || {})[id] || null); } catch (e) { return ''; } }; 
			var sent = rawOf(s.id), whole = this.exportStyle();
			return sendSite({ action: 'update', id: s.id, record: record }).then(function () {
				siteSent[s.id] = whole;
				var all = readTweaks();
				if (rawOf(s.id) === sent) { delete all[s.id]; previewing = true; try { writeTweaks(all); } finally { previewing = null; } }
				if (current === s.id) mark();
				return true;
			});
		},
		unpublish: function (id) {
			var s = byId(id); if (!s || !s.site) return Promise.reject(new Error('not a site style'));
			return sendSite({ action: 'remove', id: id }).then(function () {
				var all = readTweaks(); delete all[id]; writeTweaks(all);
				if (!byId(current)) apply(STYLES[0], wanted(STYLES[0])); else mark();
				return true;
			});
		},
		reader: function () { return READER; },
		readers: function () { return readerPicks().filter(function (id) { return id !== DEFAULT && !!byId(id); }); }, 
		readerFirst: function () { return DEFAULT; },
		readersCopy: function () { return !!(SITE && SITE.readersCopy); },
		setReadersCopy: function (on) {
			var was = SITE.readersCopy; SITE.readersCopy = !!on; 
			return sendSite({ action: 'readers-copy', on: !!on }).then(function () { return true; }, function (e) { SITE.readersCopy = was; throw e; });
		},
		button: function () { return SITE && SITE.button ? SITE.button : null; },
		setButton: function (key, value) {
			if (!SITE || !SITE.button) return Promise.reject(new Error('no button'));
			var was = SITE.button, next = {};
			Object.keys(was).forEach(function (k) { next[k] = was[k]; });
			next[key] = value;
			if (key === 'place' && value !== 'auto') next.fixed = value; 
			SITE.button = next;
			window.dispatchEvent(new CustomEvent('architrave-button-settings', { detail: { settings: next, picked: key } }));
			return sendSite({ action: 'button', settings: next }).then(function () { return true; }, function (e) {
				SITE.button = was;
				window.dispatchEvent(new CustomEvent('architrave-button-settings', { detail: { settings: was } }));
				throw e;
			});
		},
		visibleOrder: function () {
			if (PENDING) return PENDING.filter(function (id) { return !!byId(id); });
			var first = STYLES.filter(function (x) { return isOriginal(x.id); }).map(function (x) { return x.id; });
			var picks = readerPicks().filter(function (id) { return first.indexOf(id) === -1 && !!byId(id); });
			if (DEFAULT && !isOriginal(DEFAULT) && picks.indexOf(DEFAULT) === -1 && byId(DEFAULT)) picks.unshift(DEFAULT);
			return first.concat(picks.filter(function (id, i) { return picks.indexOf(id) === i; }));
		},
		setVisible: function (ids) {
			var self = this;
			ids = (ids || []).filter(function (id, i, a) { return !!byId(id) && a.indexOf(id) === i; });
			if (!ids.length) return Promise.reject(new Error('nothing to show'));
			var owns = ids.filter(function (id) { return byId(id).own; });
			PENDING = ids;
			var chain = owns.reduce(function (p, id) {
				return p.then(function () { return self.publishOwn(id, false).then(function (nid) { var k = ids.indexOf(id); if (nid && k !== -1) ids[k] = nid; }); });
			}, Promise.resolve());
			return chain.then(function () {
				var picks = ids.filter(function (id) { return !isOriginal(id); }); 
				var def = SITE['default'] || '';
				if (def && picks.indexOf(def) === -1) def = '';
				var wasDefault = SITE['default'] || '', wasReaders = SITE.readers;
				if (def !== null) SITE['default'] = def;
				SITE.readers = picks.slice();
				PENDING = null; takeSite(SITE); renderHosts(); 
				return sendSite({ action: 'readers', ids: picks })
					.then(function () { return def !== null && def !== wasDefault ? sendSite({ action: 'default', id: def }) : null; })
					.then(function () { mark(); return true; }, function (e) { SITE['default'] = wasDefault; SITE.readers = wasReaders; takeSite(SITE); renderHosts(); throw e; });
			}, function (e) { PENDING = null; renderHosts(); throw e; });
		},
		setReaders: function (ids) {
			var was = SITE.readers; SITE.readers = (ids || []).slice();
			return sendSite({ action: 'readers', ids: (ids || []) }).then(function () { return true; }, function (e) { SITE.readers = was; throw e; });
		},
		setSiteDefault: function (id) {
			return sendSite({ action: 'default', id: id || '' }).then(function () { mark(); return true; });
		},
		colours: coloursResolved, 
		highlight: highlightNow,
		setHighlight: function (hex) { if (hex && !/^#[0-9a-f]{6}$/i.test(hex)) return; setBothSides('highlight', hex || ''); },
		groundNudged: function (side) { return !!GROUND_NUDGED[side || ((root.getAttribute('data-theme') || '').split('-')[1] === 'dark' ? 'dark' : 'light')]; },
		otherGround: function (side) {
			side = side || ((root.getAttribute('data-theme') || '').split('-')[1] === 'dark' ? 'dark' : 'light');
			var other = side === 'light' ? 'dark' : 'light', o = coloursResolved()[other];
			return o.ground && !groundFlip(o.ground, o.paper || paperNow(other), o.ink) ? o.ground : o.paper ? sink(o.paper, 0.05) : canvasOf(other);
		},
		groundSides: function () { return groundSides(); },
		presets: function () { return PRESETS.map(function (p) { return { id: p.id, label: p.label, light: { paper: p.light.paper, ink: p.light.ink, accent: p.light.accent }, dark: { paper: p.dark.paper, ink: p.dark.ink, accent: p.dark.accent }, fresh: !!p.fresh, group: p.group || '', fixed: !!p.fixed }; }); },
		swatchList: function (key) { return (LISTS[COLOUR_ENGINE[key] || key] || []).map(function (x) { return { id: x.id, label: x.label, light: x.light, dark: x.dark }; }); },
		listColour: listColourOf,
		setListColour: function (key, id) {
			key = colourKey(key);
			var x = (LISTS[COLOUR_ENGINE[key] || key] || []).filter(function (c) { return c.id === id; })[0];
			if (!x) return;
			var all = readTweaks(), entry = all[current] || {};
			entry.colours = entry.colours || {};
			var cur = byId(current), one = cur && cur.host && cur.hostSide;
			['light', 'dark'].forEach(function (side) { entry.colours[side] = entry.colours[side] || {}; delete entry.colours[side][COLOUR_ENGINE[key]]; entry.colours[side][key] = x[one || side]; });
			if (BESIDE_PRESET.indexOf(key) === -1) letGoPreset(entry); 
			all[current] = entry;
			writeTweaks(all);
			if (key === 'accent' && !accentOn()) { try { localStorage.removeItem(ACCENT_KEY); } catch (e) {  } applyAccent(); }
			applyColours(); mark();
		},
		accentColour: accentColourOf,
		custom: function () {
			if (presetOf()) return false;
			var s0 = byId(current);
			if (s0 && s0.host) {
				var e0 = (readTweaks()[current] || {}).colours || {};
				return ['light', 'dark'].some(function (sd) { return Object.keys(e0[sd] || {}).some(function (k) { return BESIDE_PRESET.indexOf(colourKey(k)) === -1 && !!e0[sd][k]; }); });
			}
			var c = coloursOf(null, true);
			return ['light', 'dark'].some(function (sd) { return Object.keys(c[sd] || {}).some(function (k) { return BESIDE_PRESET.indexOf(colourKey(k)) === -1; }); }); 
		},
		setCustom: function (on, seed) {
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (on) {
				var c = coloursOf(null, true); 
				if (entry.preset) { entry.was = entry.preset; delete entry.preset; }
				else if (s && s.preset && entry.preset === undefined) { entry.was = s.preset; entry.preset = ''; var preG = presetById(s.preset); ['light', 'dark'].forEach(function (sd) { if (preG && preG.ground && typeof preG.ground === 'object' && preG.ground[sd]) c[sd].ground = preG.ground[sd]; if (preG && preG.lift && preG.lift[sd]) c[sd].lift = preG.lift[sd]; });  entry.colours = { light: { paper: c.light.paper, ink: c.light.ink, accent: c.light.accent, ground: c.light.ground, lift: c.light.lift }, dark: { paper: c.dark.paper, ink: c.dark.ink, ground: c.dark.ground, lift: c.dark.lift, accent: c.dark.accent } }; }
				if (s && s.host) {
					['light', 'dark'].forEach(function (sd) {
						var have = c[sd] || {}, pick = {};
						['paper', 'ink', 'accent'].forEach(function (k) { var v = have[k] || (seed && seed[k]); if (/^#[0-9a-f]{6}$/i.test(v || '')) pick[k] = v.toLowerCase(); });
						if (Object.keys(pick).length) { entry.colours = entry.colours || {}; entry.colours[sd] = pick; }
					});
				} else if (!Object.keys(c.light).length && !Object.keys(c.dark).length && seed) {
					var side = (String(root.getAttribute('data-theme') || (Modes ? Modes.default : 'neutral-light')).split('-')[1]) === 'dark' ? 'dark' : 'light';
					entry.colours = entry.colours || {}; entry.colours[side] = entry.colours[side] || {};
					['paper', 'ink', 'accent'].forEach(function (k) { if (/^#[0-9a-f]{6}$/i.test(seed[k] || '')) entry.colours[side][k] = seed[k].toLowerCase(); });
				}
				all[current] = entry; writeTweaks(all); applyColours(); mark();
				return;
			}
			var back = entry.was || '';
			delete entry.was; delete entry.colours;
			if (s && s.preset && back === s.preset) { delete entry.preset; if (Object.keys(entry).length) all[current] = entry; else delete all[current]; writeTweaks(all); applyColours(); mark(); return; }
			['light', 'dark'].forEach(function (side) {
				var own = (s && (s.own || s.site) && s.colours && s.colours[side]) || null;
				if (!own) return;
				entry.colours = entry.colours || {}; entry.colours[side] = entry.colours[side] || {};
				['background', 'text', 'accent'].forEach(function (k) { if (own[k] || own[COLOUR_ENGINE[k]]) entry.colours[side][k] = ''; });
			});
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			if (back) { window.ArchitraveStyles.setPreset(back); return; }
			applyColours(); mark();
		},
		pairTint: function (id) { return PAIR_TINTS[id] || ''; },
		preset: presetOf,
		setPreset: function (id) {
			var p = presetById(id);
			var all = readTweaks(), entry = all[current] || {};
			if (!p) {
				if (entry.preset) delete entry.colours;
				var own = byId(current);
				if (own && own.preset) entry.preset = ''; else delete entry.preset;
				if (Object.keys(entry).length) all[current] = entry; else delete all[current];
				writeTweaks(all); applyColours(); mark(); return;
			}
			var keep = entry.colours || {};
			entry.colours = { light: { background: p.light.paper, text: p.light.ink, accent: p.light.accent }, dark: { background: p.dark.paper, text: p.dark.ink, accent: p.dark.accent } };
			['light', 'dark'].forEach(function (sd) { [['ground', 'background2'], ['lift', 'card'], ['muted', 'mutedText']].forEach(function (k) { if (p[sd][k[0]]) entry.colours[sd][k[1]] = p[sd][k[0]]; }); });
			['light', 'dark'].forEach(function (sd) { Object.keys(keep[sd] || {}).forEach(function (k) { if (BESIDE_PRESET.indexOf(colourKey(k)) !== -1) entry.colours[sd][colourKey(k)] = keep[sd][k]; }); });
			entry.preset = p.id;
			all[current] = entry;
			writeTweaks(all);
			if (!accentOn()) { try { localStorage.removeItem(ACCENT_KEY); } catch (e) {  } applyAccent(); }
			applyColours(); mark();
		},
		contrast: contrast,
		writingOn: writingOn, 
		paperOf: paperOf,
		setColour: function (side, key, hex) {
			key = colourKey(key); 
			if (['light', 'dark'].indexOf(side) === -1 || WELL_KEYS.indexOf(key) === -1 || !/^#[0-9a-f]{6}$/i.test(hex || '')) return;
			var all = readTweaks(), entry = all[current] || {};
			entry.colours = entry.colours || {}; entry.colours[side] = entry.colours[side] || {};
			var presetsWere = [presetById(presetOf()), presetById((byId(current) || {}).preset)];
			var dayLeads = function () {
				if (side !== 'light') return;
				var dk = entry.colours.dark, sNow = byId(current), hostDark = ((byId('host') || {}).colours || {}).dark || {};
				if (dk && dk[key] === '') return;
				if (sNow && sNow.bare && !(dk && (dk[key] || dk[COLOUR_ENGINE[key]]))) {
					var mineDark = sNow.colours && sNow.colours.dark && (sNow.colours.dark[key] || sNow.colours.dark[COLOUR_ENGINE[key]]), theirs = hostDark[key] || hostDark[COLOUR_ENGINE[key]];
					if (mineDark && theirs && String(mineDark).toLowerCase() === String(theirs).toLowerCase()) { entry.colours.dark = dk || {}; entry.colours.dark[key] = ''; return; }
				}
				if (!entry.colours.dark || darkByHand(entry, key, presetsWere)) return;
				if (key === 'background2' && groundFlip(hex, (coloursResolved().light || {}).paper || paperNow('light'))) return;
				delete entry.colours.dark[key]; delete entry.colours.dark[COLOUR_ENGINE[key]]; if (!Object.keys(entry.colours.dark).length) delete entry.colours.dark;
			};
			dayLeads();
			delete entry.colours[side][COLOUR_ENGINE[key]];
			entry.colours[side][key] = hex.toLowerCase();
			if (BESIDE_PRESET.indexOf(key) === -1) {
				letGoPreset(entry); 
				dayLeads(); 
			}
			all[current] = entry; writeTweaks(all);
			applyColours(); mark();
		},
		clearColour: function (side, key) {
			key = colourKey(key);
			var all = readTweaks(), entry = all[current] || {}, s = byId(current);
			if (entry.colours && entry.colours[side]) { delete entry.colours[side][key]; delete entry.colours[side][COLOUR_ENGINE[key]]; if (!Object.keys(entry.colours[side]).length) delete entry.colours[side]; }
			if (entry.colours && !Object.keys(entry.colours).length) delete entry.colours;
			if (s && (s.own || s.site) && s.colours && s.colours[side] && (s.colours[side][key] || s.colours[side][COLOUR_ENGINE[key]])) { entry.colours = entry.colours || {}; entry.colours[side] = entry.colours[side] || {}; entry.colours[side][key] = ''; }
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyColours(); mark();
		},
		
		exportStyle: function () {
			var s = byId(current); if (!s) return '';
			var tw = readTweaks()[current] || {}, w = wanted(s), out = { architrave: 3, label: s.label, base: baseOf(s) };
			DIALS.forEach(function (d) { out[d] = w[d]; });
			OPTS.forEach(function (k) { out[k] = optionOn(k); });
			var loose = followers();
			out.tint = tintOf(); out.sans = sansOf(); out.scope = scopeOf(); out.pictures = picturesOf(); out.capLines = capLinesOf(); out.button = buttonOf(); Object.keys(PICKS).forEach(function (k) { out[k] = pickOf(k); }); out.line = levelOf('line'); out.fill = levelOf('fill'); out.softlevel = levelOf('softlevel'); out.quietlevel = levelOf('quietlevel'); out.smallsoft = levelOf('smallsoft'); out.linestyle = lineStyleOf(); out.corners = cornersOf(); out.fadeedges = fadeEdgesOf(); out.markercolour = markerColourOf(); out.framepattern = framePatternOf(); out.measure = levelOf('measure'); Object.keys(LAYOUT).forEach(function (k) { out[k] = layoutOf(k); }); out.space = levelOf('space'); ['spaceInside', 'spaceItems', 'spaceSections', 'spaceTitle'].forEach(function (k) { out[k] = levelOf(k); }); out.framewidth = levelOf('framewidth');
			loose.forEach(function (k) { delete out[k]; }); 
			out.roles = typeMerged(s, tw);
			var lhOut = { dense: 'tight', tight: 'snug', airy: 'relaxed', wide: 'loose' }[out.leading];
			delete out.leading;
			if (lhOut) { out.roles.body = out.roles.body || {}; out.roles.body.lineHeight = lhOut; }
			if (out.face) { out.roles.body = out.roles.body || {}; out.roles.body.font = out.face; }
			if (out.sans) { out.roles['interface'] = out.roles['interface'] || {}; out.roles['interface'].font = out.sans; }
			delete out.face; delete out.sans;
			var fxOut = effectsOf(s, tw); if (Object.keys(fxOut).length) out.effects = fxOut;
			writeColours(out);
			ENGINE_ONLY.forEach(function (k) { delete out[k]; }); 
			return JSON.stringify(out);
		},
		importStyle: function (text, name) {
			var data;
			try { data = JSON.parse(String(text || '').trim()); } catch (e) { return null; }
			if (!data || [1, 2, 3].indexOf(data.architrave) === -1) return null;
			var entry = ownFromRecord(data, name);
			renderHosts();
			apply(entry, entry);
			return entry.id;
		},
		shareLink: function (whole) {
			var s = byId(current); if (!s) return '';
			var base = window.location.origin + window.location.pathname;
			if (!whole && !s.own && !this.adjusted(s.id)) return base + '?style=' + encodeURIComponent(s.id);
			var record = JSON.parse(this.exportStyle());
			return base + '#style=' + encodeRecord(record);
		},
		importLink: function (text) {
			var self = this, url;
			try { url = new URL(String(text || '').trim()); } catch (e) { return Promise.resolve(null); }
			var m = /^#style=(.+)$/.exec(url.hash), data = m && decodeRecord(m[1]);
			if (data) return Promise.resolve(self.importStyle(JSON.stringify(data)));
			var id = url.searchParams.get('style');
			if (!id) return Promise.resolve(null);
			if (url.origin === window.location.origin && byId(id)) { var p = byId(id); apply(p, wanted(p)); return Promise.resolve(p.id); }
			if (!/^site-[a-z0-9]+$/.test(id) || !window.fetch) return Promise.resolve(null);
			return fetch(url.origin + '/?rest_route=' + encodeURIComponent('/architrave/v1/site-styles/' + id), { mode: 'cors' })
				.then(function (r) { return r.ok ? r.json() : null; })
				.then(function (rec) { return rec && [1, 2, 3].indexOf(rec.architrave) !== -1 ? self.importStyle(JSON.stringify(rec)) : null; })
				.catch(function () { return null; });
		},
		duplicate: function (id) {
			var s = byId(id); if (!s) return null;
			var record, name = t('{name} copy').replace('{name}', s.site || s.own ? s.label : t(s.label));
			var taken = function (l) { return STYLES.some(function (x) { return (x.site || x.own ? x.label : t(x.label)) === l; }); };
			if (taken(name)) { var nth = 2; while (taken(name + ' ' + nth)) nth++; name = name + ' ' + nth; }
			if (id === current) record = JSON.parse(this.exportStyle());
			else {
				var tw = readTweaks()[id] || {}, w = wanted(s);
				record = {};
				Object.keys(s).forEach(function (k) { record[k] = s[k]; });
				Object.keys(tw).forEach(function (k) { if (k !== 'roles' && k !== 'effects') record[k] = tw[k]; });
				var fxDup = effectsOf(s, tw); if (Object.keys(fxDup).length) record.effects = fxDup; else delete record.effects;
				DIALS.forEach(function (d) { record[d] = w[d]; });
				record.roles = typeMerged(s, tw);
				record.architrave = 3;
				record.base = baseOf(s);
				var cDup = coloursOf(id, true); record.colours = {};
				['light', 'dark'].forEach(function (side) { if (Object.keys(cDup[side]).length) record.colours[side] = publicSide(cDup[side]); });
				if (!Object.keys(record.colours).length) delete record.colours;
				delete record.preset; delete record.was;
			}
			var entry = ownFromRecord(record, name);
			if (s.host || s.bare) { entry.bare = true; entry.hostFace = s.hostFace; if (!entry.colours) entry.colours = s.colours; writeOwn(); }
			renderHosts();
			return entry.id;
		},
		saveAs: function (name) {
			var s = byId(current); if (!s) return null;
			var tw = readTweaks()[current] || {}, w = wanted(s);
			var entry = { id: 'own-' + Date.now().toString(36), label: String(name || '').trim().slice(0, 40) || t('My style'), own: true, base: baseOf(s) };
			if (s.host || s.bare) { entry.bare = true; entry.hostFace = s.hostFace; entry.colours = s.colours; }
			DIALS.forEach(function (d) { entry[d] = s.host ? now()[d] : w[d]; });
			OPTS.forEach(function (k) { entry[k] = optionOn(k); });
			var loose = followers();
			entry.tint = tintOf(); entry.sans = sansOf(); entry.scope = scopeOf(); entry.pictures = picturesOf(); entry.capLines = capLinesOf(); entry.button = buttonOf(); Object.keys(PICKS).forEach(function (k) { entry[k] = pickOf(k); }); entry.line = levelOf('line'); entry.fill = levelOf('fill'); entry.softlevel = levelOf('softlevel'); entry.quietlevel = levelOf('quietlevel'); entry.smallsoft = levelOf('smallsoft'); entry.linestyle = lineStyleOf(); entry.corners = cornersOf(); entry.fadeedges = fadeEdgesOf(); entry.markercolour = markerColourOf(); entry.framepattern = framePatternOf(); entry.measure = levelOf('measure'); Object.keys(LAYOUT).forEach(function (k) { entry[k] = layoutOf(k); }); entry.space = levelOf('space'); ['spaceInside', 'spaceItems', 'spaceSections', 'spaceTitle'].forEach(function (k) { entry[k] = levelOf(k); }); entry.framewidth = levelOf('framewidth');
			loose.forEach(function (k) { delete entry[k]; }); 
			ENGINE_ONLY.forEach(function (k) { if (k !== 'palette') delete entry[k]; }); 
			entry.roles = typeMerged(s, tw); entry.architrave = 3;
			var fxSave = effectsOf(s, tw); if (Object.keys(fxSave).length) entry.effects = fxSave;
			writeColours(entry);
			var all = readTweaks(); delete all[current]; writeTweaks(all);
			STYLES.push(entry); writeOwn(); renderHosts();
			apply(entry, entry);
			return entry.id;
		},
		update: function () {
			var s = byId(current); if (!s || !s.own) return false;
			var tw = readTweaks()[current] || {}, w = wanted(s);
			DIALS.forEach(function (d) { s[d] = w[d]; });
			OPTS.forEach(function (k) { s[k] = optionOn(k); });
			var loose = followers();
			s.tint = tintOf(); s.sans = sansOf(); s.scope = scopeOf(); s.pictures = picturesOf(); s.capLines = capLinesOf(); s.button = buttonOf(); Object.keys(PICKS).forEach(function (k) { s[k] = pickOf(k); }); s.line = levelOf('line'); s.fill = levelOf('fill'); s.softlevel = levelOf('softlevel'); s.quietlevel = levelOf('quietlevel'); s.smallsoft = levelOf('smallsoft'); s.linestyle = lineStyleOf(); s.corners = cornersOf(); s.fadeedges = fadeEdgesOf(); s.markercolour = markerColourOf(); s.framepattern = framePatternOf(); s.measure = levelOf('measure'); Object.keys(LAYOUT).forEach(function (k) { s[k] = layoutOf(k); }); s.space = levelOf('space'); ['spaceInside', 'spaceItems', 'spaceSections', 'spaceTitle'].forEach(function (k) { s[k] = levelOf(k); }); s.framewidth = levelOf('framewidth');
			loose.forEach(function (k) { delete s[k]; }); 
			ENGINE_ONLY.forEach(function (k) { if (k !== 'palette') delete s[k]; }); 
			s.roles = typeMerged(s, tw); s.architrave = 3;
			var fxUp = effectsOf(s, tw); if (Object.keys(fxUp).length) s.effects = fxUp; else delete s.effects;
			writeColours(s);
			var all = readTweaks(); delete all[current]; writeTweaks(all);
			writeOwn(); apply(s, s);
			return true;
		},
		remove: function (id) {
			var s = byId(id); if (!s || !s.own) return;
			var all = readTweaks(); delete all[id]; writeTweaks(all);
			STYLES.splice(STYLES.indexOf(s), 1); writeOwn(); renderHosts();
			if (current === id) apply(STYLES[0], wanted(STYLES[0]));
		},
		current: function () { return current; },
		restSize: function (role) { return ROLE_DEFAULT[role] ? rungFor(role, ROLE_DEFAULT[role].size) : null; }, 
		adjusted: function (id) {
			var s = byId(id); if (!s) return false;
			if (readTweaks()[id]) return true;
			return id === current && !same(now(), s);
		},
		option: optionOn,
		setOption: function (k, on) {
			if (k === 'soft') { this.setType('body', 'colour', on ? 'mutedText' : 'text'); return; }
			if (k === 'widehead') { this.setLayout('titleWidth', on ? 'wide' : 'content'); return; }
			if (k === 'rounded') { this.setLayout('radius', on ? (layoutOf('radius') === 'none' ? 'medium' : layoutOf('radius')) : 'none'); return; }
			if (k === 'lines') { this.setLayout('borderWidth', on ? (layoutOf('borderWidth') === 'none' ? '1' : layoutOf('borderWidth')) : 'none'); return; }
			if (k === 'hairlines') { if (layoutOf('borderWidth') !== 'none') this.setLayout('borderWidth', on ? 'hairline' : '1'); return; }
			if (k === 'tagsfollow') { this.setLayout('tagsMatchButtons', !!on); return; }
			if (k === 'picturehover') { this.setLayout('colourOnHover', !!on); return; }
			if (k === 'picturedim') { this.setLayout('dimInDark', !!on); return; }
			if (k === 'pictureframe') { this.setLayout('pictureFrame', on ? (layoutOf('pictureFrame') === 'none' ? 'plain' : layoutOf('pictureFrame')) : 'none'); return; }
			if (k === 'picturefade') { this.setLayout('pictureFade', on ? (layoutOf('pictureFade') === 'none' ? 'sides' : layoutOf('pictureFade')) : 'none'); return; }
			if (k === 'fills') return; 
			if (k === 'widepicture') { this.setLayout('pictureWidth', on ? (layoutOf('pictureWidth') === 'full' ? 'full' : 'wide') : 'content'); return; }
			if (k === 'marker') { setBothSides('highlight', on ? (highlightNow() || PENS.yellow) : ''); return; }
			if (k === 'darkground') { var cr = coloursResolved(); if (on) this.setColour('light', 'background2', cr.dark.ground && !groundFlip(cr.dark.ground, cr.dark.paper || paperNow('dark')) ? cr.dark.ground : cr.dark.paper ? sink(cr.dark.paper, 0.05) : canvasOf('dark')); else if (groundSides(cr).light) this.clearColour('light', 'background2'); return; }
			if (OPTS.indexOf(k) === -1) return;
			var all = readTweaks(), entry = all[current] || {};
			if (!!on === restOf(k)) delete entry[k]; else entry[k] = !!on;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyOptions(); applyPicks(); applyLevels(); mark(); 
		},
		tints: TINTS,
		tint: tintOf,
		sans: SANS,
		sansNow: sansOf,
		setSans: function (v) {
			if (!SANS.some(function (f) { return f.id === v; })) return;
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && s.sans) || SANS[0].id) && !(window.architravePanelGuest && s && s.host)) delete entry.sans; else entry.sans = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applySans(); mark();
		},
		tracking: TRACKING,
		trackingNow: trackingOf,
		setTracking: function (v) { this.setRole('read', 'tracking', v); },
		roles: ROLES,
		role: roleOf,
		faceOf: realFace, 
		weights: Object.keys(WEIGHT),
		weightsFor: weightsFor,
		sizesFor: sizesFor,
		wanted: function (id) { var s = byId(id); return s ? wanted(s) : {}; }, 
		hasItalic: hasItalic,
		
		members: function (role) {
			var v = roleOf(role), f = sizeFactor(role, v.size);
			return membersOf(role).map(function (m) {
				var own = (!m.lead && v.members && v.members[m.id]) || {};
				return {
					id: m.id, rest: m.rest, lead: !!m.lead, bound: !Object.keys(own).length,
					own: own,
					size: m.lead ? String(v.size) : own.size !== undefined ? own.size : String(Math.round(m.rest * f)),
					weight: own.weight !== undefined ? fitWeight(v.face, own.weight) : (v.weight !== ROLE_DEFAULT[role].weight || !m.weight ? v.weight : fitWeight(v.face, m.weight)), 
					caps: own.caps !== undefined ? own.caps : v.caps,
					tracking: own.tracking !== undefined ? own.tracking : v.tracking,
					align: v.align === undefined ? undefined : own.align !== undefined ? own.align : v.align
				};
			});
		},
		memberSizes: function (role) { return sizesFor(role); },
		memberDials: MEMBER_DIALS,
		memberDialsFor: memberDialsOf,
		aligns: ALIGNS,
		setMember: function (role, id, dial, value) {
			return; 
			var m = membersOf(role).filter(function (x) { return x.id === id; })[0];
			if (!m || m.lead) return;
			var v = roleOf(role), set = {};
			Object.keys(v.members || {}).forEach(function (k) { var o = {}; Object.keys(v.members[k]).forEach(function (d) { o[d] = v.members[k][d]; }); set[k] = o; });
			if (dial === null || dial === undefined) delete set[id];
			else if (memberDialsOf(role).indexOf(dial) !== -1) {
				set[id] = set[id] || {};
				if (value === null || value === undefined) delete set[id][dial];
				else if (dial === 'size') set[id].size = ownSize(role, value); 
				else if (dial === 'weight') set[id].weight = WEIGHT_ALIAS[value] || value;
				else if (dial === 'caps') set[id].caps = !!value;
				else if (dial === 'align') set[id].align = ALIGNS.indexOf(value) !== -1 ? value : 'default';
				else set[id].tracking = TRACK_ALIAS[value] || value;
				if (!Object.keys(set[id]).length) delete set[id];
			}
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			var base = (s && s.roles && s.roles[role] && s.roles[role].members) || {};
			var same = JSON.stringify(set) === JSON.stringify((function () { var o = {}; Object.keys(base).sort().forEach(function (k) { o[k] = base[k]; }); return o; })()) ;
			entry.roles = entry.roles || {}; entry.roles[role] = entry.roles[role] || {};
			if (same) delete entry.roles[role].members; else entry.roles[role].members = set;
			if (!Object.keys(entry.roles[role]).length) delete entry.roles[role];
			if (!Object.keys(entry.roles).length) delete entry.roles;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyRoles(); mark();
		},
		typeRoles: TYPE_ROLES,
		typeDials: function (role) { return TYPE_DIALS[role] ? (role === 'body' ? ['font', 'size', 'weight', 'lineHeight', 'letterSpacing', 'capitals', 'italic', 'colour'] : role === 'interface' ? ['font'].concat(TYPE_DIALS[role]) : TYPE_DIALS[role]).slice() : []; },
		typeSizes: function (role, dial) { var base = dial === 'categorySize' ? ROLE_BASE.kicker : TYPE_BASE[role] || 16; return TYPE_SIZES.map(function (st) { return { id: st, px: Math.round(base * typeFactor(st)) }; }); },
		typeLines: Object.keys(TYPE_LINE),
		typeLetters: Object.keys(TYPE_LETTER),
		type: function (role) {
			if (!TYPE_DIALS[role]) return {};
			var P = typeNow()[role] || {}, lead = { title: 'head', headings: 'head', body: 'read', quote: 'quote', meta: 'small', 'interface': 'ui' }[role], e = lead ? roleOf(lead) : {};
			var back = function (f) { return f === 'read' ? 'body' : f === 'ui' ? 'interface' : f; };
			var LINE_BACK = { dense: 'tight', tight: 'snug', 'default': 'normal', airy: 'relaxed', wide: 'loose' };
			var out = {
				font: role === 'body' ? (root.getAttribute('data-face') || (window.architravePanelGuest ? 'host' : 'newsreader'))  : role === 'interface' ? sansOf() : P.font !== undefined ? P.font : role === 'code' ? '' : role === 'headings' ? back(ROLE_DEFAULT.head.face) : back(e.face),
				size: P.size !== undefined ? P.size : '0',
				weight: P.weight !== undefined ? P.weight : role === 'headings' ? 'semibold' : role === 'code' ? 'regular' : e.weight,
				lineHeight: role === 'body' ? (LINE_BACK[root.getAttribute('data-leading') || 'default'] || 'normal') : P.lineHeight !== undefined ? P.lineHeight : 'normal',
				letterSpacing: P.letterSpacing !== undefined ? P.letterSpacing : 'normal',
				capitals: P.capitals !== undefined ? P.capitals : role === 'headings' || role === 'code' ? false : !!e.caps,
				italic: P.italic !== undefined ? P.italic : role === 'headings' || role === 'code' ? false : !!e.italic
			};
			out.px = Math.round((TYPE_BASE[role] || 16) * typeFactor(out.size));
			if (TYPE_DIALS[role].indexOf('categorySize') !== -1) {
				out.categorySize = P.categorySize !== undefined ? P.categorySize : 'same';
				out.categoryStep = out.categorySize !== 'same' ? out.categorySize : out.size;
				out.categoryPx = Math.round(ROLE_BASE.kicker * typeFactor(out.categoryStep));
			}
			if (TYPE_DIALS[role].indexOf('align') !== -1) out.align = P.align !== undefined ? P.align : 'default';
			if (TYPE_DIALS[role].indexOf('colour') !== -1) out.colour = P.colour !== undefined ? P.colour : typeColourRest(role);
			out.own = Object.keys(typeMerged(byId(current), readTweaks()[current])[role] || {}); 
			return out;
		},
		setType: function (role, dial, v) {
			if (!TYPE_DIALS[role]) return;
			if (role === 'body' && dial === 'font') { press('[data-architrave-face] [data-face-choice="' + v + '"]'); return; }
			if (role === 'interface' && dial === 'font') { this.setSans(v); return; }
			if (role === 'body' && dial === 'lineHeight') { if (TYPE_LINE[v]) press('[data-architrave-leading] [data-leading-step="' + TYPE_LINE[v] + '"]'); return; }
			if (dial === 'size' || dial === 'categorySize') v = String(v);
			if (dial === 'weight') v = WEIGHT_ALIAS[v] || v;
			if (!typeOk(role, dial, v)) return;
			var s = byId(current), all = readTweaks(), entry = all[current] || {}, own = typeOf(s)[role] || {};
			entry.roles = entry.roles || {}; entry.roles[role] = entry.roles[role] || {};
			if (own[dial] !== undefined ? v === own[dial] : typeRest(role, dial) === v) delete entry.roles[role][dial]; else entry.roles[role][dial] = v;
			if (!Object.keys(entry.roles[role]).length) delete entry.roles[role];
			if (!Object.keys(entry.roles).length) delete entry.roles; else entry.architrave = 3;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyRoles(); mark();
		},
		setRole: function (role, dial, v) {
			if (ROLES.indexOf(role) === -1) return;
			if (dial === 'face' && role === 'read') { press('[data-architrave-face] [data-face-choice="' + v + '"]'); return; }
			if (dial === 'face' && role === 'ui') { this.setSans(v); return; }
			var to = TYPE_LEADS[role], d = { face: 'font', caps: 'capitals', tracking: 'letterSpacing', leading: 'lineHeight' }[dial] || dial;
			if (!to || TYPE_DIALS[to].indexOf(d) === -1) return;
			if (d === 'font') v = v === 'read' ? 'body' : v === 'ui' ? 'interface' : v;
			if (d === 'size') { var n = Math.max(-4, Math.min(6, Math.round(Math.log((+v || ROLE_BASE[role]) / ROLE_BASE[role]) / Math.log(1.125)))); v = n > 0 ? '+' + n : String(n); }
			if (d === 'letterSpacing') { var em = parseFloat(TRACK[TRACK_ALIAS[v] || v]) || 0, best = 'normal'; Object.keys(TYPE_LETTER).forEach(function (k) { if (Math.abs(parseFloat(TRACK[TYPE_LETTER[k]]) - em) < Math.abs(parseFloat(TRACK[TYPE_LETTER[best]]) - em)) best = k; }); v = best; }
			if (d === 'lineHeight') { var f = LEAD[v] || 1, bl = 'normal'; Object.keys(TYPE_LINE).forEach(function (k) { if (Math.abs(LEAD[TYPE_LINE[k]] - f) < Math.abs(LEAD[TYPE_LINE[bl]] - f)) bl = k; }); v = bl; }
			this.setType(to, d, v);
		},
		scope: SCOPE,
		scopeNow: scopeOf,
		pictures: PICTURES,
		picturesNow: picturesOf,
		capLines: ['2', '3', '4'],
		setCapLines: function (v) {
			if (CAP_LINES.indexOf(v) === -1) return;
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && s.capLines) || CAP_LINES[0])) delete entry.capLines; else entry.capLines = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyCapLines(); mark();
		},
		levels: { line: LEVELS.line.stops, fill: LEVELS.fill.stops, measure: LEVELS.measure.stops, space: LEVELS.space.stops, spaceInside: LEVELS.spaceInside.stops, spaceItems: LEVELS.spaceItems.stops, spaceSections: LEVELS.spaceSections.stops, spaceTitle: LEVELS.spaceTitle.stops, framewidth: LEVELS.framewidth.stops,  },
		level: function (k) { return LEVELS[k] ? levelOf(k) : ''; },
		setLevel: function (k, v) {
			if (k === 'measure') { this.setLayout('lineLength', String(v)); return; } 
			if (k === 'line') { this.setLayout('borderStrength', String(v)); return; }
			if (k === 'framewidth') { this.setLayout('frameWidth', String(v)); return; }
			if (/^space[A-Z]/.test(k) && v !== undefined && v !== null) v = String(v); 
			if (k === 'fill') return; 
			var L = LEVELS[k]; if (!L || L.stops.indexOf(v) === -1) return;
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === levelRest(k)) delete entry[k]; else entry[k] = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			var go = function () { applyLevels(); mark(); };
			if (k === 'space' && window.ArchitraveSpace) window.ArchitraveSpace.soft(go); else go();
		},
		cornerSteps: CORNERS,
		corners: cornersOf,
		setCorners: function (v) {
			if (CORNERS.indexOf(v) === -1) return;
			if (layoutOf('radius') !== 'none') this.setLayout('radius', v); return; 
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && CORNERS.indexOf(s.corners) !== -1) ? s.corners : CORNERS[0])) delete entry.corners; else entry.corners = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyCorners(); mark();
		},
		framePatterns: FRAME_PATTERNS,
		framePattern: framePatternOf,
		setFramePattern: function (v) {
			if (FRAME_PATTERNS.indexOf(v) === -1) return;
			if (layoutOf('pictureFrame') !== 'none') this.setLayout('pictureFrame', v); return; 
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && FRAME_PATTERNS.indexOf(s.framepattern) !== -1) ? s.framepattern : FRAME_PATTERNS[0])) delete entry.framepattern; else entry.framepattern = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyFramePattern(); mark();
		},
		picks: PICKS,
		pick: pickOf,
		effects: EFFECTS,
		effect: effectOf,
		setEffect: function (fid, d, v) {
			var def = EFFECTS[fid] && EFFECTS[fid][d]; if (!def || def.list.indexOf(v) === -1) return;
			var s = byId(current), all = readTweaks(), entry = all[current] || {}, fx = entry.effects || {}, o = fx[fid] || {};
			var own = s && s.effects && s.effects[fid] && s.effects[fid][d];
			if (v === (own !== undefined ? own : def.rest)) delete o[d]; else o[d] = v;
			if (Object.keys(o).length) fx[fid] = o; else delete fx[fid];
			if (Object.keys(fx).length) entry.effects = fx; else delete entry.effects;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyEffects(); if (fid === 'tint') applyColours(); mark();
		},
		layouts: LAYOUT,
		layout: function (k) { return LAYOUT[k] ? layoutOf(k) : ''; },
		setLayout: function (k, v) {
			if (!LAYOUT[k] || LAYOUT[k].list.indexOf(v) === -1) return;
			var all = readTweaks(), entry = all[current] || {};
			if (v === layoutOwn(k)) delete entry[k]; else entry[k] = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyOptions(); applyPicks(); applyLevels(); applyCorners(); applyLineStyle(); applyButton(); applyPictures(); applyFramePattern(); applyFadeEdges(); mark();
		},
		setPick: function (key, v) {
			if (key === 'fullpicture') { if (v === 'on') this.setLayout('pictureWidth', 'full'); else if (layoutOf('pictureWidth') === 'full') this.setLayout('pictureWidth', 'wide'); return; }
			if (key === 'widefigures') { this.setLayout('figureWidth', v === 'on' ? 'wide' : 'content'); return; }
			if (key === 'linewidth') { if (layoutOf('borderWidth') !== 'none') this.setLayout('borderWidth', v === '1' && layoutOf('borderWidth') === 'hairline' ? 'hairline' : String(v)); return; }
			if (SURFACE_ENGINE[key]) v = surfaceWord(key, v); 
			if (key === 'pictureshadow') { this.setLayout('pictureShadow', v === 'soft' ? 'soft' : 'none'); return; }
			if (key === 'piccorners') { this.setLayout('pictureCorners', v === 'square' ? 'square' : 'match'); return; }
			if (RENAMED_PICK[key]) { this.setLayout(RENAMED_PICK[key], key === 'buttonshape' && v === 'cards' ? 'match' : v); return; }
			var d = PICKS[key]; if (!d || d.list.indexOf(v) === -1) return;
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && d.list.indexOf(s[key]) !== -1) ? s[key] : pickRest(key))) delete entry[key]; else entry[key] = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyPicks(); mark();
		},
		buttonColours: BUTTONS,
		buttonColour: buttonOf,
		setButtonColour: function (v) {
			if (BUTTONS.indexOf(v) !== -1) { this.setLayout('buttonColour', v === 'ink' ? 'text' : v); return; } 
			if (BUTTONS.indexOf(v) === -1) return;
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && BUTTONS.indexOf(s.button) !== -1) ? s.button : BUTTONS[0])) delete entry.button; else entry.button = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyButton(); mark();
		},
		markerColours: MARKERS,
		markerColour: markerColourOf,
		setMarkerColour: function (v) {
			if (MARKERS.indexOf(v) === -1) return;
			if (v !== 'own') { setBothSides('highlight', PENS[v] || PENS.yellow); return; } 
			if (highlightNow()) return;
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && MARKERS.indexOf(s.markercolour) !== -1) ? s.markercolour : MARKERS[0])) delete entry.markercolour; else entry.markercolour = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyMarkerColour(); mark();
		},
		fadeEdgesList: FADE_EDGES,
		fadeEdges: fadeEdgesOf,
		setFadeEdges: function (v) {
			if (FADE_EDGES.indexOf(v) === -1) return;
			if (layoutOf('pictureFade') !== 'none') this.setLayout('pictureFade', v); return; 
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && FADE_EDGES.indexOf(s.fadeedges) !== -1) ? s.fadeedges : FADE_EDGES[0])) delete entry.fadeedges; else entry.fadeedges = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyFadeEdges(); mark();
		},
		lineStyles: LINE_STYLE,
		lineStyle: lineStyleOf,
		setLineStyle: function (v) {
			if (LINE_STYLE.indexOf(v) === -1) return;
			this.setLayout('borderStyle', v); return; 
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && LINE_STYLE.indexOf(s.linestyle) !== -1) ? s.linestyle : LINE_STYLE[0])) delete entry.linestyle; else entry.linestyle = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyLineStyle(); mark();
		},
		setPictures: function (v) {
			if (PICTURES.indexOf(v) === -1) return;
			this.setLayout('pictureFilter', Object.keys(FILTER_ENGINE).filter(function (k) { return FILTER_ENGINE[k] === v; })[0] || v); return; 
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && s.pictures) || PICTURES[0])) delete entry.pictures; else entry.pictures = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyPictures(); mark();
		},
		setScope: function (v) {
			if (SCOPE.indexOf(v) === -1) return;
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && s.scope) || SCOPE[0])) delete entry.scope; else entry.scope = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyScope(); mark();
		},
		setTint: function (v) {
			if (TINTS.indexOf(v) === -1) return;
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && s.tint) || TINTS[0])) delete entry.tint; else entry.tint = v;
			['light', 'dark'].forEach(function (side) {
				if (entry.colours && entry.colours[side]) { delete entry.colours[side].accent; if (!Object.keys(entry.colours[side]).length) delete entry.colours[side]; }
				if (s && (s.own || s.site) && s.colours && s.colours[side] && s.colours[side].accent) { entry.colours = entry.colours || {}; entry.colours[side] = entry.colours[side] || {}; entry.colours[side].accent = ''; }
			});
			if (entry.colours && !Object.keys(entry.colours).length) delete entry.colours;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyTint(); applyColours(); mark();
		},
		accent: accentOn,
		setAccent: function (on) {
			try { if (on) localStorage.removeItem(ACCENT_KEY); else localStorage.setItem(ACCENT_KEY, 'off'); } catch (e) {  }
			applyAccent();
		},
		focus: function () { return Focus.on(); },
		motion: function (press) { return Focus.motion(press); },
		retime: function () { return Focus.retime(); },
		setFocus: function (on) { Focus.set(on); },
		canUndo: function () { return HISTORY.length > 0; },
		
		undoWhat: function () { var h = HISTORY[HISTORY.length - 1]; return h && h.what || ''; },
		canRedo: function () { return FUTURE.length > 0; },
		redoWhat: function () { var h = FUTURE[FUTURE.length - 1]; return h && h.what || ''; },
		redo: function () {
			var h = FUTURE.pop(); if (!h) return false;
			var was = ''; try { was = localStorage.getItem(TWEAKS_KEY) || '{}'; } catch (e) {  }
			HISTORY.push({ tweaks: was, side: storedSide(), style: current, what: h.what, base: siteBase(current) });
			undoing = true;
			var s = landStep(h);
			if (s) { apply(s, wanted(s)); applyRoles(); }
			if (h.side && h.side !== storedSide()) press('[data-quire-modes="palette"] [data-side="' + h.side + '"]');
			undoing = false; lastPush = 0; keepHistory(); siteSaveSoon();
			mark();
			return true;
		},
		undo: function () {
			var h = HISTORY.pop(); if (!h) return false;
			var now = ''; try { now = localStorage.getItem(TWEAKS_KEY) || '{}'; } catch (e) {  }
			FUTURE.push({ tweaks: now, side: storedSide(), style: current, what: h.what, base: siteBase(current) }); 
			undoing = true;
			var s = landStep(h);
			if (s) { apply(s, wanted(s)); applyRoles(); }
			if (h.side && h.side !== storedSide()) press('[data-quire-modes="palette"] [data-side="' + h.side + '"]');
			undoing = false; lastPush = 0; keepHistory(); siteSaveSoon();
			mark();
			return true;
		},
		
		changes: function () {
			var s = byId(current) || {}, e = readTweaks()[current] || {}, out = {};
			Object.keys(e).forEach(function (k) { if (k !== 'was' && k !== 'architrave' && !(DIALS.indexOf(k) !== -1 && e[k] === s[k])) out[k] = e[k]; });
			return out;
		},
		resetPaths: function (paths) {
			var s = byId(current), all = readTweaks(), entry = all[current];
			if (!s || !entry) return;
			paths.forEach(function (path) {
				var p = path.split('.'), trail = [entry];
				for (var i = 0; i < p.length - 1; i++) { var nx = trail[i][p[i]]; if (!nx || typeof nx !== 'object') return; trail.push(nx); }
				delete trail[p.length - 1][p[p.length - 1]];
				for (var j = p.length - 2; j >= 0; j--) if (!Object.keys(trail[j + 1]).length) delete trail[j][p[j]];
			});
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			if (s.host) goHome(); else apply(s, wanted(s));
		},
		resetChanges: function (id) {
			var s = byId(id); if (!s) return;
			var all = readTweaks(); delete all[id]; writeTweaks(all);
			if (id === current) apply(s, s);
			else mark();
		},
		versions: function () { var s = byId(current); if (!s || s.host) return []; var l = readVersions()[s.id]; return Array.isArray(l) ? l.slice() : []; },
		savedRecord: function () { var s = byId(current); return s && !s.host ? savedRecord() : null; },
		nowRecord: function () {
			var s = byId(current); if (!s || s.host) return null;
			if (!previewing) return lookOf(JSON.parse(this.exportStyle() || '{}'));
			var shown = null; try { shown = localStorage.getItem(TWEAKS_KEY); if (previewing.raw === null) localStorage.removeItem(TWEAKS_KEY); else localStorage.setItem(TWEAKS_KEY, previewing.raw); } catch (e) { return null; }
			var out = lookOf(JSON.parse(this.exportStyle() || '{}'));
			try { if (shown === null) localStorage.removeItem(TWEAKS_KEY); else localStorage.setItem(TWEAKS_KEY, shown); } catch (e) {  }
			return out;
		},
		keepVersion: function () { versionNow(); return keepVersion(); },
		previewVersion: function (rec) {
			var s = byId(current); if (!s || s.host) return false;
			if (!rec) return endPreview();
			if (!previewing) { var raw = null; try { raw = localStorage.getItem(TWEAKS_KEY); } catch (e) { return false; } versionNow(); previewing = { id: s.id, raw: raw }; }
			var all = readTweaks(), e = entryFromRecord(rec);
			if (Object.keys(e).length) all[s.id] = e; else delete all[s.id];
			writeQuiet(all);
			applyNow(s, wanted(s)); applyRoles();
			return true;
		},
		previewing: function () { return !!previewing; },
		restoreVersion: function (rec, what) { 
			var s = byId(current); if (!s || s.host || !rec) return false;
			endPreview();
			keepVersion(); 
			var all = readTweaks(), e = entryFromRecord(rec);
			if (Object.keys(e).length) all[s.id] = e; else delete all[s.id];
			lastPush = 0; writeTweaks(all);
			if (HISTORY.length) { HISTORY[HISTORY.length - 1].what = what || 'version'; keepHistory(); }
			applyNow(s, wanted(s)); applyRoles();
			return true;
		},
		reset: function (id) {
			var s = byId(id); if (!s) return;
			if (s.host) { goHome(); return; } 
			var all = readTweaks(); delete all[id]; writeTweaks(all);
			apply(s, s);
			
			press('[data-quire-modes="palette"] [data-side="auto"]');
			this.setAccent(true);
			this.setFocus(false);
		}
	};
	
	new MutationObserver(function () { applyRoles(); }).observe(root, { attributes: true, attributeFilter: ['data-face', 'data-sans'] });
	new MutationObserver(function () { if (root.hasAttribute('data-fill')) applyLevels(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
	function renderHosts() {
		var CHECK = window.QuireIcons
			? window.QuireIcons.markup('check', 'class="quire-menu-check"')
			: '';
		document.querySelectorAll('[data-architrave-presets]').forEach(function (host) {
			host.innerHTML = STYLES.filter(offered).map(function (p) {
				return '<li><button type="button" class="quire-menu-item" role="menuitemradio" ' +
					'aria-checked="false" data-preset="' + p.id + '">' +
					'<span class="quire-menu-label">' + t(p.label) + '</span>' + CHECK + '</button></li>';
			}).join('');
		});
		mark();
	}
	
	var RESTED = {}; 
	function restMoved() {
		var all = readTweaks(), changed = false;
		Object.keys(RESTED).forEach(function (id) {
			var tw = all[id]; if (!tw || !DIALS.every(function (d) { return tw[d] !== undefined; })) return;
			if (!RESTED[id].some(function (o) { return same(tw, o); })) return;
			DIALS.forEach(function (d) { delete tw[d]; });
			if (!Object.keys(tw).length) delete all[id];
			changed = true;
		});
		if (changed) writeTweaks(all);
		var s = byId(current), olds = s && !s.host && RESTED[s.id], d = now();
		if (olds && !same(d, s) && olds.some(function (o) { return same(d, o); }) && !DIALS.some(function (k) { return (all[s.id] || {})[k] !== undefined; })) { apply(s, wanted(s)); return; }
		var w = s && !s.host ? wanted(s) : null;
		if (w && ['face', 'leading', 'palette'].some(function (k) { return k !== 'palette' ? w[k] !== d[k] : (w.palette || 'neutral') !== d.palette; })) {
			var keep = {}; Object.keys(w).forEach(function (k) { keep[k] = w[k]; }); keep.reading = d.reading;
			apply(s, keep);
		}
	}
	document.addEventListener('DOMContentLoaded', function () {
		renderHosts();
		if (seeded) apply(byId(current), wanted(byId(current))); 
		restMoved();
		window.addEventListener('hashchange', function () {
			var m = /^#style=(.+)$/.exec(window.location.hash), data = m && decodeRecord(m[1]);
			if (!data) return;
			var entry = ownFromRecord(data); renderHosts(); apply(entry, entry);
			try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) {  }
		});
		
		new MutationObserver(function (records) {
			if (records.some(function (r) { return r.attributeName === 'data-theme'; }) && applying) { applying = false; if (applyTimer) { clearTimeout(applyTimer); applyTimer = null; } }
			if (!applying) remember();
			if (records.some(function (r) { return r.attributeName === 'data-theme'; })) applyOptions();
			mark();
		}).observe(root, {
			attributes: true,
			attributeFilter: ['data-theme', 'data-reading', 'data-face', 'data-leading']
		});
		document.addEventListener('click', function (e) {
			if (e.target.closest('[data-architrave-reset]')) {
				if (STYLES[0] && STYLES[0].host) { slowly(goHome); return; }
				var all = readTweaks(); delete all[DEFAULT]; writeTweaks(all);
				apply(STYLES[0], STYLES[0]);
				return;
			}
			var row = e.target.closest('[data-preset]');
			if (row) {
				var p = byId(row.getAttribute('data-preset'));
				
				if (p && p.host) slowly(goHome); 
				else if (p) apply(p, wanted(p));
				return;
			}
			if (applying) return;
			var dial = e.target.closest('[data-quire-modes="palette"] [data-palette], [data-reading-step], [data-face-choice], [data-leading-step]');
			void dial; 
		});
	});
})();
