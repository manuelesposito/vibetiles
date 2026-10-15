<?php
/**
 * Plugin Name:       Vibetiles
 * Plugin URI:        https://elmastudio.de/en/vibetiles/
 * Description:       Design your site on the live page: a panel with dials for colours, fonts, sizes and spacing, light and dark, and saved styles your readers can pick too.
 * Version:           0.56.44
 * Requires at least: 6.6
 * Requires PHP:      7.4
 * Author:            Elmastudio
 * Author URI:        https://elmastudio.de/en/
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       vibetiles
 *
 * The panel began inside the Architrave theme (2026-09-21) and this folder is
 * still ASSEMBLED by that theme's `tools/build-plugin.py`, so there is one
 * copy of every file and nothing can drift. On any block theme the plugin
 * stands alone: it brings the panel, its stylesheets, its fonts and its own
 * button, and the page keeps the theme's design until a dial moves. On an
 * Architrave that offers to host it (ARCHITRAVE_PANEL_HOST), the theme hands
 * the panel its rail and its square instead.
 *
 * @package Vibetiles
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( defined( 'ARCHITRAVE_PANEL_VERSION' ) ) {
	add_action(
		'admin_notices',
		static function () {
			$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
			if ( current_user_can( 'activate_plugins' ) && $screen && 'plugins' === $screen->id ) {
				echo '<div class="notice notice-warning"><p>' . esc_html__( 'An older copy of this plugin, under its earlier name, is still active. Deactivate it and Vibetiles takes over at once. Do not delete the old copy from this screen: deleting it also deletes your saved styles.', 'vibetiles' ) . '</p></div>';
			}
		}
	);
	return;
}

define( 'ARCHITRAVE_PANEL_VERSION', '0.56.44' );
define( 'ARCHITRAVE_PANEL_FILE', __FILE__ );

require_once __DIR__ . '/panel.php';
require_once __DIR__ . '/fonts-on-demand.php';
require_once __DIR__ . '/window.php';
