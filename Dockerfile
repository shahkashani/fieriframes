FROM node:16

ENV IMAGEMAGICK_VERSION 7.0.11-2

RUN mkdir -p /app/vendor/ffmpeg
WORKDIR /app/vendor/ffmpeg
RUN curl -L https://www.johnvansickle.com/ffmpeg/old-releases/ffmpeg-5.1.1-amd64-static.tar.xz | tar xJ --strip-components=1
# RUN curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz | tar xJ --strip-components=1
ENV PATH "$PATH:/app/vendor/ffmpeg"

RUN mkdir -p /app/vendor/imagemagick
WORKDIR /app/vendor/imagemagick
RUN curl -L https://github.com/ImageMagick/ImageMagick/archive/${IMAGEMAGICK_VERSION}.tar.gz | tar zx
WORKDIR /app/vendor/imagemagick/ImageMagick-${IMAGEMAGICK_VERSION}
RUN ./configure \
  --prefix=/usr \
  --enable-shared \
  --disable-openmp \
  --disable-hdri \
  --disable-largefile \
  --disable-static \
  --with-bzlib \
  --with-jpeg \
  --with-lcms \
  --with-png \
  --with-tiff \
  --with-webp \
  --with-xml \
  --with-zlib \
  --with-quantum-depth=8 \
  --with-freetype
RUN make
RUN make install
RUN ldconfig /usr/local/lib
ENV PATH "$PATH:/app/vendor/imagemagick/ImageMagick-${IMAGEMAGICK_VERSION}"

# For Chrome
# RUN apt-get update && apt-get install -y ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 ibatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils

WORKDIR /app
COPY package-lock.json package.json /app/
RUN npm install
COPY . /app/
