"use client";

import Link from "next/link";
import {
  ArrowLeft,
  GraduationCap,
  Code2,
  Network,
  MessageCircle,
  Zap,
  GitBranch,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const TEAM = [
  { name: "Лащевский Максим Александрович ", role: "Алгоритмы и визуализация", initial: "Р1" },
  { name: "Саляхова Камила Маратовна ", role: "Дизайн и алгоритмы", initial: "Р2" },
  { name: "Гатиатуллина Карина Наилева ", role: "UI/UX и алгоритмы", initial: "Р3" },
];

const TECH = [
  "Next.js 16",
  "React 19",
  "@xyflow/react",
  "Redux Toolkit",
  "Tailwind CSS",
  "Recharts",
  "Dagre",
];

const TELEGRAM_LINK = "https://t.me/maksibon2007";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-4 px-6 py-4">
          <Link href="/" className="absolute left-6">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-zinc-400 hover:text-zinc-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-zinc-100">О проекте</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12 flex flex-col items-center">
        <section className="w-full text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/50 px-4 py-1.5 text-sm text-zinc-400">
            <Network className="w-4 h-4" />
            Graph Algorithms Visualizer
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-50 tracking-tight">
            Интерактивная визуализация алгоритмов на графах
          </h2>
          <p className="max-w-2xl mx-auto text-zinc-400 text-lg leading-relaxed">
            Учебный проект для наглядного изучения алгоритмов поиска и кратчайших путей.
          </p>
        </section>

        <section className="w-full text-center space-y-6 mb-16">
          <h3 className="text-xl font-semibold text-zinc-100 flex items-center justify-center gap-2">
            <Zap className="w-5 h-5 text-zinc-500" />
            Функционал
          </h3>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 text-left max-w-2xl mx-auto">
            <ul className="space-y-2 text-zinc-400 text-sm leading-relaxed">
              <li className="flex items-start gap-2">
                <GitBranch className="w-4 h-4 mt-0.5 shrink-0 text-zinc-500" />
                <span>Алгоритмы: BFS, DFS, Dijkstra, A*, Bellman-Ford, Floyd-Warshall, Johnson, D&apos;Esopo-Pape, Levit, Greedy BFS, Bidirectional Dijkstra и A*</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="w-4 h-4 mt-0.5 shrink-0 text-zinc-500" />
                <span>Пошаговая анимация с отображением очередей, стека и приоритетной очереди</span>
              </li>
              <li className="flex items-start gap-2">
                <BarChart3 className="w-4 h-4 mt-0.5 shrink-0 text-zinc-500" />
                <span>Сравнение производительности алгоритмов на одном графе</span>
              </li>
              <li className="flex items-start gap-2">
                <Network className="w-4 h-4 mt-0.5 shrink-0 text-zinc-500" />
                <span>Поддержка направленных и взвешенных графов, пресеты и загрузка своих графов</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="w-full text-center space-y-8 mb-16">
          <h3 className="text-xl font-semibold text-zinc-100 flex items-center justify-center gap-2">
            <GraduationCap className="w-5 h-5 text-zinc-500" />
            Команда
          </h3>
          <div className="flex flex-wrap justify-center gap-6">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 w-[200px] text-center transition-colors hover:border-zinc-700"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 text-lg font-semibold text-zinc-300">
                  {member.initial}
                </div>
                <h4 className="font-medium text-zinc-100">{member.name}</h4>
                <p className="mt-1 text-sm text-zinc-500">{member.role}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-zinc-500">
            ИТМО · Software Engineering M3100 · Year 29
          </p>
        </section>

        <section className="w-full text-center space-y-6 mb-16">
          <h3 className="text-xl font-semibold text-zinc-100 flex items-center justify-center gap-2">
            <Code2 className="w-5 h-5 text-zinc-500" />
            Технологии
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {TECH.map((tech) => (
              <span
                key={tech}
                className="rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 text-sm text-zinc-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        <section className="w-full text-center mb-12">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-zinc-100 mb-2">Поддержка</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Вопросы, предложения или баги
            </p>
            <a
              href={TELEGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Написать в Telegram
            </a>
          </div>
        </section>

        <section className="w-full text-center">
          <Link href="/">
            <Button className="gap-2 bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
              <Network className="w-4 h-4" />
              К визуализатору
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
