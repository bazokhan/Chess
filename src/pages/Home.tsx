import { Column } from 'components/layouts/Column'
import { ScrollLayout } from 'components/layouts/ScrollLayout'
import { Paragraph } from 'components/ui/Paragraph'
import { Cpu, ExternalLink, Gamepad2, Rocket, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import wk from 'assets/chess_pieces/wk.png'
import bk from 'assets/chess_pieces/bk.png'
import wq from 'assets/chess_pieces/wq.png'
import bq from 'assets/chess_pieces/bq.png'
import loldoll from 'assets/tictactoe/loldoll.png'
import minecraftsupersword from 'assets/tictactoe/mcsword.png'

const internalPages = [
  {
    to: '/chess',
    title: 'Chess Playground',
    description:
      'Play the full board, switch engines, inspect telemetry, run puzzles, and test evaluation/analysis tools.'
  },
  {
    to: '/minimax',
    title: 'MiniMax Explorer',
    description:
      'Visual experimentation area for search trees and position scoring. Useful for algorithm reasoning and debugging.'
  },
  {
    to: '/tictactoe',
    title: 'TicTacToe',
    description:
      'Small game sandbox where the AI choices stay easy to inspect. A compact page for game loop and minimax basics.'
  }
]

const projects = [
  {
    href: 'https://my-game-engine-zeta.vercel.app/',
    title: 'MyGameEngine',
    subtitle: 'Playful Game Engine Lab',
    description:
      'A hub of game experiments (physics, strategy, clicker, and 3D editor ideas) focused on quick iteration.'
  },
  {
    href: 'https://gamercury.lovable.app/',
    title: 'Gamercury Studio',
    subtitle: 'Indie Mobile Apps & Games',
    description:
      'Portfolio site for released and in-progress mobile projects across productivity, arcade, and strategy genres.'
  }
]

const visualCards = [
  {
    title: 'Legacy Engine',
    subtitle: 'Original architecture',
    image: bq
  },
  {
    title: 'Bitboards Engine',
    subtitle: 'Current optimization path',
    image: wq
  },
  {
    title: 'Algorithm Sandbox',
    subtitle: 'MiniMax and game tree experiments',
    image: minecraftsupersword
  },
  {
    title: 'Small Games',
    subtitle: 'TicTacToe and playful prototypes',
    image: loldoll
  }
]

const timeline = [
  {
    icon: <Gamepad2 className="h-4 w-4" />,
    title: 'Legacy Era',
    text: 'First chess engine experiments from years ago, focused on learning move generation and search fundamentals.'
  },
  {
    icon: <Cpu className="h-4 w-4" />,
    title: 'Bitboards Rewrite',
    text: 'Modernized engine representation and optimization path for faster analysis, cleaner architecture, and better tooling.'
  },
  {
    icon: <Rocket className="h-4 w-4" />,
    title: 'Playground Mode',
    text: 'Ongoing iteration using pages for chess, minimax, and smaller games to validate ideas with visible feedback.'
  }
]

export const HomePage = () => {
  return (
    <ScrollLayout>
      <div className="w-full space-y-4 pb-6">
        <Column className="home-hero-shell relative overflow-hidden">
          <div className="home-grid-overlay" />
          <span className="chess-chip home-chip">Board Games Lab</span>
          <div className="mt-3 grid gap-4 xl:grid-cols-[1.3fr_0.9fr] xl:items-center">
            <div className="space-y-3">
              <h1 className="text-3xl font-black text-white md:text-4xl 2xl:text-5xl">
                Chess engine evolution, from legacy logic to bitboards
              </h1>
              <Paragraph>
                This project started years ago as my first chess engine. I rewrote it
                with a bitboards approach to unlock better performance, cleaner
                modeling, and deeper experimentation.
              </Paragraph>
              <Paragraph>
                The engine is still evolving. I keep improving search, evaluation, and
                tooling while using this app as a practical playground for board-game
                ideas and algorithms.
              </Paragraph>
              <div className="flex flex-wrap gap-2">
                <Link to="/chess" className="chess-overlay-btn">
                  Enter chess lab
                </Link>
                <Link to="/minimax" className="chess-overlay-btn">
                  Open minimax room
                </Link>
                <Link to="/tictactoe" className="chess-overlay-btn">
                  Open TicTacToe
                </Link>
              </div>
            </div>
            <div className="home-hero-visual-grid" aria-hidden>
              <div className="home-hero-image-card home-hero-image-card-main">
                <img src={wk} alt="White king piece" className="home-hero-piece-image" />
              </div>
              <div className="home-hero-image-card home-hero-image-card-alt">
                <img src={bk} alt="Black king piece" className="home-hero-piece-image" />
              </div>
              <div className="home-hero-image-card">
                <img src={wq} alt="White queen piece" className="home-hero-piece-image" />
              </div>
              <div className="home-hero-image-card">
                <img src={bq} alt="Black queen piece" className="home-hero-piece-image" />
              </div>
            </div>
          </div>
        </Column>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {visualCards.map((item) => (
            <div key={item.title} className="home-visual-card">
              <div className="home-visual-image-wrap">
                <img src={item.image} alt={item.title} className="home-visual-image" />
              </div>
              <p className="m-0 text-base font-black text-white">{item.title}</p>
              <p className="m-0 text-xs uppercase tracking-[0.08em] text-[#c6beaf]">
                {item.subtitle}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {timeline.map((step) => (
            <div key={step.title} className="home-timeline-card">
              <div className="home-timeline-icon">{step.icon}</div>
              <p className="m-0 text-base font-black text-white">{step.title}</p>
              <p className="m-0 text-sm text-[#d4ccbc]">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 xl:grid-cols-3">
          {internalPages.map((page) => (
            <Column key={page.to} className="home-nav-card justify-between">
              <div>
                <p className="title m-0">Internal page</p>
                <p className="mt-1 text-lg font-black text-white">{page.title}</p>
                <p className="mt-1 text-sm text-[#cdc6b8]">{page.description}</p>
              </div>
              <Link to={page.to} className="chess-overlay-btn mt-3 w-full">
                Go to page
              </Link>
            </Column>
          ))}
        </div>

        <div className="grid gap-3 xl:grid-cols-[1.2fr_1fr]">
          <Column>
            <p className="title m-0">Engine and algorithms</p>
            <p className="text-xl font-black text-white">What this repo is about</p>
            <Paragraph>
              Main focus: compare and improve two chess engine implementations. The
              legacy engine preserves the original architecture, while the bitboards
              engine is the modern rewrite under active optimization.
            </Paragraph>
            <Paragraph>
              Supporting pages make concepts visible: minimax exploration, board
              evaluation feedback, move generation checks, and smaller games that keep
              algorithm experiments fast to iterate.
            </Paragraph>
            <p className="text-xs text-[#b8b1a5]">
              Tip: use the chess page telemetry and controls to observe engine behavior
              while changing search scenarios.
            </p>
          </Column>

          <Column>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#7b715d] bg-[#3a372f] px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#eadfc9]">
              <Sparkles className="h-4 w-4" />
              Other Projects
            </div>
            <div className="mt-2 space-y-2">
              {projects.map((project) => (
                <div key={project.href} className="home-project-card">
                  <p className="m-0 text-base font-black text-white">{project.title}</p>
                  <p className="m-0 text-xs uppercase tracking-[0.08em] text-[#c7beaf]">
                    {project.subtitle}
                  </p>
                  <p className="mt-1 text-sm text-[#d8d0c1]">{project.description}</p>
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noreferrer"
                    className="chess-overlay-btn mt-2 w-full"
                  >
                    Visit project <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </Column>
        </div>
      </div>
    </ScrollLayout>
  )
}
