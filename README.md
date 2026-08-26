# Full Journey Paid UTM Tracker

A Google Tag Manager **custom tag template** that tracks a visitor's full
paid journey in first-party cookies — the first and most recent paid landing
URLs, the latest click ID per ad platform, and first/most-recent overall and
nonpaid channels — with strict separation between paid and nonpaid traffic.
Nonpaid visits (organic, direct, referral, social, email) can **never**
overwrite paid attribution.

## What it does

On every page load the tag decides whether the view is a new **site entry**
or internal navigation (30-minute rolling session, configurable). Each entry
is classified with this precedence — first match wins:

```
paid > email > organic_search > organic_social > referral > direct
```

It then maintains three independent attribution layers:

| Layer | Storage | Behavior |
|---|---|---|
| **Paid** | `first_paid_utm`, `recent_paid_utm` (full landing URLs) + latest click ID per platform | First is set once, never overwritten. Recent is replaced on every paid entry. A Meta click never erases a Google click — each platform's latest ID is kept side by side. |
| **Overall channel** | `ftc` / `rtc` in the JSON state cookie | First entry channel (set once) + most recent entry channel. |
| **Nonpaid** | `fnc` / `fnr` / `rnc` / `rnr` in the JSON state cookie | First + recent nonpaid channel and referrer domain. A direct touch deletes the recent referrer domain rather than leaving a stale pairing. |

Paid is detected by click ID (`gclid`, `gbraid`, `wbraid`, `fbclid`,
`msclkid`, `ttclid`, `li_fat_id`), by `gad_source` (detection only), or by
`utm_medium` (`cpc`, `paid`). **`utm_source` alone never means paid** — 
`utm_source=google&utm_medium=organic` is organic, not paid.

## Install

1. In GTM: **Templates → Tag Templates → New → ⋮ → Import** and select
   `template.tpl`.
2. Add a tag using the template, trigger **Initialization – All Pages**.
3. Defaults work as-is; every field falls back to its preset when blank.

## Configuration

| Field | Default | Notes |
|---|---|---|
| First-paid cookie name | `first_paid_utm` | Full URL of first paid landing, set once |
| Recent-paid cookie name | `recent_paid_utm` | Full URL of latest paid landing |
| Attribution state cookie name | `rocs_attr` | JSON: channels, referrer domains, latest click IDs |
| Session cookie name | `rocs_sess` | Rolling session marker |
| Cookie domain | `auto` | e.g. `.example.com`; `auto` picks the broadest valid domain |
| Cookie lifetime (days) | `730` | Safari ITP caps JS cookies at ~7 days regardless |
| Session timeout (minutes) | `30` | Matches GA4's session model |
| **Ignore domains** | *(empty)* | Comma-separated referrer domains treated as internal — no attribution update. For payment gateways, SSO, sister sites. The page's own domain is always ignored automatically. |
| Click ID parameters | `gclid,gbraid,wbraid,fbclid,msclkid,ttclid,li_fat_id` | Paid signals stored as latest-per-type |
| Detection-only paid parameters | `gad_source` | Paid signals not stored as IDs |
| Paid / email mediums, email sources | see template | Case-insensitive exact matches, never substrings |
| Search / social referrer domains | see template | Google country domains recognized automatically |
| Remove duplicate host-only cookies | on | Expires stray host-only copies of the paid cookies so reads are deterministic |
| Debug logging | off | Preview-mode console logging |

## Companion (Custom HTML)

`companion/` contains the original Custom HTML pair this template was ported
from, including the **Enroll Now UTM Injector**, which reads these cookies and
decorates outbound application links with the full attribution payload
(`utm_*`, `recent_utm_*`, click IDs, channels, Meta `fbc`/`fbp`, GA4 IDs).
The injector remains Custom HTML for now — it needs DOM access (link
decoration) that sandboxed templates don't provide.

## Notes

- All cookies are written with `path=/; secure; SameSite=Lax` and are
  URL-encoded. Malformed cookies are treated as absent and rebuilt — the tag
  never throws.
- "Direct" strictly means *no detectable referrer or source*: browsers,
  apps, privacy settings, redirects, and referrer policies can all suppress
  referrer data. The tag does not guess.
- Hostname checks are exact-or-subdomain matches, never substrings
  (`fake-example.com` will not match `example.com`;
  `google.evil.com` is not organic search).

## License

[Apache 2.0](LICENSE)
