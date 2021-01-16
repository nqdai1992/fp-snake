const indentity          = x => x;
const pipe               = (...fns) => x => fns.reduce((f, g) => g(f), x)
const range              = n => [...Array(n).keys()]
const deepClone          = obj => JSON.parse(JSON.stringify(obj))
const isPerpendicular    = point1 => point2 => (point1.x * point2.x + point1.y * point2.y) === 0
const isEqualPoint       = point1 => point2 => point1.x === point2.x && point1.y === point2.y
const fillArray          = arr => value => arr.map(item => value)
const addPoint           = point1 => point2 => ({ x: point1.x + point2.x, y: point1.y + point2.y })
const enqueue            = arr => value => [...arr, value]
const getLastItem        = arr => deepClone(arr).pop()
const mod                = (a, b) => (a + b) % b
const getRandomInRange   = (min, max) => Math.floor(Math.random() * (max - min) + min)

const isDuplicatePoint      = point => path => path.filter(isEqualPoint(point)).length >= 2
const createMatrix2D        = (width, height) => arr => arr.concat(range(height).map(row => range(width)))
const fillMatrix2D          = value => matrix => matrix.map(row => fillArray(row)(value))
const generateRandomPoint   = (width, height) => Point(getRandomInRange(1, width), getRandomInRange(1, height))

const setValueMatrix2D = matrix => point => value => {
    const cloneMatrix = deepClone(matrix)
    cloneMatrix[point.y][point.x] = value
    return cloneMatrix
}
const setListOfValueMatrix2D = matrix => points => value => {
    const cloneMatrix = deepClone(matrix)
    points.forEach(point => {
        cloneMatrix[point.y][point.x] = value
    })
    return cloneMatrix
}

const normalizePoints = (width, height) => points => points.map(p => ({x: mod(p.x, width), y: mod(p.y, height)}))

const Point = (x, y) => ({x, y})
const UP    = Point( 0, -1)
const DOWN  = Point( 0,  1)
const RIGHT = Point( 1,  0)
const LEFT  = Point(-1,  0)

const Game = states => {
    let isGameover = false
    let snack = Snack({
        direction: deepClone(UP),
        path: [Point(0, 0)],
        border: {
            width: states.width,
            height: states.height
        }
    })
    let apple = generateRandomPoint(states.width, states.height)
    const initMatrixData = pipe(
        createMatrix2D(states.width, states.height),
        fillMatrix2D('.')
    )([])
    const matrix = Matrix(initMatrixData)
    const command = { UP, DOWN, RIGHT, LEFT }
    const commandQueue = []
    const maxWaitTime = 1000
    const delayPerLevel = 100
    const isCollideSnakeAndApple = (snack, apple) => {
        return isEqualPoint(snack.getHead())(apple)
    }
    const isCollideSnakeAndSnake = (snack) => {
        return isDuplicatePoint(snack.getHead())(snack.getPath())
    }
    
    const draw = (snake, apple) => matrix => {
        return matrix
                .setValueOfPoint(apple)('o')
                .setValueListOfPoint(snake.getPath())('x')
                .getData()
    }
    return {
        execCommand: name => { 
            commandQueue.push(command[name])
        },
        isGameover: () => isGameover,
        next () {
            snack = snack
                    .changeDirection(commandQueue.shift())
                    .move()
             
            if (isCollideSnakeAndApple(snack, apple)) {
                snack = snack.grow()
                apple = generateRandomPoint(states.width, states.height)
            }

            if (isCollideSnakeAndSnake(snack)) {
                isGameover =  true
            }

            return draw(snack, apple)(matrix)
        }
    }
}
const Matrix = matrix => ({
    getData: () => matrix,
    setValueListOfPoint: points => value => Matrix(setListOfValueMatrix2D(matrix)(points)(value)),
    setValueOfPoint: point => value => Matrix(setValueMatrix2D(matrix)(point)(value)),
    getValueOfPoint: point => matrix[point.y][point.x],
})
const Snack = states => ({
    nomarlizeFunction: normalizePoints(states.border.width, states.border.height),
    changeDirection: direction => direction && isPerpendicular(direction)(states.direction) ? Snack({ ...states, direction }) : Snack(states),
    move () {
        const newPoint = addPoint(this.getHead())(states.direction)
        const newPath = enqueue(states.path)(newPoint).slice(1)
        return Snack({ ...states, path: this.nomarlizeFunction(newPath) })
    },
    getPath: () => states.path,
    setPath: path => Snack({ ...states, path}),
    getHead: () => getLastItem(states.path),
    grow () {
        const newPoint = addPoint(this.getHead())(states.direction)
        const newPath = enqueue(states.path)(newPoint)
        return Snack({ ...states, path: this.nomarlizeFunction(newPath) })
    }
})

module.exports = Game