import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLocalStorage, useAsyncFn } from "react-use";
import axios from "axios";
import { format, formatISO } from "date-fns";

import { Icon, Card, DateSelect } from "~/components";

export const Profile = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [currentDate, setDate] = useState(formatISO(new Date(2022, 10, 20)));
  const [auth, setAuth] = useLocalStorage("auth", {});


  const [{ value: user, loading, error }, fetchHunches] = useAsyncFn(
    async() => {
      const res = await axios({
        method: 'get',
        baseURL: import.meta.env.VITE_API_URL,
        url: `/${params.username}`,
      });

      const hunches = res.data.hunches.reduce((acc, hunch) => {
        acc[hunch.gameId] = hunch
        return acc
      }, {});

      return {
        ...res.data,
        hunches,
      };
    }
  );

  const [games, fetchGames] = useAsyncFn(async (params) => {
    const res = await axios({
      method: 'get',
      baseURL: import.meta.env.VITE_API_URL,
      url: '/games',
      params
    })

    return res.data
  })

  const logout = () => {
    setAuth({});
    navigate('/login');
  };

  const isLoading = games.loading || loading;
  const hasError = games.error || error;
  const isDone = !isLoading && !hasError;

  useEffect(() => {
    fetchHunches();
  }, []);

  useEffect(() => {
    fetchGames({ gameTime: currentDate });
  }, [currentDate]); 

  const goToHome = () => {
    navigate('/');
  };

  return (
    <div className="">
      <header className="text-white bg-gradient-to-b from-black to-red-500">
        <div className="container max-w-3xl flex justify-center p-6 ">
          <img src="/imgs/logo-red.svg" className="w-28 md:w-40 cursor-pointer" onClick={goToHome}/>
        </div>
        <section id="header" className="shadow-lg shadow-red-500/40">
          <div className="space-y-2 p-2 px-8 flex justify-between">
            <a href="/dashboard">
              <Icon name="back" className="w-10" />
            </a>
            <h3 className="p-2 text-2xl font-bold">
              {`${auth?.user?.id ? 'Olá, ': ''}${user?.name}`}
            </h3>
            {auth?.user?.id && (
            <div onClick={logout} className="p-2 cursor-pointer">
              Sair
            </div>
          )}
          </div>
        </section>
      </header>

      <main className="space-y-6">


        <section id="content" className="container max-w-3xl p-4 space-y-4">
          <h2 className="p-4 text-red-500 text-xl font-bold flex justify-center">Seus palpites:</h2>

          <DateSelect currentDate={currentDate} onChange={setDate} />

          <div className="space-y-4">
            {isLoading && "Carregando jogos..."}
            {hasError && "Ops! Algo deu errado."}
            {isDone && games.value?.map(game => (
                <Card
                  key={game.id}
                  gameId={game.id}
                  homeTeam={game.homeTeam}
                  awayTeam={game.awayTeam}
                  gameTime={format(new Date(game.gameTime), "H:mm")}
                  homeTeamScore={user?.hunches?.[game.id]?.homeTeamScore || '' }
                  awayTeamScore={user?.hunches?.[game.id]?.awayTeamScore || '' }
                  disabled={true}
                />
              ))}
          </div>
        </section>
      </main>
    </div>
  );
};
