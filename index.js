window.onload = function () {
  let canvas = document.getElementById('canvas')
  let ctx = canvas.getContext('2d')
  
  let fps = 0
  let fpsDraw = 0
  let fpsCount = 0

  // mouse
  let mX = 0
  let mY = 0
  let mXr = 0
  let mYr = 0

  let Game = {
    state: 2,
    enemies: [],
    towers: [],
    particles: [],
    map: null,
    health: 100,
    money: 100,
    enemySpawn: 0,
    pace: 1,
    wave: 0,
    waveTimer: 0,
    tower: 'simple'
  }

  let Enemies = {
    basic: {
      speed: 10,
      node: 1,
      dmg: 50,
      health: 50,
      reward: 10
    },
    speedy: {
      speed: 20,
      node: 1,
      dmg: 60,
      health: 60,
      reward: 15
    },
    tough: {
      speed: 5,
      node: 1,
      dmg: 100,
      health: 100,
      reward: 20
    }
  }

  let Towers = {
    simple: {
      range: 6,
      damage: 15,
      rate: 20,
      name: 'Simple',
      speed: 30,
      cost: 50,
      icon: null
    }
  }

  let Maps = {
    width: 20,
    height: 20,
    tile: 32,
    first: {
      tiles: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 
        0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 
        0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 
        0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 
        0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 
        0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 
        0, 3, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
      ],
      pathgen: [
        {x: 1, y: 2, end: false},
        {x: 14, y: 2, end: false},
        {x: 14, y: 6, end: false},
        {x: 8, y: 6, end: false},
        {x: 8, y: 10, end: false},
        {x: 17, y: 10, end: false},
        {x: 17, y: 17, end: false},
        {x: 5, y: 17, end: false},
        {x: 5, y: 12, end: false},
        {x: 1, y: 12, end: false},
        {x: 1, y: 17, end: true},
      ]
    }
  }

  let Buttons = {}

  let ButtonComponent = function (text, textColor, color, x, y, w, h, fn) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.disabled = false
    this.hovered = false
    this.draw = () => {
      ctx.fillStyle = color
      ctx.fillRect(this.x, this.y, this.w, this.h)
      ctx.fillStyle = textColor
      let txtMeasure = ctx.measureText(text)
      let tx = this.x + (this.w / 2 - txtMeasure.width / 2)
      let ty = this.y + (this.h / 2) * 1.2

      ctx.fillText(text, tx, ty)

      if (this.disabled) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
        ctx.fillRect(this.x, this.y, this.w, this.h)
      } else if (this.hovered) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
        ctx.fillRect(this.x, this.y, this.w, this.h)
      }
    }

    this.fn = () => {
      if (fn != null && typeof fn === 'function') {
        fn.apply(this, [])
      }
    }

    this.setDisabled = (disable) => {
      this.disabled = typeof disabled === 'boolean' ? disabled : !this.disabled
    }
  }

  function clickBtn () {
    for (let i in Buttons) {
      let btn = Buttons[i]
      if (btn.disabled) return
      if (mXr > btn.x && mYr > btn.y && mXr < btn.x + btn.w && mYr < btn.y + btn.h) {
        btn.fn()
      }
    }
  }

  function nextWave () {
    Game.wave++
    
    if (Game.wave % 5 === 0) {
      addEnemies(Game.wave / 5, Enemies.speedy)
    } else if (Game.wave % 10 === 0) {
      addEnemies(1, Enemies.tough)
    } else if (Game.wave > 5) {
      addEnemies(10 + Game.wave, Enemies.speedy)
      if (Game.wave > 10) {
        addEnemies(Game.wave - 10, Enemies.tough)
      }
    }
    
    addEnemies(10 + Game.wave, Enemies.basic)
  }

  function getTileIn (map, x, y) {
    let tile = x + y * Maps.width
    return map[tile]
  }

  function updateGameState (gst) {
    if (Game.state !== -1 && Game.health <= 0) {
      Game.health = 0
      Game.state = -1
    }

    if (Game.state === 2 && gst === 1) {
      nextWave()
    }

    if (gst === 2 && Game.state === 1) {
      Game.waveTimer = 0
    }

    if (gst != null) {
      Game.state = gst
    }

    Buttons.wave.disabled = (Game.state !== 2)
  }

  function updateEnemyMovements () {
    for (let i in Game.enemies) {
      let enemy = Game.enemies[i]
      let enemyTrackTarget = Game.map.pathgen[enemy.node]
      if (enemyTrackTarget) {
        let tx = enemyTrackTarget.x
        let ty = enemyTrackTarget.y
        let vexLen = Math.sqrt(Math.pow(tx - enemy.x, 2) + Math.pow(ty - enemy.y, 2))
        let velX = (tx - enemy.x) / Math.abs(vexLen)
        let velY = (ty - enemy.y) / Math.abs(vexLen)
        enemy.velocity = {x: velX, y: velY, dist: Math.abs(vexLen)}
      }

      if (enemy.velocity.dist > 0.1) {
        enemy.x += (enemy.velocity.x * 0.01) * enemy.speed * Game.pace
        enemy.y += (enemy.velocity.y * 0.01) * enemy.speed * Game.pace
      } else {
        if (Game.map.pathgen[enemy.node + 1]) {
          enemy.node += 1
        } else if (enemyTrackTarget.end === true) {
          Game.enemies.splice(i, 1)
          Game.health -= Math.floor(enemy.dmg / 2)
          if (Game.health < 0) {
            Game.health = 0
          }
        }
      }
    }

    if (Game.state === 1 && Game.enemies.length === 0 && Game.enemySpawn === 0) {
      updateGameState(2)
    }
  }

  function towerFire (tower) {
    let enemiesProxima = []
    let target = null

    for (let i in Game.enemies) {
      let enemy = Game.enemies[i]
      let proxi = Math.abs(Math.sqrt(Math.pow(enemy.x - tower.x, 2) + Math.pow(enemy.y - tower.y, 2)))
      if (proxi > tower.range) continue
      enemiesProxima.push(Object.assign({dist: proxi}, enemy))
    }

    if (!enemiesProxima.length) return
    
    enemiesProxima.sort((a, b) => {
      return a.dist - b.dist
    })

    if (tower.setting === 1) {
      target = enemiesProxima[0]
    } else {
      target = enemiesProxima[enemiesProxima.length - 1]
    }

    Game.particles.push({
      x: tower.x,
      y: tower.y,
      velX: (target.x - tower.x) / target.dist * 1.24,
      velY: (target.y - tower.y) / target.dist * 1.24,
      dmg: tower.damage,
      speed: tower.speed,
      life: 100
    })
  }

  function tickTowers () {
    for (let i in Game.towers) {
      let tower = Game.towers[i]

      // Tick towers
      tower.tick++
      tower.tick %= tower.rate

      // fire
      if (tower.tick === 0) {
        towerFire(tower)
      }
    }
  }

  function tickParticles () {
    for (let i in Game.particles) {
      let parti = Game.particles[i]
      parti.x += parti.velX * 0.01 * parti.speed
      parti.y += parti.velY * 0.01 * parti.speed

      parti.life--
      if (parti.life <= 0) {
        Game.particles.splice(i, 1)
        continue
      }

      for (let j in Game.enemies) {
        let enemy = Game.enemies[j]

        if (parti.x >= enemy.x - 0.25 && parti.y >= enemy.y - 0.25 &&
          parti.x <= enemy.x + 0.5 && parti.y <= enemy.y + 0.5) {
          // damage enemy
          enemy.dmg -= parti.dmg

          if (enemy.dmg <= 0) {
            Game.enemies.splice(j, 1)
            Game.money += 10
          }

          // remove particle
          Game.particles.splice(i, 1)
        }
      }
    }
  }

  function addEnemies (cnt, type) {
    Game.enemySpawn += cnt
    let ect = setInterval(() => {
      if (Game.enemySpawn === 0) return clearInterval(ect)
      Game.enemySpawn--

      Game.enemies.push(Object.assign({
        x: Game.map.pathgen[0].x, y: Game.map.pathgen[0].y
      }, type))
    }, 1000)
  }

  function towerAt (x, y) {
    for (let i in Game.towers) {
      let tower = Game.towers[i]
      if (tower.x === x && tower.y === y) return tower
    }

    return null
  }

  function placeTower (tower, x, y) {
    if (tower.cost > Game.money) return // no money
    
    let tileAt = getTileIn(Game.map.tiles, x, y)
    if (tileAt !== 0) return

    if (towerAt(x, y)) return

    Game.money -= tower.cost
    Game.towers.push(Object.assign({
      x: x,
      y: y,
      tick: tower.rate,
      setting: 1
    }, tower))
  }

  function update (dt) {
    fpsCount++
    fpsCount %= 20
    if (fpsCount === 0) {
      fpsDraw = fps
    }
    
    tickTowers()
    updateEnemyMovements()
    tickParticles()

    for (let i in Buttons) {
      let btn = Buttons[i]
      if (mXr > btn.x && mYr > btn.y && mXr < btn.x + btn.w && mYr < btn.y + btn.h) {
        btn.hovered = true
      } else if (btn.hovered) {
        btn.hovered = false
      }
    }

    updateGameState()
    if (Game.state === 1) {
      Game.waveTimer++
    }
  }

  function render () {
    let mt = Maps.tile
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let i in Game.map.tiles) {
      let tile = Game.map.tiles[i]
      let index = parseInt(i)
      let y = Math.floor(index / Maps.width)
      let x = Math.floor(index % Maps.height)

      if (tile === 1) {
        ctx.fillStyle = '#fdd'
      } else if (tile === 2) {
        ctx.fillStyle = '#aaf'
      } else if (tile === 3) {
        ctx.fillStyle = '#f3a'
      } else {
        ctx.fillStyle = '#0fa'
      }

      ctx.fillRect(x * mt, y * mt, mt, mt)
    }
/*
    for (let i in Game.map.pathgen) {
      let node = Game.map.pathgen[i]
      ctx.fillStyle = '#00f'
      ctx.fillRect((node.x * mt) + mt / 3, (node.y * mt) + mt / 3, 8, 8)
    }
*/
    for (let i in Game.towers) {
      let tower = Game.towers[i]
      ctx.fillStyle = '#333'
      ctx.fillRect(tower.x * mt + 2, tower.y * mt + 2, 28, 28)
    }

    for (let i in Game.enemies) {
      let enemy = Game.enemies[i]
      let rx = (enemy.x * mt) + mt / 8
      let ry = (enemy.y * mt) + mt / 8
      ctx.fillStyle = '#f00'
      ctx.fillRect(rx, ry, 16, 16)

      // health bars
      let hx = rx - 6
      let hy = ry - 12
      ctx.fillStyle = '#f00'
      ctx.fillRect(hx, hy, 16 + 12, 5)

      ctx.fillStyle = '#0f0'
      ctx.fillRect(hx, hy, (16 + 12) * enemy.dmg / enemy.health, 5)
    }

    for (let i in Game.particles) {
      let tower = Game.particles[i]
      ctx.fillStyle = '#f33'
      ctx.fillRect(tower.x * mt + mt / 16, tower.y * mt + mt / 16, 8, 8)
    }

    // tower range visualization
    if (Game.state === 2 && Game.tower && mX < Maps.width && mY < Maps.height) {
      let towerData = Towers[Game.tower]
      ctx.strokeStyle = '#ddd'
      ctx.fillStyle = 'rgba(200, 200, 200, 0.25)'
      ctx.beginPath()
      ctx.arc(mX * mt + mt / 2, mY * mt + mt / 2, towerData.range * mt, 0, 2 * Math.PI)
      ctx.stroke()
      ctx.fill()
      ctx.closePath()
    }

    ctx.fillStyle = '#996633'
    ctx.fillRect(640, 0, 240, 640)

    ctx.font = '20px Helvetica'
    ctx.fillStyle = '#fff'
    ctx.fillText('FPS: ' + fpsDraw.toFixed(2), 0, 20)
    ctx.fillText('Wave: ' + Game.wave, 645, 25)
    ctx.fillText('Health: ' + Game.health, 645, 45)
    ctx.fillText('Money: ' + Game.money, 645, 65)

    for (let i in Buttons) {
      let btn = Buttons[i]
      btn.draw()
    }

    if (Game.state === -1) {
      ctx.font = '80px Helvetica'
      ctx.fillStyle = '#f00'
      ctx.fillText('Game Over', 100, canvas.height / 2 - 80 / 2)
    }

    if (mX < Maps.width && mY < Maps.height) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.24)'
      ctx.fillRect(mX * mt, mY * mt, mt, mt)
    }
  }

  let lastTime = Date.now()
  function gameLoop () {
    requestAnimationFrame(gameLoop)

    let delta = (Date.now() - lastTime) / 1000

    fps = 1 / (delta === 0 ? 1 : delta)

    update(delta)
    render()

    lastTime = Date.now()
  }

  function initialize () {
    Game.map = Maps.first

    Buttons.wave = new ButtonComponent('Next Wave', '#fff', '#11f', 650, 570, 200, 60, () => {
      updateGameState(1)
    })

    gameLoop()
  }

  canvas.addEventListener('click', (e) => {
    if (Game.state === 2 && mX < Maps.width && mY < Maps.height && Game.tower) {
      placeTower(Towers[Game.tower], mX, mY)
    }

    clickBtn()
  })

  canvas.addEventListener('mousemove', (e) => {
    if (e.changedTouches) {
      let touch = e.changedTouches[0]
      if (touch) {
        e.pageX = touch.pageX
        e.pageY = touch.pageY
      }
    }

    if (e.pageX || e.pageY) { 
      mXr = e.pageX
      mYr = e.pageY
    } else {
      mXr = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft
      mYr = e.clientY + document.body.scrollTop + document.documentElement.scrollTop
    }

    mXr -= canvas.offsetLeft
    mYr -= canvas.offsetTop

    mX = Math.floor(mXr / Maps.tile)
    mY = Math.floor(mYr / Maps.tile)
  })

  initialize()
}
