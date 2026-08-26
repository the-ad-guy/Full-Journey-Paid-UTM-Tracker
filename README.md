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
| **Paid** | `first_utm`, `recent_utm` (full landing URLs) + latest click ID per platform | First is set once, never overwritten. Recent is replaced on every paid entry. A Meta click never erases a Google click — each platform's latest ID is kept side by side. |
| **Overall channel** | `ftc` / `rtc` in the JSON state cookie | First entry channel (set once) + most recent entry channel. |
| **Nonpaid** | `fnc` / `fnr` / `rnc` / `rnr` in the JSON state cookie | First + recent nonpaid channel and referrer domain. A direct touch deletes the recent referrer domain rather than leaving a stale pairing. |
| **Journey** | `psp` / `ptc` / `fpd` in the JSON state cookie | The shape of the paid journey — platform path, touch count, first-touch date. Paid entries only. |

Paid is detected by click ID (`gclid`, `gbraid`, `wbraid`, `fbclid`,
`msclkid`, `ttclid`, `li_fat_id`), by `gad_source` (detection only), or by
`utm_medium` (`cpc`, `paid`). **`utm_source` alone never means paid** — 
`utm_source=google&utm_medium=organic` is organic, not paid.

## Paid journey summary

Rather than numbering every touch (`utm_source2`, `utm_source3`, …), which
blows past the 4 KB cookie ceiling and produces columns that are near
impossible to report on, the tracker records the **shape** of the journey in
three compact values:

| Parameter | Example | Meaning |
|---|---|---|
| `utm_journey` | `google.facebook.google` | Platform path, consecutive repeats collapsed |
| `paid_touch_count` | `11` | Raw count of qualifying paid entries |
| `first_paid_date` | `2026-06-18` | UTC date of the first paid touch, set once |

Each hop is the visit's `utm_source`; when a paid URL carries no source, the
platform is inferred from its click ID (`fbclid` → `facebook`, `msclkid` →
`bing`, and so on). That inferred value is used **only** for the path — it is
never written back into `utm_source`, because the tracker does not fabricate
UTM values.

Hops are sanitized to `[a-z0-9_-]` and capped at 20 characters, so a source
containing the separator cannot corrupt the path (`Foo.Bar Baz` →
`foo-bar-baz`). The path caps at 12 hops, dropping the *second*-oldest on
overflow so the first touch always survives, while `paid_touch_count` keeps
counting past the cap.

`.` is the separator because only `*`, `-`, `.` and `_` survive
`URLSearchParams` unescaped; `-` and `_` are valid inside hops, and `*` is a
wildcard in both Salesforce SOSL and spreadsheet criteria.

`first_paid_date` is stored internally as epoch milliseconds — the GTM
sandbox has no `Date` object, so the injector formats it. It is never
backfilled: visitors who predate installation keep it absent rather than
being stamped with a misleading recent date.

## Install

1. In GTM: **Templates → Tag Templates → New → ⋮ → Import** and select
   `template.tpl`.
2. Add a tag using the template, trigger **Initialization – All Pages**.
3. Defaults work as-is; every field falls back to its preset when blank.

## Configuration

| Field | Default | Notes |
|---|---|---|
| First-paid cookie name | `first_utm` | Full URL of first paid landing, set once |
| Recent-paid cookie name | `recent_utm` | Full URL of latest paid landing |
| Attribution state cookie name | `attr_state` | JSON: channels, referrer domains, latest click IDs |
| Session cookie name | `attr_sess` | Rolling session marker |
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

## Companion tags (Custom HTML)

`companion/` holds a Custom HTML pair you can use instead of, or alongside,
the template. Both are generic — configure them at the top of the file.

**`1-attribution-cookie.html`** — the Custom HTML equivalent of this
template (trigger: *Initialization – All Pages*). Use the template if you
can; use this if you need to modify the logic or can't install templates.
It requires no configuration: the cookie domain and internal-navigation
detection are derived from the current hostname by probing for the broadest
domain that accepts a cookie, which correctly handles public suffixes like
`.co.uk`.

**`2-link-injector.html`** — decorates outbound links with the full
attribution payload (`utm_*`, `recent_utm_*`, click IDs, channels, Meta
`fbc`/`fbp`, GA4 client/session IDs) at *DOM Ready*, on interaction, and
once more in the click capture phase, without ever delaying navigation.
Set `DESTINATION_HOSTS` to the hostname(s) you want decorated — it stays
inert until you do.

Use the injector when a link's destination is a system you can't put GTM
on — a CRM application, a third-party booking or checkout flow, a partner
portal — so everything that system needs has to ride on the URL. It stays
Custom HTML because it needs DOM access that sandboxed templates don't
provide. It reads the cookies written by either Tag 1 or the template, so
cookie names must match if you change them.

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
