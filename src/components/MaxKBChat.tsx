import { AnimatePresence, motion } from 'framer-motion';
import { Bot, ExternalLink, MessageCircle, Minimize2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const maxkbUrl = (import.meta.env.VITE_MAXKB_EMBED_URL || '').trim();

export default function MaxKBChat() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  if (!maxkbUrl) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group fixed bottom-24 right-4 z-[920] flex items-center gap-3 rounded-full border border-accent/15 bg-white/92 p-2 pr-4 text-left shadow-[0_18px_50px_rgba(15,23,42,0.16)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-accent/35 hover:shadow-[0_22px_58px_rgba(37,99,235,0.22)] md:bottom-6 md:right-6"
        aria-label="打开 MaxKB 智能问答"
        aria-expanded={open}
      >
        <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-700 via-accent to-accent-2 text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)]">
          <MessageCircle className="h-5 w-5" strokeWidth={1.8} />
          <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
        </span>
        <span className="hidden sm:block">
          <span className="block text-xs font-semibold text-ink">问问我的 AI 助手</span>
          <span className="mt-0.5 block text-[0.65rem] text-ink-dim">基于 MaxKB 与个人项目知识库</span>
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[980] flex items-end justify-center bg-ink/20 p-0 backdrop-blur-[3px] sm:items-center sm:p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label="MaxKB 智能问答"
          >
            <button
              type="button"
              className="absolute inset-0"
              onClick={() => setOpen(false)}
              aria-label="关闭智能问答"
            />

            <motion.section
              className="relative flex h-[92svh] w-full max-w-[980px] flex-col overflow-hidden rounded-t-[28px] border border-ink/10 bg-white shadow-[0_32px_100px_rgba(15,23,42,0.24)] sm:h-[min(780px,88vh)] sm:rounded-[28px]"
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 28, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <header className="flex items-center justify-between gap-4 border-b border-ink/8 bg-white px-4 py-3 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                    <Bot className="h-5 w-5" strokeWidth={1.7} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-ink sm:text-base">张滨文的 AI 简历助手</h2>
                    <p className="truncate text-[0.68rem] text-ink-dim sm:text-xs">项目经历、技术方案与求职信息问答</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <a
                    href={maxkbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-ink-dim transition hover:bg-accent-soft hover:text-accent"
                    aria-label="在新窗口打开 MaxKB"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="hidden h-9 w-9 items-center justify-center rounded-full text-ink-dim transition hover:bg-accent-soft hover:text-accent sm:flex"
                    aria-label="最小化智能问答"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-ink-dim transition hover:bg-red-50 hover:text-red-600"
                    aria-label="关闭智能问答"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </header>

              <iframe
                src={maxkbUrl}
                title="MaxKB 智能问答"
                className="min-h-0 flex-1 border-0 bg-white"
                allow="clipboard-read; clipboard-write; microphone; camera"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
