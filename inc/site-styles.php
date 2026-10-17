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

function architrave_site_styles_stamp() {
	return (int) get_option( 'architrave_panel_site_styles_stamp', 0 );
}

function architrave_site_styles_stamped( $state ) {
	$state['stamp'] = architrave_site_styles_stamp();
	return $state;
}

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

	$built_in = (bool) preg_match( '/^[a-z][a-z0-9-]{0,30}$/', $default ) && 0 !== strpos( $default, 'site-' );
	$guest    = function_exists( 'architrave_panel_is_guest' ) && architrave_panel_is_guest();
	if ( 'host' === $default || ( 'standard' === $default && ! $guest ) || ( '' !== $default && ! isset( $seen[ $default ] ) && ! $built_in ) ) {
		$default = '';
	}

	$readers = null;
	if ( isset( $state['readers'] ) && is_array( $state['readers'] ) ) {
		$readers = array();
		foreach ( $state['readers'] as $reader_id ) {

			if ( is_string( $reader_id ) && 0 === strpos( $reader_id, 'site-' ) && ! isset( $seen[ $reader_id ] ) ) {
				continue;
			}
			if ( is_string( $reader_id ) && preg_match( '/^[a-z0-9-]{1,48}$/', $reader_id ) && ! in_array( $reader_id, $readers, true ) ) {
				$readers[] = $reader_id;
			}

			if ( count( $readers ) >= 64 ) {
				break;
			}
		}
	}

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

		'readersCopy' => ! empty( $state['readersCopy'] ),

		'button'      => architrave_site_styles_button( isset( $state['button'] ) ? $state['button'] : null ),
	);
}

function architrave_site_styles_button( $raw ) {
	$raw   = is_array( $raw ) ? $raw : array();
	$lists = array(
		'place' => array( 'auto', 'bottom-center', 'bottom-left', 'bottom-right', 'top-left', 'top-right', 'left', 'right' ),
		'fixed' => array( 'bottom-center', 'bottom-left', 'bottom-right', 'top-left', 'top-right', 'left', 'right' ),
		'size'  => array( 'medium', 'small', 'large' ),
		'color' => array( 'panel', 'site', 'own' ),
		'who'   => array( 'everyone', 'me' ),

		'show'    => array( 'hover', 'icon', 'both' ),
		'corners' => array( 'site', 'round' ),

		'band'    => array( 'dusk', 'ocean', 'meadow', 'candy', 'ember', 'mono' ),

		'glyph'   => array( 'sliders', 'aa', 'sparkles', 'brush' ),
	);
	if ( ! isset( $raw['show'] ) && isset( $raw['size'] ) ) {
		$raw['show'] = 'small' === $raw['size'] ? 'icon' : ( 'large' === $raw['size'] ? 'both' : 'hover' );
	}
	if ( isset( $raw['color'] ) && 'accent' === $raw['color'] ) {
		$raw['color'] = 'site';
	}
	$out = array();
	foreach ( $lists as $key => $allowed ) {
		$out[ $key ] = isset( $raw[ $key ] ) && in_array( $raw[ $key ], $allowed, true ) ? $raw[ $key ] : $allowed[0];
	}
	$out['aurora']  = isset( $raw['aurora'] ) ? (bool) $raw['aurora'] : true;

	$own         = isset( $raw['own'] ) && is_string( $raw['own'] ) ? sanitize_hex_color( $raw['own'] ) : '';
	$out['own']  = $own ? strtolower( $own ) : '#0a84ff';
	$out['icon']  = isset( $raw['icon'] ) ? (bool) $raw['icon'] : true;
	$out['label'] = isset( $raw['label'] ) && is_string( $raw['label'] ) ? mb_substr( trim( sanitize_text_field( $raw['label'] ) ), 0, 30 ) : '';
	return $out;
}

function architrave_site_style_record( $record ) {
	if ( ! is_array( $record ) ) {
		return null;
	}

	$record = array(
		'id'    => isset( $record['id'] ) ? $record['id'] : '',
		'label' => isset( $record['label'] ) ? $record['label'] : '',
	) + $record;

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
	$clean['architrave'] = isset( $clean['architrave'] ) && in_array( (int) $clean['architrave'], array( 2, 3 ), true ) ? (int) $clean['architrave'] : 1;
	unset( $clean['own'], $clean['site'] );
	return $clean;
}

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

			if ( count( $out ) >= 256 ) {
				break;
			}
		}
		return $out;
	}
	return null;
}

function architrave_site_styles_write( $state ) {
	$state = architrave_site_styles_clean( $state );
	update_option( 'architrave_panel_site_styles', wp_json_encode( $state ), true );
	$stamp = max( architrave_site_styles_stamp() + 1, (int) floor( microtime( true ) * 1000 ) );
	update_option( 'architrave_panel_site_styles_stamp', $stamp, true );
	$state['stamp'] = $stamp;
	return $state;
}

const ARCHITRAVE_STYLE_VERSIONS_KEEP = 20;

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
	foreach ( ( is_array( $raw['start'] ?? null ) ? $raw['start'] : array() ) as $id => $rec ) {
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
	foreach ( ( is_array( $raw['kept'] ?? null ) ? $raw['kept'] : array() ) as $id => $t ) {
		if ( is_string( $id ) && preg_match( '/^site-[a-z0-9]{1,24}$/', $id ) ) {
			$out['kept'][ $id ] = (int) $t;
		}
	}
	return $out;
}

function architrave_style_versions_note( $id, $replaced, $gone = false, $start = null ) {
	$v = architrave_style_versions();
	if ( $gone ) {
		unset( $v['styles'][ $id ], $v['at'][ $id ], $v['kept'][ $id ], $v['start'][ $id ] );
	} else {

		if ( ! isset( $v['start'][ $id ] ) ) {
			$first = is_array( $start ) ? $start : ( is_array( $replaced ) ? $replaced : null );
			if ( null !== $first ) {
				$v['start'][ $id ] = $first;
			}
		}

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
	update_option( 'architrave_panel_style_versions', wp_json_encode( $v ), false );
}

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

function architrave_site_styles_seed() {
	if ( get_option( 'architrave_panel_starters_seeded', false ) ) {
		return;
	}
	if ( ! add_option( 'architrave_panel_starters_seeded', 1, '', false ) ) {
		return;
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

function architrave_site_styles_may_publish() {
	return current_user_can( 'edit_theme_options' );
}

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

define( 'ARCHITRAVE_PREVIEW_DAYS', 7 );

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
					$given['id']    = 'site-preview';
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

function architrave_reader_counts_forget() {
	if ( false !== get_option( 'architrave_panel_reader_counts' ) || false !== get_option( 'architrave_panel_count_readers' ) ) {
		delete_option( 'architrave_panel_reader_counts' );
		delete_option( 'architrave_panel_count_readers' );
	}
}
add_action( 'admin_init', 'architrave_reader_counts_forget' );
add_action( 'rest_api_init', 'architrave_reader_counts_forget' );

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

function architrave_site_styles_schema_route() {
	register_rest_route(
		'architrave/v1',
		'/site-styles/schema',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'permission_callback' => '__return_true',
			'callback'            => static function () {
				$file   = __DIR__ . '/style-schema.json' ;
				$record = file_exists( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : null; // phpcs:ignore WordPressVIPMinimum.Performance.FetchingRemoteData.FileGetContentsUnknown
				$gfile  = __DIR__ . '/style-guide.json' ;
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

						'guide'   => $guide,
					)
				);
			},
		)
	);
}
add_action( 'rest_api_init', 'architrave_site_styles_schema_route' );

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

function architrave_site_styles_purge() {
	wp_clear_scheduled_hook( 'architrave_site_styles_purge' );
	do_action( 'edge_cache_purge_domain' );
}
add_action( 'architrave_site_styles_purge', 'architrave_site_styles_purge' );

function architrave_site_styles_purge_soon() {
	wp_clear_scheduled_hook( 'architrave_site_styles_purge' );
	wp_schedule_single_event( time() + 60, 'architrave_site_styles_purge' );
}

function architrave_as_reader() {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- a view of the page; it saves nothing.
	return isset( $_GET['ldp-as-reader'] ) && architrave_site_styles_may_publish();
}

function architrave_storage_aside_script( $seed ) {
	$copy = $seed ? 'try{for(var ci=0;ci<window.localStorage.length;ci++){var ck=window.localStorage.key(ci);m[ck]=window.localStorage.getItem(ck);}}catch(e){}' : '';
	return '(function(){var m={},S={getItem:function(k){k=String(k);return Object.prototype.hasOwnProperty.call(m,k)?m[k]:null;},setItem:function(k,v){m[String(k)]=String(v);},removeItem:function(k){delete m[String(k)];},clear:function(){m={};},key:function(i){var a=Object.keys(m);return i<a.length?a[i]:null;}};Object.defineProperty(S,"length",{get:function(){return Object.keys(m).length;}});' . $copy . 'var own=false;try{Object.defineProperty(window,"localStorage",{configurable:true,get:function(){return S;}});own=window.localStorage===S;}catch(e){}if(!own){try{var h={},i,k;for(i=0;i<localStorage.length;i++){k=localStorage.key(i);h[k]=localStorage.getItem(k);}' . ( $seed ? '' : 'localStorage.clear();' ) . 'window.addEventListener("pagehide",function(){try{localStorage.clear();Object.keys(h).forEach(function(k){localStorage.setItem(k,h[k]);});}catch(e){}});}catch(e){}}})();';
}

function architrave_as_reader_head() {
	if ( ! architrave_as_reader() ) {
		return;
	}
	$words = array(
		'bar' => __( 'Preview as Reader. Nothing you pick here is kept.', 'vibetiles' ),
	);
	wp_print_inline_script_tag( architrave_storage_aside_script( false ) . 'window.architraveAsReader=true;document.documentElement.setAttribute("data-ldp-as-reader","");document.addEventListener("DOMContentLoaded",function(){var b=document.createElement("div");b.className="ldp-preview-bar";b.setAttribute("role","status");b.textContent=' . wp_json_encode( $words['bar'] ) . ';document.body.appendChild(b);});' );
}
add_action( 'wp_head', 'architrave_as_reader_head', 0 );

function architrave_try_head() {
	if ( ! function_exists( 'architrave_panel_try' ) || ! architrave_panel_try() ) {
		return;
	}
	wp_print_inline_script_tag( architrave_storage_aside_script( true ) . 'window.architravePanelTry=true;document.documentElement.setAttribute("data-ldp-try","");' );
}
add_action( 'wp_head', 'architrave_try_head', 0 );

function architrave_site_styles_print() {
	if ( ! wp_script_is( 'architrave-presets', 'enqueued' ) ) {
		return;
	}
	$state   = architrave_site_styles();
	$preview = architrave_preview_asked();
	if ( $preview ) {

		if ( empty( $preview['ended'] ) ) {
			$state['styles'][] = $preview['record'];
			unset( $preview['record'] );
		}
		$state['preview'] = $preview;
	}
	$script = 'window.architraveSiteStyles = ' . wp_json_encode( $state ) . ';';

	$try = function_exists( 'architrave_panel_try' ) && architrave_panel_try();
	if ( ( ! architrave_site_styles_may_publish() || architrave_as_reader() ) && ! $try ) {
		$script .= 'window.architravePanelReader = true;';
	}
	if ( architrave_site_styles_may_publish() && ! architrave_as_reader() && ! $try ) {

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
			'type'              => 'option',
			'default'           => architrave_site_styles_raw(),
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
