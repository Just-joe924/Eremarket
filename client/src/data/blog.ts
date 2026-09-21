import type { BlogPost } from '../types'

// Typography-first cards — there is no artwork per post, so the category label
// and the excerpt carry the whole card. Keep excerpts to two or three lines.
export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Counting stock once a week beats counting it never',
    excerpt:
      'Most shops around Ojodu find out an item finished when a customer asks for it. A ten-minute Friday count, entered straight into your storefront, keeps listings honest and stops the calls you cannot fulfil.',
    category: 'Inventory',
    date: '14 Mar',
    readMinutes: 4,
  },
  {
    id: 2,
    title: 'Pricing in naira when your supplier prices in dollars',
    excerpt:
      'Rates move faster than your shelves do. Here is how merchants on EreMarket set a margin that survives a jump, review it on a schedule instead of per customer, and avoid repricing the whole catalogue every week.',
    category: 'Pricing',
    date: '02 Mar',
    readMinutes: 5,
  },
  {
    id: 3,
    title: 'Why reserve-and-collect wins in a cash market',
    excerpt:
      'Plenty of buyers will not send money to a shop they have never entered. Letting them hold the item online and pay at your counter removes the risk on both sides — and they almost always buy something else while there.',
    category: 'Payments',
    date: '19 Feb',
    readMinutes: 3,
  },
  {
    id: 4,
    title: 'Photographing products on a phone, on a counter',
    excerpt:
      'No studio, no lightbox. Face a window, clear the background, shoot straight on, and fill the frame. Consistent photos across a catalogue read as a real business faster than any single polished shot.',
    category: 'Merchandising',
    date: '05 Feb',
    readMinutes: 4,
  },
  {
    id: 5,
    title: 'Buying by the carton: what wholesale buyers expect',
    excerpt:
      'Caterers, kiosks and small retailers restocking in volume look for unit price, case quantity and how soon you can fill the order. List those three things and the enquiries turn into orders.',
    category: 'Wholesale',
    date: '21 Jan',
    readMinutes: 6,
  },
]
