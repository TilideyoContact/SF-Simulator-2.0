import { useState, useRef } from 'react';
import { useParcoursStore } from '@/lib/store';

import { ChatCardSingle, ChatCardMulti } from '@/components/ChatCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Microscope, Zap, User, Users, Building2, CheckCircle, AlertTriangle, AlertCircle, Sprout, TreePine, Award, Target, Shield, Search, TrendingUp, FileEdit, MessageSquare, MessageCircle, ClipboardList, RefreshCw, Sparkles, Upload, Info, BookOpen, ListChecks } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const SCENARIO_CONTEXT: Record<string, { title: string; desc: string }> = {
  feedback_recadrage: {
    title: 'Feedback / Recadrage',
    desc: 'Tu vas t\'entraîner à recadrer un collaborateur tout en préservant la qualité de ta relation professionnelle.',
  },
  feedback_positif: {
    title: 'Feedback positif',
    desc: 'Tu vas t\'entraîner à donner un feedback valorisant, précis et structurant pour motiver ton collaborateur.',
  },
  decision_difficile: {
    title: 'Décision difficile',
    desc: 'Tu vas t\'entraîner à annoncer une décision difficile ou non négociable avec clarté et empathie.',
  },
};

export function Step1Welcome() {
  const { setMode, nextStep, mode, scenarioChoisi } = useParcoursStore();

  const handleSelect = (id: string, _label: string) => {
    setMode(id as 'avance' | 'rapide');
    setTimeout(() => nextStep(), 400);
  };

  const ctx = scenarioChoisi ? SCENARIO_CONTEXT[scenarioChoisi] : null;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 pt-4">
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8" style={{ color: 'var(--dsfr-blue-france)' }} />
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>
            {ctx ? ctx.title : 'Entretiens managériaux'}
          </h2>
        </div>
        <div className="text-sm sm:text-base text-[var(--dsfr-grey-425)] max-w-2xl mx-auto leading-relaxed space-y-2">
          <p>Bienvenue dans un simulateur conversationnel dédié à la conduite de tes entretiens managériaux, dans un cadre respectant la confidentialité.</p>
          <p>Cet outil t'accompagne dans leur préparation, qu'il s'agisse d'entretiens visant à soutenir, reconnaître, projeter ou à aborder des situations plus sensibles.</p>
          <p>Et à l'issue de ta simulation, un débriefing détaillé te sera proposé ainsi que des fiches pratiques utiles.</p>
        </div>
      </div>

      <Accordion type="multiple" className="w-full max-w-2xl mx-auto">
        <AccordionItem value="conseils">
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              Conseils d'utilisation
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 bg-white dark:bg-[var(--dsfr-grey-950)] border border-[var(--dsfr-grey-850)] rounded-xl">
              <p className="text-sm font-medium mb-3 text-foreground">Avant de commencer, nous t'invitons à :</p>
              <ul className="text-sm text-[var(--dsfr-grey-425)] space-y-2 list-disc list-inside">
                <li>prendre le temps nécessaire pour réaliser la simulation</li>
                <li>éteindre ton téléphone</li>
                <li>t'isoler</li>
                <li>mettre ton casque</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="mode-emploi">
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Mode d'emploi
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 bg-white dark:bg-[var(--dsfr-grey-950)] border border-[var(--dsfr-grey-850)] rounded-xl">
              <p className="text-sm font-medium mb-3 text-foreground">Deux modes disponibles :</p>
              <ul className="text-sm text-[var(--dsfr-grey-425)] space-y-2 list-disc list-inside mb-4">
                <li><strong>Mode Avancé</strong> — Questions détaillées pour un accompagnement sur-mesure</li>
                <li><strong>Mode Rapide</strong> — 3 questions essentielles puis simulation directe</li>
              </ul>
              <p className="text-sm font-medium mb-3 text-foreground">3 situations d'entretien proposées :</p>
              <ul className="text-sm text-[var(--dsfr-grey-425)] space-y-2 list-disc list-inside mb-4">
                <li>Feedback / Recadrage</li>
                <li>Feedback positif</li>
                <li>Décision difficile</li>
              </ul>
              <p className="text-sm text-[var(--dsfr-grey-425)] mb-4">Ces scénarios sont issus de la remontée des besoins prioritaires exprimés par des managers. À toi de jouer en cliquant sur l'un des scénarios proposés !</p>
              <p className="text-sm font-medium mb-3 text-foreground">Comment ça fonctionne :</p>
              <ol className="text-sm text-[var(--dsfr-grey-425)] space-y-2 list-decimal list-inside">
                <li>Choisis un scénario dans le menu ou ci-dessus</li>
                <li>Réponds à quelques questions de profilage (mode avancé) ou passe directement (mode rapide)</li>
                <li>Configure le profil de ton collaborateur virtuel</li>
                <li>Joue la simulation puis reçois une analyse de ta performance</li>
              </ol>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="prerequis">
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <ListChecks className="w-4 h-4" />
              Pré-requis pour tes entretiens
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 bg-white dark:bg-[var(--dsfr-grey-950)] border border-[var(--dsfr-grey-850)] rounded-xl">
              <ol className="text-sm text-[var(--dsfr-grey-425)] space-y-3 list-inside" style={{ listStyleType: 'lower-alpha' }}>
                <li><strong>Préparer le contenu de l'entretien</strong> (possible partage en ELD) : thème abordé, faits concrets (exemples précis, datés, factuels), éventuels rappels à la règle ou aux procédures, objectifs dont détermination des impacts.</li>
                <li><strong>Proposer un créneau pour le rendez-vous</strong> dans un lieu calme, neutre et confidentiel : sois clair sur le but de l'entretien (feedback, reconnaissance, annonce difficile...). Cela t'aidera à structurer ton échange et à rester cohérent.</li>
                <li><strong>Se préparer à aborder sereinement l'entretien</strong> : Sois apaisé et concentré avant l'entretien. Prends quelques minutes pour te recentrer si nécessaire, afin d'aborder l'échange avec sérénité.</li>
                <li><strong>Lors de l'entretien</strong> : reste factuel, adopte une posture assertive, fais preuve d'écoute active (reformulation…) et d'agilité…</li>
                <li><strong>Assurer un suivi</strong> : une formalisation est préconisée pour tout entretien.</li>
              </ol>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>
            Mode avancé
          </h3>
          <button
            data-testid="card-option-avance"
            disabled={mode !== null && mode !== 'avance'}
            onClick={() => handleSelect('avance', 'Mode avancé')}
            className="w-full text-left px-5 py-4 border border-[var(--dsfr-grey-850)] rounded-xl bg-white dark:bg-[var(--dsfr-grey-950)] hover:border-[var(--dsfr-blue-france)] hover:shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <Microscope className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--dsfr-blue-france)' }} />
              <div>
                <p className="font-medium text-sm text-foreground">Questions détaillées pour un accompagnement sur-mesure</p>
              </div>
            </div>
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-red-marianne)' }}>
            Mode rapide
          </h3>
          <button
            data-testid="card-option-rapide"
            disabled={mode !== null && mode !== 'rapide'}
            onClick={() => handleSelect('rapide', 'Mode rapide')}
            className="w-full text-left px-5 py-4 border border-[var(--dsfr-grey-850)] rounded-xl bg-white dark:bg-[var(--dsfr-grey-950)] hover:border-[var(--dsfr-red-marianne)] hover:shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--dsfr-red-marianne)' }} />
              <div>
                <p className="font-medium text-sm text-foreground">3 questions essentielles puis simulation</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export function Step2Profil() {
  const { setProfil, nextStep, profil } = useParcoursStore();

  const handleSelect = (id: string) => {
    setProfil(id as any);
    setTimeout(() => nextStep(), 400);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>
          Ton niveau de responsabilité
        </h3>
        <p className="text-sm text-[var(--dsfr-grey-425)] mt-1">Pour mieux adapter mes conseils, quel est ton niveau de responsabilité managériale ?</p>
      </div>
      <ChatCardSingle
        selected={profil}
        onSelect={handleSelect}
        options={[
          { id: 'mp', label: 'Manager de proximité', subtitle: "J'anime une équipe opérationnelle au quotidien", icon: <User className="w-5 h-5" /> },
          { id: 'mi', label: 'Manager intermédiaire', subtitle: 'Je pilote plusieurs équipes ou projets transverses', icon: <Users className="w-5 h-5" /> },
          { id: 'ms', label: 'Manager supérieur', subtitle: 'Je dirige une direction ou un service', icon: <Building2 className="w-5 h-5" /> },
        ]}
      />
    </div>
  );
}

export function Step3Barometre() {
  const { setBarometre, nextStep, barometre } = useParcoursStore();
  const [qvt, setQvt] = useState(barometre?.qvt || null);
  const [engagement, setEngagement] = useState(barometre?.engagement || null);

  const handleQvt = (id: string) => {
    setQvt(id as any);
    if (engagement) {
      setBarometre({ qvt: id as any, engagement });
      setTimeout(() => nextStep(), 400);
    }
  };

  const handleEngagement = (id: string) => {
    setEngagement(id as any);
    if (qvt) {
      setBarometre({ qvt, engagement: id as any });
      setTimeout(() => nextStep(), 400);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>
          Baromètre de contexte
        </h3>
        <p className="text-sm text-[var(--dsfr-grey-425)] mt-1">Deux questions rapides sur ton contexte actuel pour mieux calibrer la simulation.</p>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium text-foreground">Comment évalues-tu la qualité de vie au travail de ton équipe actuellement ?</p>
        <ChatCardSingle
          selected={qvt}
          onSelect={handleQvt}
          options={[
            { id: 'bonne', label: 'Bonne', subtitle: 'Ambiance positive, équipe engagée', icon: <CheckCircle className="w-5 h-5" style={{ color: 'var(--dsfr-success)' }} /> },
            { id: 'moyenne', label: 'Moyenne', subtitle: 'Quelques tensions mais rien de critique', icon: <AlertTriangle className="w-5 h-5" style={{ color: 'var(--dsfr-warning)' }} /> },
            { id: 'difficile', label: 'Difficile', subtitle: 'Tensions fortes, climat dégradé', icon: <AlertCircle className="w-5 h-5" style={{ color: 'var(--dsfr-red-marianne)' }} /> },
          ]}
        />
      </div>

      {qvt && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-foreground">Et l'engagement de tes collaborateurs au quotidien ?</p>
          <ChatCardSingle
            selected={engagement}
            onSelect={handleEngagement}
            options={[
              { id: 'bon', label: 'Bon', subtitle: 'Équipe motivée et impliquée', icon: <CheckCircle className="w-5 h-5" style={{ color: 'var(--dsfr-success)' }} /> },
              { id: 'moyen', label: 'Moyen', subtitle: 'Implication variable selon les individus', icon: <AlertTriangle className="w-5 h-5" style={{ color: 'var(--dsfr-warning)' }} /> },
              { id: 'faible', label: 'Faible', subtitle: 'Démotivation, absentéisme, retrait', icon: <AlertCircle className="w-5 h-5" style={{ color: 'var(--dsfr-red-marianne)' }} /> },
            ]}
          />
        </div>
      )}
    </div>
  );
}

export function Step4Experience() {
  const { setExperience, nextStep, experience } = useParcoursStore();

  const handleSelect = (id: string) => {
    setExperience(id as any);
    setTimeout(() => nextStep(), 400);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>
          Ton expérience
        </h3>
        <p className="text-sm text-[var(--dsfr-grey-425)] mt-1">Depuis combien de temps exerces-tu des fonctions managériales ?</p>
      </div>
      <ChatCardSingle
        selected={experience}
        onSelect={handleSelect}
        options={[
          { id: 'debutant', label: "Moins d'1 an", subtitle: 'Je débute dans la fonction', icon: <Sprout className="w-5 h-5" style={{ color: 'var(--dsfr-success)' }} /> },
          { id: 'intermediaire', label: '1 à 3 ans', subtitle: "J'ai un peu d'expérience", icon: <TreePine className="w-5 h-5" style={{ color: 'var(--dsfr-success)' }} /> },
          { id: 'experimente', label: 'Plus de 3 ans', subtitle: 'Je suis expérimenté(e)', icon: <Award className="w-5 h-5" style={{ color: 'var(--dsfr-success)' }} /> },
        ]}
      />
    </div>
  );
}

export function Step5Objectifs() {
  const { setObjectifs, nextStep, objectifs } = useParcoursStore();
  const [selected, setSelected] = useState<string[]>(objectifs || []);

  const handleToggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleValidate = () => {
    setObjectifs(selected);
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>
          Tes objectifs
        </h3>
        <p className="text-sm text-[var(--dsfr-grey-425)] mt-1">Qu'est-ce qui t'amène à utiliser cet outil aujourd'hui ? Tu peux sélectionner plusieurs réponses.</p>
      </div>
      <div className="space-y-3">
        <ChatCardMulti
          selected={selected}
          onToggle={handleToggle}
          options={[
            { id: 'entrainer', label: "M'entraîner", subtitle: 'Pratiquer avant un entretien réel', icon: <Target className="w-5 h-5" /> },
            { id: 'confiant', label: 'Être plus confiant(e)', subtitle: 'Me rassurer sur mes pratiques', icon: <Shield className="w-5 h-5" /> },
            { id: 'decouvrir', label: 'Découvrir', subtitle: 'Explorer de nouvelles pratiques', icon: <Search className="w-5 h-5" /> },
            { id: 'ameliorer', label: "M'améliorer", subtitle: 'Identifier mes axes de progression', icon: <TrendingUp className="w-5 h-5" /> },
          ]}
        />
        {selected.length > 0 && (
          <Button data-testid="button-validate-objectives" onClick={handleValidate} className="w-full">
            Valider mes choix
          </Button>
        )}
      </div>
    </div>
  );
}

export function Step6Difficultes() {
  const { setDifficulte, nextStep, difficulte } = useParcoursStore();
  const [selected, setSelected] = useState<string[]>(difficulte || []);

  const handleToggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleValidate = () => {
    setDifficulte(selected);
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>
          Étape la plus délicate
        </h3>
        <p className="text-sm text-[var(--dsfr-grey-425)] mt-1">Quelle étape de l'entretien te semble la plus délicate ?</p>
      </div>
      <div className="space-y-3">
        <ChatCardMulti
          selected={selected}
          onToggle={handleToggle}
          options={[
            { id: 'preparation', label: 'La préparation', subtitle: 'Structurer mon entretien en amont', icon: <FileEdit className="w-5 h-5" /> },
            { id: 'conduite', label: 'La conduite', subtitle: "Mener l'échange en face-à-face", icon: <MessageSquare className="w-5 h-5" /> },
            { id: 'feedback', label: 'Le feedback', subtitle: 'Formuler un retour clair et constructif', icon: <MessageCircle className="w-5 h-5" /> },
            { id: 'formalisation', label: 'La formalisation', subtitle: 'Rédiger le compte-rendu et les engagements', icon: <ClipboardList className="w-5 h-5" /> },
            { id: 'suivi', label: 'Le suivi', subtitle: "Assurer la continuité après l'entretien", icon: <RefreshCw className="w-5 h-5" /> },
          ]}
        />
        {selected.length > 0 && (
          <Button data-testid="button-validate-difficultes" onClick={handleValidate} className="w-full">
            Valider mes choix
          </Button>
        )}
      </div>
    </div>
  );
}

export function Step7TypeCollab() {
  const { setTypeCollab, nextStep, typeCollab } = useParcoursStore();

  const handleSelect = (id: string) => {
    setTypeCollab(id as any);
    setTimeout(() => nextStep(), 400);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>
          Type de collaborateur
        </h3>
        <p className="text-sm text-[var(--dsfr-grey-425)] mt-1">Avec quel type de collaborateur auras-tu ton entretien ?</p>
      </div>
      <ChatCardSingle
        selected={typeCollab}
        onSelect={handleSelect}
        options={[
          { id: 'agent', label: 'Un agent / collaborateur direct', subtitle: 'Conseiller, gestionnaire, agent d\'accueil...', icon: <User className="w-5 h-5" /> },
          { id: 'manager', label: 'Un manager', subtitle: 'Manager de proximité, intermédiaire, responsable adjoint...', icon: <Users className="w-5 h-5" /> },
          { id: 'pairs', label: 'Un pair', subtitle: 'Collègue de même niveau hiérarchique, homologue...', icon: <Building2 className="w-5 h-5" /> },
        ]}
      />
    </div>
  );
}

export function Step8Complement() {
  const { setComplement, nextStep, complement } = useParcoursStore();
  const [text, setText] = useState(complement || '');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContinue = () => {
    setComplement(text);
    nextStep();
  };

  const handleSkip = () => {
    nextStep();
  };

  const handleFiles = (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles);
    setFiles((prev) => [...prev, ...arr]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>
          Informations complémentaires
        </h3>
        <p className="text-sm text-[var(--dsfr-grey-425)] mt-1">As-tu d'autres éléments à préciser ? Tu peux joindre une fiche de poste, un descriptif d'activité, ou tout autre document.</p>
      </div>
      <div className="space-y-3">
        <Textarea
          data-testid="input-complement"
          placeholder="Décris le contexte, la situation spécifique..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[100px] resize-none"
        />

        <div
          data-testid="file-dropzone"
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragOver
              ? 'border-[var(--dsfr-blue-france)] bg-[var(--dsfr-blue-france-light)]'
              : 'border-[var(--dsfr-grey-850)] hover:border-[var(--dsfr-blue-france)] hover:bg-[var(--dsfr-blue-france-light)]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept=".pdf,.doc,.docx,.txt,.odt,.rtf,.xls,.xlsx,.csv,.png,.jpg,.jpeg"
            onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ''; }}
          />
          <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--dsfr-blue-france)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--dsfr-blue-france)' }}>
            Glisse tes fichiers ici ou clique pour parcourir
          </p>
          <p className="text-xs text-[var(--dsfr-grey-425)] mt-1">
            PDF, Word, Excel, images (max 10 Mo)
          </p>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, i) => (
              <div
                key={i}
                data-testid={`file-item-${i}`}
                className="flex items-center justify-between px-3 py-2 bg-[var(--dsfr-blue-france-light)] border border-[var(--dsfr-grey-925)] rounded"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Upload className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--dsfr-blue-france)' }} />
                  <span className="text-sm truncate" style={{ color: 'var(--dsfr-blue-france)' }}>{file.name}</span>
                  <span className="text-xs text-[var(--dsfr-grey-425)] flex-shrink-0">
                    ({(file.size / 1024).toFixed(0)} Ko)
                  </span>
                </div>
                <button
                  data-testid={`remove-file-${i}`}
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="text-[var(--dsfr-grey-425)] hover:text-[var(--dsfr-red-marianne)] text-lg leading-none px-1"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button data-testid="button-continue" onClick={handleContinue} className="flex-1">
            Continuer
          </Button>
          <Button data-testid="button-skip-step8" variant="outline" onClick={handleSkip}>
            Passer cette étape
          </Button>
        </div>
      </div>
    </div>
  );
}
