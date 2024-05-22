import { Link } from 'react-router-dom'

export const HomePage = () => {
  return (
    <div className="h-full w-full bg-white p-4 text-black">
      <h1 className="text-xl font-bold">My Chess (and others) Engine</h1>
      <p>
        Welcome to this project. It&apos;s a side project I do in my spare time
        to practice algorithms, anc create fun things for myself
      </p>
      <h2 className="text-sm font-bold">Tech Stack:</h2>
      <ol>
        <li>Vite</li>
        <li>Typescript</li>
        <li>TailwindCSS</li>
        <li>No Backend or Database</li>
      </ol>
      <h2 className="text-sm font-bold">Pages:</h2>
      <ul>
        <li>
          <Link to="/chess">Chess</Link>
        </li>
        <li>
          <Link to="/minimax">MinMax (Dangerous - Hangs)</Link>
        </li>
        <li>
          <Link to="/tictactoe">TicTacToe</Link>
        </li>
      </ul>
      <h2 className="text-sm font-bold">Notes:</h2>
      <ul>
        <li>Do not forget to read the README file</li>
      </ul>
    </div>
  )
}
