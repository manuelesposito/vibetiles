=== Vibetiles ===
Contributors: manuelesposito
Tags: style sharing, typography, fonts, dark mode, styles
Requires at least: 6.6
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 0.56.40
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Design your site on the live page: colours, fonts, sizes, light and dark. Save styles, share them, and paste in styles from other sites.

== Description ==

Vibetiles puts a small button on your site. Press it and a panel opens, on the real page, with dials for colours, fonts, text sizes, line spacing, light and dark. Turn a dial and the page changes in front of you. When it looks right, save it as a style.

The panel works on block themes. It does not touch your theme's design: until you move a dial, the page is exactly what your theme draws, and the Original tile gives that back at any time.

**For you, the owner:**

* Dials for the page colour, the text ink and the accent, in light and dark.
* A font library of more than 80 open licensed faces, fetched only when you pick one and then served from your own site.
* Text sizes, line spacing, and a dial per kind of text: headings, reading text, quotes, small print, the interface.
* Save any state of the dials as a style, publish the ones you like, and set one as the site's default.

**Share styles between sites:**

Every style you build can travel. Copy it as a link, and anyone with the plugin pastes that link into their own panel: the whole style arrives, ready to use and to change. Turn on "Everyone can copy styles" and your visitors get a Copy style button too, so a style they like on your site can be on theirs a minute later. No account, no download, no marketplace: a style is just a link, so styles can be passed around by email, in a post or in a chat.

**For your readers:**

A reader gets a smaller panel: reading size, light and dark, and the styles you chose to publish. You decide how much of it they see, or you hide the button for readers entirely. A reader's choices are saved in their own browser and never sent anywhere.

**Beta.** The plugin is in daily use on [elmastudio.de/en](https://elmastudio.de/en) and is being improved all the time. If something looks wrong on your theme, please say so in the support forum; reports about specific themes are the most useful thing you can send.

== Installation ==

1. In your WordPress admin, go to Plugins, Add New, and search for "Vibetiles". Or upload the plugin zip there.
2. Activate the plugin.
3. Open your site while you are logged in. Press the Vibetiles button on the page (or Alt+D) and the panel opens.

Nothing on your site changes until you move a dial.

== External services ==

The plugin's font library is not inside the plugin, because that would make it a very large download. When you, the site owner, pick a font for the first time, your server fetches that font's files and its licence text once from jsDelivr (cdn.jsdelivr.net), an open source CDN, and stores them in your own uploads folder. From then on the font is served by your site.

* What is sent: the request for the font file itself. No personal data, no content of your site.
* When: only when a logged in administrator picks a font that is not yet on the site. Visitors never trigger it and their browsers never connect to jsDelivr.
* The addresses are pinned to exact versions and listed in the plugin file font-files.json.

jsDelivr terms of service: https://www.jsdelivr.com/terms
jsDelivr privacy policy: https://www.jsdelivr.com/terms/privacy-policy

No other outside service is used. The plugin has no analytics, no accounts and it does not phone home.

== Frequently Asked Questions ==

= Does it work with my theme? =

The panel is at home in Architrave, the block theme it was made with, which will soon be available for free on wordpress.org. On other block themes it is tested on Twenty Twenty-Five. It should work on other themes too; if something does not look right on yours, please tell us in the support forum.

= Will it change how my site looks the moment I activate it? =

No. It adds the small button, and nothing else changes until you move a dial. The Original tile always returns the theme's own design.

= Where are my readers' settings stored? =

In their own browsers only. The plugin stores one thing on your server: the styles you publish, in a single WordPress option.

= Does the other person need the plugin to use a style I share? =

Yes. A style link opens in Vibetiles, so the site it is pasted into needs the plugin too. The theme there can be a different one: the style carries colours, fonts and sizes, and the panel applies them to whatever theme the site uses.

= Is it safe to paste a style someone sent me? =

Yes. A style is only design settings: colours, fonts, sizes and switches. When you paste one, the panel reads it through a list of allowed settings and drops everything else, including any value that could carry code. A pasted style is also only yours until you choose to show it to everyone.

= What happens when I uninstall it? =

The fetched fonts and the published styles are deleted. Your theme is exactly as it was.

= Why do some names in the code say "architrave"? =

The panel grew inside the Architrave theme before it became this plugin, and the internal names stayed so that saved styles keep working. They are used as a unique prefix throughout.

= Where is the source code? =

The readable source and the build scripts are at https://github.com/manuelesposito/vibetiles. Some shipped files are generated by those scripts; the repository holds what they are generated from.

== Screenshots ==

1. The readers' panel on an article: text size, light or dark, and the styles the site shows.
2. The owner's window: the styles, which of them readers see, and the default.
3. Colour: a palette for the style, each with a light and a dark side.
4. Type: the reading and interface fonts, and every text role's face and weight.
5. Layout: space, line length and the widths of the article's parts.
6. On a phone the panel is a sheet from below.

== Changelog ==

= 0.56.10 =
* Make Default moves the Default badge at once; the save follows.

= 0.56.9 =
* Pressing Undo several times in a row no longer closes the panel.

= 0.56.8 =
* A menu, a field or a quiet button on the inverted rail takes the rail's own colours. The style's card colour stays on the paper, where the card is.

= 0.56.7 =
* A drop cap is drawn only where the first paragraph has room for it: at least two lines more than the cap is tall. A short opening keeps its first letter plain.

= 0.56.2 =
* Try mode: a page can offer "Try it on this page", and a visitor tries the panel without anything being saved.
* The writing on a filled button is chosen by its fill, so it always reads.

= 0.55.21 =
* The pick tool: point at any text on the page and the panel opens its row. It finds dates, captions, cards and small print too.
* A click on a colour swatch copies its hex value.
* Reset Style puts sizes and colours back for good, also for a style that began on a preset.
* The fonts line counts what readers download.
* The picture frame reaches every picture in a post, on any theme, and follows the night dimming.
* No glass over the page while it changes. The Buttons page points at the real page.
* The old name is gone from every file.

= 0.54.0 =
* Button and Settings share one section. The Default badge follows the window.

= 0.53.1 =
* Reader counting removed. Button, Original Style and Settings moved into the Styles page.

= 0.52.0 =
* The plugin is called Vibetiles; it was Live Design Panel. Saved styles carry over.

= 0.51.0 =
* The Readers page moved into Styles.

= 0.50.1 =
* Every switch in the panel pressed in a sweep, and the bugs it found fixed.

= 0.49.2 =
* Original sits with the other styles. Default is a badge and no longer jumps first.
* A highlighter colour of your own is kept.

= 0.48.0 =
* The six base styles stay on the site and cannot be removed.

= 0.47.0 =
* The highlighter no longer draws a bar under titles.

= 0.46.0 =
* Light and dark each keep their own colours; the "Same colours" switch is gone.

= 0.45.0 =
* Light and dark stay on the Colour page. A one-moon switch tried in 0.44.0 was taken back.

= 0.43.0 =
* The panel speaks English only; the German translation was removed.

= 0.42.1 =
* Every surface in three words. Corners & Lines from nine rows to six.
* Appearance is picked the Mac way.

= 0.41.0 =
* One quote look for all six base styles, a step larger, with more air.

= 0.40.0 =
* Four quote looks, each doing what it says.

= 0.39.0 =
* The Quotes settings reach quote posts. Quotes are always italic.

= 0.38.3 =
* Reset Style on every style, grey when there is nothing to reset.
* Coloured Text colours the text in all six base styles.

= 0.37.0 =
* Five colour sets of six, in an order that never moves.

= 0.36.0 =
* The six base styles' colours tuned style by style.

= 0.35.0 =
* Colour names. One recipe for the six base styles.

= 0.34.1 =
* Reset Style. Undo no longer closes the window.

= 0.33.0 =
* Every style ticks its colours. Colour presets slimmed from 32 to 22.

= 0.32.2 =
* Space is set by its job, in whole steps on one scale.
* A renamed style keeps its name; a page takes the site's newer version before it saves.

= 0.31.4 =
* A style on the site saves itself; there is no Publish step. A removed style's leftovers are cleared.
* A link card no longer fills with the link colour.

= 0.30.1 =
* Appearance shown as pictures, on top of Colour.

= 0.29.1 =
* The panel reworked the Apple way. No grey left behind after a tap.

= 0.28.0 =
* The old panel pages' styles removed.

= 0.27.0 =
* The AI helper speaks the panel's own words.

= 0.26.0 =
* The two fonts sit under their roles.

= 0.25.0 =
* Line spacing in plain words. The readers' panel cleaned out.

= 0.24.0 =
* Pictures: one key per row.

= 0.23.0 =
* Buttons named as design systems name them: primary, secondary, tertiary.

= 0.22.0 =
* Corners and lines in CSS's words. One set of words for the surfaces.

= 0.21.0 =
* The layout in WordPress's words. Line length on every theme.

= 0.20.0 =
* Seven colours named for their job. The dark ground is a colour.

= 0.19.0 =
* Seven type roles. The site name follows Headings.

= 0.18.0 =
* No Effects page. The site name has its own settings.

= 0.17.0 =
* Original alone: Instrument and its effects removed. 94 settings.

= 0.16.0 =
* The clean-up: fourteen styles out. Two styles, 151 settings.

= 0.15.58 =
* Eleven styles: Tube, Brochure, Terminal, Arcade, Matrix, Blueprint, Book, Gallery, Poster, Aperitivo, Risograph.
* A change of look much faster. The Effects page sorted. Every setting pressed in every style.

= 0.14.3 =
* Every effect with its strength and colour.

= 0.13.1 =
* The extras. The moving light follows the corners.

= 0.12.16 =
* Ready for wordpress.org: the readme, the keyboard check, the readers' window with Done, a sliding switch and A buttons.
* The AI can publish, on WordPress and on a site that is only files.
* The button stays in the header. Light and dark in one step.

= 0.12.0 =
* First public release.

== Upgrade Notice ==

= 0.52.0 =
The plugin is now called Vibetiles. Saved styles carry over.

= 0.12.0 =
First public release.
