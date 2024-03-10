# 🍴 Python Utility Module

When writing your triggers in python, RunReveal provides you with some utility functions via the `runreveal` module that any trigger can import.

Here's an example of a trigger that will never fire, but illustrates importing the `runreveal` utility module, along with a the submodule deep get.

```
from runreveal import deep_get

def trigger(event):
    return false
```

**Note:**  If there is functionality that you would find helpful in this module then please send an email to _contact@runreveal.com_

## Submodules

### deep\_get

This submodule within the `runreveal` module makes traversing event objects very simple. It receives a mapping that is required, and an optional list of keys that provides a path to traverse the object

```
def deep_get(obj: Mapping, *keys, default=None):
```

An example usage of deep\_get is available here, to understand how it works. Given this python mapping:

```
m = {
    "a": {
        "b": {
            "c": 7
        },
        "c": 42
    }
}
```

Searching for:

```
>>> deep_get(m, "a", "c")
42
>>> deep_get(m, "a", "b", "c")
7
```

