export function notFound(req, res) {
  res.status(404).json({ message: "Not found." });
}

// Every error ends up here. Express 5 also forwards rejected promises from async route handlers.
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  const status =
    Number.isInteger(error.status) && error.status >= 400 && error.status < 600 ? error.status : 500;
  if (status >= 500) console.error(error);

  let message = error.message;
  if (error.type === "entity.parse.failed") message = "The request body isn't valid JSON.";
  else if (status >= 500 && error.expose !== true) message = "Something went wrong. Please try again.";
  else if (error.expose === false) message = "Request failed.";

  res.status(status).json({ message });
}
