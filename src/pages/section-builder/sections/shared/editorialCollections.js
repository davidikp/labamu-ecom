/**
 * @module section-builder/sections/shared/editorialCollections
 * @description Single source of truth for editorial Collection content (US
 * Collection feature) — a visual, non-commerce grouping of imagery (a
 * portfolio/lookbook/campaign), distinct from the existing catalog-oriented
 * `collection_list` section and `collection` system page (product handles,
 * catalog binding — see those files' own docs). Both
 * `editorial_collection_list` and `editorial_collection_detail` read from
 * this one array; nothing about a specific collection is duplicated in
 * either Renderer.
 *
 * Mock-only for this phase, deliberately shaped so a later swap to a real
 * CMS/API only has to replace `EDITORIAL_COLLECTIONS` and
 * `resolveEditorialCollectionBySlug` (e.g. into an async fetch) — no change
 * needed in either section's Renderer, which only ever consume the
 * resolved collection object.
 *
 * Images use picsum.photos' `/id/<n>/w/h` form (a specific curated photo,
 * not a random seed) — every id below was hand-picked by visually reviewing
 * picsum's fixed photo catalog for architecture/interior/craft/object/
 * lifestyle subjects, so the six collections read as one coherent
 * design-and-lifestyle "creative universe" instead of arbitrary stock
 * photography (the original random-seed version's landscapes/wildlife).
 * Same accepted no-key, no-dependency image source as before, just specific
 * ids instead of random seeds. Every image carries its own meaningful
 * `alt` (accessibility) and an independent, optional `caption` (visible
 * editorial text) — the two serve different purposes and are never merged.
 */
function picsum(id, width, height) {
  return `https://picsum.photos/id/${id}/${width}/${height}`;
}

export const EDITORIAL_COLLECTIONS = [
  {
    id: '01',
    slug: 'forma',
    title: 'Forma',
    subtitle: 'Objects shaped by simplicity',
    coverImage: picsum(616, 1600, 900),
    coverImageAlt: 'A vaulted, light-filled interior hall with a sculptural glass ceiling.',
    description: [
      'Forma explores the relationship between geometric structure, material, and quiet visual expression. Every piece is reduced to its essential form, letting proportion and texture carry the story instead of ornament.',
      'The collection began as a study of shadow — how a single curved surface can hold light differently depending on the hour. That study became a set of chairs, low tables, and standing mirrors, each one a single continuous gesture rather than an assembly of parts.',
      'Nothing here is decorated after the fact. The finish is the structure, and the structure is the finish.',
    ].join('\n'),
    images: [
      { src: picsum(800, 1600, 700), alt: 'A grand hall interior with tall arched windows and soft daylight.', caption: 'Light was the first material we designed with.' },
      { src: picsum(1048, 1200, 900), alt: 'Looking straight up a glass-fronted building facade.', caption: 'Every Forma surface takes its cue from a single continuous plane.' },
      { src: picsum(608, 900, 1200), alt: 'The underside of a wooden pier, its beams repeating into the distance.', caption: '' },
      { src: picsum(210, 1600, 700), alt: 'A close, even crop of a plain brick wall.', caption: 'Texture, not pattern — the surface stays honest to what made it.' },
      { src: picsum(290, 1200, 900), alt: 'A colonnade of identical stone arches along a building facade.', caption: '' },
      { src: picsum(504, 900, 1200), alt: 'A hand resting on a pale wood tabletop beside a lit lamp.', caption: 'A Forma piece is meant to be touched, not just looked at.' },
    ],
    storyBlocks: [
      {
        type: 'text',
        title: 'Material and Form',
        body: [
          'We spent the first six months of Forma without a single sketch — only offcuts of plaster, testing how a curve held light at 9am versus 4pm.',
          'The final proportions came from that light, not the other way around.',
        ],
      },
    ],
    cta: { enabled: true, label: 'View Products', href: '/shop' },
  },
  {
    id: '02',
    slug: 'terra',
    title: 'Terra',
    subtitle: 'Natural textures and grounded tones',
    coverImage: picsum(704, 1600, 900),
    coverImageAlt: 'Sunlight filtering down through a dense bamboo grove.',
    description: [
      'Terra draws from raw, earthbound materials — clay, timber, stone — paired with a restrained palette of grounded tones. Nothing is stained to look like something it isn’t; every surface shows the material it actually is.',
      'The pieces are made in small batches with local timber and hand-thrown stoneware, so no two finishes are perfectly identical. That variation is treated as a feature of the collection rather than a flaw to correct.',
      'Terra is meant to age visibly. A worn edge or a settled patina isn’t damage here — it’s the collection doing exactly what it was designed to do.',
    ].join('\n'),
    images: [
      { src: picsum(940, 1600, 700), alt: 'Close-up of weathered orange rock strata catching low light.', caption: 'The palette starts with stone, not a swatch book.' },
      { src: picsum(1032, 1200, 900), alt: 'Layered canyon rock walls glowing warm at dusk.', caption: '' },
      { src: picsum(464, 900, 1200), alt: 'A wooden desk flatlay with a notebook, pen, and coiled jute rope.', caption: 'Raw materials, laid out before anything is cut.' },
      { src: picsum(528, 1600, 700), alt: 'Hand tools and dice arranged neatly on a workshop desk.', caption: '' },
      { src: picsum(608, 1200, 900), alt: 'Weathered timber pier beams stretching into the distance.', caption: 'Timber left to weather on purpose.' },
    ],
    storyBlocks: [
      {
        type: 'text',
        title: 'Grounded Tones',
        body: [
          'Every clay body we use comes from within 200 kilometers of the workshop — not for a slogan, but because local clay behaves differently, and we wanted Terra to behave like exactly one place.',
        ],
      },
    ],
    cta: { enabled: true, label: 'Explore Collection', href: '/shop' },
  },
  {
    id: '03',
    slug: 'luma',
    title: 'Luma',
    subtitle: 'A study of light and material',
    coverImage: picsum(395, 1600, 900),
    coverImageAlt: 'A dimly lit bar interior glowing with warm pendant lighting.',
    description: [
      'Luma is a study of how light moves across a surface — soft reflections, gentle gradients, and material choices that respond to the room around them rather than compete with it.',
      'Each fixture pairs a hand-blown glass diffuser with a slim brushed-metal arm, tuned so the light source itself stays hidden and only the glow remains. The result changes character through the day: warm and low at dusk, clean and even at midday.',
      'We tested every fixture in real rooms before finishing the collection, not in a studio built to flatter a single dramatic photograph.',
    ].join('\n'),
    images: [
      { src: picsum(320, 1600, 700), alt: 'A city street glowing under warm evening light between buildings.', caption: 'Dusk is when a Luma fixture actually earns its keep.' },
      { src: picsum(504, 1200, 900), alt: 'A hand resting beside a softly lit table lamp on a wood surface.', caption: '' },
      { src: picsum(800, 900, 1200), alt: 'A grand interior hall lit by tall arched windows.', caption: 'Daylight was our first reference, before a single bulb was chosen.' },
      { src: picsum(365, 1600, 700), alt: 'A teacup and scattered petals on a warm wooden table at dusk.', caption: '' },
      { src: picsum(1048, 1200, 900), alt: 'Light tracing up the glass face of a tall building.', caption: '' },
      { src: picsum(225, 900, 1200), alt: 'A glass teapot and cup catching soft window light.', caption: 'The same warm glow, whatever surface it lands on.' },
      { src: picsum(696, 1600, 700), alt: 'A cluster of tulips lit from one side in soft afternoon light.', caption: '' },
    ],
    storyBlocks: [],
    cta: { enabled: false, label: '', href: '' },
  },
  {
    id: '04',
    slug: 'modulo',
    title: 'Modulo',
    subtitle: 'Modular living, built to change with you',
    coverImage: picsum(608, 1600, 900),
    coverImageAlt: 'Repeating wooden pier beams forming a modular structural rhythm.',
    description: [
      'Modulo starts from a simple premise: a home’s layout is never really finished. The collection is built from a small set of seating, storage, and shelving units that reconfigure without tools, so a single sofa can become a sectional, a room divider, or a reading corner as a space changes.',
      'Every module shares the same connection system and the same upholstery language, so pieces added years apart still read as one collection rather than a patchwork of purchases.',
      'It’s designed for the reality of small apartments and growing households alike — furniture that moves with you instead of furniture you replace.',
    ].join('\n'),
    images: [
      { src: picsum(520, 1600, 700), alt: 'The repeating brick arches beneath a bridge, forming a modular sequence.', caption: 'One unit, repeated — never one giant fixed piece.' },
      { src: picsum(290, 1200, 900), alt: 'A row of identical stone arches along a colonnade.', caption: '' },
      { src: picsum(528, 900, 1200), alt: 'Small modular tools and objects arranged on a workshop desk.', caption: 'Every module is designed to be handled and rearranged on its own.' },
      { src: picsum(464, 1600, 700), alt: 'A flatlay of a notebook, pen, and rope on a wooden desk.', caption: '' },
      { src: picsum(210, 1200, 900), alt: 'A close, even crop of a plain brick wall.', caption: '' },
    ],
    storyBlocks: [
      {
        type: 'text',
        title: 'One System, Many Rooms',
        body: [
          'We tracked one Modulo sofa through four apartments over three years. It was never disassembled and thrown out — only reconfigured, module by module, as each room changed.',
          'That’s the only success metric this collection was designed around.',
        ],
      },
    ],
    cta: { enabled: true, label: 'View Products', href: '/shop' },
  },
  {
    id: '05',
    slug: 'facet',
    title: 'Facet',
    subtitle: 'Contemporary craft, cut by hand',
    coverImage: picsum(528, 1600, 900),
    coverImageAlt: 'A workshop desk with hand tools and small objects laid out for craftwork.',
    description: [
      'Facet is a collaboration with independent woodworkers who still cut every angle by hand rather than by machine template. The pieces carry small, deliberate irregularities — a slightly uneven facet, a tool mark left visible — that a fully automated process would erase.',
      'The collection favors dense, close-grained woods that hold a sharp edge well: walnut, ash, and reclaimed teak. Each surface is faceted rather than curved, so the material catches light in distinct planes instead of a single soft gradient.',
      'We photographed the collection in the same workshops it was made in, not a staged showroom, because the making process is as much a part of Facet as the finished object.',
      'Every piece ships with a small card naming the maker who cut it.',
    ].join('\n'),
    images: [
      { src: picsum(145, 1600, 700), alt: 'Close-up of a hand-finished wooden instrument body.', caption: 'A tool mark left visible, not sanded away.' },
      { src: picsum(355, 1200, 900), alt: 'A stack of vintage cameras displayed as hand-made objects.', caption: '' },
      { src: picsum(464, 900, 1200), alt: 'A wooden desk flatlay with a notebook and coiled rope.', caption: 'Every piece starts on a desk like this one.' },
      { src: picsum(225, 1600, 700), alt: 'A glass teapot and cup on a sunlit wooden table.', caption: '' },
      { src: picsum(1032, 1200, 900), alt: 'Layered rock strata catching warm angled light.', caption: 'Facets, not curves — the material shows its own geometry.' },
    ],
    storyBlocks: [
      {
        type: 'text',
        title: 'Signed by the Maker',
        body: [
          'Each Facet piece carries a small card naming the person who cut it — not a brand mark, a name. We wanted the maker to stay visible after the object leaves the workshop.',
        ],
      },
    ],
    cta: { enabled: true, label: 'Explore Collection', href: '/shop' },
  },
  {
    id: '06',
    slug: 'strata',
    title: 'Strata',
    subtitle: 'Architectural surfaces for everyday rooms',
    coverImage: picsum(290, 1600, 900),
    coverImageAlt: 'A colonnade of stone arches along a grand building facade.',
    description: [
      'Strata borrows its language from architecture rather than furniture — layered surfaces, exposed edges, and materials more often found in a building’s structure than its interior. Concrete, brick, and blackened steel are stacked in visible layers instead of hidden behind a single finish.',
      'The collection reads differently from every angle: a console table that looks solid and monolithic from the front reveals a thin, almost weightless steel edge in profile.',
      'Strata is built for rooms with strong architectural bones already — exposed brick, board-formed concrete, tall windows — where furniture needs enough presence to hold its own.',
    ].join('\n'),
    images: [
      { src: picsum(210, 1600, 700), alt: 'A close, even crop of a plain brick wall.', caption: 'Concrete and brick, left exactly as they are.' },
      { src: picsum(520, 1200, 900), alt: 'Repeating brick arches beneath a bridge.', caption: '' },
      { src: picsum(1048, 900, 1200), alt: 'Looking straight up a glass tower facade.', caption: 'A monolithic front, a near-weightless edge in profile.' },
      { src: picsum(1032, 1600, 700), alt: 'Layered canyon rock strata glowing at dusk.', caption: 'The collection’s namesake — layers, visible all the way through.' },
      { src: picsum(940, 1200, 900), alt: 'Close-up of weathered orange rock strata.', caption: '' },
      { src: picsum(608, 900, 1200), alt: 'Timber pier beams repeating into the distance.', caption: '' },
    ],
    storyBlocks: [
      {
        type: 'text',
        title: 'Built Like a Building',
        body: [
          'We treated every Strata piece like a tiny building — a foundation layer, a structural layer, a surface layer — instead of a single molded form with a finish sprayed on top.',
          'You can still see where each layer starts and the next one begins.',
        ],
      },
    ],
    cta: { enabled: false, label: '', href: '' },
  },
];

/** Resolves a collection by its route `:slug` param, or `undefined` if none
 * matches — callers (EditorialCollectionDetailPage.jsx) render their own
 * Not Found state on `undefined`, mirroring `resolveStorefrontProductByHandle`'s
 * contract for an unknown product handle. */
export function resolveEditorialCollectionBySlug(slug) {
  return EDITORIAL_COLLECTIONS.find((collection) => collection.slug === slug);
}

/** `/collection/:slug` path builder — mirrors `buildProductPath` (productSource.js). */
export function buildEditorialCollectionPath(slug) {
  return `/collection/${slug}`;
}
