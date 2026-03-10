const OpenAI = require('openai');
const config = require('../config/env');
const chatModel = require('../models/chat.model');

let openai = null;
function getOpenAIClient() {
  if (!openai) {
    if (!config.openai.apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    openai = new OpenAI({ apiKey: config.openai.apiKey });
  }
  return openai;
}

const SYSTEM_PROMPT = `You are a helpful assistant for a premium beauty brand specializing in custom-fit press-on nails.

Your role:
- Help customers find the perfect nail sets
- Explain the custom fit technology
- Provide styling advice
- Answer questions about products, shipping, and returns
- Guide customers to book appointments

Brand voice: Friendly, knowledgeable, premium but approachable.

Available services:
- Custom nail sets (various shapes: almond, coffin, square, stiletto)
- Custom fitting service
- In-person salon appointments

Shipping: 3-5 business days
Returns: 30-day return policy

Keep responses concise and helpful.`;

const FUNCTIONS = [
  {
    name: 'book_appointment',
    description: 'Help customer book a salon appointment',
    parameters: {
      type: 'object',
      properties: {
        service: {
          type: 'string',
          description: 'Type of service requested',
        },
        preferred_date: {
          type: 'string',
          description: 'Preferred appointment date',
        },
      },
    },
  },
];

async function chat(message, sessionId, customerEmail = null) {
  try {
    let session = await chatModel.getSession(sessionId);
    if (!session) {
      session = await chatModel.createSession(sessionId, customerEmail);
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...session.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    const response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      functions: FUNCTIONS,
      function_call: 'auto',
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = response.choices[0].message;

    if (assistantMessage.function_call) {
      const functionName = assistantMessage.function_call.name;

      if (functionName === 'book_appointment') {
        return {
          message: `I'd be happy to help you book an appointment! Please visit our booking page to select your preferred time: ${config.frontend.url}/book`,
          action: 'redirect',
          url: `${config.frontend.url}/book`,
        };
      }
    }

    const reply = assistantMessage.content;

    await chatModel.addMessages(sessionId, [
      { role: 'user', content: message },
      { role: 'assistant', content: reply },
    ]);

    return {
      message: reply,
      sessionId,
    };
  } catch (error) {
    console.error('Chatbot error:', error);
    throw new Error('Failed to process message');
  }
}

module.exports = { chat };
