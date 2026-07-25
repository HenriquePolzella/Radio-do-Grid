/* ============================================================
   F1 TRACK — Seção 1 (dinâmica)
   Dados ao vivo da temporada via API Jolpica (sucessora da Ergast):
   https://api.jolpi.ca/ergast/f1/ — calendário, escalação e resultados reais.
   Imagens: exclusivamente CDN oficial da Formula1.com (media.formula1.com).
   Se algo não carregar, a página mantém o conteúdo estático (GP de São
   Paulo / Ferrari) e os espaços "IMAGEM OFICIAL PENDENTE".
   ============================================================ */

(function () {
  "use strict";

  var API = "https://api.jolpi.ca/ergast/f1";
  var SEASON = 2026;
  var MEDIA = "https://media.formula1.com/content/dam/fom-website";

  /* ---------------- Tabelas de referência ---------------- */

  /* Fichas técnicas oficiais dos circuitos (Formula1.com).
     Recordes conforme publicados até o início de 2026. */
  var CIRCUITS = {
    albert_park:   { nm: "Albert Park",            km: "5,278", laps: "58", turns: "14", rec: "1:19.813", by: "Charles Leclerc (2024)",   asset: "Australia" },
    shanghai:      { nm: "Xangai",                 km: "5,451", laps: "56", turns: "16", rec: "1:32.238", by: "Michael Schumacher (2004)", asset: "China" },
    suzuka:        { nm: "Suzuka",                 km: "5,807", laps: "53", turns: "18", rec: "1:30.983", by: "Lewis Hamilton (2019)",     asset: "Japan" },
    miami:         { nm: "Miami",                  km: "5,412", laps: "57", turns: "19", rec: "1:29.708", by: "Max Verstappen (2023)",     asset: "Miami" },
    villeneuve:    { nm: "Gilles Villeneuve",      km: "4,361", laps: "70", turns: "14", rec: "1:13.078", by: "Valtteri Bottas (2019)",    asset: "Canada" },
    monaco:        { nm: "Monte Carlo",            km: "3,337", laps: "78", turns: "19", rec: "1:12.909", by: "Lewis Hamilton (2021)",     asset: "Monaco" },
    catalunya:     { nm: "Barcelona-Catalunha",    km: "4,657", laps: "66", turns: "14", rec: "1:16.330", by: "Max Verstappen (2023)",     asset: "Spain" },
    red_bull_ring: { nm: "Red Bull Ring",          km: "4,318", laps: "71", turns: "10", rec: "1:05.619", by: "Carlos Sainz (2020)",       asset: "Austria" },
    silverstone:   { nm: "Silverstone",            km: "5,891", laps: "52", turns: "18", rec: "1:27.097", by: "Max Verstappen (2020)",     asset: "Great_Britain", hub: "Great Britain" },
    spa:           { nm: "Spa-Francorchamps",      km: "7,004", laps: "44", turns: "19", rec: "1:46.286", by: "Valtteri Bottas (2018)",    asset: "Belgium" },
    hungaroring:   { nm: "Hungaroring",            km: "4,381", laps: "70", turns: "14", rec: "1:16.627", by: "Lewis Hamilton (2020)",     asset: "Hungary" },
    zandvoort:     { nm: "Zandvoort",              km: "4,259", laps: "72", turns: "14", rec: "1:11.097", by: "Lewis Hamilton (2021)",     asset: "Netherlands" },
    monza:         { nm: "Monza",                  km: "5,793", laps: "53", turns: "11", rec: "1:21.046", by: "Rubens Barrichello (2004)", asset: "Italy" },
    madring:       { nm: "Madring",                km: "5,474", laps: "—",  turns: "22", rec: "—",        by: "Circuito novo em 2026",     asset: "Madrid" },
    baku:          { nm: "Baku",                   km: "6,003", laps: "51", turns: "20", rec: "1:43.009", by: "Charles Leclerc (2019)",    asset: "Baku", hub: "Azerbaijan" },
    marina_bay:    { nm: "Marina Bay",             km: "4,940", laps: "62", turns: "19", rec: "1:34.486", by: "Daniel Ricciardo (2024)",   asset: "Singapore" },
    americas:      { nm: "Circuito das Américas",  km: "5,513", laps: "56", turns: "20", rec: "1:36.169", by: "Charles Leclerc (2019)",    asset: "USA" },
    rodriguez:     { nm: "Hermanos Rodríguez",     km: "4,304", laps: "71", turns: "17", rec: "1:17.774", by: "Valtteri Bottas (2021)",    asset: "Mexico" },
    interlagos:    { nm: "Interlagos",             km: "4,309", laps: "71", turns: "15", rec: "1:10.540", by: "Valtteri Bottas (2021)",    asset: "Brazil" },
    vegas:         { nm: "Las Vegas Strip",        km: "6,201", laps: "50", turns: "17", rec: "1:34.876", by: "Lando Norris (2024)",       asset: "Las_Vegas", hub: "Las Vegas" },
    losail:        { nm: "Lusail",                 km: "5,419", laps: "57", turns: "16", rec: "1:22.384", by: "Lando Norris (2024)",       asset: "Qatar" },
    yas_marina:    { nm: "Yas Marina",             km: "5,281", laps: "58", turns: "16", rec: "1:25.637", by: "Kevin Magnussen (2024)",    asset: "Abu_Dhabi", hub: "Abu Dhabi" }
  };

  var GP_PT = {
    "Australian Grand Prix": "da Austrália",       "Chinese Grand Prix": "da China",
    "Japanese Grand Prix": "do Japão",             "Miami Grand Prix": "de Miami",
    "Canadian Grand Prix": "do Canadá",            "Monaco Grand Prix": "de Mônaco",
    "Spanish Grand Prix": "da Espanha",            "Austrian Grand Prix": "da Áustria",
    "British Grand Prix": "da Grã-Bretanha",       "Belgian Grand Prix": "da Bélgica",
    "Hungarian Grand Prix": "da Hungria",          "Dutch Grand Prix": "dos Países Baixos",
    "Italian Grand Prix": "da Itália",             "Madrid Grand Prix": "de Madri",
    "Azerbaijan Grand Prix": "do Azerbaijão",      "Singapore Grand Prix": "de Singapura",
    "United States Grand Prix": "dos Estados Unidos", "Mexico City Grand Prix": "da Cidade do México",
    "São Paulo Grand Prix": "de São Paulo",        "Las Vegas Grand Prix": "de Las Vegas",
    "Qatar Grand Prix": "do Catar",                "Abu Dhabi Grand Prix": "de Abu Dhabi",
    "Bahrain Grand Prix": "do Bahrein",            "Saudi Arabian Grand Prix": "da Arábia Saudita",
    "Emilia Romagna Grand Prix": "da Emília-Romanha"
  };

  var COUNTRY_ISO = {
    Australia: "au", China: "cn", Japan: "jp", USA: "us", Canada: "ca", Monaco: "mc",
    Spain: "es", Austria: "at", UK: "gb", Belgium: "be", Hungary: "hu", Netherlands: "nl",
    Italy: "it", Azerbaijan: "az", Singapore: "sg", Mexico: "mx", Brazil: "br",
    Qatar: "qa", UAE: "ae", Bahrain: "bh", "Saudi Arabia": "sa"
  };

  var NATIONALITY = {
    British:   ["Reino Unido", "gb"],  Monegasque: ["Mônaco", "mc"],
    Dutch:     ["Países Baixos", "nl"], Spanish:   ["Espanha", "es"],
    Mexican:   ["México", "mx"],        Australian: ["Austrália", "au"],
    German:    ["Alemanha", "de"],      French:     ["França", "fr"],
    Japanese:  ["Japão", "jp"],         Thai:       ["Tailândia", "th"],
    Finnish:   ["Finlândia", "fi"],     Danish:     ["Dinamarca", "dk"],
    Chinese:   ["China", "cn"],         American:   ["Estados Unidos", "us"],
    Argentine: ["Argentina", "ar"],     Argentinian:["Argentina", "ar"],
    Italian:   ["Itália", "it"],        Brazilian:  ["Brasil", "br"],
    Canadian:  ["Canadá", "ca"],        "New Zealander": ["Nova Zelândia", "nz"]
  };

  /* Fichas oficiais dos pilotos (formula1.com/en/drivers) — official-data.js */
  var OFFICIAL = window.F1_OFFICIAL || {};

  /* Slugs do acervo antigo (teams/2025, logos coloridos) */
  var TEAM_ASSETS = {
    ferrari: "ferrari", mclaren: "mclaren", mercedes: "mercedes",
    red_bull: "red-bull-racing", aston_martin: "aston-martin", alpine: "alpine",
    williams: "williams", rb: "racing-bulls", haas: "haas",
    audi: null, cadillac: null, sauber: "kick-sauber"
  };

  /* Slugs do acervo 2026 oficial (formula1.com/en/drivers e /en/teams):
     media.formula1.com/image/upload/.../common/f1/2026/{slug}/... */
  var IMGUP = "https://media.formula1.com/image/upload/";
  var F1_SLUG = {
    ferrari: "ferrari", mclaren: "mclaren", mercedes: "mercedes",
    red_bull: "redbullracing", aston_martin: "astonmartin", alpine: "alpine",
    williams: "williams", rb: "racingbulls", haas: "haasf1team",
    audi: "audi", cadillac: "cadillac"
  };
  /* Logos: usamos o colorido (2026{slug}logo.webp), mas estas equipes têm o
     escudo escuro/prateado e somem no tema escuro → versão branca oficial. */
  var LOGO_WHITE = ["mercedes", "astonmartin", "audi", "cadillac"];
  function logoFile(slug) {
    return "2026" + slug + (LOGO_WHITE.indexOf(slug) >= 0 ? "logowhite" : "logo") + ".webp";
  }

  /* Cores oficiais (--f1-team-colour em formula1.com/en/teams) */
  var TEAM_COLORS = {
    ferrari: "#e8002d", mclaren: "#ff8000", mercedes: "#27f4d2",
    red_bull: "#3671c6", aston_martin: "#229971", alpine: "#00a1e8",
    williams: "#1868db", rb: "#6692ff", haas: "#dee1e2",
    audi: "#ff2d00", cadillac: "#aaaaad"
  };

  var TEAM_NAMES = {
    ferrari: ["Ferrari", "Scuderia Ferrari"], mclaren: ["McLaren", null],
    mercedes: ["Mercedes", null], red_bull: ["Red Bull", null],
    aston_martin: ["Aston Martin", null], alpine: ["Alpine", null],
    williams: ["Williams", null], rb: ["Racing Bulls", null], haas: ["Haas", null],
    audi: ["Audi", null], cadillac: ["Cadillac", null], sauber: ["Sauber", null]
  };

  /* ---------------- Idiomas (PT padrão, EN, ES) ---------------- */
  var GP_ES = {
    "Australian Grand Prix": "de Australia",       "Chinese Grand Prix": "de China",
    "Japanese Grand Prix": "de Japón",             "Miami Grand Prix": "de Miami",
    "Canadian Grand Prix": "de Canadá",            "Monaco Grand Prix": "de Mónaco",
    "Spanish Grand Prix": "de España",             "Austrian Grand Prix": "de Austria",
    "British Grand Prix": "de Gran Bretaña",       "Belgian Grand Prix": "de Bélgica",
    "Hungarian Grand Prix": "de Hungría",          "Dutch Grand Prix": "de los Países Bajos",
    "Italian Grand Prix": "de Italia",             "Madrid Grand Prix": "de Madrid",
    "Azerbaijan Grand Prix": "de Azerbaiyán",      "Singapore Grand Prix": "de Singapur",
    "United States Grand Prix": "de Estados Unidos", "Mexico City Grand Prix": "de la Ciudad de México",
    "São Paulo Grand Prix": "de São Paulo",        "Las Vegas Grand Prix": "de Las Vegas",
    "Qatar Grand Prix": "de Catar",                "Abu Dhabi Grand Prix": "de Abu Dabi",
    "Bahrain Grand Prix": "de Baréin",             "Saudi Arabian Grand Prix": "de Arabia Saudita",
    "Emilia Romagna Grand Prix": "de Emilia-Romaña"
  };

  var MONTHS = {
    pt: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
    en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    es: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  };
  var WEEKDAYS = {
    pt: ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"],
    en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    es: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
  };

  var T = {
    pt: {
      nav_home: "Início", nav_calendar: "Calendário", nav_drivers: "Pilotos",
      nav_teams: "Equipes", nav_standings: "Campeonato", nav_stats: "Estatísticas",
      btn_calendar: "Ver calendário", kicker: "Próxima corrida",
      btn_race_more: "Saiba mais sobre a corrida",
      countdown_label: "Largada em",
      u_days: "Dias", u_hours: "Horas", u_mins: "Minutos", u_secs: "Segundos",
      c_length: "Extensão", c_laps: "Voltas", c_turns: "Curvas", c_record: "Recorde da pista",
      sec_drivers: "Pilotos", sec_by_team: "por equipe",
      d_dob: "Data de nasc.", d_titles: "Títulos", d_podiums: "Pódios", d_wins: "Vitórias",
      btn_more: "Saiba mais",
      team_generic: "Equipe de Fórmula 1",
      md_career: "Carreira", md_season: "Temporada 2026",
      md_link: "Perfil oficial em Formula1.com", md_born: "Nascimento",
      md_gps: "GPs disputados", md_titles: "Títulos mundiais", md_wins: "Vitórias",
      md_podiums: "Pódios", md_poles: "Pole positions", md_points: "Pontos",
      md_best_finish: "Melhor chegada", md_best_grid: "Melhor largada", md_pos: "Posição",
      gp_title: "Grande Prêmio",
      round_line: "Rodada {r} de {n}", round_line2: "do Mundial de Fórmula 1 de {y}.",
      race_line: "Corrida – {d}, {t} (Brasília)",
      h_history: "Histórico da corrida", h_grid: "Grid de largada", h_result: "Resultado da corrida",
      h_last_race: "Última corrida", h_schedule: "Programação do fim de semana", h_champ: "Campeonato {y}",
      rec_title: "Recordes de {c}",
      tab_drivers: "Pilotos", tab_ctors: "Construtores",
      th_pos: "Pos", th_driver: "Piloto", th_team: "Equipe", th_pts: "Pts",
      btn_full: "Ver classificação completa", btn_less: "Ver menos",
      r_fastest: "Volta mais rápida", r_most: "Maior vencedor", r_first: "Primeiro GP",
      r_laps: "Número de voltas", r_dist: "Distância da corrida",
      win_s: "vitória", win_p: "vitórias",
      s_fp1: "Treino Livre 1", s_fp2: "Treino Livre 2", s_fp3: "Treino Livre 3",
      s_sq: "Classificatória Sprint", s_sprint: "Corrida Sprint", s_quali: "Classificação", s_race: "Corrida",
      live: "Ao vivo", live_sub: "Corrida em andamento",
      wk_last: "Última sessão", wk_lap: "Volta {n}",
      sess_line: "{s} · {d}, {t} (Brasília)",
      trk_title: "Acompanhamento", trk_fast: "Volta mais rápida", trk_pole: "Pole position",
      trk_cond: "Condições da pista", trk_air: "Ar", trk_track: "Pista", trk_wind: "Vento",
      trk_events: "Na sessão", trk_no_ev: "Sem incidentes até agora", trk_stopped: "Carro parado",
      rc_green: "Bandeira verde", rc_yellow: "Bandeira amarela", rc_red: "Bandeira vermelha",
      rc_chequered: "Bandeira quadriculada", rc_sc: "Safety Car", rc_vsc: "Virtual Safety Car",
      cal_title: "Calendário {y}", cal_season: "Temporada {y}",
      cal_sub: "{n} corridas • {c} continentes • 1 campeão",
      kpi_done: "GPs concluídos", kpi_next: "Próxima corrida", kpi_countries: "Países",
      f_all: "Todos", f_done: "Concluídos", f_upcoming: "Próximos",
      st_done: "Concluído", st_next: "Próxima", st_sched: "Agendado",
      st_sprint: "Corrida sprint", st_night: "Corrida noturna",
      side_next: "Próxima corrida", btn_gp: "Ver detalhes do GP",
      stats_title: "Estatísticas da temporada",
      stat_wins: "Mais vitórias", stat_poles: "Mais poles", stat_fastest: "Volta mais rápida",
      stat_leader: "Líder do campeonato", stat_team: "Equipe líder",
      stat_winners: "Vencedores diferentes", stat_left: "Corridas restantes",
      gap_over: "+{n} sobre {who}", n_drivers: "{n} pilotos", n_races: "{n} de {t}",
      wins_n: "{n} vitórias", win_1: "1 vitória", poles_n: "{n} poles", pole_1: "1 pole",
      cal_note: "* Calendário sujeito a alterações pela Fórmula 1.",
      side_selected: "Corrida selecionada", rm_winner: "Vencedor",
      rm_circuit: "Circuito", rm_podium: "Pódio", rm_result: "Resultado da corrida",
      rm_highlights: "Destaques", rm_pole: "Pole position",
      rm_last_winner: "Último vencedor aqui", rm_leader: "Líder do campeonato hoje",
      rm_today: "Como está hoje", rm_no_data: "Sem dados oficiais para esta corrida ainda.",
      rm_pts: "{n} pts", rm_laps_done: "{n} voltas",
      tm_title: "Equipes", tm_sub: "Conheça mais sobre as equipes da Fórmula 1 {y}",
      tm_drivers: "Pilotos", tm_car: "Carro {y}", tm_perf: "Desempenho na temporada",
      tm_perf_note: "Posição da equipe em cada métrica, entre as {n} do grid.",
      tm_chief: "Chefe de equipe", tm_tech: "Diretor técnico", tm_since: "Estreia na F1",
      tm_titles: "Títulos mundiais", tm_reserve: "Piloto reserva",
      tm_pos: "Posição no campeonato", tm_points: "Pontos", tm_wins: "Vitórias",
      tm_poles: "Poles", tm_podiums: "Pódios",
      tm_updated: "Atualizado após {r}",
      tm_chassis: "Chassi", tm_engine: "Motor", tm_top10: "Top 10", tm_fastest: "Voltas rápidas",
      tm_reliability: "Confiabilidade", tm_driver_pos: "Posição", tm_driver_pts: "Pontos",
      ss_title: "Estatísticas", ss_progress: "GPs concluídos", ss_last: "Última corrida",
      st_title: "Estatísticas da temporada {y}", st_season: "Temporada",
      st_sub: "Números completos de desempenho dos pilotos e equipes",
      st_wins: "Vitórias", st_podiums: "Pódios", st_poles: "Poles", st_fastest: "Voltas rápidas",
      st_total_wins: "Total de vitórias", st_total_pod: "Total de pódios",
      st_total_poles: "Total de poles", st_total_fast: "Total de voltas rápidas",
      st_pts_driver: "Pontuação por piloto", st_pts_team: "Pontuação por equipe",
      st_points: "Pontos", st_eff: "Eficiência", st_eff_sub: "Pontos por corrida",
      st_wins_team: "Vitórias por equipe", st_pod_team: "Pódios por equipe",
      st_status: "Fim de corrida", st_status_sub: "Resultados por classificação",
      st_note: "Estatísticas atualizadas após o {r}",
      st_loading: "Carregando estatísticas da temporada…",
      st_empty: "A Fórmula 1 não publica esses dados para esta temporada.",
      st_error: "Não foi possível carregar as estatísticas agora.",
      pending: "Imagem oficial pendente"
    },
    en: {
      nav_home: "Home", nav_calendar: "Calendar", nav_drivers: "Drivers",
      nav_teams: "Teams", nav_standings: "Championship", nav_stats: "Statistics",
      btn_calendar: "View calendar", kicker: "Next race",
      btn_race_more: "Learn more about the race",
      countdown_label: "Race starts in",
      u_days: "Days", u_hours: "Hours", u_mins: "Minutes", u_secs: "Seconds",
      c_length: "Length", c_laps: "Laps", c_turns: "Corners", c_record: "Lap record",
      sec_drivers: "Drivers", sec_by_team: "by team",
      d_dob: "Date of birth", d_titles: "Titles", d_podiums: "Podiums", d_wins: "Wins",
      btn_more: "Learn more",
      team_generic: "Formula 1 Team",
      md_career: "Career", md_season: "2026 Season",
      md_link: "Official profile on Formula1.com", md_born: "Born",
      md_gps: "Grands Prix entered", md_titles: "World titles", md_wins: "Wins",
      md_podiums: "Podiums", md_poles: "Pole positions", md_points: "Points",
      md_best_finish: "Best finish", md_best_grid: "Best grid", md_pos: "Position",
      gp_title: "Grand Prix",
      round_line: "Round {r} of {n}", round_line2: "of the {y} Formula 1 World Championship.",
      race_line: "Race – {d}, {t} (Brasília time)",
      h_history: "Race history", h_grid: "Starting grid", h_result: "Race result",
      h_last_race: "Last race", h_schedule: "Weekend schedule", h_champ: "{y} Championship",
      rec_title: "{c} records",
      tab_drivers: "Drivers", tab_ctors: "Constructors",
      th_pos: "Pos", th_driver: "Driver", th_team: "Team", th_pts: "Pts",
      btn_full: "View full standings", btn_less: "Show less",
      r_fastest: "Fastest lap", r_most: "Most wins", r_first: "First GP",
      r_laps: "Number of laps", r_dist: "Race distance",
      win_s: "win", win_p: "wins",
      s_fp1: "Practice 1", s_fp2: "Practice 2", s_fp3: "Practice 3",
      s_sq: "Sprint Qualifying", s_sprint: "Sprint", s_quali: "Qualifying", s_race: "Race",
      live: "Live", live_sub: "Race in progress",
      wk_last: "Last session", wk_lap: "Lap {n}",
      sess_line: "{s} · {d}, {t} (Brasília time)",
      trk_title: "Live tracking", trk_fast: "Fastest lap", trk_pole: "Pole position",
      trk_cond: "Track conditions", trk_air: "Air", trk_track: "Track", trk_wind: "Wind",
      trk_events: "In the session", trk_no_ev: "No incidents so far", trk_stopped: "Car stopped",
      rc_green: "Green flag", rc_yellow: "Yellow flag", rc_red: "Red flag",
      rc_chequered: "Chequered flag", rc_sc: "Safety Car", rc_vsc: "Virtual Safety Car",
      cal_title: "{y} Calendar", cal_season: "{y} Season",
      cal_sub: "{n} races • {c} continents • 1 champion",
      kpi_done: "GPs completed", kpi_next: "Next race", kpi_countries: "Countries",
      f_all: "All", f_done: "Completed", f_upcoming: "Upcoming",
      st_done: "Completed", st_next: "Next", st_sched: "Scheduled",
      st_sprint: "Sprint race", st_night: "Night race",
      side_next: "Next race", btn_gp: "View GP details",
      stats_title: "Season stats",
      stat_wins: "Most wins", stat_poles: "Most poles", stat_fastest: "Fastest lap",
      stat_leader: "Championship leader", stat_team: "Leading team",
      stat_winners: "Different winners", stat_left: "Races remaining",
      gap_over: "+{n} over {who}", n_drivers: "{n} drivers", n_races: "{n} of {t}",
      wins_n: "{n} wins", win_1: "1 win", poles_n: "{n} poles", pole_1: "1 pole",
      cal_note: "* Calendar subject to changes by Formula 1.",
      side_selected: "Selected race", rm_winner: "Winner",
      rm_circuit: "Circuit", rm_podium: "Podium", rm_result: "Race result",
      rm_highlights: "Highlights", rm_pole: "Pole position",
      rm_last_winner: "Last winner here", rm_leader: "Championship leader today",
      rm_today: "As it stands today", rm_no_data: "No official data for this race yet.",
      rm_pts: "{n} pts", rm_laps_done: "{n} laps",
      tm_title: "Teams", tm_sub: "Get to know the {y} Formula 1 teams",
      tm_drivers: "Drivers", tm_car: "{y} Car", tm_perf: "Season performance",
      tm_perf_note: "Team ranking in each metric, among the {n} on the grid.",
      tm_chief: "Team chief", tm_tech: "Technical chief", tm_since: "First entry",
      tm_titles: "World championships", tm_reserve: "Reserve driver",
      tm_pos: "Championship position", tm_points: "Points", tm_wins: "Wins",
      tm_poles: "Poles", tm_podiums: "Podiums",
      tm_updated: "Updated after {r}",
      tm_chassis: "Chassis", tm_engine: "Power unit", tm_top10: "Top 10", tm_fastest: "Fastest laps",
      tm_reliability: "Reliability", tm_driver_pos: "Position", tm_driver_pts: "Points",
      ss_title: "Statistics", ss_progress: "GPs completed", ss_last: "Last race",
      st_title: "{y} Season statistics", st_season: "Season",
      st_sub: "Full performance numbers for drivers and teams",
      st_wins: "Wins", st_podiums: "Podiums", st_poles: "Poles", st_fastest: "Fastest laps",
      st_total_wins: "Total wins", st_total_pod: "Total podiums",
      st_total_poles: "Total poles", st_total_fast: "Total fastest laps",
      st_pts_driver: "Points by driver", st_pts_team: "Points by team",
      st_points: "Points", st_eff: "Efficiency", st_eff_sub: "Points per race",
      st_wins_team: "Wins by team", st_pod_team: "Podiums by team",
      st_status: "Race classification", st_status_sub: "Results by status",
      st_note: "Statistics updated after the {r}",
      st_loading: "Loading season statistics…",
      st_empty: "Formula 1 does not publish this data for this season.",
      st_error: "Could not load the statistics right now.",
      pending: "Official image pending"
    },
    es: {
      nav_home: "Inicio", nav_calendar: "Calendario", nav_drivers: "Pilotos",
      nav_teams: "Equipos", nav_standings: "Campeonato", nav_stats: "Estadísticas",
      btn_calendar: "Ver calendario", kicker: "Próxima carrera",
      btn_race_more: "Más sobre la carrera",
      countdown_label: "Salida en",
      u_days: "Días", u_hours: "Horas", u_mins: "Minutos", u_secs: "Segundos",
      c_length: "Longitud", c_laps: "Vueltas", c_turns: "Curvas", c_record: "Récord de pista",
      sec_drivers: "Pilotos", sec_by_team: "por equipo",
      d_dob: "Fecha de nac.", d_titles: "Títulos", d_podiums: "Podios", d_wins: "Victorias",
      btn_more: "Saber más",
      team_generic: "Equipo de Fórmula 1",
      md_career: "Carrera", md_season: "Temporada 2026",
      md_link: "Perfil oficial en Formula1.com", md_born: "Nacimiento",
      md_gps: "GPs disputados", md_titles: "Títulos mundiales", md_wins: "Victorias",
      md_podiums: "Podios", md_poles: "Pole positions", md_points: "Puntos",
      md_best_finish: "Mejor llegada", md_best_grid: "Mejor salida", md_pos: "Posición",
      gp_title: "Gran Premio",
      round_line: "Ronda {r} de {n}", round_line2: "del Mundial de Fórmula 1 de {y}.",
      race_line: "Carrera – {d}, {t} (Brasília)",
      h_history: "Historial de la carrera", h_grid: "Parrilla de salida", h_result: "Resultado de la carrera",
      h_last_race: "Última carrera", h_schedule: "Programa del fin de semana", h_champ: "Campeonato {y}",
      rec_title: "Récords de {c}",
      tab_drivers: "Pilotos", tab_ctors: "Constructores",
      th_pos: "Pos", th_driver: "Piloto", th_team: "Equipo", th_pts: "Pts",
      btn_full: "Ver clasificación completa", btn_less: "Ver menos",
      r_fastest: "Vuelta más rápida", r_most: "Máximo ganador", r_first: "Primer GP",
      r_laps: "Número de vueltas", r_dist: "Distancia de carrera",
      win_s: "victoria", win_p: "victorias",
      s_fp1: "Práctica Libre 1", s_fp2: "Práctica Libre 2", s_fp3: "Práctica Libre 3",
      s_sq: "Clasificación Sprint", s_sprint: "Sprint", s_quali: "Clasificación", s_race: "Carrera",
      live: "En vivo", live_sub: "Carrera en curso",
      wk_last: "Última sesión", wk_lap: "Vuelta {n}",
      sess_line: "{s} · {d}, {t} (Brasília)",
      trk_title: "Seguimiento", trk_fast: "Vuelta más rápida", trk_pole: "Pole position",
      trk_cond: "Condiciones de pista", trk_air: "Aire", trk_track: "Pista", trk_wind: "Viento",
      trk_events: "En la sesión", trk_no_ev: "Sin incidentes por ahora", trk_stopped: "Coche detenido",
      rc_green: "Bandera verde", rc_yellow: "Bandera amarilla", rc_red: "Bandera roja",
      rc_chequered: "Bandera a cuadros", rc_sc: "Safety Car", rc_vsc: "Virtual Safety Car",
      cal_title: "Calendario {y}", cal_season: "Temporada {y}",
      cal_sub: "{n} carreras • {c} continentes • 1 campeón",
      kpi_done: "GPs disputados", kpi_next: "Próxima carrera", kpi_countries: "Países",
      f_all: "Todos", f_done: "Disputados", f_upcoming: "Próximos",
      st_done: "Disputado", st_next: "Próxima", st_sched: "Programado",
      st_sprint: "Carrera sprint", st_night: "Carrera nocturna",
      side_next: "Próxima carrera", btn_gp: "Ver detalles del GP",
      stats_title: "Estadísticas de la temporada",
      stat_wins: "Más victorias", stat_poles: "Más poles", stat_fastest: "Vuelta más rápida",
      stat_leader: "Líder del campeonato", stat_team: "Equipo líder",
      stat_winners: "Ganadores diferentes", stat_left: "Carreras restantes",
      gap_over: "+{n} sobre {who}", n_drivers: "{n} pilotos", n_races: "{n} de {t}",
      wins_n: "{n} victorias", win_1: "1 victoria", poles_n: "{n} poles", pole_1: "1 pole",
      cal_note: "* Calendario sujeto a cambios por la Fórmula 1.",
      side_selected: "Carrera seleccionada", rm_winner: "Ganador",
      rm_circuit: "Circuito", rm_podium: "Podio", rm_result: "Resultado de la carrera",
      rm_highlights: "Destacados", rm_pole: "Pole position",
      rm_last_winner: "Último ganador aquí", rm_leader: "Líder del campeonato hoy",
      rm_today: "Cómo está hoy", rm_no_data: "Aún no hay datos oficiales de esta carrera.",
      rm_pts: "{n} pts", rm_laps_done: "{n} vueltas",
      tm_title: "Equipos", tm_sub: "Conoce más sobre los equipos de la Fórmula 1 {y}",
      tm_drivers: "Pilotos", tm_car: "Coche {y}", tm_perf: "Rendimiento en la temporada",
      tm_perf_note: "Posición del equipo en cada métrica, entre los {n} de la parrilla.",
      tm_chief: "Jefe de equipo", tm_tech: "Director técnico", tm_since: "Debut en la F1",
      tm_titles: "Títulos mundiales", tm_reserve: "Piloto reserva",
      tm_pos: "Posición en el campeonato", tm_points: "Puntos", tm_wins: "Victorias",
      tm_poles: "Poles", tm_podiums: "Podios",
      tm_updated: "Actualizado tras {r}",
      tm_chassis: "Chasis", tm_engine: "Motor", tm_top10: "Top 10", tm_fastest: "Vueltas rápidas",
      tm_reliability: "Fiabilidad", tm_driver_pos: "Posición", tm_driver_pts: "Puntos",
      ss_title: "Estadísticas", ss_progress: "GPs disputados", ss_last: "Última carrera",
      st_title: "Estadísticas de la temporada {y}", st_season: "Temporada",
      st_sub: "Números completos de rendimiento de pilotos y equipos",
      st_wins: "Victorias", st_podiums: "Podios", st_poles: "Poles", st_fastest: "Vueltas rápidas",
      st_total_wins: "Total de victorias", st_total_pod: "Total de podios",
      st_total_poles: "Total de poles", st_total_fast: "Total de vueltas rápidas",
      st_pts_driver: "Puntuación por piloto", st_pts_team: "Puntuación por equipo",
      st_points: "Puntos", st_eff: "Eficiencia", st_eff_sub: "Puntos por carrera",
      st_wins_team: "Victorias por equipo", st_pod_team: "Podios por equipo",
      st_status: "Fin de carrera", st_status_sub: "Resultados por clasificación",
      st_note: "Estadísticas actualizadas tras el {r}",
      st_loading: "Cargando estadísticas de la temporada…",
      st_empty: "La Fórmula 1 no publica estos datos para esta temporada.",
      st_error: "No se pudieron cargar las estadísticas ahora.",
      pending: "Imagen oficial pendiente"
    }
  };

  var LANG = "pt";
  try { LANG = localStorage.getItem("f1t-lang") || "pt"; } catch (e) {}
  if (!T[LANG]) LANG = "pt";

  function t(key) { return (T[LANG] && T[LANG][key]) || T.pt[key] || key; }
  function M() { return MONTHS[LANG]; }
  function W() { return WEEKDAYS[LANG]; }

  /* Nome do país no idioma atual (Intl), a partir do código ISO */
  function countryName(nat) {
    var entry = NATIONALITY[nat];
    var iso = entry && entry[1];
    if (iso && window.Intl && Intl.DisplayNames) {
      try {
        var loc = LANG === "pt" ? "pt-BR" : LANG;
        var name = new Intl.DisplayNames([loc], { type: "region" }).of(iso.toUpperCase());
        if (name) return name;
      } catch (e) {}
    }
    return entry ? entry[0] : nat;
  }

  /* Ícones das linhas de estatísticas (mesmo desenho do layout base) */
  var IC = {
    cal: '<svg class="ic" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 2.8V6.2M16 2.8V6.2"/></svg>',
    height: '<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2.4"/><path d="M12 8v8m0 0-3.5 5m3.5-5 3.5 5M7 11.5h10"/></svg>',
    trophy: '<svg class="ic" viewBox="0 0 24 24"><path d="M5 5h14l-1.2 7a5.9 5.9 0 0 1-11.6 0L5 5Z"/><path d="M5 7H2.8a3.3 3.3 0 0 0 3.4 3.5M19 7h2.2a3.3 3.3 0 0 1-3.4 3.5M12 15v3.5m-3.5 2.5h7"/></svg>',
    medal: '<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="9" r="4.5"/><path d="m9 12.8-2 8 5-2.6 5 2.6-2-8"/></svg>',
    star: '<svg class="ic" viewBox="0 0 24 24"><path d="m12 3 2.5 5.4 5.9.6-4.4 4 1.2 5.8L12 15.9 6.8 18.8 8 13 3.6 9l5.9-.6L12 3Z"/></svg>',
    arrow: '<svg class="ic" viewBox="0 0 24 24"><path d="M4 12h15M13 5.5 19.5 12 13 18.5"/></svg>',
    clock: '<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="13" r="7.5"/><path d="M12 13l3.5-3.5M9.5 2.5h5M12 2.5v3"/></svg>',
    flagc: '<svg class="ic" viewBox="0 0 24 24"><path d="M5 21V4m0 0c2.5-1.6 5-1.6 7.5 0S17.5 5.6 20 4v9c-2.5 1.6-5 1.6-7.5 0S7.5 11.4 5 13"/></svg>',
    laps: '<svg class="ic" viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.9-6.2"/><path d="M20 3v4.5h-4.5"/></svg>',
    track: '<svg class="ic" viewBox="0 0 24 24"><path d="M4 15c0-2 1.6-3 3.6-3h8.8c1.9 0 3.6-1 3.6-3s-1.7-3-3.6-3H9"/><path d="M4 15c0 2 1.6 3 3.6 3H15"/></svg>'
  };

  function $(id) { return document.getElementById(id); }
  function pad(n) { return n < 10 ? "0" + n : String(n); }
  function strip(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, ""); }

  function getJSON(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(url + " -> " + r.status);
      return r.json();
    });
  }

  /* Define a imagem de uma <figure data-pending-label> testando uma lista de
     URLs oficiais em ordem; se nenhuma carregar, mostra o espaço reservado
     "IMAGEM OFICIAL PENDENTE". */
  function setFigure(fig, img, urls) {
    urls = (Array.isArray(urls) ? urls : [urls]).filter(Boolean);
    if (!urls.length) { fig.classList.add("img-pending"); img.removeAttribute("src"); return; }
    var i = 0;
    img.onerror = function () {
      i++;
      if (i < urls.length) { img.src = urls[i]; }
      else { fig.classList.add("img-pending"); }
    };
    img.onload = function () { fig.classList.remove("img-pending"); };
    fig.classList.remove("img-pending");
    img.src = urls[0];
  }

  function flagImg(iso, alt) {
    return iso
      ? '<img src="https://flagcdn.com/h24/' + iso + '.png" alt="' + (alt || "") + '" onerror="this.parentElement.style.display=\'none\'">'
      : "";
  }

  function driverCode(d) {
    var g = strip(d.givenName), f = strip(d.familyName);
    return (g.slice(0, 3) + f.replace(/ /g, "").slice(0, 3)).toLowerCase() + "01";
  }

  /* Foto oficial 2026 (uniforme atual, formula1.com/en/drivers);
     reserva: retrato oficial do acervo anterior. */
  function driverPhotoURLs(d, teamId) {
    var g = strip(d.givenName), f = strip(d.familyName);
    var code = driverCode(d);
    var urls = [];
    var slug = F1_SLUG[teamId];
    if (slug) {
      urls.push(IMGUP + "c_lfill,w_440/q_auto/v1740000001/common/f1/2026/" +
        slug + "/" + code + "/2026" + slug + code + "right.webp");
    }
    urls.push(MEDIA + "/drivers/" + g[0].toUpperCase() + "/" +
      encodeURIComponent(code.toUpperCase() + "_" + g + "_" + f) + "/" + code + ".png");
    return urls;
  }

  /* ---------------- Contagem regressiva + fim de semana ---------------- */
  var raceStart = new Date("2026-11-08T14:00:00-03:00").getTime(); // fallback: GP de São Paulo

  /* duração estimada de cada sessão (min) — só para detectar "ao vivo" */
  var SESSION_DUR = {
    FirstPractice: 65, SecondPractice: 65, ThirdPractice: 65,
    SprintQualifying: 55, Sprint: 70, Qualifying: 75, Race: 180
  };
  var SESSION_LABEL = {
    FirstPractice: "s_fp1", SecondPractice: "s_fp2", ThirdPractice: "s_fp3",
    SprintQualifying: "s_sq", Sprint: "s_sprint", Qualifying: "s_quali", Race: "s_race"
  };
  var SESSION_SHORT = {
    s_fp1: ["TL1", "FP1"], s_fp2: ["TL2", "FP2"], s_fp3: ["TL3", "FP3"],
    s_sq: ["SQ", "SQ"], s_sprint: ["SPR", "SPR"], s_quali: ["Q", "Q"], s_race: ["GP", "GP"]
  };
  function shortLabel(labelKey) {
    var s = SESSION_SHORT[labelKey] || ["", ""];
    return LANG === "en" ? s[1] : s[0];
  }

  /* OpenF1: pré-carrega a sessão mais recente enquanto a Jolpica busca o
     calendário. Assim uma API não precisa esperar a outra terminar. */
  var OPENF1 = "https://api.openf1.org/v1";
  var liveCache = { ts: 0, shown: false, inFlight: false };
  var latestSessionPromise = null;
  var OF1_NAME = {
    "Practice 1": "s_fp1", "Practice 2": "s_fp2", "Practice 3": "s_fp3",
    "Qualifying": "s_quali", "Sprint": "s_sprint", "Sprint Qualifying": "s_sq", "Race": "s_race"
  };

  function getLatestOpenF1Session() {
    if (!latestSessionPromise) {
      latestSessionPromise = getJSON(OPENF1 + "/sessions?session_key=latest").then(
        function (arr) { latestSessionPromise = null; return arr; },
        function (err) { latestSessionPromise = null; throw err; }
      );
    }
    return latestSessionPromise;
  }

  /* começa a consulta sem bloquear o restante da página */
  getLatestOpenF1Session().catch(function () {});

  /* lista ordenada das sessões do GP atual, a partir do calendário (Jolpica) */
  function weekendSessions() {
    if (!lastRace) return [];
    var out = [];
    ["FirstPractice", "SecondPractice", "ThirdPractice", "SprintQualifying", "Sprint", "Qualifying"]
      .forEach(function (key) {
        var s = lastRace[key];
        if (s && s.date) {
          var start = new Date(s.date + "T" + (s.time || "12:00:00Z")).getTime();
          out.push({ key: key, labelKey: SESSION_LABEL[key], start: start, end: start + SESSION_DUR[key] * 60000 });
        }
      });
    var rs = new Date(lastRace.date + "T" + (lastRace.time || "14:00:00Z")).getTime();
    out.push({ key: "Race", labelKey: "s_race", start: rs, end: rs + SESSION_DUR.Race * 60000 });
    out.sort(function (a, b) { return a.start - b.start; });
    return out;
  }

  /* estado do fim de semana: pre (conta p/ corrida) · waiting · live */
  function weekendState() {
    var s = weekendSessions();
    if (!s.length) return { mode: "pre", all: s };
    var now = Date.now();
    if (now < s[0].start - 4 * 3600e3 || now > s[s.length - 1].end) return { mode: "pre", all: s };
    for (var i = 0; i < s.length; i++) {
      if (now >= s[i].start && now <= s[i].end) return { mode: "live", session: s[i], index: i, all: s };
    }
    for (var j = 0; j < s.length; j++) {
      if (s[j].start > now) return { mode: "waiting", session: s[j], prev: j > 0 ? s[j - 1] : null, index: j, all: s };
    }
    return { mode: "pre", all: s };
  }

  function renderStepper(ws) {
    var el = $("wkStepper");
    if (!el) return;
    if (ws.mode === "pre") { el.hidden = true; return; }
    var now = Date.now();
    el.hidden = false;
    el.innerHTML = ws.all.map(function (s) {
      var cls = (now > s.end) ? "done" : (now >= s.start && now <= s.end ? "live"
        : (ws.session && s === ws.session ? "next" : "up"));
      return '<li class="' + cls + '"><span class="dot"></span>' + shortLabel(s.labelKey) + "</li>";
    }).join("");
  }

  function tick() {
    var ws = weekendState();
    var target, live = null;

    if (ws.mode === "live") { live = ws.session; }
    else if (ws.mode === "waiting") { target = ws.session.start; }
    else { target = raceStart; }

    if (!live) {
      var diff = Math.max(0, target - Date.now());
      var secs = Math.floor(diff / 1000);
      $("cdDays").textContent = pad(Math.floor(secs / 86400));
      $("cdHours").textContent = pad(Math.floor((secs % 86400) / 3600));
      $("cdMins").textContent = pad(Math.floor((secs % 3600) / 60));
      $("cdSecs").textContent = pad(secs % 60);
    }

    /* rótulo + selo ao vivo conforme o estado */
    var badge = $("liveBadge");
    var inLive = !!live;
    if (badge.hidden === inLive) {
      badge.hidden = !inLive;
      $("countdown").style.display = inLive ? "none" : "";
      $("cdLabel").parentNode.style.display = inLive ? "none" : "";
    }

    /* atualiza textos só quando o estado muda (evita reflow a cada segundo) */
    var stamp = ws.mode + "|" + (ws.session ? ws.session.key : "") + "|" + LANG;
    if (tick._stamp !== stamp) {
      tick._stamp = stamp;
      var wrap = document.querySelector(".countdown-wrap");
      wrap.classList.toggle("weekend", ws.mode !== "pre");

      if (ws.mode === "waiting") {
        $("cdLabel").textContent = t(ws.session.labelKey);
        /* timestamp UTC → horário de Brasília */
        var d = new Date(new Date(ws.session.start).toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
        $("raceTimeText").textContent = t("sess_line")
          .replace("{s}", t(ws.session.labelKey)).replace("{d}", W()[d.getDay()]).replace("{t}", fmtTime(d));
      } else if (ws.mode === "live") {
        $("liveSub").textContent = t(ws.session.labelKey);
      } else {
        $("cdLabel").textContent = t("countdown_label");
      }
      renderStepper(ws);
    }
    /* o card de sessão (hub) é carregado por loadLiveSession(), independente
       do tick e do calendário Jolpica — para aparecer assim que o site abre. */
  }
  tick();
  setInterval(tick, 1000);

  /* ---------------- Resultados da última sessão (OpenF1) ----------------
     No plano gratuito, os dados aparecem após o encerramento da sessão. */

  function fmtLap(s) {
    var m = Math.floor(s / 60), r = (s - m * 60).toFixed(3);
    return m + ":" + (r < 10 ? "0" : "") + r;
  }

  /* alterna o hub entre modo normal (histórico+recordes) e modo GP (sessão+dados) */
  function weekendHub(on) {
    if (!$("hubLive")) return;
    $("hubHistory").hidden = on;
    $("hubRecords").hidden = on;
    $("hubLive").hidden = !on;
    $("hubTracking").hidden = !on;
  }

  /* OpenF1 bloqueada (sessão ao vivo no plano grátis) ou sem dados:
     restaura a última sessão concluída do cache; senão, hub normal. */
  function blockedFallback() {
    if (liveCache.shown) return;               /* já há dados na tela */
    if (!restoreLiveCache()) weekendHub(false);
  }

  function showLiveLoading() {
    if (liveCache.shown || !$("liveTimes")) return;
    weekendHub(true);
    $("hubTracking").hidden = true;
    $("liveSessTitle").textContent = t("wk_last");
    $("liveSessTag").hidden = true;
    $("liveSessLap").textContent = "";
    $("sessTabs").innerHTML =
      '<button type="button" class="active" disabled>...</button>';
    $("liveTimes").innerHTML =
      '<li style="--pos-team:#E10600;opacity:.72">' +
        '<span class="lt-pos">—</span><span class="lt-photo"></span>' +
        '<span class="lt-name">Carregando resultados<small>OpenF1</small></span>' +
        '<span class="lt-time">...</span><span class="lt-gap"></span></li>';
  }

  /* sessões do fim de semana + qual está selecionada */
  var weekendSess = { meeting: null, list: [], selManual: null };

  function sessFrom(x) {
    return {
      key: x.session_key, name: x.session_name, labelKey: OF1_NAME[x.session_name],
      start: new Date(x.date_start).getTime(), end: new Date(x.date_end).getTime()
    };
  }
  /* uma tentativa extra em caso de 429, sem bloquear as outras chamadas */
  function getRetry(url) {
    return getJSON(url).catch(function () {
      return new Promise(function (r) { setTimeout(r, 700); })
        .then(function () { return getJSON(url); }).catch(function () { return null; });
    });
  }

  function loadLiveSession() {
    if (!$("hubLive") || liveCache.inFlight) return;
    liveCache.inFlight = true;
    liveCache.ts = Date.now();

    getLatestOpenF1Session().then(function (arr) {
      if (!Array.isArray(arr) || !arr[0]) { blockedFallback(); return; }
      var s = arr[0];
      /* sessão recente? senão não é fim de semana de GP → hub normal.
         (independe do calendário Jolpica, por isso carrega assim que o site abre) */
      if (Math.abs(new Date(s.date_start).getTime() - Date.now()) > 4 * 864e5) { weekendHub(false); return; }
      /* é fim de semana: mostra o cache/carregando enquanto os dados chegam */
      if (!restoreLiveCache()) showLiveLoading();

      /* alvo: seleção manual (se já temos a lista) ou a própria "latest" (mais recente) */
      var target = (weekendSess.selManual && weekendSess.list.length &&
        weekendSess.list.filter(function (x) { return x.key === weekendSess.selManual; })[0]) || sessFrom(s);

      /* carrega os dados do alvo — pinta o card já (não espera a lista de tabs) */
      loadSessionData(target);

      /* lista de sessões p/ os tabs, EM PARALELO (cache por meeting) */
      if (weekendSess.meeting === s.meeting_key && weekendSess.list.length) {
        renderSessionTabs(target);
      } else {
        getJSON(OPENF1 + "/sessions?meeting_key=" + s.meeting_key).then(function (all) {
          if (!Array.isArray(all) || !all.length) { renderSessionTabs(target); return; }
          weekendSess.meeting = s.meeting_key;
          weekendSess.list = all.map(sessFrom).sort(function (a, b) { return a.start - b.start; });
          var sel = weekendSess.list.filter(function (x) {
            return x.key === (weekendSess.selManual || target.key);
          })[0] || target;
          renderSessionTabs(sel);
        }).catch(function () { renderSessionTabs(target); });
      }
    }).catch(blockedFallback).then(function () {
      liveCache.inFlight = false;
    });
  }

  function loadSessionData(sess) {
    var isLive = Date.now() >= sess.start && Date.now() <= sess.end;

    /* No plano gratuito não tentamos baixar telemetria durante a sessão. O
       último resultado salvo continua visível até a publicação do novo. */
    if (isLive) {
      blockedFallback();
      return Promise.resolve();
    }

    /* session_result traz a classificação pronta e evita baixar centenas de
       KB de todas as voltas. Os tempos aparecem sem esperar clima/eventos. */
    return Promise.all([
      getRetry(OPENF1 + "/session_result?session_key=" + sess.key + "&position%3C=5"),
      getRetry(OPENF1 + "/drivers?session_key=" + sess.key)
    ]).then(function (r) {
      function arr(x) { return Array.isArray(x) ? x : []; }
      var results = arr(r[0]);
      var drivers = arr(r[1]);

      /* Converte o resultado resumido para o formato já usado pelo card. Em
         classificação, duration pode ser [Q1, Q2, Q3]; usamos o último tempo. */
      var laps = results.map(function (x) {
        var duration = Array.isArray(x.duration)
          ? x.duration.filter(function (v) { return typeof v === "number"; }).slice(-1)[0]
          : x.duration;
        return {
          driver_number: x.driver_number,
          lap_number: x.number_of_laps || 0,
          lap_duration: duration
        };
      }).filter(function (x) { return typeof x.lap_duration === "number"; });

      if (!laps.length) { blockedFallback(); return; }

      var leader = renderWeekendHub(sess, laps, drivers, [], [], false);

      /* Clima e eventos atualizam o segundo card depois, sem atrasar os tempos. */
      Promise.all([
        getRetry(OPENF1 + "/weather?session_key=" + sess.key),
        getRetry(OPENF1 + "/race_control?session_key=" + sess.key)
      ]).then(function (extra) {
        if (!leader) return;
        renderTracking(sess, leader, arr(extra[0]), arr(extra[1]), false,
          sess.labelKey || OF1_NAME[sess.session_name]);
        saveLiveCache();
      });
    });
  }

  /* botões TL1/TL2/TL3/Q/GP — futuras ficam desabilitadas */
  function renderSessionTabs(sel) {
    var now = Date.now();
    $("sessTabs").innerHTML = weekendSess.list.map(function (x) {
      var sl = x.labelKey ? shortLabel(x.labelKey) : (x.name || "").slice(0, 3).toUpperCase();
      return '<button type="button" data-key="' + x.key + '"' +
        (x.start > now ? " disabled" : "") + (x.key === sel.key ? ' class="active"' : "") +
        ">" + sl + "</button>";
    }).join("");
  }

  $("sessTabs").addEventListener("click", function (ev) {
    var b = ev.target.closest("button[data-key]");
    if (!b || b.disabled) return;
    weekendSess.selManual = parseInt(b.getAttribute("data-key"), 10);
    var sel = weekendSess.list.filter(function (x) { return x.key === weekendSess.selManual; })[0];
    if (sel) { renderSessionTabs(sel); loadSessionData(sel); }
  });

  /* dispara já ao abrir (não espera Jolpica) e revalida a cada 5 min */
  loadLiveSession();
  setInterval(loadLiveSession, 300000);

  function renderWeekendHub(sess, laps, drivers, weather, rc, isLive) {
    var dmap = {};
    drivers.forEach(function (d) {
      dmap[d.driver_number] = {
        name: d.full_name, acr: d.name_acronym, team: d.team_name,
        color: d.team_colour ? "#" + d.team_colour : "#E10600",
        photo: d.headshot_url || ""
      };
    });
    var best = {}, maxLap = 0;
    laps.forEach(function (l) {
      if (l.lap_number > maxLap) maxLap = l.lap_number;
      if (l.lap_duration && (!best[l.driver_number] || l.lap_duration < best[l.driver_number])) {
        best[l.driver_number] = l.lap_duration;
      }
    });
    var rows = Object.keys(best).map(function (n) { return { n: n, t: best[n], d: dmap[n] || {} }; })
      .sort(function (a, b) { return a.t - b.t; });
    if (!rows.length) { blockedFallback(); return; }

    weekendHub(true);
    liveCache.shown = true;
    var lk = sess.labelKey || OF1_NAME[sess.session_name];

    /* ---- card 1: última sessão (com foto) ---- */
    $("liveSessTitle").textContent = t("wk_last") + (lk ? " · " + t(lk) : "");
    $("liveSessTag").hidden = !isLive;
    $("liveSessLap").textContent = (isLive && maxLap) ? t("wk_lap").replace("{n}", maxLap) : "";
    var p1 = rows[0].t;
    $("liveTimes").innerHTML = rows.slice(0, 5).map(function (r, i) {
      var nm = r.d.name || r.d.acr || ("#" + r.n);
      var ph = r.d.photo
        ? '<img src="' + r.d.photo + '" alt="" loading="lazy" onerror="this.remove()">' : "";
      return '<li style="--pos-team:' + (r.d.color || "#E10600") + '">' +
        '<span class="lt-pos">' + (i + 1) + "</span>" +
        '<span class="lt-photo">' + ph + "</span>" +
        '<span class="lt-name">' + nm + "<small>" + (r.d.team || "") + "</small></span>" +
        '<span class="lt-time">' + fmtLap(r.t) + "</span>" +
        '<span class="lt-gap">' + (i === 0 ? "" : "+" + (r.t - p1).toFixed(3)) + "</span></li>";
    }).join("");

    renderTracking(sess, rows[0], weather, rc, isLive, lk);
    saveLiveCache();
    return rows[0];
  }

  /* guarda a última sessão renderizada — durante uma sessão AO VIVO a OpenF1
     bloqueia tudo, então mostramos essa cópia (a última concluída) do cache. */
  function saveLiveCache() {
    try {
      localStorage.setItem("f1t-live", JSON.stringify({
        ts: Date.now(),
        liveTitle: $("liveSessTitle").textContent,
        liveLap: $("liveSessLap").textContent,
        sessTabs: $("sessTabs").innerHTML,
        liveTimes: $("liveTimes").innerHTML,
        trackingTitle: $("trackingTitle").textContent,
        trackingBody: $("trackingBody").innerHTML
      }));
    } catch (e) {}
  }

  function restoreLiveCache() {
    try {
      var c = JSON.parse(localStorage.getItem("f1t-live") || "null");
      if (!c || (Date.now() - (c.ts || 0)) > 3 * 864e5) return false;   /* cache só se recente (<3 dias) */
      $("liveSessTitle").textContent = c.liveTitle;
      $("liveSessTag").hidden = true;      /* cache = sessão já encerrada */
      $("liveSessLap").textContent = c.liveLap;
      if (c.sessTabs) $("sessTabs").innerHTML = c.sessTabs;
      $("liveTimes").innerHTML = c.liveTimes;
      $("trackingTitle").textContent = c.trackingTitle;
      $("trackingBody").innerHTML = c.trackingBody;
      weekendHub(true);
      liveCache.shown = true;
      return true;
    } catch (e) { return false; }
  }

  /* ---- card 2: acompanhamento (mais rápido / pole após a Q + condições + eventos) ---- */
  function renderTracking(sess, leader, weather, rc, isLive, lk) {
    var isQuali = (lk === "s_quali" || lk === "s_sq");
    var showPole = isQuali && !isLive;
    $("trackingTitle").textContent = t("trk_title");

    var html = "";

    /* destaque: volta mais rápida ou pole */
    var ld = leader.d || {};
    html += '<div class="trk-hero" style="--pos-team:' + (ld.color || "#E10600") + '">' +
      "<small>" + (showPole ? t("trk_pole") : t("trk_fast")) + "</small>" +
      "<strong>" + (ld.name || ld.acr || ("#" + leader.n)) + "</strong>" +
      "<span>" + fmtLap(leader.t) + " · " + (ld.team || "") + "</span></div>";

    /* condições da pista */
    var w = weather.length ? weather[weather.length - 1] : null;
    if (w) {
      html += '<p class="trk-sec">' + t("trk_cond") + "</p>" +
        '<ul class="trk-cond">' +
          "<li><small>" + t("trk_air") + "</small><strong>" + Math.round(w.air_temperature) + "°C</strong></li>" +
          "<li><small>" + t("trk_track") + "</small><strong>" + Math.round(w.track_temperature) + "°C</strong></li>" +
          "<li><small>" + t("trk_wind") + "</small><strong>" + w.wind_speed.toFixed(1) + " km/h</strong></li>" +
        "</ul>";
    }

    /* eventos da sessão (bandeiras, safety car, carros parados) */
    var ev = trackingEvents(rc);
    html += '<p class="trk-sec">' + t("trk_events") + "</p>";
    html += ev.length
      ? '<ul class="trk-events">' + ev.join("") + "</ul>"
      : '<p class="trk-empty">' + t("trk_no_ev") + "</p>";

    $("trackingBody").innerHTML = html;
  }

  function trackingEvents(rc) {
    var out = [], lastLabel = null;
    for (var i = rc.length - 1; i >= 0 && out.length < 4; i--) {
      var e = rc[i], label = null, cls = "y";
      if (e.category === "SafetyCar") {
        label = /VIRTUAL/i.test(e.message || "") ? t("rc_vsc") : t("rc_sc"); cls = "y";
      } else if (e.flag === "RED") { label = t("rc_red"); cls = "r"; }
      else if (e.flag === "YELLOW" || e.flag === "DOUBLE YELLOW") { label = t("rc_yellow"); cls = "y"; }
      else if (e.flag === "CHEQUERED") { label = t("rc_chequered"); cls = "g"; }
      else if (e.flag === "GREEN") { label = t("rc_green"); cls = "g"; }
      else if (/STOPPED|RETIRE/i.test(e.message || "")) { label = t("trk_stopped"); cls = "r"; }
      if (!label || label === lastLabel) continue;   /* pula repetidos em sequência */
      lastLabel = label;
      out.push('<li class="ev-' + cls + '"><span class="ev-dot"></span><span class="ev-txt">' +
        label + "</span><span class=\"ev-lap\"></span></li>");
    }
    return out;
  }

  /* ---------------- Fundo do hero ---------------- */
  function setHeroBg(hubName) {
    var url = MEDIA + "/2018-redesign-assets/Racehub%20header%20images%2016x9/" +
      encodeURIComponent(hubName) + ".jpg.transform/fullbleed/image.jpg";
    var probe = new Image();
    probe.onload = function () {
      $("heroBg").style.backgroundImage = "url('" + url + "')";
      var old = document.querySelector(".hero-pending");
      if (old) old.remove();
    };
    probe.onerror = function () {
      if (document.querySelector(".hero-pending")) return;
      var tag = document.createElement("span");
      tag.className = "hero-pending";
      tag.textContent = "Imagem oficial pendente";
      $("heroBg").parentElement.appendChild(tag);
    };
    probe.src = url;
  }

  /* ---------------- Próxima corrida (calendário ao vivo) ---------------- */
  var lastRace = null, lastTotal = 22;

  function renderNextRace(race, totalRounds) {
    lastRace = race; lastTotal = totalRounds;

    /* Mostra imediatamente o último resultado salvo enquanto a atualização
       silenciosa consulta as APIs. Antes, o cache só aparecia após uma falha. */
    if (weekendState().mode !== "pre") restoreLiveCache();

    var c = CIRCUITS[race.Circuit.circuitId] || {};
    var loc = race.Circuit.Location;

    var titleHTML;
    if (LANG === "en") {
      titleHTML = race.raceName.replace(" Grand Prix", "") + "<br>Grand Prix";
    } else {
      var map = LANG === "es" ? GP_ES : GP_PT;
      titleHTML = map[race.raceName]
        ? t("gp_title") + "<br>" + map[race.raceName]
        : race.raceName.replace(" Grand Prix", "") + "<br>Grand Prix";
    }
    $("heroTitle").innerHTML = titleHTML;

    $("heroLocText").innerHTML = race.Circuit.circuitName +
      ' <span class="dim">– ' + loc.locality + "</span>";

    var iso = COUNTRY_ISO[loc.country];
    if (iso) $("heroFlag").innerHTML = flagImg(iso, loc.country);

    var start = new Date((race.FirstPractice ? race.FirstPractice.date : race.date) + "T12:00:00Z");
    var end = new Date(race.date + "T12:00:00Z");
    $("heroDate").textContent =
      start.getUTCDate() + " – " + end.getUTCDate() + " " +
      M()[end.getUTCMonth()] + " " + end.getUTCFullYear();

    $("heroDesc").innerHTML =
      t("round_line").replace("{r}", race.round).replace("{n}", totalRounds) +
      "<br>" + t("round_line2").replace("{y}", SEASON);

    /* largada: data + hora oficiais (UTC) convertidas para Brasília */
    var startTs = new Date(race.date + "T" + (race.time || "17:00:00Z"));
    raceStart = startTs.getTime();
    tick();

    var brt = new Date(startTs.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    var hh = LANG === "en"
      ? pad(brt.getHours()) + ":" + pad(brt.getMinutes())
      : brt.getHours() + "h" + pad(brt.getMinutes());
    $("raceTimeText").textContent =
      t("race_line").replace("{d}", W()[brt.getDay()]).replace("{t}", hh);

    /* card do circuito */
    $("circuitName").textContent = c.nm || race.Circuit.circuitName;
    $("statLen").innerHTML = c.km ? c.km + " <small>km</small>" : "—";
    $("statLaps").textContent = c.laps || "—";
    $("statTurns").textContent = c.turns || "—";
    $("recordTime").textContent = c.rec || "—";
    $("recordHolder").textContent = c.by || "";

    setFigure($("trackMapFig"), $("trackMapImg"), c.asset
      ? MEDIA + "/2018-redesign-assets/Circuit%20maps%2016x9/" + c.asset + "_Circuit.png"
      : null);

    setHeroBg((c.hub || c.asset || loc.country).replace(/_/g, " "));

    /* re-aplica o estado do fim de semana (pode sobrepor a linha da corrida) */
    tick._stamp = null;
    tick();
  }

  /* ---------------- Ficha oficial do piloto ---------------- */

  function official(d) { return OFFICIAL[driverCode(d)] || null; }

  /* "1 (x106)" -> {pos:1, count:106} */
  function parseFinish(s) {
    var m = /^(\d+)(?:\s*\(x(\d+)\))?/.exec(s || "");
    return m ? { pos: parseInt(m[1], 10), count: m[2] ? parseInt(m[2], 10) : 1 } : null;
  }

  function careerWins(o) {
    var f = parseFinish(o && o.hf);
    return f && f.pos === 1 ? String(f.count) : "0";
  }

  /* "14/10/2004" -> "14 Out 2004" (no idioma atual) */
  function fmtDOB(s) {
    var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s || "");
    return m ? m[1] + " " + M()[parseInt(m[2], 10) - 1] + " " + m[3] : s || "—";
  }

  function ordinalEN(n) {
    var v = n % 100;
    return n + (v >= 11 && v <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] || "th");
  }

  function fmtPos(s) {
    var m = /^(\d+)/.exec(s || "");
    if (!m) return s || "—";
    var n = parseInt(m[1], 10);
    return LANG === "en" ? ordinalEN(n) : n + "º";
  }

  function fmtFinish(s) {
    var f = parseFinish(s);
    if (!f) return "—";
    var pos = LANG === "en" ? ordinalEN(f.pos) : f.pos + "º";
    return pos + (f.count > 1 ? " (" + f.count + "×)" : "");
  }

  /* ---------------- Pilotos por equipe ---------------- */
  var teams = [];       // [{id, name, drivers:[standing,...]}]
  var teamIndex = 0;
  var renderToken = 0;

  function statRow(icon, label, value, slot) {
    return "<li>" + icon + "<span>" + label + "</span><strong" +
      (slot ? ' data-slot="' + slot + '"' : "") + ">" + value + "</strong></li>";
  }

  function renderDriverCard(cardEl, st) {
    var d = st.Driver;
    var o = official(d);
    var nat = NATIONALITY[d.nationality] || [d.nationality, null];
    var natName = countryName(d.nationality);
    var dob = new Date(d.dateOfBirth + "T12:00:00Z");
    var dobTxt = o ? fmtDOB(o.dob)
      : pad(dob.getUTCDate()) + " " + M()[dob.getUTCMonth()] + " " + dob.getUTCFullYear();

    cardEl.innerHTML =
      '<header class="driver-id">' +
        '<span class="driver-num">' + (d.permanentNumber || "–") + "</span>" +
        '<h3 class="driver-name">' + d.givenName.split(" ").pop() + "<br>" + d.familyName + "</h3>" +
      "</header>" +
      '<p class="driver-country"><span class="flag">' + flagImg(nat[1], natName) + "</span>" + natName + "</p>" +
      '<ul class="driver-stats">' +
        statRow(IC.cal, t("d_dob"), dobTxt) +
        statRow(IC.trophy, t("d_titles"), o ? o.wc : "—") +
        statRow(IC.medal, t("d_podiums"), o ? o.pod : "—") +
        statRow(IC.star, t("d_wins"), o ? careerWins(o) : "—") +
      "</ul>" +
      '<a href="#" class="btn btn-ghost btn-more"><span>' + t("btn_more") + '</span><span class="arrow-cell">' + IC.arrow + "</span></a>";

    cardEl.querySelector(".btn-more").addEventListener("click", function (ev) {
      ev.preventDefault();
      openModal(st);
    });
  }

  function renderTeam(i) {
    var team = teams[i];
    if (!team) return;
    teamIndex = i;
    renderToken++;

    var names = TEAM_NAMES[team.id] || [team.name, null];
    $("teamName").textContent = names[0];
    var sub = names[1] || team.name;
    if (sub.toLowerCase() === names[0].toLowerCase()) sub = t("team_generic");
    $("teamSub").textContent = sub;

    /* identidade visual da equipe */
    document.querySelector(".drivers-panel").style.setProperty("--team", TEAM_COLORS[team.id] || "#E8002D");
    var dots = $("teamDots").children;
    for (var k = 0; k < dots.length; k++) dots[k].classList.toggle("active", k === i);

    var old = TEAM_ASSETS[team.id];
    var slug = F1_SLUG[team.id];
    /* logo oficial 2026 colorido, fundo transparente (o "logowhite" e monocromatico) */
    setFigure($("teamLogoFig"), $("teamLogoImg"), [
      slug ? IMGUP + "c_fit,h_160/q_auto/v1740000001/common/f1/2026/" + slug + "/" + logoFile(slug) : null
    ]);
    /* carro: modelo 2026 oficial; reserva: carro do acervo anterior */
    setFigure($("teamCarFig"), $("teamCarImg"), [
      slug ? IMGUP + "c_fit,w_920/q_auto/v1740000001/common/f1/2026/" + slug + "/2026" + slug + "carright.webp" : null,
      old ? MEDIA + "/teams/2025/" + old + ".png" : null
    ]);

    var d1 = team.drivers[0], d2 = team.drivers[1] || team.drivers[0];
    renderDriverCard($("cardLeft"), d1);
    renderDriverCard($("cardRight"), d2);

    setFigure($("photoLeft"), $("photoLeft").querySelector("img"), driverPhotoURLs(d1.Driver, team.id));
    setFigure($("photoRight"), $("photoRight").querySelector("img"), driverPhotoURLs(d2.Driver, team.id));
  }

  /* ---------------- Pop-up do piloto ---------------- */
  var modal = $("driverModal");

  function gridRow(label, value) {
    return "<li><span>" + label + "</span><strong>" + value + "</strong></li>";
  }

  function openModal(st) {
    var d = st.Driver;
    var o = official(d);
    var nat = NATIONALITY[d.nationality] || [d.nationality, null];
    var teamId = teams[teamIndex] ? teams[teamIndex].id : "ferrari";
    var teamNm = $("teamName").textContent;
    var teamSub = $("teamSub").textContent;

    modal.querySelector(".modal-card").style.setProperty("--team", TEAM_COLORS[teamId] || "#E8002D");

    $("mdNum").textContent = d.permanentNumber || "–";
    $("mdName").textContent = d.givenName + " " + d.familyName;
    $("mdTeam").textContent = (teamSub && teamSub !== t("team_generic")) ? teamSub : teamNm;

    var natName = countryName(d.nationality);
    $("mdCountry").innerHTML = '<span class="flag">' + flagImg(nat[1], natName) + "</span>" + natName;
    $("mdBirth").textContent = t("md_born") + " — " + (o ? fmtDOB(o.dob) : d.dateOfBirth) +
      (o && o.pob ? " · " + o.pob : "");

    $("mdCareer").innerHTML = o
      ? gridRow(t("md_gps"), o.gps) + gridRow(t("md_titles"), o.wc) +
        gridRow(t("md_wins"), careerWins(o)) + gridRow(t("md_podiums"), o.pod) +
        gridRow(t("md_poles"), o.pole) + gridRow(t("md_points"), o.pts) +
        gridRow(t("md_best_finish"), fmtFinish(o.hf)) + gridRow(t("md_best_grid"), fmtFinish(o.hg))
      : gridRow("—", "—");

    $("mdSeason").innerHTML = o
      ? gridRow(t("md_pos"), fmtPos(o.sPos)) + gridRow(t("md_points"), o.sPts) +
        gridRow(t("md_wins"), o.sWin) + gridRow(t("md_podiums"), o.sPod)
      : gridRow("—", "—");

    if (o && o.slug) {
      $("mdLink").href = "https://www.formula1.com/en/drivers/" + o.slug;
      $("mdLink").style.display = "";
    } else {
      $("mdLink").style.display = "none";
    }

    setFigure($("mdPhotoFig"), $("mdPhotoImg"), driverPhotoURLs(d, teamId));

    modal.hidden = false;
    document.body.classList.add("modal-open");
    void modal.offsetWidth;              /* reinicia as animações de entrada */
    modal.classList.add("open");
  }

  function closeModal() {
    modal.classList.remove("open");
    document.body.classList.remove("modal-open");
    setTimeout(function () { modal.hidden = true; }, 280);
  }

  $("modalClose").addEventListener("click", closeModal);
  modal.addEventListener("click", function (ev) { if (ev.target === modal) closeModal(); });
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && !modal.hidden) closeModal();
  });

  /* Conteúdo estático (antes de a API responder): Hamilton e Leclerc */
  var STATIC_DRIVERS = {
    cardLeft: { Driver: { givenName: "Charles", familyName: "Leclerc", permanentNumber: "16", nationality: "Monegasque", dateOfBirth: "1997-10-16" } },
    cardRight: { Driver: { givenName: "Lewis", familyName: "Hamilton", permanentNumber: "44", nationality: "British", dateOfBirth: "1985-01-07" } }
  };
  ["cardLeft", "cardRight"].forEach(function (id) {
    var btn = $(id).querySelector(".btn-more");
    if (btn) btn.addEventListener("click", function (ev) {
      ev.preventDefault();
      openModal(STATIC_DRIVERS[id]);
    });
  });

  function switchTo(next) {
    var grid = $("driversGrid");
    grid.classList.add("switching");
    setTimeout(function () {
      renderTeam(next);
      grid.classList.remove("switching");
    }, 180);
  }

  function switchTeam(dir) {
    switchTo((teamIndex + dir + teams.length) % teams.length);
  }

  /* ---------------- Hub da corrida (seção 2) ----------------
     Sem corrida no fim de semana: histórico + recordes + programação.
     Após a classificação: grid de largada real + campeonato.
     Após a corrida: resultado real no lugar do grid. */
  var hub = {
    quali: null, result: null, winners: null,
    drivers: null, ctors: null,
    tab: "drivers", expanded: false
  };

  var SESSION_KEYS = [
    ["FirstPractice", "s_fp1"], ["SecondPractice", "s_fp2"], ["ThirdPractice", "s_fp3"],
    ["SprintQualifying", "s_sq"], ["Sprint", "s_sprint"], ["Qualifying", "s_quali"]
  ];

  function brtDate(dateStr, timeStr) {
    var d = new Date(dateStr + "T" + (timeStr || "12:00:00Z"));
    return new Date(d.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  }
  function fmtTime(d) {
    return LANG === "en"
      ? pad(d.getHours()) + ":" + pad(d.getMinutes())
      : d.getHours() + "h" + pad(d.getMinutes());
  }

  function renderSchedule() {
    if (!lastRace) return;
    var groups = {}, order = [];
    function push(dateStr, timeStr, label) {
      if (!dateStr) return;
      var d = brtDate(dateStr, timeStr);
      var day = W()[d.getDay()];
      if (!groups[day]) { groups[day] = []; order.push(day); }
      groups[day].push({ label: label, time: fmtTime(d) });
    }
    SESSION_KEYS.forEach(function (k) {
      var s = lastRace[k[0]];
      if (s) push(s.date, s.time, t(k[1]));
    });
    push(lastRace.date, lastRace.time, t("s_race"));

    var html = "";
    order.forEach(function (day) {
      html += '<p class="sched-day">' + day + "</p>";
      groups[day].forEach(function (s) {
        html += '<div class="sched-row">' + IC.clock + "<span>" + s.label + "</span><strong>" + s.time + "</strong></div>";
      });
    });
    $("scheduleList").innerHTML = html;
  }

  function renderHistory() {
    var el = $("historyList");
    if (!hub.winners || !hub.winners.length) { el.innerHTML = ""; return; }
    el.innerHTML = hub.winners.slice(-5).reverse().map(function (r) {
      var w = r.Results[0].Driver, ctor = r.Results[0].Constructor;
      var ph = driverPhotoURLs(w, ctor.constructorId)[0];
      return "<li>" +
        '<span class="history-year">' + r.season + "</span>" +
        '<span class="history-photo"><img src="' + ph + '" alt="' + w.familyName + '" loading="lazy" onerror="this.remove()"></span>' +
        '<span class="history-name"><small>' + w.givenName + "</small><strong>" + w.familyName + "</strong></span>" +
        '<span class="history-team">' + ctor.name + "</span></li>";
    }).join("");
  }

  function renderRecords() {
    if (!lastRace) return;
    var c = CIRCUITS[lastRace.Circuit.circuitId] || {};
    $("recordsTitle").textContent =
      t("rec_title").replace("{c}", c.nm || lastRace.Circuit.circuitName);

    var rows = [[IC.clock, t("r_fastest"), c.rec || "—", c.by || ""]];
    if (hub.winners && hub.winners.length) {
      var count = {};
      hub.winners.forEach(function (r) {
        var d = r.Results[0].Driver;
        var k = d.givenName + " " + d.familyName;
        count[k] = (count[k] || 0) + 1;
      });
      var best = Object.keys(count).sort(function (a, b) { return count[b] - count[a]; })[0];
      rows.push([IC.trophy, t("r_most"), best,
        count[best] + " " + (count[best] > 1 ? t("win_p") : t("win_s"))]);
      rows.push([IC.flagc, t("r_first"), hub.winners[0].season, ""]);
    }
    rows.push([IC.laps, t("r_laps"), c.laps || "—", ""]);

    var dist = "—";
    if (c.km && c.laps && c.laps !== "—") {
      var totalKm = (parseFloat(c.km.replace(",", ".")) * parseInt(c.laps, 10)).toFixed(3);
      dist = (LANG === "en" ? totalKm : totalKm.replace(".", ",")) + " km";
    }
    rows.push([IC.track, t("r_dist"), dist, ""]);

    $("recordsList").innerHTML = rows.map(function (r) {
      return "<li>" + r[0] + '<span class="record-info"><small>' + r[1] + "</small><strong>" +
        r[2] + "</strong>" + (r[3] ? "<span>" + r[3] + "</span>" : "") + "</span></li>";
    }).join("");
  }

  /* "Belgian Grand Prix" -> "GP da Bélgica" (idioma atual) */
  function gpShort(raceName) {
    if (!raceName) return "";
    if (LANG === "en") return raceName;
    var map = LANG === "es" ? GP_ES : GP_PT;
    return map[raceName] ? "GP " + map[raceName] : raceName;
  }

  function renderStartGrid() {
    var data = hub.result || hub.quali;
    if (!data) return;
    var isResult = !!hub.result;
    $("gridTitle").textContent = isResult
      ? t("h_last_race") + (hub.lastRaceName ? " · " + gpShort(hub.lastRaceName) : "")
      : t("h_grid");
    $("startGrid").innerHTML = data.map(function (r) {
      var d = r.Driver, ctorId = r.Constructor.constructorId;
      var color = TEAM_COLORS[ctorId] || "#E10600";
      var ph = driverPhotoURLs(d, ctorId)[0];
      var timeTxt = isResult
        ? ((r.Time && r.Time.time) ? r.Time.time : (r.status || ""))
        : (r.Q3 || r.Q2 || r.Q1 || "");
      return '<li style="--pos-team:' + color + '">' +
        '<span class="grid-pos">' + r.position + "</span>" +
        '<span class="grid-photo"><img src="' + ph + '" alt="' + d.familyName + '" loading="lazy" onerror="this.remove()"></span>' +
        '<span class="grid-num">' + (d.permanentNumber || "") + "</span>" +
        '<span class="grid-driver"><strong>' + d.familyName + "</strong><small>" + timeTxt + "</small></span></li>";
    }).join("");
  }

  function teamLogo(ctorId) {
    var slug = F1_SLUG[ctorId];
    return slug
      ? '<img src="' + IMGUP + "c_fit,h_44/q_auto/v1740000001/common/f1/2026/" + slug + "/" + logoFile(slug) + '" alt="" loading="lazy" onerror="this.remove()">'
      : "";
  }

  function renderStandings() {
    /* fim de semana com dados: grid/resultado à esquerda + campeonato à direita */
    var raceMode = !!(hub.quali || hub.result);
    $("standingsLayout").classList.toggle("race-mode", raceMode);
    $("hubStartGrid").hidden = !raceMode;
    if (raceMode) renderStartGrid();

    $("champTitle").textContent = t("h_champ").replace("{y}", SEASON);
    var isDrivers = hub.tab === "drivers";
    var rows = isDrivers ? hub.drivers : hub.ctors;

    /* cabeçalho da tabela + colunas conforme a aba */
    $("standingsPanel").classList.toggle("ctors", !isDrivers);
    $("thPos").textContent = t("th_pos");
    $("thName").textContent = isDrivers ? t("th_driver") : t("th_team");
    $("thTeam").textContent = t("th_team");
    $("thPts").textContent = t("th_pts");

    var list = $("champList");
    if (!rows) { list.innerHTML = ""; return; }

    list.innerHTML = rows.slice(0, hub.expanded ? rows.length : 10).map(function (s) {
      var podium = parseInt(s.position, 10) <= 3 ? " podium" : "";
      if (isDrivers) {
        var d = s.Driver;
        var nat = NATIONALITY[d.nationality] || [d.nationality, null];
        var ctor = s.Constructors[s.Constructors.length - 1] || {};
        var names = TEAM_NAMES[ctor.constructorId];
        /* como sidebar (ao lado do grid) o espaço é menor → inicial + sobrenome */
        var dName = raceMode ? d.givenName.charAt(0) + ". " + d.familyName
                             : d.givenName + " " + d.familyName;
        return '<li class="' + podium.trim() + '">' +
          '<span class="champ-pos">' + s.position + "</span>" +
          '<span class="champ-driver"><span class="flag">' + flagImg(nat[1], "") + "</span>" +
            '<span class="champ-name">' + dName + "</span></span>" +
          '<span class="champ-team">' + teamLogo(ctor.constructorId) +
            "<span>" + (names ? names[0] : (ctor.name || "")) + "</span></span>" +
          '<span class="champ-pts">' + s.points + "</span></li>";
      }
      var names2 = TEAM_NAMES[s.Constructor.constructorId];
      return '<li class="' + podium.trim() + '">' +
        '<span class="champ-pos">' + s.position + "</span>" +
        '<span class="champ-team">' + teamLogo(s.Constructor.constructorId) +
          "<span>" + (names2 ? names2[0] : s.Constructor.name) + "</span></span>" +
        '<span class="champ-pts">' + s.points + "</span></li>";
    }).join("");
    $("champMore").querySelector("span").textContent = t(hub.expanded ? "btn_less" : "btn_full");
  }

  function renderHub() {
    renderStandings();                    /* campeonato (+ grid no fim de semana) */
    if (!lastRace) return;
    renderSchedule();
    renderHistory();
    renderRecords();
  }

  function loadCtors() {
    if (hub.ctors) return;
    getJSON(API + "/" + SEASON + "/constructorstandings.json").then(function (j) {
      var l = j.MRData.StandingsTable.StandingsLists;
      hub.ctors = l.length ? l[0].ConstructorStandings : [];
      renderHub();
      renderSidebar();      /* "equipe líder" nas estatísticas da temporada */
    }).catch(function () {});
  }

  /* Resultado da última corrida disputada (round "last", ou ?round=N em teste) */
  function loadLastRace() {
    var round = "last";
    try {
      var forced = new URLSearchParams(location.search).get("round");
      if (forced) round = forced;
    } catch (e) {}
    getJSON(API + "/" + SEASON + "/" + round + "/results.json?limit=30").then(function (j) {
      var rs = j.MRData.RaceTable.Races;
      if (rs.length && rs[0].Results && rs[0].Results.length) {
        hub.result = rs[0].Results;
        hub.lastRaceName = rs[0].raceName;
        loadCtors();
        renderHub();
        renderTeamsSection();   /* "atualizado após {GP}" */
      }
    }).catch(function () {});
  }

  function initHub(race) {
    loadLastRace();

    getJSON(API + "/circuits/" + race.Circuit.circuitId + "/results/1.json?limit=100").then(function (j) {
      hub.winners = j.MRData.RaceTable.Races || [];
      renderHub();
    }).catch(function () {});

    /* revalida a cada 5 min: uma corrida recém-encerrada aparece sozinha */
    setInterval(loadLastRace, 300000);
    renderHub();
  }

  $("tabDrivers").addEventListener("click", function () {
    hub.tab = "drivers";
    $("tabDrivers").classList.add("active");
    $("tabCtors").classList.remove("active");
    renderStandings();
  });
  $("tabCtors").addEventListener("click", function () {
    hub.tab = "ctors";
    $("tabCtors").classList.add("active");
    $("tabDrivers").classList.remove("active");
    if (!hub.ctors) loadCtors();
    renderStandings();
  });
  $("champMore").addEventListener("click", function () {
    hub.expanded = !hub.expanded;
    renderStandings();
  });

  /* ---------------- Calendário ----------------
     Mapa-múndi desenhado em <canvas> a partir dos contornos do Natural Earth
     (world-map-data.js, domínio público) — sem SVG. Os pinos são elementos
     HTML posicionados em % pela mesma projeção, então sempre ficam alinhados. */

  var CONTINENT = {
    Australia: "OC", China: "AS", Japan: "AS", USA: "NA", Canada: "NA", Monaco: "EU",
    Spain: "EU", Austria: "EU", UK: "EU", Belgium: "EU", Hungary: "EU",
    Netherlands: "EU", Italy: "EU", Azerbaijan: "AS", Singapore: "AS", Mexico: "NA",
    Brazil: "SA", Qatar: "AS", UAE: "AS", Bahrain: "AS", "Saudi Arabia": "AS"
  };
  /* GPs disputados à noite / ao entardecer */
  var NIGHT_RACES = ["bahrain", "jeddah", "marina_bay", "losail", "yas_marina", "vegas"];

  var cal = { races: [], nextRound: null, filter: "all", poles: null, fastest: null, selected: null };

  /* projeção equiretangular normalizada (0..1) — Antártida cortada */
  var LAT_MAX = 84, LAT_MIN = -58;
  function projN(lon, lat) {
    return {
      x: (parseFloat(lon) + 180) / 360,
      y: (LAT_MAX - parseFloat(lat)) / (LAT_MAX - LAT_MIN)
    };
  }

  function drawWorldMap() {
    var canvas = $("worldCanvas");
    if (!canvas || !window.WORLD_LAND) return;
    var rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.fillStyle = "#3B3944";
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 0.7;
    ctx.lineJoin = "round";

    WORLD_LAND.forEach(function (ring) {
      ctx.beginPath();
      for (var i = 0; i < ring.length; i += 2) {
        var p = projN(ring[i], ring[i + 1]);
        var x = p.x * rect.width, y = p.y * rect.height;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  }

  function renderPins() {
    if (!cal.races.length) return;
    $("mapPins").innerHTML = cal.races.map(function (r) {
      var loc = r.Circuit.Location;
      var p = projN(loc.long, loc.lat);
      var cls = r.round === cal.nextRound ? "next" : (isDone(r) ? "done" : "");
      if (r.round === cal.selected) cls += " selected";
      return '<span class="map-pin ' + cls + '" data-round="' + r.round +
        '" style="left:' + (p.x * 100).toFixed(2) +
        "%;top:" + (p.y * 100).toFixed(2) + '%">' + r.round + "</span>";
    }).join("");
  }

  function isDone(r) {
    return r.date < new Date().toISOString().slice(0, 10);
  }

  function renderCalendar() {
    if (!cal.races.length) return;
    var races = cal.races;

    /* títulos e KPIs */
    $("calTitle").textContent = t("cal_title").replace("{y}", SEASON);
    $("calSeason").textContent = t("cal_season").replace("{y}", SEASON);

    var countries = {}, continents = {};
    races.forEach(function (r) {
      var c = r.Circuit.Location.country;
      countries[c] = 1;
      if (CONTINENT[c]) continents[CONTINENT[c]] = 1;
    });
    var nCountries = Object.keys(countries).length;
    var nContinents = Object.keys(continents).length;

    $("calSub").textContent = t("cal_sub")
      .replace("{n}", races.length).replace("{c}", nContinents);

    var done = races.filter(isDone).length;
    $("kpiDone").textContent = done + " / " + races.length;
    $("kpiDoneLbl").textContent = t("kpi_done");
    $("kpiNextLbl").textContent = t("kpi_next");
    $("kpiCountries").textContent = nCountries;
    $("kpiCountriesLbl").textContent = t("kpi_countries");

    var next = races.filter(function (r) { return !isDone(r); })[0];
    if (next) {
      cal.nextRound = next.round;
      $("kpiNext").textContent = gpShort(next.raceName);
      var nd = new Date(next.date + "T12:00:00Z");
      $("kpiNextDate").textContent = pad(nd.getUTCDate()) + " " +
        M()[nd.getUTCMonth()] + " " + nd.getUTCFullYear();
    }

    /* grade de corridas */
    $("raceGrid").innerHTML = races.filter(function (r) {
      if (cal.filter === "done") return isDone(r);
      if (cal.filter === "next") return !isDone(r);
      return true;
    }).map(function (r) {
      var loc = r.Circuit.Location;
      var iso = COUNTRY_ISO[loc.country];
      var d = new Date(r.date + "T12:00:00Z");
      var isNext = r.round === cal.nextRound;
      var state = isNext ? "next" : (isDone(r) ? "done" : "sched");
      if (r.round === cal.selected) state += " selected";
      var label = isNext ? t("st_next") : (isDone(r) ? t("st_done") : "—");

      var tags = "";
      if (r.Sprint) tags += '<span class="rc-tag" title="' + t("st_sprint") + '">S</span>';
      if (NIGHT_RACES.indexOf(r.Circuit.circuitId) >= 0) {
        tags += '<span class="rc-tag" title="' + t("st_night") +
          '"><svg class="ic" viewBox="0 0 24 24"><path d="M20 14.5A8.2 8.2 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z"/></svg></span>';
      }

      return '<article class="race-card ' + state + '" data-round="' + r.round + '" tabindex="0">' +
        (tags ? '<span class="rc-tags">' + tags + "</span>" : "") +
        '<header class="rc-head"><span class="rc-num">' + r.round + "</span>" +
          '<span class="flag">' + flagImg(iso, loc.country) + "</span></header>" +
        '<p class="rc-country">' + countryLabel(loc.country) + "</p>" +
        '<p class="rc-city">' + loc.locality + "</p>" +
        '<p class="rc-date">' + pad(d.getUTCDate()) + " " + M()[d.getUTCMonth()] + "</p>" +
        '<span class="rc-status">' + label + "</span></article>";
    }).join("");

    renderPins();
    renderSidebar();
  }

  /* nome do país no idioma atual (a API devolve em inglês) */
  function countryLabel(country) {
    var iso = COUNTRY_ISO[country];
    if (iso && window.Intl && Intl.DisplayNames) {
      try {
        var loc = LANG === "pt" ? "pt-BR" : LANG;
        var n = new Intl.DisplayNames([loc], { type: "region" }).of(iso.toUpperCase());
        if (n) return n;
      } catch (e) {}
    }
    return country;
  }

  function renderNextRaceCard(race) {
    var c = CIRCUITS[race.Circuit.circuitId] || {};
    var loc = race.Circuit.Location;
    $("nrRound").textContent = race.round;
    $("nrName").textContent = gpShort(race.raceName);
    $("nrCity").textContent = loc.locality;
    $("nrFlag").innerHTML = flagImg(COUNTRY_ISO[loc.country], loc.country);

    var d = new Date(race.date + "T12:00:00Z");
    $("nrDate").textContent = pad(d.getUTCDate()) + " " + M()[d.getUTCMonth()] + " " + d.getUTCFullYear();

    setFigure($("nrPhotoFig"), $("nrPhotoImg"), c.asset
      ? MEDIA + "/2018-redesign-assets/Racehub%20header%20images%2016x9/" +
        encodeURIComponent((c.hub || c.asset).replace(/_/g, " ")) + ".jpg.transform/fullbleed/image.jpg"
      : null);
  }

  function renderSeasonStats() {
    $("statsTitle").textContent = t("stats_title");
    var rows = [];   /* [ícone, rótulo, valor, complemento, cor da equipe] */

    if (hub.drivers && hub.drivers.length) {
      /* líder do campeonato + vantagem para o 2º */
      var L = hub.drivers[0];
      var lName = L.Driver.givenName + " " + L.Driver.familyName;
      var sub = L.points + " pts";
      if (hub.drivers[1]) {
        var gap = parseFloat(L.points) - parseFloat(hub.drivers[1].points);
        sub += " · " + t("gap_over").replace("{n}", gap)
          .replace("{who}", hub.drivers[1].Driver.familyName);
      }
      rows.push([IC.trophy, t("stat_leader"), lName, sub]);

      /* mais vitórias */
      var best = hub.drivers.slice().sort(function (a, b) {
        return parseInt(b.wins, 10) - parseInt(a.wins, 10);
      })[0];
      if (best && parseInt(best.wins, 10) > 0) {
        var n = parseInt(best.wins, 10);
        var bName = best.Driver.givenName + " " + best.Driver.familyName;
        rows.push([IC.star, t("stat_wins"), bName,
          (n === 1 ? t("win_1") : t("wins_n").replace("{n}", n))]);
      }

      /* quantos pilotos diferentes já venceram */
      var winners = hub.drivers.filter(function (s) { return parseInt(s.wins, 10) > 0; }).length;
      if (winners) {
        rows.push([IC.flagc, t("stat_winners"), String(winners),
          t("n_drivers").replace("{n}", winners), null]);
      }
    }

    /* equipe líder */
    if (hub.ctors && hub.ctors.length) {
      var C = hub.ctors[0];
      var cn = TEAM_NAMES[C.Constructor.constructorId];
      rows.push([IC.track, t("stat_team"), cn ? cn[0] : C.Constructor.name,
        C.points + " pts"]);
    }

    /* mais poles */
    if (cal.poles) {
      var pn = Object.keys(cal.poles).sort(function (a, b) { return cal.poles[b] - cal.poles[a]; })[0];
      if (pn) {
        var pc = cal.poles[pn];
        rows.push([IC.clock, t("stat_poles"), pn,
          (pc === 1 ? t("pole_1") : t("poles_n").replace("{n}", pc))]);
      }
    }

    /* volta mais rápida da temporada */
    if (cal.fastest) {
      rows.push([IC.laps, t("stat_fastest"), cal.fastest.time,
        cal.fastest.who + " · " + gpShort(cal.fastest.race)]);
    }

    /* corridas restantes */
    if (cal.races.length) {
      var doneN = cal.races.filter(isDone).length;
      var left = cal.races.length - doneN;
      rows.push([IC.cal, t("stat_left"), String(left),
        t("n_races").replace("{n}", doneN).replace("{t}", cal.races.length), null]);
    }

    $("seasonStats").innerHTML = rows.map(statRowHTML).join("");
  }

  function loadCalendarStats() {
    getJSON(API + "/" + SEASON + "/qualifying/1.json?limit=30").then(function (j) {
      var counts = {};
      (j.MRData.RaceTable.Races || []).forEach(function (r) {
        var d = r.QualifyingResults[0].Driver;
        var k = d.givenName + " " + d.familyName;
        counts[k] = (counts[k] || 0) + 1;
      });
      cal.poles = counts;
      renderSeasonStats();
    }).catch(function () {});

    getJSON(API + "/" + SEASON + "/fastest/1/results.json?limit=30").then(function (j) {
      var best = null;
      (j.MRData.RaceTable.Races || []).forEach(function (r) {
        var R = r.Results[0];
        var tm = R.FastestLap && R.FastestLap.Time && R.FastestLap.Time.time;
        if (tm && (!best || tm < best.time)) {
          best = { time: tm, who: R.Driver.givenName + " " + R.Driver.familyName, race: r.raceName };
        }
      });
      cal.fastest = best;
      renderSeasonStats();
    }).catch(function () {});
  }

  /* ---------------- Seleção de corrida → painel da direita ----------------
     Corrida já disputada  → estatísticas DAQUELA corrida (vencedor, pole, volta rápida).
     Corrida ainda por vir → as mesmas métricas como estão HOJE (temporada).
     Sem seleção → próxima corrida + estatísticas da temporada. */
  var raceCache = {};      /* round -> {results, quali} */

  function raceByRound(round) {
    return cal.races.filter(function (x) { return x.round === round; })[0];
  }

  function sidebarRace() {
    return (cal.selected && raceByRound(cal.selected)) ||
      cal.races.filter(function (r) { return !isDone(r); })[0];
  }

  function selectRace(round) {
    cal.selected = (cal.selected === round) ? null : round;
    renderCalendar();
    var side = document.querySelector(".cal-side");
    if (side && cal.selected) side.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  /* estatísticas de uma corrida já disputada (mesmas linhas da temporada) */
  function renderRaceStats(race) {
    var data = raceCache[race.round];
    if (!data) {
      data = raceCache[race.round] = {};
      getJSON(API + "/" + SEASON + "/" + race.round + "/results.json?limit=30").then(function (j) {
        var rs = j.MRData.RaceTable.Races;
        data.results = (rs.length && rs[0].Results) || [];
        if (cal.selected === race.round) renderRaceStats(race);
        return getJSON(API + "/" + SEASON + "/" + race.round + "/qualifying.json?limit=30");
      }).then(function (j) {
        if (!j) return;
        var rs = j.MRData.RaceTable.Races;
        data.quali = (rs.length && rs[0].QualifyingResults) || [];
        if (cal.selected === race.round) renderRaceStats(race);
      }).catch(function () {});
    }

    var rows = [];
    if (data.results && data.results.length) {
      var w = data.results[0];
      var wNames = TEAM_NAMES[w.Constructor.constructorId];
      rows.push([IC.trophy, t("rm_winner"), w.Driver.givenName + " " + w.Driver.familyName,
        (wNames ? wNames[0] : w.Constructor.name) +
        (w.Time && w.Time.time ? " · " + w.Time.time : "")]);

      /* 2º e 3º completam o pódio */
      [1, 2].forEach(function (i) {
        var r = data.results[i];
        if (!r) return;
        var nm = TEAM_NAMES[r.Constructor.constructorId];
        rows.push([IC.medal, (i + 1) + "º",
          r.Driver.givenName + " " + r.Driver.familyName,
          (nm ? nm[0] : r.Constructor.name) +
          (r.Time && r.Time.time ? " · " + r.Time.time : "")]);
      });
    }
    if (data.quali && data.quali.length) {
      var p = data.quali[0];
      rows.push([IC.clock, t("rm_pole"), p.Driver.givenName + " " + p.Driver.familyName,
        p.Q3 || p.Q2 || p.Q1 || ""]);
    }
    if (data.results && data.results.length) {
      var fl = null;
      data.results.forEach(function (r) {
        var f = r.FastestLap;
        if (f && f.Time && (!fl || f.Time.time < fl.time)) {
          fl = { time: f.Time.time, who: r.Driver.givenName + " " + r.Driver.familyName };
        }
      });
      if (fl) rows.push([IC.laps, t("stat_fastest"), fl.time, fl.who]);
    }

    $("statsTitle").textContent = t("rm_result");
    $("seasonStats").innerHTML = rows.length
      ? rows.map(statRowHTML).join("")
      : '<li><div><span>' + t("rm_no_data") + "</span></div></li>";
  }

  /* estatísticas do circuito — para uma corrida que ainda não aconteceu */
  var circuitCache = {};

  function renderCircuitStats(race) {
    var id = race.Circuit.circuitId;
    var c = CIRCUITS[id] || {};
    var winners = circuitCache[id];

    if (winners === undefined) {
      circuitCache[id] = null;    /* marca como "buscando" */
      getJSON(API + "/circuits/" + id + "/results/1.json?limit=100").then(function (j) {
        circuitCache[id] = j.MRData.RaceTable.Races || [];
        if (cal.selected === race.round) renderCircuitStats(race);
      }).catch(function () { circuitCache[id] = []; });
    }

    var rows = [];

    /* último vencedor aqui */
    if (winners && winners.length) {
      var last = winners[winners.length - 1];
      var w = last.Results[0];
      var wNames = TEAM_NAMES[w.Constructor.constructorId];
      rows.push([IC.trophy, t("rm_last_winner"),
        w.Driver.givenName + " " + w.Driver.familyName,
        last.season + " · " + (wNames ? wNames[0] : w.Constructor.name)]);
    }

    /* volta mais rápida da pista (recorde oficial) */
    rows.push([IC.clock, t("c_record"), c.rec || "—", c.by || "", null]);

    /* maior vencedor no circuito */
    if (winners && winners.length) {
      var count = {};
      winners.forEach(function (r) {
        var d = r.Results[0].Driver;
        var k = d.givenName + " " + d.familyName;
        count[k] = (count[k] || 0) + 1;
      });
      var top = Object.keys(count).sort(function (a, b) { return count[b] - count[a]; })[0];
      if (top) {
        var n = count[top];
        rows.push([IC.star, t("r_most"), top,
          (n === 1 ? t("win_1") : t("wins_n").replace("{n}", n))]);
      }
      /* primeiro GP disputado ali */
      rows.push([IC.flagc, t("r_first"), winners[0].season, "", null]);
    }

    /* ficha da pista */
    rows.push([IC.laps, t("c_laps"), c.laps || "—",
      c.km ? c.km + " km · " + (c.turns || "—") + " " + t("c_turns").toLowerCase() : "", null]);

    $("statsTitle").textContent = t("rec_title").replace("{c}", c.nm || race.Circuit.circuitName);
    $("seasonStats").innerHTML = rows.map(statRowHTML).join("");
  }

  function statRowHTML(r) {
    return "<li>" + r[0] +
      "<div><small>" + r[1] + "</small><strong>" + r[2] + "</strong>" +
      (r[3] ? "<span>" + r[3] + "</span>" : "") + "</div></li>";
  }


  function renderSidebar() {
    var race = sidebarRace();
    if (!race) return;

    renderNextRaceCard(race);
    $("sideTitle").textContent = cal.selected ? t("side_selected") : t("side_next");

    if (isDone(race)) renderRaceStats(race);          /* já correu → resultado da prova */
    else if (cal.selected) renderCircuitStats(race);  /* ainda não → recordes da pista */
    else renderSeasonStats();                         /* padrão → visão da temporada */
  }

  /* ---- traçado do circuito ao passar o mouse no pino ---- */
  function showPinTip(pin) {
    var race = raceByRound(pin.getAttribute("data-round"));
    if (!race) return;
    var c = CIRCUITS[race.Circuit.circuitId] || {};
    var tip = $("pinTip");

    var d = new Date(race.date + "T12:00:00Z");
    $("ptName").textContent = gpShort(race.raceName);
    $("ptSub").textContent = race.Circuit.Location.locality + " · " +
      pad(d.getUTCDate()) + " " + M()[d.getUTCMonth()] + " " + d.getUTCFullYear();

    setFigure($("ptMapFig"), $("ptMapImg"), c.asset
      ? MEDIA + "/2018-redesign-assets/Circuit%20maps%2016x9/" + c.asset + "_Circuit.png"
      : null);

    /* posiciona acima do pino, sem estourar as bordas do mapa */
    tip.hidden = false;
    var map = $("calMap");
    var mw = map.clientWidth, mh = map.clientHeight;
    var cx = pin.offsetLeft, cy = pin.offsetTop;   /* com translate(-50%), = centro visual */
    var tw = tip.offsetWidth, th = tip.offsetHeight;

    var left = Math.max(6, Math.min(cx - tw / 2, mw - tw - 6));
    var top = cy - th - 16;                              /* preferência: acima do pino */
    if (top < 4) top = cy + 18;                          /* não coube → abaixo */
    if (top + th > mh - 4) top = Math.max(4, mh - th - 4); /* ainda estoura → encaixa */

    tip.style.left = left + "px";
    tip.style.top = top + "px";
    requestAnimationFrame(function () { tip.classList.add("show"); });
  }

  function hidePinTip() {
    var tip = $("pinTip");
    tip.classList.remove("show");
    clearTimeout(tip._t);
    tip._t = setTimeout(function () { tip.hidden = true; }, 180);
  }

  $("mapPins").addEventListener("mouseover", function (ev) {
    var pin = ev.target.closest(".map-pin");
    if (pin) showPinTip(pin);
  });
  $("mapPins").addEventListener("mouseout", function (ev) {
    var pin = ev.target.closest(".map-pin");
    if (pin && !pin.contains(ev.relatedTarget)) hidePinTip();
  });

  /* clique no card ou no pino do mapa (delegação: o HTML é re-renderizado) */
  function bindRaceSelect(containerId, selector) {
    $(containerId).addEventListener("click", function (ev) {
      var el = ev.target.closest(selector);
      if (el) selectRace(el.getAttribute("data-round"));
    });
  }
  bindRaceSelect("raceGrid", ".race-card");
  bindRaceSelect("mapPins", ".map-pin");
  $("raceGrid").addEventListener("keydown", function (ev) {
    if (ev.key !== "Enter" && ev.key !== " ") return;
    var el = ev.target.closest(".race-card");
    if (!el) return;
    ev.preventDefault();
    selectRace(el.getAttribute("data-round"));
  });

  document.querySelectorAll("#calFilters button").forEach(function (b) {
    b.addEventListener("click", function () {
      cal.filter = b.getAttribute("data-filter");
      document.querySelectorAll("#calFilters button").forEach(function (o) {
        o.classList.toggle("active", o === b);
      });
      renderCalendar();
    });
  });

  var mapT;
  window.addEventListener("resize", function () {
    clearTimeout(mapT);
    mapT = setTimeout(drawWorldMap, 180);
  });

  /* ---------------- Equipes ----------------
     Fichas oficiais em teams-data.js (snapshot de formula1.com/en/teams/{slug});
     pilotos e pontos vêm da API; imagens do CDN oficial 2026. */
  var TEAMS = window.F1_TEAMS || {};
  var TEAM_ORDER = ["ferrari", "red-bull-racing", "mclaren", "mercedes", "aston-martin",
    "alpine", "williams", "haas", "racing-bulls", "audi", "cadillac"];

  /* slug da página oficial -> constructorId da API */
  var SLUG_TO_ID = {
    "ferrari": "ferrari", "red-bull-racing": "red_bull", "mclaren": "mclaren",
    "mercedes": "mercedes", "aston-martin": "aston_martin", "alpine": "alpine",
    "williams": "williams", "haas": "haas", "racing-bulls": "rb",
    "audi": "audi", "cadillac": "cadillac"
  };
  /* país da sede -> ISO (para a bandeirinha) */
  var BASE_ISO = {
    "Italy": "it", "United Kingdom": "gb", "United States": "us", "Switzerland": "ch",
    "Germany": "de", "France": "fr", "Austria": "at", "Spain": "es", "USA": "us"
  };

  var teamSel = "ferrari";

  function teamCarURL(asset) {
    return asset ? IMGUP + "c_fit,w_920/q_auto/v1740000001/common/f1/2026/" +
      asset + "/2026" + asset + "carright.webp" : null;
  }
  function teamLogoURL(asset) {
    return asset ? IMGUP + "c_fit,h_160/q_auto/v1740000001/common/f1/2026/" +
      asset + "/" + logoFile(asset) : null;
  }

  function num(v) { var n = parseInt(v, 10); return isNaN(n) ? 0 : n; }

  function factRow(icon, label, value) {
    return "<li>" + icon + "<small>" + label + "</small><strong>" + (value || "—") + "</strong></li>";
  }

  function renderTeamsList() {
    var html = TEAM_ORDER.map(function (slug) {
      var d = TEAMS[slug] || {};
      var id = SLUG_TO_ID[slug];
      var names = TEAM_NAMES[id];
      var logo = teamLogoURL(d.asset);
      return '<button type="button" data-team="' + slug + '"' +
        (slug === teamSel ? ' class="active"' : "") +
        ' style="--tm-color:' + (TEAM_COLORS[id] || "#E10600") + '">' +
        (logo ? '<img src="' + logo + '" alt="" loading="lazy" onerror="this.style.visibility=\'hidden\'">' : "") +
        "<span>" + (names ? names[0] : slug) + "</span>" +
        '<svg class="ic" viewBox="0 0 24 24"><path d="M9.5 5.5 16 12l-6.5 6.5"/></svg></button>';
    }).join("");
    $("teamsList").innerHTML = html;
  }

  function showTeam(slug) {
    var d = TEAMS[slug];
    if (!d) return;
    teamSel = slug;
    var id = SLUG_TO_ID[slug];
    var color = TEAM_COLORS[id] || "#E10600";
    document.querySelector(".teams-section").style.setProperty("--team", color);

    /* marca o item ativo nas duas listas */
    document.querySelectorAll("#teamsList button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-team") === slug);
    });

    /* cabeçalho */
    var names = TEAM_NAMES[id];
    var full = d.full || (names ? names[0] : slug);
    var shortName = names ? names[0] : slug;
    /* linha pequena = nome oficial completo; título = nome curto */
    $("tmPre").textContent = full;
    $("tmName").textContent = shortName;

    var base = d.base || "";
    var country = base.split(",").pop().trim();
    $("tmBase").textContent = base;
    $("tmFlag").innerHTML = flagImg(BASE_ISO[country], country);

    $("tmFacts").innerHTML =
      factRow(IC.star, t("tm_chief"), d.chief) +
      factRow(IC.laps, t("tm_tech"), d.tech) +
      factRow(IC.flagc, t("tm_since"), d.since) +
      factRow(IC.trophy, t("tm_titles"), d.titles) +
      factRow(IC.medal, t("tm_reserve"), d.reserve);

    setFigure($("thCarFig"), $("thCarImg"), teamCarURL(d.asset));
    setFigure($("thLogoFig"), $("thLogoImg"), teamLogoURL(d.asset));

    /* números da temporada */
    $("teamKpis").innerHTML =
      "<li><strong>" + fmtPos(d.sPos) + "</strong><small>" + t("tm_pos") + "</small></li>" +
      "<li><strong>" + (d.sPts || "0") + "</strong><small>" + t("tm_points") + "</small></li>" +
      "<li><strong>" + (d.sWins || "0") + "</strong><small>" + t("tm_wins") + "</small></li>" +
      "<li><strong>" + (d.sPoles || "0") + "</strong><small>" + t("tm_poles") + "</small></li>" +
      "<li><strong>" + (d.sPodiums || "0") + "</strong><small>" + t("tm_podiums") + "</small></li>";
    $("teamUpdated").innerHTML = IC.clock +
      "<span>" + t("tm_updated").replace("{r}",
        (hub.lastRaceName ? gpShort(hub.lastRaceName) : "—") + " " + SEASON) + "</span>";

    /* pilotos da equipe (da classificação real) */
    var mine = (hub.drivers || []).filter(function (s) {
      var c = s.Constructors[s.Constructors.length - 1];
      return c && c.constructorId === id;
    }).slice(0, 2);

    $("tcDrivers").innerHTML = mine.length ? mine.map(function (s) {
      var dr = s.Driver;
      var nat = NATIONALITY[dr.nationality] || [dr.nationality, null];
      return '<article class="tc-driver">' +
        '<div class="tc-photo"><span class="tc-num">' + (dr.permanentNumber || "") + "</span>" +
        '<img src="' + driverPhotoURLs(dr, id)[0] + '" alt="" loading="lazy" onerror="this.remove()"></div>' +
        '<div class="tc-body"><p class="tc-name">' + dr.givenName + "<br>" + dr.familyName + "</p>" +
        '<p class="tc-country"><span class="flag">' + flagImg(nat[1], "") + "</span>" +
          countryName(dr.nationality) + "</p>" +
        '<div class="tc-stats">' +
          "<div><strong>" + fmtPos(s.position) + "</strong><small>" + t("tm_driver_pos") + "</small></div>" +
          "<div><strong>" + s.points + "</strong><small>" + t("tm_driver_pts") + "</small></div>" +
        "</div></div></article>";
    }).join("") : "";

    /* carro */
    $("tcChassis").textContent = d.chassis || "—";
    setFigure($("tcCarFig"), $("tcCarImg"), teamCarURL(d.asset));
    $("tcSpecs").innerHTML =
      "<li>" + IC.track + "<div><small>" + t("tm_chassis") + "</small><strong>" + (d.chassis || "—") + "</strong></div></li>" +
      "<li>" + IC.laps + "<div><small>" + t("tm_engine") + "</small><strong>" + (d.engine || "—") + "</strong></div></li>" +
      "<li>" + IC.star + "<div><small>" + t("tm_top10") + "</small><strong>" + (d.sTop10 || "0") + "</strong></div></li>" +
      "<li>" + IC.clock + "<div><small>" + t("tm_fastest") + "</small><strong>" + (d.sFastest || "0") + "</strong></div></li>";

    renderTeamPerf(slug);
  }

  /* desempenho: posição real da equipe em cada métrica (entre as 11) */
  function renderTeamPerf(slug) {
    var d = TEAMS[slug];
    var metrics = [
      [t("tm_points"), function (x) { return num(x.sPts); }, false],
      [t("tm_wins"), function (x) { return num(x.sWins); }, false],
      [t("tm_podiums"), function (x) { return num(x.sPodiums); }, false],
      [t("tm_poles"), function (x) { return num(x.sPoles); }, false],
      [t("tm_reliability"), function (x) { return num(x.sDnf); }, true]  /* menos abandonos = melhor */
    ];

    $("perfList").innerHTML = metrics.map(function (m) {
      var vals = TEAM_ORDER.map(function (s) { return m[1](TEAMS[s] || {}); });
      var mine = m[1](d);
      /* posição: quantas equipes estão à frente + 1 */
      var better = vals.filter(function (v) { return m[2] ? v < mine : v > mine; }).length;
      var rank = better + 1;
      var max = Math.max.apply(null, vals) || 1;
      /* barra: valor relativo ao melhor (invertido quando "menos é melhor") */
      var pct = m[2]
        ? Math.round(((max - mine) / max) * 100)
        : Math.round((mine / max) * 100);
      return "<li>" +
        '<div class="perf-top"><span>' + m[0] + "</span><strong>" + fmtPos(rank) + "</strong></div>" +
        '<div class="perf-bar"><div class="perf-fill" style="width:' + Math.max(pct, 4) + '%"></div></div></li>';
    }).join("");
  }

  function renderTeamsSection() {
    if (!Object.keys(TEAMS).length) return;
    $("tmSub").textContent = t("tm_sub").replace("{y}", SEASON);
    document.querySelector('[data-i18n="tm_car"]').textContent = t("tm_car").replace("{y}", SEASON);
    document.querySelector('[data-i18n="tm_perf_note"]').textContent =
      t("tm_perf_note").replace("{n}", TEAM_ORDER.length);
    renderTeamsList();
    showTeam(teamSel);
  }

  document.addEventListener("click", function (ev) {
    var b = ev.target.closest("#teamsList button");
    if (!b) return;
    showTeam(b.getAttribute("data-team"));
    renderTeamsList();
    document.querySelectorAll("#teamsList button").forEach(function (x) {
      x.classList.toggle("active", x.getAttribute("data-team") === teamSel);
    });
  });


  /* ---------------- Estatísticas da temporada ----------------
     Tudo vem da API, para qualquer temporada. Como a API pagina em 100,
     usamos os endpoints por posição (1 linha por corrida) em vez do dump. */
  var STATS_FROM = 1994;          /* classificação só existe a partir de 1994 */
  var statsCache = {};
  var statsSeason = SEASON;

  function fullName(d) { return d.givenName + " " + d.familyName; }

  /* conta ocorrências por piloto/equipe a partir de uma lista de corridas */
  function tally(races, pick) {
    var map = {};
    (races || []).forEach(function (r) {
      var k = pick(r);
      if (!k) return;
      if (!map[k.id]) map[k.id] = { id: k.id, name: k.name, color: k.color, ctor: k.ctor, n: 0 };
      map[k.id].ctor = k.ctor;      /* mantém a equipe mais recente do piloto */
      map[k.id].n++;
    });
    return Object.keys(map).map(function (k) { return map[k]; })
      .sort(function (a, b) { return b.n - a.n; });
  }

  function driverKey(res) {
    var ctorId = res.Constructor && res.Constructor.constructorId;
    return {
      id: res.Driver.driverId, name: fullName(res.Driver),
      color: TEAM_COLORS[ctorId] || "#E10600", ctor: ctorId
    };
  }
  function teamKey(res) {
    var c = res.Constructor;
    if (!c) return null;
    var names = TEAM_NAMES[c.constructorId];
    return { id: c.constructorId, name: names ? names[0] : c.name,
             color: TEAM_COLORS[c.constructorId] || "#E10600", ctor: c.constructorId };
  }

  /* escudo da equipe ao lado do nome (equipes antigas não têm asset 2026 → some) */
  function rankLogo(ctorId) {
    var slug = F1_SLUG[ctorId];
    return slug
      ? '<img class="lg" src="' + IMGUP + "c_fit,h_36/q_auto/v1740000001/common/f1/2026/" +
        slug + "/" + logoFile(slug) + '" alt="" loading="lazy" onerror="this.remove()">'
      : "";
  }

  /* linha de ranking com barra proporcional */
  function rankRow(pos, name, value, pct, color, iconHTML) {
    return "<li>" +
      '<span class="rank-pos">' + pos + "</span>" +
      '<span class="rank-mid">' +
        '<span class="rank-name">' + (iconHTML || "") + name + "</span>" +
        '<span class="rank-bar"><span class="rank-fill" style="width:' + pct + "%;--bar:" + color + '"></span></span>' +
      "</span>" +
      '<span class="rank-val">' + value + "</span></li>";
  }

  function statsCard(icon, title, rows, totalLabel, totalValue) {
    var max = rows.length ? Math.max.apply(null, rows.map(function (r) { return r.n; })) : 1;
    var items = rows.slice(0, 5).map(function (r, i) {
      return rankRow(i + 1, r.name, r.n, max ? Math.round(r.n / max * 100) : 0,
        r.color, rankLogo(r.ctor));
    }).join("") || '<li><span class="rank-mid"><span class="rank-name">—</span></span></li>';
    return '<div class="hub-block">' +
      '<h4 class="hub-title side">' + icon + "<span>" + title + "</span></h4>" +
      '<ul class="rank-list">' + items + "</ul>" +
      '<div class="rank-total"><span>' + totalLabel + "</span><strong>" + totalValue + "</strong></div>" +
      "</div>";
  }

  /* A API limita rajadas (429). Buscamos em sequência, com respiro entre
     as chamadas e uma nova tentativa quando o limite é atingido. */
  function getSeq(urls) {
    var out = [];
    return urls.reduce(function (chain, url) {
      return chain.then(function () {
        return getJSON(url)
          .catch(function () {
            /* provável 429: espera e tenta de novo uma vez */
            return new Promise(function (r) { setTimeout(r, 900); })
              .then(function () { return getJSON(url); })
              .catch(function () { return null; });
          })
          .then(function (j) {
            out.push(j);
            return new Promise(function (r) { setTimeout(r, 220); });
          });
      });
    }, Promise.resolve()).then(function () { return out; });
  }

  var statsToken = 0;

  function loadStats(season) {
    if (statsCache[season]) { renderStats(season); return; }

    $("statsState").hidden = false;
    $("statsState").textContent = t("st_loading");

    var base = API + "/" + season;
    var token = ++statsToken;
    getSeq([
      base + ".json?limit=100",
      base + "/driverstandings.json?limit=100",
      base + "/constructorstandings.json?limit=100",
      base + "/results/1.json?limit=100",
      base + "/results/2.json?limit=100",
      base + "/results/3.json?limit=100",
      base + "/qualifying/1.json?limit=100",
      base + "/fastest/1/results.json?limit=100",
      base + "/status.json?limit=100"
    ]).then(function (r) {
      if (token !== statsToken) return;   /* o usuário já trocou de temporada */
      function races(j) { return (j && j.MRData.RaceTable.Races) || []; }
      function standings(j, key) {
        var l = j && j.MRData.StandingsTable.StandingsLists;
        return (l && l.length && l[0][key]) || [];
      }
      statsCache[season] = {
        calendar: races(r[0]),
        drivers: standings(r[1], "DriverStandings"),
        ctors: standings(r[2], "ConstructorStandings"),
        p1: races(r[3]), p2: races(r[4]), p3: races(r[5]),
        poles: races(r[6]), fastest: races(r[7]),
        status: (r[8] && r[8].MRData.StatusTable.Status) || []
      };
      renderStats(season);
    }).catch(function () {
      $("statsState").hidden = false;
      $("statsState").textContent = t("st_error");
    });
  }

  function renderStats(season) {
    var d = statsCache[season];
    if (!d) return;
    $("statsState").hidden = true;

    var res1 = d.p1.map(function (r) { return r.Results[0]; });
    var res2 = d.p2.map(function (r) { return r.Results[0]; });
    var res3 = d.p3.map(function (r) { return r.Results[0]; });
    var podiumRes = res1.concat(res2, res3);
    var poleRes = d.poles.map(function (r) { return r.QualifyingResults[0]; });
    var fastRes = d.fastest.map(function (r) { return r.Results[0]; });
    var done = d.p1.length;

    /* cabeçalho e painel lateral */
    $("stTitle").textContent = t("st_title").replace("{y}", season);
    $("ssSeason").textContent = t("st_season") + " " + season;
    $("ssDone").textContent = done;
    $("ssTotal").textContent = "/ " + (d.calendar.length || "—");
    $("ssFill").style.width = d.calendar.length ? (done / d.calendar.length * 100) + "%" : "0%";

    var lastRace = d.p1[d.p1.length - 1];
    $("ssLast").textContent = lastRace ? gpShort(lastRace.raceName) : "—";
    $("statsNote").innerHTML = lastRace
      ? '<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg><span>' +
        t("st_note").replace("{r}", gpShort(lastRace.raceName) + " " + season) + "</span>"
      : "";

    /* linha 1: quatro rankings */
    $("statsTop").innerHTML =
      statsCard(IC.trophy, t("st_wins"), tally(res1, driverKey), t("st_total_wins"), res1.length) +
      statsCard(IC.medal, t("st_podiums"), tally(podiumRes, driverKey), t("st_total_pod"), podiumRes.length) +
      statsCard(IC.clock, t("st_poles"), tally(poleRes, driverKey), t("st_total_poles"), poleRes.length) +
      statsCard(IC.laps, t("st_fastest"), tally(fastRes, driverKey), t("st_total_fast"), fastRes.length);

    /* pontuação por piloto (top 10) */
    var dmax = d.drivers.length ? parseFloat(d.drivers[0].points) : 1;
    $("ptsDrivers").innerHTML = d.drivers.slice(0, 10).map(function (s, i) {
      var c = s.Constructors[s.Constructors.length - 1];
      var ctorId = c && c.constructorId;
      var color = TEAM_COLORS[ctorId] || "#E10600";
      return rankRow(i + 1, fullName(s.Driver), s.points,
        dmax ? Math.round(parseFloat(s.points) / dmax * 100) : 0, color, rankLogo(ctorId));
    }).join("") || "";

    /* rosca de pontos por equipe (conic-gradient, sem SVG) */
    var totalPts = d.ctors.reduce(function (a, s) { return a + parseFloat(s.points); }, 0);
    var stops = [], acc = 0;
    d.ctors.forEach(function (s) {
      var color = TEAM_COLORS[s.Constructor.constructorId] || "#666";
      var frac = totalPts ? parseFloat(s.points) / totalPts * 100 : 0;
      stops.push(color + " " + acc.toFixed(2) + "% " + (acc + frac).toFixed(2) + "%");
      acc += frac;
    });
    $("teamDonut").style.background = stops.length
      ? "conic-gradient(" + stops.join(",") + ")"
      : "conic-gradient(rgba(255,255,255,0.08) 0 100%)";
    $("donutTotal").textContent = Math.round(totalPts);
    $("donutLegend").innerHTML = d.ctors.slice(0, 8).map(function (s, i) {
      var names = TEAM_NAMES[s.Constructor.constructorId];
      var color = TEAM_COLORS[s.Constructor.constructorId] || "#666";
      var pct = totalPts ? (parseFloat(s.points) / totalPts * 100).toFixed(1) : "0.0";
      return '<li><span class="dl-pos">' + (i + 1) + "</span>" +
        '<span class="dot" style="background:' + color + '"></span>' +
        '<span class="dl-name">' + (names ? names[0] : s.Constructor.name) + "</span>" +
        '<span class="dl-val">' + s.points + "</span>" +
        '<span class="dl-pct">' + pct + "%</span></li>";
    }).join("");

    /* eficiência: pontos por corrida */
    var eff = d.ctors.map(function (s) {
      var names = TEAM_NAMES[s.Constructor.constructorId];
      return {
        id: s.Constructor.constructorId,
        name: names ? names[0] : s.Constructor.name,
        color: TEAM_COLORS[s.Constructor.constructorId] || "#666",
        n: done ? +(parseFloat(s.points) / done).toFixed(2) : 0
      };
    });
    var effMax = eff.length ? eff[0].n : 1;
    $("effList").innerHTML = eff.slice(0, 8).map(function (r, i) {
      return rankRow(i + 1, r.name, r.n.toFixed(2),
        effMax ? Math.round(r.n / effMax * 100) : 0, r.color, rankLogo(r.id));
    }).join("");

    /* vitórias e pódios por equipe */
    function teamList(el, rows) {
      var max = rows.length ? rows[0].n : 1;
      $(el).innerHTML = rows.slice(0, 8).map(function (r, i) {
        return rankRow(i + 1, r.name, r.n, max ? Math.round(r.n / max * 100) : 0,
          r.color, rankLogo(r.ctor));
      }).join("") || '<li><span class="rank-mid"><span class="rank-name">—</span></span></li>';
    }
    teamList("winsTeam", tally(res1, teamKey));
    teamList("podTeam", tally(podiumRes, teamKey));

    /* fim de corrida: status oficiais */
    var st = d.status.slice().sort(function (a, b) { return b.count - a.count; });
    var stMax = st.length ? +st[0].count : 1;
    $("statusList").innerHTML = st.slice(0, 6).map(function (s, i) {
      return rankRow(i + 1, s.status, s.count,
        stMax ? Math.round(s.count / stMax * 100) : 0,
        i === 0 ? "#35D07F" : "#8A8A90");
    }).join("") || '<li><span class="rank-mid"><span class="rank-name">—</span></span></li>';
  }

  function initStats() {
    var sel = $("statsSeason");
    var opts = "";
    for (var y = SEASON; y >= STATS_FROM; y--) {
      opts += '<option value="' + y + '"' + (y === SEASON ? " selected" : "") + ">" +
        t("st_season") + " " + y + "</option>";
    }
    sel.innerHTML = opts;
    sel.addEventListener("change", function () {
      statsSeason = parseInt(sel.value, 10);
      loadStats(statsSeason);
    });
    loadStats(statsSeason);
  }

  /* ---------------- Menu: seção ativa conforme o scroll ---------------- */
  var navLinks = [].slice.call(document.querySelectorAll(".mainnav a"));

  function syncNav() {
    var pos = window.scrollY + 140;      /* referência logo abaixo do menu fixo */
    var current = navLinks[0];
    navLinks.forEach(function (a) {
      var sec = document.getElementById(a.getAttribute("href").slice(1));
      if (sec && sec.offsetTop <= pos) current = a;
    });
    navLinks.forEach(function (a) { a.classList.toggle("active", a === current); });
  }
  window.addEventListener("scroll", syncNav, { passive: true });
  syncNav();

  /* menu hambúrguer (telas menores) */
  var topbar = document.querySelector(".topbar");
  $("navToggle").addEventListener("click", function (ev) {
    ev.stopPropagation();
    var open = topbar.classList.toggle("nav-open");
    $("navToggle").setAttribute("aria-expanded", String(open));
  });
  navLinks.forEach(function (a) {
    a.addEventListener("click", function () {
      topbar.classList.remove("nav-open");
      $("navToggle").setAttribute("aria-expanded", "false");
    });
  });
  document.addEventListener("click", function (ev) {
    if (!ev.target.closest(".topbar")) {
      topbar.classList.remove("nav-open");
      $("navToggle").setAttribute("aria-expanded", "false");
    }
  });

  /* ---------------- Seletor de idioma ---------------- */
  function applyLang(lang) {
    LANG = T[lang] ? lang : "pt";
    try { localStorage.setItem("f1t-lang", LANG); } catch (e) {}
    document.documentElement.lang = LANG === "pt" ? "pt-BR" : LANG;
    $("langCur").textContent = LANG.toUpperCase();

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-pending-label]").forEach(function (el) {
      el.setAttribute("data-pending-label", t("pending"));
    });
    document.querySelectorAll("#langMenu button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-lang") === LANG);
    });

    /* re-renderiza o conteúdo dinâmico no novo idioma */
    if (lastRace) renderNextRace(lastRace, lastTotal);
    if (teams.length) renderTeam(teamIndex);
    renderHub();
    renderCalendar();
    renderTeamsSection();
    if (statsCache[statsSeason]) {
      var sel = $("statsSeason");
      if (sel) {
        [].forEach.call(sel.options, function (o) { o.textContent = t("st_season") + " " + o.value; });
      }
      renderStats(statsSeason);
    }
    if (!modal.hidden) closeModal();
  }

  var langWrap = document.querySelector(".lang-wrap");

  function closeLangMenu() {
    $("langMenu").hidden = true;
    langWrap.classList.remove("open");
    $("langBtn").setAttribute("aria-expanded", "false");
  }

  $("langBtn").addEventListener("click", function (ev) {
    ev.stopPropagation();
    var willOpen = $("langMenu").hidden;
    $("langMenu").hidden = !willOpen;
    langWrap.classList.toggle("open", willOpen);
    $("langBtn").setAttribute("aria-expanded", String(willOpen));
  });
  document.addEventListener("click", function (ev) {
    if (!langWrap.contains(ev.target)) closeLangMenu();
  });
  document.querySelectorAll("#langMenu button").forEach(function (b) {
    b.addEventListener("click", function () {
      closeLangMenu();
      applyLang(b.getAttribute("data-lang"));
    });
  });

  applyLang(LANG);
  renderTeamsSection();     /* fichas das equipes já vêm do snapshot local */
  initStats();

  /* ---------------- Carga inicial ---------------- */
  getJSON(API + "/" + SEASON + ".json?limit=30").then(function (j) {
    var races = j.MRData.RaceTable.Races || [];
    var today = new Date().toISOString().slice(0, 10);
    var next = races.filter(function (r) { return r.date >= today; })[0] || races[races.length - 1];
    if (next) {
      renderNextRace(next, races.length);
      initHub(next);
    }
    /* calendário: grade, mapa e estatísticas da temporada */
    cal.races = races;
    renderCalendar();
    drawWorldMap();
    loadCalendarStats();
  }).catch(function (e) {
    console.warn("Calendário indisponível — mantendo conteúdo estático.", e);
  });

  getJSON(API + "/" + SEASON + "/driverstandings.json?limit=40").then(function (j) {
    var lists = j.MRData.StandingsTable.StandingsLists || [];
    var standings = lists.length ? lists[0].DriverStandings : [];
    hub.drivers = standings;
    renderHub();
    renderSeasonStats();
    renderTeamsSection();     /* pilotos de cada equipe */
    var byTeam = {};
    var order = [];

    standings.forEach(function (st) {
      var ctor = st.Constructors[st.Constructors.length - 1];
      if (!ctor) return;
      if (!byTeam[ctor.constructorId]) {
        byTeam[ctor.constructorId] = { id: ctor.constructorId, name: ctor.name, drivers: [] };
        order.push(ctor.constructorId);
      }
      if (byTeam[ctor.constructorId].drivers.length < 2) {
        byTeam[ctor.constructorId].drivers.push(st);
      }
    });

    teams = order.map(function (id) { return byTeam[id]; });
    if (!teams.length) return;

    var start = teams.findIndex(function (t) { return t.id === "ferrari"; });
    $("teamPrev").hidden = false;
    $("teamNext").hidden = false;
    $("teamPrev").addEventListener("click", function () { switchTeam(-1); });
    $("teamNext").addEventListener("click", function () { switchTeam(1); });

    /* indicadores clicáveis, um por equipe */
    var dotsBox = $("teamDots");
    teams.forEach(function (t, idx) {
      var b = document.createElement("button");
      b.type = "button";
      b.title = (TEAM_NAMES[t.id] || [t.name])[0];
      b.setAttribute("aria-label", (TEAM_NAMES[t.id] || [t.name])[0]);
      b.addEventListener("click", function () { if (idx !== teamIndex) switchTo(idx); });
      dotsBox.appendChild(b);
    });

    renderTeam(start >= 0 ? start : 0);
  }).catch(function (e) {
    console.warn("Escalação indisponível — mantendo Ferrari estática.", e);
  });
})();
