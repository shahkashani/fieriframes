import { Button, CircularProgress, IconButton } from '@mui/material';
import Picker, { DEFAULT_LENGTH } from '../Picker';
import { useEffect, useRef, useState } from 'react';

import BoltIcon from '@mui/icons-material/Bolt';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import HighQualityIcon from '@mui/icons-material/HighQuality';
import HighQualityOutlinedIcon from '@mui/icons-material/HighQualityOutlined';
import Image from '../Image';
import ResetTvIcon from '@mui/icons-material/ResetTv';
import SendIcon from '@mui/icons-material/Send';
import SmartButton from '@mui/icons-material/SmartButton';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import hotkeys from 'hotkeys-js';
import styled from 'styled-components';

const ICON_SIZE = 20;
const HIGH_QUALITY_GIF_WIDTH = 720;
const LOW_QUALITY_GIF_WIDTH = 240;

const ASSET_PORT = 3001;

const Toolbar = styled.div`
  position: sticky;
  top: 0;
  background: black;
  margin-bottom: 10px;
  padding: 10px;
  z-index: 2;
`;

const Buttons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const MainButtons = styled(Buttons)`
  @media (max-width: 640px) {
    flex-direction: row-reverse;
    justify-content: flex-end;
  }
`;

const Frames = styled.div`
  display: flex;
  flex-wrap: wrap;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 20px;
  margin-top: 20px;
`;

const Images = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const ControlColumns = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 0px;
  }
`;

const TextEllipsis = styled.div`
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const getAssetsUrl = () => {
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:${ASSET_PORT}`;
};

export default function Preview() {
  const [images, setImages] = useState([]);
  const [isResetting, setIsResetting] = useState(false);
  const [isSmartResetting, setIsSmartResetting] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);

  const [requestVideo, setRequestVideo] = useState('');
  const [requestLength, setRequestLength] = useState(2);
  const [requestTimestamps, setRequestTimestamps] = useState([0]);

  const [video, setVideo] = useState('');
  const [timestamps, setTimestamps] = useState([]);
  const [length, setLength] = useState(DEFAULT_LENGTH);
  const [isHighQuality, setIsHighQuality] = useState(false);

  const [isBookmarking, setIsBookmarking] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [search, setSearch] = useState('');

  const assetUrl = getAssetsUrl();

  useEffect(() => {
    const socket = io();
    socket.on('update', async (data) => {
      try {
        const { images, captions, source } = data;
        setImages(images);
        setCaptions(captions);
        if (!video && source) {
          const timestamps = images.map(({ time }) => time);
          const length = images[0].length;
          setVideo(source.name);
          setTimestamps(timestamps);
          setLength(length);
        }
      } catch (err) {
        console.log(err);
      }
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const reset = async ({ video, timestamps, search, length, smart }) => {
    try {
      const response = await fetch(
        `/reset?video=${encodeURIComponent(video)}&timestamps=${timestamps.join(
          ','
        )}&length=${length}&width=${
          isHighQuality ? HIGH_QUALITY_GIF_WIDTH : LOW_QUALITY_GIF_WIDTH
        }&search=${encodeURIComponent(search)}${smart ? `&smart=true` : ''}`
      );
      const data = await response.json();
      setVideo(data.source.name);
      setLength(
        Number.isFinite(data.images[0].length)
          ? data.images[0].length
          : DEFAULT_LENGTH
      );
      setTimestamps(data.images.map(({ time }) => time));
    } catch (err) {
      console.error(err);
    }
  };

  const onReset = async () => {
    setIsResetting(true);
    await reset({
      video: requestVideo,
      timestamps: requestTimestamps,
      length: requestLength,
      search,
    });
    setIsResetting(false);
  };

  const onCollapse = async () => {
    setIsCollapsing(true);
    try {
      await fetch('/collapse');
    } catch (err) {
      console.error(err);
    }
    setIsCollapsing(false);
  };

  const onSmartReset = async () => {
    setIsSmartResetting(true);
    await reset({
      video: requestVideo,
      smart: true,
      timestamps: requestTimestamps,
      length: requestLength,
      search,
    });
    setIsSmartResetting(false);
  };

  const onApply = async () => {
    setIsApplying(true);
    try {
      await fetch('/apply');
    } catch (err) {
      console.error(err);
    }
    setIsApplying(false);
  };

  const onPost = async () => {
    setIsPosting(true);
    try {
      await fetch('/post');
    } catch (err) {
      console.error(err);
    }
    setIsPosting(false);
  };

  const getBookmarks = async () => {
    const response = await fetch('/bookmarks');
    const json = await response.json();
    setBookmarks(json);
  };

  const onBookmark = async () => {
    const comment = prompt('Add a comment');
    const response = await fetch('/bookmark', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment,
        video,
        timestamps,
        length,
      }),
    });
    const json = await response.json();
    setBookmarks(json);
    setIsBookmarking(true);
    setTimeout(() => {
      setIsBookmarking(false);
    }, 2000);
  };

  const onRestart = async () => {
    await fetch('/restart', {
      method: 'POST',
    });
  };

  const isLoading =
    isResetting || isSmartResetting || isApplying || isPosting || isCollapsing;
  const notInitialRender = useRef(false);

  useEffect(() => {
    //getNext();
    getBookmarks();
  }, []);

  hotkeys.unbind('cmd+r,f5');
  hotkeys('cmd+r,f5', (event) => {
    event.preventDefault();
    if (!isLoading) {
      onReset();
    }
  });

  useEffect(() => {
    if (notInitialRender.current) {
      reset({
        video,
        timestamps,
        length,
        search,
      });
    } else {
      notInitialRender.current = true;
    }
  }, [isHighQuality]);

  return (
    <div>
      <Toolbar>
        <Picker
          defaultVideo={requestVideo}
          defaultLength={requestLength}
          defaultTimestamps={requestTimestamps}
          onChangeVideo={(video) => setRequestVideo(video)}
          onChangeTimestamps={(timestamps) => setRequestTimestamps(timestamps)}
          onChangeLength={(length) => setRequestLength(length)}
          onSearchChange={(search) => setSearch(search)}
          bookmarks={bookmarks}
          numTimestamps={(captions || []).length || 1}
        />
        <ControlColumns>
          <MainButtons>
            <Button
              onClick={onReset}
              disabled={isLoading}
              variant="outlined"
              startIcon={
                isResetting ? (
                  <CircularProgress color="inherit" size={ICON_SIZE} />
                ) : (
                  <ResetTvIcon color="inherit" size={ICON_SIZE} />
                )
              }
            >
              Reset
            </Button>
            <Button
              onClick={onSmartReset}
              disabled={isLoading}
              variant="outlined"
              startIcon={
                isSmartResetting ? (
                  <CircularProgress color="inherit" size={ICON_SIZE} />
                ) : (
                  <SmartButton color="inherit" size={ICON_SIZE} />
                )
              }
            >
              Smart Reset
            </Button>
            <Button
              onClick={onApply}
              disabled={isLoading}
              variant="outlined"
              startIcon={
                isApplying ? (
                  <CircularProgress color="inherit" size={ICON_SIZE} />
                ) : (
                  <ColorLensIcon color="inherit" size={ICON_SIZE} />
                )
              }
            >
              Apply
            </Button>
            <Button
              onClick={onCollapse}
              disabled={isLoading}
              variant="outlined"
              startIcon={
                isCollapsing ? (
                  <CircularProgress color="inherit" size={ICON_SIZE} />
                ) : (
                  <UnfoldLessIcon color="inherit" size={ICON_SIZE} />
                )
              }
            >
              Collapse
            </Button>
            <Button
              onClick={onPost}
              disabled={isLoading}
              variant="contained"
              color="success"
              startIcon={
                isPosting ? (
                  <CircularProgress color="inherit" size={ICON_SIZE} />
                ) : (
                  <SendIcon color="inherit" size={ICON_SIZE} />
                )
              }
            >
              Post
            </Button>
            <Button
              variant="outlined"
              onClick={() => onRestart()}
              startIcon={<BoltIcon size={ICON_SIZE} color="inherit" />}
            >
              Tilt
            </Button>
          </MainButtons>
          <Buttons>
            {video && (
              <Button
                disabled={isLoading}
                onClick={() => {
                  setRequestVideo(video);
                  setRequestLength(length);
                  setRequestTimestamps(timestamps);
                }}
                style={{ whiteSpace: 'nowrap' }}
              >
                <TextEllipsis>{video}</TextEllipsis>
                &nbsp;({timestamps.map((t) => `${parseInt(t, 10)}s`).join(', ')}
                )
              </Button>
            )}
            <IconButton
              onClick={() => {
                setIsHighQuality((hq) => !hq);
              }}
              disabled={isLoading}
            >
              {isHighQuality ? (
                <HighQualityIcon />
              ) : (
                <HighQualityOutlinedIcon />
              )}
            </IconButton>
            <IconButton
              disabled={isLoading || isBookmarking}
              onClick={() => onBookmark()}
            >
              {isBookmarking ? <ThumbUpIcon /> : <BookmarkAddIcon />}
            </IconButton>
          </Buttons>
        </ControlColumns>
      </Toolbar>
      <Images>
        {images.map((image, index) => {
          return (
            <Image
              src={`${assetUrl}${image.url}`}
              title={captions[index]}
              width={image.width}
              height={image.height}
              displayWidth={540}
              index={index}
              image={image}
              key={image.index}
            />
          );
        })}
      </Images>
      {images.map((image, index) => {
        return (
          <Frames>
            {image.frames.map((frame) => (
              <Image
                index={index}
                key={`${index}-${frame.index}`}
                src={`${assetUrl}${frame.url}`}
                height={image.height}
                width={image.width}
                displayWidth={540}
                frame={frame.index}
                title={`Frame ${frame.index}`}
              />
            ))}
          </Frames>
        );
      })}
    </div>
  );
}
