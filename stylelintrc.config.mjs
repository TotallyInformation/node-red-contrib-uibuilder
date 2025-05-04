// We can now (as of v7.2.0) use all modern CSS since we build to .min.css using LightningCSS.
export default {
  "plugins": [
    // "stylelint-gamut"
  ],
  "rules": {
    // "gamut/color-no-out-gamut-range": true,
    "function-disallowed-list": ["rgba", "hsla", "rgb", "lab"], // we want to mostly use hsl
    "color-function-notation": "modern",
    "color-no-hex": true
  }
}
