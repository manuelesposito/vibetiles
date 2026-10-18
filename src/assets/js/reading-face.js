/**
 * Architrave — the reading face.
 *
 * Five faces, picked by the reader from the More menu, held in localStorage
 * and written to <html> as `data-face`. The stylesheet does the rest: one
 * token, --font-reading, is what every line of the article takes its family
 * from, and `:root[data-face="…"]` points it at the chosen face.
 *
 * THE SHAPE IS THE READING SCALE'S, on purpose. Same storage-then-attribute
 * model, same menu grammar, same `.is-selected` plus check to say which is on,
 * same delegated click. A reader who has used one control has used the other.
 *
 * THE LIST IS THIS THEME'S, NOT A REGISTRY'S, and that is the honest place
 * for it: which faces a site reads in is the site's own decision. Chosen on
 * lab/the-reading-face.html (2026-09-05): Newsreader, Libre Baskerville,
 * Inter, Geist Mono, Pixelify Sans — every one of them variable. The pixel
 * choice is a TRIO since 2026-09-06 (Sixtyfour retired): Pixelify Sans for
 * the article and the interface (Handjet held the interface until 2026-09-07),
 * Workbench for code. A browser
 * fetches a face only when text is set in it, so the list is free until
 * someone picks from it.
 *
 * NEWSREADER NEEDS NO ATTRIBUTE. It is what `:root` says, so the resting
 * state is the absence of a choice, and a reader with no JavaScript reads
 * exactly what they always did. Every other choice is stamped before first
 * paint for the same reason the reading size is: a face that arrives late
 * reflows every line on the page.
 *
 * THE FIRST RELEASE (1.1.438) KNEW TWO IDS, `serif` and `sans`, and any
 * browser that saw it may still hold one. They resolve to their successors
 * rather than falling back to the default, so nobody's choice is lost.
 */
(function () {
	var root = document.documentElement;
	var KEY = 'architrave-face';
	var ATTR = 'data-face';
	var DEFAULT = 'newsreader';

	/* `family` is for the reading panel's rows, which show each name in its
	   own face (2026-09-09); the names are the ones theme.json registers. */
	/* THE TWELVE (Manuel, 2026-09-17, final), in four sections, three faces
	   each: Inter, Atkinson Hyperlegible, Geist; Newsreader, Libre Baskerville,
	   Vollkorn; Geist Mono, Martian Mono, Kode Mono; Geist Pixel, Workbench,
	   Pixelify Sans. The morning's list had a Display section — Tourney,
	   Bricolage Grotesque, Workbench — and the evening's names the section for
	   what is in it: the fourth is PIXEL, and all three of its faces are pixel
	   faces. Manrope, Bodoni Moda, EB Garamond, JetBrains Mono, Tourney and
	   Bricolage Grotesque left with it; Vollkorn and Kode Mono came back, and
	   Geist is here as a text face beside Geist Mono.

	   ALL VARIABLE BUT ONE. That was the rule ("all fonts should be variable
	   fonts, nothing else") and Geist Pixel cannot keep it: Vercel draws it as
	   five separate faces — Square, Grid, Circle, Triangle, Line — each one
	   weight, no axes at all. Square is the one shipped here, the plainest of
	   the five and the closest to a text face. It is not the first face without
	   a weight axis: Workbench has none either (its two are a bleed and a
	   scanline), so the weight row already knows how to disable itself, and the
	   same rule carries Geist Pixel.

	   `group` names the section, `family` is for the rows, which show each name
	   in its own face (2026-09-09); the names are the ones theme.json registers. */
	var FACES = [
		/* Serifenlos */
		{ id: 'inter', label: 'Inter', group: 'sans', family: '"Inter Variable", Inter, system-ui, sans-serif' },
		{ id: 'hyperlegible', label: 'Atkinson Hyperlegible', group: 'sans', family: '"Atkinson Hyperlegible Next", sans-serif' },
		{ id: 'geist', label: 'Geist', group: 'sans', family: '"Geist Variable", Geist, system-ui, sans-serif' },
		/* IBM PLEX SANS (Manuel, 2026-09-19, the photograph Blueprint was drawn from): the spread's reading face, variable, 100 to 700, with its italic. Its mono, the spread's headline face, is static and came out the same evening (RETIRED, below): JetBrains Mono stands in for it, chosen from six variable monos with a real italic, set beside Plex's on one sheet, as the nearest hand. The list is variable-only again. */
		{ id: 'plex-sans', label: 'IBM Plex Sans', group: 'sans', family: '"IBM Plex Sans", system-ui, sans-serif' },
		/* Serif */
		{ id: 'newsreader', label: 'Newsreader', group: 'serif', family: '"Newsreader", Georgia, serif' },
		{ id: 'libre-baskerville', label: 'Libre Baskerville', group: 'serif', family: '"Libre Baskerville Variable", "Libre Baskerville", Georgia, serif' },
		{ id: 'vollkorn', label: 'Vollkorn', group: 'serif', family: '"Vollkorn Variable", Vollkorn, Georgia, serif' },
		/* Monospace */
		{ id: 'mono', label: 'Geist Mono', group: 'mono', family: '"Geist Mono", ui-monospace, Menlo, monospace' },
		{ id: 'martian-mono', label: 'Martian Mono', group: 'mono', family: '"Martian Mono Variable", "Martian Mono", ui-monospace, Menlo, monospace' },
		{ id: 'kode-mono', label: 'Kode Mono', group: 'mono', family: '"Kode Mono Variable", "Kode Mono", ui-monospace, Menlo, monospace' },
		{ id: 'jetbrains-mono', label: 'JetBrains Mono', group: 'mono', family: '"JetBrains Mono", ui-monospace, Menlo, monospace' },
		/* Pixel */
		/* VARIABLE ONLY (Manuel, 2026-09-18: "kick out all fonts that are not variable"): Geist Pixel is static and Workbench has no weight axis, so Workbench's headline drew in a bold the browser faked. Doto and Bitcount, both 100 to 900, stand where they stood. */
		{ id: 'doto', label: 'Doto', group: 'pixel', family: '"Doto", ui-monospace, monospace' },
		/* GEIST PIXEL, BACK (Manuel, 2026-09-18, the same afternoon: "it's okay that it has no weight axis … it's a beautiful font"): Google's variable file, whose one axis is the element shape, square to round; one weight, so Schriftstärke greys out on it as it did on Workbench. Bitcount, in for three hours, out. */
		/* VT323 AND HANDJET (Manuel, 2026-09-20: "replace the fonts Geist Pixel and Pixelify Sans with VT323 and Handjet"). VT323, the terminal face, stands where Geist Pixel stood: monospace, one weight, so Schriftstärke greys out on it the same way. Handjet stands where Pixelify Sans stood: proportional and variable, 100 to 900. */
		{ id: 'vt323', label: 'VT323', group: 'pixel', family: '"VT323", ui-monospace, monospace' },
		{ id: 'handjet', label: 'Handjet', group: 'pixel', family: '"Handjet", system-ui, sans-serif' }
	];
	/* THE LIBRARY (2026-09-23; Manuel: "can we get them all in?"). Seventy-four
	   faces more, in five sections now, Display the fifth: one line each in
	   tools/font-library.json, and tools/font-library.py writes the files, the
	   rules and window.ArchitraveFontLibrary. They come after the fifteen above,
	   which keep their order and their history. */
	(window.ArchitraveFontLibrary || []).forEach(function (f) {
		if (!FACES.some(function (x) { return x.id === f.id; })) FACES.push({ id: f.id, label: f.label, group: f.group, family: f.family });
	});
	window.ArchitraveFaces = FACES;
	var ids = FACES.map(function (f) { return f.id; });
	/* A CHOICE IS NEVER LOST when a face leaves the list. Every id this theme
	   has ever stamped resolves to the nearest thing still shipping rather than
	   falling back to the default, which is what this map has always been for.
	   The six that went on the evening of 2026-09-17 go to their own kind: the
	   grotesques to Geist, the modern serif to Libre Baskerville, the old-style
	   one to Vollkorn, the mono to Geist Mono, and Tourney, the marquee, to the
	   pixel face that stands where a display face stood. */
	var RETIRED = {
		serif: 'newsreader', sans: 'inter',
		'source-sans': 'hyperlegible', /* humanist sans to humanist sans */
		'plex-mono': 'jetbrains-mono', /* IBM Plex Mono, in the theme for a few hours on 2026-09-19: static, so its weight slider had four stops and two cuts to show for them in italic. JetBrains Mono is variable, 100 to 800, with a true italic of the same hand. */
		manrope: 'geist',              /* geometric sans to the grotesque that replaced it */
		'space-grotesk': 'geist',
		bricolage: 'bricolage-grotesque',  /* back in the library (2026-09-23) under its full name; manrope, space-grotesk, bodoni-moda, eb-garamond, fraunces, workbench and geist-pixel are back under their own */
		'bodoni-moda': 'libre-baskerville', /* the modern serif to the transitional one */
		'eb-garamond': 'vollkorn',          /* the old-style serif to the book serif */
		fraunces: 'vollkorn',               /* registered but never listed; Book's own serif now */
		'jetbrains-mono': 'mono',
		tourney: 'vt323',                   /* the display slot is the pixel section's now */
		workbench: 'vt323',                 /* the face without a weight axis (2026-09-18) */
		bitcount: 'vt323',                  /* three hours in the list the same day */
		'geist-pixel': 'vt323',             /* the one-weight monospace pixel face to the other (2026-09-20) */
		pixelify: 'pixelify-sans'           /* back in the library (2026-09-23) under its full name */
	};

	/* A GUEST WRITES THE DEFAULT TOO (0.9.0). On Architrave the attribute's
	   ABSENCE is Newsreader, because Newsreader is the theme's own reading
	   face and the stylesheet rests on it. On a stranger's theme it is not:
	   a reader who picks Newsreader is asking for a face the page has never
	   had, and clearing the attribute would leave the host's own face
	   standing and the row saying Newsreader. So where the panel is a guest
	   the attribute is written for every face, including the default, and
	   only a reader who has chosen nothing at all has none. */
	function apply(face, chosen) {
		if (face === DEFAULT && !(chosen && window.architravePanelGuest)) root.removeAttribute(ATTR);
		else root.setAttribute(ATTR, face);
	}

	var raw = null;
	try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }
	if (RETIRED[raw] && ids.indexOf(raw) === -1) raw = RETIRED[raw]; /* a face that came back is itself again, not what stood in for it; this is also what JetBrains Mono needed since it returned on 2026-09-19 */
	var initial = ids.indexOf(raw) !== -1 ? raw : DEFAULT;

	/* THE SERVER'S WORD STANDS WHERE NOTHING IS STORED (0.58.0, the first paint
	   printed): a site default's face is on the root before any script runs
	   (inc/site-styles.php, architrave_first_paint_attributes), and clearing it
	   here, as "nothing chosen" did, made the page fall back to Newsreader for
	   a frame until presets.js, now deferred, put the face back. A reader who
	   has chosen nothing keeps what the page came with; a choice still rules. */
	if (ids.indexOf(raw) !== -1 || !root.hasAttribute(ATTR)) apply(initial, ids.indexOf(raw) !== -1); /* a choice is a face this list knows; a stored word it does not is nothing chosen, not the default chosen */
	else initial = ids.indexOf(root.getAttribute(ATTR)) !== -1 ? root.getAttribute(ATTR) : initial;

	document.addEventListener('DOMContentLoaded', function () {
		var CHECK = window.QuireIcons
			? window.QuireIcons.markup('check', 'class="quire-menu-check"')
			: '';

		/* THE ROWS ARE BUILT, NOT TYPED. The rail's flyout and the phone's
		   modal are the same choice on two surfaces, so both are filled from
		   the one list above. */
		document.querySelectorAll('[data-architrave-face]').forEach(function (host) {
			host.innerHTML = FACES.map(function (f) {
				return '<li><button type="button" class="quire-menu-item" role="menuitemradio" ' +
					'aria-checked="false" data-face-choice="' + f.id + '">' +
					'<span class="quire-menu-label">' + f.label + '</span>' + CHECK + '</button></li>';
			}).join('');
		});

		function mark(face) {
			document.querySelectorAll('[data-face-choice]').forEach(function (b) {
				var on = b.getAttribute('data-face-choice') === face;
				b.classList.toggle('is-selected', on);
				b.setAttribute('aria-checked', on ? 'true' : 'false');
			});
		}

		mark(initial);

		// Delegated, because the phone's rows live in a panel that is
		// summoned — they do not exist when this runs.
		document.addEventListener('click', function (e) {
			var row = e.target.closest('[data-face-choice]');
			if (!row) return;
			var face = row.getAttribute('data-face-choice');
			if (ids.indexOf(face) === -1) return;
			apply(face, true);
			try { localStorage.setItem(KEY, face); } catch (err) {}
			mark(face);
			// The menu stays open, like the other two: the check moving in
			// front of you is the proof, and the page re-setting behind it.
		});
	});
})();
