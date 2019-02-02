var AM = new AssetManager();

function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, scale) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.scale = scale;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    var scaleBy = this.scale;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.a = false;
    this.spritesheet = spritesheet;
    this.game = game;
    this.speed = 100;
    this.ctx = game.ctx;
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet, 0, 0, 1920, 1080, this.x, this.y, 1920, 1080);
};

Background.prototype.update = function () {
        this.x -= this.game.clockTick * this.speed;
    if (this.x < -600) this.x = 0;

};



function Robot(game, spritesheet) {
    this.runningAnimation = new Animation(spritesheet, 1701, 556, 567, 556, 0.2, 8, true, 0.4);
    this.slidingAnimation = new Animation(spritesheet, 2268, 1112, 567, 556, 0.1, 10, false, 0.4);
    this.jumpAnimation = new Animation(spritesheet, 0, 0, 567, 556, 0.1, 10, false, 0.4);
    this.jumping = false;
    this.speed = 200;
    this.ctx = game.ctx;
    this.radius = 100;
    this.ground = 650;
    Entity.call(this, game, 20, this.ground);
}

Robot.prototype = new Entity();
Robot.prototype.constructor = Robot;

Robot.prototype.update = function () {
    if (this.game.jump) this.jumping = true;

    if (this.game.slide) this.sliding = true;
    
    if (this.jumping) {
        if (this.jumpAnimation.isDone()) {
            this.jumpAnimation.elapsedTime = 0;
            this.jumping = false;
        }
        var jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
        var totalHeight = 200;

        if (jumpDistance > 0.5)
            jumpDistance = 1 - jumpDistance;

        var height = totalHeight*(-4 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = this.ground - height;
    }

    if (this.sliding) {
        if (this.slidingAnimation.isDone()) {
            this.slidingAnimation.elapsedTime = 0;
            this.sliding = false;
        }
    }

    
    Entity.prototype.update.call(this);
}

Robot.prototype.draw = function (ctx) {
    if (this.jumping) {
        this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x + 17, this.y - 34);
    } else if (this.sliding) {
        this.slidingAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else {
        this.runningAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    }
    Entity.prototype.draw.call(this);
}




AM.queueDownload("./img/background.png");
AM.queueDownload("./img/robot.png");




AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/background.png")));
    gameEngine.addEntity(new Robot(gameEngine, AM.getAsset("./img/robot.png")));
    
    
    

    console.log("All Done!");
});
