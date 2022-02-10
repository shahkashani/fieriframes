import { useEffect, useState } from 'react';

import Picker from '../Picker';
import styled from 'styled-components';

const Button = styled.button`
  border: none;
  background: white;
  color: black;
  padding: 10px 15px;
  border-radius: 40px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6;
  }

  &[disabled] {
    cursor: default;
    opacity: 0.2;
  }
`;

const PostButton = styled(Button)`
  background: green;
`;

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
  const [video, setVideo] = useState('');
  const [seconds, setSeconds] = useState(0);

  const getNext = async () => {
    try {
      const result = await fetch('http://localhost:3001/project');
      const { images } = await result.json();
      setImages(images);
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
      await fetch(
        `/reset?video=${encodeURIComponent(video)}&seconds=${seconds}`
      );
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

  const isLoading = isResetting || isApplying || isPosting;

  useEffect(() => {
    getNext();
  }, []);

  return (
    <div>
      <Toolbar>
        <Picker
          onChangeVideo={(video) => setVideo(video)}
          onChangeSeconds={(seconds) => setSeconds(seconds)}
        />
        <Buttons>
          <Button onClick={onReset} disabled={isLoading}>
            {isResetting ? 'Resetting...' : 'Reset'}
          </Button>
          <Button onClick={onApply} disabled={isLoading}>
            {isApplying ? 'Applying...' : 'Apply'}
          </Button>
          <PostButton onClick={onPost} disabled={isLoading}>
            {isPosting ? 'Posting...' : 'Post'}
          </PostButton>
        </Buttons>
      </Toolbar>

      <Images>
        {images.map((image) => {
          return (
            <img
              key={image.url}
              src={image.url}
              width={image.width}
              height={image.height}
            />
          );
        })}
      </Images>
      {images.map((image) => {
        return (
          <Frames>
            {image.frames.map((frame) => {
              return (
                <img
                  key={frame.url}
                  src={frame.url}
                  width={image.width}
                  height={image.height}
                />
              );
            })}
          </Frames>
        );
      })}
    </div>
  );
}
