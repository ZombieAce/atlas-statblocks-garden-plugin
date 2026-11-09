# Notice

This plugin is a derivative work of **Atlas VTT** by Fabian Urbanek
(https://github.com/atlas-vtt/atlas-vtt), licensed under the
[GNU Affero General Public License v3.0](LICENSE) (`AGPL-3.0-only`). This
plugin is therefore licensed under the same terms.

## Corresponding source

`assets/atlas-statblocks.js` and `styles/atlas-statblocks.css` are built from:

- Atlas VTT, commit pinned in [`build/ATLAS_COMMIT`](build/ATLAS_COMMIT) (`d76eb82`, version 0.13.1), and
- the adapter sources in [`build/`](build/) (the browser entry point, an `obsidian` stand-in, a small Markdown renderer, stubs for the parts of Atlas that belong to the map, and the stylesheet fit-ups).

`node build/build.mjs` rebuilds both files from those two sources; the build is
reproducible (same inputs, byte-identical output).

## Modifications to Atlas VTT

Atlas VTT's own files are not edited. The bundle uses Atlas's statblock
renderer and template resolver as they are, and replaces, at build time only,
these parts: Obsidian's API (`obsidian-shim.ts`), dice rolling, token and
asset services, the Fantasy Statblocks bridge and Atlas settings (`build/stubs/`),
and the interface languages (English only).

## Third-party components

The bundle includes React, framer-motion and other libraries that Atlas VTT
depends on, under their own licences (MIT, ISC and similar). Atlas VTT's
[THIRD_PARTY_NOTICES.md](https://github.com/atlas-vtt/atlas-vtt/blob/d76eb82eec24b7c9d43f89806dbf2709364462bd/THIRD_PARTY_NOTICES.md)
at the pinned commit lists them. Atlas's icon and sound assets are not part of this bundle.

## Game system templates

The built-in statblock templates hold the fields, labels and layout of a
statblock; they hold no rules text and no creatures. Those for the systems below
use material under the licences named with them. These notices are Atlas VTT's, quoted verbatim.

### 5E (2014 rules)

This work includes material taken from the System Reference Document 5.1 ("SRD 5.1") by Wizards of the Coast LLC and available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.

Atlas VTT arranged the stat block structure as an editable template.

### 5E (2024 rules)

This work includes material from the System Reference Document 5.2.1 ("SRD 5.2.1") by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.

Atlas VTT arranged the stat block structure as an editable template.

### Cairn

The Cairn template is based on Cairn by Yochai Gal (https://cairnrpg.com), licensed under CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/). Atlas VTT adapted the creature format into an editable template; this template is available under CC BY-SA 4.0 or GPL-3.0.

Atlas VTT arranged the stat block structure as an editable template.

### Draw Steel

The Draw Steel statblock template and system preset in Atlas VTT are an independent product published under the DRAW STEEL Creator License and are not affiliated with MCDM Productions, LLC. DRAW STEEL © 2026 MCDM Productions, LLC.

### Fate

This work is based on Fate Core System and Fate Accelerated Edition (found at https://www.faterpg.com/), products of Evil Hat Productions, LLC, developed, authored, and edited by Leonard Balsera, Brian Engard, Jeremy Keller, Ryan Macklin, Mike Olson, Clark Valentine, Amanda Valentine, Fred Hicks, and Rob Donoghue, and licensed for our use under the Creative Commons Attribution 3.0 Unported license (https://creativecommons.org/licenses/by/3.0/).

Atlas VTT arranged the stat block structure as an editable template.
