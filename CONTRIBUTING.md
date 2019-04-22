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
