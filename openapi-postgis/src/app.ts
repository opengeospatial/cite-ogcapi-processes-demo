import bodyParser from "body-parser";
import { RegisterRoutes } from "../build/routes";
import express, { Response, Request, NextFunction } from "express";
import swaggerUi from "swagger-ui-express";
import compression from "compression";
import cors from "cors";
import errorhandler from "errorhandler";
import morgan from "morgan";
import { ValidateError } from "tsoa";
import YAML from "yaml";
import { BadRequest, HttpError, InternalServerError, NotFound } from "./errors";

export const app = express();
app.enable("trust proxy");
app.use(compression());
app.use(morgan("combined"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

if (process.env.NODE_ENV === "development") {
  app.use(errorhandler());
}

app.use(
  bodyParser.json({
    limit: "10mb",
    type: ["application/json", "application/*+json"],
  })
);

RegisterRoutes(app);

app.get("/api-docs.json", async (_req: Request, res: Response) => {
  const json = await import("../build/swagger.json");
  return res.json(json);
});

app.get("/api-docs.yaml", async (_req: Request, res: Response) => {
  const json = await import("../build/swagger.json");
  return res.type("text/yaml").send(YAML.stringify(json));
});

app.use("/", swaggerUi.serve, async (_req: Request, res: Response) => {
  const json = await import("../build/swagger.json");
  return res.format({
    "text/html": () => res.send(swaggerUi.generateHTML(json)),
    "application/json": () => res.send(json),
    "text/yaml": () => res.send(YAML.stringify(json)),
  });
});



app.use(
  (
    err: any,
    _req: Request,
    res: Response,
    next: NextFunction
  ): Response | void => {
    let e: HttpError | undefined;
    if (err instanceof ValidateError) {
      e = new BadRequest(err.message);
    } else if (err instanceof HttpError) {
      e = err;
    } else if (err instanceof Error) {
      e = new InternalServerError(err.message);
    }
    if (e) {
      return res.status(e.status).json(e);
    }
    next();
  }
);

app.use((_req, res: Response) => res.status(404).json(new NotFound()));
