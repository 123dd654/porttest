// 실제 시간 재생
function updateTime() {
    const timeText = document.getElementById("timeText");
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    timeText.textContent = `${hours}:${minutes}:${seconds}`;
}

updateTime();
setInterval(updateTime, 1000);

// 피드 달력 작업
function createCalendar() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = date.getDate();

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

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
                const isToday = day === today ? ' class="today"' : '';
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

    const calendarElement = document.querySelector('.calendar');
    calendarElement.innerHTML = calendarHTML;
}

document.addEventListener('DOMContentLoaded', createCalendar);

// 레이더 작업
const radarCanvas = document.getElementById('mycanvas');
const radarCtx = radarCanvas.getContext('2d');
const color_gold = '185, 147, 98';

let ww = 300, wh = 300;
let center = { x: 150, y: 150 };

// 캔버스의 크기를 CSS에 맞게 설정
radarCanvas.width = ww;
radarCanvas.height = wh;

const getWindowSize = () => {
  center = { x: ww / 2, y: wh / 2 };
  radarCtx.setTransform(1, 0, 0, 1, 0, 0);  // 이전 변환을 초기화합니다.
  radarCtx.translate(center.x, center.y);
};

getWindowSize();

window.addEventListener('resize', getWindowSize);

const enemies = Array(10).fill({}).map(() => ({
  r: Math.random() * 100,
  deg: Math.random() * 360,
  opacity: 0
}));

setInterval(draw, 10);
let time = 0;
const deg_to_pi = Math.PI / 180;

const Point = (r, deg) => ({
  x: r * Math.cos(deg * deg_to_pi),
  y: r * Math.sin(deg * deg_to_pi)
});

const Color = (op) => `rgba(${color_gold},${op})`;

function draw() {
  radarCtx.clearRect(-center.x, -center.y, radarCanvas.width, radarCanvas.height);  // 이전 프레임을 지웁니다

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
  enemies.forEach(obj => {
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
      document.querySelector('.message').innerHTML = `Detected: ${obj.r.toFixed(3)} ${obj.deg.toFixed(3)}`;
    }
    obj.opacity *= 0.99;

    radarCtx.strokeStyle = Color(obj.opacity);
    radarCtx.lineWidth = 1;
    radarCtx.beginPath();
    radarCtx.arc(obj_point.x, obj_point.y, 15 * (1 - (obj.opacity + 0.0001)), 0, 2 * Math.PI);
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
    const deg = i / split * 360;

    if (i % feature === 0) {
      len = 10;
      radarCtx.lineWidth = 4;
    } else {
      len = 5;
      radarCtx.lineWidth = 1;
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

  drawCircle(150, 2, deg => (deg + time / 2) % 180 < 80);
  drawCircle(50, 1, deg => deg % 3 < 1);
  drawCircle(95, 1, deg => true);
}
