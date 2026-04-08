import { useState } from 'react';
import { useLocation } from 'wouter';
import { useParcoursStore } from '@/lib/store';

import { NpsCard, RatingCard, ChatCardMulti } from '@/components/ChatCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getScenarioLabel, getDiscLabel, getDifficultyStars, getTypeCollabShortLabel } from '@/lib/helpers';
import { apiRequest } from '@/lib/queryClient';
import { Star, RefreshCw, Shuffle, Home, Download } from 'lucide-react';
import { generateInterviewGrid } from '@/lib/generateInterviewGrid';
import { cn } from '@/lib/utils';

export function Step22Nps() {
  const { feedbackParcours, setNps, nextStep } = useParcoursStore();

  const handleSelect = (n: number) => {
    setNps(n);
    setTimeout(() => nextStep(), 500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>Ton avis compte</h3>
        <p className="text-sm text-[var(--dsfr-grey-425)] mt-1">Sur une echelle de 0 a 10, quelle est la probabilite que tu recommandes ChatFT SimuManager a un collegue manager ?</p>
      </div>
      <NpsCard selected={feedbackParcours.nps} onSelect={handleSelect} />
    </div>
  );
}

export function Step23Ratings() {
  const { feedbackParcours, setFacilite, setPertinence, setRealisme, nextStep } = useParcoursStore();

  const allAnswered = feedbackParcours.facilite !== null && feedbackParcours.pertinence !== null && feedbackParcours.realisme !== null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>Evaluations</h3>
        <p className="text-sm text-[var(--dsfr-grey-425)] mt-1">Comment evalues-tu...</p>
      </div>
      <div className="space-y-4">
        <RatingCard
          label="La facilite d'utilisation de l'outil ?"
          selected={feedbackParcours.facilite}
          onSelect={setFacilite}
          minLabel="Tres difficile"
          maxLabel="Tres facile"
        />
        <RatingCard
          label="La pertinence du parcours de profilage ?"
          selected={feedbackParcours.pertinence}
          onSelect={setPertinence}
          minLabel="Pas pertinent"
          maxLabel="Tres pertinent"
        />
        <RatingCard
          label="Le realisme de la simulation ?"
          selected={feedbackParcours.realisme}
          onSelect={setRealisme}
          minLabel="Pas realiste"
          maxLabel="Tres realiste"
        />
        {allAnswered && (
          <Button data-testid="button-continue-ratings" onClick={() => nextStep()} className="w-full">
            Continuer
          </Button>
        )}
      </div>
    </div>
  );
}

export function Step24Ameliorations() {
  const { feedbackParcours, setAmeliorations, nextStep } = useParcoursStore();
  const [selected, setSelected] = useState<string[]>(feedbackParcours.ameliorations || []);

  const handleToggle = (id: string) => {
    if (id === 'rien') {
      setSelected(selected.includes('rien') ? [] : ['rien']);
      return;
    }
    setSelected((prev) => {
      const filtered = prev.filter((x) => x !== 'rien');
      return filtered.includes(id) ? filtered.filter((x) => x !== id) : [...filtered, id];
    });
  };

  const handleValidate = () => {
    setAmeliorations(selected);
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>Ameliorations</h3>
        <p className="text-sm text-[var(--dsfr-grey-425)] mt-1">Qu'est-ce qui pourrait etre ameliore ?</p>
      </div>
      <div className="space-y-3">
        <ChatCardMulti
          selected={selected}
          onToggle={handleToggle}
          exclusiveOptionId="rien"
          options={[
            { id: 'design', label: "Le design et l'ergonomie" },
            { id: 'clarte', label: 'La clarte des questions de profilage' },
            { id: 'etapes', label: "Le nombre d'etapes avant la simulation" },
            { id: 'realisme', label: 'Le realisme du collaborateur simule' },
            { id: 'feedback', label: 'La qualite du feedback post-simulation' },
            { id: 'mobile', label: "L'adaptation mobile" },
            { id: 'rien', label: "Rien, c'est tres bien comme ca !" },
          ]}
        />
        {selected.length > 0 && (
          <Button data-testid="button-validate-improvements" onClick={handleValidate} className="w-full">
            Valider
          </Button>
        )}
      </div>
    </div>
  );
}

const SUPPORT_MESSAGES: Record<string, string> = {
  feedback_recadrage: "Tu as travaillé sur le feedback et le recadrage — c'est l'un des exercices managériaux les plus exigeants. Pour t'accompagner dans tes prochains entretiens réels, voici une grille de préparation et un aide-mémoire méthode DESC à garder sous les yeux.",
  feedback_positif: "Reconnaître et valoriser, c'est un acte managérial puissant. Pour structurer tes prochains feedbacks positifs en entretien réel, voici une grille de préparation et un aide-mémoire méthode MERCI.",
  decision_difficile: "Annoncer une décision difficile demande du courage et de la méthode. Pour te préparer à tes prochains entretiens d'annonce, voici une grille de préparation et un aide-mémoire structuré.",
};

export function Step26GrilleEntretien() {
  const { scenarioChoisi, nextStep } = useParcoursStore();
  const sc = scenarioChoisi || 'feedback_recadrage';
  const message = SUPPORT_MESSAGES[sc] || SUPPORT_MESSAGES.feedback_recadrage;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>Ta grille d'entretien</h3>
      </div>

      <div className="bg-[var(--dsfr-blue-france-light)] p-4 rounded-xl text-sm text-[var(--dsfr-grey-425)] leading-relaxed border-l-[3px]" style={{ borderLeftColor: 'var(--dsfr-blue-france)' }}>
        {message}
      </div>

      <Button
        onClick={() => generateInterviewGrid(sc)}
        className="w-full"
      >
        <Download className="w-4 h-4 mr-2" />
        Télécharger ma grille d'entretien (PDF)
      </Button>

      <Button data-testid="button-continue-grille" variant="outline" onClick={() => nextStep()} className="w-full">
        Continuer
      </Button>
    </div>
  );
}

export function Step25Closing() {
  const store = useParcoursStore();
  const { feedbackParcours, setCommentaire, scenarioChoisi, persona, typeCollab, analyse, resetParcours, resetToPersona, nextStep } = store;
  const [, navigate] = useLocation();
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setCommentaire(text);
    setSaving(true);
    try {
      await apiRequest('POST', '/api/session/save', {
        sessionId: store.sessionId,
        mode: store.mode,
        profil: store.profil,
        barometre: store.barometre,
        experience: store.experience,
        objectifs: store.objectifs,
        difficulte: store.difficulte,
        typeCollab: store.typeCollab,
        complement: store.complement,
        scenarioChoisi: store.scenarioChoisi,
        personaDisc: store.persona.disc,
        personaRelation: store.persona.relation,
        personaEtatEsprit: store.persona.etatEsprit,
        niveauDifficulte: store.persona.niveauDifficulte,
        messages: store.simulation.messages,
        clarte: store.analyse?.clarte,
        ecoute: store.analyse?.ecoute,
        assertivite: store.analyse?.assertivite,
        global: store.analyse?.global,
        pointsForts: store.analyse?.pointsForts,
        axesProgression: store.analyse?.axesProgression,
        conseilCle: store.analyse?.conseilCle,
        nps: store.feedbackParcours.nps,
        facilite: store.feedbackParcours.facilite,
        pertinence: store.feedbackParcours.pertinence,
        realisme: store.feedbackParcours.realisme,
        ameliorations: store.feedbackParcours.ameliorations,
        commentaire: text,
      });
    } catch {}
    setSaving(false);
    setSubmitted(true);
  };

  const handleSkip = async () => {
    setSaving(true);
    try {
      await apiRequest('POST', '/api/session/save', {
        sessionId: store.sessionId,
        mode: store.mode,
        profil: store.profil,
        barometre: store.barometre,
        experience: store.experience,
        objectifs: store.objectifs,
        difficulte: store.difficulte,
        typeCollab: store.typeCollab,
        complement: store.complement,
        scenarioChoisi: store.scenarioChoisi,
        personaDisc: store.persona.disc,
        personaRelation: store.persona.relation,
        personaEtatEsprit: store.persona.etatEsprit,
        niveauDifficulte: store.persona.niveauDifficulte,
        messages: store.simulation.messages,
        clarte: store.analyse?.clarte,
        ecoute: store.analyse?.ecoute,
        assertivite: store.analyse?.assertivite,
        global: store.analyse?.global,
        pointsForts: store.analyse?.pointsForts,
        axesProgression: store.analyse?.axesProgression,
        conseilCle: store.analyse?.conseilCle,
        nps: store.feedbackParcours.nps,
        facilite: store.feedbackParcours.facilite,
        pertinence: store.feedbackParcours.pertinence,
        realisme: store.feedbackParcours.realisme,
        ameliorations: store.feedbackParcours.ameliorations,
        commentaire: '',
      });
    } catch {}
    setSaving(false);
    setSubmitted(true);
  };

  const difficultyStars = getDifficultyStars(persona.niveauDifficulte);

  if (!submitted) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>Un dernier mot ?</h3>
          <p className="text-sm text-[var(--dsfr-grey-425)] mt-1">Commentaire, suggestion, remarque libre...</p>
        </div>
        <div className="space-y-3">
          <Textarea
            data-testid="input-comment"
            placeholder="Ton commentaire (optionnel)..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[80px] resize-none"
          />
          <div className="flex gap-2">
            <Button data-testid="button-send-comment" onClick={handleSubmit} className="flex-1" disabled={saving}>
              {saving ? 'Envoi...' : 'Envoyer'}
            </Button>
            <Button data-testid="button-skip-comment" variant="outline" onClick={handleSkip} disabled={saving}>
              Passer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>Merci !</h3>
        <p className="text-sm text-[var(--dsfr-grey-425)]">Merci beaucoup pour ta participation et tes retours !</p>
      </div>

      <div className="bg-[var(--dsfr-blue-france-light)] p-4 space-y-2 text-xs border-l-[3px]" style={{ borderLeftColor: 'var(--dsfr-blue-france)' }}>
        <p className="font-bold text-sm" style={{ color: 'var(--dsfr-blue-france)' }}>Recapitulatif de ta session :</p>
        <ul className="space-y-1 list-none pl-0">
          <li>Scenario joue : <strong>{getScenarioLabel(scenarioChoisi)}</strong></li>
          <li className="flex items-center gap-1 flex-wrap">
            Collaborateur : {getTypeCollabShortLabel(typeCollab)}, profil {getDiscLabel(persona.disc)}, difficulte
            {Array.from({ length: difficultyStars }, (_, i) => (
              <Star key={i} className="w-3 h-3 inline" style={{ color: 'var(--dsfr-warning)', fill: 'var(--dsfr-warning)' }} />
            ))}
          </li>
          {analyse && <li>Score global : <strong>{analyse.global.toFixed(1)}/5</strong></li>}
        </ul>
      </div>

      <p className="text-sm text-center">A bientot sur ChatFT SimuManager !</p>

      <div className="space-y-2">
        <button
          data-testid="button-replay"
          onClick={() => resetToPersona()}
          className="w-full flex items-center gap-3 px-4 py-3 bg-card border border-[var(--dsfr-grey-925)] rounded-lg hover:border-[var(--dsfr-blue-france)] hover:bg-[var(--dsfr-blue-france-light)] text-left text-sm transition-colors"
        >
          <RefreshCw className="w-5 h-5" style={{ color: 'var(--dsfr-blue-france)' }} />
          <div>
            <div className="font-bold">Rejouer ce scenario</div>
            <div className="text-xs text-[var(--dsfr-grey-425)]">Reprendre avec comparaison de progression</div>
          </div>
        </button>
        <button
          data-testid="button-other-scenario"
          onClick={() => { resetParcours(); navigate('/'); }}
          className="w-full flex items-center gap-3 px-4 py-3 bg-card border border-[var(--dsfr-grey-925)] rounded-lg hover:border-[var(--dsfr-blue-france)] hover:bg-[var(--dsfr-blue-france-light)] text-left text-sm transition-colors"
        >
          <Shuffle className="w-5 h-5" style={{ color: 'var(--dsfr-blue-france)' }} />
          <div>
            <div className="font-bold">Essayer un autre scenario</div>
            <div className="text-xs text-[var(--dsfr-grey-425)]">Retour au menu des scenarios</div>
          </div>
        </button>
        <button
          data-testid="button-home"
          onClick={() => { resetParcours(); navigate('/'); }}
          className="w-full flex items-center gap-3 px-4 py-3 bg-card border border-[var(--dsfr-grey-925)] rounded-lg hover:border-[var(--dsfr-blue-france)] hover:bg-[var(--dsfr-blue-france-light)] text-left text-sm transition-colors"
        >
          <Home className="w-5 h-5" style={{ color: 'var(--dsfr-blue-france)' }} />
          <div>
            <div className="font-bold">Retour a l'accueil</div>
            <div className="text-xs text-[var(--dsfr-grey-425)]">Recommencer depuis le debut</div>
          </div>
        </button>
      </div>
    </div>
  );
}
