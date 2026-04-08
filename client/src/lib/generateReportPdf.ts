import { jsPDF } from 'jspdf';
import { getScenarioLabel, getDiscLabel, getTypeCollabShortLabel, getProfilLabel, getEtatEspritLabel, getRelationLabel } from './helpers';

interface ReportData {
  scenario: string;
  typeCollab: string;
  profil: string;
  disc: string;
  relation: number;
  etatEsprit: string;
  mode: string;
  analyse: {
    clarte: number;
    ecoute: number;
    assertivite: number;
    global: number;
    axe1Label?: string;
    axe2Label?: string;
    axe3Label?: string;
    pointsForts: string[];
    axesProgression: string[];
    conseilCle: string;
    impressionGenerale?: string;
    ressentiCollaborateur?: string;
    vigilances?: string;
    prochaineEtape?: string;
  };
  resources: Array<{ label: string; subtitle: string }>;
}

const BLUE = '#000091';
const RED = '#E1000F';
const GREEN = '#18753C';
const GREY = '#666666';
const LIGHT_GREY = '#F0F0F0';

function drawProgressBar(doc: jsPDF, x: number, y: number, width: number, height: number, value: number, max: number) {
  const ratio = Math.min(value / max, 1);
  doc.setFillColor(LIGHT_GREY);
  doc.rect(x, y, width, height, 'F');

  let color = RED;
  if (ratio >= 0.8) color = GREEN;
  else if (ratio >= 0.6) color = BLUE;
  else if (ratio >= 0.4) color = '#FF8C00';

  doc.setFillColor(color);
  doc.rect(x, y, width * ratio, height, 'F');
}

function addWrappedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

export function generateSessionReport(data: ReportData) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(BLUE);
  doc.text('FRANCE TRAVAIL \u2014 SimuManager', margin, y);
  y += 8;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(GREY);
  doc.text(`Rapport de session \u2014 ${today}`, margin, y);
  y += 4;

  doc.setDrawColor(BLUE);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(BLUE);
  doc.text('1. Contexte de la simulation', margin, y);
  y += 8;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor('#333333');

  const modeLabel = data.mode === 'avance' ? 'Avanc\u00e9' : 'Rapide';
  const contextItems = [
    [`Sc\u00e9nario`, getScenarioLabel(data.scenario as any) || data.scenario],
    [`Type de collaborateur`, getTypeCollabShortLabel(data.typeCollab as any) || data.typeCollab],
    [`Profil DISC`, getDiscLabel(data.disc as any) || data.disc],
    [`Qualit\u00e9 de relation`, `${data.relation}/5 (${getRelationLabel(data.relation as any)})`],
    [`\u00c9tat d'esprit`, getEtatEspritLabel(data.etatEsprit as any) || data.etatEsprit],
    [`Niveau du manager`, getProfilLabel(data.profil as any) || data.profil],
    [`Mode utilis\u00e9`, modeLabel],
  ];

  for (const [label, value] of contextItems) {
    doc.setFont('Helvetica', 'bold');
    doc.text(`${label} : `, margin + 2, y);
    const labelWidth = doc.getTextWidth(`${label} : `);
    doc.setFont('Helvetica', 'normal');
    doc.text(value, margin + 2 + labelWidth, y);
    y += 5.5;
  }

  y += 6;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(BLUE);
  doc.text('2. Scores', margin, y);
  y += 8;

  const axes = [
    { label: data.analyse.axe1Label || 'Clart\u00e9 du discours', score: data.analyse.clarte },
    { label: data.analyse.axe2Label || "Qualit\u00e9 d'\u00e9coute", score: data.analyse.ecoute },
    { label: data.analyse.axe3Label || 'Assertivit\u00e9', score: data.analyse.assertivite },
  ];

  doc.setFontSize(10);
  for (const axe of axes) {
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor('#333333');
    doc.text(`${axe.label}`, margin + 2, y);
    doc.text(`${axe.score}/5`, margin + contentWidth - 10, y);
    drawProgressBar(doc, margin + 60, y - 3, contentWidth - 80, 4, axe.score, 5);
    y += 7;
  }

  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(BLUE);
  doc.text(`Score global`, margin + 2, y);
  doc.text(`${data.analyse.global}/5`, margin + contentWidth - 10, y);
  drawProgressBar(doc, margin + 60, y - 3, contentWidth - 80, 4, data.analyse.global, 5);
  y += 12;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(BLUE);
  doc.text('3. Feedback d\u00e9taill\u00e9', margin, y);
  y += 8;

  doc.setFontSize(10);

  if (data.analyse.impressionGenerale) {
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor('#333333');
    doc.text('Impression g\u00e9n\u00e9rale :', margin + 2, y);
    y += 5;
    doc.setFont('Helvetica', 'normal');
    y = addWrappedText(doc, data.analyse.impressionGenerale, margin + 4, y, contentWidth - 6, 4.5);
    y += 3;
  }

  if (data.analyse.ressentiCollaborateur) {
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor('#333333');
    doc.text('Ressenti du collaborateur :', margin + 2, y);
    y += 5;
    doc.setFont('Helvetica', 'normal');
    y = addWrappedText(doc, data.analyse.ressentiCollaborateur, margin + 4, y, contentWidth - 6, 4.5);
    y += 3;
  }

  if (data.analyse.pointsForts.length > 0) {
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(GREEN);
    doc.text('Points forts :', margin + 2, y);
    y += 5;
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor('#333333');
    for (const point of data.analyse.pointsForts.slice(0, 3)) {
      doc.setFillColor(GREEN);
      doc.circle(margin + 5, y - 1.2, 1.2, 'F');
      y = addWrappedText(doc, point, margin + 9, y, contentWidth - 12, 4.5);
      y += 2;
    }
    y += 2;
  }

  if (data.analyse.axesProgression.length > 0) {
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(BLUE);
    doc.text('Axes de progression :', margin + 2, y);
    y += 5;
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor('#333333');
    for (const axe of data.analyse.axesProgression.slice(0, 2)) {
      doc.setFillColor(BLUE);
      doc.circle(margin + 5, y - 1.2, 1.2, 'F');
      y = addWrappedText(doc, axe, margin + 9, y, contentWidth - 12, 4.5);
      y += 2;
    }
    y += 2;
  }

  if (data.analyse.vigilances && data.analyse.vigilances !== 'Aucune vigilance particuli\u00e8re') {
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(RED);
    doc.text('Vigilances :', margin + 2, y);
    y += 5;
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor('#333333');
    y = addWrappedText(doc, data.analyse.vigilances, margin + 4, y, contentWidth - 6, 4.5);
    y += 4;
  }

  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(BLUE);
  doc.text('4. Conseil cl\u00e9', margin, y);
  y += 6;

  doc.setFillColor('#EEF2FF');
  doc.setDrawColor(BLUE);
  doc.setLineWidth(0.3);
  const conseilLines = doc.splitTextToSize(data.analyse.conseilCle, contentWidth - 12);
  const conseilHeight = conseilLines.length * 5 + 6;
  doc.roundedRect(margin, y, contentWidth, conseilHeight, 3, 3, 'FD');
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(BLUE);
  y += 5;
  for (const line of conseilLines) {
    doc.text(line, margin + 6, y);
    y += 5;
  }
  y += 6;

  if (data.resources.length > 0) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(BLUE);
    doc.text('5. Ressources recommand\u00e9es', margin, y);
    y += 8;

    doc.setFontSize(10);
    for (const res of data.resources) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor('#333333');
      doc.text(`\u2022 ${res.label}`, margin + 4, y);
      y += 4.5;
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(GREY);
      y = addWrappedText(doc, res.subtitle, margin + 8, y, contentWidth - 12, 4.5);
      y += 3;
    }

    if (data.analyse.prochaineEtape) {
      y += 2;
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(BLUE);
      doc.text('Prochaine \u00e9tape sugg\u00e9r\u00e9e :', margin + 2, y);
      y += 5;
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor('#333333');
      y = addWrappedText(doc, data.analyse.prochaineEtape, margin + 4, y, contentWidth - 6, 4.5);
    }
  }

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(GREY);
    doc.text('Document g\u00e9n\u00e9r\u00e9 par SimuManager \u2014 ChatFT \u00d7 France Travail', margin, 285);
    doc.text('Outil de d\u00e9veloppement des comp\u00e9tences \u2014 Non \u00e9valuatif \u2014 Confidentiel', margin, 289);
    doc.text(`G\u00e9n\u00e9r\u00e9 le ${today}`, pageWidth - margin - 30, 289);
    doc.text(`${i}/${totalPages}`, pageWidth - margin - 5, 285);
  }

  doc.save('SimuManager_Rapport_Session.pdf');
}
