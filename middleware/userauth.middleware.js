const checkUserAccount = (req, res, next) => {
  if (!req.session.userId) {
    req.session.redirectTo = req.originalUrl; 
    return res.redirect("/createUserAccount");
  }
  next();
};

export default checkUserAccount;
