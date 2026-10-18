/**
 * Architrave — the reading scale.
 *
 * Three steps, picked by the reader from the More menu, held in localStorage
 * and written to <html> as `data-reading`. The stylesheets do the rest:
 * quire.reading.css carries the SIZES (DS-257) and style.css carries this
 * site's own anatomy at each step — the row, the action square, the corner.
 *
 * THE STEPS COME FROM THE SYSTEM'S REGISTRY, never from a list typed here.
 * This file carried its own three for exactly one afternoon, which was the
 * honest arrangement while the design system did not name them — and it is the
 * arrangement DS-219 exists to end. The same lesson the mode picker learned
 * the expensive way: a retyped list goes stale in silence, and the day a
 * fourth step is registered nothing renders wrong, the step just is not there.
 *
 * THE SHAPE IS THE COLOUR MODE'S, on purpose. Same storage-then-attribute
 * model, same menu grammar, same `.is-selected` plus check to say which is on,
 * same delegated click. A reader who has used one control has used the other.
 *
 * WHY IT DOES NOT USE QuireReading.apply(). The registry's `default` is the
 * step that needs no attribute, which is Comfortable, because Comfortable is
 * what the system's `:root` says. THIS SITE'S default is a different step, so
 * apply()'s helpfulness — clearing the attribute for the registry default —
 * would be exactly wrong here: it would leave the reading sizes on Comfortable
 * while style.css's `:root` anatomy stayed on Default, a 20px body beside a
 * 36px row. The attribute is therefore always written, and the server writes
 * the same one on arrival (architrave_reading_attribute in functions.php).
 * resolve() and the step list are still the registry's, which is the part that
 * actually matters.
 */
(function () {
	var root = document.documentElement;
	var KEY = 'architrave-reading';
	var WORDS = window.architraveWords || {};
	function t(word) { return WORDS[word] || word; }
	var Reading = window.QuireReading;
	if (!Reading) return;
	var SITE_DEFAULT = Reading.ids.indexOf('default') !== -1
		? 'default'
		: Reading.default;
	function apply(step) {
		root.setAttribute(Reading.attribute, Reading.resolve(step));
	}
	var raw = null;
	try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }
	var initial = Reading.ids.indexOf(raw) !== -1 ? raw : SITE_DEFAULT;
	
	var printed = root.getAttribute(Reading.attribute);
	if (Reading.ids.indexOf(raw) !== -1 || !printed || Reading.ids.indexOf(printed) === -1) apply(initial);
	else initial = printed;
	document.addEventListener('DOMContentLoaded', function () {
		var CHECK = window.QuireIcons
			? window.QuireIcons.markup('check', 'class="quire-menu-check"')
			: '';
		
		document.querySelectorAll('[data-quire-reading]').forEach(function (host) {
			host.innerHTML = Reading.steps.map(function (s) {
				return '<li><button type="button" class="quire-menu-item" role="menuitemradio" ' +
					'aria-checked="false" data-reading-step="' + s.id + '">' +
					'<span class="quire-menu-label">' + (s.site || s.own ? s.label : t(s.label)) + '</span>' + CHECK + '</button></li>';
			}).join('');
		});
		function mark(step) {
			document.querySelectorAll('[data-reading-step]').forEach(function (b) {
				var on = b.getAttribute('data-reading-step') === step;
				b.classList.toggle('is-selected', on);
				b.setAttribute('aria-checked', on ? 'true' : 'false');
			});
		}
		mark(initial);
		
		document.addEventListener('click', function (e) {
			var row = e.target.closest('[data-reading-step]');
			if (!row) return;
			var step = row.getAttribute('data-reading-step');
			if (Reading.ids.indexOf(step) === -1) return;
			apply(step);
			try { localStorage.setItem(KEY, step); } catch (err) {}
			mark(step);
		});
	});
})();
