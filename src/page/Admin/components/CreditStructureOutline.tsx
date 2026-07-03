import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent, type UniqueIdentifier } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiMove } from "react-icons/fi";
import { Badge, Button, EmptyState, cn } from "@aottg2/ui";
import type { AdminCreditCategory } from "../../../auth/creditsTypes";

export type CreditEditorSelection =
  | { type: "category"; categoryId: string }
  | { type: "group"; categoryId: string; groupId: string };

type ParsedSortableId =
  | { type: "category"; categoryId: string }
  | { type: "group"; categoryId: string; groupId: string };

const categorySortableId = (categoryId: string) => `category:${categoryId}`;
const groupSortableId = (categoryId: string, groupId: string) => `group:${categoryId}:${groupId}`;

function parseSortableId(id: UniqueIdentifier): ParsedSortableId | null {
  const [type, categoryId, groupId] = String(id).split(":");
  if (type === "category" && categoryId) return { type, categoryId };
  if (type === "group" && categoryId && groupId) return { type, categoryId, groupId };
  return null;
}

export function CreditStructureOutline({
  canUpdate,
  categories,
  saving,
  selection,
  onAddCategory,
  onReorderCategory,
  onReorderGroup,
  onSelect,
}: {
  canUpdate: boolean;
  categories: AdminCreditCategory[];
  saving: boolean;
  selection: CreditEditorSelection | null;
  onAddCategory: () => void;
  onReorderCategory: (activeCategoryId: string, overCategoryId: string) => void;
  onReorderGroup: (categoryId: string, activeGroupId: string, overGroupId: string) => void;
  onSelect: (selection: CreditEditorSelection) => void;
}) {
  const dragEnabled = canUpdate && !saving;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!dragEnabled || !over || active.id === over.id) return;

    const activeItem = parseSortableId(active.id);
    const overItem = parseSortableId(over.id);
    if (!activeItem || !overItem || activeItem.type !== overItem.type) return;

    if (activeItem.type === "category" && overItem.type === "category") {
      onReorderCategory(activeItem.categoryId, overItem.categoryId);
      return;
    }

    if (activeItem.type === "group" && overItem.type === "group" && activeItem.categoryId === overItem.categoryId) {
      onReorderGroup(activeItem.categoryId, activeItem.groupId, overItem.groupId);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Structure</h3>
          <p className="text-xs text-muted-foreground">{categories.length} categories</p>
        </div>
        {canUpdate ? <Button type="button" variant="secondary" disabled={saving} onClick={onAddCategory}>Add category</Button> : null}
      </div>

      {categories.length ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={categories.map((category) => categorySortableId(category.id))} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {categories.map((category) => {
                const categorySelected = selection?.type === "category" && selection.categoryId === category.id;

                return (
                  <SortableCategoryRow
                    key={category.id}
                    canDrag={dragEnabled}
                    category={category}
                    selected={categorySelected}
                    onSelect={() => onSelect({ type: "category", categoryId: category.id })}
                  >
                    {category.groups.length ? (
                      <div className="space-y-1 pl-4">
                        <SortableContext items={category.groups.map((group) => groupSortableId(category.id, group.id))} strategy={verticalListSortingStrategy}>
                          {category.groups.map((group) => {
                            const groupSelected = selection?.type === "group" && selection.categoryId === category.id && selection.groupId === group.id;
                            return (
                              <SortableGroupRow
                                key={group.id}
                                canDrag={dragEnabled}
                                categoryId={category.id}
                                group={group}
                                selected={groupSelected}
                                onSelect={() => onSelect({ type: "group", categoryId: category.id, groupId: group.id })}
                              />
                            );
                          })}
                        </SortableContext>
                      </div>
                    ) : null}
                  </SortableCategoryRow>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <EmptyState title="No credits yet" description="Add a category to start." action={canUpdate ? <Button type="button" onClick={onAddCategory}>Add category</Button> : undefined} />
      )}
    </div>
  );
}

function SortableCategoryRow({
  canDrag,
  category,
  children,
  selected,
  onSelect,
}: {
  canDrag: boolean;
  category: AdminCreditCategory;
  children: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}) {
  const { attributes, isDragging, listeners, setActivatorNodeRef, setNodeRef, transform, transition } = useSortable({
    id: categorySortableId(category.id),
    disabled: !canDrag,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn("space-y-1", isDragging && "relative z-10 opacity-80")}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <div className="flex items-stretch gap-2">
        {canDrag ? (
          <button
            ref={setActivatorNodeRef}
            type="button"
            className="flex w-10 shrink-0 items-center justify-center border border-border bg-background/40 text-muted-foreground transition-colors hover:border-primary/70 hover:bg-background/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            title="Drag category"
            aria-label={`Drag ${category.name || "Untitled category"}`}
            {...attributes}
            {...listeners}
          >
            <FiMove />
          </button>
        ) : null}
        <button
          type="button"
          className={cn(
            "min-w-0 flex-1 border border-border bg-background/40 p-3 text-left transition-colors hover:border-primary/70 hover:bg-background/70",
            selected && "border-primary bg-primary/10"
          )}
          onClick={onSelect}
        >
          <div className="flex min-w-0 items-center justify-between gap-3">
            <span className="truncate text-sm font-semibold text-foreground">{category.name || "Untitled category"}</span>
            <Badge variant="outline">{category.contributors.length}</Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="textured">{category.groups.length} groups</Badge>
            {category.description ? <Badge variant="outline">description</Badge> : null}
          </div>
        </button>
      </div>
      {children}
    </div>
  );
}

function SortableGroupRow({
  canDrag,
  categoryId,
  group,
  selected,
  onSelect,
}: {
  canDrag: boolean;
  categoryId: string;
  group: AdminCreditCategory["groups"][number];
  selected: boolean;
  onSelect: () => void;
}) {
  const { attributes, isDragging, listeners, setActivatorNodeRef, setNodeRef, transform, transition } = useSortable({
    id: groupSortableId(categoryId, group.id),
    disabled: !canDrag,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn("flex items-stretch gap-2", isDragging && "relative z-10 opacity-80")}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      {canDrag ? (
        <button
          ref={setActivatorNodeRef}
          type="button"
          className="flex w-9 shrink-0 items-center justify-center border border-border bg-background/30 text-muted-foreground transition-colors hover:border-primary/70 hover:bg-background/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          title="Drag subcategory"
          aria-label={`Drag ${group.title || "Untitled group"}`}
          {...attributes}
          {...listeners}
        >
          <FiMove />
        </button>
      ) : null}
      <button
        type="button"
        className={cn(
          "min-w-0 flex-1 border border-border bg-background/30 px-3 py-2 text-left transition-colors hover:border-primary/70 hover:bg-background/70",
          selected && "border-primary bg-primary/10"
        )}
        onClick={onSelect}
      >
        <div className="flex min-w-0 items-center justify-between gap-3">
          <span className="truncate text-sm text-foreground">{group.title || "Untitled group"}</span>
          <Badge variant="outline">{group.contributors.length}</Badge>
        </div>
        {group.description ? <Badge variant="outline" className="mt-2">description</Badge> : null}
      </button>
    </div>
  );
}
