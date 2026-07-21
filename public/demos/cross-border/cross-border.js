import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion } from 'motion/react';

const h = React.createElement;
const MotionDiv = motion.div;
const MotionHeader = motion.header;
const MotionH1 = motion.h1;
const MotionP = motion.p;

const VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4';

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
  },
};

function LogoMark() {
  return h(
    'span',
    { className: 'flex items-center gap-2.5 font-geist text-[14px] font-semibold tracking-[-0.03em] text-[#1d2029]' },
    h('span', { className: 'grid size-8 place-items-center rounded-full bg-[#17191e] text-[11px] font-semibold text-white shadow-[0_8px_22px_rgba(10,12,18,0.18)]' }, 'S'),
    h('span', null, 'Simple')
  );
}

function StarRow() {
  return h(
    'div',
    { className: 'flex items-center gap-[3px] text-[14px] leading-none text-[#16181e]', 'aria-label': 'Five star rating' },
    ...Array.from({ length: 5 }, (_, index) => h('span', { key: index, 'aria-hidden': true }, '★'))
  );
}

function SocialProof() {
  return h(
    MotionDiv,
    {
      variants: itemVariants,
      className: 'social-proof mx-auto flex w-fit items-center gap-3 rounded-full border border-black/[0.06] bg-white/75 px-4 py-2.5 shadow-[0_12px_38px_rgba(74,82,96,0.08)] backdrop-blur-xl',
    },
    h('div', { className: 'flex -space-x-1.5', 'aria-hidden': true },
      h('span', { className: 'proof-logo' }, 'N'),
      h('span', { className: 'proof-logo' }, 'A'),
      h('span', { className: 'proof-logo' }, 'R')
    ),
    h('div', { className: 'h-5 w-px bg-black/10', 'aria-hidden': true }),
    h(StarRow),
    h('span', { className: 'font-geist text-[12px] font-medium text-[#373a46]' }, '1,020+ Reviews')
  );
}

function EmailCTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function submit(event) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return h(
    MotionDiv,
    { variants: itemVariants, className: 'email-shell mx-auto w-full max-w-[650px] rounded-[40px] border border-black/[0.07] bg-[#fcfcfc] p-2' },
    h(
      'form',
      { onSubmit: submit, className: 'flex items-center gap-2', id: 'cta' },
      h('label', { className: 'sr-only', htmlFor: 'email' }, 'Work email'),
      h('input', {
        id: 'email',
        type: 'email',
        required: true,
        value: email,
        onChange: (event) => {
          setEmail(event.target.value);
          setSubmitted(false);
        },
        placeholder: 'Enter your work email',
        className: 'min-w-0 flex-1 rounded-full bg-transparent px-5 py-4 font-geist text-[15px] text-[#252832] outline-none placeholder:text-[#7d818d] focus:ring-0',
      }),
      h(
        motion.button,
        {
          type: 'submit',
          whileHover: { scale: 1.015 },
          whileTap: { scale: 0.985 },
          className: 'cta-gloss min-h-[54px] rounded-full px-7 font-geist text-[14px] font-medium tracking-[-0.02em] text-white transition duration-200 shadow-[inset_-4px_-6px_25px_0px_rgba(201,201,201,0.08),inset_4px_4px_10px_0px_rgba(29,29,29,0.24)]',
        },
        submitted ? 'Account Reserved' : 'Create Free Account'
      )
    ),
    submitted
      ? h('p', { className: 'px-5 pb-2 pt-1 font-geist text-[12px] text-[#5d6270]', role: 'status' }, `Invitation reserved for ${email}.`)
      : null
  );
}

function Hero() {
  const [videoReady, setVideoReady] = useState(false);

  return h(
    'section',
    { className: 'relative min-h-screen overflow-hidden bg-white', 'data-template': 'remote-management-hero' },
    h('div', { className: 'video-fallback', 'aria-hidden': true }),
    h(
      'div',
      { className: 'absolute inset-0 overflow-hidden', 'aria-hidden': true },
      h('video', {
        autoPlay: true,
        loop: true,
        muted: true,
        playsInline: true,
        preload: 'auto',
        src: VIDEO_URL,
        onLoadedData: () => setVideoReady(true),
        onCanPlay: () => setVideoReady(true),
        className: `hero-video w-full h-full object-cover [transform:scaleY(-1)]${videoReady ? ' is-ready' : ''}`,
      }),
      h('div', { className: 'absolute inset-0 bg-gradient-to-b from-[26.416%] from-[rgba(255,255,255,0)] to-[66.943%] to-white' }),
      h('div', { className: 'absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(255,255,255,0)_0%,rgba(255,255,255,0.06)_28%,rgba(255,255,255,0.38)_56%,rgba(255,255,255,0.9)_82%)]' })
    ),
    h(
      MotionHeader,
      {
        initial: { opacity: 0, y: -14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
        className: 'glass-nav fixed left-8 right-8 top-7 z-30 mx-auto flex max-w-[1200px] items-center justify-between rounded-full px-4 py-3',
      },
      h(LogoMark),
      h('nav', { className: 'flex items-center gap-2 font-geist text-[13px] font-medium text-[#4d515d]' },
        h('a', { href: '#about', className: 'hidden rounded-full px-4 py-2 transition hover:bg-black/[0.04] sm:block' }, 'How it works'),
        h('a', { href: '/resume/#projects', className: 'rounded-full bg-white px-4 py-2 text-[#1e2027] shadow-[0_4px_18px_rgba(44,49,60,0.08)] transition hover:-translate-y-0.5' }, 'Return to portfolio')
      )
    ),
    h(
      MotionDiv,
      {
        variants: containerVariants,
        initial: 'hidden',
        animate: 'show',
        className: 'relative z-10 mx-auto flex min-h-screen max-w-[1200px] flex-col items-center gap-y-8 px-6 pb-24 pt-[290px] text-center sm:px-8',
      },
      h(
        MotionH1,
        {
          variants: itemVariants,
          className: 'hero-title hero-heading max-w-[1120px] font-geist text-[80px] font-medium leading-[0.93] tracking-[-0.04em] text-[#17191f]',
        },
        'Simple ',
        h('span', { className: 'management-word font-instrument text-[100px] font-normal italic tracking-[-0.035em]' }, 'management'),
        ' for your remote team'
      ),
      h(
        MotionP,
        {
          variants: itemVariants,
          className: 'hero-copy max-w-[554px] font-geist text-[18px] leading-[1.55] tracking-[-0.015em] text-[#373a46]/80',
        },
        'Plan work, align priorities and keep every timezone moving from one calm, transparent workspace built for distributed teams.'
      ),
      h(EmailCTA),
      h(SocialProof)
    )
  );
}

const signals = [
  ['01', 'Async by default', 'Decisions, approvals and progress stay visible without adding another meeting.'],
  ['02', 'One operating rhythm', 'Goals, projects and weekly updates share a single source of truth.'],
  ['03', 'Built across time zones', 'Clear ownership and handoffs keep work moving while your team sleeps.'],
];

function About() {
  return h(
    'section',
    { id: 'about', className: 'relative bg-white px-6 py-28 sm:px-8 lg:py-36' },
    h('div', { className: 'hairline mx-auto mb-20 max-w-[1200px]' }),
    h(
      MotionDiv,
      {
        initial: 'hidden',
        whileInView: 'show',
        viewport: { once: true, amount: 0.25 },
        variants: containerVariants,
        className: 'mx-auto max-w-[1200px]',
      },
      h(MotionP, { variants: itemVariants, className: 'mb-7 font-geist text-[12px] font-semibold uppercase tracking-[0.16em] text-[#777c88]' }, 'Remote operations, simplified'),
      h(MotionH1, { variants: itemVariants, className: 'max-w-[850px] font-geist text-[clamp(42px,5vw,72px)] font-medium leading-[0.98] tracking-[-0.045em] text-[#17191f]' },
        'Less coordination overhead. ',
        h('span', { className: 'font-instrument font-normal italic' }, 'More momentum.')
      ),
      h('div', { className: 'mt-16 grid gap-5 md:grid-cols-3' },
        ...signals.map(([index, title, copy]) => h(
          MotionDiv,
          { key: index, variants: itemVariants, className: 'signal-card min-h-[270px] rounded-[30px] p-7 sm:p-8' },
          h('p', { className: 'font-geist text-[12px] font-semibold text-[#888d98]' }, index),
          h('h2', { className: 'mt-20 font-geist text-[24px] font-medium tracking-[-0.035em] text-[#20232b]' }, title),
          h('p', { className: 'mt-4 max-w-[320px] font-geist text-[15px] leading-[1.55] text-[#5b606d]' }, copy)
        ))
      )
    )
  );
}

function App() {
  return h(React.Fragment, null, h(Hero), h(About));
}

createRoot(document.getElementById('root')).render(h(App));
