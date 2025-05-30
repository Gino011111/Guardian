let cam;
let paddleX;
let paddleW = 80;
let paddleH = 20;
let ballX, ballY, ballR = 20;
let ballSpeed = 5;
let score = 0;
let gameOver = false;
let gameTime = 20;
let startTime;
let hitSound; // 新增音效變數

function preload() {
  // 嘗試載入音效，若失敗則 hitSound 為 null
  try {
    hitSound = loadSound('hit.mp3');
  } catch (e) {
    hitSound = null;
  }
}

function setup() {
  createCanvas(500, 500);
  cam = createCapture(VIDEO);
  cam.size(width, height);
  cam.hide();
  resetBall();
  startTime = millis();
}

function draw() { // 主循環
  background(220);
// 預載入音效

  if (gameOver) {
    fill(0);
    textSize(36);
    textAlign(CENTER, CENTER);
    text("遊戲結束\n分數: " + score + "\n按空白鍵重新開始", width / 2, height / 2);
    return;
  }

  // 鏡頭畫面
  push();
  translate(width, 0);
  scale(-1, 1);
  image(cam, 0, 0, width, height);
  pop();

  // 偵測藍色物體
  cam.loadPixels();
  let blueX = 0, blueCount = 0;
  for (let y = 0; y < cam.height; y += 4) {
    for (let x = 0; x < cam.width; x += 4) {
      let i = 4 * (y * cam.width + x);
      let r = cam.pixels[i];
      let g = cam.pixels[i + 1];
      let b = cam.pixels[i + 2];
      if (b > 120 && b > r * 1.5 && b > g * 1.5) {
        blueX += x;
        blueCount++;
      }
    }
  }
  if (blueCount > 0) {
    blueX = blueX / blueCount;
    paddleX = map(width - blueX, 0, width, 0, width - paddleW);
  } else {
    // 沒偵測到藍色，板子維持原位
    if (paddleX === undefined) paddleX = width / 2 - paddleW / 2;
  }

  // 畫出藍色板子
  fill(0, 100, 255, 180);
  noStroke();
  rect(paddleX, height - paddleH - 10, paddleW, paddleH, 10);

  // 畫出紅色球
  fill(255, 0, 0);
  ellipse(ballX, ballY, ballR * 2);

  // 球掉落
  ballY += ballSpeed;

  // 檢查碰撞
  if (
    ballY + ballR > height - paddleH - 10 &&
    ballX > paddleX &&
    ballX < paddleX + paddleW
  ) {
    score++;
    // 播放音效時加上判斷
    if (hitSound && typeof hitSound.play === "function" && hitSound.isLoaded()) {
      hitSound.play();
    }
    resetBall();
    // 分數越高球速越快
    ballSpeed = 5 + score * 0.5;
  }

  // 球掉到底沒接到
  if (ballY - ballR > height) {
    gameOver = true;
  }

  // 顯示分數
  fill(0);
  textSize(24);
  textAlign(LEFT, TOP);
  text("分數: " + score, 20, 20);

  // 顯示倒數計時
  let timeLeft = gameTime - int((millis() - startTime) / 1000);
  textSize(24);
  textAlign(RIGHT, TOP);
  text("剩餘: " + timeLeft + "秒", width - 20, 20);

  if (timeLeft <= 0) {
    gameOver = true;
  }
}

function resetBall() {
  ballX = random(40, width - 40);
  ballY = -20;
}

function keyPressed() {
  if (gameOver && key === ' ') {
    score = 0;
    ballSpeed = 5;
    gameOver = false;
    startTime = millis();
    resetBall();
  }
}