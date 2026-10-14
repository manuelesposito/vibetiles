/*
 * THE AI DOOR ON A REAL SITE: window.LiveDesign (build plan, "The AI door on a real site", 2026-09-28).
 *
 * An AI styles the site through the same door a person's window uses. It reads what every
 * setting MEANS, changes settings by their saved names (radius, space, roles.body.size,
 * colours.dark.accent; the words a saved style uses, since 0.27.0), sees each change as ONE step the owner can undo, and gets the
 * reading check back in numbers. It speaks the lab prototype's words (describe, set,
 * preview, endPreview, check, explain, undo, redo, style, load, choose, open), so the
 * connector (github.com/manuelesposito/vibetiles-connector) works on the lab page and on a real site alike.
 *
 * It owns nothing: every read and write goes through the window's host
 * (window.LiveDesignHost.style) and the engine's own description of the record
 * (ArchitraveStyles.schema / guide). A change is written as a whole record through
 * restoreVersion, which keeps what stood as a version and is one Undo; a preview goes
 * through previewVersion, which keeps nothing. Nothing goes live without Publish.
 *
 * Served only to someone who may edit the design, on the page where the new window is.
 */
(function () {
	'use strict';

	function H() { return window.LiveDesignHost || null; }
	function S() { var h = H(); return h ? h.style : null; }
	function E() { return window.ArchitraveStyles || null; }
	var WHO = 'AI';

	function clone(o) { return o == null ? o : JSON.parse(JSON.stringify(o)); }
	function schema() { try { return E().schema(); } catch (e) { return {}; } }
	function meaning() { try { return E().guide().meaning || {}; } catch (e) { return {}; } }
	function list() { var h = H(); return (h && h.settings && h.settings.list) || []; }
	function roleList() { var h = H(); return (h && h.settings && h.settings.roles) || []; }
	function entry(key) { return list().filter(function (x) { return x.key === key; })[0] || null; }

	/* how many letters apart two words are: a typo still finds its setting */
	function apart(a, b) {
		var m = [], i, j;
		for (i = 0; i <= a.length; i++) m[i] = [i];
		for (j = 0; j <= b.length; j++) m[0][j] = j;
		for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++) m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
		return m[a.length][b.length];
	}
	function nearKeys(q) {
		q = String(q).toLowerCase();
		return list().filter(function (x) { var l = String(x.label || '').toLowerCase(); return x.key.indexOf(q) > -1 || (l && l.indexOf(q) > -1) || apart(x.key, q) <= 2 || (l && apart(l, q) <= 2); }).map(function (x) { return x.key; });
	}

	/* A value in an AI's words, against the values the record allows: a choice by its name, a number on
	   the nearest step, "+1" / "-1" / "more" / "less" to move a step, on/off for a switch. */
	function settle(path, want, cur, allowed) {
		var rel = typeof want === 'string' && /^([+-]\d+|more|less|up|down|bigger|smaller)$/.test(want) ? (/^[+-]/.test(want) ? parseInt(want, 10) : /more|up|bigger/.test(want) ? 1 : -1) : 0;
		if (allowed === 'boolean') { if (typeof want === 'string') want = /^(on|true|yes|1)$/i.test(want); return { value: !!want }; }
		if (allowed === 'hex') { var h = String(want).trim().toLowerCase(); if (/^#[0-9a-f]{3}$/.test(h)) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]; return /^#[0-9a-f]{6}$/.test(h) ? { value: h } : { error: '"' + want + '" is not a colour for ' + path + '. Write it as #rrggbb.' }; }
		if (!Array.isArray(allowed)) return { value: want };
		var vals = allowed.map(String);
		if (rel) { var at = vals.indexOf(String(cur)); if (at === -1) return { error: 'Cannot move ' + path + ' a step: its value now is not known. Give a value: ' + vals.join(', ') }; return { value: allowed[Math.max(0, Math.min(vals.length - 1, at + rel))] }; }
		var i = vals.indexOf(String(want).toLowerCase());
		if (i === -1) i = vals.indexOf(String(want));
		if (i > -1) return { value: allowed[i] };
		var n = parseFloat(want), nums = vals.map(parseFloat);
		if (!isNaN(n) && nums.every(function (x) { return !isNaN(x); })) {
			var best = 0; nums.forEach(function (x, k) { if (Math.abs(x - n) < Math.abs(nums[best] - n)) best = k; });
			return { value: allowed[best], adjusted: nums[best] === n ? undefined : 'No step at ' + want + '; took the nearest, ' + allowed[best] };
		}
		return { error: '"' + want + '" is not a value for ' + path + '. Values: ' + vals.join(', ') };
	}

	/* What a saved name may hold, from the engine's schema; only the settings the window shows are open to an AI. */
	function allowedFor(path, sc) {
		var p = path.split('.');
		if (p[0] === 'roles') {
			var r = (sc.roles || {})[p[1]];
			if (!r) return { error: 'There is no role "' + p[1] + '". Roles: ' + Object.keys(sc.roles || {}).join(', ') };
			if (p.length !== 3 || !r[p[2]]) return { error: 'Role "' + p[1] + '" has no dial "' + p[2] + '". Dials: ' + Object.keys(r).filter(function (k) { return r[k] !== undefined; }).join(', ') };
			return { allowed: r[p[2]] };
		}
		if (p[0] === 'colours') {
			if (p.length !== 3 || ['light', 'dark'].indexOf(p[1]) === -1) return { error: 'Colours are colours.<light|dark>.<well>, e.g. colours.dark.accent.' };
			var wells = Object.keys(((sc.colours || {}).light) || {});
			if (wells.indexOf(p[2]) === -1) return { error: 'There is no colour well "' + p[2] + '". Wells: ' + wells.join(', ') };
			return { allowed: 'hex' };
		}
		if (!entry(path)) { var near = nearKeys(path); return { error: 'There is no setting "' + path + '".' + (near.length ? ' Did you mean ' + near.join(', ') + '?' : ' Call describe() for the list.') }; }
		return { allowed: path in sc ? sc[path] : (entry(path).choices || entry(path).steps || null) };
	}
	function at(o, path) { return path.split('.').reduce(function (x, k) { return x == null ? undefined : x[k]; }, o); }
	function put(o, path, v) { var p = path.split('.'), x = o; for (var i = 0; i < p.length - 1; i++) { if (!x[p[i]] || typeof x[p[i]] !== 'object') x[p[i]] = {}; x = x[p[i]]; } x[p[p.length - 1]] = v; }

	/* What a saved name holds on the page now, where the record leaves it at its rest. */
	function liveValue(path) {
		var s = S(), p = path.split('.');
		try {
			if (p[0] === 'roles' && p.length === 3) return (s.type(p[1]) || {})[p[2]]; /* the seven roles as a saved style names them */
			if (p[0] === 'colours') return p[1] === s.side() ? s.colour(p[2]) : undefined;
			if (p.length === 1 && entry(path)) return s.get(path);
		} catch (e) { /* unknown here: the step starts from the first */ }
		return undefined;
	}
	/* The style as it stands, as a record; the theme's own look is never changed, a copy of it is. */
	function nowRecord() { var e = E(); return e && e.nowRecord ? e.nowRecord() : null; }
	/* Choosing a style or making a copy lands a moment after the press: wait for the engine to say so. */
	function until(test, ms) {
		return new Promise(function (done) {
			var t0 = Date.now();
			(function tick() { if (test() || Date.now() - t0 > (ms || 3000)) done(test()); else setTimeout(tick, 50); }());
		});
	}
	/* the check measures the page as it is drawn after a change */
	function painted() { return new Promise(function (done) { requestAnimationFrame(function () { requestAnimationFrame(function () { setTimeout(done, 30); }); }); }); }
	/* the site's styles as they are now, before any step (0.32.1): another browser may have changed the one shown here */
	function fresh() { var e = E(); return e && e.refreshSite ? e.refreshSite(true) : Promise.resolve(false); }
	function editableRecord() { return fresh().then(editableNow); }
	function editableNow() {
		var s = S(), e = E(); if (!s || !e) return Promise.resolve({ error: 'The panel is not ready on this page.' });
		if (s.editable() && nowRecord()) return Promise.resolve({ record: nowRecord() });
		var was = e.current();
		if (!s.makeCopy()) return Promise.resolve({ error: 'This style cannot be changed and no copy could be made.' });
		return until(function () { return e.current() !== was && !!nowRecord(); }).then(function (ok) {
			return ok ? { record: nowRecord(), madeCopy: s.name() } : { error: 'A copy of this style was made but did not open; try again.' };
		});
	}

	/* Every change planned first, nothing written until all of it is known: the side is a view, the preset a pick, the rest one record. */
	function plan(changes, base) {
		var sc = schema(), rec = clone(base) || {}, done = [], problems = [], unchanged = [], view = null, preset = null;
		Object.keys(changes || {}).forEach(function (path) {
			var want = changes[path];
			if (path === 'side' || path === 'view.side') {
				var sv = settle('side', want, S().view(), ['light', 'dark', 'auto']);
				if (sv.error) return problems.push({ key: path, problem: sv.error });
				view = sv.value; done.push({ key: 'side', from: S().view(), to: sv.value, says: 'Only what you look at: the style holds both sides, readers choose their own.' });
				return;
			}
			if (path === 'preset') {
				var ids = S().presets().map(function (x) { return x.id; }), hit = S().presets().filter(function (x) { return x.id === want || x.id === 'preset:' + want || x.id === 'pair:' + want || String(x.label).toLowerCase() === String(want).toLowerCase(); })[0];
				if (!hit) return problems.push({ key: path, problem: 'No colour preset "' + want + '". Presets: ' + ids.join(', ') });
				preset = hit.id; done.push({ key: 'preset', to: hit.id, says: hit.label });
				return;
			}
			var a = allowedFor(path, sc);
			if (a.error) return problems.push({ key: path, problem: a.error });
			if (!hereOn(path)) return problems.push({ key: path, problem: 'Does nothing on this theme: only Architrave\'s own page draws it.' }); /* D3 */
			var cur = at(rec, path); if (cur === undefined) cur = liveValue(path); /* a record names only what moved from its base */
			var r = settle(path, want, cur, a.allowed);
			if (r.error) return problems.push({ key: path, problem: r.error });
			if (JSON.stringify(cur) === JSON.stringify(r.value)) {
				/* A COLOUR NAMED IS KEPT (0.31.3, the AI helper's trial): white asked for the paper, white already showing,
				   so it was left out; the record then named no paper, and once the other colours moved the engine worked
				   one out from them, light grey. A colour the record does not hold yet is written even when it shows. */
				if (path.indexOf('colours.') === 0 && at(rec, path) === undefined) { put(rec, path, r.value); done.push({ key: path, from: cur, to: r.value, says: 'Kept as it shows, so it stays when other colours move.' }); }
				else unchanged.push({ key: path, says: 'already ' + (typeof r.value === 'string' ? r.value : JSON.stringify(r.value)) }); /* an AI told nothing tries again (D4) */
				return;
			}
			put(rec, path, r.value);
			done.push({ key: path, from: cur, to: r.value, adjusted: r.adjusted });
		});
		/* THE DAY LEADS FOR THE AI TOO (2026-10-06, the panel sweep): a copy of another theme's Original holds that
		   theme's night as its own colours, so a colour the AI set by day never reached the night. A night colour that
		   is still the theme's own, and not asked for in the same step, is let go: the night works it out from the day. */
		if (window.architravePanelGuest && rec.colours && rec.colours.dark) {
			var ENG = { background: 'paper', text: 'ink', background2: 'ground', card: 'lift', mutedText: 'muted', highlight: 'marker' }, theirs = {};
			try { theirs = (E().colours('host') || {}).dark || {}; } catch (e) { /* no theme night to compare with */ }
			done.forEach(function (c) {
				var m = /^colours\.light\.(\w+)$/.exec(c.key); if (!m || changes['colours.dark.' + m[1]] !== undefined) return;
				var mine = rec.colours.dark[m[1]], th = theirs[m[1]] || theirs[ENG[m[1]]];
				if (mine && th && String(mine).toLowerCase() === String(th).toLowerCase()) delete rec.colours.dark[m[1]];
			});
		}
		return { record: rec, changed: done, problems: problems, unchanged: unchanged, view: view, preset: preset };
	}

	/* THE READING CHECK, measured on the page: contrast of text, links and buttons, the reading size,
	   letters per line and line spacing of the article's paragraphs, with a suggested fix for each warning. */
	var READ = '.wp-block-post-content p, .entry-content p, article p, main p, p';
	function readingParagraph() { /* the longest paragraph of the article: a caption or a footer line is not the reading text */
		var best = null, most = 0;
		Array.prototype.forEach.call(document.querySelectorAll(READ), function (p) { if (p.closest('.reading-panel, #ldp-window, #wpadminbar')) return; var n = (p.textContent || '').length; if (n > most && p.getBoundingClientRect().width > 0) { best = p; most = n; } });
		return best;
	}
	function contrast(a, b) { var s = S(); return s ? Math.round(s.contrast(a, b) * 10) / 10 : 0; }
	function check() {
		var s = S(); if (!s) return { ok: false, facts: {}, warnings: [{ says: 'The panel is not ready on this page.' }] };
		var paper = s.colour('paper'), ink = s.colour('ink'), accent = s.colour('accent'), button = s.colour('button');
		var btnInk = contrast(button, '#ffffff') >= contrast(button, '#000000') ? '#ffffff' : '#000000';
		var p = readingParagraph(), facts = { side: s.side(), textContrast: contrast(ink, paper), linkContrast: contrast(accent, paper), buttonTextContrast: contrast(btnInk, button) };
		if (p) {
			var cs = getComputedStyle(p), px = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight);
			var cv = document.createElement('canvas').getContext('2d'); cv.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
			var sample = 'the quick brown fox jumps over the lazy dog and keeps reading on', per = cv.measureText(sample).width / sample.length;
			facts.readingSize = Math.round(px);
			facts.lineSpacing = lh > 0 ? Math.round(lh / px * 100) / 100 : null;
			facts.lettersPerLine = per > 0 ? Math.round(p.getBoundingClientRect().width / per) : null;
		}
		var warn = [], add = function (key, says, fix) { warn.push({ key: key, says: says, fix: fix }); };
		if (facts.textContrast < 4.5) add('colours.' + facts.side + '.text', 'The text is hard to read on its paper (contrast ' + facts.textContrast + ', needs 4.5).', (function () { var o = {}; o['colours.' + facts.side + '.text'] = facts.side === 'dark' ? '#f2f2f2' : '#1d1d1f'; return o; }())); /* a fix with more contrast: near black by day, near white by night (D5) */
		if (facts.linkContrast < 3) add('colours.' + facts.side + '.accent', 'Links are hard to tell from the paper (contrast ' + facts.linkContrast + ', needs 3).', { links: 'both' });
		if (facts.buttonTextContrast < 4.5) add('buttonColour', 'The text on the main buttons is hard to read (contrast ' + facts.buttonTextContrast + ').', { buttonColour: 'text' });
		if (facts.readingSize && facts.readingSize < 16) add('roles.body.size', 'Reading text under 16 px is small for long reading.', { 'roles.body.size': '+1' });
		if (facts.lettersPerLine && facts.lettersPerLine > 90) add('lineLength', 'Lines of about ' + facts.lettersPerLine + ' letters are long; 60 to 75 read best.', { lineLength: '68' });
		if (facts.lineSpacing && facts.lineSpacing < 1.3) add('roles.body.lineHeight', 'Lines of reading text sit tight (' + facts.lineSpacing + '); 1.4 to 1.7 read best.', { 'roles.body.lineHeight': 'relaxed' });
		if (!p) facts.note = 'No article paragraph on this page: open a post to measure the reading text.';
		return { ok: !warn.length, facts: facts, warnings: warn };
	}

	function styleList() {
		var s = S(); if (!s) return [];
		var st = s.styles(), ids = [].concat(st.original ? [st.original] : [], st.shown, st.hidden);
		return ids.map(function (id) { var t = s.tile(id) || {}; return { id: id, name: t.label, shownToReaders: st.shown.indexOf(id) > -1 || id === st.original, isDefault: !!t.isDefault, own: !!t.own, now: !!t.on }; });
	}
	function explain() {
		var s = S(); if (!s) return '';
		/* in the words a saved style uses (0.27.0): the seven roles, the seven colours, the CSS words */
		var r = function (id) { return s.type(id) || {}; }, name = s.name(), head = r('headings'), body = r('body'), ui = r('interface');
		var face = function (f) { return f === 'body' ? face(body.font) : f === 'interface' ? face(ui.font) : f === 'host' ? 'the theme\'s own font' : f ? s.faceOf(f) : ''; };
		return name + ': a ' + s.side() + ' page, background ' + s.colour('paper') + ', text ' + s.colour('ink') + ', accent ' + s.colour('accent') + '. ' +
			'Headings in ' + face(head.font) + ' ' + (head.weight || '') + '; reading text in ' + face(body.font) + ' at ' + body.px + ' px, line spacing ' + body.lineHeight + '. ' +
			'Space ' + s.get('space') + ' (inside a group ' + s.get('spaceInside') + ', between items ' + s.get('spaceItems') + ', between sections ' + s.get('spaceSections') + ', above the title ' + s.get('spaceTitle') + ' px), line length ' + s.get('lineLength') + ' letters, corners ' + s.get('radius') + ', lines ' + s.get('borderWidth') + '.';
	}
	function after(changed, why) {
		try { S().keepVersion(); } catch (e) { /* Versions keeps what stood already */ }
		try { document.dispatchEvent(new CustomEvent('livedesign:change', { detail: { who: WHO, why: why || '', keys: changed.map(function (c) { return c.key; }) } })); } catch (e) { /* old browsers */ }
	}

	/* A role's dials for describe(): the font list is said once (type.fonts) */
	function dialsOf(d, id) {
		if (!d) return d;
		var o = {};
		Object.keys(d).forEach(function (k) {
			if (d[k] === undefined) return;
			if (k === 'font') o.font = id === 'body' || id === 'interface' ? 'a font id from type.fonts' : 'a font id from type.fonts, or body / interface to follow those roles';
			else o[k] = d[k];
		});
		return o;
	}

	/* WHERE A SETTING IS IN THE WINDOW, WHAT EVERY ENTRY MEANS, WHAT WORKS HERE (2026-10-06, the whole-panel pass D1 to D3):
	   the window's page by name, so the AI can tell the owner where to look; the type dials' and the colour wells' meanings,
	   which the template entries (roles.{role}.size, colours.{side}.accent) lacked; on another theme the keys only
	   Architrave's page draws are marked here: false, and set() says so. */
	var PAGE = { colour: 'Colour', type: 'Type', layout: 'Layout', 'corners-and-lines': 'Corners & Lines', buttons: 'Buttons', pictures: 'Pictures' };
	var WELL_MEANS = { background: 'The page the text sits on (Paper).', background2: 'The space around the page and the rails, a second background a theme may have (Ground).', card: 'What stands on the page: menus, boxes, fields (Cards).', text: 'The text.', mutedText: 'The quiet text of dates and captions (Soft text).', accent: 'The brand colour of links and main buttons.', highlight: 'The highlighter: marked words and selected text. Left out: none.', button: 'The buttons\' own colour, used when buttonColour is own.' };
	var ARCHITRAVE_ONLY = ['titleWidth', 'pictureWidth', 'figureWidth', 'tertiaryButton', 'pictureFade', 'pictureShadow', 'pictureEdge', 'pictureCorners', 'opening'];
	function hereOn(key) { return !(window.architravePanelGuest && ARCHITRAVE_ONLY.indexOf(key) !== -1); }
	function meansOf(key, mean) {
		if (mean[key]) return mean[key];
		var m = /^roles\.\{role\}\.(\w+)$/.exec(key); if (m) { try { return ((E().guide().typography || {}).dials || {})[m[1]]; } catch (e) { return undefined; } }
		m = /^colours\.\{side\}\.(\w+)$/.exec(key); if (m) return WELL_MEANS[m[1]] || 'The own colour of the ' + m[1] + ' role, used when its colour is own.';
		return undefined;
	}

	var LiveDesign = {
		about: 'Vibetiles: style this website by name. describe() first; set() changes (one undo step); preview() shows without keeping; check() says whether the page still reads well. A style shown to readers saves itself: what you change in it reaches readers a moment later. To try things, work on a style that is not on the site (choose Original: the first change makes a copy only this browser keeps). set, preview, load and choose answer with a Promise.',
		describe: function () {
			var s = S(); if (!s) return { error: 'The panel is not ready on this page.' };
			var sc = schema(), mean = meaning();
			var rec = nowRecord() || {};
			return {
				about: this.about,
				site: document.title,
				style: { id: s.current(), name: s.name(), editable: s.editable(), note: s.editable() ? undefined : 'This is the theme\'s own look; your first change makes a copy of it.' },
				settings: list().filter(function (x) { return x.key !== 'scope'; }) /* legacy: it does nothing anywhere (2026-10-06, D3) */.map(function (x) {
					var a = x.key in sc ? sc[x.key] : (x.choices || x.steps);
					var o = { key: x.key, section: x.section, where: PAGE[x.section] || undefined, name: x.label || undefined, means: meansOf(x.key, mean), kind: x.kind, now: x.key in rec ? rec[x.key] : s.get(x.key), default: x.def, values: a };
					if (!hereOn(x.key)) { o.here = false; o.means = (o.means ? o.means + ' ' : '') + 'Does nothing on this theme.'; }
					return o;
				}),
				colours: { wells: Object.keys(((sc.colours || {}).light) || {}), now: rec.colours || null, how: 'colours.<light|dark>.<well> as #rrggbb, e.g. colours.dark.accent. Set both sides.' },
				type: {
					roles: roleList().map(function (r) { return { id: r.id, name: r.label, where: r.where, now: s.type(r.id), dials: dialsOf((sc.roles || {})[r.id], r.id) }; }),
					fonts: s.faces().map(function (f) { return f.id + ' (' + f.group + ')'; }),
					note: 'Every role is roles.<role>.<dial>, e.g. roles.headings.font, roles.body.lineHeight. font takes a font id from fonts; the roles but body and interface may also say body or interface to follow those. size is a step from the role\'s own size, -4 to +6. A dial left out is the theme\'s own.'
				},
				presets: s.presets().map(function (x) { return { id: x.id, name: x.label, group: x.group || '' }; }),
				styles: styleList(),
				check: check(),
				howToSet: 'set({ radius: "large", "roles.body.size": "+1", space: "+1", "colours.dark.accent": "#ff7a4d" }, "why, in a few words"). A number goes to the nearest step; "+1"/"-1" moves one step. side: "light"|"dark" only changes what you look at.',
				rules: (function () { try { return E().guide().rules; } catch (e) { return []; } }())
			};
		},
		get: function (path) { var rec = nowRecord() || {}; return path ? at(rec, path) : rec; },
		/* ONE STEP, UNDOABLE, KEPT IN VERSIONS */
		set: function (changes, why) {
			/* A STEP THAT CHANGES NOTHING MAKES NO COPY (2026-10-06, D4): planned first against what shows; the copy of Original waits for a real change */
			var dry = S() && !S().editable() ? plan(changes, {}) : null;
			if (dry && !dry.changed.length && !dry.view && !dry.preset) return Promise.resolve({ changed: [], unchanged: dry.unchanged, problems: dry.problems, style: S().name(), check: check() });
			return editableRecord().then(function (ed) {
			if (ed.error) return { changed: [], problems: [{ problem: ed.error }] };
			var pl = plan(changes, ed.record), s = S(), E0 = E();
			if (pl.view) s.setView(pl.view);
			if (pl.preset) s.choosePreset(pl.preset);
			var recChanged = pl.changed.some(function (c) { return c.key !== 'side' && c.key !== 'preset'; });
			if (recChanged) {
				var base = pl.preset ? nowRecord() : null; /* a preset first, then the record's own keys on top of it */
				if (base) pl.changed.forEach(function (c) { if (c.key !== 'side' && c.key !== 'preset') put(base, c.key, c.to); });
				if (E0 && E0.previewing && E0.previewing()) s.previewVersion(null);
				/* Undo names what it takes back (2026-10-06, the sweep: every AI step said "Undo Restore"): the one setting, or "Changes" */
				var keys = pl.changed.filter(function (c) { return c.key !== 'side' && c.key !== 'preset'; }).map(function (c) { return c.key; });
				s.restoreVersion(base || pl.record, keys.length === 1 ? keys[0] : 'changes');
			}
			if (pl.changed.length) after(pl.changed, why);
			return painted().then(function () { return { changed: pl.changed, unchanged: pl.unchanged.length ? pl.unchanged : undefined, problems: pl.problems, madeCopy: ed.madeCopy || undefined, style: s.name(), check: check(), live: (function () { var x = s.tile && s.tile(s.current()); return x && x.site ? 'This style is on the site: readers see the change a moment later.' : 'Only in this browser: readers see it once the owner shows this style to readers.'; }()) }; });
		}); },
		preview: function (changes) { return editableRecord().then(function (ed) {
			if (ed.error) return { changed: [], problems: [{ problem: ed.error }] };
			var pl = plan(changes, ed.record);
			if (pl.preset) pl.problems.push({ key: 'preset', problem: 'A colour preset cannot be previewed; set it, then undo if it is wrong.' });
			S().previewVersion(pl.record);
			return painted().then(function () { return { changed: pl.changed, problems: pl.problems, check: check(), keep: 'set(the same changes) keeps it; endPreview() goes back.' }; });
		}); },
		endPreview: function () { var s = S(); if (s) s.previewVersion(null); return { check: check() }; },
		undo: function () { var s = S(); if (s && s.canUndo()) s.undo(); return { now: explain(), canUndo: !!(s && s.canUndo()) }; },
		redo: function () { var s = S(); if (s && s.canRedo()) s.redo(); return { now: explain(), canRedo: !!(s && s.canRedo()) }; },
		check: check,
		explain: explain,
		/* the whole style as a record another Live Design site can load */
		style: function () { var rec = nowRecord(); return rec ? { format: 'live-design-style', record: rec, link: S().shareLink() } : { problems: [{ problem: 'The theme\'s own look has no record; choose or copy a style first.' }] }; },
		load: function (style, why) {
			var rec = style && style.record ? style.record : style;
			if (!rec || typeof rec !== 'object') return { problems: [{ problem: 'Not a style. Pass what style() returns, or its record.' }] };
			return editableRecord().then(function (ed) {
				if (ed.error) return { problems: [{ problem: ed.error }] };
				var base = clone(rec); delete base.id; base.label = ed.record.label; base.base = ed.record.base; base.architrave = 3;
				S().restoreVersion(base); after([{ key: 'style' }], why || 'loaded a style');
				return { now: explain(), check: check() };
			});
		},
		choose: function (id) { return fresh().then(function () {
			var hit = styleList().filter(function (x) { return x.id === id || String(x.name).toLowerCase() === String(id).toLowerCase(); })[0];
			if (!hit) return { problems: [{ problem: 'No style "' + id + '". Styles: ' + styleList().map(function (x) { return x.id; }).join(', ') }] };
			S().choose(hit.id);
			return until(function () { return E().current() === hit.id; }).then(function () { return { now: explain() }; });
		}); },
		/* PUBLISH, only when the owner asks: the look on the page becomes a style on the site and, unless
		   { default: false }, what every first visit opens in. On WordPress it is live at once; on a site that is
		   only files it waits in the browser until the site's file carries it (LDPSite.publish() gives the file). */
		publish: function (opts) {
			opts = opts || {};
			var e = E(), s = S(); if (!e || !s) return Promise.resolve({ problems: [{ problem: 'The panel is not ready on this page.' }] });
			if (!e.canPublish()) return Promise.resolve({ problems: [{ problem: 'Only the site\'s owner can publish, from the owner\'s own page.' }] });
			var id = e.current(), x = e.list.filter(function (y) { return y.id === id; })[0] || {};
			if (x.host) return Promise.resolve({ problems: [{ problem: 'This is the theme\'s own look, which is always on the site. Change something first, or choose a style.' }] });
			var name = String(opts.name || x.label || 'My style').slice(0, 40), makeDefault = opts['default'] !== false;
			var step = x.site ? (e.adjusted(id) ? e.updateSite().then(function () { return id; }) : Promise.resolve(id)) : e.publish(name, makeDefault);
			return step.then(function (pid) {
				return (x.site && makeDefault && pid) ? e.makeDefault(pid).then(function () { return pid; }) : pid;
			}).then(function (pid) {
				var files = !!window.LDPSite;
				return { published: name, id: pid, isDefault: makeDefault, live: files ? 'Waiting: this site is only files. Write site.file into live-design/site.js in the site folder (replace the whole file) and put the site online.' : 'On the site now: readers get it on their next page.', site: files ? window.LDPSite.publish() : undefined };
			}, function (err) { return { problems: [{ problem: 'Publishing failed: ' + (err && err.message || err) }] }; });
		},
		open: function () { if (window.LiveDesignWindow && !window.LiveDesignWindow.isOpen()) window.LiveDesignWindow.open(); return { open: !!(window.LiveDesignWindow && window.LiveDesignWindow.isOpen()) }; }
	};

	window.LiveDesign = LiveDesign;
	window.Vibetiles = LiveDesign; /* THE NEW NAME (2026-10-06, Manuel: the plugin is Vibetiles): the same door; LiveDesign stays for the connector and every AI that knows it */
}());
