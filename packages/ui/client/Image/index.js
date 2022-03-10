import { useState } from 'react';
import styled from 'styled-components';
import UploadIcon from '@mui/icons-material/Upload';

const Container = styled.div`
  position: relative;
`;

const Controls = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  color: white;
`;

const Label = styled.label`
  cursor: pointer;
`;

export default Image = ({ src, width, height, index, frame }) => {
  const [isShowingControls, setIsShowingControls] = useState(false);
  const id = `image-${index}-${frame ? `-${frame}` : ''}`;

  const onChange = async (event) => {
    const formData = new FormData();
    const input = event.target;
    const [file] = input.files;
    formData.append('index', index);
    formData.append('image', file);
    if (Number.isFinite(frame)) {
      formData.append('frame', frame);
    }
    input.value = '';
    try {
      await fetch('/replace', {
        method: 'POST',
        body: formData,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container
      onMouseOver={() => setIsShowingControls(true)}
      onMouseLeave={() => setIsShowingControls(false)}
    >
      <img src={src} width={width} height={height} />
      <Controls style={{ opacity: isShowingControls ? 1 : 0 }}>
        <input
          type="file"
          onChange={onChange}
          id={id}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <Label htmlFor={id}>
          <UploadIcon />
        </Label>
      </Controls>
    </Container>
  );
};
