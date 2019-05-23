# Hello from Flavortown

![Bold Flavors](https://images.firstwefeast.com/complex/images/c_limit,f_auto,fl_lossy,q_auto,w_1100/hhrnx2avnk3qmerpns78/guy-fieri)

This is the source code behind [Fieri Frames](http://fieriframes.tumblr.com). If you're here, you must love existential angst and bold flavors. Who can blame you?

This bot is powered by another terrible library I wrote, called [stills](https://github.com/shahkashani/stills).

If you just wanna generate stills, all you need is this repo and some videos. So keep reading.

If you wanna change the way the stills generator works, you're really going to have to change the `stills` engine. The instructions in [CONTRIBUTING](./CONTRIBUTING.md) will show you how to set all of that up.

# How do I generate a still?

## Setup

### Not using Docker

1. Install the dependencies in the [stills README](https://github.com/shahkashani/stills)
1. Install nvm: `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash`
1. Put some videos in `./videos`
1. Run `nvm install`
1. Run `npm run generate`.

You can also do things like `npm run generate -- --type=gif`.

### Using Docker

1. `docker build . -t fieriframes`
1. Put some videos in `./videos`
1. `docker run -v $(pwd)/videos:/app/videos -t fieriframes npm run generate`

You don't need to install any of the aforementioned dependencies if you decide to use Docker.

The trade-off is that it's hell of a lot slower, especially if you use it for development (it'll occasionally reinstall imagemagick and other dependencies).

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

# Trying to add captions?

Just drop a new .srt file or .txt file into the `captions` folder. If you're adding author quotes, you might find [goodquotes](https://github.com/shahkashani/goodquotes) useful.

# Tada

I think that's it! Let me know if you run into any troubles. PRs accepted! Make a fork and open one against this repo!
