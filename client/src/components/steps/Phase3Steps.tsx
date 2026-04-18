import { useState } from 'react';
import { useParcoursStore, calculateDifficulty } from '@/lib/store';

import { ChatCardSingle } from '@/components/ChatCard';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getScenarioLabel, getDiscLabel, getRelationLabel, getEtatEspritLabel, getDifficultyLabel, getDifficultyStars, getPersonaDescription, getDiscColor, getProfilLabel, getExperienceLabel, getTypeCollabLabel } from '@/lib/helpers';
import { ArrowUpCircle, Sun, ShieldCheck, FileSearch, Heart, Minus, AlertTriangle, Smile, Meh, Frown, Angry, Star, Info, Zap, MessageCircle, Clock, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const RELATION_DESCRIPTIONS: Record<number, string> = {
  1: "La relation est très dégradée. Le collaborateur sera méfiant, distant, avec des réponses courtes. Il faudra plusieurs échanges constructifs avant toute ouverture. Niveau de difficulté élevé.",
  2: "La relation est sous tension. Le collaborateur est sur la défensive, pas hostile mais pas coopératif. L'ouverture est possible si tu es factuel et à l'écoute.",
  3: "La relation est professionnelle, ni chaleureuse ni froide. Le collaborateur attend de voir comment tu abordes le sujet. Bon équilibre pour s'entraîner.",
  4: "Il y a une relation de confiance. Le collaborateur est ouvert et coopératif. La résistance n'apparaîtra que si tu es maladroit (jugement, TU accusateur).",
  5: "Complicité professionnelle forte. Le collaborateur s'exprime librement. Attention : le risque est de tomber dans la complaisance (pas de cadre, pas de faits).",
};

const DISC_PROFILES = [
  {
    id: 'dominant',
    label: 'Dominant',
    prenom: 'Pierre',
    shortDesc: 'Direct, orienté résultats',
    fullDesc: 'Direct, orienté résultats, impatient. Challenge, veut des solutions rapides.',
    traits: ['Décide vite', 'Va droit au but', 'Aime le contrôle'],
    color: '#E1000F',
    bgColor: '#FEF0F0',
    icon: ArrowUpCircle,
    emoji: '🔴',
  },
  {
    id: 'influent',
    label: 'Influent',
    prenom: 'Sophie',
    shortDesc: 'Expressif, enthousiaste',
    fullDesc: 'Expressif, enthousiaste, dispersé. Parle beaucoup, réagit émotionnellement.',
    traits: ['Communique avec entrain', 'Aime collaborer', 'Expressif et créatif'],
    color: '#D58D00',
    bgColor: '#FFF8E5',
    icon: Sun,
    emoji: '🟡',
  },
  {
    id: 'stable',
    label: 'Stable',
    prenom: 'Thomas',
    shortDesc: 'Patient, loyal, fiable',
    fullDesc: 'Patient, loyal, résistant au changement. Écoute mais intériorise, passif.',
    traits: ['Écoute attentivement', 'Fiable et constant', 'Préfère la stabilité'],
    color: '#18753C',
    bgColor: '#F0FFF4',
    icon: ShieldCheck,
    emoji: '🟢',
  },
  {
    id: 'consciencieux',
    label: 'Consciencieux',
    prenom: 'Claire',
    shortDesc: 'Méthodique, précis, exigeant',
    fullDesc: 'Méthodique, précis, exigeant. Demande des preuves, analyse tout.',
    traits: ['Analyse les détails', 'Suit les procédures', 'Recherche la précision'],
    color: '#0063CB',
    bgColor: '#F0F5FF',
    icon: FileSearch,
    emoji: '🔵',
  },
];

export function Step11Disc() {
  const { persona, setPersonaDisc, nextStep, scenarioChoisi } = useParcoursStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setPersonaDisc(id as any);
    setTimeout(() => nextStep(), 400);
  };

  const activeProfile = DISC_PROFILES.find(p => p.id === hoveredId) || DISC_PROFILES.find(p => p.id === persona.disc);

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>
          Profil du collaborateur
        </h3>
        <p className="text-sm text-[var(--dsfr-grey-425)] mt-1">
          Pour le scénario <strong>"{getScenarioLabel(scenarioChoisi)}"</strong>, choisis le type de personnalité de ton collaborateur.
        </p>
        <p className="text-xs text-[var(--dsfr-grey-425)] mt-1">
          Ton collaborateur s'appellera <strong className="text-foreground">{persona.prenomFictif}</strong>.
        </p>
      </div>

      <div className="flex items-center justify-center">
        <Dialog>
          <DialogTrigger asChild>
            <button
              data-testid="button-disc-info"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors hover:bg-[var(--dsfr-blue-france-light)]"
              style={{ color: 'var(--dsfr-blue-france)', borderColor: 'var(--dsfr-blue-france)' }}
            >
              <Info className="w-3.5 h-3.5" />
              En savoir plus sur la méthode DISC
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>
                La méthode DISC
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm text-[var(--dsfr-grey-425)]">
              <p>
                Le modèle DISC est un outil d'analyse comportementale qui identifie <strong className="text-foreground">4 grands profils de communication</strong>. Chaque personne combine ces profils à des degrés différents.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DISC_PROFILES.map(p => (
                  <div key={p.id} className="p-2.5 rounded-lg border" style={{ backgroundColor: p.bgColor, borderColor: `${p.color}30` }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">{p.emoji}</span>
                      <span className="font-bold text-xs" style={{ color: p.color }}>{p.label}</span>
                    </div>
                    <p className="text-[11px] leading-tight">{p.fullDesc}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs italic">
                En choisissant un profil pour ton collaborateur virtuel, tu adaptes le niveau de difficulté et le réalisme de la simulation.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4 items-start">
        <div className="space-y-2">
          {DISC_PROFILES.map(profile => {
            const Icon = profile.icon;
            const isSelected = persona.disc === profile.id;
            return (
              <button
                key={profile.id}
                data-testid={`card-disc-${profile.id}`}
                onClick={() => handleSelect(profile.id)}
                onMouseEnter={() => setHoveredId(profile.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all duration-200',
                  isSelected
                    ? 'shadow-md'
                    : 'border-[var(--dsfr-grey-925)] hover:shadow-sm'
                )}
                style={{
                  borderColor: isSelected ? profile.color : undefined,
                  backgroundColor: isSelected ? profile.bgColor : undefined,
                }}
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: profile.bgColor, border: `2px solid ${profile.color}` }}
                >
                  <Icon className="w-5 h-5" style={{ color: profile.color }} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm" style={{ color: profile.color }}>
                    {profile.label} — {profile.prenom}
                  </p>
                  <p className="text-xs text-[var(--dsfr-grey-425)] leading-tight">{profile.shortDesc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="hidden md:block">
          {activeProfile ? (
            <div
              className="rounded-xl p-5 border-2 transition-all duration-300"
              style={{ backgroundColor: activeProfile.bgColor, borderColor: `${activeProfile.color}40` }}
            >
              <div className="text-center mb-4">
                <div
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-2"
                  style={{ backgroundColor: `${activeProfile.color}15`, border: `3px solid ${activeProfile.color}` }}
                >
                  <span className="text-3xl">{activeProfile.emoji}</span>
                </div>
                <p className="font-bold text-base" style={{ color: activeProfile.color }}>
                  {persona.prenomFictif} — {activeProfile.label}
                </p>
              </div>
              <p className="text-xs text-center text-[var(--dsfr-grey-425)] mb-3">{activeProfile.fullDesc}</p>
              <ul className="space-y-1.5">
                {activeProfile.traits.map((trait, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: activeProfile.color }} />
                    <span className="text-[var(--dsfr-grey-425)]">{trait}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-xl p-5 border-2 border-dashed border-[var(--dsfr-grey-850)] flex flex-col items-center justify-center min-h-[200px] text-center">
              <span className="text-3xl mb-2">👈</span>
              <p className="text-sm text-[var(--dsfr-grey-425)]">Survole ou sélectionne un profil pour découvrir les caractéristiques de <strong>{persona.prenomFictif}</strong></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Step12Relation() {
  const { persona, setPersonaRelation, nextStep } = useParcoursStore();
  const [value, setValue] = useState<number>(persona.relation ?? 3);

  const handleChange = (vals: number[]) => {
    setValue(vals[0]);
  };

  const handleValidate = () => {
    setPersonaRelation(value);
    nextStep();
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>
          Qualité des échanges
        </h3>
        <p className="text-sm text-[var(--dsfr-grey-425)] mt-1">Quelle est la qualité des échanges actuels avec ce collaborateur ?</p>
      </div>

      <div className="px-4">
        <Slider
          data-testid="slider-relation"
          min={1}
          max={5}
          step={1}
          value={[value]}
          onValueChange={handleChange}
          className="w-full"
        />
        <div className="flex justify-between mt-2">
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} className="flex flex-col items-center w-8">
              <span
                className={cn(
                  'text-sm font-bold text-center cursor-pointer transition-colors',
                  value === n ? 'text-[var(--dsfr-blue-france)]' : 'text-[var(--dsfr-grey-625)]'
                )}
                onClick={() => setValue(n)}
              >
                {n}
              </span>
              {n === 3 && (
                <span className="text-[9px] text-[var(--dsfr-blue-france)] font-medium whitespace-nowrap mt-0.5">(recommandé)</span>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs font-medium" style={{ color: 'var(--dsfr-red-marianne)' }}>Tendue</span>
          <span className="text-xs font-medium" style={{ color: 'var(--dsfr-success)' }}>Excellente</span>
        </div>
      </div>

      <div className="p-3 bg-[var(--dsfr-grey-975)] rounded-lg border border-[var(--dsfr-grey-925)] transition-all">
        <p className="text-sm font-bold text-foreground mb-1">
          {getRelationLabel(value)}{value === 3 ? ' (recommandé)' : ''}
        </p>
        <p className="text-xs text-[var(--dsfr-grey-425)] leading-relaxed">
          {RELATION_DESCRIPTIONS[value]}
        </p>
      </div>

      <Button data-testid="button-validate-relation" onClick={handleValidate} className="w-full">
        Continuer
      </Button>
    </div>
  );
}

export function Step13EtatEsprit() {
  const { persona, setPersonaEtatEsprit, nextStep } = useParcoursStore();

  const handleSelect = (id: string) => {
    setPersonaEtatEsprit(id as any);
    setTimeout(() => nextStep(), 400);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>
          État d'esprit du collaborateur
        </h3>
        <p className="text-sm text-[var(--dsfr-grey-425)] mt-1">Dans quel état d'esprit souhaites-tu que ton collaborateur se trouve au début ?</p>
      </div>
      <ChatCardSingle
        selected={persona.etatEsprit}
        onSelect={handleSelect}
        options={[
          { id: 'positif', label: 'Positif / Ouvert', subtitle: 'Bonne journée, disponible — écoute active', icon: <Smile className="w-5 h-5" style={{ color: 'var(--dsfr-success)' }} />, color: 'bg-[var(--dsfr-success-bg)]' },
          { id: 'neutre', label: 'Neutre / Concentré', subtitle: 'État normal, professionnel — comportement calibré', icon: <Meh className="w-5 h-5" style={{ color: 'var(--dsfr-info)' }} />, color: 'bg-[var(--dsfr-info-light)]' },
          { id: 'stresse', label: 'Stressé / Préoccupé', subtitle: 'Charge de travail, problèmes — distrait, seuil bas', icon: <Frown className="w-5 h-5" style={{ color: 'var(--dsfr-warning)' }} />, color: 'bg-[var(--dsfr-warning-light)]' },
          { id: 'agace', label: 'Agacé / Sur la défensive', subtitle: 'Mauvaise journée, tensions — résistance immédiate', icon: <Angry className="w-5 h-5" style={{ color: 'var(--dsfr-red-marianne)' }} />, color: 'bg-[var(--dsfr-red-marianne-light)]' },
        ]}
      />
    </div>
  );
}

export function Step14RecapPersona() {
  const { persona, nextStep, profil, experience, barometre, objectifs, difficulte, typeCollab, scenarioChoisi, complement, mode } = useParcoursStore();
  const difficultyStars = getDifficultyStars(persona.niveauDifficulte);
  const description = getPersonaDescription(persona.disc, persona.relation, persona.etatEsprit);
  const isRapide = mode === 'rapide';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>
          Récapitulatif avant simulation
        </h3>
        <p className="text-sm text-[var(--dsfr-grey-425)] mt-1">Vérifie ta configuration avant de démarrer</p>
      </div>

      {!isRapide && (profil || typeCollab || objectifs.length > 0) && (
        <div className="bg-[var(--dsfr-blue-france-light)] p-4 space-y-2 border-l-[3px]" style={{ borderLeftColor: 'var(--dsfr-blue-france)' }}>
          <p className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--dsfr-blue-france)' }}>Ton profil :</p>
          <ul className="space-y-1 list-none pl-0 text-xs text-[var(--dsfr-grey-425)]">
            {profil && (
              <li>Rôle : <strong className="text-foreground">{getProfilLabel(profil)}</strong>
                {experience && <> — expérience : <strong className="text-foreground">{getExperienceLabel(experience)}</strong></>}
              </li>
            )}
            {typeCollab && (
              <li>Type de collaborateur : <strong className="text-foreground">{getTypeCollabLabel(typeCollab)}</strong></li>
            )}
            {scenarioChoisi && (
              <li>Scénario : <strong className="text-foreground">{getScenarioLabel(scenarioChoisi)}</strong></li>
            )}
            {objectifs.length > 0 && (
              <li>Objectifs : <strong className="text-foreground">{objectifs.join(', ')}</strong></li>
            )}
            {difficulte.length > 0 && (
              <li>Étapes délicates : <strong className="text-foreground">{difficulte.join(', ')}</strong></li>
            )}
            {complement && (
              <li>Complément : <strong className="text-foreground">{complement.length > 80 ? complement.slice(0, 80) + '...' : complement}</strong></li>
            )}
          </ul>
        </div>
      )}

      {isRapide && scenarioChoisi && (
        <div className="bg-[var(--dsfr-blue-france-light)] p-4 space-y-2 border-l-[3px]" style={{ borderLeftColor: 'var(--dsfr-blue-france)' }}>
          <p className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--dsfr-blue-france)' }}>Scénario :</p>
          <p className="text-xs"><strong className="text-foreground">{getScenarioLabel(scenarioChoisi)}</strong></p>
        </div>
      )}

      <div className="bg-[var(--dsfr-blue-france-light)] p-4 space-y-3 border-l-[3px]" style={{ borderLeftColor: 'var(--dsfr-blue-france)' }}>
        <p className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--dsfr-blue-france)' }}>{isRapide ? 'Collaborateur configuré :' : 'Persona configuré :'}</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[var(--dsfr-grey-425)]">Profil DISC :</span>
            <span className={cn('ml-1 px-2 py-0.5 text-xs font-bold border', getDiscColor(persona.disc))}>
              {getDiscLabel(persona.disc)}
            </span>
          </div>
          <div>
            <span className="text-[var(--dsfr-grey-425)]">Relation :</span>
            <span className="ml-1 font-medium">{getRelationLabel(persona.relation)}</span>
          </div>
          <div>
            <span className="text-[var(--dsfr-grey-425)]">Type :</span>
            <span className="ml-1 font-medium">{typeCollab ? getTypeCollabLabel(typeCollab) : '—'}</span>
          </div>
        </div>
        <div className="pt-2 border-t border-[var(--dsfr-grey-925)]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--dsfr-grey-425)]">Niveau de difficulté :</span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 4 }, (_, i) => (
                <Star key={i} className={cn('w-4 h-4', i < difficultyStars ? 'text-[var(--dsfr-warning)] fill-[var(--dsfr-warning)]' : 'text-[var(--dsfr-grey-850)]')} />
              ))}
            </div>
            <span className="text-xs font-bold">{getDifficultyLabel(persona.niveauDifficulte)}</span>
          </div>
        </div>
        {description && (
          <p className="text-xs italic text-[var(--dsfr-grey-425)] pt-1">
            Ce collaborateur sera {description}.
          </p>
        )}
      </div>

      <Button data-testid="button-continue-persona" onClick={() => nextStep()} className="w-full">
        Continuer
      </Button>
    </div>
  );
}
