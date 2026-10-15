# Userscripts

A small collection of AdGuard utilities, experiments, and filter-development/debugging tools, primarily for developers, filter authors, and support teams. Some utilities are also user-facing.

## Utilities

| Utility | Purpose |
| --- | --- |
| [AdGuard Debugger](adguardDebugger/adguard.debugger.user.js) | Inspect elements likely hidden by AdGuard. |
| [ExtendedCss Debugger](extendedCssDebugger/extended-css.debugger.user.js) | Expose ExtendedCss for debugging selectors. |
| [Disable Autoplay](disableAutoplay/disable-autoplay.user.js) | Prevent HTML5 video autoplay. |
| [Autofill Phishing Blocker](disableAutofillPhishing/disable-autofill-phishing.user.js) | Disable autofill for off-screen input fields. |
| [Userstyle Converter](userstyleConverter/) | Converter tool, not a standalone userscript. |

These utilities are optional; hosting them here does not automatically bundle them with AdGuard products. See the [userscript support and installation documentation](https://adguard.com/kb/general/extensions/). Compatibility depends on the script, product, and browser; support is not guaranteed for every product.

## Contribution scope

Fixes and improvements to existing utilities and AdGuard-related debugging/development tooling are welcome. Please discuss new additions first.

This repository is not a general-purpose userscript hosting or catalog service. Unrelated website-specific enhancements should be maintained in the author's own repository or a userscript catalog.
