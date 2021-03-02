FROM node:10

ENV IMAGEMAGICK_VERSION 7.0.10-61

RUN mkdir -p /app/vendor/ffmpeg
WORKDIR /app/vendor/ffmpeg
RUN curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-arm64-static.tar.xz | tar xJ --strip-components=1
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

RUN mkdir -p /app/vendor/gcloud
WORKDIR /app/vendor/gcloud
RUN curl -L --silent https://dl.google.com/dl/cloudsdk/channels/rapid/google-cloud-sdk.tar.gz | tar xz
RUN /app/vendor/gcloud/google-cloud-sdk/install.sh -q
ENV PATH "$PATH:/app/vendor/gcloud/google-cloud-sdk/bin"

WORKDIR /app
COPY package-lock.json package.json /app/
RUN npm install
COPY . /app/
