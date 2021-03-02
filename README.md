# Hello from Flavortown

![Bold Flavors](https://images.firstwefeast.com/complex/images/c_limit,f_auto,fl_lossy,q_auto,w_1100/hhrnx2avnk3qmerpns78/guy-fieri)

This is the source code behind [Fieri Frames](http://fieriframes.tumblr.com). If you're here, you must love existential angst and bold flavors. Who can blame you?

This bot is powered by another terrible library I wrote, called [stills](https://github.com/shahkashani/stills).

If you just wanna generate stills, all you need is this repo and some videos. So keep reading.

If you wanna change the way the stills generator works, you're really going to have to change the `stills` engine. The instructions in [CONTRIBUTING](./CONTRIBUTING.md) will show you how to set all of that up.

# Setup

If you don't want to install a million dependencies and also run into a trillion faults in these instructions (as they're written for a Mac), I would highly recommend the Docker setup.

## Docker

Straight-forward-ish:

1. Download and install [Docker Desktop](https://www.docker.com/get-started) (it's free)
1. Build the Docker image: `docker build . -t fieriframes` (you can also run `npm run docker:build` if you have node installed)
1. Put some videos in the `videos` folder (where the GIFs or PNGs will be generated from)
1. Make an empty `output` folder (where the stills will go)
1. Generate a still: `docker run -v $(pwd)/videos:/app/videos -v $(pwd)/output:/app/output -it fieriframes npm run generate -- --outputFolder=./output` (you can also run `npm run docker:generate` if you have node intalled).

That's a mouthful, but ultimately it is a) mounting the `videos` and `output` folders and b) running `npm run generate` inside the Docker container.

And that's ultimately it. 

## Still generation options

For all options, run: `docker run -it fieriframes npm run help`. 

Options are applied like so:

`docker run -v $(pwd)/videos:/app/videos -v $(pwd)/output:/app/output -it fieriframes npm run generate -- --outputFolder=./output --type=gif --num=1 --captionText="Aaaaaaaaaaa" --effects=faceswirl`

That mouthful can be replaced with `npm run docker:generate -- --type=gif --effects=faceswirl --num=1 --captionText="Aaaaaaaaaaa"` if you have node installed locally.

## Not using Docker

Oh boy. Well, let's see how far this will get you:

1. Install the trillion dependencies in the [stills README](https://github.com/shahkashani/stills)
1. Install nvm: `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash`
1. Put some videos in `./videos`
1. Run `nvm install`
1. Run `npm install`
1. Run `npm run generate`.

You can also do things like `npm run generate -- --type=gif`.

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
