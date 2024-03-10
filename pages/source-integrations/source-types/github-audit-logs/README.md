---
description: Ingest web/git audit logs from Github
---

# GitHub Audit Logs

GitHub audit logs provide you with the ability to access web and git logs for your organization or enterprise. RunReveal offers two methods for ingesting these logs.

### Log Polling

Log Polling involves making an API call to GitHub every 60 seconds in order to retrieve any new logs that have been generated. This method is suitable for GitHub Organization-level accounts, for scenarios where you only need logs for a single organization within your enterprise, or when access to an Amazon S3 bucket is not available.

#### Limitations

Log Polling requires the generation of a GitHub API key, which is utilized to download the logs. Both the API key and the user who generated it must remain active, and the user must have access to view your organization's audit logs.

Log Polling exclusively downloads the web audit logs for your organization. Git logs are not incorporated into RunReveal using this approach.

Log polling is also limited by GitHub's rate limiting, which means at most 1200 events can be ingested per minute. If your organization generates a higher volume in a single minute they will be ingested in the subsequent minute.

### Log Streaming

Log Streaming offers the capability for GitHub to transmit your logs to a designated cloud provider for ingestion and storage. Currently, RunReveal exclusively supports integration with Amazon S3. This method is preferred if you possess a GitHub Enterprise-level account and require near real-time ingestion of logs, and if you want ingestion to be separate from a specific GitHub user. Log streaming ingests all events that GitHub generates. Notably, RunReveal offers a backfill option while configuring your source if you already possess an S3 bucket containing existing GitHub logs.

