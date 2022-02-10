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
  height: auto;
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
  
  &:disabled {
    opacity: 0.5;
  }
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

export default function Picker({ onChangeVideo, onChangeSeconds }) {
  const [videos, setVideos] = useState([]);
  const [video, setVideo] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);

  useEffect(async () => {
    const response = await fetch('/videos');
    const json = await response.json();
    setVideos(json);
  }, []);

  useEffect(() => {
    setSeconds(0);
    onChangeVideo(video);
  }, [video]);

  useEffect(() => {
    onChangeSeconds(seconds);
  }, [seconds]);

  if (videos.length === 0) {
    return (
      <Select disabled>
        <option>Loading...</option>
      </Select>
    );
  }

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
        <Select onChange={(e) => setVideo(e.target.value)}>
          <option key="random" value="">
            Random
          </option>
          {videos.map((video) => (
            <option key={video}>{video}</option>
          ))}
        </Select>
        <Input
          type="number"
          value={seconds}
          step={0.1}
          onChange={(e) => setSeconds(e.target.value)}
        />
        <Button
          disabled={!video}
          onClick={() => setIsScrubbing((value) => !value)}
        >
          ▶
        </Button>
      </Controls>
    </Container>
  );
}
