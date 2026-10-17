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

require_once plugin_dir_path( ARCHITRAVE_PANEL_FILE ) . 'words.php';

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

function architrave_panel_runs() {
	return 'old' !== architrave_panel_where();
}

function architrave_panel_try() {

	if ( ! (bool) apply_filters( 'live_design_panel_try', false ) ) {
		return false;
	}
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- a view of the page; it saves nothing.
	return ! current_user_can( 'edit_theme_options' ) || isset( $_GET['ldp-try'] );
}

function architrave_panel_answer( $active ) {
	return $active && architrave_panel_has_host();
}
add_filter( 'architrave_panel_active', 'architrave_panel_answer' );

function architrave_panel_asset_version( $rel ) {
	$path = plugin_dir_path( ARCHITRAVE_PANEL_FILE ) . $rel;
	return file_exists( $path ) ? (string) filemtime( $path ) : ARCHITRAVE_PANEL_VERSION;
}

function architrave_panel_guest_gone() {

	return apply_filters( 'live_design_panel_guest_gone', array() );
}

function architrave_panel_guest_limits() {
	$limits = array();
	foreach ( architrave_panel_guest_sizes() as $group ) {
		$limits[] = 'size:' . $group['role'];
	}
	return apply_filters( 'live_design_panel_guest_limits', array_values( array_unique( $limits ) ) );
}

function architrave_panel_guest_palette_css() {
	$read = architrave_panel_guest_colours();
	if ( ! $read ) {
		return '';
	}
	list( $palette, $grey, $hue, $page, $text ) = $read;
	$from = $grey[ $page ];
	$span = $from - $grey[ $text ];
	$lines = array();

	$pastels = array();
	foreach ( $palette as $slug => $colour ) {
		if ( $slug === $page || $slug === $text ) {
			continue;
		}
		$rgb = architrave_panel_rgb( $colour );
		if ( ! $rgb || ( max( $rgb ) - min( $rgb ) ) <= 30 ) {
			continue;
		}
		$value = isset( $hue[ $slug ] ) ? $hue[ $slug ] : ( isset( $grey[ $slug ] ) ? $grey[ $slug ] : null );
		if ( null !== $value && ( $from - $value ) / $span < 0.3 ) {
			$pastels[] = $slug;
		}
	}
	$turns = array( 0, 70, -70, 140, -140 );
	foreach ( $pastels as $n => $slug ) {
		$tint    = 'color-mix(in oklab, var(--accent) 25%, var(--surface-canvas))';

		$wheel   = 'oklch(from ' . $tint . ' l max(c, 0.05) calc(h + ' . $turns[ $n % count( $turns ) ] . '))';
		$lines[] = "\t" . $slug . ': ' . ( $n < 2 ? 'var(--ldp-pastel-' . ( $n + 1 ) . ', ' . $wheel . ')' : $wheel ) . ';';
		unset( $grey[ $slug ], $hue[ $slug ] );
	}
	foreach ( $grey as $slug => $value ) {
		$at = ( $from - $value ) / $span;
		if ( $slug === $page || abs( $at ) < 0.02 ) {

			$to = 'var(--surface-base)';
		} elseif ( $slug === $text || $at > 0.98 ) {
			$to = 'var(--text-primary)';
		} elseif ( $at < 0 ) {
			$to = 'var(--surface-base)';
		} elseif ( $at < 0.15 ) {

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

	$css = ":root[data-chosen],\n:root[data-colours] {\n" . implode( "\n", $lines ) . "\n}";

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
	$palette = array();
	foreach ( array( 'theme', 'custom' ) as $origin ) {
		if ( ! empty( $sets[ $origin ] ) && is_array( $sets[ $origin ] ) ) {
			foreach ( $sets[ $origin ] as $entry ) {
				if ( isset( $entry['slug'], $entry['color'] ) ) {
					$palette[ '--wp--preset--color--' . sanitize_key( $entry['slug'] ) ] = $entry['color'];
				}
			}
		}
	}

	foreach ( $palette as $slug => $colour ) {
		if ( preg_match( '/^var\(\s*(--[a-z0-9_-]+)\s*,\s*(.+)\)$/i', trim( (string) $colour ), $m ) && ! isset( $palette[ $m[1] ] ) ) {
			$palette[ $m[1] ] = trim( $m[2] );
		}
	}

	if ( function_exists( 'Kadence\\kadence' ) && is_callable( array( \Kadence\kadence(), 'palette_option' ) )  ) {
		foreach ( range( 1, 10 ) as $n ) {
			$colour = \Kadence\kadence()->palette_option( 'palette' . $n );
			if ( is_string( $colour ) && '' !== $colour ) {
				$palette[ '--global-palette' . $n ] = $colour;
			}
		}
	}

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
			$grey[ $slug ] = array_sum( $rgb ) / 3;
		} else {
			$hue[ $slug ] = array_sum( $rgb ) / 3;
		}
	}

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

function architrave_panel_guest_side() {
	$read = architrave_panel_guest_colours();
	if ( ! $read ) {
		return '';
	}
	$rgb = architrave_panel_rgb( $read[0][ $read[3] ] );
	return $rgb && architrave_panel_oklab( $rgb )[0] < 0.5 ? 'dark' : 'light';
}

function architrave_panel_guest_other_side_css() {
	$read = architrave_panel_guest_colours();
	$side = architrave_panel_guest_side();
	if ( ! $read || '' === $side ) {
		return '';
	}
	list( $palette, $grey, $hue, $page, $text ) = $read;
	$night = 'light' === $side;
	$ends  = $night ? array( 0.2, 0.93, 0.26 ) : array( 0.985, 0.22, 0.955 );
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
			$at = ( $from - $grey[ $slug ] ) / $span;
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
				$c *= 0.6;
			}
		}
		$lines[] = "\t" . $slug . ': ' . architrave_panel_hex( architrave_panel_srgb( array( $l, $c * cos( $h ), $c * sin( $h ) ) ) ) . ';';
	}
	if ( ! $lines ) {
		return '';
	}

	$paper_to  = architrave_panel_hex( architrave_panel_srgb( array( $ends[0], 0, 0 ) ) );
	$raised_to = architrave_panel_hex( architrave_panel_srgb( array( $ends[2], 0, 0 ) ) );
	$scheme = $night ? 'dark' : 'light';

	$when   = $night ? ':root[data-theme$="-dark"]' : ':root:not([data-theme$="-dark"])';
	$gate   = $when . ':not([data-chosen]):not([data-colours])';
	$css    = $gate . ' {' . "\n" . implode( "\n", $lines ) . "\n\tcolor-scheme: " . $scheme . ";\n}\n"
		. $gate . ' [data-ldp-paper] { background-color: ' . $paper_to . " !important; }\n"
		. $gate . ' [data-ldp-raised] { background-color: ' . $raised_to . ' !important; }'

		. "\n" . $gate . ' .wp-block-navigation:not(.has-background) .wp-block-navigation__submenu-container { background-color: ' . $raised_to . ' !important; color: inherit !important; }'

		. ( isset( $palette['--ldp-host-page'], $palette['--ldp-host-text'] ) ? "\n" . $gate . ' body { background-color: var(--ldp-host-page); color: var(--ldp-host-text); }' : '' );
	return (string) apply_filters( 'live_design_panel_guest_other_side_css', $css, $palette, $side );
}

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

function architrave_panel_hex( $rgb ) {
	return sprintf( '#%02x%02x%02x', $rgb[0], $rgb[1], $rgb[2] );
}

function architrave_panel_preset_slug( $value ) {
	if ( preg_match( '/--wp--preset--color--([a-z0-9-]+)/i', (string) $value, $m ) || preg_match( '/^var:preset\|color\|([a-z0-9-]+)$/i', (string) $value, $m ) ) {
		return strtolower( $m[1] );
	}
	return '';
}

function architrave_panel_rgb( $colour ) {
	$colour = strtolower( trim( (string) $colour ) );

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

function architrave_panel_guest_sizes() {
	$article  = '.wp-block-post-content %1$s, .entry-content %1$s';
	$headings = array();
	foreach ( array( 1, 2, 3, 4, 5, 6 ) as $level ) {
		$headings[] = array( 'sel' => sprintf( $article, 'h' . $level ), 'role' => 'head', 'member' => 'sub', 'step' => 'h' . $level );
	}
	return apply_filters(
		'live_design_panel_guest_sizes',
		array_merge(
			array( array( 'sel' => '.wp-block-post-title, .entry-title', 'role' => 'head', 'member' => 'title', 'step' => 'title' ) ),
			$headings,
			array(

				array( 'sel' => '.wp-block-heading:not(.wp-block-comments-title), .wp-block-query-title', 'role' => 'head', 'member' => 'sub', 'step' => 'h2' ),

				array( 'sel' => '.wp-block-quote, .wp-block-pullquote, :is(.wp-block-quote, .wp-block-pullquote) :is(p, li, cite)', 'role' => 'quote', 'step' => 'body', 'rest' => 26 ),

				array( 'sel' => '.wp-block-code, .wp-block-preformatted, ' . sprintf( $article, 'pre' ), 'role' => 'code', 'step' => '' ),
				array( 'sel' => sprintf( $article, 'p' ) . ', ' . sprintf( $article, 'li' ), 'role' => 'read', 'member' => 'text', 'step' => 'body' ),
				array( 'sel' => '.wp-block-post-excerpt', 'role' => 'read', 'member' => 'excerpts', 'step' => 'body' ),
				array( 'sel' => '.wp-block-post-terms', 'role' => 'kicker', 'step' => '', 'rest' => 26 ),
				array( 'sel' => '.wp-block-post-date, .entry-meta', 'role' => 'small', 'member' => 'date', 'step' => '', 'rest' => 16 ),
				array( 'sel' => '.wp-block-post-author-name', 'role' => 'small', 'member' => 'author', 'step' => '', 'rest' => 16 ),
				array( 'sel' => 'figcaption, .wp-element-caption', 'role' => 'small', 'member' => 'captions', 'step' => '', 'rest' => 13 ),

				array( 'sel' => '.has-small-font-size:not(.wp-block-navigation)', 'role' => 'small', 'step' => '', 'rest' => 13 ),
				array( 'sel' => '.wp-block-comments-title, .comment-reply-title', 'role' => 'comment', 'member' => 'title', 'step' => '', 'rest' => 18 ),
				array( 'sel' => '.wp-block-comment-author-name', 'role' => 'comment', 'member' => 'name', 'step' => '', 'rest' => 16 ),
				array( 'sel' => '.wp-block-comment-content', 'role' => 'comment', 'member' => 'text', 'step' => '', 'rest' => 14 ),
				array( 'sel' => '.wp-block-comment-date, .wp-block-comment-reply-link', 'role' => 'comment', 'member' => 'small', 'step' => '', 'rest' => 13 ),
				array( 'sel' => '.wp-block-post-comments-form label, .wp-block-post-comments-form p, .comment-form label, .comment-form p', 'role' => 'comment', 'member' => 'form', 'step' => '', 'rest' => 13 ),

				array( 'sel' => '.wp-block-site-title', 'role' => 'head', 'member' => 'sub', 'step' => '' ),
				array( 'sel' => '.wp-block-navigation-item__content, .wp-block-button__link, .wp-block-site-tagline, .wp-block-query-pagination, .wp-block-post-navigation-link, .skip-link, .wp-block-search__label, .wp-block-search__input, .wp-block-search__button', 'role' => 'ui', 'step' => '' ),
			)
		)
	);
}

function architrave_panel_host_style() {

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

		'architrave-guest-size'    => array( 'assets/js/guest-size.js', array() ),

		'architrave-guest-rows'    => array( 'assets/js/guest-rows.js', array() ),

		'architrave-guest-lines'   => array( 'assets/js/guest-lines.js', array() ),

		'architrave-guest-ink'     => array( 'assets/js/guest-ink.js', array() ),

		'architrave-guest-buttons' => array( 'assets/js/guest-buttons.js', array() ),
	);
	foreach ( $support as $handle => $item ) {
		if ( wp_script_is( $handle, 'registered' ) ) {
			continue;
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

	wp_add_inline_script( 'architrave-focus-mode', 'window.architravePanelGuest = true;', 'before' );

	wp_add_inline_script( 'quire-modes', 'window.architravePanelHostSide = ' . wp_json_encode( architrave_panel_guest_side() ) . ';', 'before' );

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
		'architrave-font-library'    => array( 'assets/js/font-library.js', array(), false ),
		'architrave-reading-face'    => array( 'assets/js/reading-face.js', array( 'quire-icons', 'architrave-font-library' ), false ),
		'architrave-reading-leading' => array( 'assets/js/reading-leading.js', array( 'quire-icons' ), false ),
		'architrave-presets'         => array( 'assets/js/presets.js', array( 'quire-icons', 'quire-modes', 'architrave-focus-mode', 'architrave-font-library' ), false ),
		'architrave-reading-panel'   => array( 'assets/js/reading-panel.js', array( 'architrave-presets', 'architrave-reading-scale', 'architrave-reading-face', 'architrave-reading-leading', 'architrave-color-mode', 'quire-icons' ), true ),
		'architrave-panel-opener'    => array( 'assets/js/panel-opener.js', array( 'architrave-reading-panel' ), true ),
		'architrave-space'           => array( 'assets/js/space.js', array(), true ),
		'architrave-dropcap'         => array( 'assets/js/dropcap.js', array(), true ),
	);
	foreach ( $list as $handle => $item ) {
		wp_enqueue_script( $handle, $base . $item[0], $item[1], architrave_panel_asset_version( $item[0] ), array( 'in_footer' => $item[2] ) );
	}
}
add_action( 'wp_enqueue_scripts', 'architrave_panel_enqueue_scripts', 11 );

function architrave_panel_enqueue_styles() {
	$rel = 'assets/css/panel.css';
	$dir = plugin_dir_path( ARCHITRAVE_PANEL_FILE );
	if ( ! architrave_panel_runs() || ! file_exists( $dir . $rel ) ) {
		return;
	}

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

		$guest_rel = file_exists( $dir . 'assets/css/panel-guest.css' ) ? 'assets/css/panel-guest.css' : $rel;
		wp_enqueue_style( 'architrave-panel', $url . $guest_rel, $deps, architrave_panel_asset_version( $guest_rel ) );
		architrave_panel_font_library();

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

function architrave_panel_font_library() {
	$rel = 'assets/css/font-library.css';
	if ( file_exists( plugin_dir_path( ARCHITRAVE_PANEL_FILE ) . $rel ) ) {
		wp_enqueue_style( 'architrave-font-library', plugin_dir_url( ARCHITRAVE_PANEL_FILE ) . $rel, array( 'architrave-panel' ), architrave_panel_asset_version( $rel ) );
	}
}

function architrave_panel_load_site_styles() {
	$part = plugin_dir_path( ARCHITRAVE_PANEL_FILE ) . 'inc/site-styles.php';
	if ( architrave_panel_runs() && ! function_exists( 'architrave_site_styles' ) && file_exists( $part ) ) {
		require $part;
	}
}
add_action( 'after_setup_theme', 'architrave_panel_load_site_styles', 20 );

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

	return $theme_json->update_with(
		array(
			'version'  => isset( $now['version'] ) ? $now['version'] : 3,
			'settings' => array( 'typography' => array( 'fontFamilies' => array_merge( array_values( $have ), $add ) ) ),
		)
	);
}
add_filter( 'wp_theme_json_data_theme', 'architrave_panel_font_families' );

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

function architrave_panel_rows( $which ) {
	$rows = array(

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
		return $block_content;
	}
	$colour  = strpos( $block_content, '<button type="button" class="quire-menu-item" aria-haspopup="menu" aria-expanded="false" data-branch="colour"' );
	$reading = strpos( $block_content, 'data-quire-reading="menu" hidden></ul>' );
	if ( false === $colour || false === $reading || $reading < $colour ) {
		$GLOBALS['architrave_panel_rows_placed'] = false;
		return $block_content;
	}
	$after = $reading + strlen( 'data-quire-reading="menu" hidden></ul>' );

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

function architrave_panel_icon( $name, $attrs = '' ) {
	if ( function_exists( 'architrave_icon' ) ) {
		return architrave_icon( $name, $attrs );
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

function architrave_panel_guard_block( $css, $guest ) {
	if ( ! $guest ) {
		return $css;
	}
	$css = preg_replace( '#/\*.*?\*/#s', '', $css );
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

function architrave_panel_button_settings() {
	$site = function_exists( 'architrave_site_styles' ) ? architrave_site_styles() : array();
	$bt   = isset( $site['button'] ) ? $site['button'] : array( 'place' => 'auto', 'size' => 'medium', 'color' => 'panel', 'who' => 'everyone', 'aurora' => true );
	return array_merge( array( 'icon' => true, 'label' => '', 'show' => 'hover', 'corners' => 'site', 'glyph' => 'sliders' ), $bt );
}

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
