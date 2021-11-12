import { useEffect, useState } from 'react';

export default function Preview() {
  const [images, setImages] = useState([]);
  const [timeoutId, setTimeoutId] = useState();

  const getNext = async () => {
    try {
      const result = await fetch('http://localhost:3001/project');
      const { images } = await result.json();
      console.log('>>>', images);
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

  useEffect(() => {
    getNext();
  }, []);

  return (
    <div>
      {images.map((image) => {
        return (
          <div>
            <img src={image.url} />{' '}
            {image.frames.map((frame) => {
              return <img src={frame.url} />;
            })}
          </div>
        );
      })}
    </div>
  );
}
