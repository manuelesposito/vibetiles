/**
 * Architrave — the line spacing.
 *
 * Three steps, picked by the reader from the More menu, held in localStorage
 * and written to <html> as `data-leading`. The stylesheet does the rest: the
 * article's lines stand `--text-reading-body-line-height` apart, and
 * `:root[data-leading="…"]` restates that one token, and the lead's, per step.
 *
 * THE SHAPE IS THE READING FACE'S, on purpose, which is the reading scale's,
 * which is the colour mode's. Same storage-then-attribute model, same menu
 * grammar, same `.is-selected` plus check, same delegated click. A reader who
 * has used one control has used all four.
 *
 * THE STEPS ARE THIS THEME'S. The system's reading registry (DS-257) names
 * sizes, not distances; how far apart THIS site's lines may stand is the
 * site's own decision, so the list lives here like the faces do.
 *
 * DEFAULT NEEDS NO ATTRIBUTE. 1.6 is what `:root` already says, so the
 * resting state is the absence of a choice, and a reader with no JavaScript
 * reads exactly what they always did. The other two are stamped before first
 * paint for the same reason the size and the face are: a distance that
 * arrives late reflows every line on the page.
 */
(function () {
	var root = document.documentElement;
	var KEY = 'architrave-leading';
	var ATTR = 'data-leading';
	var DEFAULT = 'default';
	var WORDS = window.architraveWords || {};
	function t(word) { return WORDS[word] || word; }
	
	var STEPS = [
		{ id: 'dense', label: 'Tight' },
		{ id: 'tight', label: 'Snug' },
		{ id: 'default', label: 'Normal' },
		{ id: 'airy', label: 'Relaxed' },
		{ id: 'wide', label: 'Loose' }
	];
	var NEAR = { solid: 'dense', packed: 'dense', close: 'dense', densest: 'dense', snug: 'default', relaxed: 'airy', wider: 'airy', open: 'wide', loose: 'wide', loosest: 'wide' };
	var ids = STEPS.map(function (s) { return s.id; });
	function apply(step) {
		if (step === DEFAULT) root.removeAttribute(ATTR);
		else root.setAttribute(ATTR, step);
	}
	var raw = null;
	try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }
	if (NEAR[raw]) { raw = NEAR[raw]; try { if (raw === DEFAULT) localStorage.removeItem(KEY); else localStorage.setItem(KEY, raw); } catch (e) {} }
	var initial = ids.indexOf(raw) !== -1 ? raw : DEFAULT;
	
	if (ids.indexOf(raw) !== -1 || !root.hasAttribute(ATTR)) apply(initial);
	else initial = ids.indexOf(root.getAttribute(ATTR)) !== -1 ? root.getAttribute(ATTR) : initial;
	document.addEventListener('DOMContentLoaded', function () {
		var CHECK = window.QuireIcons
			? window.QuireIcons.markup('check', 'class="quire-menu-check"')
			: '';
		document.querySelectorAll('[data-architrave-leading]').forEach(function (host) {
			host.innerHTML = STEPS.map(function (s) {
				return '<li><button type="button" class="quire-menu-item" role="menuitemradio" ' +
					'aria-checked="false" data-leading-step="' + s.id + '">' +
					'<span class="quire-menu-label">' + (s.site || s.own ? s.label : t(s.label)) + '</span>' + CHECK + '</button></li>';
			}).join('');
		});
		function mark(step) {
			document.querySelectorAll('[data-leading-step]').forEach(function (b) {
				var on = b.getAttribute('data-leading-step') === step;
				b.classList.toggle('is-selected', on);
				b.setAttribute('aria-checked', on ? 'true' : 'false');
			});
		}
		mark(initial);
		document.addEventListener('click', function (e) {
			var row = e.target.closest('[data-leading-step]');
			if (!row) return;
			var step = row.getAttribute('data-leading-step');
			if (ids.indexOf(step) === -1) return;
			apply(step);
			try { if (step === DEFAULT) localStorage.removeItem(KEY); else localStorage.setItem(KEY, step); } catch (err) {}
			mark(step);
		});
	});
})();
