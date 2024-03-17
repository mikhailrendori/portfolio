document.querySelector('#back').onclick = rewindBack;
document.querySelector('#play').onclick = playNpause;
document.querySelector('#forward').onclick = rewindForward;
document.querySelector('#volume').oninput = videoVolume;
document.querySelector('#mute').onclick = mute_unmute;
document.querySelector('#info').onclick = handleInfoButtonClick;
document.querySelector('#full').onclick = toggleFullScreen;

let display, text;
let playing = false, isMediaInfoVisible = false, flag = false, isFullScreen = false;
let lastVolume = 1, lastResolution = '1080p';
let timeout, timer, timerForSettings, timerForPoiner;
let InaccuracyY = 80;
let imdbId = 'tt0499549'; // Сейчас стоит id фильма Аватар

let closeIcon = document.querySelector('#closeIcon');
let Full = document.querySelector('#full-icon');
let mediaInfoWindow = document.querySelector('#media-info-window');
let currentResolution = document.querySelector('#currentResolution');
let volumeSliderContainer = document.querySelector('#volumeSliderContainer')
let muteButton = document.querySelector('#mute');
let videoContainer = document.querySelector('#videoContainer');
let panel = document.querySelector('.panel');
let imgmute = document.querySelector('#imgmute');
let videoQuality = document.querySelector('#videoQuality');
let videoSource = document.querySelector('#videoSource');
let videoSource1 = document.querySelector('#videoSource-1');
let videoSource2 = document.querySelector('#videoSource-2');
let tooltip = document.querySelector('#tooltip');
let videoDuration = document.querySelector('#duration');
let currTime = document.querySelector('#curr-time');
let video = document.querySelector('#video-player');
let progressPointer = document.querySelector('#progress-pointer');
let bufferProgress = document.querySelector('#buffer-progress');
let progress = document.querySelector('#progress');
let progressContainer = document.querySelector('#progress-container');
let logTextarea = document.querySelector('#logTextarea');
let logContainer = document.querySelector('#logContainer');

progressContainer.onclick = videoRewind;

progressContainer.addEventListener('mouseover', handleMouseOver);
progressContainer.addEventListener('mouseout', handleMouseOut);
videoSource.addEventListener('change', changeSource);
videoQuality.addEventListener('click', changeQuality);
video.addEventListener('timeupdate', progressUpdate);
video.addEventListener('progress', progressUpdate);
videoContainer.addEventListener('click', ClearTimer);
videoContainer.addEventListener('input', ClearTimer);

video.addEventListener('seeked', function () {
  progressUpdate();
});

logContainer.appendChild(logTextarea);

video.addEventListener('canplay', logEvent);
video.addEventListener('play', logEvent);
video.addEventListener('pause', logEvent);
video.addEventListener('ended', logEvent);
video.addEventListener('waiting', logEvent);
video.addEventListener('seeked', logEvent);

document.addEventListener("keydown", function (event) {
  if (event.keyCode === 13) {
    playNpause();
  }
  if (event.keyCode === 39) {
    rewindForward();
  }
  if (event.keyCode === 37) {
    rewindBack();
  }
  if (event.keyCode === 40) {
    if (videoSource.value !== 'http://185.5.249.225/user_m/Avatar2_1080p.mp4') {
      const eventChange = new Event('change');
      videoSource.value = videoSource2.value;
      videoSource.dispatchEvent(eventChange);
    }
  }
  if (event.keyCode === 38) {
    if (videoSource.value !== 'http://185.5.249.225/user_m/Avatar_1080p.mp4') {
      const eventChange = new Event('change');
      videoSource.value = videoSource1.value;
      videoSource.dispatchEvent(eventChange);
    }
  }
},
  false
);

function ClearTimer() { // Очистка таймера исчезновения панели
  clearTimeout(timeout);
  progressUpdate;
};

function playNpause() { // play-and-pause
  if (!playing) {
    video.play();
    playing = true;
  }
  else {
    video.pause();
    playing = false;
  }
}

function rewindBack() { // Перемотка назад
  video.currentTime -= 10;
  progressUpdate();
}

function rewindForward() { // Перемотка вперед
  video.currentTime += 10;
  progressUpdate();
}

function videoVolume() { // Регулировка звука
  video.volume = this.value / 100;
  lastVolume = video.volume;
  if (video.volume == 0)
    imgmute.src = "img/mute.png";
  else if (video.volume <= 0.5)
    imgmute.src = "img/soundhalf.png";
  else imgmute.src = "img/sound.png";
}

function mute_unmute() { // Кнопка включения/выключения громкости
  if (video.volume != 0) {
    video.volume = 0;
    volume.value = 0;
  }
  else if (lastVolume != 0) {
    video.volume = lastVolume;
    volume.value = lastVolume * 100;
  }
  else {
    lastVolume = 1;
    video.volume = lastVolume;
    volume.value = lastVolume * 100;
  }


  if (video.volume == 0)
    imgmute.src = "img/mute.png";
  else if (video.volume <= 0.5)
    imgmute.src = "img/soundhalf.png";
  else imgmute.src = "img/sound.png";
}

function videoTime(time) { // Рассчитываем время в HH:MM:SS
  time = Math.floor(time);
  let minutes = Math.floor(time / 60);
  let seconds = Math.floor(time - minutes * 60);
  let hours = Math.floor(minutes / 60);
  let hoursVal = hours;
  let minutesVal = minutes;
  let secondsVal = seconds;
  if (hours < 10) {
    hoursVal = '0' + hours;
  }
  if (minutes < 10) {
    minutesVal = '0' + minutes;
  }
  if (seconds < 10) {
    secondsVal = '0' + seconds;
  }
  return hoursVal + ":" + minutesVal + ':' + secondsVal;
}

function videoRewind() { // Перемотка видео кликом по progress-bar
  let mouseX = event.offsetX;
  let progressbar = mouseX / (progressContainer.offsetWidth / 100);
  progress.style.width = progressbar + '%';
  video.currentTime = video.duration * (progressbar / 100);
}

function progressUpdate() { // Отображаем время воспроизведения и буфферизацию
  if (isFinite(video.duration)) {
    let buffered = 0;

    for (let i = 0; i < video.buffered.length; i++) {
      buffered = Math.max(buffered, video.buffered.end(i));
    }

    progress.style.width = (video.currentTime * 100 / video.duration) + "%";
    bufferProgress.style.width = (buffered / video.duration) * 100 + "%";

    currTime.innerHTML = videoTime(video.currentTime);
    videoDuration.innerHTML = videoTime(video.duration);
  }
}

function changeSource(event) { // Смена источника видео
  let selectedSource = event.target.value;

  currentResolutionChange('1920x1080');
  lastResolution = '1080p';
  if (playing) {
    playNpause();
  }

  video.src = selectedSource;

  progressUpdate;

  if (isMediaInfoVisible) {
    MediaInfoClose();
  }

  // Очищаем предыдущие значения в videoQuality
  videoQuality.innerHTML = "";

  // Создаем новые элементы для videoQuality в зависимости от выбранного videoSource
  if (videoSource.value === "http://185.5.249.225/user_m/Avatar_1080p.mp4") {
    logOtherEvent('Changing the video source to Avatar (trailer)');
    logOtherEvent('Video resolution set: width 1920px, height 1080px');
    imdbId = 'tt0499549';

    var highQualityOption = document.createElement("li");
    highQualityOption.innerHTML = '<a class="dropdown-item avatar1-quality" value="http://185.5.249.225/user_m/Avatar_1080p.mp4">High</a>';
    videoQuality.appendChild(highQualityOption);

    var mediumQualityOption = document.createElement("li");
    mediumQualityOption.innerHTML = '<a class="dropdown-item avatar1-quality" value="http://185.5.249.225/user_m/Avatar_720p.mp4">Medium</a>';
    videoQuality.appendChild(mediumQualityOption);

    var lowQualityOption = document.createElement("li");
    lowQualityOption.innerHTML = '<a class="dropdown-item avatar1-quality" value="http://185.5.249.225/user_m/Avatar_480p.mp4">Low</a>';
    videoQuality.appendChild(lowQualityOption);
  }
  else if (videoSource.value === "http://185.5.249.225/user_m/Avatar2_1080p.mp4") {
    logOtherEvent('Changing the video source to Avatar2 (trailer)');
    logOtherEvent('Video resolution set: width 1920px, height 1080px');
    imdbId = 'tt1630029';

    var highQualityOption = document.createElement("li");
    highQualityOption.innerHTML = '<a class="dropdown-item avatar2-quality" value="http://185.5.249.225/user_m/Avatar2_1080p.mp4">High</a>';
    videoQuality.appendChild(highQualityOption);

    var mediumQualityOption = document.createElement("li");
    mediumQualityOption.innerHTML = '<a class="dropdown-item avatar2-quality" value="http://185.5.249.225/user_m/Avatar2_720p.mp4">Medium</a>';
    videoQuality.appendChild(mediumQualityOption);

    var lowQualityOption = document.createElement("li");
    lowQualityOption.innerHTML = '<a class="dropdown-item avatar2-quality" value="http://185.5.249.225/user_m/Avatar2_480p.mp4">Low</a>';
    videoQuality.appendChild(lowQualityOption);
  }
};

function changeQuality(event) { // Смена качества изображения
  if (event.target.tagName === 'A') {

    let selectedQuality = event.target.getAttribute('value');

    const quality = selectedQuality.match(/(\d+p)/);
    if (quality[0] === '1080p' && lastResolution != '1080p') {
      logOtherEvent('Video resolution set: width 1920px, height 1080px');
      currentResolutionChange('1920x1080');
    }
    else if (quality[0] === '720p' && lastResolution != '720p') {
      logOtherEvent('Video resolution set: width 1280px, height 720px');
      currentResolutionChange('1280x720');
    }
    else if (quality[0] === '480p' && lastResolution != '480p') {
      logOtherEvent('Video resolution set: width 854px, height 480px');
      currentResolutionChange('854x480');
    }
    else {
      return;
    }

    lastResolution = quality[0];

    if (playing) {
      playNpause();
      flag = 1;
    }
    let c = video.currentTime;

    video.src = selectedQuality;

    video.load();

    video.currentTime = c;
    progressUpdate;


    video.addEventListener('loadeddata', function () {
      if (flag) {
        playNpause();
        flag = 0;
      }
    });
  }
}

function handleMouseOver(event) { // Расчет положения tooltip и progressPointer

  progressContainer.addEventListener('mousemove', handleMouseMove);

  function handleMouseMove(event) {
    let mouseX = event.offsetX;
    let progressbar = mouseX / (progressContainer.offsetWidth / 100);
    let seekTime = video.duration * (progressbar / 100)
    if (seekTime < 0)
      seekTime = 0;
    tooltip.textContent = videoTime(seekTime);

    // tooltip
    const videoRect = videoContainer.getBoundingClientRect();
    const progressRect = progressContainer.getBoundingClientRect();
    const progressLeft = progressRect.left + window.scrollX;
    const progressTop = progressRect.top + window.scrollY;
    let tooltipLeft = progressLeft + (event.clientX - progressRect.left) - videoRect.left - 24;
    let tooltipTop = progressTop - tooltip.offsetHeight - InaccuracyY;
    tooltip.style.left = `${tooltipLeft}px`;
    tooltip.style.top = `${tooltipTop}px`;
    tooltip.style.display = 'block';
    // progressPointer
    const pointerRect = progressContainer.getBoundingClientRect();
    const pointLeft = pointerRect.left + window.scrollX;
    let pointerLeft = pointLeft + (event.clientX - pointerRect.left) - progressRect.left - 3;
    progressPointer.style.left = `${pointerLeft}px`;
    if (seekTime > 0.5)
      progressPointer.style.display = 'block';
  }
}

progressContainer.addEventListener('mouseleave', () => { // Исчезновение progressPoiner через 0.2 секунды, если на него не навелись
  // Устанавливаем таймер на 1 секунду
  timerForPoiner = setTimeout(() => {
    progressPointer.style.display = 'none';
  }, 200);
});

progressContainer.addEventListener('mouseover', () => { // Сбрасываем таймер, чтобы progressPoiner оставался видимым
  clearTimeout(timerForPoiner);
});

function handleMouseOut() {
  tooltip.style.display = 'none';
}

videoContainer.addEventListener('mousemove', function () { // Показываем панель при наведении на videoContainer
  clearTimeout(timeout); // Сбрасываем таймер при каждом движении мыши
  panel.classList.remove('hide-panel'); // Показываем панель
  timeout = setTimeout(function () {
    panel.classList.add('hide-panel'); // Скрываем панель через 3 секунды без движения мыши
    tooltip.style.display = 'none';
  }, 3000);
});

function toggleFullScreen() { // Включение/выключение Полноэкранного режима
  if (!isFullScreen) {
    Full.src = "img/minimize.png";
    InaccuracyY = 15;
    videoContainer.style.position = 'absolute';
    videoContainer.style.width = '100%';
    videoContainer.style.margin = '0';

    isFullScreen = true;
  }
  else {
    Full.src = "img/maximize.png";
    InaccuracyY = 80;
    videoContainer.style.position = 'relative';
    videoContainer.style.width = '90%';
    videoContainer.style.margin = '0px 5%';

    isFullScreen = false;
  }
}

muteButton.addEventListener('mouseover', () => { // Показываем slider при наведении на кнопку mute
  clearTimeout(timer); // Сбрасываем предыдущий таймер
  volumeSliderContainer.style.display = 'block';
});

muteButton.addEventListener('mouseleave', () => { // Исчезновение slider`а через 1 секунду, если на него не навелись
  // Устанавливаем таймер на 1 секунду
  timer = setTimeout(() => {
    volumeSliderContainer.style.display = 'none';
  }, 1000);
});

volumeSliderContainer.addEventListener('mouseover', () => { // Сбрасываем таймер, чтобы ползунок оставался видимым
  clearTimeout(timer);
});

volumeSliderContainer.addEventListener('mouseleave', () => { // Исчезновение slider`а моментально, если с него убрали курсор
  volumeSliderContainer.style.display = 'none';
});

function handleInfoButtonClick() { // Кнопка информации
  if (isMediaInfoVisible) {
    mediaInfoWindow.style.opacity = '0';
    isMediaInfoVisible = false;
  }
  else {
    fetchMediaInfo().then((info) => {
      displayMediaInfoWindow(info);
    });
  }
}

function MediaInfoClose() { // Скрытые окна с информацией о видео
  mediaInfoWindow.style.opacity = '0';
  isMediaInfoVisible = false;
}

function fetchMediaInfo() { //Запрос к omdbapi для получения информации

  const apiKey = '3715b88';

  const apiUrl = `http://www.omdbapi.com/?i=${imdbId}&apikey=${apiKey}`;

  return fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error('Ошибка при получении информации о медиа:', error);
    });
}

function displayMediaInfoWindow(info) { // Отображение информации о видео
  const infoWindowContent = `
    <button id="closeIcon"><img width="20px" src="img/close.png"></button>
    <h3>Media Info</h3><br><br>
    <p>Title: ${info.Title}</p>
    <p>Year: ${info.Year}</p>
    <p>Genre: ${info.Genre}</p>
    <p>Runtime: ${info.Runtime}</p>
    <p>Plot: ${info.Plot}</p>
  `;

  mediaInfoWindow.innerHTML = infoWindowContent;
  mediaInfoWindow.style.opacity = '1';
  isMediaInfoVisible = true;

  let closeIcon = document.getElementById("closeIcon");
  closeIcon.addEventListener("click", MediaInfoClose);
}

function getCurrentTime() { // Получаем время по МСК в формате HH:MM:SS.milliseconds
  const currentTime = new Date();
  currentTime.setHours(currentTime.getHours());

  let milliseconds = currentTime.getMilliseconds();
  let seconds = currentTime.getSeconds();
  let minutes = currentTime.getMinutes();
  let hours = currentTime.getHours();

  milliseconds = milliseconds.toString().padStart(3, '0');
  seconds = seconds.toString().padStart(2, '0');
  minutes = minutes.toString().padStart(2, '0');
  hours = hours.toString().padStart(2, '0');

  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

function logEvent(event) { // Функция для логирования стандартных event`ов видео
  const currentTime = getCurrentTime();
  const logMessage = `[${currentTime}] ${event.type}\n`;
  logTextarea.value += logMessage;
  logTextarea.scrollTop = logTextarea.scrollHeight;
}

function logOtherEvent(text) {
  const currentTime = getCurrentTime();
  const logMessage = `[${currentTime}] ${text}\n`;
  logTextarea.value += logMessage;
  logTextarea.scrollTop = logTextarea.scrollHeight;
}

function currentResolutionChange(text) { // Отображение информации о видео
  const currentResolutionText = `<p id="currentResolutionLabel">${text}</p>`;

  currentResolution.innerHTML = currentResolutionText;
}