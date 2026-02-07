const checkUserAccount = (req, res, next) => {
  console.log("request session", req.session.userId)
  if (!req.session.userId) {
    req.session.redirectTo = req.originalUrl; 
    return res.redirect("/createUserAccount");
  }
  next();
};

export default checkUserAccount;
