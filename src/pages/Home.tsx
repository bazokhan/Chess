import { Column } from 'components/layouts/Column'
import { ScrollLayout } from 'components/layouts/ScrollLayout'
import { Paragraph } from 'components/ui/Paragraph'
import { Seo } from 'components/Seo'
import { ExternalLink, Sparkles, Sword } from 'lucide-react'
import { Link } from 'react-router-dom'
import heroImage from 'assets/home/chess-hero.jpg'

const projects = [
  {
    href: 'https://mo-baz.com',
    title: 'mo-baz.com',
    subtitle: 'Mohamed Elbaz - Software Developer & Product Builder',
    description:
      'Personal website with professional profiles, selected products/prototypes, and portfolio links across web, games, tooling, and AI projects.'
  },
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

export const HomePage = () => {
  return (
    <ScrollLayout>
      <Seo
        title="Chess Engine Playground | Legacy to Bitboards"
        description="A board games playground focused on a chess engine rewrite from legacy architecture to bitboards, with interactive chess and TicTacToe pages."
        path="/"
        image={heroImage}
        keywords="chess engine, bitboards, chess ai, algorithms, game development, tictactoe"
      />
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
                This project began as an older chess engine implementation and was
                rewritten with bitboards to improve performance and architecture.
              </Paragraph>
              <Paragraph>
                It remains an active playground for engine development, evaluation
                tuning, and algorithm experimentation.
              </Paragraph>
              <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center">
                <Link to="/chess" className="home-primary-cta">
                  <Sword className="h-5 w-5" />
                  Open Chess Playground
                </Link>
                <Link to="/tictactoe" className="home-secondary-cta">
                  Open TicTacToe
                </Link>
              </div>
            </div>
            <div className="home-hero-banner">
              <img
                src={heroImage}
                alt="Chess board and pieces"
                className="home-hero-banner-image"
              />
              <div className="home-hero-banner-overlay">
                Royalty-free image from Pixabay
              </div>
            </div>
          </div>
        </Column>

        <Column className="home-chess-spotlight">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="title m-0 text-[#c4f0ff]">Primary Experience</p>
              <p className="m-0 text-2xl font-black text-white">Chess Playground</p>
            </div>
            <Link to="/chess" className="home-primary-cta">
              <Sword className="h-5 w-5" />
              Launch Chess
            </Link>
          </div>
          <p className="m-0 text-sm text-[#d4eaf6]">
            Full board experience with engine controls, analysis panes, puzzle loading,
            and telemetry to inspect performance and search behavior.
          </p>
        </Column>

        <div className="grid gap-3 xl:grid-cols-[1.2fr_1fr]">
          <Column>
            <p className="title m-0">Project Overview</p>
            <p className="text-xl font-black text-white">What this repo is about</p>
            <Paragraph>
              Main focus: compare and improve two chess engine implementations. The
              legacy engine preserves the original architecture, while the bitboards
              engine is the modern rewrite under active optimization.
            </Paragraph>
            <Paragraph>
              Supporting pages make concepts visible: board evaluation feedback,
              move generation checks, and smaller games that keep algorithm
              experiments fast to iterate.
            </Paragraph>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link to="/chess" className="home-secondary-cta">
                Chess Page
              </Link>
              <Link to="/tictactoe" className="home-secondary-cta">
                TicTacToe Page
              </Link>
            </div>
          </Column>

          <Column>
            <div className="home-accent-pill inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
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
