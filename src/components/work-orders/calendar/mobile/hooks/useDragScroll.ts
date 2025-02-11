
import { useState, useRef, RefObject } from "react"

export function useDragScroll(scrollRef: RefObject<HTMLDivElement>) {
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [dragStartTime, setDragStartTime] = useState(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX)
    setScrollLeft(scrollRef.current.scrollLeft)
    setDragStartTime(Date.now())
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX
    const walk = (startX - x) * 2
    scrollRef.current.scrollLeft = scrollLeft + walk
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.touches[0].pageX)
    setScrollLeft(scrollRef.current.scrollLeft)
    setDragStartTime(Date.now())
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return
    const x = e.touches[0].pageX
    const walk = (startX - x) * 2
    scrollRef.current.scrollLeft = scrollLeft + walk
  }

  const stopDragging = (e?: React.MouseEvent | React.TouchEvent) => {
    const dragDuration = Date.now() - dragStartTime
    setIsDragging(false)

    if (dragDuration < 150) {
      return false
    }
    
    if (e) {
      e.preventDefault()
    }
    return true
  }

  return {
    handleMouseDown,
    handleMouseMove,
    handleTouchStart,
    handleTouchMove,
    stopDragging,
    isDragging
  }
}
