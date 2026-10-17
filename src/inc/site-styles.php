<?php
/**
 * THE SITE'S STYLES (2026-09-18).
 *
 * Until today a style lived in one browser. The panel could save a look as a
 * tile, update it, copy it as text and paste it back, and none of it reached
 * anyone else: the record sat in localStorage, and the theme's PHP knew
 * nothing about tiles. Manuel: "to make it really useful, someone using the
 * theme should be able to style a new tile and make this the default,
 * visible for everyone seeing that site."
 *
 * So a style has a place on the server now. This file is that place, and
 * nothing more: it does not draw, it does not decide what a style is. The
 * record it stores is the very JSON the panel's Kopieren puts on the
 * clipboard, and presets.js reads it back exactly as it reads a pasted one.
 *
 * WHAT IS STORED: one option, `architrave_panel_site_styles`, a JSON string:
 *
 *     { "styles": [ { "id": "site-…", "label": "…", …the record… } ],
 *       "default": "site-…" }
 *
 * An option since 0.6.0, so the styles belong to the SITE and survive a
 * theme change; the old theme mod `architrave_site_styles` is read as a
 * fall-back and never deleted. It shows in the Customizer as one field a
 * person can read, clear or paste into. The list may hold several looks
 * (Manuel, 2026-09-18: "a list, one is default"); the default is what a
 * first visit opens in, in place of Standard. A reader who has chosen a
 * style keeps it: their choice is in their browser, and the site's default
 * only speaks where nothing has been said.
 *
 * WHO MAY WRITE: whoever may edit theme options, so administrators
 * (Manuel, 2026-09-18). The panel shows its publish buttons to them alone;
 * the route checks the same capability and a REST nonce, whoever calls it.
 *
 * HOW IT REACHES THE PAGE: printed inline before presets.js, as the words
 * are, so the site's styles are styles on first paint and the default
 * never flashes in late. The same route answers GET without a login, so
 * anything that wants to read the site's looks, another site, an
 * assistant, can.
 *
 * @package Vibetiles
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The stored state, always in shape.
 *
 * @return array{styles: array<int, array<string, mixed>>, default: string}
 */
/**
 * WHERE THE STATE IS KEPT (plugin 0.6.0): a site option, `architrave_panel_site_styles`.
 * It was a theme mod, `architrave_site_styles`, while the panel was the theme's;
 * a theme mod belongs to one theme and is gone from view the day the site wears
 * another, and the published styles are the site's. The mod is still READ where
 * the option has never been written, and is never deleted: a site that goes
 * back to an older plugin finds its styles where it left them.
 */
function architrave_site_styles_raw() {
	$raw = get_option( 'architrave_panel_site_styles', null );
	if ( null === $raw || false === $raw ) {
		$raw = get_theme_mod( 'architrave_site_styles', '' );
	}
	return is_string( $raw ) ? $raw : '';
}

function architrave_site_styles() {
	$raw   = architrave_site_styles_raw();
	$state = is_string( $raw ) && '' !== $raw ? json_decode( $raw, true ) : null;
	return architrave_site_styles_stamped( architrave_site_styles_clean( is_array( $state ) ? $state : array() ) );
}

/**
 * THE STATE CARRIES A STAMP (1.4.92, 2026-10-11). Every write raises it, every
 * answer names it, and a page that already holds a newer stamp than the one a
 * GET brings back knows that answer is an older copy of the site (a replica or
 * a cache answering after a write) and lets it go. Without it the page took the
 * older copy for the site's truth, and the change it had just saved was undone
 * on the page and, with the next save, on the site (Manuel: "I change something
 * in the other row and afterwards on the main row, it changes the other row").
 * Milliseconds, never less than the stamp before plus one, so it only rises.
 *
 * @return int
 */
function architrave_site_styles_stamp() {
	return (int) get_option( 'architrave_panel_site_styles_stamp', 0 );
}

/**
 * The state with its stamp.
 *
 * @param array $state A clean state.
 * @return array
 */
function architrave_site_styles_stamped( $state ) {
	$state['stamp'] = architrave_site_styles_stamp();
	return $state;
}

/**
 * The state as it is written: every record sanitised, ids unique and
 * site-prefixed, the default one of the ids or empty.
 *
 * @param array $state Whatever came in.
 * @return array{styles: array<int, array<string, mixed>>, default: string}
 */
function architrave_site_styles_clean( $state ) {
	$styles = array();
	$seen   = array();
	if ( isset( $state['styles'] ) && is_array( $state['styles'] ) ) {
		foreach ( $state['styles'] as $record ) {
			$clean = architrave_site_style_record( $record );
			if ( null === $clean || isset( $seen[ $clean['id'] ] ) ) {
				continue;
			}
			$seen[ $clean['id'] ] = true;
			$styles[]             = $clean;
			if ( count( $styles ) >= 24 ) {
				break;
			}
		}
	}
	$default = isset( $state['default'] ) && is_string( $state['default'] ) ? $state['default'] : '';
	/* A BUILT-IN STYLE MAY BE THE DEFAULT TOO (2026-09-23: Book, Poster …), named
	   by its slug; a published one must exist. On Architrave Classic ('standard')
	   is no default, it is what none is; on another theme that is the theme's own
	   look, and Classic may be the default like any style (2026-09-24). */
	$built_in = (bool) preg_match( '/^[a-z][a-z0-9-]{0,30}$/', $default ) && 0 !== strpos( $default, 'site-' );
	$guest    = function_exists( 'architrave_panel_is_guest' ) && architrave_panel_is_guest();
	if ( 'host' === $default || ( 'standard' === $default && ! $guest ) || ( '' !== $default && ! isset( $seen[ $default ] ) && ! $built_in ) ) {
		$default = '';
	}
	/*
	 * THE READER'S TWO (2026-09-23): the styles the owner hands readers beside
	 * the site's own. Null until the owner has picked, which the panel reads as
	 * Standard and Book. A built-in style's id is not known here, so any short
	 * slug is kept; one that names nothing is simply not offered.
	 */
	$readers = null;
	if ( isset( $state['readers'] ) && is_array( $state['readers'] ) ) {
		$readers = array();
		foreach ( $state['readers'] as $reader_id ) {
			/* a published style that is gone is dropped (2026-10-01, the panel audit: Remove from Site left its id in the list for good) */
			if ( is_string( $reader_id ) && 0 === strpos( $reader_id, 'site-' ) && ! isset( $seen[ $reader_id ] ) ) {
				continue;
			}
			if ( is_string( $reader_id ) && preg_match( '/^[a-z0-9-]{1,48}$/', $reader_id ) && ! in_array( $reader_id, $readers, true ) ) {
				$readers[] = $reader_id;
			}
			/* As many as the owner likes since 2026-09-23 (it was two); the cap only guards the stored row. */
			if ( count( $readers ) >= 64 ) {
				break;
			}
		}
	}
	/* THE STARTER STYLES (0.57.0, 2026-10-16; Manuel: "there should be some styles coming with it, but … if we don't like
	   them, to delete them"): which published style each starter became, by its slug, so Restore Starter Styles knows
	   which are gone. It replaces THE BASE STYLES of 0.48.0 (five styles the remove action refused): only Original, the
	   theme's own look, stays for good now; every site style can go. Slugs of styles that no longer exist are dropped. */
	$starters = array();
	if ( isset( $state['starters'] ) && is_array( $state['starters'] ) ) {
		foreach ( $state['starters'] as $slug => $starter_id ) {
			if ( is_string( $slug ) && preg_match( '/^[a-z][a-z0-9-]{0,30}$/', $slug ) && is_string( $starter_id ) && isset( $seen[ $starter_id ] ) ) {
				$starters[ $slug ] = $starter_id;
			}
		}
	}
	return array(
		'styles'  => $styles,
		'default' => $default,
		'readers' => $readers,
		'starters' => $starters,
		/* READERS MAY COPY A STYLE (2026-09-23): off until the owner says so. */
		'readersCopy' => ! empty( $state['readersCopy'] ),
		/* THE LIVE DESIGN BUTTON (2026-09-23): where the door sits and how it looks. */
		'button'      => architrave_site_styles_button( isset( $state['button'] ) ? $state['button'] : null ),
	);
}

/**
 * THE LIVE DESIGN BUTTON'S SETTINGS (Manuel, 2026-09-23, lab/the-button-page.html:
 * "the location where the button sits is different on every website … finding
 * that spot makes it look like it belongs to that site"). One short record,
 * every value from a closed list, so what is printed is always one of these.
 * Automatic and Match my site are the defaults: the door finds its spot and
 * takes its neighbour's size, corner and colour. Slimmed the same evening:
 * no phone place, no Show and no Corners (a phone takes the bottom of the
 * same side, the size decides what shows, the corner is the site's). And no
 * Match my site: a button that Automatic sets among the site's own always
 * wears theirs, and Size and Colour belong to a button in a place picked on
 * the map (Manuel, 2026-09-23, a large button beside the small focus button).
 */
function architrave_site_styles_button( $raw ) {
	$raw   = is_array( $raw ) ? $raw : array();
	$lists = array(
		'place' => array( 'auto', 'bottom-center', 'bottom-left', 'bottom-right', 'top-left', 'top-right', 'left', 'right' ),
		'fixed' => array( 'bottom-center', 'bottom-left', 'bottom-right', 'top-left', 'top-right', 'left', 'right' ), /* the map's last pick */
		'size'  => array( 'medium', 'small', 'large' ),
		'color' => array( 'panel', 'site', 'own' ), /* own: the colour in 'own' below (2026-09-28, the lab's Own Colour…) */
		'who'   => array( 'everyone', 'me' ),
		/* WHAT IT SHOWS AND ITS CORNER, THEIR OWN SETTINGS (Manuel, 2026-09-24: "the size and
		   the way it behaves … two different settings"). The size is only its size now. */
		'show'    => array( 'hover', 'icon', 'both' ),
		'corners' => array( 'site', 'round' ),
		/* THE AURORA'S COLOURS (2026-09-28, the prototype's Settings › Aurora): dusk, as it always was, first */
		'band'    => array( 'dusk', 'ocean', 'meadow', 'candy', 'ember', 'mono' ),
		/* THE BUTTON'S ICON (2026-09-28, the lab's Icon row): the sliders, as it always was, first */
		'glyph'   => array( 'sliders', 'aa', 'sparkles', 'brush' ),
	);
	if ( ! isset( $raw['show'] ) && isset( $raw['size'] ) ) {
		$raw['show'] = 'small' === $raw['size'] ? 'icon' : ( 'large' === $raw['size'] ? 'both' : 'hover' ); /* what the size showed until 2026-09-24, so no button changes by itself */
	}
	if ( isset( $raw['color'] ) && 'accent' === $raw['color'] ) {
		$raw['color'] = 'site'; /* Accent and Site buttons became one choice (2026-09-23) */
	}
	$out = array();
	foreach ( $lists as $key => $allowed ) {
		$out[ $key ] = isset( $raw[ $key ] ) && in_array( $raw[ $key ], $allowed, true ) ? $raw[ $key ] : $allowed[0];
	}
	$out['aurora']  = isset( $raw['aurora'] ) ? (bool) $raw['aurora'] : true;
	/* IN A MENU, ITS NAME AND ITS ICON ARE THE OWNER'S (Manuel, 2026-09-24): a menu
	   item among words may want no icon, or another word. Empty is Live Design, in
	   the reader's language. */
	$own         = isset( $raw['own'] ) && is_string( $raw['own'] ) ? sanitize_hex_color( $raw['own'] ) : '';
	$out['own']  = $own ? strtolower( $own ) : '#0a84ff';
	$out['icon']  = isset( $raw['icon'] ) ? (bool) $raw['icon'] : true;
	$out['label'] = isset( $raw['label'] ) && is_string( $raw['label'] ) ? mb_substr( trim( sanitize_text_field( $raw['label'] ) ), 0, 30 ) : '';
	return $out;
}

/**
 * One record, sanitised. The record is the panel's export: a flat set of
 * slugs and switches, a roles table two levels deep, and a colours table
 * with hex values. The JS is what interprets the keys and drops the ones it
 * does not know; here the concern is only that nothing but short plain
 * values gets stored or printed.
 *
 * @param mixed $record Whatever came in.
 * @return array<string, mixed>|null the record, or null when it is no record.
 */
function architrave_site_style_record( $record ) {
	if ( ! is_array( $record ) ) {
		return null;
	}
	/* ID AND LABEL FIRST (2026-09-26, Manuel: a duplicated tile "always jumps back
	   into hidden"). The route appends the new site- id as the record's LAST key,
	   and the cleaner below keeps a bounded number of keys per level: the export
	   had grown to 57 dials, the cap was 48, so the id was cut off and every
	   publish answered "That is not a style" while no publish landed at all. The
	   two keys that make a record a record go first now, so no cap can reach them. */
	$record = array(
		'id'    => isset( $record['id'] ) ? $record['id'] : '',
		'label' => isset( $record['label'] ) ? $record['label'] : '',
	) + $record;
	/* The common word with a hyphen an AI may write for Soft text (2026-10-03): read before the keys are cleaned, which keep no hyphen. */
	if ( isset( $record['colours'] ) && is_array( $record['colours'] ) ) {
		foreach ( $record['colours'] as $side => $colours ) {
			if ( is_array( $colours ) && isset( $colours['muted-foreground'] ) && ! isset( $colours['mutedText'] ) ) {
				$record['colours'][ $side ]['mutedText'] = $colours['muted-foreground'];
			}
		}
	}
	$clean = architrave_site_style_values( $record, 0 );
	if ( ! is_array( $clean ) ) {
		return null;
	}
	$id = isset( $clean['id'] ) && is_string( $clean['id'] ) ? $clean['id'] : '';
	if ( ! preg_match( '/^site-[a-z0-9]{1,24}$/', $id ) ) {
		return null;
	}
	$label = isset( $clean['label'] ) && is_string( $clean['label'] ) ? trim( $clean['label'] ) : '';
	if ( '' === $label ) {
		return null;
	}
	$clean['id']         = $id;
	$clean['label']      = $label;
	$clean['architrave'] = isset( $clean['architrave'] ) && in_array( (int) $clean['architrave'], array( 2, 3 ), true ) ? (int) $clean['architrave'] : 1; /* 2: the seven type roles (2026-10-02); 3: the seven colours (2026-10-03); the panel reads older ones into them */
	unset( $clean['own'], $clean['site'] );
	return $clean;
}

/**
 * Values, recursively: booleans, numbers, short strings without markup, and
 * tables of those, three levels deep at most. Keys are short words.
 *
 * @param mixed $value The value.
 * @param int   $depth How deep this is.
 * @return mixed the clean value, or null when it cannot be kept.
 */
function architrave_site_style_values( $value, $depth ) {
	if ( is_bool( $value ) ) {
		return $value;
	}
	if ( is_int( $value ) || is_float( $value ) ) {
		return $value;
	}
	if ( is_string( $value ) ) {
		$value = sanitize_text_field( $value );
		return mb_substr( $value, 0, 64 );
	}
	// Five levels: the record, roles, one role, its members, one member
	// (roles.ui.members.masthead.size, 2026-09-18). Three cut the members off.
	if ( is_array( $value ) && $depth < 5 ) {
		$out = array();
		foreach ( $value as $key => $item ) {
			if ( ! is_string( $key ) || ! preg_match( '/^[A-Za-z][A-Za-z0-9]{0,31}$/', $key ) ) {
				continue;
			}
			$clean = architrave_site_style_values( $item, $depth + 1 );
			if ( null !== $clean ) {
				$out[ $key ] = $clean;
			}
			/* 256 since 2026-10-01 (128 since 2026-09-26, 48 before; the export had 57
			   keys then and 113 now; see architrave_site_style_record).
			   tools/check-site-styles.py fails the build when the export's key count
			   comes near this again; until 2026-10-01 it missed the 54 keys the PICKS
			   loop writes and said 60. */
			if ( count( $out ) >= 256 ) {
				break;
			}
		}
		return $out;
	}
	return null;
}

/**
 * Write the state.
 *
 * @param array $state The state to keep.
 * @return array the state as written.
 */
function architrave_site_styles_write( $state ) {
	$state = architrave_site_styles_clean( $state );
	update_option( 'architrave_panel_site_styles', wp_json_encode( $state ), true ); /* autoloaded: read on every page */
	$stamp = max( architrave_site_styles_stamp() + 1, (int) floor( microtime( true ) * 1000 ) );
	update_option( 'architrave_panel_site_styles_stamp', $stamp, true ); /* autoloaded with the state: printed into every page beside it */
	$state['stamp'] = $stamp;
	return $state;
}

/**
 * VERSIONS (2026-09-27, Manuel chose "Last 20"): each time a published style is
 * published again, the record it replaces is kept, the twenty newest per style,
 * so the owner can look at an earlier one on the page and bring it back. Kept in
 * an option of its own that is NOT autoloaded: readers never load it, and the
 * published styles printed into every page stay as small as they were. Only
 * whoever may publish can read it (the route below). The versions a browser
 * keeps as its owner works are that browser's own (presets.js).
 *
 *     { "styles": { "site-…": [ { "t": 1790000000, "record": {…} }, … ] },
 *       "at": { "site-…": 1790000000 } }
 *
 * `at` is when each style was last published, so a kept record says when it
 * went up, not when it was replaced.
 */
const ARCHITRAVE_STYLE_VERSIONS_KEEP = 20;

/**
 * The kept versions, always in shape.
 *
 * @return array{styles: array<string, array<int, array{t: int, record: array}>>, at: array<string, int>}
 */
function architrave_style_versions() {
	$raw = json_decode( (string) get_option( 'architrave_panel_style_versions', '' ), true );
	$out = array(
		'styles' => array(),
		'at'     => array(),
		'kept'   => array(),
		'start'  => array(),
	);
	if ( ! is_array( $raw ) ) {
		return $out;
	}
	foreach ( ( is_array( $raw['start'] ?? null ) ? $raw['start'] : array() ) as $id => $rec ) { /* where a style began (0.34.0) */
		$record = is_string( $id ) && preg_match( '/^site-[a-z0-9]{1,24}$/', $id ) && is_array( $rec ) ? architrave_site_style_record( $rec ) : null;
		if ( null !== $record ) {
			$out['start'][ $id ] = $record;
		}
	}
	foreach ( ( is_array( $raw['styles'] ?? null ) ? $raw['styles'] : array() ) as $id => $list ) {
		if ( ! is_string( $id ) || ! preg_match( '/^site-[a-z0-9]{1,24}$/', $id ) || ! is_array( $list ) ) {
			continue;
		}
		foreach ( $list as $v ) {
			$record = is_array( $v ) && is_array( $v['record'] ?? null ) ? architrave_site_style_record( $v['record'] ) : null;
			if ( null !== $record ) {
				$out['styles'][ $id ][] = array(
					't'      => (int) ( $v['t'] ?? 0 ),
					'record' => $record,
				);
			}
		}
	}
	foreach ( ( is_array( $raw['at'] ?? null ) ? $raw['at'] : array() ) as $id => $t ) {
		if ( is_string( $id ) && preg_match( '/^site-[a-z0-9]{1,24}$/', $id ) ) {
			$out['at'][ $id ] = (int) $t;
		}
	}
	foreach ( ( is_array( $raw['kept'] ?? null ) ? $raw['kept'] : array() ) as $id => $t ) { /* when a version was last kept (0.31.0) */
		if ( is_string( $id ) && preg_match( '/^site-[a-z0-9]{1,24}$/', $id ) ) {
			$out['kept'][ $id ] = (int) $t;
		}
	}
	return $out;
}

/**
 * A publish passes through here: the record it replaces is kept (newest first,
 * twenty at most), a style that goes takes its versions with it.
 *
 * @param string     $id       The style.
 * @param array|null $replaced The record that stood before, or null.
 * @param bool       $gone     Whether the style was removed.
 * @param array|null $start    The record a new style begins as.
 */
function architrave_style_versions_note( $id, $replaced, $gone = false, $start = null ) {
	$v = architrave_style_versions();
	if ( $gone ) {
		unset( $v['styles'][ $id ], $v['at'][ $id ], $v['kept'][ $id ], $v['start'][ $id ] );
	} else {
		/* WHERE A STYLE BEGAN (0.34.0, Manuel: "I can't see a button where I can bring it back to the original version"):
		   kept once, never replaced by a later save, so Reset Style has something to go back to however long the style has
		   saved itself since. A style that began before this was kept starts from what it was when it was first saved here. */
		if ( ! isset( $v['start'][ $id ] ) ) {
			$first = is_array( $start ) ? $start : ( is_array( $replaced ) ? $replaced : null );
			if ( null !== $first ) {
				$v['start'][ $id ] = $first;
			}
		}
		/* A VERSION AT MOST EVERY TEN MINUTES (0.31.0): a style on the site saves itself a moment after each
		   change now, so keeping every replaced record would spend the twenty on one evening's slider. The
		   first save after a pause keeps what stood before it; the saves that follow within ten minutes
		   replace without keeping. */
		$kept = (int) ( $v['kept'][ $id ] ?? 0 );
		if ( is_array( $replaced ) && time() - $kept >= 600 ) {
			$v['kept'][ $id ] = time();
			$list = $v['styles'][ $id ] ?? array();
			array_unshift(
				$list,
				array(
					't'      => (int) ( $v['at'][ $id ] ?? 0 ),
					'record' => $replaced,
				)
			);
			$v['styles'][ $id ] = array_slice( $list, 0, ARCHITRAVE_STYLE_VERSIONS_KEEP );
		}
		$v['at'][ $id ] = time();
	}
	update_option( 'architrave_panel_style_versions', wp_json_encode( $v ), false ); /* not autoloaded: only the owner's Versions page reads it */
}

/**
 * GET architrave/v1/site-styles/versions: the kept versions, for whoever may publish.
 */
function architrave_style_versions_route() {
	register_rest_route(
		'architrave/v1',
		'/site-styles/versions',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'permission_callback' => 'architrave_site_styles_may_publish',
			'callback'            => static function () {
				return rest_ensure_response( architrave_style_versions() );
			},
		)
	);
}
add_action( 'rest_api_init', 'architrave_style_versions_route' );

/**
 * The Customizer's sanitiser: a pasted JSON string comes back as the clean
 * JSON string, an empty field stays empty, anything else is refused.
 *
 * @param mixed $raw The field.
 * @return string
 */
function architrave_site_styles_sanitize( $raw ) {
	if ( ! is_string( $raw ) || '' === trim( $raw ) ) {
		return '';
	}
	$state = json_decode( $raw, true );
	if ( ! is_array( $state ) ) {
		return architrave_site_styles_raw();
	}
	return wp_json_encode( architrave_site_styles_clean( $state ) );
}

/**
 * THE STARTER STYLES (0.57.0, 2026-10-16). Five records travel with the plugin
 * (plugin/starters/*.json: Book, Soft, Still, Essay and Clear, the reading styles
 * of elmastudio.de as they stood on 2026-10-16). A site that has never held a
 * style receives them once, shown to readers, the first time the plugin runs
 * there; after that they are the site's own: changed, renamed, reset or removed
 * like any style. Restore Starter Styles in the panel's More menu publishes the
 * ones that are gone again. Only Original, the theme's own look, stays for good.
 *
 * @return array<string, array<string, mixed>> slug => record, in the order shown.
 */
function architrave_site_style_starters() {
	if ( ! defined( 'ARCHITRAVE_PANEL_FILE' ) ) {
		return array();
	}
	$dir = plugin_dir_path( ARCHITRAVE_PANEL_FILE ) . 'starters/';
	$out = array();
	foreach ( array( 'book', 'soft', 'still', 'essay', 'clear' ) as $slug ) {
		$file = $dir . $slug . '.json';
		if ( ! file_exists( $file ) ) {
			continue;
		}
		$record = json_decode( (string) file_get_contents( $file ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- the plugin's own file
		if ( is_array( $record ) && ! empty( $record['label'] ) ) {
			$out[ $slug ] = $record;
		}
	}
	return $out;
}

/**
 * The starters the state does not hold, published into it. A slug in the
 * `starters` map that still names a style counts as present; so does a style
 * that carries a starter's name (sites from before 0.57.0 hold no map).
 *
 * @param array $state A clean state.
 * @return array|WP_Error the state with the missing starters added, or the error that stopped it.
 */
function architrave_site_styles_add_starters( $state ) {
	$labels = array();
	foreach ( $state['styles'] as $existing ) {
		$labels[ strtolower( $existing['label'] ) ] = $existing['id'];
	}
	$map = isset( $state['starters'] ) && is_array( $state['starters'] ) ? $state['starters'] : array();
	foreach ( architrave_site_style_starters() as $slug => $record ) {
		if ( isset( $map[ $slug ] ) ) {
			continue;
		}
		$named = strtolower( (string) $record['label'] );
		if ( isset( $labels[ $named ] ) ) {
			$map[ $slug ] = $labels[ $named ];
			continue;
		}
		if ( count( $state['styles'] ) >= 24 ) {
			return new WP_Error( 'architrave_too_many', __( 'The site holds 24 styles. Remove one before publishing another.', 'vibetiles' ), array( 'status' => 400 ) );
		}
		$record['id'] = 'site-' . strtolower( base_convert( (string) time(), 10, 36 ) ) . strtolower( wp_generate_password( 4, false ) );
		$clean        = architrave_site_style_record( $record );
		if ( null === $clean ) {
			continue;
		}
		$state['styles'][]       = $clean;
		$map[ $slug ]            = $clean['id'];
		$labels[ $named ]        = $clean['id'];
		if ( is_array( $state['readers'] ) ) {
			$state['readers'][] = $clean['id'];
		}
		architrave_style_versions_note( $clean['id'], null, false, $clean );
	}
	$state['starters'] = $map;
	return $state;
}

/**
 * THE FIRST TIME: a site without a single style receives the starters, all of
 * them shown to readers. Runs once, marked by an option; a site that already
 * holds styles (every site from before 0.57.0) is marked and left as it is.
 * At `init`, after this file is loaded at after_setup_theme.
 */
function architrave_site_styles_seed() {
	if ( get_option( 'architrave_panel_starters_seeded', false ) ) {
		return;
	}
	if ( ! add_option( 'architrave_panel_starters_seeded', 1, '', false ) ) {
		return; /* another request got here first */
	}
	if ( '' !== architrave_site_styles_raw() ) {
		return;
	}
	$state = architrave_site_styles_clean( array() );
	$state['readers'] = array();
	$added = architrave_site_styles_add_starters( $state );
	if ( is_wp_error( $added ) || empty( $added['styles'] ) ) {
		return;
	}
	architrave_site_styles_write( $added );
}
add_action( 'init', 'architrave_site_styles_seed', 5 );

/**
 * Whether this visitor may publish.
 *
 * @return bool
 */
function architrave_site_styles_may_publish() {
	return current_user_can( 'edit_theme_options' );
}

/**
 * THE ROUTE. GET reads, POST writes; a write names an action:
 *
 *   publish  { record, name?, default? }  a new site style from the record
 *   update   { id, record }               the record replaces the style's
 *   remove   { id }                       the style goes; a default that
 *                                         was it is unset
 *   default  { id }                       that style is the default ('' for
 *                                         none, which brings Standard back)
 *   readers  { ids }                      the styles readers are offered
 *                                         beside the site's own
 *   readers-copy { on }                   whether readers may copy a style
 *   button   { settings }                 where the Vibetiles button sits
 *                                         and how it looks
 *   starters {}                           the starter styles that are gone
 *                                         come back (0.57.0)
 *
 * Every answer is the whole state, so the page rebuilds from one truth.
 */
function architrave_site_styles_routes() {
	register_rest_route(
		'architrave/v1',
		'/site-styles',
		array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'permission_callback' => '__return_true',
				'callback'            => static function () {
					return rest_ensure_response( architrave_site_styles() );
				},
			),
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'permission_callback' => 'architrave_site_styles_may_publish',
				'callback'            => 'architrave_site_styles_handle',
				/* Said here so the schema names them; the cleaning itself is
				   architrave_site_style_record() and friends, which take a
				   record apart field by field and keep only what a style is.
				   `default` and `on` stay untyped: the panel sends them as
				   whatever the button had in hand and the handler reads them
				   through rest_sanitize_boolean. */
				'args'                => array(
					'action'   => array(
						'required' => true,
						'type'     => 'string',
						'enum'     => array( 'publish', 'update', 'remove', 'default', 'start', 'readers', 'readers-copy', 'button', 'starters' ),
					),
					'id'       => array( 'type' => 'string' ),
					'name'     => array( 'type' => 'string' ),
					'record'   => array( 'type' => 'object' ),
					'ids'      => array(
						'type'  => 'array',
						'items' => array( 'type' => 'string' ),
					),
					'settings' => array( 'type' => 'object' ),
					'default'  => array( 'description' => 'Whether the published style becomes the site default.' ),
					'on'       => array( 'description' => 'Whether readers may copy a style.' ),
				),
			),
		)
	);
}
add_action( 'rest_api_init', 'architrave_site_styles_routes' );

/**
 * PREVIEW LINKS (2026-09-28, the prototype's Share a Preview, Vercel's preview
 * links): whoever may publish makes a link that shows the site in a style as it
 * is now, unsaved changes too, for seven days. Anyone with the link sees it;
 * nobody can change it; readers are never offered it. The links live in one
 * option, not autoloaded, each a random id with the cleaned record, a name and
 * its end. Stopping one deletes it, so the link ends at once.
 */
define( 'ARCHITRAVE_PREVIEW_DAYS', 7 );

/**
 * The live preview links, the ended ones dropped.
 *
 * @return array<string, array> id => { name, until, record }
 */
function architrave_preview_links() {
	$raw  = json_decode( (string) get_option( 'architrave_panel_preview_links', '{}' ), true );
	$out  = array();
	$now  = time();
	foreach ( is_array( $raw ) ? $raw : array() as $id => $link ) {
		if ( is_string( $id ) && preg_match( '/^[a-z0-9]{16}$/', $id ) && is_array( $link ) && isset( $link['until'], $link['record'] ) && (int) $link['until'] > $now ) {
			$out[ $id ] = $link;
		}
	}
	return $out;
}

/**
 * The list the owner's window shows: no records, only what a row says.
 *
 * @return array<int, array>
 */
function architrave_preview_list() {
	$out = array();
	foreach ( architrave_preview_links() as $id => $link ) {
		$out[] = array(
			'id'    => $id,
			'name'  => (string) $link['name'],
			'until' => (int) $link['until'],
		);
	}
	usort( $out, static function ( $a, $b ) { return $b['until'] - $a['until']; } );
	return $out;
}

/**
 * GET, POST and DELETE architrave/v1/site-styles/previews: the owner's links.
 */
function architrave_preview_routes() {
	register_rest_route(
		'architrave/v1',
		'/site-styles/previews',
		array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'permission_callback' => 'architrave_site_styles_may_publish',
				'callback'            => static function () {
					return rest_ensure_response( architrave_preview_list() );
				},
			),
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'permission_callback' => 'architrave_site_styles_may_publish',
				'args'                => array(
					'record' => array(
						'type'     => 'object',
						'required' => true,
					),
					'name'   => array( 'type' => 'string' ),
				),
				'callback'            => static function ( $request ) {
					$name  = isset( $request['name'] ) ? mb_substr( sanitize_text_field( (string) $request['name'] ), 0, 60 ) : '';
					$given = is_array( $request['record'] ) ? $request['record'] : array();
					$given['id']    = 'site-preview'; /* the cleaner keeps a record by its site- id and its name; the page gives it its own id */
					$given['label'] = '' !== $name ? $name : __( 'Style', 'vibetiles' );
					$record = architrave_site_style_record( $given );
					if ( ! $record ) {
						return new WP_Error( 'architrave_no_record', __( 'That is no style.', 'vibetiles' ), array( 'status' => 400 ) );
					}
					$links = architrave_preview_links();
					if ( count( $links ) >= 20 ) {
						return new WP_Error( 'architrave_too_many', __( 'Stop a preview link before making another.', 'vibetiles' ), array( 'status' => 400 ) );
					}
					$id           = strtolower( wp_generate_password( 16, false, false ) );
					$links[ $id ] = array(
						'name'   => '' !== $name ? $name : __( 'Style', 'vibetiles' ),
						'until'  => time() + ARCHITRAVE_PREVIEW_DAYS * DAY_IN_SECONDS,
						'record' => $record,
					);
					update_option( 'architrave_panel_preview_links', wp_json_encode( $links ), false );
					return rest_ensure_response(
						array(
							'id'    => $id,
							'links' => architrave_preview_list(),
						)
					);
				},
			),
		)
	);
	register_rest_route(
		'architrave/v1',
		'/site-styles/previews/(?P<id>[a-z0-9]{16})',
		array(
			'methods'             => WP_REST_Server::DELETABLE,
			'permission_callback' => 'architrave_site_styles_may_publish',
			'callback'            => static function ( $request ) {
				$links = architrave_preview_links();
				unset( $links[ (string) $request['id'] ] );
				update_option( 'architrave_panel_preview_links', wp_json_encode( $links ), false );
				return rest_ensure_response( architrave_preview_list() );
			},
		)
	);
}
add_action( 'rest_api_init', 'architrave_preview_routes' );

/**
 * READER NUMBERS ARE GONE (2026-10-06, Manuel: "take that whole function out, I don't like it"):
 * readers' pages no longer send their style and the site keeps no counts. What an earlier
 * version kept is deleted once, the first time an owner's screen loads.
 */
function architrave_reader_counts_forget() {
	if ( false !== get_option( 'architrave_panel_reader_counts' ) || false !== get_option( 'architrave_panel_count_readers' ) ) {
		delete_option( 'architrave_panel_reader_counts' );
		delete_option( 'architrave_panel_count_readers' );
	}
}
add_action( 'admin_init', 'architrave_reader_counts_forget' );
add_action( 'rest_api_init', 'architrave_reader_counts_forget' );

/**
 * The preview a page was opened with, `?ldp-preview=<id>`: its record as a style
 * of this visit only, or ended. Null when the address asks for none.
 *
 * @return array|null { id, name, until, record } or { ended: true }
 */
function architrave_preview_asked() {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- a read-only view of a style, by an unguessable id.
	$id = isset( $_GET['ldp-preview'] ) ? sanitize_key( wp_unslash( $_GET['ldp-preview'] ) ) : '';
	if ( '' === $id ) {
		return null;
	}
	$links = architrave_preview_links();
	if ( ! isset( $links[ $id ] ) ) {
		return array( 'ended' => true );
	}
	$record          = $links[ $id ]['record'];
	$record['id']    = 'site-pv' . substr( $id, 0, 12 );
	$record['label'] = (string) $links[ $id ]['name'];
	return array(
		'id'     => $record['id'],
		'name'   => (string) $links[ $id ]['name'],
		'until'  => (int) $links[ $id ]['until'],
		'record' => $record,
	);
}

/**
 * A STYLE IS A LINK (2026-09-18, the day's second release): every published
 * tile has a public address, this one, answering the record alone, so a
 * look can be read by name from anywhere. The panel's Paste style… takes
 * such a link, from this site or another, and presets.js opens the site
 * wearing a style when the address carries `?style=<id>`. The plain
 * `?rest_route=` form is what the link uses, since it works on every site,
 * pretty permalinks or not.
 */
function architrave_site_style_route() {
	register_rest_route(
		'architrave/v1',
		'/site-styles/(?P<id>site-[a-z0-9]{1,24})',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'permission_callback' => '__return_true',
			'callback'            => static function ( $request ) {
				$id = (string) $request['id'];
				foreach ( architrave_site_styles()['styles'] as $record ) {
					if ( $record['id'] === $id ) {
						return rest_ensure_response( $record );
					}
				}
				return new WP_Error( 'architrave_no_style', __( 'No such style.', 'vibetiles' ), array( 'status' => 404 ) );
			},
		)
	);
}
add_action( 'rest_api_init', 'architrave_site_style_route' );

/**
 * THE RECORD, DESCRIBED (2026-09-18): what a style record may carry and the
 * values each field accepts, for whoever writes one without the panel, an
 * assistant most of all. The lists are the scripts' own, written to
 * inc/style-schema.json by tools/style-schema.mjs so they cannot drift from
 * what the page reads; this route wraps them with how to publish.
 */
function architrave_site_styles_schema_route() {
	register_rest_route(
		'architrave/v1',
		'/site-styles/schema',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'permission_callback' => '__return_true',
			'callback'            => static function () {
				$file   = __DIR__ . '/style-schema.json' /* beside this file, in the theme's inc/ and in the plugin's alike (1.3.315) */;
				$record = file_exists( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : null; // phpcs:ignore WordPressVIPMinimum.Performance.FetchingRemoteData.FileGetContentsUnknown
				$gfile  = __DIR__ . '/style-guide.json' /* beside this file, in the theme's inc/ and in the plugin's alike (1.3.315) */;
				$guide  = file_exists( $gfile ) ? json_decode( (string) file_get_contents( $gfile ), true ) : null; // phpcs:ignore WordPressVIPMinimum.Performance.FetchingRemoteData.FileGetContentsUnknown
				return rest_ensure_response(
					array(
						'about'   => 'A style is a record of dials, switches, type roles and colours. Every key is optional; a missing one rests on the base style. Values are the ids listed under record; a field marked boolean takes true or false, hex takes a colour like #f4efe6, and roles holds one table per type role (title, headings, body, quote, meta, interface, code) with the fields listed for it; a field left out is the theme\'s own. colours holds light and dark, each with the seven colours named for their job (background, background2, card, text, mutedText, accent, highlight) and the button\'s and the roles\' own; leave out what you do not need. Write architrave 3. guide.typography says what each role styles and what each step means; guide.rules says what each colour is for.',
						'read'    => array(
							'all' => rest_url( 'architrave/v1/site-styles' ),
							'one' => rest_url( 'architrave/v1/site-styles/{id}' ),
						),
						'write'   => array(
							'url'     => rest_url( 'architrave/v1/site-styles' ),
							'method'  => 'POST',
							'auth'    => 'An application password of a user who may edit theme options, as HTTP Basic auth; or a logged-in cookie with an X-WP-Nonce header.',
							'actions' => array(
								'publish' => array( 'record' => 'the record', 'name' => 'the tile\'s name (optional, else record.label)', 'default' => 'true to make it what a first visit opens in (optional)' ),
								'update'  => array( 'id' => 'a site-… id', 'record' => 'the record that replaces it' ),
								'remove'  => array( 'id' => 'a site-… id' ),
								'default' => array( 'id' => 'a site-… id, or "" for none' ),
							),
							'answer'  => 'The whole state: { styles: [...], default: id }.',
						),
						'link'    => array(
							'named'   => home_url( '/?style={id}' ),
							'carried' => home_url( '/#style={base64url of the record JSON}' ),
						),
						'record'  => $record,
						// What each field does, the built-in styles as worked examples, the colour presets and the rules (2026-09-19, inc/style-guide.json, generated beside the record's description).
						'guide'   => $guide,
					)
				);
			},
		)
	);
}
add_action( 'rest_api_init', 'architrave_site_styles_schema_route' );

/**
 * A write.
 *
 * @param WP_REST_Request $request The request.
 * @return WP_REST_Response|WP_Error
 */
function architrave_site_styles_handle( $request ) {
	$action = (string) $request->get_param( 'action' );
	$state  = architrave_site_styles();
	$id     = (string) $request->get_param( 'id' );
	$record = $request->get_param( 'record' );

	switch ( $action ) {
		case 'publish':
			if ( ! is_array( $record ) ) {
				return new WP_Error( 'architrave_no_record', __( 'No style was sent.', 'vibetiles' ), array( 'status' => 400 ) );
			}
			/* THE SITE HOLDS 24 STYLES (2026-10-01, the panel audit): a 25th was appended,
			   cut by the cleaner, and the route still answered yes; with "make default" the
			   default pointed at nothing and was wiped, and the panel put another style on. */
			if ( isset( $state['styles'] ) && is_array( $state['styles'] ) && count( $state['styles'] ) >= 24 ) {
				return new WP_Error( 'architrave_too_many', __( 'The site holds 24 styles. Remove one before publishing another.', 'vibetiles' ), array( 'status' => 400 ) );
			}
			$name = trim( (string) $request->get_param( 'name' ) );
			if ( '' !== $name ) {
				$record['label'] = $name;
			}
			$record['id'] = 'site-' . strtolower( base_convert( (string) time(), 10, 36 ) ) . strtolower( wp_generate_password( 4, false ) );
			$clean        = architrave_site_style_record( $record );
			if ( null === $clean ) {
				return new WP_Error( 'architrave_bad_record', __( 'That is not a style.', 'vibetiles' ), array( 'status' => 400 ) );
			}
			$state['styles'][] = $clean;
			architrave_style_versions_note( $clean['id'], null, false, $clean );
			/* ONLY WHEN ASKED (2026-09-23): the first style published used to become
			   the site default by itself, so showing a style to readers could change
			   what every visitor opens in. Make site default is its own choice now. */
			if ( rest_sanitize_boolean( $request->get_param( 'default' ) ) ) {
				$state['default'] = $clean['id'];
			}
			break;

		case 'update':
			if ( ! is_array( $record ) ) {
				return new WP_Error( 'architrave_no_record', __( 'No style was sent.', 'vibetiles' ), array( 'status' => 400 ) );
			}
			$found = false;
			foreach ( $state['styles'] as $i => $existing ) {
				if ( $existing['id'] === $id ) {
					$record['id'] = $id;
					if ( empty( $record['label'] ) ) {
						$record['label'] = $existing['label'];
					}
					$clean = architrave_site_style_record( $record );
					if ( null === $clean ) {
						return new WP_Error( 'architrave_bad_record', __( 'That is not a style.', 'vibetiles' ), array( 'status' => 400 ) );
					}
					architrave_style_versions_note( $id, $existing );
					$state['styles'][ $i ] = $clean;
					$found                 = true;
				}
			}
			if ( ! $found ) {
				return new WP_Error( 'architrave_no_style', __( 'No such style.', 'vibetiles' ), array( 'status' => 404 ) );
			}
			break;

		case 'remove':
			/* every site style may go since 0.57.0 (the base lock of 0.48.0 is gone); Original is never a site style */
			$state['styles'] = array_values(
				array_filter(
					$state['styles'],
					static function ( $existing ) use ( $id ) {
						return $existing['id'] !== $id;
					}
				)
			);
			if ( $state['default'] === $id ) {
				$state['default'] = '';
			}
			architrave_style_versions_note( $id, null, true );
			break;

		case 'default':
			$state['default'] = $id;
			break;

		case 'start':
			/* WHERE THE STYLE BEGAN, set by hand (0.34.0): for a style that began before the site kept this, the owner
			   names what its beginning was. Nothing else about the style moves. */
			$found = false;
			foreach ( $state['styles'] as $existing ) {
				$found = $found || $existing['id'] === $id;
			}
			if ( ! $found || ! is_array( $record ) ) {
				return new WP_Error( 'architrave_no_style', __( 'No such style.', 'vibetiles' ), array( 'status' => 404 ) );
			}
			$record['id'] = $id;
			$clean        = architrave_site_style_record( $record );
			if ( null === $clean ) {
				return new WP_Error( 'architrave_bad_record', __( 'That is not a style.', 'vibetiles' ), array( 'status' => 400 ) );
			}
			$v                    = architrave_style_versions();
			$v['start'][ $id ]    = $clean;
			update_option( 'architrave_panel_style_versions', wp_json_encode( $v ), false );
			break;

		case 'readers':
			$ids              = $request->get_param( 'ids' );
			$state['readers'] = is_array( $ids ) ? array_values( $ids ) : array();
			break;

		case 'readers-copy':
			$state['readersCopy'] = (bool) $request->get_param( 'on' );
			break;

		case 'button':
			$state['button'] = architrave_site_styles_button( $request->get_param( 'settings' ) );
			break;

		case 'starters':
			/* RESTORE STARTER STYLES (0.57.0): every starter the site no longer has is published again, as new; the ones it
			   still has, changed or not, are left alone. A site that had the five before there were starters (elmastudio.de)
			   holds no slugs, so a style with a starter's name counts as that starter there. */
			$added = architrave_site_styles_add_starters( $state );
			if ( is_wp_error( $added ) ) {
				return $added;
			}
			$state = $added;
			break;

		default:
			return new WP_Error( 'architrave_no_action', __( 'Nothing to do.', 'vibetiles' ), array( 'status' => 400 ) );
	}

	$written = architrave_site_styles_write( $state );
	if ( 'update' === $action ) {
		architrave_site_styles_purge_soon();
	} elseif ( 'start' !== $action ) {
		architrave_site_styles_purge();
	}
	return rest_ensure_response( $written );
}

/**
 * THE HOST'S PAGE CACHE LETS GO (2026-10-14; Manuel made a new style the default
 * and Ellen, in a private window, still opened the old one). Every page carries
 * the site's styles inline, and WordPress.com kept its stored copies of the pages,
 * each server its own, so visitors got the old default until a copy happened to
 * be rebuilt. Now a write asks the host to drop them. The action is WordPress.com's
 * own (mu-plugins/edge-cache, run at shutdown); on a host without it nothing listens.
 */
function architrave_site_styles_purge() {
	wp_clear_scheduled_hook( 'architrave_site_styles_purge' );
	do_action( 'edge_cache_purge_domain' );
}
add_action( 'architrave_site_styles_purge', 'architrave_site_styles_purge' );

/**
 * WHILE A STYLE IS BEING TUNED: the panel saves about a second after every change,
 * and a cleared cache costs the next visitor of each page a slower load, so an edit
 * clears once, a minute after the last one.
 */
function architrave_site_styles_purge_soon() {
	wp_clear_scheduled_hook( 'architrave_site_styles_purge' );
	wp_schedule_single_event( time() + 60, 'architrave_site_styles_purge' );
}

/**
 * PREVIEW AS READER (2026-09-28, the prototype's): whoever may publish opens the
 * page with `?ldp-as-reader=1` and gets it as a first visit does: the readers'
 * small panel, the styles they are offered, nothing of the owner's own. What the
 * browser held is set aside before any script reads it and put back as the page
 * is left, so nothing picked there is kept.
 *
 * @return bool
 */
function architrave_as_reader() {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- a view of the page; it saves nothing.
	return isset( $_GET['ldp-as-reader'] ) && architrave_site_styles_may_publish();
}

/**
 * A STORAGE OF ITS OWN, IN MEMORY (2026-10-01, the panel audit): the preview cleared the
 * site's whole storage and put it back as the tab closed. It opens in a new tab, so the
 * owner's own tab read an empty storage meanwhile, what it saved was overwritten on the
 * way back, and a preview tab that never closed cleanly lost everything. Now the page
 * gets a Storage that lives as long as it does; the real one is never touched. Where
 * the browser will not let it be replaced, the old way stands. Since 0.56.0 the try
 * mode uses it too, SEEDED with a copy of what the browser holds: the visitor's own
 * size, side and style stand as on every other page, and nothing they do here is kept.
 *
 * @param bool $seed Start from a copy of the real storage (true) or empty (false).
 * @return string The script, without tags.
 */
function architrave_storage_aside_script( $seed ) {
	$copy = $seed ? 'try{for(var ci=0;ci<window.localStorage.length;ci++){var ck=window.localStorage.key(ci);m[ck]=window.localStorage.getItem(ck);}}catch(e){}' : '';
	return '(function(){var m={},S={getItem:function(k){k=String(k);return Object.prototype.hasOwnProperty.call(m,k)?m[k]:null;},setItem:function(k,v){m[String(k)]=String(v);},removeItem:function(k){delete m[String(k)];},clear:function(){m={};},key:function(i){var a=Object.keys(m);return i<a.length?a[i]:null;}};Object.defineProperty(S,"length",{get:function(){return Object.keys(m).length;}});' . $copy . 'var own=false;try{Object.defineProperty(window,"localStorage",{configurable:true,get:function(){return S;}});own=window.localStorage===S;}catch(e){}if(!own){try{var h={},i,k;for(i=0;i<localStorage.length;i++){k=localStorage.key(i);h[k]=localStorage.getItem(k);}' . ( $seed ? '' : 'localStorage.clear();' ) . 'window.addEventListener("pagehide",function(){try{localStorage.clear();Object.keys(h).forEach(function(k){localStorage.setItem(k,h[k]);});}catch(e){}});}catch(e){}}})();';
}

/**
 * The first thing in the head on a reader's preview: the storage set aside.
 */
function architrave_as_reader_head() {
	if ( ! architrave_as_reader() ) {
		return;
	}
	$words = array(
		'bar' => __( 'Preview as Reader. Nothing you pick here is kept.', 'vibetiles' ),
	);
	wp_print_inline_script_tag( architrave_storage_aside_script( false ) . 'window.architraveAsReader=true;document.documentElement.setAttribute("data-ldp-as-reader","");document.addEventListener("DOMContentLoaded",function(){var b=document.createElement("div");b.className="ldp-preview-bar";b.setAttribute("role","status");b.textContent=' . wp_json_encode( $words['bar'] ) . ';document.body.appendChild(b);});' ); /* printed through WordPress; the one word is JSON-encoded */
}
add_action( 'wp_head', 'architrave_as_reader_head', 0 );

/**
 * THE TRY MODE'S HEAD (0.56.0, plugin/panel.php architrave_panel_try): the storage
 * set aside, seeded, before any script reads it; the page says so on its root.
 */
function architrave_try_head() {
	if ( ! function_exists( 'architrave_panel_try' ) || ! architrave_panel_try() ) {
		return;
	}
	wp_print_inline_script_tag( architrave_storage_aside_script( true ) . 'window.architravePanelTry=true;document.documentElement.setAttribute("data-ldp-try","");' );
}
add_action( 'wp_head', 'architrave_try_head', 0 );

/**
 * The state, printed before presets.js so a site style is a style on first
 * paint; and, for whoever may publish, the route and a nonce, which is what
 * the panel reads to show its publish buttons at all.
 */
function architrave_site_styles_print() {
	if ( ! wp_script_is( 'architrave-presets', 'enqueued' ) ) {
		return;
	}
	$state   = architrave_site_styles();
	$preview = architrave_preview_asked();
	if ( $preview ) {
		/* A PREVIEW LINK: the style of this visit, never offered, never stored (presets.js reads `preview`). */
		if ( empty( $preview['ended'] ) ) {
			$state['styles'][] = $preview['record'];
			unset( $preview['record'] );
		}
		$state['preview'] = $preview;
	}
	$script = 'window.architraveSiteStyles = ' . wp_json_encode( $state ) . ';';
	/*
	 * EVERYONE WHO MAY NOT PUBLISH IS A READER (2026-09-23), and a reader gets
	 * the small panel: size, sides and three styles. Printed into the page, so a
	 * cached page is a reader's page, which is right: whoever may publish is
	 * logged in, and a logged-in page is not served from the cache.
	 */
	$try = function_exists( 'architrave_panel_try' ) && architrave_panel_try(); /* the try mode (0.56.0): the owner's engine, with nothing to publish to */
	if ( ( ! architrave_site_styles_may_publish() || architrave_as_reader() ) && ! $try ) {
		$script .= 'window.architravePanelReader = true;';
	}
	if ( architrave_site_styles_may_publish() && ! architrave_as_reader() && ! $try ) {
		/* and not in the try mode (0.57.1): an owner trying a style gets no route, so nothing lands in their list */
		$script .= 'window.architravePublish = ' . wp_json_encode(
			array(
				'url'   => rest_url( 'architrave/v1/site-styles' ),
				'nonce' => wp_create_nonce( 'wp_rest' ),
			)
		) . ';';
	}
	wp_add_inline_script( 'architrave-presets', $script, 'before' );
}
add_action( 'wp_enqueue_scripts', 'architrave_site_styles_print', 11 );

/**
 * The Customizer's view of it: one field with the JSON, for reading what is
 * published, clearing it, or pasting a state in by hand. The panel on the
 * front is the way to make one; this is the way to see it whole.
 *
 * @param WP_Customize_Manager $wp_customize The manager.
 */
function architrave_site_styles_customize( $wp_customize ) {
	$wp_customize->add_section(
		'architrave_styles',
		array(
			'title'    => __( 'Styles', 'vibetiles' ),
			'priority' => 31,
		)
	);
	$wp_customize->add_setting(
		'architrave_panel_site_styles',
		array(
			'type'              => 'option', /* the site's, not the theme's (0.6.0) */
			'default'           => architrave_site_styles_raw(), /* an unwritten option shows what the old theme mod holds */
			'sanitize_callback' => 'architrave_site_styles_sanitize',
			'transport'         => 'refresh',
		)
	);
	$wp_customize->add_control(
		'architrave_panel_site_styles',
		array(
			'type'        => 'textarea',
			'section'     => 'architrave_styles',
			'label'       => __( 'Published styles', 'vibetiles' ),
			'description' => __( 'The styles every reader sees as tiles, and which one a first visit opens in. Publish a look from the Design panel on the site itself; this field shows what is published, and clearing it brings Standard back.', 'vibetiles' ),
		)
	);
}
add_action( 'customize_register', 'architrave_site_styles_customize' );
