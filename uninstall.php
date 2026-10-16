<?php
/**
 * Uninstall: the library faces fetched into uploads (fonts-on-demand.php) and
 * the published styles (the option) go with the plugin. The theme mod
 * `architrave_site_styles` is deliberately left: it belongs to the Architrave
 * theme, which can still read it, and it predates the plugin.
 *
 * @package Vibetiles
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

function live_design_panel_uninstall_site() {
	delete_option( 'architrave_panel_site_styles' );
	delete_option( 'architrave_panel_style_versions' );
	delete_option( 'architrave_panel_starters_seeded' );
	delete_option( 'architrave_panel_preview_links' );
	delete_option( 'architrave_panel_reader_counts' );
	delete_option( 'architrave_panel_count_readers' );

	global $wp_filesystem;
	$up  = wp_upload_dir( null, false );
	$dir = trailingslashit( $up['basedir'] ) . 'live-design-panel/fonts/';
	if ( $wp_filesystem && $wp_filesystem->is_dir( $dir ) ) {
		$wp_filesystem->delete( $dir, true );
		$wp_filesystem->rmdir( dirname( $dir ) );
	}
}

require_once ABSPATH . 'wp-admin/includes/file.php';
WP_Filesystem();

if ( is_multisite() ) {
	foreach ( get_sites( array( 'fields' => 'ids', 'number' => 0 ) ) as $live_design_site ) {
		switch_to_blog( $live_design_site );
		live_design_panel_uninstall_site();
		restore_current_blog();
	}
} else {
	live_design_panel_uninstall_site();
}
delete_metadata( 'user', 0, 'live_design_panel_window', '', true );
