/**
 * @minItems 4
 * @maxItems 6
 */
export type BBox = number[];
/**
 * @minItems 2
 * @maxItems 3
 */
export type Position = number[];
export type Geometry =
  | Point
  | MultiPoint
  | LineString
  | MultiLineString
  | Polygon
  | MultiPolygon
  | GeometryCollection;

export interface Point {
  type: "Point";
  bbox?: BBox;
  coordinates: Position;
}

export interface MultiPoint {
  type: "MultiPoint";
  bbox?: BBox;
  coordinates: Point["coordinates"][];
}

export interface LineString {
  type: "LineString";
  bbox?: BBox;
  coordinates: Position[];
}

export interface MultiLineString {
  type: "MultiLineString";
  bbox?: BBox;
  coordinates: Position[][];
}

export interface Polygon {
  type: "Polygon";
  bbox?: BBox;
  coordinates: Position[][];
}

export interface MultiPolygon {
  type: "MultiPolygon";
  bbox?: BBox;
  coordinates: Position[][][];
}

export interface GeometryCollection {
  type: "GeometryCollection";
  bbox?: BBox;
  geometries: Geometry[];
}

export type Properties = { [name: string]: any } | null;

export interface Feature {
  type: "Feature";
  geometry: Geometry;
  id?: string | number;
  bbox?: BBox;
  properties: Properties;
}

export interface FeatureCollection {
  type: "FeatureCollection";
  bbox?: BBox;
  features: Feature[];
}
