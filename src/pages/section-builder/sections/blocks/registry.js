/**
 * @module section-builder/sections/blocks/registry
 * @description Central catalog of every block type — shared/generic (heading,
 * text, button, image, spacer) and bespoke (quote, faq, member, …). Sections
 * reference these by key in their `blockConfig.allowed`/`presets`, so field
 * schemas and renderers live in exactly one place (Shopify-style shared
 * blocks). `fields` drives the settings panel + defaults; `Renderer` draws the
 * block on the canvas.
 */
import {
  HeadingBlock,
  SubheadingBlock,
  TextBlock,
  ButtonBlock,
  ImageBlock,
  SpacerBlock,
  QuoteBlock,
  FaqBlock,
  ValueBlock,
  MemberBlock,
  LogoBlock,
  AnnouncementBlock,
  CollectionBlock,
  ProductBlock,
  FormFieldBlock,
  NavLinkBlock,
  MenuColumnBlock,
  GroupBlock,
  GROUP_CHILD_TYPES,
} from './blockRenderers';

export const BLOCK_TYPES = {
  // ── Shared / generic ────────────────────────────────────────────────
  heading: {
    label: 'Heading',
    icon: 'Heading',
    Renderer: HeadingBlock,
    fields: {
      text: { type: 'text', label: 'Text', maxLength: 200, default: 'Heading', group: 'content' },
      size: {
        type: 'select', label: 'Size', default: 'medium', group: 'content',
        options: [{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }],
      },
      alignment: {
        type: 'select', label: 'Alignment', default: 'left', group: 'content',
        options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }],
      },
    },
  },
  subheading: {
    label: 'Subheading',
    icon: 'Type',
    Renderer: SubheadingBlock,
    fields: { text: { type: 'text', label: 'Text', maxLength: 300, default: '', group: 'content' } },
  },
  text: {
    label: 'Text',
    icon: 'AlignLeft',
    Renderer: TextBlock,
    fields: { content: { type: 'richtext', label: 'Text', default: '', group: 'content' } },
  },
  button: {
    label: 'Button',
    icon: 'MousePointerClick',
    Renderer: ButtonBlock,
    fields: {
      label: { type: 'text', label: 'Label', maxLength: 100, default: 'Shop now', group: 'content' },
      url: { type: 'text', label: 'Link URL', default: '/collections/all', group: 'content' },
      style: {
        type: 'select', label: 'Style', default: 'primary', group: 'content',
        options: [{ value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }],
      },
    },
  },
  image: {
    label: 'Image',
    icon: 'Image',
    Renderer: ImageBlock,
    fields: {
      image: { type: 'image', label: 'Image', group: 'content' },
      alt: { type: 'text', label: 'Alt text', maxLength: 200, default: '', group: 'content' },
      caption: { type: 'text', label: 'Caption', maxLength: 200, default: '', group: 'content' },
    },
  },
  spacer: {
    label: 'Spacer',
    icon: 'MoveVertical',
    Renderer: SpacerBlock,
    fields: { height: { type: 'range', label: 'Height', min: 8, max: 160, step: 4, default: 32, unit: 'px', group: 'content' } },
  },
  group: {
    label: 'Group',
    icon: 'Group',
    Renderer: GroupBlock,
    container: true,
    // A group can hold another group (Shopify-style nested groups), any depth.
    childTypes: GROUP_CHILD_TYPES,
    fields: {
      // ── Layout (desktop) ─────────────────────────────────────────────
      direction: {
        type: 'select', label: 'Direction', default: 'horizontal', group: 'layout',
        options: [{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }],
      },
      align: {
        type: 'select', label: 'Align', default: 'stretch', group: 'layout',
        options: [
          { value: 'start', label: 'Start' }, { value: 'center', label: 'Center' },
          { value: 'end', label: 'End' }, { value: 'stretch', label: 'Stretch' },
        ],
      },
      distribute: {
        type: 'select', label: 'Distribute', default: 'start', group: 'layout',
        options: [
          { value: 'start', label: 'Start' }, { value: 'center', label: 'Center' }, { value: 'end', label: 'End' },
          { value: 'between', label: 'Space between' }, { value: 'around', label: 'Space around' },
        ],
      },
      wrap: { type: 'boolean', label: 'Wrap', default: false, group: 'layout' },
      gap: { type: 'range', label: 'Gap', min: 0, max: 64, step: 4, default: 16, unit: 'px', group: 'layout' },

      // ── Size ────────────────────────────────────────────────────────
      widthMode: {
        type: 'select', label: 'Width', default: 'fill', group: 'layout',
        options: [{ value: 'fill', label: 'Fill container' }, { value: 'fit', label: 'Fit content' }, { value: 'custom', label: 'Custom' }],
      },
      maxWidth: {
        type: 'range', label: 'Max width', min: 100, max: 1200, step: 10, default: 600, unit: 'px', group: 'layout',
        dependsOn: { field: 'widthMode', equals: 'custom' },
      },

      // ── Spacing / border ────────────────────────────────────────────
      padding: { type: 'range', label: 'Padding', min: 0, max: 96, step: 4, default: 0, unit: 'px', group: 'layout' },
      borderWidth: { type: 'range', label: 'Border width', min: 0, max: 8, step: 1, default: 0, unit: 'px', group: 'color' },
      borderColor: { type: 'color', label: 'Border color', group: 'color', dependsOn: { field: 'borderWidth', equals: [1, 2, 3, 4, 5, 6, 7, 8] } },
      radius: { type: 'range', label: 'Corner radius', min: 0, max: 48, step: 2, default: 0, unit: 'px', group: 'color' },

      // ── Background ──────────────────────────────────────────────────
      backgroundColor: { type: 'color', label: 'Background color', group: 'color' },
      backgroundImage: { type: 'image', label: 'Background image', group: 'color' },

      // ── Mobile overrides ────────────────────────────────────────────
      direction_mobile: {
        type: 'select', label: 'Direction (mobile)', default: 'vertical', group: 'mobile',
        options: [{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }],
      },
      align_mobile: {
        type: 'select', label: 'Align (mobile)', default: 'stretch', group: 'mobile',
        options: [
          { value: 'start', label: 'Start' }, { value: 'center', label: 'Center' },
          { value: 'end', label: 'End' }, { value: 'stretch', label: 'Stretch' },
        ],
      },
      distribute_mobile: {
        type: 'select', label: 'Distribute (mobile)', default: 'start', group: 'mobile',
        options: [
          { value: 'start', label: 'Start' }, { value: 'center', label: 'Center' }, { value: 'end', label: 'End' },
          { value: 'between', label: 'Space between' }, { value: 'around', label: 'Space around' },
        ],
      },
      gap_mobile: { type: 'range', label: 'Gap (mobile)', min: 0, max: 64, step: 4, default: 8, unit: 'px', group: 'mobile' },
      padding_mobile: { type: 'range', label: 'Padding (mobile)', min: 0, max: 96, step: 4, default: 0, unit: 'px', group: 'mobile' },
    },
  },

  // ── Bespoke ─────────────────────────────────────────────────────────
  quote: {
    label: 'Testimonial',
    icon: 'Quote',
    Renderer: QuoteBlock,
    fields: {
      quote: { type: 'textarea', label: 'Quote text', maxLength: 400, default: '', group: 'content' },
      reviewer_name: { type: 'text', label: 'Reviewer name', maxLength: 100, default: '', group: 'content' },
      star_rating: {
        type: 'select', label: 'Star rating', default: '5', group: 'content',
        options: [{ value: '3', label: '3' }, { value: '4', label: '4' }, { value: '5', label: '5' }],
      },
    },
  },
  faq: {
    label: 'FAQ item',
    icon: 'HelpCircle',
    Renderer: FaqBlock,
    fields: {
      question: { type: 'text', label: 'Question', maxLength: 400, default: '', group: 'content' },
      answer: { type: 'richtext', label: 'Answer', default: '', group: 'content' },
    },
  },
  value: {
    label: 'Value',
    icon: 'Sparkles',
    Renderer: ValueBlock,
    fields: {
      icon: { type: 'text', label: 'Icon (emoji)', maxLength: 4, default: '⭐', group: 'content' },
      label: { type: 'text', label: 'Label', maxLength: 100, default: '', group: 'content' },
      description: { type: 'text', label: 'Description', maxLength: 400, default: '', group: 'content' },
    },
  },
  member: {
    label: 'Team member',
    icon: 'User',
    Renderer: MemberBlock,
    fields: {
      photo: { type: 'image', label: 'Photo', group: 'content' },
      name: { type: 'text', label: 'Name', maxLength: 100, default: '', group: 'content' },
      role: { type: 'text', label: 'Role', maxLength: 100, default: '', group: 'content' },
      bio: { type: 'textarea', label: 'Bio', maxLength: 1000, default: '', group: 'content' },
      social_link: { type: 'text', label: 'Social link', default: '', group: 'content' },
    },
  },
  logo: {
    label: 'Logo',
    icon: 'Award',
    Renderer: LogoBlock,
    fields: {
      logo: { type: 'image', label: 'Logo image', helpText: 'Recommended: 200x80px, SVG or transparent PNG', group: 'content' },
      alt_text: { type: 'text', label: 'Alt text', maxLength: 100, default: '', group: 'content' },
      link_url: { type: 'text', label: 'Link URL', default: '', group: 'content' },
    },
  },
  announcement: {
    label: 'Announcement',
    icon: 'Megaphone',
    Renderer: AnnouncementBlock,
    fields: {
      message: { type: 'text', label: 'Message', maxLength: 400, default: 'Free shipping on orders over $50', group: 'content' },
      link_label: { type: 'text', label: 'Link label', maxLength: 100, default: '', group: 'content' },
      link_url: { type: 'text', label: 'Link URL', default: '', group: 'content' },
    },
  },
  collection: {
    label: 'Collection',
    icon: 'Folder',
    Renderer: CollectionBlock,
    fields: {
      title: { type: 'text', label: 'Title', maxLength: 100, default: '', group: 'content' },
      image: { type: 'image', label: 'Image', group: 'content' },
      url: { type: 'text', label: 'Link URL', default: '', group: 'content' },
    },
  },
  product: {
    label: 'Product',
    icon: 'Package',
    Renderer: ProductBlock,
    fields: {
      title: { type: 'text', label: 'Title', maxLength: 100, default: '', group: 'content' },
      image: { type: 'image', label: 'Image', group: 'content' },
      price: { type: 'text', label: 'Price', maxLength: 40, default: '', group: 'content' },
      url: { type: 'text', label: 'Link URL', default: '', group: 'content' },
    },
  },
  form_field: {
    label: 'Form field',
    icon: 'FormInput',
    Renderer: FormFieldBlock,
    fields: {
      label: { type: 'text', label: 'Label', maxLength: 100, default: 'Field', group: 'content' },
      field_type: {
        type: 'select', label: 'Type', default: 'text', group: 'content',
        options: [
          { value: 'text', label: 'Text' },
          { value: 'email', label: 'Email' },
          { value: 'tel', label: 'Phone' },
          { value: 'textarea', label: 'Long text' },
        ],
      },
      required: { type: 'boolean', label: 'Required', default: false, group: 'content' },
      placeholder: { type: 'text', label: 'Placeholder', maxLength: 100, default: '', group: 'content' },
    },
  },
  nav_link: {
    label: 'Nav link',
    icon: 'Link',
    Renderer: NavLinkBlock,
    fields: {
      label: { type: 'text', label: 'Label', maxLength: 60, default: 'Link', group: 'content' },
      url: { type: 'text', label: 'URL', default: '/', group: 'content' },
    },
  },
  menu_column: {
    label: 'Menu column',
    icon: 'List',
    Renderer: MenuColumnBlock,
    fields: {
      heading: { type: 'text', label: 'Heading', maxLength: 60, default: 'Links', group: 'content' },
      links: { type: 'textarea', label: 'Links (one per line)', maxLength: 1000, default: '', group: 'content' },
    },
  },
};

export function blockDef(blockType) {
  return BLOCK_TYPES[blockType] ?? null;
}
