import * as React from "react";
import uuid from "uuid/v4";

export interface NodeInterface {
  id: string;
  x: number;
  y: number;
  name: string;
  inputs: NodeInput<any>[];
  outputs: NodeOutput[];
}

interface NodeInput<T> {
  name: string;
  value: T;
}

interface NodeOutput {
  name: string;
}

interface State {
  nodes: NodeInterface[];
}

interface NodeGraphManagerProps {
  children: React.ReactNode;
}

export type AddAction = {
  type: "ADD_NODE";
  name?: string;
  inputs?: NodeInput<any>[];
  outputs?: NodeOutput[];
};

export type MoveAction = {
  type: "MOVE_NODE";
  id: string;
  x: number;
  y: number;
};

export type Action = MoveAction | AddAction;

export type UpdateType = React.Dispatch<Action>;

export const NodeGraphManager: React.FC<NodeGraphManagerProps> = ({
  children
}): React.ReactElement => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  return (
    <NodeGraphContext.Provider value={{ state, dispatch }}>
      {children}
    </NodeGraphContext.Provider>
  );
};

function reducer(state: State, action: Action) {
  switch (action.type) {
    case "ADD_NODE":
      return {
        ...state,
        nodes: [...state.nodes, createNode(action)]
      };
    case "MOVE_NODE":
      return {
        ...state,
        nodes: moveNode(state.nodes, action)
      };
  }
  return state;
}

function createNode({ name, inputs, outputs }: AddAction): NodeInterface {
  return {
    id: uuid(),
    x: 0,
    y: 0,
    name: name || "New Node",
    inputs: inputs || [],
    outputs: outputs || []
  };
}

function moveNode(
  nodes: NodeInterface[],
  { id, x, y }: MoveAction
): NodeInterface[] {
  const index = nodes.findIndex(node => id === node.id);
  const node = nodes[index];
  return [
    ...nodes.slice(0, index),
    { ...node, x, y },
    ...nodes.slice(index + 1)
  ];
}

const initialState: State = {
  nodes: []
};

const defaultUpdate: UpdateType = () => {};

export const NodeGraphContext = React.createContext({
  state: initialState,
  dispatch: defaultUpdate
});
