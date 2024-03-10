# Notifications

Notifications are sent data from RunReveal when a Trigger function returns True, or a scheduled query returns results.

The same data that is sent to Notifications is also available via SQL. Results from trigger functions that return true are stored in the `event_trigger_history` table. Results from scheduled query runs are stored in the `scheduled_query_runs` table.&#x20;

Here are direct links to the notification methods we support:

{% embed url="https://docs.runreveal.com/getting-started/integrations/notifications/webhooks" %}

{% embed url="https://docs.runreveal.com/getting-started/integrations/notifications/email" %}

{% embed url="https://docs.runreveal.com/getting-started/integrations/notifications/slack" %}
