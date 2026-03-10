# Audio Assets (High-Quality)

This project uses a hybrid speech strategy:

1. Try high-quality local audio file first (`mp3`).
2. If not found or playback fails, fallback to browser TTS.

## Folder Suggestion

- `assets/audio/en/store/` for store scenario lines
- `assets/audio/en/vocab/` for high-frequency words

## How Mapping Works

Add mappings in:

- `js/audio-manifest.js` -> `MI_AUDIO_MANIFEST.entries`

Example key/value:

```js
"welcome! what are you looking for today?": "assets/audio/en/store/welcome-opening.mp3"
```

Rules:

- Key should be lowercase.
- Multi spaces are normalized to one space.
- Value is a relative static file path.

Check coverage:

```bash
node scripts/check-audio-assets.js
```

## Naming Convention Recommendation

- `scene-step-purpose.mp3`
- Examples:
  - `store-greeting-opening.mp3`
  - `store-needs-priority-question.mp3`
  - `vocab-budget-range.mp3`
