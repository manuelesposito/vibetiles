/*
 * THE NEW WINDOW (build plan steps 6 and 7, 2026-09-27): the frame, the sidebar
 * with the sections, and the sections built so far (Colour first). A section not
 * built yet shows the way to today's window, which does its work until it is.
 * The look follows lab/the-panel-prototype.html.
 *
 * IT KNOWS NOTHING OF WORDPRESS, on purpose: the same window is meant to run on a
 * site that is only files. Everything about the site comes from a HOST object that
 * a second, site-specific file hands to `LiveDesignWindow.mount(host)`
 * (panel-window-wp.js on WordPress):
 *
 *   host.words            { English: the site's language }
 *   host.settings         { sections: [{ id, name, settings }], list: [{ key, section, label, kind, choices, steps, def }] }
 *                         from the one list; a page's rows take their labels, choices and steps from it
 *   host.style            the look, by the list's saved names: view/setView (the side shown), side,
 *                         name, editable/makeCopy, get/set, custom/setCustom, presets/choosePreset,
 *                         colour/own/setColour/swatches/contrast, canUndo/undoWhat/undo, watch(fn)
 *   host.choice()         'new' or 'current': which window the owner uses
 *   host.setChoice(v)     saves it; a Promise
 *   host.canOpenCurrent(id), host.openCurrent(id)
 *                         whether the site still has today's window for a
 *                         section, and opening it there
 *   host.load(), host.save(record), host.publish(record)
 *                         the style's own storage; not used yet
 *
 * The door (the Vibetiles button) is the site's; the window only asks
 * `takes(door)` whether it should open instead of today's.
 */
(function () {
	'use strict';
	var host = null, win = null, door = null, open = false, asking = false, phoneList = true;
	var editing = null, menu = null, holding = false, dirty = false, frame = 0, lastPage = '';
	var role = null, fontFor = null, more = false, fontq = ''; 
	var MENU = {}, STOP = {};
	var showChanges = false; 
	var showVersions = false, verSel = 'now'; 
	var note = '', noteTimer = 0;  
	var KEY = 'ldp-window-section';
	var BUILT = ['styles', 'button', 'colour', 'type', 'layout', 'corners-and-lines', 'buttons', 'pictures', 'effects', 'settings'];
	var section = (function () { try { var v = sessionStorage.getItem(KEY) || 'styles'; return v === 'readers' ? 'styles' : v; } catch (e) { return 'styles'; } })();
	function ownerOnly(id) { return id === 'button' || id === 'settings'; }  
	function t(w) { return (host && host.words && host.words[w]) || w; }
	function nm(x) { return !x ? '' : x.site || x.own ? x.label : t(x.label); }
	function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
	function phone() { return !window.matchMedia('(min-width: 1010px)').matches; }
	function sections() { return ((host && host.settings && host.settings.sections) || []).map(function (x) { return x.id === 'corners-and-lines' ? Object.assign({}, x, { name: t('Corners & Lines') }) : x; }); } 
	function current() {
		var list = sections();
		if (TRY() && ownerOnly(section)) section = 'styles'; 
		if (section === 'settings') return { id: 'settings', name: t('Settings') };
		if (section === 'styles') return { id: 'styles', name: t('Styles') };
		if (section === 'button') return { id: 'button', name: t('Button') }; 
		for (var i = 0; i < list.length; i++) if (list[i].id === section) return list[i];
		return list[0] || { id: 'settings', name: t('Settings') };
	}
	function St() { return host && host.style; }
	function setting(key) { var l = (host && host.settings && host.settings.list) || []; for (var i = 0; i < l.length; i++) if (l[i].key === key) return l[i]; return null; }
	var OWN_LABEL = { links: 'Links' }; 
	
	var LAB_LABEL = { fill: 'Fills', 'door.own': 'Own Colour', button: 'Colour', pictures: 'Picture look', picturedim: 'Dim in dark appearance', picturehover: 'Colour on hover' };
	function label(key) { if (LAB_LABEL[key]) return t(LAB_LABEL[key]); var x = setting(key); return t(x && x.label ? x.label : OWN_LABEL[key] || key); }
	
	var MARK = {
		styles: ['#8e8e93', '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>'],
		readers: ['#0a84ff', '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>'],
		button: ['#8e8e93', '<circle cx="15" cy="12" r="3"/><rect width="20" height="14" x="2" y="5" rx="7"/>'],
		colour: ['#ff9f0a', '<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>'],
		type: ['#bf5af2', '<path d="M12 4v16"/><path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2"/><path d="M9 20h6"/>'],
		layout: ['#30b0c7', '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>'],
		'corners-and-lines': ['#5e5ce6', '<path d="M21 11a8 8 0 0 0-8-8"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>'],
		buttons: ['#ff9500', '<rect width="20" height="12" x="2" y="6" rx="2"/>'],
		pictures: ['#34c759', '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>'],
		effects: ['#ff375f', '<circle cx="15" cy="9" r="7"/><circle cx="9" cy="15" r="7"/>'],
		settings: ['#8e8e93', '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>']
	};
	var GLYPH = {
		close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
		back: '<path d="m15 18-6-6 6-6"/>',
		undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/>',
		grip: '<path d="M4 9h16"/><path d="M4 15h16"/>',
		more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
		compare: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/>', 
		side: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
		aim: '<path d="M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z"/><path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"/>',
		check: '<path d="M20 6 9 17l-5-5"/>',
		pipette: '<path d="m12 9-8.414 8.414A2 2 0 0 0 3 18.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 3.828 21h1.344a2 2 0 0 0 1.414-.586L15 12"/><path d="m18 9 .4.4a1 1 0 1 1-3 3l-3.8-3.8a1 1 0 1 1 3-3l.4.4 3.4-3.4a1 1 0 1 1 3 3z"/><path d="m2 22 .414-.414"/>'
	};
	function svg(body) { return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + body + '</svg>'; }
	function mark(id) { var m = MARK[id] || ['#8e8e93', '<circle cx="12" cy="12" r="4"/>']; return '<span class="ldpw-ic" style="--c:' + m[0] + '">' + svg(m[1]) + '</span>'; }
	
	function isHex(v) { return /^#[0-9a-f]{6}$/i.test(v || ''); }
	function hexToHsl(hex) {
		var r = parseInt(hex.substr(1, 2), 16) / 255, g = parseInt(hex.substr(3, 2), 16) / 255, b = parseInt(hex.substr(5, 2), 16) / 255;
		var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, h = 0, s = 0, d = mx - mn;
		if (d) {
			s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
			h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
			h *= 60;
		}
		return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
	}
	function hslToHex(h, s, l) {
		s /= 100; l /= 100;
		var k = function (n) { return (n + h / 30) % 12; }, a = s * Math.min(l, 1 - l);
		var f = function (n) { return l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); };
		return '#' + [f(0), f(8), f(4)].map(function (x) { return ('0' + Math.round(x * 255).toString(16)).slice(-2); }).join('');
	}
	function readable(q) { return q >= 7 ? t('Very readable') : q >= 4.5 ? t('Readable') : t('Hard to read'); }
	
	function box(inner) { return inner ? '<div class="ldpw-box">' + inner + '</div>' : ''; }
	function gtitle(w) { return '<p class="ldpw-gtitle">' + esc(w) + '</p>'; }
	function row(lb, right, sub, cls) { return '<div class="ldpw-r' + (cls ? ' ' + cls : '') + '"><span class="ldpw-lb">' + esc(lb) + (sub ? '<small>' + sub + '</small>' : '') + '</span>' + right + '</div>'; }
	function sw(key, on, lb, off) { return '<button type="button" class="ldpw-sw" role="switch" aria-checked="' + !!on + '" data-set="' + key + '" data-f="set:' + key + '" aria-label="' + esc(lb) + '"' + (off ? ' disabled' : '') + '></button>'; }
	function switchRow(key, off, sub) { var lb = label(key); off = off || St().dead('option:' + key); return row(lb, sw(key, St().get(key), lb, off), sub, off ? 'is-off' : ''); }
	function seg(name, value, opts, lb) {
		var i = 0; opts.forEach(function (o, j) { if (o[0] === value) i = j; });
		return '<div class="ldpw-seg" role="radiogroup" aria-label="' + esc(lb) + '" style="--n:' + opts.length + ';--i:' + i + '"><span class="ldpw-ind" aria-hidden="true"></span>' +
			opts.map(function (o) { var on = o[0] === value; return '<button type="button" role="radio" aria-checked="' + on + '" tabindex="' + (on ? 0 : -1) + '"' + (on ? ' class="is-on"' : '') + ' data-seg="' + name + '" data-v="' + o[0] + '" data-f="seg:' + name + ':' + o[0] + '">' + esc(o[1]) + '</button>'; }).join('') + '</div>';
	}
	function sidePicks(name, value) {
		return '<div class="ldpw-rlooks" role="radiogroup" aria-label="' + esc(t('Appearance')) + '">' + [['auto', t('Automatic')], ['light', t('Light')], ['dark', t('Dark')]].map(function (o) {
			var on = o[0] === value;
			return '<button type="button" class="ldpw-rlook' + (on ? ' is-on' : '') + '" role="radio" aria-checked="' + on + '" tabindex="' + (on ? 0 : -1) + '" data-seg="' + name + '" data-v="' + o[0] + '" data-f="seg:' + name + ':' + o[0] + '">' +
				'<span class="ldpw-rpic is-' + o[0] + '" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>' + esc(o[1]) + '</span><span class="ldpw-rtick" aria-hidden="true"></span></button>';
		}).join('') + '</div>';
	}
	function slider(key, unit) {
		var x = setting(key) || {}, steps = x.steps || [], v = String(St().get(key)), i = Math.max(0, steps.indexOf(v)), n = steps.length - 1;
		var ticks = steps.map(function (s, j) { return n > 12 && s !== String(x.def) ? '' : '<i' + (s === String(x.def) ? ' class="is-def"' : '') + ' style="--f:' + (n ? j / n : 0) + '"></i>'; }).join(''); 
		return '<div class="ldpw-r ldpw-sl"><div class="ldpw-top"><span class="ldpw-lb">' + esc(label(key)) + '</span><span class="ldpw-val" data-val="' + key + '">' + esc(v + unit) + '</span></div>' +
			'<div class="ldpw-rail">' + ticks + '<input type="range" min="0" max="' + n + '" step="1" value="' + i + '" data-level="' + key + '" data-unit="' + esc(unit) + '" data-f="level:' + key + '" style="--p:' + (n ? i / n * 100 : 0) + '%" aria-label="' + esc(label(key)) + '" aria-valuetext="' + esc(v + unit) + '"></div></div>';
	}
	function pop(key, lb, value, items, pick, wellOf) {
		MENU[key] = { label: lb, value: value, items: items, pick: pick };
		var word = (items.filter(function (x) { return x[0] === value; })[0] || [value, value])[1];
		var wc = wellOf ? wellOf(value) : '', well = wc ? '<i style="background:' + esc(wc) + '"></i>' : '';
		return '<button type="button" class="ldpw-pop" aria-haspopup="menu" aria-expanded="' + (menu === key) + '" data-menu="' + key + '" data-f="menu:' + key + '" aria-label="' + esc(lb + ': ' + word) + '">' + well + '<span>' + esc(word) + '</span></button>';
	}
	function popRow(key, words, wellOf) {
		var x = setting(key) || {}, s = St();
		return row(label(key), pop(key, label(key), s.get(key), (x.choices || []).map(function (id) { return [id, id === 'own' ? t('Own Colour…') : t(words[id] || id), false, wellOf ? wellOf(id) : '']; }), function (id) {
			s.set(key, id);
			if (id === 'own') editing = 'colours.{side}.' + (key === 'buttonColour' ? 'button' : key);
		}, wellOf));
	}
	function stepSlider(key, lb, stops, value, set, def, sub, pair, dead) {
		STOP[key] = { stops: stops, set: set };
		var i = 0; stops.forEach(function (x, j) { if (x.id === value) i = j; });
		var n = stops.length - 1, word = stops[i] ? stops[i].label : '';
		var ticks = stops.map(function (x, j) { return n > 12 && x.id !== def ? '' : '<i' + (x.id === def ? ' class="is-def"' : '') + ' style="--f:' + (n ? j / n : 0) + '"></i>'; }).join(''); 
		return '<div class="ldpw-r ldpw-sl' + (dead ? ' is-off' : '') + '"><div class="ldpw-top"><span class="ldpw-lb">' + esc(lb) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span><span class="ldpw-val" data-val="' + key + '">' + esc(word) + '</span></div>' +
			'<div class="ldpw-rail">' + ticks + '<input type="range" min="0" max="' + Math.max(n, 0) + '" step="1" value="' + i + '" data-stop="' + key + '" data-f="stop:' + key + '" style="--p:' + (n ? i / n * 100 : 0) + '%" aria-label="' + esc(lb) + '" aria-valuetext="' + esc(word) + '"' + (pair ? ' data-pair="' + pair + '"' : '') + (n > 0 && !dead ? '' : ' disabled') + '></div></div>';
	}
	function wellRow(key, sub) {
		var hex = St().colour(editKey(key));
		return '<button type="button" class="ldpw-r ldpw-navrow" data-edit="' + key + '" data-f="edit:' + key + '"><span class="ldpw-lb">' + esc(label(key)) + (sub ? '<small>' + sub + '</small>' : '') + '</span>' +
			'<span class="ldpw-val">' + esc(hex.toUpperCase()) + '</span><span class="ldpw-well" style="background:' + esc(hex) + '"></span><span class="ldpw-chev" aria-hidden="true"></span></button>';
	}
	
	var MARKER_WORD = { yellow: 'Yellow', green: 'Green', pink: 'Pink', blue: 'Blue', orange: 'Orange', text: 'Like the reading text', muted: 'Like the date', own: 'Own Colour' };
	var BUTTON_WORD = { accent: 'Accent', text: 'Text', own: 'Own Colour' }; 
	var SIDE_WORD = { auto: 'Auto', light: 'Light', dark: 'Dark' };
	var PRESET_GROUPS = [['base', 'Base'], ['warm', 'Warm'], ['cool', 'Cool'], ['bold', 'Group Bold'], ['text', 'Coloured Text']];
	function labRank(p) { return p.id === 'own' ? -1 : 0; }
	function presetGroup(p) {
		if (p.id === 'own') return 'base';
		if (p.group && PRESET_GROUPS.some(function (g) { return g[0] === p.group; })) return p.group;
		if (!p.day || !isHex(p.day)) return 'base'; 
		var h = hexToHsl(p.day), hue = h[0], sat = h[1], lit = h[2]; 
		if (sat > 45 && lit < 88) return 'bold';
		if (sat < 12 || lit > 95) return 'base';
		return (hue >= 15 && hue < 75) || hue >= 330 ? 'warm' : 'cool';
	}
	var customView = null; 
	var viewWant = null; 
	function colourPage() {
		var s = St(), side = s.side();
		var viewBox = gtitle(t('Appearance')) + box(sidePicks('view', viewWant || s.view())) + 
			'<p class="ldpw-hint">' + esc(t(side === 'dark' ? 'You are looking at the dark side. The style holds both; readers choose their own.' : 'You are looking at the light side. The style holds both; readers choose their own.')) + '</p>';
		if (!s.editable()) {
			return viewBox + box('<div class="ldpw-note"><p>' + esc(t('Original is the theme as it comes, and stays that way. Make a copy to change its colours.')) + '</p><button type="button" class="ldpw-blue" data-act="copy" data-f="act:copy">' + esc(t('Make a Copy')) + '</button></div>');
		}
		var out = viewBox;
		var nmOf = function (p) { return p.label; }; 
		var tile = function (p) {
			return '<button type="button" class="ldpw-tile' + (p.on ? ' is-on' : '') + '" role="radio" aria-checked="' + !!p.on + '" data-preset="' + esc(p.id) + '" data-f="preset:' + esc(p.id) + '">' +
				'<span class="ldpw-pic" style="background:' + esc(p.paper) + ';--pi:' + esc(p.ink) + ';--pa:' + esc(p.accent) + '" aria-hidden="true"><i></i><i></i><i></i></span><span class="ldpw-nm">' + (p.fresh ? '<span class="ldpw-nmt">' + esc(nmOf(p)) + '</span><em class="ldpw-new">' + esc(t('New')) + '</em>' : esc(nmOf(p))) + '</span></button>';
		};
		var groups = { base: [], warm: [], cool: [], bold: [], text: [] };
		s.presets().map(function (p, i) { return [labRank(p), i, p]; }).sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }).forEach(function (x) { groups[presetGroup(x[2])].push(x[2]); });
		PRESET_GROUPS.forEach(function (g) {
			if (!groups[g[0]].length) return;
			out += gtitle(t(g[1])) + '<div class="ldpw-tiles" role="radiogroup" aria-label="' + esc(t(g[1])) + '">' + groups[g[0]].map(tile).join('') + '</div>';
		});
		var q = s.contrast(s.colour('text'), s.colour('background'));
		var ground = s.guest() ? t('Only shows where this theme has a second background.') : t('Around the paper');
		if (s.groundNudged && s.groundNudged()) ground += ' · ' + t('Drawn a shade further, so its words read');
		out += gtitle(t('Colours')) + box(wellRow('colours.{side}.background', esc(t('Where the text sits'))) + wellRow('colours.{side}.background2', esc(ground)) + wellRow('colours.{side}.card', esc(t('Menus, boxes and fields'))) +
			wellRow('colours.{side}.text', q ? esc(readable(q)) : '') + wellRow('colours.{side}.mutedText', esc(t('Dates, captions, small facts'))) + wellRow('colours.{side}.accent', esc(t('Links and main buttons'))) + highlightRow());
		return out;
	}
	
	var MI = { sidebar:'<rect width="18" height="18" x="3" y="3" rx="2" /> <path d="M9 3v18" />', solo:'<rect x="2" y="4" width="20" height="16" rx="2" /> <path d="M10 4v4" /> <path d="M2 8h20" /> <path d="M6 4v4" />', changes:'<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /> <path d="M9 10h6" /> <path d="M12 13V7" /> <path d="M9 17h6" />', versions:'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /> <path d="M3 3v5h5" /> <path d="M12 7v5l4 2" />', share:'<path d="M12 2v13" /> <path d="m16 6-4-4-4 4" /> <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />', cmd:'<path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />', reader:'<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /> <circle cx="12" cy="12" r="3" />' };
	function menuWords(w) { var i = String(w).indexOf('  '); return i < 0 ? '<span class="ldpw-mw">' + esc(w) + '</span>' : '<span class="ldpw-mw">' + esc(w.slice(0, i)) + '</span><kbd>' + esc(w.slice(i + 2).trim()) + '</kbd>'; }
	var menuQ = '', menuIndex = null; 
	function menuHTML() {
		var m = menu && MENU[menu];
		if (!m) return '';
		var items = m.items;
		if (m.search && menuQ.trim()) { 
			var words = menuQ.toLowerCase().trim().split(/\s+/);
			var hits = (menuIndex || []).filter(function (e) { var hay = (e.label + ' ' + e.where).toLowerCase(); return words.every(function (w) { return hay.indexOf(w) !== -1; }); }).slice(0, 12);
			m.hits = hits;
			items = hits.length ? hits.map(function (e, i) { return ['hit:' + i, e.label + (e.where ? '  ' + e.where : '')]; }) : [['#', t('No results')]];
		}
		return '<div class="ldpw-menu' + (m.search ? ' has-search' : '') + '" role="menu" aria-label="' + esc(m.label) + '">' + (m.search ? '<label class="ldpw-msearch"><input type="search" data-menuq data-f="menuq" value="' + esc(menuQ) + '" placeholder="' + esc(t('Search')) + '" aria-label="' + esc(t('Search')) + '" autocomplete="off" spellcheck="false"></label>' : '') + items.map(function (x) {
			if (!x) return '<hr>'; 
			if (x[0] === '#') return '<div class="ldpw-mgt">' + esc(x[1]) + '</div>'; 
			var on = x[0] === m.value, radio = m.value !== undefined;
			return '<button type="button" role="' + (radio ? 'menuitemradio" aria-checked="' + on : 'menuitem') + '" data-pick="' + menu + '|' + x[0] + '" data-f="pick:' + menu + ':' + x[0] + '"' + (x[2] ? ' disabled' : '') + '><span class="ldpw-check" aria-hidden="true">' + (on ? '✓' : x[5] ? '<i class="ldpw-cdot"></i>' : '') + '</span>' + (x[3] ? '<i class="ldpw-mdot" style="background:' + esc(x[3]) + '"></i>' : '') + (x[4] && MI[x[4]] ? '<svg class="ldpw-mi" viewBox="0 0 24 24" aria-hidden="true">' + MI[x[4]] + '</svg>' : '') + menuWords(x[1]) + '</button>';
		}).join('') + '</div>';
	}
	
	function editKey(path) { return String(path || '').split('.').pop(); }
	var LAB_ACCENTS = [['Blue','#0a84ff'],['Indigo','#5856d6'],['Purple','#af52de'],['Pink','#ff2d55'],['Red','#ff3b30'],['Orange','#ff9500'],['Yellow','#ffcc00'],['Green','#34c759'],['Mint','#00c7be'],['Teal','#30b0c7'],['Cyan','#32ade6'],['Brown','#a2845e'],['Graphite','#8e8e93'],['Terracotta','#c4472c'],['Olive','#6b7a2f'],['Coral','#ff7a59'],['Gold','#c9a227'],['Forest','#1f7a4c'],['Navy','#1f3a93'],['Rose','#e05a8a']];
	var LAB_PAPERS = { light: [['White','#ffffff'],['Snow','#fafafa'],['Porcelain','#f6f5f2'],['Linen','#f7f1e8'],['Ivory','#fbf8ef'],['Cream','#f6ede3'],['Sand','#efe6d6'],['Mist','#eef1f4'],['Sage','#eef2ea'],['Blush','#f8eeee']],
		dark: [['Black','#000000'],['Night','#111113'],['Graphite','#1c1c1e'],['Charcoal','#242426'],['Slate','#1d2126'],['Ink Blue','#12134a'],['Forest','#0f1a14'],['Espresso','#231b15'],['Plum','#1d1420'],['Midnight','#0b1020']] };
	var LAB_INKS = { light: [['Black','#000000'],['Ink','#111113'],['Graphite','#2c2c2e'],['Charcoal','#3a3a3c'],['Espresso','#2b2018'],['Navy','#14213d'],['Forest','#16301f'],['Plum','#2e1a33'],['Slate','#29323c'],['Walnut','#3b2a1e']],
		dark: [['White','#ffffff'],['Snow','#f5f5f7'],['Porcelain','#ecebe8'],['Linen','#f5ece2'],['Mist','#dfe6ee'],['Sand','#e9dfcc'],['Mint','#e2ffe8'],['Blush','#f6e3e3'],['Lavender','#e7e1f7'],['Silver','#c7c7cc']] };
	function editorPage() {
		var s = St(), door0 = editing === 'door.own', k = door0 ? 'button' : editKey(editing), v = door0 ? doorColour('own', s.button() || {}) : s.colour(k), hsl = hexToHsl(v);
		var against = k === 'background' ? s.colour('text') : k === 'text' || k === 'accent' || k === 'button' || k === 'mutedText' ? s.colour('background') : '', q = against ? s.contrast(v, against) : 0;
		var side0 = s.side() === 'dark' ? 'dark' : 'light', paperish = k === 'background' || k === 'background2' || k === 'card';
		var src = paperish ? LAB_PAPERS[side0] : k === 'text' || k === 'mutedText' ? LAB_INKS[side0] : LAB_ACCENTS;
		var list = src.map(function (c) { return { label: c[0], hex: c[1] }; });
		if (k === 'background2' && s.otherGround) list.unshift({ label: side0 === 'light' ? 'Night’s Ground' : 'Day’s Ground', hex: s.otherGround() });
		var named = list.filter(function (x) { return x.hex === v; })[0];
		var listTitle = (paperish ? 'Papers' : src === LAB_ACCENTS ? 'Colours' : 'Text Colours') + (src !== LAB_ACCENTS ? (side0 === 'light' ? ' for Light' : ' for Dark') : '');
		function hs(lb, key, max, val, track) {
			return '<div class="ldpw-r ldpw-sl ldpw-hsl"><div class="ldpw-top"><span class="ldpw-lb">' + esc(t(lb)) + '</span><span class="ldpw-val" data-hsl-val="' + key + '">' + val + (key === 'h' ? '°' : '%') + '</span></div>' +
				'<input type="range" min="0" max="' + max + '" step="1" value="' + val + '" data-hsl="' + key + '" data-f="hsl:' + key + '" style="--track:' + track + '" aria-label="' + esc(t(lb)) + '"></div>';
		}
		return '<div class="ldpw-pick"><button type="button" class="ldpw-big" data-hex-copy data-f="hexcopy" title="' + esc(t('Copy')) + '" aria-label="' + esc(t('Copy')) + '" style="background:' + v + '"><span class="ldpw-copied" aria-hidden="true">' + svg(GLYPH.check) + esc(t('Copied')) + '</span></button><span class="ldpw-sr" role="status" data-copied-live></span><div><label for="ldpw-hex">' + esc(named ? t(named.label) : t('Hex')) + '</label><input id="ldpw-hex" data-hex data-f="hex" value="' + v.toUpperCase() + '" spellcheck="false" maxlength="7" autocomplete="off"></div>' +
				(window.EyeDropper ? '<button type="button" class="ldpw-circ" data-act="pipette" data-f="act:pipette" aria-label="' + esc(t('Pick a colour from the page')) + '" title="' + esc(t('Pick a colour from the page')) + '">' + svg(GLYPH.pipette) + '</button>' : '') +
				(q ? '<small data-ratio title="' + q.toFixed(1) + ':1">' + esc(readable(q) + ' ' + t(k === 'background' ? 'against the text' : 'against the paper')) + '</small>' : '') + '</div>' +
			box(hs('Hue', 'h', 360, hsl[0], 'linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)') +
				hs('Saturation', 's', 100, hsl[1], 'linear-gradient(90deg,' + hslToHex(hsl[0], 0, hsl[2]) + ',' + hslToHex(hsl[0], 100, hsl[2]) + ')') +
				hs('Lightness', 'l', 100, hsl[2], 'linear-gradient(90deg,#000,' + hslToHex(hsl[0], hsl[1], 50) + ',#fff)')) +
			(list.length ? gtitle(t(listTitle)) + box(list.map(function (x) {
				var on = x.hex === v;
				return '<button type="button" class="ldpw-r ldpw-navrow" data-hex-pick="' + x.hex + '" data-f="hexpick:' + x.hex + '"><span class="ldpw-well" style="background:' + x.hex + '"></span><span class="ldpw-lb">' + esc(t(x.label)) + '</span>' + (on ? '<span class="ldpw-val is-on">✓</span>' : '<span class="ldpw-val">' + x.hex.toUpperCase() + '</span>') + '</button>';
			}).join('')) : '') +
			'<label class="ldpw-other">' + esc(t('Other…')) + '<input type="color" data-hex-other data-f="other" value="' + v + '"></label>';
	}
	function paintEditor(hex, fromSlider) {
		if (!win || !editing) return;
		var big = win.querySelector('.ldpw-big'); if (big) big.style.background = hex;
		var hx = win.querySelector('[data-hex]'); if (hx && document.activeElement !== hx) hx.value = hex.toUpperCase();
		if (fromSlider) return;
		var hsl = hexToHsl(hex); 
		['h', 's', 'l'].forEach(function (k, i) {
			var el = win.querySelector('[data-hsl="' + k + '"]'), lv = win.querySelector('[data-hsl-val="' + k + '"]');
			if (el) el.value = hsl[i]; if (lv) lv.textContent = hsl[i] + (k === 'h' ? '°' : '%');
		});
	}
	
	var WEIGHT_LABEL = { thin: 'Thin', extralight: 'Extra Light', light: 'Weight Light', regular: 'Regular', medium: 'Medium', semibold: 'Semi Bold', bold: 'Bold', extrabold: 'Extra Bold', black: 'Black' };
	var WEIGHT_NUMBER = { thin: 100, extralight: 200, light: 300, regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900 };
	var LINE_WORD = { tight: 'Tight', snug: 'Snug', normal: 'Normal', relaxed: 'Relaxed', loose: 'Loose' };
	var LETTER_WORD = { tighter: 'Tighter', tight: 'Tight', normal: 'Normal', wide: 'Wide', wider: 'Wider', widest: 'Widest' };
	var ALIGN = [['default', 'Left'], ['center', 'Centre'], ['right', 'Right']];
	var FACE_GROUPS = [['sans', 'Sans Serif'], ['serif', 'Serif'], ['mono', 'Monospaced'], ['pixel', 'Pixel'], ['display', 'Display']]; 
	var FOLLOW = { body: 'Same as reading text', 'interface': 'Same as interface' };
	var ROLE_GROUPS = [['Text', ['title', 'headings', 'body', 'quote', 'meta', 'code', 'interface']]]; 
	function roles() { return (host && host.settings && host.settings.roles) || []; }
	function roleMeta(id) { return roles().filter(function (r) { return r.id === id; })[0] || { id: id, label: id, dials: [] }; }
	function weightWord(w) { return t(WEIGHT_LABEL[w] || w); }
	function faceName(id) { if (FOLLOW[id]) return t(FOLLOW[id]); if (!id) return t('Theme Monospace'); var f = St().faces(id).filter(function (x) { return x.id === id; })[0]; return f ? f.label : id; }
	function realFace(id) { for (var i = 0; i < 3 && FOLLOW[id]; i++) id = St().type(id).font; return FOLLOW[id] ? 'inter' : id; }
	function fontCost() {
		var drawn = {}, rules = {}, files = [], fams = {};
		var fam = function (v) { return String(v || '').split(',')[0].trim().replace(/^["']|["']$/g, '').toLowerCase(); };
		var slant = function (v) { return /italic|oblique/.test(v || '') ? 'italic' : 'normal'; };
		try {
			[].forEach.call(document.body.querySelectorAll('*'), function (el) {
				if (el.closest('#ldp-window, .reading-panel, .architrave-panel-opener, #wpadminbar')) return;
				var own = [].some.call(el.childNodes, function (n) { return 3 === n.nodeType && /\S/.test(n.nodeValue); });
				if (!own || !el.getClientRects().length) return;
				var cs = getComputedStyle(el); drawn[fam(cs.fontFamily) + '|' + slant(cs.fontStyle)] = 1;
			});
			var walk = function (list, base) { [].forEach.call(list || [], function (r) {
				if (r.cssRules) { walk(r.cssRules, base); return; }
				if (!(window.CSSFontFaceRule && r instanceof CSSFontFaceRule)) return;
				var key = fam(r.style.getPropertyValue('font-family')) + '|' + slant(r.style.getPropertyValue('font-style'));
				(r.style.getPropertyValue('src').match(/url\(\s*["']?[^"')]+/g) || []).forEach(function (u) {
					try { rules[new URL(u.replace(/^url\(\s*["']?/, ''), base).href.split('?')[0]] = key; } catch (e) {  }
				});
			}); };
			[].forEach.call(document.styleSheets, function (sh) { try { walk(sh.cssRules, sh.href || location.href); } catch (e) {  } });
			files = performance.getEntriesByType('resource').filter(function (e) {
				var key = rules[e.name.split('?')[0]];
				if (!key || !drawn[key]) return false;
				fams[key.split('|')[0]] = 1; return true;
			});
		} catch (e) {  }
		var kb = Math.round(files.reduce(function (a, e) { return a + (e.decodedBodySize || e.encodedBodySize || e.transferSize || 0); }, 0) / 1024);
		return { fonts: Object.keys(fams).length, files: files.length, kb: kb };
	}
	function navRow(attrs, lb, val, sub) {
		return '<button type="button" class="ldpw-r ldpw-navrow" ' + attrs + '><span class="ldpw-lb">' + esc(lb) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span><span class="ldpw-val">' + esc(val) + '</span><span class="ldpw-chev" aria-hidden="true"></span></button>';
	}
	function swBtn(attr, on, lb, off) { return '<button type="button" class="ldpw-sw" role="switch" aria-checked="' + !!on + '" ' + attr + ' data-f="' + attr.replace(/[="]/g, '') + '" aria-label="' + esc(lb) + '"' + (off ? ' disabled' : '') + '></button>'; }
	function typePage() {
		var s = St(), body = s.type('body'), ui = s.type('interface');
		var fc = fontCost();
		var out = gtitle(t('Fonts')) + box(navRow('data-font="body" data-f="font:body"', t('Reading font'), faceName(body.font)) + navRow('data-font="interface" data-f="font:interface"', t('Interface font'), faceName(ui.font))) +
			(fc.files && fc.kb ? '<p class="ldpw-hint' + (fc.kb > 400 ? ' is-warn' : '') + '">' + esc(t(fc.kb > 400 ? 'Readers download {fonts}, {files}, {kb} KB: heavy, pages open more slowly on phones.' : 'Readers download {fonts}, {files}, {kb} KB.').replace('{fonts}', fc.fonts === 1 ? t('1 font') : t('{n} fonts').replace('{n}', fc.fonts)).replace('{files}', fc.files === 1 ? t('1 file') : t('{n} files').replace('{n}', fc.files)).replace('{kb}', fc.kb)) + '</p>' : '');
		ROLE_GROUPS.forEach(function (g) {
			var ids = g[1].filter(function (id) { return roles().some(function (r) { return r.id === id; }) && !s.gone('role:' + id); });
			if (!ids.length) return;
			out += gtitle(t(g[0])) + box(ids.map(function (id) { var v = s.type(id), off = s.dead('role:' + id); return navRow('data-role="' + id + '" data-f="role:' + id + '"' + (off ? ' disabled' : ''), t(roleMeta(id).label), faceName(realFace(v.font)) + ' · ' + weightWord(v.weight)); }).join(''));
		});
		var drop = s.get('dropcap');
		out += gtitle(t('Paragraphs')) + box(row(t('Justified text'), sw('justify', s.get('justify'), t('Justified text'))) + pickRow('hyphenate') + row(t('Drop cap'), sw('dropcap', drop, t('Drop cap')), esc(t('A large first letter'))) +
			(drop ? row(t('Drop cap height'), pop('caplines', t('Drop cap height'), s.capLines(), ['2', '3', '4'].map(function (n) { return [n, t('{n} lines').replace('{n}', n)]; }), function (id) { s.setCapLines(id); })) + pickRow('capface') : '') + pickRow('paragraphs') + (s.guest() ? '' : pickRow('opening')));
		return out;
	}
	function rolePage() {
		var s = St(), r = roleMeta(role), v = s.type(role), has = function (d) { return s.typeDials(role).indexOf(d) !== -1; };
		var P = 'roles.' + role + '.', face = realFace(v.font), weights = s.weights(face);
		var fv = FOLLOW[v.font] ? t(v.font === 'interface' ? 'Interface font' : 'Reading font') + ' · ' + faceName(face) : faceName(v.font); 
		var out = (r.where ? '<p class="ldpw-hint">' + esc(t(r.where)) + '</p>' : '') + box(navRow('data-font="' + role + '" data-f="font:' + role + '"', t('Font'), fv) +
			(s.dead('size:' + role) ? row(t('Size'), '<span class="ldpw-val">' + esc(v.px + ' px') + '</span>', '', 'is-off') : stepSlider(P + 'size', t('Size'), s.typeSizes(role).map(function (x) { return { id: x.id, label: x.px + ' px' }; }), v.size, function (id) { s.setType(role, 'size', id); }, '0')) +
			(has('categorySize') ? catRows(s, v, P) : '') +
			(weights.length ? stepSlider(P + 'weight', t('Weight'), weights.map(function (w) { return { id: w, label: weightWord(w) + ' ' + WEIGHT_NUMBER[w] }; }), v.weight, function (id) { s.setType(role, 'weight', id); })
				: row(t('Weight'), '<span class="ldpw-val">' + esc(weightWord(v.weight)) + '</span>', '', 'is-off')) +
			(has('lineHeight') ? stepSlider(P + 'lineHeight', t('Line spacing'), s.typeLines.map(function (id) { return { id: id, label: t(LINE_WORD[id]) }; }), v.lineHeight, function (id) { s.setType(role, 'lineHeight', id); }, 'normal') : '') +
			(has('align') ? row(t('Alignment'), seg('align', v.align || 'default', ALIGN.map(function (a) { return [a[0], t(a[1])]; }), t('Alignment'))) : '') +
			(has('colour') ? row(t('Colour'), pop('rolecolour', t('Colour'), v.colour, [['text', t('Text')], ['mutedText', t('Soft text')], ['accent', t('Accent')]].concat([['own', t('Own Colour…'), false, s.roleColour ? (v.colour === 'own' ? s.roleColour(role) : '#ff9f0a') : '']]), function (id) {
				s.setType(role, 'colour', id); if (id === 'own') editing = 'colours.{side}.' + role;
			}, function (id) { return id === 'own' ? s.roleColour(role) : ''; })) : '')); 
		out += '<button type="button" class="ldpw-more" aria-expanded="' + more + '" data-act="more" data-f="act:more">' + esc(t(more ? 'Show Less' : 'Show More')) + '</button>';
		if (more) {
			var italic = s.hasItalic(face);
			out += box(stepSlider(P + 'letterSpacing', t('Character spacing'), s.typeLetters.map(function (id) { return { id: id, label: t(LETTER_WORD[id]) }; }), v.letterSpacing, function (id) { s.setType(role, 'letterSpacing', id); }, 'normal') +
				row(t('Italic'), swBtn('data-rset="italic"', italic && v.italic, t('Italic'), !italic), italic ? '' : esc(t('This font has no italic')), italic ? '' : 'is-off') + 
				row(t('Capitals'), swBtn('data-rset="capitals"', v.capitals, t('Capitals'))));
		}
		return out;
	}
	function catRows(s, v, P) {
		var own = v.categorySize !== 'same', off = s.dead('size:meta.category');
		return row(t('Own category size'), swBtn('data-catown', own, t('Own category size'), off), esc(t(own ? 'The category line under the title has its own size' : 'The category line follows Size')), off ? 'is-off' : '') +
			(own && !off ? stepSlider(P + 'categorySize', t('Category line'), s.typeSizes(role, 'categorySize').map(function (x) { return { id: x.id, label: x.px + ' px' }; }), v.categorySize, function (id) { s.setType(role, 'categorySize', id); }, '0') : '');
	}
	var fontGet = {}; 
	function fontPage() {
		var s = St(), cur = s.type(fontFor).font, q = fontq.toLowerCase();
		var faces = s.faces(cur).filter(function (f) { return !q || f.label.toLowerCase().indexOf(q) !== -1; });
		function frow(id, lb) { var on = id === cur; return '<button type="button" class="ldpw-r ldpw-navrow ldpw-frow" role="radio" aria-checked="' + on + '" data-face="' + esc(id) + '" data-f="face:' + esc(id) + '"><span class="ldpw-lb">' + esc(lb) + '</span>' + (on ? '<span class="ldpw-fcheck" aria-hidden="true">✓</span>' : '') + '</button>'; } 
		var follower = fontFor !== 'body' && fontFor !== 'interface' && fontFor !== 'code';
		var out = '<label class="ldpw-search"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg><input type="search" data-fontq data-f="fontq" placeholder="' + esc(t('Search Fonts')) + '" aria-label="' + esc(t('Search Fonts')) + '" value="' + esc(fontq) + '" autocomplete="off" spellcheck="false"></label>';
		if (follower && !q) out += box(frow('body', t(FOLLOW.body)) + frow('interface', t(FOLLOW['interface'])));
		if (fontFor === 'code' && !q) out += box(frow('', t('Theme Monospace')));
		var F = s.fonts, lib = F && F.can() ? F.library() : [], away = function (f) { return lib.indexOf(f.id) !== -1 && f.id !== cur && (!F.have(f.id) || !!fontGet[f.id]); }; 
		var onSite = faces.filter(function (f) { return !away(f); }), library = faces.filter(away);
		var shown = 0;
		function groups(list, get) {
			var html = '';
			var curGroup = (faces.filter(function (f) { return f.id === cur; })[0] || {}).group;
			FACE_GROUPS.slice().sort(function (a, b) { return (b[0] === curGroup) - (a[0] === curGroup); }).concat([['', 'Other']]).forEach(function (g) { 
				var mine = list.filter(function (f) { return g[0] ? f.group === g[0] : FACE_GROUPS.every(function (x) { return x[0] !== f.group; }); });
				if (!mine.length) return;
				shown += mine.length;
				html += gtitle(t(g[1])) + box(mine.map(function (f) { return get ? getRow(f) : frow(f.id, f.label); }).join(''));
			});
			return html;
		}
		function getRow(f) {
			var st = fontGet[f.id], label = st === 'got' ? t('Use') : st === 'busy' ? '' : t('Get');
			return '<div class="ldpw-r ldpw-getrow"><span class="ldpw-lb"' + (st === 'got' ? ' style="font-family:' + esc(((window.ArchitraveFontLibrary || []).filter(function (x) { return x.id === f.id; })[0] || {}).family || f.label) + '"' : '') + '>' + esc(f.label) + '</span>' +
				'<button type="button" class="ldpw-get' + (st === 'busy' ? ' is-busy' : st === 'got' ? ' is-got' : '') + '" data-fontget="' + esc(f.id) + '" data-f="fontget:' + esc(f.id) + '"' + (st === 'busy' ? ' disabled aria-busy="true"' : '') + ' aria-label="' + esc((st === 'got' ? t('Use') : t('Get')) + ': ' + f.label) + '">' + (st === 'busy' ? '<i class="ldpw-ring" aria-hidden="true"></i>' : esc(label)) + '</button></div>';
		}
		out += groups(onSite, false);
		if (library.length) {
			out += '<p class="ldpw-gtitle ldpw-libtitle">' + esc(t('Font Library')) + ' <small>· ' + esc(t('{n} more, fetched the first time a style uses one').replace('{n}', library.length)) + '</small></p>' + groups(library, true);
		}
		if (F && F.can() && !q) out += '<button type="button" class="ldpw-link ldpw-prune" data-act="fontprune" data-f="act:fontprune">' + esc(t('Remove Unused Fonts…')) + '</button><p class="ldpw-hint">' + esc(t('Removes the downloaded fonts no style uses. The fonts that come with the plugin stay.')) + '</p>';
		return out + (shown ? '' : '<p class="ldpw-hint">' + esc(t('No results')) + '</p>');
	}
	
	var LEVEL_WORD = { space: { xcompact: 'Extra compact', compact: 'Compact', standard: 'Standard', spacious: 'Spacious', xspacious: 'Extra spacious' }};
	var PICK_WORD = {
		fadeedges: { bottom: 'Bottom', sides: 'Sides and bottom', all: 'All sides' },
		corners: { small: 'Small', medium: 'Medium', large: 'Large', xlarge: 'Very large' },
		linestyle: { solid: 'Solid', dashed: 'Dashed', dotted: 'Dotted' },
		categories: { below: 'Below title', above: 'Above title', hidden: 'Hidden' },
		links: { both: 'Coloured and underlined', coloured: 'Coloured', underlined: 'Underlined', bold: 'Bold line', wash: 'Marked' },
		buttonShape: { match: 'Like the cards', square: 'Square', rounded: 'Rounded', pill: 'Pill' },
		primaryButton: { filled: 'Filled', tinted: 'Tinted', gray: 'Grey', outlined: 'Outlined', shadow: 'Outlined with shadow', text: 'Text only' },
		secondaryButton: { filled: 'Filled', tinted: 'Tinted', gray: 'Grey', outlined: 'Outlined', shadow: 'Outlined with shadow', text: 'Text only' },
		tertiaryButton: { filled: 'Filled', tinted: 'Tinted', gray: 'Grey', outlined: 'Outlined', shadow: 'Outlined with shadow', text: 'Text only' },
		tags: { text: 'Text only', filled: 'Filled', tinted: 'Tinted', gray: 'Grey', outlined: 'Outlined' },
		currentItem: { gray: 'Grey', filled: 'Filled', outlined: 'Outlined', bold: 'Bold' },
		linewidth: { '1': '1 px', '2': '2 px', '3': '3 px', '5': '5 px' },
		cards: { filled: 'Filled', outlined: 'Outlined', raised: 'Raised' },
		quotes: { indented: 'Indented', plain: 'Plain', sideLine: 'Side line', filled: 'Filled' },
		fields: { filled: 'Filled', outlined: 'Outlined', raised: 'Raised' },
		borderStyle: { solid: 'Solid', dashed: 'Dashed', dotted: 'Dotted' },
		pictures: { plain: 'As they are', bw: 'Black & white', sepia: 'Sepia', duo: 'Tinted', accent: 'Duotone', grain: 'Grain', warm: 'Sun-warmed', hidden: 'Hidden' },
		pictureFilter: { none: 'As they are', grayscale: 'Black & white', sepia: 'Sepia', tinted: 'Tinted', duotone: 'Duotone', grain: 'Grain', warm: 'Sun-warmed', hidden: 'Hidden' },
		pictureFrame: { none: 'None', plain: 'Plain', dots: 'Dots', checker: 'Checkerboard' },
		pictureFade: { none: 'None', bottom: 'Bottom', sides: 'Sides and bottom', all: 'All sides' },
		pictureShadow: { none: 'None', soft: 'Soft' }, pictureEdge: { none: 'None', faint: 'Faint', medium: 'Medium', strong: 'Strong' }, pictureCorners: { match: 'Like the cards', square: 'Square' },
		framepattern: { plain: 'Plain', dots: 'Dots', checker: 'Checkerboard' },
		capface: { text: 'Text font', bold: 'Text font, bold', fraunces: 'Fraunces', title: 'Title font' }, hyphenate: { auto: 'With justified text', few: 'Long words only', any: 'Wherever possible', off: 'Never' }, paragraphs: { spaced: 'Spaced', indented: 'Indented' }, piccorners: { cards: 'Like the cards', square: 'Square' }, pictureshadow: { off: 'Off', soft: 'Soft' }, opening: { off: 'Off', big: 'Big' }, widefigures: { off: 'Off', on: 'On' }, subcolour: { title: 'Like the title', ink: 'Text' }
	};
	var FX_COLOUR = { light: 'Light', second: 'Second light', accent: 'Accent', ink: 'Ink' };
	var FX_NAME = {}; 
	var FX_WORD = {}; 
	Object.keys(FX_WORD).forEach(function (k) { PICK_WORD['effects.' + k] = FX_WORD[k]; });
	var LEVEL_ORDER = ['filled', 'tinted', 'gray', 'outlined', 'shadow', 'text']; 
	var PICK_ORDER = { fadeedges: ['bottom', 'sides', 'all'], corners: ['small', 'medium', 'large', 'xlarge'], primaryButton: LEVEL_ORDER, secondaryButton: LEVEL_ORDER, tertiaryButton: LEVEL_ORDER, tags: ['filled', 'tinted', 'gray', 'outlined', 'text'], links: ['coloured', 'underlined', 'both', 'bold', 'wash'] , cards: ['filled', 'outlined', 'raised'], quotes: ['plain', 'indented', 'sideLine', 'filled'] };
	var GUEST_REST = { tags: 'text', currentItem: 'gray', quotes: 'indented', cards: 'filled', fields: 'filled' }; 
	function levelRow(key, unit, sub) {
		var x = setting(key) || {}, s = St();
		return stepSlider(key, label(key), (x.steps || x.choices || []).map(function (id) { return { id: id, label: LEVEL_WORD[key] ? t(LEVEL_WORD[key][id] || id) : id + unit }; }), String(s.get(key)), function (id) { s.set(key, id); }, String(x.def), sub);
	}
	function pickRow(key, bare) {
		var x = setting(key) || {}, s = St(), words = PICK_WORD[key] || {};
		var list = (PICK_ORDER[key] || x.choices || []).filter(function (id) { return !(key === 'categories' && id === 'above' && s.guest() && s.get(key) !== 'above'); }); 
		var items = list.map(function (id) { return [id, s.guest() && GUEST_REST[key] === id ? t('As the theme') : /(px| %)$/.test(words[id] || '') ? words[id] : t(words[id] || id)]; });
		if (LOOK_DRAW[key]) return looksRow(key, items);
		if (key === 'corners' || key === 'linewidth') return stepSlider(key, label(key), items.map(function (x) { return { id: x[0], label: x[1] }; }), s.get(key), function (id) { s.set(key, id); }, String(x.def)); 
		if (bare) return pop(key, label(key), s.get(key), items, function (id) { s.set(key, id); });
		return row(label(key), pop(key, label(key), s.get(key), items, function (id) { s.set(key, id); }), ROW_NOTE[key] ? esc(t(ROW_NOTE[key])) : '');
	}
	var LOOK_DRAW = { pictureFilter: 'picture', pictureFrame: 'frame', pictureFade: 'fade', primaryButton: 'button', secondaryButton: 'button', tertiaryButton: 'button', tags: 'tag', links: 'link', currentItem: 'chosen', cards: 'surface', pictureframe: 'frame', picturefade: 'fade', quotes: 'quote', fields: 'field', pictures: 'picture', framepattern: 'frame', fadeedges: 'fade' };
	var LOOK_SHORT = { shadow: 'Shadow', text: 'Text' };
	var ROW_NOTE = { hyphenate: 'Where words break at the end of a line', opening: 'The first paragraph a size larger', borderStrength: 'How dark the lines are', pictureEdge: 'A fine line, for white pictures on a white page' };
	var LOOK_NOTE = { primaryButton: 'The main action, like Subscribe', secondaryButton: 'A second choice next to it', tertiaryButton: 'Small actions, like Share', links: 'In the text', currentItem: 'The page you are on, the tab that is open', cards: 'Link cards and coloured boxes in the text', fields: 'Search, comment and sign-up fields', quotes: 'Quotations in an article', pictureFilter: 'Every picture on the site', pictureFrame: 'A mat around each picture' };  
	var PIC_FILTER = { plain: 'none', bw: 'grayscale(1)', sepia: 'sepia(.85) contrast(1.05)', duo: 'grayscale(1) sepia(1) saturate(1.6) hue-rotate(175deg) brightness(.95)', accent: 'grayscale(1) contrast(1.2) sepia(.6) hue-rotate(200deg) saturate(2.2)', grain: 'contrast(1.1) saturate(.85)', warm: 'sepia(.18) saturate(1.12) contrast(1.02)' };
	function lookColours() {
		var s = St(), ink = s.colour('ink'), paper = s.colour('paper'), accent = s.colour('accent'), who = s.get('buttonColour');
		var btn = who === 'text' ? ink : who === 'own' ? s.colour('button') : accent;
		var on = (s.writingOn && s.writingOn(btn, paper, ink)) || (s.contrast(btn, paper) >= s.contrast(btn, ink) ? paper : ink);
		var line = getComputedStyle(document.documentElement).getPropertyValue('--border-strong').trim() || 'color-mix(in oklab, ' + ink + ' 32%, ' + paper + ')';
		return '--lp:' + paper + ';--li:' + ink + ';--la:' + accent + ';--lb:' + btn + ';--lo:' + on + ';--ll:' + line;
	}
	var SURFACE_DRAW = { pictureFilter: { none: 'plain', grayscale: 'bw', tinted: 'duo', duotone: 'accent' }, pictureFade: { none: 'off' }, cards: { filled: 'flat', outlined: 'box' }, quotes: { indented: 'indent', sideLine: 'line', filled: 'box' }, fields: { filled: 'flat', outlined: 'box' } };
	function lookPic(draw, id) {
		if (draw === 'button' || draw === 'tag') return '<i class="ldpw-lv" data-lk="' + id + '">' + (draw === 'tag' ? 'Tag' : 'Aa') + '</i>';
		if (draw === 'link') return '<i class="ldpw-dln" data-ln="' + id + '">link</i>';
		if (draw === 'chosen') return '<i class="ldpw-dch" data-ch="' + id + '"><b>One</b><u>Two</u></i>';
		if (draw === 'surface') return '<i class="ldpw-dsf" data-sf="' + id + '"><b></b><b></b></i>';
		if (draw === 'field') return '<i class="ldpw-dsf ldpw-dfi" data-sf="' + id + '"><b></b><b></b></i>';
		if (draw === 'quote') return '<i class="ldpw-dq" data-q="' + id + '">“Aa”</i>';
		if (draw === 'picture') return id === 'hidden' ? '<i class="ldpw-dpic is-hid">' + esc(t('Show')) + '</i>' : '<i class="ldpw-dpic' + (id === 'dither' || id === 'pixel' ? ' is-px' : id === 'halftone' ? ' is-ht' : '') + '" style="filter:' + (PIC_FILTER[id] || 'none') + '"></i>';
		if (draw === 'frame') return '<i class="ldpw-dpic ldpw-dfr" data-fr="' + id + '"></i>';
		if (draw === 'fade') return '<i class="ldpw-dpic ldpw-dfd" data-fd="' + id + '"></i>';
		return '';
	}
	var PAIR = { pictureframe: { pick: 'framepattern', off: 'none', label: 'Frame', offWord: 'None' }, picturefade: { pick: 'fadeedges', off: 'off', label: 'Fade first picture', offWord: 'Off' } };
	function pairLooks(key) {
		var s = St(), p = PAIR[key], words = PICK_WORD[p.pick] || {}, x = setting(p.pick) || {};
		var list = [[p.off, t(p.offWord)]].concat((PICK_ORDER[p.pick] || x.choices || []).map(function (id) { return [id, t(words[id] || id)]; }));
		return looksRow(key, list, null, s.get(key) ? s.get(p.pick) : p.off, t(p.label));
	}
	function setPair(key, v) {
		var s = St(), p = PAIR[key];
		if (v === p.off) { if (s.get(key)) s.set(key, false); return; }
		if (s.get(p.pick) !== v) s.set(p.pick, v);
		if (!s.get(key)) s.set(key, true);
	}
	function looksRow(key, list, words, value, name) {
		var s = St(), v = value !== undefined ? value : s.get(key), draw = LOOK_DRAW[key], lb = name || label(key), level = draw === 'button' || draw === 'tag';
		var name = (list.filter(function (x) { return x[0] === v; })[0] || [v, v])[1];
		var n = MARKED[key] && value === undefined ? onPage(key).length : -1; 
		var dot = LOOK_NOTE[key] ? ' · ' : '';
		var count = n < 0 ? '' : n ? dot + '<button type="button" class="ldpw-onpage" data-onpage="' + key + '" data-f="onpage:' + key + '">' + esc(t(n === 1 ? '1 on this page' : '{n} on this page').replace('{n}', n)) + '</button>' : dot + esc(t('None on this page'));
		return '<div class="ldpw-r ldpw-lvrow"' + (n < 0 ? '' : ' data-mark="' + key + '"') + '><div class="ldpw-top"><span class="ldpw-lb">' + esc(lb) + (LOOK_NOTE[key] || count ? '<small>' + (LOOK_NOTE[key] ? esc(t(LOOK_NOTE[key])) : '') + count + '</small>' : '') + '</span><span class="ldpw-val">' + esc(name) + '</span></div>' +
			'<div class="ldpw-looks' + (list.length !== 6 ? ' is-n' + list.length : '') + '" role="radiogroup" aria-label="' + esc(lb) + '" style="' + esc(lookColours()) + '">' + list.map(function (x) {
				var on = x[0] === v, nm = level && LOOK_SHORT[x[0]] ? t(LOOK_SHORT[x[0]]) : key === 'links' && x[0] === 'both' ? t('Both') : x[1];
				return '<button type="button" class="ldpw-lk' + (on ? ' is-on' : '') + '" role="radio" aria-checked="' + on + '" data-look="' + key + '" data-v="' + esc(x[0]) + '" data-f="look:' + key + ':' + esc(x[0]) + '"><span class="ldpw-sw8" aria-hidden="true">' + lookPic(draw, x[2] || (SURFACE_DRAW[key] || {})[x[0]] || x[0]) + '</span><span class="ldpw-nm">' + esc(nm) + '</span></button>';
			}).join('') + '</div></div>';
	}
	function moreButton() { return '<button type="button" class="ldpw-more" aria-expanded="' + more + '" data-act="more" data-f="act:more">' + esc(t(more ? 'Show Less' : 'Show More')) + '</button>'; }
	function hint(w) { return '<p class="ldpw-hint">' + esc(t(w)) + '</p>'; }
	
	var WIDTH_ROW = { titleWidth: ['Title', ''], pictureWidth: ['Picture', 'The first picture of the article'], figureWidth: ['Pictures in the text', 'The pictures inside the article'] };
	function widthRow(key) {
		var s = St(), x = setting(key) || {}, w = WIDTH_ROW[key], words = { content: 'Content', wide: 'Wide', full: 'Full' };
		var items = (x.choices || ['content', 'wide']).map(function (id) { return [id, t(words[id] || id)]; });
		return row(t(w[0]), pop(key, t(w[0]), s.get(key), items, function (id) { s.set(key, id); }), w[1] ? esc(t(w[1])) : '');
	}
	function offSlider(sw, lvl, lb, unit, sub, dead, offWord) {
		var s = St(), x = setting(lvl) || {};
		dead = dead || s.dead('option:' + sw);
		var stops = [{ id: 'off', label: t(offWord || 'Off') }].concat((x.steps || []).map(function (id) { return { id: id, label: LEVEL_WORD[lvl] ? t(LEVEL_WORD[lvl][id] || id) : id + unit }; }));
		return stepSlider(sw, lb, stops, s.get(sw) ? String(s.get(lvl)) : 'off', function (id) {
			if (id === 'off') { if (s.get(sw)) s.set(sw, false); return; }
			if (String(s.get(lvl)) !== id) s.set(lvl, id);
			if (!s.get(sw)) s.set(sw, true);
		}, String(x.def), sub, lvl, dead);
	}
	
	function linesSlider() {
		var s = St(), stops = [{ id: 'none', label: t('None') }, { id: 'hairline', label: t('Hairline') }].concat(['1', '2', '3', '5'].map(function (id) { return { id: id, label: id + ' px' }; }));
		return stepSlider('borderWidth', t('Lines'), stops, s.get('borderWidth'), function (id) { s.set('borderWidth', id); }, 'none', t('Rows, buttons and outlined boxes'));
	}
	function cornersSlider() {
		var s = St(), words = PICK_WORD.corners;
		var stops = [{ id: 'none', label: t('Square') }].concat(PICK_ORDER.corners.map(function (id) { return { id: id, label: t(words[id]) }; }));
		return stepSlider('radius', t('Corners'), stops, s.get('radius'), function (id) { s.set('radius', id); }, 'medium', t('Of cards, buttons, fields and pictures'));
	}
	var PENS = { yellow: '#fff347', green: '#b4f07c', pink: '#ffb0d8', blue: '#a4d8ff', orange: '#ffc46e' };
	function highlightRow() {
		var s = St(), h = s.highlight ? s.highlight() : '', now = !h ? 'off' : Object.keys(PENS).filter(function (n) { return PENS[n] === h; })[0] || 'own';
		var items = [['off', t('None')]].concat(Object.keys(PENS).map(function (id) { return [id, t(MARKER_WORD[id]), false, PENS[id]]; }), [['own', t('Own Colour…'), false, now === 'own' ? h : '#ffd60a']]);
		return row(label('colours.{side}.highlight'), pop('highlight', label('colours.{side}.highlight'), now, items, function (id) {
			if (id === 'off') { s.setHighlight(''); return; }
			if (id === 'own') { if (now === 'off') s.setHighlight('#ffd60a'); editing = 'colours.{side}.highlight'; return; }
			s.setHighlight(PENS[id]);
		}, function (v) { return v === 'off' ? 'transparent' : h; }), esc(t('Marked words and selected text')));
	}
	function layoutPage() {
		var s = St(), guest = s.guest(), hidden = s.get('pictureFilter') === 'hidden';
		return box(levelRow('space', '', t('Room between the parts of a page; the text keeps its own')) + levelRow('lineLength', ' ' + t('letters'), t('Of the reading text; the column grows with its size'))) +
			moreButton() + (more ? box(levelRow('spaceInside', ' px', t('A title and the line under it, a button’s padding')) + levelRow('spaceItems', ' px', t('Posts in a list, cards in a grid')) + levelRow('spaceSections', ' px', t('The bands a page is built from')) + levelRow('spaceTitle', ' px', t('The room a page’s title stands in'))) : '') +
			gtitle(t('Article')) + box((guest || hidden ? '' : widthRow('pictureWidth')) + (guest ? '' : widthRow('titleWidth')) + (guest || hidden ? '' : widthRow('figureWidth')) + row(label('categories'), pickRow('categories', true), esc(t('The line of categories the article is filed under')))) +
			(guest ? '' : hint('Content is as wide as the reading column. Wide steps out on both sides. Full reaches the edges of the paper.'));
	}
	function shapePage() {
		var s = St(), lines = s.get('borderWidth') !== 'none';
		return box(cornersSlider() + linesSlider() + (lines ? levelRow('borderStrength', ' %', t(ROW_NOTE.borderStrength)) + pickRow('borderStyle') : '')) +
			gtitle(t('Boxes')) + box(pickRow('cards') + pickRow('quotes') + pickRow('fields'));
	}
	function buttonsPage() {
		var s = St(), ink = s.colour('ink'), rounded = s.get('rounded');
		return box(popRow('buttonColour', BUTTON_WORD, function (v) { return v === 'text' ? ink : s.colour(v === 'own' ? 'button' : 'accent'); }) + (rounded ? pickRow('buttonShape') : '')) +
			gtitle(t('Levels')) + box(pickRow('primaryButton') + pickRow('secondaryButton') + (s.guest() ? '' : pickRow('tertiaryButton'))) +
			gtitle(t('Tags, Links and Menus')) + box(pickRow('tags') + (rounded && s.get('buttonShape') !== 'match' ? switchRow('tagsMatchButtons', s.get('tags') === 'text', esc(t(s.get('tags') === 'text' ? 'Only when tags look like buttons' : 'Tags take the corners of the buttons')))  : '') + pickRow('links') + pickRow('currentItem')) +
			hint('A theme’s buttons and an AI’s buttons are sorted into the three levels by what they are.');
	}
	function looksOf(key) { var words = PICK_WORD[key] || {}, x = setting(key) || {}; return (x.choices || Object.keys(words)).map(function (id) { return [id, t(words[id] || id)]; }); }
	function picturesPage() {
		var s = St(), look = s.get('pictureFilter'), hidden = look === 'hidden', frame = s.get('pictureFrame');
		return box(pickRow('pictureFilter') + (look === 'none' || hidden ? '' : switchRow('colourOnHover', false, esc(t('The picture shows its colours under the pointer')))) + (hidden ? '' : switchRow('dimInDark', false, esc(t('Only in dark appearance'))) ) +
			(hidden ? '' : looksRow('pictureFrame', looksOf('pictureFrame')) + (frame !== 'none' ? levelRow('frameWidth', ' px') : s.guest() ? '' : pickRow('pictureEdge'))  + (s.guest() ? '' : looksRow('pictureFade', looksOf('pictureFade'))))) +
			(hidden || s.guest() ? '' : box(pickRow('pictureShadow') + pickRow('pictureCorners'))); 
	}
	var fxOpen = {}, fxFind = null, fxAll = false;
	function effectsPage() {
		var s = St(), night = s.side() === 'dark', guest = s.guest();
		var fx = function (id, d) { return pickRow('effects.' + id + '.' + d).replace('class="ldpw-r', 'class="ldpw-r ldpw-fxd'); }; 
		var on = function (key, rest) { return s.get(key) !== rest; };
		var rest = function (key) { if (s.guest() && GUEST_REST[key]) return GUEST_REST[key]; var x = setting(key); return x ? (x.def !== undefined && x.def !== null ? x.def : (x.choices || x.steps || [])[0]) : undefined; };
		var R = function (key, details, isOn) { var lit = isOn !== undefined ? !!isOn : on(key, rest(key)); return { k: key, on: lit, html: pickRow(key) + (lit && details ? details() : '') }; };
		var F = function (id, d, details) { var key = 'effects.' + id + '.' + d, lit = on(key, rest(key)); return { k: key, on: lit, html: fx(id, d) + (lit && details ? details() : '') }; };
		var H = function (key, html, lit) { return { k: key, on: !!lit, html: html }; };
		var G = [];
		var lit = '', body = '';
		G.forEach(function (g) {
			var rows = g.rows.filter(Boolean); if (!rows.length) return;
			var html = rows.map(function (r) { return r.html; }).join(''), n = rows.filter(function (r) { return r.on; }).length;
			lit += rows.filter(function (r) { return r.on; }).map(function (r) { return r.html; }).join('');
			if (fxFind && html.indexOf(fxFind) !== -1) fxOpen[g.id] = true; 
			var open = fxAll || !!fxOpen[g.id];
			body += '<div class="ldpw-box ldpw-fxbox">' +
				'<button type="button" class="ldpw-r ldpw-navrow ldpw-fxg" aria-expanded="' + open + '" data-act="fxg" data-g="' + g.id + '" data-f="fxg:' + g.id + '"><span class="ldpw-lb">' + esc(t(g.t)) + '<small>' + esc(t(g.sub)) + '</small></span>' +
				'<span class="ldpw-val">' + (n ? esc(n + ' ' + t('on')) + ' · ' : '') + rows.length + '</span><span class="ldpw-chev" aria-hidden="true"></span></button>' +
				(open ? html : '') + '</div>';
		});
		fxFind = null;
		return (lit ? gtitle(t('In this style')) + box(lit) : '') + (lit ? gtitle(t('All effects')) : '') + body +
			hint('Each effect shows its details while it is on. Movement stays still for readers who ask their computer for less motion.');
	}
	
	var TF = window.LDPTileFaces || null, tfDone = {}, tfSheet = null;
	function tileFace(stack) {
		if (!TF || !TF.faces || !stack) return stack;
		var fams = String(stack).split(',').map(function (f) { return f.trim().replace(/^["']|["']$/g, ''); });
		var fam = fams.filter(function (f) { return TF.faces[f]; })[0]; if (!fam) return stack;
		if (!tfDone[fam]) {
			tfDone[fam] = true;
			if (!tfSheet) { tfSheet = document.createElement('style'); tfSheet.id = 'ldp-tile-faces'; document.head.appendChild(tfSheet); }
			tfSheet.appendChild(document.createTextNode('@font-face { font-family: "LDP Aa ' + fam.replace(/"/g, '') + '"; font-style: normal; font-weight: ' + TF.faces[fam].weight + '; font-display: block; src: url("' + TF.base + TF.faces[fam].file + '") format("woff2"); }\n'));
		}
		var generic = fams.filter(function (f) { return /^(serif|sans-serif|monospace|system-ui|ui-monospace|cursive)$/.test(f); }).pop() || 'sans-serif';
		return '"LDP Aa ' + fam.replace(/"/g, '') + '", ' + generic;
	}
	var warmed = {};
	function warmFaces(id, all) { 
		var x = St() && St().tile ? St().tile(id) : null; if (!x || !x.faces || !document.fonts || !document.fonts.load) return;
		var italic = all;
		(all ? x.faces : x.face ? [x.face] : []).forEach(function (stack) {
			[['400', ''], italic ? ['400', 'italic '] : null].forEach(function (w) {
				if (!w) return; var key = w[1] + stack; if (warmed[key]) return; warmed[key] = true;
				try { document.fonts.load(w[1] + w[0] + ' 1em ' + stack).catch(function () {}); } catch (e) {  }
			});
		});
	}
	function warmShown() {
		if (!win || !open) return;
		Array.prototype.forEach.call(win.querySelectorAll('.ldpw-tile[data-style], .ldpw-tile[data-rstyle]'), function (b) { warmFaces(b.getAttribute('data-style') || b.getAttribute('data-rstyle'), false); });
	}
	function tileHTML(id, fixed) {
		var x = St().tile(id); if (!x) return '';
		var mk = 'tile:' + id;
		MENU[mk] = { label: nm(x), items: tileItems(x), pick: function (a) { tileAct(x, a); } };
		return '<div class="ldpw-stile' + (x.on ? ' is-on' : '') + '"' + (fixed ? '' : ' data-sid="' + esc(id) + '"') + '>' + 
			'<button type="button" class="ldpw-tile" role="radio" aria-checked="' + x.on + '" data-style="' + esc(id) + '" data-f="style:' + esc(id) + '">' +
				'<span class="ldpw-pic ldpw-spic" style="background:' + esc(x.paper) + ';color:' + esc(x.ink) + ';--pi:' + esc(x.ink) + ';--pa:' + esc(x.accent) + (x.face ? ';font-family:' + esc(tileFace(x.face)) : '') + '" aria-hidden="true"><b>Aa</b><i></i><i></i><i></i>' + (x.edited && !x.site ? '<em class="ldpw-dot" title="' + esc(t('Edited')) + '"></em>' : '') + (x.isDefault ? '<em class="ldpw-dflt">' + esc(t('Default')) + '</em>' : '') + '</span>' +
				'<span class="ldpw-nm">' + esc(nm(x)) + (x.isDefault ? '<span class="ldpw-sr">, ' + esc(t('Default')) + '</span>' : '') + '</span>' +
			'</button>' +
			'<button type="button" class="ldpw-tm' + (changedSince(x) ? ' has-dot' : '') + '" aria-haspopup="menu" aria-expanded="' + (menu === mk) + '" data-menu="' + esc(mk) + '" data-f="menu:' + esc(mk) + '" aria-label="' + esc(t('More') + ': ' + nm(x)) + '">' + svg(GLYPH.more) + (changedSince(x) ? '<i class="ldpw-badge" aria-hidden="true"></i>' : '') + '</button>' +
		'</div>';
	}
	function tileItems(x) {
		if (x.host) return [['customise', t('Duplicate to Customise')], ['duplicate', t('Duplicate')]];
		if (TRY()) return [['customise', t('Customise')], ['duplicate', t('Duplicate')]].concat(x.own ? [['rename', t('Rename…')]] : [], [null, ['reset', t('Reset Style…'), !changedSince(x), '', '', changedSince(x)]], x.own ? [['delete', t('Delete…')]] : []);
		var orig = St().styles().original === x.id; 
		var out = [['customise', t('Customise')], null, ['default', t('Make Default'), x.isDefault]].concat(orig ? [] : [['seen', t(x.seen ? 'Hide from Readers' : 'Show to Readers'), x.seen && x.isDefault]]);
		if (x.own || x.site) out.push(['rename', t('Rename…')]);
		out.push(['duplicate', t('Duplicate')]);
		if (x.seen && !orig) { var sh = St().styles().shown, at = sh.indexOf(x.id); if (at > -1) out.push(null, ['moveleft', t('Move Left'), at === 0], ['moveright', t('Move Right'), at === sh.length - 1]); }
		var last = [['reset', t('Reset Style…'), !changedSince(x), '', '', changedSince(x)]]; 
		if (x.own) last.push(['delete', t('Delete…')]);
		if (x.site) last.push(['unpublish', t('Remove from Site…')]); 
		return last.length ? out.concat([null], last) : out;
	}
	var copiedTimer = 0;
	function flashCopied() {
		var big = win && win.querySelector('.ldpw-big'); if (!big) return;
		big.classList.add('is-copied'); clearTimeout(copiedTimer);
		copiedTimer = setTimeout(function () { var b = win && win.querySelector('.ldpw-big'); if (b) b.classList.remove('is-copied'); }, 1400);
		var live = win.querySelector('[data-copied-live]'); if (live) { live.textContent = ''; live.textContent = t('Copied'); }
	}
	function done(word) { note = word; clearTimeout(noteTimer); noteTimer = setTimeout(function () { note = ''; if (open) render(); }, 2400); }
	function failed(e) { done(e && e.said ? String(e.message) : t('Could not save. Try again.')); render(); return e; } 
	function tileAct(x, a) {
		var s = St(), id = x.id, back = '[data-style="' + id + '"]';
		if (a === 'customise') { if (x.host) s.duplicate(id); else s.choose(id); section = 'colour'; return; }
		if (a === 'duplicate') { s.duplicate(id); done(t('Duplicated')); return; }
		if (a === 'moveleft' || a === 'moveright') { moveBy(id, a === 'moveleft' ? -1 : 1); return; }
		if (a === 'default') { var madeDefault = s.makeDefault(id); Promise.resolve().then(function () { if (open) render(back); }); madeDefault.then(function () { done(t('Made Default')); render(back); }, failed); return; }
		if (a === 'seen') { btnWrite(s.setSeen(id, !x.seen), back); return; }
		if (a === 'reset') { if (id !== s.current()) s.choose(id); askRevertAll(x); return; }
		if (a === 'rename') { asking = { title: t('Rename Style'), field: nm(x), go: t('Rename'), back: back, run: function (v) { return s.rename(id, v); } }; return; }
		if (a === 'delete') { asking = { title: t('Delete “{name}”?').replace('{name}', nm(x)), text: t('You can’t undo this.'), go: t('Delete'), danger: true, back: '[data-sec="styles"]', run: function () { s.remove(id); } }; return; }
		if (a === 'unpublish') { asking = { title: t('Remove “{name}” from the site?').replace('{name}', nm(x)), text: t('Readers no longer see it. It stays here as one of your own styles.'), go: t('Remove'), danger: true, back: back, run: function () { return s.unpublish(id); } }; return; }
	}
	function stylesPage() {
		var s = St(), st = s.styles(), out = '';
		var orig = st.original ? tileHTML(st.original, true) : '';
		
		var fold = prefs.fold || {};
		function head(g, w, n) { var o = !fold[g]; return '<button type="button" class="ldpw-gtitle ldpw-fold" data-fold="' + g + '" data-f="fold:' + g + '" aria-expanded="' + o + '">' + esc(w) + (o ? '' : ' <small>' + n + '</small>') + '</button>'; }
		if (TRY()) {
			return '<div class="ldpw-gtitle">' + esc(t('Styles')) + '</div><div class="ldpw-tiles ldpw-styles" role="radiogroup" aria-label="' + esc(t('Styles')) + '">' + orig + st.shown.concat(st.hidden).map(function (id) { return tileHTML(id); }).join('') + '</div>' +
				'<p class="ldpw-hint">' + esc(t('You are trying Vibetiles. Everything you change stays on this page and is gone when you leave.')) + '</p>';
		}
		out += head('shown', t('Shown to Readers'), st.shown.length + (orig ? 1 : 0)) + '<div class="ldpw-tiles ldpw-styles ldpw-sortable' + (fold.shown ? ' is-folded' : '') + '" data-group="shown" role="radiogroup" aria-label="' + esc(t('Shown to Readers')) + '">' + orig + st.shown.map(function (id) { return tileHTML(id); }).join('') + '</div>';
		out += head('hidden', t('Hidden from Readers'), st.hidden.length) + '<div class="ldpw-tiles ldpw-styles ldpw-sortable' + (fold.hidden ? ' is-folded' : '') + '" data-group="hidden" role="radiogroup" aria-label="' + esc(t('Hidden from Readers')) + '">' + st.hidden.map(function (id) { return tileHTML(id); }).join('') + '</div>';
		return out + '<p class="ldpw-hint">' + esc(phone() ? t('Show, hide and Make Default are in each style’s ••• menu.') : t('Drag a style to change its order or to show or hide it. Make Default is in each style’s ••• menu.')) + '</p>';
	}
	function foot(x, s, deep, built) {
		var rev = built && s && !editing && !deep && pagePaths(x.id).length ? '<button type="button" class="ldpw-link" data-act="revertpage" data-f="act:revertpage">' + esc(t('Revert {page}').replace('{page}', x.name)) + '</button>' : '';
		var blue = phone() && built && s && x.id !== 'styles' && x.id !== 'button' ? commit() : '';
		return rev || blue ? '<div class="ldpw-foot">' + (rev || '<span></span>') + blue + '</div>' : '';
	}
	function editedWord(s, plain) {
		var x = s && s.tile(s.current()); if (!x) return '';
		var w = x.site ? (x.saving ? t('Saving…') : '') : (x.edited ? t('Edited') : '');
		return plain ? w : w ? '<em>' + esc(w) + '</em>' : '';
	}
	function commit() {
		var s = St(), x = s.tile(s.current());
		if (TRY()) return ''; 
		if (!x || x.host || x.own || x.site) return ''; 
		if (!x.edited && s.styles().original === x.id) return ''; 
		return '<button type="button" class="ldpw-blue ldpw-commit" data-act="commit" data-f="act:commit"' + (x.edited ? '' : ' disabled') + '>' + esc(x.site ? t('Publish') : t('Save As…')) + '</button>';
	}
	function commitPress() {
		var s = St(), x = s.tile(s.current()); if (!x) return;
		if (x.site) {
			asking = { title: t('Publish the changes to “{name}”?').replace('{name}', nm(x)), text: t('Readers will see them the next time they open a page.'), go: t('Publish'), back: '[data-act="commit"]', run: function () { return s.publish().then(function () { done(t('Published')); }); } };
		} else {
			asking = { title: t('Save As New Style'), field: t('{name} Copy').replace('{name}', nm(x)), go: t('Save'), back: '[data-act="commit"]', run: function (v) { s.saveAs(v); done(t('Saved')); } };
		}
		render();
	}
	function askGo() {
		var a = asking; if (!a || a === true) return;
		var f = win.querySelector('#ldpw-ask-field'), v = f ? f.value.trim() : '';
		if (f && !v) { f.focus(); return; }
		win.querySelectorAll('.ldpw-sheet button').forEach(function (x) { x.disabled = true; });
		Promise.resolve().then(function () { return a.run(v); }).then(function () { if (asking === a) asking = false; render(a.back); }, function () {
			a.err = a.fail || t('Could not save. Try again.'); render();
		});
	}
	
	var sorting = null, justSorted = false;
	function sortDown(e) {
		if (e.button !== 0 || asking || RD() || TRY() || phone() || !e.target.closest) return;
		var item = e.target.closest('.ldpw-sortable > [data-sid]');
		if (!item || e.target.closest('.ldpw-sw, .ldpw-tm, .ldpw-pop, [data-menu]:not([data-sid])')) return;
		var x0 = e.clientX, y0 = e.clientY, started = false;
		function begin() {
			started = true; holding = true;
			var r = item.getBoundingClientRect(), wr = win.getBoundingClientRect(), list = item.parentNode, grid = !list.classList.contains('is-list');
			var ph = document.createElement('div'), card = grid && item.querySelector('.ldpw-pic'); ph.className = 'ldpw-sortph ' + (grid ? 'is-tile' : 'is-row'); ph.style.height = (card ? card.offsetHeight : r.height) + 'px';  if (grid) ph.style.width = r.width + 'px';
			list.insertBefore(ph, item);
			sorting = { item: item, ph: ph, dx: x0 - r.left, dy: y0 - r.top, grid: grid, wr: wr, scroll: win.querySelector('.ldpw-scroll'), vy: 0, last: null };
			item.classList.add('ldpw-lift'); item.style.width = r.width + 'px'; item.style.height = r.height + 'px'; item.style.left = (r.left - wr.left) + 'px'; item.style.top = (r.top - wr.top) + 'px';
			win.appendChild(item); win.classList.add('is-sorting');
			win.querySelectorAll('.ldpw-sortable').forEach(function (c) { c.classList.add('is-dropok'); });
			(function tick() { if (!sorting) return; if (sorting.vy && sorting.scroll) { sorting.scroll.scrollTop += sorting.vy; place2(sorting.last); } requestAnimationFrame(tick); })();
		}
		function flipMove(fn) {
			var sibs = [].slice.call(win.querySelectorAll('.ldpw-sortable > *')).filter(function (x) { return x !== sorting.ph; }), before = sibs.map(function (x) { return x.getBoundingClientRect(); });
			fn();
			if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || prefs.motion === 'reduced') return;
			sibs.forEach(function (x, k) { var a = x.getBoundingClientRect(), dx = before[k].left - a.left, dy = before[k].top - a.top;
				if (dx || dy) x.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 180, easing: 'cubic-bezier(.2,.8,.2,1)' }); });
		}
		function place2(ev) {
			if (!ev) return; sorting.last = ev;
			sorting.item.style.left = (ev.clientX - sorting.dx - sorting.wr.left) + 'px'; sorting.item.style.top = (ev.clientY - sorting.dy - sorting.wr.top) + 'px';
			var lists = [].slice.call(win.querySelectorAll('.ldpw-sortable')).filter(function (c) { return c.classList.contains('is-list') !== sorting.grid; });
			var list = lists.filter(function (c) { var q = c.getBoundingClientRect(); return ev.clientX > q.left - 24 && ev.clientX < q.right + 24 && ev.clientY > q.top - 24 && ev.clientY < q.bottom + 24; })[0];
			if (list) {
				var kids = [].slice.call(list.children).filter(function (k) { return k !== sorting.ph && k.hasAttribute('data-sid'); }), target = null;
				for (var n = 0; n < kids.length; n++) { var q = kids[n].getBoundingClientRect();
					if (sorting.grid ? (ev.clientY < q.top || (ev.clientY < q.bottom && ev.clientX < q.left + q.width / 2)) : ev.clientY < q.top + q.height / 2) { target = kids[n]; break; } }
				if (sorting.ph.parentNode !== list || sorting.ph.nextSibling !== target) flipMove(function () { list.insertBefore(sorting.ph, target); });
			}
			var sr = sorting.scroll && sorting.scroll.getBoundingClientRect();
			sorting.vy = !sr ? 0 : ev.clientY < sr.top + 40 ? -8 : ev.clientY > sr.bottom - 40 ? 8 : 0;
		}
		function move(ev) {
			var far = Math.abs(ev.clientX - x0) + Math.abs(ev.clientY - y0);
			if (!started) { if (far < 6) return; begin(); }
			ev.preventDefault(); place2(ev);
		}
		function end(cancel) {
			window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('keydown', key, true);
			if (!started) return;
			justSorted = true; setTimeout(function () { justSorted = false; }, 0);
			var so = sorting, id = so.item.getAttribute('data-sid'), target = cancel ? null : so.ph.getBoundingClientRect();
			function finish() {
				var order = cancel ? null : sortedOrder(id);
				so.item.remove(); so.ph.remove(); win.classList.remove('is-sorting'); sorting = null; holding = false;
				if (order) commitOrder(order, id); else render();
			}
			if (target && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
				var r = so.item.getBoundingClientRect(); so.item.classList.add('is-dropping');
				so.item.animate([{ left: (r.left - so.wr.left) + 'px', top: (r.top - so.wr.top) + 'px' }, { left: (target.left - so.wr.left) + 'px', top: (target.top - so.wr.top) + 'px' }], { duration: 160, easing: 'ease-out', fill: 'forwards' }).onfinish = finish;
			} else finish();
		}
		function up() { end(false); }
		function key(ev) { if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); end(true); } }
		window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('keydown', key, true);
	}
	function sortedOrder(id) {
		function ids(c) { return c ? [].slice.call(c.querySelectorAll(':scope > [data-sid], :scope > .ldpw-sortph')).map(function (x) { return x.classList.contains('ldpw-sortph') ? id : x.getAttribute('data-sid'); }) : null; }
		return { shown: ids(win.querySelector('.ldpw-sortable[data-group="shown"]')), list: ids(win.querySelector('.ldpw-sortable[data-group="list"]')) };
	}
	function commitOrder(o, id) {
		var s = St(), st0 = s.styles(), before = s.visibleOrder().filter(function (x) { var y = s.tile(x); return y && !y.host && x !== st0.original; }), next;
		if (o.list) { next = o.list.filter(function (x) { return before.indexOf(x) !== -1; }); }
		else { next = (o.shown || st0.shown).slice(); } 
		next = withOriginal(next); before = withOriginal(before);
		var landed = function () { var el = win.querySelector('[data-sid="' + id + '"]'); if (el) { el.classList.remove('is-landed'); void el.offsetWidth; el.classList.add('is-landed'); } };
		if (next.join() === before.join()) { render(); landed(); return; }
		s.setVisible(next).then(function () { render(); landed(); }, failed);
		render(); landed();
	}
	
	function withOriginal(next) {
		var s = St(), vo = s.visibleOrder(), k = -1;
		vo.forEach(function (x, i) { var y = s.tile(x); if (k < 0 && y && y.host) k = i; });
		if (k > -1 && next.indexOf(vo[k]) === -1) { next = next.slice(); next.splice(Math.min(k, next.length), 0, vo[k]); }
		return next;
	}
	function reorder(ids, focusId) {
		ids = withOriginal(ids);
		var back = '[data-menu="tile:' + focusId + '"]'; 
		St().setVisible(ids).then(function () { render(back); }, failed);
		render(back);
	}
	function moveBy(id, by) {
		var ids = St().styles().shown.slice(), i = ids.indexOf(id), j = i + by;
		if (i < 0 || j < 0 || j >= ids.length) return;
		ids.splice(i, 1); ids.splice(j, 0, id);
		reorder(ids, id);
	}
	var BTN_WORD = {
		place: { auto: 'Automatic', 'top-left': 'Top left', 'top-right': 'Top right', left: 'Left side', right: 'Right side', 'bottom-left': 'Bottom left', 'bottom-center': 'Bottom centre', 'bottom-right': 'Bottom right' },
		size: { small: 'Small', medium: 'Medium', large: 'Large' },
		show: { icon: 'Icon', both: 'Icon and name', hover: 'Name on hover' },
		glyph: { sliders: 'Sliders', aa: 'Aa', sparkles: 'Sparkle', brush: 'Brush' },
		corners: { site: 'Rounded', round: 'Round' }, 
		color: { panel: 'Neutral', site: 'Site Colour', own: 'Own Colour…' }
	};
	var BTN_ORDER = { size: ['small', 'medium', 'large'], show: ['icon', 'both', 'hover'], corners: ['site', 'round'], color: ['panel', 'site', 'own'], glyph: ['sliders', 'aa', 'sparkles', 'brush'] };
	var SPOTS = ['top-left', 'top-right', 'left', 'right', 'bottom-left', 'bottom-center', 'bottom-right'];
	function bSwitch(key, lb, on, off, sub) { return row(t(lb), '<button type="button" class="ldpw-sw" role="switch" aria-checked="' + !!on + '" data-bset="' + key + '" data-f="bset:' + key + '" aria-label="' + esc(t(lb)) + '"' + (off ? ' disabled' : '') + '></button>', sub ? esc(sub) : '', off ? 'is-off' : ''); }
	function doorColour(id, bt) {
		if (id === 'own') return isHex(bt.own) ? bt.own : '#0a84ff';
		if (id === 'site') return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0a84ff';
		var dark = prefs.look === 'dark' || (prefs.look === 'auto' && !!systemDark && systemDark.matches); return dark ? '#2c2c2e' : '#ffffff';
	}
	function bPop(key, lb, bt) {
		var dots = key === 'color';
		return row(t(lb), pop('btn-' + key, t(lb), bt[key], BTN_ORDER[key].map(function (id) { return [id, t(BTN_WORD[key][id]), false, dots ? doorColour(id, bt) : '']; }), function (id) {
			if (key === 'color' && id === 'own') { editing = 'door.own'; btnWrite(St().setButton('color', 'own'), '[data-act="back"]'); return; } 
			btnWrite(St().setButton(key, id), '[data-menu="btn-' + key + '"]');
		}, dots ? function (v) { return doorColour(v, bt); } : null), key === 'show' ? esc(t('What the button shows')) : '');
	}
	function nameRow(bt) { return row(t('Name'), '<input type="text" class="ldpw-name" data-blabel data-f="blabel" maxlength="30" value="' + esc(bt.label || '') + '" placeholder="' + esc(t('Vibetiles')) + '" aria-label="' + esc(t('Name')) + '">'); }
	var previewsHeld = null, previewsAsked = false;
	function loadPreviews() { previewsAsked = true; St().previews().then(function (l) { previewsHeld = l || []; if (open) render(); }, function () { previewsHeld = []; }); }
	function endsWord(until) { return t('Ends {date}').replace('{date}', new Date(until * 1000).toLocaleDateString('en', { day: 'numeric', month: 'long' })); }
	function previewLinks() {
		var s = St(); if (!s.previews || !s.canPublish || !s.canPublish()) return '';
		if (!previewsAsked) loadPreviews();
		var list = previewsHeld || [];
		return gtitle(t('Preview Links')) + box((list.length ? list.map(function (l) {
			return '<div class="ldpw-r"><span class="ldpw-lb">' + esc(l.name) + '<small>' + esc(endsWord(l.until)) + '</small></span>' +
				'<button type="button" class="ldpw-get" data-plink="copy:' + l.id + '" data-f="plink:copy:' + l.id + '">' + esc(t('Copy')) + '</button>' +
				'<button type="button" class="ldpw-get" data-plink="open:' + l.id + '" data-f="plink:open:' + l.id + '">' + esc(t('Open')) + '</button>' +
				'<button type="button" class="ldpw-get is-red" data-plink="stop:' + l.id + '" data-f="plink:stop:' + l.id + '">' + esc(t('Stop')) + '</button></div>';
		}).join('') : '<div class="ldpw-r"><span class="ldpw-lb ldpw-soft">' + esc(t(previewsHeld ? 'No preview links' : 'Loading…')) + '</span></div>') +
			'<button type="button" class="ldpw-r ldpw-navrow ldpw-bluelink" data-act="share" data-f="act:share"><span class="ldpw-lb">' + esc(t('Share a Preview…')) + '</span></button>');
	}
	function askShare() {
		var s = St(), x = s.tile(s.current()), name = x ? nm(x) : '', edited = !!(x && x.edited);
		asking = { title: t('Share a Preview of “{name}”').replace('{name}', name), text: t(edited ? 'Anyone with the link sees your site in this style as it is now, with your unsaved changes. They can’t change anything, and your readers don’t see it. The link works for 7 days.' : 'Anyone with the link sees your site in this style as it is now. They can’t change anything, and your readers don’t see it. The link works for 7 days.'), go: t('Copy Link'), back: '[data-act="share"]', run: function () {
			return s.sharePreview(name + (edited ? ', ' + t('edited') : '')).then(function (r) {
				previewsHeld = (r && r.links) || previewsHeld;
				var url = s.previewURL(r.id);
				if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).catch(function () {});
				done(t('Link Copied'));
			});
		} };
		render('[data-act="ask-go"]');
	}
	function buttonPage() {
		var s = St(), bt = s.button();
		if (!bt) return '<p class="ldpw-hint">' + esc(t('This site has no Vibetiles button settings.')) + '</p>';
		var auto = bt.place === 'auto', inMenu = auto && s.buttonInMenu(), word = inMenu && s.buttonWordInMenu();
		var map = auto ? '' : '<div class="ldpw-r ldpw-spotrow"><div class="ldpw-top"><span class="ldpw-lb">' + esc(t('Where')) + '</span><span class="ldpw-val">' + esc(t(BTN_WORD.place[bt.place] || '')) + '</span></div>' +
			'<div class="ldpw-spotmap" role="radiogroup" aria-label="' + esc(t('Where')) + '"><span class="ldpw-mini" aria-hidden="true"><i></i><i></i><i></i></span>' +
			SPOTS.map(function (id) { var on = bt.place === id; return '<button type="button" class="ldpw-spot' + (on ? ' is-on' : '') + '" role="radio" aria-checked="' + on + '" data-spot="' + id + '" data-f="spot:' + id + '" aria-label="' + esc(t(BTN_WORD.place[id])) + '" title="' + esc(t(BTN_WORD.place[id])) + '"></button>'; }).join('') +
			'<span class="ldpw-minidoor" data-at="' + esc(bt.place) + '" aria-hidden="true"></span></div><p class="ldpw-hint ldpw-maphint">' + esc(t('Or drag the button itself on the page.')) + '</p></div>';
		
		var rests = (inMenu && word) || (auto && s.buttonInSlot && s.buttonInSlot());
		var out = gtitle(t('Vibetiles Button')) + box(bSwitch('auto', 'Automatic', auto, false, auto ? t('In your site’s menu, as one of its items') : '') +
			(inMenu ? bSwitch('icon', 'Show icon', bt.icon !== false, false, t('Beside the name in the menu')) : '') + map +
			(auto ? '' : row(t('Size'), seg('bsize', bt.size, BTN_ORDER.size.map(function (id) { return [id, t(BTN_WORD.size[id])]; }), t('Size'))) + bPop('show', 'Show', bt) + bPop('corners', 'Corners', bt) + bPop('color', 'Colour', bt)) +
			bPop('glyph', 'Icon', bt) + (inMenu || bt.show !== 'icon' ? nameRow(bt) : '') +
			bSwitch('aurora', 'Aurora', bt.aurora, rests, rests ? t('Rests while the button sits in your menu; it shows on a floating button') : '') +
			(bt.aurora && !rests ? bandRow(bt) : ''));
		out += gtitle(t('Readers')) + box(row(t('Show to'), seg('who', bt.who, [['everyone', t('Everyone')], ['me', t('Only me')]], t('Who sees the button'))) +
			row(t('Allow readers to copy styles'), '<button type="button" class="ldpw-sw" role="switch" aria-checked="' + s.readersCopy() + '" data-copyon data-f="copyon" aria-label="' + esc(t('Allow readers to copy styles')) + '"></button>', esc(t('Readers can take a style to their own site'))));
		out += previewLinks();
		return out;
	}
	function btnWrite(p, focus) { render(focus); p.then(function () { render(focus); }, failed); }
	
	var ALONE = { primaryButton: 'Main buttons', secondaryButton: 'Other buttons', tertiaryButton: 'Quiet buttons', buttonColour: 'Button colour', buttonShape: 'Button corners' };
	var WIDTH_WORD = { content: 'Content', wide: 'Wide', full: 'Full' };
	var VALUE_WORD = { radius: { none: 'Square', small: 'Small', medium: 'Medium', large: 'Large', xlarge: 'Very large' }, borderWidth: { none: 'None', hairline: 'Hairline', '1': '1 px', '2': '2 px', '3': '3 px', '5': '5 px' }, buttonColour: BUTTON_WORD, titleWidth: WIDTH_WORD, pictureWidth: WIDTH_WORD, figureWidth: WIDTH_WORD, scope: { article: 'In articles', all: 'Everywhere' } };
	var VALUE_UNIT = { lineLength: ' letters', borderStrength: ' %', frameWidth: ' px', spaceInside: ' px', spaceItems: ' px', spaceSections: ' px', spaceTitle: ' px', capLines: ' lines' };
	var DIAL_WORD = { font: 'Font', weight: 'Weight', size: 'Size', categorySize: 'Category line', letterSpacing: 'Character spacing', capitals: 'Capitals', italic: 'Italic', lineHeight: 'Line spacing', align: 'Alignment', colour: 'Colour' };
	var TOP_WORD = { face: 'Reading font', sans: 'Interface font', reading: 'Size', leading: 'Line spacing', palette: 'Colour', preset: 'Colour', tint: 'Colour', accent: 'Accent', capLines: 'Drop cap height' };
	var TOP_SECTION = { face: 'type', sans: 'type', reading: 'type', leading: 'type', roles: 'type', capLines: 'type', justify: 'type', dropcap: 'type', hyphenate: 'type', capface: 'type', palette: 'colour', preset: 'colour', tint: 'colour', accent: 'colour', colours: 'colour', effects: 'effects' };
	function changeName(path) {
		var p = path.split('.'), s = St();
		if (p[0] === 'roles') {
			var r = t(roleMeta(p[1]).label);
			return r + ' › ' + t(DIAL_WORD[p[2]] || p[2]);
		}
		if (p[0] === 'colours') return label('colours.{side}.' + p[2]) + ' › ' + t(p[1] === 'dark' ? 'Dark' : 'Light');
		if (p[0] === 'effects') return t(FX_NAME[p[1]] || p[1]) + ' › ' + label(path);
		if (ALONE[p[0]]) return t(ALONE[p[0]]); 
		if (LAB_LABEL[p[0]] || (setting(p[0]) && setting(p[0]).label)) return label(p[0]);
		var x = setting(p[0]);
		return x && x.label ? nm(x) : TOP_WORD[p[0]] ? t(TOP_WORD[p[0]]) : p[0];
	}
	function changeValue(path, v) {
		var k = path.split('.').pop();
		if (typeof v === 'boolean') return t(v ? 'On' : 'Off');
		if (v === '' || v === null || v === undefined) return t('Default');
		if (isHex(v)) return v.toUpperCase();
		var w = (PICK_WORD[path] && PICK_WORD[path][v]) || (PICK_WORD[k] && PICK_WORD[k][v]) || (LEVEL_WORD[k] && LEVEL_WORD[k][v]) || (k === 'weight' && WEIGHT_LABEL[v]) || (k === 'markercolour' && MARKER_WORD[v]) || (k === 'button' && BUTTON_WORD[v]);
		if (path.indexOf('roles.') === 0 && k === 'size') { var px = (St().typeSizes(path.split('.')[1]).filter(function (x) { return x.id === String(v); })[0] || {}).px; return px ? px + ' px' : String(v); }
		if (path.indexOf('roles.') === 0 && k === 'categorySize') { if (v === 'same') return t('Follows Size'); var cpx = (St().typeSizes('meta', 'categorySize').filter(function (x) { return x.id === String(v); })[0] || {}).px; return cpx ? cpx + ' px' : String(v); }
		if (path.indexOf('roles.') === 0 && k === 'lineHeight' && LINE_WORD[v]) return t(LINE_WORD[v]);
		if (path.indexOf('roles.') === 0 && k === 'letterSpacing' && LETTER_WORD[v]) return t(LETTER_WORD[v]);
		if (path.indexOf('roles.') === 0 && k === 'font') return faceName(v);
		if (!w && VALUE_WORD[k]) w = VALUE_WORD[k][v];
		if (!w && VALUE_UNIT[k]) return v + VALUE_UNIT[k];
		return w ? t(w) : k === 'size' ? v + ' px' : String(v);
	}
	var DRAWN_ON = { pictureFilter: 'pictures', colourOnHover: 'pictures', dimInDark: 'pictures', pictureFrame: 'pictures', frameWidth: 'pictures', pictureFade: 'pictures', pictureShadow: 'pictures', pictureEdge: 'pictures', pictureCorners: 'pictures', buttonColour: 'buttons', radius: 'corners-and-lines', borderWidth: 'corners-and-lines', borderStyle: 'corners-and-lines', borderStrength: 'corners-and-lines', fill: 'corners-and-lines', lineLength: 'layout', titleWidth: 'layout', pictureWidth: 'layout', figureWidth: 'layout', button: 'buttons', buttonShape: 'buttons', primaryButton: 'buttons', secondaryButton: 'buttons', tertiaryButton: 'buttons', tags: 'buttons', tagsMatchButtons: 'buttons', links: 'buttons', currentItem: 'buttons' };
	var WELL_ON = { button: 'buttons', title: 'type', headings: 'type', body: 'type', quote: 'type', meta: 'type', 'interface': 'type', code: 'type' };
	function changeSection(path) {
		var p = path.split('.'), k = p[0], x = setting(k);
		if (k === 'colours') return WELL_ON[p[p.length - 1]] || 'colour';
		return DRAWN_ON[k] || TOP_SECTION[k] || (x && x.section) || '';
	}
	function sectionName(id) { var l = sections().filter(function (x) { return x.id === id; })[0]; return l ? l.name : ''; }
	function changesPage() {
		var s = St(), list = s.changes(), x = s.tile(s.current()), name = nm(x);
		if (!list.length) return '<p class="ldpw-hint ldpw-center">' + esc(t('No changes. {name} is as it was saved.').replace('{name}', name)) + '</p>';
		return '<p class="ldpw-hint">' + esc(t(list.length === 1 ? 'One change to {name}. It can go back on its own.' : '{n} changes to {name}. Each can go back on its own.').replace('{n}', list.length).replace('{name}', name)) + '</p>' +
			box(list.map(function (c) {
				var sec = changeSection(c.path), where = sec ? sectionName(sec) : '', val = changeValue(c.path, c.value);
				return '<div class="ldpw-r"><button type="button" class="ldpw-lb ldpw-golink" data-goto="' + esc(sec) + '" data-f="goto:' + esc(c.path) + '"' + (sec ? '' : ' disabled') + '>' + esc(changeName(c.path)) + '<small>' + (isHex(c.value) ? '<i class="ldpw-dotwell" style="background:' + esc(c.value) + '"></i>' : '') + esc(val + (where ? ' · ' + where : '')) + '</small></button>' +
					'<button type="button" class="ldpw-get" data-revert="' + esc(c.path) + '" data-f="revert:' + esc(c.path) + '">' + esc(t('Revert')) + '</button></div>';
			}).join('')) +
			'<button type="button" class="ldpw-more ldpw-bluelink" data-act="revert-all" data-f="act:revert-all">' + esc(t('Reset Style…')) + '</button>';
	}
	function barMore() {
		var s = St(), n = s ? s.changes().length : 0;
		var ed = s && s.editable();
		var x0 = s && s.tile ? s.tile(s.current()) : null;
		MENU.barmore = { label: t('More'), items: [['undo', undoName() + '  ⌘Z', !(s && s.canUndo())], ['redo', redoName() + '  ⇧⌘Z', !(s && s.canRedo && s.canRedo())], null,
			].concat(TRY() ? [] : [['saveas', t('Save As…'), !x0 || x0.host] , ['versions', t('Browse Versions')], ['share', t('Share Preview…')], ['starters', t('Restore Starter Styles'), !(s && s.canPublish && s.canPublish())] , null], [ 
			['copystyle', t('Copy Style') + '  ⌥⌘C'], ['copycss', t('Copy as CSS')], ['copyjson', t('Copy as JSON')], ['copytheme', t('Copy as theme.json')], ['pastestyle', t('Paste Style…') + '  ⌥⌘V'], null].concat(zoomItems(),
			(x0 && !x0.host ? [null, ['changes', t('Show Changes') + (n ? ' (' + n + ')' : ''), !n] , ['revertall', t('Reset Style…'), !changedSince(x0, n), '', '', changedSince(x0, n)]] : []).concat(TRY() ? [null, ['cmdk', t('Search…') + '  ⌘K']] : [null, ['settings', t('Settings…') + '  ⌘,'], ['cmdk', t('Search…') + '  ⌘K']]))), pick: function (a) {
			if (a === 'redo') { if (s && s.canRedo && s.canRedo()) { s.redo(); render('[data-menu="barmore"]'); } }
			else if (a === 'copycss' || a === 'copyjson' || a === 'copytheme') copyCode(a === 'copycss' ? 'css' : a === 'copytheme' ? 'theme' : 'json');
			else if (a === 'changes') { showChanges = true; showVersions = false; editing = null; }
			else if (a === 'saveas') { var sx = s.tile(s.current()); asking = { title: t('Save As New Style'), field: t('{name} Copy').replace('{name}', t(sx.label)), go: t('Save'), back: '[data-menu="barmore"]', run: function (v) { s.saveAs(v); done(t('Saved')); } }; render(); }
			else if (a === 'versions') openVersions();
			else if (a === 'starters') { s.restoreStarters().then(function (n) { done(n ? t('Starter styles restored') : t('All starter styles are here')); section = 'styles'; render(); }, failed); }
			else if (a === 'cmdk') openCmd();
			else if (a === 'revertall') askRevertAll();
			else if (a === 'copystyle') copyStyle();
			else if (a === 'pastestyle') askPaste();
			else if (a === 'bigger' || a === 'smaller' || a === 'actual') zoomBy(a);
			else barAct(a);
		} };
		var dot = changedSince(x0, n);
		return '<button type="button" class="ldpw-circ' + (dot ? ' has-dot' : '') + '" aria-haspopup="menu" aria-expanded="' + (menu === 'barmore') + '" data-menu="barmore" data-f="menu:barmore" aria-label="' + esc(t('More') + (dot ? ', ' + t('Changed') : '')) + '" title="' + esc(t('More')) + '">' + svg(GLYPH.more) + (dot ? '<i class="ldpw-badge" aria-hidden="true"></i>' : '') + '</button>';
	}
	function barAct(a) {
		if (a === 'undo') { var s = St(); if (s && s.canUndo()) { s.undo(); render('[data-menu="barmore"]'); } }
		else if (a === 'aim') { var b = win.querySelector('[data-act="aim"]'); if (b) b.click(); }
		else if (a === 'commit') commitPress();
		else if (a === 'share') askShare();
		else if (a === 'settings' && !TRY()) { sq = null; section = 'settings'; role = null; fontFor = null; editing = null; showChanges = false; showVersions = false; phoneList = false; render('.ldpw-nav.is-on, [data-menu="barmore"]'); }
		else if (a === 'ask') { asking = true; render('x'); }
	}
	function settingsMore() {
		MENU.barmore = { label: t('More'), items: [['cmdk', t('Search…') + '  ⌘K'], null].concat(zoomItems(), []), pick: function (a) {
			if (a === 'cmdk') openCmd(); else if (a === 'bigger' || a === 'smaller' || a === 'actual') zoomBy(a); else barAct(a);
		} };
		return '<button type="button" class="ldpw-circ" aria-haspopup="menu" aria-expanded="' + (menu === 'barmore') + '" data-menu="barmore" data-f="menu:barmore" aria-label="' + esc(t('More')) + '" title="' + esc(t('More')) + '">' + svg(GLYPH.more) + '</button>';
	}
	function copyCode(kind) {
		var s = St(), code = '';
		if (kind === 'json') { try { code = JSON.stringify(JSON.parse(s.exportStyle()), null, 2); } catch (e) { code = ''; } }
		else if (kind === 'theme') code = themeJson();
		else {
			var cs = getComputedStyle(document.documentElement), name = styleName();
			code = '/' + '* ' + name + ', made with Vibetiles *' + '/\n:root {\n' + ['--surface-base', '--surface-canvas', '--surface-raised', '--text-primary', '--text-secondary', '--text-muted', '--accent', '--accent-contrast', '--line', '--radius-sm', '--radius-lg', '--radius-control', '--radius-row', '--font-reading', '--font-sans', '--text-reading-body', '--text-article-title']
				.map(function (k) { var v = cs.getPropertyValue(k).trim(); return v ? '  ' + k + ': ' + v + ';' : ''; }).filter(Boolean).join('\n') + '\n}\n';
		}
		if (!code) { done(t('Could not copy')); render(); return; }
		var ok = function () { done(t(kind === 'css' ? 'CSS Copied' : kind === 'theme' ? 'theme.json Copied' : 'JSON Copied')); render(); };
		if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(ok, ok); else ok();
	}
	function themeJson() {
		var s = St(), cs = getComputedStyle(document.documentElement), v = function (k) { return cs.getPropertyValue(k).trim(); };
		var body = s.type('body') || {}, head = s.type('headings') || {}, title = s.type('title') || {};
		var at = function (sels) { var list = sels.split(', '); for (var i = 0; i < list.length; i++) { var e = [].slice.call(document.querySelectorAll(list[i])).filter(function (x) { return !x.closest('#ldp-window, .reading-panel') && x.getClientRects().length; })[0]; if (e) return getComputedStyle(e); } return null; }; 
		var pText = at('.wp-block-post-content > p, .entry-content > p, main p'), pUi = at('.wp-block-navigation-item__content, nav a, button'), pH1 = at('h1.wp-block-post-title, h1');
		var face = function (c, slug, name) { return c && c.fontFamily ? { slug: slug, name: name, fontFamily: c.fontFamily } : null; };
		var fonts = [face(pText, 'reading', 'Reading'), face(pUi, 'interface', 'Interface')].filter(Boolean);
		var pal = [['background', 'base', 'Paper'], ['background2', 'ground', 'Ground'], ['card', 'card', 'Cards'], ['text', 'contrast', 'Text'], ['mutedText', 'soft', 'Soft text'], ['accent', 'accent', 'Accent']]
			.map(function (c) { return { slug: c[1], name: c[2], color: s.colour(c[0]) }; });
		var pBtn = at('.wp-element-button, .wp-block-button__link, .quire-button.primary'), P = function (slug) { return 'var(--wp--preset--color--' + slug + ')'; }, radius = pBtn ? pBtn.borderTopLeftRadius : v('--radius-control');
		var btn = s.get('buttonColour') === 'text' ? P('contrast') : s.get('buttonColour') === 'own' ? s.colour('button') : P('accent');
		var tj = {
			$schema: 'https://schemas.wp.org/trunk/theme.json', version: 3, title: styleName(),
			description: 'Made with Vibetiles: the ' + (s.side() === 'dark' ? 'dark' : 'light') + ' side only (a style variation has one side). Left out: the other side, the space between parts, picture looks, line and box styles.',
			settings: { color: { palette: pal }, typography: { fontFamilies: fonts } },
			styles: {
				color: { background: P('base'), text: P('contrast') },
				typography: { fontFamily: fonts[0] ? 'var(--wp--preset--font-family--reading)' : undefined, fontSize: pText ? pText.fontSize : body.px ? body.px + 'px' : undefined, lineHeight: pText && /px$/.test(pText.lineHeight) ? String(Math.round(parseFloat(pText.lineHeight) / parseFloat(pText.fontSize) * 100) / 100) : undefined },
				elements: {
					link: { color: { text: P('accent') } },
					heading: { typography: { fontWeight: head.weight ? String(WEIGHT_NUMBER[head.weight] || 600) : undefined }, color: { text: P('contrast') } },
					h1: { typography: { fontSize: pH1 ? pH1.fontSize : title.px ? title.px + 'px' : undefined, fontWeight: pH1 ? pH1.fontWeight : title.weight ? String(WEIGHT_NUMBER[title.weight] || 700) : undefined } },
					button: { color: { background: btn, text: P('base') }, border: radius ? { radius: radius } : undefined },
					caption: { color: { text: P('soft') } }
				}
			}
		};
		return JSON.stringify(tj, null, 2); 
	}
	function copyStyle() {
		var link = St().shareLink(); if (!link) return;
		var ok = function () { done(t('Style Copied as a Link')); render(); };
		if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(ok, ok); else ok();
	}
	function askPaste() {
		asking = { title: t('Paste a Style'), text: t('Paste a style link from any site with Vibetiles. It comes in as a style of your own; the one you are on stays as it is.'), field: '', fieldLabel: t('Style or link'), go: t('Paste'), back: '[data-menu="barmore"]', run: function (v) {
			return St().importLink(v).then(function (id) { if (!id) throw new Error('no style'); section = 'colour'; done(t('Style Pasted')); });
		}, fail: t('That isn’t a style link. Copy one with Copy Style, then paste it here.') };
		render('#ldpw-ask-field');
	}
	
	function changedSince(x, n) {
		var s = St(); if (!x || x.host) return false;
		var cur = x.id === s.current();
		if (x.site) { var st = s.startRecord ? s.startRecord(x.id) : null; return !!(st && s.startDiffers(st, cur ? null : x.id)); }
		return cur ? !!n : !!x.edited;
	}
	function askRevertAll(tile) {
		var s = St(), x = tile || s.tile(s.current()), st = x && x.site && s.startRecord ? s.startRecord(x.id) : null;
		if (!changedSince(x, x.id === s.current() ? s.changes().length : undefined)) { done(t('Already as it began')); return; } 
		if (st) { asking = { title: t('Reset “{name}” to how it began?').replace('{name}', nm(x)), text: t('Every change goes back to how the style was first made. Undo can bring the changes back.'), go: t('Reset Style'), danger: true, back: '[data-menu="barmore"]', run: function () { s.restoreVersion(st); done(t('Reset')); } }; return; }
		askRevertAllSaved();
	}
	function askRevertAllSaved() {
		var s = St(), x = s.tile(s.current());
		asking = { title: t('Reset “{name}”?').replace('{name}', nm(x)), text: t('The style goes back to how it was saved. Undo can bring the changes back.'), go: t('Reset Style'), danger: true, back: '[data-menu="barmore"]', run: function () { s.revertAll(); done(t('Reverted')); } };
	}
	
	function openVersions() {
		showVersions = true; showChanges = false; editing = null; verSel = 'now';
		St().keepVersion(); 
		St().loadVersions().then(function () { if (open && showVersions) render(); });
	}
	function when(ms) {
		if (!ms) return t('Earlier');
		var d = new Date(ms), day = new Date(), y = new Date(Date.now() - 864e5), lang = 'en'; 
		var hm = d.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
		return (d.toDateString() === day.toDateString() ? t('Today') : d.toDateString() === y.toDateString() ? t('Yesterday') : d.toLocaleDateString(lang, { day: 'numeric', month: 'long' })) + ', ' + hm;
	}
	function versionRows() {
		var s = St(), v = s.versions(); if (!v) return null;
		var base = { key: 'base', record: v.saved, t: v.savedAt, base: true };
		var list = v.list.slice(); if (v.site && v.savedAt) list.push(base);
		list.sort(function (a, b) { return b.t - a.t; });
		if (!(v.site && v.savedAt)) list.push(base);
		var rows = [{ key: 'now', record: v.now, now: true }];
		list.forEach(function (r) { if (r.record && (r.base || s.versionDiff(r.record, rows[rows.length - 1].record).length || s.versionDiff(rows[rows.length - 1].record, r.record).length)) rows.push(r); });
		return { rows: rows, site: v.site, own: v.own };
	}
	function diffWords(a, b) {
		var names = [];
		St().versionDiff(a, b).forEach(function (p) { var n = changeName(p); if (names.indexOf(n) === -1) names.push(n); });
		return names.length ? names.slice(0, 3).join(', ') + (names.length > 3 ? ' ' + t('and {n} more').replace('{n}', names.length - 3) : '') : t('No changes');
	}
	function versionsPage() {
		var s = St(), x = s.tile(s.current()), v = versionRows();
		if (!v) return '<p class="ldpw-hint ldpw-center">' + esc(t('Original has no versions. It is your theme as it is.')) + '</p>';
		var rows = v.rows, sel = rows.some(function (r) { return r.key === verSel; }) ? verSel : 'now';
		return '<p class="ldpw-hint">' + esc(t('Versions of {name} are kept as you work and each time it is published. Choose one to see it on the page.').replace('{name}', nm(x))) + '</p>' +
			box(rows.map(function (r, i) {
				var next = rows[i + 1], on = r.key === sel;
				var name = r.now ? t('Now') : r.base ? (v.site ? t('As Published') : v.own ? t('As Saved') : t('As It Comes')) : (r.published ? t('Published') + ', ' : '') + when(r.t);
				var sub = r.base ? (v.site && r.t ? when(r.t) + ' · ' + t('What readers see') : t('Before any of these changes')) : next ? diffWords(r.record, next.record) : '';
				return '<div class="ldpw-r' + (on ? ' is-on' : '') + '"><button type="button" class="ldpw-lb ldpw-golink" data-ver="' + esc(r.key) + '" data-f="ver:' + esc(r.key) + '" aria-pressed="' + on + '">' + esc(name) + '<small>' + esc(sub) + '</small></button>' +
					(on && !r.now ? '<button type="button" class="ldpw-get" data-restore="' + esc(r.key) + '" data-f="restore">' + esc(t('Restore')) + '</button>' : on ? '<span class="ldpw-val">' + esc(t('Showing')) + '</span>' : '') + '</div>';
			}).join(''));
	}
	function pickVersion(key) {
		var v = versionRows(), r = v && v.rows.filter(function (x) { return x.key === key; })[0]; if (!r) return;
		verSel = key;
		St().previewVersion(r.now ? null : r.record);
		render('[data-ver="' + key + '"]');
	}
	function restoreVersion(key) {
		var v = versionRows(), r = v && v.rows.filter(function (x) { return x.key === key; })[0]; if (!r) return;
		St().restoreVersion(r.record); verSel = 'now';
		done(t('Version Restored'));
		render('[data-ver="now"]');
	}
	
	var cmd = null; 
	var sq = null;
	function sqResults() {
		var words = (sq.q || '').toLowerCase().trim().split(/\s+/).filter(Boolean);
		if (!words.length) return [];
		var hits = sq.index.filter(function (e) { var hay = (e.label + ' ' + e.where).toLowerCase(); return words.every(function (w) { return hay.indexOf(w) !== -1; }); });
		hits.sort(function (a, b) { var A = a.label.toLowerCase().indexOf(words[0]) === 0 ? 0 : 1, B = b.label.toLowerCase().indexOf(words[0]) === 0 ? 0 : 1; return A - B || (a.where ? 1 : 0) - (b.where ? 1 : 0); });
		return hits.slice(0, 60);
	}
	function searchPage() {
		var res = sqResults();
		if (!res.length) return '<p class="ldpw-hint ldpw-center">' + esc(t('No results')) + '</p>';
		return box(res.map(function (e, i) { return '<button type="button" class="ldpw-r ldpw-navrow ldpw-sqhit" data-sqhit="' + i + '" data-f="sqhit:' + i + '"><span class="ldpw-lb">' + esc(e.label) + (e.where ? '<small>' + esc(e.where) + '</small>' : '') + '</span></button>'; }).join(''));
	}
	function firstText(el) { var n = el.firstChild; while (n && n.nodeType !== 3) n = n.nextSibling; return (n ? n.textContent : el.textContent).trim(); }
	function buildIndex() {
		var keepSq = sq; sq = null;
		var keep = { section: section, role: role, fontFor: fontFor, editing: editing, more: more, showChanges: showChanges, showVersions: showVersions, menu: menu };
		var out = [], seen = {}, holder = document.createElement('div');
		function collect(where, go) {
			holder.innerHTML = pageBody(current());
			holder.querySelectorAll('.ldpw-r > .ldpw-lb, .ldpw-top > .ldpw-lb, .ldpw-navrow > .ldpw-lb, .ldpw-nm').forEach(function (el) {
				if (el.closest('.ldpw-looks')) return; 
				var lb = firstText(el), key = lb + '|' + where;
				if (!lb || seen[key]) return;
				seen[key] = 1;
				out.push({ label: lb, where: where, go: go });
			});
		}
		editing = null; fontFor = null; showChanges = false; showVersions = false; menu = null;
		['styles'].concat(sections().map(function (x) { return x.id; }), TRY() ? [] : ['button', 'settings']).forEach(function (id) {
			section = id; role = null; more = id === 'colour'; fxAll = id === 'effects'; 
			var name = current().name;
			out.push({ label: name, where: '', go: { section: id } });
			collect(name, { section: id, more: more });
			if (id === 'type') roles().forEach(function (r) { if (St().gone('role:' + r.id)) return; role = r.id; more = true; collect(name + ' › ' + t(r.label), { section: 'type', role: r.id }); });
		});
		fxAll = false;
		section = keep.section; role = keep.role; fontFor = keep.fontFor; editing = keep.editing; more = keep.more; showChanges = keep.showChanges; showVersions = keep.showVersions; menu = keep.menu;
		MENU = {}; STOP = {}; viewsMenu(); sq = keepSq;
		return out;
	}
	function cmdResults() {
		var words = (cmd.q || '').toLowerCase().trim().split(/\s+/).filter(Boolean);
		if (!words.length) return [];
		var hits = cmd.index.filter(function (e) { var hay = (e.label + ' ' + e.where).toLowerCase(); return words.every(function (w) { return hay.indexOf(w) !== -1; }); });
		hits.sort(function (a, b) { var A = a.label.toLowerCase().indexOf(words[0]) === 0 ? 0 : 1, B = b.label.toLowerCase().indexOf(words[0]) === 0 ? 0 : 1; return A - B || (a.where ? 1 : 0) - (b.where ? 1 : 0); });
		return hits.slice(0, 12);
	}
	function cmdListHTML() {
		if (!cmd.q.trim()) return '<p class="ldpw-hint ldpw-center">' + esc(t('Type the name of a setting, a page or a style.')) + '</p>';
		var res = cmdResults();
		if (!res.length) return '<p class="ldpw-hint ldpw-center">' + esc(t('No results')) + '</p>';
		cmd.sel = Math.min(cmd.sel, res.length - 1);
		return res.map(function (e, i) {
			return '<button type="button" class="ldpw-hit' + (i === cmd.sel ? ' is-sel' : '') + '" role="option" aria-selected="' + (i === cmd.sel) + '" data-hit="' + i + '" id="ldpw-hit-' + i + '"><span>' + esc(e.label) + '</span>' + (e.where ? '<small>' + esc(e.where) + '</small>' : '') + '</button>';
		}).join('');
	}
	function cmdHTML() {
		if (!cmd) return '';
		return '<div class="ldpw-veil ldpw-cmdveil" data-cmdveil><div class="ldpw-cmdk" role="dialog" aria-modal="true" aria-label="' + esc(t('Search Settings')) + '">' +
			'<label class="ldpw-search"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg><input type="search" data-cmdq data-f="cmdq" role="combobox" aria-expanded="true" aria-controls="ldpw-cmdlist" aria-activedescendant="ldpw-hit-' + cmd.sel + '" placeholder="' + esc(t('Search Settings')) + '" value="' + esc(cmd.q) + '" autocomplete="off" spellcheck="false"></label>' +
			'<div class="ldpw-cmdlist" id="ldpw-cmdlist" role="listbox">' + cmdListHTML() + '</div></div></div>';
	}
	function openCmd() { cmd = { q: '', sel: 0, index: buildIndex() }; menu = null; render('[data-cmdq]'); }
	function paintCmd() { var l = win.querySelector('.ldpw-cmdlist'); if (l) l.innerHTML = cmdListHTML(); var i = win.querySelector('[data-cmdq]'); if (i) i.setAttribute('aria-activedescendant', 'ldpw-hit-' + cmd.sel); }
	function pickCmd(i) { goTo(cmdResults()[i]); }
	function goTo(e) {
		if (!e) return; sq = null;
		cmd = null; section = e.go.section; role = e.go.role || null; fontFor = null; editing = null; showChanges = false; showVersions = false; more = !!(e.go.role || e.go.more); phoneList = false;
		try { sessionStorage.setItem(KEY, section); } catch (x) {  }
		if (section === 'effects' && e.where) fxFind = '>' + esc(e.label) + '<';
		render();
		if (!e.where) { var nav = win.querySelector('[data-sec="' + section + '"]'); if (nav) nav.focus({ preventScroll: true }); return; }
		var hit = null;
		win.querySelectorAll('.ldpw-scroll .ldpw-lb, .ldpw-scroll .ldpw-nm').forEach(function (el) { if (!hit && firstText(el) === e.label) hit = el; });
		if (!hit) return;
		var rowEl = hit.closest('.ldpw-r, .ldpw-stile, .ldpw-tile') || hit;
		rowEl.scrollIntoView({ block: 'center' });
		rowEl.classList.add('is-found'); setTimeout(function () { rowEl.classList.remove('is-found'); }, 1600);
		var ctl = rowEl.matches('button') ? rowEl : rowEl.querySelector('button, input');
		if (ctl) ctl.focus({ preventScroll: true });
	}
	
	function navButton(x) {
		var on = x.id === current().id && !(phone() && phoneList) && !(sq && sq.q.trim()); 
		return '<button type="button" class="ldpw-nav' + (on ? ' is-on' : '') + '" data-sec="' + esc(x.id) + '" data-f="sec:' + esc(x.id) + '"' + (on ? ' aria-current="page"' : '') + '>' + mark(x.id) + '<span class="ldpw-lb">' + esc(x.name) + '</span></button>';
	}
	var comparing = false, comparePill = null;
	function compareOn() {
		var s = St(), v = s && s.versions && s.versions();
		if (comparing || !v || !v.saved || !s.changes().length) return;
		comparing = true; s.previewVersion(v.saved);
		if (!comparePill) { comparePill = document.createElement('div'); comparePill.id = 'ldp-compare'; comparePill.setAttribute('role', 'status'); document.body.appendChild(comparePill); }
		comparePill.textContent = t('{name} without your changes').replace('{name}', s.name()); comparePill.hidden = false;
		var b = win && win.querySelector('[data-act="compare"]'); if (b) b.classList.add('is-aim');
	}
	function compareOff() {
		if (!comparing) return; comparing = false; St().previewVersion(null);
		if (comparePill) comparePill.hidden = true;
		var b = win && win.querySelector('[data-act="compare"]'); if (b) b.classList.remove('is-aim');
	}
	document.addEventListener('pointerdown', function (e) {
		var b = win && e.target.closest && e.target.closest('#ldp-window [data-act="compare"]'); if (!b || b.disabled) return;
		e.preventDefault(); compareOn();
		var up = function () { document.removeEventListener('pointerup', up, true); document.removeEventListener('pointercancel', up, true); compareOff(); };
		document.addEventListener('pointerup', up, true); document.addEventListener('pointercancel', up, true);
	}, true);
	document.addEventListener('keydown', function (e) {
		var a = document.activeElement, typing = a && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && a.type !== 'range';
		if (!open || RD() || typing || e.metaKey || e.ctrlKey || e.altKey || cmd || asking) return;
		if ((e.key === 'm' || e.key === 'M') && !e.repeat) compareOn();
	});
	document.addEventListener('keyup', function (e) { if (e.key === 'm' || e.key === 'M') compareOff(); });
	window.addEventListener('blur', compareOff);
	var TARGETS = [
		['.architrave-panel-opener, [data-live-design-slot], [data-reading-panel-open]', 'button', '', 'Vibetiles button'],
		['mark', 'colour', 'highlight', 'Highlighter'],
		['.quire-button.primary, [data-ldp-button="main"], .quire-icon-button.filled, :is(.wp-block-post-content, .entry-content) .wp-block-button:not(.is-style-outline) > .wp-block-button__link', 'buttons', 'primaryButton', 'Main'],
		['.quire-button.ghost', 'buttons', 'tertiaryButton', 'Quiet buttons'],
		['.quire-button, [data-ldp-button="secondary"], .wp-block-button.is-style-outline > .wp-block-button__link', 'buttons', 'secondaryButton', 'Other'],
		['.article-tags a, .taxonomy-post_tag a', 'buttons', 'tags', 'Tags'],
		['.wp-block-site-title', 'type', 'role:headings', 'Site name'],
		['.current-menu-item > a, .quire-segmented .is-active, [aria-current="page"]', 'buttons', 'currentItem', 'Current item'],
		['.wp-block-image figcaption, .wp-element-caption', 'type', 'role:meta', 'Small text'],
		['.article-media, .post-media, .wp-block-post-featured-image, .wp-block-image, .wp-block-post-content img', 'pictures', 'pictureFilter', 'Pictures'],
		['input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]), textarea, .quire-search-field', 'corners-and-lines', 'fields', 'Fields'],
		[':is(.wp-block-post-content, .entry-content) :is(p, li) a', 'buttons', 'links', 'Links'],
		
		['.post-sections-key', 'type', 'role:interface', 'Interface'],
		['code, pre, kbd', 'type', 'role:code', 'Code'],
		['.wp-block-comment-author-name, .wp-block-comment-date, .wp-block-comment-reply-link', 'type', 'role:meta', 'Small text'],
		['.comment-form, .comment-respond form, .form-submit', 'type', 'role:interface', 'Interface'],
		['.wp-block-comments-title, .comment-reply-title, .comments-side-title', 'type', 'role:headings', 'Headings'],
		['.page-updated, .head-count, .head-kind-sans, .listen-time, .post-gallery-caption, .author-box .wp-block-post-author__bio', 'type', 'role:meta', 'Small text'],
		['.post-link-card .card-title, .theme-card .card-title, p.release-group-title, .release-route-title', 'type', 'role:interface', 'Interface'],
		['.post-link-card .card-sub, .theme-card .card-sub, p.release-checked, p.release-archive-banner, .related-row-date, .readers-note-date', 'type', 'role:meta', 'Small text'],
		['.support-box-text, .readers-note-body, .head-desc', 'type', 'role:body', 'Reading text'],
		['.wp-block-post-content > h1', 'type', 'role:headings', 'Headings'],
		['h1, .wp-block-post-title', 'type', 'role:title', 'Title'],
		[':is(.wp-block-post-content, .entry-content) :is(h2, h3, h4, h5, h6), .wp-block-heading', 'type', 'role:headings', 'Headings'],
		['.article-kicker, .post-kicker, .taxonomy-category', 'type', 'role:meta', 'Category line', '[data-stop="roles.meta.categorySize"], [data-catown]'], 
		['.article-meta, .post-meta, .wp-block-post-date, .wp-block-post-terms, figcaption', 'type', 'role:meta', 'Small text'],
		
		['.rail-promo .rail-newsletter-door-head, .rail-promo .rail-newsletter-door-hint, .rail-newsletter-door.is-page .inbox', 'type', 'role:interface', 'Interface'],
		['.rail-newsletter-lightbox .rail-newsletter-door-head', 'type', 'role:headings', 'Headings'],
		['.rail-newsletter-lightbox .rail-newsletter-door-hint', 'type', 'role:meta', 'Small text'],
		['.rail-newsletter-door-head', 'type', 'role:title', 'Title'],
		['.wp-block-post-excerpt, .rail-newsletter-door-hint, .empty-note', 'type', 'role:body', 'Reading text'],
		['blockquote cite, .ruler-label small, .arch-row-date, .wp-block-post-author__name, .release-route-kind, .release-routes-note, .entry-content:has(.rail-newsletter-door.is-page) > p.wp-block-paragraph', 'type', 'role:meta', 'Small text'],
		['.post-more, .arch-row-title, .paper-credit, .comment-replying-to, .comment-badge, .about-numbers-row, .theme-switch, .theme-count, .empty-back, .sent-word', 'type', 'role:interface', 'Interface'],
		['blockquote', 'type', 'role:quote', 'Quotes'],
		['.wp-block-comment-content, .comment-content', 'type', 'role:body', 'Reading text'],
		['.quire-nav-section-heading, .quire-nav-section-head', 'type', 'role:interface', 'Interface'],
		
		['.rail-newsletter-field-words, .rail-foot > .rail-more-trigger > span', 'type', 'role:interface', 'Interface'],
		['.rail-newsletter-field, .rail-foot > .rail-more-trigger', 'corners-and-lines', 'cards', 'Cards'],
		['.post-sections-list', 'type', 'role:body', 'Reading text'],
		['.post-sections-phone-name, .post-sections-phone-toggle, .post-sections-bar', 'type', 'role:interface', 'Interface'],
		['nav, .wp-block-navigation, .sidebar-column', 'type', 'role:interface', 'Interface'],
		[':is(.wp-block-post-content, .entry-content) :is(p, li, td, th, summary)', 'type', 'role:body', 'Reading text'],
		['.release-route, .post-link-card, .post-neighbour, .support-box, .release-panel, .theme-card, .wp-block-post-content .wp-block-group.has-background, .entry-content .wp-block-group.has-background', 'corners-and-lines', 'cards', 'Cards'],
		['main, .content-column, .wp-site-blocks, body', 'colour', '', 'Colour']
	];
	var aiming = false, aimBox = null, aimEl = null;
	function targetsOf(el) {
		if (!el || !el.closest || !win || win.contains(el) || el.closest('#wpadminbar, .reading-panel')) return [];
		var hits = [];
		for (var i = 0; i < TARGETS.length; i++) {
			var hit = el.closest(TARGETS[i][0]);
			if (hit && !hits.some(function (h) { return h.el === hit; })) hits.push({ el: hit, section: TARGETS[i][1], key: TARGETS[i][2], label: TARGETS[i][3], focus: TARGETS[i][4] });
		}
		if (!hits.length) return hits;
		var first = hits[0], outer = hits.slice(1).filter(function (h) { return h.el !== first.el && h.el.contains(first.el); });
		outer.sort(function (a, b) { return a.el === b.el ? 0 : (a.el.contains(b.el) ? 1 : -1); });
		return [first].concat(outer);
	}
	function targetOf(el, out) {
		var all = targetsOf(el); if (!all.length) return null;
		var x = all[Math.min(out ? 1 : 0, all.length - 1)];
		x.next = !out && all[1] ? all[1] : null;
		return x;
	}
	function aimShow(x) {
		if (!x) { if (aimBox) aimBox.hidden = true; return; }
		if (!aimBox) { aimBox = document.createElement('div'); aimBox.id = 'ldp-aim'; aimBox.innerHTML = '<span></span>'; document.body.appendChild(aimBox); }
		var r = x.el.getBoundingClientRect(), sec = sections().filter(function (y) { return y.id === x.section; })[0];
		var secName = function (id) { var y = sections().filter(function (z) { return z.id === id; })[0]; return y ? y.name : (id === 'button' ? t('Button') : t('Colour')); };
		aimBox.hidden = false;
		aimBox.style.cssText = 'left:' + (r.left - 3) + 'px;top:' + (r.top - 3) + 'px;width:' + (r.width + 6) + 'px;height:' + (r.height + 6) + 'px';
		aimBox.classList.toggle('is-below', r.top < 60);
		aimBox.firstChild.innerHTML = esc(t(x.label)) + '<small>' + esc(secName(x.section)) + '</small>' + (x.next ? '<small class="ldp-aim-out">⇧ ' + esc(t(x.next.label)) + '</small>' : '');
	}
	function aimSet(on) { aiming = on; document.documentElement.classList.toggle('ldp-aiming', on); if (!on) aimShow(null); var b = win && win.querySelector('[data-act="aim"]'); if (b) { b.classList.toggle('is-aim', on); b.setAttribute('aria-pressed', String(on)); } }
	function openTarget(x) {
		sq = null; cmd = null; 
		section = x.section; role = null; fontFor = null; editing = null; showChanges = false; showVersions = false; phoneList = false; more = false;
		if (x.key.indexOf('role:') === 0) role = x.key.slice(5);
		if (x.section === 'effects' && x.key.indexOf('role:') !== 0) fxFind = '="' + x.key + '"';
		try { sessionStorage.setItem(KEY, section); } catch (e) {  }
		if (!open) { show(); render(); } else render(); 
		var k = x.key.indexOf('role:') === 0 ? '' : x.key, ctl = k ? win.querySelector('.ldpw-scroll :is([data-look="' + k + '"].is-on, [data-menu="' + k + '"], [data-stop="' + k + '"], [data-set="' + k + '"])') : x.focus ? win.querySelector('.ldpw-scroll :is(' + x.focus + ')') : null;
		var rowEl = ctl && ctl.closest('.ldpw-r');
		if (rowEl) { rowEl.scrollIntoView({ block: 'center' }); rowEl.classList.remove('is-glow'); void rowEl.offsetWidth; rowEl.classList.add('is-glow'); ctl.focus({ preventScroll: true }); }
		if (x.el.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) x.el.animate([{ outline: '2px solid #0a84ff', outlineOffset: '3px' }, { outline: '2px solid transparent', outlineOffset: '3px' }], { duration: 700, easing: 'ease-out' });
	}
	var MARKED = { primaryButton: 1, secondaryButton: 1, tertiaryButton: 1, tags: 1, links: 1, currentItem: 1 }, marksOf = null, markBoxes = [];
	function onPage(key) {
		var out = [];
		TARGETS.forEach(function (tg) {
			if (tg[2] !== key) return;
			document.querySelectorAll(tg[0]).forEach(function (el) { var x = targetOf(el); if (x && x.key === key && x.el === el && out.indexOf(el) < 0 && seen(el)) out.push(el); });
		});
		return out;
	}
	function seen(el) {
		if (!el.getClientRects().length || el.closest('[inert], [aria-hidden="true"]')) return false;
		if (el.checkVisibility && !el.checkVisibility({ visibilityProperty: true, opacityProperty: true })) return false;
		var r = el.getBoundingClientRect(); return r.right > 0 && r.left < window.innerWidth;
	}
	function marksShow(key) {
		if (marksOf === key) return;
		marksHide(); if (!key || RD() || phone()) return;
		marksOf = key;
		var vh = window.innerHeight, vw = window.innerWidth, wr = win.getBoundingClientRect(), boxes = [];
		onPage(key).forEach(function (el) {
			var r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) return; 
			var b = document.createElement('div'); b.className = 'ldp-mark'; b.setAttribute('aria-hidden', 'true');
			b.style.cssText = 'left:' + (r.left - 3) + 'px;top:' + (r.top - 3) + 'px;width:' + (r.width + 6) + 'px;height:' + (r.height + 6) + 'px';
			boxes.push({ b: b, r: r, under: r.right > wr.left && r.left < wr.right && r.bottom > wr.top && r.top < wr.bottom });
			document.body.appendChild(b); markBoxes.push(b);
		});
		var host = boxes.filter(function (x) { return !x.under; })[0] || boxes[0];
		if (host) { host.b.innerHTML = '<span>' + esc(t(ALONE[key] || label(key))) + '</span>'; var bar = document.getElementById('wpadminbar'), roof = bar && bar.getClientRects().length ? bar.getBoundingClientRect().bottom : 0; host.b.classList.toggle('is-below', host.r.top - roof < 34); } 
	}
	function marksHide() { marksOf = null; markBoxes.forEach(function (b) { b.remove(); }); markBoxes = []; }
	window.addEventListener('scroll', function (e) { if (win && e.target && e.target.nodeType === 1 && win.contains(e.target)) return; marksHide(); }, true); 
	window.addEventListener('resize', marksHide);
	function mayAim(e) { return !RD() && (aiming || e.altKey) && !phone() && St() && St().editable && St().editable(); }
	document.addEventListener('pointermove', function (e) { aimEl = e.target; if (mayAim(e)) aimShow(targetOf(e.target, e.shiftKey)); else if (aimBox && !aimBox.hidden) aimShow(null); }, true);
	document.addEventListener('keydown', function (e) { if (e.key === 'Shift' && aimEl && mayAim(e)) aimShow(targetOf(aimEl, true)); }, true);
	document.addEventListener('keyup', function (e) { if (e.key === 'Shift' && aimEl && mayAim(e)) aimShow(targetOf(aimEl, false)); }, true);
	document.addEventListener('click', function (e) {
		if (!mayAim(e)) return;
		var x = targetOf(e.target, e.shiftKey); if (!x) return; 
		e.preventDefault(); e.stopPropagation(); aimSet(false); openTarget(x);
	}, true);
	document.addEventListener('keydown', function (e) { if (aiming && e.key === 'Escape') { e.stopPropagation(); aimSet(false); } }, true);
	(function () {
		var timer = null, x0 = 0, y0 = 0;
		document.addEventListener('pointerdown', function (e) {
			if (!phone() || e.button > 0 || !St() || !St().editable || !St().editable()) return;
			var x = targetOf(e.target); if (!x || x.section === 'colour' && !x.key) return;
			x0 = e.clientX; y0 = e.clientY;
			timer = setTimeout(function () { timer = null; aimShow(x); if (navigator.vibrate) navigator.vibrate(12); setTimeout(function () { aimShow(null); openTarget(x); }, 260); }, 520);
		}, true);
		document.addEventListener('pointermove', function (e) { if (timer && Math.abs(e.clientX - x0) + Math.abs(e.clientY - y0) > 10) { clearTimeout(timer); timer = null; } }, true);
		document.addEventListener('pointerup', function () { clearTimeout(timer); timer = null; }, true);
		document.addEventListener('pointercancel', function () { clearTimeout(timer); timer = null; }, true);
	})();
	function styleName() { var s = St(), x = s && s.tile ? s.tile(s.current()) : null; return x ? nm(x) : ''; }
	
	function viewsMenu() {
		var s = St(), n = s && s.changes ? s.changes().length : 0;
		MENU.views = { label: t('View'), value: '', items: [['side', t(prefs.noSide ? 'Show Sidebar' : 'Hide Sidebar') + '  ⌃⌘S', false, '', 'sidebar'], null, ['changes', t('Show Changes') + (n ? ' (' + n + ')' : ''), !n, '', 'changes'], ].concat(TRY() ? [] : [['versions', t('Browse Versions'), !s, '', 'versions'], ['reader', t('Preview as Reader'), false, '', 'reader']]), pick: function (a) {
			if (a === 'side') sideToggle(); 
			else if (a === 'changes') { sq = null; showChanges = true; showVersions = false; editing = null; }
			else if (a === 'versions') { sq = null; openVersions(); }
			else if (a === 'reader') window.open(window.location.origin + window.location.pathname + '?ldp-as-reader=1', '_blank');
		} };
	}
	function sideToggle() { if (prefs.x !== null) prefs.x = +prefs.x + (prefs.noSide ? -1 : 1) * Math.max(150, Math.min(260, +prefs.sideW || 200));  prefs.noSide = !prefs.noSide; savePrefs(); place(); render(prefs.noSide ? '[data-act="side"]' : '.ldpw-nav.is-on'); }
	function sideHTML() {
		var shutter = '<button type="button" class="ldpw-closer" data-act="close" data-f="act:close" aria-label="' + esc(t('Close')) + '" title="' + esc(t('Close')) + '">' + svg(GLYPH.close) + '</button>'; 
		return '<nav class="ldpw-side" aria-label="' + esc(t('Sections')) + '">' +
			'<div class="ldpw-shead">' + (phone() ? '' : shutter) + '<b id="ldpw-title"' + (phone() ? '' : ' class="ldpw-sr"') + '>' + esc(t('Vibetiles')) + '</b>' + (phone() ? shutter : '<button type="button" class="ldpw-circ is-plain ldpw-sidebtn" aria-haspopup="menu" data-menu="views" data-f="menu:views" aria-label="' + esc(t('View')) + '" title="' + esc(t('View')) + '">' + svg(GLYPH.side) + '</button>') + '</div>' +
			'<div class="ldpw-side-in">' + '<label class="ldpw-sfind"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg><input type="search" data-sideq data-f="sideq" value="' + esc(sq ? sq.q : '') + '" placeholder="' + esc(t('Search')) + '" aria-label="' + esc(t('Search')) + '" autocomplete="off" spellcheck="false">' + (sq && sq.q ? '<button type="button" class="ldpw-sqx" data-act="sqclear" data-f="act:sqclear" aria-label="' + esc(t('Clear Search')) + '">' + svg(GLYPH.close) + '</button>' : '') + '</label>' +  navButton({ id: 'styles', name: t('Styles') }) +
				'<div class="ldpw-gt"><span>' + esc(styleName() ? t('{name} Style').replace('{name}', styleName()) : t('Style')) + '</span>' + editedWord(St()) + '</div>' + sections().map(navButton).join('') + 
				(TRY() ? '' : '<div class="ldpw-gt">' + esc(t('More')) + '</div>' + navButton({ id: 'button', name: t('Button') }) + navButton({ id: 'settings', name: t('Settings') })) + 
			'</div>' + 
			(phone() ? '' : '<span class="ldpw-grip" data-grip role="separator" aria-orientation="vertical" aria-label="' + esc(t('Sidebar width')) + '"></span>') + 
		'</nav>';
	}
	var PREF_KEY = 'ldpw-prefs';
	var prefs = (function () { var d = { look: 'auto', glass: true, accent: 'blue', motion: 'full', sound: 'clicks', tips: true, seenAim: false, noSide: false, sideW: 200, zoom: 1, x: null, y: null, pageW: null, h: null, fold: {} };  try { var o = JSON.parse(localStorage.getItem(PREF_KEY) || '{}'); for (var k in o) if (Object.prototype.hasOwnProperty.call(d, k)) d[k] = o[k]; } catch (e) {  } return d; })();
	var ACCENT = { blue: ['Blue', '#0a84ff', '#007aff'], purple: ['Purple', '#bf5af2', '#9f45d6'], pink: ['Pink', '#ff375f', '#e6254d'], red: ['Red', '#ff453a', '#e0342b'], orange: ['Orange', '#ff9f0a', '#e07b00'], yellow: ['Yellow', '#ffd60a', '#c9a400'], green: ['Green', '#30d158', '#24a846'], graphite: ['Graphite', '#8e8e93', '#6e6e73'] }; 
	function uiDark() { return prefs.look === 'dark' || (prefs.look === 'auto' && !!systemDark && systemDark.matches); }
	function accentHex(k) { var a = ACCENT[k] || ACCENT.blue; return uiDark() ? a[1] : a[2]; }
	var systemDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
	function doorLook() {
		var dark = prefs.look === 'dark' || (prefs.look === 'auto' && !!systemDark && systemDark.matches);
		Array.prototype.forEach.call(document.querySelectorAll('.architrave-panel-opener'), function (d) {
			var mine = d.getAttribute('data-color') === 'panel' && d.getAttribute('data-match') === 'false' && !d.hasAttribute('data-docked');
			if (!mine) { d.style.removeProperty('--opener-face'); d.style.removeProperty('--opener-ink'); d.removeAttribute('data-ldpw-glass'); return; }
			d.style.setProperty('--opener-face', prefs.glass ? (dark ? 'rgba(44,44,46,.62)' : 'rgba(255,255,255,.62)') : (dark ? '#2c2c2e' : '#ffffff'));
			d.style.setProperty('--opener-ink', prefs.glass ? (dark ? '#f5f5f7' : '#1d1d1f') : (dark ? '#ffffff' : '#111111')); 
			d.toggleAttribute('data-ldpw-glass', !!prefs.glass);
			if (!d.__ldpwWatched && window.MutationObserver) { d.__ldpwWatched = true; new MutationObserver(function () { doorLook(); }).observe(d, { attributes: true, attributeFilter: ['data-docked', 'data-color', 'data-match'] }); }
		});
	}
	if (systemDark && systemDark.addEventListener) systemDark.addEventListener('change', function () { doorLook(); });
	function savePrefs() { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) {  } doorLook(); applyPrefs(); }
	function reskin() {
		if (!win) return;
		win.classList.add('is-reskin'); void win.offsetWidth;
		requestAnimationFrame(function () { requestAnimationFrame(function () { win.classList.remove('is-reskin'); }); });
	}
	try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { if (prefs.look === 'auto') reskin(); }); } catch (e) {  }
	function applyPrefs() {
		if (!win) return;
		if ((win.getAttribute('data-ui') || 'auto') !== prefs.look) reskin();
		if (prefs.look === 'auto') win.removeAttribute('data-ui'); else win.setAttribute('data-ui', prefs.look);
		win.toggleAttribute('data-glass', !!prefs.glass);
		win.toggleAttribute('data-still', prefs.motion === 'reduced');
		win.classList.toggle('is-noside', !!prefs.noSide && !phone());
		win.style.setProperty('--ldpw-sidew', Math.max(150, Math.min(260, +prefs.sideW || 200)) + 'px');
		win.style.setProperty('--ldpw-blue', accentHex(prefs.accent)); 
	}
	function zoomBy(m) {
		var z = +prefs.zoom || 1;
		z = m === 'actual' ? 1 : Math.round((z + (m === 'bigger' ? 0.1 : -0.1)) * 10) / 10;
		prefs.zoom = Math.max(0.8, Math.min(1.4, z)); savePrefs(); zoomPage(); render();
	}
	function zoomPage() {
		var el = document.getElementById('ldpw-zoom'), z = open ? +prefs.zoom || 1 : 1;
		if (z === 1) { if (el) el.remove(); return; }
		if (!el) { el = document.createElement('style'); el.id = 'ldpw-zoom'; document.head.appendChild(el); }
		el.textContent = 'body > :not([id^="ldp"]):not(script):not(style) { zoom: ' + z + '; }';
	}
	function zoomItems() { var z = +prefs.zoom || 1; return [['bigger', t('Bigger Text') + '  ⌘+', z >= 1.4], ['smaller', t('Smaller Text') + '  ⌘−', z <= 0.8], ['actual', t('Actual Size') + '  ⌘0', z === 1]]; }
	var BANDS = { dusk: ['Dusk', 'oklch(60% .2 258), oklch(72% .13 232), oklch(58% .21 292), oklch(72% .14 345), oklch(56% .19 275)'], ocean: ['Ocean', 'oklch(62% .15 235), oklch(78% .12 200), oklch(58% .15 255), oklch(82% .1 185), oklch(60% .16 220)'], meadow: ['Meadow', 'oklch(72% .17 145), oklch(85% .15 115), oklch(66% .15 170), oklch(82% .14 95), oklch(64% .16 150)'], candy: ['Candy', 'oklch(72% .19 350), oklch(84% .12 30), oklch(70% .18 320), oklch(88% .12 90), oklch(68% .2 300)'], ember: ['Ember', 'oklch(64% .21 30), oklch(80% .16 65), oklch(60% .22 15), oklch(85% .14 90), oklch(58% .2 40)'], mono: ['Silver', 'oklch(88% 0 0), oklch(62% 0 0), oklch(95% 0 0), oklch(52% 0 0), oklch(78% 0 0)'] };
	function bandRow(bt) {
		var cur = BANDS[bt.band] ? bt.band : 'dusk';
		return row(t('Colours'), '<span class="ldpw-dots" role="radiogroup" aria-label="' + esc(t('Colours')) + '">' + Object.keys(BANDS).map(function (k) { var on = cur === k; return '<button type="button" class="ldpw-dotc is-band' + (on ? ' is-on' : '') + '" role="radio" aria-checked="' + on + '" data-band="' + k + '" data-f="band:' + k + '" style="--c:linear-gradient(135deg, ' + BANDS[k][1] + ')" aria-label="' + esc(t(BANDS[k][0])) + '" title="' + esc(t(BANDS[k][0])) + '"></button>'; }).join('') + '</span>', esc(t(BANDS[cur][0])));
	}
	var KEYS = [['Open or close the window', 'Click the button, Esc to close'], ['Search', '⌘K or ⌘F'], ['Undo', '⌘Z'], ['Redo', '⇧⌘Z'], ['Show or hide the sidebar', '⌃⌘S'], ['Copy, paste a style', '⌥⌘C, ⌥⌘V'], ['Choose on the page', '⌥-click'], ['Compare with no changes', 'Hold M'], ['Move a slider a step', '← →'], ['Put a slider back', 'Double-click it'], ['Bigger or smaller text', '⌘+, ⌘−, ⌘0'], ['Settings', '⌘,'], ['This list', '?']];
	function showKeys() { asking = { title: t('Keyboard Shortcuts'), keys: KEYS, go: t('Done'), back: '[data-act="keys"]', run: function () {} }; render('[data-act="ask-go"]'); }
	function settingsPage() {
		var dots = '<span class="ldpw-dots" role="radiogroup" aria-label="' + esc(t('Accent colour')) + '">' + Object.keys(ACCENT).map(function (k) { var on = prefs.accent === k; return '<button type="button" class="ldpw-dotc' + (on ? ' is-on' : '') + '" role="radio" aria-checked="' + on + '" data-accent="' + k + '" data-f="accent:' + k + '" style="--c:' + accentHex(k) + '" aria-label="' + esc(t(ACCENT[k][0])) + '" title="' + esc(t(ACCENT[k][0])) + '"></button>'; }).join('') + '</span>';
		var psw = function (k, on, lb) { return '<button type="button" class="ldpw-sw" role="switch" aria-checked="' + !!on + '" data-pref="' + k + '" data-f="pref:' + k + '" aria-label="' + esc(lb) + '"></button>'; };
		return '<p class="ldpw-hint">' + esc(t('Window, Sound and Help are only for you, on this computer.')) + '</p>' +
			gtitle(t('Window')) + box(sidePicks('plook', prefs.look) +
				row(t('Glass'), psw('glass', prefs.glass, t('Glass')), esc(t('The page shows softly through the window'))) +
				row(t('Accent colour'), dots) +
				row(t('Reduce motion'), psw('motion', prefs.motion === 'reduced', t('Reduce motion')))) +
			gtitle(t('Sound')) + box(row(t('Sounds'), pop('psound', t('Sounds'), prefs.sound, [['off', t('Off')], ['clicks', t('Clicks')], ['all', t('Clicks and hover')]], function (id) { prefs.sound = id; savePrefs(); if (id !== 'off') sound('on'); }), prefs.sound === 'off' ? '' : esc(t('Soft ticks as you change things')))) +
			gtitle(t('Help')) + box(row(t('Tips'), psw('tips', prefs.tips, t('Tips')), esc(t('Small hints the first time you meet something'))) +
				'<button type="button" class="ldpw-r ldpw-navrow" data-act="keys" data-f="act:keys"><span class="ldpw-lb">' + esc(t('Keyboard Shortcuts')) + '</span><span class="ldpw-val">?</span><span class="ldpw-chev" aria-hidden="true"></span></button>');
	}
	var actx = null, lastTick = {}, lastHover = 0, hoverKey = null;
	function wake() { try { if (actx && actx.state === 'suspended') actx.resume(); } catch (e) {  } }
	['pointerdown', 'keydown'].forEach(function (ev) { document.addEventListener(ev, function () { if (prefs.sound === 'off') return; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; } wake(); }, true); });
	if (prefs.sound !== 'off' && (window.AudioContext || window.webkitAudioContext)) {
		var soundSoon = function () { if (actx || prefs.sound === 'off') return; try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {  } };
		var whenIdle = function () { if (window.requestIdleCallback) window.requestIdleCallback(soundSoon, { timeout: 4000 }); else setTimeout(soundSoon, 1500); };
		if (document.readyState === 'complete') whenIdle(); else window.addEventListener('load', whenIdle);
	}
	function tone(f1, f2, dur, vol, type) { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); wake(); var t0 = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
		o.type = type || 'sine'; o.frequency.setValueAtTime(f1, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
		g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
		o.connect(g); g.connect(actx.destination); o.start(t0); o.stop(t0 + dur + 0.02); } catch (e) {  } }
	function sound(kind) {
		if (prefs.sound === 'off' || (kind === 'hover' && prefs.sound !== 'all')) return;
		({ tick: function () { tone(2200, 0, 0.018, 0.02, 'triangle'); }, on: function () { tone(660, 990, 0.07, 0.05); }, off: function () { tone(990, 620, 0.07, 0.045); },
			tap: function () { tone(1400, 1100, 0.03, 0.03, 'triangle'); }, open: function () { tone(330, 660, 0.16, 0.04); }, close: function () { tone(660, 330, 0.14, 0.035); },
			hover: function () { tone(2400, 0, 0.02, 0.02, 'triangle'); },
			snap: function () { tone(1500, 900, 0.035, 0.045, 'triangle'); tone(300, 200, 0.05, 0.035); }  })[kind](); 
	}
	document.addEventListener('pointerover', function (e) {
		var st = e.target.closest && e.target.closest('#ldp-window .ldpw-stile'); 
		var item = st ? st.querySelector('.ldpw-tile') : e.target.closest && e.target.closest('#ldp-window :is(.ldpw-nav, .ldpw-navrow, .ldpw-tile, .ldpw-menu button, .ldpw-cmdlist button, .ldpw-lk), [data-reading-panel-open]');
		var key = item ? (item.getAttribute('data-f') || item.getAttribute('data-menu-item') || item) : null;
		if (key === hoverKey) return; hoverKey = key;
		if (!item || !open || prefs.sound !== 'all') return;
		var n = Date.now(); if (n - lastHover < 60) return; lastHover = n; sound('hover');
	});
	function pageBody(x) {
		if (sq && sq.q.trim()) return searchPage();
		if (x.id === 'settings') return settingsPage();
		if (showChanges && St()) return changesPage();
		if (showVersions && St()) return versionsPage();
		if (x.id === 'styles' && St()) return stylesPage();
		if (x.id === 'button' && St()) return editing === 'door.own' ? editorPage() : buttonPage();
		if (x.id === 'colour' && St()) return editing ? editorPage() : colourPage();
		var PAGES = { layout: layoutPage, 'corners-and-lines': shapePage, buttons: buttonsPage, pictures: picturesPage, effects: effectsPage };
		if (PAGES[x.id] && St()) return editing ? editorPage() : PAGES[x.id](); 
		if (x.id === 'type' && St()) return editing ? editorPage() : fontFor ? fontPage() : role ? rolePage() : typePage();
		var can = host.canOpenCurrent && host.canOpenCurrent(x.id);
		return '<div class="ldpw-box ldpw-empty">' +
			'<p class="ldpw-empty-title">' + esc(t('Not built yet')) + '</p>' +
			'<p class="ldpw-empty-text">' + esc(t('This part of the new window is not built yet. Until it is, it opens in the current window.')) + '</p>' +
			(can ? '<button type="button" class="ldpw-blue" data-act="current" data-sec="' + esc(x.id) + '" data-f="act:current">' + esc(t('Open in the Current Window')) + '</button>' : '') +
		'</div>';
	}
	function secsTitle(x, name, sub) {
		var ids = ['styles'].concat(sections().map(function (y) { return y.id; }), TRY() ? [] : ['button', 'settings']);
		var nameOf = function (id) { var was = section; section = id; var nm = current().name; section = was; return nm; }, s0 = St();
		var items = [['styles', nameOf('styles')], ['#', s0 ? s0.name() : '']].concat(sections().map(function (y) { return [y.id, y.name]; }), TRY() ? [] : [['#', t('More')], ['button', nameOf('button')], ['settings', nameOf('settings')]]);
		MENU.secs = { label: t('Sections'), value: x.id, search: true, items: items, pick: function (id) {
			if (id.indexOf('hit:') === 0) { var e = MENU.secs.hits[+id.slice(4)]; menuQ = ''; goTo(e); return; }
			sq = null; section = id; phoneList = false; editing = null; role = null; fontFor = null; more = false; showChanges = false; showVersions = false;
			try { sessionStorage.setItem(KEY, id); } catch (e) {  }
			render('[data-menu="secs"]');
		} };
		return '<div class="ldpw-ttl"><button type="button" class="ldpw-ttlmenu" aria-haspopup="menu" aria-expanded="' + (menu === 'secs') + '" data-menu="secs" data-f="menu:secs" aria-label="' + esc(name + ', ' + t('choose a section')) + '"><b>' + esc(name) + '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</button></div>';
	}
	function detailHTML() {
		var x = current(), s = St(), built = BUILT.indexOf(x.id) !== -1 && (x.id === 'settings' || s);
		var deep = showChanges || showVersions || (x.id === 'type' && (role || fontFor));
		var name = sq && sq.q.trim() ? t('Search') : showChanges ? t('Changes') : showVersions ? t('Versions') : editing ? label(editing) : x.id !== 'type' ? x.name : fontFor ? (role ? t('Font') : t(fontFor === 'body' ? 'Reading Font' : 'Interface Font')) : role ? t(roleMeta(role).label) : x.name;
		var sub = (showChanges || showVersions) && s ? s.name() : x.id === 'button' ? t('Site') : x.id === 'styles' && s ? s.name() + (editedWord(s, true) ? ' · ' + editedWord(s, true) : '') : editing ? (editing === 'door.own' ? t('Vibetiles Button') : editing === 'colours.{side}.button' ? t('Buttons') : /title|headings|meta/.test(editing) && role ? t('Type') + ' › ' + t(roleMeta(role).label) : x.id !== 'colour' && x.id !== 'type' ? x.name : t('Colour')) : fontFor ? (role ? t('Type') + ' › ' + t(roleMeta(fontFor).label) : t('Type')) : role ? t('Type') : built && s && x.id !== 'settings' ? s.name() : x.settings ? t('{n} settings').replace('{n}', x.settings) : '';
		var back = editing || deep || phone();
		var undo = built && s ? '<button type="button" class="ldpw-circ" data-act="undo" data-f="act:undo"' + (s.canUndo() ? '' : ' disabled') + ' aria-label="' + esc(undoName()) + '" title="' + esc(undoName()) + '">' + svg(GLYPH.undo) + '</button>' : '';
		return '<div class="ldpw-detail">' +
			'<div class="ldpw-bar">' + (prefs.noSide && !phone() ? '<button type="button" class="ldpw-closer" data-act="close" data-f="act:close3" aria-label="' + esc(t('Close')) + '">' + svg(GLYPH.close) + '</button><button type="button" class="ldpw-circ is-plain" aria-haspopup="menu" data-menu="views" data-f="menu:views2" aria-label="' + esc(t('View')) + '" title="' + esc(t('View')) + '">' + svg(GLYPH.side) + '</button>' : '') + (back ? '<button type="button" class="ldpw-circ is-plain" data-act="' + (editing || deep ? 'back' : 'list') + '" data-f="act:back" aria-label="' + esc(t('Back')) + '">' + svg(GLYPH.back) + '</button>' : '') +
				(prefs.noSide && !phone() && !deep && !editing && !(sq && sq.q.trim()) ? secsTitle(x, name, sub) : '<div class="ldpw-ttl"><b>' + esc(name) + '</b>' + (sub && (prefs.noSide || phone() || editing || deep) ? '<small>' + esc(sub) + '</small>' : '') + '</div>') +  
				(s && s.editable() && !phone() && prefs.tips && !prefs.seenAim ? '<div class="ldpw-tip" role="note"><b>' + esc(t('Click anything on the page')) + '</b><span>' + esc(t('It opens its setting here. Or hold ⌥ and click, even with the window closed.')) + '</span><button type="button" class="ldpw-tipx" data-act="tipoff" data-f="act:tipoff" aria-label="' + esc(t('Close')) + '">' + svg(GLYPH.close) + '</button></div>' : '') + (s && s.editable() && !phone() ? '<button type="button" class="ldpw-circ is-plain' + (aiming ? ' is-aim' : '') + '" data-act="aim" data-f="act:aim" aria-pressed="' + aiming + '" aria-label="' + esc(t('Choose on the Page')) + '" title="' + esc(t('Click anything on the page to open its setting. Or hold ⌥ and click.')) + '">' + svg(GLYPH.aim) + '</button>' : '') + (s && s.editable() && built ? '<button type="button" class="ldpw-circ is-plain' + (comparing ? ' is-aim' : '') + '" data-act="compare" data-f="act:compare" aria-label="' + esc(t('Hold to Compare')) + '" title="' + esc(t('Hold to see the page without your changes (hold M)')) + '"' + (s.changes().length ? '' : ' disabled') + '>' + svg(GLYPH.compare) + '</button>' : '') + undo + (built && s ? barMore() : settingsMore())  + (built && s && x.id !== 'styles' && x.id !== 'button' && !phone() ? commit() : '') +
				(phone() ? '<button type="button" class="ldpw-closer" data-act="close" data-f="act:close2" aria-label="' + esc(t('Close')) + '">' + svg(GLYPH.close) + '</button>' : '') + '</div>' +
			'<div class="ldpw-scroll">' + pageBody(x) + '</div>' + foot(x, s, deep, built) + menuHTML() + (note ? '<p class="ldpw-note-line" role="status">' + esc(note) + '</p>' : '') +
		'</div>';
	}
	var WHAT = { paragraphs: 'Paragraphs', piccorners: 'Picture corners', pictureshadow: 'Picture shadow', pictureEdge: 'Picture edge', subcolour: 'Section headings', opening: 'Opening sentence', widefigures: 'Wide pictures in the text', lines: 'Lines', line: 'Lines', linestyle: 'Line style', hairlines: 'Fine lines', darkground: 'Dark ground', fills: 'Fills', fill: 'Fills', rounded: 'Rounded corners', corners: 'Corner size', buttonShape: 'Button shape', tagsMatchButtons: 'Tags follow the buttons', primaryButton: 'Main buttons', secondaryButton: 'Other buttons', tertiaryButton: 'Quiet buttons', tags: 'Tags', currentItem: 'Chosen item', fullpicture: 'Picture width', quotes: 'Quotes', notes: 'Notes', fields: 'Fields', linewidth: 'Line width', cards: 'Cards', soft: 'Softer reading text', softlevel: 'Softer reading text', quietlevel: 'Softer reading text', smallsoft: 'Small text', links: 'Links', categories: 'Categories',
		justify: 'Justified text', hyphenate: 'Hyphens', dropcap: 'Drop cap', capLines: 'Drop cap height', capface: 'Drop cap font', pictures: 'Picture effects', picturedim: 'Dim in the dark',
		pictureframe: 'Frame around pictures', picturefade: 'Fade the edges', fadeedges: 'Fade the edges', marker: 'Highlighter', markercolour: 'Highlighter', button: 'Button colour', pillbuttons: 'Pill buttons', widepicture: 'Wide top picture', widehead: 'Wide title', measure: 'Line length', space: 'Space', framewidth: 'Frame width', framepattern: 'Frame pattern', palette: 'Colour', tint: 'Colour', preset: 'Colour', colours: 'Colour', accent: 'Colour',
		face: 'Font', sans: 'Font', reading: 'Size', leading: 'Line spacing', reset: 'Reset everything', version: 'Restore' };
	function whatName(w) {
		if (!w) return '';
		if (ALONE[w]) return t(ALONE[w]);
		if (LAB_LABEL[w] || (setting(w) && setting(w).label && w.indexOf('{') === -1)) return label(w); 
		if (WHAT[w]) return t(WHAT[w]);
		if (w === 'changes') return t('Changes');
		if (w.indexOf('roles.') === 0 || w.indexOf('colours.') === 0 || LAB_LABEL[w] || (setting(w) && setting(w).label) || TOP_WORD[w]) return changeName(w);
		return '';
	}
	function redoName() { var w = whatName(St() && St().redoWhat ? St().redoWhat() : ''); return w ? t('Redo {what}').replace('{what}', w) : t('Redo'); }
	function undoName() { var w = whatName(St() ? St().undoWhat() : ''); return w ? t('Undo {what}').replace('{what}', w) : t('Undo'); }
	function sheetHTML() {
		if (asking !== true) {
			var a = asking;
			return '<div class="ldpw-veil"><div class="ldpw-sheet" role="alertdialog" aria-modal="true" aria-labelledby="ldpw-ask-title"' + (a.text ? ' aria-describedby="ldpw-ask-text"' : '') + '>' +
				'<p class="ldpw-sheet-title" id="ldpw-ask-title">' + esc(a.title) + '</p>' +
				(a.text ? '<p id="ldpw-ask-text">' + esc(a.text) + '</p>' : '') +
				(a.keys ? '<div class="ldpw-keys">' + a.keys.map(function (k) { return '<div><span>' + esc(t(k[0])) + '</span><kbd>' + esc(t(k[1])) + '</kbd></div>'; }).join('') + '</div>' : '') +
				(a.field !== undefined ? '<label class="ldpw-field-label" for="ldpw-ask-field">' + esc(a.fieldLabel || t('Name')) + '</label><input id="ldpw-ask-field" class="ldpw-field" data-f="askfield" value="' + esc(a.field) + '" maxlength="' + (a.fieldLabel ? 20000 : 40) + '" autocomplete="off" spellcheck="false">' : '') +
				'<p class="ldpw-err" role="alert"' + (a.err ? '' : ' hidden') + '>' + esc(a.err || '') + '</p>' +
				'<div class="ldpw-row">' + (a.keys ? '' : '<button type="button" class="ldpw-plain" data-act="cancel">' + esc(t('Cancel')) + '</button>') + '<button type="button" class="' + (a.danger ? 'ldpw-red' : 'ldpw-blue') + '" data-act="ask-go">' + esc(a.go) + '</button></div>' +
			'</div></div>';
		}
		return '<div class="ldpw-veil"><div class="ldpw-sheet" role="alertdialog" aria-modal="true" aria-labelledby="ldpw-ask-title" aria-describedby="ldpw-ask-text">' +
			'<p class="ldpw-sheet-title" id="ldpw-ask-title">' + esc(t('Go back to the current window?')) + '</p>' +
			'<p id="ldpw-ask-text">' + esc(t('The panel opens as before the next time you open it. Your styles, changes and readers stay exactly as they are.')) + '</p>' +
			'<p class="ldpw-err" role="alert" hidden>' + esc(t('Could not save. Try again.')) + '</p>' +
			'<div class="ldpw-row"><button type="button" class="ldpw-plain" data-act="cancel">' + esc(t('Cancel')) + '</button><button type="button" class="ldpw-blue" data-act="goback">' + esc(t('Go Back')) + '</button></div>' +
		'</div></div>';
	}
	
	function RD() { return !!(host && host.reader); }
	function TRY() { return !!(host && host.tryMode); }
	var readerCopied = false;
	function readerHTML() {
		var r = host.reader, s = St(), st = s ? s.styles() : { shown: [], original: null }, ids = r.sizes(), at = ids.indexOf(r.size());
		var list = (st.original ? [st.original] : []).concat(st.shown); 
		var tiles = list.map(function (id) {
			var x = s.tile(id); if (!x) return '';
			return '<div class="ldpw-stile' + (x.on ? ' is-on' : '') + '"><button type="button" class="ldpw-tile" role="radio" aria-checked="' + x.on + '" data-rstyle="' + esc(id) + '" data-f="rstyle:' + esc(id) + '">' +
				'<span class="ldpw-pic ldpw-spic" style="background:' + esc(x.paper) + ';color:' + esc(x.ink) + ';--pi:' + esc(x.ink) + ';--pa:' + esc(x.accent) + (x.face ? ';font-family:' + esc(tileFace(x.face)) : '') + '" aria-hidden="true"><b>Aa</b><i></i><i></i><i></i>' + (x.isDefault ? '<em class="ldpw-dflt">' + esc(t('Default')) + '</em>' : '') + '</span>' +
				'<span class="ldpw-nm">' + esc(nm(x)) + (x.isDefault ? '<span class="ldpw-sr">, ' + esc(t('Default')) + '</span>' : '') + '</span>' + 
			'</button></div>';
		}).join('');
		var stepper = '<div class="ldpw-box ldpw-rsize"><div class="ldpw-cap"><button type="button" data-rsize="-1" data-f="rsize:-1" aria-label="' + esc(t('Smaller')) + '"' + (at <= 0 ? ' disabled' : '') + '>A</button>' +
			'<button type="button" class="is-big" data-rsize="1" data-f="rsize:1" aria-label="' + esc(t('Larger')) + '"' + (at >= ids.length - 1 ? ' disabled' : '') + '>A</button></div>' +
			'<span class="ldpw-rdots" aria-hidden="true">' + ids.map(function (id, i) { return '<i' + (i === at ? ' class="is-on"' : '') + '></i>'; }).join('') + '</span></div>';
		var looks = box(sidePicks('rside', r.side()));
		var shut = '<button type="button" class="ldpw-closer" data-act="close" data-f="act:close" aria-label="' + esc(t('Close')) + '">' + svg(GLYPH.close) + '</button>';
		var pv = !!r.preview;
		return '<div class="ldpw-detail"><div class="ldpw-bar">' + (phone() ? '' : shut) +
				'<div class="ldpw-ttl"><b id="ldpw-title">' + esc(t('Vibetiles')) + '</b>' + (pv ? '<small>' + esc(t('Preview as Reader')) + '</small>' : '') + '</div>' +
				(pv ? '<button type="button" class="ldpw-blue" data-act="endpreview" data-f="act:endpreview">' + esc(t('Done')) + '</button>' : '') + (phone() ? shut : '') + '</div>' + 
			'<div class="ldpw-scroll">' +
				gtitle(t('Text size')) + stepper + gtitle(t('Appearance')) + looks +
				(list.length > 1 ? '<div class="ldpw-tiles ldpw-styles" role="radiogroup" aria-label="' + esc(t('Styles')) + '">' + tiles + '</div>' : '') +
				(r.canCopy() ? box('<button type="button" class="ldpw-r ldpw-rlink" data-rcopy data-f="rcopy">' + esc(t(readerCopied ? 'Style Copied' : 'Copy Style')) + '</button>') : '') +
				(pv ? '<p class="ldpw-hint">' + esc(t('What a visitor sees: the site default first, no styles of your own, no unsaved changes. It closes when they click the page.')) + '</p>' : '') +
			'</div></div>';
	}
	function readerClick(b) {
		var r = host.reader;
		if (b.getAttribute('data-act') === 'endpreview') { hide(); try { window.close(); } catch (e) {  }
			setTimeout(function () { var u = new URL(window.location.href); u.searchParams.delete('ldp-as-reader'); window.location.href = u.toString(); }, 150); return true; }
		if (b.hasAttribute('data-rsize')) { var ids = r.sizes(), i = ids.indexOf(r.size()) + (+b.getAttribute('data-rsize')); if (ids[i]) r.setSize(ids[i]); render('[data-f="' + b.getAttribute('data-f') + '"]'); return true; }
		if (b.getAttribute('data-seg') === 'rside') { r.setSide(b.getAttribute('data-v')); render('[data-seg="rside"][data-v="' + b.getAttribute('data-v') + '"]'); return true; }
		if (b.hasAttribute('data-rstyle')) { St().choose(b.getAttribute('data-rstyle')); render('[data-rstyle="' + b.getAttribute('data-rstyle') + '"]'); return true; }
		if (b.hasAttribute('data-rcopy')) {
			var link = r.link();
			if (link && navigator.clipboard) navigator.clipboard.writeText(link).then(function () { readerCopied = true; render('[data-rcopy]'); setTimeout(function () { readerCopied = false; if (open) render(); }, 1400); }, function () {});
			return true;
		}
		return false;
	}
	
	function syncAttrs(x, y) {
		for (var i = x.attributes.length - 1; i >= 0; i--) { var n = x.attributes[i].name; if (!y.hasAttribute(n)) x.removeAttribute(n); }
		for (var j = 0; j < y.attributes.length; j++) { var a = y.attributes[j]; if (x.getAttribute(a.name) !== a.value) x.setAttribute(a.name, a.value); }
		if (x.tagName === 'INPUT' && x !== document.activeElement) { var v = y.getAttribute('value'); if (v !== null && x.value !== v) x.value = v; if (x.type === 'checkbox' || x.type === 'radio') x.checked = y.hasAttribute('checked'); }
	}
	function patchKids(a, b) {
		var A = [].slice.call(a.childNodes), B = [].slice.call(b.childNodes);
		if (A.length !== B.length) { a.replaceChildren.apply(a, B); return; }
		for (var i = 0; i < A.length; i++) {
			var x = A[i], y = B[i];
			if (x.isEqualNode(y)) continue;
			if (x.nodeType === 1 && y.nodeType === 1 && x.tagName === y.tagName && x.tagName !== 'svg') { syncAttrs(x, y); patchKids(x, y); }
			else if (x.nodeType === 3 && y.nodeType === 3) x.nodeValue = y.nodeValue;
			else a.replaceChild(y, x);
		}
	}
	function patchInto(el, html) {
		var tpl = document.createElement('template'); tpl.innerHTML = html;
		if (!el.firstChild) { el.appendChild(tpl.content); return; }
		patchKids(el, tpl.content);
	}
	var settleUntil = 0, settleTimer = 0, settleFocus;
	function render(focus) {
		if (!win) return;
		var wait = settleUntil - Date.now();
		if (wait > 0) { if (focus !== undefined) settleFocus = focus; clearTimeout(settleTimer); settleTimer = setTimeout(function () { var f = settleFocus; settleFocus = undefined; settleUntil = 0; render(f); }, wait); return; }
		if (RD()) {
			var had0 = document.activeElement && win.contains(document.activeElement) ? document.activeElement.getAttribute('data-f') : null;
			win.classList.add('is-reader'); win.classList.toggle('is-phone', phone()); win.classList.remove('is-list'); applyPrefs(); win.classList.add('is-noside');
			var rWas = {}; win.querySelectorAll('.ldpw-seg').forEach(function (g) { var k = g.querySelector('[data-seg]'); if (k) rWas[k.getAttribute('data-seg')] = g.style.getPropertyValue('--i'); });
			patchInto(win, readerHTML() + (phone() ? '<div class="ldpw-grab" aria-hidden="true"></div>' : ''));
			var rMoved = []; win.querySelectorAll('.ldpw-seg').forEach(function (g) { var k = g.querySelector('[data-seg]'), now = g.style.getPropertyValue('--i'), was = k ? rWas[k.getAttribute('data-seg')] : undefined; if (was !== undefined && was !== now) { g.style.setProperty('--i', was); rMoved.push(function () { g.style.setProperty('--i', now); }); } });
			if (rMoved.length) { void win.offsetWidth; rMoved.forEach(function (f) { f(); }); }
			var f0 = focus ? win.querySelector(focus) : had0 ? win.querySelector('[data-f="' + had0 + '"]') : null;
			if (f0) f0.focus({ preventScroll: true });
			return;
		}
		var small = phone(), page = [current().id, role, fontFor, editing, showChanges, showVersions].join('|');
		if (!showVersions && !comparing && St() && St().previewing()) St().previewVersion(null); 
		if (!menu) { menuQ = ''; menuIndex = null; }
		MENU = {}; STOP = {}; viewsMenu();
		var a = document.activeElement, had = a && win.contains(a) ? a.getAttribute('data-f') : null;
		var sc = win.querySelector('.ldpw-scroll'), top = sc && page === lastPage ? sc.scrollTop : 0;
		win.classList.toggle('is-phone', small);
		win.classList.toggle('is-list', small && phoneList);
		applyPrefs();
		var wasSeg = {}, wasSw = {};
		win.querySelectorAll('.ldpw-seg').forEach(function (g) { var k = g.querySelector('[data-seg]'); if (k) wasSeg[k.getAttribute('data-seg')] = g.style.getPropertyValue('--i'); });
		win.querySelectorAll('.ldpw-sw[data-f]').forEach(function (x) { wasSw[x.getAttribute('data-f')] = x.getAttribute('aria-checked'); });
		patchInto(win, sideHTML() + detailHTML() + (asking ? sheetHTML() : '') + cmdHTML() + (small ? '<div class="ldpw-grab" aria-hidden="true"></div>' : ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'].map(function (d) { return '<div class="ldpw-rz' + (d.length > 1 ? ' is-c' : '') + '" data-dir="' + d + '" aria-hidden="true"></div>'; }).join(''))); 
		var moved = [];
		win.querySelectorAll('.ldpw-seg').forEach(function (g) { var k = g.querySelector('[data-seg]'), now = g.style.getPropertyValue('--i'), was = k ? wasSeg[k.getAttribute('data-seg')] : undefined; if (was !== undefined && was !== now) { g.style.setProperty('--i', was); moved.push(function () { g.style.setProperty('--i', now); }); } });
		win.querySelectorAll('.ldpw-sw[data-f]').forEach(function (x) { var now = x.getAttribute('aria-checked'), was = wasSw[x.getAttribute('data-f')]; if (was !== undefined && was !== now) { x.setAttribute('aria-checked', was); moved.push(function () { x.setAttribute('aria-checked', now); }); } });
		if (moved.length) { void win.offsetWidth; moved.forEach(function (f) { f(); }); }
		sc = win.querySelector('.ldpw-scroll'); if (sc) sc.scrollTop = top;
		lastPage = page; dirty = false;
		placeMenu();
		markChanged();
		var f = cmd ? win.querySelector('[data-cmdq]') : asking ? win.querySelector('#ldpw-ask-field, [data-act="goback"], [data-act="ask-go"]') : focus ? win.querySelector(focus) : had ? win.querySelector('[data-f="' + had + '"]') : null;
		if (f) { f.focus({ preventScroll: true }); if (f.id === 'ldpw-ask-field' && f.select) f.select(); } 
	}
	
	function pagePaths(secId) {
		var s = St(); if (!s || !s.changes || !s.editable()) return [];
		return s.changes().map(function (c) { return c.path; }).filter(function (p) { return changeSection(p) === secId; });
	}
	function markChanged() {
		var s = St(); if (!s || !s.changes || !s.editable()) return;
		var paths = s.changes().map(function (c) { return c.path; }), secs = {};
		paths.forEach(function (p) {
			var k = p.split('.')[0];
			var sec = changeSection(p);
			if (k === 'effects') k = p; 
			if (sec) secs[sec] = 1;
			var sel = k === 'colours' ? '[data-edit="colours.{side}.' + p.split('.').pop() + '"]' : k === 'roles' ? '[data-role="' + p.split('.')[1] + '"]' : '[data-set="' + k + '"], [data-menu="' + k + '"], [data-stop="' + k + '"], [data-look="' + k + '"], [data-level="' + k + '"], [data-pair="' + k + '"]';
			win.querySelectorAll('.ldpw-scroll :is(' + sel + ')').forEach(function (el) { var r = el.closest('.ldpw-r'); if (r) r.classList.add('is-changed'); });
		});
		win.querySelectorAll('.ldpw-nav[data-sec]').forEach(function (n) { n.classList.toggle('is-changed', !!secs[n.getAttribute('data-sec')]); });
	}
	function changed() {
		if (!open) { if (primed && win) { win.classList.remove('is-primed'); win.hidden = true; } primed = false; primeSoon(); return; }
		var a = document.activeElement;
		if (holding || cmd || (a && win.contains(a) && a.matches('input[type="text"], input:not([type])'))) { dirty = true; return; }
		if (frame) return;
		frame = requestAnimationFrame(function () { frame = 0; render(); });
	}
	function placeMenu() {
		var m = win && win.querySelector('.ldpw-menu'), b = m && [].filter.call(win.querySelectorAll('[data-menu="' + menu + '"]'), function (x) { return x.getClientRects().length; })[0]; 
		if (!m || !b) return;
		var W = win.getBoundingClientRect(); m.style.maxHeight = Math.round(W.height - 16) + 'px';
		var w = (m.offsetParent || win).getBoundingClientRect(), r = b.getBoundingClientRect(), h = m.offsetHeight;
		var top = r.bottom - w.top + 4, floor = W.bottom - w.top - 8, ceil = W.top - w.top + 8;
		if (top + h > floor) top = r.top - w.top - h - 4 >= ceil ? r.top - w.top - h - 4 : Math.max(ceil, floor - h);
		m.style.top = Math.round(top) + 'px';
		if (r.left - W.left < W.width / 3) { m.style.left = Math.round(Math.max(8 - (w.left - W.left), r.left - w.left)) + 'px'; m.style.right = 'auto'; } 
		else { m.style.right = Math.round(w.right - r.right) + 'px'; m.style.left = 'auto'; }
	}
	
	function place() {
		if (!win) return;
		if (phone()) { ['left', 'top', 'width', 'max-height'].forEach(function (k) { win.style.removeProperty(k); }); sheetSize(); return; }
		var iw = window.innerWidth, ih = window.innerHeight, bar = document.getElementById('wpadminbar');
		var roof = 8 + (bar ? Math.max(0, bar.getBoundingClientRect().bottom) : 0);
		var w = Math.min(RD() ? 448 : (prefs.noSide ? 0 : Math.max(150, Math.min(260, +prefs.sideW || 200))) + (+prefs.pageW || 448), iw - 16), h = ih - roof - 8; 
		var r = door && door.getBoundingClientRect && door.getClientRects().length ? door.getBoundingClientRect() : { top: ih - 16, bottom: ih - 16, right: iw - 16 };
		var left = Math.max(8, Math.min(iw - w - 8, r.right - w));
		var below = r.top <= ih / 2, top = below ? r.bottom + 8 : roof;
		if (door && door.getAttribute && door.getAttribute('data-docked') === 'menu' && below) { left = Math.max(8, iw - 16 - w); top = r.bottom + 10; } 
		top = Math.max(roof, Math.min(ih - 320 - 8, top));
		h = below ? ih - top - 8 : Math.max(320, r.top - 8 - roof); 
		var pl = door && door.getAttribute && !door.hasAttribute('data-docked') ? door.getAttribute('data-place') : '';
		if (pl && pl !== 'auto' && door.classList && door.classList.contains('architrave-panel-opener')) {
			h = ih - roof - 8;
			left = /left/.test(pl) ? r.left : /center/.test(pl) ? r.left + r.width / 2 - w / 2 : r.right - w;
			left = Math.max(8, Math.min(iw - w - 8, left));
			top = /^bottom/.test(pl) ? r.bottom - h : /^top/.test(pl) ? r.top : r.top + r.height / 2 - h / 2;
			top = Math.max(roof, Math.min(ih - 8 - h, top));
		}
		if (prefs.x !== null && prefs.y !== null) { left = Math.max(8, Math.min(+prefs.x, iw - w - 8)); top = Math.max(roof, Math.min(+prefs.y, ih - 120)); h = ih - top - 8; }
		if (prefs.h && !RD()) h = Math.max(320, Math.min(+prefs.h, ih - top - 8));
		if (RD()) {
			if (prefs.x !== null && prefs.y !== null) { frameAt(left, top, w, 'auto', Math.round(ih - top - 8) + 'px'); return; }
			if (below) { top = r.bottom + 8; frameAt(left, top, w, 'auto', Math.round(ih - top - 8) + 'px'); return; }
			var foot = pl && pl !== 'auto' ? Math.min(ih - 8, r.bottom) : r.top - 8;
			frameAt(left, roof, w, 'auto', Math.round(foot - roof) + 'px');
			win.style.top = Math.round(Math.max(roof, foot - win.offsetHeight)) + 'px'; return;
		}
		frameAt(left, top, w, Math.round(h) + 'px', '');
	}
	function frameAt(left, top, w, h, maxH) { var st = win.style; st.left = Math.round(left) + 'px'; st.top = Math.round(top) + 'px'; st.width = Math.round(w) + 'px'; st.height = h; st.maxHeight = maxH; }
	
	var morph = (function () {
		var layer = null, glow = null, live = false, timers = [], at = { x: 0, y: 0 }, K = 0.5, G = 4.4;
		function spring(zeta, n) { var w = 2 * Math.PI * 1.1, wd = w * Math.sqrt(1 - zeta * zeta), pts = [];
			for (var i = 0; i <= n; i++) { var s = i / n * 1.25; pts.push((1 - Math.exp(-zeta * w * s) * (Math.cos(wd * s) + zeta * w / wd * Math.sin(wd * s))).toFixed(4)); }
			pts[pts.length - 1] = '1'; return 'linear(' + pts.join(', ') + ')'; }
		var SNAPPY = spring(0.72, 60), EASE = 'cubic-bezier(.45,0,.25,1)';
		var GE = 0.5;
		function lit() { return !!door && door.getAttribute && door.getAttribute('data-aurora') === 'true' && door.getAttribute('data-docked') !== 'slot'; }
		function band() { return 'linear-gradient(90deg, ' + (BANDS[door && door.getAttribute && door.getAttribute('data-band')] || BANDS.dusk)[1] + ')'; }
		function can() { return !phone() && !!Element.prototype.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && prefs.motion !== 'reduced' && !!door && !!door.getClientRects && door.getClientRects().length > 0 && !door.hasAttribute('data-docked') && !door.closest('.wp-block-navigation, nav'); }
		function make(colour) {
			if (!document.getElementById('ldpw-goo')) { var h = document.createElement('div'); h.innerHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><filter id="ldpw-goo" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="11" result="b"/><feColorMatrix in="b" mode="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 30 -12" result="m"/><feFlood flood-color="#2c2c2e"/><feComposite in2="m" operator="in"/></filter></defs></svg>'; document.body.appendChild(h.firstChild); }
			var fl = document.querySelector('#ldpw-goo feFlood'); fl.setAttribute('flood-color', colour); fl.style.floodColor = colour; 
			blurAt(11);
			if (!layer) { layer = document.createElement('div'); layer.className = 'ldpw-goo'; layer.setAttribute('aria-hidden', 'true'); layer.innerHTML = '<i></i><i></i>'; document.body.appendChild(layer); }
			stop([layer]); layer.hidden = false; return layer.children;
		}
		function fit(bb, p) { var pad = 80, l = Math.min(bb.left, p.left) - pad, tp = Math.min(bb.top, p.top) - pad - 100, r = Math.max(bb.right, p.right) + pad, btm = Math.max(bb.bottom, p.bottom) + pad + 100;
			at.x = l; at.y = tp; layer.style.left = l + 'px'; layer.style.top = tp + 'px'; layer.style.width = (r - l) * K + 'px'; layer.style.height = (btm - tp) * K + 'px'; layer.style.transform = 'scale(' + 1 / K + ')'; }
		function px(v) { return v * K + 'px'; }
		function boxOf(r) { return { left: px(r.left - at.x + G), top: px(r.top - at.y + G), width: px(r.width - 2 * G), height: px(r.height - 2 * G) }; }
		function frames(bb, p, radius) {
			var d0 = bb.height * 0.9, d1 = 170, rise = 92, cx = bb.left + bb.width / 2 - at.x, cy = bb.top + bb.height / 2 - at.y, dx = cx, dy = cy;
			var P = { left: p.left - at.x, right: p.right - at.x, top: p.top - at.y, bottom: p.bottom - at.y, width: p.width, height: p.height }, B = { top: bb.top - at.y, bottom: bb.bottom - at.y };
			if (P.bottom <= B.top + 1) dy = B.top - rise; else if (P.top >= B.bottom - 1) dy = B.bottom + rise; else dy = (P.top + P.bottom) / 2 > cy ? cy + rise : cy - rise;
			dx = Math.max(P.left + d1 / 2, Math.min(P.right - d1 / 2, dx));
			return { seed: { left: px(cx - d0 / 2), top: px(cy - d0 / 2), width: px(d0), height: px(d0), borderRadius: '50%' },
				drop: { left: px(dx - d1 / 2), top: px(dy - d1 / 2), width: px(d1), height: px(d1), borderRadius: '50%' },
				panel: { left: px(P.left + GE), top: px(P.top + GE), width: px(P.width - 2 * GE), height: px(P.height - 2 * GE), borderRadius: px(parseFloat(radius) || 0) } }; 
		}
		function blurAt(v) { var g = document.querySelector('#ldpw-goo feGaussianBlur'); if (g) g.setAttribute('stdDeviation', v.toFixed(2)); }
		function tint(anim, from, to, a, c, opening) {
			var flood = document.querySelector('#ldpw-goo feFlood');
			(function step() {
				var k0 = anim.effect ? anim.effect.getComputedTiming().progress : null;
				if (k0 === null || anim.playState === 'finished' || anim.playState === 'idle') { flood.style.floodColor = to; blurAt(opening ? 1.5 : 11); return; }
				var k = Math.max(0, Math.min(1, (k0 - a) / (c - a))); flood.style.floodColor = 'color-mix(in oklab, ' + to + ' ' + Math.round(k * 100) + '%, ' + from + ')';
				var e = opening ? Math.max(0, Math.min(1, (k0 - 0.6) / 0.4)) : 1 - Math.max(0, Math.min(1, k0 / 0.45));
				blurAt(11 - 9.5 * e * e * (3 - 2 * e));
				requestAnimationFrame(step);
			})();
		}
		function stop(els) { els.forEach(function (el) { if (el) el.getAnimations().forEach(function (a) { if (!(window.CSSAnimation && a instanceof window.CSSAnimation)) a.cancel(); }); }); }
		function clear() { timers.forEach(clearTimeout); timers = []; }
		function see(c) { return c && c !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(c); }
		function face(d) { var cs = getComputedStyle(d), f = cs.getPropertyValue('--opener-face').trim(); if (f && !/^var\(/.test(f)) return f; var c = cs.backgroundColor; return see(c) ? c : getComputedStyle(win).backgroundColor; }
		function solid(c) { var m = /rgba?\(([^)]+)\)/.exec(c); if (!m) return c; var v = m[1].split(',').map(parseFloat); return 'rgba(' + v[0] + ',' + v[1] + ',' + v[2] + ',' + Math.max(v[3] == null || isNaN(v[3]) ? 1 : v[3], 0.94) + ')'; }
		function followGlow() { (function f() { if (!glow || glow.hidden || !win || win.hidden) return; var r = win.getBoundingClientRect(); glow.style.left = (r.left + 12) + 'px'; glow.style.width = Math.max(0, r.width - 24) + 'px'; glow.style.top = (r.bottom - 2) + 'px'; requestAnimationFrame(f); })(); }
		function makeGlow() { if (!glow) { glow = document.createElement('div'); glow.className = 'ldpw-glow'; glow.setAttribute('aria-hidden', 'true'); document.body.appendChild(glow); } glow.style.setProperty('--ldpw-band', band()); stop([glow]); glow.hidden = false; followGlow(); }
		function lightOn() {
			if (!lit()) return; win.style.setProperty('--ldpw-band', band()); win.classList.add('has-door-light'); makeGlow();
			glow.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease-out' });
			win.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease-out', pseudoElement: '::after' });
			timers.push(setTimeout(function () { if (!win || win.hidden) return; var fade = [{ opacity: 1 }, { opacity: 0 }], o = { duration: 900, easing: 'ease-in-out', fill: 'forwards' };
				var gone = glow.animate(fade, o); win.animate(fade, Object.assign({ pseudoElement: '::after' }, o));
				gone.finished.then(function () { glow.hidden = true; stop([glow]); win.classList.remove('has-door-light'); win.getAnimations().forEach(function (a) { if (a.effect && a.effect.pseudoElement) a.cancel(); }); }, function () {}); }, 1500));
		}
		function lightOff() { if (win) win.classList.remove('has-door-light'); if (glow) { glow.hidden = true; stop([glow]); } }
		function glass() { return !!win && win.hasAttribute('data-glass'); }
		function openIt() {
			var d = door; clear(); lightOff(); stop([d, win]); if (layer) { stop([].slice.call(layer.children)); layer.hidden = true; }
			d.style.visibility = ''; d.style.opacity = ''; live = true;
			win.style.transition = 'none'; win.style.opacity = '0';
			requestAnimationFrame(function () {
				if (!live || !open) { win.style.opacity = ''; return; }
				var bb = d.getBoundingClientRect(), p = win.getBoundingClientRect(), cs = getComputedStyle(win);
				var fill = solid(cs.backgroundColor), kids = make(fill); fit(bb, p); var f = frames(bb, p, cs.borderTopLeftRadius);
				Object.assign(kids[0].style, boxOf(bb), { borderRadius: px(parseFloat(getComputedStyle(d).borderTopLeftRadius) || 0), opacity: '' });
				var ms = 280, m = kids[1].animate([Object.assign({ easing: EASE }, f.seed), Object.assign({ offset: 0.3, easing: SNAPPY }, f.drop), f.panel], { duration: ms, easing: 'linear', fill: 'forwards' });
				tint(m, solid(face(d)), fill, 0.12, 0.55, true);
				var gx = Math.max(0, p.left - bb.right, bb.left - p.right), gy = Math.max(0, p.top - bb.bottom, bb.top - p.bottom), gap = Math.sqrt(gx * gx + gy * gy);
				var far = Math.max(0, Math.min(1, (gap - 40) / 200)), gone = 1 - 0.65 * far, small = 'scale(' + (1 - 0.45 * far).toFixed(2) + ')'; 
				kids[0].animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 1, transform: 'scale(1)', offset: gone - 0.25 }, { opacity: 0, transform: small, offset: gone }].concat(gone < 1 ? [{ opacity: 0, transform: small }] : []), { duration: ms, fill: 'forwards' });
				d.animate([{ opacity: 1 }, { opacity: 1, offset: 0.15 }, { opacity: 0, offset: 0.45 }, { opacity: 0 }], { duration: ms, fill: 'forwards' });
				m.finished.then(function () {
					if (!live || !open) return;
					d.style.visibility = 'hidden'; stop([d]);
					win.style.opacity = ''; win.style.boxShadow = 'none';
					var gl = glass(); if (gl) layer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: 'ease-out', fill: 'forwards' });
					win.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, easing: 'ease-out' }).finished.then(function () {
						win.style.transition = 'box-shadow 220ms ease-out'; win.style.boxShadow = '';
						var fade = layer.animate([{ opacity: gl ? 0 : 1 }, { opacity: 0 }], { duration: gl ? 1 : 160, delay: gl ? 0 : 40, easing: 'ease-in', fill: 'forwards' });
						timers.push(setTimeout(function () { layer.hidden = true; stop([].slice.call(layer.children)); fade.cancel(); win.style.transition = ''; }, 300));
					}, function () {});
					lightOn();
				}, function () {});
			});
		}
		function closeIt(done) {
			var d = door; clear(); stop([d]); win.style.transition = '';
			if (!live || !layer || !d || !d.getClientRects().length) { live = false; if (d) { d.style.visibility = ''; d.style.opacity = ''; } lightOff(); done(); return; }
			var bb = d.getBoundingClientRect(), p = win.getBoundingClientRect(), cs = getComputedStyle(win);
			var kids = make(solid(cs.backgroundColor)); fit(bb, p); var f = frames(bb, p, cs.borderTopLeftRadius);
			Object.assign(kids[0].style, boxOf(bb), { borderRadius: px(parseFloat(getComputedStyle(d).borderTopLeftRadius) || 0) });
			Object.assign(kids[1].style, f.panel); lightOff(); win.style.boxShadow = 'none';
			kids[0].style.opacity = '0'; 
			d.style.visibility = ''; d.style.opacity = '0';
			win.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 90, fill: 'forwards' }).finished.then(function () {
				done(); stop([win]); win.style.opacity = ''; win.style.boxShadow = '';
				var ms = 240, m = kids[1].animate([f.panel, Object.assign({ offset: 0.6 }, f.drop), f.seed], { duration: ms, easing: EASE, fill: 'forwards' });
				blurAt(1.5); tint(m, solid(cs.backgroundColor), solid(face(d)), 0.45, 0.9, false);
				kids[0].animate([{ opacity: 0 }, { opacity: 1, offset: 0.4 }, { opacity: 1 }], { duration: ms, fill: 'forwards' });
				d.style.opacity = ''; d.animate([{ opacity: 0 }, { opacity: 0, offset: 0.6 }, { opacity: 1 }], { duration: ms });
				m.finished.then(function () { layer.hidden = true; stop([].slice.call(layer.children)); live = false;
					if (lit()) d.animate([{ '--lit': 0 }, { '--lit': 1 }], { duration: 650, easing: 'ease-in-out' }); }, function () {});
			}, function () { done(); });
		}
		function carried(on) {
			if (!win || !lit()) return; win.style.setProperty('--ldpw-band', band()); win.classList.toggle('is-lit-carried', on);
			if (on) { makeGlow(); glow.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: 'ease-out' }); }
			else if (glow && !glow.hidden && !win.classList.contains('has-door-light')) { var g = glow, a = g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: 'ease-in', fill: 'forwards' }); a.finished.then(function () { g.hidden = true; a.cancel(); }, function () {}); }
		}
		return { can: can, open: openIt, close: closeIt, carried: carried, live: function () { return live; }, lit: lit, band: band };
	}());
	var primed = false, primeT = 0;
	function primeSoon() { clearTimeout(primeT); primeT = setTimeout(function () { (window.requestIdleCallback || function (f) { return setTimeout(f, 50); })(function () { prime(); }, { timeout: 2000 }); }, 1000); }
	function prime() {
		if (open || primed || !host || leaving) return; 
		ensureWin(); asking = false; phoneList = true; editing = null; menu = null; cmd = null;
		render(); primed = true;
		win.classList.add('is-primed'); win.hidden = false; place(); 
	}
	function show(from) {
		door = from || door;
		ensureWin();
		showNow();
		if (!RD() && !TRY() && St() && St().loadVersions) St().loadVersions().then(function () { if (open) render(); });
	}
	var sheetH = 'half'; 
	function sheetSize() { if (!win || !phone()) return; if (RD() && sheetH !== 'full') { win.style.removeProperty('height'); return; } win.style.setProperty('height', (sheetH === 'half' ? 52 : 92) + 'dvh'); } 
	var leaving = null;
	function sheetSlides() { return phone() && !!win.animate && prefs.motion !== 'reduced' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
	function sheetStay() { if (!leaving) return; var a = leaving; leaving = null; a.cancel(); win.style.removeProperty('pointer-events'); } 
	function sheetLeave() {
		win.style.pointerEvents = 'none'; 
		var a = leaving = win.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }], { duration: 280, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards' });
		function gone() { if (leaving !== a) return; leaving = null; win.style.removeProperty('pointer-events'); if (!open) { win.hidden = true; sheetSize(); zoomPage(); } a.cancel(); }
		a.finished.then(gone, gone);
	}
	function sheetPull(e) {
		if (!phone() || !e.target.closest || !e.target.closest('.ldpw-bar, .ldpw-shead, .ldpw-grab, .ldpw-rhead') || e.target.closest('button, input, a, label')) return;
		var y0 = e.clientY, t0 = performance.now(), h0 = win.offsetHeight, moved = false;
		try { win.setPointerCapture(e.pointerId); } catch (x) {}
		win.style.transition = 'none';
		function move(ev) { var dy = ev.clientY - y0; if (Math.abs(dy) > 4) moved = true; win.style.setProperty('height', Math.max(120, Math.min(window.innerHeight * .95, h0 - dy)) + 'px'); }
		function up(ev) {
			win.removeEventListener('pointermove', move); win.removeEventListener('pointerup', up); win.removeEventListener('pointercancel', up);
			var dy = ev.clientY - y0, v = dy / Math.max(1, performance.now() - t0), h = win.offsetHeight;
			win.style.transition = 'height .32s cubic-bezier(.2,.8,.2,1)';
			setTimeout(function () { win.style.removeProperty('transition'); }, 340);
			if (!moved) { sheetH = sheetH === 'half' ? 'full' : 'half'; return sheetSize(); } 
			if (v > 0.9 || h < window.innerHeight * .3) { sheetH = 'half'; win.style.removeProperty('transition'); return hide(); } 
			sheetH = v < -0.6 ? 'full' : v > 0.4 ? 'half' : (h > window.innerHeight * .72 ? 'full' : 'half'); sheetSize();
		}
		win.addEventListener('pointermove', move); win.addEventListener('pointerup', up); win.addEventListener('pointercancel', up);
	}
	function ensureWin() {
		if (!win) {
			win = document.createElement('div');
			win.id = 'ldp-window';
			win.setAttribute('role', 'dialog');
			win.setAttribute('aria-labelledby', 'ldpw-title');
			win.hidden = true;
			win.addEventListener('click', onClick);
			win.addEventListener('pointerdown', function (e) { var b = e.target.closest && e.target.closest('.ldpw-tile[data-style], .ldpw-tile[data-rstyle]'); if (b) warmFaces(b.getAttribute('data-style') || b.getAttribute('data-rstyle'), true); }, { passive: true }); 
			win.addEventListener('keydown', onKey);
			win.addEventListener('input', onInput);
			win.addEventListener('change', onChange);
			win.addEventListener('copy', function (e) { if (e.target && e.target.hasAttribute && e.target.hasAttribute('data-hex')) flashCopied(); });
			win.addEventListener('contextmenu', function (e) { var tl = e.target.closest && e.target.closest('[data-style]'); if (!tl) return; e.preventDefault(); menu = 'tile:' + tl.getAttribute('data-style'); render('.ldpw-menu button:not([disabled])'); });
			win.addEventListener('pointerdown', sortDown); 
			win.addEventListener('click', function (e) { if (justSorted) { e.stopPropagation(); e.preventDefault(); } }, true);
			var carry = null, lastDown = { t: 0, what: '' };
			win.addEventListener('pointerdown', function (e) {
				if (phone() || e.button !== 0 || !e.target.closest) return;
				var what = e.target.classList.contains('ldpw-rz') ? 'rz' : (e.target.closest('.ldpw-bar, .ldpw-shead') && !e.target.closest('button, input, a, .ldpw-tip')) ? 'bar' : '';
				if (!what) return;
				var now = Date.now(), dbl = lastDown.what === what && !lastDown.moved && now - lastDown.t < 400 && Math.abs(e.clientX - lastDown.x) < 5 && Math.abs(e.clientY - lastDown.y) < 5;
				lastDown = { t: now, what: what, x: e.clientX, y: e.clientY, moved: false };
				if (dbl) { if (what === 'rz') { prefs.pageW = null; prefs.h = null; } else { prefs.x = null; prefs.y = null; } savePrefs(); place(); lastDown = { t: 0, what: '' }; return; }
				var r = win.getBoundingClientRect();
				carry = what === 'rz' ? { kind: 'rz', dir: e.target.getAttribute('data-dir'), x0: e.clientX, y0: e.clientY, r0: r } : { kind: 'move', dx: e.clientX - r.left, dy: e.clientY - r.top };
				e.preventDefault(); win.setPointerCapture(e.pointerId); win.classList.add('is-carried'); if (carry.kind === 'move') morph.carried(true);
			});
			win.addEventListener('pointermove', function (e) {
				if (!carry) return;
				if (Math.abs(e.clientX - lastDown.x) > 3 || Math.abs(e.clientY - lastDown.y) > 3) lastDown.moved = true;
				if (carry.kind === 'move') { prefs.x = Math.round(e.clientX - carry.dx); prefs.y = Math.round(e.clientY - carry.dy); place(); return; }
				var d = carry.dir, r0 = carry.r0, dx = e.clientX - carry.x0, dy = e.clientY - carry.y0, bar = document.getElementById('wpadminbar');
				var roof = 8 + (bar ? Math.max(0, bar.getBoundingClientRect().bottom) : 0), sideW = prefs.noSide || RD() ? 0 : Math.max(150, Math.min(260, +prefs.sideW || 200));
				var w = r0.width, h = r0.height, left = r0.left, top = r0.top;
				if (d.indexOf('e') > -1) w = r0.width + dx;
				if (d.indexOf('w') > -1) w = r0.width - dx;
				if (d.indexOf('s') > -1) h = r0.height + dy;
				if (d.indexOf('n') > -1) h = r0.height - dy;
				w = Math.max(sideW + 400, Math.min(window.innerWidth - 16, w)); h = Math.max(320, Math.min(window.innerHeight - roof - 8, h));
				if (d.indexOf('w') > -1) left = r0.right - w;
				if (d.indexOf('n') > -1) { top = Math.max(roof, r0.bottom - h); h = r0.bottom - top; }
				prefs.pageW = Math.round(w - sideW); prefs.h = Math.round(h); prefs.x = Math.round(left); prefs.y = Math.round(top); place();
			});
			var drop = function () { if (!carry) return; if (carry.kind === 'move') morph.carried(false); carry = null; win.classList.remove('is-carried'); savePrefs(); };
			win.addEventListener('pointerup', drop); win.addEventListener('pointercancel', drop);
			win.addEventListener('pointerdown', function (e) {
				if (!e.target.hasAttribute || !e.target.hasAttribute('data-grip')) return;
				e.preventDefault(); var left = win.getBoundingClientRect().left, total = win.getBoundingClientRect().width, g = e.target, gone = false; g.setPointerCapture(e.pointerId); g.classList.add('is-on'); win.classList.add('is-siding'); 
				var mv = function (ev) {
					if (gone) return;
					var want = ev.clientX - left;
					if (want < 110) { gone = true; up(); prefs.pageW = Math.round(total - (+prefs.sideW || 200)); sideToggle(); return; }
					prefs.sideW = Math.max(150, Math.min(260, total - 400, Math.round(want))); prefs.pageW = Math.round(total - prefs.sideW);
					win.style.setProperty('--ldpw-sidew', prefs.sideW + 'px'); place();
				};
				var up = function () { g.removeEventListener('pointermove', mv); g.removeEventListener('pointerup', up); g.classList.remove('is-on'); win.classList.remove('is-siding'); savePrefs(); };
				g.addEventListener('pointermove', mv); g.addEventListener('pointerup', up);
			});
			win.addEventListener('dblclick', function (e) {
				if (e.target.hasAttribute && e.target.hasAttribute('data-grip')) { var tw = win.getBoundingClientRect().width; prefs.sideW = 200; prefs.pageW = Math.max(400, Math.round(tw - 200)); savePrefs(); place(); return; } 
				var el = e.target; if (!el.matches || !el.matches('input[type="range"]')) return;
				var k = el.getAttribute('data-stop') || el.getAttribute('data-level'), tick = el.parentNode && el.parentNode.querySelector('i.is-def');
				if (!k || !tick) return;
				var at = Math.round((parseFloat(tick.style.getPropertyValue('--f')) || 0) * (+el.max || 0)); 
				if (!(at >= 0)) return;
				el.value = String(at); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true }));
			});
			win.addEventListener('pointerdown', sheetPull);
			win.addEventListener('pointerover', function (e) { var r = e.target.closest && e.target.closest('.ldpw-r[data-mark]'); if (r) marksShow(r.getAttribute('data-mark')); else marksHide(); });
			win.addEventListener('pointerleave', marksHide);
			win.addEventListener('pointerdown', function (e) { if (e.target.matches && e.target.matches('input[type="range"]')) holding = true; });
			win.addEventListener('focusout', function () { setTimeout(function () { if (open && dirty && !holding) render(); }, 0); });
			document.body.appendChild(win);
			if (St() && St().watch) St().watch(changed);
		}
	}
	var lapped = false;
	function lap() {
		if (lapped || !open || !win || win.hidden || !morph.lit() || prefs.motion === 'reduced' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		lapped = true;
		var r = win.getBoundingClientRect(), l = document.createElement('div');
		l.className = 'ldpw-lap'; l.setAttribute('aria-hidden', 'true');
		Object.assign(l.style, { left: (r.left - 24) + 'px', top: (r.top - 24) + 'px', width: (r.width + 48) + 'px', height: (r.height + 48) + 'px' });
		l.style.setProperty('--r', getComputedStyle(win).borderTopLeftRadius); l.style.setProperty('--ldpw-band', morph.band());
		l.innerHTML = '<span><i></i></span><i></i>'; document.body.appendChild(l);
		var run = l.animate([{ '--ldpw-lap': '180deg', opacity: 0 }, { opacity: 1, offset: 0.12 }, { opacity: 1, offset: 0.78 }, { '--ldpw-lap': '560deg', opacity: 0 }], { duration: 1300, easing: 'cubic-bezier(.65, 0, .35, 1)', fill: 'forwards' });
		run.finished.then(function () { l.remove(); }, function () { l.remove(); });
	}
	function showNow() {
		var ready = primed; primed = false; win.classList.remove('is-primed');
		if (!ready) { asking = false; phoneList = true; editing = null; menu = null; }
		open = true; sound('open');
		sheetStay(); win.hidden = false; zoomPage();
		if (ready) { var f0 = win.querySelector('.ldpw-nav.is-on, .ldpw-nav'); if (f0) f0.focus({ preventScroll: true, focusVisible: false }); }  else render('.ldpw-nav.is-on, .ldpw-nav');
		place();
		var morphs = morph.can(); if (morphs) morph.open(); 
		setTimeout(lap, morphs ? 420 : 160); 
		setTimeout(function () { (window.requestIdleCallback || function (f) { return setTimeout(f, 50); })(warmShown, { timeout: 1000 }); }, morphs ? 420 : 160); 
		if (door && door.setAttribute) door.setAttribute('aria-expanded', 'true');
	}
	function hide(keepFocus) {
		marksHide();
		if (!win || !open) return;
		var lp = document.querySelector('body > .ldpw-lap'); if (lp) lp.remove();
		sound('close');
		open = false; asking = false; menu = null; cmd = null; 
		if (St() && St().previewing()) { St().previewVersion(null); verSel = 'now'; }
		if (St() && !RD() && !TRY()) St().keepVersion(); 
		setTimeout(function () { (window.requestIdleCallback || function (f) { return setTimeout(f, 50); })(function () { prime(); }); }, 700); 
		if (morph.can() && morph.live()) morph.close(function () { if (!open) { win.hidden = true; zoomPage(); } }); else { if (door && door.style) { door.style.visibility = ''; door.style.opacity = ''; } if (sheetSlides()) sheetLeave(); else { win.hidden = true; sheetSize(); zoomPage(); } } 
		if (door && door.setAttribute) { door.setAttribute('aria-expanded', 'false'); if (!keepFocus && door.focus) door.focus({ preventScroll: true }); }
		Array.prototype.forEach.call(document.querySelectorAll('[data-reading-panel-open][aria-expanded="true"]'), function (d) { d.setAttribute('aria-expanded', 'false'); });
	}
	document.addEventListener('pointerup', function () { if (!holding) return; holding = false; if (open && dirty) { settleUntil = Date.now() + 200; render(); } }); 
	
	function goBack() {
		var to;
		if (editing) { to = '[data-edit="' + editing + '"], [data-menu]'; editing = null; }
		else if (showChanges) { to = '[data-menu="barmore"]'; showChanges = false; }
		else if (showVersions) { to = '[data-menu="barmore"]'; showVersions = false; }
		else if (fontFor) { to = '[data-font="' + fontFor + '"]'; fontFor = null; fontq = ''; }
		else if (role) { to = '[data-role="' + role + '"]'; role = null; more = false; }
		render(to);
	}
	var ownTimer = 0;
	function setHex(hex, fromSlider) {
		if (!isHex(hex) || !editing) return;
		if (editing === 'door.own') { 
			hex = hex.toLowerCase(); var b = St().button(); if (b) b.own = hex;
			Array.prototype.forEach.call(document.querySelectorAll('.architrave-panel-opener[data-color="own"]'), function (d) { d.style.setProperty('--opener-own', hex); });
			clearTimeout(ownTimer); ownTimer = setTimeout(function () { St().setButton('own', hex).catch(function () {}); }, 350);
			paintEditor(hex, fromSlider); return;
		}
		St().setColour(editKey(editing), hex.toLowerCase()); paintEditor(hex.toLowerCase(), fromSlider);
	}
	function onClick(e) {
		var b0 = e.target.closest && e.target.closest('button'), anim = !!(b0 && win.contains(b0) && !b0.disabled && open && (b0.getAttribute('role') === 'switch' || b0.hasAttribute('data-seg')));
		try { pressed(e); } finally {
			if (anim && b0.isConnected && settleUntil > Date.now()) {
				if (b0.getAttribute('role') === 'switch') b0.setAttribute('aria-checked', b0.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
				else { var sg = b0.parentNode, all = [].slice.call(sg.querySelectorAll('[data-seg]')); sg.style.setProperty('--i', all.indexOf(b0)); all.forEach(function (x) { x.classList.toggle('is-on', x === b0); x.setAttribute('aria-checked', String(x === b0)); }); }
			} else if (anim) settleUntil = 0;
		}
	}
	function pressed(e) {
		e.stopPropagation();
		if (cmd && e.target.hasAttribute && e.target.hasAttribute('data-cmdveil')) { cmd = null; render(); return; }
		var b = e.target.closest('button');
		if (menu && !(e.target.closest && e.target.closest('.ldpw-menu')) && (!b || !b.hasAttribute('data-pick')) && !(b && b.getAttribute('data-menu') === menu)) { menu = null; if (!b) { render(); return; } }
		if (!b || !win.contains(b) || b.disabled) return;
		var s = St(), act = b.getAttribute('data-act');
		if (RD()) { sound('tap'); if (act === 'close') hide(); else readerClick(b); return; }
		if (b.getAttribute('role') === 'switch') sound(b.getAttribute('aria-checked') === 'true' ? 'off' : 'on'); else sound('tap');
		if ((act === 'undo' || act === 'commit') && s && s.previewing()) { s.previewVersion(null); verSel = 'now'; }
		if (act === 'close') { hide(); return; }
		if (act === 'find') { openCmd(); return; }
		if (b.hasAttribute('data-fontget')) {
			var fid = b.getAttribute('data-fontget');
			if (fontGet[fid] === 'got') { s.setType(fontFor, 'font', fid); render(); return; } 
			fontGet[fid] = 'busy'; render('[data-f="fontget:' + fid + '"]');
			s.fonts.get(fid).then(function () { fontGet[fid] = 'got'; render('[data-f="fontget:' + fid + '"]'); }, function () { delete fontGet[fid]; done(t('Could not get the font. Try again.')); render(); });
			return;
		}
		if (act === 'fontprune') {
			asking = { title: t('Remove unused fonts?'), text: t('The downloaded fonts no style uses are removed. You can get them again from the library.'), go: t('Remove'), danger: true, back: '[data-act="fontprune"]', run: function () {
				var keep = []; roles().forEach(function (r) { var f = realFace((s.type(r.id) || {}).font); if (f) keep.push(f); });
				return s.fonts.prune(keep).then(function (j) { fontGet = {}; var n = (j.removed || []).length; done(n ? t('{n} fonts removed').replace('{n}', n) : t('Nothing to remove')); });
			} };
			render('[data-act="ask-go"]'); return;
		}
		if (b.hasAttribute('data-fold')) { var fg = b.getAttribute('data-fold'); prefs.fold = prefs.fold || {}; prefs.fold[fg] = !prefs.fold[fg]; savePrefs(); render('[data-fold="' + fg + '"]'); return; }
		if (act === 'sqclear') { sq = null; render('[data-sideq]'); return; }
		if (b.hasAttribute('data-sqhit')) { goTo(sqResults()[+b.getAttribute('data-sqhit')]); return; }
		if (act === 'share') { askShare(); return; }
		if (act === 'settings' && !TRY()) { section = 'settings'; role = null; fontFor = null; editing = null; showChanges = false; showVersions = false; phoneList = false; render('.ldpw-nav.is-on'); return; }
		if (act === 'revertpage') { var sp = St(); pagePaths(current().id).forEach(function (pth) { sp.revertPath(pth); }); done(t('Reverted')); render('.ldpw-nav.is-on'); return; }
		if (b.hasAttribute('data-onpage')) { var first = onPage(b.getAttribute('data-onpage'))[0]; if (first) { marksHide(); first.scrollIntoView({ block: 'center', behavior: 'smooth' }); if (first.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) first.animate([{ outline: '2px solid #0a84ff', outlineOffset: '3px' }, { outline: '2px solid transparent', outlineOffset: '3px' }], { duration: 900, delay: 300, easing: 'ease-out' }); } return; }
		if (act === 'asreader') { window.open(window.location.origin + window.location.pathname + '?ldp-as-reader=1', '_blank'); return; }
		if (b.hasAttribute('data-plink')) {
			var pl = b.getAttribute('data-plink').split(':'), url = s.previewURL(pl[1]);
			if (pl[0] === 'copy') { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).catch(function () {}); done(t('Link Copied')); render(); }
			if (pl[0] === 'open') window.open(url, '_blank', 'noopener');
			if (pl[0] === 'stop') s.stopPreview(pl[1]).then(function (l) { previewsHeld = l || []; done(t('Link stopped. It no longer works.')); render('[data-act="share"]'); }, failed);
			return;
		}
		if (act === 'side') { sideToggle(); return; }
		if (act === 'keys') { showKeys(); return; }
		if (act === 'tipoff') { prefs.seenAim = true; savePrefs(); render('[data-act="aim"]'); return; }
		if (b.hasAttribute('data-pref')) { var pk = b.getAttribute('data-pref'); if (pk === 'motion') prefs.motion = prefs.motion === 'reduced' ? 'full' : 'reduced'; else prefs[pk] = !prefs[pk]; savePrefs(); render('[data-pref="' + pk + '"]'); return; }
		if (b.hasAttribute('data-accent')) { prefs.accent = b.getAttribute('data-accent'); savePrefs(); render('[data-accent="' + prefs.accent + '"]'); return; }
		if (b.hasAttribute('data-band')) { var bd = b.getAttribute('data-band'); btnWrite(s.setButton('band', bd), '[data-band="' + bd + '"]'); return; }
		if (act === 'aim') { if (!prefs.seenAim) { prefs.seenAim = true; savePrefs(); render(); } aimSet(!aiming); return; }
		if (act === 'ask') { asking = true; render('x'); return; }
		if (act === 'cancel') { var back2 = asking && asking.back; asking = false; render(back2 || '[data-act="ask"]'); return; }
		if (act === 'ask-go') { askGo(); return; }
		if (act === 'commit') { commitPress(); return; }
		if (act === 'list') { phoneList = true; editing = null; render('.ldpw-nav'); return; }
		if (act === 'back') { goBack(); return; }
		if (act === 'revert-all') { askRevertAll(); render(); return; }
		if (act === 'more') { more = !more; render('[data-act="more"]'); return; }
		if (act === 'fxg') { var fg = b.getAttribute('data-g'); fxOpen[fg] = !fxOpen[fg]; render('[data-g="' + fg + '"]'); return; }
		if (act === 'undo') { s.undo(); render('[data-act="undo"]'); return; }
		if (act === 'copy') { s.makeCopy(); render(); return; }
		if (act === 'pipette') { new window.EyeDropper().open().then(function (r) { setHex(r.sRGBHex.length === 7 ? r.sRGBHex : '#000000'); render(); }, function () {}); return; }
		if (act === 'goback') {
			var err = win.querySelector('.ldpw-err');
			win.querySelectorAll('.ldpw-sheet button').forEach(function (x) { x.disabled = true; });
			Promise.resolve(host.setChoice('current')).then(function () { hide(); }, function () {
				if (err) err.hidden = false;
				win.querySelectorAll('.ldpw-sheet button').forEach(function (x) { x.disabled = false; });
			});
			return;
		}
		if (act === 'current') { var id = b.getAttribute('data-sec'); hide(true); host.openCurrent(id); return; }
		if (b.hasAttribute('data-seg')) {
			var sg = b.getAttribute('data-seg'), v = b.getAttribute('data-v');
			if (sg === 'view') { s.setView(v); viewWant = v; setTimeout(function () { viewWant = null; if (open) render(); }, 600); }  else if (sg === 'custom') {  if (v === 'on') customView = s.current(); else { customView = null; if (s.custom()) s.setCustom(false); } }
			else if (sg === 'who') { btnWrite(s.setButton('who', v), '[data-seg="who"][data-v="' + v + '"]'); return; }
			else if (sg === 'bsize') { btnWrite(s.setButton('size', v), '[data-seg="bsize"][data-v="' + v + '"]'); return; }
			else if (sg === 'plook') { prefs.look = v; savePrefs(); }
			else if (sg === 'align') s.setType(role, 'align', v);
			render('[data-seg="' + sg + '"][data-v="' + v + '"]'); return;
		}
		if (b.hasAttribute('data-set')) {
			var k = b.getAttribute('data-set');
			s.set(k, !s.get(k));
			render(); return;
		}
		if (b.hasAttribute('data-menu')) { var mk = b.getAttribute('data-menu'); menu = menu === mk ? null : mk; render(menu ? (mk === 'secs' ? '[data-menuq]' : '.ldpw-menu [aria-checked="true"]') : null); return; }
		if (b.hasAttribute('data-pick')) {
			var p = b.getAttribute('data-pick'), mk2 = p.slice(0, p.indexOf('|')), m2 = MENU[mk2], was = editing; menu = null;
			if (m2) m2.pick(p.slice(p.indexOf('|') + 1));
			render(editing && editing !== was ? '.ldpw-scroll [data-f="hex"]' : '[data-menu="' + mk2 + '"]'); return;
		}
		if (b.hasAttribute('data-look')) { var lk = b.getAttribute('data-look'), lv = b.getAttribute('data-v'); if (PAIR[lk]) setPair(lk, lv); else s.set(lk, lv); render('[data-look="' + lk + '"][data-v="' + lv + '"]'); return; }
		if (b.hasAttribute('data-hit')) { pickCmd(+b.getAttribute('data-hit')); return; }
		if (b.hasAttribute('data-ver')) { pickVersion(b.getAttribute('data-ver')); return; }
		if (b.hasAttribute('data-restore')) { restoreVersion(b.getAttribute('data-restore')); return; }
		if (b.hasAttribute('data-revert')) { s.revertPath(b.getAttribute('data-revert')); render('.ldpw-scroll [data-revert], [data-act="back"]'); return; }
		if (b.hasAttribute('data-goto')) { section = b.getAttribute('data-goto'); showChanges = false; showVersions = false; role = null; fontFor = null; render('.ldpw-nav.is-on'); return; }
		if (b.hasAttribute('data-bset')) { var bk = b.getAttribute('data-bset'); btnWrite(s.setButton(bk, b.getAttribute('aria-checked') !== 'true'), '[data-bset="' + bk + '"]'); return; }
		if (b.hasAttribute('data-spot')) {
			var sp = b.getAttribute('data-spot'), md = win.querySelector('.ldpw-minidoor');
			if (md) md.setAttribute('data-at', sp);
			[].forEach.call(win.querySelectorAll('[data-spot]'), function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-checked', String(on)); });
			settleUntil = Date.now() + 380;
			prefs.x = null; prefs.y = null; savePrefs();
			var wr = s.setButton('place', sp);
			requestAnimationFrame(function () {
				var ease = 'cubic-bezier(.3, 1.2, .5, 1)';
				win.style.transition = 'left .35s ' + ease + ', top .35s ' + ease + ', height .35s ' + ease;
				place(); setTimeout(function () { win.style.transition = ''; }, 400);
			});
			btnWrite(wr, '[data-spot="' + sp + '"]'); return;
		}
		if (b.hasAttribute('data-copyon')) { btnWrite(s.setReadersCopy(b.getAttribute('aria-checked') !== 'true'), '[data-copyon]'); return; }
		if (b.hasAttribute('data-style')) { s.choose(b.getAttribute('data-style')); render('[data-style="' + b.getAttribute('data-style') + '"]'); return; }
		if (b.hasAttribute('data-role')) { role = b.getAttribute('data-role'); more = false; render('[data-act="back"]'); return; }
		if (b.hasAttribute('data-font')) { fontFor = b.getAttribute('data-font'); fontq = ''; render('.ldpw-scroll [aria-checked="true"]'); return; }
		if (b.hasAttribute('data-face')) { s.setType(fontFor, 'font', b.getAttribute('data-face')); render(); return; }
		if (b.hasAttribute('data-catown')) { var cv = s.type(role); s.setType(role, 'categorySize', cv.categorySize !== 'same' ? 'same' : cv.categoryStep); render('[data-catown]'); return; }
		if (b.hasAttribute('data-rset')) { var d = b.getAttribute('data-rset'); s.setType(role, d, !s.type(role)[d]); render(); return; }
		if (b.hasAttribute('data-preset')) { s.choosePreset(b.getAttribute('data-preset')); render(); return; }
		if (b.hasAttribute('data-edit')) { editing = b.getAttribute('data-edit'); render('[data-act="back"]'); return; }
		if (b.hasAttribute('data-hex-pick')) { setHex(b.getAttribute('data-hex-pick')); render(); return; }
		if (b.hasAttribute('data-hex-copy')) { var hx = win.querySelector('[data-hex]'), hv = hx ? hx.value.trim().toUpperCase() : ''; if (hv && hv[0] !== '#') hv = '#' + hv; if (hv && navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(hv).catch(function () {}); flashCopied(); return; } 
		var sec = b.getAttribute('data-sec');
		if (sec) {
			sq = null; section = sec; phoneList = false; editing = null; role = null; fontFor = null; more = false; showChanges = false; showVersions = false;
			try { sessionStorage.setItem(KEY, sec); } catch (x) {  }
			render(phone() ? '[data-act="list"]' : '.ldpw-nav.is-on');
		}
	}
	function onInput(e) {
		var el = e.target, s = St();
		if (el.hasAttribute && el.hasAttribute('data-menuq')) {
			var keepMenu = menu; if (!menuIndex) menuIndex = buildIndex(); menu = keepMenu;
			menuQ = el.value; render('[data-menuq]');
			var mq = win.querySelector('[data-menuq]'); if (mq) { var nq = mq.value.length; mq.setSelectionRange(nq, nq); }
			return;
		}
		if (el.hasAttribute && el.hasAttribute('data-sideq')) {
			if (!sq) sq = { q: '', index: buildIndex() };
			sq.q = el.value; render('[data-sideq]');
			var f = win.querySelector('[data-sideq]'); if (f) { var n = f.value.length; f.setSelectionRange(n, n); }
			return;
		}
		if (el.type === 'range') { var tk = el.getAttribute('data-stop') || el.getAttribute('data-level') || el.getAttribute('data-hsl') || ''; if (lastTick[tk] !== el.value) { lastTick[tk] = el.value; sound('tick'); } }
		if (el.hasAttribute('data-level')) {
			var key = el.getAttribute('data-level'), steps = (setting(key) || {}).steps || [], v = steps[+el.value], unit = el.getAttribute('data-unit') || '';
			if (v === undefined) return;
			s.set(key, v);
			el.style.setProperty('--p', (steps.length > 1 ? +el.value / (steps.length - 1) * 100 : 0) + '%');
			el.setAttribute('aria-valuetext', v + unit);
			var out = win.querySelector('[data-val="' + key + '"]'); if (out) out.textContent = v + unit;
			return;
		}
		if (el.hasAttribute('data-cmdq')) { cmd.q = el.value; cmd.sel = 0; paintCmd(); return; }
		if (el.hasAttribute('data-stop')) {
			var sk = el.getAttribute('data-stop'), st = STOP[sk], x = st && st.stops[+el.value];
			if (!x) return;
			st.set(x.id);
			el.style.setProperty('--p', (st.stops.length > 1 ? +el.value / (st.stops.length - 1) * 100 : 0) + '%');
			el.setAttribute('aria-valuetext', x.label);
			var o2 = win.querySelector('[data-val="' + sk + '"]'); if (o2) o2.textContent = x.label;
			return;
		}
		if (el.hasAttribute('data-fontq')) { fontq = el.value; render(); var f = win.querySelector('[data-fontq]'); if (f) f.setSelectionRange(fontq.length, fontq.length); return; }
		if (el.hasAttribute('data-hsl')) {
			var get = function (k) { var x = win.querySelector('[data-hsl="' + k + '"]'); return x ? +x.value : 0; };
			var hex = hslToHex(get('h'), get('s'), get('l'));
			var lv = win.querySelector('[data-hsl-val="' + el.getAttribute('data-hsl') + '"]'); if (lv) lv.textContent = el.value + (el.getAttribute('data-hsl') === 'h' ? '°' : '%');
			setHex(hex, true);
			return;
		}
		if (el.hasAttribute('data-hex')) { var h = el.value.trim(); if (h[0] !== '#') h = '#' + h; if (isHex(h)) setHex(h); return; }
		if (el.hasAttribute('data-hex-other')) { setHex(el.value); }
	}
	function onChange(e) {
		if (e.target.hasAttribute('data-blabel')) { btnWrite(St().setButton('label', e.target.value.trim().slice(0, 30))); return; }
		if (e.target.matches('input[type="range"], [data-hex-other]')) { holding = false; render(); }
	}
	function onKey(e) {
		if (e.key === 'Tab') {
			var modal = win.querySelector('.ldpw-sheet, .ldpw-cmdk');
			if (modal) {
				var f = [].slice.call(modal.querySelectorAll('button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(function (x) { return x.getClientRects().length; });
				if (!f.length) { e.preventDefault(); return; }
				var at = f.indexOf(document.activeElement);
				if (e.shiftKey && at <= 0) { e.preventDefault(); f[f.length - 1].focus(); return; }
				if (!e.shiftKey && (at === -1 || at === f.length - 1)) { e.preventDefault(); f[0].focus(); return; }
			}
		}
		if (cmd) {
			if (/^Arrow(Down|Up)$/.test(e.key)) { e.preventDefault(); var n = cmdResults().length; if (n) { cmd.sel = (cmd.sel + (e.key === 'ArrowDown' ? 1 : n - 1)) % n; paintCmd(); } return; }
			if (e.key === 'Enter') { e.preventDefault(); pickCmd(cmd.sel); return; }
			if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cmd = null; render(); return; }
		}
		var b = e.target;
		if (b.hasAttribute && b.hasAttribute('data-seg') && /^Arrow(Left|Right)$/.test(e.key)) {
			var all = [].slice.call(b.parentNode.querySelectorAll('[data-seg]')), i = all.indexOf(b) + (e.key === 'ArrowRight' ? 1 : -1);
			if (all[i]) { e.preventDefault(); all[i].click(); }
			return;
		}
		if (e.key === 'Enter' && b.hasAttribute && b.hasAttribute('data-hex')) { render(); return; }
		if (e.key === 'Enter' && b.id === 'ldpw-ask-field') { e.preventDefault(); askGo(); return; }
		if (e.key === 'Escape' && b.hasAttribute && b.hasAttribute('data-sideq') && sq) { e.stopPropagation(); sq = null; render('[data-sideq]'); return; }
		if (e.key !== 'Escape') return;
		e.stopPropagation();
		if (menu) { var m = menu; menu = null; render('[data-menu="' + m + '"]'); return; }
		if (asking) { var back3 = asking.back; asking = false; render(back3 || '[data-act="ask"]'); return; }
		if (editing || showChanges || showVersions || fontFor || role) { goBack(); return; }
		hide();
	}
	document.addEventListener('keydown', function (e) { if (!open || e.key !== 'Escape' || win.contains(e.target)) return; if (menu) { var m = menu; menu = null; render('[data-menu="' + m + '"]'); return; } hide(); }); 
	document.addEventListener('keydown', function (e) {
		var a = document.activeElement, typing = a && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && a.type !== 'range';
		if (!open || RD() || typing || asking || cmd || !(e.metaKey || e.ctrlKey) || e.altKey || (e.key !== 'z' && e.key !== 'Z')) return; 
		var s = St(); if (!s) return;
		if (e.shiftKey) { if (!s.canRedo || !s.canRedo()) return; e.preventDefault(); s.redo(); render('[data-act="undo"]'); return; } 
		if (!s.canUndo()) return;
		e.preventDefault(); s.undo(); render('[data-act="undo"]');
	});
	document.addEventListener('keydown', function (e) {
		if (!open || RD() || !St()) return;
		if ((e.metaKey || e.ctrlKey) && e.altKey && e.code === 'KeyC') { e.preventDefault(); copyStyle(); return; }
		if ((e.metaKey || e.ctrlKey) && e.altKey && e.code === 'KeyV') { e.preventDefault(); askPaste(); return; }
		if (e.metaKey && e.ctrlKey && e.code === 'KeyS') { e.preventDefault(); sideToggle(); }
	});
	document.addEventListener('keydown', function (e) {
		if (!open || RD() || !(e.metaKey || e.ctrlKey) || e.altKey) return;
		if (e.shiftKey && e.key !== '+') return; 
		if (e.key === 'f' || e.key === 'F') { e.preventDefault(); if (!cmd) openCmd(); return; }
		if (e.key === '=' || e.key === '+') { e.preventDefault(); zoomBy('bigger'); return; }
		if (e.key === '-') { e.preventDefault(); zoomBy('smaller'); return; }
		if (e.key === '0') { e.preventDefault(); zoomBy('actual'); return; }
		if (e.key === ',' && !TRY()) { e.preventDefault(); sq = null; cmd = null; section = 'settings'; role = null; fontFor = null; editing = null; showChanges = false; showVersions = false; phoneList = false; render('.ldpw-nav.is-on'); }
	});
	document.addEventListener('keydown', function (e) {
		var a = document.activeElement, typing = a && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && a.type !== 'range';
		if (!open || RD() || typing || e.key !== '?' || asking || cmd) return;
		e.preventDefault(); showKeys();
	});
	document.addEventListener('keydown', function (e) { if (open && !RD() && (e.metaKey || e.ctrlKey) && !e.altKey && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); if (cmd) { cmd = null; render(); } else openCmd(); } });
	
	function inTransition(t) { var r = document.documentElement; if (t !== r) return false; try { return r.matches(':active-view-transition'); } catch (x) { return true;  } }
	var pressedIn = false;
	document.addEventListener('pointerdown', function (e) { pressedIn = !!(win && win.contains(e.target)); }, true);
	document.addEventListener('click', function (e) {
		var inside = pressedIn; pressedIn = false;
		if (open && e.isTrusted && !inside && e.target.isConnected && !win.contains(e.target) && !inTransition(e.target) && !(e.target.closest && e.target.closest('[data-reading-panel-open]'))) hide(true);
	});
	window.addEventListener('resize', function () { if (open) { render(); place(); } });
	window.LiveDesignWindow = {
		mount: function (h) {
			host = h; doorLook();
			Array.prototype.forEach.call(document.querySelectorAll('[data-reading-panel-open]'), function (d) { ['pointerenter', 'pointerdown', 'focus'].forEach(function (ev) { d.addEventListener(ev, prime, { passive: true }); }); });
			(window.requestIdleCallback || function (f) { return setTimeout(f, 1500); })(function () { prime(); }, { timeout: 4000 });
		},
		takes: function (from) {
			if (!host || host.choice() !== 'new') return false;
			if (open) hide(); else show(from);
			return true;
		},
		open: function (from) { if (host) show(from); },
		close: function () { hide(); },
		isOpen: function () { return open; },
		sound: function (kind) { if (kind === 'snap') sound(kind); }
	};
}());
