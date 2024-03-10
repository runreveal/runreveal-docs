---
description: Quickly ingest your GitHub Web Audit logs through polling
---

# Log Polling

GitHub Audit logs allow you to view web and git audit events for your organization. RunReveal will poll your GitHub account every 60 seconds and ingest new web audit events. Polling audit logs is available to GitHub Organization and Enterprise level accounts.&#x20;

{% hint style="warning" %}
Due to limitations in GitHub's API, there may be times where GitHub limits the number of requests that can be made on your behalf. In those cases your logs may fall behind real time data.
{% endhint %}

## Setup

Give your GitHub source a descriptive name to help find it later. The two fields we require from your GitHub account, your organization's name and an API token.

### Organization Name

Your organization name is the name that you gave GitHub when creating your account. In RunReveal's case our GitHub org can be found at [https://github.com/runreveal/](https://github.com/runreveal/), the organization we would enter for our source would be `runreveal`.&#x20;

### API Token

To generate an API token navigate to the `Personal access tokens (classic)` page in your GitHub account and click on Generate new token, or follow this link [https://github.com/settings/tokens/new](https://github.com/settings/tokens/new)

{% hint style="info" %}
Make sure you are under your personal account settings and are logged in with a user that has access to your organizations audit logs. When creating a new token make sure its a classic type. The required permissions are not available for fine grained tokens yet.
{% endhint %}

Give the token a description and select an expiration for it. When selecting the scopes the only required scope is the `read:audit_log`.

## Verify Its working

Once added the source logs should begin flowing within a minute.

You can validate we are receiving your logs by running the following SQL query.

```sql
SELECT * FROM runreveal_logs WHERE sourceType = 'github' LIMIT 1
```
