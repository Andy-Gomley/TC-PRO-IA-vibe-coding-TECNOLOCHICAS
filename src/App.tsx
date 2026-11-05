import { useEffect, useMemo, useState } from 'react';
import {
  AlarmClock,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Cookie,
  ExternalLink,
  FileDown,
  FileText,
  Flame,
  Github,
  Globe2,
  HelpCircle,
  LayoutDashboard,
  Linkedin,
  LogIn,
  Menu,
  MessageCircle,
  Moon,
  MoreHorizontal,
  Palette,
  Play,
  Plus,
  Search,
  Settings2,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Trash2,
  TrendingUp,
  Upload,
  UserPlus,
  X,
  Zap,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type ThemeName = 'sage' | 'sand' | 'sky' | 'lilac';
type ViewName = 'overview' | 'plan' | 'skills' | 'vacancies' | 'challenges' | 'cv' | 'notes' | 'settings' | 'profile';
type AuthMode = 'login' | 'signup';

type Profile = {
  display_name: string;
  target_role: string;
  target_industry: string;
  theme: ThemeName;
  progress: number;
};

const defaultProfile: Profile = {
  display_name: 'Sofía',
  target_role: 'Analista de datos junior',
  target_industry: 'Tecnología',
  theme: 'sage',
  progress: 68,
};

const weeklyMinutes = [42, 58, 35, 72, 54, 46, 68];
const weekLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Hoy'];

function App() {
  const [view, setView] = useState<ViewName>('overview');
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [theme, setTheme] = useState<ThemeName>('sage');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [completedLesson, setCompletedLesson] = useState(false);
  const [activePlan, setActivePlan] = useState('Fundamentos de SQL');
  const [showPlanner, setShowPlanner] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted && data.session) setIsAuthenticated(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setIsAuthenticated(Boolean(session));
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    supabase.from('learning_profiles').select('display_name, target_role, target_industry, theme, progress').maybeSingle().then(({ data }) => {
      if (data) {
        setProfile(data as Profile);
        setTheme(data.theme as ThemeName);
      }
    });
  }, [isAuthenticated]);

  const averageMinutes = useMemo(() => Math.round(weeklyMinutes.reduce((sum, minutes) => sum + minutes, 0) / weeklyMinutes.length), []);

  const saveProfile = async (nextProfile: Profile) => {
    setProfile(nextProfile);
    setTheme(nextProfile.theme);
    if (isAuthenticated) {
      await supabase.from('learning_profiles').upsert({ ...nextProfile, user_id: undefined }, { onConflict: 'user_id' });
    }
  };

  const submitAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoadingAuth(true);
    setAuthMessage('');
    if (authMode === 'signup' && !legalAccepted) {
      setAuthMessage('Acepta el aviso de privacidad y los términos para continuar.');
      setLoadingAuth(false);
      return;
    }
    const result = authMode === 'signup'
      ? await supabase.auth.signUp({ email: authEmail, password: authPassword, options: { data: { display_name: authName || 'Estudiante' } } })
      : await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    setLoadingAuth(false);
    if (result.error) {
      setAuthMessage('No pudimos acceder con esos datos. Revisa tu correo y contraseña.');
      return;
    }
    if (authMode === 'signup' && result.data.user) {
      await supabase.from('learning_profiles').upsert({ display_name: authName || 'Estudiante', user_id: result.data.user.id }, { onConflict: 'user_id' });
      setAuthMessage('Tu cuenta está lista. Ya puedes empezar tu ruta.');
    }
    if (authMode === 'login') setAuthMode(null);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  const navigate = (nextView: ViewName) => {
    setView(nextView);
    setIsSidebarOpen(false);
  };

  return (
    <div className={`app-shell theme-${theme}`}>
      <aside className={`sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Sparkles size={18} strokeWidth={2.5} /></div>
          <span>Clara<span className="brand-dot">.</span></span>
        </div>
        <div className="sidebar-label">Tu espacio</div>
        <nav className="main-nav" aria-label="Navegación principal">
          <NavItem icon={<LayoutDashboard size={19} />} label="Resumen" active={view === 'overview'} onClick={() => navigate('overview')} />
          <NavItem icon={<Target size={19} />} label="Mi ruta" active={view === 'plan'} onClick={() => navigate('plan')} badge="3" />
          <NavItem icon={<BarChart3 size={19} />} label="Habilidades" active={view === 'skills'} onClick={() => navigate('skills')} />
        </nav>
        <div className="sidebar-label second-label">Acompañamiento</div>
        <nav className="main-nav">
          <NavItem icon={<MessageCircle size={19} />} label="Mentor Clara" onClick={() => setAuthMessage('Tu mentora estará disponible en la próxima lección.')} />
          <NavItem icon={<BriefcaseBusiness size={19} />} label="Vacantes" active={view === 'vacancies'} onClick={() => navigate('vacancies')} badge="4" />
          <NavItem icon={<Trophy size={19} />} label="Retos" active={view === 'challenges'} onClick={() => navigate('challenges')} />
          <NavItem icon={<FileText size={19} />} label="Mi CV" active={view === 'cv'} onClick={() => navigate('cv')} />
          <NavItem icon={<BookOpen size={19} />} label="Mis notas" active={view === 'notes'} onClick={() => navigate('notes')} />
          <NavItem icon={<Settings2 size={19} />} label="Configuración" active={view === 'settings'} onClick={() => navigate('settings')} />
          <NavItem icon={<Settings2 size={19} />} label="Mi perfil" active={view === 'profile'} onClick={() => navigate('profile')} />
        </nav>
        <div className="sidebar-bottom">
          <div className="streak-card">
            <div className="streak-icon"><Flame size={17} /></div>
            <div><strong>4 días seguidos</strong><span>¡Vas muy bien!</span></div>
          </div>
          <button className="profile-mini" onClick={() => navigate('profile')}>
            <span className="avatar">{profile.display_name.slice(0, 1)}</span>
            <span className="profile-mini-copy"><strong>{profile.display_name}</strong><small>{isAuthenticated ? 'Cuenta activa' : 'Vista de prueba'}</small></span>
            <MoreHorizontal size={17} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Abrir menú"><Menu size={22} /></button>
          <div className="breadcrumb"><span>Mi espacio</span><span className="slash">/</span><strong>{view === 'overview' ? 'Resumen' : view === 'plan' ? 'Mi ruta' : view === 'skills' ? 'Habilidades' : view === 'vacancies' ? 'Vacantes' : view === 'challenges' ? 'Retos' : view === 'cv' ? 'Mi CV' : view === 'notes' ? 'Mis notas' : view === 'settings' ? 'Configuración' : 'Mi perfil'}</strong></div>
          <div className="topbar-actions">
            <button className="icon-button" aria-label="Buscar"><Search size={18} /></button>
            <button className="theme-toggle" onClick={() => setShowThemePicker(!showThemePicker)}><Palette size={17} /><span>Estilo</span><ChevronDown size={15} /></button>
            {!isAuthenticated ? <button className="login-button" onClick={() => setAuthMode('login')}><LogIn size={16} /> Entrar</button> : <button className="logout-button" onClick={signOut}>Salir</button>}
            {showThemePicker && <ThemePicker theme={theme} onChange={(nextTheme) => { setShowThemePicker(false); void saveProfile({ ...profile, theme: nextTheme }); }} />}
          </div>
        </header>

        <div className="page-wrap">
          {view === 'overview' && <Overview profile={profile} averageMinutes={averageMinutes} completedLesson={completedLesson} onContinue={() => { setActivePlan('Fundamentos de SQL'); navigate('plan'); }} onComplete={() => setCompletedLesson(true)} onCreateAccount={() => setAuthMode('signup')} />}
          {view === 'plan' && <StudyPlan activePlan={activePlan} setActivePlan={setActivePlan} completedLesson={completedLesson} onComplete={() => setCompletedLesson(true)} onOpenPlanner={() => setShowPlanner(true)} />}
          {view === 'skills' && <SkillsView />}
          {view === 'vacancies' && <VacanciesView />}
          {view === 'challenges' && <ChallengesView />}
          {view === 'cv' && <CvView />}
          {view === 'notes' && <NotesView isAuthenticated={isAuthenticated} onCreateAccount={() => setAuthMode('signup')} />}
          {view === 'settings' && <SettingsView isAuthenticated={isAuthenticated} onDeleteAccount={() => setAuthMessage('Para proteger tu cuenta, la eliminación se procesa mediante una solicitud de confirmación.')} />}
          {view === 'profile' && <ProfileView profile={profile} onSave={saveProfile} isAuthenticated={isAuthenticated} onCreateAccount={() => setAuthMode('signup')} />}
        </div>
      </main>

      {authMode && <AuthModal mode={authMode} setMode={setAuthMode} email={authEmail} setEmail={setAuthEmail} password={authPassword} setPassword={setAuthPassword} name={authName} setName={setAuthName} message={authMessage} loading={loadingAuth} legalAccepted={legalAccepted} setLegalAccepted={setLegalAccepted} onSubmit={submitAuth} />}
      <button className="help-fab" onClick={() => setShowHelp(true)} aria-label="Pedir ayuda"><HelpCircle size={19} /><span>Ayuda</span></button>
      {showPlanner && <PlannerModal onClose={() => setShowPlanner(false)} isAuthenticated={isAuthenticated} />}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}

function NavItem({ icon, label, active = false, badge, onClick }: { icon: React.ReactNode; label: string; active?: boolean; badge?: string; onClick: () => void }) {
  return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}><span className="nav-icon">{icon}</span><span>{label}</span>{badge && <b>{badge}</b>}</button>;
}

function Overview({ profile, averageMinutes, completedLesson, onContinue, onComplete, onCreateAccount }: { profile: Profile; averageMinutes: number; completedLesson: boolean; onContinue: () => void; onComplete: () => void; onCreateAccount: () => void }) {
  return <>
    <section className="welcome-row"><div><p className="eyebrow">MARTES, 24 DE SEPTIEMBRE</p><h1>Hola, {profile.display_name}<span className="heading-dot">.</span></h1><p className="welcome-copy">Un paso pequeño hoy construye la carrera que imaginas.</p></div><button className="secondary-button" onClick={onCreateAccount}><UserPlus size={17} /> Guardar mi progreso</button></section>
    <section className="hero-card">
      <div className="hero-copy"><div className="pill"><span className="pulse-dot" /> Tu siguiente paso</div><h2>Conoce tus fortalezas.<br /><em>Impulsa tu futuro.</em></h2><p>Completa una lección de tu ruta personalizada y acércate al trabajo que quieres.</p><button className="primary-button" onClick={onContinue}>Continuar mi ruta <ArrowRight size={17} /></button></div>
      <div className="hero-illustration" aria-hidden="true"><div className="sun-orb" /><div className="plant plant-one" /><div className="plant plant-two" /><div className="person-shape"><div className="head" /><div className="body" /><div className="laptop"><span /></div></div><div className="desk-line" /><div className="floating-note note-one"><Sparkles size={16} /></div><div className="floating-note note-two"><Brain size={17} /></div></div>
    </section>
    <section className="stats-grid"><StatCard icon={<TrendingUp size={20} />} label="Progreso de ruta" value={`${profile.progress}%`} detail="+8% esta semana" tone="green" progress={profile.progress} /><StatCard icon={<Clock3 size={20} />} label="Tiempo de estudio" value={`${averageMinutes} min`} detail="promedio diario" tone="blue" chart={weeklyMinutes} /><StatCard icon={<Zap size={20} />} label="Racha actual" value="4 días" detail="Tu mejor racha: 9 días" tone="gold" /></section>
    <section className="content-grid"><div className="section-card chart-card"><div className="card-heading"><div><p className="card-kicker">CONSTANCIA</p><h3>Tu tiempo de estudio</h3></div><button className="select-button">Esta semana <ChevronDown size={14} /></button></div><div className="bar-chart">{weeklyMinutes.map((minutes, index) => <div className="bar-col" key={weekLabels[index]}><span className="bar-value">{minutes}</span><div className={`bar ${index === 6 ? 'today' : ''}`} style={{ height: `${Math.max(16, minutes * 1.05)}px` }} /><span className={`bar-label ${index === 6 ? 'today-label' : ''}`}>{weekLabels[index]}</span></div>)}</div></div><div className="section-card lesson-card"><div className="card-heading"><div><p className="card-kicker">PARA HOY</p><h3>Tu próxima lección</h3></div><button className="more-button"><MoreHorizontal size={19} /></button></div><div className="lesson-icon"><BookOpen size={21} /></div><h4>Fundamentos de SQL</h4><p>Aprende a consultar y organizar datos para tomar mejores decisiones.</p><div className="lesson-meta"><span><Clock3 size={14} /> 25 min</span><span><Brain size={14} /> Intermedio</span></div><button className={`lesson-button ${completedLesson ? 'done' : ''}`} onClick={onComplete}>{completedLesson ? <><Check size={16} /> Lección completada</> : <><Play size={15} fill="currentColor" /> Comenzar lección</>}</button></div></section>
    <section className="bottom-grid"><div className="section-card skills-summary"><div className="card-heading"><div><p className="card-kicker">TU EVOLUCIÓN</p><h3>Habilidades en desarrollo</h3></div><button className="text-button">Ver todas <ArrowRight size={14} /></button></div><SkillRow label="SQL y bases de datos" value={78} color="teal" /><SkillRow label="Visualización de datos" value={54} color="blue" /><SkillRow label="Comunicación profesional" value={42} color="gold" /></div><div className="quote-card"><div className="quote-mark">“</div><p>El progreso no tiene que ser perfecto, solo tiene que ser constante.</p><span>— Tu recordatorio de hoy</span><div className="quote-spark"><Sparkles size={17} /></div></div></section>
  </>;
}

function StatCard({ icon, label, value, detail, tone, progress, chart }: { icon: React.ReactNode; label: string; value: string; detail: string; tone: string; progress?: number; chart?: number[] }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><strong className="stat-value">{value}</strong><div className="stat-detail">{progress ? <span className="mini-progress"><span style={{ width: `${progress}%` }} /></span> : chart ? <span className="mini-bars">{chart.slice(-5).map((item) => <i key={item} style={{ height: `${item / 4}px` }} />)}</span> : <span className="fire-dot"><Flame size={12} /></span>} {detail}</div></div>;
}

function SkillRow({ label, value, color }: { label: string; value: number; color: string }) { return <div className="skill-row"><div className="skill-row-head"><span>{label}</span><strong>{value}%</strong></div><div className="skill-track"><span className={color} style={{ width: `${value}%` }} /></div></div>; }

function StudyPlan({ activePlan, setActivePlan, completedLesson, onComplete, onOpenPlanner }: { activePlan: string; setActivePlan: (value: string) => void; completedLesson: boolean; onComplete: () => void; onOpenPlanner: () => void }) {
  const lessons = [{ title: 'Fundamentos de SQL', meta: '4 lecciones · 1h 40m', progress: completedLesson ? 100 : 78, active: true }, { title: 'Visualización de datos', meta: '5 lecciones · 2h 15m', progress: 54 }, { title: 'Comunicación profesional', meta: '3 lecciones · 1h 20m', progress: 42 }];
  return <><section className="welcome-row compact"><div><p className="eyebrow">RUTA PERSONALIZADA</p><h1>Tu plan de estudio<span className="heading-dot">.</span></h1><p className="welcome-copy">Diseñado para acercarte a tu próximo rol: <strong>Analista de datos junior.</strong></p></div><div className="plan-actions"><button className="secondary-button" onClick={onOpenPlanner}><CalendarDays size={17} /> Diseñar mi plan</button><button className="secondary-button"><Sparkles size={17} /> Ajustar con IA</button></div></section><div className="plan-layout"><div className="section-card plan-list"><div className="card-heading"><div><p className="card-kicker">PRÓXIMOS TEMAS</p><h3>Tu camino recomendado</h3></div><span className="plan-count">3 temas</span></div>{lessons.map((lesson, index) => <button key={lesson.title} className={`plan-item ${activePlan === lesson.title ? 'selected' : ''}`} onClick={() => setActivePlan(lesson.title)}><span className={`plan-number ${lesson.progress === 100 ? 'complete' : ''}`}>{lesson.progress === 100 ? <Check size={15} /> : `0${index + 1}`}</span><span className="plan-item-copy"><strong>{lesson.title}</strong><small>{lesson.meta}</small><span className="item-progress"><i style={{ width: `${lesson.progress}%` }} /></span></span><span className="plan-percent">{lesson.progress}%</span></button>)}</div><div className="section-card lesson-detail"><div className="detail-top"><span className="pill soft">TEMA 01 · EN PROGRESO</span><span className="detail-time"><Clock3 size={14} /> 25 min</span></div><h2>{activePlan}</h2><p>Domina las consultas esenciales para trabajar con datos reales y tomar decisiones con confianza.</p><div className="outcomes"><span><Check size={15} /> SELECT y filtros</span><span><Check size={15} /> Ordenar y agrupar</span><span><Check size={15} /> Consultas prácticas</span></div><div className="study-choice"><div className="choice-icon"><BookOpen size={19} /></div><div><strong>Elige cómo aprender</strong><p>Combina tus propios materiales con una explicación clara de Clara.</p></div></div><div className="choice-buttons"><button className="outline-button"><Upload size={16} /> Subir material</button><button className="primary-button" onClick={onComplete}><Sparkles size={16} /> Aprender con Clara</button></div><div className="motivation"><Sparkles size={16} /><span><strong>Un avance a la vez.</strong> Hoy solo necesitas empezar.</span></div></div></div></>;
}

function SkillsView() { return <><section className="welcome-row compact"><div><p className="eyebrow">MAPA DE HABILIDADES</p><h1>Lo que ya sabes<span className="heading-dot">.</span></h1><p className="welcome-copy">Tu perfil se vuelve más fuerte con cada práctica.</p></div><button className="primary-button"><Plus size={17} /> Añadir habilidad</button></section><div className="skills-hero section-card"><div className="skills-score"><div className="score-ring"><strong>68</strong><span>/100</span></div><div><p className="card-kicker">NIVEL DE PREPARACIÓN</p><h2>Buen punto de partida</h2><p>Te faltan algunos pasos para sentirte listo para tu objetivo.</p></div></div><div className="skills-note"><Brain size={20} /><span>Clara identificó <strong>3 fortalezas</strong> y <strong>2 áreas de oportunidad</strong>.</span></div></div><div className="skills-cards"><div className="section-card"><div className="card-heading"><div><p className="card-kicker">FORTALEZAS</p><h3>Ya tienes ventaja</h3></div></div><SkillTag label="Pensamiento analítico" level="Avanzado" color="teal" /><SkillTag label="Trabajo en equipo" level="Avanzado" color="blue" /><SkillTag label="Excel" level="Intermedio" color="gold" /></div><div className="section-card"><div className="card-heading"><div><p className="card-kicker">PARA REFORZAR</p><h3>Tu siguiente oportunidad</h3></div></div><SkillTag label="SQL y bases de datos" level="En progreso" color="coral" /><SkillTag label="Presentación de hallazgos" level="Por comenzar" color="sand" /><SkillTag label="Inglés profesional" level="Por comenzar" color="lavender" /></div></div></>; }

function SkillTag({ label, level, color }: { label: string; level: string; color: string }) { return <div className="skill-tag"><span className={`tag-dot ${color}`} /><strong>{label}</strong><span>{level}</span><ArrowRight size={14} /></div>; }

function ProfileView({ profile, onSave, isAuthenticated, onCreateAccount }: { profile: Profile; onSave: (profile: Profile) => Promise<void>; isAuthenticated: boolean; onCreateAccount: () => void }) { const [draft, setDraft] = useState(profile); return <><section className="welcome-row compact"><div><p className="eyebrow">PERSONALIZA TU EXPERIENCIA</p><h1>Tu perfil<span className="heading-dot">.</span></h1><p className="welcome-copy">Ajusta tu ruta para que Clara te acompañe mejor.</p></div></section><div className="profile-layout"><div className="section-card profile-form"><div className="profile-header"><span className="large-avatar">{draft.display_name.slice(0, 1)}</span><div><h2>{draft.display_name}</h2><p>{isAuthenticated ? 'Tu información se guarda de forma segura.' : 'Estás explorando una vista de prueba.'}</p></div></div><label>¿Cómo te llamas?<input value={draft.display_name} onChange={(event) => setDraft({ ...draft, display_name: event.target.value })} /></label><label>¿Qué puesto te interesa?<select value={draft.target_role} onChange={(event) => setDraft({ ...draft, target_role: event.target.value })}><option>Analista de datos junior</option><option>Especialista de marketing</option><option>Coordinador de proyectos</option><option>Investigador junior</option></select></label><label>¿En qué industria te gustaría trabajar?<select value={draft.target_industry} onChange={(event) => setDraft({ ...draft, target_industry: event.target.value })}><option>Tecnología</option><option>Finanzas</option><option>Seguros</option><option>Hotelería</option><option>Educación</option><option>Investigación</option></select></label><button className="primary-button save-profile" onClick={() => void onSave(draft)}><Check size={16} /> Guardar cambios</button>{!isAuthenticated && <button className="create-link" onClick={onCreateAccount}>Crea una cuenta para guardar tu recorrido <ArrowRight size={14} /></button>}</div><div className="section-card preference-card"><div className="card-heading"><div><p className="card-kicker">PREFERENCIAS</p><h3>Elige tu ambiente</h3></div><Moon size={19} /></div><p>Un estilo que se sienta como tú hace más fácil volver cada día.</p><ThemeOptions theme={draft.theme} onChange={(nextTheme) => setDraft({ ...draft, theme: nextTheme })} /></div></div></>; }

function ThemePicker({ theme, onChange }: { theme: ThemeName; onChange: (theme: ThemeName) => void }) { return <div className="theme-popover"><span>Elige un estilo</span><ThemeOptions theme={theme} onChange={onChange} compact /></div>; }
function ThemeOptions({ theme, onChange, compact = false }: { theme: ThemeName; onChange: (theme: ThemeName) => void; compact?: boolean }) { const options: { id: ThemeName; label: string; color: string }[] = [{ id: 'sage', label: 'Calma', color: '#abc9bd' }, { id: 'sand', label: 'Arena', color: '#e8c6a1' }, { id: 'sky', label: 'Cielo', color: '#a9c8dc' }, { id: 'lilac', label: 'Lila', color: '#c5b6d9' }]; return <div className={`theme-options ${compact ? 'compact' : ''}`}>{options.map((option) => <button key={option.id} className={theme === option.id ? 'chosen' : ''} onClick={() => onChange(option.id)}><span style={{ background: option.color }} />{!compact && <small>{option.label}</small>}{theme === option.id && <Check size={13} />}</button>)}</div>; }

const vacancyItems = [
  { title: 'Junior Data Analyst', company: 'AWISEE · Remoto en México', detail: 'Analiza métricas de negocio y crea reportes para equipos internacionales.', source: 'Remote Rocketship', url: 'https://www.remoterocketship.com/country/mexico/jobs/data-analyst', tag: 'Remoto' },
  { title: 'Data Analyst — Entry Level', company: 'Robert Half · Estados Unidos', detail: 'Identifica hallazgos en datasets y recomienda soluciones prácticas.', source: 'Robert Half', url: 'https://www.roberthalf.com/us/en/jobs/all/entry-level-data-analyst', tag: 'Junior' },
  { title: 'Data Analyst', company: 'NTT DATA · Oportunidades globales', detail: 'Crece en equipos de tecnología con mentoría y proyectos reales.', source: 'NTT DATA Careers', url: 'https://careers.nttdata.com', tag: 'Tecnología' },
  { title: 'Data Analyst Jobs', company: 'Built In · Ciudad de México', detail: 'Explora posiciones de análisis, BI y ciencia de datos en startups y empresas.', source: 'Built In', url: 'https://builtin.com/jobs/na/mexico/mexico-city/data-analytics/search/data-analyst', tag: 'CDMX' },
];

function VacanciesView() {
  return <><section className="welcome-row compact"><div><p className="eyebrow">OPORTUNIDADES PARA TI</p><h1>Vacantes que encajan<span className="heading-dot">.</span></h1><p className="welcome-copy">Revisa oportunidades relacionadas con tu ruta y postúlate desde la fuente original.</p></div><button className="secondary-button"><Search size={17} /> Actualizar búsqueda</button></section><div className="opportunity-banner"><div className="opportunity-icon"><BriefcaseBusiness size={22} /></div><div><strong>4 oportunidades seleccionadas</strong><p>Basadas en tu interés por análisis de datos y tus habilidades en desarrollo.</p></div><span className="live-badge"><span /> Actualizado hoy</span></div><div className="vacancy-grid">{vacancyItems.map((item) => <article className="section-card vacancy-card" key={item.title}><div className="vacancy-top"><span className="vacancy-tag">{item.tag}</span><button className="save-opportunity" aria-label="Guardar vacante"><Check size={15} /></button></div><h3>{item.title}</h3><strong className="vacancy-company">{item.company}</strong><p>{item.detail}</p><div className="vacancy-footer"><span>{item.source}</span><a href={item.url} target="_blank" rel="noreferrer">Ver vacante <ExternalLink size={13} /></a></div></article>)}</div></>;
}

function ChallengesView() {
  const [challengeType, setChallengeType] = useState<'ai' | 'real'>('ai');
  const aiChallenges = [{ title: 'Limpia el reporte de ventas', detail: 'Detecta valores duplicados, normaliza categorías y entrega tres hallazgos accionables.', time: '72 horas', level: 'Intermedio', reward: 'Simulación de entrevista' }, { title: 'Explica una caída en conversión', detail: 'Analiza un funnel y prepara una recomendación para el equipo de producto.', time: '90 minutos', level: 'Junior', reward: 'Caso de trabajo' }];
  const realChallenges = [{ title: 'Kaggle Competitions', detail: 'Explora competencias activas de datos, ciencia y machine learning con datasets reales.', source: 'Kaggle', url: 'https://www.kaggle.com/competitions' }, { title: 'EY AI & Data Challenge', detail: 'Reto global sobre datos, IA y acceso a agua limpia; conoce el caso y sus etapas.', source: 'EY', url: 'https://www.ey.com/en_gl/careers/data-science-challenge' }, { title: 'AI + Science Hackathon', detail: 'Desafíos científicos aplicados con IA organizados por la Universidad de Chicago.', source: 'University of Chicago DSI', url: 'https://datascience.uchicago.edu/news/2026-ai-science-hackathon-tackles-real-world-scientific-challenges-using-ai' }];
  const challenges = challengeType === 'ai' ? aiChallenges.map((challenge) => ({ ...challenge, source: '', url: '' })) : realChallenges.map((challenge) => ({ ...challenge, time: '', level: '', reward: '' }));
  return <><section className="welcome-row compact"><div><p className="eyebrow">PONTE A PRUEBA</p><h1>Retos para crecer<span className="heading-dot">.</span></h1><p className="welcome-copy">Practica con situaciones que se parecen a una entrevista o a un proyecto real.</p></div><button className="primary-button"><Plus size={17} /> Proponer un reto</button></section><div className="challenge-switch"><button className={challengeType === 'ai' ? 'active' : ''} onClick={() => setChallengeType('ai')}><Sparkles size={17} /><span><strong>Retos con IA</strong><small>Simula una prueba de trabajo</small></span></button><button className={challengeType === 'real' ? 'active' : ''} onClick={() => setChallengeType('real')}><Trophy size={17} /><span><strong>Retos reales</strong><small>Convocatorias y hackathons</small></span></button></div><div className="challenge-grid">{challenges.map((challenge) => <article className="section-card challenge-card" key={challenge.title}><div className="challenge-icon">{challengeType === 'ai' ? <Sparkles size={19} /> : <Trophy size={19} />}</div><div className="challenge-card-top"><span className="challenge-kind">{challengeType === 'ai' ? 'GENERADO PARA TI' : challenge.source}</span>{challengeType === 'ai' && <span className="challenge-time"><Clock3 size={13} /> {challenge.time}</span>}</div><h3>{challenge.title}</h3><p>{challenge.detail}</p>{challengeType === 'ai' ? <div className="challenge-meta"><span>{challenge.level}</span><span>{challenge.reward}</span><button className="start-challenge">Comenzar <ArrowRight size={14} /></button></div> : <a className="challenge-link" href={challenge.url} target="_blank" rel="noreferrer">Ver convocatoria <ExternalLink size={14} /></a>}</article>)}</div><div className="feedback-strip"><Brain size={18} /><span>Cuando termines un reto con IA, Clara revisará tu trabajo, te dará una calificación y una retroalimentación concreta para mejorar.</span></div></>;
}

function PlannerModal({ onClose, isAuthenticated }: { onClose: () => void; isAuthenticated: boolean }) {
  const [days, setDays] = useState<string[]>(['Lun', 'Mié', 'Vie']);
  const [time, setTime] = useState('18:00');
  const [duration, setDuration] = useState('45');
  const [saved, setSaved] = useState(false);
  const [topics, setTopics] = useState<string[]>(['Fundamentos de SQL']);
  const availableDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const availableTopics = ['Fundamentos de SQL', 'Visualización de datos', 'Comunicación profesional'];
  const toggle = (value: string, values: string[], update: (next: string[]) => void) => update(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  const savePlan = async () => {
    if (isAuthenticated) await supabase.from('study_plans').upsert({ selected_days: days, start_time: time, duration_minutes: Number(duration), topics }, { onConflict: 'user_id' });
    setSaved(true);
  };
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="planner-modal"><button className="modal-close" onClick={onClose} aria-label="Cerrar"><X size={18} /></button><div className="planner-heading"><div className="planner-icon"><CalendarDays size={20} /></div><div><p className="eyebrow">PLANIFICADOR SEMANAL</p><h2>Diseña tu plan</h2><p>Elige los momentos que sí caben en tu semana.</p></div></div><div className="planner-section"><label>¿Qué días quieres estudiar?</label><div className="day-picker">{availableDays.map((day) => <button key={day} className={days.includes(day) ? 'selected' : ''} onClick={() => toggle(day, days, setDays)}>{day}</button>)}</div></div><div className="planner-fields"><label>Hora de inicio<input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label><label>Duración<select value={duration} onChange={(event) => setDuration(event.target.value)}><option value="30">30 minutos</option><option value="45">45 minutos</option><option value="60">1 hora</option><option value="90">1 hora 30 minutos</option></select></label></div><div className="planner-section"><label>Temas para tu sesión</label><div className="topic-picker">{availableTopics.map((topic) => <button key={topic} className={topics.includes(topic) ? 'selected' : ''} onClick={() => toggle(topic, topics, setTopics)}><span>{topics.includes(topic) ? <Check size={13} /> : <Plus size={13} />}</span>{topic}</button>)}</div></div><div className="planner-preview"><CalendarDays size={17} /><span>Cada <strong>{days.length ? days.join(', ') : 'día que elijas'}</strong> a las <strong>{time}</strong> durante <strong>{duration} minutos</strong>.</span></div><button className="primary-button planner-save" onClick={() => void savePlan}>{saved ? <><Check size={16} /> Plan guardado</> : <><CalendarDays size={16} /> Guardar mi horario</>}</button></div></div>;
}

function CvView() {
  const [translated, setTranslated] = useState(false);
  const [sections, setSections] = useState({ summary: false, experience: false, education: false, skills: false });
  const toggleSection = (key: keyof typeof sections) => setSections({ ...sections, [key]: !sections[key] });
  const cvSection = (key: keyof typeof sections, label: string, content: React.ReactNode) => <div className="cv-section"><div className="cv-section-heading"><h3>{translated ? ({ summary: 'PROFILE', experience: 'EXPERIENCE', education: 'EDUCATION', skills: 'SKILLS' }[key]) : label}</h3><button onClick={() => toggleSection(key)} aria-label={`Agregar ${label}`}><Plus size={16} /></button></div>{sections[key] ? <div className="cv-filled">{content}</div> : <button className="cv-empty" onClick={() => toggleSection(key)}>+ Agregar información</button>}</div>;
  return <><section className="welcome-row compact"><div><p className="eyebrow">TU PRESENTACIÓN PROFESIONAL</p><h1>Mi CV<span className="heading-dot">.</span></h1><p className="welcome-copy">Construye un CV claro, enfocado en logros y listo para compartir.</p></div><div className="cv-actions"><button className="secondary-button" onClick={() => setTranslated(!translated)}><Globe2 size={16} /> {translated ? 'Ver en español' : 'Traducir a inglés'}</button><button className="primary-button"><Share2 size={16} /> Compartir CV</button></div></section><div className="cv-layout"><div className="cv-paper"><div className="cv-name-block"><h2>{translated ? 'SOFÍA MARTÍNEZ' : 'SOFÍA MARTÍNEZ'}</h2><p>{translated ? 'Junior Data Analyst · Mexico City' : 'Analista de datos junior · Ciudad de México'}</p><span>sofia.martinez@email.com · linkedin.com/in/sofia-martinez</span></div>{cvSection('summary', translated ? 'PERFIL' : 'PERFIL PROFESIONAL', translated ? 'Junior data analyst focused on turning information into clear decisions.' : 'Analista junior enfocada en convertir información en decisiones claras.')}{cvSection('experience', translated ? 'EXPERIENCE' : 'EXPERIENCIA', translated ? 'Add your most relevant project, role, and measurable outcome.' : 'Agrega tu proyecto, puesto y resultado medible más relevante.')}{cvSection('education', translated ? 'EDUCATION' : 'EDUCACIÓN', translated ? 'Add your degree, institution, and graduation year.' : 'Agrega tu carrera, institución y año de egreso.')}{cvSection('skills', translated ? 'SKILLS' : 'HABILIDADES', translated ? 'SQL · Excel · Data visualization · Communication' : 'SQL · Excel · Visualización de datos · Comunicación')}</div><div className="cv-side-panel section-card"><div className="cv-side-icon"><FileText size={20} /></div><p className="card-kicker">FORMATO HARVARD</p><h3>Simple, claro y fácil de leer.</h3><p>La plantilla prioriza resultados y habilidades para que los reclutadores encuentren lo importante rápidamente.</p><div className="share-preview"><div className="share-preview-head"><Share2 size={15} /><strong>Perfil compartible</strong></div><p>Comparte tu progreso, retos y habilidades con reclutadores.</p><div className="share-buttons"><button><Linkedin size={15} /> LinkedIn</button><button><Github size={15} /> GitHub</button></div></div></div></div></>;
}

type Note = { id: string; title: string; body: string; lesson: string; updated_at: string };

function NotesView({ isAuthenticated, onCreateAccount }: { isAuthenticated: boolean; onCreateAccount: () => void }) {
  const [notes, setNotes] = useState<Note[]>([{ id: 'demo-1', title: 'Preguntas para repasar', body: 'Recordar la diferencia entre WHERE y HAVING. Practicar con el dataset de ventas.', lesson: 'Fundamentos de SQL', updated_at: 'Hoy' }]);
  const [activeNote, setActiveNote] = useState<Note>(notes[0]);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!isAuthenticated) return;
    supabase.from('study_notes').select('id, title, body, lesson, updated_at').order('updated_at', { ascending: false }).then(({ data }) => {
      if (data?.length) {
        const loaded = data as Note[];
        setNotes(loaded);
        setActiveNote(loaded[0]);
      }
    });
  }, [isAuthenticated]);
  const updateActive = (key: 'title' | 'body', value: string) => setActiveNote({ ...activeNote, [key]: value });
  const saveNote = async () => {
    if (isAuthenticated) {
      const { data } = await supabase.from('study_notes').upsert({ id: activeNote.id.startsWith('demo-') ? undefined : activeNote.id, title: activeNote.title, body: activeNote.body, lesson: activeNote.lesson }, { onConflict: 'id' }).select('id, title, body, lesson, updated_at').maybeSingle();
      if (data) setActiveNote(data as Note);
    }
    setNotes((current) => current.some((note) => note.id === activeNote.id) ? current.map((note) => note.id === activeNote.id ? activeNote : note) : [activeNote, ...current]);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };
  const createNote = () => { const next = { id: `note-${Date.now()}`, title: 'Nueva nota', body: '', lesson: 'Fundamentos de SQL', updated_at: 'Ahora' }; setNotes([next, ...notes]); setActiveNote(next); };
  return <><section className="welcome-row compact"><div><p className="eyebrow">APUNTES DE APRENDIZAJE</p><h1>Mis notas<span className="heading-dot">.</span></h1><p className="welcome-copy">Guarda ideas, dudas y ejemplos para volver a ellos cuando lo necesites.</p></div><div className="notes-actions"><button className="secondary-button" onClick={() => window.print()}><FileDown size={16} /> Descargar PDF</button><button className="primary-button" onClick={createNote}><Plus size={16} /> Nueva nota</button></div></section><div className="notes-layout"><div className="section-card notes-list"><div className="card-heading"><div><p className="card-kicker">ARCHIVO</p><h3>{notes.length} notas guardadas</h3></div><BookOpen size={18} /></div>{notes.map((note) => <button key={note.id} className={`note-list-item ${activeNote.id === note.id ? 'active' : ''}`} onClick={() => setActiveNote(note)}><span className="note-dot" /><span><strong>{note.title || 'Sin título'}</strong><small>{note.lesson} · {note.updated_at}</small></span></button>)}{!isAuthenticated && <button className="create-link" onClick={onCreateAccount}>Crea una cuenta para conservar tus notas <ArrowRight size={14} /></button>}</div><div className="section-card note-editor"><div className="note-editor-head"><span className="note-lesson"><BookOpen size={14} /> {activeNote.lesson}</span><button className="more-button"><MoreHorizontal size={18} /></button></div><input className="note-title-input" value={activeNote.title} onChange={(event) => updateActive('title', event.target.value)} /><textarea className="note-body-input" value={activeNote.body} onChange={(event) => updateActive('body', event.target.value)} placeholder="Escribe tus ideas, ejemplos o preguntas..." /><div className="note-editor-footer"><span>{saved ? <><Check size={14} /> Guardado</> : 'Tus notas son privadas'}</span><button className="primary-button" onClick={() => void saveNote}><Check size={15} /> Guardar nota</button></div></div></div></>;
}

function SettingsView({ isAuthenticated, onDeleteAccount }: { isAuthenticated: boolean; onDeleteAccount: () => void }) {
  const [reminders, setReminders] = useState(true);
  const [reminderTime, setReminderTime] = useState('18:00');
  const [cookies, setCookies] = useState(true);
  const [saved, setSaved] = useState(false);
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const savePreferences = async () => {
    if (isAuthenticated) await supabase.from('user_preferences').upsert({ reminders_enabled: reminders, reminder_time: reminderTime, cookie_consent: cookies }, { onConflict: 'user_id' });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };
  return <><section className="welcome-row compact"><div><p className="eyebrow">CONTROL Y PRIVACIDAD</p><h1>Configuración<span className="heading-dot">.</span></h1><p className="welcome-copy">Decide cómo quieres estudiar y qué información compartir.</p></div><button className="primary-button" onClick={() => void savePreferences}>{saved ? <><Check size={16} /> Guardado</> : <><Check size={16} /> Guardar cambios</>}</button></section><div className="settings-layout"><div className="section-card settings-card"><div className="card-heading"><div><p className="card-kicker">RECORDATORIOS</p><h3>Tu ritmo, sin perder la racha</h3></div><Bell size={19} /></div><div className="setting-row"><div className="setting-icon"><AlarmClock size={18} /></div><div><strong>Recordarme estudiar</strong><p>Recibe un aviso para no dejar pasar tu lección.</p></div><button className={`toggle ${reminders ? 'on' : ''}`} onClick={() => setReminders(!reminders)} aria-label="Activar recordatorios"><span /></button></div><div className="reminder-time"><label>Hora del recordatorio<input type="time" value={reminderTime} disabled={!reminders} onChange={(event) => setReminderTime(event.target.value)} /></label><span>De lunes a viernes</span></div></div><div className="section-card settings-card"><div className="card-heading"><div><p className="card-kicker">DATOS Y PRIVACIDAD</p><h3>Entiende tus decisiones</h3></div><ShieldCheck size={19} /></div><SettingsDisclosure icon={<Cookie size={17} />} title="Cookies y preferencias" open={openPanel === 'cookies'} onClick={() => setOpenPanel(openPanel === 'cookies' ? null : 'cookies')}><p>Usamos cookies necesarias para mantener tu sesión y recordar el estilo que elegiste. Las preferencias opcionales se usan para mejorar la experiencia, nunca para vender tus datos.</p><button className="cookie-choice" onClick={() => setCookies(!cookies)}>{cookies ? <Check size={14} /> : <Plus size={14} />} Cookies de experiencia activadas</button></SettingsDisclosure><SettingsDisclosure icon={<FileText size={17} />} title="Términos y condiciones" open={openPanel === 'terms'} onClick={() => setOpenPanel(openPanel === 'terms' ? null : 'terms')}><p>Clara acompaña tu aprendizaje, pero no sustituye asesoría profesional. Las vacantes y convocatorias enlazadas pertenecen a sus fuentes originales.</p></SettingsDisclosure><SettingsDisclosure icon={<ShieldCheck size={17} />} title="Qué datos recopilamos y por qué" open={openPanel === 'data'} onClick={() => setOpenPanel(openPanel === 'data' ? null : 'data')}><p>Guardamos tu perfil, avance, notas y preferencias para personalizar tu ruta y mostrarte tu historial. Tus notas y configuración son privadas para tu cuenta.</p></SettingsDisclosure></div><div className="section-card danger-card"><div className="card-heading"><div><p className="card-kicker">ZONA DE CUENTA</p><h3>Eliminar mi cuenta</h3></div><Trash2 size={19} /></div><p>Esta acción inicia una solicitud para borrar tu perfil y la información asociada. No se puede deshacer una vez confirmada.</p><button className="danger-button" onClick={onDeleteAccount} disabled={!isAuthenticated}><Trash2 size={15} /> {isAuthenticated ? 'Solicitar eliminación' : 'Inicia sesión para continuar'}</button></div></div></>;
}

function SettingsDisclosure({ icon, title, open, onClick, children }: { icon: React.ReactNode; title: string; open: boolean; onClick: () => void; children: React.ReactNode }) { return <div className={`settings-disclosure ${open ? 'open' : ''}`}><button onClick={onClick}><span className="disclosure-icon">{icon}</span><strong>{title}</strong><ChevronDown size={16} /></button>{open && <div className="disclosure-content">{children}</div>}</div>; }

function HelpModal({ onClose }: { onClose: () => void }) { const [sent, setSent] = useState(false); return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="help-modal"><button className="modal-close" onClick={onClose} aria-label="Cerrar"><X size={18} /></button><div className="help-mark"><HelpCircle size={21} /></div><p className="eyebrow">ESTAMOS PARA AYUDARTE</p><h2>¿Algo no funciona?</h2><p>Cuéntanos qué pasó y revisaremos el problema contigo.</p>{sent ? <div className="help-success"><Check size={18} /><strong>Recibimos tu reporte.</strong><span>Te contactaremos por el correo de tu cuenta.</span></div> : <><textarea className="help-textarea" placeholder="Describe brevemente lo que ocurrió..." /><button className="primary-button help-submit" onClick={() => setSent(true)}>Enviar reporte <ArrowRight size={16} /></button></>}</div></div>; }

function AuthModal({ mode, setMode, email, setEmail, password, setPassword, name, setName, message, loading, legalAccepted, setLegalAccepted, onSubmit }: { mode: AuthMode; setMode: (mode: AuthMode | null) => void; email: string; setEmail: (value: string) => void; password: string; setPassword: (value: string) => void; name: string; setName: (value: string) => void; message: string; loading: boolean; legalAccepted: boolean; setLegalAccepted: (value: boolean) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) { return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setMode(null); }}><div className="auth-modal"><button className="modal-close" onClick={() => setMode(null)} aria-label="Cerrar"><X size={18} /></button><div className="auth-mark"><Sparkles size={20} /></div><p className="eyebrow">TU PROGRESO, CONTIGO</p><h2>{mode === 'login' ? 'Qué bueno verte.' : 'Empieza tu recorrido.'}</h2><p>{mode === 'login' ? 'Continúa desde donde lo dejaste.' : 'Guarda tus avances y recibe una ruta hecha para ti.'}</p><form onSubmit={onSubmit}>{mode === 'signup' && <input required placeholder="Tu nombre" value={name} onChange={(event) => setName(event.target.value)} />}<input required type="email" placeholder="Correo electrónico" value={email} onChange={(event) => setEmail(event.target.value)} /><input required minLength={6} type="password" placeholder="Contraseña (mínimo 6 caracteres)" value={password} onChange={(event) => setPassword(event.target.value)} />{mode === 'signup' && <label className="legal-check"><input type="checkbox" checked={legalAccepted} onChange={(event) => setLegalAccepted(event.target.checked)} /><span>Acepto el <button type="button" onClick={() => undefined}>aviso de privacidad</button> y los <button type="button" onClick={() => undefined}>términos y condiciones</button>.</span></label>}<button className="primary-button auth-submit" disabled={loading}>{loading ? 'Un momento...' : mode === 'login' ? 'Entrar a mi espacio' : 'Crear mi cuenta'} <ArrowRight size={16} /></button></form>{message && <div className="auth-message">{message}</div>}<button className="mode-switch" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); }}> {mode === 'login' ? '¿Aún no tienes cuenta? Crear una' : '¿Ya tienes cuenta? Entrar'}</button></div></div>; }

export default App;
