# 🏛 Event Formats

To properly write triggers you need to know the format of the log sources that your functions receive. Each source has a different format by nature of each vendor creating their own audit logging system. We are saving those events in the structure they send them and will provide have a specific and predictable format so that you can write triggers that run in a predictable way.

Additionally, each log format is normalized in a way that makes writing general triggers possible that can apply across multiple log sources.

<figure><img src="../../../.gitbook/assets/image (5) (1).png" alt=""><figcaption><p>The raw log format, and a normalized format are both forwarded to your triggers</p></figcaption></figure>

When writing a trigger, the event your trigger function receives will contain both the normalized format and the raw log format.

## Accessing the normalized format

Use the `get` function and pass it the argument `normalized` to return the normalized event format.

```
def trigger(event):
    normalized = event.get("normalized")
```

## Accessing the raw event

Retrieve the raw event, in the [formats described in these docs](https://docs.runreveal.com/getting-started/triggers/event-formats/raw-log-formats), by passing `event`

```
def trigger(event):
    e = event.get("log")
```

## Additional event objects

The event dict will also contain a few helpful pieces of metadata.

* `event.SourceName` - The name of your source
* `event.SourceID` - The unique identifier of your source
* `event.SourceType` - When type of source this logs came from, example: cloudtrail
* `event.WorkspaceID` - The workspace ID associated with the source.



```
```
