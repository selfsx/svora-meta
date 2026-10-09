# Music beds

Seedance's generated soundtrack is quiet (≈ −27 dB mean) and is dropped when its copyright filter fires, so
every clip gets a music bed in `video-finish.mjs --music <file>` (ducks clip audio to 35%, fades out, then
loudness-normalises the mix to −14 LUFS).

Put licensed tracks here (git-lfs). Only tracks cleared for paid social ads:

- **Meta Sound Collection** — free, cleared for Facebook/Instagram ads: https://www.facebook.com/sound/collection
  (download MP3s, keep the track title in the file name, e.g. `msc-<title>.mp3`).
- A paid library the owner subscribes to (Epidemic Sound / Artlist) — keep the licence receipt in `.secrets/`.

Never use Instagram's in-app music, Seedance output from another clip, or anything scraped. Record the file name
in the manifest's `finish` step (`music`), so a track can be swapped if a claim ever arrives.

Brief for picking: 90–110 BPM, no vocals, warm, "studio morning" — not EDM; 8–15 s loops are enough.
