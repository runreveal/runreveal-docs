# Connecting to other resources

Triggers connect to both sources and notifications. To connect these resources together, you need to know the name of the sources and notifications, and the ID of the trigger you want to connect it to.

This will likely change, and in the near term support for connecting via name and ID will be added

```
runreveal triggers update --src-name webhook --notif-name myemail 2SO5pyKpohsEjFITt76xn8FFoQI
```
