const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Force Metro to resolve .js before .mjs so that zustand's CJS build
// is used instead of the ESM build (which contains import.meta.env
// that Metro's web bundler cannot handle).
config.resolver.sourceExts = config.resolver.sourceExts.filter(
    (ext) => ext !== "mjs",
);

// Add wasm asset support
config.resolver.assetExts.push("wasm");

// Add COEP and COOP headers to support SharedArrayBuffer
config.server.enhanceMiddleware = (middleware) => {
    return (req, res, next) => {
        res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        middleware(req, res, next);
    };
};

module.exports = config;
