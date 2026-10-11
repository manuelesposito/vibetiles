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
	/* HELD STILL (0.11.149): read and written with transitions at no length;
	   the plugin's guest-size.js says
	   why (the lift below, THE TILE WEARS THE THEME'S OWN PAPER, reads the page
	   between two sides). */
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
	/* WHAT "NO SITE DEFAULT" IS CALLED (2026-09-24): Standard on Architrave, whose
	   own look it is; on a guest the theme's own look ('host'), and there
	   Standard (Classic) is one more style that may be the default. */
	var GUEST = !!window.architravePanelGuest, NONE = GUEST ? 'host' : 'standard';
	var PENDING = null; /* an order being made, shown while it is sent (setVisible) */
	// The reader's language, where the site has one for the word (functions.php,
	// architrave_settings_words). Names pass through untouched.
	var WORDS = window.architraveWords || {};
	function t(word) { return WORDS[word] || word; }

	/* THE PRESETS STAND FIRST (2026-10-05): a saved style may name one now (writeColours), and the page puts its style on long before the middle of this file, where the list stood; presetById then read an undefined list and the whole panel stopped. Plain data, nothing in it depends on what follows. */
	/* THE COLOUR PRESETS (Manuel, 2026-09-16: "my point is having more colour
	   presets that people can choose from … let's say in the beginning: 20").
	   The five that were here are QDS modes, registered in the design system
	   with a light and a dark side each, which is why there were five: a new
	   one meant work in the system. These fifteen are not modes. They are what
	   the reader's own colours already are — a paper, an ink and an accent per
	   side — and the ladder mixes the rest from them, the canvas and the plane,
	   the fields and the rungs, the lines, the inverse and the focus. So a
	   preset is six values in a table, and the pair list holds twenty.

	   NAMED IN OUR OWN WORDS. Codex and tweakcn offer forty-odd looks under
	   names that belong to other projects; the colours are free to be inspired
	   by, the names are theirs, and this theme's code names no outside product.
	   These are materials and weathers, in the voice the first five speak:
	   Kreide, Sand, Leinen, Moos, Nebel.

	   Every pair is checked against the same gate the panel shows the reader:
	   ink on paper at 4.5:1 or better on both sides (tools/check-presets.py). */
	var PRESETS = [
		/* THE COLOUR SETS (Manuel, 2026-10-05, lab/the-colour-sets.html: "all sections have six colors … make sure that they all have quite a distinction"): five groups of six in a fixed order, never moved by a choice. BASE: the six reading styles' own (Standard, Original's, is the panel's own first tile, not listed here), Ivory a touch creamier. WARM and COOL: light papers, each with a link colour of its own. BOLD: coloured papers with NO link colour (the ink, underlined: "that's getting too colorful"). COLOURED TEXT: the text itself in colour, each beside its dark twin: the same colour as text on a deep paper of its own hue (2026-10-05, Manuel: "if it says colorful text, it should have colorful text"; the twins had cream text on the colour). The reading styles name theirs (still, clear, soft, essay, folio) and carry all six colours per side, so another preset chosen over them leaves none behind. Names are colour names, shown as written in every language. */
		{ id: 'still', label: 'Slate', light: { paper: '#f2f2f4', ink: '#1d1d1f', accent: '#0066cc', button: '#0071e3', ground: '#e8e8ec', lift: '#ffffff', muted: '#66666b' }, dark: { paper: '#2c2c2e', ink: '#f5f5f7', accent: '#2997ff', button: '#2997ff', ground: '#1c1c1e', lift: '#3a3a3c', muted: '#a1a1a6' }, group: 'base', fixed: true }, /* Slate's button is Apple's button blue and its links Apple's link blue (2026-10-08, Manuel on the Vibetiles page's download card: "i dont like that blue, its so dark, looks unfresh"): #0066cc filled a pill like a bank's; the lighter #0071e3 is what apple.com fills a button with, and the links keep #0066cc as there. */
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
		/* Standard is the site's own room, the one a first visit opens in:
		   Neutral in the reader's side. It was called Night and pressed the dark
		   side until 2026-09-07 (Manuel: "a confusing name"). Book was Paper,
		   which is also the palette's name. */
		/* THE PARAGRAPH IS PART OF THE RECIPE (Manuel, 2026-09-10: "we should
		   have those settings on all, also on standard"): justified text,
		   hyphenation and the drop cap are three switches every style
		   offers, each style with its own rest, and a reader's press on one
		   is a tweak of that style like a dial's. Book rests with all three
		   on; the others off. */
		{ id: 'standard', label: 'Classic', /* Standard until 2026-09-23 (Manuel: "if we now set a site default, the first one cannot be called Standard", German's word for a default). The id stays. */ palette: 'neutral', tint: 'purple', sans: 'inter', reading: 'default', face: 'newsreader', leading: 'default', justify: false, dropcap: false, rounded: true, lines: false, bold: false, scope: 'article', fills: true, roles: {} },
		/* THE OTHERS LEFT (Manuel, 2026-10-02: "we went overboard", then "we just keep the original for now"): Book, Poster, Matrix, Terminal, Blueprint, Catalogue, Gallery, Storybook, Specimen, Aperitivo, Risograph, Arcade, Tube, Brochure and Instrument. Their recipes are records in archive/styles/ and the tags styles-archive-0.15.58 and styles-archive-0.16.0 hold everything. New styles come back one at a time. */
	];
	/* ORIGINAL ON ARCHITRAVE TOO (Manuel, 2026-09-28: "coherent … no special case for Architrave"): on its own theme
	   Classic is the theme as it is, so it is called what it is everywhere else, Original. On another theme the
	   theme's own look is Original and Classic stays the name of Architrave's look. */
	if (!window.architravePanelGuest) STYLES.forEach(function (s) { if (s.id === 'standard') s.label = 'Original'; });
	/* THE READER'S OWN STYLES (Manuel, 2026-09-14, the designer's colour
	   page; lab sheet the-designers-colour-page): a style saved from the
	   Farbe page is a recipe like the six, snapshot from the tile it was
	   made on, with its colours beside, and lives in this browser. Loaded
	   here, before the stored style is looked up, so a saved style is a
	   style on first paint. */
	var OWN_KEY = 'architrave-own-styles';
	var HIDDEN_KEY = 'architrave-hidden-order'; /* the owner's order for Only visible to you (shown) */
	function hiddenOrder() { try { var l = JSON.parse(localStorage.getItem(HIDDEN_KEY) || '[]'); return Array.isArray(l) ? l : []; } catch (e) { return []; } }
	function readOwn() {
		try { var list = JSON.parse(localStorage.getItem(OWN_KEY) || '[]'); return Array.isArray(list) ? list : []; } catch (e) { return []; }
	}
	function writeOwn() {
		try { localStorage.setItem(OWN_KEY, JSON.stringify(STYLES.filter(function (x) { return x.own; }))); } catch (e) { /* private mode */ }
	}
	readOwn().forEach(function (o) { if (o && typeof o.id === 'string' && /^own-/.test(o.id) && o.label) { liftCentre(o); o.own = true; STYLES.push(o); } });
	/* THE SITE'S STYLES (2026-09-18, inc/site-styles.php; Manuel: "style a
	   new tile and make this the default, visible for everyone seeing that
	   site"). A third kind beside the theme's and the reader's own: records
	   the site's owner published from this panel, printed into every page
	   before this script. They are tiles for everyone and no reader can
	   delete them. THE DEFAULT TAKES STANDARD'S PLACE (Manuel, 2026-09-18:
	   "replaces Standard"): it stands first in the list, where every way
	   back leads, and Standard leaves the tiles on that site. A reader who
	   chose a style keeps it; the default speaks where nothing was chosen. */
	var SITE = { styles: [], 'default': '' };
	var PUBLISH = window.architravePublish || null;
	function baseOf(s) { return (s.own || s.site) ? (s.base || 'standard') : s.id; }
	/* THE NEWEST STAMP THIS PAGE HAS SEEN (1.4.92, 2026-10-11): the site stamps every answer (inc/site-styles.php);
	   an answer stamped older than this is an older copy of the site and is let go (refreshSite). */
	var siteStamp = 0;
	function takeSite(state) {
		if (state && typeof state.stamp === 'number' && state.stamp > siteStamp) siteStamp = state.stamp;
		for (var i = STYLES.length - 1; i >= 0; i--) if (STYLES[i].site) STYLES.splice(i, 1);
		SITE = state && typeof state === 'object' ? state : { styles: [], 'default': '' };
		(Array.isArray(SITE.styles) ? SITE.styles : []).forEach(function (o) {
			if (o && typeof o.id === 'string' && /^site-[a-z0-9]+$/.test(o.id) && o.label) { var lb = plainName(o.label); o = liftCentre(plain(o) || {}); o.label = lb; o.site = true; delete o.own; STYLES.push(o); }
		});
		/* ANY STYLE MAY BE THE DEFAULT (2026-09-23): a published one, or one of the
		   built-in ones (Book, Poster …); Classic is the absence of one. */
		var d = STYLES.filter(function (x) { return !x.own && !x.host && (GUEST || x.id !== 'standard') && x.id === SITE['default']; })[0];
		/* ON A GUEST ANY STYLE MAY BE THE DEFAULT TOO (Manuel, 2026-09-24: "I want
		   to make Book or Classic the default theme and Ollie Original should
		   therefore not be the default"). Original is then what no default is, as
		   Standard is on Architrave: a default that is unpublished, or never set,
		   gives the site back to the theme. The default stands first, Original
		   right behind it. This runs again after every write to the route, when
		   the Original tile is already in STYLES; at load it is added after. */
		var host = STYLES.filter(function (x) { return x.host; })[0];
		if (d) { STYLES.splice(STYLES.indexOf(d), 1); STYLES.splice(0, 0, d); DEFAULT = d.id; }
		else DEFAULT = NONE; /* Original is added after this at load; see THE THEME'S OWN LOOK */
		if (host) { STYLES.splice(STYLES.indexOf(host), 1); STYLES.splice(d ? 1 : 0, 0, host); }
	}
	takeSite(window.architraveSiteStyles);
	/* A STYLE IS A LINK (2026-09-18, the day's second release). Two forms:
	   `?style=<id>` names a style this site offers, a published tile or one
	   of the theme's, and opens the site wearing it; `#style=<record>` carries
	   a whole record, base64url of the export, so a look nobody published,
	   a reader's own or an adjusted one, travels too. Opening either puts the
	   style on as a press would and, for a carried record, makes it a tile of
	   the reader's own first, as Paste style… does; the same record already
	   held is not added twice. The address is cleaned afterwards so a reload
	   is an ordinary visit. Read here, before paint, like the stored style. */
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
	/* A record as a tile of the reader's own: the whitelist Paste style… reads
	   through, and the tile already there when the same record was pasted. */
	/* A RECORD FROM OUTSIDE IS PLAIN VALUES ONLY (2026-09-24). A style link, a
	   paste and the site's published list all end up written into the panel's
	   HTML: a name as text, a colour and a slug inside attributes. A value
	   carrying a quote or an angle bracket could close that attribute and open
	   one of its own, so a link someone sent could run a script on this site.
	   No real value has one: slugs, hex and rgb() colours, numbers, switches. A
	   string that does is dropped; a name loses those characters. */
	function plain(v, depth) {
		if (typeof v === 'string') return /[<>"'`\\&]/.test(v) ? undefined : v;
		if (typeof v === 'number' || typeof v === 'boolean') return v;
		if (!v || typeof v !== 'object' || Array.isArray(v) || (depth || 0) > 6) return undefined;
		var out = {};
		Object.keys(v).forEach(function (k) { if (!/^[A-Za-z][A-Za-z0-9_-]{0,47}$/.test(k)) return; var c = k === 'hostFace' && typeof v[k] === 'string' && /^[\w\s,.'"-]{1,200}$/.test(v[k]) ? v[k] : plain(v[k], (depth || 0) + 1); if (c !== undefined) out[k] = c; }); /* a face list keeps its quotes; faceAttr escapes it where it is written */
		return out;
	}
	function plainName(x) { return String(x || '').replace(/[<>"'`\\&]/g, '').trim(); }
	/* CENTRED TITLE BECAME AN ALIGNMENT (2026-09-25, THE ALIGNMENT OF A ROLE). A
	   record, a link, a published style or a tweak that still says
	   `centretitle` is read into the roles here, before any list of known keys
	   can drop it: true is Überschriften and Kategorien centred with the
	   headings inside the article on the left, exactly what the switch drew;
	   a hand-set alignment wins. On a tweak (`style` given) false says the
	   reader turned a style's centring off; on a record false was only written
	   because every export wrote every switch, and means nothing. The tweak's
	   members replace the style's (roleOf), so the style's are copied first. */
	function liftCentre(rec, style) { return liftLayout(liftColours(liftType(liftLeading(liftCentreOnly(rec, style), !style)), style), style); }
	/* THE SEVEN ROLES REPLACED THE EIGHT (Manuel, 2026-10-02, lab/the-typography-roles.html):
	   a record, link, published style or tweak written before then names the old roles
	   (head, read, quote, kicker, small, comment, ui, title) with their members and old
	   dial names; it is read here into the seven (title, headings, body, quote, meta,
	   interface, code), once, before anything else looks at it. What does not survive,
	   on purpose: word spacing, every member but the headings', the comments' own role,
	   and where two old roles become one, the second one's dials where the first set
	   its own (Small text wins over Category line, Interface over Interface titles).
	   A record of the seven says `architrave: 2`; a lone `roles.title` without it is the
	   old Interface titles. Self-contained: it runs before the tables below exist. */
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
			/* "0" IS THE SEVEN'S REST, NEVER AN OLD SIZE (2026-10-07, Manuel: the blue dot stayed after Reset Style): the old
			   sizes were pixel rungs from 11, percentages and xs..xl. A tweak keeps no `architrave`, so Reset putting Soft's
			   dates back to "0" read as an old record here, the step came out empty, and the old -1 stayed on the site. */
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
		/* the headings inside the article followed the title until the member had its own */
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
	/* THE READING TEXT'S LINE SPACING (2026-10-03): a record says it as `roles.body.lineHeight`, in the
	   five words every role takes (tight, snug, normal, relaxed, loose), and no longer as the top-level
	   `leading` of fifteen steps. The engine keeps its dial (data-leading, the first paint) on the five
	   steps the words stand for; an old step goes to the nearest of them. A record that names no line
	   spacing is the theme's own; a tweak that names none leaves the style's. Self-contained, as liftType.
	   AND THE TWO FONTS (0.26.0): `roles.body.font` and `roles.interface.font`, as every role names its
	   font, onto the engine's own `face` and `sans` (the first paint reads those). A font that only names
	   the other role (body, interface) has no font of its own to give and is left out. */
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
	/* THE LAYOUT'S OLD KEYS (2026-10-03, lab/the-layout.html): read into WordPress's words once. On a tweak
	   (`style` given) a false says the reader took a style's width back to the column; on a record it was only
	   written because every export wrote every switch. Self-contained, as liftType. */
	function liftLayout(rec, style) {
		if (!rec || typeof rec !== 'object') return rec;
		if (rec.measure !== undefined) { if (rec.lineLength === undefined) rec.lineLength = String(rec.measure); delete rec.measure; }
		if (rec.widehead !== undefined) { if (rec.titleWidth === undefined && (rec.widehead === true || style)) rec.titleWidth = rec.widehead === true ? 'wide' : 'content'; delete rec.widehead; }
		if (rec.widepicture !== undefined || rec.fullpicture !== undefined) {
			if (rec.pictureWidth === undefined && (rec.widepicture === true || (style && rec.widepicture === false))) rec.pictureWidth = rec.widepicture === true ? (rec.fullpicture === 'on' ? 'full' : 'wide') : 'content';
			delete rec.widepicture; delete rec.fullpicture;
		}
		if (rec.widefigures !== undefined) { if (rec.figureWidth === undefined && (rec.widefigures === 'on' || style)) rec.figureWidth = rec.widefigures === 'on' ? 'wide' : 'content'; delete rec.widefigures; }
		/* CORNERS AND LINES (2026-10-03): every old combination has one new value. A record names every
		   switch (each export wrote them all), a tweak only what the reader moved, over the style's own. */
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
		/* THE SURFACES IN THREE WORDS (Manuel, 2026-10-05: "do a similar approach to the quotes"): every surface is
		   filled, outlined or raised, each what its name says whatever the lines. A card's fill only was filled once
		   the lines were off, its top line and corner marks drew only with them: they are outlined now. A box the
		   writer coloured (notes) follows the cards. The fills' strength left the style: the fills are the colours'
		   own (the Cards colour); a style that had none has its cards and fields outlined. The lines' strength keeps
		   five steps, each old one goes to the nearest. */
		if (rec.fill !== undefined) {
			if (String(rec.fill) === 'none') ['cards', 'fields'].forEach(function (k) { if (rec[k] === undefined || rec[k] === 'filled' || rec[k] === 'flat' || rec[k] === 'box' && k === 'cards' || rec[k] === 'fillOnly') rec[k] = 'outlined'; });
			delete rec.fill;
		}
		delete rec.notes;
		if (rec.borderStrength !== undefined) { var bs = +rec.borderStrength; rec.borderStrength = isNaN(bs) ? '45' : ['10', '20', '45', '70', '100'].reduce(function (a, b) { return Math.abs(+b - bs) < Math.abs(+a - bs) ? b : a; }); }
		var SURF = { cards: { box: 'filled', flat: 'filled', fillOnly: 'filled', top: 'outlined', topLine: 'outlined', ticks: 'outlined', cornerMarks: 'outlined', outline: 'outlined' }, quotes: { line: 'indented', indent: 'indented', box: 'filled' }, notes: { flat: 'filled', box: 'outlined' }, fields: { flat: 'filled', box: 'outlined' } };
		Object.keys(SURF).forEach(function (k) { if (rec[k] !== undefined && SURF[k][rec[k]]) rec[k] = SURF[k][rec[k]]; });
		/* THE PICTURES (2026-10-03): a frame and a fade are one key each now, None first */
		var FILTER = { plain: 'none', bw: 'grayscale', duo: 'tinted', accent: 'duotone' };
		if (rec.pictures !== undefined) { if (rec.pictureFilter === undefined) rec.pictureFilter = FILTER[rec.pictures] || rec.pictures; delete rec.pictures; }
		if (rec.picturehover !== undefined) { if (rec.colourOnHover === undefined) rec.colourOnHover = rec.picturehover === true; delete rec.picturehover; }
		if (rec.picturedim !== undefined) { if (rec.dimInDark === undefined) rec.dimInDark = rec.picturedim === true; delete rec.picturedim; }
		if (rec.pictureframe !== undefined || rec.framepattern !== undefined) { if (rec.pictureFrame === undefined) rec.pictureFrame = own('pictureframe', true) === false ? 'none' : String(own('framepattern', 'plain')); delete rec.pictureframe; delete rec.framepattern; }
		if (rec.framewidth !== undefined) { if (rec.frameWidth === undefined) rec.frameWidth = String(rec.framewidth); delete rec.framewidth; }
		if (rec.picturefade !== undefined || rec.fadeedges !== undefined) { if (rec.pictureFade === undefined) rec.pictureFade = own('picturefade', false) !== true ? 'none' : String(own('fadeedges', 'sides')); delete rec.picturefade; delete rec.fadeedges; }
		if (rec.pictureshadow !== undefined) { if (rec.pictureShadow === undefined) rec.pictureShadow = rec.pictureshadow === 'soft' ? 'soft' : 'none'; delete rec.pictureshadow; }
		if (rec.piccorners !== undefined) { if (rec.pictureCorners === undefined) rec.pictureCorners = rec.piccorners === 'square' ? 'square' : 'match'; delete rec.piccorners; }
		/* THE BUTTONS' NAMES (2026-10-03) */
		var REN = { button: 'buttonColour', buttonshape: 'buttonShape', buttonstyle: 'primaryButton', buttonmedium: 'secondaryButton', buttonquiet: 'tertiaryButton', tagsfollow: 'tagsMatchButtons', chosenitem: 'currentItem' };
		Object.keys(REN).forEach(function (k) {
			if (rec[k] === undefined) return;
			var v = rec[k]; if (k === 'button' && v === 'ink') v = 'text'; if (k === 'buttonshape' && v === 'cards') v = 'match';
			if (rec[REN[k]] === undefined) rec[REN[k]] = v; delete rec[k];
		});
		return rec;
	}
	/* THE SEVEN COLOURS REPLACED THE OLD ONES (Manuel, 2026-10-03, lab/the-colours.html):
	   background (Paper), background2 (Ground), card (Cards), text, mutedText (Soft text),
	   accent and highlight (Highlighter), each per side, and a colour on every type role.
	   A record, link, published style or tweak written before then is read into them here,
	   once: the wells renamed (paper, ink, ground, lift, marker), the hidden pairs and the
	   accent names written out as colours, Softer reading text as Reading text in Soft text,
	   the small text's softness as Soft text's own colour, the highlighter's switch and pen
	   as its colour, and the dark ground as the day's Ground (the night's own ground, as it was drawn). What does not survive, on
	   purpose: the reading text's softness in between (one soft shade), the "like the text"
	   pens (yellow), a dark ground by day that is not the night's paper on another theme's
	   footer, and the hidden pairs' finer greys. The common words an AI may write are read
	   too (primary, foreground, muted-foreground). Self-contained, as liftType. */
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
		/* the hidden pair, written out where the style says no paper or text of its own */
		var pal = PAIRS[rec.palette] ? rec.palette : 'neutral';
		if (rec.palette && rec.palette !== 'neutral' && PAIRS[rec.palette]) SIDES.forEach(function (side, i) {
			var o = own(side);
			if (!o('background')) col(side).background = PAIRS[pal][i][0];
			if (!o('text')) col(side).text = PAIRS[pal][i][1];
		});
		/* the accent's name, or the pair's own tint */
		var tint = TINT[rec.tint] ? rec.tint : rec.palette && PAIR_TINT[rec.palette] ? PAIR_TINT[rec.palette] : '';
		if (tint && tint !== 'purple') SIDES.forEach(function (side, i) { if (!own(side)('accent')) col(side).accent = TINT[tint][i]; });
		/* Softer reading text: Reading text in Soft text, and the links it underlined */
		if (rec.soft === true) {
			rec.roles = rec.roles && typeof rec.roles === 'object' ? rec.roles : {};
			var body = rec.roles.body && typeof rec.roles.body === 'object' ? rec.roles.body : (rec.roles.body = {});
			if (body.colour === undefined) body.colour = 'mutedText';
			if (rec.links === undefined) rec.links = 'underlined';
		}
		/* the small text's softness: Soft text's own colour, the text that far toward the paper */
		var ss = rec.smallsoft !== undefined ? rec.smallsoft : rec.soft === true && rec.quietlevel !== undefined ? rec.quietlevel : undefined;
		if (ss !== undefined && String(ss) !== '25' && !isNaN(+ss)) SIDES.forEach(function (side, i) {
			var o = own(side), P = o('background') || PAIRS[pal][i][0], I = o('text') || PAIRS[pal][i][1];
			if (!o('mutedText') && /^#[0-9a-f]{6}$/i.test(P) && /^#[0-9a-f]{6}$/i.test(I)) col(side).mutedText = mixHex(I, P, +ss / 100);
		});
		/* the highlighter: off, a pen, or its own colour */
		if (rec.marker === true) {
			var pen = PEN[rec.markercolour] || (rec.markercolour === 'own' ? '' : PEN.yellow);
			SIDES.forEach(function (side) { var c = rec.colours && rec.colours[side]; if (pen) col(side).highlight = pen; else if (!(c && c.highlight)) col(side).highlight = PEN.yellow; });
		} else if (rec.marker === false || rec.marker === undefined && rec.markercolour !== undefined) {
			SIDES.forEach(function (side) { if (rec.colours && rec.colours[side]) delete rec.colours[side].highlight; });
		}
		/* the dark ground: the day's Ground, its own colour or the night's paper */
		if (rec.darkground === true) {
			/* what the ground wore: the night's own ground, as the night's set drew it around its paper */
			var od = own('dark'), cl = rec.colours && rec.colours.light;
			var night = od('background2') || (od('background') ? sink(od('background'), 0.05) : pal === 'neutral' ? '#2b2b2b' : sink(PAIRS[pal][1][0], 0.05));
			col('light').background2 = (cl && cl.inverse) || night;
		}
		SIDES.forEach(function (side) { var c = rec.colours && rec.colours[side]; if (!c) return; delete c.inverse; if (!Object.keys(c).length) delete rec.colours[side]; });
		if (rec.colours && !Object.keys(rec.colours).length) delete rec.colours;
		var hadPalette = rec.palette !== undefined;
		KEYS.forEach(function (k) { delete rec[k]; });
		if (hadPalette && rec.id) rec.palette = 'neutral'; /* a saved style keeps the engine's one pair; a record or a tweak names none */
		if (rec.architrave) rec.architrave = 3;
		return rec;
	}
	function liftCentreOnly(rec, style) {
		if (!rec || typeof rec !== 'object') return rec;
		/* CORNERS' PILL STEP SPLIT OFF (Manuel, 2026-09-26, "pill buttons with large
		   cards"): pill was the fourth corner step and pinned the cards to medium;
		   it is the switch `pillbuttons` now, riding on any corner size. An old
		   record, link, published style or tweak that says corners 'pill' keeps
		   what it meant: buttons as pills, cards on medium (the old step's rest).
		   A hand-set pillbuttons wins, as ever. Keep this lift: old exports carry it. */
		if (rec.corners === 'pill') { delete rec.corners; if (typeof rec.pillbuttons !== 'boolean') rec.pillbuttons = true; }
		/* PILL BUTTONS BECAME THE BUTTON'S SHAPE (2026-09-26, THE SHAPE ROUND): true
		   is buttonshape 'pill'; false on a tweak is 'cards' (the reader turned a
		   style's pill off); false on a record means nothing. A hand-set shape wins.
		   Keep this lift: old exports carry it. */
		if (rec.pillbuttons !== undefined) { var pb = rec.pillbuttons === true; delete rec.pillbuttons; if (pb) { if (rec.buttonshape === undefined) rec.buttonshape = 'pill'; } else if (style && rec.buttonshape === undefined) rec.buttonshape = 'cards'; }
		/* MAIN BUTTON IN INK BECAME THE BUTTON'S COLOUR (2026-09-26, THE BUTTON'S
		   COLOUR): a record, link, published style or tweak that still says
		   `inkbutton` keeps what it meant: true is button 'ink'; on a tweak false
		   says the reader turned a style's ink button off, so 'accent'; on a
		   record false was written because every export wrote every switch, and
		   means nothing. A hand-set button wins. Keep this lift: old exports carry it. */
		if (rec.inkbutton !== undefined) { var ib = rec.inkbutton === true; delete rec.inkbutton; if (ib) { if (rec.button === undefined) rec.button = 'ink'; } else if (style && rec.button === undefined) rec.button = 'accent'; }
		/* CATEGORIES ABOVE THE TITLE BECAME A PLACE (2026-09-27, the text marks): a
		   record, link, published style or tweak that still says `kickerabove`
		   keeps what it meant: true is categories 'above'; on a tweak false says
		   the reader moved a style's categories back under the title, so
		   'below'; on a record false means nothing. A hand-set place wins. Keep
		   this lift: old exports carry it. */
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
		['pictureFilter', 'colourOnHover', 'dimInDark', 'pictureFrame', 'frameWidth', 'pictureFade', 'pictureShadow', 'pictureCorners', 'buttonColour', 'buttonShape', 'primaryButton', 'secondaryButton', 'tertiaryButton', 'tagsMatchButtons', 'currentItem', 'lineLength', 'titleWidth', 'pictureWidth', 'figureWidth', 'radius', 'borderWidth', 'borderStyle', 'borderStrength', 'tint', 'sans', 'scope', 'pictures', 'capLines', 'line', 'fill', 'softlevel', 'quietlevel', 'smallsoft', 'measure', 'space', 'spaceInside', 'spaceItems', 'spaceSections', 'spaceTitle', 'framewidth', 'linestyle', 'corners', 'fadeedges', 'markercolour', 'framepattern', 'button', 'buttonshape', 'buttonstyle', 'buttonmedium', 'buttonquiet', 'tags', 'chosenitem', 'linewidth', 'cards', 'quotes', 'notes', 'fields', 'paragraphs', 'capface', 'hyphenate', 'piccorners', 'pictureshadow', 'opening', 'widefigures', 'fullpicture', 'categories', 'links'].forEach(function (k) { if (data[k] !== undefined) entry[k] = data[k]; });
		['spaceInside', 'spaceItems', 'spaceSections', 'spaceTitle'].forEach(function (k) { if (typeof entry[k] === 'number') entry[k] = String(entry[k]); }); /* a pasted record may give the four jobs' sizes as numbers */
		if (data.roles && typeof data.roles === 'object') { entry.roles = data.roles; entry.architrave = 3; }
		if (data.effects && typeof data.effects === 'object') { var fx0 = effectsOf({ effects: data.effects }, null); if (Object.keys(fx0).length) entry.effects = fx0; } /* only known details, only off their rest */
		if (data.colours && typeof data.colours === 'object') entry.colours = data.colours;
		if (typeof data.preset === 'string' && presetById(data.preset)) entry.preset = data.preset; /* a saved style names its preset (2026-10-05) */
		var shape = function (x) { var c = {}; Object.keys(x).forEach(function (k) { if (k !== 'id') c[k] = x[k]; }); return JSON.stringify(c); };
		var had = STYLES.filter(function (x) { return x.own && shape(x) === shape(entry); })[0];
		if (had) return had;
		STYLES.push(entry); writeOwn();
		return entry;
	}
	/* What the tiles offer: the reader's own, the site's, and of the theme's
	   the finished ones, Standard only while no site style stands in for it. */
	/* THE READER'S THREE (Manuel, 2026-09-23: readers get the small panel "and
	   maybe 3 styles to choose from, like a browser reader … the owner picks
	   them"; the same on every site, elmastudio.de included, and no way through
	   to Customise). `architravePanelReader` is printed for everyone who may not
	   publish (inc/site-styles.php). A reader is offered the site's own look,
	   which is the theme's on a guest and the site default or Standard on
	   Architrave, and the two the owner picked (readerPicks, below, for the
	   two before the owner has picked). The owner sees everything, as before. */
	var READER = !!window.architravePanelReader;
	/* THE ORIGINAL (2026-10-05): the theme's own look, Standard on Architrave, the host's look elsewhere. It stands
	   first among what readers meet, always shown, and is never part of the order the owner drags. */
	function isOriginal(id) { var x = byId(id); return !!x && (!!x.host || (!GUEST && x.id === 'standard')); }
	function readerPicks() {
		if (SITE && Array.isArray(SITE.readers)) return SITE.readers.filter(function (id) { return typeof id === 'string'; }); /* AS MANY AS THE OWNER LIKES (Manuel, 2026-09-23: "make it choosable more than 2, as much as the user likes to show"); two until then */
		/* Until the owner picks: on a guest, two of the public four (Book is
		   not public any more, 2026-09-25); on Architrave, where Standard IS
		   the site's own, Book and Instrument as before. */
		return [];  /* one style, Original, which every reader has anyway (2026-10-02) */
	}
	/* THE PUBLIC FOUR (Manuel, 2026-09-25, before wordpress.org): on another
	   theme a fresh site offers only the finished looks — Classic, Matrix,
	   Instrument, Catalogue — beside the theme's own. The rest stay in
	   STYLES, unseen by anyone there until they are ready ("I'm still
	   developing them … once they're finished I want to make them join the
	   others"): a saved choice and a link still find them, so nothing a
	   reader kept ever breaks, and promoting one is adding its id here.
	   Architrave is Manuel's own site and shows him everything, as before. */
	var PUBLIC = ['standard']; /* the one left on 2026-10-02; the earlier lists are in the tags styles-archive-0.15.58 and 0.16.0 */
	function offered(p) {
		if (READER) return !!(p.host || p.id === DEFAULT || readerPicks().indexOf(p.id) !== -1);
		/* AND WHAT THE SITE ALREADY SHOWS ITS READERS (2026-09-25: Book stood on
		   Twenty Twenty-Five's "On your site" from before the public four, its tile
		   was drawn and a press on it found no button, so it did nothing). A choice
		   the site made keeps working, as the public four promise; a fresh site
		   still meets only the four. */
		if (window.architravePanelGuest && !(p.host || p.own || p.site || p.id === DEFAULT || PUBLIC.indexOf(p.id) !== -1 || readerPicks().indexOf(p.id) !== -1)) return false;
		/* THE OWNER SEES EVERY STYLE (Manuel, 2026-09-23: "make all styles visible
		   on elmastudio again"). SHOWN below was what elmastudio.de offered its
		   readers; readers have their own three now, chosen on For readers, so the
		   short list has nothing left to protect and whoever may publish gets the
		   whole row, Standard included beside a site default. The dead branches
		   that used to follow (SHOWN, the guest case, the backstage door) left
		   with the door on 2026-09-25; SHOWN itself still says what the rail's
		   Style menu offers below. */
		return true;
	}
	/* >>> THE LIST'S TABLES, GENERATED (tools/settings-list.mjs, from plugin/settings.json) */
	/* Do not edit between the markers: change plugin/settings.json and run `node tools/settings-list.mjs`,
	   which writes this block and then the list again from the running code; --check fails when they part. */
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
	var PICKS = { categories: { attr: 'data-categories', list: ['below', 'above', 'hidden'] }, tags: { attr: 'data-tags', list: ['text', 'filled', 'tinted', 'gray', 'outlined'] }, cards: { attr: 'data-cards', list: ['filled', 'outlined', 'raised'] }, quotes: { attr: 'data-quotes', list: ['indented', 'plain', 'sideLine', 'filled'] }, fields: { attr: 'data-fields', list: ['filled', 'outlined', 'raised'] }, paragraphs: { attr: 'data-paragraphs', list: ['spaced', 'indented'] }, capface: { attr: 'data-cap-face', list: ['text', 'bold', 'fraunces', 'title'] }, hyphenate: { attr: 'data-hyphenate', list: ['auto', 'few', 'any', 'off'] }, opening: { attr: 'data-opening', list: ['off', 'big'] }, links: { attr: 'data-links', list: ['both', 'coloured', 'underlined', 'bold', 'wash'] }, fullpicture: { attr: 'data-full-picture', list: ['off', 'on'] }, widefigures: { attr: 'data-wide-figures', list: ['off', 'on'] }, linewidth: { attr: 'data-line-width', list: ['1', '2', '3', '5'] }, buttonstyle: { attr: 'data-button-style', list: ['filled', 'outlined', 'shadow', 'tinted', 'gray', 'text'] }, buttonmedium: { attr: 'data-button-medium', list: ['gray', 'filled', 'tinted', 'outlined', 'shadow', 'text'] }, buttonquiet: { attr: 'data-button-quiet', list: ['text', 'filled', 'tinted', 'gray', 'outlined', 'shadow'] }, buttonshape: { attr: 'data-button-shape', list: ['cards', 'square', 'rounded', 'pill'] }, chosenitem: { attr: 'data-chosen-item', list: ['gray', 'filled', 'outlined', 'bold'] }, pictureshadow: { attr: 'data-picture-shadow', list: ['off', 'soft'] }, piccorners: { attr: 'data-pic-corners', list: ['cards', 'square'] } };
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
		meta: ['font', 'size', 'weight', 'lineHeight', 'letterSpacing', 'capitals', 'italic', 'colour'],
		interface: ['size', 'weight', 'lineHeight', 'letterSpacing', 'capitals', 'italic', 'colour'],
		code: ['font', 'size', 'weight', 'lineHeight', 'letterSpacing', 'capitals', 'italic', 'colour']
	};
	var TYPE_SIZES = ['-4', '-3', '-2', '-1', '0', '+1', '+2', '+3', '+4', '+5', '+6'];
	var TYPE_LINE = { tight: 'dense', snug: 'tight', normal: 'default', relaxed: 'airy', loose: 'wide' };
	var TYPE_LETTER = { tighter: 'm5', tight: 'm2', normal: 'default', wide: 'p2', wider: 'p5', widest: 'p10' };
	var TYPE_BASE = { title: 64, headings: 36, body: 22, quote: 26, meta: 16, interface: 13, code: 18 };
	var TYPE_MEANS = { roles: { title: 'The one big line of a page: the article\'s title, a page\'s name.', headings: 'The headings inside the text, and the site\'s name.', body: 'What people read: paragraphs, lists, excerpts, the comments\' words.', quote: 'Quotations and pull quotes.', meta: 'Small facts around the text: dates, authors, categories, tags, captions, names in comments.', interface: 'The site around the text: menus, buttons, fields, labels, section titles.', code: 'Code and keys, inline and in blocks.' }, dials: { font: 'A face id from the list, or body / interface to follow the reading or the interface font. Left out: the theme\'s own.', size: 'Steps from the role\'s own size, each 1.125 times the one before: -1 a little smaller, +1 a little larger, +3 about half again as large. 0 or left out: the theme\'s own.', weight: 'thin 100 to black 900; a face offers the weights it has and falls to the nearest.', lineHeight: 'tight for big titles, snug for headings, normal is the theme\'s own, relaxed for long reading, loose for airy small text.', letterSpacing: 'tighter and tight close large type up, normal is the theme\'s own, wide to widest open small capitals and labels.', capitals: 'true sets the role in capitals.', italic: 'true sets it in italic, where the face has one.', align: 'default (the start), center or right; title and headings.', colour: 'text (the text colour), mutedText (Soft text, the quiet colour of dates and captions), accent (the brand colour), or own (the role\'s own colour, colours.<side>.<role>). Left out: text, and for meta mutedText.' } };
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
		schema: ['architrave', 'label', 'base', 'reading', 'justify', 'dropcap', 'radius', 'borderWidth', 'titleWidth', 'colourOnHover', 'dimInDark', 'pictureFade', 'pictureFrame', 'pictureWidth', 'categories', 'tagsMatchButtons', 'alternates', 'scope', 'pictureFilter', 'capLines', 'borderStrength', 'links', 'lineLength', 'space', 'spaceInside', 'spaceItems', 'spaceSections', 'spaceTitle', 'frameWidth', 'borderStyle', 'buttonColour', 'buttonShape', 'primaryButton', 'secondaryButton', 'tertiaryButton', 'tags', 'currentItem', 'cards', 'quotes', 'fields', 'paragraphs', 'capface', 'hyphenate', 'pictureCorners', 'pictureShadow', 'opening', 'figureWidth', 'effects', 'roles', 'colours'],
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
			roles: 'Typography by seven roles, named for their job and tied to the HTML every site has. title: the one big line of a page (h1, the post title). headings: the headings inside the text (h2 to h6) and the site\'s name. body: what people read (p, li). quote: quotations. meta: small facts around the text (dates, authors, categories, tags, captions). interface: menus, buttons, fields, labels. code: code, pre, kbd. Every role takes font, size, weight, lineHeight, letterSpacing, capitals, italic; title and headings also align; every role also takes a colour (text, mutedText, accent or own). A dial left out is the theme\'s own. size is a step from the role\'s own size (-4 to +6, each 1.125 apart). lineHeight: tight, snug, normal, relaxed, loose. letterSpacing: tighter, tight, normal, wide, wider, widest. Records say architrave 3 (2 before the seven colours); older records with the eight roles are read into the seven.',
			colours: 'Seven colours per side, named for their job, as hex: background (Paper: the page the text sits on), background2 (Ground: the space around the page and the rails, a theme\'s second background), card (Cards: menus, boxes, fields standing on the page), text, mutedText (Soft text: dates, captions, small facts), accent (the brand colour: links and the main buttons) and highlight (the highlighter\'s colour; left out, none). Beside them the button\'s own colour and each type role\'s own (title, headings, body, quote, meta, interface, code), used with button own and roles.<role>.colour own. Leave out what you do not need: the rest is mixed from background and text. text on background must reach 4.5:1 and accent on background 3:1 on both sides. A background2 on the other side of its background (dark around a light page, light around a dark one) is a dark ground, worn around the page on wide screens with its own words, lines and links. Older records name paper, ink, ground, lift and marker; they are read as these. primary, foreground and muted-foreground are read as accent, text and mutedText.'
		}
	};
	/* <<< THE LIST'S TABLES */
	/* THE SEVEN COLOURS (Manuel, 2026-10-03, lab/the-colours.html): records, links, tweaks and the
	   window name them background (Paper), background2 (Ground), card (Cards), text, mutedText (Soft
	   text), accent and highlight (Highlighter), with the button's and each type role's own colour
	   beside them. The engine below keeps the names it was written with (paper, ink, ground, lift,
	   marker, muted); coloursOf reads either and setColour writes the new ones. Softer reading text,
	   the highlighter's switch and pen, the dark ground and the accent's name are no settings of
	   their own any more: the engine still stamps them, worked out from the colours (optionOn). */
	var COLOUR_ENGINE = { background: 'paper', text: 'ink', background2: 'ground', card: 'lift', highlight: 'marker', mutedText: 'muted' };
	var COLOUR_PUBLIC = { paper: 'background', ink: 'text', ground: 'background2', lift: 'card', marker: 'highlight', muted: 'mutedText' };
	var COLOUR_KEYS = ['background', 'background2', 'card', 'text', 'mutedText', 'accent', 'highlight'];
	var ROLE_WELLS = ['title', 'headings', 'body', 'quote', 'meta', 'interface', 'code'];
	var WELL_KEYS = COLOUR_KEYS.concat(['button'], ROLE_WELLS);
	var BESIDE_PRESET = ['button', 'highlight', 'mutedText'].concat(ROLE_WELLS); /* wells that sit beside a preset: choosing one keeps the preset */
	var ENGINE_WELLS = ['paper', 'ink', 'accent', 'button', 'ground', 'lift', 'marker', 'muted', 'inverse'].concat(ROLE_WELLS);
	var PENS = { yellow: '#fff347', green: '#b4f07c', pink: '#ffb0d8', blue: '#a4d8ff', orange: '#ffc46e' };
	function penOf(hex) { var h = String(hex || '').toLowerCase(); return Object.keys(PENS).filter(function (n) { return PENS[n] === h; })[0] || ''; }
	var TYPE_COLOURS = ['text', 'mutedText', 'accent', 'own'];
	function typeColourRest(role) { return role === 'meta' ? 'mutedText' : 'text'; } /* small text rests on Soft text, every other role on the text */
	var ENGINE_ONLY = ['palette', 'tint', 'soft', 'softlevel', 'quietlevel', 'smallsoft', 'marker', 'markercolour', 'darkground', 'measure', 'widehead', 'widepicture', 'fullpicture', 'widefigures', 'rounded', 'corners', 'lines', 'linewidth', 'hairlines', 'line', 'linestyle', 'fills', 'button', 'buttonshape', 'buttonstyle', 'buttonmedium', 'buttonquiet', 'tagsfollow', 'chosenitem', 'pictures', 'picturehover', 'picturedim', 'pictureframe', 'framepattern', 'framewidth', 'picturefade', 'fadeedges', 'pictureshadow', 'piccorners', 'fill']; /* fill left the record too (2026-10-05): the engine keeps its level at the rest */
	/* THE LAYOUT IN WORDPRESS'S WORDS (Manuel, 2026-10-03, lab/the-layout.html: "make it that AI loves it,
	   and WordPress still work"): the line length in letters, and each part that can step out of the reading
	   column by WordPress's own alignment words, content, wide or full. Records, tweaks and the window name
	   these; the engine still stamps what it did (measure, widehead, widepicture, fullpicture, widefigures),
	   worked out from them (optionOn, pickOf, levelOf). */
	var LAYOUT = { lineLength: { list: ['60', '64', '68', '72', '76', '80', '84', '88'], rest: '72' }, titleWidth: { list: ['content', 'wide'], rest: 'content' }, pictureWidth: { list: ['content', 'wide', 'full'], rest: 'content' }, figureWidth: { list: ['content', 'wide'], rest: 'content' },
		/* CORNERS AND LINES IN CSS'S WORDS (Manuel, 2026-10-03, lab/the-corners-and-lines.html): one key per row,
		   None first where the row can be off; the engine stamps rounded, corners, lines, linewidth, hairlines,
		   line, linestyle, fills and fill as before, worked out from these. */
		radius: { list: ['none', 'small', 'medium', 'large', 'xlarge'], rest: 'medium' }, borderWidth: { list: ['none', 'hairline', '1', '2', '3', '5'], rest: 'none' }, borderStyle: { list: ['solid', 'dashed', 'dotted'], rest: 'solid' }, borderStrength: { list: ['10', '20', '45', '70', '100'], rest: '45' },
		/* THE BUTTONS IN THE NAMES DESIGN SYSTEMS USE (Manuel, 2026-10-03, "ok do it. go"; lab/the-buttons.html):
		   the three levels primary, secondary, tertiary, the colour's text as the colour page says it, the
		   shape's match for the cards' own corner, the current item as the web names it. */
		buttonColour: { list: ['accent', 'text', 'own'], rest: 'accent' }, buttonShape: { list: ['match', 'square', 'rounded', 'pill'], rest: 'match' },
		primaryButton: { list: ['filled', 'outlined', 'shadow', 'tinted', 'gray', 'text'], rest: 'filled' }, secondaryButton: { list: ['gray', 'filled', 'tinted', 'outlined', 'shadow', 'text'], rest: 'gray' }, tertiaryButton: { list: ['text', 'filled', 'tinted', 'gray', 'outlined', 'shadow'], rest: 'text' },
		tagsMatchButtons: { list: [false, true], rest: false }, currentItem: { list: ['gray', 'filled', 'outlined', 'bold'], rest: 'gray' },
		/* THE PICTURES, ONE KEY PER ROW (Manuel, 2026-10-03, "ok do it. go"; lab/the-pictures.html), None first */
		pictureFilter: { list: ['none', 'grayscale', 'sepia', 'tinted', 'duotone', 'grain', 'warm', 'hidden'], rest: 'none' }, colourOnHover: { list: [false, true], rest: false }, dimInDark: { list: [false, true], rest: false },
		pictureFrame: { list: ['none', 'plain', 'dots', 'checker'], rest: 'plain' }, frameWidth: { list: ['4', '8', '12', '16', '24', '32'], rest: '8' }, pictureFade: { list: ['none', 'bottom', 'sides', 'all'], rest: 'none' },
		pictureShadow: { list: ['none', 'soft'], rest: 'none' }, pictureCorners: { list: ['match', 'square'], rest: 'match' } };
	var FILTER_ENGINE = { none: 'plain', grayscale: 'bw', tinted: 'duo', duotone: 'accent' };
	var RENAMED_PICK = { buttonstyle: 'primaryButton', buttonmedium: 'secondaryButton', buttonquiet: 'tertiaryButton', buttonshape: 'buttonShape', chosenitem: 'currentItem' }; /* the engine's pick, from its new name */
	/* THE SURFACES IN ONE SET OF WORDS (2026-10-03): the saved word, and the engine's own it stamps */
	var SURFACE_ENGINE = { cards: { filled: 'box', outlined: 'outline', raised: 'raised' }, quotes: { indented: 'indent', sideLine: 'line', plain: 'plain', filled: 'box' }, notes: { filled: 'flat', outlined: 'box', raised: 'raised' }, fields: { filled: 'flat', outlined: 'box', raised: 'raised' } };
	function surfaceWord(key, v) { var m = SURFACE_ENGINE[key]; if (!m || m[v]) return v; var w = Object.keys(m).filter(function (k) { return m[k] === v; })[0]; return w || v; }
	function layoutOwn(k) { var L = LAYOUT[k], s = byId(current), b = s && byId(baseOf(s)); if (s && L.list.indexOf(s[k]) !== -1) return s[k]; if (b && L.list.indexOf(b[k]) !== -1) return b[k]; return L.rest; }
	function layoutOf(k) { var tw = readTweaks()[current]; return tw && LAYOUT[k].list.indexOf(tw[k]) !== -1 ? tw[k] : layoutOwn(k); }
	function inRecord(k) { return ENGINE_ONLY.indexOf(k) === -1; }
	function colourKey(k) { return COLOUR_PUBLIC[k] || k; }
	function engineSide(o) { var out = {}; Object.keys(o || {}).forEach(function (k) { if (o[k] !== undefined) out[COLOUR_ENGINE[k] || k] = o[k]; }); return out; }
	function publicSide(o) { var out = {}; Object.keys(o || {}).forEach(function (k) { if (o[k] !== undefined && k !== 'inverse') out[COLOUR_PUBLIC[k] || k] = o[k]; }); return out; }
	/* A ground on the other side of the paper (dark around a light paper, or light around a dark one)
	   is the dark ground: it is worn around the paper as the switch wore it (applyGround). */
	function groundFlip(G, P, I) {
		if (!G || !P || !/^#[0-9a-f]{6}$/i.test(G) || !/^#[0-9a-f]{6}$/i.test(P)) return false;
		var other = lum(P) > 0.18 ? '#dfdfdf' : '#232323'; /* the other side's words */
		I = /^#[0-9a-f]{6}$/i.test(I || '') ? I : lum(P) > 0.18 ? '#232323' : '#dfdfdf';
		return contrast(other, G) > contrast(I, G); /* across: the other side's words read better on it than this side's */
	}
	/* Original's own paper, text and ground, as measured on its two sides (2026-10-03); the one pair left */
	function paperNow(side) { return side === 'dark' ? '#373737' : '#ffffff'; }
	function inkOf(side) { return side === 'dark' ? '#dfdfdf' : '#232323'; }
	function canvasOf(side) { return side === 'dark' ? '#2b2b2b' : '#ebebeb'; }
	/* THE QUOTE'S SLANT RESTS WHERE THE THEME PUTS IT (2026-09-27, found by the new
	   window's check): Architrave sets its quotes in italic, so its rest is italic and the
	   switch reads on; it read off while every quote on the page leaned, and turning it
	   off could never stand one upright. A stranger's theme sets its own (Twenty
	   Twenty-Five's stand upright), so there the rest stays off and the theme's own shows. */
	if (window.architravePanelGuest) ROLE_DEFAULT.quote.italic = false;
	/* DIALS: the list's tables above (plugin/settings.json). */
	/* ROUNDED CORNERS joined 2026-09-11 (Manuel: square corners "could be a
	   setting … on the other styles as well, but not by default"): on
	   everywhere but Terminal, whose text-mode box has no rounded corner. */
	/* LINES joined 2026-09-12 (Manuel: Terminal's line work "could also be a
	   setting that could turn on and off, and it could be applied to all
	   the others as well"): on in Terminal's recipe, off elsewhere. */
	/* BOLD TEXT joined 2026-09-12 (Manuel, from Books' own switch: "that's an
	   individual toggle, so would we need something as well?"): the body and
	   the meta at 500, headlines untouched; Clear rests on, the others off. */
	/* FILLS joined 2026-09-12 (Manuel): the resting fills of cards, fields,
	   buttons and squares; off, the lines alone draw them. Terminal rests
	   off, the rest on; lines and fills are independent now. */
	/* WIDE LETTERS joined 2026-09-12 (the reader's side, as Books' character
	   spacing): the reading text tracked and word-spaced a little; every
	   style rests off. */
	/* SCANLINES AND GLOW joined 2026-09-19 (Manuel: "Make scan lines their own
	   switch and make a glow setting as well"): the cabinet's glass was
	   Arcade's alone, tied to data-style; it is a switch of the page now, on
	   in Arcade's recipe and off elsewhere, and any style may wear it. Glow
	   is a soft light around the letters in their own ink, an old screen's;
	   every style rests off. It shows by night; on a pale paper a dark ink
	   has no light to give. */
	/* widehead joined 2026-09-26 for Specimen (Manuel: "that big font has to be wider … a quite short headline for four lines, that's not good"): the title, the categories and the date line take the wide picture's width */
	/* darkground joined 2026-09-26 for Specimen (Manuel: "yes" to a dark band at the foot; Architrave has no foot, so it is the ground around the paper): see THE DARK GROUND below */
	/* inkbutton left 2026-09-26 for the pick `button` (THE BUTTON'S COLOUR); liftCentre reads it still */ /* OPTS: the list's tables above (plugin/settings.json). */ /* pillbuttons left 2026-09-26 for the pick `buttonshape` (THE SHAPE ROUND); liftCentre reads it still. tagsfollow joined the same day */ /* hairlines joined 2026-09-26, the reference's half-pixel lines for Instrument; only with Lines on */ /* pillbuttons joined 2026-09-26, split out of the corners dial's pill step (liftCentre) */ /* centretitle left on 2026-09-25 for the roles' alignment (liftCentre) */ /* dots, marker, inkbutton and centretitle joined 2026-09-24 for Catalogue (Manuel: "lets do all 4"); soft joined 2026-09-21 (lab/the-heading-colour.html, way B): the reading text a step toward the paper, headings, bold words and links at the ink; every style rests off but Instrument */ /* grain, the paper's own, joined the same evening (LEVELS `grainlevel`); every style rests off */ /* scanlines and glow joined 2026-09-19 (below); Arcade rests on scanlines, every other style off */ /* the two picture switches joined 2026-09-19; every style rests off */ /* bold left 2026-09-13: it is Lesetext's weight now (ROLES) */ /* wide left 2026-09-13: character spacing is a dial now (TRACKING) */ /* hyphens left the list 2026-09-12: it follows justify (below) */
	/* THE TINT (Manuel, 2026-09-12: "colors should be apple colors. what would
	   apple do?"): Apple's accent-colour row, Multicolor first meaning the
	   app's own, then eight named colours. Here 'default' is the pair's
	   own accent and the eight are Apple's system colours; a choice is a
	   tweak of the style, stamped as data-tint before paint, gone on reset.
	   Named by the theme, ahead of QDS, which takes them later. */
	/* THE SITE'S OWN THREE (Manuel, 2026-09-12, after a morning with Apple's
	   eight: "we need to have our already used colors in the accent list,
	   so take the others which are not part of any default out"): the
	   purple Standard and Poster rest on, Book's brown, Terminal's green.
	   Every style names one in its recipe, the row marks it, and a reader
	   may move a style onto another; the accent is the style's own dial
	   now, not the pair's, so Standard moved onto Paper stays purple. */
	/* TINTS: the list's tables above (plugin/settings.json). */ /* orange: the arcade's (2026-09-14) */ /* red, the newspaper's, went with it (2026-09-15) */ /* blue, Persona's, back for Poster (Manuel, 2026-09-12: "a fourth color for plakat, the blue back again") */
	/* A PRESET SETS ALL THREE (Manuel, 2026-09-16: "I want to reverse that step
	   where we said the accent should not be part of the preset … A preset
	   consists of three things: the paper, the ink and the accent. Therefore
	   if I choose a preset, all three are set"). The fifteen authored pairs
	   carry their accent in their own table; the five modes carry theirs here,
	   the tint each was drawn with, which is the accent Standard, Book, Klar,
	   Terminal and Arcade have always worn. */
	var PAIR_TINTS = { neutral: 'purple', paper: 'brown', grey: 'blue', terminal: 'green', arcade: 'orange' };
	function tintOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && TINTS.indexOf(tw.tint) !== -1) return tw.tint;
		return (s && s.tint) || TINTS[0];
	}
	function applyTint() { var v = tintOf(); if (root.getAttribute('data-tint') !== v) root.setAttribute('data-tint', v); }
	/* THE INTERFACE FACE (Manuel, 2026-09-12: "we can choose between the
	   reading font and the meta font … so we could individually combine
	   each font with one another"): the sans around the writing, the rail,
	   the dates, the panel, was each style's own in the stylesheet; it is
	   a dial now, stamped as data-sans before paint from the recipe or the
	   reader's tweak, the reading face's twin. */
	/* ONE LIST FOR EVERY ROLE (Manuel, 2026-09-13: "all those fonts are
	   available in all locations"; the serifs were kept off the interface
	   until the roles' dials could make any face work anywhere). */
	/* THE SAME TWELVE THE ARTICLE HAS (2026-09-13: "all those fonts are
	   available in all locations"), in the same order and the same four groups —
	   one list, so Oberfläche cannot offer a face Überschriften does not. */
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
		/* A PICK UNDER A GUEST'S OWN LOOK IS A PICK EVEN WHEN IT IS OUR REST (see setRole): stamped so the guest sheet spends it. */
		var own = window.architravePanelGuest && !isLook(current) && (readTweaks()[current] || {}).sans !== undefined;
		if (own) root.setAttribute('data-sans-own', ''); else root.removeAttribute('data-sans-own');
	}
	/* THE ROLES OF TYPE (Manuel, 2026-09-13; lab/the-roles-of-type.html:
	   "the question is always which font to apply to which area"). Five
	   roles a page has, each with the same dials: the face, the weight, a
	   size step, the character spacing, capitals. Überschriften is the
	   titles and the headings and the kicker under the title; Lesetext the
	   article's paragraphs (its face is the Artikel dial, its size the
	   reader's stepper, so those two are not repeated here); Kleintext the
	   dates, categories, captions and tags; Oberfläche the rail, the menus,
	   the buttons, the cards (its face is the Oberfläche dial); Titel der
	   Oberfläche the section and group titles. A recipe names only what
	   differs from Standard; a reader's press is a tweak of the style like
	   every dial. The values are written on <html> as custom properties
	   before paint, one mechanism for every role. */
	/* KOMMENTARE, A ROLE OF ITS OWN (Manuel, 2026-09-17: "a commenter's name is
	   part of the article but not the comment itself. That doesn't make sense
	   to me"). It did not: the name was Nebentext's and the words were
	   Oberfläche's, so one comment was set by two roles and neither of them
	   was about comments. A comment is a body of text somebody reads for
	   minutes, which is what deserves its own face, weight, size and line
	   spacing; Oberfläche goes back to meaning the buttons and the menus. The
	   role takes the name, the words, the reply link, the form and the two
	   titles over them (style.css, KOMMENTARE). */
	/* ROLES: the list's tables above (plugin/settings.json). */ /* quote: Zitate, the sixth, 2026-09-15; comment: Kommentare, the eighth, 2026-09-17 */
	/* ROLE_DEFAULT: the list's tables above (plugin/settings.json). */
	/* EVERY ROLE CARRIES EVERY DIAL (Manuel, 2026-09-17): the same six
	   settings on every row, and the four spacings — Größe, Zeilenabstand,
	   Laufweite, Wortabstand — on all of them. Wortabstand was Fließtext's
	   alone since 2026-09-15; it is every role's now, written as
	   --<role>-words beside --<role>-tracking in style.css. Fließtext keeps
	   its own two tokens (--reading-tracking, --reading-word-gap), which
	   reach the article's whole content and not one selector. */
	/* TWO VOICES, NOT EIGHT (Manuel, 2026-09-22: "if we do it we should do it
	   coherently … what about the categories and the other stuff? … let's
	   think it through coherently"). A page has the article's voice and the
	   site's, and every role already rested on one of them; Zitate said so
	   ('inherit') and the others named the face the anchor happened to be,
	   which is why one row read "same as" and the next read "Newsreader".
	   Now two roles are ANCHORS, Fließtext (data-face) and Oberfläche
	   (data-sans), and the six others are FOLLOWERS: a follower's face is
	   'read' or 'ui', the anchor it follows, or a face of its own, a pin.
	   At rest every follower follows, so one press on Schriftart changes
	   the whole article, and a tile pins a face on a role where it means
	   to (Blueprint's headlines in JetBrains Mono over a Plex Sans text).
	   Only the FACE follows: weight, size, spacing, case and slant are the
	   role's own, because "the title is bold" is a decision about the
	   title. This reverses A FACE A DIAL CANNOT MOVE (style.css,
	   2026-09-17) with its eyes open: the fault then was rows that FOLLOWED
	   AND SAID A NAME; a row that says "Same as interface" is honest. */
	/* head: 64 is the article TITLE's own size, which is what the slider names (2026-09-17) */
	/* quote: at rest the quote reads in the reading face and keeps the stylesheet's italic */
	/* kicker: THE CATEGORY LINE (Manuel, 2026-09-15: "part of the initial design … not the same style as the date"); at rest it reads in the article's voice, italic */
	/* comment: the rest is where --text-comment-body already stood: three rungs under the reading */
	/* ui: members: the role's family, see THE MEMBERS OF A ROLE */
	/* Every face the theme ships, by the family theme.json registers. */
	var FAMILY = {
		/* INTER IS --face-inter AND NOT THE font-sans PRESET. The Oberfläche dial
		   rewrites that preset, so a role stamped with it did not mean Inter, it
		   meant "the same as Oberfläche" — and Nebentext, Kommentare and
		   Abschnittstitel followed that row until the reader set them
		   (style.css, A FACE A DIAL CANNOT MOVE, 2026-09-17). */
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
		'plex-mono': 'var(--wp--preset--font-family--font-jetbrains-mono)', /* a style saved in the few hours Plex Mono was here still finds a face */
		doto: 'var(--wp--preset--font-family--font-doto)',
		vt323: 'var(--wp--preset--font-family--font-vt-323)',
		handjet: 'var(--wp--preset--font-family--font-handjet)'
	};
	var SERIFS = ['newsreader', 'libre-baskerville', 'vollkorn'];
	/* THE FACES THAT SHIP AN ITALIC (theme.json's font faces; Manuel,
	   2026-09-13: italic or regular is a font setting too). The others would
	   only be slanted by the browser, so the switch is not offered for them. */
	/* THE FACES THAT SHIP AN ITALIC, and it is the SHIPPED FILE that decides,
	   not the family: each of these has a matching -italic woff2 in
	   assets/fonts/webfonts. The others would only be slanted by the browser,
	   so the switch is not offered for them (2026-09-13). */
	var ITALICS = ['newsreader', 'libre-baskerville', 'vollkorn', 'geist', 'plex-sans', 'jetbrains-mono', 'inter', 'hyperlegible']; /* Inter's and Atkinson's italics shipped 2026-10-05 (Manuel: quotes always italic, Still's and Clear's too) */
	function hasItalic(face) {
		face = realFace(face); return ITALICS.indexOf(face) !== -1; }
	/* THE WEIGHT IS THE FACE'S (Manuel, 2026-09-13: "not all of them have the
	   same possibilities"): five names on one ladder, and a face offers
	   the ones inside its own range, from theme.json's font faces. A
	   weight a face cannot set falls to its nearest. */
	/* THE NINE WEIGHTS, named as the type world names them (Manuel,
	   2026-09-13: "there's no font weight called lighter"): Google Fonts'
	   ladder, 100 to 900. A face offers the ones inside its own range. */
	var WEIGHT = { thin: 100, extralight: 200, light: 300, regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900 };
	/* The names of 1.1.942, as older tweaks may still say them. */
	/* WEIGHT_ALIAS: the list's tables above (plugin/settings.json). */
	/* EVERY RANGE READ OFF THE SHIPPED FILE'S fvar TABLE (2026-09-17), not off a
	   specimen page: Bodoni Moda starts at 400 and has no light weights at all,
	   and a ladder that offers one it cannot set is a ladder that lies.
	   Workbench has NO wght axis — its two are a bleed and a scanline — so its
	   range is empty and the weight row disables itself, as Kursiv does on a
	   face without one. */
	var RANGE = { inter: [100, 900], hyperlegible: [200, 800], geist: [100, 900], newsreader: [200, 800], 'libre-baskerville': [400, 700], vollkorn: [400, 900], mono: [100, 900], 'martian-mono': [100, 800], 'kode-mono': [400, 700], 'plex-sans': [100, 700], 'jetbrains-mono': [100, 800], doto: [100, 900], vt323: [], handjet: [100, 900] }; /* Doto replaced Workbench (2026-09-18); VT323 and Handjet replaced Geist Pixel and Pixelify Sans (Manuel, 2026-09-20). VT323 is one weight, as Geist Pixel was, so its row greys out */
	/* A ROLE THAT FOLLOWS AN ANCHOR (2026-09-16; both anchors since 2026-09-22):
	   'read' and 'ui' are not faces of their own, so everything that asks
	   about a face resolves them first. 'inherit' is the word 'read' went by
	   until 2026-09-22 and a style saved before then may still carry it. */
	/* FOLLOW_ALIAS: the list's tables above (plugin/settings.json). */
	function isAnchor(face) { return face === 'read' || face === 'ui'; }
	function realFace(face) {
		face = FOLLOW_ALIAS[face] || face;
		if (face === 'read') return root.getAttribute('data-face') || 'newsreader';
		if (face === 'ui') return root.getAttribute('data-sans') || 'inter';
		return face;
	}
	/* What a follower's token is set to: the anchor's own token, so the
	   stylesheet follows the anchor wherever it goes, or a pinned family. */
	function faceValue(face) {
		if (face === 'read') return 'var(--font-reading)';
		if (face === 'ui') return 'var(--font-sans)';
		return FAMILY[face] || FAMILY.newsreader;
	}
	/* THE LIBRARY (2026-09-23): seventy-four faces more, from
	   window.ArchitraveFontLibrary (tools/font-library.py), on every list the
	   fifteen are on. A library face's family is its stack itself, not a preset
	   variable: they are not given to WordPress as theme data. A static face
	   says its exact cuts (`weights`, Space Mono's 400 and 700), so the weight
	   row offers those two and not a Medium the file cannot draw. */
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
		/* A FACE WITH NO WEIGHT AXIS AT ALL (Workbench, 2026-09-17): there is
		   nothing to fit to, so the role keeps the weight it had and gets it back
		   the moment another face is chosen. Without this the nearest-weight
		   search reads ok[0] off an empty list and the role's weight becomes
		   undefined, which reaches the stylesheet as the string "undefined". */
		if (!ok.length) return w;
		if (ok.indexOf(w) !== -1) return w;
		var want = WEIGHT[w] || 400, best = ok[0];
		ok.forEach(function (k) { if (Math.abs(WEIGHT[k] - want) < Math.abs(WEIGHT[best] - want)) best = k; });
		return best;
	}
	/* THE FULL RANGE (Manuel, 2026-09-13: "we always need the full range",
	   for a terminal look whose titles read at the text's size): nine
	   factors from half to one and a half, and for Überschriften a first
	   stop, 'text', that sets the title and every heading to the reading
	   text's own size. The ids are the percentages. */
	/* A STEP IS A RUNG, NOT A PERCENTAGE (Manuel, 2026-09-16: "what would apple
	   do?" — Dynamic Type walks one curated ladder of real sizes, and no
	   element is scaled by a free factor). Each role has a base, the size it
	   ships at, and a list of rungs off the system's scale; a step writes the
	   factor rung ÷ base, so the role's own element lands exactly on that
	   rung and everything else under the role keeps its relation to it.
	   Nothing moves at rest: the base IS the resting size. */
	/* A ROLE'S BASE IS THE ELEMENT THE NUMBER NAMES. A step writes rung ÷ base,
	   so exactly one element per role lands on the number the slider says and
	   everything else under that role keeps its relation to it.

	   ÜBERSCHRIFTEN NAMES THE TITLE, NOT THE H1 (Manuel, 2026-09-17). It was 44,
	   the h1's size, so the article title — 64 at rest, the biggest thing on the
	   page and the thing a reader is looking at while dragging — came out 45%
	   over the number: 72 on the slider, 104 on the page. Nobody noticed while
	   the ladder ran 28 to 72 and every stop was near the title's own size; at
	   12 to 72 it is the first thing you see. No shipped style names a head
	   size, so nothing moves and there is nothing to migrate.

	   KOMMENTARE KEEPS 16, the size a comment reads at under the article, and
	   knowingly: with the frame on the comments stand in their own column at 13,
	   so there is no single number that is right in both places. Trading one
	   wrong number for another buys nothing. */
	var ROLE_BASE = { head: 64, read: 22, quote: 26, kicker: 26, small: 16, comment: 14, ui: 13, title: 11 }; /* comment 14 since 2026-09-19: one rest on both sides */
	/* THE MEMBERS OF A ROLE (Manuel, 2026-09-18; lab/the-members-of-a-role.html).
	   Oberfläche's one number names the menus and the buttons, the family's
	   lead, and four more sizes follow it in their order: the masthead above,
	   the card titles, the labels and the credit line below. That is how the
	   role always worked — one dial, five sizes in a hierarchy — and it is
	   what Manuel asked to keep by default ("one size, one role … unless we
	   could have another setting which binds some of them together and I
	   could unbind them on purpose").

	   So a member is BOUND unless the style says otherwise: it reads at its
	   resting size times the lead's factor, and the record does not mention
	   it. Released, it carries its own size, a rung of the interface ladder:
	   roles.ui.members.masthead = { size: '20' }. Absence is the binding, as
	   it was for the colour sides. The stylesheet reads each
	   member through its own token with the lead's as the fallback
	   (--ui-size-masthead, var(--ui-size)), gated on data-ui-members so a
	   released member moves while the lead rests.

	   `rest` is the member's size at Standard's rest, read from the browser
	   (2026-09-18), which the panel multiplies by the lead's factor to say
	   the number a bound member reads at. The card titles rest at the base
	   size, the lead's own; they are a member because they are a different
	   set of things (the rail's rows, the related rows, the search results,
	   the newsletter door, the link card's name line, the ruler's label),
	   not because they were a different number.

	   `weight` is the member's resting weight, read from the browser the same
	   day (Manuel, 2026-09-18, on a bound row saying Bold over a semibold
	   heading: "fix the small lie"): a bound row says this until the role's
	   own weight dial moves, because that is what the element reads at. The
	   nearest named weight stands for the room's 420/440 body weight. */
	/* MEMBERS: the list's tables above (plugin/settings.json). */
	/* ui.masthead: 20 since 2026-09-19, a rung over the large card titles */
	/* ui.linkcard: the link card's title, back from Fließtext (2026-09-18): one member, one size, and 18 is its own; the theme card's title joined it the same night */
	/* ui.newsletter: the newsletter door's title, text and words; they rest at 16 and were filed under the card titles at 13 (the audit, 2026-09-18) */
	/* ui.fields: the search field; it rests at the base size and grows to 16 on a touch screen alone (the iOS zoom rule), which the number here does not show */
	/* ui.labels: 11 since 2026-09-19: the 12 rung is gone */
	/* head.sub: the headings inside the article, h1 to h6, a ladder that moves as one; 36 is h2's */
	/* small.date: the article's date line */
	/* small.author: the author's name and bio under the article (Manuel, 2026-09-18: "there should be a difference between the little categories and tags, and author name and bio"); the name rests a weight up, at medium */
	/* small.terms: the categories and tags lines at the article's end */
	/* small.captions: under the pictures, and the quote's source */
	/* small.carddates: the dates on the rail's rows, the related rows, the cards */
	/* small.release: the version line and the archive banner on a theme's release post (2026-09-18: they read at 22 by an old accident, 16 is what release-post.css always stated) */
	/* comment.name: the commenter's name, a weight up at rest; in the frame's column it rests a rung under the words */
	/* comment.small: dates and reply links */
	/* comment.form: the form's labels, notes and buttons */
	/* read.excerpts: the excerpts on the front page's cards; Gilt für binds them to the paragraphs, a release gives them a size of their own either way */
	/* read.boxes: paragraphs and buttons in a box with a background inside the article (Manuel, 2026-09-18: "those are a little big?"): a note in a box is an aside, so it rests a size under the paragraph, at the interface's 18 */
	/* title.years: the archive's year titles, at 16 under a dial that rests at 11 (the audit, 2026-09-18) */
	/* title.release: the titles over a release post's demo and download buttons */
	/* THE FOUR DIALS A RELEASED MEMBER MAY CARRY (Manuel, 2026-09-18: "do all of
	   that"): its size, its weight, its capitals, its character spacing. Each
	   is released on its own; a member with none is bound and absent from the
	   record. The stylesheet reads a released dial through a token of the
	   member's own (--ui-weight-masthead) under an attribute of its own
	   (data-ui-m-masthead-weight); see THE MEMBERS' OVERRIDES at the end of
	   style.css. */
	var MEMBER_DIALS = ['size', 'weight', 'caps', 'tracking'];
	/* THE ALIGNMENT OF A ROLE (Manuel, 2026-09-25: centring "should be like how
	   its text is aligned … left, centred, right-aligned … would cover us in the
	   future"). A dial of the two roles that open a piece, Überschriften and
	   Kategorien, where ROLE_DEFAULT carries `align`; 'default' is the theme's
	   own, the start, and writes nothing. It replaced the switch `centretitle`
	   (liftCentre below). Überschriften's member `sub`, the headings inside the
	   article, can keep an alignment of its own, so a centred title stands over
	   headings on the left. Reading text keeps Justified text instead, and the
	   date row is nobody's to centre. */
	var ALIGN = { 'default': 'start', center: 'center', right: 'right' };
	var ALIGNS = Object.keys(ALIGN);
	/* THE COLOUR OF A ROLE (Manuel, 2026-09-26, lab/the-heading-colour-2.html, A:
	   "go with your recommendation"; round one of the settings plan). A dial of
	   the same two roles: the headings and the category line wear the ink (the
	   rest, writes nothing), the accent, or a colour of their own, a well per
	   side (`colours.<side>.head`, `colours.<side>.kicker`, edited as paper and
	   ink are, picked from the accent's twenty, never Custom). The token is
	   `--<role>-colour`, written off the rest as var(--accent) or the well's
	   token; style.css spends it on the role's elements and their links. */
	/* ROLE_COLOURS: the list's tables above (plugin/settings.json). */
	/* A MEMBER THAT FOLLOWS ANOTHER OF THE SEVEN (2026-10-02): the headings inside the
	   article answer to Headings while the title answers to Title, and the comments'
	   parts to Headings, Small text and Interface while their text is Reading text.
	   They take the font and the slant as well (written by engineFrom only), and the
	   headings their line spacing and colour too. */
	var MEMBER_MORE = { 'head.sub': ['face', 'italic', 'leading', 'colour'], 'comment.title': ['face', 'italic'], 'comment.name': ['face', 'italic'], 'comment.small': ['face', 'italic'], 'comment.form': ['face', 'italic'] };
	function memberDialsOf(role, id) {
		var base = ROLE_DEFAULT[role] && ROLE_DEFAULT[role].align !== undefined ? MEMBER_DIALS.concat('align') : MEMBER_DIALS;
		return id && MEMBER_MORE[role + '.' + id] ? base.concat(MEMBER_MORE[role + '.' + id]) : base;
	}
	function membersOf(role) { return MEMBERS[role] || []; }
	/* THE SEVEN ROLES (Manuel, 2026-10-02, lab/the-typography-roles.html: "it's actually
	   made for the AI"). What a record, a tweak, the window and an assistant speak:
	   seven roles named for their job and tied to the HTML every site has, the same
	   dials on each, short scales with plain names, and NO parts. The eight roles and
	   their members below stay as the engine that draws the page: engineFrom() turns
	   the seven into them, and an empty seven is an empty engine, so a style that sets
	   nothing looks exactly as before.

	   A dial left out is the theme's own. Sizes are steps from each part's own size,
	   1.125 apart (a step is about one rung of the type scale), so one Small text can
	   move a 16px date and a 26px category line together and both keep their place.
	   Line spacing and letter spacing are named steps whose `normal` is the theme's
	   own. The body's font and line spacing are the record's `face` and `leading`, and
	   the interface's font is `sans`: the first paint reads those three. */
	/* TYPE_ROLES, TYPE_DIALS, TYPE_SIZES, TYPE_LINE, TYPE_LETTER, TYPE_BASE, TYPE_MEANS: the list's tables above (plugin/settings.json, `roles` and `type`). */
	/* The engine's roles, each answering to one of the seven, and the members that answer to another. */
	var TYPE_LEADS = { head: 'title', read: 'body', comment: 'body', quote: 'quote', small: 'meta', kicker: 'meta', ui: 'interface', title: 'interface' };
	var TYPE_PARTS = [['headings', 'head', 'sub'], ['headings', 'comment', 'title'], ['meta', 'comment', 'name'], ['meta', 'comment', 'small'], ['interface', 'comment', 'form']];
	var ENGINE_DIAL = { font: 'face', size: 'factor', weight: 'weight', lineHeight: 'leading', letterSpacing: 'tracking', capitals: 'caps', italic: 'italic', align: 'align', colour: 'colour' };
	function typeFactor(step) { var n = parseInt(step, 10); return isNaN(n) ? 1 : Math.pow(1.125, n); }
	function typeOk(role, dial, v) {
		if (v === undefined || v === null || TYPE_DIALS[role].indexOf(dial) === -1) return false;
		if (dial === 'font') return typeof v === 'string' && (v === 'body' || v === 'interface' || !!FAMILY[v]);
		if (dial === 'weight') return !!WEIGHT[WEIGHT_ALIAS[v] || v];
		if (dial === 'size') return TYPE_SIZES.indexOf(String(v)) !== -1;
		if (dial === 'lineHeight') return !!TYPE_LINE[v];
		if (dial === 'letterSpacing') return !!TYPE_LETTER[v];
		if (dial === 'capitals' || dial === 'italic') return typeof v === 'boolean';
		if (dial === 'align') return ALIGNS.indexOf(v) !== -1;
		if (dial === 'colour') return TYPE_COLOURS.indexOf(v) !== -1;
		return false;
	}
	/* The seven as a record or a tweak carries them, known values only. */
	function typeOf(src) {
		var out = {}, R = src && src.roles;
		if (!R || typeof R !== 'object') return out;
		TYPE_ROLES.forEach(function (r) {
			var o = R[r], k = {};
			if (!o || typeof o !== 'object') return;
			TYPE_DIALS[r].forEach(function (d) { if (typeOk(r, d, o[d])) k[d] = d === 'weight' ? WEIGHT_ALIAS[o[d]] || o[d] : d === 'size' ? String(o[d]) : o[d]; });
			if (Object.keys(k).length) out[r] = k;
		});
		return out;
	}
	/* The style's seven with this browser's changes over them. */
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
	/* THE SEVEN, AS THE ENGINE'S EIGHT. A role's dial goes to every engine role that
	   answers to it; a member that answers to another of the seven takes that one's
	   value, and where its own engine role moved and its own of the seven did not, it
	   is held at its rest, so the comment's name stays where it was when Reading text
	   grows. `bodyFace`: the reading face is not the theme's own, so the comments' text,
	   which is Reading text now, reads in it as well. */
	function engineFrom(P, bodyFace) {
		var E = {};
		Object.keys(TYPE_LEADS).forEach(function (er) {
			var pub = P[TYPE_LEADS[er]] || {}, o = {};
			Object.keys(pub).forEach(function (d) {
				var ed = ENGINE_DIAL[d];
				if (er === 'kicker' && d === 'align') return; /* the category line stands with the title */
				if (ed !== 'factor' && !(ed in ROLE_DEFAULT[er])) return;
				o[ed] = engineValue(d, pub[d]);
			});
			if (er === 'kicker' && P.title && P.title.align !== undefined) o.align = P.title.align;
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
	/* The names that ARE the theme's own: a value that says one of them is no value. */
	var TYPE_REST = { size: '0', lineHeight: 'normal', letterSpacing: 'normal', align: 'default' };
	function typeRest(role, d) { return d === 'colour' ? typeColourRest(role) : TYPE_REST[d]; }
	/* A style's seven with a tweak over them, as a record writes them: what is left out is the theme's own. */
	function typeMerged(s, tw) {
		var a = typeOf(s), b = typeOf(tw), out = {};
		Object.keys(b).forEach(function (r) { a[r] = a[r] || {}; Object.keys(b[r]).forEach(function (d) { a[r][d] = b[r][d]; }); });
		Object.keys(a).forEach(function (r) { var o = {}; Object.keys(a[r]).forEach(function (d) { if (typeRest(r, d) !== a[r][d]) o[d] = a[r][d]; }); if (Object.keys(o).length) out[r] = o; });
		return out;
	}
	/* A tweak's seven: only what differs from the style's own (or, where the style names none, from the theme's). */
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
	/* ONE LADDER, AND EVERY ROLE GETS ALL OF IT (Manuel, 2026-09-17: "for the
	   font size setting in general, do we make always the max amount of possible
	   settings available? That regards all typo rows").

	   It answers a question the eight short ladders never did: WHO decided that
	   Abschnittstitel stops at 16 and Zitate cannot go under 18? Nobody, on the
	   day each list was typed. Each was a guess at the sizes that role would
	   plausibly want, and a guess in a dial's range is a wall the reader walks
	   into with no way through and no reason given.

	   So: the union of all eight, which is every size the theme's scale names,
	   11 to 72, and every role offers all of it. A role still RESTS at its own
	   size (ROLE_BASE) and the slider still opens there; it just no longer stops
	   early. The same argument as the weights on 2026-09-13 ("we always need the
	   full range").

	   The stops are real sizes and not percentages, which is why one list works
	   for a 72 and an 11 alike: the dial writes rung ÷ base, so each role lands
	   exactly on the number the slider says. */
	/* THE ONE PLACE A ROLE'S LADDER STILL STOPS SHORT is the floor the system
	   sets, and it is not a guess: DS-059 says anything read as content stays at
	   12 and true 11 belongs to interface chrome (style.css, --text-floor-content
	   and --text-floor-ui). A content role offered an 11 that the floor then
	   clamped to 12 — the slider said one number and the page showed another,
	   measured live. So the two interface roles start at 11 and the six content
	   roles at 12, which is the rule written as a ladder rather than fought. */
	var ALL_RUNGS = [12, 13, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 44, 48, 56, 64, 72];
	var UI_RUNGS = [11].concat(ALL_RUNGS);
	var ROLE_RUNGS = {};
	['head', 'read', 'quote', 'kicker', 'small', 'comment'].forEach(function (r) { ROLE_RUNGS[r] = ALL_RUNGS; });
	/* ÜBERSCHRIFTEN GO ON PAST 72 (Manuel, 2026-09-18: "sometimes I wanted to have it even bigger"). Until 1.3.203 the head's base was 44, so 72 on the slider drew the title at 104; the base is the title's 64 now and the number is true, which took the top third of the range with it. Four rungs above the scale, for the one role that is a title. */
	ROLE_RUNGS.head = ALL_RUNGS.concat([80, 96, 112, 128]);
	['ui', 'title'].forEach(function (r) { ROLE_RUNGS[r] = UI_RUNGS; });
	/* The nine percentages of every style saved before today, and the five
	   letters before them, read as the nearest rung of the role they are on. */
	var PERCENTS = { '50': 50, '65': 65, '80': 80, '90': 90, '100': 100, '110': 110, '120': 120, '135': 135, '150': 150, xs: 80, s: 90, m: 100, l: 110, xl: 120 };
	function rungFor(role, v) {
		var rungs = ROLE_RUNGS[role] || ROLE_RUNGS.read;
		if (v === 'text') return String(ROLE_BASE[role] || ROLE_BASE.read); /* the retired stop, read as the role's own size (2026-09-17) */
		if (rungs.indexOf(+v) !== -1) return String(v);
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
	/* A RELEASED MEMBER KEEPS THE NUMBER IT SHOWED (Manuel, 2026-10-01: Labels
	   read 15 px, he opened its page, looked, and came back to 14 px). Own
	   size switched on took the nearest rung, and 15 sits halfway between 14
	   and 16, so it went down a step. A whole number inside the ladder now
	   stays as it is; the slider moves it onto a rung once it is dragged. */
	function ownSize(role, v) {
		var rungs = ROLE_RUNGS[role] || ROLE_RUNGS.read, n = Math.round(+v);
		return n >= rungs[0] && n <= rungs[rungs.length - 1] ? String(n) : nearestRung(role, v);
	}
	function sizeFactor(role, v) { return (+v || ROLE_BASE[role]) / (ROLE_BASE[role] || ROLE_BASE.read); }
	/* NO "WIE FLIESSTEXT" STOP (Manuel, 2026-09-17: "that is a setting 'wie
	   Fließtext' I don't want. Make the px value instead"). It was the head's
	   first stop since 2026-09-16 — one stop on a ladder of numbers that was not
	   a number, and the one thing on the slider that made Überschriften follow
	   another row. Every stop is a size now, on every role. A style saved with
	   it reads as the head's own resting size (rungFor). */
	function sizesFor(role) { return (ROLE_RUNGS[role] || ROLE_RUNGS.read).map(String); }
	/* SEVEN STOPS, NORMAL IN THE MIDDLE (Manuel, 2026-09-13: "normal should
	   sit in the middle"): three tighter, three wider. */
	/* THIRTEEN STEPS, THE SAME WAY IN BOTH DIRECTIONS (Manuel, 2026-09-16: "we
	   can go up to +10%, but only down to -7.5%. That doesn't make sense
	   either … maybe up to +15% and -15% in both directions"). The ids are
	   the number they set, so the slider, the stylesheet and the saved style
	   all say the same thing; the old names still resolve (TRACK_ALIAS). */
	/* Four more at each end (Manuel, 2026-09-18: "a little bit more values"): the ladder runs -0.25em to 0.25em. */
	var TRACK = { m25: '-0.25em', m22: '-0.225em', m20: '-0.2em', m17: '-0.175em', m15: '-0.15em', m12: '-0.125em', m10: '-0.1em', m7: '-0.075em', m5: '-0.05em', m2: '-0.025em', m1: '-0.0125em', 'default': '0', p1: '0.0125em', p2: '0.025em', p5: '0.05em', p7: '0.075em', p10: '0.1em', p12: '0.125em', p15: '0.15em', p17: '0.175em', p20: '0.2em', p22: '0.225em', p25: '0.25em' }; /* the half steps either side of normal joined 2026-09-26: the reference behind Instrument sets its 20-32px headings at -0.012em, halfway between the heading's tight rest and normal, which no whole step could reach. Letter spacing only; word spacing keeps its steps. */
	/* TRACK_ALIAS: the list's tables above (plugin/settings.json). */
	/* WORDS_ALIAS: the list's tables above (plugin/settings.json). */
	var TRACKING = Object.keys(TRACK);
	/* WORTABSTAND, A DIAL OF ITS OWN (Manuel, 2026-09-15: "another setting
	   word spacing"): the space between the reading text's words, apart from
	   the letters'. Laufweite widened the words with it until now; each is
	   set on its own now, both at rest where the face has them. */
	var WORDS = { m25: '-0.25em', m22: '-0.225em', m20: '-0.2em', m17: '-0.175em', m15: '-0.15em', m12: '-0.125em', m10: '-0.1em', m7: '-0.075em', m5: '-0.05em', m2: '-0.025em', 'default': 'normal', p2: '0.025em', p5: '0.05em', p7: '0.075em', p10: '0.1em', p12: '0.125em', p15: '0.15em', p17: '0.175em', p20: '0.2em', p22: '0.225em', p25: '0.25em' };
	/* ZEILENABSTAND FOR EVERY ROLE (Manuel, 2026-09-13: why not all of them?):
	   the reading text keeps its own scale (data-leading); the other four
	   take a factor on their own line height, stamped only when chosen. */
	var LEAD = { solid: 0.56, packed: 0.62, close: 0.69, densest: 0.75, dense: 0.85, tight: 0.92, snug: 0.96, 'default': 1, relaxed: 1.06, airy: 1.1, wider: 1.15, wide: 1.25, open: 1.37, loose: 1.5, loosest: 1.62 }; /* fifteen since 2026-09-18, the reading text's own fifteen: each is that step's line height over 1.6 */ /* nine, with the reading text's own nine (2026-09-16) */
	/* Has the reader (or a copy of the theme's look) set this role's slant itself. */
	function ownItalic(role) {
		var E = engineNow()[role];
		return !!(E && E.italic !== undefined);
	}
	/* The theme's own slant for a role, read off the first part the plugin's italic rule
	   would reach (panel-page.css), with our own stamp lifted while it is read. */
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
	/* AN ENGINE ROLE, as the seven make it now (engineFrom): its dials over its rest,
	   its members, and the factor its size step writes. */
	function roleOf(role) {
		var E = engineNow()[role] || {}, out = {};
		Object.keys(ROLE_DEFAULT[role]).forEach(function (k) {
			out[k] = ROLE_DEFAULT[role][k];
			if (k !== 'members' && E[k] !== undefined) out[k] = E[k];
		});
		if (FOLLOW_ALIAS[out.face]) out.face = FOLLOW_ALIAS[out.face]; /* 'inherit' (2026-09-16 to 2026-09-19) is 'read' */
		if (membersOf(role).length) out.members = E.members || {}; else delete out.members;
		out.factor = E.factor !== undefined ? E.factor : 1;
		/* The two faces that are dials of their own already. */
		if (role === 'read') out.face = root.getAttribute('data-face') || 'newsreader';
		if (role === 'ui') out.face = sansOf();
		out.weight = fitWeight(out.face, WEIGHT_ALIAS[out.weight] || out.weight);
		out.size = Math.abs(out.factor - 1) > 0.0001 ? String(Math.round((ROLE_BASE[role] || ROLE_BASE.read) * out.factor)) : rungFor(role, out.size); /* the number the step lands on, for whoever shows it */
		out.tracking = TRACK_ALIAS[out.tracking] || out.tracking; /* the seven names of 1.3.116 and before (2026-09-16) */
		out.words = WORDS_ALIAS[out.words] || out.words;
		/* ON A STRANGER'S THEME, UNDER ITS OWN LOOK, THE SLANT IS WHAT THE PAGE SHOWS
		   (2026-09-27, found by the new window's check on Twenty Twenty-Five: Category
		   line › Italic read on over an upright category line, since our rest is
		   Architrave's italic one, and off changed nothing). Until the reader sets it,
		   the switch reads the theme's own slant off the page. */
		if (window.architravePanelGuest && !isLook(current) && !ownItalic(role)) out.italic = hostSlant(role);
		if (!hasItalic(out.face)) out.italic = false;
		if (out.align !== undefined && ALIGNS.indexOf(out.align) === -1) out.align = 'default';
		if (out.colour !== undefined && ROLE_COLOURS.indexOf(out.colour) === -1) out.colour = 'ink';
		return out;
	}
	/* A REST WRITES NOTHING (2026-09-13, measured live: the roles stamped 400
	   and 0 on every page, and the theme's own values under them, the
	   room's 440/420 body weight, the title's tight tracking, the headings'
	   600, were gone; and the room's weight rule outranked the role's).
	   The weight and the tracking are written only when they differ from
	   Standard's rest; the stylesheet's fallbacks are the theme as it was.
	   The three weights the stylesheet gates on an attribute, Lesetext's,
	   Oberfläche's and Kommentare's, are stamped as data-read-weight,
	   data-ui-weight and data-comment-weight. */
	function applyRoles() {
		var st = root.style;
		ROLES.forEach(function (role) {
			var v = roleOf(role), p = '--' + role + '-', rest = ROLE_DEFAULT[role], s0 = byId(current);
			/* what the reader set by hand under a guest's own look: stamped even when it equals our rest (see setRole) */
			var hostTw = window.architravePanelGuest && !isLook(current) ? engineOf(readTweaks()[current] || {})[role] || {} : {};
			var styleE = engineOf(s0)[role] || {};
			/* A FOLLOWER'S FACE IS ALWAYS WRITTEN OUT (2026-09-22), the anchor's
			   token or the pinned family, never left to a stylesheet fallback:
			   the fallbacks say six different things (--font-reading here,
			   --face-newsreader there, --face-inter and --font-sans further
			   down), and trusting one of them is how "Wie Fließtext" set a
			   Newsreader quote into every style on 2026-09-19. */
			if (role !== 'read' && role !== 'ui') st.setProperty(p + 'face', faceValue(v.face));
			/* THE READER'S SMALL FACE OUTRANKS A STYLE'S CAPTION FACE (Manuel,
			   2026-09-26, after Book's captions went to the reading italic: "let the
			   reader's choice win"). A style may set its captions in a face of its
			   own at rest (style.css, Book); once Kleintext's face is anything but
			   its rest, the captions follow the role like the dates and tags.
			   Stamped on every site, since the stylesheet cannot tell a written
			   rest from a choice (the face is always on the root). */
			if (role === 'small') { if (v.face !== rest.face) root.setAttribute('data-small-face-own', ''); else root.removeAttribute('data-small-face-own'); }
			if (v.weight === rest.weight && hostTw.weight === undefined) st.removeProperty(p + 'weight'); else st.setProperty(p + 'weight', String(WEIGHT[v.weight] || 400));
			if (role === 'read' || role === 'ui' || role === 'comment') { if (v.weight === rest.weight) root.removeAttribute('data-' + role + '-weight'); else root.setAttribute('data-' + role + '-weight', v.weight); }
			st.setProperty(p + 'size', String(v.factor));
			/* THE READER'S OWN SIZE, APART FROM THE STYLE'S (2026-09-27, found by the new
			   window's check on Twenty Twenty-Five under Classic: Category line, Small text
			   and Interface moved nothing). On a stranger's theme a look leaves the size
			   outside the article alone (guest-size.js), so the style's own sizes do not
			   reach a landing page; that took the reader's dial with them. This factor is
			   the reader's move alone, the size now over the style's own for the role, 1
			   while the style is as it came, and guest-size.js spends it there. */
			if (window.architravePanelGuest) {
				var mine = v.factor / (styleE.factor || 1);
				if (Math.abs(mine - 1) < 0.0001) st.removeProperty(p + 'size-mine'); else st.setProperty(p + 'size-mine', String(mine));
			}
			if (role === 'head') root.removeAttribute('data-head-size'); /* the 'text' stop is retired (2026-09-17); the attribute is cleared off styles that still carry it */
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
			} /* the buttons and the menus' rows scale only once a step is chosen (style.css, 2026-09-15); Kommentare the same, for the same reason (2026-09-17) */
			if (v.tracking === rest.tracking && hostTw.tracking === undefined) st.removeProperty(p + 'tracking'); else st.setProperty(p + 'tracking', TRACK[v.tracking] || '0');
			if (v.words === rest.words && hostTw.words === undefined) st.removeProperty(p + 'words'); else st.setProperty(p + 'words', WORDS[v.words] || 'normal');
			st.setProperty(p + 'case', v.caps ? 'uppercase' : 'none');
			if (rest.colour !== undefined) { if (v.colour === rest.colour) { st.removeProperty(p + 'colour'); root.removeAttribute('data-' + role + '-colour'); } else { st.setProperty(p + 'colour', v.colour === 'accent' ? 'var(--accent)' : v.colour === 'muted' ? 'var(--ldp-muted, var(--text-muted, color-mix(in oklab, currentColor 62%, transparent)))' : 'var(--' + role + '-own-colour, var(--accent))'); root.setAttribute('data-' + role + '-colour', v.colour); } }
			if (rest.align !== undefined) { if (v.align === rest.align) { st.removeProperty(p + 'align'); root.removeAttribute('data-' + role + '-align'); } else { st.setProperty(p + 'align', ALIGN[v.align]); root.setAttribute('data-' + role + '-align', v.align); } }
			/* A QUOTE IN A FACE WITHOUT AN ITALIC STANDS UPRIGHT (2026-09-19): the stylesheet slants a quote at rest, and a face that ships no italic was slanted by the browser, which the ITALICS list exists to prevent. */
			/* AND A QUOTE AT ITS REST WRITES NOTHING (2026-09-27): the stylesheet's own slant stands, italic in the article and upright on a quote post's card; off writes upright, since the stylesheet's fallback is italic and removing the property would leave it leaning. */
			if (role === 'quote' && !hasItalic(v.face)) st.setProperty(p + 'style', 'normal');
			else if (role === 'quote' && v.italic === rest.italic && styleE.italic === undefined) st.removeProperty(p + 'style'); /* a style that asks for the slant itself (Blueprint) keeps it on its quote cards too */
			else if (v.italic) st.setProperty(p + 'style', 'italic');
			else if (role === 'quote') st.setProperty(p + 'style', 'normal');
			else st.removeProperty(p + 'style');
			if (role !== 'read') { if (v.leading === rest.leading || !LEAD[v.leading]) { st.removeProperty(p + 'leading'); root.removeAttribute('data-' + role + '-leading'); } else { st.setProperty(p + 'leading', String(LEAD[v.leading])); root.setAttribute('data-' + role + '-leading', v.leading); } }
			if (role === 'read') { st.setProperty('--reading-tracking', TRACK[v.tracking] || '0'); st.setProperty('--reading-word-gap', WORDS[v.words] || 'normal'); }
			/* WHAT A GUEST GATES ON (0.9.0). Four of the eight faces are written
			   on the root even at rest (--head-face, --small-face,
			   --comment-face, --title-face, measured on a stock theme), so the
			   presence of a property is not a reader's choice and a guest sheet
			   that spent it would restyle a stranger's page on arrival. The
			   comparison with the role's own rest IS the choice, and it is
			   known here and nowhere else, so it is written out as an attribute
			   for the stylesheet to gate on. Guests only: on a host the global
			   is undefined, nothing is stamped, and the judge compares the
			   root's attributes directly. */
			if (window.architravePanelGuest) {
				/* UNDER A LOOK, A ROLE'S REST IS A CHOICE TOO (Manuel, 2026-09-22:
				   "the Newsreader font is still not applying from the standard to
				   the heading"). Standard's headings rest on Newsreader, which on
				   Architrave the theme's own stylesheet supplies, so the role
				   writes nothing and nothing is missing. On a stranger's theme
				   nothing supplies it, and a title left on the host's sans while
				   the article reads in Newsreader is a look half arrived. So while
				   a LOOK is on, every face and weight the role carries is stamped;
				   on the theme's own look none of them is, because that tile is
				   the absence of every choice. A dial the reader moved himself is
				   stamped either way. */
				var look = isLook(current);
				/* AND THE VALUE, NOT ONLY THE ATTRIBUTE. A dial at rest writes
				   NOTHING (see A REST WRITES NOTHING above), because on Architrave
				   the stylesheet's own fallback is the theme as it was. A guest has
				   no such fallback, so a gated rule reading `var(--head-weight)`
				   with the property absent throws the declaration away and the
				   title inherits the host's weight. Under a look the role writes
				   what it rests on. Reading text and Interface are left out: their
				   faces are data-face and data-sans, dials of their own. */
				if (look) st.setProperty(p + 'weight', String(WEIGHT[v.weight] || 400));
				/* A FOLLOWER ON A STRANGER'S PAGE (2026-09-22). Its face is stamped
				   when the anchor it follows has been chosen (data-face written,
				   or data-sans off Inter), because a title that stayed in the
				   host's sans after the reader set the text in Vollkorn would
				   contradict the row that says "Same as reading text"; when a
				   look is on, since the look chose the anchors; and when the
				   reader pinned a face. Under the theme's own look with the
				   anchor unchosen, the anchor IS the host's face, so a follower
				   sent to it is written the host's family outright rather than
				   a token that would name Inter or Newsreader on a page that
				   has neither (the panel draws itself in --font-sans, so that
				   token cannot be repointed at the host). */
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
					italic: look ? (v.italic !== rest.italic || v.italic) : ownItalic(role) /* under the theme's own look only the reader's own pick is stamped; the rest is the theme's */
				};
				Object.keys(picked).forEach(function (d) {
					if (picked[d]) root.setAttribute('data-' + role + '-' + d, String(v[d] === true ? 'on' : v[d]));
					else root.removeAttribute('data-' + role + '-' + d);
				});
			}
		});
		applyTypeExtras();
	}
	/* CODE, THE SEVENTH ROLE (2026-10-02): code, pre and kbd had no role of their own.
	   It writes nothing at rest, so the theme's monospace, its 0.8em chip and its 18px
	   block stand; each dial moved writes its token and an attribute of its own, and
	   style.css (THE CODE ROLE) spends them on every code surface, a guest's included.
	   And Small text's colour reaches the dates and captions as well as the category
	   line (the category line is the engine's kicker, which has a colour of its own). */
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
		/* EVERY ROLE HAS A COLOUR (2026-10-03, the seven colours): Reading text, Quotes, Interface and Code
		   write theirs here, off their rest only; panel-page.css spends them, a guest's page included. */
		['body', 'quote', 'interface', 'code'].forEach(function (r) {
			var v = (typeNow()[r] || {}).colour;
			if (v && v !== typeColourRest(r)) { st.setProperty('--' + r + '-colour', colourOf(v, r)); root.setAttribute('data-' + r + '-colour', v); }
			else { st.removeProperty('--' + r + '-colour'); root.removeAttribute('data-' + r + '-colour'); }
		});
	}
	function trackingOf() { return roleOf('read').tracking; }
	function applyTracking() { applyRoles(); }
	/* WHERE THE PARAGRAPH SETTINGS APPLY (Manuel, 2026-09-13: "it shouldn't
	   be an automatic separation between index and single, so it should be
	   a choice"): the article alone, as always, or everywhere, the index's
	   excerpts and the format cards' paragraphs too. Justify, the cap,
	   the hyphens and the character spacing follow it; the faces, the
	   colours, the corners and the line spacing were everywhere already.
	   A dial of the style, stamped as data-scope. */
	/* THE PICTURES (Manuel, 2026-09-14; lab sheet the-picture-looks): three
	   looks, named, no grades. Wie sie sind; Schwarzweiß, the newspaper's,
	   its rest; Getönt, the picture in the pair's own paper and ink. Sepia
	   and a muted look were drawn and dropped ("really just tiny
	   variations"); Book rests on Wie sie sind now, its quarter sepia gone
	   with them. A dial of the style, stamped as data-pictures. */
	/* MORE PICTURE EFFECTS (Manuel, 2026-09-19; lab sheet the-picture-effects):
	   Duoton (Getönt with the accent in the ink's place), Raster, Pixel,
	   Korn, and Ausgeblendet, which is no pictures and a line for each. The
	   two that go WITH a look are switches (OPTS): picturehover, picturedim. */
	/* PICTURES: the list's tables above (plugin/settings.json). */ /* sepia back 2026-09-19 (Manuel: "and sepia too"), whole this time, not the quarter that was dropped on 2026-09-14 */
	function picturesOf() {
		var pf = layoutOf('pictureFilter'); return FILTER_ENGINE[pf] || pf; /* pictureFilter since 2026-10-03 */
		var s = byId(current), tw = readTweaks()[current];
		if (tw && PICTURES.indexOf(tw.pictures) !== -1) return tw.pictures;
		return (s && s.pictures) || PICTURES[0];
	}
	/* THE INITIAL'S HEIGHT (Manuel, 2026-09-15: "how many lines the drop caps
	   should be tall"): two, three or four lines, three at rest, Book's
	   number. A dial of the style, stamped as data-dropcap-lines. */
	/* CAP_LINES: the list's tables above (plugin/settings.json). */
	function capLinesOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && CAP_LINES.indexOf(tw.capLines) !== -1) return tw.capLines;
		return (s && s.capLines) || CAP_LINES[0];
	}
	function applyCapLines() {
		var v = capLinesOf(), was = root.getAttribute('data-dropcap-lines') || CAP_LINES[0];
		if (v === CAP_LINES[0]) root.removeAttribute('data-dropcap-lines'); else if (root.getAttribute('data-dropcap-lines') !== v) root.setAttribute('data-dropcap-lines', v);
		/* Chrome draws the initial once (applyOptions): a new height needs the paragraph laid out again. */
		if (was !== v) nextFrame(redrawInitials);
	}
	/* The paragraphs with an initial, out of layout and back, all at once on the next frame (2026-10-02): one by one,
	   each read of a height after the switch restyled the whole page again. */
	function redrawInitials() {
		var ps = Array.prototype.slice.call(document.querySelectorAll('.wp-block-post-content > p:first-of-type, .wp-block-post-excerpt > p:first-of-type')), was = ps.map(function (p) { return p.style.display; });
		if (!ps.length) return;
		ps.forEach(function (p) { p.style.display = 'none'; });
		void ps[0].offsetHeight;
		ps.forEach(function (p, i) { p.style.display = was[i]; });
	}
	/* TWO STRENGTHS, EACH A SLIDER UNDER ITS SWITCH (Manuel, 2026-09-19, the
	   three-word pop-up of the same morning: "the setting light is already
	   very strong so probably we would need even more settings. What about
	   that strength of the lines, not the scan lines, the lines?"). Dials of
	   the style, record keys `scan` and `line`. Scan lines: ten stops, the
	   number is the lines' alpha in hundredths, 3 at rest. Lines: the ink's
	   share in the line's colour, 45 at rest, the stylesheet's own with Lines on. Written as a custom property and an
	   attribute only off the rest. A `scan` of soft, medium or strong, saved
	   before the slider, falls to the rest. */
	/* LEVELS: the list's tables above (plugin/settings.json). Its values are the list's; what each strength writes into its custom property is code, and stays here, and is attached to the table below. */
	var LEVEL_CSS = {
		line: function (v) { return v + '%'; },
		/* FLÄCHEN AND LEUCHTEN HAVE ONE TOO (Manuel, 2026-09-19: "can we also have an intensity switch like we have for the lines? And the same for glow"). Glow: the halo's alpha in tenths, 4 at rest. Fills: a percentage of the pair's OWN three steps, 100 at rest where nothing is written. Not an absolute share: the steps are 6, 10, 16 by day and as much as 18 on Terminal's night (measured), so one number for all would have jumped at its first move, the lines' fault again. The pair's steps are read off the page with nothing written, multiplied, and written on the root; read again when the side or the pair changes. */
		/* WEICHERER LESETEXT HAS ONE TOO (2026-09-21, the ask: "15% or 25% intensity, like the setting you had in the lab"): how far the reading text steps from the ink toward the paper. 15 is the rest, the pair's own secondary rung; 25 is the sheet's stronger setting and the top, since beyond it a gentle pair's night text falls under 5:1. The switch is OPTS `soft`. */
		softlevel: function (v) { return v + '%'; }, /* WIDER (Manuel, 2026-09-23: "I want to make it even softer. It's just 20. We should give it a bigger range"): 10 to 45. 45 is the top because it is the last step that holds 4.5:1 on Instrument's night pair (5.1; 50 falls to 4.3). A gentler pair falls under sooner, Book's night at about 30: the slider trusts the owner there. */
		/* THE SMALL TEXT TOO (2026-09-23, the reference measured again: its reading text sits about 16 % from the ink, its dates, captions and small print about 45 %, #8a8f98, where ours held the pair's 25 %). How far --text-muted steps from the ink toward the paper, with Softer reading text on; 25 is the pair's own rung and the rest, so nothing is written there. */
		quietlevel: function (v) { return v + '%'; },
		smallsoft: function (v) { return v + '%'; },
		/* LINE LENGTH (Manuel, 2026-09-25, of the reference: "their site looks really big … we could make a character count"). Letters a line of the reading text. The column's measure is each face's own ch count tuned to about 72 letters (style.css, THE MEASURE), so the slider scales that measure by letters / 72 and the line stays true in every face. The reference's column holds about 82 letters of Newsreader. */
		measure: function (v) { return String(Math.round(+v / 72 * 1000) / 1000); },
		/* SPACE (Manuel, 2026-09-25, lab/the-space-of-a-page.html: "build it"). How
		   much air the page has: Compact, Standard, Spacious. Standard is the rest,
		   the theme's own, and writes nothing. The number is the step for the gaps
		   between sections; space.js (the plugin's) reads the page and gives every
		   other kind of gap its own share of it, so a group never comes apart. */
		space: function (v) { return { xcompact: '0.5', compact: '0.7', spacious: '1.4', xspacious: '1.8' }[v]; }, /* the two outer steps (Manuel, the same evening, on TT5: "maybe an even tighter version and a more spacious version") */
		/* FRAME WIDTH (the same morning): the mat around every picture in a piece and on the cards, 8 at rest (--space-2). Only with Frame around pictures. */
		framewidth: function (v) { return v + 'px'; },
		/* THE FOUR JOBS OF SPACE (2026-10-05, lab/the-space-of-the-six.html: a style's own table, one size per job on the theme's scale). The custom property only says the size; space.js (the plugin's) reads the attribute and moves each gap by whole steps. */
		spaceInside: function (v) { return v + 'px'; }, spaceItems: function (v) { return v + 'px'; }, spaceSections: function (v) { return v + 'px'; }, spaceTitle: function (v) { return v + 'px'; },
		/* THE DOT GRID'S SIZE AND STRENGTH (Manuel, 2026-09-25: "a setting where
		   they could be changed, like to a bigger grid or a different colour"; his
		   yes to two sliders and no colour, the dots always the look's own ink).
		   Only with Dotted background. 24 and 13 are the grid's rest. */
	};
	Object.keys(LEVEL_CSS).forEach(function (k) { if (LEVELS[k]) LEVELS[k].css = LEVEL_CSS[k]; }); /* the softness steps left with the seven colours (2026-10-03) */
	/* THE LINES' REST IS 45, NOT 14 (2026-09-19, Manuel on the slider: "when I turn it down to make the lines lighter, sometimes it goes a little bit up again"). At the rest nothing is written and the stylesheet's own value stands, and with Lines on that value is 45 % in EVERY style (style.css, the Lines block), not Terminal's alone as 1.3.267 believed; 14 is the hairline of a page with Lines off. So the stop called 14 wrote nothing and the page went back to 45: lighter, lighter, then darker. A style's own `line`, or its base's, is its rest. */
	function levelRest(k) {
		var L = LEVELS[k], s = byId(current), b = s && byId(baseOf(s));
		if (s && L.stops.indexOf(s[k]) !== -1) return s[k];
		if (b && L.stops.indexOf(b[k]) !== -1) return b[k];
		/* THE SMALL TEXT, A ROW OF ITS OWN (2026-09-27, the text marks): `smallsoft`
		   works with soft on or off. Until a style or a hand sets it, it stands
		   where Softer reading text's second slider (`quietlevel`) put the small
		   text, so no saved style and no reader's changes move. */
		return L.rest;
	}
	function levelOf(k) {
		var L = LEVELS[k], tw = readTweaks()[current];
		if (!L) return ''; /* the softness steps left the list with the seven colours (2026-10-03) */
		if (k === 'measure') return layoutOf('lineLength');
		if (k === 'line') return layoutOf('borderStrength');
		if (k === 'framewidth') return layoutOf('frameWidth');
		if (k === 'fill') return L.rest; /* the fills' strength left the style (2026-10-05): the colours' own */
		if (tw && L.stops.indexOf(tw[k]) !== -1) return tw[k];
		return levelRest(k);
	}
	function applyLevels() {
		Object.keys(LEVELS).forEach(function (k) {
			var L = LEVELS[k], v = levelOf(k);
			if (L.steps) {
				var names = ['--step-surface-hover', '--step-surface-selected', '--step-surface-pressed'];
				names.forEach(function (nm) { root.style.removeProperty(nm); });
				root.style.removeProperty('--fill-factor'); /* the dark cards restate their steps on the card (style.css); they take the factor itself */
				if (v === L.rest) { root.removeAttribute(L.attr); return; }
				if (root.getAttribute(L.attr) !== v) root.setAttribute(L.attr, v);
				root.style.setProperty('--fill-factor', String(+v / 100));
				var cs = getComputedStyle(root);
				names.forEach(function (nm) { var own = parseFloat(cs.getPropertyValue(nm)); if (own > 0) root.style.setProperty(nm, (Math.round(own * +v) / 100) + '%'); });
				return;
			}
			/* WRITTEN AGAINST THE STYLESHEET'S REST, NOT THE STYLE'S (2026-09-19): levelRest says what a style rests on, which decides whether a tweak is kept; what the PAGE needs is whether the value differs from what the stylesheet gives with nothing written. 1.3.268 asked the style here, so a recipe's own value counted as nothing to write, and Terminal's scan 2 and line 10 never reached the page. */
			if (v === L.rest) { root.removeAttribute(L.attr); root.style.removeProperty(L.prop); }
			else { if (root.getAttribute(L.attr) !== v) root.setAttribute(L.attr, v); root.style.setProperty(L.prop, L.css(v)); }
		});
	}
	/* LINIENART (2026-09-19): solid, dashed or dotted, with Lines on. A dial of the style, record key `linestyle`, stamped as data-line-style off the rest; style.css carries the generated block. */
	/* LINE_STYLE: the list's tables above (plugin/settings.json). */
	function lineStyleOf() {
		return layoutOf('borderStyle'); /* borderStyle since 2026-10-03 */
		var s = byId(current), tw = readTweaks()[current];
		if (tw && LINE_STYLE.indexOf(tw.linestyle) !== -1) return tw.linestyle;
		return (s && LINE_STYLE.indexOf(s.linestyle) !== -1) ? s.linestyle : LINE_STYLE[0];
	}
	/* ECKENGRÖSSE (2026-09-20, lab/the-corner-steps.html): small, medium or large, with Rounded corners on. A dial of the style, record key `corners`, stamped as data-corners off the rest (medium). One step re-cuts the radius scale in style.css; every corner that is a sum of the control's follows, and no gap moves. */
	/* CORNERS: the list's tables above (plugin/settings.json). */ /* xlarge, Very large, 2026-09-26: the soft sticker cards of Storybook's reference */ /* pill was the fourth step 2026-09-22 to 2026-09-26 and is the switch `pillbuttons` now, so it can ride on any size (liftCentre carries old records over) */
	function cornersOf() {
		var rv = layoutOf('radius'); return rv === 'none' ? CORNERS[0] : rv; /* radius since 2026-10-03 */
		var s = byId(current), tw = readTweaks()[current];
		if (tw && CORNERS.indexOf(tw.corners) !== -1) return tw.corners;
		return (s && CORNERS.indexOf(s.corners) !== -1) ? s.corners : CORNERS[0];
	}
	/* WHICH EDGES FADE (Manuel, 2026-09-23: "the top should also have a fade … it
	   should have some options"): with Fade the edges on, the top picture sinks at
	   its bottom only, at its sides and bottom (the rest, as 1.3.333 drew it), or
	   on all four sides. Record key `fadeedges`, stamped as data-fade-edges off
	   the rest. */
	/* FADE_EDGES: the list's tables above (plugin/settings.json). */
	function fadeEdgesOf() {
		var fe = layoutOf('pictureFade'); return fe === 'none' ? FADE_EDGES[0] : fe; /* pictureFade since 2026-10-03 */
		var s = byId(current), tw = readTweaks()[current];
		if (tw && FADE_EDGES.indexOf(tw.fadeedges) !== -1) return tw.fadeedges;
		return (s && FADE_EDGES.indexOf(s.fadeedges) !== -1) ? s.fadeedges : FADE_EDGES[0];
	}
	/* THE HIGHLIGHTER'S COLOUR (Manuel, 2026-09-24, Catalogue: "lets do all 4"): the
	   marker is decoration only, never text on the paper, so it is a pick of
	   highlighter colours with the ink of the day side over it, not a fourth
	   well. Record key `markercolour`, stamped as data-marker-colour off the rest. */
	/* MARKERS: the list's tables above (plugin/settings.json). */ /* own (2026-09-26, round one): the well colours.<side>.marker; its ink and its bar follow from the pen (markerBody). text and muted (Manuel, 2026-09-26: "like the reading text or the year in the same color"): the pen is the reading text's colour or the date's, read from each side's own rungs in style.css, so it holds by day and by night */
	/* THE HIGHLIGHTER IS A COLOUR (2026-10-03): none is off; one of the five pens is that pen; any other is a pen of its own */
	function highlightNow() { var c = coloursOf(null, true); return c.light.marker || c.dark.marker || ''; }
	function markerColourOf() { var h = highlightNow(); return h ? (penOf(h) || 'own') : MARKERS[0]; }
	/* THE FRAME'S PATTERN (Manuel, 2026-09-25: the reference's checkerboard "is a distinctive style … maybe on the frame around the images"): what the mat around a picture shows, plain (the rest), the page's dot grid, or a checkerboard, the transparency grid of a design tool. Record key `framepattern`, data-frame-pattern off the rest. Only with Frame around pictures. */
	/* FRAME_PATTERNS: the list's tables above (plugin/settings.json). */
	function framePatternOf() {
		var fp = layoutOf('pictureFrame'); return fp === 'none' ? FRAME_PATTERNS[0] : fp; /* pictureFrame since 2026-10-03 */
		var s = byId(current), tw = readTweaks()[current];
		if (tw && FRAME_PATTERNS.indexOf(tw.framepattern) !== -1) return tw.framepattern;
		return (s && FRAME_PATTERNS.indexOf(s.framepattern) !== -1) ? s.framepattern : FRAME_PATTERNS[0];
	}
	function applyFramePattern() { var v = framePatternOf(); if (v === FRAME_PATTERNS[0]) root.removeAttribute('data-frame-pattern'); else if (root.getAttribute('data-frame-pattern') !== v) root.setAttribute('data-frame-pattern', v); }
	/* THE BUTTON'S COLOUR (Manuel, 2026-09-26, lab/the-link-colour.html, "go with
	   your recommendation"): the filled buttons wear the accent (the rest), the
	   ink, or a colour of their own; the links keep the accent, which is Apple's
	   tint, first of all the colour of links. It replaces the switch `inkbutton`
	   (on = ink; liftCentre moves old records over). The own colour is a fourth
	   well, `colours.<side>.button`, edited as paper and ink are; it never counts
	   as Custom and never drops a preset. Record key `button`, stamped as
	   data-button off the rest. */
	/* BUTTONS: the list's tables above (plugin/settings.json). */
	/* A PALETTE MAY NAME ITS BUTTON (2026-10-08, Slate): where the colours in force carry a button well, Accent
	   means that well, not the link colour, as Apple fills a button with #0071e3 and writes a link in #0066cc.
	   Text and Own stay what they say. */
	function buttonOf() {
		var bc = layoutOf('buttonColour'); if (bc === 'accent') { var cs = coloursOf(); if (cs.light.button || cs.dark.button) bc = 'own'; } return bc === 'text' ? 'ink' : bc; /* buttonColour since 2026-10-03 */
		var s = byId(current), tw = readTweaks()[current];
		if (tw && BUTTONS.indexOf(tw.button) !== -1) return tw.button;
		return (s && BUTTONS.indexOf(s.button) !== -1) ? s.button : BUTTONS[0];
	}
	/* THE SHAPE ROUND (Manuel, 2026-09-26, lab/the-shape-round.html, "I go with
	   your recommendation", all four). Four picks of Corners and lines, each a
	   record key stamped as data-<attr> off its rest, the first value:
	     buttonshape  cards (the corner size's) / square / rounded / pill; it
	                  replaced the switch pillbuttons (liftCentre)
	     buttonstyle  filled / outlined / shadow (outlined with a hard shadow)
	     linewidth    1 / 2 / 3 / 5 px, while Lines is on
	     cards        box / top (a line along the top only), while Lines is on
	   and one switch, tagsfollow (OPTS): the tags take the buttons' corner. */
	/* PICKS: the list's tables above (plugin/settings.json). */
	/* LINKS FOLLOW THE SOFTER TEXT (2026-09-27, the text marks): until a style or
	   a hand names a way, a style with soft text marks its links underlined in
	   the ink, what the switch drew before links had a row of their own. So no
	   saved style and no reader's changes move, and nothing needs lifting. */
	/* The rows that follow soft until named (pickRest, levelRest): which of them
	   neither the style nor a hand names now. An export leaves those out. */
	function followers() {
		var s = byId(current), b = s && byId(baseOf(s)), tw = readTweaks()[current] || {};
		return []; /* the rows that followed Softer reading text (links, the small text) went with it, 2026-10-03 */
	}
	function pickRest(key) { return key === 'links' && optionOn('soft') ? 'underlined' : key === 'quotes' && !GUEST ? 'sideLine' : PICKS[key].list[0]; } /* QUOTES REST ON THE SIDE LINE (Manuel, 2026-10-07: "I don't like it if it's just indented by default. It's not obvious enough"): on Architrave a quote at rest wears the line; Indented is now the choice. Another theme keeps its own. */
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
	function applyPicks() { Object.keys(PICKS).forEach(function (k) { var d = PICKS[k], v = pickOf(k), e = SURFACE_ENGINE[k] && SURFACE_ENGINE[k][v] ? SURFACE_ENGINE[k][v] : v; if (v === (k === 'quotes' ? pickRest(k) : d.list[0])) root.removeAttribute(d.attr); else if (root.getAttribute(d.attr) !== e) root.setAttribute(d.attr, e); }); screenEffects(); } /* a surface's saved word stamps the engine's own (2026-10-03) */
	/* THE EXTRAS' DETAILS (EFFECTS, the list's table; 2026-09-29, lab/the-instrument-extras.html
	   round two). A style's `effects` holds per effect only the details off their rest; a
	   reader's tweak the same, over it. effectsOf merges the two, keeping only known
	   details and values from their lists; applyEffects stamps each one that is off its rest
	   as data-fx-<effect>-<detail> on the root and removes it at the rest, so at the rest
	   nothing is written and the theme alone never meets one. */
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
	/* INSTRUMENT'S EFFECTS LEFT (2026-10-02, the clean-up, only Original stays): the arriving headings, the serif words and the pointer's light; they are in the tag styles-archive-0.16.0. */
	/* THE SCREEN, THE PRINT AND THE STYLES' OWN PARTS LEFT (2026-10-02, the clean-up: Manuel's keep or cut list, lab/the-keep-or-cut.html): the overlays, boot screen, typed title, code rain, terminal window, print foot, drawing office, cabinet, gallery ways, poster numbers, café parts and the TV set. All of it is in the tag styles-archive-0.15.58. */
	/* MEASURE ONCE, AFTER EVERYTHING HAS CHANGED (Manuel, 2026-10-02: "the panel seems a little bit slow … what would
	   Apple do?"). A change of look writes some sixty attributes and variables on <html>, and the styles' own scripts
	   below (Blueprint's sheet, Terminal's window, Arcade's filter, Aperitivo's awning, the rain, the drop cap) then
	   READ the page: a box, a height, a computed colour. Every read after a write makes the browser restyle and lay
	   out the whole page on the spot, 70 to 170 ms each on elmastudio.de (828 variables on the root, 6,600 rules),
	   and one switch read up to eleven times: Arcade took 1.7 s, Terminal 1.3 s, before the cross-fade began.
	   So a script that measures asks for it here, and every measurement waits for the next frame, when the page is
	   restyled once anyway; the frame's own callbacks run before it is drawn, so nothing shows a beat late. The same
	   job asked twice runs once. The timer is for a hidden tab, which draws no frames. Read first, write after,
	   inside each job too: a write between two reads costs a whole restyle again. */
	var frameJobs = [], frameAsk = 0, frameSeq = 0;
	function nextFrame(job) {
		if (frameJobs.indexOf(job) === -1) frameJobs.push(job);
		if (frameAsk) return;
		var ask = frameAsk = ++frameSeq, run = function () { if (frameAsk !== ask) return; frameAsk = 0; var jobs = frameJobs; frameJobs = []; jobs.forEach(function (f) { try { f(); } catch (e) { /* one style's part never stops another's */ } }); };
		if (window.requestAnimationFrame) window.requestAnimationFrame(run);
		setTimeout(run, 250);
	}
	/* PICTURES THAT MELT INTO THE PAGE (2026-10-02, the styles review; Manuel: a picture should "always have a border separating the image
	   from the background if there's not enough contrast. If there's enough contrast we don't need it"). Each picture's outer ring of pixels
	   is read once from a 32 x 32 copy; where more than a fifth of it stands under 1.3:1 from what the picture stands on, the picture is
	   marked ldp-blends and style.css draws its edge clearly. A photo is not marked and keeps the faint edge; a picture mostly see-through
	   (a logo) is not marked, an edge would make a box of it; a picture that cannot be read (another site's) is marked, the safe side.
	   Compared again when the side or the colours change, read again only when the picture does. */
	var EDGE_PICS = '.post-card .post-media img, .single-post-article .article-media img, .single-post-article .wp-block-post-content img:not(.emoji, .wp-smiley, .post-link-shot), .post-card.format-link .post-format-body .wp-block-post-content img:not(.emoji, .wp-smiley, .post-link-shot)';
	var edgeCanvas = null, edgeWatched = false, edgeT = null;
	function edgeLum(r, g, b) { var f = function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
	function edgeCtx(n) { if (!edgeCanvas) edgeCanvas = document.createElement('canvas'); edgeCanvas.width = edgeCanvas.height = n; return edgeCanvas.getContext('2d', { willReadFrequently: true }); }
	function edgeRing(img) { /* the outer two rows of the copy, as lights; [] when see-through; null when unreadable */
		if (img.__ldpRingSrc === img.currentSrc) return img.__ldpRing;
		var ring = null, N = 32;
		try {
			var g = edgeCtx(N); g.clearRect(0, 0, N, N); g.drawImage(img, 0, 0, N, N);
			var d = g.getImageData(0, 0, N, N).data, all = 0; ring = [];
			for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
				if (x > 1 && x < N - 2 && y > 1 && y < N - 2) continue;
				var i = (y * N + x) * 4; all++; if (d[i + 3] >= 128) ring.push(edgeLum(d[i], d[i + 1], d[i + 2]));
			}
			if (ring.length < all / 2) ring = [];
		} catch (e) { ring = null; }
		img.__ldpRing = ring; img.__ldpRingSrc = img.currentSrc; return ring;
	}
	function edgeGround(el) { /* the light of the first painted box under the picture */
		for (var e = el.parentElement; e; e = e.parentElement) {
			var bg = window.getComputedStyle(e).backgroundColor;
			if (bg && !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(bg) && !/\/ 0\)$/.test(bg)) {
				try { var g = edgeCtx(1); g.clearRect(0, 0, 1, 1); g.fillStyle = bg; g.fillRect(0, 0, 1, 1); var d = g.getImageData(0, 0, 1, 1).data; if (d[3] > 200) return edgeLum(d[0], d[1], d[2]); } catch (x) { return null; }
			}
		}
		return null;
	}
	function pictureEdges() {
		if (!document.body || !window.getComputedStyle) return;
		var pics = Array.prototype.slice.call(document.querySelectorAll(EDGE_PICS)), grounds = [];
		pics.forEach(function (img) { grounds.push(edgeGround(img)); }); /* read every ground first, then mark (MEASURE ONCE) */
		pics.forEach(function (img, k) {
			if (!img.complete || !img.naturalWidth) { if (!img.__ldpEdgeWait) { img.__ldpEdgeWait = true; img.addEventListener('load', function () { nextFrame(pictureEdges); }, { once: true }); } return; }
			var ring = edgeRing(img), G = grounds[k], blends;
			if (ring === null) blends = true;
			else if (!ring.length || G === null) blends = false;
			else { var near = ring.filter(function (L) { return (Math.max(L, G) + 0.05) / (Math.min(L, G) + 0.05) < 1.3; }).length; blends = near > ring.length / 5; }
			if (img.classList.contains('ldp-blends') !== blends) img.classList.toggle('ldp-blends', blends);
		});
		if (!edgeWatched) {
			edgeWatched = true;
			new MutationObserver(function () { clearTimeout(edgeT); edgeT = setTimeout(function () { nextFrame(pictureEdges); }, 120); }).observe(root, { attributes: true, attributeFilter: ['data-theme', 'style', 'data-colours', 'data-style', 'data-pictures', 'data-pictureframe'] });
		}
	}
	function screenEffects() {
		if (!document.body || typeof document.createElementNS !== 'function' || !window.getComputedStyle) return; /* not in the generator's stub */
		nextFrame(pictureEdges);
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', screenEffects); else screenEffects();
	function applyButton() { var v = buttonOf(); if (v === BUTTONS[0]) root.removeAttribute('data-button'); else if (root.getAttribute('data-button') !== v) root.setAttribute('data-button', v); }
	function applyMarkerColour() { var v = markerColourOf(); if (v === MARKERS[0]) root.removeAttribute('data-marker-colour'); else if (root.getAttribute('data-marker-colour') !== v) root.setAttribute('data-marker-colour', v); }
	function applyFadeEdges() { var v = fadeEdgesOf(); if (v === FADE_EDGES[0]) root.removeAttribute('data-fade-edges'); else if (root.getAttribute('data-fade-edges') !== v) root.setAttribute('data-fade-edges', v); }
	function applyCorners() { var v = cornersOf(); if (v === CORNERS[0]) root.removeAttribute('data-corners'); else if (root.getAttribute('data-corners') !== v) root.setAttribute('data-corners', v); }
	function applyLineStyle() { var v = lineStyleOf(); if (v === LINE_STYLE[0]) root.removeAttribute('data-line-style'); else if (root.getAttribute('data-line-style') !== v) root.setAttribute('data-line-style', v); }
	function applyPictures() { var v = picturesOf(); if (v === PICTURES[0]) root.removeAttribute('data-pictures'); else if (root.getAttribute('data-pictures') !== v) root.setAttribute('data-pictures', v); }
	/* SCOPE: the list's tables above (plugin/settings.json). */
	function scopeOf() {
		/* ÜBERALL, ALWAYS (Manuel, 2026-09-15: "kick that out and make it überall
		   by default everywhere. That makes life easier. We'll figure out later
		   what to do when we just want to have it in a certain place"). The
		   paragraph's settings reach the index and the cards as they reach the
		   article; the dial and its storage stay for that later day. */
		return 'all';
	}
	function applyScope() { var v = scopeOf(); if (root.getAttribute('data-scope') !== v) root.setAttribute('data-scope', v); }
	function byId(id) {
		return STYLES.filter(function (s) { return s.id === id; })[0];
	}

	/* THE STYLE, BEFORE FIRST PAINT, like every dial: a look that arrives late
	   repaints the whole page under the reader. */
	/* The link is read here, after every list the record could name (OPTS, the tints) exists. */
	var linked = null; /* the style a link asked for, pressed once the rows exist */
	var PREVIEW_LINK = null; /* a preview link's visit: nothing it shows is stored */
	(function () {
		var q = window.location.search, h = window.location.hash, m, data;
		if ((m = /[?&]style=([^&]+)/.exec(q))) {
			var id = decodeURIComponent(m[1]);
			if (byId(id) && id !== 'standard') linked = byId(id);
			else if (id === 'standard' && (DEFAULT === 'standard' || DEFAULT === 'host')) linked = byId('standard') || STYLES[0];
		} else if ((m = /^#style=(.+)$/.exec(h)) && (data = decodeRecord(m[1]))) {
			linked = ownFromRecord(data);
		}
		/* A PREVIEW LINK (2026-09-28, inc/site-styles.php PREVIEW LINKS): the page wears the style the link carries for this
		   visit only; nothing is stored, the button steps aside, and a quiet bar says what this is and when it ends. */
		var pv = window.architraveSiteStyles && window.architraveSiteStyles.preview;
		if (pv) {
			PREVIEW_LINK = pv;
			/* THE VISITOR'S OWN CHOICES COME BACK WHOLE: the rows a style presses keep their own storage, so what this
			   browser held before the visit is put back as the page is left, and the preview leaves no trace. */
			try {
				var held = {}; for (var li = 0; li < localStorage.length; li++) { var lk = localStorage.key(li); held[lk] = localStorage.getItem(lk); }
				window.addEventListener('pagehide', function () { try { localStorage.clear(); Object.keys(held).forEach(function (k) { localStorage.setItem(k, held[k]); }); } catch (e) { /* storage refused: nothing was kept either */ } });
			} catch (e) { /* no storage: nothing to put back */ }
			if (pv.id && byId(pv.id)) linked = byId(pv.id);
			root.setAttribute('data-ldp-preview', pv.ended ? 'ended' : 'on');
			var bar = function () {
				if (!document.body || document.querySelector('.ldp-preview-bar')) return;
				var b = document.createElement('div'), W = window.architraveWords || {}, w = function (x) { return W[x] || x; };
				b.className = 'ldp-preview-bar'; b.setAttribute('role', 'status');
				if (pv.ended) b.textContent = w('This preview link has ended.');
				else { var until = new Date(pv.until * 1000), strong = document.createElement('b'); strong.textContent = pv.name; b.appendChild(document.createTextNode(w('Preview of') + ' ')); b.appendChild(strong); b.appendChild(document.createTextNode(' · ' + w('Ends') + ' ' + until.toLocaleDateString('en', { day: 'numeric', month: 'long' }) /* the panel speaks English only (0.43.0), its dates too */)); }
				document.body.appendChild(b);
			};
			if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bar); else bar();
		}
		if (linked && window.history && history.replaceState) {
			try { history.replaceState(null, '', window.location.pathname + q.replace(/([?&])style=[^&]*(&|$)/, function (a, b, c) { return c ? b : ''; }) + (/^#style=/.test(h) ? '' : h)); } catch (e) { /* the address stays; the style is on */ }
		}
	})();
	/* THE THEME'S OWN LOOK, AS A TILE (0.9.0, guests only). Standard is
	   Architrave's own look, so on Architrave a reader is always one press from
	   home. On a stranger's theme there was no way back at all (Manuel,
	   2026-09-22: "how does he come back to his original design?"). This tile is
	   not a look: it is the absence of every choice. It writes no attribute, it
	   stores nothing, and pressing it forgets what the panel has stored and
	   loads the page again, which is the only way to give back a theme's own
	   design exactly rather than by a list of things to undo. */
	var HOST = window.architravePanelHostStyle || null;
	if (HOST) {
		/* ITS FACE IS 'host', NOT NEWSREADER (Manuel, 2026-09-22: "the original has
		   a dot in the top-right corner, which means there was a change, but I
		   can't see any change, and if I click on Customise and then on Reset that
		   dot is not going away"). It never could. `now()` reads a page with no
		   `data-face` on it as 'host', which is exactly what the theme's own look
		   is; the recipe here said 'newsreader', so the two never agreed and the
		   tile that means UNTOUCHED was marked as touched from the first paint,
		   with nothing a reset could take away. Measured on a browser with empty
		   storage: adjusted('host') was true, every other tile false. */
		STYLES.unshift({ id: 'host', label: HOST.label, host: true, palette: 'neutral', tint: 'default', sans: 'inter', reading: 'default', face: 'host', leading: 'default', justify: false, dropcap: false, rounded: true, lines: false, bold: false, scope: 'all', fills: true, roles: {} });
		if (DEFAULT !== 'host') { var dRec = byId(DEFAULT); STYLES.splice(STYLES.indexOf(dRec), 1); STYLES.unshift(dRec); } /* a site default stands before it */
		/* THE TILE WEARS THE THEME'S OWN PAPER, INK AND FACE (Manuel, 2026-09-22:
		   "the original is now grey but it doesn't have dark mode … it also
		   doesn't have this serif font by default"). Measured off the page once
		   it has a body, with the room's paint lifted for the length of three
		   reads: the paint is a stylesheet rule on `data-chosen`, and two
		   attribute writes with no frame between them never reach the screen.
		   AND ON EACH SIDE (0.11.47): the theme's own look has two sides now, its
		   own and the one the plugin writes from its palette (panel.php, THE
		   THEME'S OWN OTHER SIDE), so each side is read with that side named on
		   the root, and the body's own transition held for the reads. */
		document.addEventListener('DOMContentLoaded', function () { still(function () { /* held still: guest-size.js, HELD STILL */
			var rec = byId('host'), had = root.hasAttribute('data-chosen'), hadC = root.getAttribute('data-colours'), hadT = root.getAttribute('data-theme');
			if (!rec) return;
			if (had) root.removeAttribute('data-chosen');
			if (hadC !== null) root.removeAttribute('data-colours'); /* your own colours paint the theme's palette too since 2026-09-24; the theme's own is what is measured */
			var bodyT = document.body.style.getPropertyValue('transition'), bodyP = document.body.style.getPropertyPriority('transition');
			document.body.style.setProperty('transition', 'none', 'important');
			var read = function (side) {
				root.setAttribute('data-theme', 'neutral-' + side);
				var cs = window.getComputedStyle(document.body), paper = cs.backgroundColor;
				if (!paper || /rgba\(0, 0, 0, 0\)|transparent/.test(paper)) paper = '#ffffff';
				/* THE THEME'S ACCENT TOO (2026-09-25, Manuel on the Original tile:
				   "weird that the colors of the Original are the same as on
				   Classic"). Paper and ink alone left the tile's accent line to
				   the panel's own violet, which is Classic's; a link in the
				   content is where a theme says its accent, and a theme whose
				   links are set in the ink (Twenty Twenty-Five's are) honestly
				   has the ink for an accent. */
				/* NOT A BUTTON'S WORD (2026-09-25, Manuel: the small square in the
				   tile's corner "doesn't have a dot"). The first link on Twenty
				   Twenty-Five's front page is the Learn more button, whose word is
				   the paper's own white on its dark fill, so the measured accent
				   WAS the paper and the dot painted itself invisible. A link only
				   counts as the theme's accent when it stands readable on the
				   page's own paper. */
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
			/* THE BANDS THE THEME PAINTED WITH A FIXED COLOUR (0.11.47, Kadence's white
			   header under the made dark side; panel.php, THE THEME'S OWN OTHER SIDE).
			   A large part of the page whose ground is the theme's own page colour, or
			   paler, and does not move when the side does, was painted with a value and
			   not a palette name: it is marked, and the made side paints it. Read on
			   the theme's own side and then on the other, so the parts the palette
			   already carries over are left alone. */
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
			/* AS #RRGGBB (2026-10-06, the panel sweep): the page answers rgb(), oklch() or color(), and every colour
			   sum here (lum, contrast, hexToOklch) reads hex only, so on another theme a night made from the day came
			   out wrong (contrast read NaN) and the AI was told rgb() where it is asked to write hex. One pixel drawn
			   reads any colour the browser knows. */
			var hexOf = function (c) {
				if (!c || /^#[0-9a-f]{6}$/i.test(c)) return c;
				try { var cv = document.createElement('canvas'); cv.width = cv.height = 1; var cx = cv.getContext('2d'); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); var px = cx.getImageData(0, 0, 1, 1).data; return '#' + [px[0], px[1], px[2]].map(function (n) { return (n < 16 ? '0' : '') + n.toString(16); }).join(''); } catch (e) { return c; }
			};
			[light, dark].forEach(function (sd) { Object.keys(sd).forEach(function (k) { sd[k] = hexOf(sd[k]); }); });
			rec.colours = { light: light, dark: dark };
			rec.hostFace = face;
			/* THE SIDE THE THEME IS ON (2026-09-24, the audit: on Twenty Twenty-Five's white
			   page a Red paper came out a dark red, since the panel read the stored side,
			   dark, and offered the dark side's colours). A light page is light. The
			   plugin says so before the first paint (architravePanelHostSide); the
			   page is the second opinion, for a palette too thin to read. */
			var ch = /^#[0-9a-f]{6}$/i.test(light.paper || '') ? [1, 3, 5].map(function (i) { return parseInt(light.paper.substr(i, 2), 16); }) : [255, 255, 255];
			rec.hostSide = window.architravePanelHostSide || ((0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]) < 128 ? 'dark' : 'light');
		}); });
	}
	/* A LOOK is any tile but the theme's own and any tile SAVED FROM the theme's
	   own (`bare`, see saveAs): those carry a reader's few changes over the
	   theme as it is, so no room is painted under them and no face is stamped
	   that the reader did not choose. */
	function isLook(id) { var s = byId(id); return id !== 'host' && !(s && s.bare); }
	/* HAS THE READER ASKED FOR A LOOK. The paint that gives a guest's page the
	   room's paper and ink (panel-tokens.css, PAINT) waits on this mark, and a
	   room belongs to a look: the theme's own look has whatever sides the theme
	   itself has, and its Light / Dark / System row is dead. So the mark is
	   simply "a tile other than the theme's own is on", which a site default
	   also is, since then the OWNER has chosen. It was "any key in store" until
	   2026-09-22, and that counted the A/A stepper: a reader on the theme's own
	   look who pressed Larger, and nothing else, had a dark page after the next
	   reload, because the panel's default side has been dark since 2026-09-19
	   (measured on Twenty Twenty-Five). */
	function markChosen() {
		if (!HOST) return;
		if (isLook(current)) root.setAttribute('data-chosen', '');
		else root.removeAttribute('data-chosen');
		/* AND WHICH ONE (2026-09-25): a guest's pastels come from the look's own
		   reference (Instrument's from Linear), and the stylesheet has to know
		   which look it is dressing to say so. */
		if (isLook(current) && typeof current === 'string') root.setAttribute('data-look', current);
		else root.removeAttribute('data-look');
	}
	/* THE WAY HOME FORGETS THE CHOICES, NOT THE READER'S OWN WORK. Every dial's
	   key goes, so the page comes back exactly as the theme meant it. Two keys
	   stay: the styles the reader made himself (OWN_KEY), which are his and
	   would be lost for good, and the tweaks he made to other tiles
	   (TWEAKS_KEY), which apply nothing while no tile is on and are waiting
	   for him when he comes back to one; on Architrave, pressing Standard
	   forgets neither, and this is the same press. */
	/* NOT CHOICES OF LOOK (2026-09-26): the reader's light or dark, where the
	   owner dragged the door, and the owner's order of the hidden styles. The
	   sweep took them too, so after Original the next page opened on the
	   other side and the door jumped home. */
	/* AND NOT THE PANEL'S OWN MEMORY (2026-10-01, the panel audit): the versions kept of
	   every style, where the panel was put and how it is drawn. Pressing Original emptied
	   Versions for every style. */
	var KEEP_HOME = ['quire-side', 'architrave-opener-spot', HIDDEN_KEY, 'architrave-versions', 'architrave-panel-anchor', 'architrave-panel-place', 'architrave-panel-glow', 'architrave-panel-goo', 'architrave-goo', 'architrave-button-settings', 'architrave-door-ghosts', 'architrave-font-files-css', 'architrave-font-fetch-busy'];
	function goHome() {
		var kill = [];
		try {
			for (var i = 0; i < localStorage.length; i++) {
				var k = localStorage.key(i);
				if (/^(architrave|quire)-/.test(k || '') && k !== OWN_KEY && k !== TWEAKS_KEY && KEEP_HOME.indexOf(k) === -1) kill.push(k);
			}
			kill.forEach(function (k) { localStorage.removeItem(k); });
			var all = readTweaks(); /* an entry recorded against the theme's own look, by a build before remember() learned to skip it */
			if (all.host) { delete all.host; writeTweaks(all); }
		} catch (e) { /* private mode: the strip below still gives the theme back */ }
		/* IT USED TO LOAD THE PAGE AGAIN (Manuel, 2026-09-22: "when I click on all
		   tiles it goes very fast unless I click on Original, it somehow looks
		   different"). It did, because it was not a change of look at all, it was
		   a reload: a white flash, the scroll kept but everything redrawn, and no
		   way to dissolve one look into the next. The reload was there because
		   giving a theme back by a list of things to undo is a list that rots.
		   It does not rot if it is not written by hand: every dial this file
		   knows is put back to the theme's own record, which is the record of
		   having chosen nothing, and the three marks that are not dials are taken
		   off. Verified by photographing the page after pressing Original against
		   a browser that had never chosen anything: the same page, to the pixel.
		   A browser without view transitions still gets the change, just at once. */
		var h = byId('host');
		if (!h) { location.reload(); return; }
		/* THE HOST RECORD CARRIES THE THEME'S OWN PAPER AND INK, which is how the
		   Original TILE is painted in the theme's own colours. Painting them on
		   to the PAGE is another thing entirely: the theme already has them, and
		   a copy written over the top is one more sheet between the reader and
		   the design they asked to be given back. Measured: `data-colours` stayed
		   on after a press of Original, the only mark that did. */
		applyNow(h, { palette: wanted(h).palette, reading: wanted(h).reading, face: wanted(h).face, leading: wanted(h).leading, colours: null });
		root.removeAttribute('data-colours');
		root.removeAttribute('data-chosen');
		root.removeAttribute('data-look');
		if (wanted(h).face === 'host') {
			root.removeAttribute('data-face');
			try { localStorage.removeItem('architrave-face'); } catch (e) { /* private mode */ }
		}
		applyRoles();
		mark();
	}

	var stored = null;
	try { stored = localStorage.getItem(KEY); } catch (e) { stored = null; }
	/* A STORED 'standard' IS MAPPED TO THE DEFAULT ONLY WHERE THE DEFAULT STANDS
	   IN FOR STANDARD, which a site default does and the theme's own look does
	   not: it stands BEFORE Standard, not instead of it. Without the second test
	   a guest who pressed Standard was thrown back to Original by the next
	   reload, and the size he had set came back as the theme's own (measured on
	   Twenty Twenty-Five, 2026-09-22: "it seems like it's not working anymore"). */
	/* AND ON ARCHITRAVE A CLASSIC THAT IS OFFERED IS KEPT (Manuel, 2026-09-24: a reader pressed
	   Classic under a site default and the next page gave the default back). A stored
	   'standard' stands for the default only where Classic is not offered to this reader:
	   stored before a default existed, it is not a choice among the site's styles. Where
	   the owner shows Classic beside the default, pressing it is one, and it holds. */
	var current = linked ? linked.id : (byId(stored) && !(stored === 'standard' && !GUEST && DEFAULT !== 'standard' && !offered(byId('standard'))) ? stored : DEFAULT); /* on a guest Standard is Classic, a style like any other, so a stored one is kept */
	function stamp(id) {
		current = id;
		if (id === 'standard' || id === 'host') root.removeAttribute(ATTR); /* Standard is the absence of the attribute; a site default wears its own id */
		else root.setAttribute(ATTR, id);
		try {
			if (PREVIEW_LINK) { /* a preview link's visit stores no choice */ }
			else if (id === 'host' && DEFAULT === 'host') localStorage.removeItem(KEY); /* the theme's own look is the absence of a choice, so it stores none; under a site default it is one, and is kept */
			else localStorage.setItem(KEY, id);
		} catch (e) { /* private mode: the page is still right */ }
		markChosen(); /* the mark follows the tile, and nothing else moves it */
	}
	stamp(current);
	/* A FIRST VISIT ON A SITE DEFAULT (2026-09-18). The dials' own scripts
	   have already stamped their rest before this runs, and a style presses
	   its recipe only on a press; so a reader arriving with nothing chosen
	   would see the default's name on <html> over Standard's dials. Where
	   the stored style did not resolve to itself (nothing stored, Standard
	   mapped to the default, a default since unpublished) the four dials are
	   stamped here, before paint, from the default's recipe, and the rows
	   are pressed once the page is in so their marks and their storage
	   follow. Sites without a site default are untouched: Standard's rest
	   is the dials' own rest already. */
	var seeded = false;
	if (linked || (current !== stored && current === DEFAULT && DEFAULT !== NONE)) {
		var w0 = wanted(byId(current));
		try {
			var sideNow = String(root.getAttribute('data-theme') || (Modes ? Modes.default : '')).split('-')[1] || 'light';
			if (Modes && Modes.apply) Modes.apply(w0.palette, root, sideNow);
			if (window.QuireReading && window.QuireReading.apply) window.QuireReading.apply(w0.reading, root);
			if (w0.face && w0.face !== 'newsreader') root.setAttribute('data-face', w0.face); else root.removeAttribute('data-face');
			if (w0.leading && w0.leading !== 'default') root.setAttribute('data-leading', w0.leading); else root.removeAttribute('data-leading');
		} catch (e) { /* the press below still lands */ }
		seeded = true;
	}

	/* THE THREE SWITCHES, PER STYLE (2026-09-10; Book's two of 2026-09-09
	   were site-wide and Book's alone). Each is stamped on <html> as
	   on/off before paint, from the style's recipe or the reader's tweak
	   of it, which lives in the same tweak record as the dials. */
	/* Where a switch rests: the recipe's word. (For a day the lines also
	   rested on for any style on the black-and-white pair; gone 2026-09-12,
	   since Poster rests on that pair without lines by design. A reader
	   who moves Standard onto black has the Linien switch.) */
	/* A SWITCH THAT RESTS ON (2026-09-23): every switch rests off where a style
	   does not name it, which is right for a look added later. The picture
	   frame is the other way round: every picture has worn it since before
	   the switch, so a style, a saved style or a record that does not name it
	   keeps it. */
	var OPT_ON = { pictureframe: true };
	function restOf(k) {
		var s = byId(current);
		if (s && typeof s[k] === 'boolean') return s[k];
		return !!OPT_ON[k];
	}
	function optionOn(k) {
		/* THE COLOURS' OWN SWITCHES (2026-10-03): worked out from the colours, never stored */
		if (k === 'soft') return false; /* Reading text in Soft text is the role's colour now (applyTypeExtras) */
		if (k === 'marker') return !!highlightNow();
		if (k === 'darkground') { var gs = groundSides(); return gs.light || gs.dark; }
		if (k === 'widehead') return layoutOf('titleWidth') === 'wide';
		if (k === 'rounded') return layoutOf('radius') !== 'none';
		if (k === 'lines') return layoutOf('borderWidth') !== 'none';
		if (k === 'hairlines') return layoutOf('borderWidth') === 'hairline';
		if (k === 'fills') return true; /* fills are on: a surface without one is outlined (2026-10-05) */
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
		/* Written only when the value changes: an unchanged setAttribute still
		   fires the observers, and one press re-rendered the panel three
		   times (the audit, 2026-09-12). */
		function stampAttr(name, value) { if (root.getAttribute(name) !== value) root.setAttribute(name, value); }
		OPTS.concat(['darkground', 'soft', 'marker'].filter(function (k) { return OPTS.indexOf(k) === -1; })).forEach(function (k) { stampAttr('data-' + k, optionOn(k) ? 'on' : 'off'); }); /* the three the colours stand for now are stamped as before */
		applyColourStamps();
		/* THE STYLE'S OWN TEXT SIZE (Manuel, 2026-09-25, of the big A: "what would
		   Apple do?", then "yes, do both"). A reader's size step makes the letters
		   bigger or smaller and the column keeps the width the style gave it, as a
		   book's page does: the line holds fewer letters, not a wider block.
		   style.css (THE COLUMN KEEPS ITS WIDTH) turns this and data-reading into
		   the ratio the measure is scaled by. The style's own step is its record's
		   (or its base's), not a tweak: a reader's press lands in the tweaks. */
		(function () { var st = byId(current), b = st && byId(baseOf(st)); stampAttr('data-reading-base', (st && st.reading) || (b && b.reading) || 'default'); })();
		/* HYPHENATION FOLLOWS THE JUSTIFYING (2026-09-11, the Apple review:
		   justified text without hyphens makes rivers, so the two switches
		   were one decision). Blocksatz on hyphenates; off, ragged and
		   unhyphenated. The stored key stays, for the record, and is written
		   from the justify switch. */
		stampAttr('data-hyphens', optionOn('justify') ? 'on' : 'off');
		/* CHROME DRAWS THE INITIAL ONCE (Manuel, 2026-09-10: "after I toggled
		   on and off some switches, I ended up with a small w"). Switching
		   initial-letter off and on again leaves the letter inline with its
		   gap, measured live; a reflow of the paragraph makes it draw. So
		   the first paragraphs are taken out of layout and put back when the
		   switch changes, which costs nothing a reader can see. */
		if (wasCap !== null && wasCap !== root.getAttribute('data-dropcap')) nextFrame(redrawInitials); /* all of them at once, on the next frame (2026-10-02) */
		try { localStorage.removeItem('architrave-justify'); localStorage.removeItem('architrave-hyphens'); } catch (e) { /* the site-wide keys of 2026-09-09 */ }
	}

	/* THE ACCENT IS THE SITE'S, NOT A STYLE'S (Manuel, 2026-09-10: "if
	   someone doesn't like the colourful links, he could switch that off",
	   then: not only the links, "all the accent colours"). One switch for
	   every style and every room; off stamps data-accent="off" and the
	   accent is the ink. */
	var ACCENT_KEY = 'architrave-accent';
	function accentOn() {
		try { return localStorage.getItem(ACCENT_KEY) !== 'off'; } catch (e) { return true; }
	}
	function applyAccent() {
		if (accentOn()) root.removeAttribute('data-accent'); else root.setAttribute('data-accent', 'off');
		try { localStorage.removeItem('architrave-links'); } catch (e) { /* 1.1.715's key */ }
	}

	/* THE TWEAKS, one set of dial values per style, kept only while they
	   differ from the recipe. */
	/* READ THROUGH A WHITELIST (the audit, 2026-09-13): keys older builds wrote
	   and this one no longer reads (bold, wide, hyphens, tracking at the top
	   level) and unaliased role values stayed in a reader's record and kept a
	   style "adjusted" with nothing to reset. Only what is read survives. */
	var TWEAK_KEYS = DIALS.concat(OPTS, ['pictureFilter', 'colourOnHover', 'dimInDark', 'pictureFrame', 'frameWidth', 'pictureFade', 'pictureShadow', 'pictureCorners', 'buttonColour', 'buttonShape', 'primaryButton', 'secondaryButton', 'tertiaryButton', 'tagsMatchButtons', 'currentItem', 'lineLength', 'titleWidth', 'pictureWidth', 'figureWidth', 'radius', 'borderWidth', 'borderStyle', 'borderStrength', 'tint', 'sans', 'scope', 'roles', 'colours', 'pictures', 'capLines', 'line', 'fill', 'softlevel', 'quietlevel', 'smallsoft', 'measure', 'space', 'spaceInside', 'spaceItems', 'spaceSections', 'spaceTitle', 'framewidth', 'linestyle', 'corners', 'fadeedges', 'markercolour', 'framepattern', 'button', 'buttonshape', 'buttonstyle', 'buttonmedium', 'buttonquiet', 'tags', 'chosenitem', 'linewidth', 'cards', 'quotes', 'notes', 'fields', 'paragraphs', 'capface', 'hyphenate', 'piccorners', 'pictureshadow', 'opening', 'widefigures', 'fullpicture', 'categories', 'links', 'preset', 'was', 'effects']).filter(function (k) { return k === 'palette' || inRecord(k); });
	function cleanTweaks(all) {
		var out = {};
		Object.keys(all || {}).forEach(function (id) {
			var e = all[id], s = byId(id), clean = {};
			if (!s || !e || typeof e !== 'object') return;
			liftCentre(e, s);
			TWEAK_KEYS.forEach(function (k) { if (k !== 'roles' && k !== 'colours' && k !== 'effects' && e[k] !== undefined) clean[k] = e[k]; });
			/* The colours: two sides, three wells, hex alone; a value equal to the
			   style's own saved colour is no tweak. */
			/* AND THE MASK (Manuel, 2026-09-20: "I can't click on presets"). A style
			   that carries colours of its own, a site default or an own tile, leaves
			   them by masking each with an empty string (setCustom below, the way a
			   tint masks an own accent). Hex alone was kept here, so the mask was
			   dropped on the very next read, coloursOf found the style's colours
			   again, custom() stayed true and the switch sprang back to Eigene: on
			   such a style Voreinstellung could not be reached at all. An empty
			   string is kept for a well the style itself fills, and only there. */
			if (e.colours && typeof e.colours === 'object') {
				var colours = {};
				['light', 'dark'].forEach(function (side) {
					var c0 = e.colours[side]; if (!c0 || typeof c0 !== 'object') return;
					var keptC = {}, c = {}, sc = s.colours && s.colours[side];
					Object.keys(c0).forEach(function (k) { c[colourKey(k)] = c0[k]; }); /* the seven's names, whichever a tweak was written in */
					var own = function (k) { return sc && (sc[k] !== undefined ? sc[k] : sc[COLOUR_ENGINE[k]]); };
					WELL_KEYS.forEach(function (k) { /* the seven, the button's and the roles' own (2026-10-03) */
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
			/* THE EXTRAS' DETAILS: known effects and details, values from their list, and
			   only what differs from the style's own (or from the rest, where it names none). */
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
	/* ONE STEP BACK, AND THE ONE BEFORE IT (Manuel, 2026-09-19, "what would Apple do … ok do it"): every change the panel makes to a style goes through writeTweaks, so what stood before each write is kept, with the side, and Rückgängig puts it back; one wrong press on Zurücksetzen had lost a whole evening's tuning. A drag writes at every stop, so writes that follow each other within 0.7s are one step and what is kept is what stood before the first. Kept for the page's life only, forty deep; changing tile is not a change to a style and is not in it. */
	var HISTORY = [], FUTURE = [], lastPush = 0, undoing = false; /* FUTURE: what Undo took back, for Redo (2026-09-28, the lab's ⇧⌘Z) */
	/* THE HISTORY OUTLIVES A RELOAD (1.4.94 / 0.56.36; Manuel, 2026-10-11, tuning a style in many small steps: "how many
	   undo steps do we have and do they get lost"). Forty steps, kept in the browser's session store after every
	   change, read back when the page loads: a reload keeps them, closing the tab still clears them. Not for readers,
	   whose panel has no Undo. */
	var UNDO_KEY = 'architrave-undo';
	function keepHistory() { if (READER) return; try { sessionStorage.setItem(UNDO_KEY, JSON.stringify({ h: HISTORY, f: FUTURE })); } catch (e) { /* full or private: the history stays with the page */ } }
	(function () {
		if (READER) return;
		try {
			var o = JSON.parse(sessionStorage.getItem(UNDO_KEY) || '{}'), ok = function (x) { return x && typeof x === 'object' && typeof x.tweaks === 'string' && typeof x.style === 'string'; };
			if (Array.isArray(o.h)) HISTORY = o.h.filter(ok).slice(-40);
			if (Array.isArray(o.f)) FUTURE = o.f.filter(ok).slice(-40);
		} catch (e) { /* nothing kept */ }
	})();
	function storedSide() { try { return localStorage.getItem('quire-side') || ''; } catch (e) { return ''; } } /* not `sideNow`: a variable of that name further down in this file shadowed the function, every save threw inside its own try, and nothing the panel changed was kept (caught by the undo test before it shipped) */
	/* WHAT A STEP CHANGED, so Undo can say it (2026-09-23, Apple's "Undo Typing"):
	   the first key of this style's tweaks that differs, a role's id when it was
	   a role, else the key itself. */
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
				versionSoon(); FUTURE = []; /* a new change ends what Redo could bring back */
				var nowMs = Date.now();
				if (nowMs - lastPush > 700) { HISTORY.push({ tweaks: was, side: storedSide(), style: current, what: changedKey(was, next), base: siteBase(current) }); if (HISTORY.length > 40) HISTORY.shift(); }
				lastPush = nowMs;
				keepHistory();
			}
			/* nothing tweaked is no key at all (2026-09-26): '{}' broke "a dial at rest writes nothing" */
			if (next === '{}') localStorage.removeItem(TWEAKS_KEY); else localStorage.setItem(TWEAKS_KEY, next);
		} catch (e) { /* as above */ }
		if (!previewing) siteSaveSoon();
	}
	/* SHOWN IS SHOWN (0.31.0, Manuel, 2026-10-04: "When it's in the section shown to readers, it should be shown
	   to readers no matter what"). His colours for a published style stood in his browser as "Edited" until a
	   Publish he could not see on the Styles page, and his phone showed the style without them. A style on the
	   site now keeps no changes of its own in the owner's browser: whatever is changed in it, by a row, an undo,
	   a paste or the AI helper, goes to the site 1.2 s after the last change, as a Mac document saves itself.
	   Choosing another style first sends what is waiting (applyNow), and so does leaving the page. */
	var siteSaveTimer = 0, siteSaving = '', siteSent = {};
	/* UNDO KEEPS WORKING: a change is held as tweaks over the saved record, and a save makes the changes the record.
	   So each step of Undo and Redo also holds the record it stood on (base), and puts it back with its tweaks. */
	function siteBase(id) { var o = byId(id); return o && o.site ? JSON.stringify(o) : null; }
	function restoreBase(id, json) { var o = byId(id); if (!o || !o.site) return; try { STYLES[STYLES.indexOf(o)] = JSON.parse(json); } catch (e) { /* kept as it is */ } }
	/* An undo or redo step put on the page: see A STEP LANDS AS CHANGES OVER THE SITE AS IT IS NOW (the API's undo). */
	function landStep(h) {
		var s = byId(h.style) || byId(current);
		if (s && s.site && h.base && h.style === current) {
			var keep = siteBase(s.id), rec = null;
			restoreBase(s.id, h.base);
			try { localStorage.setItem(TWEAKS_KEY, h.tweaks); } catch (e) { /* private window */ }
			try { rec = lookOf(JSON.parse(window.ArchitraveStyles.exportStyle() || '{}')); } catch (e) { rec = null; }
			restoreBase(s.id, keep);
			if (rec) {
				var all = readTweaks(), e = entryFromRecord(rec);
				if (Object.keys(e).length) all[s.id] = e; else delete all[s.id];
				try { if (JSON.stringify(all) === '{}') localStorage.removeItem(TWEAKS_KEY); else localStorage.setItem(TWEAKS_KEY, JSON.stringify(all)); } catch (e) { /* private window */ }
			}
			return s;
		}
		try { localStorage.setItem(TWEAKS_KEY, h.tweaks); } catch (e) { /* private window */ }
		if (h.base) restoreBase(h.style, h.base); /* SHOWN IS SHOWN: the step is the style as it stood, saved record and changes together */
		return s;
	}
	/* THE SITE AS IT IS NOW (0.32.1, Manuel: "fix the helper bug, go"). A page held the site's styles as they were
	   when it loaded. Another browser changed one (his Focus, edited in his own Chrome) and this page knew nothing:
	   its next save sent its old copy with its one change in it, and the other browser's colours were gone; and a
	   save it had sent before counted as still on the site, so sending the saved Focus again was skipped as
	   "already there" while the helper said "on the site". Now the page asks the site again before a save goes
	   (siteSaveSoon starts it, the 1.2 s wait covers it), when it comes back into view, and before every AI helper
	   step. A style the site changed takes the site's version, and what this page changed stands on top of it; what
	   was sent before counts no more. */
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
				/* AN OLDER COPY OF THE SITE IS NOT THE SITE (1.4.92; Manuel, 2026-10-11: a row he had set went back to its old
				   look while he set the next one). Measured live: a GET after a save once answered with the record from before
				   it; the page took that for the truth, drew the old row again, and the next save wrote it back to the site.
				   Whatever answers with a stamp older than the one the page's last save or load brought is let go. */
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
		root.setAttribute('data-site-saving', s.id); /* the window watches the root: it says Saving… until this goes */
	}
	function siteSaveNow() {
		clearTimeout(siteSaveTimer); siteSaveTimer = 0;
		var s = byId(current), done = function () { if (!siteSaving && !siteSaveTimer) root.removeAttribute('data-site-saving'); };
		if (!s || !s.site || !(readTweaks()[s.id] || siteSent[s.id])) { done(); return; }
		var rec = window.ArchitraveStyles.exportStyle();
		if (rec === siteSent[s.id]) { /* nothing new for the site: what this browser still holds is on it already, so it goes (0.31.1) */
			var all = readTweaks(); if (all[s.id]) { delete all[s.id]; previewing = true; try { writeTweaks(all); } finally { previewing = null; } mark(); }
			done(); return;
		}
		if (siteSaving) { siteSaveSoon(); return; } /* one at a time; the next waits for this one */
		siteSaving = s.id;
		window.ArchitraveStyles.updateSite().then(function () { siteSaving = ''; done(); renderHosts(); }, function () { siteSaving = ''; renderHosts(); setTimeout(siteSaveSoon, 5000); }); /* offline or refused: tried again, the change stays meanwhile */
	}
	window.addEventListener('pagehide', function () { if (siteSaveTimer) siteSaveNow(); });
	/* CHANGES ALREADY WAITING (0.31.1): a browser that held changes to a style on the site from before 0.31.0
	   (his "Test" colours) sends them once the page has loaded, as it would a new change */
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
	/* THE BOOT SCREEN MUST COVER THE FIRST PAINT: presets.js runs in the head, so the root says it is booting before the body exists and door.css paints the blue over everything until the screen itself is built. Asked HERE, once the style on the page (`current`) and the reader's changes (TWEAK_KEYS) are known: asked where the screen's code stands, both were still undefined, the pick always read as off, and the article painted before the screen came (2026-10-01, the panel audit). */
	applyEffects();
	applyFramePattern();
	applyCorners();
	applyAccent();

	/* THE FOCUS MODE IS THE THEME'S (2026-09-21, the panel's move to a plugin;
	   Manuel: "the focus mode stays with the theme"). It lived here from
	   2026-09-11; it is assets/js/focus-mode.js now, window.ArchitraveFocus,
	   loaded in the head before this file. The four names this object offered
	   (focus, motion, retime, setFocus) stay and hand over, so nothing that
	   called them has to know. */
	var Focus = window.ArchitraveFocus || { on: function () { return false; }, motion: function () { return 0; }, retime: function () { return 0; }, set: function () {} };

	// What <html> says for each dial, with the resting states named: the
	// default of every dial is the absence of its attribute.
	/* THE THREE COLOURS A PAIR IS AUTHORED FROM (Manuel, 2026-09-14): Papier,
	   Tinte, Akzent, per side. A style's own saved colours first, the
	   reader's wells over them. Empty where the pair's own colour stands. */
	function coloursOf(id, own) {
		var s = byId(id || current), tw = readTweaks()[(s && s.id) || current] || {}, out = { light: {}, dark: {} };
		['light', 'dark'].forEach(function (side) {
			/* A RECIPE MAY NAME A PRESET (2026-09-19): its six colours are the style's own, read from the list and not restated in the recipe. Not while the reader has let the preset go (a tweak's empty `preset`), when the colours are whatever they then set. */
			/* A RECIPE MAY NAME A PRESET AND A WELL OF ITS OWN BESIDE IT (2026-09-26, Gallery's second blue on its button): the preset's six come first, the recipe's own wells over them. */
			var named = (s && s.preset && tw.preset === undefined) ? presetById(s.preset) : null;
			var base = {}, t = engineSide((tw.colours && tw.colours[side]) || {}); /* the seven's names or the engine's, read as the engine's */
			/* A PRESET CHOSEN OVER A STYLE'S OWN COLOURS (2026-10-05): only the style's wells that sit beside a preset stay under it; its ground, card and soft text went with its paper, or Blue hour chosen on Folio kept Folio's cream cards. */
			var mine = engineSide(s && s.colours && s.colours[side]);
			if (tw.preset) Object.keys(mine).forEach(function (k) { if (BESIDE_PRESET.indexOf(colourKey(k)) === -1 || (k === 'muted' && !s.preset)) delete mine[k]; }); /* soft text stays only where the style set it beside a preset of its own; on a style without one it is part of its six */
			[(named && named[side]) || {}, mine].forEach(function (src) { Object.keys(src).forEach(function (k) { if (src[k]) base[k] = src[k]; }); });
			ENGINE_WELLS.forEach(function (k) { var v = t[k] !== undefined ? t[k] : base[k]; if (v) out[side][k] = v; });
		});
		return out;
	}
	/* THE ACCENT'S OWN LIST (Manuel, 2026-09-17: "we're going to pack more
	   accent colours on that list so that it somehow makes sense that it's an
	   own window. We should like the whole colour rainbow section there, like
	   the Tailwind colours. And then we should pick for our tiles the one that
	   is already in that colour list").

	   Twenty colours across the spectrum, each a pair: the one that reads on a
	   light paper and the one that reads on a dark one. The five the styles
	   have always used — Lila, Braun, Grün, Blau, Orange — are IN this list at
	   their own values, so a style whose accent is Lila finds itself here and
	   nothing on the site changed colour. The other fifteen fill the wheel
	   between them.

	   They are poured as an own accent, the same way the wheel's colour is:
	   nothing here touches the design system's tint registry, and a colour
	   chosen is the style's, per side. */
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
	/* THE SAME TWENTY, THREE TIMES (Manuel, 2026-09-16: "the asymmetry is weird
	   and we should solve that. The customisation could also be like a list for
	   ink and for paper … a list for paper, a list for ink, a list for accent.
	   Underneath all three we have the colour wheel").

	   One set of hues runs through all three lists, each at the lightness its
	   job asks for: a paper is the palest step of its hue, an ink the darkest,
	   an accent the one that carries. Per side they turn over, because a dark
	   room's paper is the darkest step and its ink the palest. So Blau means
	   the same colour in all three lists and in both sides; what changes is
	   how much of it there is.

	   THESE ARE NOT THE PRESETS' COLOURS (Manuel, 2026-09-16: "the
	   customisation area is completely not connected to our presets … even if
	   it's the same colour they are not connected any more. It's more like, by
	   accident, the same colour"). A preset is a made pair and it is chosen
	   whole; these are parts, and choosing one is leaving the preset. A row
	   here is marked only when the reader set it here.

	   NOTHING IS BLOCKED. An unreadable pair can be built out of these, and
	   that is the reader's to build; the contrast chip on the ink says what
	   the pair reads at (Manuel: "that's their choice and that's the whole
	   thing about customisation"). */
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
	var LISTS = { paper: PAPERS, ink: INKS, accent: ACCENTS, button: ACCENTS, ground: PAPERS, lift: PAPERS, marker: ACCENTS, muted: INKS, title: ACCENTS, headings: ACCENTS, body: ACCENTS, quote: ACCENTS, meta: ACCENTS, 'interface': ACCENTS, code: ACCENTS }; /* the button's, the roles' and the pen's own colours pick from the accent's twenty; the ground and the card from the paper's; soft text from the ink's (the engine's names, 2026-10-03) */ /* the button's, the roles' and the pen's own colours pick from the accent's twenty; the ground and the card from the paper's */
	/* WHICH ROW OF A LIST IS ON: the colour the style holds on both sides, found
	   in that list. A style wearing a preset holds the preset's colours, which
	   are not these, so nothing is marked; a style wearing its own tint holds no
	   colour at all, and nothing is marked either. Only what was set here is
	   marked here (Manuel, 2026-09-16, reversing the tint fallback of the day
	   before: "the answer is no"). */
	function listColourOf(key) {
		key = COLOUR_ENGINE[key] || key;
		var c = coloursOf(null, true), light = (c.light || {})[key], dark = (c.dark || {})[key];
		if (!light || !dark) return '';
		var hit = (LISTS[key] || []).filter(function (x) { return x.light === light && x.dark === dark; })[0];
		return hit ? hit.id : ''; /* a colour mixed on the wheel is in no list */
	}
	function accentById(id) { return ACCENTS.filter(function (a) { return a.id === id; })[0] || null; }
	/* The accent's own name for the list it stands in; the check mark of
	   2026-09-17, which followed a style's tint into the list, went with the
	   accent leaving the customisation area's neighbours (2026-09-16). */
	function accentColourOf() { return listColourOf('accent'); }
	function presetById(id) { return PRESETS.filter(function (p) { return p.id === id; })[0] || null; }
	function presetOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && tw.preset !== undefined) return tw.preset || '';
		return (s && s.preset) || '';
	}
	/* THE OTHER SIDE FOLLOWS (Manuel, 2026-09-15: "sometimes I like to start
	   with the dark side"). A pair has two sides; whichever side a colour is
	   set on first is the source, and the same colour on the other side is
	   derived from it until that side is touched itself: the hue and the
	   chroma kept, the lightness moved to where that side's papers and inks
	   stand (Neutral's paper #efece6 and ink #232323 by day, #373737 and
	   #e6e6e6 by night). Derived colours are never stored: a saved style
	   keeps only what was set, so the following side keeps following. */
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
		if (key === 'accent') return hex; /* the accent is the same colour on both sides; the ladder picks its ink */
		var o = hexToOklch(hex), L = o.L;
		if (toSide === 'dark') { if (key === 'paper') { L = 0.26 + (1 - L) * 0.6; o.C *= 0.7; } else L = 0.6 + (1 - L) * 0.4; } /* Neutral's #efece6 lands near its own night paper #373737 */
		else { if (key === 'paper') L = 0.82 + (1 - L) * 0.18; else L = 0.42 - 0.2 * L; }
		o.L = Math.max(0, Math.min(1, L));
		return oklchToHex(o);
	}
	/* The two sides as the page shows them: what was set, and on the other side what follows. */
	/* Whether this style's two sides are kept apart; linked at rest. */
	/* A DARK COLOUR SET BY HAND (2026-10-05, Manuel: "go with your recommendation", the switch Same colours for
	   light and dark is gone): the night holds a colour of its own that no preset gave it, neither the one in
	   effect nor the style's own (a preset let go writes its colours out, so they look set by hand). Such a
	   colour stays when the same colour changes by day; any other follows the day. */
	function darkByHand(entry, key, presets) {
		var d = entry.colours && entry.colours.dark, v = d && (d[key] || d[COLOUR_ENGINE[key]]);
		if (!v) return false;
		return !presets.some(function (p) {
			var pv = '';
			if (p && p.dark) Object.keys(p.dark).forEach(function (k) { if (colourKey(k) === key) pv = p.dark[k]; });
			return pv && String(pv).toLowerCase() === String(v).toLowerCase();
		});
	}
	/* THE ACCENT FOLLOWS THE SIDE (Manuel, 2026-09-18, Radarnacht: "I styled the
	   dark version … adjusted the accent, but when I click on the light
	   version it's the same accent. It looks wrong"). Until today the chain
	   carried the accent across unchanged, on the thought that the ladder
	   picks its ink; but a pale green made for a black paper is a pale green
	   on a pale paper too, and no ink under it makes a link readable. The
	   derived accent keeps its hue and chroma and moves in lightness, toward
	   the ink's end of that side, until it reads at 4.5:1 on that side's
	   paper; an accent that already reads is left alone. */
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
				/* A DARK GROUND STAYS ON ITS SIDE (2026-10-03): a ground across from its own paper is that
				   side's dark (or light) ground, and makes no ground for the other side, which keeps its own. */
				if (k === 'ground' && groundFlip(out[from].ground, out[from].paper || paperNow(from), out[from].ink)) return;
				out[to][k] = deriveColour(out[from][k], k === 'paper' || k === 'ink' ? k : k === 'ground' || k === 'lift' ? 'paper' : 'accent', to); out.derived[to].push(k);
			});
			/* the pen crosses over and is fitted to that side's paper below; a named pen is the same pen on both sides */
			if (out[from].marker && !out[to].marker && out.derived[from].indexOf('marker') === -1) { out[to].marker = out[from].marker; out.derived[to].push('marker'); }
			/* SOFT TEXT CROSSES AS FAR TOWARD ITS PAPER as it stood on its own side */
			if (out[from].muted && !out[to].muted && out.derived[from].indexOf('muted') === -1) {
				var fP = hexToOklch(out[from].paper || paperNow(from)).L, fI = hexToOklch(out[from].ink || inkOf(from)).L, f = fI === fP ? 0.5 : (hexToOklch(out[from].muted).L - fI) / (fP - fI);
				out.derived[to].push('muted'); out[to].muted = '#pending:' + Math.max(0, Math.min(1, f)) + ':' + out[from].muted;
			}
		});
		/* The accent last, once each side's paper is known: the pair's own paper
		   where the style sets none, read off the registry's swatch. */
		['light', 'dark'].forEach(function (side) {
			var paper = out[side].paper || paperOf(side);
			if (out.derived[side].indexOf('accent') !== -1) out[side].accent = accentForPaper(out[side].accent, paper);
			['button'].concat(ROLE_WELLS).forEach(function (k) { if (out.derived[side].indexOf(k) !== -1) out[side][k] = accentForPaper(out[side][k], paper); }); /* the button's and the roles' own colours follow to the other side as the accent does */
			if (/^#pending:/.test(out[side].muted || '')) { var mp = out[side].muted.split(':'), ink = out[side].ink || inkOf(side), o = hexToOklch(mp[2]); var pp = out[side].paper || paperNow(side); o.L = hexToOklch(ink).L + (hexToOklch(pp).L - hexToOklch(ink).L) * +mp[1]; out[side].muted = oklchToHex(o); }
			/* THE PEN FOLLOWS THE SIDE TOO (Manuel, 2026-09-26: a cream pen "is not really
			   adjusting. What works on dark is not working on light"). It kept one colour on
			   both sides, and the bar under the title, a line on the paper, all but vanished
			   on the other one. Now it keeps its hue and moves in lightness until it stands
			   at 3:1 on that side's paper, the measure for a line; a pen set by hand on both
			   sides keeps each. */
			if (out.derived[side].indexOf('marker') !== -1 && !penOf(out[side].marker)) out[side].marker = accentForPaper(out[side].marker, paper, 3);
		});
		return out;
	}
	function lum(hex) {
		var c = hex.replace('#', ''), v = [0, 2, 4].map(function (i) { var n = parseInt(c.substr(i, 2), 16) / 255; return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4); });
		return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
	}
	function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
	/* THE PAIR FROM THREE COLOURS: the design system's ladder in miniature.
	   Author the paper, the ink and the accent; the canvas and the plane,
	   the fields and the rungs, the second inks, the lines, the inverse and
	   the focus follow, mixed as the system mixes them. The steps stay the
	   room's. Named the theme's for now; the recipe belongs in QDS, as a
	   runtime pair, once it has been judged live. */
	/* THE SIDE WITHOUT A NAME (Manuel, 2026-09-17: "if I click for example on
	   blue, it doesn't change the link accent colour to blue"). Every rule
	   written here was hung on `[data-theme$="-light"]` or `-dark`, and a
	   reader who has never pressed Hell or Dunkel has no `data-theme` at all:
	   the site's rest state is the system's light room, written on :root with
	   no attribute to match. So none of a reader's own colours applied until
	   they touched the side switch — not the accent, not the paper, not a
	   preset. A light-side rule now also answers a root with no mode on it. */
	function sideSelectors(side, extra) {
		var on = 'html:root[data-colours="on"]';
		var list = [on + '[data-theme$="-' + side + '"]' + (extra || '')];
		if (side === 'light') list.push(on + ':not([data-theme])' + (extra || ''));
		return list;
	}
	function sideRule(side, extra, suffix, body) {
		return sideSelectors(side, extra).map(function (sel) { return sel + (suffix || ''); }).join(',') + '{' + body + '}';
	}
	/* HOW FAR A SURFACE STANDS FROM ITS PAPER (Manuel, 2026-09-16: "the ones you
	   created have quite dark grid lines compared to the paper, while Neutral
	   and Warmes Papier have much smaller contrast. I'm wondering how you
	   achieved that and why you chose that").

	   Because the recipe was a guess. The rail's ground was the paper carried a
	   PERCENTAGE OF THE WAY TO THE INK — 7% by day — and on the night side 40%
	   of the way to black, which is three times what any room does. A share of
	   the ink is the wrong measure: it makes the step as dark as the ink is, so
	   a preset with a deep ink got a deep rail, and the five rooms never did.

	   Measured, all ten sides of the five rooms move their surfaces by an
	   ABSOLUTE amount of lightness, in oklab, and by nearly the same amount
	   whichever side they are on (tools/check-steps.py prints the table):

	       canvas      -5      the rail's ground and the page behind the paper
	       plane       -2.5    the plane the paper lies on
	       navigation  -3.5 by day, -8 by night
	       subtle      -4.5    fields
	       raised       0 by day, +3 by night — a card is its paper by day

	   So the surfaces are stepped by lightness now, the hue and the chroma of
	   the paper kept, and a paper that is already black is left alone, which is
	   what Terminal does: its canvas IS its paper.

	   The second inks and the lines stayed fractions of paper-to-ink, which is
	   the right measure for them — a pale ink should give a pale second ink —
	   but they were measured too and moved: the rooms' secondary ink sits at
	   85% of the way to the ink where this wrote 75%, and their strongest line
	   at 29% where this wrote 26%. */
	function shade(hex, dL) {
		var o = hexToOklch(hex);
		o.L = Math.max(0, Math.min(1, o.L + dL));
		return oklchToHex(o);
	}
	/* THE GROUNDS SINK, THE FIELDS TURN OVER. A paper at black has nothing below
	   it: the canvas, the plane and the rail simply stay black, which is what
	   Terminal does, and a rail that is its own paper is a rail with no seam
	   rather than a rail with a wrong one. A field is different — it has to be
	   findable — so on a paper that cannot sink, a field rises by the same
	   amount instead, as Terminal's own fields do. */
	function sink(hex, d) { var o = hexToOklch(hex); return o.L <= 0.03 ? hex : shade(hex, -d); }
	/* HOW BIG A STEP HAS TO BE ON A DARK PAPER. Oklab's lightness is even to the
	   eye, but the screen runs out of room at the black end: five hundredths
	   above black is #020202, which is not a field, it is black. The rooms know
	   this — Terminal lifts its fields by twenty and its cards by twenty-four,
	   where Neutral's night side moves them by four and one. So a step grows as
	   the paper approaches black, from what an ordinary night paper takes to
	   what a black one needs, and it is the same curve for each of them. */
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
	/* A pair's tokens as one declaration block, for its side on the root and for
	   the dark ground's two scopes (THE DARK GROUND). */
	/* What a set says about its own grounds, for its side (pairBody, pairCss). */
	function pairLooks(c, side) {
		/* THE GROUND AND THE CARD (Manuel, 2026-09-26, then the seven colours, 2026-10-03): background2
		   is the page around the paper and under the rail, instead of a step sunk below the paper; card
		   is what stands on the paper. A ground across from its paper is the dark ground and is worn
		   around the paper only (applyGround), never on the root, where a phone would read dark text on it.
		   ON ANOTHER THEME THE PAPER IS THE PAGE (2026-10-03): the ground does not sink below it there;
		   it is the theme's second background, where the theme has one (panel.php). */
		var G = c.ground && !groundFlip(c.ground, c.paper, c.ink) ? c.ground : '';
		return { flat: !!window.architravePanelGuest, G: G, F: c.lift || '' };
	}
	function pairBody(c, side) {
		var P = c.paper, I = c.ink, Ig = I, dark = lum(P) < lum(I); /* Ig: the ink the greys are mixed from (the greys' tint left with Instrument, 2026-10-02) */
		var mix = function (a, b, pct) { return 'color-mix(in oklab, ' + a + ', ' + b + ' ' + pct + '%)'; };
		var k = pairLooks(c, side), flat = k.flat, G = k.G, F = k.F;
		return '' +
			'color-scheme:' + (dark ? 'dark' : 'light') + ';' +
			'--surface-base:' + P + ';--text-primary:' + I + ';' +
			'--surface-canvas:' + (G || (flat ? P : sink(P, 0.05))) + ';' +
			'--surface-plane:' + (G || (flat ? P : sink(P, 0.025))) + ';' +
			'--surface-navigation:' + (G || sink(P, dark ? 0.08 : 0.035)) + ';' +
			'--surface-subtle:' + (F || field(P, 0.045, 0.20)) + ';' +
			(F ? '--surface-floating:' + F + ';--ldp-lift:' + F + ';' : '') + /* --ldp-lift: the theme's own shaded boxes take the card colour on other themes (panel.php) */
			/* A card is its paper by day and a step above it by night; the darker
			   the night paper, the further the step, because on a black paper a
			   card at three hundredths is no card at all (Terminal lifts its own
			   by twenty-four). */
			'--surface-raised:' + (dark ? shade(P, rise(P, 0.03, 0.24)) : P) + ';' +
			/* THE HOVER RUNG TAKES THE GUARD THE BUTTONS HAVE (1.4.97 / 0.56.39; Manuel, 2026-10-11, Cloth with the Cards colour
			   on the paper: "We lost the hover on the search results"). The Cards colour was the hover rung wherever a style had
			   one; a Cards colour within 1.15:1 of the paper made the rung the ground itself, and every room that does not
			   re-mix its rungs (the search palette) hovered in its own colour. liftRest's guard, since 2026-10-02 the buttons'
			   and the cards', holds here too: such a colour steps into the paper instead. Measured live: row and room both
			   #d4a27f before. */
			'--surface-hover:' + liftRest(F, P, Ig, dark) + ';' +
			'--surface-selected:color-mix(in srgb, ' + P + ', ' + Ig + ' var(--step-surface-selected, 10%));' +
			'--surface-pressed:color-mix(in srgb, ' + P + ', ' + Ig + ' var(--step-surface-pressed, 16%));' +
			'--surface-track:color-mix(in srgb, ' + P + ', ' + Ig + ' var(--step-surface-hover, 6%));' +
			'--surface-track-selected:color-mix(in srgb, ' + P + ', ' + Ig + ' var(--step-track-selected, 12%));' +
			(G ? '--ldp-ground:' + G + ';' : '') + /* another theme's second background (panel.php) */
			'--text-secondary:' + mix(Ig, P, 15) + ';--text-muted:' + mix(Ig, P, 25) + ';--text-subtle:' + mix(Ig, P, 61) + ';--text-disabled:' + mix(Ig, P, 72) + ';' +
			'--border-subtle:' + mix(P, Ig, 7) + ';--border-default:' + mix(P, Ig, 14) + ';--border-strong:' + mix(P, Ig, 29) + ';--border-control:' + mix(P, Ig, 52) + ';' +
			'--code-surface:' + (F && dark ? F : field(P, dark ? 0.06 : 0.04, 0.12)) + ';' + /* by night a set's own lift is the code's box too (2026-09-26, Gallery's black paper: the field came out #060606) */ '--code-plain:' + I + ';' +
			'--surface-inverse:' + I + ';--surface-inverse-subtle:' + mix(I, P, 10) + ';--text-inverse:' + P + ';--text-inverse-subtle:' + mix(P, I, 35) + ';--border-inverse:' + mix(I, P, 30) + ';' +
			'--ink-alpha-weak:rgb(from ' + I + ' r g b / 0.06);--ink-alpha-soft:rgb(from ' + I + ' r g b / 0.12);--ink-alpha-medium:rgb(from ' + I + ' r g b / 0.24);--ink-alpha-strong:rgb(from ' + I + ' r g b / 0.48);' +
			'--mode-swatch:' + P + ';' +
			'--toggle-knob-ink:' + (dark ? I : 'var(--surface-raised)') + ';' +
			/* THE LIFT IS A TOKEN OF THE SET, NOT A COLOUR PAINTED FROM THE ROOT (Manuel,
			   2026-10-08, the More menu on the inverted rail: the day's card colour under
			   the ground's white words). The lift rules below (pairCss) used to write the
			   side's card colour as a literal, keyed to the root's side, so a menu on a
			   ground wearing another set still took the root's card. Every set says its
			   own two lifts here, where the ground restates them (applyGround): the
			   surface a menu or a code block stands on, and the rung a quiet button or a
			   card rests on. A set without a card says the theme's own, so the rules
			   paint nothing the theme would not. */
			'--lift-surface:' + (F || 'var(--surface-raised)') + ';' +
			'--lift-rest:' + liftRest(F, P, I, dark) + ';' +
			graySteps(P, dark);
	}
	/* THE GRAY BUTTON'S OWN STEPS (0.56.15). A Gray button is a rung of its ground, never the Cards colour (below, THE GRAY BUTTON LEAVES THE CARDS). The rung is the system's 6 %, and on a paper near black it climbs the way a card does (rise): 6 % of white on black is no button. Hover and press keep their distance above the rest. */
	function graySteps(P, dark) {
		var L = hexToOklch(P).L;
		if (!dark || L >= 0.18) return '';
		var r = Math.round(rise(P, 0.06, 0.14) * 100);
		return '--gray-step:' + r + '%;--gray-step-hover:' + (r + 4) + '%;--gray-step-press:' + (r + 10) + '%;';
	}
	/* A LIFT TOO CLOSE TO THE PAPER IS NO BUTTON (2026-10-02; the cards too, 2026-10-08): where a
	   light side's card stands within 1.15:1 of its paper, the buttons and the cards rest a rung
	   into the paper instead. Without a card, the theme's own rest, the ground's hover rung. */
	function liftRest(F, P, I, dark) {
		if (!F) return 'var(--surface-hover)';
		return !dark && contrast(F, P) < 1.15 ? 'color-mix(in srgb, ' + P + ', ' + I + ' var(--step-surface-hover, 6%))' : F;
	}
	/* The cards that wear a set's lift and are only read (pairCss). */
	var LIFT_CARDS = ' :is(.support-box, .about-numbers, .release-panel, .release-archive-card, [data-quotes="box"] :is(.post-card.format-quote, .single-format-quote .single-post-article .wp-block-post-content) blockquote.wp-block-quote)'; /* a quote post is a card only while Quotes says Filled (2026-10-05) */
	function pairCss(side, c) {
		var P = c.paper, I = c.ink, dark = lum(P) < lum(I);
		var mix = function (a, b, pct) { return 'color-mix(in oklab, ' + a + ', ' + b + ' ' + pct + '%)'; };
		var k = pairLooks(c, side), G = k.G, F = k.F;
		var css = sideRule(side, '', '', pairBody(c, side)) +
			/* The switches read the scheme, not the side's name (Manuel, 2026-09-14, a
			   light paper on a pair's dark side: a black groove cut into it). */
			sideRule(side, '', ' .quire-segmented:not(:where(.reading-panel, .reading-panel *))', dark
				? '--groove-page:color-mix(in srgb, var(--interaction-surface, var(--surface-canvas)), var(--text-primary) var(--step-surface-hover, 10%));--chip-page:color-mix(in srgb, var(--interaction-surface, var(--surface-canvas)), var(--text-primary) var(--step-surface-pressed, 24%));'
				: '--groove-page:color-mix(in srgb, var(--interaction-surface, var(--surface-canvas)), var(--text-primary) var(--switch-groove, 10%));--chip-page:var(--surface-raised);');
		if (c.accent) css += accentCss(side, c.accent, P, I);
		/* THE LIFT STANDS ON THE PAPER: the buttons and the filled boxes rest on
		   it instead of on the paper's darker rung (hover, press, open and
		   pressed keep their own rungs, so a press still reads). Only with Fills
		   on; Fills off means no fill, whatever the set says. */
		/* WHAT ANSWERS THE POINTER AND WHAT DOES NOT (Manuel, 2026-09-26, the
		   support card on Storybook: "they have a hover now … I don't know if
		   that's intended"). It was not: the cards shared the buttons' list,
		   which lets go of the lift under the pointer so a button's own hover
		   shows, and a card that cannot be pressed turned grey when touched.
		   The buttons and the link card keep that; the cards that are only
		   read wear the lift always. The paper's corner squares join the
		   buttons (the same day: the collapse and comments squares stood grey
		   beside a white search and contents square). */
		/* A LIFT TOO CLOSE TO THE PAPER IS NO BUTTON (2026-10-02, the styles review; Manuel on Gallery: the share and .md buttons have "no background by default" and the hover "looks weird"). White on #f5f5f7 is 1.08:1, so the buttons looked bare and the pointer dropped them onto a grey darker than the paper. Where a light side's lift stands that close, the buttons and the corner squares rest a rung into the paper instead, the light grey a button on Apple's grey pages wears, and hover and press step on from there. THE CARDS TOO (2026-10-08, Manuel on Still: "the cards go away"): Still's white card on its #f2f2f4 paper is 1.08:1, so the link cards were all but gone at rest, and the hover, a rung mixed from that white, landed on the paper's own colour and the card vanished under the pointer. The link card, the field and the read-only cards now rest on the same rung as the buttons and step on from it. */
		/* READ AS TOKENS (2026-10-08): the set's own lifts, which a ground wearing another set restates (pairBody). */
		var B = 'var(--lift-rest)', LS = 'var(--lift-surface)', INK = 'var(--text-primary)';
		if (F) css += sideRule(side, ':not([data-fills="off"])', ' .post-link-card:not(:hover, :active, [aria-expanded="true"], [aria-pressed="true"]):not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener))', 'background-color:' + B + ';');
		if (F) css += sideRule(side, ':not([data-fills="off"])', ' .quire-badge:not(.comments-count):not(:hover, :active, [aria-expanded="true"], [aria-pressed="true"]):not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener))', 'background-color:' + B + ';');
		/* THE GRAY BUTTON LEAVES THE CARDS (0.56.15; Manuel, 2026-10-09, his mono style with a deep blue Cards colour on the themes archive: "by changing the card's color, it changes the buttons on that side. Something's wrong"). Since the lift the quiet buttons and the corner squares rested on the Cards colour, so a saturated card painted every Info, Demo and GitHub button and the squares in the corners, while the archive's cards, a rung of the paper, stayed grey. A Gray button is a rung of whatever it stands on (DS-365): the paper, or the card under it. So it rests on its ground's hover rung and steps on from there, as the theme's own rule says, and the Cards colour keeps the cards, the menus, the fields and the badges. The ground is read where the button stands, so a button on the archive card steps from the card. */
		var GROUND = 'var(--interaction-surface, var(--surface-base))';
		/* A FIELD IS NOT A CARD (0.56.23; Manuel, 2026-10-10, the rail's search pill on his mono style: "it's not visible if I'm not hovering over it"). The search field stood in the link card's rule above and wore the Cards colour, an absolute; on the rail, whose ground is lifted, that colour and the ground met and the pill vanished until the pointer's rung. A filled field rests on a rung of its own ground, the Gray button's, and steps on from there. */
		var GRAY = ' :is(.quire-button:not(.primary, .ghost, .comments-pill), .comments-open-btn, .paper-stack-btn, .rail-collapse-btn, .rail-collapse-corner .quire-icon-button, .rail-expand .quire-icon-button, .quire-search-field)';
		var grayRung = function (step, fall) { return 'background-color:color-mix(in srgb, ' + GROUND + ', var(--text-primary) var(' + step + ', var(' + fall + ')));'; };
		if (F) css += sideRule(side, ':not([data-fills="off"])', GRAY + ':not(:hover, :active, [aria-expanded="true"], [aria-pressed="true"]):not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener))', grayRung('--gray-step', '--step-surface-hover'));
		/* The collapse square says aria-expanded="true" while the rail is out, which is its state and not a press, so the corner squares keep their rest until the pointer. */
		if (F) css += sideRule(side, ':not([data-fills="off"])', ' :is(.rail-collapse-btn, .rail-collapse-corner .quire-icon-button, .rail-expand .quire-icon-button):not(:hover, :active):not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener))', grayRung('--gray-step', '--step-surface-hover'));
		/* THE HOVER STAYS ON THE LIFT (Manuel, 2026-09-26, the link card and the
		   corner squares on Storybook's green: "that feels a little bit intense,
		   that hover"; A, "white cards", a very light grey under the pointer).
		   Letting go of the lift dropped them onto the paper's rungs, a muddy
		   darker green. Now the pointer, the open state and the press are the
		   system's own rungs mixed from the lift instead of the paper, so white
		   turns a light grey (half a rung, 3 %, could not be seen on white). */
		var NOT_PANEL = ':not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener))';
		var rung = function (step, from) { return 'background-color:color-mix(in srgb, ' + (from || B) + ', ' + INK + ' var(' + step + '));'; };
		if (F) {
			var LIFTED_CARD = ' .post-link-card'; /* the field left for the Gray rung (0.56.23) */
			var LIFTED = ' :is(a, button).quire-badge:not(.comments-count)'; /* a badge that is only a label (the comment's Author) has no hover, no press: only one that is a link or a button steps on from its lift */
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
		/* A BUTTON ON A CARD STANDS A RUNG ABOVE IT (Manuel, 2026-09-26, Storybook:
		   "the buttons ??? fix it everywhere"). The card and its buttons both wore
		   the lift, white on white, so the Gray buttons, badges and fields inside a
		   lifted card, a code block or a menu rest one rung up from the lift and
		   step on from there, the system's own rule for a button on a card. */
		if (F) {
			var ON_CARD = ' :is(' + LIFT_CARDS + ', .single-post-article .wp-block-post-content .code-block, .quire-menu, .rail-more-menu, .rail-more-sub, .paper-stack-menu) :is(.quire-button:not(.primary, .ghost, .comments-pill), .quire-badge:not(.comments-count), .quire-search-field)' + NOT_PANEL;
			css += sideRule(side, ':not([data-fills="off"])', ON_CARD, rung('--step-surface-hover', B));
			var ON_CARD_PRESS = ON_CARD.replace('.quire-badge:not(.comments-count)', ':is(a, button).quire-badge:not(.comments-count)'); /* a label badge has no hover or press */
			css += sideRule(side, ':not([data-fills="off"])', ON_CARD_PRESS.replace(')' + NOT_PANEL, '):hover' + NOT_PANEL), rung('--step-surface-selected', B));
			css += sideRule(side, ':not([data-fills="off"])', ON_CARD_PRESS.replace(')' + NOT_PANEL, '):active' + NOT_PANEL), rung('--step-surface-pressed', B));
		}
		/* THE CODE BLOCK STANDS ON IT TOO (Manuel, 2026-09-26, Storybook's green
		   paper: the block was a darker green with teal and green code on it, hard
		   to read). The block names its ground once (--interaction-surface) and its
		   controls and its fade read it, so the lift goes there, not on the fill. */
		if (F) css += sideRule(side, ':not([data-fills="off"])', ' .single-post-article .wp-block-post-content .code-block', '--interaction-surface:' + LS + ';');
		/* And the menus stand on it, as the reference's white bar stands on its
		   green: their rows' hover, press and switches are mixed from it. */
		if (F) css += sideRule(side, '', ' :is(.quire-menu, .rail-more-menu, .rail-more-sub, .paper-stack-menu, .quire-tooltip-bubble):not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener))', 'background-color:' + LS + ';--interaction-surface:' + LS + ';');
		/* THE RAIL'S QUIET WORDS ARE MIXED FROM ITS OWN GROUND: mixed from the
		   paper they came out sand-grey on the green. */
		/* As tokens (2026-10-08): on an inverted rail the ground's own ink and ground, not the root side's. */
		if (G) css += sideRule(side, '', ' .sidebar-column', '--text-subtle:' + mix(INK, 'var(--surface-navigation)', 45) + ';--text-muted:' + mix(INK, 'var(--surface-navigation)', 25) + ';');
		return css;
	}
	function accentCss(side, A, P, I) {
		return sideRule(side, ':not([data-accent="off"])', '', accentBody(A, P, I));
	}
	/* THE WRITING ON A FILLED COLOUR (2026-10-08, twice). Paper or ink: on a dark fill the lighter
	   of the two, on a light fill the darker, whenever that one reads on the fill (a contrast of
	   2.5 or more); only below that the other. Pure contrast had put the dark paper on Still's
	   bright blue (4.6 against the soft white ink's 2.8), a look nobody sets by hand. The first
	   mend "prefer the ink" was wrong on a light page, where the ink is black: a dark blue button
	   got black writing (0.56.1, Manuel: "those buttons look wrong"). The floor is 2.5, not 3,
	   because a style's ink is seldom pure white or black (Still's is #f5f5f7). */
	function writingOn(X, P, I) {
		if (!(P && I)) return lum(X) > 0.35 ? '#111111' : '#ffffff';
		var darkFill = lum(X) <= 0.35, lighter = lum(P) >= lum(I) ? P : I, darker = lighter === P ? I : P;
		var want = darkFill ? lighter : darker, other = want === P ? I : P;
		return contrast(X, want) >= 2.5 ? want : other;
	}
	/* THE WRITING ON A HOVERED LINK (2026-10-09, Manuel on his mono style's pink links, "the link, when
	   hovered, should have the most contrast ... white on the pink"): the wash and bold link marks fill
	   with the accent under the pointer, and their words took the buttons' writing, the style's own ink
	   or paper, which on his pink scored 2.6. Pure white on a dark fill, pure black on a light one, the
	   fill's own darkness deciding at 0.35 as everywhere else. The buttons keep the ink and paper. */
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
	/* A COLOUR SET BY HAND LETS THE PRESET GO (2026-09-26, found with the Ground
	   row on Storybook: a chip under Custom threw the page back to Preset). A
	   preset the TWEAK named simply goes; a preset the RECIPE names has to be
	   masked with the empty string, as setCustom masks it, or presetOf() finds
	   the recipe's again and Custom is gone with the next press. */
	/* AND IT KEEPS THE PRESET'S COLOURS AS ITS START (2026-10-05): masking the recipe's preset took its paper, ink and accent with it, so a card set by hand on Folio threw the page back to white. They are written into the tweak first, as setCustom writes them; what is already there stays. */
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
	/* A STYLE'S COLOURS AS A RECORD KEEPS THEM (2026-10-05, Manuel: "the other styles we made don't have a preset"):
	   saving wrote the preset's colours out and forgot its name, so after the first save no tile was ticked and a
	   preset chosen later sat under the old ground and cards. Now the name, and of the colours only those that
	   differ from it (a soft text or a button set beside it). Written onto `into`: export, Save As and Update. */
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
	/* TINT THE GREYS (PICKS `greytint`, the extras, 2026-09-29): the paper takes a
	   third of the share of the accent and every grey is mixed from an ink that
	   takes the whole share, so the page leans toward the accent while the ink
	   itself, and with it the reading contrast, stays. Only where the style's
	   pair and accent are known here; a style without its own colours keeps the
	   system's greys. The mix is Oklab's, as the stylesheet's color-mix. */
	function mixHex(a, b, w) {
		var x = hexToOklch(a), y = hexToOklch(b), lab = function (o) { return [o.L, o.C * Math.cos(o.h), o.C * Math.sin(o.h)]; };
		var p = lab(x), q = lab(y), m = [0, 1, 2].map(function (i) { return p[i] + (q[i] - p[i]) * w; });
		return oklchToHex({ L: m[0], C: Math.sqrt(m[1] * m[1] + m[2] * m[2]), h: Math.atan2(m[2], m[1]) });
	}
	/* WHICH SIDES WEAR THEIR GROUND AROUND THE PAPER (the dark ground, 2026-10-03): a side whose
	   Ground stands across from its paper. Read from the colours as they are now. */
	function groundSides(c) {
		c = c || coloursResolved();
		var out = {};
		['light', 'dark'].forEach(function (side) { out[side] = groundFlip(c[side].ground, c[side].paper || paperNow(side), c[side].ink); });
		return out;
	}
	/* The ground worn around the paper, and the words, lines and links on it: the other side's own
	   set where the ground is that side's own ground (so a dark ground by day that is the night's
	   reads exactly as the night), else a set made from the ground alone, its ink whichever reads
	   best on it, its accent fitted to it. A ground in the middle, where no ink reads at 4.5:1, is
	   drawn a little further toward its end until one does (the colour kept stays as chosen). */
	var GROUND_NUDGED = { light: false, dark: false };
	function groundSet(c, side) {
		var other = side === 'light' ? 'dark' : 'light', o = c[other], G = c[side].ground;
		var oCanvas = o.ground && !groundFlip(o.ground, o.paper || paperNow(other), o.ink) ? o.ground : o.paper ? sink(o.paper, 0.05) : canvasOf(other);
		GROUND_NUDGED[side] = false;
		if (String(G).toLowerCase() === String(oCanvas).toLowerCase() || String(G).toLowerCase() === String(o.paper || paperNow(other)).toLowerCase()) return null; /* the other side's own */
		var inks = [o.ink || inkOf(other), c[side].paper || paperNow(side), '#ffffff', '#111111'];
		var best = function (g) { return inks.reduce(function (b, x) { return contrast(x, g) > contrast(b, g) + 0.5 ? x : b; }); };
		var GP = G, GI = best(GP);
		if (contrast(GI, GP) < 4.5) {
			var og = hexToOklch(GP), toDark = lum(GP) < 0.18;
			for (var i = 0; i < 40 && contrast(GI, GP) < 4.5; i++) { og.L = Math.max(0, Math.min(1, og.L + (toDark ? -0.015 : 0.015))); GP = oklchToHex(og); GI = best(GP); }
			GROUND_NUDGED[side] = true;
		}
		var GA = accentForPaper(o.accent || c[side].accent || GI, GP); /* no accent of the style's own: its words' colour, as the dark ground's own colour drew it */
		return pairBody({ paper: GP, ink: GI, ground: GP }, lum(GP) < lum(GI) ? 'dark' : 'light') + accentBody(GA, GP, GI);
	}
	/* A WELL SET ON BOTH SIDES AT ONCE ('' clears it): the highlighter's pens are the same on both. */
	function setBothSides(key, hex) {
		var all = readTweaks(), entry = all[current] || {}, s = byId(current);
		entry.colours = entry.colours || {};
		['light', 'dark'].forEach(function (side) {
			var c = entry.colours[side] = entry.colours[side] || {};
			delete c[COLOUR_ENGINE[key]];
			if (hex) c[key] = hex.toLowerCase();
			else if (s && s.colours && s.colours[side] && (s.colours[side][key] || s.colours[side][COLOUR_ENGINE[key]])) c[key] = ''; /* masks the saved style's own */
			else delete c[key];
			if (!Object.keys(c).length) delete entry.colours[side];
		});
		if (!Object.keys(entry.colours).length) delete entry.colours;
		if (Object.keys(entry).length) all[current] = entry; else delete all[current];
		writeTweaks(all);
		applyColours(); mark();
	}
	/* WHAT THE COLOURS STAMP (2026-10-03): the dark ground on the side that wears one, and the highlighter. */
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
		/* A GROUND OR A CARD ALONE STANDS ON THE PAIR'S OWN PAPER AND TEXT (2026-10-03: no Custom switch
		   writes them first any more), which is what that switch wrote: the page's own. A dark ground
		   alone needs no pair: it is worn around the paper. */
		['light', 'dark'].forEach(function (side) {
			var v = c[side];
			if ((v.paper && v.ink) || !((v.ground && !groundFlip(v.ground, v.paper || paperNow(side), v.ink)) || v.lift)) return;
			if (!v.paper) v.paper = paperNow(side);
			if (!v.ink) v.ink = inkOf(side);
		});
		var flips = groundSides(c);
		/* A GROUND ON ITS OWN SIDE THE WORDS CANNOT READ ON (a middle grey): drawn a shade further from
		   them until they do, as the dark ground's own set is; the colour kept stays as chosen. */
		['light', 'dark'].forEach(function (side) {
			var v = c[side]; GROUND_NUDGED[side] = false;
			if (!v.ground || flips[side] || !v.ink) return;
			var o = hexToOklch(v.ground), toLight = lum(v.ink) < lum(v.ground), i = 0;
			while (contrast(v.ink, v.ground) < 4.5 && i++ < 60) { o.L = Math.max(0, Math.min(1, o.L + (toLight ? 0.01 : -0.01))); v.ground = oklchToHex(o); GROUND_NUDGED[side] = true; }
		});
		['light', 'dark'].forEach(function (side) {
			var v = c[side];
			if (v.paper && v.ink) css += pairCss(side, v);
			else if (v.accent) css += accentCss(side, v.accent, null, null); /* an accent alone: its ink by its own lightness, the pair's paper unknown here */
			/* THE BUTTON'S OWN COLOUR: two tokens on the root, spent by style.css
			   under data-button="own" on the filled controls alone (their writing
			   is whichever of paper and ink holds better on it, as the accent's). */
			if (v.button) css += sideRule(side, '', '', buttonBody(v.button, v.paper || null, v.ink || null));
			/* THE BUTTON'S COLOUR ON A CARD OF THE SAME COLOUR (Manuel, 2026-09-26,
			   Storybook's white button on its white support card): where the
			   button's own colour cannot be told from the lift, the filled button
			   on a lifted card wears the paper instead, or the ink when the paper
			   stands too close to the card as well. */
			if (v.button && v.paper && v.ink) {
				var LF = pairLooks(v, side).F;
				if (LF && contrast(v.button, LF) < 1.3) css += sideRule(side, ':not([data-fills="off"])', LIFT_CARDS, buttonBody(contrast(v.paper, LF) >= 1.3 ? v.paper : v.ink, v.paper, v.ink));
			}
			/* THE ROLES' OWN COLOURS: one token each, spent by the role's colour token (applyRoles). */
			if (v.title) css += sideRule(side, '', '', '--head-own-colour:' + v.title + ';');
			if (v.headings) css += sideRule(side, '', '', '--headings-own-colour:' + v.headings + ';');
			['body', 'quote', 'interface', 'code'].forEach(function (r) { if (v[r]) css += sideRule(side, '', '', '--' + r + '-own-colour:' + v[r] + ';'); });
			/* SOFT TEXT'S OWN COLOUR: the small text's rung, said on body as the small text's softness was */
			if (v.muted) css += sideRule(side, '', '', '--ldp-muted:' + v.muted + ';') + sideRule(side, '', ' body', '--text-muted:' + v.muted + ';--wp--preset--color--text-muted:' + v.muted + ';--ldp-muted:' + v.muted + ';'); /* on the root too: a role's colour is resolved there */
			/* (--ldp-field, the ground's colour for Aperitivo's awning, left with that style; nothing reads it) */
			/* THE PEN OF YOUR OWN (2026-09-26): the pen and the ink read over it (dark on a
			   light pen, light on a dark one). */
			if (v.marker && !penOf(v.marker)) css += sideRule(side, '[data-marker-colour="own"]', '', markerBody(v.marker)); /* a named pen is the stylesheet's own */
			if (v.meta) css += sideRule(side, '', '', '--kicker-own-colour:' + v.meta + ';');
		});
		/* THE DARK GROUND'S OWN COLOURS: the night side on the ground, the day
		   side given back to the paper (see THE DARK GROUND). */
		if (c.light.paper && c.light.ink && c.dark.paper && c.dark.ink) {
			var on = 'html:root[data-colours="on"]';
			css += on + ' .ground-dark{' + pairBody(c.dark, 'dark') + (c.dark.accent ? accentBody(c.dark.accent, c.dark.paper, c.dark.ink) : '') + '}' +
				on + ' .ground-light{' + pairBody(c.light, 'light') + (c.light.accent ? accentBody(c.light.accent, c.light.paper, c.light.ink) : '') + '}';
		}
		/* THE DARK GROUND'S OWN COLOURS (2026-09-28, as a colour since 2026-10-03): a ground made from
		   its colour alone, on its own side only (both sides may wear one). */
		['light', 'dark'].forEach(function (side) {
			if (!flips[side]) return;
			var body = groundSet(c, side);
			if (body) css += sideRule(side, '[data-darkground="on"]', side === 'light' ? ' .ground-dark' : ' .ground-light', body);
		});
		/* A DARK ROOM ON THE PAGE TAKES THE STYLE'S NIGHT ACCENT (2026-09-26,
		   Manuel, the newsletter page's Subscribe in the tint's orange while the
		   style had its own colours: "not really connected to the styles"). The
		   theme's night page is Neutral dark as a class, and its accent rules read
		   the TINT (:root[data-tint] .newsletter-night), which a style's own colours
		   never reach. Any neutral dark room on the page, outside the panel, now
		   takes the style's dark-side accent, its writing by the accent's own
		   lightness and its muted rung mixed from the room's own ground. */
		if (c.dark.accent) css += 'html:root[data-colours="on"]:not([data-accent="off"]) .theme-neutral-dark:not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener)){' + accentBody(c.dark.accent, null, null) + '}';
		var el = document.getElementById(COLOURS_STYLE);
		if (!el && css) { el = document.createElement('style'); el.id = COLOURS_STYLE; (document.head || root).appendChild(el); }
		if (el && el.textContent !== css) el.textContent = css;
		if (typeof markerInk === 'function' && document.readyState !== 'loading') markerInk(); /* your own paper may have changed under the pen */
		if (css) { if (root.getAttribute('data-colours') !== 'on') root.setAttribute('data-colours', 'on'); }
		else root.removeAttribute('data-colours');
		if (root.hasAttribute('data-darkground')) applyColourStamps(); /* once the options have been stamped: a colour moved may move the ground and the pen */
		/* AN ACCENT YOU PICKED, SAID ON THE ROOT FOR A GUEST (2026-09-24, the audit: on
		   Twenty Twenty-Five the article's links wear the text colour, so an accent
		   had nothing to show on). The guest sheet colours the article's links with it. */
		/* The style's own accent counts as well as an unsaved one (2026-10-01, the panel audit): once saved or published the tweak was gone and the links went back to the text colour while the accent was still set. */
		var tw = (readTweaks()[current] || {}).colours || {}, rec = (byId(current) || {}).colours || {};
		var ownAccent = window.architravePanelGuest && ((tw.light && tw.light.accent) || (tw.dark && tw.dark.accent) || (rec.light && rec.light.accent) || (rec.dark && rec.dark.accent));
		if (ownAccent) root.setAttribute('data-accent-own', ''); else root.removeAttribute('data-accent-own');
	}
	/* THE DARK GROUND (Manuel, 2026-09-26, for Specimen: "yes" to the reference's
	   black band at the foot, a light page ending on rounded corners over it).
	   Architrave has no foot: its page is the paper lying on a ground, the rails
	   on the ground beside it. So the switch hands the GROUND the style's night
	   side and gives the paper its day side back: the body wears the dark
	   pair's class (every pair is written for `:root[data-theme=…]` AND
	   `.theme-…`, so a pair can be worn by one element, as the panel wears
	   its own), the paper and the buttons on its corners wear the light one.
	   By day only (by night it is all dark already), and only while the frame
	   is drawn: on a phone there is no ground to see, and the body's class
	   would darken the whole page. Your own colours follow through the
	   `.ground-dark` / `.ground-light` rules applyColours writes. On other
	   themes the guest sheet darkens the footer instead (panel-page.css). */
	/* WHAT THE READING TEXT'S AND THE DATE'S PENS MARK IS READ IN THE BETTER OF
	   PAPER AND INK (2026-09-26). The date's rung is half see-through on some
	   pairs (Standard: the ink at 50 %), and paper letters on it stood at 3.2:1
	   by day; on Terracotta the paper holds and the ink does not. So the pen is
	   read as it is drawn, over the paper, and the one of the two that stands
	   higher on it writes the marked words and the selection.
	   AND THE WASH MOVES UNTIL THEY READ (Manuel, 2026-09-26, "yes" to a softer
	   wash for the date's pen). Neither held 4.5:1 on a mid-tone pen (Standard
	   by night, 3.1:1). The bar keeps the pen; the wash behind marked words
	   steps away from the letters, toward the paper for ink letters or toward
	   the ink for paper letters, until they read at 4.5:1, and of the two the
	   one that moves the least is taken, so the wash stays nearest the pen. */
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
			new MutationObserver(markerInk).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-marker', 'data-style', 'data-colours', 'data-preset', 'data-marker-colour', 'data-soft', 'data-soft-level', 'data-quiet-level', 'data-small-soft', 'style'] }); /* the last five for the text and date pens' ink (markerInk) */
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
		/* AND BY NIGHT THE OTHER WAY ROUND (pick nightground, Manuel 2026-10-01 on
		   the lab's live Brochure page: "it would be cool if now the rail would also
		   be inverted, like the light version again"; live 2026-10-02): with
		   Inverted, the rail and the ground take the day's colours beside the
		   night's paper. Architrave's framed page only; a guest's foot stays dark. */
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
		/* A GUEST'S FOOT WORE THE NIGHT until 2026-10-03; the ground is a colour now, and another
		   theme's second background shows it where the theme has one (panel.php). */
		if (GUEST) return;
		if (!body.classList.contains('has-frame') || (GROUND_WIDE && !GROUND_WIDE.matches)) return;
		wear(body, night, 'ground-dark');
		Array.prototype.forEach.call(document.querySelectorAll(ON_PAPER), function (el) { wear(el, day, 'ground-light'); });
	}
	/* EVERYTHING THAT STANDS ON THE PAPER WITHOUT LIVING IN IT (Manuel,
	   2026-09-26: "the buttons in the top left change their color depending
	   on whether the rail is closed or open"). The corner squares are pinned
	   over the paper but printed outside it (wp_footer), so they inherit the
	   ground, not the paper, and each one has to wear the day by name. The
	   list named the collapse square and forgot the two that take its place
	   while the rail is away, the expand square and its search: shut, they
	   stood in the night's colours on a day paper. Any new square pinned on
	   the paper goes on this list, or it wears the ground. */
	var ON_PAPER = '.frame-paper, .paper-stack, .rail-collapse-corner, .rail-expand, .comments-open';
	(function () {
		var go = function () {
			applyGround();
			new MutationObserver(applyGround).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-darkground', 'data-night-ground'] });
			if (GROUND_WIDE) { if (GROUND_WIDE.addEventListener) GROUND_WIDE.addEventListener('change', applyGround); else GROUND_WIDE.addListener(applyGround); }
		};
		/* THE GROUND IS WORN AS THE PAGE ARRIVES, NOT WHEN IT HAS (Manuel,
		   2026-10-01: "it shows the light rail for a second and then it switches
		   to dark"). The root wears data-darkground from the head, but the
		   classes that carry the night are worn by the body and the paper, which
		   the head cannot reach; waiting for DOMContentLoaded let the browser
		   paint the whole page with a light ground first. So from the head an
		   observer watches the parser: the body as soon as it opens, each part
		   on ON_PAPER (and a guest's footer) as it is added. Mutation callbacks
		   run before the next paint, so the first paint already wears both
		   sides. Handed to the ordinary observer at DOMContentLoaded. */
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
	/* The pair's own paper on a side, for the readouts and an accent set alone: the registry's swatch. */
	function paperOf(side) {
		var pal = String(root.getAttribute('data-theme') || (Modes ? Modes.default : 'neutral-light')).split('-')[0];
		var m = ((Modes && Modes.modes) || []).filter(function (x) { return x.palette === pal && x.side === side; })[0];
		return (m && m.swatch) || (side === 'dark' ? '#373737' : '#ffffff'); /* Neutral's day paper is white since 2026-09-19 */
	}
	applyColours();

	function now() {
		var mode = root.getAttribute('data-theme') || (Modes ? Modes.default : 'neutral-light');
		return {
			palette: String(mode).split('-')[0],
			reading: root.getAttribute('data-reading') || 'default',
			/* ON A GUEST, NO FACE IS THE HOST'S FACE (2026-09-22), not Newsreader:
			   a guest writes data-face for every chosen face including the
			   default (reading-face.js), so its absence is a page nobody has
			   touched, and a bare tile records that as 'host' so a save keeps
			   the host's face and a later press of Newsreader is a choice. */
			face: root.getAttribute('data-face') || (window.architravePanelGuest ? 'host' : 'newsreader'),
			leading: root.getAttribute('data-leading') || 'default'
		};
	}
	function same(a, b) {
		var v = function (o, d) { return o[d] === undefined && d === 'palette' ? 'neutral' : o[d]; }; /* a record of the seven colours names no pair: the one left (2026-10-03) */
		return DIALS.every(function (d) { return v(a, d) === v(b, d); });
	}
	// The dials a style wants: its recipe, or the reader's own version of it.
	function wanted(s) {
		var tw = readTweaks()[s.id];
		var out = {};
		DIALS.forEach(function (d) { out[d] = (tw && tw[d]) || s[d]; });
		if (!out.palette) out.palette = 'neutral'; /* the one pair left (2026-10-03): a record of the seven colours names none */
		return out;
	}

	function press(selector) {
		var row = document.querySelector(selector);
		if (row) row.click();
	}
	/* ONE LOOK DISSOLVES INTO THE NEXT (Manuel, 2026-09-22, pointing at the
	   light/dark switch on jakubantalik.com: "can we make a transition between
	   the tiles like on the inspiration"). The browser's own view transition
	   does it: it photographs the page, lets the change happen, and cross-fades
	   the two. Nothing in this file has to know what moved, which is the point,
	   because a look moves everything at once. Where the browser has no such
	   thing, or the reader has asked for less motion, the change simply happens
	   as it always did. */
	function slowly(change) {
		var quiet = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (quiet || !document.startViewTransition) { change(); return; }
		try {
			var t = document.startViewTransition(change);
			/* A transition the browser decides to skip rejects its promise; that is
			   not a fault and the change has happened either way. */
			if (t && t.finished && t.finished.catch) t.finished.catch(function () {});
			if (t && t.updateCallbackDone && t.updateCallbackDone.catch) t.updateCallbackDone.catch(function () {});
			if (t && t.ready && t.ready.catch) t.ready.catch(function () {});
		} catch (e) { change(); }
	}
	var applying = false, applyTimer = null;
	function apply(s, dials) {
		if (s && s.host) { goHome(); return; } /* not a look: see THE THEME'S OWN LOOK above */
		slowly(function () { window.architraveRestyling = true; try { applyNow(s, dials); } finally { window.architraveRestyling = false; } }); /* color-mode.js swaps the palette inside this fade instead of starting a second one (2026-10-02) */
	}
	function applyNow(s, dials) {
		if (versionTimer && s && s.id !== current) versionNow();
		if (siteSaveTimer && s && s.id !== current) siteSaveNow(); /* SHOWN IS SHOWN: what waits goes out before the style changes */
		applying = true;
		stamp(s.id);
		press('[data-quire-modes="palette"] [data-palette="' + dials.palette + '"]');
		/* THE SIDE IS THE READER'S, NEVER THE STYLE'S (Manuel, 2026-09-12: "I
		   change my mind … whatever is set up on that colour mode, that is
		   what we see"). From 2026-09-11 to this morning a style pressed a
		   side of its own (Terminal dark, Book and Poster light); now the
		   Hell/Dunkel/System switch alone says which side every style shows,
		   and it rests on System, so a first visit reads the device. */
		press('[data-reading-step="' + dials.reading + '"]');
		/* A BARE TILE (saved from the theme's own look, a guest) whose face is
		   'host' presses no reading face: nothing was chosen when it was saved,
		   and the article stays in the theme's own until the reader picks one.
		   One saved with a face chosen (Vollkorn under the theme's own look, then
		   Save) carries it like any tile (2026-09-22; until then every bare tile
		   lost the face it was saved with). */
		if (s.bare && dials.face === 'host') { root.removeAttribute('data-face'); try { localStorage.removeItem('architrave-face'); } catch (e) { /* private mode */ } }
		else press('[data-face-choice="' + dials.face + '"]');
		press('[data-leading-step="' + dials.leading + '"]');
		/* THE GUARD HOLDS UNTIL THE PAIR HAS LANDED (the audit, 2026-09-13):
		   color-mode.js swaps the palette inside a view transition after the
		   press returns, so a guard cleared here let the observer record the
		   OLD pair against the new style for one beat, and for good where no
		   palette row exists. The data-theme record clears it; a timer does
		   where nothing ever lands. */
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

	/* A READER'S PRESS ON A DIAL IS A TWEAK OF THE STYLE THAT IS ON. Recorded
	   from the press itself, once the dial's own script has answered it, and
	   never from a change the page made on its own. */
	function remember() {
		var s = byId(current), all = readTweaks(), dials = now();
		if (!s || s.host) return; /* the theme's own look is not a look, so a press under it is the dial's own and no tweak of a tile (a guest, 0.9.0) */
		/* EVERYTHING THAT IS NOT A DIAL TRAVELS WITH THE RECORD (Manuel,
		   2026-09-16: the colours went back to the style's own the moment he
		   changed sides). This rebuilt the record from a hand-written list of
		   keys, and the keys added since — the colours, the chain between the
		   sides, the pictures, the drop cap's height — were not on it, so a
		   dial's press, or the side switch the observer reads as one, dropped
		   them. The whitelist the record is read through says what a record
		   holds; the dials are set here, the rest is carried over. */
		var entry = {}, held = all[s.id] || {};
		TWEAK_KEYS.forEach(function (k) { if (DIALS.indexOf(k) === -1 && held[k] !== undefined) entry[k] = held[k]; });
		/* and the roles' version (2026-10-07): TWEAK_KEYS has no `architrave`, so a press dropped it and the next read took
		   roles of the seven for the old eight (a title on its own became the old Interface titles and lost its size) */
		if (entry.roles && held.architrave) entry.architrave = held.architrave;
		if (!same(dials, s)) DIALS.forEach(function (d) { entry[d] = dials[d]; });
		if (Object.keys(entry).length) all[s.id] = entry; else delete all[s.id];
		/* Nothing written when nothing changed (the audit): the observer
		   calls this on every attribute echo. */
		if (JSON.stringify(all) !== JSON.stringify(readTweaks())) writeTweaks(all);
		applyOptions(); /* the lines follow the pair (2026-09-12) */
		mark();
	}

	// Book joined 2026-09-09 (1.1.647), the first style made properly and seen
	// live; Terminal 2026-09-11 (1.1.815), after two days on the backstage.
	// STANDARD ALONE since 2026-09-20 (Manuel: "Let's hide all the tiles except
	// standard"). The others stay in STYLES, so a stored choice and a link still
	// find them. Was: ['standard', 'book', 'large',
	// 'console', 'terminal', 'blueprint']. Instrument (2026-09-20) arrived hidden and was shown an hour later.
	// The backstage door (`?backstage`, 2026-09-09 to 2026-09-25) is gone: it was
	// the working preview of hidden tiles, and whoever may publish sees every
	// tile since 0.9.8, so it had nothing left to open.
	var SHOWN = ['standard']; /* the one left on 2026-10-02 (archive/styles); the earlier lists are in the tags styles-archive-0.15.58 and 0.16.0 */

	/* THE MARKS: the style that is on carries the check, and "adjusted" after
	   its name while the dials are off its recipe. The way back shows while
	   anything is off Standard's rest. */
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

	/* WHAT THE READING PANEL READS (2026-09-09): the list, which of it is
	   offered, and the two things <html> does not say, whether a style has
	   been tweaked and the way to put it back. */
	/* VERSIONS (2026-09-27, Manuel chose "Last 20"; the prototype's page): a style's
	   earlier states, kept as its owner works, to look at on the page and bring back.
	   Every version is the whole style as a record, the one Copy Style makes, so it
	   still means the same after the style is saved or published again. This browser
	   keeps them as you work: after a quiet minute, before another style is put on,
	   and when the page is left; the twenty newest per style. The site keeps the
	   records a publish replaced (inc/site-styles.php). The theme's own look has
	   none: it is the theme as it is. */
	var VERSIONS_KEY = 'architrave-versions', VERSIONS_KEEP = 20, versionTimer = 0, versionFor = '', previewing = null;
	function readVersions() { try { var v = JSON.parse(localStorage.getItem(VERSIONS_KEY) || '{}'); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; } catch (e) { return {}; } }
	function versionSoon() { if (previewing || READER) return; /* readers never see Versions, so their browsers keep none */ clearTimeout(versionTimer); versionFor = current; versionTimer = setTimeout(function () { versionTimer = 0; if (versionFor === current) keepVersion(); }, 60000); }
	function versionNow() { if (!versionTimer) return; clearTimeout(versionTimer); versionTimer = 0; if (versionFor === current) keepVersion(); }
	/* the record without the words that are not the look */
	function lookOf(rec) { var o = {}; Object.keys(rec || {}).forEach(function (k) { if (k !== 'architrave' && k !== 'label' && k !== 'base' && k !== 'id') o[k] = rec[k]; }); return o; }
	/* The style as it was saved or published, as a record: its changes set aside for a moment, nothing written. */
	function savedRecord() {
		var raw = null; try { raw = localStorage.getItem(TWEAKS_KEY); } catch (e) { return null; }
		var all = readTweaks(); if (!all[current]) return lookOf(JSON.parse(window.ArchitraveStyles.exportStyle() || '{}'));
		delete all[current];
		try { localStorage.setItem(TWEAKS_KEY, JSON.stringify(all)); } catch (e) { /* as above */ }
		var out = lookOf(JSON.parse(window.ArchitraveStyles.exportStyle() || '{}'));
		try { if (raw === null) localStorage.removeItem(TWEAKS_KEY); else localStorage.setItem(TWEAKS_KEY, raw); } catch (e) { /* as above */ }
		return out;
	}
	function keepVersion() {
		var s = byId(current); if (!s || s.host || previewing || READER) return false;
		var all = readVersions(), list = Array.isArray(all[s.id]) ? all[s.id] : [], rec = lookOf(JSON.parse(window.ArchitraveStyles.exportStyle() || '{}'));
		if (list[0] && JSON.stringify(list[0].record) === JSON.stringify(rec)) return false;
		if (!list.length && JSON.stringify(savedRecord()) === JSON.stringify(rec)) return false; /* nothing changed yet */
		list.unshift({ t: Date.now(), record: rec }); if (list.length > VERSIONS_KEEP) list.length = VERSIONS_KEEP;
		all[s.id] = list;
		try { localStorage.setItem(VERSIONS_KEY, JSON.stringify(all)); } catch (e) { /* full or private: the versions are a help, not the style */ }
		return true;
	}
	/* WHAT MAKES THIS STYLE LOOK LIKE A RECORD: the changes over its saved self that
	   turn the one into the other. A key the record does not name stays as saved. */
	function entryFromRecord(rec) {
		var base = liftLeading(JSON.parse(JSON.stringify(savedRecord() || {})), true), e = {}, J = JSON.stringify;
		rec = liftLeading(JSON.parse(JSON.stringify(rec || {})), true); /* the body's line spacing back onto its dial */
		['spaceInside', 'spaceItems', 'spaceSections', 'spaceTitle'].forEach(function (k) { if (typeof rec[k] === 'number') rec[k] = String(rec[k]); }); /* the four jobs' sizes may come as numbers */
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
		/* A RECORD NAMES ITS PRESET (2026-10-05, writeColours): another preset than the saved one comes as a reader's
		   choice comes, its colours written out with the record's own over them; none where the saved style names one
		   masks it, and the record's colours, which are then all of them, stand alone. */
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
	/* written without a step of Undo: a look at a version is not a change */
	function writeQuiet(all) { var was = undoing; undoing = true; writeTweaks(all); undoing = was; }
	function endPreview() {
		if (!previewing) return false;
		var p = previewing; previewing = null;
		try { if (p.raw === null) localStorage.removeItem(TWEAKS_KEY); else localStorage.setItem(TWEAKS_KEY, p.raw); } catch (e) { /* as above */ }
		var s = byId(p.id); if (s) applyNow(s, wanted(s));
		return true;
	}
	window.addEventListener('pagehide', function () { endPreview(); versionNow(); });

	/* One write to the route; the state that comes back replaces the site's
	   list in place, so the tiles and the default are what the server holds. */
	/* ONLY THE NEWEST ANSWER IS TAKEN (2026-09-28): the site's settings come back whole with every answer, and on a
	   slow server an older answer arrived after a newer change and put the old settings back (Aurora came back on,
	   the band went back). An answer overtaken by a later request is left; the later one brings the settings. */
	var SENT = 0;
	function sendSite(body) {
		if (!PUBLISH || !PUBLISH.url || !window.fetch) return Promise.reject(new Error('cannot publish'));
		var mine = ++SENT;
		return fetch(PUBLISH.url, {
			method: 'POST', credentials: 'same-origin', keepalive: true, /* a save sent as the page is left still arrives (0.31.0) */
			headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': PUBLISH.nonce },
			body: JSON.stringify(body)
		}).then(function (r) { return r.json().then(function (j) { if (!r.ok) { var e = new Error((j && j.message) || r.status); e.said = !!(j && j.code && j.message); throw e; } return j; }); }) /* `said`: a sentence the site wrote for the owner (in their language), which the window may show as it is */
		.then(function (state) { if (mine === SENT) { takeSite(state); renderHosts(); } return state; });
	}

	window.ArchitraveStyles = {
		list: STYLES,
		/* THE READER'S OWN COME SECOND, NEWEST FIRST (Manuel, 2026-09-22, having
		   saved one and found it at the bottom: "it doesn't save it next to the
		   original, it saves at the last"). They are stored at the end of the list,
		   which is right, because the list is also the order things were made in;
		   what is shown is another question. A reader has a handful of styles of
		   their own and made every one of them, while the site's set is long and
		   stays put, so at a hundred tiles "last" means a tile the reader made and
		   cannot see. Original stays first, because it is the way back. */
		shown: function () {
			var all = STYLES.filter(offered);
			/* A READER SEES THE OWNER'S ORDER (2026-09-23): the site's own look first,
			   then the picks in the order For readers holds them, which the owner
			   drags. */
			if (READER) {
				/* Original first, then the owner's order, the default where it stands (2026-10-05) */
				return this.visibleOrder().map(function (id) { return all.filter(function (s) { return s.id === id; })[0]; }).filter(Boolean);
			}
			/* THE OWNER'S ONE GRID (Manuel, 2026-09-23: "the tiles on top and the
			   tiles below … it's already getting quite crowded"): the site default
			   first, which is what a first visit opens in, then the built-in styles,
			   the published ones and your own. */
			var seen = this.visibleOrder(), rest = all.filter(function (s) { return seen.indexOf(s.id) === -1; });
			rest = rest.filter(function (s) { return !s.own && !s.site; })
				.concat(rest.filter(function (s) { return s.site; }))
				.concat(rest.filter(function (s) { return s.own; }).reverse());
			/* THE ORDER YOU GAVE THE REST (Manuel, 2026-09-24: "the rearranging in the
			   lower section is not locking in"). Only visible to you had no order of
			   its own, so a tile dragged there went back to its kind's place. The
			   order the owner drags is kept in this browser, beside their own
			   styles; a style it does not name yet (one just made) comes first. */
			var mine = hiddenOrder();
			if (mine.length) rest = rest.filter(function (s) { return mine.indexOf(s.id) === -1; })
				.concat(mine.map(function (id) { return rest.filter(function (s) { return s.id === id; })[0]; }).filter(Boolean));
			return seen.map(byId).filter(Boolean).concat(rest);
		},
		setHiddenOrder: function (ids) { try { localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids || [])); } catch (e) { /* private mode */ } },
		isOwn: function (id) { var s = byId(id); return !!(s && s.own); },
		/* The side the theme's own look is on (measured at load), for a guest's Original. */
		hostSide: function () { var h = byId('host'); return h && h.hostSide ? h.hostSide : ''; },
		/* THE SITE'S STYLES (2026-09-18): what the panel asks about them and
		   the four writes, each a call to the theme's route with the record the
		   export makes. Every answer is the whole state, taken as printed. */
		isSite: function (id) { var s = byId(id); return !!(s && s.site); },
		/* a base style, one the site never lets go (2026-10-05, inc/site-styles.php THE BASE STYLES) */
		isBase: function (id) { return !!(SITE && Array.isArray(SITE.base) && SITE.base.indexOf(id) !== -1); },
		/* THE RECORD, DESCRIBED (2026-09-18): every field a style record may
		   carry and the values each accepts, read from the lists this script
		   runs on, so an assistant writing a record for the route does not
		   guess. tools/style-schema.mjs writes it to inc/style-schema.json,
		   which the route serves at /site-styles/schema. */
		/* WHAT EACH FIELD MEANS, FOR AN ASSISTANT (Manuel, 2026-09-19: "make everything better so that AI can read … what could be an AI approach even better"). The schema lists what a field ACCEPTS; this says what it DOES, in one sentence, with its unit and the switch it depends on, which is what a model needs to turn "a little warmer, fewer lines" into a record. Kept here beside the lists so it cannot drift: tools/style-schema.mjs fails when a record key has no meaning. */
		guide: function () {
			/* The meanings are the list's (plugin/settings.json, `means`), written into LIST above in the order the guide prints them. */
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
					'The day leads: set the light colours, and the dark side works each one out from them unless you set it too. Check both sides.', /* was: a first visit opens dark (stale since 0.11.47 and 0.46.0; the sweep, 2026-10-06) */
					'Colours: seven per side, named for their job. background is the page the text sits on (people see Paper); background2 the space around it and the rails, a second background a theme may have (Ground); card what stands on the page: menus, boxes, fields (Cards); text; mutedText the quiet text of dates and captions (Soft text); accent the brand colour of links and main buttons; highlight the highlighter, left out for none. Leave out what you do not need: the rest is worked out from background and text.',
					'Contrast: text on background at 4.5:1 or better, accent on background at 3:1 or better, on both sides.',
					'A background2 on the other side of the background (dark around a light page, or light around a dark one) is a dark ground: it is worn around the page on wide screens, with its own words, lines and links.',
					'A detail shows only with its setting on: borderStyle and borderStrength need a borderWidth, frameWidth a pictureFrame, capLines and capface a dropcap, colourOnHover a pictureFilter.', /* the old line named retired keys (the sweep, 2026-10-06) */
					'Pick fonts from the listed ids only; the theme ships no others.',
					'To try a record without publishing it, open the site at /#style= followed by the base64url of the record JSON.'
				],
				/* THE SEVEN ROLES, said for a model (2026-10-02): what each role styles and what each dial's steps mean, one line each */
				typography: TYPE_MEANS,
				examples: recipes,
				colourPresets: PRESETS.map(function (p) { return { id: p.id, label: p.label, light: publicSide(p.light), dark: publicSide(p.dark) }; })
			};
		},
		schema: function () {
			var faces = (window.ArchitraveFaces || []).map(function (f) { return f.id; });
			/* THE SEVEN (2026-10-02): every role the same dials, the steps by name; body's font
			   and line spacing and the interface's font are their roles' own since 0.25.0 and 0.26.0; the engine
			   keeps them as `face`, `leading` and `sans` (liftLeading). */
			var roles = {};
			TYPE_ROLES.forEach(function (r) {
				var o = {};
				(r === 'body' ? ['font'].concat(TYPE_DIALS[r].slice(0, 2), 'lineHeight', TYPE_DIALS[r].slice(2)) : r === 'interface' ? ['font'].concat(TYPE_DIALS[r]) : TYPE_DIALS[r]).forEach(function (d) {
					o[d] = d === 'font' && r === 'body' ? faces : d === 'font' && r === 'interface' ? SANS.map(function (x) { return x.id; }) : d === 'font' ? (r === 'code' ? [] : ['body', 'interface']).concat(Object.keys(FAMILY)) : d === 'size' ? TYPE_SIZES : d === 'weight' ? Object.keys(WEIGHT) : d === 'lineHeight' ? Object.keys(TYPE_LINE) : d === 'letterSpacing' ? Object.keys(TYPE_LETTER) : d === 'align' ? ALIGNS : d === 'colour' ? TYPE_COLOURS : 'boolean';
				});
				roles[r] = o;
			});
			var side = {}; WELL_KEYS.forEach(function (w) { side[w] = 'hex'; });
			/* THE FIELDS COME FROM THE LIST (plugin/settings.json, step 4): its keys in the order
			   the schema prints them, each answered by its table. What is not a table of the list
			   is read where it lives: the styles, the colour pairs, the reading sizes, the faces. */
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
		/* ONE OF YOUR STYLES, SHOWN TO READERS AS IT IS (Manuel, 2026-09-23: "I made
		   my own style … I want to make it public … and my new base style"). It is
		   published under its own name and leaves Your styles, so it is not there
		   twice; with makeDefault it is also what a first visit opens in. */
		/* Whether readers see a style: the site's own look, and the ones on For readers. */
		seenByReaders: function (id) {
			var s = byId(id); if (!s) return false;
			return !!(s.host || id === DEFAULT || readerPicks().indexOf(id) !== -1);
		},
		/* MAKE IT WHAT A FIRST VISIT OPENS IN, whatever it is: one of yours is
		   published first; Classic is the absence of a default. */
		makeDefault: function (id) {
			if (!byId(id)) return Promise.reject(new Error('no style'));
			/* THE DEFAULT IS CHOSEN, NOT PLACED (2026-10-05): nothing moves; a style not yet shown is shown at the end
			   (one of your own is published first), Original as the default is no default at all */
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
		/* SHOWN TO READERS OR NOT, from a tile: one of yours is published and
		   added; any other is added to or taken off For readers' list. */
		/* OFF THE SITE AND KEPT AS YOURS (Manuel, 2026-09-24: "Für alle sichtbar" off
		   must lose nothing). The published style goes from the site and comes back
		   as one of your own, under its name, with any unsaved changes it carried. */
		unpublishKeep: function (id) {
			var s = byId(id); if (!s || !s.site) return Promise.reject(new Error('not a site style'));
			var rec = JSON.parse(JSON.stringify(s)); delete rec.site; rec.architrave = 1;
			var wasCurrent = current === id, carried = readTweaks()[id]; /* read before the site forgets the style: the cleaner drops tweaks of a style it cannot find */
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
		/* A NEW NAME FROM THE TILE'S MENU (2026-09-23): one of yours is renamed here,
		   a published one on the site. Built-in styles keep theirs. */
		rename: function (id, name) {
			var s = byId(id); name = String(name || '').trim().slice(0, 40);
			if (!s || !name) return Promise.reject(new Error('nothing to rename'));
			if (s.own) { s.label = name; writeOwn(); renderHosts(); return Promise.resolve(true); }
			if (!s.site) return Promise.reject(new Error('a built-in style keeps its name'));
			return refreshSite(true).then(function () { /* the site's version, not the one this page loaded with (0.32.2) */
				var now = byId(id); if (!now || !now.site) throw new Error('no such style');
				var record = JSON.parse(JSON.stringify(now)); delete record.site; record.label = name;
				return sendSite({ action: 'update', id: id, record: record }).then(function () { return true; });
			});
		},
		publishOwn: function (id, makeDefault) {
			var s = byId(id); if (!s || !s.own) return Promise.reject(new Error('not your style'));
			/* AT ONCE, NOT THROUGH THE DISSOLVE (2026-09-24): apply() waits for a view
			   transition, so publish() read the style that was on before, and the own
			   copy's removal then chose the first tile over the new one. The switch is
			   made now, the own copy leaves without choosing anything, and publish()
			   puts the published style on. */
			if (current !== id) applyNow(s, wanted(s));
			return this.publish(s.label, makeDefault).then(function (newId) {
				if (newId) {
					if (PENDING) { var k = PENDING.indexOf(id); if (k !== -1) PENDING[k] = newId; } /* the published copy takes the own one's place in an order being made */
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
			var rawOf = function (id) { try { return JSON.stringify((JSON.parse(localStorage.getItem(TWEAKS_KEY) || '{}') || {})[id] || null); } catch (e) { return ''; } }; /* as stored: read through cleanTweaks it loses what the new record now says too, and never matched (0.31.1) */
			var sent = rawOf(s.id), whole = this.exportStyle();
			return sendSite({ action: 'update', id: s.id, record: record }).then(function () {
				siteSent[s.id] = whole;
				/* SHOWN IS SHOWN (0.31.0): only what was sent is let go; a change made while it travelled stays and goes next,
				   and the page is drawn again only if it still shows this style (the record now equals what it shows) */
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
		/* The two the owner hands readers, and the write that changes them. */
		reader: function () { return READER; },
		readers: function () { return readerPicks().filter(function (id) { return id !== DEFAULT && !!byId(id); }); }, /* a pick that names nothing, or the site's own look, holds no place */
		/* The look a reader always gets first: the site default, else the theme's own on a guest and Standard on Architrave. */
		readerFirst: function () { return DEFAULT; },
		/* READERS MAY COPY A STYLE (Manuel, 2026-09-23: "a reader could copy a
		   style from his site and use that style on his site too"). The owner's
		   switch on For readers; the reader then gets Copy style, which copies
		   the style's link, and the link carries the whole style (#style=), so
		   Paste style… takes it on any site that runs the panel. */
		readersCopy: function () { return !!(SITE && SITE.readersCopy); },
		setReadersCopy: function (on) {
			var was = SITE.readersCopy; SITE.readersCopy = !!on; /* the switch moves at once, the server follows */
			return sendSite({ action: 'readers-copy', on: !!on }).then(function () { return true; }, function (e) { SITE.readersCopy = was; throw e; });
		},
		/* THE LIVE DESIGN BUTTON (Manuel, 2026-09-23, lab/the-button-page.html):
		   where the door sits and how it looks, for the whole site. The owner's
		   change shows at once (panel-opener.js hears the event) and the server
		   follows; a refused write puts the old settings back. */
		button: function () { return SITE && SITE.button ? SITE.button : null; },
		setButton: function (key, value) {
			if (!SITE || !SITE.button) return Promise.reject(new Error('no button'));
			var was = SITE.button, next = {};
			Object.keys(was).forEach(function (k) { next[k] = was[k]; });
			next[key] = value;
			if (key === 'place' && value !== 'auto') next.fixed = value; /* the map's last pick, for when Automatic is switched off again */
			SITE.button = next;
			window.dispatchEvent(new CustomEvent('architrave-button-settings', { detail: { settings: next, picked: key } }));
			return sendSite({ action: 'button', settings: next }).then(function () { return true; }, function (e) {
				SITE.button = was;
				window.dispatchEvent(new CustomEvent('architrave-button-settings', { detail: { settings: was } }));
				throw e;
			});
		},
		/* WHAT EVERYONE SEES, AS ONE ORDERED LIST (Manuel, 2026-09-23: "should the
		   complete order be drag-and-drop possible?"). The owner's grid shows it as
		   its first group: the site default first, then the styles readers are
		   offered, in their order. visibleOrder reads it; setVisible writes a new
		   one: the first becomes the default (on Architrave), the rest For readers'
		   list, and one of your own in it is published on the way. The grid moves
		   at once; the site follows. */
		visibleOrder: function () {
			if (PENDING) return PENDING.filter(function (id) { return !!byId(id); });
			/* THE DEFAULT NO LONGER STANDS FIRST (Manuel, 2026-10-05: "sometimes I want to keep a certain order but I
			   want to switch the defaults"): Original first, always seen, then the shown styles in the owner's order,
			   the default among them where it was put. A site saved before kept its default apart from the list; it
			   is taken in at the front, where it stood. */
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
			/* THE GRID TAKES THE NEW ORDER AT ONCE (Manuel, 2026-09-24: "it will snap back
			   for a second to where it was until it's loaded"): one of your own is
			   published first, a round trip, and the grid showed the old order until
			   it came back. The order asked for is shown meanwhile. */
			PENDING = ids;
			/* one of yours is published first, in turn, and its new id takes its place */
			var chain = owns.reduce(function (p, id) {
				return p.then(function () { return self.publishOwn(id, false).then(function (nid) { var k = ids.indexOf(id); if (nid && k !== -1) ids[k] = nid; }); });
			}, Promise.resolve());
			return chain.then(function () {
				var picks = ids.filter(function (id) { return !isOriginal(id); }); /* Original is always offered; it is no pick */
				/* the order only: the default stays the default, unless it is no longer shown, when Original takes over (2026-10-05) */
				var def = SITE['default'] || '';
				if (def && picks.indexOf(def) === -1) def = '';
				var wasDefault = SITE['default'] || '', wasReaders = SITE.readers;
				if (def !== null) SITE['default'] = def;
				SITE.readers = picks.slice();
				PENDING = null; takeSite(SITE); renderHosts(); /* the grid moves now */
				/* one after the other: each answer is the whole state, and the second must not be overtaken by the first */
				return sendSite({ action: 'readers', ids: picks })
					.then(function () { return def !== null && def !== wasDefault ? sendSite({ action: 'default', id: def }) : null; })
					.then(function () { mark(); return true; }, function (e) { SITE['default'] = wasDefault; SITE.readers = wasReaders; takeSite(SITE); renderHosts(); throw e; });
			}, function (e) { PENDING = null; renderHosts(); throw e; });
		},
		setReaders: function (ids) {
			/* AT ONCE (Manuel, 2026-09-23: "everything is a little slow here, a little
			   delay"): each press waited for the site to answer before the row moved,
			   a round trip on a hosted site. The list changes here first and the
			   server's answer confirms it; a refusal puts the old list back. */
			var was = SITE.readers; SITE.readers = (ids || []).slice();
			return sendSite({ action: 'readers', ids: (ids || []) }).then(function () { return true; }, function (e) { SITE.readers = was; throw e; });
		},
		setSiteDefault: function (id) {
			return sendSite({ action: 'default', id: id || '' }).then(function () { mark(); return true; });
		},
		/* THE COLOURS (Manuel, 2026-09-14): the wells on the Farbe page. */
		colours: coloursResolved, /* with the following side filled in and named in .derived; saving reads coloursOf, what was set alone */
		/* THE SEVEN COLOURS' OWN (2026-10-03): the highlighter on both sides, whether a ground was drawn a
		   shade further so its words read, and the other side's ground for the Ground list's first row. */
		highlight: highlightNow,
		setHighlight: function (hex) { if (hex && !/^#[0-9a-f]{6}$/i.test(hex)) return; setBothSides('highlight', hex || ''); },
		groundNudged: function (side) { return !!GROUND_NUDGED[side || ((root.getAttribute('data-theme') || '').split('-')[1] === 'dark' ? 'dark' : 'light')]; },
		otherGround: function (side) {
			side = side || ((root.getAttribute('data-theme') || '').split('-')[1] === 'dark' ? 'dark' : 'light');
			var other = side === 'light' ? 'dark' : 'light', o = coloursResolved()[other];
			return o.ground && !groundFlip(o.ground, o.paper || paperNow(other), o.ink) ? o.ground : o.paper ? sink(o.paper, 0.05) : canvasOf(other);
		},
		groundSides: function () { return groundSides(); },
		/* THE PRESETS: fifteen pairs authored here, beside the five the design
		   system registers. Choosing one writes its six colours into the style,
		   both sides at once, so the chain has nothing to follow and the ladder
		   mixes everything else; choosing a mode, or moving a colour by hand,
		   lets it go again. */
		presets: function () { return PRESETS.map(function (p) { return { id: p.id, label: p.label, light: { paper: p.light.paper, ink: p.light.ink, accent: p.light.accent }, dark: { paper: p.dark.paper, ink: p.dark.ink, accent: p.dark.accent }, fresh: !!p.fresh, group: p.group || '', fixed: !!p.fixed }; }); },
		/* THE THREE LISTS OF THE CUSTOMISATION AREA (Manuel, 2026-09-16): twenty
		   papers, twenty inks, twenty accents, the same hues in all three. A
		   colour chosen here is written on both sides at once, so the chain has
		   nothing to follow, and it leaves whatever preset was on: a preset is
		   picked whole, a part is picked here. */
		swatchList: function (key) { return (LISTS[COLOUR_ENGINE[key] || key] || []).map(function (x) { return { id: x.id, label: x.label, light: x.light, dark: x.dark }; }); },
		listColour: listColourOf,
		setListColour: function (key, id) {
			key = colourKey(key);
			var x = (LISTS[COLOUR_ENGINE[key] || key] || []).filter(function (c) { return c.id === id; })[0];
			if (!x) return;
			var all = readTweaks(), entry = all[current] || {};
			entry.colours = entry.colours || {};
			/* the theme's own look has one side, its own: that side's colour on both (2026-09-24) */
			var cur = byId(current), one = cur && cur.host && cur.hostSide;
			['light', 'dark'].forEach(function (side) { entry.colours[side] = entry.colours[side] || {}; delete entry.colours[side][COLOUR_ENGINE[key]]; entry.colours[side][key] = x[one || side]; });
			if (BESIDE_PRESET.indexOf(key) === -1) letGoPreset(entry); /* a part chosen by hand is nobody's preset any more; the button's, the roles' and the pen's own colours sit beside a preset */
			/* The chain is left as the reader set it: a row here carries a colour
			   for each side, so neither side has anything to follow, and the
			   wheel under the list still edits the side that is shown. */
			all[current] = entry;
			writeTweaks(all);
			if (key === 'accent' && !accentOn()) { try { localStorage.removeItem(ACCENT_KEY); } catch (e) { /* private window */ } applyAccent(); }
			applyColours(); mark();
		},
		accentColour: accentColourOf,
		/* PRESET OR OWN, ONE CHOICE (Manuel, 2026-09-16: "when we select a preset
		   it should be shown on that page and therefore we haven't selected a
		   custom solution. It's either/or … I think it is important to make clear
		   either the one or the other"). A style is on its own colours when it
		   holds colours that no preset put there; a preset's six carry its mark
		   and a mode's pair is the room's, so both of those are the preset side
		   of the switch. */
		custom: function () {
			if (presetOf()) return false;
			/* ORIGINAL'S OWN COLOURS ARE NOT SET BY HAND (2026-09-24, Manuel on Ollie:
			   "can't click preset"). The theme's paper and ink are measured into the
			   Original record for its tile, and counted here they made Custom always
			   on, so Preset had nothing to cross from. On Original only the reader's
			   own colours count. */
			var s0 = byId(current);
			if (s0 && s0.host) {
				var e0 = (readTweaks()[current] || {}).colours || {};
				return ['light', 'dark'].some(function (sd) { return Object.keys(e0[sd] || {}).some(function (k) { return BESIDE_PRESET.indexOf(colourKey(k)) === -1 && !!e0[sd][k]; }); });
			}
			var c = coloursOf(null, true);
			return ['light', 'dark'].some(function (sd) { return Object.keys(c[sd] || {}).some(function (k) { return BESIDE_PRESET.indexOf(colourKey(k)) === -1; }); }); /* the button's, the roles', soft text's and the pen's own colours are not Custom */
		},
		/* Crossing over keeps what is on the page. Going to Eigene takes the
		   preset's own six colours with it, so nothing moves on the crossing and
		   the three rows open on the colours the reader was looking at; a mode
		   has none to take, so the page's own paper, ink and accent are written
		   for the side being shown and the other side follows. Going back to
		   Voreinstellung drops the colours set by hand and returns to the preset
		   that was on before, which is remembered for exactly this. */
		setCustom: function (on, seed) {
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (on) {
				/* A preset the RECIPE names is let go the same way: its six colours are written into the tweak first, so nothing moves on the crossing, and the empty `preset` says Eigene. */
				var c = coloursOf(null, true); /* without the phosphor, which stays laid over the night while it is on */
				if (entry.preset) { entry.was = entry.preset; delete entry.preset; }
				else if (s && s.preset && entry.preset === undefined) { entry.was = s.preset; entry.preset = ''; var preG = presetById(s.preset); ['light', 'dark'].forEach(function (sd) { if (preG && preG.ground && typeof preG.ground === 'object' && preG.ground[sd]) c[sd].ground = preG.ground[sd]; if (preG && preG.lift && preG.lift[sd]) c[sd].lift = preG.lift[sd]; }); /* the set's own ground and card cross with it (2026-09-26) */ entry.colours = { light: { paper: c.light.paper, ink: c.light.ink, accent: c.light.accent, ground: c.light.ground, lift: c.light.lift }, dark: { paper: c.dark.paper, ink: c.dark.ink, ground: c.dark.ground, lift: c.dark.lift, accent: c.dark.accent } }; }
				/* ORIGINAL STARTS CUSTOM FROM ITS OWN COLOURS (2026-09-25, found by the
				   ten-theme test: pressing Custom under Original did nothing). The
				   theme's measured paper and ink are the record's, not the reader's,
				   so they are written into the tweak as the reader's starting point. */
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
			/* Back to the preset the recipe names: the tweak simply goes, and the recipe speaks again. */
			if (s && s.preset && back === s.preset) { delete entry.preset; if (Object.keys(entry).length) all[current] = entry; else delete all[current]; writeTweaks(all); applyColours(); mark(); return; }
			/* A style with colours of its own keeps them in its own record, so
			   they are masked rather than deleted, the way a tint masks an own
			   accent (2026-09-14). */
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
				/* Letting a preset go takes its six colours with it, and only
				   them: a colour moved by hand has already cleared the mark, so
				   a record that still carries one carries nothing else of the
				   reader's. */
				if (entry.preset) delete entry.colours;
				/* A TILE THAT BRINGS ITS OWN PRESET (Instrument's Lime night)
				   fell straight back to it when a pair was chosen, so the five
				   pairs did nothing there (Manuel, 2026-09-23). Letting go on
				   such a tile is written as none, not forgotten. */
				var own = byId(current);
				if (own && own.preset) entry.preset = ''; else delete entry.preset;
				if (Object.keys(entry).length) all[current] = entry; else delete all[current];
				writeTweaks(all); applyColours(); mark(); return;
			}
			/* the preset's three, the wells beside a preset kept (2026-10-03: a highlighter, soft text or a role's own colour stays) */
			var keep = entry.colours || {};
			entry.colours = { light: { background: p.light.paper, text: p.light.ink, accent: p.light.accent }, dark: { background: p.dark.paper, text: p.dark.ink, accent: p.dark.accent } };
			/* a reading style's preset brings its ground, card and soft text too (2026-10-05); a hand-set soft text still wins below */
			['light', 'dark'].forEach(function (sd) { [['ground', 'background2'], ['lift', 'card'], ['muted', 'mutedText']].forEach(function (k) { if (p[sd][k[0]]) entry.colours[sd][k[1]] = p[sd][k[0]]; }); });
			['light', 'dark'].forEach(function (sd) { Object.keys(keep[sd] || {}).forEach(function (k) { if (BESIDE_PRESET.indexOf(colourKey(k)) !== -1) entry.colours[sd][colourKey(k)] = keep[sd][k]; }); });
			entry.preset = p.id;
			all[current] = entry;
			writeTweaks(all);
			/* A preset brings an accent, so the accent is on: it is the same rule
			   the wheel follows when a colour is poured into it (2026-09-15). */
			if (!accentOn()) { try { localStorage.removeItem(ACCENT_KEY); } catch (e) { /* private window */ } applyAccent(); }
			applyColours(); mark();
		},
		contrast: contrast,
		writingOn: writingOn, /* the writing on a filled button, the panel's level cards draw it the same way (2026-10-09) */
		paperOf: paperOf,
		setColour: function (side, key, hex) {
			key = colourKey(key); /* the engine's old names are read as the seven's (paper is background …) */
			if (['light', 'dark'].indexOf(side) === -1 || WELL_KEYS.indexOf(key) === -1 || !/^#[0-9a-f]{6}$/i.test(hex || '')) return;
			var all = readTweaks(), entry = all[current] || {};
			entry.colours = entry.colours || {}; entry.colours[side] = entry.colours[side] || {};
			/* THE DAY LEADS, THE NIGHT KEEPS ITS OWN (2026-10-05, Manuel: "go with your recommendation"; the switch
			   Same colours for light and dark is gone). A colour set by day frees the night of that colour, so the
			   night works it out from the new one, unless the night's was set by hand (darkByHand). A colour set by
			   night stays on the night: the day keeps what it holds. A day that holds nothing of its own for that
			   colour (a plain copy of Original) still works it out from the night, as coloursResolved does; that
			   case was left as it was. */
			var presetsWere = [presetById(presetOf()), presetById((byId(current) || {}).preset)];
			var dayLeads = function () {
				if (side !== 'light') return;
				/* ANOTHER THEME'S NIGHT FOLLOWS TOO (2026-10-06, the panel sweep): a copy of a guest's Original holds the
				   theme's own two sides as its colours, so the night's looked set by hand and never followed (an accent
				   made blue by day stayed the theme's grey at night). The theme's own night colour is not by hand: it
				   is cleared ('' = none of its own), and the night works it out from the day. */
				var dk = entry.colours.dark, sNow = byId(current), hostDark = ((byId('host') || {}).colours || {}).dark || {};
				if (dk && dk[key] === '') return;
				if (sNow && sNow.bare && !(dk && (dk[key] || dk[COLOUR_ENGINE[key]]))) {
					var mineDark = sNow.colours && sNow.colours.dark && (sNow.colours.dark[key] || sNow.colours.dark[COLOUR_ENGINE[key]]), theirs = hostDark[key] || hostDark[COLOUR_ENGINE[key]];
					if (mineDark && theirs && String(mineDark).toLowerCase() === String(theirs).toLowerCase()) { entry.colours.dark = dk || {}; entry.colours.dark[key] = ''; return; }
				}
				if (!entry.colours.dark || darkByHand(entry, key, presetsWere)) return;
				/* A DARK GROUND IS ITS SIDE'S OWN (2026-10-03): the other side's ground is left as it is */
				if (key === 'background2' && groundFlip(hex, (coloursResolved().light || {}).paper || paperNow('light'))) return;
				delete entry.colours.dark[key]; delete entry.colours.dark[COLOUR_ENGINE[key]]; if (!Object.keys(entry.colours.dark).length) delete entry.colours.dark;
			};
			dayLeads();
			delete entry.colours[side][COLOUR_ENGINE[key]];
			entry.colours[side][key] = hex.toLowerCase();
			if (BESIDE_PRESET.indexOf(key) === -1) {
				letGoPreset(entry); /* a colour moved by hand is nobody's preset any more; the button's, the roles' and the pen's own colours sit beside a preset */
				dayLeads(); /* the night follows this colour, not the preset's it was just given */
			}
			all[current] = entry; writeTweaks(all);
			applyColours(); mark();
		},
		clearColour: function (side, key) {
			key = colourKey(key);
			var all = readTweaks(), entry = all[current] || {}, s = byId(current);
			if (entry.colours && entry.colours[side]) { delete entry.colours[side][key]; delete entry.colours[side][COLOUR_ENGINE[key]]; if (!Object.keys(entry.colours[side]).length) delete entry.colours[side]; }
			if (entry.colours && !Object.keys(entry.colours).length) delete entry.colours;
			/* On a saved style the well goes back to the saved colour; clearing means: no colour of my own, the pair's. */
			if (s && (s.own || s.site) && s.colours && s.colours[side] && (s.colours[side][key] || s.colours[side][COLOUR_ENGINE[key]])) { entry.colours = entry.colours || {}; entry.colours[side] = entry.colours[side] || {}; entry.colours[side][key] = ''; }
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyColours(); mark();
		},
		/* ALS STIL SICHERN (Manuel, 2026-09-14; Apple: duplicate, then edit, then
		   name): the style as the reader left it, dials, switches, roles and
		   colours, becomes a tile of its own; the tile it was made on goes back
		   to clean. */
		/* A STYLE AS TEXT (Manuel, 2026-09-16, from Codex's Import / Copy theme):
		   the look leaves the browser as one line of JSON and comes back into
		   any other, which is also how a style reaches the people who build
		   with it. The shape is the saved style's own, with the theme's name
		   and a version on it so a paste can be told from any other text. */
		exportStyle: function () {
			var s = byId(current); if (!s) return '';
			var tw = readTweaks()[current] || {}, w = wanted(s), out = { architrave: 3, label: s.label, base: baseOf(s) };
			DIALS.forEach(function (d) { out[d] = w[d]; });
			OPTS.forEach(function (k) { out[k] = optionOn(k); });
			var loose = followers();
			out.tint = tintOf(); out.sans = sansOf(); out.scope = scopeOf(); out.pictures = picturesOf(); out.capLines = capLinesOf(); out.button = buttonOf(); Object.keys(PICKS).forEach(function (k) { out[k] = pickOf(k); }); out.line = levelOf('line'); out.fill = levelOf('fill'); out.softlevel = levelOf('softlevel'); out.quietlevel = levelOf('quietlevel'); out.smallsoft = levelOf('smallsoft'); out.linestyle = lineStyleOf(); out.corners = cornersOf(); out.fadeedges = fadeEdgesOf(); out.markercolour = markerColourOf(); out.framepattern = framePatternOf(); out.measure = levelOf('measure'); Object.keys(LAYOUT).forEach(function (k) { out[k] = layoutOf(k); }); out.space = levelOf('space'); ['spaceInside', 'spaceItems', 'spaceSections', 'spaceTitle'].forEach(function (k) { out[k] = levelOf(k); }); out.framewidth = levelOf('framewidth');
			loose.forEach(function (k) { delete out[k]; }); /* a row that only follows soft is not written, so it goes on following */
			out.roles = typeMerged(s, tw);
			/* the reading text's line spacing, in the words of every role (2026-10-03; see liftLeading) */
			var lhOut = { dense: 'tight', tight: 'snug', airy: 'relaxed', wide: 'loose' }[out.leading];
			delete out.leading;
			if (lhOut) { out.roles.body = out.roles.body || {}; out.roles.body.lineHeight = lhOut; }
			/* and the two fonts under their roles (0.26.0), named as every role names its font */
			if (out.face) { out.roles.body = out.roles.body || {}; out.roles.body.font = out.face; }
			if (out.sans) { out.roles['interface'] = out.roles['interface'] || {}; out.roles['interface'].font = out.sans; }
			delete out.face; delete out.sans;
			var fxOut = effectsOf(s, tw); if (Object.keys(fxOut).length) out.effects = fxOut;
			writeColours(out);
			ENGINE_ONLY.forEach(function (k) { delete out[k]; }); /* worked out from the colours now: no key of a record */
			return JSON.stringify(out);
		},
		/* A pasted style becomes a tile of the reader's own and is put on at
		   once; nothing already saved is touched. */
		importStyle: function (text, name) {
			var data;
			try { data = JSON.parse(String(text || '').trim()); } catch (e) { return null; }
			if (!data || [1, 2, 3].indexOf(data.architrave) === -1) return null;
			var entry = ownFromRecord(data, name);
			renderHosts();
			apply(entry, entry);
			return entry.id;
		},
		/* THE LINK (2026-09-18): the style that is on, as an address. A tile
		   the site offers, unadjusted, is named; anything else is carried. */
		shareLink: function (whole) {
			var s = byId(current); if (!s) return '';
			var base = window.location.origin + window.location.pathname;
			/* WHOLE: the style written into the link even when it is a tile as it
			   came, for a reader taking it to their own site (2026-09-23), where a
			   bare `?style=book` would name a tile that site may not have or may
			   draw differently. */
			if (!whole && !s.own && !this.adjusted(s.id)) return base + '?style=' + encodeURIComponent(s.id);
			var record = JSON.parse(this.exportStyle());
			return base + '#style=' + encodeRecord(record);
		},
		/* A pasted link, from this site or another. Resolves to the id put on,
		   or null when the text is no link the panel can read. */
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
		/* DUPLICATE (Manuel, 2026-09-24): a copy of any style as one of your own, as it stands
		   now, its unsaved changes included, under "{name} copy". The style you are on stays
		   on and the one copied is untouched; the copy stands first in Only visible to you. */
		duplicate: function (id) {
			var s = byId(id); if (!s) return null;
			var record, name = t('{name} copy').replace('{name}', s.site || s.own ? s.label : t(s.label));
			/* NUMBERED, AS FINDER NUMBERS COPIES (2026-09-25): two tiles both
			   called "Original copy" say nothing apart. */
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
				/* ITS COLOURS AS THEY STAND, its preset's six included (2026-10-01, the panel audit): the record named `preset`, which a copy does not carry, and the tweak's partial `colours` replaced the style's own, so Duplicate on Instrument while another style was on gave a copy without its colours. */
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
			/* SAVED FROM THE THEME'S OWN LOOK (Manuel, 2026-09-22: "maybe it should be
			   a customization option but then we should be able to save it as a new
			   tile"): the tile is the theme plus the reader's few changes, and stays
			   that. No room is painted under it, nothing is stamped that was not
			   chosen, and it wears the theme's own paper and face on the tile. */
			if (s.host || s.bare) { entry.bare = true; entry.hostFace = s.hostFace; entry.colours = s.colours; }
			/* Under the theme's own look no tweak is ever recorded (remember), so
			   what the page shows IS the reader's version of it. */
			DIALS.forEach(function (d) { entry[d] = s.host ? now()[d] : w[d]; });
			OPTS.forEach(function (k) { entry[k] = optionOn(k); });
			var loose = followers();
			entry.tint = tintOf(); entry.sans = sansOf(); entry.scope = scopeOf(); entry.pictures = picturesOf(); entry.capLines = capLinesOf(); entry.button = buttonOf(); Object.keys(PICKS).forEach(function (k) { entry[k] = pickOf(k); }); entry.line = levelOf('line'); entry.fill = levelOf('fill'); entry.softlevel = levelOf('softlevel'); entry.quietlevel = levelOf('quietlevel'); entry.smallsoft = levelOf('smallsoft'); entry.linestyle = lineStyleOf(); entry.corners = cornersOf(); entry.fadeedges = fadeEdgesOf(); entry.markercolour = markerColourOf(); entry.framepattern = framePatternOf(); entry.measure = levelOf('measure'); Object.keys(LAYOUT).forEach(function (k) { entry[k] = layoutOf(k); }); entry.space = levelOf('space'); ['spaceInside', 'spaceItems', 'spaceSections', 'spaceTitle'].forEach(function (k) { entry[k] = levelOf(k); }); entry.framewidth = levelOf('framewidth');
			loose.forEach(function (k) { delete entry[k]; }); /* a row that only follows soft is not written, so it goes on following */
			ENGINE_ONLY.forEach(function (k) { if (k !== 'palette') delete entry[k]; }); /* worked out from the colours (2026-10-03) */
			entry.roles = typeMerged(s, tw); entry.architrave = 3;
			var fxSave = effectsOf(s, tw); if (Object.keys(fxSave).length) entry.effects = fxSave;
			writeColours(entry);
			var all = readTweaks(); delete all[current]; writeTweaks(all);
			STYLES.push(entry); writeOwn(); renderHosts();
			apply(entry, entry);
			return entry.id;
		},
		/* STIL AKTUALISIEREN (Manuel, 2026-09-14: "I want to update that style,
		   not create a new style"): the reader's changes fold into the saved
		   style itself; nothing is copied. */
		update: function () {
			var s = byId(current); if (!s || !s.own) return false;
			var tw = readTweaks()[current] || {}, w = wanted(s);
			DIALS.forEach(function (d) { s[d] = w[d]; });
			OPTS.forEach(function (k) { s[k] = optionOn(k); });
			var loose = followers();
			s.tint = tintOf(); s.sans = sansOf(); s.scope = scopeOf(); s.pictures = picturesOf(); s.capLines = capLinesOf(); s.button = buttonOf(); Object.keys(PICKS).forEach(function (k) { s[k] = pickOf(k); }); s.line = levelOf('line'); s.fill = levelOf('fill'); s.softlevel = levelOf('softlevel'); s.quietlevel = levelOf('quietlevel'); s.smallsoft = levelOf('smallsoft'); s.linestyle = lineStyleOf(); s.corners = cornersOf(); s.fadeedges = fadeEdgesOf(); s.markercolour = markerColourOf(); s.framepattern = framePatternOf(); s.measure = levelOf('measure'); Object.keys(LAYOUT).forEach(function (k) { s[k] = layoutOf(k); }); s.space = levelOf('space'); ['spaceInside', 'spaceItems', 'spaceSections', 'spaceTitle'].forEach(function (k) { s[k] = levelOf(k); }); s.framewidth = levelOf('framewidth');
			loose.forEach(function (k) { delete s[k]; }); /* a row that only follows soft is not written, so it goes on following */
			ENGINE_ONLY.forEach(function (k) { if (k !== 'palette') delete s[k]; }); /* worked out from the colours (2026-10-03) */
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
		restSize: function (role) { return ROLE_DEFAULT[role] ? rungFor(role, ROLE_DEFAULT[role].size) : null; }, /* the size a role rests on, for the panel's stops in words (a guest, 2026-09-22) */
		adjusted: function (id) {
			var s = byId(id); if (!s) return false;
			if (readTweaks()[id]) return true;
			return id === current && !same(now(), s);
		},
		option: optionOn,
		setOption: function (k, on) {
			/* THE THREE THAT ARE COLOURS NOW (2026-10-03), pressed by the old window: Softer reading text is
			   Reading text in Soft text, the highlighter a pen on both sides, the dark ground the day's Ground. */
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
			if (k === 'fills') return; /* retired 2026-10-05 */
			if (k === 'widepicture') { this.setLayout('pictureWidth', on ? (layoutOf('pictureWidth') === 'full' ? 'full' : 'wide') : 'content'); return; }
			if (k === 'marker') { setBothSides('highlight', on ? (highlightNow() || PENS.yellow) : ''); return; }
			if (k === 'darkground') { var cr = coloursResolved(); if (on) this.setColour('light', 'background2', cr.dark.ground && !groundFlip(cr.dark.ground, cr.dark.paper || paperNow('dark')) ? cr.dark.ground : cr.dark.paper ? sink(cr.dark.paper, 0.05) : canvasOf('dark')); else if (groundSides(cr).light) this.clearColour('light', 'background2'); return; }
			if (OPTS.indexOf(k) === -1) return;
			/* Measured against the REST, not the recipe alone (Manuel, 2026-09-12:
			   "I cannot turn the lines off when I'm in the poster mode"): Poster's
			   recipe says off, its pair says on, and a press to off compared to
			   the recipe was no tweak at all, so the pair had it back at once. */
			var all = readTweaks(), entry = all[current] || {};
			if (!!on === restOf(k)) delete entry[k]; else entry[k] = !!on;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyOptions(); applyPicks(); applyLevels(); mark(); /* the links and the small text follow soft (pickRest, levelRest) */
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
		faceOf: realFace, /* a follower's anchor resolved to the face it stands in (the panel's Typografie row, 2026-09-22) */
		weights: Object.keys(WEIGHT),
		weightsFor: weightsFor,
		sizesFor: sizesFor,
		wanted: function (id) { var s = byId(id); return s ? wanted(s) : {}; }, /* the dials a style would press now, tweaks included (the tiles paint it, 2026-09-13) */
		hasItalic: hasItalic,
		/* A press on a role's dial: a tweak of the style, gone when it
		   equals what the recipe (or Standard) says. The two faces that are
		   dials of their own go through their own setters. */
		/* A MEMBER'S SIZE, OR ITS BINDING (2026-09-18, see THE MEMBERS OF A
		   ROLE). setMember(role, id, '20') releases the member at that rung;
		   setMember(role, id, null) binds it again. The tweak carries the
		   whole set as it stands after the press, and none when all are bound. */
		members: function (role) {
			var v = roleOf(role), f = sizeFactor(role, v.size);
			return membersOf(role).map(function (m) {
				var own = (!m.lead && v.members && v.members[m.id]) || {};
				return {
					id: m.id, rest: m.rest, lead: !!m.lead, bound: !Object.keys(own).length,
					own: own,
					size: m.lead ? String(v.size) : own.size !== undefined ? own.size : String(Math.round(m.rest * f)),
					weight: own.weight !== undefined ? fitWeight(v.face, own.weight) : (v.weight !== ROLE_DEFAULT[role].weight || !m.weight ? v.weight : fitWeight(v.face, m.weight)), /* the role's dial where it moved, the member's rest otherwise */
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
		/* setMember(role, id, dial, value) releases that dial of the member at
		   that value; value null binds the dial again; dial null binds the
		   whole member. The tweak carries the set as it stands after the
		   press, and none when it equals the style's own. */
		setMember: function (role, id, dial, value) {
			return; /* the members left the record on 2026-10-02 (THE SEVEN ROLES); their own dials are the seven's now */
			var m = membersOf(role).filter(function (x) { return x.id === id; })[0];
			if (!m || m.lead) return;
			var v = roleOf(role), set = {};
			Object.keys(v.members || {}).forEach(function (k) { var o = {}; Object.keys(v.members[k]).forEach(function (d) { o[d] = v.members[k][d]; }); set[k] = o; });
			if (dial === null || dial === undefined) delete set[id];
			else if (memberDialsOf(role).indexOf(dial) !== -1) {
				set[id] = set[id] || {};
				if (value === null || value === undefined) delete set[id][dial];
				else if (dial === 'size') set[id].size = ownSize(role, value); /* a bound member reads at rest × step, which is often between rungs (15 at a lead of 16) */
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
		/* THE SEVEN, AS THE WINDOW AND AN ASSISTANT USE THEM (2026-10-02). type(role) is what
		   the role shows now, every dial filled in (a dial the style leaves out says the
		   theme's own: the engine role's current value, or the rest name); setType writes one
		   dial as a tweak, gone when it equals the style's own. The body's font and line
		   spacing and the interface's font go through their own dials (face, leading, sans). */
		typeRoles: TYPE_ROLES,
		typeDials: function (role) { return TYPE_DIALS[role] ? (role === 'body' ? ['font', 'size', 'weight', 'lineHeight', 'letterSpacing', 'capitals', 'italic', 'colour'] : role === 'interface' ? ['font'].concat(TYPE_DIALS[role]) : TYPE_DIALS[role]).slice() : []; },
		typeSizes: function (role) { return TYPE_SIZES.map(function (st) { return { id: st, px: Math.round((TYPE_BASE[role] || 16) * typeFactor(st)) }; }); },
		typeLines: Object.keys(TYPE_LINE),
		typeLetters: Object.keys(TYPE_LETTER),
		type: function (role) {
			if (!TYPE_DIALS[role]) return {};
			var P = typeNow()[role] || {}, lead = { title: 'head', headings: 'head', body: 'read', quote: 'quote', meta: 'small', 'interface': 'ui' }[role], e = lead ? roleOf(lead) : {};
			var back = function (f) { return f === 'read' ? 'body' : f === 'ui' ? 'interface' : f; };
			var LINE_BACK = { dense: 'tight', tight: 'snug', 'default': 'normal', airy: 'relaxed', wide: 'loose' };
			var out = {
				font: role === 'body' ? (root.getAttribute('data-face') || (window.architravePanelGuest ? 'host' : 'newsreader')) /* another theme's own font is `host`, as a saved style says it (0.27.0) */ : role === 'interface' ? sansOf() : P.font !== undefined ? P.font : role === 'code' ? '' : role === 'headings' ? back(ROLE_DEFAULT.head.face) : back(e.face),
				size: P.size !== undefined ? P.size : '0',
				weight: P.weight !== undefined ? P.weight : role === 'headings' ? 'semibold' : role === 'code' ? 'regular' : e.weight,
				lineHeight: role === 'body' ? (LINE_BACK[root.getAttribute('data-leading') || 'default'] || 'normal') : P.lineHeight !== undefined ? P.lineHeight : 'normal',
				letterSpacing: P.letterSpacing !== undefined ? P.letterSpacing : 'normal',
				capitals: P.capitals !== undefined ? P.capitals : role === 'headings' || role === 'code' ? false : !!e.caps,
				italic: P.italic !== undefined ? P.italic : role === 'headings' || role === 'code' ? false : !!e.italic
			};
			out.px = Math.round((TYPE_BASE[role] || 16) * typeFactor(out.size));
			if (TYPE_DIALS[role].indexOf('align') !== -1) out.align = P.align !== undefined ? P.align : 'default';
			if (TYPE_DIALS[role].indexOf('colour') !== -1) out.colour = P.colour !== undefined ? P.colour : typeColourRest(role);
			out.own = Object.keys(typeMerged(byId(current), readTweaks()[current])[role] || {}); /* the dials this style sets, for the changed marks */
			return out;
		},
		setType: function (role, dial, v) {
			if (!TYPE_DIALS[role]) return;
			if (role === 'body' && dial === 'font') { press('[data-architrave-face] [data-face-choice="' + v + '"]'); return; }
			if (role === 'interface' && dial === 'font') { this.setSans(v); return; }
			if (role === 'body' && dial === 'lineHeight') { if (TYPE_LINE[v]) press('[data-architrave-leading] [data-leading-step="' + TYPE_LINE[v] + '"]'); return; }
			if (dial === 'size') v = String(v);
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
		/* AN ENGINE ROLE'S DIAL, PRESSED BY THE OLD WINDOW: the one of the seven it belongs to now. */
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
			if (k === 'measure') { this.setLayout('lineLength', String(v)); return; } /* the line length's key is lineLength (2026-10-03) */
			if (k === 'line') { this.setLayout('borderStrength', String(v)); return; }
			if (k === 'framewidth') { this.setLayout('frameWidth', String(v)); return; }
			if (/^space[A-Z]/.test(k) && v !== undefined && v !== null) v = String(v); /* the four jobs' sizes are numbers to a person and an AI: 128 is '128' */
			if (k === 'fill') return; /* retired 2026-10-05 */
			var L = LEVELS[k]; if (!L || L.stops.indexOf(v) === -1) return;
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === levelRest(k)) delete entry[k]; else entry[k] = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			/* THE RECORD IS WRITTEN AT ONCE, only the page waits for the crossfade:
			   the view transition runs its callback a frame later, and the panel
			   re-rendered in between read the old level, so the knob sat one step
			   behind the page (fixed 2026-09-26). */
			writeTweaks(all);
			var go = function () { applyLevels(); mark(); };
			/* Space crossfades (plugin/assets/js/space.js, SOFT MOTION) */
			if (k === 'space' && window.ArchitraveSpace) window.ArchitraveSpace.soft(go); else go();
		},
		cornerSteps: CORNERS,
		corners: cornersOf,
		setCorners: function (v) {
			if (CORNERS.indexOf(v) === -1) return;
			if (layoutOf('radius') !== 'none') this.setLayout('radius', v); return; /* radius since 2026-10-03 */
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
			if (layoutOf('pictureFrame') !== 'none') this.setLayout('pictureFrame', v); return; /* pictureFrame since 2026-10-03 */
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && FRAME_PATTERNS.indexOf(s.framepattern) !== -1) ? s.framepattern : FRAME_PATTERNS[0])) delete entry.framepattern; else entry.framepattern = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyFramePattern(); mark();
		},
		picks: PICKS,
		pick: pickOf,
		/* THE EXTRAS' DETAILS: the table, one effect's details as they stand (rest, then the
		   style's own, then the reader's), and the setter. A value equal to the style's own
		   (or to the rest) is no tweak; an effect with none left goes. */
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
			/* the two that are widths now (2026-10-03), pressed by the old window */
			if (key === 'fullpicture') { if (v === 'on') this.setLayout('pictureWidth', 'full'); else if (layoutOf('pictureWidth') === 'full') this.setLayout('pictureWidth', 'wide'); return; }
			if (key === 'widefigures') { this.setLayout('figureWidth', v === 'on' ? 'wide' : 'content'); return; }
			if (key === 'linewidth') { if (layoutOf('borderWidth') !== 'none') this.setLayout('borderWidth', v === '1' && layoutOf('borderWidth') === 'hairline' ? 'hairline' : String(v)); return; }
			if (SURFACE_ENGINE[key]) v = surfaceWord(key, v); /* the engine's old word, from the old window */
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
			if (BUTTONS.indexOf(v) !== -1) { this.setLayout('buttonColour', v === 'ink' ? 'text' : v); return; } /* buttonColour since 2026-10-03 */
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
			if (v !== 'own') { setBothSides('highlight', PENS[v] || PENS.yellow); return; } /* the pen is the highlight's colour (2026-10-03); own keeps the colour set by hand */
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
			if (layoutOf('pictureFade') !== 'none') this.setLayout('pictureFade', v); return; /* pictureFade since 2026-10-03 */
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
			this.setLayout('borderStyle', v); return; /* borderStyle since 2026-10-03 */
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && LINE_STYLE.indexOf(s.linestyle) !== -1) ? s.linestyle : LINE_STYLE[0])) delete entry.linestyle; else entry.linestyle = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyLineStyle(); mark();
		},
		setPictures: function (v) {
			if (PICTURES.indexOf(v) === -1) return;
			this.setLayout('pictureFilter', Object.keys(FILTER_ENGINE).filter(function (k) { return FILTER_ENGINE[k] === v; })[0] || v); return; /* pictureFilter since 2026-10-03 */
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
			/* A dot chosen is the accent; a colour of the reader's own gives way (2026-09-14). */
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
			try { if (on) localStorage.removeItem(ACCENT_KEY); else localStorage.setItem(ACCENT_KEY, 'off'); } catch (e) { /* as above */ }
			applyAccent();
		},
		focus: function () { return Focus.on(); },
		motion: function (press) { return Focus.motion(press); },
		retime: function () { return Focus.retime(); },
		setFocus: function (on) { Focus.set(on); },
		canUndo: function () { return HISTORY.length > 0; },
		/* A STEP LANDS AS CHANGES OVER THE SITE AS IT IS NOW (1.4.92; Manuel, 2026-10-11: "the undo ... doesn't work").
		   A step holds the style as it stood: the saved record of its day and the changes over it. Putting that record
		   back as the saved one (restoreBase, 0.31.0) held for a moment only: the save that follows asks the site first,
		   the site answers with the newer record, the page takes it, and the step is gone again. Measured live: Undo drew
		   the old look, and two seconds later the new one was back. So the step is worked out as the whole look it was,
		   and that look is written as changes over the record the site holds NOW (entryFromRecord, as a version brought
		   back is), which no refresh can take away; the save then puts it on the site. The old way stays for a step of
		   another style or of a style that is not the site's. */
		/* (landStep is the function below, hoisted) */
		/* The key the next Undo takes back ('' when it is not known). */
		undoWhat: function () { var h = HISTORY[HISTORY.length - 1]; return h && h.what || ''; },
		canRedo: function () { return FUTURE.length > 0; },
		redoWhat: function () { var h = FUTURE[FUTURE.length - 1]; return h && h.what || ''; },
		redo: function () {
			var h = FUTURE.pop(); if (!h) return false;
			var was = ''; try { was = localStorage.getItem(TWEAKS_KEY) || '{}'; } catch (e) { /* private window */ }
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
			var now = ''; try { now = localStorage.getItem(TWEAKS_KEY) || '{}'; } catch (e) { /* private window */ }
			FUTURE.push({ tweaks: now, side: storedSide(), style: current, what: h.what, base: siteBase(current) }); /* what stands now, for Redo */
			undoing = true;
			var s = landStep(h);
			if (s) { apply(s, wanted(s)); applyRoles(); }
			if (h.side && h.side !== storedSide()) press('[data-quire-modes="palette"] [data-side="' + h.side + '"]');
			undoing = false; lastPush = 0; keepHistory(); siteSaveSoon();
			mark();
			return true;
		},
		/* ONE STYLE'S CHANGES GO, NOTHING ELSE (2026-09-24, the tile's own menu): the side,
		   the accent and the focus stay as the reader has them, which Reset everything
		   does not. On the style that is on, the style is put on again; Original's
		   changes are the dials themselves, so it is given back whole. */
		/* WHAT THIS STYLE CARRIES OVER ITS SAVED SELF, and a way back for a part of it
		   (Manuel, 2026-09-24, the changed-setting dots): paths as the tweak holds them,
		   'lines', 'roles.head', 'roles.head.size', 'colours.dark.ink'. */
		changes: function () {
			var s = byId(current) || {}, e = readTweaks()[current] || {}, out = {};
			/* the four dials are kept as a set when any one moves (remember), so a dial equal to the recipe is no change */
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
		/* VERSIONS (see readVersions): this browser's, newest first, each { t, record };
		   the style as saved or published; one kept now; a look at one on the page
		   (null ends it); and one brought back, which Undo takes back. */
		versions: function () { var s = byId(current); if (!s || s.host) return []; var l = readVersions()[s.id]; return Array.isArray(l) ? l.slice() : []; },
		savedRecord: function () { var s = byId(current); return s && !s.host ? savedRecord() : null; },
		nowRecord: function () {
			var s = byId(current); if (!s || s.host) return null;
			if (!previewing) return lookOf(JSON.parse(this.exportStyle() || '{}'));
			/* while a version is on the page, Now is what stood before the look */
			var shown = null; try { shown = localStorage.getItem(TWEAKS_KEY); if (previewing.raw === null) localStorage.removeItem(TWEAKS_KEY); else localStorage.setItem(TWEAKS_KEY, previewing.raw); } catch (e) { return null; }
			var out = lookOf(JSON.parse(this.exportStyle() || '{}'));
			try { if (shown === null) localStorage.removeItem(TWEAKS_KEY); else localStorage.setItem(TWEAKS_KEY, shown); } catch (e) { /* as above */ }
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
		restoreVersion: function (rec, what) { /* what: the name Undo says (a setting's key, 'changes'); a version brought back by default */
			var s = byId(current); if (!s || s.host || !rec) return false;
			endPreview();
			keepVersion(); /* what stood is kept too, so the list can bring it back as well as Undo */
			var all = readTweaks(), e = entryFromRecord(rec);
			if (Object.keys(e).length) all[s.id] = e; else delete all[s.id];
			lastPush = 0; writeTweaks(all);
			if (HISTORY.length) { HISTORY[HISTORY.length - 1].what = what || 'version'; keepHistory(); }
			applyNow(s, wanted(s)); applyRoles();
			return true;
		},
		reset: function (id) {
			var s = byId(id); if (!s) return;
			if (s.host) { goHome(); return; } /* there is nothing to reset TO but the theme itself */
			var all = readTweaks(); delete all[id]; writeTweaks(all);
			apply(s, s);
			/* EVERYTHING (Manuel, 2026-09-13: "it really should reset everything"):
			   the side back to its default, the accent on, the focus mode on; the
			   text size is in the recipe already. */
			/* THE DEFAULT SIDE IS SYSTEM AGAIN (Manuel, 2026-10-11: "the default should be auto for readers... Set it to auto"); a reset lands where a first visit lands. From 2026-09-19 to 1.4.88 both were dark on his word of that day. */
			press('[data-quire-modes="palette"] [data-side="auto"]');
			this.setAccent(true);
			this.setFocus(false);
		}
	};

	/* The article's face is stamped by reading-face.js and the interface's
	   by applySans: the roles read both, so they follow every change. */
	new MutationObserver(function () { applyRoles(); }).observe(root, { attributes: true, attributeFilter: ['data-face', 'data-sans'] });
	/* The fills' strength multiplies the pair's own steps, which change with the pair and the side. */
	new MutationObserver(function () { if (root.hasAttribute('data-fill')) applyLevels(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

	function renderHosts() {
		var CHECK = window.QuireIcons
			? window.QuireIcons.markup('check', 'class="quire-menu-check"')
			: '';
		document.querySelectorAll('[data-architrave-presets]').forEach(function (host) {
			/* THE STYLES BEING TUNED (Manuel, 2026-09-07 evening): only the
			   finished ones are offered; the rest stay in STYLES, hidden, and
			   come back one by one as their rooms are made right. */
			host.innerHTML = STYLES.filter(offered).map(function (p) {
				return '<li><button type="button" class="quire-menu-item" role="menuitemradio" ' +
					'aria-checked="false" data-preset="' + p.id + '">' +
					'<span class="quire-menu-label">' + t(p.label) + '</span>' + CHECK + '</button></li>';
			}).join('');
		});
		mark();
	}

	/* A TILE'S REST THAT MOVED REACHES WHO WORE IT (Manuel, 2026-09-30, Brochure B live: "sorry but that looks so different. Make it like in the lab"). The four dials are kept by their own scripts under their own keys, so a browser that wore a tile keeps the tile's OLD size, face and leading when a release changes them, and the next echo records them as an adjustment nobody made (his Brochure stood in the small Garamond of its first version under the new tile's everything else). A tile names the rests it has left here. At load: a record whose dials are exactly an old rest loses them, and where that tile is on and the page still wears an old rest, the tile's dials are pressed again. A reader who changed any dial away from the old rest has made a choice and keeps it. */
	var RESTED = {}; /* the tiles' old rests left with them (2026-10-02); the shape: { id: [ { palette, reading, face, leading } ] } */
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
		/* A REMOVED STYLE'S LEFTOVERS (0.31.2, found on the AI helper's own browser: Original drawn in Brochure's STIX Two
		   Text and tight lines). The face, the line spacing and the colour pair live under keys of their own and are put on
		   before paint; when the style that set them left (the clean-up of 2026-10-02 took fifteen), nothing named them in
		   RESTED and they stayed, over whatever style the browser fell back to. At load the style on the page now says
		   which face, line spacing and pair it wears, with the reader's own changes (its tweaks) in it. The text size is
		   the reader's own and is left as the page has it. */
		var w = s && !s.host ? wanted(s) : null;
		if (w && ['face', 'leading', 'palette'].some(function (k) { return k !== 'palette' ? w[k] !== d[k] : (w.palette || 'neutral') !== d.palette; })) {
			var keep = {}; Object.keys(w).forEach(function (k) { keep[k] = w[k]; }); keep.reading = d.reading;
			apply(s, keep);
		}
	}

	document.addEventListener('DOMContentLoaded', function () {
		renderHosts();
		if (seeded) apply(byId(current), wanted(byId(current))); /* a first visit on a site default, or a link: the rows follow the stamp (above) */
		restMoved();
		/* A carried link reached while the page is open changes the hash and
		   nothing else, so it is read here as well as before paint. */
		window.addEventListener('hashchange', function () {
			var m = /^#style=(.+)$/.exec(window.location.hash), data = m && decodeRecord(m[1]);
			if (!data) return;
			var entry = ownFromRecord(data); renderHosts(); apply(entry, entry);
			try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) { /* the address stays */ }
		});
		/* (the focus square's count and its press are focus-mode.js's now) */
		/* THE PAIR ARRIVES LATE (2026-09-12): color-mode.js swaps the palette
		   inside a view transition, after the press returns, so a reset or a
		   press that read the pair at once read the old one and the lines
		   stayed (Manuel: "if we are on Standard and I clicked Zurücksetzen,
		   that toggle for the lines is still on"). The switches are stamped
		   again when the page's theme actually changes. */
		new MutationObserver(function (records) {
			/* AND THE RECORD IS TAKEN HERE TOO (2026-09-12, measured live: the
			   press remembered the pair before it, so Standard's record said
			   Schwarzweiß after Neutral was chosen, and the next press or a
			   return to the tile played it back with the lines). A dial's
			   change on <html> is the fact; the press was only the wish. */
			if (records.some(function (r) { return r.attributeName === 'data-theme'; }) && applying) { applying = false; if (applyTimer) { clearTimeout(applyTimer); applyTimer = null; } }
			if (!applying) remember();
			if (records.some(function (r) { return r.attributeName === 'data-theme'; })) applyOptions();
			mark();
		}).observe(root, {
			attributes: true,
			attributeFilter: ['data-theme', 'data-reading', 'data-face', 'data-leading']
		});

		document.addEventListener('click', function (e) {
			/* A WAY BACK (2026-09-09). The row under the dials puts Standard on
			   with every dial at rest, forgetting Standard's own tweaks, and
			   shows only while something is off that rest. */
			if (e.target.closest('[data-architrave-reset]')) {
				if (STYLES[0] && STYLES[0].host) { slowly(goHome); return; }
				var all = readTweaks(); delete all[DEFAULT]; writeTweaks(all);
				apply(STYLES[0], STYLES[0]);
				return;
			}
			var row = e.target.closest('[data-preset]');
			if (row) {
				var p = byId(row.getAttribute('data-preset'));
				/* THE WAY BACK TO A CLEAN STYLE (2026-09-09, Manuel, live: "I
				   wanted to go back to the Book preset, there was no way"). A
				   tweak is remembered, so pressing Book brought back the tweaked
				   Book. Pressing the style that is already on, while it says
				   adjusted, forgets its tweaks and puts its recipe on: press once
				   to come back, press again to come back clean. */
				/* Adjusted by any dial, not the four alone (measured live
				   2026-09-13: a Book with square corners never came back clean). */
				/* THE DOUBLE-PRESS IS GONE (the audit, 2026-09-13: a hidden gesture
				   beside a visible reset; Books has one Reset Theme and nothing
				   on a tile). A press on the tile that is on re-applies it as
				   the reader left it; Zurücksetzen alone forgets the tweaks. */
				if (p && p.host) slowly(goHome); /* the theme's own look arrives with the same dissolve as any other tile */
				else if (p) apply(p, wanted(p));
				// The menu stays open, like the four dials: the check arriving
				// is the proof, and the page re-setting behind it.
				return;
			}
			if (applying) return;
			var dial = e.target.closest('[data-quire-modes="palette"] [data-palette], [data-reading-step], [data-face-choice], [data-leading-step]');
			void dial; /* remembered by the observer above, once the change has landed */
		});
	});
})();
