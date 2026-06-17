# Tool files for `npm run seed:tools`

Place your **own** MT5 files here before running the seed script. The script will upload them to R2 when credentials are configured.

## Naming

Use the `seed_slug` from `scripts/tools-data.mjs`:

```
trade-journal-v2.zip
bbma-model.zip
goldmesh-ea.zip
…
```

Supported extensions: `.zip`, `.ex5`, `.mq5`

## Important

- Only upload tools you own or have rights to distribute.
- Do not commit proprietary `.ex5` files to git (this folder should stay local).
- Tools without a matching file are seeded as **draft** until you upload via Admin → Tools.
