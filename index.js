const nodesDiv = document.querySelector("#nodes")
const keyInput = document.querySelector("input#key"),
    addButton = document.querySelector("button#add"),
    popButton = document.querySelector("button#pop")
const sizeNode = document.querySelector("#size")

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

    static get size() {
        return sizeNode.getBoundingClientRect().width
    }

    static animateSwap(n1, n2) {
        const { x: x1, y: y1 } = n1.coords,
            { x: x2, y: y2 } = n2.coords

        n1.element.animate(
            [
                { left: `${x1}px`, top: `${y1}px` },
                { left: `${x2}px`, top: `${y2}px` },
            ],
            { duration: 500, fill: "forwards" },
        )
        n2.element.animate(
            [
                { left: `${x2}px`, top: `${y2}px` },
                { left: `${x1}px`, top: `${y1}px` },
            ],
            { duration: 500, fill: "forwards" },
        )
    }

    fadeOutRemove() {
        this.element.animate(
            [
                { opacity: 1 },
                { opacity: 0 },
            ],
            { duration: 500, fill: "forwards" },
        ).addEventListener("finish", () => this.element.remove())
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
        if (last === 1024) return

        addKey(key)

        let swapCount = 0

        disableControls()

        let curr = last
        const parent = () => Math.floor(curr / 2)
        while (curr > 1 && key > this.nodes[parent()].key) {
            if (parent() >= 1) {
                const p = parent(),
                    c = curr

                setTimeout(() => {
                    HeapNode.animateSwap(this.nodes[c], this.nodes[p])
                    this.swap(c, p)
                }, ++swapCount * 800)
            }

            curr = parent()
        }

        setTimeout(enableControls, swapCount * 800 + 500)
    }

    pop() {
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
                const m = maxChild,
                    c = curr

                setTimeout(() => {
                    HeapNode.animateSwap(this.nodes[c], this.nodes[m])
                    this.swap(c, m)
                }, ++swapCount * 800)

                curr = maxChild
            } else break
        }

        setTimeout(() => {
            enableControls()
            drawLines()
        }, swapCount * 800 + 500)
    }

    updateCoords() {
        let floor = 0

        for (let i = 1; i <= last; i++) {
            if (Math.pow(2, floor) < i + 1) floor++

            this.nodes[i].element.style.top =
                `${BASE_Y + (floor - 1) * FLOOR_HEIGHT}px`
            this.nodes[i].element.style.left =
                `calc(50% + ${((i + 1 / 2 - Math.pow(2, floor - 1) - Math.pow(2, floor - 2)) * Math.pow(2, 10 - floor)) / 5}rem - 1.5rem)`
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
    heap.nodes[1].element.animate([
        { left: `${x}px`, top: `${y}px` },
        { left: `calc(50% - 1.5rem)`, top: `${BASE_Y}px`}
    ], {duration: 500, fill: "forwards"})
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

function disableControls() {
    for (let i of [keyInput, addButton, popButton]) i.disabled = true
}

function enableControls() {
    for (let i of [keyInput, addButton, popButton]) i.disabled = false
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
