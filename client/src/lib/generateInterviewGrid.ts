import { jsPDF } from 'jspdf';

const BLUE = '#000091';
const RED = '#E1000F';
const GREEN = '#18753C';
const GREY_BG = '#F6F6F6';
const GREY_BORDER = '#CECECE';
const BLUE_LIGHT = '#E3E3FD';
const WHITE = '#FFFFFF';

const SCENARIO_LABELS: Record<string, string> = {
  feedback_recadrage: 'Feedback / Recadrage',
  feedback_positif: 'Feedback positif',
  decision_difficile: 'Décision difficile',
};

const PREPARATION_ROWS: Record<string, string[]> = {
  feedback_recadrage: [
    'Faits concrets observés\n(datés, précis, sans jugement)',
    'Règle ou procédure concernée',
    'Impact constaté\n(sur l\'équipe, le service, les usagers)',
    'Objectif visé pour cet entretien',
    'Ce qui se passe si rien ne change',
  ],
  feedback_positif: [
    'Action ou comportement à valoriser\n(précis, daté)',
    'Impact positif constaté\n(équipe, usagers, résultats)',
    'Compétence ou valeur illustrée',
    'Objectif de l\'entretien',
    'Projection envisagée\n(développement, responsabilités)',
  ],
  decision_difficile: [
    'Décision à annoncer\n(claire, factuelle)',
    'Raisons de la décision\n(contexte, contraintes)',
    'Impact sur le collaborateur',
    'Ce qui est non-négociable vs discutable',
    'Accompagnement prévu',
  ],
};

const METHOD_NAMES: Record<string, string> = {
  feedback_recadrage: 'DESC',
  feedback_positif: 'MERCI',
  decision_difficile: 'Annonce structurée',
};

const DURING_STEPS: Record<string, Array<{ step: string; detail: string }>> = {
  feedback_recadrage: [
    { step: 'D — Faits', detail: 'Décrire' },
    { step: 'E — Ressenti', detail: 'Exprimer en JE' },
    { step: 'S — Solution', detail: 'Co-construire' },
    { step: 'C — Conclusion', detail: 'Engager' },
  ],
  feedback_positif: [
    { step: 'M — Mentionner', detail: 'l\'action précise' },
    { step: 'E — Expliquer', detail: 'l\'impact' },
    { step: 'R — Relier', detail: 'à l\'équipe/valeurs' },
    { step: 'C — Conclure', detail: 'projeter' },
    { step: 'I — Impliquer', detail: 'prochaine étape' },
  ],
  decision_difficile: [
    { step: 'Cadrer', detail: 'poser le contexte' },
    { step: 'Annoncer', detail: 'nommer la décision' },
    { step: 'Accueillir', detail: 'écouter la réaction' },
    { step: 'Tenir', detail: 'rester ferme' },
    { step: 'Accompagner', detail: 'perspectives' },
  ],
};

const PHRASES: Record<string, Array<{ label: string; phrase: string }>> = {
  feedback_recadrage: [
    { label: 'Ouvrir l\'entretien', phrase: '« J\'aimerais qu\'on prenne un moment pour discuter de quelque chose que j\'ai observé. »' },
    { label: 'Décrire les faits', phrase: '« Le [date], lors de [contexte], j\'ai constaté que [fait précis et observable]. »' },
    { label: 'Exprimer le ressenti', phrase: '« Ce que ça génère pour moi / pour l\'équipe, c\'est [impact concret]. »' },
    { label: 'Écouter', phrase: '« Comment tu vois les choses de ton côté ? », « Qu\'est-ce qui s\'est passé selon toi ? »' },
    { label: 'Co-construire', phrase: '« Qu\'est-ce qu\'on pourrait mettre en place ensemble pour que ça s\'améliore ? »' },
    { label: 'Conclure', phrase: '« Je te remercie pour cet échange. On se revoit le [date] pour faire le point ensemble. »' },
  ],
  feedback_positif: [
    { label: 'Ouvrir', phrase: '« J\'aimerais prendre un moment pour te parler de quelque chose que j\'ai remarqué. »' },
    { label: 'Valoriser', phrase: '« Le [date], quand tu as [action précise], j\'ai trouvé ça particulièrement efficace. »' },
    { label: 'Impact', phrase: '« Concrètement, ça a permis de [impact sur l\'équipe/les usagers]. »' },
    { label: 'Projeter', phrase: '« C\'est exactement le type d\'initiative que j\'aimerais voir se développer. »' },
    { label: 'Impliquer', phrase: '« Comment tu vois la suite ? Qu\'est-ce qui t\'aiderait à aller encore plus loin ? »' },
    { label: 'Conclure', phrase: '« Merci pour cet échange. Continue comme ça, c\'est vraiment précieux pour l\'équipe. »' },
  ],
  decision_difficile: [
    { label: 'Ouvrir', phrase: '« Merci d\'avoir pris ce temps. J\'ai quelque chose d\'important à t\'annoncer. »' },
    { label: 'Annoncer', phrase: '« La décision qui a été prise est [décision claire et factuelle]. »' },
    { label: 'Accueillir', phrase: '« Je comprends que ça puisse être difficile à entendre. Comment tu réagis ? »' },
    { label: 'Tenir', phrase: '« Cette décision n\'est pas négociable, mais je veux qu\'on trouve ensemble comment avancer. »' },
    { label: 'Accompagner', phrase: '« Voilà ce que je te propose pour la suite : [mesures concrètes]. »' },
    { label: 'Conclure', phrase: '« On se revoit le [date] pour faire le point. Je reste disponible si tu as besoin. »' },
  ],
};

function drawHeader(doc: jsPDF, pageLabel: string) {
  const pw = 210;
  const m = 15;
  doc.setFillColor(GREY_BG);
  doc.rect(0, 0, pw, 16, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(BLUE);
  doc.text('FRANCE TRAVAIL', m, 10);
  doc.setTextColor('#333333');
  doc.setFont('Helvetica', 'normal');
  doc.text('SimuManager — Grille d\'entretien', pw / 2, 10, { align: 'center' });
  doc.setTextColor(RED);
  doc.setFont('Helvetica', 'bold');
  doc.text(pageLabel, pw - m, 10, { align: 'right' });
}

function drawFooter(doc: jsPDF) {
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor('#999999');
  doc.text('SimuManager — ChatFT × France Travail | Développement des compétences managériales | Document confidentiel — ne pas diffuser', 105, 290, { align: 'center' });
}

function drawSectionBanner(doc: jsPDF, y: number, text: string, color: string): number {
  doc.setFillColor(color);
  doc.rect(15, y, 180, 7, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(WHITE);
  doc.text(text, 17, y + 5);
  return y + 9;
}

function drawTableRow(doc: jsPDF, y: number, label: string, valueWidth: number, rowHeight: number): number {
  const m = 15;
  const labelWidth = 60;
  doc.setFillColor(BLUE_LIGHT);
  doc.rect(m, y, labelWidth, rowHeight, 'FD');
  doc.setFillColor(WHITE);
  doc.rect(m + labelWidth, y, valueWidth, rowHeight, 'FD');

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor('#333333');

  const lines = doc.splitTextToSize(label, labelWidth - 4);
  let textY = y + 4;
  for (const line of lines) {
    doc.text(line, m + 2, textY);
    textY += 3.5;
  }
  return y + rowHeight;
}

export function generateInterviewGrid(scenario: string) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const m = 15;
  const pw = 210;
  const cw = pw - m * 2;
  const scenarioLabel = SCENARIO_LABELS[scenario] || 'Feedback / Recadrage';
  const methodName = METHOD_NAMES[scenario] || 'DESC';

  doc.setDrawColor(GREY_BORDER);
  doc.setLineWidth(0.3);

  drawHeader(doc, 'Grille de préparation');

  let y = 22;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(BLUE);
  doc.text(`Grille d'entretien — ${scenarioLabel}`, m, y);
  y += 6;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor('#666666');
  const subtitle = 'Remplissez cette grille avant et pendant votre entretien réel pour structurer votre échange. L\'aide-mémoire méthodologique est en page suivante.';
  const subLines = doc.splitTextToSize(subtitle, cw);
  for (const line of subLines) {
    doc.text(line, m, y);
    y += 3.5;
  }
  y += 3;

  doc.setDrawColor(GREY_BORDER);
  const halfW = cw / 2;
  const infoH = 8;
  doc.rect(m, y, halfW, infoH);
  doc.rect(m + halfW, y, halfW, infoH);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor('#333333');
  doc.text('Date :', m + 2, y + 5);
  doc.text('Collaborateur :', m + halfW + 2, y + 5);
  y += infoH;
  doc.rect(m, y, halfW, infoH);
  doc.rect(m + halfW, y, halfW, infoH);
  doc.text('Lieu :', m + 2, y + 5);
  doc.text('Durée prévue :', m + halfW + 2, y + 5);
  y += infoH;
  doc.rect(m, y, cw, infoH);
  doc.text('But de l\'entretien :', m + 2, y + 5);
  y += infoH + 4;

  y = drawSectionBanner(doc, y, 'AVANT L\'ENTRETIEN — Préparation (J-2 minimum)', BLUE);
  y += 1;

  const prepRows = PREPARATION_ROWS[scenario] || PREPARATION_ROWS.feedback_recadrage;
  const valueWidth = cw - 60;
  for (const row of prepRows) {
    const lineCount = doc.splitTextToSize(row, 56).length;
    const rowH = Math.max(10, lineCount * 4 + 4);
    y = drawTableRow(doc, y, row, valueWidth, rowH);
  }
  y += 3;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor('#333333');
  doc.text('Profil probable', m, y + 3);
  const checks1 = ['Direct/Décideur', 'Expressif/Relationnel', 'Stable/Prudent', 'Analytique/Rigoureux'];
  let cx = m + 28;
  for (const c of checks1) {
    doc.rect(cx, y, 3, 3);
    doc.text(c, cx + 4, y + 2.5);
    cx += 38;
  }
  y += 6;
  doc.text('État d\'esprit', m, y + 3);
  const checks2 = ['Positif', 'Neutre', 'Stressé', 'Agacé'];
  cx = m + 28;
  for (const c of checks2) {
    doc.rect(cx, y, 3, 3);
    doc.text(c, cx + 4, y + 2.5);
    cx += 38;
  }
  y += 8;

  y = drawSectionBanner(doc, y, `PENDANT L'ENTRETIEN — Méthode ${methodName}`, BLUE);
  y += 1;

  const duringSteps = DURING_STEPS[scenario] || DURING_STEPS.feedback_recadrage;
  const colWidths = [30, 55, 45, 50];
  const headers = ['Étape', 'Ce que je prévois de dire / faire', 'Réaction anticipée', 'Notes pendant'];
  doc.setFillColor(BLUE_LIGHT);
  let hx = m;
  for (let i = 0; i < 4; i++) {
    doc.rect(hx, y, colWidths[i], 7, 'FD');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(BLUE);
    doc.text(headers[i], hx + 2, y + 4.5);
    hx += colWidths[i];
  }
  y += 7;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor('#333333');
  const stepRowH = 14;
  for (const s of duringSteps) {
    hx = m;
    for (let i = 0; i < 4; i++) {
      doc.rect(hx, y, colWidths[i], stepRowH);
      hx += colWidths[i];
    }
    doc.setFont('Helvetica', 'bold');
    doc.text(s.step, m + 2, y + 5);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(s.detail, m + 2, y + 9);
    doc.setFontSize(7.5);
    y += stepRowH;
  }
  y += 4;

  y = drawSectionBanner(doc, y, 'APRÈS L\'ENTRETIEN — Formaliser et suivre', GREEN);
  y += 1;

  const afterCols = [65, 35, 35, 45];
  const afterHeaders = ['Engagements pris', 'Par qui', 'Échéance', 'Fait'];
  doc.setFillColor('#E8F5E9');
  hx = m;
  for (let i = 0; i < 4; i++) {
    doc.rect(hx, y, afterCols[i], 6, 'FD');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(GREEN);
    doc.text(afterHeaders[i], hx + 2, y + 4);
    hx += afterCols[i];
  }
  y += 6;

  for (let r = 0; r < 3; r++) {
    hx = m;
    for (let i = 0; i < 4; i++) {
      doc.rect(hx, y, afterCols[i], 7);
      hx += afterCols[i];
    }
    doc.rect(hx - afterCols[3] + afterCols[3] - 8, y + 1.5, 3, 3);
    y += 7;
  }
  y += 2;

  doc.setFillColor(GREY_BG);
  doc.rect(m, y, cw, 14, 'FD');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor('#333333');
  doc.text('Mon auto-évaluation — Ce qui a fonctionné / ce que j\'améliorerai la prochaine fois :', m + 2, y + 4);

  drawFooter(doc);

  doc.addPage();

  drawHeader(doc, 'Aide-mémoire');
  y = 22;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(BLUE);
  doc.text(`Aide-mémoire — ${scenarioLabel}`, m, y);
  y += 6;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor('#666666');
  doc.text('Gardez cette page sous les yeux pendant l\'entretien. Elle résume la méthode, la posture et les formulations clés.', m, y);
  y += 6;

  if (scenario === 'feedback_recadrage') {
    y = drawSectionBanner(doc, y, 'MÉTHODE DESC — Les 4 étapes', BLUE);
    y += 2;

    const descSteps = [
      { letter: 'D', title: 'Décrire', sub: 'les faits', desc: 'Datés, précis,\nobservables,\nsans jugement.\nPas d\'interprétation.' },
      { letter: 'E', title: 'Exprimer', sub: 'le ressenti (JE)', desc: 'Impact sur le service,\nl\'équipe, les usagers.\nUtiliser le « JE »,\njamais le « TU ».' },
      { letter: 'S', title: 'Spécifier', sub: 'les changements', desc: 'Attendus clairs et\nmesurables. Idéalement\nco-construits avec\nle collaborateur.' },
      { letter: 'C', title: 'Conséquences', sub: 'positives', desc: 'Bénéfices pour tous :\ncollaborateur, équipe,\nusagers. Engagement\nmutuel et suivi.' },
    ];
    const stepW = cw / 4;
    for (let i = 0; i < 4; i++) {
      const sx = m + i * stepW;
      doc.setFillColor(BLUE_LIGHT);
      doc.rect(sx, y, stepW - 2, 38, 'FD');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(BLUE);
      doc.text(descSteps[i].letter, sx + stepW / 2 - 1, y + 8, { align: 'center' });

      doc.setFontSize(9);
      doc.text(descSteps[i].title, sx + stepW / 2 - 1, y + 13, { align: 'center' });

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor('#666666');
      doc.text(descSteps[i].sub, sx + stepW / 2 - 1, y + 17, { align: 'center' });

      doc.setFontSize(6.5);
      doc.setTextColor('#333333');
      const descLines = descSteps[i].desc.split('\n');
      let dy = y + 22;
      for (const dl of descLines) {
        doc.text(dl, sx + stepW / 2 - 1, dy, { align: 'center' });
        dy += 3.5;
      }
    }
    y += 42;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor('#333333');
    doc.text('Variante DEPAR (pour des situations nécessitant plus de suivi) :', m, y);
    y += 4;

    const deparSteps = [
      { title: 'Décrire', sub: 'La situation\nobjectivement' },
      { title: 'Exprimer', sub: 'L\'impact\nen « JE »' },
      { title: 'Proposer', sub: 'Une solution\nconcrète' },
      { title: 'Accord', sub: 'Valider\nensemble' },
      { title: 'Résultats', sub: 'Suivre et\névaluer' },
    ];
    const dw = cw / 5;
    for (let i = 0; i < 5; i++) {
      const dx = m + i * dw;
      doc.setFillColor(BLUE_LIGHT);
      doc.rect(dx, y, dw - 2, 18, 'FD');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(BLUE);
      doc.text(deparSteps[i].title, dx + dw / 2 - 1, y + 5, { align: 'center' });
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor('#333333');
      const sLines = deparSteps[i].sub.split('\n');
      let sy = y + 10;
      for (const sl of sLines) {
        doc.text(sl, dx + dw / 2 - 1, sy, { align: 'center' });
        sy += 3;
      }
    }
    y += 22;
  } else if (scenario === 'feedback_positif') {
    y = drawSectionBanner(doc, y, 'MÉTHODE MERCI — Les 5 étapes', BLUE);
    y += 2;

    const merciSteps = [
      { letter: 'M', title: 'Mentionner', sub: 'l\'action précise', desc: 'Citer un fait précis,\ndaté, observable.\nPas de généralité.' },
      { letter: 'E', title: 'Expliquer', sub: 'l\'impact', desc: 'Impact concret sur\nl\'équipe, les usagers,\nle service.' },
      { letter: 'R', title: 'Relier', sub: 'aux valeurs', desc: 'Connecter à une\ncompétence, une valeur\nou un objectif collectif.' },
      { letter: 'C', title: 'Conclure', sub: 'projeter', desc: 'Ouvrir des perspectives\nd\'évolution ou de\nresponsabilités.' },
      { letter: 'I', title: 'Impliquer', sub: 'prochaine étape', desc: 'Demander comment\naccompagner,\nco-construire la suite.' },
    ];
    const stepW = cw / 5;
    for (let i = 0; i < 5; i++) {
      const sx = m + i * stepW;
      doc.setFillColor(BLUE_LIGHT);
      doc.rect(sx, y, stepW - 2, 36, 'FD');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(BLUE);
      doc.text(merciSteps[i].letter, sx + stepW / 2 - 1, y + 8, { align: 'center' });

      doc.setFontSize(8);
      doc.text(merciSteps[i].title, sx + stepW / 2 - 1, y + 13, { align: 'center' });

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor('#666666');
      doc.text(merciSteps[i].sub, sx + stepW / 2 - 1, y + 17, { align: 'center' });

      doc.setTextColor('#333333');
      const descLines = merciSteps[i].desc.split('\n');
      let dy = y + 22;
      for (const dl of descLines) {
        doc.text(dl, sx + stepW / 2 - 1, dy, { align: 'center' });
        dy += 3.5;
      }
    }
    y += 40;
  } else {
    y = drawSectionBanner(doc, y, 'MÉTHODE D\'ANNONCE — Les 5 phases', BLUE);
    y += 2;

    const annSteps = [
      { title: 'Cadrer', sub: 'poser le contexte', desc: 'Rappeler le cadre,\nla raison de l\'entretien.\nPoser le sérieux.' },
      { title: 'Annoncer', sub: 'nommer la décision', desc: 'Être clair et direct.\nNe pas tourner autour\ndu pot. Factuel.' },
      { title: 'Accueillir', sub: 'écouter la réaction', desc: 'Laisser le temps.\nNe pas minimiser.\nReformuler.' },
      { title: 'Tenir', sub: 'rester ferme', desc: 'La décision n\'est\npas négociable.\nRester empathique.' },
      { title: 'Accompagner', sub: 'perspectives', desc: 'Proposer un suivi.\nMesures concrètes.\nRester disponible.' },
    ];
    const stepW = cw / 5;
    for (let i = 0; i < 5; i++) {
      const sx = m + i * stepW;
      doc.setFillColor(BLUE_LIGHT);
      doc.rect(sx, y, stepW - 2, 36, 'FD');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(BLUE);
      doc.text(annSteps[i].title, sx + stepW / 2 - 1, y + 8, { align: 'center' });

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor('#666666');
      doc.text(annSteps[i].sub, sx + stepW / 2 - 1, y + 13, { align: 'center' });

      doc.setTextColor('#333333');
      const descLines = annSteps[i].desc.split('\n');
      let dy = y + 19;
      for (const dl of descLines) {
        doc.text(dl, sx + stepW / 2 - 1, dy, { align: 'center' });
        dy += 3.5;
      }
    }
    y += 40;
  }

  y += 2;
  y = drawSectionBanner(doc, y, 'POSTURE MANAGÉRIALE — OK+/OK+', BLUE);
  y += 1;

  const doItems = [
    '✓ Posture OK+/OK+ — respect mutuel, ni soumission ni domination',
    '✓ Écoute active — reformuler ce que dit le collaborateur avant de répondre',
    '✓ Utiliser le JE — « je constate que... », « ce que ça génère chez moi... »',
    '✓ Laisser des silences — ne pas combler, laisser le temps de réfléchir',
    '✓ Co-construire — impliquer dans la recherche de solutions',
    '✓ Vérifier l\'adhésion — « comment tu vois les choses de ton côté ? »',
  ];
  const dontItems = [
    '✗ TU accusateur — « tu fais toujours... », « tu n\'es pas... »',
    '✗ Généralisations — « jamais », « toujours », « tout le monde dit que »',
    '✗ Jugement sur l\'être — « tu es incompétent / paresseux »',
    '✗ Monologue — parler sans écouter, couper la parole',
    '✗ Condescendance — ton paternaliste ou infantilisant',
    '✗ Minimiser — « c\'est pas grave », « tu exagères »',
  ];

  const postureHalfW = cw / 2;
  doc.setFillColor('#E8F5E9');
  doc.rect(m, y, postureHalfW, 7, 'FD');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(GREEN);
  doc.text('À FAIRE', m + 2, y + 5);

  doc.setFillColor('#FFEBEE');
  doc.rect(m + postureHalfW, y, postureHalfW, 7, 'FD');
  doc.setTextColor(RED);
  doc.text('À ÉVITER', m + postureHalfW + 2, y + 5);
  y += 7;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6.5);
  for (let i = 0; i < 6; i++) {
    doc.setFillColor(i % 2 === 0 ? WHITE : GREY_BG);
    doc.rect(m, y, postureHalfW, 8, 'FD');
    doc.rect(m + postureHalfW, y, postureHalfW, 8, 'FD');

    doc.setTextColor(GREEN);
    const doLines = doc.splitTextToSize(doItems[i], postureHalfW - 4);
    doc.text(doLines[0], m + 2, y + 4);
    if (doLines[1]) doc.text(doLines[1], m + 2, y + 7);

    doc.setTextColor(RED);
    const dontLines = doc.splitTextToSize(dontItems[i], postureHalfW - 4);
    doc.text(dontLines[0], m + postureHalfW + 2, y + 4);
    if (dontLines[1]) doc.text(dontLines[1], m + postureHalfW + 2, y + 7);

    y += 8;
  }

  y += 3;
  y = drawSectionBanner(doc, y, 'PHRASES PRÊTES À L\'EMPLOI', BLUE);
  y += 1;

  const phrases = PHRASES[scenario] || PHRASES.feedback_recadrage;

  doc.setFillColor(BLUE_LIGHT);
  doc.rect(m, y, 35, 6, 'FD');
  doc.rect(m + 35, y, cw - 35, 6, 'FD');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(BLUE);
  doc.text('Situation', m + 2, y + 4);
  doc.text('Phrase', m + 37, y + 4);
  y += 6;

  doc.setFontSize(6.5);
  for (let i = 0; i < phrases.length; i++) {
    const ph = phrases[i];
    doc.setFillColor(i % 2 === 0 ? WHITE : GREY_BG);
    const phraseLines = doc.splitTextToSize(ph.phrase, cw - 39);
    const rowH = Math.max(8, phraseLines.length * 3.5 + 3);
    doc.rect(m, y, 35, rowH, 'FD');
    doc.rect(m + 35, y, cw - 35, rowH, 'FD');

    doc.setFont('Helvetica', 'bold');
    doc.setTextColor('#333333');
    doc.text(ph.label, m + 2, y + 4);

    doc.setFont('Helvetica', 'italic');
    doc.setTextColor('#333333');
    let py = y + 4;
    for (const pl of phraseLines) {
      doc.text(pl, m + 37, py);
      py += 3.5;
    }
    y += rowH;
  }

  y += 5;
  doc.setFillColor(GREY_BG);
  doc.setDrawColor(GREY_BORDER);
  doc.roundedRect(m, y, cw, 12, 2, 2, 'FD');
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor('#666666');
  const rappel = 'Rappel : Cet outil accompagne votre développement managérial. Il n\'est ni un support d\'évaluation ni un document RH. Les informations restent confidentielles et à votre usage personnel.';
  const rappelLines = doc.splitTextToSize(rappel, cw - 6);
  let ry = y + 4;
  for (const rl of rappelLines) {
    doc.text(rl, m + 3, ry);
    ry += 3.5;
  }

  drawFooter(doc);
  doc.setPage(1);
  drawFooter(doc);

  doc.save(`SimuManager_Grille_Entretien_${scenarioLabel.replace(/[^a-zA-Z]/g, '_')}.pdf`);
}
