import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import UploadIcon from '@mui/icons-material/Upload';
import styled from 'styled-components';
import { useState } from 'react';

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

export default Image = ({ src, title, width, height, index, frame }) => {
  const [isShowingControls, setIsShowingControls] = useState(false);
  const id = `image-${index}${Number.isFinite(frame) ? `-${frame}` : ''}`;

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

  const onDelete = () => {
    fetch(`/frame?index=${index}&frame=${frame}`, {
      method: 'DELETE',
    });
  };

  return (
    <Container
      onMouseOver={() => setIsShowingControls(true)}
      onMouseLeave={() => setIsShowingControls(false)}
    >
      <img src={src} width={width} height={height} title={title} />
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
        <Label onClick={() => onDelete()}>
          <DeleteOutlineIcon />
        </Label>
      </Controls>
    </Container>
  );
};
