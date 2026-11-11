# Atlas Statblocks for Digital Garden

A [Digital Garden](https://github.com/oleeskild/obsidian-digital-garden) plugin that draws your [Atlas VTT](https://github.com/atlas-vtt/atlas-vtt) statblocks on your published site the way Obsidian shows them, read-only: same template, same layout, same tabs and sections, no editing.

Maps, scenes, tokens and dice are not part of it.

## Install

1. In Obsidian: **Digital Garden settings → Plugins → Install**, and paste the repository URL
   (`https://github.com/ZombieAce/atlas-statblocks-garden-plugin`).
2. Publish your notes as usual.

## Use

A statblock note is the note you already have: Atlas keeps the statblock in its properties.

````markdown
---
statblock: true
atlas-template: builtin:5e-2014-monster
name: Goblin Boss
ac: 17
hp: 21
---

```atlas-statblock
```
````
Put an `atlas-statblock` code fence where the card should appear, exactly as in Obsidian, and publish the note (`dg-publish`). A note without the fence shows no card, as in Obsidian.

Also drawn: Fantasy Statblocks-style notes (`statblock: true` with no `atlas-template`), using Atlas's automatic layout, and any note whose template is not available (the browser console says which).

Links inside a statblock open the published note they name. Portraits and other image properties show when Digital Garden publishes the image, which it does for a property whose whole value is an image link or a vault path. A link to a note you did not publish shows as plain text.

## Custom templates

Digital Garden publishes notes and images, not `.atlastemplate` files, so a template of your own has to reach the site another way. Either:

- **Put the file in `custom-templates/`** in this repository such as `Custom.atlastemplate`. Re-install or update the plugin to deploy a change.
- **Or paste it into a note**, in a code fence labelled `atlas-template`:

  ````markdown
  ```atlas-template
  { "format": "atlas-statblock-template", "id": "custom-ab12cd", ... }
  ```
  ````

  The fence is never shown. Give that note `dg-hide: true` so it stays out of the file tree.

The template `id` must look like Atlas's own (e.g. `custom-abc1d2`: a name, a dash and six letters or digits). The build prints a warning for a template it cannot use.

## Know before you publish

- **Everything in a published statblock note's properties is public**, including the page source. The card shows the fields its template lays out; the data behind it is still there. Keep GM-only notes unpublished.
- Dice notation is plain text; there is no rolling like in Atlas

## Rebuild

`assets/atlas-statblocks.js` and `styles/atlas-statblocks.css` are built from Atlas VTT at the commit in `build/ATLAS_COMMIT`, plus the adapter in `build/`:

```sh
node build/build.mjs                              # fetches Atlas at the pinned commit
ATLAS_SRC=/path/to/atlas-vtt node build/build.mjs  # or use a checkout you have
```

Requires Node 22+ (Atlas's requirement) and git. The output is reproducible. To follow a newer Atlas, change `build/ATLAS_COMMIT`, rebuild, and look at a few statblocks before releasing.

## Tested

- The 5E 2014 and 2024 templates
- Custom template

Built against Atlas VTT 0.13.1 and the Digital Garden template as of 2026-10-26 (`oleeskild/digitalgarden`, Eleventy 3.1)

## License

AGPL-3.0-only, as Atlas VTT. See [LICENSE](LICENSE) and [NOTICE.md](NOTICE.md), which also carries the attribution the built-in game templates require.
