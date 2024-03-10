# 🔬 Testing your code

Triggers can be tested as you develop them by using the `runreveal trigger test` command.

This command requires the argument `--file` or `-f` which will specify the code that you want to test, along with the source code is the data you'd like transform.&#x20;

When running the test command, the result of a trigger is a boolean `true` or `false` indicating whether or not the trigger would invoke any notifications or not, along with an error if one was returned from the python wasm runtime environment. This is a simple example that always will return true.

```
$ runreveal triggers test --file good-trigger.py --data data.json
{
     "Triggered": true,
     "Error": ""
 }
 
$ cat good-trigger.py 
def trigger(event):
    return True

```

## Printing Errors

If a python error exists while running your transform, the results of that error can be pretty printed using the `jq` command. Piping the output of the command to `jq -r .Error` will pretty print the results of Error including all python formatting.

In this case, `false` should be capitalized as `False` which is the way that python expects booleans to be represented.

```
$ ./dist/runreveal/runreveal transform test --file bad-transform.py --data data.json | jq -r .Error
Traceback (most recent call last):
  File "/transform.py", line 75, in main
    resp = v.transform(evt)
           ^^^^^^^^^^^^^^^^
  File "/test-transform.py", line 2, in transform
    return false
           ^^^^^
NameError: name 'false' is not defined

:) cat bad-transform.py 
def transform(event):
    return false

```
