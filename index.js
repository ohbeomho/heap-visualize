const nodesDiv = document.querySelector("#nodes")
const keyInput = document.querySelector("input#key"),
    addButton = document.querySelector("button#add"),
    popButton = document.querySelector("button#pop")

// 노드들을 연결하는 선을 그리기 위한 캔버스
const lineCanvas = document.querySelector("#nodes canvas")
const ctx = lineCanvas.getContext("2d")

ctx.strokeStyle = "black"
ctx.lineWidth = 3

lineCanvas.width = window.innerWidth
lineCanvas.height = window.innerHeight

const MAX_NODES = 1024 // 2^10
const BASE_Y = 50
const FLOOR_HEIGHT = 100

let last = 0

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

class Heap {
    constructor() {
        /**
         * @type {HeapNode[]}
         */
        this.nodes = [null]
    }

    /**
     * @param {number} idx1
     * @param {number} idx2
     */
    swap(idx1, idx2) {
        const temp = this.nodes[idx1]
        this.nodes[idx1] = this.nodes[idx2]
        this.nodes[idx2] = temp
    }

    /**
     * @param {number} key
     */
    insert(key) {
        if (last === 1024) return

        addKey(key)

        /**
         * @type {number[][]}
         */
        const swaps = []

        let curr = last
        const parent = () => Math.floor(curr / 2)
        while (curr > 1 && key > this.nodes[parent()].key) {
            this.swap(curr, parent())
            swaps.push([curr, parent()])
            curr = parent()
        }

        console.log(this.nodes)

        return swaps
    }

    pop() {
        popKey()

        /**
         * @type {number[][]}
         */
        const swaps = []

        let curr = 1
        while (true) {
            const left = curr * 2
            const right = curr * 2 + 1

            if (left > last) break

            let maxChild = left
            if (right <= last && this.nodes[right].key > this.nodes[left].key)
                maxChild = right

            if (this.nodes[maxChild].key > this.nodes[curr].key) {
                this.swap(maxChild, curr)
                curr = maxChild

                swaps.push([maxChild, curr])
            } else break
        }

        return swaps
    }

    get empty() {
        return last === 0
    }

    get top() {
        if (this.empty) return null
        return this.nodes[1]
    }
}

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

    heap.nodes.push(new HeapNode(key))
    last++
    if (floors[last]) currFloor++
    heap.nodes[last].element.style.top =
        `${BASE_Y + (currFloor - 1) * FLOOR_HEIGHT}px`
    // 중앙 정렬
    heap.nodes[last].element.style.left =
        `calc(50% + ${((last + 1 / 2 - Math.pow(2, currFloor - 1) - Math.pow(2, currFloor - 2)) * Math.pow(2, 10 - currFloor)) / 5}rem - 1.5rem)`

    drawLines()
}

function popKey() {
    heap.nodes[1].element.remove()
    heap.nodes[1] = heap.nodes[last]
    heap.nodes.pop()
    last--

    drawLines()
}

function drawLines() {
    ctx.clearRect(0, 0, lineCanvas.width, lineCanvas.height)

    for (let i = last; i > 1; i--) {
        const { x, y } = heap.nodes[i].coords,
            { x: px, y: py } = heap.nodes[Math.floor(i / 2)].coords

        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(px, py)
        ctx.stroke()
    }
}

const heap = new Heap()

addButton.addEventListener("click", () => heap.insert(keyInput.valueAsNumber))
keyInput.addEventListener("keydown", (e) => {
    if (e.repeat || e.key != "Enter") return

    console.log(heap.insert(keyInput.valueAsNumber))
})

popButton.addEventListener("click", () => console.log(heap.pop()))

window.addEventListener("resize", () => {
    lineCanvas.width = window.innerWidth
    lineCanvas.height = window.innerHeight
    drawLines()
})
