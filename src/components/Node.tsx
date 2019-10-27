import React from "react";
import styled, { StyledComponent } from "styled-components";
import { UpdateType, NodeInterface } from "./NodeGraphManager";

type NodeProps = {
  dispatch: UpdateType;
  className?: string;
} & NodeInterface;

const Node: React.FC<NodeProps> = ({
  id,
  x,
  y,
  name,
  inputs,
  outputs,
  dispatch,
  className
}) => {
  const nodeRef = React.useRef<HTMLDivElement | null>(null);
  let moving = false;
  let prevX = x;
  let prevY = y;

  const handleMouseDown = React.useCallback(event => {
    if (
      nodeRef.current &&
      (event.target === nodeRef.current ||
        nodeRef.current.contains(event.target))
    ) {
      moving = true;
      window.requestAnimationFrame(animateMovement);
    }
  }, []);

  const handleMouseMove = React.useCallback((event: MouseEvent) => {
    const { movementX, movementY } = event;

    if (nodeRef.current && moving) {
      prevX += movementX;
      prevY += movementY;
    }
  }, []);

  const handleMouseUp = React.useCallback(event => {
    const { clientX: x, clientY: y } = event;
    if (moving) {
      moving = false;
      dispatch({ type: "MOVE_NODE", id, x, y });
    }
  }, []);

  const animateMovement = () => {
    if (moving && nodeRef.current) {
      nodeRef.current.style.transform = `translate(${prevX}px, ${prevY}px)`;
      window.requestAnimationFrame(animateMovement);
    }
  };

  React.useEffect(() => {
    let nodeEl = nodeRef.current;
    if (nodeEl) {
      window.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (nodeEl) {
        window.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [nodeRef.current]);

  return (
    <div className={className} ref={nodeRef} {...{ x, y }}>
      <div className="name">{name}</div>
      <NodeProperties>
        <div className="inputs">
          {inputs.map(input => (
            <div>{input.name}</div>
          ))}
        </div>
        <div className="outputs">
          {outputs.map(output => (
            <div>{output.name}</div>
          ))}
        </div>
      </NodeProperties>
    </div>
  );
};

const NodeProperties = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 4px 12px 8px;

  .inputs {
  }
  .inputs > div {
    position: relative;
  }
  .inputs > div:before {
    left: -18px;
    top: 5px;
  }
  .outputs {
    position: relative;
    text-align: right;
  }

  .outputs > div:before {
    top: 5px;
    right: -18px;
  }

  .inputs > div:before,
  .outputs > div:before {
    display: block;
    position: absolute;
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #ccc;
    border: 2px #aaa solid;
  }
`;

const StyledNode = styled(Node)<{ x: number; y: number }>`
  position: absolute;
  top: 0;
  left: 0;
  display: inline-block;
  transform: translate(${props => props.x}px, ${props => props.y}px);
  min-width: 100px;
  min-height: 60px;
  border-radius: 8px;
  background-color: #ccc;
  border-color: #aaa;
  user-select: none;

  .name {
    background-color: #aaa;
    border-radius: 8px 8px 0 0;
    padding: 4px 8px;
  }
`;

const NodeMemo: React.MemoExoticComponent<
  StyledComponent<React.FC<NodeProps>, any, { x: number; y: number }>
> = React.memo(StyledNode);

NodeMemo.displayName = "Node";

export default NodeMemo;
