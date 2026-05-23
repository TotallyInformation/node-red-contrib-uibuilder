# Privacy Policy — uibuilder Telemetry

**Package:** `node-red-contrib-uibuilder` — <https://github.com/TotallyInformation/node-red-contrib-uibuilder>

**Maintainer:** Julian Knight (TotallyInformation) — <https://github.com/TotallyInformation>

**Last updated:** 2026-05-21, UIBUILDER v7.7.0

---

## 1. Overview

UIBUILDER includes an **optional, opt-out** telemetry feature. When enabled, it transmits a small, anonymised report to a data-collection endpoint operated by the package maintainer. This document explains exactly what is collected, why, how it is stored, and what rights you have.

---

## 2. Data Controller

The data controller for this telemetry service is:

> Julian Knight (TotallyInformation)  
> Contact: <https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues>

---

## 3. What Data Is Collected

Each telemetry report contains the following fields. **None of these fields can identify a natural person.**

| Field           | Description | Example |
|-----------------|-------------|---------|
| `uuid`          | A randomly-generated identifier created locally by your Node-RED installation. It is not derived from any hardware identifier, user account, or network address. It can safely be deleted or reset without affecting your Node-RED instance. Though if telemetry is enabled, it will be automatically re-created with a new id. | `a1b2c3d4-…` |
| `uib_version`   | The installed version of uibuilder. | `7.7.0` |
| `nr_version`    | The installed version of Node-RED. | `4.0.3` |
| `node_version`  | The Node.js runtime version. | `20.11.0` |
| `os_platform`   | The operating-system platform identifier. | `linux`, `win32`, `darwin` |
| `uib_count`     | The number of uibuilder nodes deployed in this instance. | `3` |
| `markweb_count` | The number of Markweb nodes deployed in this instance. | `1` |
| `browsers`      | **Pre-aggregated** counts of browser families and versions that have connected to uibuilder endpoints during the reporting period. Individual user-agent strings are **never** transmitted or stored — only the aggregated totals. | `[{ "family": "Chrome", "version": "124.0.0", "count": 8 }]` |

This data is locally aggregated and transmitted **at most once per calendar month** per Node-RED instance. The server enforces a rate limit to prevent multiple reports from the same instance within the rate-limit window. Once transmitted, the local data is reset.

### What is NOT collected

The following data is **NEVER** collected, transmitted, or stored:

- IP addresses (neither the Node-RED server's address nor any browser's address)
- Full browser user-agent strings
- Hostnames, domain names, or network topology
- File paths, flow names, or flow content
- Node-RED credentials, environment variables, or secrets
- Names, email addresses, or any other user-identifiable information
- The content of any messages passing through your flows

---

## 4. Legal Basis for Processing

The data listed in Section 3 does not constitute personal data as defined by the UK/EU GDPR because it cannot, either alone or in combination with other data held by the maintainer, be used to identify a natural person.

As a precautionary measure, the maintainer also relies on **legitimate interests** (Article 6(1)(f) UK/EU GDPR) as a secondary legal basis: the legitimate interest is improving an open-source package by understanding which versions, platforms, and browsers are in active use, weighed against the minimal privacy impact of the strictly anonymised data described above.

---

## 5. How Often Data Is Sent

When telemetry is enabled, a report is transmitted **at most once per calendar month** per Node-RED instance. The server enforces a rate limit and will reject any report from the same instance UUID submitted within the rate-limit window, so accidental double-reporting is automatically prevented.

---

## 6. How Data Is Processed and Stored

Reports are received by a **Cloudflare Worker** deployed on Cloudflare's global edge network and written to a **Cloudflare D1** database (a managed SQLite service).

- **Infrastructure provider:** Cloudflare, Inc. (US-based, covered by the EU–US Data Privacy Framework)
- **Data location:** Cloudflare's global edge — Cloudflare may replicate D1 data across regions for availability
- **Access control:** The database is accessible only to the package maintainer via a private authentication token
- **Transport security:** All data is transmitted over HTTPS/TLS

Further details of Cloudflare's own privacy and data-processing practices are available at <https://www.cloudflare.com/privacypolicy/>.

---

## 7. Retention

Telemetry records are retained for a rolling **12-month** period. Records older than 12 months are deleted.

---

## 8. Purpose and Use of Data

Collected data is used solely for the following purpose:

> **To understand how uibuilder is used in practice, in order to guide development priorities, identify compatibility requirements, and improve the package for its users.**

The data is never sold, licensed, shared with third parties, or used for any commercial or advertising purpose.

---

## 9. Your Rights

Even though the data collected is not personal data, the maintainer respects the spirit of data-subject rights under the UK/EU GDPR:

- **Right to opt out at any time:** Disable telemetry in the uibuilder node configuration panel. Once disabled, no further data will be sent. The instance UUID is deleted from your Node-RED settings and will be regenerated if you later re-enable telemetry.
- **Right to erasure:** You may request deletion of all records associated with your instance UUID by opening a GitHub issue at <https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues> and providing the UUID. Records will be deleted within 30 days.
- **Questions or concerns:** Contact the maintainer via the GitHub issue tracker linked above.

---

## 10. Changes to This Policy

If the scope of data collection changes materially, this document will be updated and the change will be announced in the package changelog. The `Last updated` date at the top of this document will always reflect the current version and the version of UIBUILDER it is associated with.

## 11. Out-of-scope data

UIBUILDER for Node-RED maintains some data (cookies and local storage) between the Node-RED server and connected client browsers. This data is never transmitted or retained outside of the local Node-RED instance. It is used to help manage the user experience and session management. The owner/operator of the Node-RED instance is responsible for ensuring that this data and any other data is handled in accordance with their local privacy obligations.
