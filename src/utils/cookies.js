function getCookies(req) {
    const rawCookies = req.headers.cookie.split("; ");
    const parsedCookies = {};
    rawCookies.forEach((rawCookie) => {
        const parsedCookie = rawCookie.split("=");
        parsedCookies[parsedCookie[0]] = parsedCookie[1];
    });
    return parsedCookies;
}

module.exports = {
    getCookies,
};
