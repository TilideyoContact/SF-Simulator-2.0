import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  generateFirstMessageAI,
  generateResponseAI,
  generateAnalysisAI,
  transcribeAudio,
  synthesizeSpeech,
} from "./openai";

const upload = multer({
  dest: "/tmp/audio-uploads",
  limits: { fileSize: 25 * 1024 * 1024 },
});

const simulationStartSchema = z.object({
  mode: z.string().optional(),
  scenario: z.string().optional(),
  typeCollab: z.string().optional(),
  disc: z.string().optional(),
  relation: z.union([z.string(), z.number()]).optional(),
  etatEsprit: z.string().optional(),
  niveauDifficulte: z.string().optional(),
  prenomFictif: z.string().optional(),
  profil: z.string().optional().nullable(),
  experience: z.string().optional().nullable(),
  barometre: z.any().optional().nullable(),
  objectifs: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  complement: z.string().optional().nullable(),
});

const simulationRespondSchema = z.object({
  sessionId: z.string().optional().nullable(),
  message: z.string(),
  tourActuel: z.number().optional(),
  tourMax: z.number().optional(),
  scenario: z.string().optional(),
  disc: z.string().optional(),
  relation: z.union([z.string(), z.number()]).optional(),
  etatEsprit: z.string().optional(),
  typeCollab: z.string().optional(),
  prenomFictif: z.string().optional(),
  messages: z.array(z.object({ role: z.string(), content: z.string() })).optional(),
  profil: z.string().optional().nullable(),
  objectifs: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  complement: z.string().optional().nullable(),
  mode: z.string().optional().nullable(),
});

const analyzeSchema = z.object({
  sessionId: z.string().optional().nullable(),
  messages: z.array(z.object({ role: z.string(), content: z.string() })).optional(),
  scenario: z.string().optional().nullable(),
  typeCollab: z.string().optional().nullable(),
  profil: z.string().optional().nullable(),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  if (!process.env.ELEVENLABS_API_KEY) {
    console.warn('WARNING: ELEVENLABS_API_KEY is not set. Voice features (TTS, STT) will use fallback responses.');
  }

  app.post('/api/simulation/start', async (req, res) => {
    try {
      const parsed = simulationStartSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request body', details: parsed.error.issues });
      }
      const { scenario, typeCollab, disc, relation, etatEsprit, niveauDifficulte, prenomFictif, profil, experience, barometre, objectifs, complement } = parsed.data;

      const session = await storage.createSession({
        mode: req.body.mode || 'avance',
        profil,
        experience,
        barometre,
        scenarioChoisi: scenario,
        typeCollab,
        personaDisc: disc,
        personaRelation: relation,
        personaEtatEsprit: etatEsprit,
        niveauDifficulte,
        messages: [],
      });

      const relationStr = relation != null ? String(relation) : 'neutre';

      const objectifsStr = Array.isArray(objectifs) ? objectifs.join(', ') : objectifs || null;

      let message: string;
      try {
        message = await generateFirstMessageAI(
          scenario || 'feedback_recadrage',
          disc || 'stable',
          relationStr,
          etatEsprit || 'neutre',
          typeCollab || 'agent',
          prenomFictif || 'Thomas',
          profil,
          objectifsStr,
          complement,
          req.body.mode || 'avance'
        );
      } catch (err) {
        console.error('OpenAI first message error, using fallback:', err);
        message = generateFallbackFirstMessage(
          disc || 'stable',
          etatEsprit || 'neutre',
          prenomFictif || 'Thomas'
        );
      }

      res.json({ sessionId: session.id, message });
    } catch (error) {
      console.error('Error starting simulation:', error);
      res.status(500).json({ error: 'Failed to start simulation' });
    }
  });

  app.post('/api/simulation/respond', async (req, res) => {
    try {
      const parsed = simulationRespondSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request body', details: parsed.error.issues });
      }
      const { sessionId, message, tourActuel, tourMax, scenario, disc, relation, etatEsprit, typeCollab, prenomFictif, messages, profil, objectifs, complement, mode } = parsed.data;

      const relationStr = relation != null ? String(relation) : 'neutre';
      const objectifsStr = Array.isArray(objectifs) ? objectifs.join(', ') : objectifs || null;

      let response: { message: string; isFinished: boolean };
      try {
        response = await generateResponseAI(
          scenario || 'feedback_recadrage',
          disc || 'stable',
          relationStr,
          etatEsprit || 'neutre',
          typeCollab || 'agent',
          prenomFictif || 'Thomas',
          tourActuel || 0,
          tourMax || 7,
          messages || [],
          profil,
          objectifsStr,
          complement,
          mode
        );
      } catch (err) {
        console.error('OpenAI respond error, using fallback:', err);
        response = {
          message: "Je comprends ce que vous dites. Pouvez-vous developper votre pensee ?",
          isFinished: (tourActuel || 0) >= (tourMax || 7) - 1,
        };
      }

      if (sessionId) {
        try {
          await storage.updateSession(sessionId, { messages: messages || [] });
        } catch {}
      }

      res.json(response);
    } catch (error) {
      console.error('Error responding:', error);
      res.status(500).json({ error: 'Failed to respond' });
    }
  });

  app.post('/api/simulation/analyze', async (req, res) => {
    try {
      const parsed = analyzeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request body', details: parsed.error.issues });
      }
      const { sessionId, messages, scenario, typeCollab, profil } = parsed.data;

      let analysis;
      try {
        analysis = await generateAnalysisAI(messages || [], scenario, typeCollab, profil);
      } catch (err) {
        console.error('OpenAI analysis error, using fallback:', err);
        analysis = generateFallbackAnalysis(messages || []);
      }

      if (sessionId) {
        try {
          await storage.updateSession(sessionId, {
            clarte: analysis.clarte,
            ecoute: analysis.ecoute,
            assertivite: analysis.assertivite,
            global: analysis.global,
            pointsForts: analysis.pointsForts,
            axesProgression: analysis.axesProgression,
            conseilCle: analysis.conseilCle,
          });
        } catch {}
      }

      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing:', error);
      res.status(500).json({ error: 'Failed to analyze' });
    }
  });

  app.post('/api/speech/transcribe', upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No audio file provided' });
      }

      const filePath = req.file.path;
      const ext = req.file.originalname?.split('.').pop() || 'webm';
      const newPath = `${filePath}.${ext}`;
      fs.renameSync(filePath, newPath);

      try {
        const text = await transcribeAudio(newPath);
        res.json({ text });
      } finally {
        try { fs.unlinkSync(newPath); } catch {}
      }
    } catch (error) {
      console.error('Error transcribing:', error);
      res.status(500).json({ error: 'Failed to transcribe audio' });
    }
  });

  app.post('/api/speech/synthesize', async (req, res) => {
    try {
      const { text, disc } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'No text provided' });
      }
      if (text.length > 2000) {
        return res.status(400).json({ error: 'Text too long' });
      }

      const audioBuffer = await synthesizeSpeech(text, disc);
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      });
      res.send(audioBuffer);
    } catch (error) {
      console.error('Error synthesizing:', error);
      res.status(500).json({ error: 'Failed to synthesize speech' });
    }
  });

  app.post('/api/session/save', async (req, res) => {
    try {
      const { sessionId, ...data } = req.body;

      if (sessionId) {
        const session = await storage.updateSession(sessionId, data);
        return res.json(session);
      }

      const session = await storage.createSession(data);
      res.json(session);
    } catch (error) {
      console.error('Error saving session:', error);
      res.status(500).json({ error: 'Failed to save session' });
    }
  });

  return httpServer;
}

function generateFallbackFirstMessage(disc: string, etatEsprit: string, prenomFictif: string): string {
  const stageDirections: Record<string, string> = {
    dominant: `*[${prenomFictif} entre d'un pas decide et pose ses documents sur la table.]*`,
    influent: `*[${prenomFictif} entre avec un sourire et s'installe confortablement.]*`,
    stable: `*[${prenomFictif} entre dans le bureau et s'assoit calmement.]*`,
    consciencieux: `*[${prenomFictif} entre avec un dossier sous le bras et s'installe en sortant un stylo.]*`,
  };
  const greetings: Record<string, string> = {
    dominant: `Bonjour. Vous vouliez me voir ? Allons droit au but.`,
    influent: `Bonjour ! Comment ca va ? Vous aviez quelque chose a me dire ?`,
    stable: `Bonjour. Vous m'avez demande de passer. Je vous ecoute.`,
    consciencieux: `Bonjour. J'ai prepare quelques notes. Quel est l'ordre du jour ?`,
  };
  const stage = stageDirections[disc] || stageDirections.stable;
  const greeting = greetings[disc] || greetings.stable;
  return `${stage}\n\n${greeting}`;
}

function generateFallbackAnalysis(messages: Array<{ role: string; content: string }>) {
  const managerMessages = messages.filter(m => m.role === 'manager');
  const totalLength = managerMessages.reduce((acc, m) => acc + m.content.length, 0);
  const avgLength = managerMessages.length > 0 ? totalLength / managerMessages.length : 0;

  let clarte = 3;
  let ecoute = 3;
  let assertivite = 3;

  if (avgLength > 100) clarte += 0.5;
  if (avgLength > 200) clarte += 0.5;
  if (managerMessages.some(m => m.content.includes('?'))) ecoute += 0.5;
  if (managerMessages.filter(m => m.content.includes('?')).length > 2) ecoute += 0.5;
  if (managerMessages.some(m => m.content.toLowerCase().includes('je'))) assertivite += 0.5;
  if (managerMessages.some(m => m.content.toLowerCase().includes('comprends') || m.content.toLowerCase().includes('entends'))) ecoute += 0.5;
  if (managerMessages.some(m => m.content.toLowerCase().includes('propose') || m.content.toLowerCase().includes('suggere'))) assertivite += 0.5;

  clarte = Math.min(5, Math.max(1, Math.round(clarte * 2) / 2));
  ecoute = Math.min(5, Math.max(1, Math.round(ecoute * 2) / 2));
  assertivite = Math.min(5, Math.max(1, Math.round(assertivite * 2) / 2));
  const global = Math.round(((clarte + ecoute + assertivite) / 3) * 10) / 10;

  return {
    clarte,
    ecoute,
    assertivite,
    global,
    pointsForts: ["Vous avez mene l'entretien jusqu'au bout."],
    axesProgression: ["Structurez davantage votre discours avec la methode DESC."],
    conseilCle: "Continuez a pratiquer pour progresser.",
  };
}
