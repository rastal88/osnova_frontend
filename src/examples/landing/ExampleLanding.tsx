import {
  ApiOutlined,
  GlobalOutlined,
  MobileOutlined,
  SafetyOutlined,
  SmileOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { hero } from '../../assets/images/generated';
import Seo from '../../components/Seo/Seo';
import { Cta, Faq, Gallery, Hero, Pricing, Reviews, Services } from '../../components/blocks';
import { DEFAULT_CURRENCY } from '../../config/format';
import { useFormat } from '../../i18n/format';
import { placeholderImage } from './placeholders';

const SERVICES: [
  key: 'fast' | 'secure' | 'languages' | 'mobile' | 'api' | 'support',
  icon: ComponentType,
][] = [
  ['fast', ThunderboltOutlined],
  ['secure', SafetyOutlined],
  ['languages', GlobalOutlined],
  ['mobile', MobileOutlined],
  ['api', ApiOutlined],
  ['support', SmileOutlined],
];
const GALLERY_HUES = [210, 160, 260, 20, 320, 120];
const PLANS = [
  { key: 'basic', price: 0 },
  { key: 'pro', price: 19, highlighted: true },
  { key: 'business', price: 49 },
] as const;
const REVIEWS = [
  { key: 'anna', rating: 5 },
  { key: 'james', rating: 5 },
  { key: 'olga', rating: 4 },
] as const;
const FAQ = ['start', 'languages', 'design', 'remove'] as const;

/** Example page: every landing block with demo content. */
const ExampleLanding = () => {
  const { t } = useTranslation('examples');
  const navigate = useNavigate();
  const format = useFormat();
  const price = (value: number) =>
    format.number(value, {
      style: 'currency',
      currency: DEFAULT_CURRENCY,
      maximumFractionDigits: 0,
    });

  const contactButton = (
    <Button size="large" onClick={() => navigate('/examples/contact')}>
      {t('landing.contact')}
    </Button>
  );

  return (
    <>
      <Seo page="exampleLanding" />

      <Hero
        eyebrow={t('landing.hero.eyebrow')}
        title={t('landing.hero.title')}
        text={t('landing.hero.text')}
        image={hero}
        imageAlt={t('landing.hero.imageAlt')}
        actions={
          <>
            <Button type="primary" size="large" href="#pricing">
              {t('landing.hero.action')}
            </Button>
            {contactButton}
          </>
        }
      />

      <Services
        id="services"
        title={t('landing.services.title')}
        subtitle={t('landing.services.subtitle')}
        items={SERVICES.map(([key, Icon]) => ({
          icon: <Icon />,
          title: t(`landing.services.items.${key}.title`),
          text: t(`landing.services.items.${key}.text`),
        }))}
      />

      <Gallery
        id="gallery"
        tone="surface"
        title={t('landing.gallery.title')}
        subtitle={t('landing.gallery.subtitle')}
        items={GALLERY_HUES.map((hue, index) => ({
          image: placeholderImage(hue),
          alt: t('landing.gallery.alt', { number: index + 1 }),
          caption: t('landing.gallery.caption', { number: index + 1 }),
        }))}
      />

      <Pricing
        id="pricing"
        title={t('landing.pricing.title')}
        subtitle={t('landing.pricing.subtitle')}
        plans={PLANS.map((plan) => ({
          name: t(`landing.pricing.plans.${plan.key}.name`),
          description: t(`landing.pricing.plans.${plan.key}.description`),
          price: price(plan.price),
          period: t('landing.pricing.period'),
          features: t(`landing.pricing.plans.${plan.key}.features`, {
            returnObjects: true,
          }),
          highlighted: 'highlighted' in plan,
          badge: 'highlighted' in plan ? t('landing.pricing.popular') : undefined,
          action: (
            <Button
              type={'highlighted' in plan ? 'primary' : 'default'}
              onClick={() => navigate('/examples/contact')}
            >
              {t('landing.pricing.choose')}
            </Button>
          ),
        }))}
      />

      <Reviews
        id="reviews"
        tone="surface"
        title={t('landing.reviews.title')}
        items={REVIEWS.map((review) => ({
          author: t(`landing.reviews.items.${review.key}.author`),
          role: t(`landing.reviews.items.${review.key}.role`),
          text: t(`landing.reviews.items.${review.key}.text`),
          rating: review.rating,
        }))}
      />

      <Faq
        id="faq"
        title={t('landing.faq.title')}
        items={FAQ.map((key) => ({
          question: t(`landing.faq.items.${key}.question`),
          answer: t(`landing.faq.items.${key}.answer`),
        }))}
      />

      <Cta
        title={t('landing.cta.title')}
        text={t('landing.cta.text')}
        actions={
          <Button size="large" onClick={() => navigate('/examples/contact')}>
            {t('landing.contact')}
          </Button>
        }
      />
    </>
  );
};

export default ExampleLanding;
