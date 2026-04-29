package main

import "fmt"

type Heap struct {
	nodes []*int
	last  int
	// 반환값이 0보다 작으면 첫번째 값이 더 우선순위가 높고,
	// 0보다 크면 두번째 값이 더 우선순위가 높음
	compare func(int, int) int
}

func NewHeap() Heap {
	return Heap{nodes: make([]*int, 100), compare: func(i1, i2 int) int {
		// 더 큰 값이 우선순위가 높음 (최대 힙)
		return i2 - i1
	}}
}

func (h *Heap) swapNodes(idx1 int, idx2 int) {
	temp := h.nodes[idx1]
	h.nodes[idx1] = h.nodes[idx2]
	h.nodes[idx2] = temp
}

func (h *Heap) Empty() bool {
	return h.last == 0
}

func (h *Heap) Insert(key int) {
	if h.last+1 >= len(h.nodes) {
		var temp []*int
		copy(temp, h.nodes)

		h.nodes = make([]*int, len(h.nodes)*2)
		copy(h.nodes, temp)
	}

	h.nodes[h.last+1] = &key
	curr := h.last + 1

	for (curr > 1) && (h.compare(*h.nodes[curr], *h.nodes[curr/2]) < 0) {
		h.swapNodes(curr, curr/2)
		curr = curr / 2
	}

	h.last++
}

func (h *Heap) Top() *int {
	if h.Empty() {
		return nil
	}

	return h.nodes[1]
}

func (h *Heap) Pop() *int {
	top := h.Top()
	if top == nil {
		return nil
	}

	h.nodes[1] = h.nodes[h.last]
	h.nodes[h.last] = nil
	h.last--

	curr := 1

	for curr*2 <= h.last {
		var keyLeft, keyRight *int
		keyLeft = h.nodes[curr*2]
		if curr*2+1 <= h.last {
			keyRight = h.nodes[curr*2+1]
		}

		maxKey := keyLeft
		maxPos := curr * 2
		if (keyRight != nil) && (h.compare(*keyRight, *keyLeft) < 0) {
			maxKey = keyRight
			maxPos = curr*2 + 1
		}

		if h.compare(*h.nodes[curr], *maxKey) < 0 {
			break
		}

		h.swapNodes(curr, maxPos)
		curr = maxPos
	}

	return top
}

func main() {
	h := NewHeap()
	h.Insert(10)
	h.Insert(40)
	h.Insert(20)
	h.Insert(30)

	for !h.Empty() {
		fmt.Println(*h.Pop())
	}
}
