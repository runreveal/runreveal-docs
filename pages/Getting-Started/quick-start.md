# 🏃 Quick start

## Install the CLI

Install [homebrew](https://brew.sh/) for macOS, then enable our homebrew tap and install the CLI:

```
brew tap runreveal/runreveal
brew install runreveal
```

## Login to RunReveal

Once RunReveal has enabled your domain on the platform, login with:

```
runreveal init
```

The `init` command is used to both create an account or log in to an existing account. If it is your first time running init, you'll be prompted to enter the name of your workspace.

```
runreveal init
Enter your workspace name: Example Inc.
```

You can validate that you're logged in by running the following command

```
runreveal config account

👍 You're logged in!
User ID: 2KUOdUOFyuTbPD7amU3WidyfOzf
User Email: evan@runreveal.com
```

Now you're ready to set up a log source!
