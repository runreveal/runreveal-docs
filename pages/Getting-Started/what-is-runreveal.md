---
description: Welcome to RunReveal's documentation website
---

# What is RunReveal

RunReveal is a security data platform designed to make detection simple. Our goal is to take any company's security data and logs, instantly turn them into actionable insights, and provide the tools to build your own detailed detection and alerting rules.

The main concepts that our customers need to be familiar with.

### Sources

Places we read data from. There are two types of sources, **generic sources** and **native sources.**

* _Native sources_ are data types and integrations we support natively within our platform.
* _Generic sources_ are just blobs of arbitrary data that you parse within RunReveal, that a native source does not exist for. Generic sources exist so you can still make use of data that our platform does not yet natively support.&#x20;

### Detections

Our detections are queries that search your logs for specific conditions. Queries run on a regular interval and the results returned &#x20;

### Notifications

RunReveal integrations that inform you when something happens based on the result of a trigger function. If a trigger returns true, all of the notification channels directly attached to that trigger are forwarded the event.

Today we support a handful of notification types:

* Slack
* Email
* Webhook&#x20;
* SOARs (Tines / Torq / Etc)
* Discord
* JIRA

### Search

All of the data that RunReveal collects is searchable. Within the UI you can search with Clickhouse SQL, a helpful LLM, and our full query builder. All of the data is usable to build graphs and visualizations.

<figure><img src="../.gitbook/assets/image (13).png" alt=""><figcaption></figcaption></figure>

The SQL syntax used to query RunReveal's logs is Clickhouse's dialect of SQL. A reference of this SQL is available here: [https://clickhouse.com/docs/en/sql-reference/syntax](https://clickhouse.com/docs/en/sql-reference/syntax).

Within our CLI, there are a few methods of querying your logs.

* REPL **--** quickly and iteratively query your logs in a CLI loop
* Named Queries -- You can create a complex query, save it, and run it by name.



