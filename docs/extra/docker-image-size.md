# Extra: making Docker images smaller

Branch: `extra/docker-image-size` (not merged). Everything below was run on my PC (Docker Desktop on Windows, Git Bash + WSL2 Ubuntu), never on the VPS.

## 1. Images used in VPS (`docker image ls`)

| Image | Role | Size |
|---|---|---|
| `caddy:2.11.6-alpine` | Reverse proxy, HTTPS | 93 MB |
| `envoyproxy/envoy:v1.39.1` | Supabase api-gw | 293 MB |
| `ghcr.io/umami-software/umami:3.4.0` | Analytics | 1.47 GB |
| `postgres:18.6-alpine3.24` | Umami database | 433 MB |
| `postgrest/postgrest:v14.17` | Supabase rest | 28 MB |
| `supabase/gotrue:v2.196.0` | Supabase auth | 92.7 MB |
| `supabase/postgres-meta:v0.99.0` | Supabase meta | 569 MB |
| `supabase/postgres:17.6.1.136` | Supabase db | 1.69 GB |
| `supabase/studio:2026.09.07-sha-7996410` | Supabase studio | 1.69 GB |
| **Total** | | **≈ 6.4 GB** |

Staging and production share these images, so the second stack costs no extra disk. The smallest images are single compiled programs (PostgREST, GoTrue, Caddy); the largest are Node apps (Studio, Umami) and Postgres with extensions. Database images are listed for comparison only and were not shrunk.

## 2. The Northline site, built three ways in my PC

| Image | Size before | Size after | Command | Works? |
|---|---|---|---|---|
| `northline-site:single` | – | **2.37 GB** | `docker build -f Dockerfile.single -t northline-site:single --build-arg … .` | Yes |
| `northline-site:multi` | 2.37 GB | **111 MB** | `docker build -f Dockerfile.multi -t northline-site:multi --build-arg … .` | Yes |
| `northline-site:slim` (1st run) | 2.37 GB | 239 MB | `mint slim --target northline-site:single --tag northline-site:slim --http-probe-cmd /contact --http-probe-cmd /services --continue-after probe` | **No, blank page** |
| `northline-site:slim` (2nd run) | 2.37 GB | **258 MB** | same + `--include-path /app/dist` | Yes |

All working images were checked in the browser on `/`, and on `/contact` opened directly. The contact form showed its error fallback ("please call us…") in every image, as expected: no Supabase was running at the test URL.

### Where the size of `single` comes from (`docker history`)

| Layer | Size | Created by |
|---|---|---|
| Debian build tools | 619 MB | `FROM node:22` |
| `node_modules` + build | 495 MB | `RUN npm ci && npm run build` |
| Node itself | 213 MB | `FROM node:22` |
| More system packages | 203 MB | `FROM node:22` |
| Debian base | 133 MB | `FROM node:22` |
| Source code | 10.3 MB | `COPY . .` (small thanks to `.dockerignore`) |

About 1.2 GB comes from the `node:22` base and 0.5 GB from `npm ci`. None of it is needed to *serve* the site. In `multi`, the site itself is a 9.5 MB `COPY` layer on top of Caddy (52 MB) and Alpine (9 MB).

`docker history` also shows the build-arg values in plain text (`VITE_SUPABASE_URL=…`, `VITE_SUPABASE_PUBLISHABLE_KEY=…`), and Docker warned `SecretsUsedInArgOrEnv` during the build. Here the values are public test values, so it is safe; a secret passed this way would leak to anyone with the image.

## 3. The mint tools

| Command | Result |
|---|---|
| `mint lint --target Dockerfile.single` | Passed: 0 issues out of 25 checks. Lint checks that the Dockerfile is written correctly, not that it is efficient; it did not flag a 2.37 GB image. |
| `mint xray --target northline-site:single` | **Failed**, both as a container and installed natively in WSL: `archive/tar: invalid tar header`. Docker Desktop's containerd image store exports compressed OCI layers, which mint 1.41.8 cannot read. I used `docker history` instead. |
| `mint slim` (as a container, Git Bash) | **Failed**: `ip=''`, then an IPC `wait timeout` to the sensor; the test container crashed (exit 2). From inside a container, mint could not reach the test container. |
| `mint slim` (installed natively in WSL2 Ubuntu) | **Worked**: it probed the container through a published port on `127.0.0.1` instead. It logged `output image ID mismatch`, likely also from the containerd store, but the image was created. |

## 4. What broke in the slimmed image, and the flag that fixed it

The first slimmed image (239 MB) served a **blank page**. The HTTP probe only requested `/contact` and `/services`, and `vite preview` answered both with `index.html`. So the files in `dist/apps/web/assets/` (the JS and CSS) and the favicon were never opened during the test, and slim removed them. In the browser, every missing file came back as the same 874-byte `index.html` (the SPA fallback), and the browser refused it: "MIME type text/html is not text/css" and "disallowed MIME type" for the JS module.

**Fix:** `--include-path /app/dist`, which keeps the whole built site even if the probe did not touch it. The result was 258 MB (+19 MB), and the site worked on every page.

## 5. Conclusion

The multi-stage Dockerfile saved more: 111 MB against 258 MB for `mint slim`, both down from 2.37 GB. For a client I would use the multi-stage build, because I decide exactly what goes into the image, it worked on the first try, and it fails at build time if something is missing. `mint slim` guesses from one test run: it broke the site silently, needed a second run with a flag, and only browser testing showed the problem.