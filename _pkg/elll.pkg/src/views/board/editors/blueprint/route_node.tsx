// src/components/RouteNode.tsx
import React from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { RouteNodeData } from "./type";

function RouteNode({ data }: NodeProps<RouteNodeData>) {
  return (
    <div className="el-bg-bg-200 el-border el-border-bg-300 el-rounded el-py-2.5 el-px-4 el-text-xs el-min-w-[150px] el-text-center el-shadow">
      {/* Handle for incoming connections (from parent) */}
      <Handle
        type="target"
        position={Position.Top}
        className="el-bg-gray-600"
      />

      {/* Node Content */}
      <span className="el-font-bold el-mb-[5px] el-block el-text-sm">
        {data.segment || "/"}
      </span>
      {data.name && (
        <span className="el-text-gray-600 el-text-[10px] el-mt-[3px] el-block">
          Name: {data.name}
        </span>
      )}
      {data.layoutId && (
        <span className="el-text-gray-600 el-text-[10px] el-mt-[3px] el-block">
          Layout ID: {data.layoutId}
        </span>
      )}
      {data.viewId && (
        <span className="el-text-gray-600 el-text-[10px] el-mt-[3px] el-block">
          View ID: {data.viewId}
        </span>
      )}

      {/* Handle for outgoing connections (to children) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="el-bg-gray-600"
      />
    </div>
  );
}

export default React.memo(RouteNode); // Memoize for performance
