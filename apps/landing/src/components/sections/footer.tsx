'use client';

import React from 'react';
import { Scale, Mail, Phone, MapPin, Send } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { SITE_CONFIG } from '@/lib/constants';

const footerLinks = {
  company: [
    { name: 'О компании', href: '#about' },
    { name: 'Как это работает', href: '#how-it-works' },
    { name: 'Наши адвокаты', href: '#lawyers' },
    { name: 'Контакты', href: '#contact' },
  ],
  lawyers: [
    { name: 'Стать адвокатом', href: '#become-lawyer' },
    { name: 'Требования', href: '#requirements' },
    { name: 'Тарифы для юристов', href: '#lawyer-pricing' },
    { name: 'FAQ для юристов', href: '#lawyer-faq' },
  ],
  support: [
    { name: 'Помощь', href: '#help' },
    { name: 'Центр поддержки', href: '#support' },
    { name: 'Безопасность', href: '#security' },
    { name: 'Статус системы', href: '#status' },
  ],
  legal: [
    { name: 'Политика конфиденциальности', href: '#privacy' },
    { name: 'Условия использования', href: '#terms' },
    { name: 'Пользовательское соглашение', href: '#agreement' },
    { name: 'Согласие на обработку ПД', href: '#consent' },
  ],
};

const socialLinks = [
  { name: 'Telegram', href: SITE_CONFIG.links.telegram, icon: Send },
  { name: 'VK', href: SITE_CONFIG.links.vk },
  { name: 'Instagram', href: SITE_CONFIG.links.instagram },
];

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer content */}
      <Container>
        <div className="py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
            {/* Brand column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Scale className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">
                  {SITE_CONFIG.name}
                </span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Юридическая помощь онлайн. Быстро, надежно, доступно.
                Экстренный вызов адвоката 24/7.
              </p>

              {/* Social links */}
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 rounded-lg flex items-center justify-center transition-all duration-200 group"
                    aria-label={social.name}
                  >
                    {social.icon ? (
                      <social.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    ) : (
                      <span className="text-sm font-bold">{social.name[0]}</span>
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* Links columns */}
            <div>
              <h3 className="text-white font-semibold mb-4">Компания</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Адвокатам</h3>
              <ul className="space-y-3">
                {footerLinks.lawyers.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Поддержка</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Правовая информация</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact info */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-purple-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <a
                    href={`mailto:${SITE_CONFIG.links.email}`}
                    className="text-white hover:text-purple-400 transition-colors"
                  >
                    {SITE_CONFIG.links.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-purple-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Телефон</p>
                  <a
                    href={`tel:${SITE_CONFIG.links.phoneRaw}`}
                    className="text-white hover:text-purple-400 transition-colors"
                  >
                    {SITE_CONFIG.links.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-purple-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Адрес</p>
                  <p className="text-white">{SITE_CONFIG.company.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <Container>
          <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500 text-center md:text-left">
              <p>
                © {currentYear} {SITE_CONFIG.company.name}. Все права защищены.
              </p>
              <p className="mt-1">
                ИНН {SITE_CONFIG.company.inn} • ОГРН {SITE_CONFIG.company.ogrn}
              </p>
            </div>

            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#privacy" className="hover:text-white transition-colors">
                Конфиденциальность
              </a>
              <a href="#terms" className="hover:text-white transition-colors">
                Условия
              </a>
              <a href="#sitemap" className="hover:text-white transition-colors">
                Карта сайта
              </a>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
};
