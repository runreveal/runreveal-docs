# 📐 Trigger Basics

Triggers are functions that provide you with the ability to make decisions about what to do with specific log events. Triggers must return either `True` or `False`. Triggers are still under under construction, if you run into issues feel free to [join our discord to ask](https://discord.gg/n3y6WwPCg7).

#### Valid

```
def trigger(event):
    return True
```

#### Invalid

```
def trigger(event):
    return "Hello world!"
```

## How do we handle a True response?

When your trigger returns true, we take the following steps.

1. Send a notification, if any are configured with your workspace or trigger, to all configured destinations
2. Store that event as a triggered event so you can later query what events matched your trigger function
3. Store the event so that it is easily searchable later.

## How do we handle a False response?

When your trigger returns false, we still store the event and no data will be lost by not returning true.

We take the following steps after your trigger function returns false.

* Store the event so that it is easily searchable later.

