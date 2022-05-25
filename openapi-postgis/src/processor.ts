import { Pool } from "pg";
import format from "pg-format";
import { InputGeometry, Output } from "./model";

class Processor {
  private pool: Pool;
  private options: {
    geometryColumn: string;
    inputCRS: number;
    outputCRS: number;
    databaseCRS: number;
    tableName: string;
    attributeColumns: Array<string>;
  };
  constructor() {
    this.options = {
      geometryColumn: process.env.GEOMETRY_COLUMN || "geom",
      inputCRS: process.env.INPUT_CRS ? parseInt(process.env.INPUT_CRS) : 4326,
      outputCRS: process.env.OUTPUT_CRS
        ? parseInt(process.env.OUTPUT_CRS)
        : 4326,
      databaseCRS: process.env.DATABASE_CRS
        ? parseInt(process.env.DATABASE_CRS)
        : 25833,
      tableName: process.env.TABLE_NAME || "verw_gem_f",
      attributeColumns: ["name"],
    };

    if (process.env.ATTRIBUTE_COLUMNS) {
      this.options.attributeColumns = process.env.ATTRIBUTE_COLUMNS.split(
        ","
      ).map((x) => x.trim());
    }
    this.pool = new Pool({
      database: process.env.ECHO_DATABASE_NAME || "postgres",
      user: process.env.ECHO_DATABASE_USER || "postgres",
      password: process.env.ECHO_DATABASE_PASSWORD || "postgres",
      host: process.env.ECHO_DATABASE_HOST || "localhost",
      port: process.env.ECHO_DATABASE_PORT
        ? parseInt(process.env.ECHO_DATABASE_PORT)
        : 5432,
    });

    this.pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
      process.exit(-1);
    });
    process.on("exit", () => this.pool.end());
  }

  public async pointInPolygon(geometry: InputGeometry): Promise<Output> {
    const sql = `
              SELECT ST_AsGeoJSON(t.*, ${format.literal(
                this.options.geometryColumn
              )}) as json
              FROM (
                  SELECT 
                      ${this.options.attributeColumns
                        .map((x) => `t.${format.ident(x)}`)
                        .join(", ")}, 
                      ST_Transform(t.${format.ident(
                        this.options.geometryColumn
                      )}, ${this.options.outputCRS}) 
                          AS ${format.ident(this.options.geometryColumn)}
                  FROM ${format.ident(this.options.tableName)} AS t 
                  WHERE 
                      ST_Intersects(t.${this.options.geometryColumn}, 
                          ST_Transform(
                              ST_SetSRID(
                                  ST_GeomFromGeoJSON(${format.literal(
                                    JSON.stringify(geometry)
                                  )})
                              , ${this.options.inputCRS})
                          , ${this.options.databaseCRS})
                      )
              ) AS t`;
    try {
      console.log(sql);
      const result = await this.pool.query(sql);
      console.log(result)
      return {
        type: "FeatureCollection",
        features: result.rows.map((x) => JSON.parse(x.json)),
      };
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

export const processor = new Processor();
