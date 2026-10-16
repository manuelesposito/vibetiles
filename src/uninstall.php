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

/**
 * What one site keeps: its options and the faces fetched into its uploads.
 */
function live_design_panel_uninstall_site() {
	delete_option( 'architrave_panel_site_styles' );
	delete_option( 'architrave_panel_style_versions' ); /* the kept versions of each published style (0.11.164) */
	delete_option( 'architrave_panel_starters_seeded' ); /* that the starter styles were given once (0.57.0) */
	delete_option( 'architrave_panel_preview_links' ); /* the preview links (0.11.173) */
	delete_option( 'architrave_panel_reader_counts' ); /* the reader numbers (0.11.175) */
	delete_option( 'architrave_panel_count_readers' );

	global $wp_filesystem;
	$up  = wp_upload_dir( null, false );
	$dir = trailingslashit( $up['basedir'] ) . 'live-design-panel/fonts/';
	if ( $wp_filesystem && $wp_filesystem->is_dir( $dir ) ) {
		$wp_filesystem->delete( $dir, true );
		$wp_filesystem->rmdir( dirname( $dir ) ); // only succeeds when nothing else is in it, which is the point
	}
}

require_once ABSPATH . 'wp-admin/includes/file.php';
WP_Filesystem();

/* EVERY SITE OF A NETWORK (2026-10-01, the panel audit): only the main site was cleaned, and
   each other site kept its styles, versions, preview links, reader numbers and fonts. */
if ( is_multisite() ) {
	foreach ( get_sites( array( 'fields' => 'ids', 'number' => 0 ) ) as $live_design_site ) {
		switch_to_blog( $live_design_site );
		live_design_panel_uninstall_site();
		restore_current_blog();
	}
} else {
	live_design_panel_uninstall_site();
}
delete_metadata( 'user', 0, 'live_design_panel_window', '', true ); /* each owner's choice of window (0.11.152); user meta is the network's, once */
