export class HttpError {
  constructor(
    public status: number,
    public statusCode: string,
    public message?: string
  ) {}
}

export class NotFound extends HttpError {
  constructor(message?: string) {
    super(404, "Not Found", message);
  }
}

export class BadRequest extends HttpError {
  constructor(message?: string) {
    super(400, "Bad Request", message);
  }
}

export class InternalServerError extends HttpError {
  constructor(message?: string) {
    super(500, "InternalServerError", message);
  }
}
