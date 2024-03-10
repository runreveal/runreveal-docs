# Webhooks

RunReveal will send HTTP POST request to a URL of your choosing.&#x20;

```
runreveal notifications webhook add --name "Tines" https://yoururl
{
     "ID": "2O1lzQKpO2bZHeM8ghlfsRZn9jC",
     "WorkspaceID": "2KUOdhvRReF5RZfQX8ILneT4fSd",
     "Name": "SIRT Team",
     "DestType": "email"
 }
```

## Schema

The following shows the schema of the data that is sent in the webhook.

<table><thead><tr><th width="203.33333333333331">Property</th><th width="164">Data Type</th><th>Description</th></tr></thead><tbody><tr><td>title</td><td>string</td><td>The template title that was rendered.</td></tr><tr><td>message</td><td>string</td><td>The template body that was rendered</td></tr><tr><td>query</td><td>scheduled query response</td><td>The field will be null if the notification was created from a trigger. Otherwise it will contain the data of the scheduled query.</td></tr><tr><td>trigger</td><td>trigger data</td><td>This field will be null if the notification was created from a scheduled query. Otherwise it will contain data about the trigger that fired.</td></tr><tr><td>rawEvent</td><td>Raw Event Data</td><td>The raw event that was triggered on. If the notification was from a scheduled query this field will be null.</td></tr></tbody></table>