import React from "react";

interface Coordinates {
  x: number;
  y: number;
}

enum NodeConnectionActionTypes {
  TOGGLE_CONTROL_VISIBLILITY = "TOGGLE_CONTROL_VISIBILITY",
  MOVE_CONTROL_POINT_A = "MOVE_CONTROL_POINT_A",
  MOVE_CONTROL_POINT_B = "MOVE_CONTROL_POINT_B",
  SET_TARGET_POINT = "SET_TARGET_POINT"
}

enum NodeConnectionTargetPoint {
  pointA = "pointA",
  pointB = "pointB",
  controlPointA = "controlPointA",
  controlPointB = "controlPointB"
}

type NodeConnectionActions =
  | {
      type: NodeConnectionActionTypes.MOVE_CONTROL_POINT_A;
      coords: Coordinates;
    }
  | {
      type: NodeConnectionActionTypes.SET_TARGET_POINT;
      targetPoint: NodeConnectionTargetPoint;
    }
  | { type: NodeConnectionActionTypes.TOGGLE_CONTROL_VISIBLILITY };

type NodeConnectionState = {
  controlPointsVisible: boolean;
  targetPoint: NodeConnectionTargetPoint | null;
};

type NodeConnectPoints = {
  pointA: Coordinates;
  pointB: Coordinates;
  controlPointA: Coordinates;
  controlPointB: Coordinates;
};

function reducer(state: NodeConnectionState, action: NodeConnectionActions) {
  switch (action.type) {
    case NodeConnectionActionTypes.MOVE_CONTROL_POINT_A:
      return {
        ...state,
        controlPointA: action.coords
      };
    case NodeConnectionActionTypes.TOGGLE_CONTROL_VISIBLILITY:
      return { ...state, controlPointsVisible: !state.controlPointsVisible };
    case NodeConnectionActionTypes.SET_TARGET_POINT:
      return {
        ...state,
        targetPoint: action.targetPoint
      };
    default:
      return state;
  }
}

const initialState: NodeConnectionState = {
  controlPointsVisible: false,
  targetPoint: null
};

const initalPointCoords = {
  pointA: { x: 10, y: 10 },
  pointB: { x: 100, y: 100 },
  controlPointA: { x: 20, y: 50 },
  controlPointB: { x: 80, y: 50 }
};

type NodeConnectionPaths = {
  pointA: Path2D;
  pointB: Path2D;
  controlPointA: Path2D;
  controlPointB: Path2D;
  curvePath: Path2D;
};

function NodeConnection() {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null);
  const targetPointRef = React.useRef<NodeConnectionTargetPoint | null>(null);
  const pointCoordsRef = React.useRef<NodeConnectPoints>(initalPointCoords);
  const pathsRef = React.useRef<NodeConnectionPaths>(
    getPaths(pointCoordsRef.current)
  );
  const listenersRef = React.useRef<{
    mouseMove: (event: MouseEvent) => void;
    mouseDown: (event: MouseEvent) => void;
  } | null>(null);

  React.useEffect(() => {
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null;
    let paths: NodeConnectionPaths;

    if (canvasRef.current) {
      canvas = canvasRef.current;
      ctxRef.current = ctx = canvas.getContext("2d");
      canvas.width = 200;
      canvas.height = 200;

      if (ctx) {
        paint(ctx, pathsRef.current);
      }

      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      if (canvas && listenersRef.current) {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mouseup", handleMouseUp);
      }
    };
  }, []);

  const paint = React.useCallback(function paint(
    ctx: CanvasRenderingContext2D,
    paths
  ) {
    // Clear canvas
    ctx.rect(0, 0, 200, 200);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Draw snap points
    ctx.strokeStyle = "#aaaaaa";
    ctx.fillStyle = "#eeeeee";
    let snapPointA = new Path2D(makeCirclePath(0, 100, 10));
    ctx.stroke(snapPointA);
    ctx.fill(snapPointA);
    let snapPointB = new Path2D(makeCirclePath(200, 100, 10));
    ctx.stroke(snapPointB);
    ctx.fill(snapPointB);

    // Draw connection path
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.stroke(paths.curvePath);

    ctx.strokeStyle = "#ff0000";
    ctx.fillStyle = "#ff0000";
    ctx.lineWidth = 1;
    ctx.stroke(paths.pointA);
    ctx.fill(paths.pointA);
    ctx.stroke(paths.pointB);
    ctx.fill(paths.pointB);
    ctx.stroke(paths.controlPointA);
    ctx.fill(paths.controlPointA);
    ctx.stroke(paths.controlPointB);
    ctx.fill(paths.controlPointB);
  },
  []);

  const handleMouseDown = React.useCallback(function handleMouseDown(
    event: MouseEvent
  ) {
    if (ctxRef.current) {
      for (let path in pathsRef.current) {
        if (path === "curvePath") continue;
        const coords = pointCoordsRef.current[path as keyof NodeConnectPoints];
        const targetPath = makeCirclePath(coords.x, coords.y, 10);
        const mouseIsInPath = ctxRef.current.isPointInPath(
          new Path2D(targetPath),
          event.offsetX,
          event.offsetY
        );
        if (mouseIsInPath) {
          return (targetPointRef.current = path as NodeConnectionTargetPoint);
        }
      }
    }
  },
  []);

  const handleMouseUp = React.useCallback(function handleMouseUp(
    event: MouseEvent
  ) {
    targetPointRef.current = null;
  },
  []);

  const handleMouseMove = React.useCallback(function handleMouseMove(
    event: MouseEvent
  ) {
    if (ctxRef.current && targetPointRef.current) {
      if (
        ctxRef.current.isPointInPath(
          new Path2D(makeCirclePath(0, 100, 20)),
          event.offsetX,
          event.offsetY
        )
      ) {
        pointCoordsRef.current[targetPointRef.current] = { x: 0, y: 100 };
      } else if (
        ctxRef.current.isPointInPath(
          new Path2D(makeCirclePath(200, 100, 20)),
          event.offsetX,
          event.offsetY
        )
      ) {
        pointCoordsRef.current[targetPointRef.current] = { x: 200, y: 100 };
      } else {
        pointCoordsRef.current[targetPointRef.current] = {
          x: event.offsetX,
          y: event.offsetY
        };
      }
      paint(ctxRef.current, getPaths(pointCoordsRef.current));
    }
  },
  []);

  return (
    <>
      <canvas ref={canvasRef} />
    </>
  );
}

function getPaths(points: NodeConnectPoints) {
  const {
    pointA,
    pointB,
    controlPointA: { x: aX, y: aY },
    controlPointB: { x: bX, y: bY }
  } = points;
  return {
    [NodeConnectionTargetPoint.pointA]: new Path2D(
      makeCirclePath(pointA.x, pointA.y, 5)
    ),
    [NodeConnectionTargetPoint.pointB]: new Path2D(
      makeCirclePath(pointB.x, pointB.y, 5)
    ),
    [NodeConnectionTargetPoint.controlPointA]: new Path2D(
      makeCirclePath(aX, aY, 5)
    ),
    [NodeConnectionTargetPoint.controlPointB]: new Path2D(
      makeCirclePath(bX, bY, 5)
    ),
    curvePath: new Path2D(
      `M ${pointA.x} ${pointA.y} C ${aX} ${aY} ${bX} ${bY} ${pointB.x} ${pointB.y}`
    )
  };
}

function makeCirclePath(cX: number, cY: number, radius: number) {
  return `
    M ${cX} ${cY} 
    m -${radius} 0
    a ${radius}, ${radius} 0 1, 0 ${radius * 2}, 0
    a ${radius}, ${radius} 0 1, 0 -${radius * 2}, 0
  `;
}

export default NodeConnection;
