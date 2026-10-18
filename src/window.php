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

/**
 * Who may choose: whoever may edit the design. Everyone else is a reader and
 * always gets today's window.
 *
 * @return bool
 */
function live_design_window_may() {
	return is_user_logged_in() && current_user_can( 'edit_theme_options' );
}

/**
 * The saved choice of a user: 'new' or 'current' (the default).
 *
 * @param int $user_id The user, 0 for the current one.
 * @return string
 */
function live_design_window_saved( $user_id = 0 ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found -- kept for callers.
	return 'new'; /* the new window is the only one (2026-09-28) */
}

/**
 * Save a choice. 'current' deletes the meta, so the default leaves nothing behind.
 *
 * @param string $choice 'new' or 'current'.
 * @return string The choice now saved.
 */
function live_design_window_save( $choice ) {
	$user_id = get_current_user_id();
	if ( 'new' === $choice ) {
		update_user_meta( $user_id, LIVE_DESIGN_WINDOW_META, 'new' );
	} else {
		delete_user_meta( $user_id, LIVE_DESIGN_WINDOW_META );
	}
	return live_design_window_saved( $user_id );
}

/**
 * The window for THIS page load: the test door wins for one load, then the
 * saved choice; a reader always gets 'current'.
 *
 * @return string
 */
function live_design_window_now() {
	return 'new'; /* THE NEW WINDOW FOR EVERYONE (2026-09-28): owners get the whole window, readers its readers' page */
}

/**
 * Whether this load gets the readers' page: everyone who may not edit the
 * design, and an owner looking through Preview as Reader.
 *
 * @return bool
 */
function live_design_window_reader() {
	if ( architrave_panel_try() ) {
		return false; /* THE TRY MODE (0.56.0): a visitor on the site's try page gets the whole window, saving nothing (plugin/panel.php) */
	}
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- a view of the page as a reader gets it; it saves nothing.
	return ! live_design_window_may() || isset( $_GET['ldp-as-reader'] );
}

/**
 * The window's page of a setting: the list's page, except the rows the prototype
 * gathers on its own Buttons page (2026-09-28): the button colour and corners,
 * the three levels, the tags, the links and the chosen item; and the fade, which
 * the prototype keeps with the pictures. The current window keeps them where they were.
 *
 * @param array $setting A setting from plugin/settings.json.
 * @return string The page's first part, or ''.
 */
function live_design_window_page( $setting ) {
	$buttons = array( 'button', 'buttonshape', 'tagsfollow', 'buttonstyle', 'buttonmedium', 'buttonquiet', 'tags', 'chosenitem', 'links', 'buttonColour', 'buttonShape', 'tagsMatchButtons', 'primaryButton', 'secondaryButton', 'tertiaryButton', 'currentItem' ); /* and their names since 2026-10-03 */
	if ( ! empty( $setting['key'] ) && in_array( $setting['key'], $buttons, true ) ) {
		return 'Buttons';
	}
	if ( ! empty( $setting['key'] ) && in_array( $setting['key'], array( 'radius', 'borderWidth', 'borderStyle', 'borderStrength' ), true ) ) {
		return 'Corners and lines'; /* corners and lines in CSS's words (2026-10-03) */
	}
	if ( ! empty( $setting['key'] ) && in_array( $setting['key'], array( 'lineLength', 'titleWidth', 'pictureWidth', 'figureWidth' ), true ) ) {
		return 'Layout'; /* the layout in WordPress's words (2026-10-03), which the old window never drew */
	}
	if ( ! empty( $setting['key'] ) && in_array( $setting['key'], array( 'pictureFilter', 'colourOnHover', 'dimInDark', 'pictureFrame', 'frameWidth', 'pictureFade', 'pictureShadow', 'pictureEdge', 'pictureCorners' ), true ) ) {
		return 'Pictures'; /* the pictures' keys (2026-10-03) */
	}
	if ( ! empty( $setting['key'] ) && in_array( $setting['key'], array( 'picturefade', 'fadeedges' ), true ) ) {
		return 'Pictures'; /* the prototype fades a picture on its own page */
	}
	return isset( $setting['page'] ) && is_string( $setting['page'] ) ? trim( explode( '›', $setting['page'] )[0] ) : '';
}

/**
 * The sections, from plugin/settings.json's pages: each setting names the page
 * it sits on ("Type › Headings"), and the first part is its section. They come
 * in the order the panel shows them; a page the list gains later is appended.
 * "First level" is the reader's own first page, not a section.
 *
 * @return array
 */
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

/**
 * The settings of the sections the new window has built, from plugin/settings.json:
 * each one's saved name, its label, its kind, its choices or steps and its rest.
 * The window lays its pages out by these names and never writes a label of its own.
 *
 * @return array
 */
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
			'label'   => $label, /* in English; the window says it in the site's language through its words */
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

/**
 * The roles of the type, from plugin/settings.json: each one's name, what it
 * styles and its dials, in the order the list gives them (the seven, 2026-10-02).
 *
 * @return array
 */
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

/**
 * What the new window needs to start: its words, the sections, and the
 * addresses of its two scripts and its sheet (the switch in today's window
 * loads them on the spot when the owner turns the new window on).
 *
 * @return array
 */
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

/**
 * THE ROUTE: GET answers the saved choice, POST { window } saves it. Only for
 * whoever may edit the design; a logged-in cookie also needs the REST nonce.
 */
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

/**
 * ON THE PAGE, FOR AN OWNER ONLY. Today's window is told the choice and the
 * route (its Button and Sharing page carries the switch). Only when this load
 * is 'new' are the new window's two scripts and its sheet served; at the
 * default nothing of it is.
 */
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
				'try'    => architrave_panel_try(), /* the whole window for a visitor, nothing saved (0.56.0) */
				'url'    => rest_url( 'architrave/v1/window' ),
				'nonce'  => $reader || architrave_panel_try() ? '' : wp_create_nonce( 'wp_rest' ),
			)
		) . ';',
		'before'
	);
	$base = plugin_dir_url( ARCHITRAVE_PANEL_FILE );
	wp_enqueue_style( 'live-design-window', $base . 'assets/css/panel-window.css', array(), architrave_panel_asset_version( 'assets/css/panel-window.css' ) );
	wp_enqueue_script( 'live-design-window', $base . 'assets/js/panel-window.js', array(), architrave_panel_asset_version( 'assets/js/panel-window.js' ), live_design_window_script_args() );
	/* THE TILES' "Aa" (2026-10-02, tools/build-tile-faces.py): each face cut down to the two letters, so the window
	   built ahead downloads a few KB per tile instead of every style's whole face (about 540 KB on elmastudio.de). */
	$aa = plugin_dir_path( ARCHITRAVE_PANEL_FILE ) . 'assets/fonts/aa/faces.json';
	if ( is_readable( $aa ) ) {
		$faces = json_decode( (string) file_get_contents( $aa ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- a file of the plugin's own
		if ( is_array( $faces ) ) {
			wp_add_inline_script( 'live-design-window', 'window.LDPTileFaces = ' . wp_json_encode( array( 'base' => $base . 'assets/fonts/aa/', 'faces' => $faces ) ) . ';', 'before' );
		}
	}
	/* ONE INTER (2026-10-02): the window's own "LDP Inter" is the same file the theme ships as "Inter Variable"; where
	   the theme has it, the window reads the theme's copy, which the page has already fetched, not a second one (73 KB). */
	$theme_inter = 'assets/fonts/webfonts/inter-latin-opsz-normal.woff2';
	$own_inter   = plugin_dir_path( ARCHITRAVE_PANEL_FILE ) . 'fonts/inter-latin-opsz-normal.woff2';
	if ( is_readable( get_theme_file_path( $theme_inter ) ) && is_readable( $own_inter ) && filesize( get_theme_file_path( $theme_inter ) ) === filesize( $own_inter ) ) {
		wp_add_inline_style( 'live-design-window', '@font-face { font-family: "LDP Inter"; font-style: normal; font-weight: 100 900; font-display: swap; src: url("' . esc_url( get_theme_file_uri( $theme_inter ) ) . '") format("woff2"); }' );
	}
	wp_enqueue_script( 'live-design-window-wp', $base . 'assets/js/panel-window-wp.js', array( 'live-design-window', 'architrave-reading-panel' ), architrave_panel_asset_version( 'assets/js/panel-window-wp.js' ), live_design_window_script_args() );
	$boot = $reader ? array( 'words' => live_design_window_words() ) : live_design_window_boot(); /* a reader's page needs only the words */
	unset( $boot['css'], $boot['js'] );
	wp_add_inline_script( 'live-design-window-wp', 'window.LiveDesignWindowBoot = ' . wp_json_encode( $boot ) . ';', 'before' );
}
add_action( 'wp_enqueue_scripts', 'live_design_window_enqueue', 13 );

/**
 * THE AI DOOR (window.LiveDesign, assets/js/live-design-api.js): an AI styles the
 * site from a chat through the window's host, by the list's names. Only where the
 * owner's window is served; a reader's page never gets it.
 */
function live_design_api_enqueue() {
	if ( ! wp_script_is( 'live-design-window-wp', 'enqueued' ) || live_design_window_reader() || architrave_panel_try() ) {
		return; /* and never in the try mode: a visitor's page has no AI door */
	}
	wp_enqueue_script( 'live-design-api', plugin_dir_url( ARCHITRAVE_PANEL_FILE ) . 'assets/js/live-design-api.js', array( 'live-design-window-wp' ), architrave_panel_asset_version( 'assets/js/live-design-api.js' ), live_design_window_script_args() );
}
add_action( 'wp_enqueue_scripts', 'live_design_api_enqueue', 14 );

/**
 * How the window's scripts load (0.58.0): deferred where the server printed the
 * first paint, since they wait for architrave-reading-panel, which waits for
 * presets.js, deferred then (plugin/panel.php; inc/site-styles.php, THE FIRST
 * PAINT, PRINTED BY THE SERVER). A blocking dependent would quietly make the
 * whole chain blocking again. Else as before, in the footer.
 *
 * @return array{in_footer: bool, strategy?: string}
 */
function live_design_window_script_args() {
	$args = array( 'in_footer' => true );
	if ( function_exists( 'architrave_first_paint_printed' ) && architrave_first_paint_printed() ) {
		$args['strategy'] = 'defer';
	}
	return $args;
}

/**
 * ON THE PLUGINS PAGE: "Try the New Window" or "Use the Current Window" next
 * to the plugin, for whoever may choose, through admin-post with a nonce.
 *
 * @param array $links The plugin's action links.
 * @return array
 */
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
/* unhooked 2026-09-28: there is no other window to choose */

/**
 * The link's handler: capability first, then the nonce, then back to the
 * Plugins page with a line that says what happened.
 */
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
/* unhooked 2026-09-28: there is no other window to choose */

/**
 * The line on the Plugins page after the link was used.
 */
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
/* unhooked 2026-09-28: there is no other window to choose */
