//HANDLES THE ERROR WHEN THERE IS ONE

function errorHandler(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    //jwt authentication error
    res.status(500).json({ message: err });
  }

  if (err.name === "ValidationError") {
    // validation error
    return res.status(401).json({ message: err });
  }

  //default to 500 server error
  return res.status(500).json(err);
}

module.exports = errorHandler;
