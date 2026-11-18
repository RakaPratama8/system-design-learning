import type { IconName } from './icons';

export type NodeStatus = 'ok' | 'hot' | 'down';
export interface NodeState { status: NodeStatus; fill?: number; label?: string } // fill 0..1
export interface Point { x: number; y: number }
export interface GraphNode { id: string; label: string; x: number; y: number; icon?: IconName } // viewBox 0 0 400 200
export interface GraphEdge { from: string; to: string } // edge id = `${from}>${to}`
export interface GraphStep {
  caption: string;
  highlight?: string[];
  marker?: string[];
  states?: Record<string, NodeState>;
}
export interface GraphScene { type: 'graph'; nodes: GraphNode[]; edges: GraphEdge[]; steps: GraphStep[] }
export interface Lane { id: string; label: string; icon?: IconName }
export interface SequenceStep {
  caption: string;
  message?: { from: string; to: string; label: string };
  states?: Record<string, NodeState>;
}
export interface SequenceScene { type: 'sequence'; lanes: Lane[]; steps: SequenceStep[] }
export type GraphBody = Pick<GraphScene, 'nodes' | 'edges'>;
export type GraphStepBody = Omit<GraphStep, 'caption'>;
export interface CompareScene {
  type: 'compare';
  leftTitle: string;
  rightTitle: string;
  left: GraphBody;
  right: GraphBody;
  steps: { caption: string; left?: GraphStepBody; right?: GraphStepBody }[];
}
export interface NumbersItem { id: string; label: string; unit: string; max: number }
export interface NumbersScene {
  type: 'numbers';
  items: NumbersItem[];
  steps: { caption: string; values: Record<string, number> }[];
}
export type Scene = GraphScene | SequenceScene | CompareScene | NumbersScene;

export interface ControlDef {
  id: string;
  label: string;
  kind: 'toggle' | 'slider';
  min?: number;
  max?: number;
  step?: number;
  default: number | boolean;
}
export type ControlValues = Record<string, number | boolean>;
export interface Route { path: string[]; weight: number; outcome: 'ok' | 'fail' }
export interface SimResult {
  states: Record<string, NodeState>;
  readouts: { label: string; value: string }[];
  routes: Route[];
  trafficRate: number;
}
export interface Sim { controls: ControlDef[]; run(values: ControlValues): SimResult }
