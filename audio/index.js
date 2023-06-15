const { sync } = require('glob');
const { exec } = require('shelljs');
const { resolve } = require('path');
const { unlinkSync, existsSync, writeFileSync } = require('fs');

const PARAMS = '0 1 0.5 30%';
const IN_FILE_VIDEO = resolve('../charbq.mp4');
const IN_FILE_VIDEO_EDITED = resolve('./iii/input.mp4');
const IN_FILE = resolve('./input.wav');
const IN_FOLDER = resolve('./split');
const OUT_FOLDER = resolve('./split-edited');
const FILE_LIST = resolve('./filelist.txt');
const OUT_FILE = resolve('./output.wav');
const OUT_FILE_VIDEO = resolve('./noblepie-vocals.mp4');
const OUT_FILE_VIDEO_EDITED = resolve('./noblepie-vocals.mp4');
const IS_INCREMENTAL_REVERSE = false;

const execCmd = (cmd) => {
  const result = exec(cmd, { silent: true });
  if (result.code !== 0) {
    throw new Error(`Shell command error: ${result.stderr.trim()}\n> ${cmd}`);
  }
  return result.stdout.trim();
};

const extractAudio = () => {
  execCmd(
    `ffmpeg -i "${IN_FILE_VIDEO}" -vn -acodec pcm_s16le -ar 44100 -ac 2 -y "${IN_FILE}"`
  );
};

const deleteFiles = () => {
  sync(`${IN_FOLDER}/*.wav`).forEach((file) => unlinkSync(file));
  sync(`${OUT_FOLDER}/*.wav`).forEach((file) => unlinkSync(file));
  if (existsSync(OUT_FILE)) {
    unlinkSync(OUT_FILE);
  }
};

const splitFile = () => {
  execCmd(
    `sox -V3 "${IN_FILE}" "${IN_FOLDER}/split.wav" silence -l ${PARAMS} : newfile : restart`
  );
};

const easing = (x) => x * x;

const getIncrementallyReversedFiles = (files) => {
  const count = files.length - 1;
  return files.filter((file, i) => {
    const chance = 1 - easing(i / count);
    return Math.random() > chance;
  });
};

const getReversedFiles = () => {
  const files = sync('*.wav', { cwd: IN_FOLDER });
  return IS_INCREMENTAL_REVERSE ? getIncrementallyReversedFiles(files) : files;
};

const editFiles = () => {
  const files = getReversedFiles();
  execCmd(`cp -R "${IN_FOLDER}/" "${OUT_FOLDER}"`);
  for (const file of files) {
    console.log(`Reversing audio: ${file}...`);
    execCmd(`sox "${IN_FOLDER}/${file}" "${OUT_FOLDER}/${file}" reverse`);
  }
};

const combineFiles = () => {
  const folder = OUT_FOLDER;
  const files = sync('*.wav', { cwd: folder });
  const fileString = files.map((file) => `file '${folder}/${file}'`).join('\n');
  writeFileSync(FILE_LIST, `${fileString}\n`);
  execCmd(
    `ffmpeg -f concat -safe 0 -i "${FILE_LIST}" -c copy -y "${OUT_FILE}"`
  );
  unlinkSync(FILE_LIST);
};

const createVideo = () => {
  execCmd(
    `ffmpeg -i "${IN_FILE_VIDEO}" -i "${OUT_FILE}" -c:v copy -map 0:v:0 -map 1:a:0 -y "${OUT_FILE_VIDEO}"`
  );
};

const createVideoEdited = () => {
  execCmd(
    `ffmpeg -i "${IN_FILE_VIDEO_EDITED}" -i "${OUT_FILE}" -c:v copy -map 0:v:0 -map 1:a:0 -y "${OUT_FILE_VIDEO_EDITED}"`
  );
};

console.log('Cleaning up...');
//deleteFiles();
console.log('Extracting audio...');
//extractAudio();
console.log('Splitting audio...');
splitFile();
console.log('Reversing audio...');
editFiles();
console.log('Creating audio output...');
combineFiles();
console.log('Creating video output...');
createVideo();
//console.log('Creating video output (edited)...');
//createVideoEdited();
