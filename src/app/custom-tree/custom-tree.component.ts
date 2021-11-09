import { OnInit } from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {Component, Injectable} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import { TodoItemFlatNode, TodoItemNode } from './todoitemNode.class';
import { TreeServiceService } from './tree-service.service';
import { identifierModuleUrl } from '@angular/compiler';
/**
 * Food data with nested structure.
 * Each node has a name and an optional list of children.
 */
interface FoodNode {
  id: number;
  name: string;
  children: FoodNode[];
  showOption?: boolean;
}

const TREE_DATA: FoodNode[] = [
  {
    id: 2,
    name: 'My Queries',
    showOption: false,
    children: [
      {
        id: 3,
        name: 'Equality',
        children: [],
      },
      {
        id: 4,
        name: 'Bias',
        showOption: true,
        children: [
          {
            id: 5,
            name: 'Gender',
            children: [],
          },
          {
            id: 6,
            name: 'Racial',
            children: [],
          },
          {
            id: 7,
            name: 'Social',
            children: [],
          },
        ],
      },
      {
        id: 8,
        name: 'CO2',
        children: [],
      },
      {
        id: 9,
        name: 'Equality',
        children: [],
      },
      {
        id: 10,
        name: 'Light',
        children: [],
      },
    ],
  },
];

@Component({
  selector: 'app-custom-tree',
  templateUrl: './custom-tree.component.html',
  styleUrls: ['./custom-tree.component.scss'],
})
export class CustomTreeComponent {
   /** Map from flat node to nested node. This helps us finding the nested node to be modified */
   flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

   /** Map from nested node to flattened node. This helps us to keep the same object for selection */
   nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

   /** A selected parent node to be inserted */
   selectedParent: TodoItemFlatNode | null = null;

   /** The new item's name */
   newItemName = '';

   treeControl: FlatTreeControl<TodoItemFlatNode>;

   treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

   dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

   /** The selection for checklist */
   checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

   constructor(private _database: TreeServiceService) {
     this.treeFlattener = new MatTreeFlattener(
       this.transformer,
       this.getLevel,
       this.isExpandable,
       this.getChildren,
     );
     this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
     this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

     _database.dataChange.subscribe(data => {
       this.dataSource.data = data;
     });
   }

   getLevel = (node: TodoItemFlatNode) => node.level;

   isExpandable = (node: TodoItemFlatNode) => node.expandable;

   getChildren = (node: TodoItemNode): TodoItemNode[] => node.children || [];

   hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

   hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

   hasNoChildren = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.children ? _nodeData.children.length === 0 : false;

   /**
    * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
    */
   transformer = (node: TodoItemNode, level: number) => {
     const existingNode = this.nestedNodeMap.get(node);
     const flatNode =
       existingNode && existingNode.item === node.item ? existingNode : new TodoItemFlatNode();
     flatNode.item = node.item;
     flatNode.level = level;
     flatNode.expandable = !!node.children;
     flatNode.children = node.children;
     flatNode.id = node.id;
     this.flatNodeMap.set(flatNode, node);
     this.nestedNodeMap.set(node, flatNode);
     return flatNode;
   };

   /* Get the parent node of a node */
   getParentNode(node: TodoItemFlatNode): TodoItemFlatNode | null {
     const currentLevel = this.getLevel(node);

     if (currentLevel < 1) {
       return null;
     }

     const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

     for (let i = startIndex; i >= 0; i--) {
       const currentNode = this.treeControl.dataNodes[i];

       if (this.getLevel(currentNode) < currentLevel) {
         return currentNode;
       }
     }
     return null;
   }

   /** Select the category so we can insert the new item. */
   addNewItem(node: TodoItemFlatNode) {
     const parentNode = this.flatNodeMap.get(node);
     this._database.insertItem(parentNode!, '');
     this.treeControl.expand(node);
   }

   createNewFolder(node: TodoItemFlatNode) {

    const parentNode = this.getParentNode(node);
    //  this._database.insertItem(parentNode!, '');
     this.treeControl.expand(node);
     this._database.createSubFolder(parentNode!, '')
   }

   changeOrder(node: TodoItemFlatNode, action: number) {

    const parentNode = this.getParentNode(node);

    if(!parentNode) {
      return;
    }
    const children = parentNode?.children;
    if(!children) {
      return;
    }
    if(action == 0) {  // 0 means move up
      const currentIndex = children?.findIndex(ele => ele.id == node.id);
      let lastIndex = children?.length -1;

      if(currentIndex && currentIndex > 0) {
        lastIndex = currentIndex -1;
      }
      let temp = children[currentIndex];
      children[currentIndex] = children[lastIndex];
      children[lastIndex] = temp;
      this._database.updateChildrenOrder(parentNode, children )

    } else {
        const currentIndex = children?.findIndex(ele => ele.id == node.id);
        let lastIndex = 0;

        if( currentIndex < children.length - 1 ) {
          lastIndex = currentIndex + 1;
        }
        let temp = children[currentIndex];
        children[currentIndex] = children[lastIndex];
        children[lastIndex] = temp;
        this._database.updateChildrenOrder(parentNode, children )
    }
   }

   /** Save the node to database */
   saveNode(node: TodoItemFlatNode, itemValue: string) {
     const nestedNode = this.flatNodeMap.get(node);
     this._database.updateItem(nestedNode!, itemValue);
   }

   deleteNode(node: TodoItemFlatNode) : void{
     console.log('deleting node');
     this._database.deleteNodeFromTree(node)

   }

   checkIfLastLeafNode(node: TodoItemFlatNode) :boolean {
     const parent = this.getParentNode(node);

     if(parent?.children) {

      return parent.children.length - 1 == parent.children.findIndex(ele => ele.id == node.id);
     }

     return false;
   }


}
