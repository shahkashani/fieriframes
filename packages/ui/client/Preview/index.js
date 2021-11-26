import { useEffect, useState } from 'react';

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

const Buttons = styled.div`
  margin-bottom: 10px;
  padding: 10px;
  display: flex;
  gap: 10px;
`;

const Frames = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
`;

export default function Preview() {
  const [images, setImages] = useState([]);
  const [timeoutId, setTimeoutId] = useState();
  const [isResetting, setIsResetting] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

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
      await fetch('/reset');
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
      {images.map((image) => {
        return (
          <div>
            <img src={image.url} width={image.width} height={image.height} />
            <Frames>
              {image.frames.map((frame) => {
                return (
                  <img
                    src={frame.url}
                    width={image.width}
                    height={image.height}
                  />
                );
              })}
            </Frames>
          </div>
        );
      })}
    </div>
  );
}
