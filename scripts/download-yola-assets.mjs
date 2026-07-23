import { copyFile, mkdir, rename, stat, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const assets = [
  {
    path: 'public/demos/cross-border/assets/videos/hero-measured-purity.mp4',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_39ca84eAE1ODL9hbR5VhoEj8tBf/hf_20260627_212146_743b92b3-40a3-46cb-988d-7bf716564ec3.mp4',
    minimumBytes: 200_000,
  },
  {
    path: 'public/demos/cross-border/assets/videos/collection-reveal.mp4',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_39ca84eAE1ODL9hbR5VhoEj8tBf/hf_20260628_122130_8b16d300-75cb-49f5-82ce-afd6b79c2d79.mp4',
    minimumBytes: 200_000,
  },
  {
    path: 'public/demos/cross-border/assets/products/obsidian-coil.webp',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_39ca84eAE1ODL9hbR5VhoEj8tBf/hf_20260628_144408_92b74dc4-ca69-412a-acfd-304f9b29eb5e_min.webp',
    minimumBytes: 10_000,
  },
  {
    path: 'public/demos/cross-border/assets/products/void-arc.webp',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_39ca84eAE1ODL9hbR5VhoEj8tBf/hf_20260628_145142_ed02063b-d983-47d2-b60b-4b4a5a3448bd_min.webp',
    minimumBytes: 10_000,
  },
  {
    path: 'public/demos/cross-border/assets/products/onyx-hex.webp',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_39ca84eAE1ODL9hbR5VhoEj8tBf/hf_20260628_144747_f21bc119-e460-45be-a071-851291bd71c5_min.webp',
    minimumBytes: 10_000,
  },
  {
    path: 'public/demos/cross-border/assets/products/shadow-sigil.webp',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_39ca84eAE1ODL9hbR5VhoEj8tBf/hf_20260627_215521_100b78bd-d24a-4225-b2e8-5bb30d44af73_min.webp',
    minimumBytes: 10_000,
  },
];

const posters = [
  {
    video: 'public/demos/cross-border/assets/videos/hero-measured-purity.mp4',
    poster: 'public/demos/cross-border/assets/videos/hero-poster.webp',
    fallback: 'public/demos/cross-border/assets/products/obsidian-coil.webp',
    seek: '0.8',
  },
  {
    video: 'public/demos/cross-border/assets/videos/collection-reveal.mp4',
    poster: 'public/demos/cross-border/assets/videos/collection-poster.webp',
    fallback: 'public/demos/cross-border/assets/products/void-arc.webp',
    seek: '0.8',
  },
];

async function isUsable(file, minimumBytes) {
  try {
    return (await stat(file)).size >= minimumBytes;
  } catch {
    return false;
  }
}

async function download(asset) {
  const destination = resolve(root, asset.path);
  if (await isUsable(destination, asset.minimumBytes)) {
    console.log(`YOLA asset ready: ${asset.path}`);
    return;
  }

  await mkdir(dirname(destination), { recursive: true });
  const response = await fetch(asset.url, {
    redirect: 'follow',
    headers: { 'user-agent': 'Mozilla/5.0 YOLA static asset localizer' },
  });
  if (!response.ok) throw new Error(`Failed ${response.status} ${asset.url}`);

  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength < asset.minimumBytes) {
    throw new Error(`Downloaded file is unexpectedly small: ${asset.path} (${bytes.byteLength} bytes)`);
  }

  const temporary = `${destination}.download`;
  await writeFile(temporary, bytes);
  await rename(temporary, destination);
  console.log(`Downloaded ${asset.path} (${bytes.byteLength} bytes)`);
}

async function createPoster(item) {
  const video = resolve(root, item.video);
  const poster = resolve(root, item.poster);
  const fallback = resolve(root, item.fallback);
  if (await isUsable(poster, 10_000)) {
    console.log(`YOLA poster ready: ${item.poster}`);
    return;
  }

  await mkdir(dirname(poster), { recursive: true });
  const result = spawnSync('ffmpeg', [
    '-hide_banner',
    '-loglevel', 'error',
    '-ss', item.seek,
    '-i', video,
    '-frames:v', '1',
    '-vf', 'scale=1600:-2',
    '-c:v', 'libwebp',
    '-quality', '82',
    '-y', poster,
  ], { encoding: 'utf8' });

  if (result.status === 0 && await isUsable(poster, 10_000)) {
    console.log(`Generated ${item.poster}`);
    return;
  }

  console.warn(`ffmpeg poster generation unavailable; using product fallback for ${item.poster}`);
  if (result.stderr) console.warn(result.stderr.trim());
  await copyFile(fallback, poster);
}

for (const asset of assets) await download(asset);
for (const poster of posters) await createPoster(poster);
