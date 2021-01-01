const indentity          = x => x;
const range              = n => [...Array(n).keys()]
const deepClone          = obj => JSON.parse(JSON.stringify(obj))
const createMatrix2D     = width => height => range(height).map(row => range(width))
const fillArray          = arr => value => arr.map(item => value)
const fillMatrix2D       = matrix => value => matrix.map(row => fillArray(row)(value))
const addPoint           = point1 => point2 => ({ x: point1.x + point2.x, y: point1.y + point2.y })
const enqueue            = arr => value => [...arr, value]
const getLastItem        = arr => deepClone(arr).pop()
const mod                = (a, b) => (a + b) % b
const isPerpendicular    = point1 => point2 => (point1.x * point2.x + point1.y * point2.y) === 0
const isEqualPoint       = point1 => point2 => point1.x === point2.x && point1.y === point2.y
const getRandomInRange   = (min, max) => Math.floor(Math.random() * (max - min) + min)
const isPointNotInPath   = point => path => !path.find(isEqualPoint(point))

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
    let snack = Snack({
        direction: deepClone(UP),
        path: [Point(0, 0)]
    })
    let apple = Apple(Point(getRandomInRange(1, states.width), getRandomInRange(1, states.height)))
    const matrix = Matrix(fillMatrix2D(createMatrix2D(states.width)(states.height))('.'))
    const command = { UP, DOWN, RIGHT, LEFT }
    const commandQueue = []
    const maxDelay = 1000
    const delayPerLevel = 100
    let lastUpdatedAt = 0
    let appleNumber = 0
    return {
        execCommand: name => { 
            commandQueue.push(command[name])
        },
        next: () => {
            let now = Date.now()
            if ((now - lastUpdatedAt) > maxDelay - (states.level) * delayPerLevel) {
                lastUpdatedAt = now
                snack = snack
                    .changeDirection(commandQueue.shift())
                    .move(normalizePoints(states.width, states.height))
            }
            const snakePath  = snack.getPath()
            const applePoint = apple.getPoint()
            // while (appleNumber === 0) {
            //     const x = randomIndex(0, states.width)
            //     const y = randomIndex(0, states.height)
            //     const point = Point(x, y)
            //     if (isPointNotInPath(point)(snakePath)) {
            //         appleNumber += 1
            //         matrix.setValueOfPoint(point)('o')
            //     }
            // }
            return matrix
                .setValueOfPoint(applePoint)('o')
                .setValueListOfPoint(snakePath)('x')
                .getData()
        }
    }
}
const Matrix = matrix => ({
    getData: () => matrix,
    setValueListOfPoint: points => value => Matrix(setListOfValueMatrix2D(matrix)(points)(value)),
    setValueOfPoint: point => value => Matrix(setValueMatrix2D(matrix)(point)(value)),
    getValueOfPoint: point => matrix[point.y][point.x]
})
const Snack = states => ({
    changeDirection: direction => direction && isPerpendicular(direction)(states.direction) ? Snack({ ...states, direction }) : Snack(states),
    move: (nomarlizeFunction) => {
        const newPoint = addPoint(getLastItem(states.path))(states.direction)
        const newPath = enqueue(states.path)(newPoint).slice(1)
        return Snack({ ...states, path: nomarlizeFunction(newPath) })
    },
    getPath: () => states.path,
    setPath: path => Snack({ ...states, path})
})
const Apple = point => ({
    getPoint: () => point
})

module.exports = Game