const nodesDiv = document.querySelector("#nodes")
const keyInput = document.querySelector("input#key"),
    addKeyButton = document.querySelector("button#add")

// 노드들을 연결하는 선을 그리기 위한 캔버스
const lineCanvas = document.querySelector("#nodes canvas")
const ctx = lineCanvas.getContext("2d")

ctx.strokeStyle = "black"
ctx.lineWidth = 3

lineCanvas.width = window.innerWidth
lineCanvas.height = window.innerHeight

const nodes = [null]
let last = 0

// TODO: 힙 자료구조
class Heap {}

class HeapNode {
    constructor(key) {
        this.key = key
        this.element = document.createElement("div")
        this.element.classList.add("heap-node")
        this.element.innerText = key
        nodesDiv.appendChild(this.element)
    }

    static swap(target) {
        let temp = this.key
        this.key = target.key
        target.key = temp

        this.element.innerText = this.key
        target.innerText = target.key
    }

    get coords() {
        const { left, top, width, height } =
            this.element.getBoundingClientRect()
        return { x: left + width / 2, y: top + height / 2 }
    }
}

const MAX_NODES = 1024 // 2^10
const BASE_Y = 50
const FLOOR_HEIGHT = 100

// 2의 제곱번째 노드가 추가될 때마다 층이 추가됨
const floors = {
    1: true,
}
let curr = 2
while (curr <= MAX_NODES) {
    floors[curr] = true
    curr = curr * 2
}

let currFloor = 0
function addKey() {
    const key = keyInput.valueAsNumber
    if (isNaN(key)) return
    keyInput.value = ""

    exports.HeapInsert(key)

    nodes.push(new HeapNode(key))
    last++
    if (floors[last]) currFloor++
    nodes[last].element.style.top =
        `${BASE_Y + (currFloor - 1) * FLOOR_HEIGHT}px`
    // 중앙 정렬
    nodes[last].element.style.left =
        `calc(50% + ${((last + 1 / 2 - Math.pow(2, currFloor - 1) - Math.pow(2, currFloor - 2)) * Math.pow(2, 10 - currFloor)) / 5}rem - 1.5rem)`

    drawLines()
}

function drawLines() {
    ctx.clearRect(0, 0, lineCanvas.width, lineCanvas.height)

    for (let i = last; i > 1; i--) {
        const { x, y } = nodes[i].coords,
            { x: px, y: py } = nodes[Math.floor(i / 2)].coords

        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(px, py)
        ctx.stroke()
    }
}

addKeyButton.addEventListener("click", addKey)
keyInput.addEventListener("keydown", (e) => {
    if (e.repeat || e.key != "Enter") return

    addKey()
})

window.addEventListener("resize", () => {
    lineCanvas.width = window.innerWidth
    lineCanvas.height = window.innerHeight
    drawLines()
})
