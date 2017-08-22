window.onload = function () {
  /*
    My programming practice notes:
      * every major feature as part of updating the game (such as towers, enemies)
        are handeled in a separate function
      * I use Object.assign to copy objects in order to eliminate references when spawning enemies
        and to get the ability to modify them individually
      * Components such as buttons or selections within the canvas are classes
      * if, function and else have spaces between both '(' and '{'
        `if (thing) {}` not `if(thing){}`
      * Keep all variables local to their scope (in other words, use `let` instead of `var`)
  */

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
    enemySpawnList: [],
    towers: [],
    particles: [],
    selltext: [],
    map: null,
    health: 100,
    money: 100,
    wave: 0,
    waveTimer: 0,
    tower: 'simple',
    towerSel: null,
    debug: false,
    sellRatio: .8
  }

  /**
    speed - movement speed multiplier - higher: faster
    node - always 1
    health - health of the enemy
    reward - money earned when killed
    frequency - milliseconds to spawn in
    icon - currently color of the enemy
  */
  let Enemies = {
    basic: {
      speed: 10,
      node: 1,
      health: 50,
      reward: 10,
      frequency: 40,
      icon: '#f00'
    },
    speedy: {
      speed: 20,
      node: 1,
      health: 60,
      reward: 15,
      frequency: 35,
      icon: '#f11'
    },
    tough: {
      speed: 5,
      node: 1,
      health: 80,
      reward: 20,
      frequency: 40,
      icon: '#f40'
    }
  }

  let Towers = {
    simple: {
      range: 5, // range in tiles
      damage: 15, // damage to deal to enemies when hit
      rate: 20, // rate of fire, higher - slower
      name: 'Simple', // name of the tower
      description: 'Medium rate and damage',
      speed: 30, // bullet speed, higher - faster
      cost: 50, // cost to place
      icon: '#333', // currently color
      bullet: 1 // The type of bullet. 1: damage, 2: slow down by damage, 3: instant kill
    },
    rapid: {
      range: 3,
      damage: 5,
      rate: 5,
      name: 'Rapid',
      description: 'Rapid-firing but low damage',
      speed: 30,
      cost: 250,
      icon: '#303',
      bullet: 1
    },
    sticky: {
      range: 3,
      damage: 10,
      rate: 30,
      name: 'Sticky',
      description: 'Slow down enemies by damage',
      speed: 50,
      cost: 500,
      icon: '#e27c06',
      bullet: 2
    },
    snipe: {
      range: 10,
      damage: 1500,
      rate: 100,
      name: 'Sniper',
      description: 'Slow firing but always kills',
      speed: 50,
      cost: 1000,
      icon: '#4f3',
      bullet: 1
    }
  }

  let Maps = {
    width: 20, // Width of the map
    height: 20, // Height of the map
    tile: 32, // Tile size in pixels (each coordinate is multiplied by this number in rendering)
    first: {
      // map rendering data
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
      // enemy follow path
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
      ],
      waves: [
        {
          type: 'recurring',
          waveLow: 0,
          waveHigh: 10,
          oneAfterAnother: false,
          enemies: [{
            type: 'basic',
            count: 5,
            inclCount: true,
            inclHealth: true
          }]
        },
        {
          type: 'recurring',
          waveLow: 10,
          waveHigh: 15,
          oneAfterAnother: false,
          enemies: [{
            type: 'basic',
            count: 5,
            inclCount: true,
            inclHealth: true
          },
          {
            type: 'speedy',
            count: 10,
            inclCount: true,
            inclHealth: true
          }]
        },
        {
          type: 'recurring',
          waveLow: 15,
          oneAfterAnother: false,
          enemies: [{
            type: 'basic',
            count: 5,
            inclCount: true,
            inclHealth: true
          },
          {
            type: 'speedy',
            count: 10,
            inclCount: true,
            inclHealth: true
          }]
        },
        {
          type: 'once-every',
          every: 5,
          oneAfterAnother: false,
          enemies: [{
            type: 'tough',
            count: 5,
            inclCount: true,
            inclHealth: true
          }]
        },
        {
          type: 'once',
          wave: 3,
          enemies: [{
            type: 'tough',
            count: 2
          }]
        }
      ]
    }
  }

  let Components = {}

  class Component {
    constructor (x, y) {
      this.visible = true
      this.elements = []
      this.x = x
      this.y = y
    }

    elDraw() {
      for (let i in this.elements) {
        let elem = this.elements[i]
        if (elem instanceof Component) {
          elem.draw()
        }
      }
    }

    elUpdate() {
      for (let i in this.elements) {
        let elem = this.elements[i]
        if (elem instanceof Component) {
          elem.update()
        }
      }
    }

    addElement (el) {
      if (!(el instanceof Component)) return
      this.elements.push(el)
    }

    draw () {
      this.elDraw()
    }

    update() {
      this.elUpdate()
    }
  }

  class Tooltip extends Component {
    constructor () {
      super(0, 0)
      this.font = '20px Helvetica'
      this.text = ''
      this.w = 0
      this.h = 24
      this.components = []
      this.visible = false
    }

    static assign (tooltip, component, text) {
      tooltip.addComponent(component, text)
    }

    setText (str) {
      if (this.text === str) return
      this.text = str
      if (this.font) ctx.font = this.font
      this.w = ctx.measureText(this.text).width + this.h
    }

    draw () {
      if (!this.visible) return
      if (this.text === '') return
      if (this.font) ctx.font = this.font

      let aX = this.x
      let aY = this.y

      if (aX + this.w > canvas.width) {
        aX -= this.w + 5
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.fillRect(aX, aY, this.w, this.h)

      ctx.fillStyle = '#000'
      ctx.fillText(this.text, aX + this.h / 2, aY + this.h / 2 + 5)
    }

    setPosition (x, y) {
      this.x = x
      this.y = y
    }

    update () {
      if (this.components.length) {
        let cmps = false
        for (let i in this.components) {
          let cmp = this.components[i]
          if (mXr > cmp.x && mYr > cmp.y && 
              mXr < cmp.x + cmp.w && mYr < cmp.y + cmp.h) {
            this.setPosition(mXr, mYr)
            this.setText(cmp.text)
            cmps = true
          }
        }
        this.visible = cmps
      }
    }

    addComponent (component, text) {
      this.components.push({
        x: component.x,
        y: component.y,
        w: component.w,
        h: component.h,
        text: text
      })
    }
  }

  class ButtonComponent extends Component {
    constructor (text, textColor, color, x, y, w, h, fn) {
      super(x, y)
      this.w = w
      this.h = h
      this.fn = () => {
        fn.apply(this, [])
      }
      this.text = text
      this.textColor = textColor
      this.color = color
      this.disabled = false
      this.hovered = false
      this.font = '20px Helvetica'
    }
    
    draw () {
      if (!this.visible) return
      if (this.font) ctx.font = this.font
      ctx.fillStyle = this.color
      ctx.fillRect(this.x, this.y, this.w, this.h)
      ctx.fillStyle = this.textColor
      let txtMeasure = ctx.measureText(this.text)
      let tx = this.x + (this.w / 2 - txtMeasure.width / 2)
      let ty = this.y + (this.h / 2) * 1.2

      ctx.fillText(this.text, tx, ty)

      if (this.disabled) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
        ctx.fillRect(this.x, this.y, this.w, this.h)
      } else if (this.hovered) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
        ctx.fillRect(this.x, this.y, this.w, this.h)
      }
      this.elDraw()
    }

    update () {
      if (!this.visible || this.disabled) return
      if (mXr > this.x && mYr > this.y && mXr < this.x + this.w && mYr < this.y + this.h) {
        this.hovered = true
      } else if (this.hovered) {
        this.hovered = false
      }
    }

    setDisabled (disable) {
      this.disabled = typeof disabled === 'boolean' ? disabled : !this.disabled
    }
  }

  class TowerButton extends ButtonComponent {
    constructor (tower, i) {
      super()
      this.active = false
      this.w = 50
      this.h = 50
      this.x = (Maps.width * Maps.tile) + (i % 4) * (this.w + 4) + 4
      this.y = 80 + Math.floor(i / 4) * (this.h + 4)
      this.tower = tower
      this.towerObj = Towers[this.tower]
      this.costText = '$' + this.towerObj.cost
      this.text = this.towerObj.name
      this.textColor = '#fff'
      this.color = '#995522'
      this.fn = this.select
    }

    select () {
      Game.tower = this.tower
    }

    addTooltip () {
      Tooltip.assign(Components.tooltip, this, this.towerObj.description)
    }

    update () {
      super.update()
      this.disabled = this.towerObj.cost > Game.money && !Game.debug
      this.active = Game.tower === this.tower
      this.elUpdate()
    }

    draw () {
      if (!this.visible) return
      if (this.active) {
        ctx.fillStyle = '#afa'
        ctx.fillRect(this.x - 2, this.y - 2, this.w + 4, this.h + 4)
      }
      
      ctx.font = '14px Helvetica'
      ctx.fillStyle = this.color
      ctx.fillRect(this.x, this.y, this.w, this.h)
      ctx.fillStyle = this.textColor
      let txtMeasure = ctx.measureText(this.text)
      let tx = this.x + (this.w / 2 - txtMeasure.width / 2)
      let ty = this.y + (this.h / 2) * 1

      ctx.fillText(this.text, tx, ty)

      ctx.font = '10px Helvetica'
      if (Game.money >= this.towerObj.cost) {
        ctx.fillStyle = '#0f0'
      } else {
        ctx.fillStyle = '#f11'
      }
      txtMeasure = ctx.measureText(this.costText)
      tx = this.x + (this.w / 2 - txtMeasure.width / 2)
      ty = this.y + (this.h / 2) * 1.6
      ctx.fillText(this.costText, tx, ty)

      if (this.disabled) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
        ctx.fillRect(this.x, this.y, this.w, this.h)
      } else if (this.hovered) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
        ctx.fillRect(this.x, this.y, this.w, this.h)
      }
      this.elDraw()
    }
  }

  class InfoDialog extends Component {
    constructor () {
      super()
      this.x = 0
      this.y = (Maps.height - 5) * Maps.tile
      this.w = Maps.width * Maps.tile
      this.h = 5 * Maps.tile
      this.createButton()
    }

    createButton () {
      let btn = new ButtonComponent('Sell Tower', '#fff', '#f11', 490, 590, 140, 40, () => {
        if (Game.towerSel) {
          sellTower(Game.towerSel.x, Game.towerSel.y)
        }
      })

      btn.update = function () {
        this.visible = Game.towerSel !== null
        if (!this.visible) return
        if (mXr > this.x && mYr > this.y && mXr < this.x + this.w && mYr < this.y + this.h) {
          this.hovered = true
        } else if (this.hovered) {
          this.hovered = false
        }
      }

      this.addElement(btn)
    }

    draw () {
      if (Game.towerSel) {
        let ts = Game.towerSel

        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
        ctx.fillRect(this.x, this.y, this.w, this.h)
        
        ctx.fillStyle = '#fff'
        ctx.font = '25px Helvetica'
        ctx.fillText(ts.name + ' Tower', 5, this.y + 25)

        ctx.font = '15px Helvetica'
        ctx.fillText(ts.description, 5, this.y + 42)

        ctx.fillText('Range: ' + ts.range + ' tiles', 5, this.y + 70)
        ctx.fillText('Damage: ' + ts.damage + ' HP', 5, this.y + 85)
        ctx.fillText('Fire Rate: ' + ts.rate, 5, this.y + 100)
        ctx.fillText('Kills: ' + ts.killcount, 5, this.y + 115)
        ctx.fillText('Fired ' + ts.fires + ' times', 5, this.y + 130)
      }
      this.elDraw()
    }
  }

  function clickBtn (cmp) {
    let click = false
    let compList = cmp != null && cmp instanceof Component ? cmp.elements : null
    if (cmp == null && compList == null) {
      compList = Components
    }

    for (let i in compList) {
      let btn = compList[i]

      if (!(btn instanceof ButtonComponent)) {
        // Loop through sub-components of components
        if (btn.elements.length) {
          click = clickBtn(btn)
        } else {
          continue
        }
      } else {
        // Click the button if its in bounds, visible and not disabled
        if (btn.disabled || !btn.visible) continue
        if (mXr > btn.x && mYr > btn.y && mXr < btn.x + btn.w && mYr < btn.y + btn.h && btn) {
          btn.fn()
          click = true
        }
      }
    }
    return click
  }

  function updateComponents (cmp) {
    // Determine which object of components to update
    let compList = cmp != null && cmp instanceof Component ? cmp.elements : null
    if (cmp == null && compList == null) {
      compList = Components
    }

    for (let i in compList) {
      let component = compList[i]
      component.update()

      if (component.elements.length) {
        updateComponents(component)
      }
    }
  }

  // Total enemy spawn count is used to determine that the round is over
  // Local (in-function) determines how many there are left to spawn as ordered by the function call
  function addEnemies (enemies, type, specs) {
    let path = Game.map.pathgen[0]
    let enemy = Enemies[type]

    // Copy the enemy and add x and y coordinates
    let enemyCopy = Object.assign({
      x: path.x,
      y: path.y
    }, enemy)

    // Modify the enemy according to wave settings
    if (specs.healthIncrease) {
      enemyCopy.health += specs.healthIncrease
    }

    if (specs.speedIncrease) {
      enemyCopy.speed += specs.speedIncrease
    }

    enemyCopy.dmg = enemyCopy.health

    // Insert them into the spawn queue
    for (let i = 0; i < enemies; i++) {
      let spawnTime = enemyCopy.frequency * i + (specs.multiply ? (specs.multiply * (enemies * enemyCopy.frequency)) : 0)
      if (Game.debug) {
        console.log('added %s to spawn at %d', type, spawnTime)
      }

      Game.enemySpawnList.push(Object.assign({
        time: spawnTime
      }, enemyCopy))
    }
  }

  function nextWave () {
    Game.wave++
    
    for (let i in Game.map.waves) {
      let wv = Game.map.waves[i]
      let eSpawn = false
      if (wv.type === 'once-every' && Game.wave % wv.every === 0) {
        eSpawn = true
      } else if (wv.type === 'once' && Game.wave === wv.wave) {
        eSpawn = true
      } else if (wv.type === 'recurring' && Game.wave >= wv.waveLow && (wv.waveHigh ? Game.wave < wv.waveHigh : true)) {
        eSpawn = true
      }

      if (!eSpawn) continue
      for (let i in wv.enemies) {
        let e = wv.enemies[i]
        let eCount = e.count || 5
        let eHealthIncl = 0
        let multiply = wv.oneAfterAnother != null ? wv.oneAfterAnother : false

        if (e.inclCount === true) {
          eCount += Game.wave
        }

        if (e.baseHealth) {
          eHealthIncl = e.baseHealth
        }

        if (e.inclHealth === true) {
          eHealthIncl = Game.wave * 5
          if (eHealthIncl > 500) {
            eHealthIncl = 500
          }
        }

        addEnemies(eCount, e.type, {
          healthIncrease: eHealthIncl,
          multiply: multiply ? parseInt(i) : false
        })
      }
    }
  }

  function getTileIn (map, x, y) {
    let tile = x + y * Maps.width
    return map[tile]
  }

  function updateGameState (gst) {
    if (Game.state !== -1 && Game.health <= 0) {
      Game.health = 0
      Game.state = -1
      Game.towerSel = null
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

    Components.wave.disabled = (Game.state !== 2)
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
        enemy.x += (enemy.velocity.x * 0.01) * enemy.speed
        enemy.y += (enemy.velocity.y * 0.01) * enemy.speed
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

    if (Game.state === 1 && Game.enemies.length === 0 && Game.enemySpawnList.length === 0) {
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

    tower.fires++

    Game.particles.push({
      x: tower.x,
      y: tower.y,
      tower: {x: tower.x, y: tower.y},
      velX: (target.x - tower.x) / target.dist * 1.24,
      velY: (target.y - tower.y) / target.dist * 1.24,
      dmg: tower.damage,
      speed: tower.speed,
      type: tower.bullet || 1,
      life: 30
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
          if (parti.type === 1) {
            enemy.dmg -= parti.dmg

            if (enemy.dmg <= 0) {
              Game.enemies.splice(j, 1)
              Game.money += 10

              let tower = getTowerAt(parti.tower.x, parti.tower.y)
              if (tower) {
                tower.killcount++
              }
            }
          } else if (parti.type === 2) {
            enemy.speed -= parti.dmg
            if (enemy.speed < 2) {
              enemy.speed = 2
            }
          }

          // remove particle
          Game.particles.splice(i, 1)
        }
      }
    }
  }

  // Render text telling the amount of money received when selling a tower
  // Disappears after 30 game ticks
  function tickSellText () {
    for (let i in Game.selltext) {
      let txt = Game.selltext[i]
      txt.tick++
      txt.tick %= 30
      if (txt.tick === 0) {
        Game.selltext.splice(i, 1)
        continue
      }

      txt.y -= 0.05
    }
  }

  function selectTower (x, y) {
    let tower = getTowerAt(x, y)
    Game.towerSel = tower
  }

  function spawnQueue () {
    if (Game.enemySpawnList.length) {
      for (let i in Game.enemySpawnList) {
        let ef = Game.enemySpawnList[i]
        if (ef.time < Game.waveTimer) {
          Game.enemies.push(ef)
          Game.enemySpawnList.splice(i, 1)
        }
      }
    }
  }

  function getTowerAt (x, y) {
    for (let i in Game.towers) {
      let tower = Game.towers[i]
      if (tower.x === x && tower.y === y) return tower
    }

    return null
  }

  function canPlaceTowerAt (x, y) {
    let tileAt = getTileIn(Game.map.tiles, x, y)
    if (tileAt !== 0) return false

    // Do not overlap towers
    if (getTowerAt(x, y) !== null) return false

    // Prevent towers from being placed right next to each-other
    let can = true
    for (let j in Game.towers) {
      if (can === false) break
      let tower = Game.towers[j]

      // tower placement restriction visualization
      for (let i = 0; i < 4; i++) {
        if (can === false) break
        let ax = tower.x
        let ay = tower.y
        if (i == 0) {
          ax -= 1
        } else if (i == 1) {
          ax += 1
        } else if (i == 2) {
          ay -= 1
        } else if (i == 3) {
          ay += 1
        }
        
        if (ax < 0 || ay < 0 || ay > Maps.height || ax > Maps.width) continue
        if (ax === x && ay === y) can = false
      }
    }

    return can
  }

  function placeTower (tower, x, y) {
    if (tower.cost > Game.money && !Game.debug) return // no money

    if (!canPlaceTowerAt(x, y)) return

    if (!Game.debug) {
      Game.money -= tower.cost
    }

    Game.towers.push(Object.assign({
      x: x,
      y: y,
      tick: tower.rate,
      setting: 1,
      fires: 0,
      killcount: 0
    }, tower))
  }

  function sellTower (x, y) {
    let tower = getTowerAt(x, y)
    if (tower) {
      let amount = tower.cost * Game.sellRatio
      Game.money += amount
      Game.selltext.push({
        x: x,
        y: y,
        amount: amount,
        tick: 0
      })

      if (Game.towerSel && Game.towerSel.x === x && Game.towerSel.y === y) {
        Game.towerSel = null
      }

      return Game.towers.splice(Game.towers.indexOf(tower), 1)
    } else {
      return null
    }
  }

  function update (dt) {
    // Update FPS count for drawing (Don't render a new number every frame, it changes too fast)
    fpsCount++
    fpsCount %= 20
    if (fpsCount === 0) {
      fpsDraw = fps
    }
    
    // Only tick towers when the game is in the play state
    if (Game.state === 1) {
      tickTowers()
    }

    // Move enemies
    updateEnemyMovements()

    // Move bullets
    tickParticles()

    // Move sell texts
    tickSellText()

    // Update all components (eg buttons)
    updateComponents()

    // Set the state
    updateGameState()

    // Increment game clock
    if (Game.state === 1) {
      Game.waveTimer++
    }

    spawnQueue()
  }

  let lastRenderTime = Date.now()
  function render () {
    let mt = Maps.tile
    ctx.fillStyle = '#0fa'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw the map
    for (let i in Game.map.tiles) {
      let tile = Game.map.tiles[i]
      let index = parseInt(i)
      let y = Math.floor(index / Maps.width)
      let x = Math.floor(index % Maps.height)
      let draw_tile = true
     
      if (tile === 1) {
        ctx.fillStyle = '#fdd'
      } else if (tile === 2) {
        ctx.fillStyle = '#aaf'
      } else if (tile === 3) {
        ctx.fillStyle = '#f3a'
      } else {
        draw_tile = false
      }

      if (draw_tile) {
        ctx.fillRect(x * mt, y * mt, mt, mt)
      }

      // Draw obstructed tiles
      if (Game.state === 2 && tile === 0 && !canPlaceTowerAt(x, y)) {
        ctx.fillStyle = '#738c5d'
        ctx.fillRect(x * mt, y * mt, mt, mt)
      }
    }

    // Show the enemy movement path
    if (Game.debug) {
      for (let i in Game.map.pathgen) {
        let node = Game.map.pathgen[i]
        ctx.fillStyle = '#00f'
        ctx.fillRect((node.x * mt) + mt / 3, (node.y * mt) + mt / 3, 8, 8)
      }
    }

    // Draw towers
    for (let i in Game.towers) {
      let tower = Game.towers[i]
      ctx.fillStyle = tower.icon
      ctx.fillRect(tower.x * mt + 2, tower.y * mt + 2, 28, 28)

      if (Game.debug) {
        ctx.fillStyle = '#f11'
        ctx.font = '10px Helvetica'
        ctx.fillText(tower.tick, tower.x * mt + 10, tower.y * mt + 25)
      }
    }

    // Draw enemies
    for (let i in Game.enemies) {
      let enemy = Game.enemies[i]
      let rx = (enemy.x * mt) + mt / 8
      let ry = (enemy.y * mt) + mt / 8
      ctx.fillStyle = enemy.icon
      ctx.fillRect(rx, ry, 16, 16)

      // health bars
      let hx = rx - 6
      let hy = ry - 12
      ctx.fillStyle = '#f00'
      ctx.fillRect(hx, hy, 16 + 12, 5)

      ctx.fillStyle = '#0f0'
      ctx.fillRect(hx, hy, (16 + 12) * enemy.dmg / enemy.health, 5)
      
      if (Game.debug) {
        ctx.fillStyle = '#511'
        ctx.font = '10px Helvetica'
        ctx.fillText(enemy.dmg, hx + 10, hy + 25)
      }
    }

    // Draw bullets
    for (let i in Game.particles) {
      let tower = Game.particles[i]
      ctx.fillStyle = '#f33'
      ctx.fillRect(tower.x * mt + mt / 16, tower.y * mt + mt / 16, 8, 8)
    }

    // Tower range visualization
    let towerData = Towers[Game.tower]
    let vX = null
    let vY = null

    // Render the currently selected tower's range if present
    if (Game.towerSel) {
      towerData = Game.towerSel
      vX = towerData.x
      vY = towerData.y
    } else if (towerData != null && towerData.cost <= Game.money && canPlaceTowerAt(mX, mY) &&
        mX < Maps.width && mY < Maps.height && Game.state === 2) {
      vX = mX
      vY = mY
    }

    // Render range
    if (vX != null && vY != null && towerData) {
      ctx.strokeStyle = '#ddd'
      ctx.fillStyle = 'rgba(200, 200, 200, 0.25)'
      ctx.beginPath()
      ctx.arc(vX * mt + mt / 2, vY * mt + mt / 2, towerData.range * mt, 0, 2 * Math.PI)
      ctx.stroke()
      ctx.fill()
      ctx.closePath()
    }

    // Render sell text
    for (let i in Game.selltext) {
      let txt = Game.selltext[i]
      ctx.font = '12px Helvetica'
      ctx.fillStyle = '#0a0'
      ctx.fillText('+ $' + txt.amount, txt.x * mt, txt.y * mt)
    }

    // Render sidebar background
    ctx.fillStyle = '#996633'
    ctx.fillRect(640, 0, 240, 640)

    // Render sidebar text
    ctx.font = '20px Helvetica'
    ctx.fillStyle = '#fff'
    ctx.fillText('FPS: ' + fpsDraw.toFixed(2), 0, 20)
    ctx.fillText('Wave: ' + Game.wave, 645, 25)
    ctx.fillText('Health: ' + Game.health, 645, 45)
    ctx.fillText('Money: ' + Game.money, 645, 65)

    // Game Over text
    if (Game.state === -1) {
      ctx.font = '80px Helvetica'
      ctx.fillStyle = '#f00'
      ctx.fillText('Game Over', 100, canvas.height / 2 - 80 / 2)
    }

    // Draw mouse cursor
    if (mX < Maps.width && mY < Maps.height) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.24)'
      ctx.fillRect(mX * mt, mY * mt, mt, mt)
    }

    // Draw all components
    for (let i in Components) {
      let cmp = Components[i]
      if (!(cmp) instanceof Component) continue
      cmp.draw()
    }

    if (Game.debug) {
      ctx.fillStyle = '#f11'
      ctx.font = '10px Helvetica'
      ctx.fillText('enemy queue length ' + Game.enemySpawnList.length, 5, 580)
      ctx.fillText('enemy count ' + Game.enemies.length, 5, 590)
      ctx.fillText('tower count ' + Game.towers.length, 5, 600)
      ctx.fillText('particle count ' + Game.particles.length, 5, 610)
      ctx.fillText('render tick ms ' + (Date.now() - lastRenderTime), 5, 620)
      lastRenderTime = Date.now()
    }
  }

  let lastTime = Date.now()
  let now
  let fpsRes = 50

  function gameLoop () {
    update()
    render()

    // Update FPS
    let cfps = 1000 / ((now = new Date) - lastTime)
    if (now != lastTime) {
      fps += (cfps - fps) / fpsRes
      lastTime = now
    }

    requestAnimationFrame(gameLoop)
  }

  function initialize () {
    Game.map = Maps.first

    // Next wave button
    Components.wave = new ButtonComponent('Next Wave', '#fff', '#11f', 650, 570, 200, 60, () => {
      updateGameState(1)
    })

    // Tower information box
    Components.info = new InfoDialog()

    // Add buy buttons to every tower
    let index = 0
    for (let i in Towers) {
      Components[i] = new TowerButton(i, index)
      index++
    }

    // Tooltip
    Components.tooltip = new Tooltip()
    for (let i in Towers) {
      let cmp = Components[i]
      if (!cmp) continue
      Components.tooltip.addComponent(cmp, cmp.towerObj.description)
    }

    // Start the game
    gameLoop()
  }

  canvas.addEventListener('click', (e) => {
    if (clickBtn()) return
    if (mX < Maps.width && mY < Maps.height) {
      // Select a tower if present
      if (getTowerAt(mX, mY)) {
        return selectTower(mX, mY)
      } else if (Game.towerSel) {
        Game.towerSel = null
        return
      }

      // Place a tower
      if (!Game.tower || Game.state !== 2) return
      placeTower(Towers[Game.tower], mX, mY)
    }
  })
  
  canvas.addEventListener('contextmenu', (e) => {
    if (Game.state === 2 && mX < Maps.width && mY < Maps.height &&
      sellTower(mX, mY)) {
      e.preventDefault()
    }
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
