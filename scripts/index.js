const nodesDiv = document.querySelector('.nodes')
const keyInput = document.querySelector('input#key'),
    addKeyButton = document.querySelector('button#add')

const nodes = [null]
let last = 0

class HeapNodeElement {
    constructor(key) {
        this.key = key
        this.element = document.createElement('div')
        this.element.classList.add('heap-node')
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
}

const MAX_NODES = 1024
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

    nodes[++last] = new HeapNodeElement(key)
    if (floors[last]) currFloor++
    nodes[last].style.top = `${BASE_Y + (currFloor - 1) * FLOOR_HEIGHT}px`
}

addKeyButton.addEventListener('click', addKey)
