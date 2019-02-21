# POSTCARDS FROM FLAVORTOWN

![Bold Flavors](https://images.firstwefeast.com/complex/images/c_limit,f_auto,fl_lossy,q_auto,w_1100/hhrnx2avnk3qmerpns78/guy-fieri)

This is the source code behind [Fieri Frames](http://fieriframes.tumblr.com). If you're here, you must love existential angst and bold flavors. Who can blame you?

Anyway, as you can tell, there's not much in this repo. This bot is powered by another terrible library I wrote, called [stills](https://github.com/shahkashani/stills). The setup for this thing is the most convoluted thing in Flavortown, so if you're trying to contribute, you must _really_, _really_ love bold flavors. Guy bless you.

To change the way the stills generator works, you're really going to have to change the `stills` engine. So these instructions will show you how to pull down that repo and link things up locally so you dev on both the `fieriframes` bot (which, again, does nothing) and the underlying engine.

## Setup

### Dependencies

1. imagemagick: `brew install imagemagick` (if you're doing face detection and stuff, you'll need way more than this, but we won't get into that here)
1. nvm: `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash`

### `stills` engine

1. Fork `https://github.com/shahkashani/stills.git` and replace the URL in the step below with your fork
1. `git clone https://github.com/shahkashani/stills.git`
1. `cd stills`
1. `nvm install`
1. `npm install --production` (`-- production` to skip all the face detection stuff)
1. `npm link --production`
1. `cd ../`

### `fieriframes` bot

1. `git clone https://github.com/shahkashani/fieriframes`
1. `cd fieriframes`
1. `nvm install`
1. `npm install`
1. `npm link stills`

Now, any changes you make to `stills` will automatically be picked up by `fieriframes`. If you make something cool, please make a PR from your `stills` fork against the master repo.

## Creating stills

1. `cd fieriframes`
1. `mkdir videos stills gifs`
1. Put some [videos](https://www.google.com/search?q=%22Diners+Drive-Ins+and+Dives+Collection+%28Season+1+to+14%29%22) in the `videos` folder you just made
1. `npm run stills` for stills
1. `npm run gifs` for gifs

That'll create random stills/gifs into `stills` and `gifs`.

If you want more granular control over how the stills are generated (i.e. the number of stills per episode, how many percentage of stills should have captions, etc.), run:

1. `./node_modules/.bin/stills --help`
1. `./node_modules/.bin/gifs --help`

If you want to change the stills generation code, [this file](https://github.com/shahkashani/stills/blob/master/bin/stills.js) is a good place to start.

## Posting?

If you want to post the stills you generate, you basically need to set things up in an `.env` file [based on these instructions](https://github.com/shahkashani/stills)

## Tada

I think that's it. I can't guarantee that any of this will work since I probably have a thousand dependencies beyond imagemagick I don't remember installing, but let me know if you run into any troubles.
