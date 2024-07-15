// 실제 시간 재생
function updateTime() {
  const timeText = document.getElementById("timeText");
  if (timeText) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    timeText.textContent = `${hours}:${minutes}:${seconds}`;
  }
}

updateTime();
setInterval(updateTime, 1000);

// 헤더 오디오 작업
const visualizerCanvas = document.getElementById("visualizer");
const visualizerCtx = visualizerCanvas.getContext("2d");
const playPauseBtn = document.getElementById("playPause");
const repeatBtn = document.getElementById("repeat");
const audioElement = document.getElementById("audioElement");

let audioContext, analyser, source, dataArray, bufferLength;
let isPlaying = false;

// 캔버스의 크기를 CSS에 맞게 설정
if (visualizerCanvas) {
  visualizerCanvas.width = visualizerCanvas.clientWidth;
  visualizerCanvas.height = visualizerCanvas.clientHeight;
}

function initAudio() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser.fftSize = 2048;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  source = audioContext.createMediaElementSource(audioElement);
  source.connect(analyser);
  analyser.connect(audioContext.destination);
}

function drawWaveform() {
  requestAnimationFrame(drawWaveform);

  if (audioContext) {
    analyser.getByteTimeDomainData(dataArray);
  } else {
    for (let i = 0; i < bufferLength; i++) {
      dataArray[i] = 128;
    }
  }

  visualizerCtx.fillStyle = "rgb(0, 0, 0)";
  visualizerCtx.fillRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);

  visualizerCtx.lineWidth = 2;
  visualizerCtx.strokeStyle = "rgb(255, 255, 255)";
  visualizerCtx.beginPath();

  const sliceWidth = (visualizerCanvas.width * 1.0) / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * visualizerCanvas.height) / 2;

    if (i === 0) {
      visualizerCtx.moveTo(x, y);
    } else {
      visualizerCtx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  visualizerCtx.lineTo(visualizerCanvas.width, visualizerCanvas.height / 2);
  visualizerCtx.stroke();
}

if (bufferLength === undefined) {
  bufferLength = 1024;
}
dataArray = new Uint8Array(bufferLength).fill(128);

drawWaveform();

playPauseBtn.addEventListener("click", () => {
  if (!audioContext) {
    initAudio();
  }

  if (isPlaying) {
    audioElement.pause();
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
  } else {
    audioElement.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
  }
  isPlaying = !isPlaying;
});

repeatBtn.addEventListener("click", () => {
  audioElement.currentTime = 0;
  if (!isPlaying) {
    audioElement.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    isPlaying = true;
  }
});

audioElement.addEventListener("ended", () => {
  isPlaying = false;
  playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
});

// 피드 달력 작업
function createCalendar() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const today = date.getDate();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  let calendarHTML = `
        <table>
            <thead>
                <tr>
                    <th colspan="7">${monthNames[month]} ${year}</th>
                </tr>
                <tr>
                    <th>Sun</th>
                    <th>Mon</th>
                    <th>Tue</th>
                    <th>Wed</th>
                    <th>Thu</th>
                    <th>Fri</th>
                    <th>Sat</th>
                </tr>
            </thead>
            <tbody>
    `;

  let day = 1;
  for (let i = 0; i < 6; i++) {
    calendarHTML += "<tr>";
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDay) {
        calendarHTML += "<td></td>";
      } else if (day > daysInMonth) {
        calendarHTML += "<td></td>";
      } else {
        const isToday = day === today ? ' class="today"' : "";
        calendarHTML += `<td${isToday}>${day}</td>`;
        day++;
      }
    }
    calendarHTML += "</tr>";
    if (day > daysInMonth) {
      break;
    }
  }

  calendarHTML += `
            </tbody>
        </table>
    `;

  const calendarElement = document.querySelector(".calendar");
  if (calendarElement) {
    calendarElement.innerHTML = calendarHTML;
  }
}

document.addEventListener("DOMContentLoaded", createCalendar);

//레이더
const radarCanvas = document.getElementById("mycanvas");
const radarCtx = radarCanvas.getContext("2d");
const color_custom = "133, 160, 151"; // '85A097'에 해당하는 RGB 값

let ww = 300,
  wh = 300;
let center = { x: 150, y: 150 };

// 캔버스의 크기를 CSS에 맞게 설정
radarCanvas.width = ww;
radarCanvas.height = wh;

const getWindowSize = () => {
  center = { x: ww / 2, y: wh / 2 };
  radarCtx.setTransform(1, 0, 0, 1, 0, 0); // 이전 변환을 초기화합니다.
  radarCtx.translate(center.x, center.y);
};

getWindowSize();

window.addEventListener("resize", getWindowSize);

const enemies = Array(10)
  .fill({})
  .map(() => ({
    r: Math.random() * 100,
    deg: Math.random() * 360,
    opacity: 0,
  }));

setInterval(draw, 10);
let time = 0;
const deg_to_pi = Math.PI / 180;

const Point = (r, deg) => ({
  x: r * Math.cos(deg * deg_to_pi),
  y: r * Math.sin(deg * deg_to_pi),
});

const Color = (op) => `rgba(${color_custom},${op})`;

function draw() {
  radarCtx.clearRect(
    -center.x,
    -center.y,
    radarCanvas.width,
    radarCanvas.height
  ); // 이전 프레임을 지웁니다

  time += 1;
  const r = 100;
  const deg = time % 360;
  const line_deg_len = 50;

  radarCtx.strokeStyle = Color(1);

  // 레이더 스윕
  for (let i = 0; i < line_deg_len; i++) {
    const deg1 = (time - i) % 360;
    const point = Point(r, deg1);
    const opacity = 1 - i / line_deg_len;

    radarCtx.beginPath();
    radarCtx.fillStyle = Color(opacity);
    radarCtx.moveTo(0, 0);
    radarCtx.lineTo(point.x, point.y);
    radarCtx.arc(0, 0, r, deg1 * deg_to_pi, (deg1 + 1) * deg_to_pi);
    radarCtx.closePath();
    radarCtx.fill();
  }

  // 적들 그리기
  enemies.forEach((obj) => {
    const obj_point = Point(obj.r, obj.deg);

    radarCtx.fillStyle = Color(obj.opacity);
    radarCtx.beginPath();
    radarCtx.arc(obj_point.x, obj_point.y, 3, 0, 2 * Math.PI);
    radarCtx.fill();

    radarCtx.strokeStyle = Color(obj.opacity);
    const x_size = 3;
    radarCtx.lineWidth = 2;
    radarCtx.beginPath();
    radarCtx.moveTo(obj_point.x - x_size, obj_point.y - x_size);
    radarCtx.lineTo(obj_point.x + x_size, obj_point.y + x_size);
    radarCtx.moveTo(obj_point.x + x_size, obj_point.y - x_size);
    radarCtx.lineTo(obj_point.x - x_size, obj_point.y + x_size);
    radarCtx.stroke();

    if (Math.abs(obj.deg - deg) <= 1) {
      obj.opacity = 1;
      const messageElement = document.querySelector(".message");
      if (messageElement) {
        messageElement.innerHTML = `Detected: ${obj.r.toFixed(
          3
        )} ${obj.deg.toFixed(3)}`;
      }
    }
    obj.opacity *= 0.99;

    radarCtx.strokeStyle = Color(obj.opacity);
    radarCtx.lineWidth = 1;
    radarCtx.beginPath();
    radarCtx.arc(
      obj_point.x,
      obj_point.y,
      15 * (1 - (obj.opacity + 0.0001)),
      0,
      2 * Math.PI
    );
    radarCtx.stroke();
  });

  // 레이더 원형 눈금
  radarCtx.strokeStyle = Color(1);
  const split = 120;
  const feature = 15;
  const start_r = 115;
  let len = 5;

  for (let i = 0; i < split; i++) {
    radarCtx.beginPath();
    const deg = (i / split) * 360;

    if (i % feature === 0) {
      len = 10;
      radarCtx.lineWidth = 6; // 선 굵기를 6으로 증가
    } else {
      len = 5;
      radarCtx.lineWidth = 2; // 선 굵기를 2로 증가
    }

    const point1 = Point(start_r, deg);
    const point2 = Point(start_r + len, deg);

    radarCtx.moveTo(point1.x, point1.y);
    radarCtx.lineTo(point2.x, point2.y);

    radarCtx.stroke();
  }

  const drawCircle = (r, lineWidth, cond) => {
    radarCtx.lineWidth = lineWidth;
    radarCtx.strokeStyle = Color(1);
    radarCtx.beginPath();
    for (let i = 0; i <= 360; i++) {
      const point = Point(r, i);
      if (cond(i)) {
        radarCtx.lineTo(point.x, point.y);
      } else {
        radarCtx.moveTo(point.x, point.y);
      }
    }
    radarCtx.stroke();
  };

  drawCircle(150, 4, (deg) => (deg + time / 2) % 180 < 80); // 선 굵기를 4로 증가
  drawCircle(50, 2, (deg) => deg % 3 < 1); // 선 굵기를 2로 증가
  drawCircle(95, 2, (deg) => true); // 선 굵기를 2로 증가
}

//나침반
$(document).ready(function () {
  var box = $("#Spinner");
  var container = $(".compass-container");
  var boxCenter = [
    container.offset().left + container.width() / 2,
    container.offset().top + container.height() / 2,
  ];

  $(document).mousemove(function (e) {
    var angle =
      Math.atan2(e.pageX - boxCenter[0], -(e.pageY - boxCenter[1])) *
      (180 / Math.PI);

    box.css({ "-webkit-transform": "rotate(" + angle + "deg)" });
    box.css({ "-moz-transform": "rotate(" + angle + "deg)" });
    box.css({ transform: "rotate(" + angle + "deg)" });
  });
});

// 뮤직플레이어
document.addEventListener("DOMContentLoaded", function () {
  const audioFiles = ["./music/CustomMelody.mp3", "./music/Carmel Quartet.mp3"];
  const playlist = [{ title: "CustomMelody" }, { title: "Carmel Quartet" }];
  let currentTrack = 0;
  let isPlaying = false;

  const audio = new Audio();
  const playBtn = document.getElementById("playBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const playlistElement = document.getElementById("playlist-items");

  // 캔버스 및 오디오 컨텍스트 설정
  const canvas = document.getElementById("circularVisualizer");
  const ctx = canvas.getContext("2d");
  let audioContext, analyser, source;

  function initAudioContext() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
    }
  }

  function loadTrack(trackIndex) {
    audio.src = audioFiles[trackIndex];
    currentTrack = trackIndex;
    updateActiveTrack();
  }

  function playTrack() {
    initAudioContext();
    audio.play();
    isPlaying = true;
    playBtn.style.display = "none";
    pauseBtn.style.display = "inline-block";
    visualize();
  }

  function pauseTrack() {
    audio.pause();
    isPlaying = false;
    playBtn.style.display = "inline-block";
    pauseBtn.style.display = "none";
  }

  function updatePlaylist() {
    playlistElement.innerHTML = "";
    playlist.forEach((track, index) => {
      const li = document.createElement("li");
      li.textContent = track.title;
      li.addEventListener("click", () => {
        loadTrack(index);
        playTrack();
      });
      playlistElement.appendChild(li);
    });
  }

  function updateActiveTrack() {
    const items = playlistElement.getElementsByTagName("li");
    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove("active");
    }
    items[currentTrack].classList.add("active");
  }

  function visualize() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 10;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = "#566862";
      ctx.stroke();

      for (let i = 0; i < bufferLength; i++) {
        const rads = (Math.PI * 2) / bufferLength;
        const barHeight = dataArray[i] * 0.7;
        const x = centerX + Math.cos(rads * i) * radius;
        const y = centerY + Math.sin(rads * i) * radius;
        const xEnd = centerX + Math.cos(rads * i) * (radius + barHeight);
        const yEnd = centerY + Math.sin(rads * i) * (radius + barHeight);

        ctx.strokeStyle = "#85A097";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
      }
    }

    draw();
  }

  function drawInitialCircle() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#566862";
    ctx.stroke();
  }

  playBtn.addEventListener("click", playTrack);
  pauseBtn.addEventListener("click", pauseTrack);

  prevBtn.addEventListener("click", function () {
    currentTrack = (currentTrack - 1 + audioFiles.length) % audioFiles.length;
    loadTrack(currentTrack);
    if (isPlaying) playTrack();
  });

  nextBtn.addEventListener("click", function () {
    currentTrack = (currentTrack + 1) % audioFiles.length;
    loadTrack(currentTrack);
    if (isPlaying) playTrack();
  });

  audio.addEventListener("ended", function () {
    currentTrack = (currentTrack + 1) % audioFiles.length;
    loadTrack(currentTrack);
    playTrack();
  });

  // 초기 설정
  updatePlaylist();
  loadTrack(currentTrack);
  pauseBtn.style.display = "none";

  // 캔버스 크기 설정
  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetWidth; // 정사각형 유지
    drawInitialCircle();
  }

  // 초기 캔버스 크기 설정 및 리사이즈 이벤트 리스너 추가
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  drawInitialCircle();
});
