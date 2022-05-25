import {
  MultiPoint,
  MultiPolygon,
  Point,
  Polygon,
  Feature,
  FeatureCollection
} from "./geojson";

export type InputGeometry = Point | MultiPoint;

export type OutputGeometry = Polygon | MultiPolygon;

export interface OutputFeature extends Feature {
  geometry: OutputGeometry
  properties: OutputProperties
}

export interface Output extends FeatureCollection {
  features: Array<OutputFeature>
};

export interface OutputProperties {
  name: string;
}

