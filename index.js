const div_nodes = document.querySelector(".nodes")

class HeapNodeElement {
    constructor(key, left, right) {
        this.key = key
        this.element = document.createElement("div")
        this.element.innerText = key
        div_nodes.appendChild(this.element)

        this.left = left
        this.right = right
    }

    static swap(target) {
        let temp = this.key
        this.key = target.key
        target.key = temp

        this.element.innerText = this.key
        target.innerText = target.key
    }
}
