import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';

import { debounce } from 'lodash';
import styled from 'styled-components';

const SEARCH_DEBOUNCE = 500;

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
      key={video}
      ref={ref}
      preload=""
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
  const [open, setOpen] = useState(false);
  const [isSearchingCaptions, setIsSearchingCaptions] = useState(false);
  const [captionSearch, setCaptionSearch] = useState('');
  const [captionResults, setCaptionResults] = useState([]);

  const getOptionsDelayed = useCallback(
    debounce((text, callback) => {
      setCaptionResults([]);
      setIsSearchingCaptions(true);
      fetch(`/search?q=${encodeURIComponent(text)}`).then((response) => {
        setIsSearchingCaptions(false);
        response.json().then((json) => callback(json));
      });
    }, SEARCH_DEBOUNCE),
    []
  );

  useEffect(async () => {
    if (!captionSearch) {
      setCaptionResults([]);
      setIsSearchingCaptions(false);
      return;
    }
    getOptionsDelayed(captionSearch, (filteredOptions) => {
      setCaptionResults(filteredOptions);
    });
  }, [captionSearch]);

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
        <Autocomplete
          sx={{ width: 400 }}
          options={videos}
          value={video}
          disableClearable={!video}
          onChange={(e, value) => {
            setSeconds(0);
            setBookmark(null);
            if (!value) {
              setVideo('');
              return;
            }
            setVideo(value);
          }}
          multiple={false}
          isOptionEqualToValue={() => true}
          renderInput={(params) => <TextField {...params} label="Episode" />}
        />

        <Autocomplete
          sx={{ width: 450 }}
          options={bookmarks}
          value={bookmark}
          isOptionEqualToValue={(v) => !!v}
          disableClearable={!bookmark}
          onChange={(e, value) => {
            if (!value) {
              setVideo('');
              setSeconds(0);
              setBookmark(null);
              return;
            }
            setBookmark(value);
            setVideo(value.name);
            setSeconds(value.seconds);
          }}
          getOptionLabel={(option) =>
            option.video ? `${option.video} (${option.seconds}s)` : ''
          }
          multiple={false}
          renderInput={(params) => <TextField {...params} label="Bookmarks" />}
        />
        <Autocomplete
          sx={{ width: 300 }}
          open={open}
          onOpen={() => {
            setOpen(true);
          }}
          onClose={() => {
            setOpen(false);
          }}
          isOptionEqualToValue={(option, value) => option.title === value.title}
          getOptionLabel={(option) => option.title}
          options={captionResults}
          disableClearable={!captionSearch}
          autoSelect={false}
          inputValue={captionSearch}
          filterSelectedOptions={false}
          filterOptions={(x) => x}
          onChange={(event, value) => {
            if (value && value.data) {
              const { name, seconds } = value.data;
              setVideo(name);
              setSeconds(seconds);
              setOpen(false);
              setIsScrubbing(true);
            }
          }}
          onInputChange={(event, newInputValue, reason) => {
            if (reason === 'reset') {
              return;
            }
            setCaptionSearch(newInputValue);
          }}
          loading={isSearchingCaptions}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Captions"
              options={captionResults}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {isSearchingCaptions ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />

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
