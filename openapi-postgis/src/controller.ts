import { processor } from "./processor";
import { Body, Get, Post, Query, Response, Route, Tags } from "tsoa";
import { BadRequest, HttpError } from "./errors";
import { InputGeometry, Output } from "./model";
import { MultiPoint } from "./geojson";

@Route("/echo")
export class ProcessService {
  /**
   * Perform a point-in-polygon operation for the supplied bore holes.
   * @param request The Point or MultiPoint to use for the point-in-polygon operation
   * @returns The intersecting Features (either Polygons or MultiPolygons)
   * @example request { "type": "Point", "coordinates": [12.962746, 50.836531] }
   */
  @Post()
  @Tags("echo")
  @Response<HttpError>(200, "The result")
  @Response<HttpError>(400, "Bad Request")
  @Response<HttpError>(500, "Internal Server Error")
  async post(@Body() request: InputGeometry): Promise<Output> {
    return await processor.pointInPolygon(request);
  }

  /**
   * 
   * @param query 
   * @example query [12.962746,50.836531]
   */
  @Get()
  @Tags("echo")
  @Response<HttpError>(200, "The result")
  @Response<HttpError>(400, "Bad Request")
  @Response<HttpError>(500, "Internal Server Error")
  async get(@Query("points") query: string): Promise<Output> {
    console.log(query)
    const points = query.split(",").map(parseFloat);
    if (points.length % 2 !== 0) throw new BadRequest();
    //if (points.length == 0) return { type: "FeatureCollection", features: [] };
    const geometry: MultiPoint = { type: "MultiPoint", coordinates: [] };

    for (let i = 1; i < points.length; i += 2) {
      geometry.coordinates.push([<number>points[i - 1], <number>points[i]]);
    }

    console.log(geometry)

    return await processor.pointInPolygon(geometry);
  }
}
