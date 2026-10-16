#!/usr/bin/env python3
"""Split style.css into the theme's sheet and the panel plugin's sheet.

ONE SOURCE, TWO SHEETS (2026-09-21, the panel's move to a plugin). The rules
that draw the design panel and the rules that draw every style but Standard
are the plugin's. They are about 350 rules scattered through style.css, beside
the base rules they adjust and under the comments that explain both. Cutting
them into a second file by hand would tear every one of those passages in two
and freeze the stylesheet for a day while another session works in it daily.

So style.css STAYS WHOLE in the repository, and the two zips are cut from it
by rule: `build-dist.py` ships what is the theme's, `build-plugin.py` ships the
rest as `assets/css/panel.css`, which the plugin loads after the theme's sheet.
A rule is never edited, only sent one way or the other; a selector list with
both kinds is written twice, each half with its own selectors.

WHAT IS THE PLUGIN'S
  1. The panel's interface: a selector that names a `.reading-*` class the
     tiny panel (assets/js/tiny-panel.js) does not use.
  2. A style that is not Standard at rest: a selector whose root (`:root` or
     `html`) asks for a dial value Standard does not rest on, or for a colour
     room other than neutral. `REST` (read from plugin/settings.json)
     is the list `architrave_standard_at_rest()` prints in functions.php,
     whose tables tools/settings-list.mjs writes from presets.js itself
     (1.3.491); its --check fails when either is behind the script.

    python3 tools/split_style.py            report the two halves
    python3 tools/split_style.py --moved    print the plugin's half

THE ORDER CHANGES FOR WHAT MOVES: the plugin's sheet comes after the theme's,
so a moved rule now beats a theme rule of equal weight that used to follow it.
`KEEP` and `MOVE` below settle such a pair by hand; the judge that finds them
is tools/judge-panel-split.mjs on the BUILT zips.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

THEME = Path(__file__).resolve().parent.parent

# REST and ABSENT COME FROM THE LIST (step 4 of lab/the-build-plan.html,
# 2026-09-27): plugin/settings.json records, for every attribute a setting
# stamps, whether Standard carries it at rest (`rest` says "REST", `restValues`
# the value) or not at all ("ABSENT"); `otherAttrs` holds the few no setting
# stamps (the tile, the preset, the reading size's base, the accent's
# brightness). A NEW DIAL ATTRIBUTE is marked there, not here, and
# `node tools/settings-list.mjs --check` fails when a REST value is not what
# Standard's root carries at rest.
def _from_list() -> tuple[dict[str, str], set[str]]:
    listed = json.loads((THEME / "plugin" / "settings.json").read_text(encoding="utf-8"))
    rest: dict[str, str] = {}
    absent: set[str] = set()
    marks = [(a, st, e.get("restValues") or {}) for e in listed["settings"] for a, st in (e.get("rest") or {}).items()]
    marks += [(a, st, {}) for a, st in listed.get("otherAttrs", {}).items()]
    keys = (listed.get("engine") or {}).get("keys") or {}  # the engine's own stamps, kept since the seven colours (2026-10-03)
    marks += [(a, "REST", {a: v}) for a, v in (keys.get("stamps") or {}).items()]
    marks += [(a, "ABSENT", {}) for a in keys.get("absent") or []]
    for attr, status, values in marks:
        if status == "REST":
            if attr in values:  # a role's font names data-sans at rest; its value is the engine's stamp (0.26.0)
                rest[attr] = values[attr]
        elif status == "ABSENT":
            absent.add(attr)
    return rest, absent


# REST: Standard at rest, what the root carries with nothing stored. ABSENT: the dials the root does not carry at rest at all.
REST, ABSENT = _from_list()
ABSENT_PATTERNS = (re.compile(r"^data-fx-[a-z]+-[a-z]+$"), re.compile(r"^data-[a-z]+-leading$"), re.compile(r"^data-(head|kicker)-(align|colour)$"), re.compile(r"^data-[a-z]+-members$"), re.compile(r"^data-[a-z]+-m-[a-z]+-[a-z]+$"), re.compile(r"^data-code-[a-z]+$"), re.compile(r"^data-small-colour$"), re.compile(r"^data-(body|quote|interface|code)-colour$"))  # the code role and Small text's colour (2026-10-02, the seven roles); every role's colour (2026-10-03, the seven colours)
# The colour rooms the theme has alone (color-mode.js, SHOWN without the plugin); None = no attribute yet.
THEMES_ALONE = (None, "neutral-light", "neutral-dark")

# The panel classes the tiny panel wears; every other .reading-* class is the whole panel's.
TINY = {
    "reading-panel", "reading-panel-tiny", "reading-panel-scrim", "reading-sheet-top", "reading-sheet-body",
    "architrave-panel-opener",  # the plugin's own door, which the panel's own rules dress (2026-09-22)
    "reading-panel-head", "reading-panel-title", "reading-back", "reading-stepper", "reading-tall", "reading-dots",
    "reading-segment",
}

# Selectors settled by hand (exact text, whitespace collapsed). Each with its reason.
KEEP: set[str] = set()
MOVE: set[str] = set()


def is_dial(name: str) -> bool:
    return name in REST or name in ABSENT or any(p.match(name) for p in ABSENT_PATTERNS)


def strip_comments(css: str) -> str:
    return re.sub(r"/\*.*?\*/", "", css, flags=re.S)


def check_balanced(css: str, name: str = "style.css") -> None:
    """Refuse a stylesheet whose boxes do not all close.

    WHY (2026-10-11, "check Elmastudio on mobile ... it's completely
    destroyed"): the 0.56.26 edit wrote a new rule where the closing brace of
    an `@media (hover: hover)` block had been. A browser does not complain: it
    treats every rule after that point as part of the still-open block, so
    193K of style.css, every phone rule among it, applied only to screens with
    a mouse. Nine releases shipped like that. This walk counts the braces the
    way a browser nests them, skipping comments and quoted strings, and stops
    the build at the first file that opens a box it never shuts, an unclosed
    comment, or a closing brace with nothing open. It names the line, then
    raises SystemExit so no zip is written.
    """
    stack: list[int] = []
    i, n = 0, len(css)
    line = 1
    while i < n:
        c = css[i]
        if c == "\n":
            line += 1
        elif c == "/" and css.startswith("/*", i):
            end = css.find("*/", i + 2)
            if end < 0:
                raise SystemExit(f"{name}:{line}: a comment opens here and never closes; everything after it is lost")
            line += css.count("\n", i, end)
            i = end + 2
            continue
        elif c in "\"'":
            q = c
            j = i + 1
            while j < n and css[j] != q:
                if css[j] == "\\":
                    j += 1
                if css[j] == "\n":
                    break  # an unterminated string ends at the line, as in a browser
                j += 1
            i = j + 1
            continue
        elif c == "{":
            stack.append(line)
        elif c == "}":
            if not stack:
                raise SystemExit(f"{name}:{line}: a closing brace with no open block before it")
            stack.pop()
        i += 1
    if stack:
        opened = stack[-1]
        head = css.splitlines()[opened - 1].strip()[:80]
        raise SystemExit(f"{name}:{opened}: this block never closes: {head}\n"
                         f"  {len(stack)} block(s) stay open at the end of the file; every rule after line {opened} would sit inside")
    check_floored(css, name)


def check_floored(css: str, name: str = "style.css") -> None:
    """Refuse a type size that a dial can shrink with no floor under it.

    WHY (2026-10-14, the privacy page's "Last updated" line at 7.5px: "that
    shouldn't be possible"): a style set Small text to 0.62, and the date's
    size was `calc(12px * var(--small-size))` with nothing under it. Most role
    sizes already sat on `max(var(--text-floor-content) | --text-floor-ui, ...)`;
    seventeen did not. Every `font-size` that multiplies by a `--*-size` dial
    must name one of the two floors on the same line, or the build stops here.
    """
    import re
    pat = re.compile(r"font-size:[^;{}]*\* var\(--[a-z-]*size")
    bad = [f"{name}:{i}: {l.strip()[:100]}" for i, l in enumerate(css.splitlines(), 1)
           if pat.search(l) and "text-floor-" not in l]
    if bad:
        raise SystemExit("a dial can shrink these sizes below the floor; wrap them in max(var(--text-floor-content), ...):\n  "
                         + "\n  ".join(bad))


# ── a small parser: rules, and at-rules that hold rules ─────────────────────

HOLDERS = ("@media", "@supports", "@starting-style", "@layer", "@container")


def parse(css: str) -> list:
    """[('rule', selector, body) | ('at', prelude, [items]) | ('raw', text)]"""
    items, i, n = [], 0, len(css)
    while i < n:
        j = i
        depth = 0
        # read up to the next '{' or ';' at depth 0
        while j < n and css[j] not in "{;":
            j += 1
        if j >= n:
            rest = css[i:].strip()
            if rest:
                items.append(("raw", rest))
            break
        head = css[i:j].strip()
        if css[j] == ";":
            if head:
                items.append(("raw", head + ";"))
            i = j + 1
            continue
        # find the matching brace
        k, depth = j + 1, 1
        while k < n and depth:
            if css[k] == "{":
                depth += 1
            elif css[k] == "}":
                depth -= 1
            k += 1
        inner = css[j + 1 : k - 1]
        if head.startswith(HOLDERS):
            items.append(("at", head, parse(inner)))
        elif head.startswith("@"):
            items.append(("raw", head + " {" + inner + "}"))
        else:
            items.append(("rule", head, inner.strip()))
        i = k
    return items


def split_selectors(sel: str) -> list[str]:
    out, depth, cur = [], 0, ""
    for ch in sel:
        if ch in "([":
            depth += 1
        elif ch in ")]":
            depth -= 1
        if ch == "," and depth == 0:
            out.append(cur.strip())
            cur = ""
        else:
            cur += ch
    if cur.strip():
        out.append(cur.strip())
    return out


ATTR = re.compile(r"\[\s*(data-[a-z0-9-]+)\s*(?:([~|^$*]?=)\s*[\"']?([^\"'\]]*)[\"']?\s*)?\]")


def attr_holds(op, want, have) -> bool:
    if have is None:
        return False
    if op is None:
        return True
    return {"=": have == want, "^=": have.startswith(want), "$=": have.endswith(want), "*=": want in have,
            "~=": want in have.split(), "|=": have == want or have.startswith(want + "-")}[op]


def root_compound(sel: str) -> str | None:
    """The compound selector that starts with :root or html, with its brackets and :not()s."""
    m = re.search(r"(?:^|[\s>+~(])(:root|html)(?![\w-])", sel)
    if not m:
        return None
    i = m.end()
    depth = 0
    while i < len(sel):
        ch = sel[i]
        if ch in "([":
            depth += 1
        elif ch in ")]":
            depth -= 1
        elif depth == 0 and ch in " >+~,":
            break
        i += 1
    return sel[m.start(1) : i]


def root_can_be_standard(compound: str) -> bool:
    """Can this root compound match a root that carries Standard at rest, in a room the theme has alone?"""
    nots = re.findall(r":not\(((?:[^()]|\([^()]*\))*)\)", compound)
    positive = re.sub(r":not\(((?:[^()]|\([^()]*\))*)\)", "", compound)
    # :is(A, B) / :where(A, B) on the root: one alternative that can be Standard is enough
    for inner in re.findall(r":(?:is|where)\(((?:[^()]|\([^()]*\))*)\)", positive):
        if not any(root_can_be_standard(":root" + alt) for alt in split_selectors(inner)):
            return False
    positive = re.sub(r":(?:is|where)\(((?:[^()]|\([^()]*\))*)\)", "", positive)
    theme_pos = [(op or None, val) for name, op, val in ATTR.findall(positive) if name == "data-theme"]
    theme_neg = [(op or None, val) for inner in nots for name, op, val in ATTR.findall(inner) if name == "data-theme"]
    if theme_pos or theme_neg:
        ok = any(
            all(attr_holds(op, val, room) for op, val in theme_pos) and not any(attr_holds(op, val, room) for op, val in theme_neg)
            for room in THEMES_ALONE
        )
        if not ok:
            return False
    for name, op, val in ATTR.findall(positive):
        if is_dial(name) and not attr_holds(op or None, val, REST.get(name)):
            return False
    for inner in nots:
        found = [(name, op, val) for name, op, val in ATTR.findall(inner) if is_dial(name)]
        # :not(A, B) fails when any alternative holds; a single compound alternative holds when all its attrs hold
        for alt in split_selectors(inner):
            attrs = [(name, op, val) for name, op, val in ATTR.findall(alt) if is_dial(name)]
            if attrs and len(attrs) == len(ATTR.findall(alt)) and all(attr_holds(op or None, val, REST.get(name)) for name, op, val in attrs):
                return False
        del found
    return True


def is_plugins(selector: str) -> bool:
    key = re.sub(r"\s+", " ", selector.strip())
    if key in KEEP:
        return False
    if key in MOVE:
        return True
    for cls in re.findall(r"\.(reading-[a-z0-9-]+)", selector):
        if cls not in TINY:
            return True
    compound = root_compound(selector)
    if compound and not root_can_be_standard(compound):
        return True
    return False


NOT_CALL = re.compile(r":not\(((?:[^()]|\([^()]*\))*)\)")


def is_shell(selector: str) -> bool:
    """Does this rule DRAW the panel's frame.

    The tiny panel wears the classes in TINY, so the rules that give the panel
    its sheet, its scrim and its head stay with the theme: alone it still needs
    them. A guest has no theme to take them from, so build-plugin.py sends this
    handful along as `panel-shell.css` (0.8.0; without it the panel opened as a
    plain block at the bottom of a stranger's page).

    A rule that only EXCLUDES the panel (`:not(:where(.reading-panel *))`) is
    the theme's own rule about the theme's own page and must not travel: what
    is named inside `:not()` is not what a rule draws.
    """
    # `architrave-panel-opener` is the plugin's own door, which the panel's own
    # rules dress (2026-09-22): it is part of the panel's frame and travels with
    # it, and the theme standing alone has nothing that wears the class.
    named = re.findall(r"\.((?:reading|architrave-panel)-[a-z0-9-]+)", NOT_CALL.sub("", selector))
    return bool(named) and all(c in TINY for c in named)


def shell(items: list) -> list:
    """The theme's half, narrowed to the rules that draw the panel's frame."""
    out = []
    for item in items:
        if item[0] == "rule":
            sels = [s for s in split_selectors(item[1]) if is_shell(s)]
            if sels:
                out.append(("rule", ", ".join(sels), item[2]))
        elif item[0] == "at":
            inner = shell(item[2])
            if inner:
                out.append(("at", item[1], inner))
    return out


# ── the design-system parts the panel wears ─────────────────────────────────
#
# WHY (0.8.0). The panel's buttons, its segmented rows and its sheet are QDS
# components, drawn by assets/css/quire.css. On Architrave that sheet is under
# the panel already. On a stranger's theme it is not, so Customise came out as a
# flat grey slab with its icon against its words. The whole sheet cannot travel:
# it would redraw the guest's own page. These are the four component names the
# panel actually prints, measured on a live stock theme.
# 0.9.0 added the pop-up menu and the text field, measured on a live guest: the
# menu came out transparent, with no shadow, no row height and the browser's own
# bullets and 40px indent, so it landed invisible over the rows beneath it. That
# is the screen where "I can't see where I have to click" was written. The
# fields were bare browser inputs, with no border and no ground.
WORN = (
    "quire-button",
    "quire-segmented",
    "quire-surface",
    "quire-menu-icon",
    "quire-menu",
    "quire-menu-item",
    "quire-menu-label",
    "quire-menu-check",
    "quire-menu-chevron",
    "quire-input",
)

GROUP = re.compile(r":(?:is|where|matches)\(")


def expand(selector: str) -> list[str]:
    """Every concrete branch. `:is()`/`:where()` multiply out; `:not()` stays
    whole, because what it names is what the rule does NOT draw."""
    m = GROUP.search(selector)
    if not m:
        return [selector]
    depth, i = 0, m.end() - 1
    while i < len(selector):
        if selector[i] == "(":
            depth += 1
        elif selector[i] == ")":
            depth -= 1
            if depth == 0:
                break
        i += 1
    inner, head, tail = selector[m.end() : i], selector[: m.start()], selector[i + 1 :]
    out = []
    for alt in split_selectors(inner):
        out.extend(expand(head + alt.strip() + tail))
    return out


def is_part(selector: str) -> bool:
    """Can this rule only ever draw something the panel prints.

    EVERY branch must require one of the worn class names, `:is()` multiplied
    out first. That is the whole safety argument: a branch that does not name
    one could match an element of the guest's own page, and the plugin must
    never redraw the page it is a guest on.
    """
    branches = expand(selector)
    if not branches:
        return False
    return all(any(f".{c}" in NOT_CALL.sub("", b) for c in WORN) for b in branches)


def parts(items: list) -> list:
    """The QDS sheet, narrowed to the components the panel wears."""
    out = []
    for item in items:
        if item[0] == "rule":
            sels = [s for s in split_selectors(item[1]) if is_part(s)]
            if sels:
                out.append(("rule", ", ".join(sels), item[2]))
        elif item[0] == "at":
            inner = parts(item[2])
            if inner:
                out.append(("at", item[1], inner))
    return out


# ── the rules that SPEND a dial but carry none ──────────────────────────────
#
# WHY (0.9.0). A rule goes to the plugin when its root asks for a non-resting
# dial value. A rule that only SPENDS what a dial set carries no dial at all, so
# it stays with the theme, and on a guest the plugin sets the value and nothing
# on the page reads it. Two lines held the entire picture family: every one of
# the nine looks sets --picture-filter and the one rule that turns it into a
# filter is `body img`. Their selectors are already core-only, so there is
# nothing to redesign; they simply never travelled. Named one by one rather than
# matched by a pattern, and the build stops if a name is not found, because a
# rename in style.css must fail loudly and not drop the picture looks in silence.
LIFTED = (
    "body img:not(.emoji, .wp-smiley):not(:where(.reading-panel *, #wpadminbar *))",
    "body::before, body::after",
    "body::before",
    "body::after",
    ".architrave-duotone",
    ".architrave-duotone .duo-dark",
    ".architrave-duotone .duo-light",
)


def lifted(items: list, wanted: tuple = LIFTED) -> tuple[list, list[str]]:
    """(the rules, the names that were not found). Whitespace is collapsed for
    the comparison, so a reflow in style.css does not count as a rename."""
    flat = {re.sub(r"\s+", " ", w.strip()) for w in wanted}
    seen: set[str] = set()
    out = []

    def walk(items: list) -> list:
        kept = []
        for item in items:
            if item[0] == "rule":
                key = re.sub(r"\s+", " ", item[1].strip())
                if key in flat:
                    seen.add(key)
                    kept.append(item)
            elif item[0] == "at":
                inner = walk(item[2])
                if inner:
                    kept.append(("at", item[1], inner))
        return kept

    out = walk(items)
    return out, sorted(flat - seen)



# ── the guard a guest's panel stands behind ─────────────────────────────────
#
# WHY (0.11.47, Manuel on Ollie, 2026-09-24: white boxes behind the sliders and
# a white search field on the dark panel, "doesn't look like it belongs to the
# panel"). A theme styles its own `input` and `button`, and its rules match the
# panel's too. Where the panel names a property itself it wins, but wherever it
# leaves one to the browser's default a theme's rule has nothing to beat and
# lands: Ollie gave every slider a white ground, a border, padding and a shadow
# (`input:not([type="submit"]):not([type="radio"])`, one class-weight more than
# `.reading-range`); Kadence and Astra gave every panel button their padding,
# shadow and transition. Measured by switching every sheet but the panel's off
# and on and diffing each panel element's computed style: Ollie 115 values,
# Kadence 1021, Astra 1062, the two Twenty themes none.
#
# The guard is two things, and a guest gets both:
# 1. Every rule that draws the panel reaches a guest one ID stronger (GUARD is
#    added to its first compound), so it outranks any theme rule without an ID.
#    Lifting ALL of them keeps their order among themselves exactly as it is.
# 2. Under them, the panel's own buttons and fields go back to the browser's
#    defaults (`all: revert`), at the ID's weight but no class, so any rule of
#    the panel's still wins and no rule of the theme's does. The browser's
#    defaults are the ground the panel was drawn on: Architrave sets nothing
#    on a bare `button` or `input`.
GUARD = ":not(#live-design-panel-guard)"
PANEL_NAMES = (".reading-", ".quire-")
# The door is left out, on purpose: its look is written in panel.php's own
# <style> block, beside these rules and at their weights, so a door rule lifted
# here would outrank the block that dresses it in its neighbours' clothes.
DOOR = ".architrave-panel-opener"
ROOT_HEAD = re.compile(r"^(?:html|:root)(?=[\[:.#\s>+~]|$)")


def guard_selector(branch: str) -> str:
    """One branch, one ID heavier. `:root`/`html` must stay the root, so the
    ID goes onto that compound; any other branch is prefixed as a descendant of
    something that is not the guard, which every element but `html` is."""
    b = branch.strip()
    m = ROOT_HEAD.match(b)
    if m:
        return b[: m.end()] + GUARD + b[m.end():]
    return GUARD + " " + b


def names_panel(branch: str) -> bool:
    """Does every alternative of this branch require a class only the panel prints."""
    return DOOR not in branch and all(any(n in NOT_CALL.sub("", x) for n in PANEL_NAMES) for x in expand(branch))


def guarded(items: list, only_panel: bool = False) -> list:
    """The same rules, each branch that draws the panel one ID heavier. With
    only_panel, a branch that could also draw the page is left as it is."""
    out = []
    for item in items:
        if item[0] == "rule":
            sels = []
            for b in split_selectors(item[1]):
                sels.append(guard_selector(b) if (names_panel(b) if only_panel else DOOR not in b) else b.strip())
            out.append(("rule", ", ".join(sels), item[2]))
        elif item[0] == "at":
            out.append(("at", item[1], guarded(item[2], only_panel)))
        else:
            out.append(item)
    return out


GUARD_FLOOR = """:where(.reading-panel) :is(button, input, select, textarea)""" + GUARD + """ {
\tall: revert;
}
"""

def divide(items: list) -> tuple[list, list]:
    theme, plugin = [], []
    for item in items:
        if item[0] == "rule":
            sels = split_selectors(item[1])
            mine = [s for s in sels if not is_plugins(s)]
            theirs = [s for s in sels if is_plugins(s)]
            if mine:
                theme.append(("rule", ", ".join(mine), item[2]))
            if theirs:
                plugin.append(("rule", ", ".join(theirs), item[2]))
        elif item[0] == "at":
            t, p = divide(item[2])
            if t:
                theme.append(("at", item[1], t))
            if p:
                plugin.append(("at", item[1], p))
        else:
            theme.append(item)
    return theme, plugin


# THE SITE'S OWN RULES (2026-09-28). The parts only elmastudio.de uses leave the
# theme for the private plugin Elmastudio Site (tools/site_parts.py), and so do
# the rules that draw them: a selector branch goes with the site when it names
# one of these classes (a class that begins with the word) or attributes. The
# theme's zip leaves them out (tools/build-dist.py); the plugin carries them as
# assets/css/site.css (tools/build-site.py), loaded right after style.css.
SITE_CLASSES = (
    "rail-newsletter", "rail-promo", "nl-confetti", "about-numbers", "about-people", "page-faces",
    "post-origin-note", "rail-more-language", "rail-language", "mobile-panel-language",
    "readers-note", "related-list", "related-row", "release-archive", "release-checked",
    "support-box", "mailpoet", "falling-light", "site-search",
)
SITE_ATTRS = ("data-newsletter-done", "data-ground")
SITE_NAME = re.compile(r"\.(" + "|".join(re.escape(c) for c in SITE_CLASSES) + r")(?![a-z0-9_])|\.(" + "|".join(re.escape(c) for c in SITE_CLASSES) + r")[-_]|\[\s*(" + "|".join(SITE_ATTRS) + r")\b")


def is_site(selector: str) -> bool:
    """Every branch names one of the site's classes, outside a :not()."""
    return all(SITE_NAME.search(NOT_CALL.sub("", b)) for b in expand(selector))


def divide_site(items: list) -> tuple[list, list]:
    theme, site = [], []
    for item in items:
        if item[0] == "rule":
            sels = split_selectors(item[1])
            mine = [s for s in sels if not is_site(s)]
            theirs = [s for s in sels if is_site(s)]
            if mine:
                theme.append(("rule", ", ".join(mine), item[2]))
            if theirs:
                site.append(("rule", ", ".join(theirs), item[2]))
        elif item[0] == "at":
            t, p = divide_site(item[2])
            if t:
                theme.append(("at", item[1], t))
            if p:
                site.append(("at", item[1], p))
        else:
            theme.append(item)
    return theme, site


# ARCHITRAVE EXTRAS' RULES (2026-09-28): the player for a post's spoken version
# and the ".md" half of the share button left the theme for the public plugin
# Architrave Extras (extras/). Same rule as the site's: a branch that names one
# of these classes goes with the plugin's assets/css/extras.css
# (tools/build-extras.py), and the theme's zip leaves it out.
EXTRAS_CLASSES = ("listen", "post-share-more", "post-share-menu")
EXTRAS_NAME = re.compile(r"\.(" + "|".join(re.escape(c) for c in EXTRAS_CLASSES) + r")(?![a-z0-9_])|\.(" + "|".join(re.escape(c) for c in EXTRAS_CLASSES) + r")[-_]")


def is_extras(selector: str) -> bool:
    return all(EXTRAS_NAME.search(NOT_CALL.sub("", b)) for b in expand(selector))


def divide_by(items: list, test) -> tuple[list, list]:
    keep, out = [], []
    for item in items:
        if item[0] == "rule":
            sels = split_selectors(item[1])
            mine = [s for s in sels if not test(s)]
            theirs = [s for s in sels if test(s)]
            if mine:
                keep.append(("rule", ", ".join(mine), item[2]))
            if theirs:
                out.append(("rule", ", ".join(theirs), item[2]))
        elif item[0] == "at":
            k, o = divide_by(item[2], test)
            if k:
                keep.append(("at", item[1], k))
            if o:
                out.append(("at", item[1], o))
        else:
            keep.append(item)
    return keep, out


def theme_only(css: str) -> tuple[str, str, str]:
    """(the theme's zip half, the site's rules, Architrave Extras' rules)."""
    theme, _plugin = divide(parse(strip_comments(css)))
    theme, site = divide_site(theme)
    theme, extras = divide_by(theme, is_extras)
    return write(theme) + "\n", write(site) + "\n", write(extras) + "\n"


def split_site(css: str) -> tuple[str, str]:
    """(the theme's half without the site's rules, the site's rules): the theme's
    half of style.css, cut once more."""
    theme, _plugin = divide(parse(strip_comments(css)))
    kept, site = divide_site(theme)
    return write(kept) + "\n", write(site) + "\n"


def write(items: list, depth: int = 0) -> str:
    pad = "\t" * depth
    out = []
    for item in items:
        if item[0] == "rule":
            body = "\n".join(pad + "\t" + line.strip() for line in item[2].split("\n") if line.strip())
            out.append(f"{pad}{item[1]} {{\n{body}\n{pad}}}")
        elif item[0] == "at":
            out.append(f"{pad}{item[1]} {{\n{write(item[2], depth + 1)}\n{pad}}}")
        else:
            out.append(pad + item[1])
    return "\n".join(out)


def count(items: list) -> int:
    return sum(count(i[2]) if i[0] == "at" else (1 if i[0] == "rule" else 0) for i in items)


def split(css: str) -> tuple[str, str]:
    """(the theme's rules, the plugin's rules), both without comments. The caller keeps the theme's header."""
    theme, plugin = divide(parse(strip_comments(css)))
    return write(theme) + "\n", write(plugin) + "\n"


def main() -> int:
    css = (THEME / "style.css").read_text()
    items = parse(strip_comments(css))
    theme, plugin = divide(items)
    if "--moved" in sys.argv:
        print(write(plugin))
        return 0
    if "--shell" in sys.argv:
        print(write(shell(theme)))
        return 0
    print(f"rules in style.css: {count(items)}")
    print(f"  the theme's:  {count(theme)}  ({len(write(theme)) // 1024} KB)")
    print(f"  the plugin's: {count(plugin)}  ({len(write(plugin)) // 1024} KB)")
    kept, site = divide_site(theme)
    print(f"  of the theme's, the site's own: {count(site)}  ({len(write(site)) // 1024} KB)")
    kept, extras = divide_by(kept, is_extras)
    print(f"  of the theme's, Architrave Extras': {count(extras)}  ({len(write(extras)) // 1024} KB)")
    if "--site" in sys.argv:
        print(write(site))
    if "--extras" in sys.argv:
        print(write(extras))
    return 0


if __name__ == "__main__":
    sys.exit(main())
