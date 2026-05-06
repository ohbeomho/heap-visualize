const nodesDiv = document.querySelector("#nodes")
const keyInput = document.querySelector("input#key"),
    speedSlider = document.querySelector("input#speed"),
    addButton = document.querySelector("button#add"),
    popButton = document.querySelector("button#pop")
const sizeNode = document.querySelector("#size")

let animDur = 1000 - speedSlider.valueAsNumber * 100

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
const HORIZONTAL_PADDING = 24

let last = 0

class HeapNode {
    constructor(key) {
        this.key = key
        this.element = document.createElement("div")
        this.element.classList.add("heap-node")
        this.element.innerText = key
        nodesDiv.appendChild(this.element)
    }

    static get size() {
        return sizeNode.getBoundingClientRect().width
    }

    static getNodeLeft(idx, floor) {
        const nodeSize = HeapNode.size
        const width = nodesDiv.clientWidth || window.innerWidth
        const treeDepth = Math.ceil(Math.log2(last + 1))
        const bottomCount = Math.pow(2, treeDepth - 1)
        const availableWidth = Math.max(
            width - HORIZONTAL_PADDING * 2 - nodeSize,
            nodeSize,
        )
        const bottomGap = availableWidth / bottomCount
        const levelStart = Math.pow(2, floor - 1)
        const positionInLevel = idx - levelStart
        const levelGap = bottomGap * Math.pow(2, treeDepth - floor)
        const centerX =
            HORIZONTAL_PADDING +
            nodeSize / 2 +
            levelGap / 2 +
            positionInLevel * levelGap

        return centerX - nodeSize / 2
    }

    static animateSwap(n1, n2) {
        const { x: x1, y: y1 } = n1.coords,
            { x: x2, y: y2 } = n2.coords

        n1.element
            .animate(
                [
                    { left: `${x1}px`, top: `${y1}px` },
                    { left: `${x2}px`, top: `${y2}px` },
                ],
                animDur,
            )
            .addEventListener("finish", () => {
                n1.element.style.left = `${x2}px`
                n1.element.style.top = `${y2}px`
            })
        n2.element
            .animate(
                [
                    { left: `${x2}px`, top: `${y2}px` },
                    { left: `${x1}px`, top: `${y1}px` },
                ],
                animDur,
            )
            .addEventListener("finish", () => {
                n2.element.style.left = `${x1}px`
                n2.element.style.top = `${y1}px`
            })
    }

    fadeOutRemove() {
        this.element
            .animate([{ opacity: 1 }, { opacity: 0 }], animDur)
            .addEventListener("finish", () => this.element.remove())
    }

    get coords() {
        const { x, y } = this.element.getBoundingClientRect()
        return { x, y }
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
        if (last === MAX_NODES) return

        addKey(key)

        let swapCount = 0

        disableControls()

        let curr = last
        const parent = () => Math.floor(curr / 2)
        while (curr > 1 && key > this.nodes[parent()].key) {
            if (parent() >= 1) {
                const p = this.nodes[parent()],
                    c = this.nodes[curr]
                this.swap(curr, parent())

                setTimeout(
                    () => HeapNode.animateSwap(p, c),
                    ++swapCount * (animDur + 50),
                )
            }

            curr = parent()
        }

        setTimeout(enableControls, (swapCount + 1) * (animDur + 50) + 10)
    }

    pop() {
        if (this.empty) return

        popKey()

        let swapCount = 0

        disableControls()

        let curr = 1
        while (true) {
            const left = curr * 2
            const right = curr * 2 + 1

            if (left > last) break

            let maxChild = left
            if (right <= last && this.nodes[right].key > this.nodes[left].key)
                maxChild = right

            if (this.nodes[maxChild].key > this.nodes[curr].key) {
                const m = this.nodes[maxChild],
                    c = this.nodes[curr]
                this.swap(curr, maxChild)

                setTimeout(
                    () => HeapNode.animateSwap(c, m),
                    ++swapCount * (animDur + 50),
                )

                curr = maxChild
            } else break
        }

        setTimeout(
            () => {
                enableControls()
                drawLines()
            },
            (swapCount + 1) * (animDur + 50) + 10,
        )
    }

    updateCoords() {
        let floor = 0

        for (let i = 1; i <= last; i++) {
            if (Math.pow(2, floor) < i + 1) floor++

            this.nodes[i].element.style.top =
                `${BASE_Y + (floor - 1) * FLOOR_HEIGHT}px`
            this.nodes[i].element.style.left =
                `${HeapNode.getNodeLeft(i, floor)}px`
            console.log(HeapNode.getNodeLeft(i, floor), i, floor)
        }

        drawLines()
    }

    get empty() {
        return last === 0
    }

    get top() {
        if (this.empty) return null
        return this.nodes[1]
    }
}

function addKey() {
    const key = keyInput.valueAsNumber
    if (isNaN(key)) return
    keyInput.value = ""

    heap.nodes.push(new HeapNode(key))
    last++

    heap.updateCoords()
}

function popKey() {
    heap.nodes[1].fadeOutRemove()
    heap.nodes[1] = heap.nodes[last]
    heap.nodes.pop()
    last--

    if (heap.empty) return

    const { x, y } = heap.nodes[1].coords
    heap.nodes[1].element
        .animate(
            [
                { left: `${x}px`, top: `${y}px` },
                { left: `${HeapNode.getNodeLeft(1, 1)}px`, top: `${BASE_Y}px` },
            ],
            animDur,
        )
        .addEventListener("finish", () => {
            heap.nodes[1].element.style.left = `${HeapNode.getNodeLeft(1, 1)}px`
            heap.nodes[1].element.style.top = `${BASE_Y}px`
        })
}

function drawLines() {
    ctx.clearRect(0, 0, lineCanvas.width, lineCanvas.height)

    for (let i = last; i > 1; i--) {
        const { x, y } = heap.nodes[i].coords,
            { x: px, y: py } = heap.nodes[Math.floor(i / 2)].coords

        ctx.beginPath()
        ctx.moveTo(x + HeapNode.size / 2, y + HeapNode.size / 2)
        ctx.lineTo(px + HeapNode.size / 2, py + HeapNode.size / 2)
        ctx.stroke()
    }
}

const controls = [keyInput, addButton, popButton, speedSlider]

function disableControls() {
    for (let i of controls) i.disabled = true
}

function enableControls() {
    for (let i of controls) i.disabled = false
    keyInput.focus()
}

const heap = new Heap()

addButton.addEventListener("click", () => heap.insert(keyInput.valueAsNumber))
keyInput.addEventListener("keydown", (e) => {
    if (e.repeat || e.key != "Enter") return

    heap.insert(keyInput.valueAsNumber)
})

popButton.addEventListener("click", () => heap.pop())

window.addEventListener("resize", () => {
    lineCanvas.width = window.innerWidth
    lineCanvas.height = window.innerHeight
    heap.updateCoords()
    drawLines()
})

speedSlider.addEventListener(
    "input",
    (e) => (animDur = 1000 - e.target.valueAsNumber * 100),
)
