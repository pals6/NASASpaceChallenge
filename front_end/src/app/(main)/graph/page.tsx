"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Network, Info, Zap } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { getGraphData, getNodeColors, getNodeDescription } from "@/lib/api";

export default function GraphPage() {
  const { selectedNode, setSelectedNode } = useAppContext();
  const { nodes: mockNodes, edges: mockEdges } = getGraphData();
  const nodeColors = getNodeColors();

  const selectedNodeData = mockNodes.find((n) => n.id === selectedNode);

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500">
            <Network className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Knowledge Graph</h1>
            <p className="text-muted-foreground">
              Discover connections in space biology research
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Badge variant="secondary" className="gap-2 rounded-lg px-3 py-1.5">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            Studies
          </Badge>
          <Badge variant="secondary" className="gap-2 rounded-lg px-3 py-1.5">
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            Topics
          </Badge>
          <Badge variant="secondary" className="gap-2 rounded-lg px-3 py-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            Missions
          </Badge>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,350px]">
        {/* Graph Visualization */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Interactive Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-[600px] w-full overflow-hidden rounded-xl border bg-gradient-to-br from-background to-muted/20">
              <svg width="100%" height="100%" viewBox="0 0 800 600">
                {/* Edges */}
                {mockEdges.map((edge, i) => {
                  const fromNode = mockNodes.find((n) => n.id === edge.from);
                  const toNode = mockNodes.find((n) => n.id === edge.to);
                  if (!fromNode || !toNode) return null;

                  return (
                    <line
                      key={i}
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-border"
                      opacity="0.4"
                    />
                  );
                })}

                {/* Nodes */}
                {mockNodes.map((node) => {
                  const isSelected = selectedNode === node.id;
                  return (
                    <g
                      key={node.id}
                      onClick={() => setSelectedNode(node.id)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isSelected ? 35 : 30}
                        fill={nodeColors[node.type]}
                        className="transition-all"
                        opacity={isSelected ? 1 : 0.8}
                      />
                      <text
                        x={node.x}
                        y={node.y + 5}
                        fontSize="14"
                        fill="white"
                        textAnchor="middle"
                        className="font-semibold pointer-events-none"
                      >
                        {node.label.split(" ")[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="absolute bottom-4 left-4 right-4">
                <Card className="bg-background/95 backdrop-blur">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Click on any node to see details
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Node Details Sidebar */}
        <div className="space-y-6">
          {selectedNodeData ? (
            <Card className="rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: nodeColors[selectedNodeData.type] }}
                  />
                  <CardTitle className="text-lg">{selectedNodeData.label}</CardTitle>
                </div>
                <Badge variant="secondary" className="rounded-lg w-fit">
                  {selectedNodeData.type}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Connected To:</h4>
                  <div className="space-y-2">
                    {mockEdges
                      .filter(
                        (e) => e.from === selectedNodeData.id || e.to === selectedNodeData.id
                      )
                      .map((edge, i) => {
                        const connectedId =
                          edge.from === selectedNodeData.id ? edge.to : edge.from;
                        const connectedNode = mockNodes.find((n) => n.id === connectedId);
                        if (!connectedNode) return null;

                        return (
                          <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start gap-2 rounded-lg"
                            onClick={() => setSelectedNode(connectedNode.id)}
                          >
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: nodeColors[connectedNode.type] }}
                            />
                            {connectedNode.label}
                          </Button>
                        );
                      })}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-sm">Description:</h4>
                  <p className="text-sm text-muted-foreground">
                    {getNodeDescription(selectedNodeData.type)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl">
              <CardContent className="pt-6 text-center">
                <Network className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Select a node to view details and connections
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-2xl bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">About the Graph</h3>
              <p className="text-sm text-muted-foreground">
                This visualization shows how studies, topics, and missions are interconnected
                in space biology research. Explore the relationships to discover new insights.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
