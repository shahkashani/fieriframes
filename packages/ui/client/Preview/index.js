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
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import styled from 'styled-components';

const ICON_SIZE = 20;
const HIGH_QUALITY_GIF_WIDTH = 720;
const LOW_QUALITY_GIF_WIDTH = 240;

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

export default function Preview() {
  const [images, setImages] = useState([]);
  const [timeoutId, setTimeoutId] = useState();
  const [isResetting, setIsResetting] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const [requestVideo, setRequestVideo] = useState('');
  const [requestLength, setRequestLength] = useState(2);
  const [requestTimestamps, setRequestTimestamps] = useState([0]);

  const [video, setVideo] = useState('');
  const [timestamps, setTimestamps] = useState([]);
  const [length, setLength] = useState(DEFAULT_LENGTH);
  const [isHighQuality, setIsHighQuality] = useState(true);

  const [isBookmarking, setIsBookmarking] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [captions, setCaptions] = useState([]);

  const getNext = async () => {
    try {
      const result = await fetch('http://localhost:3001/project');
      const json = await result.json();
      const { images, info } = json;
      setImages(images);
      setCaptions(info ? info.captions : []);
      if (!video && info.video) {
        setVideo(info.video);
        setTimestamps(info.timestamps);
        setLength(info.length);
      }
    } catch (err) {
      console.log(err);
    }
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setTimeoutId(
      setTimeout(async () => {
        getNext();
      }, 1000)
    );
  };

  const reset = async ({ video, timestamps, length }) => {
    setIsResetting(true);
    try {
      const response = await fetch(
        `/reset?video=${encodeURIComponent(video)}&timestamps=${timestamps.join(
          ','
        )}&length=${length}&width=${
          isHighQuality ? HIGH_QUALITY_GIF_WIDTH : LOW_QUALITY_GIF_WIDTH
        }`
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
    setIsResetting(false);
  };

  const onReset = async () => {
    await reset({
      video: requestVideo,
      timestamps: requestTimestamps,
      length: requestLength,
    });
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
    const response = await fetch('/bookmark', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
    await fetch('http://localhost:3001/restart', {
      method: 'POST',
    });
  };

  const isLoading = isResetting || isApplying || isPosting;
  const notInitialRender = useRef(false);

  useEffect(() => {
    getNext();
    getBookmarks();
  }, []);

  useEffect(() => {
    if (notInitialRender.current) {
      reset({
        video,
        timestamps,
        length,
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
          bookmarks={bookmarks}
          numTimestamps={captions.length || 1}
        />
        <Buttons>
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
            onClick={onPost}
            disabled={isLoading || !isHighQuality}
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
          <IconButton
            onClick={() => {
              setIsHighQuality((hq) => !hq);
            }}
            disabled={isLoading}
          >
            {isHighQuality ? <HighQualityIcon /> : <HighQualityOutlinedIcon />}
          </IconButton>
          {video && (
            <Button
              disabled={isLoading}
              onClick={() => {
                setRequestVideo(video);
                setRequestLength(length);
                setRequestTimestamps(timestamps);
              }}
            >
              {video} ({timestamps.map((t) => `${parseInt(t, 10)}s`).join(', ')})
            </Button>
          )}
          <IconButton
            disabled={isLoading || isBookmarking}
            onClick={() => onBookmark()}
          >
            {isBookmarking ? <ThumbUpIcon /> : <BookmarkAddIcon />}
          </IconButton>
        </Buttons>
      </Toolbar>
      <Images>
        {images.map((image, index) => {
          return (
            <Image
              src={image.url}
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
            {image.frames.map((frame, frameIndex) => (
              <Image
                index={index}
                key={`${index}-${frameIndex}`}
                src={frame.url}
                height={image.height}
                width={image.width}
                displayWidth={540}
                frame={frameIndex}
                title={`Frame ${frameIndex}`}
              />
            ))}
          </Frames>
        );
      })}
    </div>
  );
}
