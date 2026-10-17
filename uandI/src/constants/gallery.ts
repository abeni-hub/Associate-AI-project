import type { LocaleText } from './services';
export type GalleryItem = { id: number; category: 'Makeup' | 'Hair' | 'Nails' | 'Braids'; image: string; title: LocaleText };
export const gallery: GalleryItem[] = [
  { id: 1, category: 'Makeup', image: 'https://images.pexels.com/photos/39590268/pexels-photo-39590268.jpeg?auto=compress&cs=tinysrgb&w=1000', title: { en: 'Golden hour glam', am: 'የወርቅ ሰዓት ግላም' } },
  { id: 2, category: 'Hair', image: 'https://images.pexels.com/photos/34362903/pexels-photo-34362903.jpeg?auto=compress&cs=tinysrgb&w=1000', title: { en: 'The polished wave', am: 'የተጠናቀቀ ሞገድ' } },
  { id: 3, category: 'Nails', image: 'https://images.pexels.com/photos/11076483/pexels-photo-11076483.jpeg?auto=compress&cs=tinysrgb&w=1000', title: { en: 'Bridal details', am: 'የሙሽራ ዝርዝሮች' } },
  { id: 4, category: 'Makeup', image: 'https://images.pexels.com/photos/9674131/pexels-photo-9674131.jpeg?auto=compress&cs=tinysrgb&w=1000', title: { en: 'Modern radiance', am: 'ዘመናዊ ብርሃን' } },
  { id: 5, category: 'Braids', image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1000', title: { en: 'Sculpted texture', am: 'የተቀረጸ ገጽታ' } },
  { id: 6, category: 'Hair', image: 'https://images.pexels.com/photos/7529417/pexels-photo-7529417.jpeg?auto=compress&cs=tinysrgb&w=1000', title: { en: 'Soft ceremony', am: 'ለስላሳ ሥነ-ስርዓት' } },
];
