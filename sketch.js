new p5();

class Particle {
	constructor(x, y, size) {
		this.x = x;
		this.y = y;
		this.size = size;
		this.color = [0, 0, 0];
        this.colorvel = [0, 0, 0];
        this.active = false;
        this.visible = false;
        this.velx = 0;
        this.vely = 0;
        this.finx = -1;
        this.finy = -1;
        this.fincolor = [-1,-1,-1];
        this.transitionTime = 20;
	}
    update() {
        if(this.active){
            this.x += this.velx;
            this.y += this.vely;
            for(let i = 0; i < 3; i++){
                this.color[i] += this.colorvel[i];
            }
        }
    }
    givedestination(finx, finy, color){
        let t = this.transitionTime+Math.floor(finx/80);
        this.velx = (finx - this.x)/t;
        this.vely = (finy - this.y)/t;
        for(let i = 0; i < 3; i++){
            this.colorvel[i] = (color[i] - this.color[i])/t;
        }
        this.finx = finx;
        this.finy = finy;
    }
    checkdestination(){
        let threshold = 0.1;
        if(Math.abs(this.x-this.finx) < threshold && Math.abs(this.y-this.finy) < threshold){
            this.x = this.finx;
            this.y = this.finy;
            this.active = false;
        }
    }
	draw() {
        if(this.visible){
            push();
            noStroke();
            fill(this.color[0], this.color[1], this.color[2]);
            square(this.x, this.y, this.size);
            pop();
        }
	}
}

class Text {
    constructor(t, x, y, size, textSpeed){
        this.x = x;
        this.y = y;
        // this.maxLen = maxLen
        this.size = size;
        this.t = t;
        this.current = "";
        this.currentIndex = 0;
        this.active = false;
        this.textSpeed = textSpeed;
    }
    update() {
        if(this.active && frameCount % this.textSpeed == 0 && this.currentIndex != this.t.length){
            this.current += this.t[this.currentIndex];
            this.currentIndex += 1;
        }
    }
    draw(){
        textFont(font);
        textAlign(CENTER, CENTER);
        textSize(this.size);
        textWrap(WORD);
        fill("white");
        text(this.current, this.x, this.y);
    }
}

class Balloon {
    constructor(color, x, y){
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = 10;
        this.active = false;
    }
    update(){
        if(this.active){
            this.y -= this.speed;
        }
    }
}

let font;
let particles = [];
let balloons = [];
let spinnies = [];
let spinnyImages = new Array(5);
let balloonCount = 50;
let balloonImages = new Array(balloonCount);
let particleSize = 8;
let playImage;
let playImageOn;
let playImageOff;
let nextImage;
let nextImageOn;
let nextImageOff;
let nextImageWidth = 100;
let nextImageHeight = 100;
let playing = false;

let textboxes = [
    new Text("HAPPY BIRTHDAY JADEEEEEEEEEEEEEEEEEEEEEEEEEEE", windowWidth/2, windowHeight/2, 150, 5),
    new Text("woah woah woah there", windowWidth/2, windowHeight/2, 150, 5),
    new Text("you look really pretty rn", windowWidth/2, windowHeight/10, 100, 1),
    new Text("i hope the most beautiful girl", windowWidth/2, windowHeight/10, 100, 1),
    new Text("will have the most amazing birthday", windowWidth/2, windowHeight/10, 100, 1),
    new Text("although we don't have many photos together", windowWidth/2, windowHeight/2, 100, 5),
    new Text("i love the ones we do have", windowWidth/2, windowHeight/10, 100, 1),
    new Text("because they remind me of how happy i am with you", windowWidth/2, windowHeight/10, 90, 1),
    new Text("you're the best person who's ever walked into my life", windowWidth/2, windowHeight/10, 90, 1),
    new Text("i love you so much babe", windowWidth/2, windowHeight/10, 100, 1),
    new Text("happy birthday my love <333", windowWidth/2, windowHeight/2, 150, 5),
];

let slides = [-1,-1,0,1,2,-1,3,4,5,6,-1];

let currentSlide = 0;

let imageCount = 7;
let images = new Array(imageCount);
let pixelations = new Array(imageCount);
let camLoaded = false;
let imageWidth = 800;
let imageHeight = 600;
let capture;

function randnum(min, max){
    return Math.floor(Math.random()*(max-min))+min;
}

function pixelate(image){
    let pixels = [];
    for(let i = 0; i < image.width; i += particleSize){
        pixels.push([]);
        for(let j = 0; j < image.height; j += particleSize){
            pixels[i/particleSize].push([image.get(i,j)[0], image.get(i,j)[1], image.get(i,j)[2]]);
        }
    }
    return pixels;
}

function preload() {
    font = loadFont('munro.ttf');
    playImageOn = loadImage('playbuttonon.png');
    playImageOff = loadImage('playbuttonoff.png');

    nextImageOn = loadImage('nextbuttonon.png');
    nextImageOff = loadImage('nextbuttonoff.png');

    for (let i = 1; i < imageCount; i++) {
        images[i] = loadImage('jade' + i.toString() + '.png');
    }
    
    for(let i = 0; i < balloonCount; i++){
        let randind = randnum(1,6);
        balloonImages[i] = loadImage('balloon' + randind.toString() + '.png');
    }

    for(let i = 0; i < 5; i++){
        spinnyImages[i] = loadImage('spinny' + (i+1).toString() + '.png');
    }
}

function setup() {
	width = windowWidth;
	height = windowHeight;
    playImage = playImageOff;
    nextImage = nextImageOff;

    capture = createCapture(VIDEO);
    capture.hide();

    for(let i = 1; i < imageCount; i++){
        images[i].resize(0, imageHeight);
        images[i] = images[i].get(images[i].width/2-imageWidth/2,0,imageWidth,imageHeight);
        pixelations[i] = pixelate(images[i]);
    }

    for(let i = 0; i < pixelations[1].length; i++){
        particles.push([]);
        for(let j = 0; j < pixelations[1][1].length; j++){
            particles[particles.length-1].push(new Particle(width/2-imageWidth/2+i*particleSize, height/2-imageHeight/2+j*particleSize, particleSize));
        }
    }

    for(let i = 0; i < balloonCount; i++){
        balloons.push(new Balloon(i, randnum(0,width), randnum(height+200, 2*height+200)));
    }

    for(let i = 0; i < 5; i++){
        spinnyImages[i].resize(300, 0);
        if(i == 3 || i == 4){
            spinnyImages[i].resize(100, 0);
        }
    }

    spinnies[0] = [width/8,height/3];
    spinnies[1] = [width*9/10,height/3];
    spinnies[2] = [width/8,height*7/8];
    spinnies[3] = [width*7/8, height*5/6];
    spinnies[4] = [width*7/8-spinnyImages[3].width, height*5/6];

	createCanvas(windowWidth, windowHeight);
    
	frameRate(60);
}

function draw() {
    // console.log(balloonImages[0].get(50,50)[0]);
    if(!camLoaded || images[0].get(0,0)[0] == 0){
        images[0] = capture.get();
        images[0].resize(0, imageHeight);
        images[0] = images[0].get(images[0].width/2-imageWidth/2,0,imageWidth,imageHeight);
        pixelations[0] = pixelate(images[0]);
        camLoaded = true;

        if(images[0].get(0,0)[0] != 0){
            capture.remove();
        }
    }

    background("#7B8D6A");

    if(inBox(mouseX, mouseY, width/2-playImage.width/2, height/2-playImage.height/2, playImage.width, playImage.height)){
        playImage = playImageOn;
    }
    else{
        playImage = playImageOff;
    }
    
    if(playing){
        textboxes[currentSlide].update();
        textboxes[currentSlide].draw();
        
        for(let i = 0; i < particles.length; i++){
            for(let j = 0; j < particles[0].length; j++){
                particles[i][j].update();
                particles[i][j].draw();
                particles[i][j].checkdestination();
            }
        }

        for(let i = 0; i < balloons.length; i++){
            balloons[i].update();
            image(balloonImages[i], balloons[i].x, balloons[i].y);
        }

        if(inBox(mouseX, mouseY, width/2-nextImageWidth/2, height*7/8-nextImageHeight/2, nextImageWidth, nextImageHeight)){
            nextImage = nextImageOn;
        }
        else{
            nextImage = nextImageOff;
        }
        imageMode(CENTER);
        image(nextImage, width/2, height*7/8, nextImageWidth, nextImageHeight);

        for(let i = 0; i < 5; i++){
            push();
            translate(spinnies[i][0], spinnies[i][1]);
            imageMode(CENTER);
            if(slides[currentSlide] >= 0){
                rotate(frameCount);
            }
            else{
                rotate(frameCount/5);
            }
            image(spinnyImages[i], 0, 0);
            translate(-spinnies[i][0], -spinnies[i][1]);
            pop();
        }
    }
    else{
        imageMode(CENTER);
        image(playImage, width/2, height/2);
    }
}

function inBox(x, y, xb, yb, w, h){
    return xb < x && x < (xb + w) && yb < y && y < (yb + h);
}

function mousePressed() {
	if(inBox(mouseX, mouseY, width/2-playImage.width/2, height/2-playImage.height/2, playImage.width, playImage.height)){
        playing = true;
        textboxes[0].active = true;
    }

    if(inBox(mouseX, mouseY, width/2-nextImageWidth/2, height*7/8-nextImageHeight/2, nextImageWidth, nextImageHeight) && currentSlide + 1 != slides.length){
        textboxes[currentSlide].active = false;
        textboxes[currentSlide+1].active = true;
        if(slides[currentSlide+1] != -1){
            let index = [];
            for(let i = 0; i < particles.length; i++){
                index.push([]);
                for(let j = 0; j < particles[0].length; j++){
                    particles[i][j].visible = true;
                    particles[i][j].active = true;
                    index[index.length-1].push([i,j]);
                }
            }

            for(let i = 0; i < index.length; i++){
                for(let j = 0; j < index[0].length; j++){
                    r1 = randnum(0,index.length);
                    r2 = randnum(0,index[0].length);
                    let tmp = index[i][j];
                    index[i][j] = index[r1][r2];
                    index[r1][r2] = tmp;
                }
            }

            for(let i = 0; i < index.length; i++){
                for(let j = 0; j < index[i].length; j++){
                    particles[i][j].givedestination(width/2-imageWidth/2+index[i][j][0]*particleSize,height/2-imageHeight/2+index[i][j][1]*particleSize, pixelations[slides[currentSlide+1]][index[i][j][0]][index[i][j][1]]);
                }
            }
        }
        else{
            for(let i = 0; i < particles.length; i++){
                for(let j = 0; j < particles[0].length; j++){
                    particles[i][j].visible = false;
                    particles[i][j].active = false;
                }
            }

            if(currentSlide + 1 == slides.length-1){
                for(let i = 0; i < balloons.length; i++){
                    balloons[i].active = true;
                }
            }
        }
        currentSlide += 1;
    }
}

function windowResized() {
	setup();
}
