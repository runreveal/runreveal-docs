# 🐍 Python Triggers

Before we start, you'll need to be setup with the CLI, authenticated to runreveal and have a source connected to your workspace.

Now, we can write detections using python and upload them in minutes.  Python detections are written using Python 3.  We do not plan to support Python 2.7 at this time.

To write a detection, simply create a new python file and write a function inside which has the following signature. The function must be called `trigger` and must accept one argument which is the event.  The file can be any valid python module name but cannot have the same name as another python module you've uploaded before.

```python
def trigger(event):
    return not event.get("log").get("readOnly")
```

The event passed in can be one of any of the source log types, so you may need to be able to handle objects which don't have the properties you expect.

{% hint style="info" %}
We currently don't tie detections to an individual source, but plan to do so.
{% endhint %}

After writing your detection, you can upload it using the following command:

```
runreveal detect triggers create --file root_action.py --name 'root performed action'
```

That's it!  If you've connected notification channels for this source already, then the next time this trigger fires you should receive a notification.

Relax knowing that you're better protected than you were before, and it only took a few minutes! 🧘🏻
