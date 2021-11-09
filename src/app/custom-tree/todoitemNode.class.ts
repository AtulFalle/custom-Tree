
/**
 * Node for to-do item
 */
 export class TodoItemNode {
  children?: TodoItemNode[];
  item!: string;
  id!: number;
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  id!: number;
  item!: string;
  level!: number;
  expandable!: boolean;
  children?: TodoItemNode[]
}
