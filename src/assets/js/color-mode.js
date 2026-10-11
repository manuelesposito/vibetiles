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
	// The reader's language, where the site has one for the word (functions.php,
	// architrave_settings_words). Names pass through untouched.
	var WORDS = window.architraveWords || {};
	function t(word) { return WORDS[word] || word; }
	/* THE PAIRS' NAMES, ONCE (2026-09-12, the audit: the rail said Terminal
	   and Paper where Anpassen said Schwarzweiß and Warmes Papier, and Grey
	   went untranslated). The registry's ids, the site's words, through the
	   translations; reading-panel.js reads this same map. */
	/* NAMED FOR THEIR COLOUR (Manuel, 2026-09-16: "make all 20 names distinctive
	   and colour related and inspired by the artist Mœbius"). The five rooms
	   were named for what they were made of — Neutral, Warm paper, Black &
	   white, Grey — which said nothing about the colour a reader would get, and
	   two of them said the same word as a setting elsewhere in the panel. They
	   take pigments now, the ones a French bande-dessinée page is painted with,
	   and the fifteen presets beside them take the rest of that box.

	   NAMED FOR HIS WORLD, NOT FOR A PAINT BOX (Manuel, 2026-09-16: "no, I
	   meant Mœbius-inspired names"). Pigments were colours and nothing else.
	   These are the places those colours belong to — a place and the light in it — his deserts, moons and horizons, and never one of his
	   titles, because this theme's code names no outside work. The ids do not
	   move: what a reader has chosen stays chosen. */
	var PAIR_LABELS = { neutral: 'Violet light', paper: 'Sun clay', terminal: 'Radar night', grey: 'Ash blue', arcade: 'Night fire' }; /* Newsprint went with the Zeitung style (2026-09-15) */
	function pairLabel(p) { return t(PAIR_LABELS[p.id] || p.label); }
	window.ArchitravePairLabels = PAIR_LABELS;

	function paletteOf(id) {
		for (var i = 0; i < Modes.palettes.length; i++) {
			if (Modes.palettes[i].id === id) return Modes.palettes[i];
		}
		return null;
	}

	/* THE REGISTRY SAYS WHICH SIDES EXIST; THIS SAYS WHAT ORDER THEY READ IN
	   (2026-08-10, lab/index.html). Those are two different questions and only
	   the first belongs upstream — the registry lists light, auto, dark, which
	   is the order of the thing itself, lightest to darkest with the follower in
	   the middle. On the control the follower goes FIRST: it is the default, it
	   is what most readers will leave it on, and a default buried between two
	   choices reads as a third choice.

	   Written as a filter OVER the registry rather than as a list, so it keeps
	   both guarantees the registry was made for: a side this release does not
	   know never appears, and a side added upstream appears anyway — at the end,
	   unordered, which is visible and fixable rather than silently missing. */
	var SIDE_ORDER = ['auto', 'light', 'dark'];

	/* AND WHAT THEY ARE CALLED, where the id is not the answer. "Auto" says the
	   control decides and stops there; the reader's real question is what it
	   decides FROM, and the answer is the machine they are reading on. One word,
	   not two — beside Light and Dark, two words where the others have one is
	   the odd option before it is anything else. */
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

	/* AND THE SAME SPLIT FOR THE PALETTES. The control reads in the registry's
	   own order — Neutral first, where the system started, down to Persona,
	   the high-contrast room (DS-283). Persona stood first here, as this
	   site's default, from 2026-08-10 to 2026-08-12; the site starts in
	   Neutral now, so a first visit here reads the same room a first visit
	   reads everywhere else the registry drives.

	   The filter stays even while it names nothing: the registry still decides
	   which palettes exist and this only decides what order they read in. */
	var PALETTE_ORDER = [];

	/* THE ROOMS BEING TUNED (Manuel, 2026-09-07 evening): every colour mode
	   is being made right one at a time, on the lab's sheets, and until a
	   room is done it is not shown. Nothing is deleted: the registry keeps
	   all of them, this list says which ones the menu offers. A stored
	   choice of a hidden room falls back to the first shown one. Add a room
	   here when it is finished. */
	// Paper joined 2026-09-09 (1.1.647), with the Book style that reads in it.
	var SHOWN = ['neutral', 'paper', 'terminal', 'grey', 'arcade']; /* terminal: the Terminal tile's own colours (2026-09-10); grey: Poster's (2026-09-12); arcade (2026-09-15, Manuel: "I can't click Arcade"): the settings panel listed it, but its row presses this list's button, and the list had none */
	/* ALONE, THE THEME IS THE NEUTRAL ROOM (Manuel, 2026-09-21, the panel's
	   move to a plugin: "Standard only"). The coloured rooms are the styles'
	   own and come with the Vibetiles plugin; functions.php says
	   whether it runs (window.architravePanelActive, printed before this
	   file). A room a reader chose earlier is kept in storage and returns
	   with the plugin; meanwhile the first room, neutral, is worn. */
	if (window.architravePanelActive === false) SHOWN = ['neutral'];

	/* The backstage door (`?backstage`, 2026-09-09 to 2026-09-25) is gone: it
	   was the working door to rooms still being tuned, and the plugin offers
	   every room now. A room stored through it falls back to the first shown
	   one, as any hidden room always has. */

	function palettesInOrder() {
		return PALETTE_ORDER.map(paletteOf).filter(Boolean).concat(
			Modes.palettes.filter(function (p) {
				return PALETTE_ORDER.indexOf(p.id) === -1;
			})
		).filter(function (p) { return SHOWN.indexOf(p.id) !== -1; });
	}

	/* A VISITOR ARRIVING FROM THE OLD THEME KEEPS THEIR CHOICE.
	   Any browser that saw this site before today holds a single mode id —
	   'oat', or 'night', or one of the ten. The registry resolves retired ids
	   to their successor, so the palette comes back from that; the side comes
	   from the mode it resolved to, which is the honest reading of a choice
	   made when there was no side to choose. Read once and rewritten in the new
	   shape, so this runs for one visit and never again. */
	/* Storage may be blocked (the audit, 2026-09-13): read and write through a guard, as every sibling script does. */
	function stored(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
	function store(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode: the page is still right */ } }
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

	/* THE DEFAULT IS THE FIRST THING ON THE CONTROL, and it is written that way
	   rather than as the word "persona" — a default typed twice is a default
	   that can disagree with itself, and the one thing a reader arriving with no
	   stored choice must not see is a list whose top row is not the room they
	   are in. Same for the side: the follower, which is `SIDE_ORDER`'s first
	   entry for the same reason.

	   A STORED CHOICE STILL WINS. Anyone who has already picked a palette on
	   this site keeps it — the default is what a first visit gets, not what
	   every visit gets, so this change is invisible to a browser that has been
	   here before. */
	var state = {
		palette: paletteOf(storedPalette) && SHOWN.indexOf(storedPalette) !== -1 ? storedPalette : palettesInOrder()[0].id,
		/* A FIRST VISIT FOLLOWS THE SYSTEM AGAIN (Manuel, 2026-10-11: "The standard or the default should be auto for readers in the Vibetiles panel, not light or dark mode... I think right now it's dark. Set it to auto"). 1.3.269 had made it dark on his word of 2026-09-19; this takes that back. The side is the reader's and not a style's, so one default covers every tile: System, the control's first entry. A stored choice still wins. */
		/* ON SOMEBODY ELSE'S THEME A FIRST VISIT IS ON THAT THEME'S SIDE (0.11.47, Manuel on Ollie, 2026-09-24: the page was white and the panel on it dark). The plugin prints the side the theme is on; Architrave prints nothing and follows the system. */
		side: Modes.sides.indexOf(storedSide) !== -1 ? storedSide : (window.architravePanelHostSide && Modes.sides.indexOf(window.architravePanelHostSide) !== -1 ? window.architravePanelHostSide : (Modes.sides.indexOf('auto') !== -1 ? 'auto' : sidesInOrder()[0]))
	};

	/* FOLLOW, DON'T JUST APPLY. A page that only applies once is right when it
	   loads and wrong when the sun goes down. `follow` returns its own
	   unsubscriber, so switching away from Auto stops the listener rather than
	   stacking a second one on the next change. */
	/* THE BROWSER'S FRAME FOLLOWS THE ROOM (2026-09-09). functions.php
	   prints Neutral's two canvases as theme-color for the first paint; from
	   here on the meta says whatever the applied room's canvas is, read from
	   the page after every change of `data-theme`. Watched on the attribute
	   rather than written in paint(), because the system flipping at dusk
	   goes through Modes.follow and never comes back through here. Once a
	   room is painted the media on the two metas is dropped: the page, not
	   the system, says which side it is on. */
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
		setTimeout(go, 250); /* a hidden tab draws no frames */
	}
	if (window.MutationObserver) {
		/* ON THE NEXT FRAME (2026-10-02): read straight away, the colour made the browser restyle the whole page in the
		   middle of a change of look, 70 to 140 ms on elmastudio.de; a frame later the page is restyled once anyway. */
		new MutationObserver(tellSoon).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
	}

	var unfollow = function () {};
	function paint() {
		unfollow();
		unfollow = Modes.follow(state.palette, state.side, root);
		/* Tell the browser which side we are on, so scrollbars, form controls
		   and the caret follow the page instead of the OS. */
		var applied = Modes.resolve(state.palette, state.side);
		for (var i = 0; i < Modes.modes.length; i++) {
			if (Modes.modes[i].id === applied) root.style.colorScheme = Modes.modes[i].scheme;
		}
		tellSoon();
		return applied;
	}

	var initial = paint();

	// The More menu. It pops ABOVE its trigger, so it closes on Escape with focus
	// returning to the trigger, and on a click outside — the same dismissal
	// contract every floating surface in the system has (DS-125/DS-127).
	document.addEventListener('DOMContentLoaded', function () {
		var trigger = document.querySelector('.rail-more-trigger');
		var menu = document.getElementById('rail-more-menu');
		if (trigger && menu) {
			// The menu is a block group now, not a hand-written <ul>, because its
			// links have to be editable. A group cannot carry `hidden` through
			// the editor, so open is an attribute and the stylesheet does the
			// hiding — which is also how the phone's panel works.
			var isOpen = function () { return menu.hasAttribute('data-open'); };
			var setOpen = function (open) {
				if (open) menu.setAttribute('data-open', '');
				else menu.removeAttribute('data-open');
				trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
			};
			// TWO BRANCHES NOW (Mode and Language, 2026-08-03), so the wiring
			// is per-branch: each button's flyout is its next sibling in the
			// markup, and opening one closes the other — a cascade shows one
			// arm at a time.
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
			/* HOW THE TWO LEVELS OPEN, and they are deliberately not the same.

			   The ROOT waits for a dwell before opening on hover. It sits at the
			   foot of the rail, which the pointer crosses on its way to
			   somewhere else — without the wait the menu flies open every time
			   you pass it. It also opens on click, immediately, for anyone who
			   has already decided.

			   A BRANCH opens on hover with no wait at all. By then the menu is
			   open and the pointer is inside it: there is no ambiguity left
			   about intent, and a delay there just feels slow.

			   Both are the lab's behaviour. The theme opened neither on hover,
			   so the two levels answered differently from each other AND from
			   the design. */
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

			/* CLICK ONLY (Manuel, 2026-09-14: "it opens up but it doesn't close,
			   it just opens until I click somewhere"): the hover dwell is gone.
			   No menu on the Mac opens by pointing at it; the pill is pressed,
			   and a press outside or Escape closes it. The dwell's helpers stay
			   for the branches' sake. */

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
			/* A leaf closes any open branch, so the flyout does not hang over
			   rows it has nothing to do with — but a row INSIDE a flyout is
			   not a leaf of the menu, it is the branch's own content.
			
			   Without that exclusion the language rows closed the flyout they
			   live in: reach for "Deutsch" and it vanishes under the pointer,
			   so the switcher could not be used at all (2026-08-03). The
			   colour rows never showed it because the registry builds them
			   AFTER this runs, so they were never bound — the same fault was
			   there all along, hidden by the order two things happened in. */
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
			/* THE SETTINGS TITLE SHUTS THE FLYOUT (2026-09-07, the group folds
			   now). Folding with a flyout standing open would leave the flyout
			   clipped away but still open, to jump back at the next unfold. A
			   fold head is a leaf for the pointer and for the press alike, since
			   a keyboard reaches it without ever hovering. */
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
				// Escape closes one level at a time — the branch first, then the
				// menu — so it never throws away more than you asked it to.
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

		/* THE CONTROLS ARE BUILT, NOT TYPED.
		   A menu row and a segment are the same choice on two surfaces, so both
		   are generated from the registry — one list, and a mode added to the
		   system appears in the rail and on the phone without anyone editing
		   markup. Every place that typed its own list was wrong within a day of
		   the registry existing. */
		// The drawing comes from the system's registry (QDS DS-228), never from
		// a string here. This one was pasted in three files before the registry
		// existed, and a pasted drawing cannot be told from a correct one.
		var CHECK = window.QuireIcons
			? window.QuireIcons.markup('check', 'class="quire-menu-check"')
			: '';

		/* THE PALETTE FLYOUT: a side segment, a seam, and the rooms (DS-273).

		   The segment goes on TOP because it is the coarser choice and the one
		   a reader changes most — and because every row below it re-tints to
		   preview the side you are on, so the control that changes the list
		   sits above the list it changes.

		   The swatch is the argument. "A palette has two sides" is a claim the
		   words cannot make on their own; flipping the segment and watching all
		   five rooms re-tint at once makes it obvious without a sentence. */
		/* `is-narrow` (2026-08-10): the side control takes the language
		   switch's proportions — same 4px groove, same 2px seam, same 28px
		   option, and the hairline drawn INSIDE so a control asked for at 36
		   arrives at 36 rather than 38. The two controls in this menu become one
		   control at two heights, differing in the height of the option and in
		   nothing else. */
		/* AND BOTH HALVES SAY THEIR OWN NAME (2026-08-12). The flyout held
		   two controls and named neither: a track of three words and a list of
		   six rooms, and a reader had to work out from the words themselves
		   that the first was a side and the second a palette. The row that
		   opens it is called Appearance now, which is the pair of them — so
		   these two titles are what the row stopped saying when it stopped
		   naming half of its own flyout. They are the menu's own section head,
		   the same object "Settings" and "Language" wear behind this. */
		function sectionHead(id, label) {
			return '<div class="quire-nav-section-head rail-more-controls-head">' +
				'<h2 class="quire-nav-section-heading" id="' + id + '">' + label + '</h2>' +
				'</div>';
		}

		function sideSegment(n) {
			var id = 'quire-modes-side-title' + (n ? '-' + n : ''); /* one id per host: the rail and the phone menu both render this (the audit, 2026-09-13) */
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
			/* One room shown: no list to choose from, so no Colour section. */
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

		/* THE RULE COMES BACK, AND THE TITLES ARE WHY (2026-08-12). It was
		   taken out on 2026-08-10 with a good argument: DS-154 says a rule marks
		   a change of KIND, and the side and the palette were not two kinds —
		   they were two halves of one answer, which room and which side of it
		   you stand in. So the line announced a beginning where nothing began,
		   and it went.

		   What has changed is that the two halves now have names. A title says
		   "a thing starts here" out loud, and once two of them are stacked in
		   one surface the rule is no longer making that claim on its own — it
		   draws the boundary the titles already declare, which is the seam's job
		   everywhere else in this menu. Same class as the seams behind it, so
		   all three are one line saying one thing. */
		document.querySelectorAll('[data-quire-modes="palette"]').forEach(function (host, i) {
			host.innerHTML = sideSegment(i) + paletteRows(i);
		});

		/* THE "switch" AND "rows" SHAPES ARE GONE (DS-273), and both were
		   answers to a question that no longer exists: how to fit eight, then
		   ten, whole mode names into one control. The panel's flat rows were
		   built the day the registry crossed four and a segmented row stopped
		   holding the names.

		   Palette-and-side dissolves it. There are five rooms, which fits a
		   list, and three sides, which fits a segment — so both surfaces render
		   the same two controls and neither needs a shape of its own. They also
		   emitted `data-mode` buttons, and nothing binds those any more, so
		   leaving them would have shipped two pickers that render and do
		   nothing. */

		// Two components still say "this is the current one" in two ways — a menu
		// row is `.is-selected` (DS-154) and a segment is `.is-active` — but the
		// two halves of the choice are now different controls rather than one
		// list rendered twice, so each is marked where it is painted, in
		// paintControls(), instead of through a shared guess at which it is.

		/* THE BRANCH ROW SAYS WHICH MODE IS ON.
		   The archive's filter triggers already work this way — they read
		   "Notes, Tutorials" rather than "All categories" — and a row that opens
		   a list of choices should be able to tell you which one is in force
		   without being opened. It is the settings-row convention: label, then
		   the value, then the chevron.

		   The label comes from the registry, so it is the same string the row in
		   the submenu carries and cannot drift from it. Filled here rather than
		   in PHP because the mode is a per-visitor choice held in localStorage —
		   the server does not know it, and rendering a guess would mean the row
		   said one thing until the script corrected it.

		   NOT marked with `data-quire-modes`. That attribute means "a container
		   a consumer fills with a PICKER" (DS-223) and its value names the shape
		   — "menu", "switch". This is a read-only value, so wearing the picker
		   marker made the conformance sweep count it as a third picker offering
		   none of the eight modes and marking nothing chosen. The check was
		   right; the attribute was wrong. */
		/* The row names the CHOICE, not the result: the palette, then the side
		   as the reader set it — "Auto", never the side auto happened to land
		   on, or the control would look as though it had changed by itself. */
		function showCurrent() {
			var p = paletteOf(state.palette);
			/* The side's own word: System, not a capitalised id (the audit, 2026-09-13). */
			var side = sideLabel(state.side);
			document.querySelectorAll('.rail-more-value').forEach(function (slot) {
				slot.textContent = p ? pairLabel(p) + ' · ' + side : '';
			});
		}

		/* EVERY ROW PREVIEWS THE SIDE YOU ARE ON, as a MINIATURE OF THE MODE
		   rather than a paint chip (2026-08-06).

		   A dot showing the canvas could not do the job and it was not a bad
		   cut: a canvas good enough to read on is near-white in every light
		   palette, so five rooms drew five dots 22 apart out of 441. The room
		   is legible as soon as three roles are shown together — ground, the
		   ink on it, and the edge — which is why the registry now ships all
		   three (DS-219). Letters rather than a shape, because what a colour
		   mode is FOR is reading. */
		function entryFor(paletteId) {
			var id = Modes.resolve(paletteId, state.side);
			for (var i = 0; i < Modes.modes.length; i++) {
				if (Modes.modes[i].id === id) return Modes.modes[i];
			}
			return null;
		}

		/* THE SELECTION IS ONE OBJECT AND IT MOVES. A background cannot travel
		   from one box to another, so the selected surface is lifted out of the
		   buttons into a chip that slides. Seated from script because only the
		   layout knows where the active segment actually is — and instantly on
		   first paint, or the chip would glide in from the left edge on load,
		   animating a choice the reader made on their last visit.

		   A panel that is `hidden` measures zero, so a seat attempted while the
		   flyout is shut does nothing and is re-run when it opens. */
		/* AND MEASURED IN REAL PIXELS, NOT WHOLE ONES (2026-08-12). This read
		   `offsetLeft` and `offsetWidth`, which are integers — and the options
		   stopped being integers the day the track became a grid: three equal
		   columns of 221.3 are 69.766 each, so the third starts at 147.531 and
		   the chip was seated at 148 and 70. Two thirds of a pixel, one and a
		   half device pixels on a retina screen: the chip ended 3.3 from the
		   track's edge where its own option ended at 4, and its hairline
		   crowded the track's own.

		   `left` is measured from the containing block's PADDING box and a rect
		   from the border box, so the border comes off — 0 on this track today,
		   and stated rather than assumed. */
		function seatChip(instant) {
			document.querySelectorAll('[data-sides]').forEach(function (track) {
				var chip = track.querySelector('.chip');
				var on = track.querySelector('button.is-active');
				if (!chip || !on || !on.offsetWidth) return;
				var box = on.getBoundingClientRect();
				var frame = track.getBoundingClientRect();
				var edge = getComputedStyle(track);
				/* AND THE PANEL IS STILL GROWING WHILE WE MEASURE. A rect is
				   what is ON SCREEN and carries every transform above it, and
				   this seat runs as the menu opens, mid-scale — measured at
				   0.96. The old integer reading was immune because layout
				   offsets ignore transforms. `getComputedStyle` gives the
				   LAYOUT size, transform-free and still fractional, so the
				   ratio of the two is exactly the scale the rects came through.
				   The track states `box-sizing: border-box`, so that size is
				   the border box the rect also describes. */
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

		/* SCOPED FOR THE SAME REASON THE HANDLER IS. A bare `[data-side]` here
		   was writing `.is-active` and `aria-pressed` onto every tooltip in the
		   theme — invisible, because a tooltip has no styling for either, and
		   wrong in the accessibility tree, which is where invisible faults
		   live. One selector, two places, one collision. */
		var PICKER = '[data-quire-modes="palette"] ';

		function paintControls(instant) {
			document.querySelectorAll(PICKER + '[data-side]').forEach(function (btn) {
				var on = btn.getAttribute('data-side') === state.side;
				btn.classList.toggle('is-active', on);
				btn.setAttribute('aria-pressed', on ? 'true' : 'false');
			});
			/* inside a change of look, on the next frame (2026-10-02): measured here, the chip made the browser restyle the
			   whole page in the middle of the change, which the look's own fade hides anyway */
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
						/* The edge is the picker's, not the palette's (2026-09-06):
						   once Persona drew its rules in ink its chip stood in a
						   black frame among six quiet ones and read as a fault.
						   Ground and ink still name the room. */
					}
				}
			});
			showCurrent();
		}

		paintControls(true);

		/* AND SEATED AGAIN WHEN THE SURFACE OPENS. Both pickers live inside a
		   `hidden` flyout on load, and a hidden box measures zero — so the seat
		   above finds `offsetWidth` 0 and correctly does nothing, which would
		   leave the chip a zero-width sliver the first time the menu is opened.
		   Caught by measuring the rendered control rather than by looking: the
		   segment was visibly right in every other respect.

		   Watching `hidden` rather than listening for a click, because three
		   different controls open these two surfaces (the rail's branch row,
		   the phone's Mode button, and Escape closing back out) and a listener
		   per opener is a listener to forget. Instant, because a chip that
		   glides in from the left edge on first open animates a choice the
		   reader made on their last visit. */
		var watcher = new MutationObserver(function (records) {
			for (var i = 0; i < records.length; i++) {
				if (!records[i].target.hidden) { seatChip(true); return; }
			}
		});
		document.querySelectorAll('[data-quire-modes="palette"]').forEach(function (host) {
			watcher.observe(host, { attributes: true, attributeFilter: ['hidden'] });
		});

		// A resize re-lays the segment out, so the chip has to follow it.
		window.addEventListener('resize', function () { seatChip(true); });

		/* THE LANGUAGE PAIR'S CHECK MOVES (2026-08-03). Visual only, like the
		   lab's mock: DS-199 says a language is a LINK on the shipped site —
		   the multilingual plugin supplies the real destinations there, and
		   this handler steps aside the day those rows arrive as anchors.
		   DELEGATED, because the mobile pair lives in a summoned panel. */
		document.addEventListener('click', function (e) {
			var row = e.target.closest(
				'[aria-label="Language"] [role="menuitemradio"]'
			);
			if (!row) return;
			row.closest('ul').querySelectorAll('[role="menuitemradio"]').forEach(function (r) {
				r.classList.toggle('is-selected', r === row);
				r.setAttribute('aria-checked', r === row ? 'true' : 'false');
			});
			// The menu stays, like the mode flyout: the check moving in front
			// of you is the proof of the choice.
		});

		/* DELEGATED, and one handler for both halves of the choice — the rail's
		   flyout and the phone's panel are the same two controls on two
		   surfaces, and the panel's copy is summoned after this runs. */
		document.addEventListener('click', function (e) {
			/* SCOPED TO THE PICKER, AND `data-side` IS WHY (2026-08-06).

			   The first cut matched a bare `[data-side]`, and the system
			   already owns that attribute: `.quire-tooltip[data-side="top"]`
			   places a tooltip's bubble, and this theme puts a tooltip on the
			   site title, every rail row, the post-section controls and the
			   code block's fold and copy. So clicking the site title matched,
			   handed "left" to the resolver, and `palette.sides["left"]` fell
			   back to the light side — the mode changed under a reader who had
			   touched nothing to do with colour. Reported from the phone twice
			   before it was found, which is what an attribute collision looks
			   like: not a broken control, a control firing somewhere else.

			   Two guards, because either alone would have prevented it and the
			   pair says what is meant: the selector is scoped to a registered
			   picker, and the VALUE is checked against the registry before it
			   is used. A side this release does not know is not a side. */
			var host = e.target.closest('[data-quire-modes="palette"]');
			if (!host) return;
			var sideBtn = e.target.closest('[data-side]');
			var paletteBtn = e.target.closest('[data-palette]');
			if (sideBtn && Modes.sides.indexOf(sideBtn.getAttribute('data-side')) === -1) sideBtn = null;
			if (paletteBtn && !paletteOf(paletteBtn.getAttribute('data-palette'))) paletteBtn = null;
			if (!sideBtn && !paletteBtn) return;

			/* The palette CROSS-FADES rather than cutting (2026-08-05). One
			   snapshot of the old colours dissolving into the new, so nothing
			   passes through a colour nobody chose — the duration and the
			   easing are in style.css, which is where the argument for them
			   lives.

			   Everything that changes goes inside the callback, including the
			   marks and the branch row's value: the transition captures the
			   page as it is when it starts, so a mark updated outside it would
			   jump while the colours were still dissolving. */
			function swap() {
				if (sideBtn) state.side = sideBtn.getAttribute('data-side');
				else state.palette = paletteBtn.getAttribute('data-palette');
				store(PALETTE_KEY, state.palette);
				store(SIDE_KEY, state.side);
				paint();
				paintControls();
			}
			/* A hidden document cannot start a transition (Chrome: "aborted because
			   of invalid state") and the swap inside it never ran, so a press made
			   from a background tab, or by a script while the tab was away, left
			   the old pair on (measured 2026-09-14). The cross-fade is for eyes
			   that are on the page; without them, the swap runs plain. */
			/* ONE FADE FOR A CHANGE OF LOOK (2026-10-02): a style that is put on presses the palette from inside its own
			   cross-fade (presets.js, apply), and a second transition started there cancelled the first and photographed
			   the page again. The look's fade carries the colours; the swap simply happens inside it. */
			if (document.startViewTransition && document.visibilityState === 'visible' && !window.architraveRestyling) {
				/* a transition a newer one replaces is skipped, which is no fault: its promises are caught (2026-09-27, Versions shows two looks in quick turn) */
				try { var vt = document.startViewTransition(swap); [vt.ready, vt.finished, vt.updateCallbackDone].forEach(function (p) { if (p && p.catch) p.catch(function () {}); }); } catch (e) { swap(); }
			} else swap();
		});

		/* THE WHOLE-MODE WIRING IS GONE (DS-273). It bound one click to one
		   `data-mode` id and wrote `quire-theme`; nothing in this theme renders
		   a whole mode id any more, and the key it wrote is now only READ, once,
		   to carry an old visitor's choice across. Left in, it would have been a
		   second writer of a preference the new pair owns — the exact shape of
		   bug the registry exists to prevent, one level up. */
		void initial;
	});
})();
