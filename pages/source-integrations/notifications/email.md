# Email

Delivering notifications to email is straightforward to setup. All you need is an email address that you want to deliver notifications to.

```
runreveal notifications email add --name "SIRT Team" sirt@runreveal.com
{
     "ID": "2O1lzQKpO2bZHeM8ghlfsRZn9jC",
     "WorkspaceID": "2KUOdhvRReF5RZfQX8ILneT4fSd",
     "Name": "SIRT Team",
     "DestType": "email"
 }
```

The name argument is optional and allows you to give a descriptive name associated with the email address.

If you'd like to see what email notifications are already set up use the list subcommand.

```
runreveal notifications email list                  
[
     {
         "ID": "2O1lzQKpO2bZHeM8ghlfsRZn9jC",
         "WorkspaceID": "2KUOdhvRReF5RZfQX8ILneT4fSd",
         "Name": "SIRT Team",
         "DestType": "email",
         "Email": "sirt@runreveal.com"
     }
 ]
```