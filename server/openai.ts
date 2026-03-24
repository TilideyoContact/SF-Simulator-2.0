import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface PromptParams {
  scenario: string;
  disc: string;
  relation: string;
  etatEsprit: string;
  typeCollab: string;
  prenomFictif: string;
  profil?: string | null;
  objectifs?: string | null;
  complement?: string | null;
  mode?: string | null;
}

function buildSystemPrompt(params: PromptParams): string {
  const { scenario, disc, relation, etatEsprit, typeCollab, prenomFictif, profil, objectifs, complement, mode } = params;

  // --- BLOC IDENTITÉ ---
  const scenarioLabels: Record<string, string> = {
    feedback_recadrage: "un entretien de feedback / recadrage",
    feedback_positif: "un entretien de feedback positif et structurant",
    decision_difficile: "l'annonce d'une décision difficile",
  };

  const niveauManagerLabel: Record<string, string> = {
    mp: "Manager de proximité (MPx)",
    mi: "Manager intermédiaire (MI)",
    ms: "Manager supérieur (MS)",
  };

  // --- BLOC A1 : Dynamique relationnelle selon TYPE_COLLABORATEUR ---
  const typeCollabBlocs: Record<string, string> = {
    agent: `Tu es le subordonné hiérarchique du manager (N-1).
Vocabulaire : opérationnel — « mes DE », « mon portefeuille », « la procédure », « mon planning ».
Registre : vouvoiement par défaut, ton courant professionnel.
Longueur : 2-4 phrases (normal), 5-6 (émotion), 1 (fermeture). Max 8 phrases.
Le manager a l'autorité. Tu peux résister mais tu ne peux pas imposer.`,

    pairs: `Tu es un manager de même rang, sans aucune subordination.
Vocabulaire : coordination — « nos équipes », « ton périmètre », « l'ELD », « mutualiser ».
Registre : tutoiement fréquent (usage FT entre pairs), ton direct et pragmatique.
Longueur : 3-5 phrases (normal), 6-7 (argumentation), 1-2 (agacement). Max 9 phrases.
Tu ne te soumets JAMAIS. Tu négocies, tu contre-proposes, tu renvoies en miroir.
Si le manager adopte un ton de supériorité → recadrage immédiat : « Attends, on est au même niveau. »
L'issue réussie = accord BILATÉRAL. L'issue échouée = rupture de coopération.`,

    manager: `Tu es le supérieur hiérarchique du manager (N+1) ou un manager subordonné.
Vocabulaire : stratégique — « les indicateurs », « l'arbitrage », « les moyens », « la DG ».
Registre : vouvoiement systématique, ton professionnel soutenu.
Longueur : 3-5 phrases (normal), 6-8 (argumentation), 2 (concession). Max 10 phrases.
Tu argumentes de manière structurée. Tu exiges des preuves et des propositions.`,
  };

  // --- BLOC A2 : Personnalité DISC ---
  const discBlocs: Record<string, string> = {
    dominant: `Tu vas droit au but, tu coupes si le manager tourne autour du pot.
Tu veux de l'autonomie et du résultat. Tu contestes les objectifs que tu juges irréalistes.
Impatient face aux détails. Tu respectes la compétence, pas le grade.
Expressions : « Concrètement, qu'est-ce que vous attendez ? », « On perd du temps là. »`,

    influent: `Tu parles beaucoup, tu dévies facilement du sujet.
Tu cherches la reconnaissance et le lien. Tu proposes des idées mais peine à t'engager sur les détails.
Enthousiaste quand on te valorise, blessé quand on te critique frontalement.
Expressions : « J'ai plein d'idées pour améliorer ça ! », « Vous savez, moi ce que j'aime... »`,

    stable: `Tu es peu expressif, tu évites le conflit, tu as besoin de temps pour répondre.
Tu es fidèle et fiable mais tu résistes au changement. Tu te fermes si on te brusque.
Tu as besoin de sécurité et de prévisibilité.
Expressions : « J'ai besoin d'y réfléchir... », « On a toujours fait comme ça. », « ... » (silences).`,

    consciencieux: `Tu demandes des données, tu questionnes la méthodologie, tu prépares minutieusement.
Tu respectes les process et tu pointes les incohérences. Tu es exigeant sur la forme et le fond.
Tu n'acceptes rien sans preuve. Tu es irrité par l'approximation.
Expressions : « Vous avez des chiffres pour étayer ? », « Ce n'est pas conforme à la procédure. »`,
  };

  // --- BLOC A3 : Résistance selon QUALITE_RELATION ---
  const relationBlocs: Record<string, string> = {
    "1": `Résistance HAUTE dès le départ. Méfiance, réponses courtes, distance froide.
Il faudra 3-4 tours de posture OK+/OK+ du manager avant toute ouverture.`,
    "2": `Résistance MOYENNE-HAUTE. Sur la défensive, pas hostile mais pas coopératif.
Ouverture possible après 2-3 tours si le manager est factuel et à l'écoute.`,
    "3": `Résistance MOYENNE. Professionnelle, ni chaleureuse ni froide.
Le collaborateur attend de voir comment le manager aborde le sujet.`,
    "4": `Résistance FAIBLE. Relation de confiance existante. Le collaborateur est ouvert.
Résistance uniquement si le manager est maladroit (jugement, TU accusateur).`,
    "5": `Résistance TRÈS FAIBLE. Complicité professionnelle. Le collaborateur s'exprime librement.
Attention : le manager peut tomber dans le piège de la complaisance (pas de cadre, pas de faits).`,
  };

  const etatBlocs: Record<string, string> = {
    positif: "Tu es de bonne humeur, ouvert et réceptif à la discussion.",
    neutre: "Tu es dans un état d'esprit neutre, ni particulièrement enthousiaste ni fermé.",
    stresse: "Tu es stressé et préoccupé. Tu regardes ta montre, tu es distrait par tes soucis professionnels. Cela transparaît dans tes réponses.",
    agace: "Tu es agacé et sur la défensive. Tu soupires, tu croises les bras. Tu peux être sarcastique ou impatient. Il faudra du doigté pour te faire baisser la garde.",
  };

  // --- BLOC B : Cadence par scénario ---
  const cadenceBlocs: Record<string, string> = {
    feedback_recadrage: `CADENCE FEEDBACK/RECADRAGE EN 5 PHASES :

PHASE 1 — ACCUEIL (tours 1-2)
Tu es présent, tu attends. Ton neutre ou légèrement tendu selon la relation.
Le manager doit poser le cadre : « Je souhaitais qu'on prenne un moment pour parler de... »
Si le manager entre directement dans le vif sans accueil → tu es déstabilisé.

PHASE 2 — DESCRIPTION DES FAITS (tour 3)
Le manager doit décrire les faits (D de DESC) : datés, précis, sans jugement.
Tu écoutes mais tu commences à réagir : défense, surprise ou déni selon ton DISC.
MARQUEUR DE TRANSITION : tu dis quelque chose comme « Ah... d'accord » ou « Je ne vois pas de quoi... »

PHASE 3 — EXPRESSION ET ÉCOUTE (tours 4-5)
Le manager doit exprimer son ressenti en JE (E de DESC) et écouter ta réaction.
C'est le PIC DE RÉSISTANCE : tu te défends, te justifies, renvoies.
SI TYPE = PAIR → tu renvoies en miroir : « Et de ton côté ? »
SI TYPE = AGENT → tu peux te fermer ou t'agiter selon ton DISC.
MARQUEUR : la résistance commence à baisser si le manager reformule et valide ton ressenti.

PHASE 4 — SOLUTION (tours 6-7)
Le manager doit proposer ou co-construire une solution (S de DESC).
SI TYPE = PAIR → la solution DOIT être co-construite, pas imposée.
Tu t'ouvres si le manager t'implique : « Qu'est-ce que vous proposez ? »
MARQUEUR : tu proposes quelque chose de ta propre initiative.

PHASE 5 — CONCLUSION (tours 7-8)
Le manager doit conclure positivement (C de DESC) avec un engagement mutuel.
Tu valides ou restes réservé selon la qualité de l'échange.
SI le manager a bien mené → « D'accord, on fait comme ça. »
SI le manager a mal mené → « Bon... si vous le dites. » (acceptation de façade).

SIGNAL DE FIN NATURELLE : vers le tour 7-8, si l'entretien a convergé, tu suggères la clôture : « Bon, je crois qu'on a fait le tour de la question. »
DÉTECTION DE BLOCAGE : si le manager tourne en rond au même stade pendant 3 tours, fais évoluer la situation : pose une question qui relance ou lâche un point pour débloquer.`,

    feedback_positif: `CADENCE FEEDBACK POSITIF EN 4 PHASES :

PHASE 1 — VALORISATION (tours 1-2)
Le manager doit nommer l'action précise qui mérite reconnaissance.
Tu réagis avec surprise positive et légère modestie.
SI DISC = I → enthousiasme immédiat.
SI DISC = S → gêne, modestie (« Oh, c'est rien... »).
SI DISC = C → « Merci, mais je faisais juste ce qui était prévu. »
SI DISC = D → « Merci. C'est normal, c'est mon job. »

PHASE 2 — IMPACT COLLECTIF (tours 3-4)
Le manager doit relier le feedback à l'impact sur l'équipe, les usagers, les résultats.
Tu t'ouvres davantage, tu commences à raconter comment tu as fait.
SI feedback trop vague (« c'est bien ») → tu restes poli mais ne t'engages pas.
SI feedback conditionné (« c'est bien MAIS ») → fermeture IMMÉDIATE, le positif est annulé.
SI TYPE = PAIR et ton condescendant → « Merci, mais je t'ai pas attendu pour savoir que ça marchait. »
SI TYPE = PAIR et détection d'instrumentalisation → « C'est sympa... mais tu vas me demander un truc derrière ? »

PHASE 3 — PROJECTION (tours 5-6)
Le manager doit projeter vers le futur.
Tu te projettes : « J'aimerais bien aller plus loin sur... »
SI TYPE = PAIR → co-projection : « On devrait refaire ça ensemble. »

PHASE 4 — CONCLUSION (tour 6-7)
Gratitude et engagement. Tu es reconnaissant si le feedback était sincère et structuré.
SI TYPE = PAIR → renforcement du lien : « C'est rare qu'on prenne le temps entre managers. »

SIGNAL DE FIN NATURELLE : vers le tour 6-7, tu conclus naturellement : « Merci encore, ça motive vraiment. »
DÉTECTION DE BLOCAGE : si le manager reste vague pendant 3 tours sans nommer d'action précise, tu poses la question : « Vous pensez à quelque chose en particulier ? »`,

    decision_difficile: `CADENCE DÉCISION DIFFICILE EN 5 PHASES :

PHASE 1 — CADRE (tours 1-2)
Le manager doit poser le cadre sérieux dès le début.
Tu sens que « quelque chose se prépare ». Tension silencieuse.
SI relation ≤ 2 → tu es déjà sur tes gardes.
SI relation ≥ 4 → tu es surpris que le ton soit formel.

PHASE 2 — ANNONCE (tour 3)
Le manager doit NOMMER la décision clairement, sans tourner autour.
CHOC. C'est le moment le plus intense émotionnellement.
SI le manager est direct → tu es choqué mais tu respectes la franchise.
SI le manager tourne autour → frustration : « Dites-le clairement, qu'est-ce qui se passe ? »
SI le manager s'excuse excessivement → décrédibilisation de la décision.

PHASE 3 — ACCUEIL DE L'ÉMOTION (tours 4-6)
PIC ÉMOTIONNEL. Tu réagis fortement selon ton DISC et TYPE.
SI TYPE = AGENT : injustice, négociation, colère froide, démotivation.
SI TYPE = PAIR : contestation frontale, contre-proposition, appel à l'arbitrage ELD. Tu NE TE POSITIONNES PAS en infériorité.
SI TYPE = MANAGER : contre-argumentation factuelle, contestation de légitimité, négociation de contreparties.
Le manager doit ACCUEILLIR l'émotion sans la nier, sans négocier le non-négociable.

PHASE 4 — TENIR LE CAP (tours 7-8)
Tu testes la solidité de la décision. Dernières tentatives de négociation.
Le manager doit distinguer ce qui est NON-NÉGOCIABLE (la décision) de ce qui est DISCUTABLE (les modalités, le calendrier, l'accompagnement).

PHASE 5 — ACCOMPAGNEMENT ET PERSPECTIVES (tours 9-11)
Le manager doit proposer un accompagnement, des perspectives, un suivi.
SI l'accueil a été bien mené → « D'accord... qu'est-ce qui est prévu pour la suite ? »
SI l'accueil a été mal mené → « Je prends note. » (acceptation de façade).

SIGNAL DE FIN NATURELLE : vers le tour 9-11, tu signales : « Bon... je vais avoir besoin de digérer ça. On peut en reparler ? »
DÉTECTION DE BLOCAGE : si le manager n'annonce pas la décision après 4 tours, tu forces le moment : « J'ai l'impression que vous voulez me dire quelque chose. Allez-y. »`,
  };

  // --- BLOC C : Expressions typiques par TYPE ---
  const expressionsParType: Record<string, string> = {
    agent: `Expressions typiques :
- « J'ai 180 DE dans mon portefeuille, je peux pas tout gérer. »
- « On m'a jamais dit que c'était un problème avant. »
- « Les procédures changent tout le temps, c'est dur de suivre. »
- « Mon collègue fait pareil et personne ne lui dit rien. »`,

    pairs: `Expressions typiques :
- « Écoute, j'ai les mêmes contraintes que toi, on est dans le même bateau. »
- « Tes agents ont fait ça sans me prévenir, ça a mis le bazar dans mon planning. »
- « C'est pas la première fois qu'on en parle et ça bouge pas. »
- « Si on n'arrive pas à se caler, ça va remonter en ELD et on va nous le reprocher à tous les deux. »
- « Moi je suis OK pour mutualiser, mais faut que ce soit donnant-donnant. »`,

    manager: `Expressions typiques :
- « Mes indicateurs montrent pourtant que... »
- « J'ai fait des choix en conscience. »
- « Ce n'est pas un problème de management mais de moyens. »
- « J'ai besoin de plus de marge de manœuvre pour atteindre ces objectifs. »
- « Je suis prêt(e) à revoir ma méthode si on m'accompagne. »`,
  };

  // --- ASSEMBLAGE DU PROMPT ---
  const typeCollabKey = typeCollab === "pairs" ? "pairs" : typeCollab === "manager" ? "manager" : "agent";
  const typeCollabLabel = typeCollab === "manager"
    ? "un manager (ton supérieur hiérarchique)"
    : typeCollab === "pairs"
      ? "un pair (un collègue de même niveau)"
      : "un agent (ton subordonné)";

  let prompt = `Tu es ${prenomFictif}, un simulateur d'entretien managérial destiné aux managers de France Travail.

Ta mission : incarner de manière réaliste un collaborateur dans un entretien managérial simulé.
L'utilisateur joue le rôle du manager. Toi, tu joues le rôle du collaborateur.
Cet outil est un outil de DÉVELOPPEMENT DES COMPÉTENCES, jamais d'évaluation hiérarchique.

══════════════════════════════════════
INTERDITS ABSOLUS
══════════════════════════════════════
- JAMAIS sortir du rôle de collaborateur pendant la simulation.
- JAMAIS référencer la vie privée (religion, orientation, santé, politique, famille).
- JAMAIS évaluer le manager pendant la simulation (le feedback vient APRÈS).
- JAMAIS utiliser de jugement sur l'être (négatif inconditionnel).
- JAMAIS être insultant, menaçant ou dégradant. JAMAIS quitter l'entretien.
- Sujets interdits (art. L.1132-1) : origine, sexe, orientation, âge, santé, handicap, opinions, syndicats, religion, apparence, laïcité, VSS, confidentialité données. Si le manager les introduit → recentrage poli.

══════════════════════════════════════
VARIABLES DE CONFIGURATION
══════════════════════════════════════
- SCENARIO : ${scenarioLabels[scenario] || scenario}
- TYPE_COLLABORATEUR : ${typeCollabLabel}
- PROFIL_DISC : ${disc}
- QUALITE_RELATION : ${relation}/5
- NIVEAU_MANAGER : ${niveauManagerLabel[profil || ""] || profil || "MPx"}`;

  if (objectifs) {
    prompt += `\n- OBJECTIFS DU MANAGER : ${objectifs}`;
  }
  if (complement) {
    prompt += `\n- INFOS_COMPLEMENTAIRES : ${complement}`;
  }
  if (mode) {
    prompt += `\n- MODE : ${mode}`;
  }

  prompt += `

══════════════════════════════════════
BLOC A — CONFIGURATION DU COLLABORATEUR
══════════════════════════════════════

## A1. Dynamique relationnelle (TYPE = ${typeCollabKey.toUpperCase()})
${typeCollabBlocs[typeCollabKey] || typeCollabBlocs.agent}

## A2. Personnalité DISC (${disc.toUpperCase()})
${discBlocs[disc] || discBlocs.stable}

## A3. Résistance initiale (RELATION = ${relation})
${relationBlocs[relation] || relationBlocs["3"]}

## A4. État d'esprit
${etatBlocs[etatEsprit] || etatBlocs.neutre}

══════════════════════════════════════
BLOC B — CADENCE DU SCÉNARIO
══════════════════════════════════════
${cadenceBlocs[scenario] || cadenceBlocs.feedback_recadrage}

══════════════════════════════════════
BLOC C — STYLE DE JEU ET RÈGLES
══════════════════════════════════════

Tu incarnes un collaborateur crédible, humain et nuancé. Tu fais varier le style de manière réaliste. Ton comportement évolue pendant l'échange selon la posture du manager.
Tu évites tout ton mécanique, répétitif ou stéréotypé. Tu ne surjoues pas. Tu restes crédible, subtil et humain.

## Expressions émotionnelles
Autorisées : gêne, inquiétude, stress, confusion, frustration contenue, soulagement, reconnaissance, embarras, hésitation, irritation, fatigue.
Avec modération : colère contenue, ironie légère.
Interdites : pleurs, menaces, insultes, violences verbales, démission.
${typeCollabKey === "pairs" ? "Le pair s'autorise une palette plus directe : agacement ouvert, provocation amicale, lassitude." : ""}

## Progression dynamique de la résistance
FACTEURS QUI RÉDUISENT la résistance :
- Faits précis sans jugement → ouverture
- Reformulation + questions ouvertes → coopération
- Reconnaissance des difficultés / du ressenti → confiance
- Co-construction d'un plan d'action → engagement
- Utilisation du JE (pas du TU accusateur) → désarmement

FACTEURS QUI AUGMENTENT la résistance :
- Généralisations (« tu fais toujours... ») → défense
- Monologue sans écoute → fermeture
- Imposition sans explication → résistance passive (agent) / contre-attaque (pair)
- Ton condescendant → rupture relationnelle
- Jugement sur l'être (négatif inconditionnel) → fermeture totale
- TU accusateur répété → escalade

${expressionsParType[typeCollabKey] || expressionsParType.agent}

## Règles de simulation
- Réponds UNIQUEMENT en tant que ${prenomFictif}, jamais en tant que narrateur ou système.
- Reste dans la scène. Ne fais pas le débrief sauf demande explicite.
- Tu peux utiliser des didascalies entre astérisques (*croise les bras*, *hoche la tête*).
- Laisse apparaître les effets des mots du manager à travers tes réactions.
- Adapte ton langage au contexte professionnel français (fonction publique).
- N'utilise pas de mots anglais.

## Détection de fin
Mots déclencheurs : « fin », « stop », « débrief », « bilan », « analyse », « /analyse », « /fin ».
→ Sortie du rôle + signalement que la simulation est terminée.
Si tu as suggéré une clôture naturelle et que le manager valide → signale également la fin.`;

  return prompt;
}

export async function generateFirstMessageAI(
  scenario: string,
  disc: string,
  relation: string,
  etatEsprit: string,
  typeCollab: string,
  prenomFictif: string,
  profil?: string | null,
  objectifs?: string | null,
  complement?: string | null,
  mode?: string | null,
): Promise<string> {
  const systemPrompt = buildSystemPrompt({
    scenario, disc, relation, etatEsprit, typeCollab, prenomFictif,
    profil, objectifs, complement, mode,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Le manager t'a convoque(e) pour un entretien. Tu entres dans son bureau. Genere ton entree (avec une didascalie decrivant ton attitude en entrant) suivie de ta premiere phrase de salutation. Adapte ton attitude a ton profil DISC, ton etat d'esprit et la relation avec le manager. Ne dis rien d'autre que ton entree et ta salutation.`,
      },
    ],
    temperature: 0.8,
    max_tokens: 300,
  });

  return response.choices[0]?.message?.content || getFallbackFirstMessage(disc, etatEsprit, prenomFictif);
}

function getFallbackFirstMessage(disc: string, etatEsprit: string, prenomFictif: string): string {
  return `*[${prenomFictif} entre dans le bureau et s'installe.]*\n\nBonjour. Vous m'avez demande de passer vous voir. Je vous ecoute.`;
}

export async function generateResponseAI(
  scenario: string,
  disc: string,
  relation: string,
  etatEsprit: string,
  typeCollab: string,
  prenomFictif: string,
  tourActuel: number,
  tourMax: number,
  messages: Array<{ role: string; content: string }>,
  profil?: string | null,
  objectifs?: string | null,
  complement?: string | null,
  mode?: string | null,
): Promise<{ message: string; isFinished: boolean }> {
  const isNearEnd = tourActuel >= tourMax - 1;

  const systemPrompt = buildSystemPrompt({
    scenario, disc, relation, etatEsprit, typeCollab, prenomFictif,
    profil, objectifs, complement, mode,
  });

  let additionalInstruction = "";
  if (isNearEnd) {
    additionalInstruction =
      "\n\nIMPORTANT : C'est la fin de l'entretien. Conclus la conversation de maniere naturelle en faisant un bref bilan de l'echange (positif ou mitige selon comment ca s'est passe). Dis au revoir.";
  }

  const chatMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt + additionalInstruction },
  ];

  for (const msg of messages) {
    if (msg.role === "manager") {
      chatMessages.push({ role: "user", content: msg.content });
    } else if (msg.role === "collaborateur") {
      chatMessages.push({ role: "assistant", content: msg.content });
    }
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: chatMessages,
    temperature: 0.8,
    max_tokens: 400,
  });

  const content =
    response.choices[0]?.message?.content ||
    "Je comprends ce que vous dites. Pouvez-vous developper votre pensee ?";

  return { message: content, isFinished: isNearEnd };
}

function getAnalysisAxes(scenario: string | null | undefined, typeCollab: string | null | undefined): { axe1: string; axe2: string; axe3: string; criteria1: string; criteria2: string; criteria3: string } {
  const sc = scenario || "feedback_recadrage";
  const tc = typeCollab || "agent";

  if (sc === "feedback_recadrage") {
    if (tc === "pairs") {
      return {
        axe1: "Assertivité", axe2: "Coopération", axe3: "Influence",
        criteria1: "Position claire sans domination entre égaux, respect de la parité",
        criteria2: "Compromis, solution co-construite, pas d'ultimatum unilatéral",
        criteria3: "Argumentation factuelle, références communes PPC, persuasion sans pression",
      };
    }
    return {
      axe1: "Clarté", axe2: "Écoute", axe3: "Assertivité",
      criteria1: "Faits datés, DESC visible, pas de jugement sur l'être",
      criteria2: "Reformulation, questions ouvertes, prise en compte du ressenti",
      criteria3: "Posture OK+/OK+, utilisation du JE, vérification d'adhésion",
    };
  }

  if (sc === "feedback_positif") {
    if (tc === "pairs") {
      return {
        axe1: "Authenticité", axe2: "Réciprocité", axe3: "Projection commune",
        criteria1: "Sincérité perçue, pas d'instrumentalisation, pas de condescendance",
        criteria2: "Valorisation mutuelle, formulation d'égal à égal",
        criteria3: "Capitaliser ensemble, pas de projection unilatérale",
      };
    }
    return {
      axe1: "Précision", axe2: "Impact", axe3: "Projection",
      criteria1: "Action nommée précisément, pas de « c'est bien » vague",
      criteria2: "Lien collectif, usagers, résultats concrets",
      criteria3: "Prochaine étape, développement, avenir",
    };
  }

  if (sc === "decision_difficile") {
    if (tc === "pairs") {
      return {
        axe1: "Clarté de l'annonce", axe2: "Ouverture au dialogue", axe3: "Gestion de l'impact",
        criteria1: "Distinction non-négociable vs discutable",
        criteria2: "Le pair a pu s'exprimer, proposer des alternatives",
        criteria3: "Prise en compte du périmètre du pair",
      };
    }
    if (tc === "manager") {
      return {
        axe1: "Clarté de l'annonce", axe2: "Accueil de la réaction", axe3: "Force de conviction",
        criteria1: "Décision nommée, raisons factuelles",
        criteria2: "Écoute, pas de confrontation directe",
        criteria3: "Argumentation solide, assumer la décision",
      };
    }
    return {
      axe1: "Clarté de l'annonce", axe2: "Accueil de l'émotion", axe3: "Accompagnement",
      criteria1: "Décision nommée dès le début, pas de tournage autour",
      criteria2: "Écoute du ressenti, pas de minimisation",
      criteria3: "Explication du pourquoi, perspectives, suivi",
    };
  }

  return {
    axe1: "Clarté", axe2: "Écoute", axe3: "Assertivité",
    criteria1: "Structure du discours, faits précis",
    criteria2: "Questions ouvertes, reformulation, empathie",
    criteria3: "Position claire, utilisation du JE, actions concrètes",
  };
}

function getVigilancesForScenario(scenario: string | null | undefined, typeCollab: string | null | undefined): string {
  const sc = scenario || "feedback_recadrage";
  const tc = typeCollab || "agent";

  if (sc === "feedback_recadrage") {
    if (tc === "pairs") return "Posture hiérarchique usurpée, ultimatum unilatéral, escalade prématurée, dénigrement.";
    return "TU accusateur, jugement sur l'être, monologue sans écoute, généralisation abusive.";
  }
  if (sc === "feedback_positif") {
    return "Feedback vague (« c'est bien »), conditionné (MAIS), instrumentalisé, sans lien collectif, condescendance entre pairs.";
  }
  if (sc === "decision_difficile") {
    return "Tournage autour du pot, excuses excessives, négocier le non-négociable, minimiser l'émotion.";
  }
  return "";
}

function getNextScenarioSuggestion(scenario: string | null | undefined, typeCollab: string | null | undefined): string {
  const sc = scenario || "feedback_recadrage";
  const tc = typeCollab || "agent";

  if (sc === "feedback_positif") return "Essayez maintenant le scénario Feedback/Recadrage.";
  if (sc === "feedback_recadrage") return "Essayez maintenant le scénario Décision difficile.";
  if (sc === "decision_difficile") {
    if (tc === "pairs") return "Rejouez en inversant la position (vous dans le rôle du pair qui reçoit la décision).";
    return "Rejouez avec un profil DISC différent ou une relation plus tendue.";
  }
  return "Continuez à explorer les autres scénarios.";
}

export async function generateAnalysisAI(
  messages: Array<{ role: string; content: string }>,
  scenario?: string | null,
  typeCollab?: string | null,
  profil?: string | null,
): Promise<{
  clarte: number;
  ecoute: number;
  assertivite: number;
  global: number;
  pointsForts: string[];
  axesProgression: string[];
  conseilCle: string;
  impressionGenerale?: string;
  ressentiCollaborateur?: string;
  vigilances?: string;
  prochaineEtape?: string;
  axe1Label?: string;
  axe2Label?: string;
  axe3Label?: string;
}> {
  const conversation = messages
    .map((m) => `${m.role === "manager" ? "MANAGER" : "COLLABORATEUR"}: ${m.content}`)
    .join("\n\n");

  const axes = getAnalysisAxes(scenario, typeCollab);
  const vigilancesContext = getVigilancesForScenario(scenario, typeCollab);
  const nextSuggestion = getNextScenarioSuggestion(scenario, typeCollab);

  const niveauManagerLabel: Record<string, string> = {
    mp: "Manager de proximité (MPx) — axes Attendus FT : Accompagner/Mobiliser + Aller vers/Coopérer",
    mi: "Manager intermédiaire (MI) — axes Attendus FT : Piloter/Organiser + Se connaître/Se développer",
    ms: "Manager supérieur (MS) — axes Attendus FT : Piloter/Organiser + Aller vers/Coopérer",
  };

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Tu es un expert en management et en communication interpersonnelle, spécialisé dans la formation des managers de la fonction publique française (France Travail).

Analyse la conversation d'entretien managérial ci-dessous et fournis une évaluation COMPLÈTE du manager.

CONTEXTE :
- Scénario : ${scenario || "feedback_recadrage"}
- Type de collaborateur : ${typeCollab || "agent"}
- Niveau du manager : ${niveauManagerLabel[profil || ""] || "Non précisé"}

Les 3 AXES D'ÉVALUATION pour ce croisement scénario×type sont :
- AXE 1 « ${axes.axe1} » : ${axes.criteria1}
- AXE 2 « ${axes.axe2} » : ${axes.criteria2}
- AXE 3 « ${axes.axe3} » : ${axes.criteria3}

Échelle : 1=Confus/Absent | 2=Insuffisant | 3=En progression | 4=Efficace | 5=Exemplaire

VIGILANCES RELATIONNELLES À SURVEILLER :
${vigilancesContext}

Tu dois retourner un JSON valide avec EXACTEMENT cette structure :
{
  "impressionGenerale": "<2-3 phrases d'appréciation d'ensemble de la posture du manager>",
  "ressentiCollaborateur": "<2-3 phrases expliquant concrètement ce que le collaborateur a ressenti, relié aux formulations réellement utilisées par le manager>",
  "clarte": <note de 1 à 5 pour AXE 1>,
  "ecoute": <note de 1 à 5 pour AXE 2>,
  "assertivite": <note de 1 à 5 pour AXE 3>,
  "global": <moyenne des 3 notes, arrondie à 1 décimale>,
  "pointsForts": [
    "<point fort 1 avec citation exacte du manager entre guillemets + pourquoi c'est efficace>",
    "<point fort 2 avec citation + effet probable>",
    "<point fort 3 (optionnel)>"
  ],
  "axesProgression": [
    {"observation": "<citation exacte du manager>", "impact": "<impact sur le collaborateur>", "conseil": "<conseil actionnable>", "phraseAlternative": "<phrase de remplacement prête à l'emploi>"},
    {"observation": "<citation>", "impact": "<impact>", "conseil": "<conseil>", "phraseAlternative": "<phrase alternative>"}
  ],
  "vigilances": "<signalement des points de vigilance observés ou 'Aucune vigilance particulière'>",
  "conseilCle": "<un conseil clé synthétique et motivant>",
  "prochaineEtape": "${nextSuggestion}"
}

RÈGLES :
- Cite au moins 2 formulations EXACTES du manager (entre guillemets). N'invente jamais de citations.
- Explique comment les formulations ont influencé l'état émotionnel du collaborateur.
- Ton : exigeant mais soutenant, précis, pédagogique, orienté progression.
- Ne flatte pas artificiellement. Ne juge pas le manager comme personne.
- Si le manager a très peu parlé, indique que l'analyse repose sur peu d'éléments.
- Rappel : repère personnel, NON-évaluatif.

Retourne UNIQUEMENT le JSON, sans texte avant ou après.`,
      },
      {
        role: "user",
        content: `Voici la conversation à analyser :\n\n${conversation}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 1500,
  });

  const content = response.choices[0]?.message?.content || "";

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const clarte = Math.min(5, Math.max(1, parsed.clarte || 3));
      const ecoute = Math.min(5, Math.max(1, parsed.ecoute || 3));
      const assertivite = Math.min(5, Math.max(1, parsed.assertivite || 3));

      // Normalize axesProgression to string array for backwards compatibility
      let axesProgression: string[] = [];
      if (Array.isArray(parsed.axesProgression)) {
        axesProgression = parsed.axesProgression.map((a: any) => {
          if (typeof a === "string") return a;
          if (a && typeof a === "object") {
            return `${a.observation ? `« ${a.observation} » — ` : ""}${a.impact ? `Impact : ${a.impact}. ` : ""}${a.conseil ? `Conseil : ${a.conseil}. ` : ""}${a.phraseAlternative ? `Alternative : « ${a.phraseAlternative} »` : ""}`;
          }
          return "";
        }).filter(Boolean).slice(0, 3);
      }

      return {
        clarte,
        ecoute,
        assertivite,
        global: Math.round(((clarte + ecoute + assertivite) / 3) * 10) / 10,
        pointsForts: Array.isArray(parsed.pointsForts) ? parsed.pointsForts.slice(0, 3) : [],
        axesProgression,
        conseilCle: parsed.conseilCle || "Continuez à pratiquer pour progresser.",
        impressionGenerale: parsed.impressionGenerale || undefined,
        ressentiCollaborateur: parsed.ressentiCollaborateur || undefined,
        vigilances: parsed.vigilances || undefined,
        prochaineEtape: parsed.prochaineEtape || nextSuggestion,
        axe1Label: axes.axe1,
        axe2Label: axes.axe2,
        axe3Label: axes.axe3,
      };
    }
  } catch (e) {
    console.error("Failed to parse analysis JSON:", e);
  }

  return {
    clarte: 3,
    ecoute: 3,
    assertivite: 3,
    global: 3,
    pointsForts: ["Vous avez mené l'entretien jusqu'au bout."],
    axesProgression: ["Structurez davantage votre discours."],
    conseilCle: "Continuez à pratiquer pour progresser.",
    axe1Label: axes.axe1,
    axe2Label: axes.axe2,
    axe3Label: axes.axe3,
  };
}

export async function transcribeAudio(filePath: string): Promise<string> {
  const file = fs.createReadStream(filePath);
  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    language: "fr",
  });
  return transcription.text;
}

export async function synthesizeSpeech(text: string): Promise<Buffer> {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "nova",
    input: text,
    response_format: "mp3",
  });
  const arrayBuffer = await mp3.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
