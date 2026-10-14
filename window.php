<?php
/**
 * THE SWITCH BETWEEN TODAY'S WINDOW AND THE NEW ONE (build plan step 6,
 * 2026-09-27). The new window is built next to today's, section by section,
 * and an owner tries each finished section on a real site before readers
 * ever meet it. So the choice is the OWNER'S, one per person (user meta), and
 * nobody else's page changes: for anyone who may not edit the design, not one
 * byte of the new window is served and nothing here prints anything.
 *
 * Three places set it: a row on the panel's Button and Sharing page, the
 * plugin's own links on WordPress's Plugins page, and, for one page load only,
 * the test door `?ldp-window=new` (or `=current`), which does not change the
 * saved choice. Today's window always loads for an owner, so a section the new
 * window has not built yet opens there.
 *
 * The new window itself (assets/js/panel-window.js) knows nothing of
 * WordPress: it is handed a small host object by assets/js/panel-window-wp.js,
 * the only file that knows these routes, this option and today's window.
 *
 * @package Vibetiles
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const LIVE_DESIGN_WINDOW_META = 'live_design_panel_window';

function live_design_window_may() {
	return is_user_logged_in() && current_user_can( 'edit_theme_options' );
}

function live_design_window_saved( $user_id = 0 ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found -- kept for callers.
	return 'new';
}

function live_design_window_save( $choice ) {
	$user_id = get_current_user_id();
	if ( 'new' === $choice ) {
		update_user_meta( $user_id, LIVE_DESIGN_WINDOW_META, 'new' );
	} else {
		delete_user_meta( $user_id, LIVE_DESIGN_WINDOW_META );
	}
	return live_design_window_saved( $user_id );
}

function live_design_window_now() {
	return 'new';
}

function live_design_window_reader() {
	if ( architrave_panel_try() ) {
		return false;
	}
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- a view of the page as a reader gets it; it saves nothing.
	return ! live_design_window_may() || isset( $_GET['ldp-as-reader'] );
}

function live_design_window_page( $setting ) {
	$buttons = array( 'button', 'buttonshape', 'tagsfollow', 'buttonstyle', 'buttonmedium', 'buttonquiet', 'tags', 'chosenitem', 'links', 'buttonColour', 'buttonShape', 'tagsMatchButtons', 'primaryButton', 'secondaryButton', 'tertiaryButton', 'currentItem' );
	if ( ! empty( $setting['key'] ) && in_array( $setting['key'], $buttons, true ) ) {
		return 'Buttons';
	}
	if ( ! empty( $setting['key'] ) && in_array( $setting['key'], array( 'radius', 'borderWidth', 'borderStyle', 'borderStrength' ), true ) ) {
		return 'Corners and lines';
	}
	if ( ! empty( $setting['key'] ) && in_array( $setting['key'], array( 'lineLength', 'titleWidth', 'pictureWidth', 'figureWidth' ), true ) ) {
		return 'Layout';
	}
	if ( ! empty( $setting['key'] ) && in_array( $setting['key'], array( 'pictureFilter', 'colourOnHover', 'dimInDark', 'pictureFrame', 'frameWidth', 'pictureFade', 'pictureShadow', 'pictureEdge', 'pictureCorners' ), true ) ) {
		return 'Pictures';
	}
	if ( ! empty( $setting['key'] ) && in_array( $setting['key'], array( 'picturefade', 'fadeedges' ), true ) ) {
		return 'Pictures';
	}
	return isset( $setting['page'] ) && is_string( $setting['page'] ) ? trim( explode( '›', $setting['page'] )[0] ) : '';
}

function live_design_window_sections() {
	$file = plugin_dir_path( ARCHITRAVE_PANEL_FILE ) . 'settings.json';
	$list = is_readable( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : null; // phpcs:ignore WordPressVIPMinimum.Performance.FetchingRemoteData.FileGetContentsUnknown -- the plugin's own file.
	$count = array();
	foreach ( ( is_array( $list ) && isset( $list['settings'] ) ? (array) $list['settings'] : array() ) as $setting ) {
		$top = live_design_window_page( $setting );
		if ( '' === $top || 'First level' === $top ) {
			continue;
		}
		$count[ $top ] = isset( $count[ $top ] ) ? $count[ $top ] + 1 : 1;
	}
	$order = array( 'Colour', 'Type', 'Layout', 'Corners and lines', 'Buttons', 'Pictures', 'Effects' );
	$names = array_merge( array_values( array_intersect( $order, array_keys( $count ) ) ), array_values( array_diff( array_keys( $count ), $order ) ) );
	$words = live_design_window_words();
	$out   = array();
	foreach ( $names as $name ) {
		$out[] = array(
			'id'       => sanitize_title( $name ),
			'name'     => isset( $words[ $name ] ) ? $words[ $name ] : $name,
			'settings' => $count[ $name ],
		);
	}
	return $out;
}

function live_design_window_settings() {
	$built = array( 'Colour', 'Type', 'Layout', 'Corners and lines', 'Buttons', 'Pictures', 'Effects' );
	$file  = plugin_dir_path( ARCHITRAVE_PANEL_FILE ) . 'settings.json';
	$list  = is_readable( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : null; // phpcs:ignore WordPressVIPMinimum.Performance.FetchingRemoteData.FileGetContentsUnknown -- the plugin's own file.
	$out   = array();
	foreach ( ( is_array( $list ) && isset( $list['settings'] ) ? (array) $list['settings'] : array() ) as $setting ) {
		$page = live_design_window_page( $setting );
		if ( ! in_array( $page, $built, true ) || empty( $setting['key'] ) ) {
			continue;
		}
		$label = isset( $setting['label'] ) && is_string( $setting['label'] ) ? trim( explode( '›', $setting['label'] )[0] ) : '';
		$row   = array(
			'key'     => (string) $setting['key'],
			'section' => sanitize_title( $page ),
			'label'   => $label,
			'kind'    => isset( $setting['kind'] ) ? (string) $setting['kind'] : '',
			'def'     => isset( $setting['def'] ) ? $setting['def'] : null,
		);
		foreach ( array( 'choices', 'steps' ) as $field ) {
			if ( isset( $setting[ $field ] ) && is_array( $setting[ $field ] ) ) {
				$row[ $field ] = array_values( $setting[ $field ] );
			}
		}
		$out[] = $row;
	}
	return $out;
}

function live_design_window_roles() {
	$file = plugin_dir_path( ARCHITRAVE_PANEL_FILE ) . 'settings.json';
	$list = is_readable( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : null; // phpcs:ignore WordPressVIPMinimum.Performance.FetchingRemoteData.FileGetContentsUnknown -- the plugin's own file.
	$out  = array();
	foreach ( ( is_array( $list ) && isset( $list['roles'] ) ? (array) $list['roles'] : array() ) as $role ) {
		if ( empty( $role['id'] ) ) {
			continue;
		}
		$out[] = array(
			'id'      => (string) $role['id'],
			'label'   => isset( $role['label'] ) ? (string) $role['label'] : (string) $role['id'],
			'where'   => isset( $role['where'] ) ? (string) $role['where'] : '',
			'dials'   => isset( $role['dials'] ) ? array_values( (array) $role['dials'] ) : array(),
		);
	}
	return $out;
}

function live_design_window_boot() {
	$base = plugin_dir_url( ARCHITRAVE_PANEL_FILE );
	$ver  = static function ( $rel ) use ( $base ) {
		return add_query_arg( 'ver', architrave_panel_asset_version( $rel ), $base . $rel );
	};
	return array(
		'words'    => live_design_window_words(),
		'sections' => live_design_window_sections(),
		'settings' => live_design_window_settings(),
		'roles'    => live_design_window_roles(),
		'css'      => $ver( 'assets/css/panel-window.css' ),
		'js'       => array( $ver( 'assets/js/panel-window.js' ), $ver( 'assets/js/panel-window-wp.js' ) ),
	);
}

function live_design_window_route() {
	register_rest_route(
		'architrave/v1',
		'/window',
		array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'permission_callback' => 'live_design_window_may',
				'callback'            => static function () {
					return rest_ensure_response( array( 'window' => live_design_window_saved() ) );
				},
			),
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'permission_callback' => 'live_design_window_may',
				'args'                => array(
					'window' => array(
						'required' => true,
						'type'     => 'string',
						'enum'     => array( 'new', 'current' ),
					),
				),
				'callback'            => static function ( $request ) {
					$now    = live_design_window_save( (string) $request['window'] );
					$answer = array( 'window' => $now );
					if ( 'new' === $now ) {
						$answer['boot'] = live_design_window_boot();
					}
					return rest_ensure_response( $answer );
				},
			),
		)
	);
}
add_action( 'rest_api_init', 'live_design_window_route' );

function live_design_window_enqueue() {
	if ( ! architrave_panel_runs() || ! wp_script_is( 'architrave-reading-panel', 'enqueued' ) ) {
		return;
	}
	$reader = live_design_window_reader();
	wp_add_inline_script(
		'architrave-reading-panel',
		'window.liveDesignWindow = ' . wp_json_encode(
			array(
				'window' => 'new',
				'now'    => 'new',
				'reader' => $reader,
				'try'    => architrave_panel_try(),
				'url'    => rest_url( 'architrave/v1/window' ),
				'nonce'  => $reader || architrave_panel_try() ? '' : wp_create_nonce( 'wp_rest' ),
			)
		) . ';',
		'before'
	);
	$base = plugin_dir_url( ARCHITRAVE_PANEL_FILE );
	wp_enqueue_style( 'live-design-window', $base . 'assets/css/panel-window.css', array(), architrave_panel_asset_version( 'assets/css/panel-window.css' ) );
	wp_enqueue_script( 'live-design-window', $base . 'assets/js/panel-window.js', array(), architrave_panel_asset_version( 'assets/js/panel-window.js' ), array( 'in_footer' => true ) );

	$aa = plugin_dir_path( ARCHITRAVE_PANEL_FILE ) . 'assets/fonts/aa/faces.json';
	if ( is_readable( $aa ) ) {
		$faces = json_decode( (string) file_get_contents( $aa ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- a file of the plugin's own
		if ( is_array( $faces ) ) {
			wp_add_inline_script( 'live-design-window', 'window.LDPTileFaces = ' . wp_json_encode( array( 'base' => $base . 'assets/fonts/aa/', 'faces' => $faces ) ) . ';', 'before' );
		}
	}

	$theme_inter = 'assets/fonts/webfonts/inter-latin-opsz-normal.woff2';
	$own_inter   = plugin_dir_path( ARCHITRAVE_PANEL_FILE ) . 'fonts/inter-latin-opsz-normal.woff2';
	if ( is_readable( get_theme_file_path( $theme_inter ) ) && is_readable( $own_inter ) && filesize( get_theme_file_path( $theme_inter ) ) === filesize( $own_inter ) ) {
		wp_add_inline_style( 'live-design-window', '@font-face { font-family: "LDP Inter"; font-style: normal; font-weight: 100 900; font-display: swap; src: url("' . esc_url( get_theme_file_uri( $theme_inter ) ) . '") format("woff2"); }' );
	}
	wp_enqueue_script( 'live-design-window-wp', $base . 'assets/js/panel-window-wp.js', array( 'live-design-window', 'architrave-reading-panel' ), architrave_panel_asset_version( 'assets/js/panel-window-wp.js' ), array( 'in_footer' => true ) );
	$boot = $reader ? array( 'words' => live_design_window_words() ) : live_design_window_boot();
	unset( $boot['css'], $boot['js'] );
	wp_add_inline_script( 'live-design-window-wp', 'window.LiveDesignWindowBoot = ' . wp_json_encode( $boot ) . ';', 'before' );
}
add_action( 'wp_enqueue_scripts', 'live_design_window_enqueue', 13 );

function live_design_api_enqueue() {
	if ( ! wp_script_is( 'live-design-window-wp', 'enqueued' ) || live_design_window_reader() || architrave_panel_try() ) {
		return;
	}
	wp_enqueue_script( 'live-design-api', plugin_dir_url( ARCHITRAVE_PANEL_FILE ) . 'assets/js/live-design-api.js', array( 'live-design-window-wp' ), architrave_panel_asset_version( 'assets/js/live-design-api.js' ), array( 'in_footer' => true ) );
}
add_action( 'wp_enqueue_scripts', 'live_design_api_enqueue', 14 );

function live_design_window_action_link( $links ) {
	if ( ! architrave_panel_runs() || ! live_design_window_may() ) {
		return $links;
	}
	$to   = 'new' === live_design_window_saved() ? 'current' : 'new';
	$url  = wp_nonce_url( add_query_arg( array( 'action' => 'live_design_window', 'window' => $to ), admin_url( 'admin-post.php' ) ), 'live_design_window' );
	$word = 'new' === $to ? __( 'Try the New Window', 'vibetiles' ) : __( 'Use the Current Window', 'vibetiles' );
	$links['live-design-window'] = '<a href="' . esc_url( $url ) . '">' . esc_html( $word ) . '</a>';
	return $links;
}

function live_design_window_admin_post() {
	if ( ! live_design_window_may() ) {
		wp_die( esc_html__( 'You may not change the panel window.', 'vibetiles' ), '', array( 'response' => 403 ) );
	}
	check_admin_referer( 'live_design_window' );
	$to  = isset( $_GET['window'] ) && 'new' === sanitize_key( wp_unslash( $_GET['window'] ) ) ? 'new' : 'current';
	$now = live_design_window_save( $to );
	wp_safe_redirect( add_query_arg( 'ldp-window-set', $now, admin_url( 'plugins.php' ) ) );
	exit;
}

function live_design_window_notice() {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- only chooses which line to show; the change itself was checked in the handler.
	$set = isset( $_GET['ldp-window-set'] ) ? sanitize_key( wp_unslash( $_GET['ldp-window-set'] ) ) : '';
	if ( '' === $set || ! live_design_window_may() ) {
		return;
	}
	$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
	if ( ! $screen || 'plugins' !== $screen->id ) {
		return;
	}
	$word = 'new' === $set
		? __( 'The new window is on. It opens from the Vibetiles button on your site; readers see no difference.', 'vibetiles' )
		: __( 'The current window is back. It opens from the Vibetiles button as before.', 'vibetiles' );
	echo '<div class="notice notice-success is-dismissible"><p>' . esc_html( $word ) . '</p></div>';
}

