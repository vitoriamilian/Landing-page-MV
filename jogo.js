

const gameWidth = window.innerWidth;
const gameHeight = window.innerHeight;

let playerName = '';
let game;


function startGame() {
  const input = document.getElementById('playerNameInput');
  if (input.value.trim() !== '') {
    playerName = input.value.trim();
    document.getElementById('nameForm').style.display = 'none';
    game = new Phaser.Game(config);
  }
}

const config = {
  type: Phaser.AUTO,
  width: gameWidth,
  height: gameHeight,
   backgroundColor: '#000000', // FUNDO PRETO CHAPADO
    scene: {
        preload,
        create,
        update
    },
    physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

let ball, paddle, bricks, score = 0, scoreText, isGameOver = false;
let gameOverText;
let ranking = JSON.parse(localStorage.getItem('breakoutRanking')) || [];

function preload() {
  this.load.image('bg', 'assets/bg.jpeg');
  this.load.image('ball', 'assets/ball.png');
  this.load.image('paddle', 'assets/barra.png');
  this.load.image('brick', 'assets/brick.png');
  this.load.image('fundo', 'assets/fundo.png');
}

function create() {
  this.add.image(gameWidth / 2, gameHeight / 2, 'bg').setDisplaySize(gameWidth, gameHeight);
  this.add.image(400, 300, 'fundo').setDisplaySize(30000, 30000);


  paddle = this.physics.add.sprite(gameWidth / 2, gameHeight - 50, 'paddle').setImmovable(true).setScale(0.5);
  paddle.body.allowGravity = false;

  ball = this.physics.add.sprite(gameWidth / 2, gameHeight - 70, 'ball').setCollideWorldBounds(true).setBounce(1);
  ball.setVelocity(200, -200);

  bricks = this.physics.add.staticGroup();

  for (let y = 100; y < 300; y += 40) {
    for (let x = 100; x < gameWidth - 100; x += 80) {
      bricks.create(x, y, 'brick').setScale(0.5).refreshBody();
    }
  }

  this.physics.add.collider(ball, paddle, hitPaddle, null, this);
  this.physics.add.collider(ball, bricks, hitBrick, null, this);

  scoreText = this.add.text(20, 20, 'Pontuação: 0', {
    fontSize: '24px',
    fill: '#fff'
  });

  gameOverText = this.add.text(gameWidth / 2, gameHeight / 2, '', {
    fontSize: '48px',
    fill: '#ff0000'
  }).setOrigin(0.5);

  this.input.on('pointermove', function (pointer) {
    paddle.x = Phaser.Math.Clamp(pointer.x, paddle.width / 2, gameWidth - paddle.width / 2);
  }, this);

  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  if (isGameOver) return;

  if (cursors.left.isDown) {
    paddle.x -= 10;
  } else if (cursors.right.isDown) {
    paddle.x += 10;
  }

  paddle.x = Phaser.Math.Clamp(paddle.x, paddle.width / 2, gameWidth - paddle.width / 2);

  if (ball.y > gameHeight) {
    gameOver.call(this);
  }
}

function hitPaddle(ball, paddle) {
  let diff = 0;
  if (ball.x < paddle.x) {
    diff = paddle.x - ball.x;
    ball.setVelocityX(-10 * diff);
  } else if (ball.x > paddle.x) {
    diff = ball.x - paddle.x;
    ball.setVelocityX(10 * diff);
  } else {
    ball.setVelocityX(Phaser.Math.Between(-10, 10));
  }
}

function hitBrick(ball, brick) {
  brick.disableBody(true, true);
  score += 10;
  scoreText.setText('Pontuação: ' + score);

  if (bricks.countActive() === 0) {
    gameOver.call(this, true);
  }
}

function gameOver(won = false) {
  isGameOver = true;
  ball.setVelocity(0);
  gameOverText.setText(won ? 'Você Venceu!' : 'Game Over');

  ranking.push({ name: playerName, score });
  ranking.sort((a, b) => b.score - a.score);
  ranking = ranking.slice(0, 5);
  localStorage.setItem('breakoutRanking', JSON.stringify(ranking));

  let rankText = '\n🏆 Ranking\n';
  ranking.forEach((item, i) => {
    rankText += `${i + 1}. ${item.name} - ${item.score}\n`;
  });

  this.add.text(gameWidth / 2, gameHeight / 2 + 100, rankText, {
    fontSize: '24px',
    fill: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);

  this.time.delayedCall(5000, () => location.reload());
}


