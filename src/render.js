/*
 * 绘制不同速度，不同大小的下落的雪花们
 * 目前只有垂直下落，下一步拓展横向移动
 */
let isLoading = false
let soundFilePath = "../datas/Time will remember us.mp3"
let soundFileIndex = 0
let soundFile, amplitude, fft
let pow = 1, lastPow = 1
let freqDomain
//雪花的最大/最小直径
let maxDiameter = 40
let minDiameter = 15
//雪花最大旋转角速率
let maxAngularSpeed = 2 * Math.PI / 180
//雪花的最大/最小下落速率
let maxFallSpeed = 4.0
let minFallSpeed = 0.9
//雪花的最大/最小透明度
let maxAlpha = 180
let minAlpha = 30
//最大共存雪花数量
let maxSnowCount = 50
//存放现存雪花
let snows = []
let waves = []
//背景图片
let img, mouse, centerImg

let hasWind = true
let centerMouse = false
let windX = 0, windY = 0
let randomWindXMax = 0.32, randomWindYMax = 0.1
let isPaused = false

let fftRadius = 90

function preload() {
    soundFormats('mp3', 'ogg');
    if (menuInfo !== undefined) {
        soundFilePath = menuInfo[soundFileIndex].path
    }
    soundFile = new loadSound(soundFilePath);
    img = loadImage("../datas/background_m.jpg")
    mouse = loadImage("../datas/fan.png")
    centerImg = loadImage("../datas/center.png")
}

/**
 * 准备工作
 */
function setup() {
    updateMenu()
    //fullScreen(); //全屏
    createCanvas(1186, 806);
    //不要边框
    noStroke();
    //获取背景图片，以下为版权信息
    // Photo on <a href="https://visualhunt.com/re6/7f9b17a0">VisualHunt.com</a>
    image(img, 0, 0, 1186, 806)
    noCursor()
    textSize(40)
    amplitude = new p5.Amplitude()
    fft = new p5.FFT()
    soundFile.play()
}

/**
 * 循环方法
 */
function draw() {
    //刷新背景
    image(img, 0, 0, 1186, 806)

    if (isLoading) {
        push()
        let time = millis()
        translate(width / 2, height / 3)
        rotate(time / 1000)
        text('loading...', 0, 0)
        if (waves.length<2) {
            waves.push(new ShockWave(width / 2, height / 3, random(20)))
        }
        pop()
        if (soundFile.isLoaded()) {
            soundFile.play()
            isLoading = false
        }
    } else if (!soundFile.isLooping() && !soundFile.isPlaying()) {
        soundFileIndex = (soundFileIndex + 1) % menuInfo.length;
        soundFilePath = menuInfo[soundFileIndex].path
        soundFile = loadSound(soundFilePath)
        isLoading = true
    }

    lastPow = pow
    pow = amplitude.getLevel()
    freqDomain = fft.analyze()
    randomWindXMax = pow * 8
    randomWindYMax = pow * 0.4
    maxSnowCount = parseInt(pow * 120)
    if (frameCount % 15 === 0 || Math.abs(movedX) > 5 || Math.abs(movedY) > 5) {
        //风力
        windX = windX * 0.5 + movedX * 0.02 + random(-randomWindXMax, randomWindXMax)
        //倾向于下落
        windY = windY * 0.5 + movedY * 0.02 + random(-randomWindYMax * 0.7, randomWindYMax * 1.3)
    } else {
        windX *= 0.92
        windY *= 0.92
    }

    push()
    translate(width / 2, height / 3)
    colorMode(HSB, 255, 100, 100)
    let detAngle = radians(360 / 255)
    for (let i = 0; i < 255; i++) {
        fill((i+70)%255, 45, 70)
        let p = Math.pow(freqDomain[i], 0.8) * 3 + 2
        rect(0, fftRadius, TWO_PI * fftRadius / 255, p)
        rotate(detAngle)
    }
    if(!isLoading) {
        rotate(radians(frameCount * 5))
        image(centerImg, -fftRadius, -fftRadius, fftRadius * 2, fftRadius * 2)
    }
    pop()

    let power = pow / lastPow
    if (power > 1.7&&waves.length<2) {
        waves.push(new ShockWave(width / 2, height / 3, power * 10))
    }

    let mouseSpeed = sqrt(windX * windX + windY * windY)
    let mouseRadius = map(mouseSpeed, 0, 10, 30, 100)
    push()
    translate(mouseX, mouseY)
    // translate(mouseX-mouseRadius/2,mouseY-mouseRadius/2)
    if (hasWind)
        rotate(radians((windX + windY) * frameCount)*2)
    circle()
    image(mouse, -mouseRadius / 2, -mouseRadius / 2, mouseRadius, mouseRadius)
    pop();

    //
    if (frameCount % 2 === 0 && snows.length < maxSnowCount && random(1) < 0.4) {
        snows.push(new Snow())
    }
    fill(0, 0, 0)
    //更新各种位置数值
    for (let i in snows) {
        if (snows[i].update()) {
            snows.splice(i, 1)
        }
    }
    //绘制所有雪花
    for (let i in snows) {
        snows[i].redraw()
    }

    for (let i in waves) {
        if(waves[i].redraw())
            waves.splice(i,1)
    }
}

function keyPressed() {
    switch (key) {
        case ' ':
            if (isPaused) {
                noCursor()
                loop()
                soundFile.play()
            } else {
                cursor()
                noLoop()
                soundFile.pause()
            }
            isPaused = !isPaused
            break;
        case 'c':
        case 'C':
            centerMouse = !centerMouse
            break
        case 'w':
        case 'W':
            hasWind = !hasWind
            break
    }
}

function mousePressed() {
    snows.push(new Snow({x: mouseX, y: mouseY}))
    return false
}