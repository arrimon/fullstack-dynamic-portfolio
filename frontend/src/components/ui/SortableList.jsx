"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reusable bulk reorder state for admin lists.
 *
 * `items` is the source of truth from the server. `onReorder` receives the new
 * ordered list of ids and should persist them (throwing on failure rolls the UI
 * back to the previous order).
 */
export function useDragReorder(items, getKey, onReorder) {
  const [ordered, setOrdered] = useState(items);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setOrdered(items);
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 160, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ordered.findIndex((i) => getKey(i) === active.id);
    const newIndex = ordered.findIndex((i) => getKey(i) === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(ordered, oldIndex, newIndex);
    setOrdered(next);
    setSaving(true);
    try {
      await onReorder(next.map(getKey));
    } catch {
      setOrdered(items);
    } finally {
      setSaving(false);
    }
  };

  return { ordered, saving, sensors, handleDragEnd, setOrdered };
}

export function DragHandle({ attributes, listeners, className }) {
  return (
    <button
      type="button"
      aria-label="Drag to reorder"
      {...attributes}
      {...listeners}
      className={cn(
        "flex h-8 w-8 cursor-grab touch-none items-center justify-center rounded-md text-cream-faint transition-colors hover:bg-accent-faint hover:text-accent-strong active:cursor-grabbing",
        className
      )}
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );
}

/**
 * Render-prop sortable wrapper. The consumer applies `setNodeRef`, `style`,
 * `attributes` and `listeners` to the element of their choice (tr, li, div…).
 */
export function Sortable({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return children({ attributes, listeners, setNodeRef, style, isDragging });
}

export function SortableList({
  items,
  getKey = (item) => item.id,
  onReorder,
  className,
  renderRow,
  disabled,
}) {
  const { ordered, saving, sensors, handleDragEnd } = useDragReorder(
    items,
    getKey,
    onReorder
  );

  if (disabled) {
    return <div className={className}>{items.map((item) => renderRow(item, null, false))}</div>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ordered.map(getKey)} strategy={verticalListSortingStrategy}>
        <div className={className}>
          {ordered.map((item) => (
            <Sortable key={getKey(item)} id={getKey(item)}>
              {({ attributes, listeners, setNodeRef, style, isDragging }) =>
                renderRow(
                  item,
                  { attributes, listeners, setNodeRef, isDragging },
                  isDragging
                )
              }
            </Sortable>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
