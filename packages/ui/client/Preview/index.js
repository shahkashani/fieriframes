import { Button, CircularProgress, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';

import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import Picker from '../Picker';
import Image from '../Image';
import ResetTvIcon from '@mui/icons-material/ResetTv';
import SendIcon from '@mui/icons-material/Send';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import styled from 'styled-components';

const ICON_SIZE = 20;

const Toolbar = styled.div`
  position: sticky;
  top: 0;
  background: black;
  margin-bottom: 10px;
  padding: 10px;
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
  const [requestSeconds, setRequestSeconds] = useState(0);

  const [video, setVideo] = useState('');
  const [seconds, setSeconds] = useState(0);

  const [isBookmarking, setIsBookmarking] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);

  const getNext = async () => {
    try {
      const result = await fetch('http://localhost:3001/project');
      const json = await result.json();
      const { images, info } = json;
      setImages(images);
      if (!video && info.video) {
        setVideo(info.video);
        setSeconds(info.seconds);
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

  const onReset = async () => {
    setIsResetting(true);
    try {
      const response = await fetch(
        `/reset?video=${encodeURIComponent(
          requestVideo
        )}&seconds=${requestSeconds}`
      );
      const data = await response.json();
      setVideo(data.source.name);
      setSeconds(data.images[0].time);
    } catch (err) {
      console.error(err);
    }
    setIsResetting(false);
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
        seconds,
      }),
    });
    const json = await response.json();
    setBookmarks(json);
    setIsBookmarking(true);
    setTimeout(() => {
      setIsBookmarking(false);
    }, 2000);
  };

  const isLoading = isResetting || isApplying || isPosting;

  useEffect(() => {
    getNext();
    getBookmarks();
  }, []);

  return (
    <div>
      <Toolbar>
        <Picker
          defaultVideo={requestVideo}
          defaultSeconds={requestSeconds}
          onChangeVideo={(video) => setRequestVideo(video)}
          onChangeSeconds={(seconds) => setRequestSeconds(seconds)}
          bookmarks={bookmarks}
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

          {video && (
            <Button
              disabled={isLoading}
              onClick={() => {
                setRequestVideo(video);
                setRequestSeconds(seconds);
              }}
            >
              {video} ({seconds}s)
            </Button>
          )}
          <IconButton
            disabled={isLoading || isBookmarking}
            onClick={() => onBookmark(video, seconds)}
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
                frame={frameIndex}
              />
            ))}
          </Frames>
        );
      })}
    </div>
  );
}
