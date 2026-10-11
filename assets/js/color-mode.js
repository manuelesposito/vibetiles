(function () {
	var root = document.documentElement;

	// The modes come from the system's registry (QDS DS-219), never from a list
	// typed here. This file used to carry ['day','night','oat'] and the rail and
	// the panel each typed the same three into their markup — so the day the
	// system registered Moss and Clay, three places in this theme were wrong and
	// nobody would have noticed until someone counted. The registry also knows
	// how to resolve a retired id: 'truffle' was valid here once, and any
	// browser that saw the old theme still holds one in storage.
	var Modes = window.QuireModes;
	if (!Modes) return;

	/* THE CHOICE IS TWO THINGS NOW (DS-273): a PALETTE and a SIDE.

	   It used to be one mode id, and "follow the system" was not a choice at
	   all — it was what happened when nobody had chosen, and it stopped the
	   moment they did. So a reader on a dark Mac who wanted Dune had to pick
	   dune-dark and then keep picking it, and their laptop going light in the
	   morning meant nothing. Auto is the third position, not the absence of
	   one: the palette says which room, the side says light, dark, or ask the
	   system.

	   Both are stored, separately, because "auto" cannot be recovered from a
	   resolved id — dune-light is what auto looked like at noon, and reading it
	   back at midnight would silently demote the choice to Light forever. */
	var PALETTE_KEY = 'quire-palette';
	var SIDE_KEY = 'quire-side';
	var WORDS = window.architraveWords || {};
	function t(word) { return WORDS[word] || word; }
	
	var PAIR_LABELS = { neutral: 'Violet light', paper: 'Sun clay', terminal: 'Radar night', grey: 'Ash blue', arcade: 'Night fire' }; 
	function pairLabel(p) { return t(PAIR_LABELS[p.id] || p.label); }
	window.ArchitravePairLabels = PAIR_LABELS;
	function paletteOf(id) {
		for (var i = 0; i < Modes.palettes.length; i++) {
			if (Modes.palettes[i].id === id) return Modes.palettes[i];
		}
		return null;
	}
	
	var SIDE_ORDER = ['auto', 'light', 'dark'];
	
	var SIDE_LABEL = { auto: 'System' };
	function sidesInOrder() {
		return SIDE_ORDER.filter(function (s) {
			return Modes.sides.indexOf(s) !== -1;
		}).concat(
			Modes.sides.filter(function (s) {
				return SIDE_ORDER.indexOf(s) === -1;
			})
		);
	}
	function sideLabel(s) {
		return t(SIDE_LABEL[s] || s.charAt(0).toUpperCase() + s.slice(1));
	}
	
	var PALETTE_ORDER = [];
	
	var SHOWN = ['neutral', 'paper', 'terminal', 'grey', 'arcade']; 
	if (window.architravePanelActive === false) SHOWN = ['neutral'];
	
	function palettesInOrder() {
		return PALETTE_ORDER.map(paletteOf).filter(Boolean).concat(
			Modes.palettes.filter(function (p) {
				return PALETTE_ORDER.indexOf(p.id) === -1;
			})
		).filter(function (p) { return SHOWN.indexOf(p.id) !== -1; });
	}
	
	function stored(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
	function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {  } }
	var storedPalette = stored(PALETTE_KEY);
	var storedSide = stored(SIDE_KEY);
	if (!storedPalette) {
		var old = stored('quire-theme') || stored('colorMode');
		if (old) {
			var resolved = Modes.resolve(old);
			var entry = null;
			for (var k = 0; k < Modes.modes.length; k++) {
				if (Modes.modes[k].id === resolved) entry = Modes.modes[k];
			}
			if (entry) {
				storedPalette = entry.palette;
				storedSide = entry.side;
			}
		}
	}
	
	var state = {
		palette: paletteOf(storedPalette) && SHOWN.indexOf(storedPalette) !== -1 ? storedPalette : palettesInOrder()[0].id,
		
		side: Modes.sides.indexOf(storedSide) !== -1 ? storedSide : (window.architravePanelHostSide && Modes.sides.indexOf(window.architravePanelHostSide) !== -1 ? window.architravePanelHostSide : (Modes.sides.indexOf('auto') !== -1 ? 'auto' : sidesInOrder()[0]))
	};
	
	function tellBrowser() {
		var canvas = getComputedStyle(root).getPropertyValue('--surface-canvas').trim();
		if (!canvas) return;
		var metas = document.querySelectorAll('meta[name="theme-color"]');
		for (var i = 0; i < metas.length; i++) {
			metas[i].removeAttribute('media');
			metas[i].setAttribute('content', canvas);
		}
	}
	var telling = false;
	function tellSoon() {
		if (telling) return;
		telling = true;
		var go = function () { if (!telling) return; telling = false; tellBrowser(); };
		if (window.requestAnimationFrame) window.requestAnimationFrame(go);
		setTimeout(go, 250); 
	}
	if (window.MutationObserver) {
		new MutationObserver(tellSoon).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
	}
	var unfollow = function () {};
	function paint() {
		unfollow();
		unfollow = Modes.follow(state.palette, state.side, root);
		var applied = Modes.resolve(state.palette, state.side);
		for (var i = 0; i < Modes.modes.length; i++) {
			if (Modes.modes[i].id === applied) root.style.colorScheme = Modes.modes[i].scheme;
		}
		tellSoon();
		return applied;
	}
	var initial = paint();
	document.addEventListener('DOMContentLoaded', function () {
		var trigger = document.querySelector('.rail-more-trigger');
		var menu = document.getElementById('rail-more-menu');
		if (trigger && menu) {
			var isOpen = function () { return menu.hasAttribute('data-open'); };
			var setOpen = function (open) {
				if (open) menu.setAttribute('data-open', '');
				else menu.removeAttribute('data-open');
				trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
			};
			var branches = [].slice.call(menu.querySelectorAll('[data-branch]'));
			var subOf = function (b) { return b.nextElementSibling; };
			var setBranch = function (open, one) {
				branches.forEach(function (b) {
					var s = subOf(b);
					if (!s) return;
					var on = open && b === one;
					s.hidden = !on;
					b.setAttribute('aria-expanded', on ? 'true' : 'false');
				});
			};
			var openSub = function () {
				return branches.map(subOf).filter(function (s) {
					return s && !s.hidden;
				})[0] || null;
			};
			var dwell = null;
			var cancelDwell = function () {
				if (dwell !== null) { window.clearTimeout(dwell); dwell = null; }
			};
			var lingerMs = function () {
				var v = parseFloat(
					getComputedStyle(document.documentElement)
						.getPropertyValue('--motion-duration-linger')
				);
				return isNaN(v) ? 180 : v;
			};
			
			branches.forEach(function (b) {
				b.addEventListener('mouseenter', function () {
					setBranch(true, b);
				});
				b.addEventListener('click', function (e) {
					e.stopPropagation();
					var s = subOf(b);
					setBranch(!!s && s.hidden, b);
				});
			});
			menu.querySelectorAll('a, .quire-menu-item:not([data-branch])').forEach(
				function (leaf) {
					if (leaf.closest('.rail-more-sub')) {
						return;
					}
					leaf.addEventListener('mouseenter', function () {
						setBranch(false);
					});
				}
			);
			menu.querySelectorAll('button.quire-nav-section-head').forEach(function (h) {
				h.addEventListener('mouseenter', function () { setBranch(false); });
				h.addEventListener('click', function () { setBranch(false); });
			});
			trigger.addEventListener('click', function (e) {
				e.stopPropagation();
				cancelDwell();
				var open = !isOpen();
				setOpen(open);
				if (!open) setBranch(false);
			});
			document.addEventListener('click', function (e) {
				if (isOpen() && !menu.contains(e.target) && e.target !== trigger) {
					setOpen(false);
					setBranch(false);
				}
			});
			document.addEventListener('keydown', function (e) {
				if (e.key !== 'Escape') return;
				var s = openSub();
				if (s) {
					var owner = branches.filter(function (b) { return subOf(b) === s; })[0];
					setBranch(false);
					if (owner) owner.focus();
					return;
				}
				if (isOpen()) { setOpen(false); trigger.focus(); }
			});
		}
		
		var CHECK = window.QuireIcons
			? window.QuireIcons.markup('check', 'class="quire-menu-check"')
			: '';
		
		
		function sectionHead(id, label) {
			return '<div class="quire-nav-section-head rail-more-controls-head">' +
				'<h2 class="quire-nav-section-heading" id="' + id + '">' + label + '</h2>' +
				'</div>';
		}
		function sideSegment(n) {
			var id = 'quire-modes-side-title' + (n ? '-' + n : ''); 
			return sectionHead(id, t('Mode')) +
				'<div class="side-row">' +
				'<div class="quire-segmented is-narrow" role="group" aria-labelledby="' + id + '" data-sides>' +
				'<span class="chip" aria-hidden="true"></span>' +
				sidesInOrder().map(function (s) {
					return '<button type="button" data-side="' + s + '">' +
						sideLabel(s) + '</button>';
				}).join('') +
				'</div></div>';
		}
		function paletteRows(n) {
			if (palettesInOrder().length < 2) return '';
			var id = 'quire-modes-palette-title' + (n ? '-' + n : '');
			return '<hr class="quire-menu-separator" />' +
				sectionHead(id, t('Colour')) +
				'<ul class="quire-palette-list" role="menu" aria-labelledby="' + id + '">' +
				palettesInOrder().map(function (p) {
					return '<li role="none"><button type="button" class="quire-menu-item" ' +
						'role="menuitemradio" aria-checked="false" data-palette="' + p.id + '">' +
						'<span class="mode-chip" aria-hidden="true">Aa</span>' +
						'<span class="quire-menu-label">' + pairLabel(p) + '</span>' +
						CHECK + '</button></li>';
				}).join('') +
				'</ul>';
		}
		
		document.querySelectorAll('[data-quire-modes="palette"]').forEach(function (host, i) {
			host.innerHTML = sideSegment(i) + paletteRows(i);
		});
		
		
		function showCurrent() {
			var p = paletteOf(state.palette);
			var side = sideLabel(state.side);
			document.querySelectorAll('.rail-more-value').forEach(function (slot) {
				slot.textContent = p ? pairLabel(p) + ' · ' + side : '';
			});
		}
		
		function entryFor(paletteId) {
			var id = Modes.resolve(paletteId, state.side);
			for (var i = 0; i < Modes.modes.length; i++) {
				if (Modes.modes[i].id === id) return Modes.modes[i];
			}
			return null;
		}
		
		function seatChip(instant) {
			document.querySelectorAll('[data-sides]').forEach(function (track) {
				var chip = track.querySelector('.chip');
				var on = track.querySelector('button.is-active');
				if (!chip || !on || !on.offsetWidth) return;
				var box = on.getBoundingClientRect();
				var frame = track.getBoundingClientRect();
				var edge = getComputedStyle(track);
				var sx = frame.width / (parseFloat(edge.width) || frame.width);
				if (!(sx > 0)) sx = 1;
				if (instant) chip.style.transition = 'none';
				chip.style.left =
					(box.left - frame.left) / sx -
					(parseFloat(edge.borderLeftWidth) || 0) +
					'px';
				chip.style.width = box.width / sx + 'px';
				if (instant) {
					void chip.offsetWidth;
					chip.style.transition = '';
				}
			});
		}
		
		var PICKER = '[data-quire-modes="palette"] ';
		function paintControls(instant) {
			document.querySelectorAll(PICKER + '[data-side]').forEach(function (btn) {
				var on = btn.getAttribute('data-side') === state.side;
				btn.classList.toggle('is-active', on);
				btn.setAttribute('aria-pressed', on ? 'true' : 'false');
			});
			if (window.architraveRestyling && window.requestAnimationFrame) window.requestAnimationFrame(function () { seatChip(true); }); else seatChip(instant);
			document.querySelectorAll(PICKER + '[data-palette]').forEach(function (btn) {
				var on = btn.getAttribute('data-palette') === state.palette;
				btn.classList.toggle('is-selected', on);
				btn.setAttribute('aria-checked', on ? 'true' : 'false');
				var sw = btn.querySelector('.mode-chip');
				if (sw) {
					var e = entryFor(btn.getAttribute('data-palette'));
					if (e) {
						sw.style.background = e.swatch;
						sw.style.color = e.swatchInk;
					}
				}
			});
			showCurrent();
		}
		paintControls(true);
		
		var watcher = new MutationObserver(function (records) {
			for (var i = 0; i < records.length; i++) {
				if (!records[i].target.hidden) { seatChip(true); return; }
			}
		});
		document.querySelectorAll('[data-quire-modes="palette"]').forEach(function (host) {
			watcher.observe(host, { attributes: true, attributeFilter: ['hidden'] });
		});
		window.addEventListener('resize', function () { seatChip(true); });
		
		document.addEventListener('click', function (e) {
			var row = e.target.closest(
				'[aria-label="Language"] [role="menuitemradio"]'
			);
			if (!row) return;
			row.closest('ul').querySelectorAll('[role="menuitemradio"]').forEach(function (r) {
				r.classList.toggle('is-selected', r === row);
				r.setAttribute('aria-checked', r === row ? 'true' : 'false');
			});
		});
		
		document.addEventListener('click', function (e) {
			var host = e.target.closest('[data-quire-modes="palette"]');
			if (!host) return;
			var sideBtn = e.target.closest('[data-side]');
			var paletteBtn = e.target.closest('[data-palette]');
			if (sideBtn && Modes.sides.indexOf(sideBtn.getAttribute('data-side')) === -1) sideBtn = null;
			if (paletteBtn && !paletteOf(paletteBtn.getAttribute('data-palette'))) paletteBtn = null;
			if (!sideBtn && !paletteBtn) return;
			
			function swap() {
				if (sideBtn) state.side = sideBtn.getAttribute('data-side');
				else state.palette = paletteBtn.getAttribute('data-palette');
				store(PALETTE_KEY, state.palette);
				store(SIDE_KEY, state.side);
				paint();
				paintControls();
			}
			
			if (document.startViewTransition && document.visibilityState === 'visible' && !window.architraveRestyling) {
				try { var vt = document.startViewTransition(swap); [vt.ready, vt.finished, vt.updateCallbackDone].forEach(function (p) { if (p && p.catch) p.catch(function () {}); }); } catch (e) { swap(); }
			} else swap();
		});
		
		void initial;
	});
})();
