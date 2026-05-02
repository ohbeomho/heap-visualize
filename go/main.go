package main

import (
	"fmt"
)

type HeapNode struct {
	key int32
}

type Heap struct {
	nodes []*HeapNode
	last  int32
	// 반환값이 0보다 작으면 첫번째 값이 더 우선순위가 높고,
	// 0보다 크면 두번째 값이 더 우선순위가 높음
	compare func(int32, int32) int32
}

func NewHeap() *Heap {
	return &Heap{nodes: make([]*HeapNode, 100), compare: func(i1, i2 int32) int32 {
		// 더 큰 값이 우선순위가 높음 (최대 힙)
		return i2 - i1
	}}
}

func NewHeapNode(key int32) *HeapNode {
	return &HeapNode{key: key}
}

func (h *Heap) swapNodes(idx1 int32, idx2 int32) {
	temp := h.nodes[idx1]
	h.nodes[idx1] = h.nodes[idx2]
	h.nodes[idx2] = temp
}

func (h *Heap) Empty() bool {
	return h.last == 0
}

func (h *Heap) Insert(key int32) {
	if h.last+1 >= (int32)(len(h.nodes)) {
		var temp []*HeapNode
		copy(temp, h.nodes)

		h.nodes = make([]*HeapNode, len(h.nodes)*2)
		copy(h.nodes, temp)
	}

	h.nodes[h.last+1] = NewHeapNode(key)
	curr := h.last + 1

	for (curr > 1) && (h.compare(h.nodes[curr].key, h.nodes[curr/2].key) < 0) {
		h.swapNodes(curr, curr/2)
		curr = curr / 2
	}

	h.last++
}

func (h *Heap) Top() *HeapNode {
	if h.Empty() {
		return nil
	}

	return h.nodes[1]
}

func (h *Heap) Pop() *HeapNode {
	top := h.Top()
	if top == nil {
		return nil
	}

	h.nodes[1] = h.nodes[h.last]
	h.nodes[h.last] = nil
	h.last--

	var curr int32 = 1

	for curr*2 <= h.last {
		var keyLeft, keyRight *int32
		keyLeft = &(h.nodes[curr*2].key)
		if curr*2+1 <= h.last {
			keyRight = &(h.nodes[curr*2+1].key)
		}

		maxKey := keyLeft
		maxPos := curr * 2
		if (keyRight != nil) && (h.compare(*keyRight, *keyLeft) < 0) {
			maxKey = keyRight
			maxPos = curr*2 + 1
		}

		if h.compare(h.nodes[curr].key, *maxKey) < 0 {
			break
		}

		h.swapNodes(curr, maxPos)
		curr = maxPos
	}

	return top
}

var globalHeap *Heap

//go:wasmexport HeapInsert
func HeapInsert(key int32) {
	globalHeap.Insert(key)
}

//go:wasmexport HeapPop
func HeapPop() int32 {
	return globalHeap.Pop().key
}

//go:wasmexport HeapTop
func HeapTop() int32 {
	return globalHeap.Top().key
}

//go:wasmexport HeapEmpty
func HeapEmpty() bool {
	return globalHeap.Empty()
}

func main() {
	globalHeap = NewHeap()
	fmt.Println("Hello, World!")
}
