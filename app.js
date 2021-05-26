const controlElements = {
  blur: document.querySelector('.blur'),
  invert: document.querySelector('.invert'),
  sepia: document.querySelector('.sepia'),
  saturate: document.querySelector('.saturate'),
  hueRotate: document.querySelector('.hue-rotate'),
};

const imageElement = document.querySelector('.editor__image');

// Save image region
const saveButton = document.querySelector('.btn--save');

const fileSaveHandler = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  img.addEventListener('load', () => {
    canvas.width = img.width;
    canvas.height = img.height;
    console.log(controlElements.blur.value * (img.height / img.naturalHeight));
    ctx.filter = `blur(${controlElements.blur.value * (img.height / img.naturalHeight)}px) invert(${
      controlElements.invert.value / 100
    }) sepia(${controlElements.sepia.value}) saturate(${controlElements.saturate.value / 100}) hue-rotate(${
      controlElements.hueRotate.value
    }deg)`;
    ctx.drawImage(img, 0, 0, img.width, img.height);

    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'result.png';
    link.click();
  });

  img.src = imageElement.src;
};

saveButton.addEventListener('click', fileSaveHandler);

// Open file region
const fileButton = document.querySelector('.btn--upload');
const fileHandler = e => {
  const file = e.target.files[0];
  if (file.type && !file.type.startsWith('image/')) return;

  const reader = new FileReader();

  reader.addEventListener('load', el => {
    imageElement.src = el.target.result;
  });

  reader.readAsDataURL(file);
  document.querySelector('.btn--upload-file').value = null;
};

fileButton.addEventListener('change', fileHandler);

// Reset region
const reset = document.querySelector('.reset');

const resetFilter = () => {
  for (let property of Object.values(controlElements)) {
    if (property.dataset.output === 'saturate') property.value = 100;
    else property.value = 0;
    changeHandler(property);
  }
};

reset.addEventListener('click', resetFilter);

// Change inputs region
const changeHandler = e => {
  const elTarget = e instanceof MouseEvent ? e.target : e;
  const outputIndex = elTarget.dataset.output;
  const value = elTarget.value;
  const output = document.querySelector(`#${outputIndex}`);
  const unit = elTarget.dataset.units;
  output.innerHTML = value;

  document.documentElement.style.setProperty(`--${outputIndex}`, `${value}${unit}`);
};

const elementHandler = e => {
  const obj = e.target;
  obj.addEventListener('mousemove', changeHandler);
};

const removeListener = () => {
  for (let obj of Object.values(controlElements)) {
    obj.removeEventListener('mousemove', changeHandler);
  }
};

for (let obj of Object.values(controlElements)) {
  obj.addEventListener('mousedown', elementHandler);
}

document.addEventListener('mouseup', removeListener);

// Fullscreen region
const fullscreen = document.querySelector('.btn--fullscreen');

fullscreen.addEventListener('click', fullscreenHandler);

function fullscreenHandler(e) {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

// Change image from github
let pictureNumber = 1;
const next = document.querySelector('.btn--next');

const nextHandler = async () => {
  const currentDate = new Date().getHours();
  let time = '';

  if (currentDate < 6) {
    time = 'night';
  } else if (currentDate < 12) {
    time = 'morning';
  } else if (currentDate < 18) {
    time = 'day';
  } else if (currentDate < 24) {
    time = 'evening';
  }

  const response = await fetch(
    `https://raw.githubusercontent.com/rolling-scopes-school/stage1-tasks/assets/images/${time}/${
      pictureNumber < 10 ? '0' + pictureNumber++ : pictureNumber++
    }.jpg`
  )
    .then(response => (response.ok ? response.blob() : null))
    .then(blob => {
      const reader = new FileReader();
      reader.addEventListener('load', () => (imageElement.src = reader.result));
      reader.readAsDataURL(blob);
    })
    .catch(err => (pictureNumber = 1));
};

next.addEventListener('click', nextHandler);
