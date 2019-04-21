# Hello from Flavortown

![Bold Flavors](https://images.firstwefeast.com/complex/images/c_limit,f_auto,fl_lossy,q_auto,w_1100/hhrnx2avnk3qmerpns78/guy-fieri)

This is the source code behind [Fieri Frames](http://fieriframes.tumblr.com). If you're here, you must love existential angst and bold flavors. Who can blame you?

This bot is powered by another terrible library I wrote, called [stills](https://github.com/shahkashani/stills).

To change the way the stills generator works, you're really going to have to change the `stills` engine. So these instructions will show you how to pull down that repo and link things up locally so you dev on both the `fieriframes` bot (which, again, does nothing) and the underlying engine.

# Setup

## Dependencies

1. See the [stills README](https://github.com/shahkashani/stills)
1. nvm: `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash`

## `stills` engine

1. `git clone https://github.com/shahkashani/stills.git`
1. `cd stills`
1. `nvm install`
1. `npm install`
1. `npm link`
1. `cd ../`

## `fieriframes` bot

1. `git clone https://github.com/shahkashani/fieriframes.git`
1. `cd fieriframes`
1. `nvm install`
1. `npm install`
1. `npm link stills`

Now, any changes you make to `stills` will automatically be picked up by `fieriframes`. If you make something cool, please make a PR from your `stills` fork against the master repo.

# How do I generate a still?

Put some videos in `videos` and then run `npm run generate`.

You can also do things like `npm run generate -- --type=gif`.

## Can I specify what effects to use, etc.?

Absolutely. `node index.js --help` will output some helpful instructions.

```
Usage: index.js <command> [options]

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --post     Upload image to the destinations                          [boolean]
  --effects  Apply a specific GIF effect (by name)                       [array]
  --local    Local folder to read videos from instead of S3
  --caption  Use a particular caption glob
  --type     The type of image generated
                         [choices: "still", "gif", "random"] [default: "random"]
```

Example: `node index.js --local=videos --type=gif --effects=stutter --caption=Mothman`

## S3

To pick an image from a video in S3 instead of locally, add the following variables in an `.env` file at root and then omit the `--local` parameter above.

```
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET=
```

# How do I post?

Run `node index.js --post` or `npm run post`

If you wanna post to Tumblr, you're gonna need variables defined in an `.env` file:

```
TUMBLR_CONSUMER_KEY=
TUMBLR_CONSUMER_SECRET=
TUMBLR_ACCESS_TOKEN_KEY=
TUMBLR_ACCESS_TOKEN_SECRET=
TUMBLR_BLOG_NAME=
```

And for Twitter:

```
TWITTER_CONSUMER_KEY=
TWITTER_CONSUMER_SECRET=
TWITTER_ACCESS_TOKEN_KEY=
TWITTER_ACCESS_TOKEN_SECRET=
```

## Tada

I think that's it! Let me know if you run into any troubles. PRs accepted! Make a fork and open one against this repo!
