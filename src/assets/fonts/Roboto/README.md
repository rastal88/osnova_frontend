# Roboto

Roboto 2.137 by Google, Apache License 2.0. Subset to Latin + Cyrillic and
converted to WOFF2 (~23 KB per weight instead of ~168 KB TTF):

```bash
pip install fonttools brotli
pyftsubset Roboto-Regular.ttf --flavor=woff2 --output-file=Roboto-Regular.woff2 \
  --layout-features='kern,liga,calt,ccmp,locl,mark,mkmk,tnum,lnum' \
  --unicodes='U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0300-0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2000-206F,U+2074,U+20AC,U+20BD,U+2116,U+2122,U+2190-2193,U+2212,U+2215,U+FEFF,U+FFFD'
```

Same for Medium and Bold. For another language, add its range to `--unicodes`.
To drop the font entirely, remove the `@font-face` rules in `src/index.css` and
`Roboto` from `fontFamily` in `src/config/brand.ts` (the system font is used).
