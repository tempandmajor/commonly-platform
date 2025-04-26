"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeFunction = void 0;
const https_1 = require("firebase-functions/v2/https");
exports.stripeFunction = (0, https_1.onRequest)(async (req, res) => {
    res.send('Stripe function');
});
//# sourceMappingURL=index.js.map