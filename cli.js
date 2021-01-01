const readline = require('readline')
const snake = require('./snake')

readline.emitKeypressEvents(process.stdin)
if (process.stdin.isTTY) {
    process.stdin.setRawMode(true)
}

const config = {
    loopTime: 100
}
const game = snake({ width: 10, height: 10, level: 1 })

const isExitProcess    = key => key.name === 'c' && key.ctrl
const isUpKey          = key => key.name === 'up'
const isDownKey        = key => key.name === 'down'
const isLeftKey        = key => key.name === 'left'
const isRightKey       = key => key.name === 'right'

const onClickUpKey     = () => game.execCommand('UP')
const onClickDownKey   = () => game.execCommand('DOWN')
const onClickLeftKey   = () => game.execCommand('LEFT')
const onClickRightKey  = () => game.execCommand('RIGHT')

const handleCommand    = key => condition => fn => condition(key) ? fn() : false

const renderMatrix = matrix => {
    console.log(matrix
    .map(row => row.join(' '))
    .join('\n'))
}

process.stdin.on('keypress', (key, data) => {
    const keyHandler = handleCommand(data)
    keyHandler(isUpKey)(onClickUpKey)
    keyHandler(isDownKey)(onClickDownKey)
    keyHandler(isRightKey)(onClickRightKey)
    keyHandler(isLeftKey)(onClickLeftKey)
    keyHandler(isExitProcess)(process.exit)
})

const loop = setInterval(() => {
    console.clear()
    renderMatrix(game.next());
}, config.loopTime)