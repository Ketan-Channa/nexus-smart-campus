import { Router } from 'express';
import {
  chatWithAi,
  getAiConversationHistory,
  getConversationMessages,
  deleteAiConversation,
  draftAiCommunication,
  getAiSystemStatus,
} from '../controllers/aiController';

const router = Router();

// 1. Universal Role-Aware Chatbot Endpoint
router.post('/chat', chatWithAi);

// 2. Private Conversation History & Retention
router.get('/history', getAiConversationHistory);
router.get('/history/:conversationId', getConversationMessages);
router.delete('/history/:conversationId', deleteAiConversation);

// 3. Human-in-the-Loop Communication Drafter
router.post('/draft-communication', draftAiCommunication);

// 4. Admin AI Health, Model & Quota Monitoring
router.get('/system/status', getAiSystemStatus);

export default router;
