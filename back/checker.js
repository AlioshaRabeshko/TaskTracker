const sessionChecker = (req, res, next) => {
	if (req.session.user && req.cookies.user_uid) {
		res.redirect('/');
	} else {
		next();
	}
};

module.exports = () => sessionChecker;
