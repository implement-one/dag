import React from "react";
import styled from "styled-components";
import Node from "./Node";
import { NodeGraphContext } from "./NodeGraphManager";
import { gridImageGenerator } from "../lib/gridImageGenerator";

const gridImage = gridImageGenerator({ size: 100, subdivisions: 4 });

interface NodeGraphProps {
  className?: string;
}

export const NodeGraph: React.FC<NodeGraphProps> = ({ className }) => {
  const { state, dispatch } = React.useContext(NodeGraphContext);
  const { nodes } = state;

  return (
    <div className={className}>
      <div className="contents">
        {nodes.map(node => (
          <Node {...node} dispatch={dispatch} />
        ))}
      </div>
    </div>
  );
};

const NodeGraphCanvas: React.FC = styled(NodeGraph)`
  width: 80vw;
  height: 80vh;

  .contents {
    background-image: url(${gridImage});
    height: 100%;
    width: 100%;
  }
`;

NodeGraphCanvas.displayName = "NodeGraphCanvas";
