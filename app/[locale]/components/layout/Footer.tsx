import { Instagram, Facebook, Twitter, Linkedin, Youtube, Music } from 'lucide-react';

type Props = {
  locale: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
}

export default function Footer({ locale, socialMedia }: Props) {
  const socialLinks = [
    { name: 'Instagram', url: socialMedia?.instagram, icon: Instagram },
    { name: 'Facebook', url: socialMedia?.facebook, icon: Facebook },
    { name: 'Twitter', url: socialMedia?.twitter, icon: Twitter },
    { name: 'LinkedIn', url: socialMedia?.linkedin, icon: Linkedin },
    { name: 'YouTube', url: socialMedia?.youtube, icon: Youtube },
    { name: 'TikTok', url: socialMedia?.tiktok, icon: Music },
  ].filter(link => link.url); // Solo mostrar redes sociales que tengan URL

  return (
    <footer className="bg-gray-800 text-white py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-center sm:text-left">
            &copy; {new Date().getFullYear()} Cristian Pirovano. {locale === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
          </p>
          
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-4">
              {socialLinks.map(({ name, url, icon: Icon }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-300 transition-colors"
                  aria-label={name}
                  title={name}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
