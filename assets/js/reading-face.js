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
	
	var FACES = [
		{ id: 'inter', label: 'Inter', group: 'sans', family: '"Inter Variable", Inter, system-ui, sans-serif' },
		{ id: 'hyperlegible', label: 'Atkinson Hyperlegible', group: 'sans', family: '"Atkinson Hyperlegible Next", sans-serif' },
		{ id: 'geist', label: 'Geist', group: 'sans', family: '"Geist Variable", Geist, system-ui, sans-serif' },
		{ id: 'plex-sans', label: 'IBM Plex Sans', group: 'sans', family: '"IBM Plex Sans", system-ui, sans-serif' },
		{ id: 'newsreader', label: 'Newsreader', group: 'serif', family: '"Newsreader", Georgia, serif' },
		{ id: 'libre-baskerville', label: 'Libre Baskerville', group: 'serif', family: '"Libre Baskerville Variable", "Libre Baskerville", Georgia, serif' },
		{ id: 'vollkorn', label: 'Vollkorn', group: 'serif', family: '"Vollkorn Variable", Vollkorn, Georgia, serif' },
		{ id: 'mono', label: 'Geist Mono', group: 'mono', family: '"Geist Mono", ui-monospace, Menlo, monospace' },
		{ id: 'martian-mono', label: 'Martian Mono', group: 'mono', family: '"Martian Mono Variable", "Martian Mono", ui-monospace, Menlo, monospace' },
		{ id: 'kode-mono', label: 'Kode Mono', group: 'mono', family: '"Kode Mono Variable", "Kode Mono", ui-monospace, Menlo, monospace' },
		{ id: 'jetbrains-mono', label: 'JetBrains Mono', group: 'mono', family: '"JetBrains Mono", ui-monospace, Menlo, monospace' },
		
		{ id: 'doto', label: 'Doto', group: 'pixel', family: '"Doto", ui-monospace, monospace' },
		
		{ id: 'vt323', label: 'VT323', group: 'pixel', family: '"VT323", ui-monospace, monospace' },
		{ id: 'handjet', label: 'Handjet', group: 'pixel', family: '"Handjet", system-ui, sans-serif' }
	];
	(window.ArchitraveFontLibrary || []).forEach(function (f) {
		if (!FACES.some(function (x) { return x.id === f.id; })) FACES.push({ id: f.id, label: f.label, group: f.group, family: f.family });
	});
	window.ArchitraveFaces = FACES;
	var ids = FACES.map(function (f) { return f.id; });
	var RETIRED = {
		serif: 'newsreader', sans: 'inter',
		'source-sans': 'hyperlegible', 
		'plex-mono': 'jetbrains-mono', 
		manrope: 'geist',              
		'space-grotesk': 'geist',
		bricolage: 'bricolage-grotesque',  
		'bodoni-moda': 'libre-baskerville', 
		'eb-garamond': 'vollkorn',          
		fraunces: 'vollkorn',               
		'jetbrains-mono': 'mono',
		tourney: 'vt323',                   
		workbench: 'vt323',                 
		bitcount: 'vt323',                  
		'geist-pixel': 'vt323',             
		pixelify: 'pixelify-sans'           
	};
	
	function apply(face, chosen) {
		if (face === DEFAULT && !(chosen && window.architravePanelGuest)) root.removeAttribute(ATTR);
		else root.setAttribute(ATTR, face);
	}
	var raw = null;
	try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }
	if (RETIRED[raw] && ids.indexOf(raw) === -1) raw = RETIRED[raw]; 
	var initial = ids.indexOf(raw) !== -1 ? raw : DEFAULT;
	
	if (ids.indexOf(raw) !== -1 || !root.hasAttribute(ATTR)) apply(initial, ids.indexOf(raw) !== -1); 
	else initial = ids.indexOf(root.getAttribute(ATTR)) !== -1 ? root.getAttribute(ATTR) : initial;
	document.addEventListener('DOMContentLoaded', function () {
		var CHECK = window.QuireIcons
			? window.QuireIcons.markup('check', 'class="quire-menu-check"')
			: '';
		
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
		document.addEventListener('click', function (e) {
			var row = e.target.closest('[data-face-choice]');
			if (!row) return;
			var face = row.getAttribute('data-face-choice');
			if (ids.indexOf(face) === -1) return;
			apply(face, true);
			try { localStorage.setItem(KEY, face); } catch (err) {}
			mark(face);
		});
	});
})();
