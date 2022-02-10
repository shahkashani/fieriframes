import { useEffect, useRef, useState } from 'react';

import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Select = styled.select`
  min-width: 100px;
  padding: 10px;
`;

const Input = styled.input`
  padding: 10px;
  width: 100px;
`;

const Video = styled.video`
  width: 540px;
`;

const Button = styled.button`
  border: 0;
  outline: none;
  background: none;
  color: white;
  cursor: pointer;
`;

function VideoScrubber({ video, seconds, onChange }) {
  const [seek, setSeek] = useState(0);
  const ref = useRef();

  useEffect(() => {
    if (ref.current.paused) {
      ref.current.currentTime = seconds;
    }
  }, [seconds, ref.current]);

  useEffect(() => {
    if (seek > 0) {
      onChange(seek);
    }
  }, [seek]);

  return (
    <Video
      ref={ref}
      controls={true}
      autoPlay={false}
      muted={true}
      onTimeUpdate={(e) => setSeek(e.target.currentTime)}
    >
      <source src={`/${video}.mp4`} />
    </Video>
  );
}

export default function Picker({
  onChangeVideo,
  bookmarks,
  onChangeSeconds,
  defaultVideo,
  defaultSeconds,
}) {
  const [videos, setVideos] = useState([]);
  const [video, setVideo] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [bookmark, setBookmark] = useState('');

  useEffect(async () => {
    const response = await fetch('/videos');
    const json = await response.json();
    setVideos(json);
  }, []);

  useEffect(() => {
    if (defaultSeconds) {
      setSeconds(defaultSeconds);
    }
  }, [defaultSeconds]);

  useEffect(() => {
    if (defaultVideo) {
      setVideo(defaultVideo);
    }
  }, [defaultVideo]);

  useEffect(() => {
    onChangeVideo(video);
  }, [video]);

  useEffect(() => {
    onChangeSeconds(seconds);
  }, [seconds]);

  useEffect(() => {
    if (bookmark === '') {
      setVideo('');
      setSeconds(0);
      return;
    }
    const { video, seconds } = bookmarks[parseInt(bookmark, 10)];
    setVideo(video);
    setSeconds(seconds);
  }, [bookmark]);

  return (
    <Container>
      {isScrubbing && video && (
        <VideoScrubber
          video={video}
          seconds={seconds}
          onChange={(s) => setSeconds(s)}
        />
      )}
      <Controls>
        {videos.length > 0 ? (
          <Select
            value={video}
            onChange={(e) => {
              setVideo(e.target.value);
              setSeconds(0);
            }}
          >
            <option key="random" value="">
              Random episode
            </option>
            {videos.map((video) => (
              <option key={video}>{video}</option>
            ))}
          </Select>
        ) : (
          <Select disabled>
            <option>Loading videos...</option>
          </Select>
        )}
        <Select value={bookmark} onChange={(e) => setBookmark(e.target.value)}>
          <option key="random" value="">
            Bookmarks
          </option>
          {bookmarks.map((bookmark, i) => (
            <option key={i} value={i}>
              {bookmark.video} ({bookmark.seconds}s)
            </option>
          ))}
        </Select>
        {video && (
          <Input
            type="number"
            value={seconds}
            step={0.1}
            onChange={(e) => setSeconds(e.target.value)}
          />
        )}
        {video && (
          <Button onClick={() => setIsScrubbing((value) => !value)}>👀</Button>
        )}
        {video && (
          <Button
            onClick={() => {
              setIsScrubbing(false);
              setVideo('');
              setBookmark('');
              setSeconds(0);
            }}
          >
            ✨
          </Button>
        )}
      </Controls>
    </Container>
  );
}
