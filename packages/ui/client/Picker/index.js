import {
  Autocomplete,
  CircularProgress,
  IconButton,
  TextField,
} from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import PreviewIcon from '@mui/icons-material/Preview';
import { debounce } from 'lodash';
import styled from 'styled-components';

const SEARCH_DEBOUNCE = 500;
export const DEFAULT_LENGTH = 2;

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

const Video = styled.video`
  width: 540px;
`;

const TwoColumn = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 1400px) {
    flex-direction: column;
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

const getZeros = (length) => {
  const ts = [];
  for (let i = 0; i < length; i += 1) {
    ts.push(0);
  }
  return ts;
};

export default function Picker({
  onChangeVideo,
  bookmarks,
  onChangeLength,
  onSearchChange,
  defaultVideo,
  defaultLength,
  defaultTimestamps,
  numTimestamps,
  onChangeTimestamps,
}) {
  const [videos, setVideos] = useState([]);
  const [video, setVideo] = useState('');
  const [length, setLength] = useState(DEFAULT_LENGTH);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [bookmark, setBookmark] = useState('');
  const [open, setOpen] = useState(false);
  const [isSearchingCaptions, setIsSearchingCaptions] = useState(false);
  const [captionSearch, setCaptionSearch] = useState('');
  const [captionResults, setCaptionResults] = useState([]);
  const [timestamps, setTimestamps] = useState([0]);
  const [timestampIndex, setTimestampIndex] = useState(0);

  const timestampInputs = [];
  for (let i = 0; i < numTimestamps; i += 1) {
    timestampInputs.push(
      <TextField
        key={`ts-${i}`}
        label={`Time ${i + 1}`}
        type="number"
        style={{
          width: 100,
          backgroundColor:
            timestampIndex === i ? 'rgba(255, 255, 255, 0.1)' : undefined,
        }}
        onFocus={() => {
          setTimestampIndex(i);
        }}
        value={timestamps[i] || 0}
        inputProps={{ step: 0.1 }}
        onChange={(e) => {
          const ts = [...timestamps];
          ts[timestampIndex] = e.target.value;
          setTimestamps(ts);
        }}
      />
    );
  }

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
    if (defaultLength) {
      setLength(defaultLength);
    }
  }, [defaultLength]);

  useEffect(() => {
    setTimestamps(defaultTimestamps);
  }, [defaultTimestamps.join(',')]);

  useEffect(() => {
    if (defaultVideo) {
      setVideo(defaultVideo);
    }
  }, [defaultVideo]);

  useEffect(() => {
    onChangeVideo(video);
  }, [video]);

  useEffect(() => {
    onChangeTimestamps(timestamps);
  }, [timestamps.join(',')]);

  useEffect(() => {
    onChangeLength(length);
  }, [length]);

  useEffect(() => {
    onSearchChange(captionSearch);
  }, [captionSearch]);

  return (
    <Container>
      {isScrubbing && video && (
        <VideoScrubber
          video={video}
          seconds={timestamps[timestampIndex]}
          onChange={(s) => {
            const ts = [...timestamps];
            ts[timestampIndex] = s;
            setTimestamps(ts);
          }}
        />
      )}
      <TwoColumn>
        <Controls>
          <Autocomplete
            sx={{ width: 400 }}
            options={videos}
            value={video}
            disableClearable={!video}
            onChange={(e, value) => {
              setBookmark(null);
              if (!value) {
                setVideo('');
                return;
              }
              setVideo(value);
              setTimestamps(getZeros(numTimestamps));
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
                setLength(DEFAULT_LENGTH);
                setTimestamps(getZeros(numTimestamps));
                setBookmark(null);
                return;
              }
              setBookmark(value);
              setVideo(value.video);
              setLength(value.length || DEFAULT_LENGTH);
              if (value.timestamps) {
                setTimestamps(value.timestamps);
              } else if (value.seconds) {
                const ts = getZeros(numTimestamps);
                ts[0] = value.seconds;
                setTimestamps(ts);
              }
            }}
            getOptionLabel={(option) => {
              const timestamp = option.timestamps
                ? option.timestamps.map((f) => `${parseInt(f)}s`).join(', ')
                : `${parseInt(option.seconds)}s`;
              return option.video ? `${option.video} (${timestamp})` : '';
            }}
            multiple={false}
            renderInput={(params) => (
              <TextField {...params} label="Bookmarks" />
            )}
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
            isOptionEqualToValue={(option, value) =>
              option.title === value.title
            }
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
                const ts = getZeros(numTimestamps);
                ts[0] = seconds;
                setTimestamps(ts);
                setOpen(false);
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
                label="Find"
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
        </Controls>
        <Controls>
          {video && timestampInputs}

          {video && (
            <TextField
              label="Length"
              type="number"
              value={length}
              inputProps={{ step: 0.2 }}
              onChange={(e) => setLength(e.target.value)}
            />
          )}

          {video && (
            <IconButton onClick={() => setIsScrubbing((value) => !value)}>
              <PreviewIcon />
            </IconButton>
          )}
          {video && (
            <IconButton
              onClick={() => {
                setIsScrubbing(false);
                setVideo('');
                setBookmark('');
                setCaptionSearch('');
                setCaptionResults([]);
                setTimestamps(getZeros(numTimestamps));
                setLength(DEFAULT_LENGTH);
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Controls>
      </TwoColumn>
    </Container>
  );
}
