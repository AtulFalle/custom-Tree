import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TodoItemNode } from './todoitemNode.class';

/**
 * The Json object for to-do list data.
 */


const TREE_DATA1: TodoItemNode[] = [
  {
    id: 1,
    item: 'My Queries',
    children: [
      {
        id: 2,
        item: 'Equality',
      },
      {
        id: 3,
        item: 'Bias',
        children: [
          {
            id: 4,
            item: 'Gender',
          },
          {
            id: 5,
            item: 'Racial',
          },
          {
            id: 6,
            item: 'Social',
          },
        ],
      },
      {
        id: 7,
        item: 'CO2',
      },
      {
        id: 8,
        item: 'Equality',
      },
      {
        id: 9,
        item: 'Light',
      },
    ],
  },
];
const TREE_DATA = {
  Groceries: ['Almond Meal flour', 'Organic eggs', 'Protein Powder'],
  Fruits: {
    Apple: null,
    Berries: ['Blueberry', 'Raspberry'],
    Orange: null,
  },
  Reminders: [
    'Cook dinner',
    'Read the Material Design spec',
    'Upgrade Application to Angular',
  ],
};

@Injectable({
  providedIn: 'root',
})
export class TreeServiceService {
  dataChange = new BehaviorSubject<TodoItemNode[]>([]);

  get data(): TodoItemNode[] {
    return this.dataChange.value;
  }

  constructor() {
    this.initialize();
  }

  initialize() {
    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    //     file node as children.
    //const data = this.buildFileTree(TREE_DATA, 0);
    const data = TREE_DATA1;

    // Notify the change.
    this.dataChange.next(data);
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `TodoItemNode`.
   */
  buildFileTree(obj: { [key: string]: any }, level: number): TodoItemNode[] {
    return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new TodoItemNode();
      node.item = key;

      if (value != null) {
        if (typeof value === 'object') {
          node.children = this.buildFileTree(value, level + 1);
        } else {
          node.item = value;
        }
      }

      return accumulator.concat(node);
    }, []);
  }

  /** Add an item to to-do list */
  insertItem(parent: TodoItemNode, name: string) {
    if (parent.children) {
      parent.children.push({ item: name } as TodoItemNode);
      this.dataChange.next(this.data);
    }
  }

  createSubFolder(parent: TodoItemNode, name: string) {
    if (parent.children) {
      parent.children.unshift({ item: name, children:[], id: +(Math.random() *100).toFixed(0)  } as TodoItemNode);
      this.dataChange.next(this.data);
    }
  }

  updateChildrenOrder(parent: TodoItemNode, children: TodoItemNode[]) {
    console.log(parent);
    if (parent.children) {
      parent.children = children;
      const newData = this.updateNode(this.data, parent);
      console.log('inside servce', newData);
      this.dataChange.next(newData);
    }
  }

  updateItem(node: TodoItemNode, name: string) {
    node.item = name;
    this.dataChange.next(this.data);
  }

  deleteNodeFromTree(parent: TodoItemNode) {
    const newTree = this.deleteNode(this.data, parent);
    console.log('inside delete tree', newTree)
    this.dataChange.next(newTree);

  }

  updateNode(arr: TodoItemNode[], node: TodoItemNode): TodoItemNode[] {
    arr.forEach((ele) => {
      if (ele.id == node.id) {
        ele = node;
      } else {
       ele.children ? this.updateNode(ele.children, node): '';
      }
    });
    return arr;
  }

  deleteNode(arr: TodoItemNode[], node: TodoItemNode): TodoItemNode[] {

    console.log('in the delete function', node, arr)
    arr.forEach((ele) => {
      console.log(ele);
      if (ele.id == node.id) {
        arr.splice(arr.findIndex(ele => ele.id == node.id), 1);
        console.log('inside array');
        console.log(arr);
      } else {
        ele.children ? this.deleteNode(ele.children, node): '';
      }
    });
    return arr;
  }
}
