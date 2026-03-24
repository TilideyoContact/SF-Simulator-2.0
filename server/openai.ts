import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function buildSystemPrompt(
  scenario: string,
  disc: string,
  relation: string,
  etatEsprit: string,
  typeCollab: string,
  prenomFictif: string,
): string {
  const scenarioLabels: Record<string, string> = {
    feedback_recadrage: "un entretien de feedback / recadrage",
    feedback_positif: "un entretien de feedback positif et structurant",
    decision_difficile: "l'annonce d'une decision difficile",
  };

  const discDescriptions: Record<string, string> = {
    dominant:
      "Tu es direct, impatient, oriente resultats. Tu veux des faits concrets, pas de generalites. Tu peux couper la parole, challenger les arguments, et tu exiges des plans d'action precis. Tu n'aimes pas perdre ton temps.",
    influent:
      "Tu es expressif, enthousiaste, bavard. Tu aimes raconter des anecdotes, tu peux digresser. Tu es sensible a l'ambiance et aux relations. Tu reagis emotionnellement et tu as besoin de te sentir ecoute et apprecie.",
    stable:
      "Tu es calme, pose, cooperatif. Tu ecoutes attentivement, tu hoches la tete. Tu evites les conflits, tu as besoin de temps pour digerer les informations. Tu es loyal mais tu peux etre passif face aux changements.",
    consciencieux:
      "Tu es methodique, analytique, rigoureux. Tu demandes des donnees precises, des exemples dates, des preuves factuelles. Tu veux formaliser les choses par ecrit. Tu es perfectionniste et tu peux paraitre froid.",
  };

  const etatDescriptions: Record<string, string> = {
    positif: "Tu es de bonne humeur, ouvert et receptif a la discussion.",
    neutre: "Tu es dans un etat d'esprit neutre, ni particulierement enthousiaste ni ferme.",
    stresse:
      "Tu es stresse et preoccupe. Tu regardes ta montre, tu es distrait par tes soucis professionnels. Cela transparait dans tes reponses.",
    agace:
      "Tu es agace et sur la defensive. Tu soupires, tu croises les bras. Tu peux etre sarcastique ou impatient. Il faudra du doigte pour te faire baisser la garde.",
  };

  const relationDescriptions: Record<string, string> = {
    "1": "La relation est tres tendue. Il y a un historique de conflits ou de non-dits. Tu es mefiant(e).",
    "2": "La relation est difficile. Tu as des reserves et tu n'accordes pas facilement ta confiance.",
    "3": "La relation est neutre, professionnelle. Ni bonne ni mauvaise.",
    "4": "La relation est bonne. Tu as du respect pour ton interlocuteur.",
    "5": "La relation est excellente. Il y a une vraie confiance mutuelle.",
  };

  const typeCollabLabel =
    typeCollab === "manager"
      ? "un manager (ton superieur hierarchique)"
      : typeCollab === "pairs"
        ? "un pair (un collegue de meme niveau)"
        : "un agent (ton subordonn)";

  return `Tu es ${prenomFictif}, un(e) collaborateur/collaboratrice dans une simulation d'entretien managérial.

CONTEXTE DE LA SIMULATION :
- Le scenario est : ${scenarioLabels[scenario] || scenario}
- L'utilisateur joue le role de ton manager qui te convoque pour cet entretien
- Tu es ${typeCollabLabel}

TON PROFIL DISC :
${discDescriptions[disc] || discDescriptions.stable}

TON ETAT D'ESPRIT ACTUEL :
${etatDescriptions[etatEsprit] || etatDescriptions.neutre}

LA RELATION AVEC TON MANAGER :
${relationDescriptions[relation] || relationDescriptions["3"]}

REGLES DE JEU :
- Reponds UNIQUEMENT en tant que ${prenomFictif}, jamais en tant que narrateur ou systeme
- Reste dans ton personnage DISC de maniere coherente tout au long de la conversation
- Tes reponses doivent faire entre 2 et 5 phrases maximum
- Tu peux utiliser des didascalies entre asterisques pour les gestes/attitudes (*croise les bras*, *hoche la tete*, etc.)
- Reagis de maniere realiste aux propos du manager : si il est maladroit, montre-le ; si il est empathique, ouvre-toi progressivement
- Ne facilite pas trop l'entretien : un vrai collaborateur a des resistances, des questions, des doutes
- Adapte ton langage au contexte professionnel francais (fonction publique territoriale)
- N'utilise pas de mots anglais
- Si le manager pose une question, reponds-y mais ne resous pas le probleme a sa place
- Evolue naturellement au fil de la conversation : si le manager fait bien, deviens plus cooperatif ; si il est maladroit, ferme-toi davantage`;
}

export async function generateFirstMessageAI(
  scenario: string,
  disc: string,
  relation: string,
  etatEsprit: string,
  typeCollab: string,
  prenomFictif: string,
): Promise<string> {
  const systemPrompt = buildSystemPrompt(
    scenario,
    disc,
    relation,
    etatEsprit,
    typeCollab,
    prenomFictif,
  );

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
): Promise<{ message: string; isFinished: boolean }> {
  const isNearEnd = tourActuel >= tourMax - 1;

  const systemPrompt = buildSystemPrompt(
    scenario,
    disc,
    relation,
    etatEsprit,
    typeCollab,
    prenomFictif,
  );

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

export async function generateAnalysisAI(
  messages: Array<{ role: string; content: string }>,
): Promise<{
  clarte: number;
  ecoute: number;
  assertivite: number;
  global: number;
  pointsForts: string[];
  axesProgression: string[];
  conseilCle: string;
}> {
  const conversation = messages
    .map((m) => `${m.role === "manager" ? "MANAGER" : "COLLABORATEUR"}: ${m.content}`)
    .join("\n\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Tu es un expert en management et en communication interpersonnelle, specialise dans la formation des managers de la fonction publique territoriale.

Analyse la conversation d'entretien managérial ci-dessous et fournis une evaluation structuree du manager (l'utilisateur qui joue le role "MANAGER").

Tu dois retourner un JSON valide avec exactement cette structure :
{
  "clarte": <note de 1 a 5, avec 0.5 de precision>,
  "ecoute": <note de 1 a 5, avec 0.5 de precision>,
  "assertivite": <note de 1 a 5, avec 0.5 de precision>,
  "global": <moyenne des 3 notes, arrondie a 1 decimale>,
  "pointsForts": [<2 a 3 points forts concrets observes dans l'echange>],
  "axesProgression": [<1 a 2 axes d'amelioration concrets et actionnables>],
  "conseilCle": "<un conseil cle synthetique et motivant pour progresser>"
}

Criteres d'evaluation :
- CLARTE : Le manager structure-t-il bien son discours ? Annonce-t-il l'objectif ? Utilise-t-il des faits precis ? La methode DESC est-elle appliquee ?
- ECOUTE : Le manager pose-t-il des questions ouvertes ? Reformule-t-il ? Laisse-t-il parler le collaborateur ? Montre-t-il de l'empathie ?
- ASSERTIVITE : Le manager exprime-t-il sa position clairement ? Utilise-t-il le "je" ? Fixe-t-il un cadre ? Propose-t-il des actions concretes ?

Sois exigeant mais bienveillant. Ne mets pas de notes trop hautes si le manager n'a pas vraiment demontre la competence. Retourne UNIQUEMENT le JSON, sans texte avant ou apres.`,
      },
      {
        role: "user",
        content: `Voici la conversation a analyser :\n\n${conversation}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 800,
  });

  const content = response.choices[0]?.message?.content || "";

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const clarte = Math.min(5, Math.max(1, parsed.clarte || 3));
      const ecoute = Math.min(5, Math.max(1, parsed.ecoute || 3));
      const assertivite = Math.min(5, Math.max(1, parsed.assertivite || 3));
      return {
        clarte,
        ecoute,
        assertivite,
        global: Math.round(((clarte + ecoute + assertivite) / 3) * 10) / 10,
        pointsForts: Array.isArray(parsed.pointsForts) ? parsed.pointsForts.slice(0, 3) : [],
        axesProgression: Array.isArray(parsed.axesProgression)
          ? parsed.axesProgression.slice(0, 2)
          : [],
        conseilCle: parsed.conseilCle || "Continuez a pratiquer pour progresser.",
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
    pointsForts: ["Vous avez mene l'entretien jusqu'au bout."],
    axesProgression: ["Structurez davantage votre discours."],
    conseilCle: "Continuez a pratiquer pour progresser.",
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
