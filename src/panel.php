<?php
/**
 * Vibetiles: everything the plugin does. Read by live-design-panel.php once it
 * has made sure no older copy of the plugin is running (see there for why this is a
 * file of its own).
 *
 * @package Vibetiles
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WHAT THE PANEL SAYS (0.6.0, theme 1.3.319): its words left the theme's list
 * for words.php here and join it again through the theme's filter. The panel
 * speaks English only (2026-10-05). On a theme that still has the words itself
 * (1.3.318 and older) the filter is never asked.
 */
require_once plugin_dir_path( ARCHITRAVE_PANEL_FILE ) . 'words.php';

/* Translations from translate.wordpress.org's packs load by themselves (WordPress 4.6+).
   No load_plugin_textdomain(), as wordpress.org's review asked. */

/**
 * WHERE THE PANEL HAS LANDED (0.8.0). Three answers, because "no constant" was
 * being read as one thing and means two:
 *
 *   host   an Architrave that hands the panel over. The theme says what it
 *          offers with a number, ARCHITRAVE_PANEL_HOST: 2 = the focus mode is
 *          the theme's own file (focus-mode.js, which presets.js hands over to)
 *          and the theme loads no panel script itself; 3 = the shipped
 *          style.css is the theme's half only.
 *   old    an Architrave from before the split. It still carries its own whole
 *          panel, so the plugin stands back and says nothing.
 *   guest  any other theme. Until 0.8.0 this fell in with `old` and the plugin
 *          did nothing at all: measured on stock Twenty Twenty-Five, not one
 *          file was served and nothing appeared on the page. Now the plugin
 *          brings what the theme used to lend it - the scripts the panel needs,
 *          its stylesheet, the values it draws itself with, and a button to
 *          open it, because there is no rail for one to sit in.
 *
 * Asked late: the theme is not loaded when plugins are.
 * `architrave_asset_version()` is the tell for an Architrave of any age; it has
 * been in the theme since long before the panel, so an old one is never
 * mistaken for a stranger.
 */
function architrave_panel_where() {
	if ( defined( 'ARCHITRAVE_PANEL_HOST' ) && ARCHITRAVE_PANEL_HOST >= 2 ) {
		return 'host';
	}
	if ( defined( 'ARCHITRAVE_PANEL_HOST' ) || function_exists( 'architrave_asset_version' ) ) {
		return 'old';
	}
	return 'guest';
}

function architrave_panel_has_host() {
	return 'host' === architrave_panel_where();
}

function architrave_panel_is_guest() {
	return 'guest' === architrave_panel_where();
}

/**
 * Where the panel works at all: on its host, or as a guest bringing its own.
 */
function architrave_panel_runs() {
	return 'old' !== architrave_panel_where();
}

/**
 * THE TRY MODE (0.56.0, 2026-10-08, Manuel: the project page's button opened the
 * readers' sheet, "that's sad and also not coming across"). On a page the site
 * names through the filter `live_design_panel_try`, a visitor who may not edit
 * the design gets the owner's whole window: every section, every dial, Choose
 * on the Page, Undo. Nothing of it reaches the site: the page's storage is a
 * copy in memory that dies with the page (inc/site-styles.php,
 * architrave_try_head), no route or nonce is printed, the server refuses every
 * write from a visitor as it always did, and the window hides what only an
 * owner can do (Shown to Readers, Make Default, Save, Versions, Share, the
 * Button and Settings pages). An owner on the same page gets their own window,
 * as everywhere; WITH `?ldp-try` IN THE ADDRESS (0.57.1, 2026-10-17) the owner
 * gets the sandbox too. Manuel, on the Styles gallery: Try it, for him, pasted
 * the style into his own list under Hidden from Readers, "why when I try a style
 * I have it immediately under hidden styles?" Now Try tries for everyone: the
 * page wears the style, nothing is written, and Copy style is the one way home.
 *
 * @return bool
 */
function architrave_panel_try() {
	/* asked afresh each time: the filter reads the page, which an early call would not know yet */
	if ( ! (bool) apply_filters( 'live_design_panel_try', false ) ) {
		return false;
	}
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- a view of the page; it saves nothing.
	return ! current_user_can( 'edit_theme_options' ) || isset( $_GET['ldp-try'] );
}

/**
 * STAND BACK FROM A THEME THAT IS TOO OLD. The theme asks
 * `architrave_panel_active()` and would hand the panel over on the constant
 * alone; where this version cannot work with it, the answer is no, and the
 * theme carries on by itself (1.3.314: its own whole panel; 1.3.313 and older
 * never ask).
 */
function architrave_panel_answer( $active ) {
	return $active && architrave_panel_has_host();
}
add_filter( 'architrave_panel_active', 'architrave_panel_answer' );

/**
 * The file's own modified time as its version, the theme's habit
 * (architrave_asset_version): a changed script is a new address.
 */
function architrave_panel_asset_version( $rel ) {
	$path = plugin_dir_path( ARCHITRAVE_PANEL_FILE ) . $rel;
	return file_exists( $path ) ? (string) filemtime( $path ) : ARCHITRAVE_PANEL_VERSION;
}

/**
 * THE FOUR SCRIPTS, under the theme's handles, places and needs, so everything
 * that names a handle (the published styles' inline data, reading-panel's
 * needs) finds what it found before. At 11: after the theme's own list at 10,
 * so the order in the head stays the theme's scripts first, then the faces,
 * the line spacing and the styles, as it was in one list.
 */
/**
 * WHAT THE THEME USED TO LEND (0.8.0, guests only). The four panel scripts name
 * six others as their needs, and on Architrave the theme registers all six. An
 * unregistered dependency does not warn: `wp_enqueue_script` simply drops the
 * script, which is why the panel was silently absent on a stranger's theme
 * rather than broken in a visible way. So a guest registers them itself, under
 * the same handles, in the same order, in the head, with the two lines of data
 * the theme used to attach: the words the scripts print, and the permission to
 * offer every colour room.
 */
/*
 * WHAT IS NOT THERE AT ALL IS NOT SHOWN AT ALL (Manuel, 2026-09-22, at the
 * greyed Interface titles row on Twenty Twenty-Five: "if there is never an
 * interface title on the 2025, why should we have that grayed-out text? It
 * should only appear where it is"). Two different absences were wearing the
 * same grey. A dial that is asleep and can wake - Glow by day, Italic on a face
 * without one, a size the page does not carry yet - is GREYED, so the reader
 * can see it exists and find out what wakes it. A role the theme has no address
 * for can never wake on this site, and a row that can never do anything is not
 * a setting, it is a rumour. Those are LEFT OUT, the way the members row
 * already is.
 */
function architrave_panel_guest_gone() {
	/* EVERY ONE OF THE SEVEN HAS AN ADDRESS ON A BLOCK THEME (2026-10-02): the
	   roles are named for the HTML every site has, so none is left out any more.
	   Interface titles, Architrave's rail, went into Interface; the members went
	   into the roles they answer to. The filter stays for a theme that knows. */
	return apply_filters( 'live_design_panel_guest_gone', array() );
}

function architrave_panel_guest_limits() {
	$limits = array();
	foreach ( architrave_panel_guest_sizes() as $group ) {
		$limits[] = 'size:' . $group['role'];
	}
	return apply_filters( 'live_design_panel_guest_limits', array_values( array_unique( $limits ) ) );
}

/**
 * THE THEME'S OWN COLOURS FOLLOW A LOOK (2026-09-23, Twenty Twenty-Four under
 * Book: the page turned tan and every band the theme had coloured itself kept
 * its white or its black, so the page came out striped).
 *
 * A block theme does not paint a band with a colour; it paints it with a NAME
 * from its palette ("Base 2", "Contrast"), and core writes that name as
 * `var(--wp--preset--color--<slug>)`. So while a look is on, the names are
 * pointed at the look instead. Every theme names its colours differently, so
 * nothing here goes by the name: each colour is placed by where it stands
 * between the theme's own page and its own text, and takes the same place
 * between the look's page and the look's text. The page's own colour becomes
 * the look's page, the text's becomes the look's ink, a grey halfway between
 * becomes the halfway mix, and a colour paler than the page itself becomes the
 * look's paper. A dark band keeps being the dark band, in the look's colours.
 *
 * A COLOUR WITH A HUE TAKES THE LOOK'S ACCENT (Manuel, 2026-09-23, choosing B
 * on a side-by-side of Ollie under Book: its purple categories kept, or turned
 * into Book's brown). It was left alone at first, on the grounds that a look
 * has no partner for a theme's orange; but a look does have one highlight
 * colour, and a reader who picks Book wants Book. A strong hue becomes the
 * accent where it stood: a pale one a tint of it on the look's page, a middle
 * one the accent itself, a deep one the accent darkened with the look's ink.
 * A hue too faint to be a brand (a violet grey) is placed like a grey.
 * Original still shows every colour exactly as the theme has it.
 *
 * Gated on `data-chosen`, which is a look and never Original, so the theme's
 * own page is untouched. Filterable, and empty when there is nothing to move.
 */
function architrave_panel_guest_palette_css() {
	$read = architrave_panel_guest_colours();
	if ( ! $read ) {
		return '';
	}
	list( $palette, $grey, $hue, $page, $text ) = $read;
	$from = $grey[ $page ];
	$span = $from - $grey[ $text ];
	$lines = array();
	/*
	 * EACH PASTEL ITS OWN TINT (Manuel, 2026-09-25, Twenty Twenty-Five's yellow
	 * and pink bands, chosen on lab/the-theme-colours-in-a-look.html, option C).
	 * A look has one accent, and every pale colour of the theme became the same
	 * tint of it, or, when it was too faint to count as a hue (the pink), the
	 * look's light grey: two bands the theme made different came out as a tint
	 * and an interface grey. Now every pale colour, a faint one included, is a
	 * pastel, and the pastels take the accent's tint in turn, each a step
	 * further round the colour wheel: the first the accent's own hue, the next
	 * its neighbour. Same paleness, same room, still two colours. Taken in the
	 * palette's own order, so the theme's first accent stays the look's own.
	 */
	$pastels = array();
	foreach ( $palette as $slug => $colour ) {
		if ( $slug === $page || $slug === $text ) {
			continue;
		}
		$rgb = architrave_panel_rgb( $colour );
		if ( ! $rgb || ( max( $rgb ) - min( $rgb ) ) <= 30 ) {
			continue; /* a plain grey is placed as a grey */
		}
		$value = isset( $hue[ $slug ] ) ? $hue[ $slug ] : ( isset( $grey[ $slug ] ) ? $grey[ $slug ] : null );
		if ( null !== $value && ( $from - $value ) / $span < 0.3 ) {
			$pastels[] = $slug;
		}
	}
	$turns = array( 0, 70, -70, 140, -140 );
	foreach ( $pastels as $n => $slug ) {
		$tint    = 'color-mix(in oklab, var(--accent) 25%, var(--surface-canvas))';
		/* A LOOK WITH A REFERENCE NAMES ITS OWN (Manuel, the same evening,
		   lab/the-second-colour.html: "for the catalogue style we have that
		   visual inspiration … for the instrument the linear style"). The first
		   two pastels read `--ldp-pastel-1` and `-2` where panel-page.css gives a
		   look its reference's colours, and turn the wheel where it does not. */
		$wheel   = 'oklch(from ' . $tint . ' l max(c, 0.05) calc(h + ' . $turns[ $n % count( $turns ) ] . '))';
		$lines[] = "\t" . $slug . ': ' . ( $n < 2 ? 'var(--ldp-pastel-' . ( $n + 1 ) . ', ' . $wheel . ')' : $wheel ) . ';';
		unset( $grey[ $slug ], $hue[ $slug ] );
	}
	foreach ( $grey as $slug => $value ) {
		$at = ( $from - $value ) / $span; /* 0 at the page, 1 at the text */
		if ( $slug === $page || abs( $at ) < 0.02 ) {
			/* THE PAPER IS THE PAGE (Manuel, 2026-10-03, the seven colours): the theme's page takes the
			   look's Paper on every theme; Ground is the theme's second background, below. */
			$to = 'var(--surface-base)';
		} elseif ( $slug === $text || $at > 0.98 ) {
			$to = 'var(--text-primary)';
		} elseif ( $at < 0 ) {
			$to = 'var(--surface-base)';
		} elseif ( $at < 0.15 ) {
			/* A SHADED BOX TAKES THE CARD COLOUR (Manuel, 2026-09-26, Gallery by
			   night on Twenty Twenty-Five, lab/gallery-by-night.html): a grey just
			   off the theme's page is a box standing on it. As a mix it sat a few
			   hundredths above the look's page, and on a black page that is black.
			   A look that names its card colour (--ldp-lift, a set's lift or the
			   Card row) puts the box on that; any other keeps the mix. */
			/* AND A GROUND OF YOUR OWN COMES FIRST (2026-10-03): the grey just off the page is the theme's
			   second background, its bands and boxes, and Ground is written for exactly that (--ldp-ground). */
			$to = 'var(--ldp-ground, var(--ldp-lift, color-mix(in srgb, var(--text-primary) ' . round( $at * 100 ) . '%, var(--surface-base))))';
		} else {
			$to = 'color-mix(in srgb, var(--text-primary) ' . round( $at * 100 ) . '%, var(--surface-base))';
		}
		$lines[] = "\t" . $slug . ': ' . $to . ';';
	}
	foreach ( $hue as $slug => $value ) {
		$at = ( $from - $value ) / $span;
		if ( $at < 0.3 ) {
			$to = 'color-mix(in srgb, var(--accent) 25%, var(--surface-canvas))';
		} elseif ( $at > 0.7 ) {
			$to = 'color-mix(in srgb, var(--accent) 60%, var(--text-primary))';
		} else {
			$to = 'var(--accent)';
		}
		$lines[] = "\t" . $slug . ': ' . $to . ';';
	}
	/* AND UNDER THE THEME'S OWN LOOK ONCE YOU SET YOUR OWN COLOURS (2026-09-23, the
	   audit: on Twenty Twenty-Five and Kadence a paper picked under Original was
	   kept and never reached the page, since the theme's colours only followed
	   the panel under a chosen look). data-colours is on while colours are set by hand. */
	$css = ":root[data-chosen],\n:root[data-colours] {\n" . implode( "\n", $lines ) . "\n}";
	/*
	 * A COLOUR AS TEXT IS TRANSLATED FOR TEXT (Manuel, 2026-09-26, Twenty
	 * Twenty-Five's Banners under Gallery by night: "where's the yellow coming
	 * from again? … what's the holistic approach?", then "go"). The theme uses one
	 * name for two jobs: Accent 1 is its yellow BANDS and its words ON
	 * PHOTOGRAPHS. The translation above is made for bands, a tint that is pale by
	 * day and dark by night; as text on a photograph the dark one could not read,
	 * guest-ink.js gave the theme's yellow back, and the same yellow came through
	 * under every look. So the "text in this colour" classes get their own
	 * translation, by the job: the theme's colour said which side it reads on
	 * (a light yellow is meant for dark grounds), and the look answers on that
	 * side — its accent lifted to light, or pressed to dark, unless a look names
	 * its own (--ldp-fg-light / --ldp-fg-dark, panel-page.css). Backgrounds keep
	 * the band's tint. The same on every theme; nothing here goes by the name.
	 */
	$fg = array();
	foreach ( array_merge( $pastels, array_keys( $hue ) ) as $slug ) {
		$rgb = isset( $palette[ $slug ] ) ? architrave_panel_rgb( $palette[ $slug ] ) : null;
		if ( ! $rgb ) {
			continue;
		}
		$light = ( 0.2126 * $rgb[0] + 0.7152 * $rgb[1] + 0.0722 * $rgb[2] ) / 255 > 0.55;
		$class = substr( $slug, strlen( '--wp--preset--color--' ) );
		$to    = $light
			? 'var(--ldp-fg-light, oklch(from var(--accent) max(l, 0.88) c h))'
			: 'var(--ldp-fg-dark, oklch(from var(--accent) min(l, 0.42) c h))';
		$fg[]  = ':root[data-chosen] .has-' . $class . '-color:not(:where(.reading-panel, .reading-panel *)) { color: ' . $to . ' !important; }';
	}
	if ( $fg ) {
		$css .= "\n" . implode( "\n", $fg );
	}
	return (string) apply_filters( 'live_design_panel_guest_palette_css', $css, $palette );
}

/**
 * THE THEME'S COLOURS, READ ONCE (0.11.47): its palette, sorted into greys and
 * colours with a hue, and which of the greys is its page and which its text.
 * Two things place colours by where they stand between those two: a look
 * (above) and the theme's own other side (below). Null when the theme gives
 * too little to go on (fewer than two greys, or a page and a text that are
 * the same).
 *
 * @return array|null array( palette, grey, hue, page slug, text slug )
 */
function architrave_panel_guest_colours() {
	static $read = false;
	if ( false !== $read ) {
		return $read;
	}
	$read = null;
	if ( ! function_exists( 'wp_get_global_settings' ) ) {
		return null;
	}
	$sets    = (array) wp_get_global_settings( array( 'color', 'palette' ) );
	$palette = array(); /* the custom property => its colour */
	foreach ( array( 'theme', 'custom' ) as $origin ) {
		if ( ! empty( $sets[ $origin ] ) && is_array( $sets[ $origin ] ) ) {
			foreach ( $sets[ $origin ] as $entry ) {
				if ( isset( $entry['slug'], $entry['color'] ) ) {
					$palette[ '--wp--preset--color--' . sanitize_key( $entry['slug'] ) ] = $entry['color'];
				}
			}
		}
	}
	/*
	 * A PALETTE THAT NAMES THE THEME'S OWN VARIABLES (Neve FSE, 2026-09-24): each
	 * colour is `var(--nv-site-bg, #FFFFFF)`, and the theme paints its page and
	 * header with `--nv-site-bg` directly. The palette name is placed as usual
	 * (from the fallback) and the theme's variable is placed beside it, the way
	 * Kadence's and Astra's are below, so both follow a look and the made side.
	 */
	foreach ( $palette as $slug => $colour ) {
		if ( preg_match( '/^var\(\s*(--[a-z0-9_-]+)\s*,\s*(.+)\)$/i', trim( (string) $colour ), $m ) && ! isset( $palette[ $m[1] ] ) ) {
			$palette[ $m[1] ] = trim( $m[2] );
		}
	}
	/*
	 * A THEME WITH A PALETTE OF ITS OWN (Kadence, 2026-09-23). Kadence gives
	 * WordPress its colours as `var(--global-paletteN)`, which say nothing
	 * here, and paints its page, its content box and its header with those
	 * variables directly. Under a dark look the page turned dark and the box
	 * and the header stayed white, with the text turned light on them. Its
	 * nine colours (and the tenth, the text on an accent) are read from the
	 * theme and placed like any other palette; its five signal colours
	 * (success, alert …) are left as they are.
	 */
	if ( function_exists( 'Kadence\\kadence' ) && is_callable( array( \Kadence\kadence(), 'palette_option' ) ) /* its helper answers through __call, which method_exists cannot see */ ) {
		foreach ( range( 1, 10 ) as $n ) {
			$colour = \Kadence\kadence()->palette_option( 'palette' . $n );
			if ( is_string( $colour ) && '' !== $colour ) {
				$palette[ '--global-palette' . $n ] = $colour;
			}
		}
	}
	/*
	 * AND ASTRA (2026-09-23, the audit: a paper picked on Astra changed nothing).
	 * Astra paints with `--ast-global-color-0` … `-8`, the colours of the palette
	 * the site has chosen, and hands WordPress only references to them, as
	 * Kadence does. They are read from the theme and placed like any palette.
	 */
	if ( function_exists( 'astra_get_palette_colors' ) ) {
		$astra = astra_get_palette_colors();
		$which = is_array( $astra ) && isset( $astra['currentPalette'] ) ? $astra['currentPalette'] : 'palette_1';
		if ( isset( $astra['palettes'][ $which ] ) && is_array( $astra['palettes'][ $which ] ) ) {
			foreach ( array_values( $astra['palettes'][ $which ] ) as $n => $colour ) {
				if ( is_string( $colour ) && '' !== $colour ) {
					$palette[ '--ast-global-color-' . $n ] = $colour;
				}
			}
		}
	}
	$grey = array();
	$hue  = array();
	foreach ( $palette as $slug => $colour ) {
		$rgb = architrave_panel_rgb( $colour );
		if ( ! $rgb ) {
			continue;
		}
		$spread = max( $rgb ) - min( $rgb );
		if ( $spread <= 48 ) {
			$grey[ $slug ] = array_sum( $rgb ) / 3; /* a grey, or a hue too faint to be anyone's brand */
		} else {
			$hue[ $slug ] = array_sum( $rgb ) / 3;
		}
	}
	/*
	 * NO PALETTE OF ITS OWN (Variations, 2026-09-24: no colours in theme.json,
	 * the page `#ffffff` and the text `#000000` written straight into its
	 * styles). The panel could not tell which side the theme is on, so a first
	 * visit got the panel's own default, dark, and Original had no other side.
	 * The page and the text the styles name stand in for a palette; they are
	 * written as two names of the panel's own, and the made side paints the
	 * page itself (below).
	 */
	if ( count( $grey ) < 2 && function_exists( 'wp_get_global_styles' ) ) {
		$named = (array) wp_get_global_styles( array( 'color' ) );
		foreach ( array( 'background' => '--ldp-host-page', 'text' => '--ldp-host-text' ) as $key => $name ) {
			$rgb = isset( $named[ $key ] ) ? architrave_panel_rgb( $named[ $key ] ) : null;
			if ( $rgb && ( max( $rgb ) - min( $rgb ) ) <= 48 ) {
				$palette[ $name ] = $named[ $key ];
				$grey[ $name ]    = array_sum( $rgb ) / 3;
			}
		}
	}
	if ( count( $grey ) < 2 ) {
		return null;
	}
	$styles = function_exists( 'wp_get_global_styles' ) ? (array) wp_get_global_styles( array( 'color' ) ) : array();
	$page   = '--wp--preset--color--' . architrave_panel_preset_slug( isset( $styles['background'] ) ? $styles['background'] : '' );
	$text   = '--wp--preset--color--' . architrave_panel_preset_slug( isset( $styles['text'] ) ? $styles['text'] : '' );
	/* The page and the text are the plain greys, never a faint hue. */
	$plain = array();
	foreach ( $palette as $slug => $colour ) {
		$rgb = architrave_panel_rgb( $colour );
		if ( $rgb && ( max( $rgb ) - min( $rgb ) ) <= 30 ) {
			$plain[ $slug ] = $grey[ $slug ];
		}
	}
	if ( count( $plain ) >= 2 ) {
		if ( ! isset( $plain[ $page ] ) ) {
			$page = array_search( max( $plain ), $plain, true );
		}
		if ( ! isset( $plain[ $text ] ) ) {
			$text = array_search( abs( $plain[ $page ] - max( $plain ) ) < abs( $plain[ $page ] - min( $plain ) ) ? min( $plain ) : max( $plain ), $plain, true );
		}
	}
	if ( ! isset( $grey[ $page ] ) ) {
		$page = array_search( max( $grey ), $grey, true );
	}
	if ( ! isset( $grey[ $text ] ) ) {
		$text = array_search( abs( $grey[ $page ] - max( $grey ) ) < abs( $grey[ $page ] - min( $grey ) ) ? min( $grey ) : max( $grey ), $grey, true );
	}
	$from = $grey[ $page ];
	$span = $from - $grey[ $text ];
	if ( abs( $span ) < 1 ) {
		return null;
	}
	$read = array( $palette, $grey, $hue, $page, $text );
	return $read;
}

/**
 * WHICH SIDE THE THEME ITSELF IS ON: 'light' or 'dark', read off its page
 * colour. '' when the palette says too little, and then the panel keeps the
 * side a reader last chose, or its own default.
 */
function architrave_panel_guest_side() {
	$read = architrave_panel_guest_colours();
	if ( ! $read ) {
		return '';
	}
	$rgb = architrave_panel_rgb( $read[0][ $read[3] ] );
	return $rgb && architrave_panel_oklab( $rgb )[0] < 0.5 ? 'dark' : 'light';
}

/**
 * THE THEME'S OWN OTHER SIDE (Manuel, 2026-09-24, on Ollie: "you said it before
 * that we create a dark mode for themes that don't have a dark mode and
 * therefore it should be clickable right away"). Light / Dark / System used to
 * grey out under Original, since a theme without a dark side had none to give.
 * Now the panel makes one from the theme's own palette, placed the way a look
 * places it: every colour by where it stands between the theme's page and its
 * text.
 *
 * - The page takes the far end: a light theme's white becomes a near-black
 *   night paper, a dark theme's black a near-white one. The text takes the
 *   other end, and a grey halfway between stays halfway, so a band the theme
 *   drew a little darker than its page is drawn a little lighter than it.
 *   A grey that stood beyond the page (a white card on a pale grey page) stays
 *   one step off it, now on the other side.
 * - A colour with a hue keeps its hue. A pale tint becomes a deep one and a deep
 *   shade a pale one; a middle colour, the brand, is lifted just far enough to
 *   read on the night paper (or sunk to read on the day paper). That is how the
 *   system colours of Apple's dark mode differ from their light ones.
 * - Each colour keeps a little of its own tint, so a warm grey stays warm.
 *
 * Only while the theme's own look is on and the reader's side is not the
 * theme's: `data-theme` names the side, and neither a look (`data-chosen`) nor
 * the reader's own colours (`data-colours`) may be on. Everything is written as
 * the palette's own custom properties, so every block the theme painted with a
 * palette name follows, and nothing the theme did not name is touched.
 */
function architrave_panel_guest_other_side_css() {
	$read = architrave_panel_guest_colours();
	$side = architrave_panel_guest_side();
	if ( ! $read || '' === $side ) {
		return '';
	}
	list( $palette, $grey, $hue, $page, $text ) = $read;
	$night = 'light' === $side; /* the side being made */
	$ends  = $night ? array( 0.2, 0.93, 0.26 ) : array( 0.985, 0.22, 0.955 ); /* page, text, one step beyond the page */
	$from  = $grey[ $page ];
	$span  = $from - $grey[ $text ];
	$lines = array();
	foreach ( $palette as $slug => $colour ) {
		$rgb = architrave_panel_rgb( $colour );
		if ( ! $rgb ) {
			continue;
		}
		$lab = architrave_panel_oklab( $rgb );
		$c   = sqrt( $lab[1] * $lab[1] + $lab[2] * $lab[2] );
		$h   = atan2( $lab[2], $lab[1] );
		if ( isset( $grey[ $slug ] ) ) {
			$at = ( $from - $grey[ $slug ] ) / $span; /* 0 at the page, 1 at the text */
			$l  = $at < -0.02 ? $ends[2] : $ends[0] + max( 0, min( 1, $at ) ) * ( $ends[1] - $ends[0] );
			$c  = min( $c, 0.02 );
		} else {
			$l0 = $lab[0];
			if ( $night ) {
				$l = $l0 > 0.82 ? 0.3 : ( $l0 < 0.42 ? 0.86 : max( $l0, 0.72 ) );
			} else {
				$l = $l0 < 0.35 ? 0.94 : ( $l0 > 0.8 ? 0.48 : min( $l0, 0.56 ) );
			}
			if ( $l0 > 0.82 || $l0 < 0.35 ) {
				$c *= 0.6; /* a tint turned over is a quieter tint */
			}
		}
		$lines[] = "\t" . $slug . ': ' . architrave_panel_hex( architrave_panel_srgb( array( $l, $c * cos( $h ), $c * sin( $h ) ) ) ) . ';';
	}
	if ( ! $lines ) {
		return '';
	}
	/*
	 * AND THE BANDS A THEME PAINTED WITH A FIXED COLOUR (Kadence, 2026-09-24: its
	 * header is `#masthead { background: #ffffff }` from its own settings, no
	 * palette name, so under the made dark side it stayed white with a pale
	 * title on it). presets.js marks the large parts of the page that wear the
	 * theme's page colour, or a paler one, as a fixed value (`data-ldp-paper`,
	 * `data-ldp-raised`); they take the made side's page and card here. Loud,
	 * because such a colour usually comes with an ID.
	 */
	$paper_to  = architrave_panel_hex( architrave_panel_srgb( array( $ends[0], 0, 0 ) ) );
	$raised_to = architrave_panel_hex( architrave_panel_srgb( array( $ends[2], 0, 0 ) ) );
	$scheme = $night ? 'dark' : 'light';
	/* The dark side is named on the root; the light side is the root with no side named, or a "-light" one. */
	$when   = $night ? ':root[data-theme$="-dark"]' : ':root:not([data-theme$="-dark"])';
	$gate   = $when . ':not([data-chosen]):not([data-colours])';
	$css    = $gate . ' {' . "\n" . implode( "\n", $lines ) . "\n\tcolor-scheme: " . $scheme . ";\n}\n"
		. $gate . ' [data-ldp-paper] { background-color: ' . $paper_to . " !important; }\n"
		. $gate . ' [data-ldp-raised] { background-color: ' . $raised_to . ' !important; }'
		/* And a menu's dropdown, which WordPress paints white with black words when the menu has no background of its own. */
		. "\n" . $gate . ' .wp-block-navigation:not(.has-background) .wp-block-navigation__submenu-container { background-color: ' . $raised_to . ' !important; color: inherit !important; }'
		/* A theme with no palette wrote its page and text as values (above): the page itself takes them. */
		. ( isset( $palette['--ldp-host-page'], $palette['--ldp-host-text'] ) ? "\n" . $gate . ' body { background-color: var(--ldp-host-page); color: var(--ldp-host-text); }' : '' );
	return (string) apply_filters( 'live_design_panel_guest_other_side_css', $css, $palette, $side );
}

/** sRGB (0-255 channels) to Oklab (L 0-1, a, b). */
function architrave_panel_oklab( $rgb ) {
	$lin = array();
	foreach ( $rgb as $v ) {
		$v     = $v / 255;
		$lin[] = $v <= 0.04045 ? $v / 12.92 : pow( ( $v + 0.055 ) / 1.055, 2.4 );
	}
	$l = pow( 0.4122214708 * $lin[0] + 0.5363325363 * $lin[1] + 0.0514459929 * $lin[2], 1 / 3 );
	$m = pow( 0.2119034982 * $lin[0] + 0.6806995451 * $lin[1] + 0.1073969566 * $lin[2], 1 / 3 );
	$s = pow( 0.0883024619 * $lin[0] + 0.2817188376 * $lin[1] + 0.6299787005 * $lin[2], 1 / 3 );
	return array(
		0.2104542553 * $l + 0.7936177850 * $m - 0.0040720468 * $s,
		1.9779984951 * $l - 2.4285922050 * $m + 0.4505937099 * $s,
		0.0259040371 * $l + 0.7827717662 * $m - 0.8086757660 * $s,
	);
}

/** Oklab to sRGB channels, the chroma pulled in until the colour fits the screen. */
function architrave_panel_srgb( $lab ) {
	for ( $k = 1.0; $k > 0; $k -= 0.05 ) {
		$a  = $lab[1] * $k;
		$b  = $lab[2] * $k;
		$l_ = pow( $lab[0] + 0.3963377774 * $a + 0.2158037573 * $b, 3 );
		$m_ = pow( $lab[0] - 0.1055613458 * $a - 0.0638541728 * $b, 3 );
		$s_ = pow( $lab[0] - 0.0894841775 * $a - 1.2914855480 * $b, 3 );
		$lin = array(
			4.0767416621 * $l_ - 3.3077115913 * $m_ + 0.2309699292 * $s_,
			-1.2684380046 * $l_ + 2.6097574011 * $m_ - 0.3413193965 * $s_,
			-0.0041960863 * $l_ - 0.7034186147 * $m_ + 1.7076147010 * $s_,
		);
		if ( min( $lin ) >= -0.0005 && max( $lin ) <= 1.0005 ) {
			break;
		}
	}
	$out = array();
	foreach ( $lin as $v ) {
		$v     = max( 0, min( 1, $v ) );
		$out[] = (int) round( 255 * ( $v <= 0.0031308 ? 12.92 * $v : 1.055 * pow( $v, 1 / 2.4 ) - 0.055 ) );
	}
	return $out;
}

/** Three channels as #rrggbb. */
function architrave_panel_hex( $rgb ) {
	return sprintf( '#%02x%02x%02x', $rgb[0], $rgb[1], $rgb[2] );
}

/** `var(--wp--preset--color--base)` or `var:preset|color|base` → `base`. */
function architrave_panel_preset_slug( $value ) {
	if ( preg_match( '/--wp--preset--color--([a-z0-9-]+)/i', (string) $value, $m ) || preg_match( '/^var:preset\|color\|([a-z0-9-]+)$/i', (string) $value, $m ) ) {
		return strtolower( $m[1] );
	}
	return '';
}

/** A palette colour as three channels, or null for anything that is not a plain hex or rgb() (a mix, a variable). */
function architrave_panel_rgb( $colour ) {
	$colour = strtolower( trim( (string) $colour ) );
	/* A VARIABLE WITH A FALLBACK (Neve FSE, 2026-09-24: its palette is
	   `var(--nv-site-bg, #FFFFFF)`): the colour is the fallback. */
	if ( preg_match( '/^var\(\s*--[a-z0-9_-]+\s*,\s*(.+)\)$/', $colour, $m ) ) {
		return architrave_panel_rgb( $m[1] );
	}
	if ( preg_match( '/^#([0-9a-f]{3}|[0-9a-f]{6})$/', $colour, $m ) ) {
		$hex = 3 === strlen( $m[1] ) ? $m[1][0] . $m[1][0] . $m[1][1] . $m[1][1] . $m[1][2] . $m[1][2] : $m[1];
		return array( hexdec( substr( $hex, 0, 2 ) ), hexdec( substr( $hex, 2, 2 ) ), hexdec( substr( $hex, 4, 2 ) ) );
	}
	if ( preg_match( '/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/', $colour, $m ) ) {
		return array( (int) $m[1], (int) $m[2], (int) $m[3] );
	}
	return null;
}

/**
 * WHAT EACH ROLE'S SIZE DIAL MEASURES ITSELF AGAINST (0.9.0).
 *
 * A size is a multiplier and CSS cannot ask an element how big it already is,
 * so assets/js/guest-size.js reads it and writes back the product. This is the
 * one list of what it reads: the same areas the role table names in
 * assets/css/panel-page.css, narrowed to the elements that CARRY a size rather
 * than inherit one, since an element that inherits is already handled by the
 * stylesheet and would be measured through its parent here.
 *
 * Every role whose size starts out greyed is in here; the script takes a role
 * off that list once it has found something on the page to measure, so a size
 * row is live exactly where it can do something.
 *
 * `rest` is the size Architrave gives that part at rest (presets.js ROLE_DEFAULT:
 * the quote and the category line 26, small text 16, comments 14), which a LOOK
 * starts from on a guest since 2026-09-22; the parts with a `step` take their
 * rung from the generated --panel-rung-* instead. Interface has neither: a
 * horizontal navigation at Architrave's 13px rail size would be a mistake, so
 * it stays a ratio of the host's own.
 *
 * `step` names the rung this part of the article climbs when the reader presses
 * the A/A stepper. Measured on Architrave: two presses of Larger take the title
 * from 64 to 72, an h2 from 36 to 47 and a paragraph from 22 to 28, so each part
 * has a ladder of its own and a guest that moved the paragraphs alone was doing
 * a different thing (Manuel, 2026-09-22: "that Double A works differently than
 * Elmastudio"). The ratios are generated into panel-page.css as
 * `--panel-step-<step>`; an empty step is a part the stepper does not move.
 */
function architrave_panel_guest_sizes() {
	$article  = '.wp-block-post-content %1$s, .entry-content %1$s';
	$headings = array();
	foreach ( array( 1, 2, 3, 4, 5, 6 ) as $level ) {
		$headings[] = array( 'sel' => sprintf( $article, 'h' . $level ), 'role' => 'head', 'member' => 'sub', 'step' => 'h' . $level );
	}
	return apply_filters(
		'live_design_panel_guest_sizes',
		array_merge(
			array( array( 'sel' => '.wp-block-post-title, .entry-title', 'role' => 'head', 'member' => 'title', 'step' => 'title' ) ), /* .entry-title: a classic theme's title (Kadence, 2026-09-23) */
			$headings,
			array(
				/*
				 * A HEADING THAT IS NOT IN AN ARTICLE IS STILL A HEADING (Manuel,
				 * 2026-09-22: "the size slider changes only the size of the post
				 * title, but the weight and letter spacing changes the title and
				 * the element above, which is Blog"). The role table gives every
				 * `.wp-block-heading` the Headings face, weight, case and spacing;
				 * this list, the only one that can carry a SIZE, named the post
				 * title and the headings INSIDE the article alone, so the word
				 * Blog over an archive took five dials of six. It joins the
				 * subheadings, at the rung of a second-level heading. The comments
				 * title is left out because the role table gives it to Comments.
				 */
				array( 'sel' => '.wp-block-heading:not(.wp-block-comments-title), .wp-block-query-title', 'role' => 'head', 'member' => 'sub', 'step' => 'h2' ), /* the query title is the page's own title on a search or an author page (2026-09-22) */
				/*
				 * THE QUOTE BEFORE THE READING TEXT, AND ITS PARAGRAPHS WITH IT. The
				 * script gives an element to the first group that names it. A quote
				 * block holds paragraphs, and `.wp-block-post-content p` names
				 * those too; listed first, Reading text owned them, each was given
				 * a size of its own, and the Quotes dial then moved the block and
				 * not one word inside it, while the Reading text dial moved the
				 * quote. So the quote's own text is named here, and the group
				 * stands first.
				 */
				array( 'sel' => '.wp-block-quote, .wp-block-pullquote, :is(.wp-block-quote, .wp-block-pullquote) :is(p, li, cite)', 'role' => 'quote', 'step' => 'body', 'rest' => 26 ),
				/* CODE, THE SEVENTH ROLE (2026-10-02): its blocks, at the theme's own size. Code inside a
				   sentence keeps the sentence's, as it always did: sized here it left the line. */
				array( 'sel' => '.wp-block-code, .wp-block-preformatted, ' . sprintf( $article, 'pre' ), 'role' => 'code', 'step' => '' ),
				array( 'sel' => sprintf( $article, 'p' ) . ', ' . sprintf( $article, 'li' ), 'role' => 'read', 'member' => 'text', 'step' => 'body' ),
				array( 'sel' => '.wp-block-post-excerpt', 'role' => 'read', 'member' => 'excerpts', 'step' => 'body' ),
				array( 'sel' => '.wp-block-post-terms', 'role' => 'kicker', 'step' => '', 'rest' => 26 ),
				array( 'sel' => '.wp-block-post-date, .entry-meta', 'role' => 'small', 'member' => 'date', 'step' => '', 'rest' => 16 ), /* .entry-meta: a classic theme's date and author line */
				array( 'sel' => '.wp-block-post-author-name', 'role' => 'small', 'member' => 'author', 'step' => '', 'rest' => 16 ),
				array( 'sel' => 'figcaption, .wp-element-caption', 'role' => 'small', 'member' => 'captions', 'step' => '', 'rest' => 13 ),
				/* The class core writes on any block set to the small step: on stock
				   Twenty Twenty-Five that is the two lines in the footer. It follows
				   the Small text role and has no member of its own, because it is not
				   one thing, it is whatever a writer marked small. */
				/* NOT A MENU MARKED SMALL (2026-09-23, Ollie): a theme that sets its
				   navigation at the small step makes it this class too, and the
				   menu then took Small text's 13 under a look instead of staying the
				   Interface. The menu is the Interface whatever size it was given. */
				array( 'sel' => '.has-small-font-size:not(.wp-block-navigation)', 'role' => 'small', 'step' => '', 'rest' => 13 ),
				array( 'sel' => '.wp-block-comments-title, .comment-reply-title', 'role' => 'comment', 'member' => 'title', 'step' => '', 'rest' => 18 ),
				array( 'sel' => '.wp-block-comment-author-name', 'role' => 'comment', 'member' => 'name', 'step' => '', 'rest' => 16 ),
				array( 'sel' => '.wp-block-comment-content', 'role' => 'comment', 'member' => 'text', 'step' => '', 'rest' => 14 ),
				array( 'sel' => '.wp-block-comment-date, .wp-block-comment-reply-link', 'role' => 'comment', 'member' => 'small', 'step' => '', 'rest' => 13 ),
				array( 'sel' => '.wp-block-post-comments-form label, .wp-block-post-comments-form p, .comment-form label, .comment-form p', 'role' => 'comment', 'member' => 'form', 'step' => '', 'rest' => 13 ),
				/* THE SITE'S NAME FOLLOWS HEADINGS (2026-10-02, lab/the-site-name.html) */
				array( 'sel' => '.wp-block-site-title', 'role' => 'head', 'member' => 'sub', 'step' => '' ),
				array( 'sel' => '.wp-block-navigation-item__content, .wp-block-button__link, .wp-block-site-tagline, .wp-block-query-pagination, .wp-block-post-navigation-link, .skip-link, .wp-block-search__label, .wp-block-search__input, .wp-block-search__button', 'role' => 'ui', 'step' => '' ),
			)
		)
	);
}

/**
 * THE THEME'S OWN LOOK, AS A TILE (0.9.0).
 *
 * On Architrave the first tile is Standard, which is Architrave's own look, so
 * a reader who has changed something is always one press from home. On a
 * stranger's theme there is no such tile and no way back (Manuel, 2026-09-22:
 * "how does he come back to his original design?"). So a guest gets one more
 * tile, first in the row and the one a first visit rests on, which is not a
 * look at all: it is the absence of every choice, and it wears the theme's own
 * name because that is what it gives back.
 */
function architrave_panel_host_style() {
	/*
	 * ITS NAME IS A WORD, NOT THE THEME'S NAME (Manuel, 2026-09-22: "Twenty
	 * Twenty-Five is a little bit too long for the tiles. Maybe we should do
	 * something like default"). A theme's name is as long as its author made
	 * it and a tile is one line wide. "Original" is his own word for what this
	 * gives back ("how does he come back to his original design?") and it does
	 * not read as a near-twin of Standard, which stands beside it and is
	 * Architrave's look rather than the site's.
	 */
	return apply_filters(
		'live_design_panel_host_style',
		array( 'id' => 'host', 'label' => __( 'Original', 'vibetiles' ) )
	);
}

function architrave_panel_support_scripts() {
	$base    = plugin_dir_url( ARCHITRAVE_PANEL_FILE );
	$support = array(
		'quire-modes'              => array( 'assets/js/quire.modes.js', array() ),
		'quire-icons'              => array( 'assets/js/quire.icons.js', array() ),
		'quire-reading'            => array( 'assets/js/quire.reading.js', array() ),
		'architrave-focus-mode'    => array( 'assets/js/focus-mode.js', array() ),
		'architrave-color-mode'    => array( 'assets/js/color-mode.js', array( 'quire-modes', 'quire-icons' ) ),
		'architrave-reading-scale' => array( 'assets/js/reading-scale.js', array( 'quire-reading', 'quire-icons' ) ),
		/* The plugin's own, and only a guest has any use for it: see its head. */
		'architrave-guest-size'    => array( 'assets/js/guest-size.js', array() ),
		/* The same: it reads a line of a stranger's page and makes one style of it. */
		'architrave-guest-rows'    => array( 'assets/js/guest-rows.js', array() ),
		/* And this one marks the lines a stranger's theme actually draws, so the
		   Lines dial has something to speak to. */
		'architrave-guest-lines'   => array( 'assets/js/guest-lines.js', array() ),
		/* And this one keeps text readable where a colour the author typed by hand
		   ends up on paper it was never meant for. */
		'architrave-guest-ink'     => array( 'assets/js/guest-ink.js', array() ),
		/* And this one reads which buttons the theme itself fills, so a look keeps
		   a main button apart from the others. */
		'architrave-guest-buttons' => array( 'assets/js/guest-buttons.js', array() ),
	);
	foreach ( $support as $handle => $item ) {
		if ( wp_script_is( $handle, 'registered' ) ) {
			continue; /* somebody else's, and theirs wins */
		}
		wp_enqueue_script( $handle, $base . $item[0], $item[1], architrave_panel_asset_version( $item[0] ), array( 'in_footer' => false ) );
	}
	$words = array_filter(
		(array) apply_filters( 'architrave_settings_words', array() ),
		static function ( $word, $en ) {
			return $word !== $en;
		},
		ARRAY_FILTER_USE_BOTH
	);
	wp_add_inline_script( 'quire-icons', 'window.architraveWords = ' . wp_json_encode( $words ) . ';', 'before' );
	wp_add_inline_script( 'architrave-focus-mode', 'window.architravePanelActive = true;', 'before' );
	/*
	 * AND THAT IT IS A GUEST (0.9.0). The scripts ship to host and guest alike,
	 * and three places have to behave differently on somebody else's theme,
	 * all for the same reason: on Architrave a dial at rest can write nothing
	 * and let the theme's own value stand, because Architrave IS the theme.
	 * A guest has no such value to fall back to, so a rest has to be told
	 * apart from a choice, and only an attribute on the root can tell the
	 * stylesheet which it is. This line is printed for guests only, so on a
	 * host the global is undefined and every one of those branches is dead.
	 */
	wp_add_inline_script( 'architrave-focus-mode', 'window.architravePanelGuest = true;', 'before' );
	/*
	 * AND WHICH SIDE THE THEME IS ON (0.11.47), before the first paint: a reader
	 * who has never chosen a side starts on the theme's own, so a light theme
	 * opens light, panel and all, and a dark one dark. It was the panel's own
	 * default, dark, whatever the theme under it was.
	 */
	wp_add_inline_script( 'quire-modes', 'window.architravePanelHostSide = ' . wp_json_encode( architrave_panel_guest_side() ) . ';', 'before' );
	/*
	 * AND WHAT CANNOT REACH ITS PAGE (0.9.0). A row the reader can move that
	 * changes nothing is worse than no row: it was the first thing to go wrong
	 * on a stranger's theme after the panel started drawing itself. These are
	 * the dials with nothing to name on a plain block theme, and the panel
	 * greys them, with a dead control and no line under it. A role's SIZE is a
	 * multiplier and needs a size of its own to multiply: only text that
	 * inherits its size has one, which is the article's paragraphs and lists.
	 * The MEMBERS are Architrave's own parts, one by one. INTERFACE TITLES is
	 * the rail's titled sections, and a plain theme has no rail.
	 */
	wp_add_inline_script(
		'architrave-focus-mode',
		'window.architravePanelGuestLimits = ' . wp_json_encode( architrave_panel_guest_limits() ) . ';',
		'before'
	);
	wp_add_inline_script(
		'architrave-focus-mode',
		'window.architravePanelGuestGone = ' . wp_json_encode( architrave_panel_guest_gone() ) . ';',
		'before'
	);
	wp_add_inline_script(
		'architrave-focus-mode',
		'window.architravePanelHostStyle = ' . wp_json_encode( architrave_panel_host_style() ) . ';',
		'before'
	);
	/*
	 * AND WHAT SLEEPS WHILE THE THEME'S OWN LOOK IS ON. Four switches spend the
	 * colour room's ink and paper, and on that look no room is painted, so they
	 * put the dark room's halo and grey on a white page (measured on Twenty
	 * Twenty-Five, 2026-09-22). Greyed until a look is chosen; the panel reads
	 * this list only while the Original tile is on.
	 */
	wp_add_inline_script(
		'architrave-focus-mode',
		'window.architravePanelGuestHostLimits = ' . wp_json_encode( apply_filters( 'live_design_panel_guest_host_limits', array( 'option:glow', 'option:soft', 'option:fills', 'option:lines' ) ) ) . ';',
		'before'
	);
	wp_add_inline_script(
		'architrave-guest-size',
		'window.architravePanelGuestSizes = ' . wp_json_encode( architrave_panel_guest_sizes() ) . ';',
		'before'
	);
}

function architrave_panel_enqueue_scripts() {
	if ( ! architrave_panel_runs() ) {
		return;
	}
	if ( architrave_panel_is_guest() ) {
		architrave_panel_support_scripts();
	}
	$base = plugin_dir_url( ARCHITRAVE_PANEL_FILE );
	$list = array(
		'architrave-font-library'    => array( 'assets/js/font-library.js', array(), false ), /* the faces beyond the hand-kept fifteen (2026-09-23), read by the two below */
		'architrave-reading-face'    => array( 'assets/js/reading-face.js', array( 'quire-icons', 'architrave-font-library' ), false ),
		'architrave-reading-leading' => array( 'assets/js/reading-leading.js', array( 'quire-icons' ), false ),
		'architrave-presets'         => array( 'assets/js/presets.js', array( 'quire-icons', 'quire-modes', 'architrave-focus-mode', 'architrave-font-library' ), false ),
		'architrave-reading-panel'   => array( 'assets/js/reading-panel.js', array( 'architrave-presets', 'architrave-reading-scale', 'architrave-reading-face', 'architrave-reading-leading', 'architrave-color-mode', 'quire-icons' ), true ),
		'architrave-panel-opener'    => array( 'assets/js/panel-opener.js', array( 'architrave-reading-panel' ), true ), /* the pill's drag (2026-09-22) */
		'architrave-space'           => array( 'assets/js/space.js', array(), true ), /* the Space dial's work, on Architrave and any theme (2026-09-25) */
		'architrave-dropcap'         => array( 'assets/js/dropcap.js', array(), true ), /* a drop cap only where the paragraph has room for it (2026-10-08) */
	);
	foreach ( $list as $handle => $item ) {
		wp_enqueue_script( $handle, $base . $item[0], $item[1], architrave_panel_asset_version( $item[0] ), array( 'in_footer' => $item[2] ) );
	}
}
add_action( 'wp_enqueue_scripts', 'architrave_panel_enqueue_scripts', 11 );

/**
 * THE PANEL'S STYLESHEET (0.5.0, theme 1.3.318): the panel's interface and
 * every style but Standard, cut out of the theme's style.css when the zips are
 * built. It must stand where those rules stood: directly after the theme's
 * sheet and BEFORE the theme's smaller sheets (the comments column, the
 * support card, the search …), which were written to come after style.css and
 * win ties against it. So every sheet that waits for `architrave-style` is
 * made to wait for this one too.
 *
 * A theme that still ships the whole style.css (1.3.317 and older) says so by
 * offering less than host level 3, and the sheet is not sent: the same rules
 * twice would be harmless, the order they would win in is not the old one.
 */
function architrave_panel_enqueue_styles() {
	$rel = 'assets/css/panel.css';
	$dir = plugin_dir_path( ARCHITRAVE_PANEL_FILE );
	if ( ! architrave_panel_runs() || ! file_exists( $dir . $rel ) ) {
		return;
	}
	/*
	 * A GUEST BRINGS THE VALUES TOO (0.8.0). panel.css reads 245 custom
	 * properties and sets none of them on a plain root: every definition it
	 * carries sits under a dial. On Architrave the theme's own sheet and the
	 * QDS sheets beneath it supply the rest; on a stranger's theme nothing
	 * does, and the panel's buttons, rows and swatches come out with no
	 * spacing, no borders and no text colour. panel-tokens.css is Standard's
	 * resting values for exactly those names, written by tools/panel-tokens.py.
	 * It sets variables and nothing else, so it cannot restyle the page it
	 * lands on, and it goes FIRST so a host theme that happens to use the same
	 * names still wins.
	 *
	 * Then panel-parts.css, the design-system components the panel wears (its
	 * buttons, its segmented rows, its sheet), and panel-shell.css, its frame.
	 * The order is the order Architrave loads them in: values, design system,
	 * theme, panel. Every rule in the two of them requires a class only the
	 * panel prints, so none of it can reach the page underneath.
	 */
	if ( architrave_panel_is_guest() ) {
		$url    = plugin_dir_url( ARCHITRAVE_PANEL_FILE );
		$deps = array();
		foreach ( array(
			'architrave-panel-tokens' => 'assets/css/panel-tokens.css',
			'architrave-panel-parts'  => 'assets/css/panel-parts.css',
			'architrave-panel-shell'  => 'assets/css/panel-shell.css',
		) as $handle => $part ) {
			if ( file_exists( $dir . $part ) ) {
				wp_enqueue_style( $handle, $url . $part, $deps, architrave_panel_asset_version( $part ) );
				$deps = array( $handle );
			}
		}
		/* Behind the guard on a guest (0.11.47, tools/split_style.py GUARD): the same rules, each one ID heavier, so the theme's own button and field rules cannot reach into the panel. */
		$guest_rel = file_exists( $dir . 'assets/css/panel-guest.css' ) ? 'assets/css/panel-guest.css' : $rel;
		wp_enqueue_style( 'architrave-panel', $url . $guest_rel, $deps, architrave_panel_asset_version( $guest_rel ) );
		architrave_panel_font_library();
		/*
		 * AND LAST, THE ROLE TABLE (0.9.0). The three sheets above draw the
		 * PANEL; this one is the only sheet the plugin has that touches the page
		 * it landed on. It goes last because it spends what the others set, and
		 * every rule in it is either gated on an attribute the reader's choice
		 * writes or rests at a value that changes nothing.
		 */
		if ( file_exists( $dir . 'assets/css/panel-page.css' ) ) {
			wp_enqueue_style( 'architrave-panel-page', $url . 'assets/css/panel-page.css', array( 'architrave-panel' ), architrave_panel_asset_version( 'assets/css/panel-page.css' ) );
			$palette_css = architrave_panel_guest_palette_css();
			if ( '' !== $palette_css ) {
				wp_add_inline_style( 'architrave-panel-page', $palette_css );
			}
			$other_css = architrave_panel_guest_other_side_css();
			if ( '' !== $other_css ) {
				wp_add_inline_style( 'architrave-panel-page', $other_css );
			}
		}
		return;
	}
	if ( ! defined( 'ARCHITRAVE_PANEL_HOST' ) || ARCHITRAVE_PANEL_HOST < 3 || ! wp_style_is( 'architrave-style', 'registered' ) ) {
		return;
	}
	wp_enqueue_style( 'architrave-panel', plugin_dir_url( ARCHITRAVE_PANEL_FILE ) . $rel, array( 'architrave-style' ), architrave_panel_asset_version( $rel ) );
	architrave_panel_font_library();
	foreach ( wp_styles()->registered as $handle => $style ) {
		if ( 'architrave-panel' !== $handle && in_array( 'architrave-style', $style->deps, true ) && ! in_array( 'architrave-panel', $style->deps, true ) ) {
			$style->deps[] = 'architrave-panel';
		}
	}
}
add_action( 'wp_enqueue_scripts', 'architrave_panel_enqueue_styles', 11 );

/**
 * THE FONT LIBRARY (2026-09-23). Seventy-four faces beyond the fifteen the
 * styles were built on, written by tools/font-library.py: their @font-face
 * rules and, per face, the reading rule, the interface rule and the tile
 * sample. They are NOT given to WordPress as theme data the way fonts.json's
 * are: that would put seventy-four more families in every editor's font
 * picker and print their @font-face rules into every page. As a stylesheet
 * they are one cached file, and a browser still fetches a font file only when
 * text is set in its face.
 */
function architrave_panel_font_library() {
	$rel = 'assets/css/font-library.css';
	if ( file_exists( plugin_dir_path( ARCHITRAVE_PANEL_FILE ) . $rel ) ) {
		wp_enqueue_style( 'architrave-font-library', plugin_dir_url( ARCHITRAVE_PANEL_FILE ) . $rel, array( 'architrave-panel' ), architrave_panel_asset_version( $rel ) );
	}
}

/**
 * The site's published styles: the theme's file, carried whole.
 *
 * LOADED AFTER THE THEME, NOT WITH THE PLUGIN (2026-09-21). Plugins load first,
 * so loading it here at once would define the theme's functions before a theme
 * that does not know the plugin (1.3.313 and older) requires its own copy: a
 * redeclared function, a fatal error, the whole site down, admin included. At
 * `after_setup_theme` the theme has spoken: a new one skipped its copy and the
 * plugin's is loaded; an old one loaded its own and the plugin's stays shut.
 * Its hooks (the route, the Customizer, the inline data at 11) all fire later,
 * and the inline data is still added after the scripts' hook above.
 */
function architrave_panel_load_site_styles() {
	$part = plugin_dir_path( ARCHITRAVE_PANEL_FILE ) . 'inc/site-styles.php';
	if ( architrave_panel_runs() && ! function_exists( 'architrave_site_styles' ) && file_exists( $part ) ) {
		require $part;
	}
}
add_action( 'after_setup_theme', 'architrave_panel_load_site_styles', 20 );

/**
 * THE STYLES' FONTS ARE THE PLUGIN'S (0.3.0, theme 1.3.316). Thirteen families
 * left the theme's theme.json for fonts.json here; the theme keeps the two
 * Standard is set in. They are given to WordPress as THEME data, the same
 * records under the same slugs, so everything downstream is what it was: the
 * --wp--preset--font-family--font-* variables the stylesheet and presets.js
 * name, the .has-*-font-family classes, the @font-face rules in
 * wp-fonts-local, the editor's font list. Only `src` differs: a full address
 * in this plugin's folder, because `file:./` is resolved against the theme.
 *
 * Plugins load before the theme, so the filter is in place before WordPress
 * first reads theme.json. Where the theme still has the families itself
 * (1.3.315 and older) nothing is added: a slug it already carries is skipped.
 */
function architrave_panel_font_families( $theme_json ) {
	static $families = null;
	if ( null === $families ) {
		$families = array();
		$file     = plugin_dir_path( ARCHITRAVE_PANEL_FILE ) . 'fonts.json';
		$data     = file_exists( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : null;
		if ( is_array( $data ) && ! empty( $data['fontFamilies'] ) ) {
			$base = plugin_dir_url( ARCHITRAVE_PANEL_FILE );
			foreach ( $data['fontFamilies'] as $family ) {
				foreach ( $family['fontFace'] as $i => $face ) {
					$family['fontFace'][ $i ]['src'] = array_map(
						static function ( $src ) use ( $base ) {
							return $base . ltrim( $src, '/' );
						},
						(array) $face['src']
					);
				}
				$families[] = $family;
			}
		}
	}
	if ( ! $families ) {
		return $theme_json;
	}
	$now   = $theme_json->get_data();
	$have  = isset( $now['settings']['typography']['fontFamilies'] ) ? $now['settings']['typography']['fontFamilies'] : array();
	/* In theme data the list may be flat or keyed by origin; read both. */
	if ( isset( $have['theme'] ) && is_array( $have['theme'] ) ) {
		$have = $have['theme'];
	}
	$slugs = wp_list_pluck( $have, 'slug' );
	$add   = array_values(
		array_filter(
			$families,
			static function ( $family ) use ( $slugs ) {
				return ! in_array( $family['slug'], $slugs, true );
			}
		)
	);
	if ( ! $add ) {
		return $theme_json;
	}
	/* The whole list, the theme's own first: a preset list is replaced by an update, not added to. */
	return $theme_json->update_with(
		array(
			'version'  => isset( $now['version'] ) ? $now['version'] : 3,
			'settings' => array( 'typography' => array( 'fontFamilies' => array_merge( array_values( $have ), $add ) ) ),
		)
	);
}
add_filter( 'wp_theme_json_data_theme', 'architrave_panel_font_families' );

/**
 * THE FOUR SVG FILTERS, WHERE THE PANEL IS A GUEST (0.9.0). Duotone, halftone,
 * dither and grain are drawn by filters the stylesheet names as
 * url(#architrave-…), and Architrave prints them at wp_body_open. A stranger's
 * theme has never heard of them, so those four picture looks came out blank
 * while the other five worked. The plugin carries the theme's own file, not a
 * copy of it, and prints it only where nothing else has: `function_exists` is
 * what keeps an Architrave of any age from a fatal redeclare, the same guard
 * architrave_panel_load_site_styles() uses.
 */
function architrave_panel_duotone_filters() {
	if ( ! architrave_panel_is_guest() || function_exists( 'architrave_duotone_filter' ) ) {
		return;
	}
	$file = plugin_dir_path( ARCHITRAVE_PANEL_FILE ) . 'inc/duotone-filter.php';
	if ( ! file_exists( $file ) ) {
		return;
	}
	require_once $file;
	architrave_duotone_filter();
}
add_action( 'wp_body_open', 'architrave_panel_duotone_filters' );

/**
 * THE ROWS THE PANEL PRESSES ARE THE PLUGIN'S (0.4.0, theme 1.3.317).
 *
 * The panel sets nothing itself: a tile, a font, a line spacing and the way
 * back are presses on four hidden rows that presets.js, reading-face.js and
 * reading-leading.js fill. Those rows stood in the theme's rail part; they are
 * brought from here now, ONLY WHERE THEY ARE MISSING, so a theme that still
 * has them (1.3.316 and older, or a rail part customised in the Site Editor)
 * is left alone.
 *
 * Into the rail's own settings group where there is one, in the places they
 * always had (Style first, the other three after Reading size), and BEFORE
 * the theme's own markup filters run (icons at 5, words at 10), so they are
 * drawn and translated like the rows beside them and the page is the same
 * element for element. Where no such group is rendered, the rows go into a
 * hidden box in the footer: the panel only needs them to exist.
 */
function architrave_panel_rows( $which ) {
	$rows = array(
		/*
		 * THE COLOURS AND THE READING SIZE ARE THE THEME'S OWN ROWS, and a guest
		 * has no rail to find them in (0.8.0). color-mode.js builds its segment
		 * and palette list into `[data-quire-modes="palette"]`, reading-scale.js
		 * builds its steps into `[data-quire-reading="menu"]`; the panel's Light
		 * / Dark / System row and its A / A stepper are presses on what those two
		 * scripts put there. Without the containers the scripts have nowhere to
		 * build, the presses land on nothing, and the buttons look broken while
		 * throwing no error at all - which is exactly how it looked on a stock
		 * theme: the tiles worked, the two rows above them did nothing.
		 *
		 * They are the theme's markup copied, trigger and container both, because
		 * color-mode.js reads the trigger to label the row. On a host these are
		 * never printed: the rail already has them.
		 */
		'guest' => '	<button type="button" class="quire-menu-item" aria-haspopup="menu" aria-expanded="false" data-branch="colour"><span class="quire-menu-icon" aria-hidden="true"><span data-quire-icon="sun-moon"></span></span><span class="quire-menu-label">Colours</span><span data-quire-icon="chevron-right" data-quire-icon-attrs=\'class="quire-menu-chevron"\'></span></button>
	<div class="quire-menu quire-surface rail-more-sub rail-more-sub-colour" data-quire-modes="palette" hidden></div>
	<button type="button" class="quire-menu-item" aria-haspopup="menu" aria-expanded="false" data-branch="reading"><span class="quire-menu-icon" aria-hidden="true"><span data-quire-icon="a-large-small"></span></span><span class="quire-menu-label">Reading size</span><span data-quire-icon="chevron-right" data-quire-icon-attrs=\'class="quire-menu-chevron"\'></span></button>
	<ul class="quire-menu quire-surface rail-more-sub rail-more-sub-reading" role="menu" aria-label="Reading size" data-quire-reading="menu" hidden></ul>
',
		'style' => '	<button type="button" class="quire-menu-item" aria-haspopup="menu" aria-expanded="false" data-branch="presets"><span class="quire-menu-icon" aria-hidden="true"><span data-quire-icon="swatch-book"></span></span><span class="quire-menu-label">Style</span><span data-quire-icon="chevron-right" data-quire-icon-attrs=\'class="quire-menu-chevron"\'></span></button>
	<ul class="quire-menu quire-surface rail-more-sub rail-more-sub-presets" role="menu" aria-label="Style" data-architrave-presets="menu" hidden></ul>
',
		'rest'  => '	<button type="button" class="quire-menu-item" aria-haspopup="menu" aria-expanded="false" data-branch="face"><span class="quire-menu-icon" aria-hidden="true"><span data-quire-icon="type"></span></span><span class="quire-menu-label">Font</span><span data-quire-icon="chevron-right" data-quire-icon-attrs=\'class="quire-menu-chevron"\'></span></button>
	<ul class="quire-menu quire-surface rail-more-sub rail-more-sub-face" role="menu" aria-label="Font" data-architrave-face="menu" hidden></ul>
	<button type="button" class="quire-menu-item" aria-haspopup="menu" aria-expanded="false" data-branch="leading"><span class="quire-menu-icon" aria-hidden="true"><span data-quire-icon="rows-3"></span></span><span class="quire-menu-label">Line spacing</span><span data-quire-icon="chevron-right" data-quire-icon-attrs=\'class="quire-menu-chevron"\'></span></button>
	<ul class="quire-menu quire-surface rail-more-sub rail-more-sub-leading" role="menu" aria-label="Line spacing" data-architrave-leading="menu" hidden></ul>
	<button type="button" class="quire-menu-item rail-more-reset" data-architrave-reset hidden><span class="quire-menu-icon" aria-hidden="true"><span data-quire-icon="rotate-ccw"></span></span><span class="quire-menu-label">Restore defaults</span></button>
',
	);
	/*
	 * A READER HAS NO FONT AND NO LINE SPACING ROW (2026-09-23): those are
	 * Customise's, and a reader's panel stops before Customise. The menus stay,
	 * since the panel presses its choices through them; only the two rows that
	 * open them go, and only for whoever may not publish.
	 */
	if ( 'rest' === $which && function_exists( 'architrave_site_styles_may_publish' ) && ! architrave_site_styles_may_publish() ) {
		foreach ( array( 'face', 'leading' ) as $branch ) {
			$rows['rest'] = str_replace( 'aria-expanded="false" data-branch="' . $branch . '"', 'aria-expanded="false" data-branch="' . $branch . '" hidden', $rows['rest'] );
		}
	}
	return $rows[ $which ];
}

function architrave_panel_rows_into_rail( $block_content ) {
	if ( ! is_string( $block_content ) || false === strpos( $block_content, 'rail-more-controls-rows' ) ) {
		return $block_content;
	}
	$GLOBALS['architrave_panel_rows_placed'] = true;
	if ( false !== strpos( $block_content, 'data-architrave-presets' ) ) {
		return $block_content; /* the page has its own */
	}
	$colour  = strpos( $block_content, '<button type="button" class="quire-menu-item" aria-haspopup="menu" aria-expanded="false" data-branch="colour"' );
	$reading = strpos( $block_content, 'data-quire-reading="menu" hidden></ul>' );
	if ( false === $colour || false === $reading || $reading < $colour ) {
		$GLOBALS['architrave_panel_rows_placed'] = false; /* a group of another shape: the footer's box, below */
		return $block_content;
	}
	$after = $reading + strlen( 'data-quire-reading="menu" hidden></ul>' );
	/* The later place first, so the earlier offset stays true. */
	$block_content = substr( $block_content, 0, $after ) . "\n" . rtrim( architrave_panel_rows( 'rest' ), "\n" ) . substr( $block_content, $after );
	$line_start    = strrpos( substr( $block_content, 0, $colour ), "\n" );
	$at            = false === $line_start ? $colour : $line_start + 1;
	return substr( $block_content, 0, $at ) . architrave_panel_rows( 'style' ) . substr( $block_content, $at );
}
add_filter( 'render_block', 'architrave_panel_rows_into_rail', 4 );

function architrave_panel_rows_in_footer() {
	if ( ! architrave_panel_runs() || ! empty( $GLOBALS['architrave_panel_rows_placed'] ) ) {
		return;
	}
	$guest = architrave_panel_is_guest() ? architrave_panel_rows( 'guest' ) : '';
	echo '<div class="architrave-panel-rows" hidden aria-hidden="true">' . $guest . architrave_panel_rows( 'style' ) . architrave_panel_rows( 'rest' ) . '</div>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- fixed markup, written above.
}
add_action( 'wp_footer', 'architrave_panel_rows_in_footer', 1 );

/**
 * ONE DOOR, ONE PLACE (0.8.0 for guests; every host since 2026-09-22). On
 * Architrave the panel was opened from the rail's Aa, and on a stranger's theme
 * from a button the plugin put in the corner: the same panel behind two doors
 * that looked nothing alike. Manuel: "it's just the same panel, maybe we should
 * make a spot and fix the positioning at an upper level, hovering in the center
 * of the screen at the bottom, at a nice distance, so it would be there always."
 * So the plugin prints its own door everywhere it runs: a pill at the foot of
 * the window, centred, the panel's own word and a chevron that turns when the
 * panel is up. It can be dragged anywhere and remembers where it was put
 * (panel-opener.js); a double press sends it home. On Architrave above the
 * phone breakpoint the rail's Aa steps back for it; on a phone Architrave's own
 * bar at the foot keeps the door, since the pill would stand on that bar.
 * reading-panel.js finds the pill by the attribute it already looks for, and
 * anchors the panel over it, centred (anchor()).
 */
/**
 * ONE GLYPH FOR THE PLUGIN'S OWN MARKUP. The theme draws its icons in PHP
 * (`architrave_icon`) and the placeholder spans a template part carries are
 * replaced at render time; nothing hydrates a placeholder a plugin printed into
 * wp_footer, so the pill's chevron was a span that stayed a span (measured
 * 2026-09-22). The drawing is not copied here: `inc/quire-icons.php` is the
 * theme's own registry, shipped with the plugin as the duotone filters are.
 */
function architrave_panel_icon( $name, $attrs = '' ) {
	if ( function_exists( 'architrave_icon' ) ) {
		return architrave_icon( $name, $attrs ); /* the theme's, where there is one */
	}
	static $icons = null;
	if ( null === $icons ) {
		$file  = plugin_dir_path( ARCHITRAVE_PANEL_FILE ) . 'inc/quire-icons.php';
		$icons = is_readable( $file ) ? (array) require $file : array();
	}
	if ( ! isset( $icons[ $name ] ) ) {
		return '';
	}
	return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"'
		. ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"'
		. ( $attrs ? ' ' . $attrs : '' ) . '>' . $icons[ $name ] . '</svg>';
}

/**
 * THE PANEL'S RULES IN THIS BLOCK CARRY THE GUARD ON A GUEST (2026-09-24, Ollie
 * and Neve FSE: "section titles don't open"). Since 0.11.47 every rule that draws
 * the panel on another theme is one ID heavier, and the panel's buttons start
 * from `all: revert` at that weight (split_style.GUARD). The rules written here,
 * in the plugin's own <style>, were left at their class weight, so the reset and
 * the guarded sheet beat them: a folded group stayed open (`.reading-tiles
 * { display: grid }` outweighed `[data-folded] { display: none }`) and the group
 * titles were drawn as the browser's own grey buttons. On a guest every selector
 * here that begins at the panel is written behind the guard as well. The door's
 * rules are not: its look is this block's alone, and the reset breaks it. On
 * Architrave nothing changes.
 */
function architrave_panel_guard_block( $css, $guest ) {
	if ( ! $guest ) {
		return $css;
	}
	$css = preg_replace( '#/\*.*?\*/#s', '', $css ); /* a comment may hold a brace or a comma */
	return preg_replace_callback(
		'/(^|[{};])(\s*)([^{};@]+)\{/',
		static function ( $m ) {
			$parts = array_map(
				static function ( $sel ) {
					$t = ltrim( $sel );
					return 0 === strpos( $t, '.reading-panel' ) ? ' :not(#live-design-panel-guard) ' . $t : $sel;
				},
				explode( ',', $m[3] )
			);
			return $m[1] . $m[2] . implode( ',', $parts ) . '{';
		},
		$css
	);
}

/**
 * THE OWNER'S SETTINGS FOR THE DOOR (2026-09-23, the Vibetiles button page),
 * read in one place: the markup in wp_footer and the stylesheet delivery at
 * enqueue time both ask this, so the two cannot disagree within a request.
 *
 * @return array
 */
function architrave_panel_button_settings() {
	$site = function_exists( 'architrave_site_styles' ) ? architrave_site_styles() : array();
	$bt   = isset( $site['button'] ) ? $site['button'] : array( 'place' => 'auto', 'size' => 'medium', 'color' => 'panel', 'who' => 'everyone', 'aurora' => true );
	return array_merge( array( 'icon' => true, 'label' => '', 'show' => 'hover', 'corners' => 'site', 'glyph' => 'sliders' ), $bt );
}

/**
 * THE BUTTON'S ICON AS CHOSEN (2026-09-28, the lab's Icon row): the sliders, Aa,
 * a sparkle or a brush. Lucide's drawings (ISC), the same the panel-opener swaps in.
 *
 * @return string markup
 */
function architrave_panel_door_glyph() {
	$bt = architrave_panel_button_settings();
	switch ( isset( $bt['glyph'] ) ? $bt['glyph'] : 'sliders' ) {
		case 'aa':
			return '<span class="ldp-glyph-aa" aria-hidden="true">Aa</span>';
		case 'sparkles':
			return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>';
		case 'brush':
			return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m14.622 17.897-10.68-2.913"/><path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z"/><path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15"/></svg>';
	}
	return architrave_panel_icon( 'sliders-horizontal' );
}

/**
 * THE DOOR'S STYLESHEET (assets/css/door.css; it was this file's own <style>
 * block in wp_footer until 2026-09-25). Delivered through wp_add_inline_style
 * on a handle of its own, registered without a source, so nothing is echoed by
 * hand; enqueued at priority 12, after every sheet the plugin and the theme
 * enqueue at 10 and 11, because the door's transition and the seam's rules must
 * stand later in the cascade than style.css and panel.css (putting them in
 * style.css does nothing, measured 2026-09-22). On a guest the panel's rules in
 * it are written behind the guard here, exactly as the footer block was.
 */
function architrave_panel_door_styles() {
	if ( ! architrave_panel_runs() ) {
		return;
	}
	$deps = array();
	foreach ( array( 'architrave-panel-page', 'architrave-panel' ) as $handle ) {
		if ( wp_style_is( $handle, 'enqueued' ) ) {
			$deps = array( $handle );
			break;
		}
	}
	wp_register_style( 'architrave-panel-door', false, $deps, architrave_panel_asset_version( 'assets/css/door.css' ) );
	wp_enqueue_style( 'architrave-panel-door' );
	$bt = architrave_panel_button_settings();
	/* ONLY ME: a reader gets no door at all, the theme's own ones included. */
	if ( 'me' === $bt['who'] && ! current_user_can( 'edit_theme_options' ) ) {
		wp_add_inline_style( 'architrave-panel-door', '[data-reading-panel-open]{display:none!important}.paper-stack-item:has(> .rail-reading-btn){display:none}' );
		return;
	}
	$file = plugin_dir_path( ARCHITRAVE_PANEL_FILE ) . 'assets/css/door.css';
	if ( ! is_readable( $file ) ) {
		return;
	}
	$guest = architrave_panel_is_guest();
	$css   = (string) file_get_contents( $file ); // phpcs:ignore WordPressVIPMinimum.Performance.FetchingRemoteData.FileGetContentsUnknown -- the plugin's own stylesheet.
	if ( ! $guest ) {
		/* ONE DOOR (see the note in door.css): Architrave's own two step back
		   for the pill. Host-only, since a sheet cannot ask who the host is.
		   PREPENDED, never appended: the slot beside the focus button is the
		   same `.paper-stack-item` that holds the theme's Aa, so this hide and
		   door.css's `:has(> .architrave-panel-opener)` un-hide tie on
		   specificity and the LATER one wins. Appended, the docked slot stayed
		   display:none and the door never docked (found by the judge,
		   2026-09-25). */
		/* BUT THE SQUARE IN THE SLOT COMES BACK WHEN THE DOOR DOCKS THERE
		   (2026-09-30, panel-opener.js toSlot): marked data-live-design-twin it
		   is the button, and the door beside it is the one out of sight. */
		$css = "[data-reading-panel-open]:not(.architrave-panel-opener):not([data-live-design-twin]){display:none!important}\n.paper-stack-item:has(> .rail-reading-btn){display:none}\n" . $css;
	}
	wp_add_inline_style( 'architrave-panel-door', architrave_panel_guard_block( $css, $guest ) );
}
add_action( 'wp_enqueue_scripts', 'architrave_panel_door_styles', 12 );

function architrave_panel_guest_button() {
	if ( ! architrave_panel_runs() ) {
		return;
	}
	$bt      = architrave_panel_button_settings();
	$bt_word = '' !== $bt['label'] ? $bt['label'] : __( 'Vibetiles', 'vibetiles' );
	/* ONLY ME: no button for a reader (its stylesheet hides the theme's own doors too). */
	if ( 'me' === $bt['who'] && ! current_user_can( 'edit_theme_options' ) ) {
		return;
	}
	?>
<button type="button" class="architrave-panel-opener"<?php echo 'own' === $bt['color'] && ! empty( $bt['own'] ) ? ' style="--opener-own:' . esc_attr( $bt['own'] ) . '"' : ''; ?> data-place="<?php echo esc_attr( $bt['place'] ); ?>" data-match="<?php echo 'auto' === $bt['place'] ? 'true' : 'false'; ?>" data-size="<?php echo esc_attr( $bt['size'] ); ?>" data-color="<?php echo esc_attr( $bt['color'] ); ?>" data-aurora="<?php echo $bt['aurora'] ? 'true' : 'false'; ?>" data-band="<?php echo esc_attr( isset( $bt['band'] ) ? $bt['band'] : 'dusk' ); ?>" data-icon="<?php echo $bt['icon'] ? 'true' : 'false'; ?>" data-show="<?php echo esc_attr( $bt['show'] ); ?>" data-corners="<?php echo esc_attr( $bt['corners'] ); ?>" data-named="<?php echo '' !== $bt['label'] ? 'true' : 'false'; ?>" data-reading-panel-open aria-haspopup="dialog" aria-expanded="false" aria-keyshortcuts="Alt+D" aria-label="<?php echo esc_attr( $bt_word ); ?>">
	<span class="opener-icon" aria-hidden="true"><?php echo architrave_panel_door_glyph(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- fixed markup. ?></span>
	<span class="opener-word" aria-hidden="true"><span><span><?php echo esc_html( $bt_word ); ?></span></span></span>
</button>
	<?php
}
add_action( 'wp_footer', 'architrave_panel_guest_button', 2 );

/**
 * Say plainly where the plugin stands: only an Architrave from before the split
 * leaves it with nothing to do, and that is the one case worth a warning.
 */
function architrave_panel_host_notice() {
	if ( architrave_panel_runs() || ! current_user_can( 'activate_plugins' ) ) {
		return;
	}
	$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
	if ( ! $screen || 'plugins' !== $screen->id ) {
		return;
	}
	echo '<div class="notice notice-warning"><p>' . esc_html__( 'The Architrave theme on this site is older than 1.3.315 and still carries its own panel, so Vibetiles is standing back. Update the theme to hand the panel over.', 'vibetiles' ) . '</p></div>';
}
add_action( 'admin_notices', 'architrave_panel_host_notice' );
